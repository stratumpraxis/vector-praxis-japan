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
| Distribution route | BLOCKED — Zenn account/repository authorization is not verified |
| Automation potential | GO after one-time Zenn↔GitHub authorization |
| Reusable asset | GO — evergreen operational design topic |

Decision: GO, but do not create another article before this route is published and measured.

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

PostHog 7-day query for `utm_source=zenn`, `first_utm_source=zenn`, `last_utm_source=zenn`, or `route_id=zenn_ai_agent_bottleneck_v1`: **0 matching events**.

Stripe live account is connected, but the available connector surface in this run did not expose a direct Checkout Session listing execution action; no Zenn-attributed Stripe purchase can therefore be asserted from Stripe data. PostHog contains no Zenn-attributed downstream event.

Public Zenn search did not surface this article. Repository source remains `published: false`, so no public URL is expected yet.

## Bottleneck

Single deepest bottleneck: **Zenn publication authorization / repository sync**.

Everything downstream is structurally ready, but without the one-time Zenn↔GitHub account authorization there can be no Zenn impression, CTA click, checkout, or attributed purchase.

## Safe action completed this cycle

Revalidated demand against current Zenn results, verified the existing article/CTA route, queried PostHog for Zenn attribution, checked the live Stripe connection, and recorded the blocker without producing duplicate content or changing the offer.

## Human Gate

Required once: authorize `stratumpraxis/vector-praxis-japan` in Zenn's GitHub deployment settings and sync `main`.

After authorization, next action is to change the existing article to `published: true`, verify the Zenn Public URL, test the CTA route, and begin measuring `zenn_ai_agent_bottleneck_v1`.
