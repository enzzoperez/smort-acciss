# DB constraints

Encrypted SQLite via **expo-sqlite + SQLCipher**. Encryption key from SecureStore (`db-key.ts` — generate once per device, never commit).

## Tables (`schema.ts`)

| Table              | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `tickets`          | Cached issued tickets for offline validation |
| `ticket_scan`      | Successful (or recorded) scans to sync       |
| `no_valid_tickets` | Failed scans + reason codes to sync          |
| `access_sync`      | Per-PIN sync markers / initial sync done     |

## Migrations (current distribution model)

We ship APKs via direct link (not incremental store updates), so **there must be only one migration**: `migrations/001_create_tickets.ts`.

- Schema changes: update `schema.ts` **and edit that same `001_*` file** (keep `migrations/index.ts` pointing at it).
- Do **not** add `002_`, `003_`, etc.

## MUST

- Keep a single migration file; edit `001` when tables change.
- Ticket/scan writes go through `repositories/` (or existing helpers in `utils.ts`) — keep query logic out of screens when a repo already exists.
- `syncStatus` values: `pending` \| `synced` \| `error`.
- `mode`: `SCAN` \| `CHECK`. `direction`: `CHECK_IN` \| `CHECK_OUT`.
- Invalid reasons: `QR_HAS_USED` \| `NOT_FOUND` \| `EVENT_MISMATCH` \| `ZONE_MISMATCH` \| `EXPIRED` \| `INVALID_DYNAMIC` (see schema comments).

## MUST NOT

- Create new migration files (`002_*` and beyond) while we still distribute only via APK link.
- Store the DB encryption key in Redux, AsyncStorage, or source.
- Assume online-only: offline validation lives in `screens/result/utils/offline-validator.ts` and must stay consistent with schema enums.
