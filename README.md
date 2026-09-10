# Global Work Radar (GWR)

Global Work Radar is a public labor-intelligence utility optimized as a revenue-inflow website.

Production: https://global-work-radar.pages.dev/

## Operating direction

The current merged redesign is the base. Do not replace it with a new concept.

Primary path:

`Inbound traffic -> utility / market signal -> CTA -> revenue-bearing action -> checkout / payment evidence`

Priorities:

- strengthen inbound traffic and qualified-return behavior
- make the utility and market-signal layer useful enough to earn repeated visits
- shorten the path from useful signal to the existing CTA / monetization route
- finish visual/UI quality to the current research-site standard
- reuse existing GWR data, filters, official-source routing, tracking events, revenue sensors, and monetization logic
- avoid unnecessary new pages, products, dashboards, or features

## Not the core model

GWR is not operated primarily as a manual outbound-sales program. Gmail outreach, additional manual sales sending, and reply-tracking are not the default growth loop.

## Revenue and trust boundaries

- Keep official job/source routing neutral and evidence-based.
- Preserve the official-apply boundary.
- Keep partner/affiliate monetization fail-closed until an approved, verified revenue URL exists.
- Do not count visits, searches, workflow runs, or CTA exposure as revenue.
- Revenue truth requires the relevant checkout, transaction, contract, reward, or payment evidence.
- Do not create a new offer merely because traffic is weak; first improve the existing visit -> utility/signal -> CTA path.

## Existing design base

PR #29, `Redesign GWR as a daily labor intelligence dashboard`, is the current visual/information-architecture base. Its Today-first hierarchy, compact market pulse, signal-first reading flow, research-style cards, secondary search utility, mobile quick dock, tracking, and existing revenue logic should be refined rather than discarded.

## Deployment / verification

GWR deployment and production QA remain in the existing branch workflows. Preserve working CI, Cloudflare deployment, source snapshots, analytics, and fail-closed revenue verification unless evidence shows a concrete defect.
