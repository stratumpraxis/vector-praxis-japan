# Vector Praxis Japan Hub

Vector Praxisの日本語公式ハブです。検証済みの無料記事、noteマガジン、有料コンテンツを、課題と目的から選べる形に整理しています。

## Production

- Current public URL: https://vector-praxis-japan.user-ex26.chatgpt.site/
- note: https://note.com/deft_eel6718
- Deployment migration: [`docs/zero-cost-hosting-migration.md`](docs/zero-cost-hosting-migration.md)
- Verified asset inventory: [`docs/asset-inventory.md`](docs/asset-inventory.md)

## Cross-Agent Operating Kit

Portable operating infrastructure for AI teams using Claude Code, Codex, Cursor, and other agent runtimes. Includes a master `AGENTS.md` policy, runtime adapters, human gates, policy-conflict checks, budget/token/quota guards, migration checklist, score sheet, state handoff, and implementation guides.

- [$69 Personal License — Cross-Agent Operating Kit](https://buy.stripe.com/4gM9AU3sE1YLcoM4FB6Zy0T?client_reference_id=github_readme_ca_20260906&utm_source=github&utm_medium=repo&utm_campaign=market_revenue_retest)

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
