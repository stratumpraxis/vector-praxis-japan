# Vector Praxis UX / Surface Audit — 2026-09-11

## Purpose

This document records the current Vector public surfaces before further UI work. It is an internal implementation reference, not a new public product page.

Vector remains the Japanese, non-B2B Digital Index Base for individual AI practice, creators, building, earning, reading and returning.

## Canonical / production boundary

- Current baseline origin: `https://vector-praxis-japan.user-ex26.chatgpt.site/`
- Fallback canonical in `lib/site-url.ts`: same Sites origin.
- `SITE_ORIGIN` may override only with a valid HTTPS origin.
- `https://vector-praxis-japan-hub.vercel.app/` must not be treated as canonical without explicit migration evidence.

## Current six-route home architecture

Do not replace or rename the six primary routes as part of visual polishing:

1. Start
2. Build
3. Earn
4. Creator
5. Read
6. Return

The public status vocabulary is:

- FREE
- PAID
- HUB
- EXTERNAL
- PAUSED

Legacy internal source labels `READ` and `GROUP` are presentation-normalized on the current home experience to `HUB` and `EXTERNAL` respectively. This does not change destination ownership or revenue routing.

## Current App Router surfaces

| Route | Source | Current role | Sitemap state |
|---|---|---|---|
| `/` | `app/page.tsx` | Main six-route navigation hub | Included |
| `/ai-agent-bottleneck` | `app/ai-agent-bottleneck/page.tsx` | Owned practical guide / downstream route to relevant tools | Included |
| `/library` | `app/library/page.tsx` | Linked archive/index of existing non-B2B assets | Not currently included |
| `/vector-works` | `app/vector-works/page.tsx` | Existing-asset distribution / measure / return lane | Not currently included |
| `/privacy` | `app/privacy/page.tsx` | Analytics and privacy boundary | Not currently included |

Do not change sitemap inclusion merely for UI reasons.

## Repository assets that are not automatically public App Router pages

- `app/ai-workstyle-check.tsx`
- `app/business-pulse.tsx`
- `app/chatgpt-auth.ts`

These files exist in the repository but their filenames alone do not establish a public route.

`ai-stack-optimizer/index.html` is also present as a legacy/static repository asset. Public exposure of this file must be verified before treating it as an active Vector URL.

## Existing destination boundary

Vector may route a relevant user to Stratum, Payhip, note, or another existing destination. A link does not transfer product ownership to Vector.

The `/library` surface therefore acts as a **linked index**, not a catalog claiming ownership of all linked assets.

## Current UX risks identified

1. **Status vocabulary mismatch** — home source historically used `READ` / `GROUP` while the current public model is `HUB` / `EXTERNAL`.
2. **Hidden useful surfaces** — `/library` and `/vector-works` existed but were easy to miss from the main browsing experience.
3. **Library brand ambiguity** — a large list of Stratum-hosted URLs could look like Vector-owned products without an explicit brand boundary.
4. **Hero scale** — the main headline could dominate the first viewport more than necessary for a navigation product.
5. **Static route feel** — the six-route map already had good structure but insufficient causal feedback and motion hierarchy.
6. **Drawer completion** — route drawers needed stronger mobile-height and overflow handling.
7. **Return behavior** — lower surfaces need a short route back to the Hub rather than leaving the user at an external destination.

## Current correction strategy

No new category or product is required.

- Keep six routes.
- Keep existing destinations.
- Keep canonical and tracking logic.
- Normalize status display without altering destination semantics.
- Surface existing Vector pages from the discovery experience rather than creating new pages.
- Add motion only where it helps route recognition, selection, and return.
- Keep mobile one-thumb friendly and respect `prefers-reduced-motion`.
- Use existing note assets as an editorial discovery shelf rather than generating new content solely to fill the UI.

## Measurement

Existing PostHog remains authoritative. New UI interactions use explicit events rather than enabling broad autocapture.

Relevant events include:

- `vector_home_view`
- `vector_route_open`
- `vector_goal_select`
- existing destination events from route drawers
- `vector_premium_layer_ready`
- `vector_asset_preview`
- `vector_asset_open`
- `vector_internal_destination`
- `vector_library_open`
- `vector_works_open`

UI completion is not revenue evidence. Downstream checkout/payment remains the source of truth where available.

## Freeze criterion

Vector can be considered ready for a validation freeze when:

- six-route structure remains intact,
- existing links are preserved,
- primary and lower-page return paths are clear,
- mobile interaction is stable,
- status meaning is understandable,
- tracking points remain measurable,
- CI/build/tests pass,
- canonical origin has not been changed without migration evidence.

Further UI additions should then require observed user friction or evidence, not aesthetic possibility alone.
