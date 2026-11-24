# VYRA — The Freedom Edition

Editorial swimwear storefront. The current source snapshot was recovered from AppDeploy app `vyra-3t9rsu` (snapshot `1795534840054`).

## Project structure
- `src/`: React + Vite storefront
- `public/resources/`: VYRA campaign/editorial images
- `backend/index.ts`: AppDeploy order API and owner-only order management
- `tests/tests.json`: defined storefront and request-flow test scenarios

## Important runtime note
This snapshot uses AppDeploy-specific modules (`@appdeploy/client` and `@appdeploy/sdk`) for order requests, authentication, and persistence. The frontend can be built with Vite after those integrations are ported or replaced. Do not assume this exact snapshot is a standalone Vercel deployment.

## Build
```bash
npm install
npm run build
```
