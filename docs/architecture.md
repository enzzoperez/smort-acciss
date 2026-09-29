# System architecture

Staff access-control app: enter a **PIN** to load scan-access config → show assigned events/sections → (optional) download issued tickets → scan QR → show result. Works online and offline (local SQLite ticket cache + pending sync).

## User flow

```
Login (operator doc + observation + PIN)
  → Backend resolves PIN → scan-access config (events/sections, mode, flags)
  → Config screen (`/select-events`): display assignment (not a picker)
      + load per-event QR configs
      + if issuedTicketsSyncEnabled → download/sync issued tickets to SQLite
  → Camera scan
  → Scan result (success / error)
```

Routes live in `src/app/` (expo-router) and re-export screens from `src/screens/`.

| Route            | Screen                  | Role today                                     |
| ---------------- | ----------------------- | ---------------------------------------------- |
| `/` (index)      | `screens/login`         | PIN + operator data                            |
| `/select-events` | `screens/select-events` | Config hub (read-only assignment + sync + CTA) |
| `/camera`        | `screens/camera`        | QR capture                                     |
| `/scan-result`   | `screens/result`        | Validate / register / offline queue            |

## Runtime layers

1. **Providers** (`src/providers/`): DB → Redux persist → network → OTA updates → UI / safe area / privacy overlay.
2. **API** (`src/api/`): RTK Query on Axios; base URL from `EXPO_PUBLIC_BASE_URL`.
3. **Store** (`src/store/`): `auth`, `user`, `config` (persisted via SecureStore) + RTK Query cache.
4. **DB** (`src/db/`): encrypted SQLite (SQLCipher) for tickets, scans, invalid scans, sync markers.
5. **Screens**: UI + `use-*-screen` hooks for orchestration.

## Online vs offline

- **Online scan**: `scannerApi.validateAndRegister` hits the backend with `X-Api-Key`.
- **Offline scan**: only when `issuedTicketsSyncEnabled`; validate against local `tickets` (and dynamic QR rules); write `ticket_scan` or `no_valid_tickets` with `syncStatus: pending`.
- **Sync**: pending rows uploaded via `scannerApi.syncOfflineData` / helpers in `src/db/utils.ts`.

## Variants

- `APP_VARIANT=development` → Android app id `com.itti.tuti.smartaccess.dev`.
- Production package/bundle: `com.itti.tuti.smartaccess`.
- EAS channels: development / preview / production (`eas.json`, `npm run update:*`).
