import { describe, it, expect } from "vitest";
import {
  createGame,
  reveal,
  flag,
  neighbors,
  elapsed,
  encode,
  decode,
  recordBest,
  decodeBest,
  seeded,
} from "./game";
describe("field rules", () => {
  it("begins ready and places exactly ten mines outside a safe opening", () => {
    const g = createGame("beginner");
    expect(g.status).toBe("ready");
    reveal(g, 40, 1000, seeded(42));
    expect(g.cells.filter((c) => c.mine)).toHaveLength(10);
    expect([40, ...neighbors(g, 40)].every((i) => !g.cells[i]!.mine)).toBe(
      true,
    );
    expect(g.status).toBe("active");
  });
});

describe("save boundary", () => {
  it("rejects a lost save with a second revealed mine", () => {
    const g = createGame("beginner");
    reveal(g, 40, 0, seeded(42));
    const mines = g.cells.flatMap((c, i) => (c.mine ? [i] : []));
    reveal(g, mines[0]!, 2000);
    g.cells[mines[1]!]!.revealed = true;
    expect(decode(encode(g, 2000), 5000)).toBeNull();
  });
});

function opened(seed = 42) {
  const g = createGame("beginner");
  reveal(g, 40, 1000, seeded(seed));
  return g;
}
describe("classic field behavior", () => {
  it("has bounded corner and edge neighborhoods", () => {
    const g = createGame("beginner");
    expect(neighbors(g, 0)).toEqual([1, 9, 10]);
    expect(neighbors(g, 80)).toEqual([70, 71, 79]);
    expect(neighbors(g, 8)).toEqual([7, 16, 17]);
  });
  it("matches independently worked seeded mine positions and adjacent counts", () => {
    const g = opened();
    expect(g.cells.flatMap((c, i) => (c.mine ? [i] : []))).toEqual([
      10, 11, 17, 45, 55, 67, 69, 75, 78, 80,
    ]);
    expect([0, 1, 9, 40, 59].map((i) => g.cells[i]!.count)).toEqual([
      1, 2, 1, 0, 2,
    ]);
  });
  it.each(["beginner", "intermediate", "expert"] as const)(
    "places the preset mine count for %s",
    (d) => {
      const g = createGame(d);
      reveal(g, 0, 0, seeded(17));
      expect(g.cells.filter((c) => c.mine)).toHaveLength(
        { beginner: 10, intermediate: 40, expert: 99 }[d],
      );
    },
  );
  it("protects every first cell including corners across seeds", () => {
    for (const index of [0, 8, 40, 72, 80])
      for (let seed = 0; seed < 30; seed++) {
        const g = createGame("beginner");
        reveal(g, index, 0, seeded(seed));
        expect(g.cells[index]!.count).toBe(0);
        expect(g.cells[index]!.mine).toBe(false);
      }
  });
  it("flags before first reveal do not start time or allow a reveal", () => {
    const g = createGame("beginner");
    flag(g, 40);
    reveal(g, 40, 500);
    expect(g.status).toBe("ready");
    expect(elapsed(g, 10000)).toBe(0);
  });
  it("flood fills empty ground and numbered boundary while preserving flags", () => {
    const g = createGame("beginner");
    flag(g, 39);
    reveal(g, 40, 0, seeded(42));
    expect(g.cells[39]).toMatchObject({
      revealed: false,
      flagged: true,
      mine: false,
    });
    expect(g.cells[4]).toMatchObject({ revealed: true, count: 0 });
    expect(g.cells[3]).toMatchObject({ revealed: true, count: 1 });
    expect(g.cells[10]!.revealed).toBe(false);
  });
  it("unflagging a safe square lets it be cleared", () => {
    const g = createGame("beginner");
    flag(g, 39);
    reveal(g, 40, 0, seeded(42));
    flag(g, 39);
    reveal(g, 39, 1);
    expect(g.cells[39]!.revealed).toBe(true);
  });
  it("chords a numbered square only when flags match", () => {
    const g = opened();
    reveal(g, 9, 2000);
    reveal(g, 9, 3000);
    expect(g.cells[0]!.revealed).toBe(false);
    flag(g, 10);
    reveal(g, 9, 4000);
    expect(g.cells[0]!.revealed).toBe(true);
    expect(g.cells[10]!.flagged).toBe(true);
    expect(g.status).toBe("active");
  });
  it("incorrect matching flags can detonate a chord", () => {
    const g = opened();
    reveal(g, 9, 2000);
    flag(g, 0);
    reveal(g, 9, 3000);
    expect(g.status).toBe("lost");
    expect(g.exploded).toBe(10);
    expect(g.cells[0]!.flagged).toBe(true);
  });
  it("wins by revealing safe squares without requiring flags", () => {
    const g = opened();
    g.cells.forEach((c, i) => {
      if (!c.mine) reveal(g, i, 5000);
    });
    expect(g.status).toBe("won");
    expect(g.cells.filter((c) => c.revealed)).toHaveLength(71);
  });
  it.each(["won", "lost"] as const)(
    "ignores repeated input after %s",
    (status) => {
      const g = opened();
      if (status === "lost") reveal(g, 10, 2000);
      else
        g.cells.forEach((c, i) => {
          if (!c.mine) reveal(g, i, 2000);
        });
      const snapshot = encode(g, 3000);
      flag(g, 0);
      reveal(g, 1, 10000);
      expect(encode(g, 10000)).toBe(snapshot);
    },
  );
  it("starts on reveal, measures elapsed milliseconds, freezes on loss", () => {
    const g = createGame("beginner");
    expect(elapsed(g, 999)).toBe(0);
    reveal(g, 40, 1000, seeded(42));
    expect(elapsed(g, 2500)).toBe(1500);
    reveal(g, 10, 3456);
    expect(elapsed(g, 99999)).toBe(2456);
  });
  it("a new game resets board and timing for each difficulty", () => {
    const previous = opened();
    flag(previous, 0);
    for (const d of ["beginner", "intermediate", "expert"] as const) {
      const g = createGame(d);
      expect(g.status).toBe("ready");
      expect(g.cells.every((c) => !c.mine && !c.revealed && !c.flagged)).toBe(
        true,
      );
      expect(elapsed(g, 9000)).toBe(0);
    }
  });
});
describe("persistence and personal bests", () => {
  it("resumes active elapsed time without closed-tab time", () => {
    const g = opened();
    flag(g, 0);
    const restored = decode(encode(g, 3500), 10000)!;
    expect(restored.cells).toEqual(g.cells);
    expect(elapsed(restored, 11000)).toBe(3500);
    expect(restored.status).toBe("active");
  });
  it.each([null, "", "garbage", "{}", '{"version":2}', "null"])(
    "recovers malformed save %s",
    (raw) => expect(decode(raw, 0)).toBeNull(),
  );
  it("rejects wrong lengths, counts, mines and lifecycle state", () => {
    const raw = JSON.parse(encode(opened(), 2000));
    for (const mutate of [
      (g: any) => g.cells.pop(),
      (g: any) => (g.cells[0].count = 8),
      (g: any) => (g.cells[10].mine = false),
      (g: any) => (g.status = "won"),
      (g: any) => (g.elapsedMs = -1),
      (g: any) => (g.exploded = 10),
    ]) {
      const data = structuredClone(raw);
      mutate(data.game);
      expect(decode(JSON.stringify(data), 0)).toBeNull();
    }
  });
  it("round trips ready, won and lost fields", () => {
    const ready = createGame("expert"),
      won = opened(),
      lost = opened();
    won.cells.forEach((c, i) => {
      if (!c.mine) reveal(won, i, 3000);
    });
    reveal(lost, 10, 2000);
    for (const g of [ready, won, lost])
      expect(decode(encode(g, 9000), 10000)).toEqual(g);
  });
  it("updates only a faster completed clear for that difficulty", () => {
    const g = opened();
    expect(recordBest({}, g)).toEqual({});
    g.cells.forEach((c, i) => {
      if (!c.mine) reveal(g, i, 5000);
    });
    expect(recordBest({ expert: 9000 }, g)).toEqual({
      expert: 9000,
      beginner: 4000,
    });
    expect(recordBest({ beginner: 3000 }, g)).toEqual({ beginner: 3000 });
    expect(recordBest({ beginner: 4000 }, g)).toEqual({ beginner: 4000 });
  });
});

