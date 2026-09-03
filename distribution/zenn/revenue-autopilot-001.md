# Zenn Revenue Autopilot — Cycle 001

Date: 2026-09-03
Primary goal: first Zenn-attributed purchase

## Opportunity

Article: `articles/ai-agent-bottleneck-execution-evidence.md`
Theme: AI agents get slower as orchestration and review bottlenecks grow
Primary CTA: Cross-Agent Operating Kit
Revenue endpoint: Stripe via Stratumpraxis product page

## Demand Before Build score

| Signal | Result |
|---|---|
| Search demand | GO — recent Zenn results continue to cover AI-agent orchestration, serial-wait, human-review and operational bottlenecks |
| Market dissatisfaction | GO — speed gains do not reliably translate to end-to-end throughput |
| Money intent | GO — problem concerns operational implementation and coordination |
| Existing asset relevance | GO — Cross-Agent Operating Kit matches directly |
| CTA destination | GO — product route exists and article carries campaign UTM + route_id |
| Distribution route | LIVE — Zenn successfully deployed the article from `stratumpraxis/vector-praxis-japan` on `main` |
| Automation potential | GO — one-time Zenn↔GitHub authorization is complete |
| Reusable asset | GO — evergreen operational design topic |

Decision: GO. No duplicate article should be created before this route is measured.

## Measurement contract

Campaign slug: `ai_agent_bottleneck_execution_evidence`
UTM source: `zenn`
UTM medium: `article`
Route ID: `zenn_ai_agent_bottleneck_v1`

Track in order:

1. Zenn Public URL
2. Page View / Search Click where available
3. CTA Click
4. Product Page Visit
5. Checkout Start
6. Purchase
7. Revenue

## Public deployment evidence — 2026-09-03

Zenn deployment status: **SUCCESS**.

Zenn reported one updated file:

- `articles/ai-agent-bottleneck-execution-evidence.md`
- Zenn link: `https://zenn.dev/link/articles/ai-agent-bottleneck-execution-evidence`
- Connected repository: `stratumpraxis/vector-praxis-japan`
- Branch: `main`
- Trigger commit: `3d4fe61d17f5918b4e3843c8ebc26bbbc3b99901`

The Zenn notice that `books` directory was not found is non-blocking for the current articles-only revenue route. No book asset is required for this cycle.

The article source is `published: true` and its primary CTA carries:

- `utm_source=zenn`
- `utm_medium=article`
- `utm_campaign=ai_agent_bottleneck_execution_evidence`
- `asset_id=cross_agent_operating_kit`
- `route_id=zenn_ai_agent_bottleneck_v1`

## Measurement state

Pre-publication PostHog query for Zenn attribution returned 0 matching events, as expected before the route was live.

Now that deployment is live, the next measurement window starts from this publication point. Do not interpret earlier zeros as post-publication performance.

## Current bottleneck

Single deepest bottleneck: **first real Zenn traffic → CTA event**.

Publication authorization and deployment are no longer blockers.

## Next executable action

Measure the live Zenn route for impressions/page visits and `primary_cta_click` / product arrival using `route_id=zenn_ai_agent_bottleneck_v1`. If traffic appears without CTA clicks, improve only the article CTA. If no traffic appears, improve title/search distribution before changing the offer.
