# Progress

Handoff file for cross-session agent work. Update before ending a long session; read at the start of the next.

## Current State

- Branch: `chore/harness-spike`
- Focus: harness engineering (lectures 1–9), not product features
- Verification: `npm run check` — known baseline failures (see `docs/verification.md`)
- Latest meaningful change: L8 feature list primitive (`docs/features.md`)
- Product features F01–F06 seeded as `passing` (existing app); none `active`

## Completed

- [x] L1 diagnosis (5 layers)
- [x] L2 `AGENTS.md` + `typecheck`/`check` scripts
- [x] L3 repo as system of record (architecture / environment / api / db / screens docs)
- [x] L4 split instructions (slim entry + `docs/verification.md`)
- [x] L5 session continuity (`PROGRESS.md` / `DECISIONS.md` / clock-in-out)
- [x] L6 initialization / startup readiness (`docs/startup-readiness.md`)
- [x] L7 WIP=1 work rules (`docs/work-rules.md`)
- [x] L8 feature list primitive (`docs/features.md`)
- [ ] L9 strict externalized DoD / victory gates

## In Progress

- (none — ready for L9)

## Known Issues

- `npm run check` fails on missing `expo-symbols` and `react-native-country-codes-picker` types (baseline debt — do not thrash-fix unless tasked)
- `ios-prod` script has typo `NODE_ENV=prouction` (pre-existing)
- `check` short-circuits on lint failure (`lint && typecheck`), so typecheck baseline may not show every run

## Next Steps

1. L9 termination validation / anti early victory