describe("more save validation", () => {
  it("rejects an active field with a revealed mine", () => {
    const g = opened();
    g.cells[10]!.revealed = true;
    expect(decode(encode(g, 2000), 0)).toBeNull();
  });
  it("rejects revealed flags and non-boolean cell properties", () => {
    const raw = JSON.parse(encode(opened(), 2000));
    raw.game.cells[40].flagged = true;
    expect(decode(JSON.stringify(raw), 0)).toBeNull();
    raw.game.cells[40].flagged = false;
    raw.game.cells[0].revealed = "false";
    expect(decode(JSON.stringify(raw), 0)).toBeNull();
  });
});

it("rejects coerced non-string difficulties from storage", () => {
  const data = JSON.parse(encode(createGame("beginner"), 0));
  data.game.difficulty = ["beginner"];
  expect(decode(JSON.stringify(data), 0)).toBeNull();
});

it("rejects a placed field with no revealed safe opening", () => {
  const g = opened();
  g.cells.forEach((c) => (c.revealed = false));
  g.cells[0]!.revealed = true;
  expect(decode(encode(g, 2000), 0)).toBeNull();
});

it("recovers corrupt best times without adopting invalid records", () => {
  expect(decodeBest("{bad")).toEqual({});
  expect(
    decodeBest('{"beginner":-1,"intermediate":"fast","expert":12345}'),
  ).toEqual({ expert: 12345 });
  expect(decodeBest("null")).toEqual({});
});
it("rejects inherited preset names", () => {
  const data = JSON.parse(encode(createGame("beginner"), 0));
  data.game.difficulty = "__proto__";
  expect(decode(JSON.stringify(data), 0)).toBeNull();
});
