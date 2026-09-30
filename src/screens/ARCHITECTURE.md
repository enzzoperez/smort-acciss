# Screens

Pattern: `*-screen.tsx` (UI) + `use-*-screen.tsx` (logic). Keep business orchestration in the hook; keep presentational code in the screen.

## Flow

1. **Login** — operator document + observation + PIN → `getEventQrConfigByCode` (resolve PIN → config) → store `scanAccess` → `/select-events`.
2. **Config hub** (`select-events`) — **display** events/sections from the PIN config (not a multi-select). Load QR configs; if `issuedTicketsSyncEnabled`, download/sync issued tickets → CTA to `/camera`.
3. **Camera** — scan QR → navigate to result with params.
4. **Result** — online validate/register or offline validate + queue sync → UI success/error.

## MUST

- Register new routes in `src/app/` (thin re-export) and `src/app/_layout.tsx` Stack if needed.
- Use `@/` imports; match existing themed components (`ThemedText`, `Layer`, `UiButton`, …).
- Request camera permission before relying on the camera screen.

## MUST NOT

- Treat `/select-events` as an event picker — events come from the PIN config.
- Put RTK Query + DB + navigation spaghetti only in the `.tsx` screen file when a hook already exists for that screen.
- Skip pending-offline checks on session changes (login hook already guards some cases — preserve that behavior).
