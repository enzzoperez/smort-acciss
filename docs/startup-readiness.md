# Startup readiness

Goal: a **fresh** agent session can take over without tribal knowledge. Four conditions (all required):

| #   | Condition        | Meaning here                                                              |
| --- | ---------------- | ------------------------------------------------------------------------- |
| 1   | Can start        | Dependencies install; documented how to run native app                    |
| 2   | Can verify       | `npm run check` exists and is documented (baseline failures OK if listed) |
| 3   | Can see progress | `PROGRESS.md` states current focus / next steps                           |
| 4   | Can pick up      | `DECISIONS.md` + topic docs answer “why / where / constraints”            |

This is **harness init**, not product feature work. Do not mix “fix readiness” with shipping new scan/login behavior in the same session unless asked.

## Acceptance checklist

Use after clone or when onboarding a new agent session to this repo:

- [ ] Node matches `.nvmrc`; `npm install` succeeds
- [ ] Local `.env.development` (and/or `.env.production`) exists — values from team, not git
- [ ] (Optional for full native) Firebase `google-services.json` / `GoogleService-Info.plist` present locally
- [ ] `npm run check` runs; output matches known baseline in `docs/verification.md` (or is green after debt is cleared)
- [ ] Agent can answer from repo alone: what the app is, how to run, how to verify, what is next (`AGENTS.md` + `PROGRESS.md`)
- [ ] For long tasks: clock-in protocol in `AGENTS.md` was followed

## Machine-oriented “ready” signals

```bash
nvm use
npm install
npm run check    # expect baseline failures until fixed — see docs/verification.md
```

Native run (needs env + device/emulator):

```bash
npm run android  # or npm run ios
```

## Not ready if

- Env files missing and agent invents API URLs/keys
- Agent creates `002_*` migrations (violates `src/db/CONSTRAINTS.md`)
- Agent declares done without running/reporting `npm run check`
- `PROGRESS.md` is stale after a long session (no clock-out)
