# Vector Praxis Revenue Execution — 2026-09-04 Social Revenue Check

## Objective

Measure the live revenue path after social distribution and identify the single highest-probability bottleneck.

Revenue hierarchy remains:

`Purchase > Checkout > Primary CTA > qualified traffic > distribution`

## Distribution evidence

The social publishing loop reached public distribution for the current Completion Layer campaign.

Verified public posts include:

- Instagram Reel: https://www.instagram.com/reel/Dc2JmKZEX1L/
- TikTok: https://www.tiktok.com/@vectorpraxismd/video/7681478999175957781
- Bluesky publishing was also closed in the social distribution cycle and must remain tracked separately from revenue conversion.

The Instagram and TikTok campaign copy routes users to the existing note article:

`https://note.com/deft_eel6718/n/na99d74adf2b3`

The published captions contain channel-specific UTM parameters, but their immediate destination is **note**, not the Vector Hub / Stratum paid-offer landing page.

Therefore a social impression or click on those posts does not automatically enter the Vector PostHog funnel.

## PostHog revenue truth

### Last 6 hours

Queried events:

- `traffic_session_start`
- `primary_cta_click`
- `checkout_click`

Observed values at measurement time:

- traffic sessions: **0**
- primary CTA clicks: **0**
- checkout clicks: **0**

### Last 24 hours attribution

Traffic breakdown by `utm_source`, `$referring_domain`, and `$virt_traffic_type` showed:

- `instagram` traffic observed only as **Automation**
- `vector_praxis` traffic observed only as **Automation**
- `forwelle` traffic observed only as **Automation**
- regular traffic was direct / unattributed or QA
- no SNS-source Regular traffic was observed entering `traffic_session_start`

CTA / checkout breakdown showed:

- one `primary_cta_click` on `route_id=vpj_hub_cross_agent_v1` classified as Regular but without an SNS UTM source; this is not attributable to the newly published social posts and is consistent with the earlier runtime validation flow
- Vector and Forwelle checkout events observed in the window were Automation
- no SNS-attributed Regular checkout was observed

QA / automation traffic must not be counted as customer demand.

## Stripe revenue truth

Stripe checked in **live mode** on account `acct_1U0vFWJMK7zFs997`.

Completed Checkout Sessions query returned:

- `status=complete`: **0 sessions**

Therefore:

- verified Purchase: **0**
- verified live Checkout completion: **0**

The most recent Vector-specific $69 Checkout Session found was:

- `client_reference_id=vpj_hub_cross_agent_v1`
- amount: `$69`
- created: 2026-09-03 13:51 JST
- status: `open`
- payment status: `unpaid`

It predates the 2026-09-04 Instagram/TikTok publication window and must not be attributed to the new social distribution.

## Metricool early analytics

Immediately after publication, Instagram/TikTok post analytics were queried for reach, views, and interactions.

Metricool returned:

`rows: []`

This is treated as analytics-sync-not-yet-available, not as proof of zero reach.

## Bottleneck decision

Current highest-confidence bottleneck:

**SOCIAL DISTRIBUTION → MEASURABLE REVENUE ENTRY**

The publishing layer is working, but the current Instagram/TikTok campaign sends users first to note, while the Vector revenue measurement and $69 checkout path live downstream elsewhere.

This creates a measurement / conversion gap:

`SNS → note → ? → Vector / Stratum → $69 → Stripe`

instead of the desired measurable path:

`SNS → tracked revenue entry → Primary CTA → $69 → Stripe`

The next action should not be a new product or another unmeasured article.

## Immediate repair attempt

A direct Bluesky revenue follow-up was prepared for the existing Cross-Agent Operating Kit with UTM and route attribution.

Metricool rejected the draft because the text plus tracked URL exceeded Bluesky's 300-character limit:

`BLUESKY:LENGTH_EXCEEDED`

No failed post is counted as distribution and no duplicate retry was made.

## Next execution rule

The next social revenue probe must use a short, trackable direct route and preserve:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `asset_id=cross_agent_operating_kit`
- a channel-specific `route_id`

Success condition for the next probe:

`Regular traffic_session_start → primary_cta_click → checkout_click → Stripe complete`

Until real customer traffic appears, optimize **distribution / measurable entry**, not product inventory.
