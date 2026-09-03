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
| Distribution route | AUTHORIZED — user completed Zenn↔GitHub authorization for `stratumpraxis/vector-praxis-japan` |
| Automation potential | GO — repository authorization Human Gate is cleared; next proof is public deployment |
| Reusable asset | GO — evergreen operational design topic |

Decision: GO. Do not create another article before this route is published and measured.

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

## 2026-09-03 measurement

PostHog 7-day query for `utm_source=zenn`, `first_utm_source=zenn`, `last_utm_source=zenn`, or `route_id=zenn_ai_agent_bottleneck_v1`: **0 matching events** at the pre-publication measurement point.

Stripe live account is connected. No Zenn-attributed downstream event was observed before publication authorization.

The article source on `main` is now `published: true` and its primary CTA carries Zenn campaign UTM + `route_id=zenn_ai_agent_bottleneck_v1`.

## Authorization state

The one-time Zenn↔GitHub authorization Human Gate was completed by the user on 2026-09-03 for `stratumpraxis/vector-praxis-japan`.

This commit records that transition and provides a fresh `main` push so the connected Zenn deployment path has a new repository event to process.

## Current bottleneck

Single deepest bottleneck: **Public URL verification**.

Authorization is no longer the blocker. The next required evidence is that Zenn has processed the connected repository and exposed the existing `published: true` article publicly.

## Next executable action

Verify the Zenn Public URL for `ai-agent-bottleneck-execution-evidence`, test the Cross-Agent Operating Kit CTA, then begin measuring `zenn_ai_agent_bottleneck_v1` in PostHog and Stripe attribution.
