# Verification

## Commands

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run check       # lint + typecheck (Definition of Done gate)
```

No automated test suite yet.

## Definition of Done

Do not claim completion until:

1. `npm run check` is run and reported (pass, or fail only on the known baseline below)
2. No unrequested refactors or drive-by changes (**WIP=1** — see `docs/work-rules.md`)
3. If the change touches login, config hub, camera/scan, offline DB, or API: note smoke status (done / not run + why)
4. Completion evidence for the active task is stated explicitly (command output summary or smoke note) — not “looks good”

## Known baseline (do not thrash-fix unless asked)

`npm run check` currently fails on:

1. Missing `expo-symbols` (`src/components/ui/icon-symbol*.tsx` / `collapsible.tsx`, Expo template leftover)
2. Type errors inside dependency `react-native-country-codes-picker` (pulled in via imports; `skipLibCheck` does not cover its `.tsx`)

Treat as pre-existing debt. Report `check` output honestly; do not introduce _additional_ lint/type errors in project source.

**Note:** `check` is `lint && typecheck`. If lint fails, typecheck may not run — report what actually executed.
