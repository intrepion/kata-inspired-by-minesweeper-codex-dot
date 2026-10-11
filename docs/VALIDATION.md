# Validation log

## TDD
- Safe-opening slice: missing engine module made the initial test red; implemented ready state, placement and reveal → green (1 test), strict typecheck passed.
- Save-integrity slice: a lost snapshot containing two exposed mines was accepted (red). Decoder now rejects this impossible state (green, 2 tests).
- Initial engine slice implemented more rule scaffolding than strict minimal TDD calls for; subsequent regressions use explicit red/green and behavior coverage. This is an adaptation, not a claim that every line was test-first.
- Seeded rule coverage added (28 tests). A transcribed seeded fixture used wrong lower-row indexes; corrected the fixture and manually checked literal adjacent counts against its mine diagram. Rules, chords, lifecycle, timer, presets, snapshot recovery and best-time coverage pass.
