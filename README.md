# Fieldwork

An original Minesweeper-inspired game of careful discovery. Built with strict TypeScript and Vite, with no runtime dependencies, accounts, analytics, paid services, or copied game assets.

## Play locally

```sh
cd /Users/intrepion/Documents/Codex/2026-10-10/task-4/kata-inspired-by-minesweeper-codex-dot
npm ci
npm run dev
```

Open http://127.0.0.1:5176. The server binds loopback only and refuses to take another port. Other local games on 5173–5175 are unaffected.

## Controls

Click, Enter, or Space to reveal. Click a revealed number to chord when adjacent flags match it. Incorrect flags can detonate a chord. Right-click or F to toggle a flag. Arrow keys navigate; Home/End go to row edges. Touch flag mode changes pointer/touch taps; keyboard Enter/Space always reveal. Scroll or swipe wide fields. New field restarts; changing difficulty creates a new field.

Beginner: 9×9 with 10 mines. Intermediate: 16×16 with 40. Expert: 30×16 with 99. The first reveal and its neighbors are safe. Boards may require guesses later; this is not a no-guess generator.

Games and per-difficulty best times save on this device. Reload resumes elapsed session time; time with the tab closed is excluded. Storage failures allow play without persistence. Corrupt saves are discarded. Clear all safe cells to win; flagging every mine is optional. Mine counter means mines minus player flags (flags are claims).

## Verify

```sh
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
```

Production files are in `dist/`. GitHub Actions runs the same checks. [Acceptance specification](docs/SPEC.md), [glossary](GLOSSARY.md), [decision](docs/adr/0001-safe-opening-and-saved-time.md), [validation evidence](docs/VALIDATION.md), and [skill adaptations](docs/SKILLS.md) explain the boundaries and verified coverage.

Private repository; no public deployment. Browser QA screenshots are in `docs/screenshots/`.
