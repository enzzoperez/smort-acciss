# Environment & runbook

## Node

Use `.nvmrc` (v22.19.0). Package manager: **npm**.

## Env files (gitignored)

| File               | Role                                      |
| ------------------ | ----------------------------------------- |
| `.env.development` | Dev API / keys                            |
| `.env.production`  | Prod API / keys                           |
| `.env.local`       | Active file Expo reads; scripts overwrite |

Never commit env values or Firebase configs. For which keys exist, look at local `.env.development` / `.env.production` (or `process.env` / `APP_VARIANT` usages in code) — do not maintain a duplicate list in this doc.

## Common commands

```bash
npm install
npm run android          # copies .env.development → .env.local, runs native Android (dev)
npm run ios              # same for iOS (dev)
npm run android-prod     # production env + productionDebug
npm run ios-prod         # production env (note: script typo NODE_ENV=prouction exists)
npm run lint
npm run typecheck
npm run check            # lint + typecheck
```

Native first-time setup needs local `google-services.json` / `GoogleService-Info.plist` (gitignored). EAS builds inject them via env secrets (`eas.json`).

## App identity

- Expo slug/name: `tuti-smart-access`
- Scheme: `tutiqrreader`
- Owner / EAS project: see `app.config.js` → `extra.eas.projectId`
