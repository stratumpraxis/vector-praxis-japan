# Vector Praxis Works Hub

Vector Praxis Works Hub is the public hub for practical AI use, building, monetization, creator work, publishing, and return routes.

Public-facing structure:

- Start
- Build
- Earn
- Creator
- Read
- Return

The public design and copy are original to Vector Praxis. Do not copy third-party product UI, logos, branded layouts, questionnaires, result text, or proprietary visual systems. External services may be linked only as destinations where relevant; they are not used as visual templates for this site.

## Production

- Current public URL: https://vector-praxis-japan.user-ex26.chatgpt.site/
- note: https://note.com/deft_eel6718
- Deployment migration: [`docs/zero-cost-hosting-migration.md`](docs/zero-cost-hosting-migration.md)
- Verified asset inventory: [`docs/asset-inventory.md`](docs/asset-inventory.md)

The existing Sites URL remains live and canonical until a replacement production URL is publicly reachable without authentication.

## Current public role

Vector is the Praxis Group route for AI practice, creator workflows, building, monetization, publishing, and repeat-use navigation. B2B products and team/enterprise operating offers belong on Stratum and should not be promoted as Vector-owned offers.

Digital Index Base main-site creation and future canonical asset migration are intentionally deferred. Existing asset URLs should remain intact until a verified replacement is ready.

## Local verification

```bash
npm ci
npm run build:vercel
npm test
```

## Deployment

`vercel.json` configures the Vercel production build with Next.js. Canonical, Open Graph, robots, and sitemap origins are centralized in `lib/site-url.ts` and accept an HTTPS `SITE_ORIGIN` override.

Do not change the canonical origin until the replacement URL returns HTTP 200 to an unauthenticated request.
