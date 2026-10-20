# Maestro e2e (Android)

End-to-end flows for the staff access app against **develop** (`.env.development` via `npm run android`).

## Prerequisites

1. Physical Android device (USB debugging) with the **dev** build installed and Metro running (`com.itti.tuti.smartaccess.dev`). Emulators fail TLS on the corporate network (see Troubleshooting).
   ```bash
   nvm use && npm run android
   ```
2. [Maestro CLI](https://docs.maestro.dev/getting-started/installing-maestro) installed (`maestro --version`).

## Run

```bash
# All flows
npm run e2e:maestro

# Single flow
maestro test maestro/flows/login-success.yaml
```

## Fixtures (develop)

Committed in the flows; override any of them with `maestro test -e KEY=value …`.

| Key                | Value                    | Used by                        |
| ------------------ | ------------------------ | ------------------------------ |
| `E2E_PIN`          | `ZFS2N4` (mode SCAN)     | `shared/login.yaml`            |
| `E2E_DNI`          | `33444555`               | `shared/login.yaml`            |
| `E2E_QR_OK`        | `476f-9f91-3a9bf7bf9372` | `scan-success.yaml` (reusable) |
| `E2E_QR_NOT_FOUND` | `3084-1860-9384-eef3`    | `scan-not-found.yaml`          |

## Layout

| Path                                   | Role                           |
| -------------------------------------- | ------------------------------ |
| `maestro/config.yaml`                  | `appId` + flow list            |
| `maestro/flows/shared/login.yaml`      | Login subflow                  |
| `maestro/flows/smoke-launch.yaml`      | Launch → login screen          |
| `maestro/flows/login-success.yaml`     | Valid PIN → hub                |
| `maestro/flows/login-invalid-pin.yaml` | Bad PIN → alert                |
| `maestro/flows/logout.yaml`            | Logout without pending → login |
| `maestro/flows/shared/scan.yaml`       | Deep link to `/scan-result`    |
| `maestro/flows/scan-success.yaml`      | Valid QR → access confirmed    |
| `maestro/flows/scan-not-found.yaml`    | Unknown QR → not found         |

## Selectors

Prefer `testID` (Maestro `id:`):

- `login-document`, `login-pin`, `login-observation`, `login-submit`
- `header-logout`, `header-download`
- `hub-scan`

## Notes

- Backend = develop (`EXPO_PUBLIC_BASE_URL` in `.env.development`). No separate e2e API.
- Flows use `clearState: true` (via `shared/launch.yaml`) so a persisted session does not skip login. That also wipes the dev client's last Metro server, so the subflow taps the `http://…:8081` row in the Expo dev launcher. Metro must be running (`npm run android` or `npx expo start`) so the launcher lists it.
- Camera permission is granted via Maestro `launchApp.permissions`.
- Scan flows skip the camera: `shared/scan.yaml` opens `tutiqrreader://scan-result?scannedCode=…&direction=CHECK_IN`, the same route and params the camera navigates to. The result screen reads the rest from the logged-in session, and validation hits develop online. The camera itself is not covered (manual smoke).
- The success assert expects `Acceso confirmado y quemado` because the fixture PIN is in SCAN mode; a CHECK-mode PIN shows `Acceso confirmado`.

## Troubleshooting

- **Every flow fails on `"Development Build" is visible` and the screenshot is black**: the device screen went to sleep. Keep it awake while plugged in with `adb shell svc power stayon usb`.
- **Login shows "Ocurrio un error, intenta nuevamente por favor." with no code** and `adb logcat` shows `Trust anchor for certification path not found`: the emulator cannot validate develop's TLS certificate. On the corporate network, Netskope re-signs HTTPS with its own CA, which the Mac trusts but the emulator does not.
