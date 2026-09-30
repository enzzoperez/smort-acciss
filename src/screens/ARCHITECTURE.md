# Screens

Pattern: `*-screen.tsx` (UI) + `use-*-screen.tsx` (logic). Keep business orchestration in the hook; keep presentational code in the screen.

## Flow

1. **Login** — operator document + observation + PIN → `getEventQrConfigByCode` (resolve PIN → config) → store `scanAccess` → `/select-events`. On cold start with persisted `scanAccess`, re-resolve PIN; if PIN disabled and pending offline tickets exist, keep session and alert (do not force logout).
2. **Config hub** (`select-events`) — **display** events/sections from the PIN config (not a multi-select). Load QR configs; if `issuedTicketsSyncEnabled`, download/sync issued tickets → CTA to `/camera`. Header logout: if pending offline tickets → Cancelar / Enviar tickets (sync then logout); else confirm “Editar pin…”. Config refresh that sees a disabled PIN follows the same pending gate as login.
3. **Camera** — scan QR → navigate to result with params.
4. **Result** — online validate/register or offline validate + queue sync → UI success/error.

## MUST

- Register new routes in `src/app/` (thin re-export) and `src/app/_layout.tsx` Stack if needed.
- Use `@/` imports; match existing themed components (`ThemedText`, `Layer`, `UiButton`, …).
- Request camera permission before relying on the camera screen.
- Gate session clear on `hasPendingOfflineTickets` (logout + disabled-PIN paths).

## MUST NOT

- Treat `/select-events` as an event picker — events come from the PIN config.
- Put RTK Query + DB + navigation spaghetti only in the `.tsx` screen file when a hook already exists for that screen.
- Clear session / wipe DB while offline scans are still pending (`syncStatus: pending`).
