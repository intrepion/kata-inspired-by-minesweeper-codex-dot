import "./style.css";
import {
  PRESETS,
  createGame,
  reveal,
  flag,
  elapsed,
  encode,
  decode,
  decodeBest,
  recordBest,
  type Difficulty,
} from "./game";
const SAVE = "fieldwork.game.v1",
  BEST = "fieldwork.best.v1";
let storageAvailable = true;
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    storageAvailable = false;
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    storageAvailable = false;
  }
}
const saved = read(SAVE);
const restored = decode(saved, Date.now());
let game = restored ?? createGame("beginner"),
  best = decodeBest(read(BEST)),
  flagMode = false,
  focused = 0;
let feedback = saved
  ? restored
    ? "Your field is restored. Pick up where you left off."
    : "The saved field could not be restored. A fresh field is ready."
  : "Your first reveal opens safe ground.";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<main>
<header class="masthead"><a class="brand" href="./" aria-label="Fieldwork home"><span class="brand-mark" aria-hidden="true">✳</span> FIELDWORK</a><span class="edition">NO. 01 / THE QUIET PURSUIT</span></header>
<section class="intro"><div><p class="eyebrow">A GAME OF CAREFUL DISCOVERY</p><h1>Find your footing.</h1><p class="lede">Read the ground. Mark the risks. Clear a little space.</p></div><div class="intro-note"><span class="mini-field" aria-hidden="true">▦</span><p>A familiar puzzle.<br>A fresh patch of ground.</p></div></section>
<section class="game-card" aria-label="Minesweeper game">
<div class="toolbar"><div class="difficulty" role="group" aria-label="Difficulty">${(Object.keys(PRESETS) as Difficulty[]).map((d) => `<button data-difficulty="${d}" class="preset">${d[0]!.toUpperCase() + d.slice(1)}</button>`).join("")}</div><button id="restart" class="restart"><span aria-hidden="true">↻</span> New field</button></div>
<div class="dashboard"><div class="metric"><span class="metric-label">MINES − FLAGS</span><strong id="mine-count">10</strong></div><div class="field-state"><span id="state-icon" aria-hidden="true">✳</span><span id="state-label">Uncharted ground</span></div><div class="metric metric-time"><span class="metric-label">FIELD TIME</span><strong id="timer">00:00</strong></div></div>
<div class="board-wrap"><div id="board" role="grid" aria-label="Mine field" aria-describedby="board-help"></div></div>
<div class="below-board"><p id="status" role="status" aria-live="polite"></p><button id="flag-mode" aria-pressed="false"><span aria-hidden="true">⚑</span> Flag mode <span id="mode-value">off</span></button></div>
<div class="progress-track" aria-hidden="true"><div id="progress"></div></div>
<div class="field-footer"><span id="field-info"></span><span id="best"></span></div>
</section>
<section class="guide" id="board-help" aria-label="How to play"><div><span class="guide-number">01</span><h2>Explore</h2><p>Click a square to reveal it. Numbers tell you how many mines touch that square.</p></div><div><span class="guide-number">02</span><h2>Mark</h2><p>Right-click or press <kbd>F</kbd> to flag a risk. On touch screens, turn on flag mode.</p></div><div><span class="guide-number">03</span><h2>Connect</h2><p>Click a revealed number to open its neighbors when enough flags surround it. Wrong flags can cost the field.</p></div></section>
<footer class="page-footer"><p><span aria-hidden="true">↗</span> Arrow keys move · Enter / Space reveal · F flags · Home / End jump across a row</p><p>Safe first opening. Later moves may require a guess. Swipe or scroll across wide fields.</p><p id="storage-note">Saved on this device. Closed-tab time is excluded.</p></footer>
</main>`;
function element<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}
const board = element("board");
const format = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
};
function persist() {
  write(SAVE, encode(game, Date.now()));
  element("storage-note").textContent = storageAvailable
    ? "Saved on this device. Closed-tab time is excluded."
    : "Device storage is unavailable. You can still play; this field will not be saved.";
}
function buildBoard() {
  const { rows, cols } = PRESETS[game.difficulty];
  board.style.setProperty("--cols", String(cols));
  board.setAttribute("aria-rowcount", String(rows));
  board.setAttribute("aria-colcount", String(cols));
  board.replaceChildren();
  for (let r = 0; r < rows; r++) {
    const row = document.createElement("div");
    row.className = "board-row";
    row.setAttribute("role", "row");
    for (let c = 0; c < cols; c++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.dataset.index = String(r * cols + c);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-rowindex", String(r + 1));
      button.setAttribute("aria-colindex", String(c + 1));
      row.append(button);
    }
    board.append(row);
  }
}
function render() {
  const end = game.status === "won" || game.status === "lost",
    preset = PRESETS[game.difficulty],
    flags = game.cells.filter((c) => c.flagged).length,
    safe = game.cells.filter((c) => c.revealed && !c.mine).length;
  document
    .querySelectorAll<HTMLButtonElement>("[data-difficulty]")
    .forEach((b) => {
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.difficulty === game.difficulty),
      );
    });
  board.querySelectorAll<HTMLButtonElement>(".cell").forEach((b, i) => {
    const c = game.cells[i]!,
      showMine = end && c.mine,
      wrong = game.status === "lost" && c.flagged && !c.mine;
    b.className = `cell ${c.revealed ? "revealed" : "covered"} ${showMine ? "mine" : ""} ${c.flagged ? "flagged" : ""} ${wrong ? "wrong" : ""} ${game.exploded === i ? "exploded" : ""}`;
    b.textContent = wrong
      ? "×"
      : showMine
        ? game.status === "won"
          ? "⚑"
          : "✹"
        : c.flagged
          ? "⚑"
          : c.revealed && c.count
            ? String(c.count)
            : "";
    b.dataset.count = c.revealed ? String(c.count) : "";
    b.tabIndex = i === focused ? 0 : -1;
    const state = wrong
      ? "incorrect flag"
      : showMine
        ? "mine"
        : c.flagged
          ? "flagged"
          : c.revealed
            ? c.count
              ? `${c.count} adjacent ${c.count === 1 ? "mine" : "mines"}`
              : "empty"
            : "covered";
    b.setAttribute(
      "aria-label",
      `Row ${Math.floor(i / preset.cols) + 1}, column ${(i % preset.cols) + 1}: ${state}`,
    );
    b.setAttribute("aria-disabled", String(end));
  });
  element("mine-count").textContent = String(preset.mines - flags).padStart(
    2,
    "0",
  );
  element("timer").textContent = format(elapsed(game, Date.now()));
  element("state-label").textContent = {
    ready: "Uncharted ground",
    active: "One square at a time",
    won: "Field cleared",
    lost: "A mine was uncovered",
  }[game.status];
  element("state-icon").textContent = {
    ready: "✳",
    active: "✳",
    won: "✓",
    lost: "✹",
  }[game.status];
  element("status").textContent = feedback;
  app.dataset.status = game.status;
  element("flag-mode").setAttribute("aria-pressed", String(flagMode));
  element("mode-value").textContent = flagMode ? "on" : "off";
  board.classList.toggle("flag-mode", flagMode);
  element("progress").style.width =
    `${(safe / (game.cells.length - preset.mines)) * 100}%`;
  element("field-info").textContent =
    `${preset.cols} × ${preset.rows} FIELD / ${safe} OF ${game.cells.length - preset.mines} SAFE SQUARES`;
  element("best").textContent =
    best[game.difficulty] === undefined
      ? "PERSONAL BEST —"
      : "PERSONAL BEST " + format(best[game.difficulty]!);
}
function action(index: number, marking: boolean) {
  const prior = game.status;
  if (prior === "won" || prior === "lost") return;
  focused = index;
  if (marking) {
    flag(game, index);
    feedback = game.cells[index]!.revealed
      ? "Revealed ground cannot be flagged."
      : game.cells[index]!.flagged
        ? "Flag placed. It is a marker, not a certainty."
        : "Flag removed.";
  } else {
    reveal(game, index, Date.now());
    feedback =
      game.status === "won"
        ? "Beautifully done. Every safe square is clear."
        : game.status === "lost"
          ? "A mine ended this field. Take a breath, then start a new one."
          : game.cells[index]!.flagged
            ? "Remove the flag before revealing this square."
            : "Read the numbers. Keep exploring.";
  }
  if (game.status === "won") {
    best = recordBest(best, game);
    write(BEST, JSON.stringify(best));
  }
  render();
  persist();
}
function restart(difficulty: Difficulty = game.difficulty) {
  game = createGame(difficulty);
  focused = 0;
  flagMode = false;
  feedback = "A fresh field. Your first reveal opens safe ground.";
  buildBoard();
  render();
  persist();
}
board.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".cell");
  if (b) action(Number(b.dataset.index), flagMode);
});
board.addEventListener("contextmenu", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".cell");
  if (b) {
    e.preventDefault();
    action(Number(b.dataset.index), true);
  }
});
board.addEventListener("focusin", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".cell");
  if (b) {
    focused = Number(b.dataset.index);
    board
      .querySelectorAll<HTMLButtonElement>(".cell")
      .forEach((cell, i) => (cell.tabIndex = i === focused ? 0 : -1));
  }
});
board.addEventListener("keydown", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".cell");
  if (!b) return;
  const { cols, rows } = PRESETS[game.difficulty],
    i = Number(b.dataset.index),
    r = Math.floor(i / cols),
    c = i % cols;
  const destinations: Record<string, number> = {
    ArrowLeft: r * cols + Math.max(0, c - 1),
    ArrowRight: r * cols + Math.min(cols - 1, c + 1),
    ArrowUp: Math.max(0, r - 1) * cols + c,
    ArrowDown: Math.min(rows - 1, r + 1) * cols + c,
    Home: r * cols,
    End: r * cols + cols - 1,
  };
  if (e.key in destinations) {
    e.preventDefault();
    focused = destinations[e.key]!;
    render();
    board
      .querySelector<HTMLButtonElement>(`[data-index="${focused}"]`)!
      .focus();
  } else if (e.key.toLowerCase() === "f") {
    e.preventDefault();
    if (!e.repeat) action(i, true);
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (!e.repeat) action(i, false);
  }
});
element("restart").addEventListener("click", () => restart());
document
  .querySelectorAll<HTMLButtonElement>("[data-difficulty]")
  .forEach((b) =>
    b.addEventListener("click", () =>
      restart(b.dataset.difficulty as Difficulty),
    ),
  );
element("flag-mode").addEventListener("click", () => {
  flagMode = !flagMode;
  render();
});
window.addEventListener("pagehide", persist);
setInterval(() => {
  if (game.status === "active") {
    element("timer").textContent = format(elapsed(game, Date.now()));
    persist();
  }
}, 250);
buildBoard();
render();
persist();
