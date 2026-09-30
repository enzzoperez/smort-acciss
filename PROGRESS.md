# Progress

Handoff file for cross-session agent work. Update before ending a long session; read at the start of the next.

Keep this file **current for the default branch after merge**. Branch-local WIP (open PR, “commit when ready”) does not belong here once the work lands on `develop` — durable status lives in `docs/features.md`.

## Current State

- Branch: `develop` (post F07 merge)
- Focus: none — pick next work from user request or `docs/features.md`
- Verification: known baseline only (`expo-symbols`, `react-native-country-codes-picker`) — see `docs/verification.md`
- Latest meaningful change: F07 logout / session clear gated by pending offline tickets (`passing` in `docs/features.md`)

## Completed

- (none — session-local; product status is in `docs/features.md`)

## In Progress

- (none)

## Known Issues

- `npm run check` fails on missing `expo-symbols` and `react-native-country-codes-picker` types (baseline debt — do not thrash-fix unless tasked)
- `ios-prod` script has typo `NODE_ENV=prouction` (pre-existing)
- `check` short-circuits on lint failure (`lint && typecheck`), so typecheck baseline may not show every run
- F07 smoke on device/emulator still not run

## Next Steps

1. Next product task: add/activate one `Fxx` in `docs/features.md` (WIP=1)
2. Optional: clear `check` baseline debt
3. Optional: smoke F07 on device/emulator and update F07 **evidence** in `docs/features.md`
