# Feature list

Harness primitive: **single source of truth** for “what behaviors exist / are in flight.”  
Each item is a triple: **behavior** + **verification** + **state**.

States: `not_started` | `active` | `blocked` | `passing`

## Rules

- **WIP=1:** at most one item `active`.
- Do not mark `passing` without running that item’s verification (or recording smoke: done / not run + why).
- User/task overrides win for _what_ to work on; still keep only one `active`.
- Granularity: completable in roughly one session. Split broad asks before coding.
- `PROGRESS.md` = session handoff. This file = product/behavior backlog + status.

## Format

```md
### FXX — short title

- **behavior:** …
- **verification:** …
- **state:** not_started | active | blocked | passing
- **evidence:** (optional) commit / check summary / smoke note
```

---

## Product behaviors

### F01 — PIN login loads scan-access config

- **behavior:** Operator enters document + observation + PIN; app calls resolve and stores `scanAccess`, then opens config hub.
- **verification:** Smoke on device/emulator: valid PIN → `/select-events` with config; invalid/disabled PIN → error handling. Plus `npm run check` if code changed.
- **state:** passing
- **evidence:** Existing login flow (`use-login-screen` + `getEventQrConfigByCode`)

### F02 — Config hub displays assignment (not a picker)

- **behavior:** `/select-events` shows events/sections from PIN config; loads QR configs; if `issuedTicketsSyncEnabled`, downloads/syncs issued tickets.
- **verification:** Smoke: hub shows assigned items; with sync flag on + online, tickets download progresses; CTA to camera respects offline rules. Plus `npm run check` if code changed.
- **state:** passing
- **evidence:** Existing select-events flow

### F03 — Camera captures QR and opens result

- **behavior:** From config hub, camera scans a QR and navigates to scan result with the code/params.
- **verification:** Smoke: scan → `/scan-result`. Plus `npm run check` if code changed.
- **state:** passing
- **evidence:** Existing camera flow

### F04 — Online scan validate/register

- **behavior:** When online, scanned QR is validated/registered via `scannerApi.validateAndRegister` and result UI reflects success/error.
- **verification:** Smoke online with known good/bad QR. Plus `npm run check` if code changed.
- **state:** passing
- **evidence:** Existing result + scanner API path

### F05 — Offline scan when ticket download enabled

- **behavior:** When offline and `issuedTicketsSyncEnabled`, validation uses local SQLite (`offline-validator`) and queues `ticket_scan` / `no_valid_tickets` with `syncStatus: pending`.
- **verification:** Smoke offline after a prior ticket sync; pending rows appear locally. Plus `npm run check` if code changed.
- **state:** passing
- **evidence:** Existing offline path; blocked offline scan when sync disabled (alert)

### F06 — Sync pending offline scans when back online

- **behavior:** Pending valid/invalid scans upload via offline sync helpers / `syncOfflineData`.
- **verification:** Smoke: pending → synced (or error surfaced) after reconnect. Plus `npm run check` if code changed.
- **state:** passing
- **evidence:** Existing sync in `src/db/utils.ts` + scanner API

### F07 — Logout / session clear gated by pending offline tickets

- **behavior:** Session must not clear while `hasPendingOfflineTickets` is true.
  - **Voluntary logout** (config hub header): if pending → alert Cancelar / Enviar tickets; sync success → success alert then `performLogout` (clear DB + reset config → `/`); sync failure / `sync()` false → error alert, stay logged in; if no pending → confirm “Editar pin…” then logout.
  - **PIN disabled** (login session re-check or config refresh): if pending → alert “No se pudo cerrar la sesión…” and keep session; if no pending → reset config / surface error / return to login.
- **verification:** Smoke: (1) logout with 0 pending → session clears; (2) logout with pending + successful sync → success then logout; (3) logout with pending + failed sync → error, still logged in; (4) disabled PIN with pending → session kept. Plus `npm run check` if code changed.
- **state:** passing
- **evidence:** `handleLogout` / `refreshConfig` in `use-select-events-screen`; login `useEffect` in `use-login-screen`; `hasPendingOfflineTickets` in `src/db/utils.ts`; `useSyncOfflineData` rethrows API errors. Commits: `5f03893`, `d94f200`. smoke: not run in this docs session.

---

### F08 — Maestro e2e (Android local)

- **behavior:** Automated Maestro flows against develop on Android `.dev`: smoke launch, login OK, invalid PIN alert, logout without pending, online scan OK and QR not found (deep link to `/scan-result`, no camera).
- **verification:** With physical device + `npm run android`, `npm run e2e:maestro` green. Plus `npm run check` if app code changed.
- **state:** active
- **evidence:** Fase 0–1 green on physical Android device (2026-10-16): `npm run e2e:maestro` → 4/4 flows passed in 3m 6s (smoke-launch, login-success, login-invalid-pin, logout). `npm run check` clean. Emulator blocked by corporate TLS inspection (see `docs/e2e-maestro.md`). Fase 2 (2026-10-20): 6/6 flows passed in 5m 17s on the same device, adding scan-success and scan-not-found. Offline/sync (Fase 3) and CI (Fase 4) not started.

---

## Active / backlog

_Exactly one item `active`: F08._

When starting work: move exactly one item to `active` (or add a new `Fxx` as `not_started` then `active`). When done: set `passing` only with verification evidence filled in.
