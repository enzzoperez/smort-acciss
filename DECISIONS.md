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

## 2026-03-29 — Feature list is the behavior source of truth

- **Why:** Unstructured “mostly done” notes cause rework and early victory. Each behavior needs verification + state.
- **See:** `docs/features.md`

## 2026-03-29 — Termination is externalized (anti early victory)

- **Why:** Agents systematically overclaim completion. Gates (static → behavior → smoke) replace “feels done.”
- **See:** `docs/termination.md`

## 2026-09-29 — Never clear session while offline scans are pending

- **Why:** Clearing config/DB would drop unscanned-upload rows (`ticket_scan` / `no_valid_tickets` with `syncStatus: pending`) and lose door events.
- **Behavior:** Voluntary logout offers sync-then-logout; disabled-PIN detection keeps the session until pending rows are gone.
- **Rejected:** Force-logout / wipe DB on disabled PIN even when the offline queue is non-empty.
- **See:** F07 in `docs/features.md`; `hasPendingOfflineTickets` in `src/db/utils.ts`
