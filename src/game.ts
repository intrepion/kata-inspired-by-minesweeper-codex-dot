export const PRESETS = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
} as const;
export type Difficulty = keyof typeof PRESETS;
export type Status = "ready" | "active" | "won" | "lost";
export interface Cell {
  mine: boolean;
  count: number;
  revealed: boolean;
  flagged: boolean;
}
export interface Game {
  difficulty: Difficulty;
  cells: Cell[];
  status: Status;
  elapsedMs: number;
  startedAt: number | null;
  exploded: number | null;
}
export type BestTimes = Partial<Record<Difficulty, number>>;
export function createGame(difficulty: Difficulty): Game {
  const { rows, cols } = PRESETS[difficulty];
  return {
    difficulty,
    cells: Array.from({ length: rows * cols }, () => ({
      mine: false,
      count: 0,
      revealed: false,
      flagged: false,
    })),
    status: "ready",
    elapsedMs: 0,
    startedAt: null,
    exploded: null,
  };
}
export function seeded(seed: number): () => number {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function neighbors(g: Game, index: number): number[] {
  const { rows, cols } = PRESETS[g.difficulty],
    row = Math.floor(index / cols),
    col = index % cols,
    result: number[] = [];
  for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++)
    for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++)
      if (r !== row || c !== col) result.push(r * cols + c);
  return result;
}
export function elapsed(g: Game, now: number): number {
  return (
    g.elapsedMs + (g.startedAt === null ? 0 : Math.max(0, now - g.startedAt))
  );
}
function finish(g: Game, status: "won" | "lost", now: number) {
  g.elapsedMs = elapsed(g, now);
  g.startedAt = null;
  g.status = status;
}
function placeMines(g: Game, first: number, random: () => number) {
  const excluded = new Set([first, ...neighbors(g, first)]),
    candidates = g.cells.map((_, i) => i).filter((i) => !excluded.has(i));
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
  }
  for (const i of candidates.slice(0, PRESETS[g.difficulty].mines))
    g.cells[i]!.mine = true;
  g.cells.forEach((c, i) => {
    c.count = neighbors(g, i).filter((n) => g.cells[n]!.mine).length;
  });
}
export function flag(g: Game, index: number): void {
  const c = g.cells[index];
  if ((g.status === "ready" || g.status === "active") && c && !c.revealed)
    c.flagged = !c.flagged;
}
export function reveal(
  g: Game,
  index: number,
  now: number,
  random: () => number = Math.random,
): void {
  const c = g.cells[index];
  if (!c || c.flagged || g.status === "won" || g.status === "lost") return;
  if (g.status === "ready") {
    placeMines(g, index, random);
    g.status = "active";
    g.startedAt = now;
  }
  let pending: number[];
  if (c.revealed) {
    const near = neighbors(g, index);
    if (
      c.count === 0 ||
      near.filter((i) => g.cells[i]!.flagged).length !== c.count
    )
      return;
    pending = near.filter((i) => !g.cells[i]!.flagged && !g.cells[i]!.revealed);
  } else pending = [index];
  while (pending.length) {
    const i = pending.pop()!,
      cell = g.cells[i]!;
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.mine) {
      g.exploded = i;
      finish(g, "lost", now);
      return;
    }
    if (cell.count === 0) pending.push(...neighbors(g, i));
  }
  if (g.cells.every((cell) => cell.mine || cell.revealed))
    finish(g, "won", now);
}
export function recordBest(best: BestTimes, g: Game): BestTimes {
  if (
    g.status !== "won" ||
    (best[g.difficulty] !== undefined && best[g.difficulty]! <= g.elapsedMs)
  )
    return best;
  return { ...best, [g.difficulty]: g.elapsedMs };
}
export function encode(g: Game, now: number): string {
  return JSON.stringify({
    version: 1,
    game: { ...g, elapsedMs: elapsed(g, now), startedAt: null },
  });
}
export function decode(raw: string | null, now: number): Game | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw),
      g = data.game as Game;
    if (
      data.version !== 1 ||
      !g ||
      typeof g.difficulty !== "string" ||
      !Object.hasOwn(PRESETS, g.difficulty) ||
      !["ready", "active", "won", "lost"].includes(g.status) ||
      !Array.isArray(g.cells) ||
      !Number.isFinite(g.elapsedMs) ||
      g.elapsedMs < 0 ||
      g.elapsedMs > 31536000000 ||
      g.startedAt !== null
    )
      return null;
    const preset = PRESETS[g.difficulty];
    if (
      g.cells.length !== preset.rows * preset.cols ||
      g.cells.some(
        (c) =>
          !c ||
          typeof c.mine !== "boolean" ||
          typeof c.revealed !== "boolean" ||
          typeof c.flagged !== "boolean" ||
          !Number.isInteger(c.count) ||
          c.count < 0 ||
          c.count > 8 ||
          (c.revealed && c.flagged),
      )
    )
      return null;
    const mines = g.cells.filter((c) => c.mine).length;
    const allSafe = g.cells.every((c) => c.mine || c.revealed),
      exposedMine = g.cells.some((c) => c.mine && c.revealed);
    if (g.status === "ready") {
      if (
        mines !== 0 ||
        g.cells.some((c) => c.revealed || c.count !== 0) ||
        g.elapsedMs !== 0 ||
        g.exploded !== null
      )
        return null;
    } else {
      if (
        mines !== preset.mines ||
        g.cells.some(
          (c, i) =>
            c.count !== neighbors(g, i).filter((n) => g.cells[n]!.mine).length,
        ) ||
        !g.cells.some((c) => c.revealed && !c.mine && c.count === 0)
      )
        return null;
      if (g.status === "won" && (!allSafe || exposedMine)) return null;
      if (g.status === "active" && (allSafe || exposedMine)) return null;
      if (g.status === "lost") {
        if (
          g.cells.filter((c) => c.mine && c.revealed).length !== 1 ||
          !Number.isInteger(g.exploded) ||
          !g.cells[g.exploded!]?.mine ||
          !g.cells[g.exploded!]?.revealed
        )
          return null;
      } else if (g.exploded !== null) return null;
    }
    g.startedAt = g.status === "active" ? now : null;
    return g;
  } catch {
    return null;
  }
}
export function decodeBest(raw: string | null): BestTimes {
  try {
    const value = JSON.parse(raw ?? "{}"),
      out: BestTimes = {};
    for (const key of Object.keys(PRESETS) as Difficulty[])
      if (
        typeof value?.[key] === "number" &&
        Number.isFinite(value[key]) &&
        value[key] >= 0 &&
        value[key] <= 31536000000
      )
        out[key] = value[key];
    return out;
  } catch {
    return {};
  }
}
