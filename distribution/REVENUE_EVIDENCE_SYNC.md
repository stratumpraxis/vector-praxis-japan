# Vector Revenue Evidence Sync

## Purpose

This layer converts observed Vector-owned funnel analytics into durable GitHub evidence for `scripts/winner-gate.mjs`.

The chain is:

`Social PUBLISHED -> PostHog observed action -> revenue-evidence.jsonl -> Winner Gate`

It does not infer purchase or revenue from clicks.

## Source boundary

The PostHog sync is intentionally limited to the `current_route.route_id` in `config/vector-revenue-event-contract.json` and to exact `route_id + utm_content` pairs belonging to confirmed `PUBLISHED` items in `distribution/social-queue.json`.

This prevents unrelated routes from a shared analytics project from entering the Vector evidence ledger.

## Events accepted from PostHog

- `traffic_session_start`
- `free_tool_start`
- `free_tool_complete`
- `paid_product_view`
- `primary_cta_click`
- `checkout_click`

These can prove traffic or buyer action. `checkout_click` is still only buyer-action evidence; it does not prove checkout completion.

## Events deliberately excluded from generic PostHog ingestion

- `confirmed_checkout_departure`
- `checkout_return`
- `verified_access`
- `purchase`

Those stages require a provider-grade or otherwise explicitly verified evidence source. Payment success must never be synthesized from analytics activity.

## GitHub Actions configuration

The hourly social workflow runs `scripts/posthog-evidence-sync.mjs` before the Winner Gate.

Required for live PostHog querying:

- GitHub secret: `POSTHOG_PERSONAL_API_KEY` with read/query permission for the PostHog project.

Optional repository variables:

- `POSTHOG_PROJECT_ID` — defaults to `573335`.
- `POSTHOG_API_HOST` — defaults to `https://us.posthog.com`.
- `POSTHOG_EVIDENCE_WINDOW_DAYS` — defaults to `14`, allowed range 1–90.

If the API key is absent, the sync exits successfully with `READY_BUT_NOT_CONNECTED`; social publishing continues.

## Files

- `distribution/revenue-evidence.jsonl` — append-only evidence ledger.
- `distribution/posthog-evidence-sync-state.json` — deterministic connection/evidence state.
- `distribution/winner-gate-state.json` — derived Winner Gate state.

## Attribution

Each imported record stores the matching `social_item_id`, `external_post_id`, `route_id`, `utm_content`, event time, and a deterministic `evidence_ref`.

Duplicate observations with identical evidence payloads are not appended twice.

## Direct-to-note routes

A social post that links directly to note does not pass through the Vector-owned PostHog surface. Its purchase or revenue evidence therefore needs a separate note/payment-provider evidence source. This PostHog bridge must not claim visibility it does not have.
