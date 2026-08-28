# Vector Praxis Japan Hub

Vector Praxisの日本語公式ハブです。検証済みの無料記事、noteマガジン、有料コンテンツを、課題と目的から選べる形に整理しています。

## Production

- Current public URL: https://vector-praxis-japan.user-ex26.chatgpt.site/
- note: https://note.com/deft_eel6718
- Deployment migration: [`docs/zero-cost-hosting-migration.md`](docs/zero-cost-hosting-migration.md)
- Verified asset inventory: [`docs/asset-inventory.md`](docs/asset-inventory.md)

The existing Sites URL remains live and canonical until a replacement `*.vercel.app` production URL is publicly reachable without authentication.

## Local verification

```bash
npm ci
npm run build:vercel
npm test
```

## Deployment

`vercel.json` configures the Vercel production build with Next.js. Canonical, Open Graph, robots, and sitemap origins are centralized in `lib/site-url.ts` and accept an HTTPS `SITE_ORIGIN` override.

Do not change the canonical origin until the replacement URL returns HTTP 200 to an unauthenticated request.
