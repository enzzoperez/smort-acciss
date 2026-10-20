# Progress

Handoff file for cross-session agent work. Update before ending a long session; read at the start of the next.

Keep this file **current for the default branch after merge**. Branch-local WIP (open PR, “commit when ready”) does not belong here once the work lands on `develop` — durable status lives in `docs/features.md`.

## Current State

- Branch: local WIP on Maestro e2e (F08)
- Focus: F08 — Maestro e2e Android (Fases 0–2 done)
- Verification: `npm run check` clean; `npm run e2e:maestro` 6/6 on physical device
- Latest meaningful change: scan-success / scan-not-found flows via deep link to `/scan-result`

## Completed

- (none — session-local; product status is in `docs/features.md`)

## In Progress

- F08 Fases 0–2 green on physical device (6/6). Remaining: Fase 3 offline/sync, Fase 4 CI

## Known Issues

- `npm run check` fails on missing `expo-symbols` and `react-native-country-codes-picker` types (baseline debt — do not thrash-fix unless tasked)
- `ios-prod` script has typo `NODE_ENV=prouction` (pre-existing)
- `check` short-circuits on lint failure (`lint && typecheck`), so typecheck baseline may not show every run
- F07 smoke on device/emulator still not run

## Next Steps

1. F08 Fase 3: offline scan + logout with pending sync (or close F08 as `passing` if offline is deferred)
2. F08 Fase 4: CI (release APK, no Metro / dev launcher steps)
3. Optional: clear `check` baseline debt
