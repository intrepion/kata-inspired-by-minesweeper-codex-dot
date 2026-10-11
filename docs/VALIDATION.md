# Validation log

## TDD
- Safe-opening slice: missing engine module made the initial test red; implemented ready state, placement and reveal → green (1 test), strict typecheck passed.
- Save-integrity slice: a lost snapshot containing two exposed mines was accepted (red). Decoder now rejects this impossible state (green, 2 tests).
- Initial engine slice implemented more rule scaffolding than strict minimal TDD calls for; subsequent regressions use explicit red/green and behavior coverage. This is an adaptation, not a claim that every line was test-first.
- Seeded rule coverage added (28 tests). A transcribed seeded fixture used wrong lower-row indexes; corrected the fixture and manually checked literal adjacent counts against its mine diagram. Rules, chords, lifecycle, timer, presets, snapshot recovery and best-time coverage pass.
- Independent standards review found coerced array difficulties accepted by decoder; regression red → string/own-property validation → green.
- Independent spec review found placed snapshots without a revealed zero accepted; regression red → require a revealed safe opening → green.
- Review clarified keyboard Enter/Space always reveal/chord, independent of touch flag mode. Also removed duplicate restore decoding and renamed mine placement.
- Visual QA found the exploded mine inherited a number color; explicit mine/explosion color styling corrected it.

## Browser QA — actual user's Mac Chrome
- Completed beginner win through ordinary grid controls. Solver used only public aria labels for revealed numbers/flags, then right-click flags and revealed-number chords; no hidden state, seed injection, or save injection. Reached 71/71 safe squares, Field cleared, time 01:04 and personal best 01:04. `screenshots/win.jpg`.
- Won game survives reload with frozen 01:04 and best time. Active field survives reload with existing flags and elapsed time; restored feedback appears. Restart clears board, flags and timer while preserving best time.
- Keyboard F flag/unflag, ArrowRight, Enter, Space, End verified through real focused grid controls. End on expert reaches column 30 and scrolls it into view. Enter also reveals while touch flag mode is on, confirming reviewed control contract.
- Direct loss reached through covered-cell clicks. Reload preserved lost field and frozen 00:15. `screenshots/loss.jpg` captured before the explosion color correction.
- Incorrect chord tested separately: pre-flagged row 5 column 4 (guaranteed safe neighbor of opening), revealed row 5 column 5, then chorded row 4 column 4 with its matching but wrong flag. Actual loss and incorrect flag × observed. `screenshots/incorrect-chord.jpg`.
- Intermediate control creates 256 cells / 40 mines / 00:00. Expert creates 480 / 99 / 00:00. Difficulty switch resets to ready. Expert at requested 390×844 viewport retains 34px cells, horizontally scrolls, and has no document overflow. Beginner mobile layout tightened after screenshot inspection; `screenshots/mobile-ready.jpg` shows all nine columns.
- Chrome DevTools touch emulation with actual Input.dispatchTouchEvent touchStart/touchEnd exercised tap flag, tap unflag, and safe first tap reveal. This is emulated touch in Mac Chrome, not a physical phone test. Viewport override and touch emulation were reset.
- Screenshots inspected: desktop ready, win, loss, phone expert, active phone, clean phone. Fixed mine/explosion foreground color and beginner mobile spacing. `mobile.jpg` is an earlier full-page capture with capture-edge clipping; use mobile-ready.jpg for final mobile layout evidence.
- Browser log inspection found extension warnings but no game-origin error. Malformed-save browser injection was attempted via supported CDP capability but DOMStorage method is unsupported, so this is **not** claimed as a browser pass. Malformed/inconsistent save recovery is verified by deterministic unit tests instead.
- Limits: Chrome on this Mac only; no physical touch hardware or screen-reader speech validation, no Safari/Firefox test. No no-guess claim.

## Reviews
Independent standards/spec agents verified targeted fixes; both report no substantive unresolved finding. See REVIEW.md.

## Final local checks
34 deterministic tests passed; strict typecheck passed; production build passed (CSS 7.42 kB, JS 12.05 kB uncompressed); Prettier check passed; npm audit reported 0 vulnerabilities. Development server uses 127.0.0.1:5176 with strictPort. No changes were made to sibling games or their running ports.

## Delivery state
Final browser was reset to normal sizing and touch emulation disabled, then New field selected: beginner, all 81 cells covered, 00:00, flag mode off. `screenshots/ready.jpg` is final desktop evidence. Best-time record remains from QA. Private repository creation and push succeeded. GitHub Actions verifies each main push; final run URL and exact commit are provided in delivery response.

Codex exposes file-panel opening but no repository/sidebar registration control in the available tool catalog. README was opened with the supported file-panel control (queued for this task); cloning and file-panel opening do not constitute sidebar project registration.
