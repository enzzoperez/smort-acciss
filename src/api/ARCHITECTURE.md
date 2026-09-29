# API layer

## Structure

- `root-api.ts` — `createApi` + `axiosBaseQuery`, `BASE_URL` from `EXPO_PUBLIC_BASE_URL`.
- Feature slices **inject** endpoints into `rootApi` (do not create a second `createApi`).
- Files: `auth-api.ts`, `events-api.ts`, `scanner-api.ts`, `axios-base-query.ts`.

## Auth headers (current conventions)

| Call                         | Auth                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| Login PIN resolve            | `X-Api-Key: EXPO_PUBLIC_API_KEY`                               |
| Scan / offline sync          | `X-Api-Key: EXPO_PUBLIC_API_KEY`                               |
| Event QR config by eventCode | `X-Api-Key: EXPO_PUBLIC_API_KEY_CONFIG` (clears Authorization) |
| Account login/logout         | via `auth-api` (legacy/account flow)                           |

Primary staff entry today is **PIN resolve** (`getEventQrConfigByCode`), not account password login.

## MUST

- Add new HTTP endpoints as `rootApi.injectEndpoints(...)`.
- Reuse `isApiError` / project error helpers for API error shapes.
- Keep secrets in env vars; never hardcode API keys.

## MUST NOT

- Bypass `axiosBaseQuery` with ad-hoc Axios for the same REST surface unless there is an existing pattern (ticket download in `db/utils.ts` is the known exception — prefer not to add more).
- Log secrets or full auth payloads.
