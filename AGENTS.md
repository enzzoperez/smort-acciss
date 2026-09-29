# AGENTS.md

## Project Overview

Expo/React Native app (**tuti-smart-access**) for venue staff: PIN login loads scan-access config, optionally downloads issued tickets, scans door QR codes, shows results. Native iOS/Android only.

## Hard Constraints

- Think before coding: state assumptions; if unclear or multiple interpretations exist, ask — do not guess silently.
- Simplicity first: no extra features, no single-use abstractions, no speculative configurability.
- Surgical edits: match existing style; do not “improve” adjacent code; only remove orphans your change created.
- Goal-driven: prefer verifiable steps (`[step] → verify: [check]`).
- Imports: use `@/` alias for `src/`.
- Git commits: never add co-authored, generated-by, or other AI attribution trailers.
- Secrets: never commit `.env*`, Firebase plist/json, or credentials.

## Session Protocol

**Short tasks** (< ~30 min, single session): optional `PROGRESS.md` update.

**Long / cross-session tasks:** follow clock-in / clock-out.

### Clock in

1. Read [`PROGRESS.md`](PROGRESS.md) and [`DECISIONS.md`](DECISIONS.md)
2. Run `npm run check` (report baseline honestly — see `docs/verification.md`)
3. Continue from **Next Steps** in `PROGRESS.md` (or the user task if it overrides)

### Clock out

1. Update `PROGRESS.md` (state, completed, in progress, known issues, next steps)
2. Append to `DECISIONS.md` if you made a durable design choice
3. Run `npm run check` and note result in `PROGRESS.md` if relevant
4. Leave the working tree understandable (prefer commits when the user asks)

## Quick Start

```bash
nvm use && npm install   # Node from .nvmrc
npm run android          # or: npm run ios  (copies .env.* → .env.local)
npm run check            # lint + typecheck before claiming done
```

First-time / fresh-session readiness: [`docs/startup-readiness.md`](docs/startup-readiness.md).  
Env files, Firebase, prod scripts: [`docs/environment.md`](docs/environment.md).

## Verification

```bash
npm run check    # lint + typecheck
```

DoD, smoke notes, known baseline: [`docs/verification.md`](docs/verification.md).

## Topic Docs (read on demand)

| Doc                                                          | When                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| [`PROGRESS.md`](PROGRESS.md)                                 | Resume long work / handoff           |
| [`DECISIONS.md`](DECISIONS.md)                               | Why we chose X over Y                |
| [`docs/startup-readiness.md`](docs/startup-readiness.md)     | Fresh session / clone readiness      |
| [`docs/architecture.md`](docs/architecture.md)               | Product flow / layers                |
| [`docs/environment.md`](docs/environment.md)                 | Setup, env, run/build                |
| [`docs/verification.md`](docs/verification.md)               | DoD, baseline, smoke                 |
| [`src/api/ARCHITECTURE.md`](src/api/ARCHITECTURE.md)         | HTTP / RTK Query endpoints           |
| [`src/db/CONSTRAINTS.md`](src/db/CONSTRAINTS.md)             | Schema, single migration, offline DB |
| [`src/screens/ARCHITECTURE.md`](src/screens/ARCHITECTURE.md) | Routes / screen hooks                |
