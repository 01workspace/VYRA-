# VYRA — The Freedom Edition

Editorial swimwear storefront. Source recovered from AppDeploy app `vyra-3t9rsu`, snapshot `1795534840054`.

## Structure
- `src/`: React + Vite storefront
- `public/resources/`: 16 editorial JPGs and 2 campaign/lookbook PNGs
- `backend/index.ts`: original AppDeploy order API
- `archive/appdeploy/src/App.tsx`: original AppDeploy frontend
- `tests/tests.json`: defined storefront and request-flow scenarios

## Vercel migration
The Vercel frontend uses `src/api.ts` and `vercel.json` to proxy customer availability requests to the existing AppDeploy API. Owner sign-in remains on the original AppDeploy site because its managed authentication and owner role are configured there.

The AppDeploy-specific backend source is retained in this repository as the source of truth for the existing order workflow. Do not remove the AppDeploy app until an independent persistent database and owner-authentication replacement has been configured and tested.

## Build
```bash
npm install
npm run build
```
