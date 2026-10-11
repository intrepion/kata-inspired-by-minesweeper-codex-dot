# Fieldwork acceptance specification

User delegates all recommended choices; no design interview is requested. Beginner 9×9/10, intermediate 16×16/40, expert 30×16/99. Original warm field-journal aesthetic, mint ground and amber flags, responsive DOM grid. Use TypeScript/Vite, no runtime framework, no paid services, private GitHub only.

- Delayed unbiased mine placement excludes the first reveal and its eight neighbors. Correct bounded counts, iterative zero flood preserving flags, chord with matching adjacent flags, loss for incorrectly flagged chords. No no-guess claim.
- Ready → active → won/lost lifecycle. All actions inert after end. Win requires all safe cells revealed. Restart/difficulty creates a fresh ready field; first reveal starts timer and terminal action freezes it.
- Accurate active session milliseconds, resume with persisted elapsed time; closed-tab time excluded. Best times per difficulty updated only on a faster win. Versioned saves validated, malformed/inconsistent saves discarded. Storage failures must not prevent play.
- Click/Enter/Space reveal or chord, right click/F flag; arrow/Home/End navigation with one tab stop. Touch flag mode; 34px minimum cells on small displays and horizontally scrollable large fields. Visible focus, labels, live outcome, instructions, readable contrast, reduced motion.
- Seeded behavior tests cover mine count, boundaries, safe opening, flood, flags, correct/incorrect chords, win/loss, terminal input, timer, restart/difficulty, saves/best times. Actual Mac browser checks exercise user controls, with honest coverage recorded.
- Typecheck, tests, build, dependency audit, separate standards/spec review, commit/push/CI verification. Leave a clean ready field on port 5176; preserve existing games and ports.

## Agreed seams (delegated recommended choices)
Game actions/state, snapshot decoding, elapsed-time/best-time helpers, and real player controls. Test clock/randomness at these public boundaries. Red/green slices are logged in docs/VALIDATION.md.
