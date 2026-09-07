# Vector Praxis Japan Hub

Vector Praxisの日本語公式ハブです。検証済みの無料記事、noteマガジン、有料コンテンツを、課題と目的から選べる形に整理しています。

## Production

- Current public URL: https://vector-praxis-japan.user-ex26.chatgpt.site/
- note: https://note.com/deft_eel6718
- Deployment migration: [`docs/zero-cost-hosting-migration.md`](docs/zero-cost-hosting-migration.md)
- Verified asset inventory: [`docs/asset-inventory.md`](docs/asset-inventory.md)

## Global Work Radar

Global Work Radar is a public search and intelligence layer for Japan-based users exploring global and remote work opportunities. Listings are normalized from approved public sources and route applications to the original official source rather than collecting applications inside GWR.

- [Open Global Work Radar](https://global-work-radar.pages.dev/?utm_source=github&utm_medium=repo&utm_campaign=gwr_public_launch&utm_content=vector_praxis_hub)

## Cross-Agent Operating Kit

Portable operating infrastructure for AI teams using Claude Code, Codex, Cursor, and other agent runtimes. Includes a master `AGENTS.md` policy, runtime adapters, human gates, policy-conflict checks, budget/token/quota guards, migration checklist, score sheet, state handoff, and implementation guides.

Relevant when a run moves between providers and you need authority, budget, evidence, and human-gate rules to stay explicit instead of drifting with the adapter change.

**$69 one-time personal license. No subscription. Purchase is completed through Stripe after reviewing the first-party product page.**

- [$69 Personal License — Cross-Agent Operating Kit](https://stratumpraxis.com/cross-agent-operating-kit.html?utm_source=github&utm_medium=repo&utm_campaign=market_revenue_retest&utm_content=provider_handoff&route_id=github_readme_provider_handoff_20260906)

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
