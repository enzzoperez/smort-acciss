# Design Decisions

Short log of decisions that a future session must not reverse without reason. Format: date, decision, why, rejected alternative (optional).

## 2026-03-29 — Use `AGENTS.md` as agent entry (not `CLAUDE.md`)

- **Why:** Team uses Cursor, not Claude Code; harness must be versioned in git (`CLAUDE.md` was gitignored).
- **Rejected:** Keep both files in sync (duplicate / drift).

## 2026-03-29 — Single DB migration file (`001_*` only)

- **Why:** APKs are distributed by link, not incremental store upgrades; additive migration chains are unnecessary for now.
- **Constraint:** Schema changes edit `schema.ts` + `src/db/migrations/001_*`. Do not add `002_*` until distribution model changes.
- **See:** `src/db/CONSTRAINTS.md`

## 2026-03-29 — Do not list env key names in docs

- **Why:** Key lists rot; stale docs mislead agents worse than a short pointer.
- **Source of truth:** local `.env.development` / `.env.production`, or `process.env` / `APP_VARIANT` usages in code.
- **See:** `docs/environment.md`

## 2026-03-29 — `/select-events` is a config hub, not an event picker

- **Why:** PIN resolve returns the assignment; UI displays events/sections and optionally downloads tickets when `issuedTicketsSyncEnabled`.
- **See:** `docs/architecture.md`, `src/screens/ARCHITECTURE.md`
