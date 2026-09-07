# Free External Nervous System — Weakness Prevention Addendum

This addendum preserves the existing `EXTERNAL_NERVOUS_SYSTEM.md` contract and prevents external-capability growth from degenerating into API collection, over-monitoring, GitHub bloat, signal flood, owner burden, policy risk, or revenue-disconnected automation.

## 1. Expansion gate

No newly discovered external capability is promoted immediately. Compare it against the existing stack first and classify it as:

```text
NEW_SENSOR
IMPORTANT_FALLBACK
COMPLEMENT
PARTIAL_OVERLAP
FULL_DUPLICATE
```

Promotion order follows that sequence. `FULL_DUPLICATE` is normally rejected. Free cost alone is never a reason to promote.

## 2. Capability budget

Every capability has non-financial operating cost. Before promotion, account for:

- authentication maintenance
- schema change handling
- rate-limit management
- outage handling
- policy/terms review
- secrets management
- noise filtering and deduplication
- GitHub Actions consumption
- log/storage growth
- owner intervention burden

Promotion requires expected revenue utility to exceed expected maintenance burden. If not, remain `AVAILABLE`.

## 3. Strict state truth

Only `VERIFIED`, `ON_DEMAND`, `ACTIVE`, or a deliberately `PAUSED` previously verified capability counts as a usable MARKET capability.

`AVAILABLE` is a known option, not a capability claim. `CONNECTED` proves wiring/credentials only, not real read/write/webhook behavior.

## 4. Signal flood prevention

Do not optimize for signal count. Merge signals that refer to the same entity, buyer, pain or route where practical.

A signal matters only if it changes at least one of:

- Revenue Distance
- confidence
- identified buyer
- route priority
- existing-asset match

No meaningful change means `NOISE`.

## 5. Correlation discipline

Never promote correlation to causation. Keep:

```text
CONFIRMED_FACT
INFERENCE
HYPOTHESIS
```

separate in stored reasoning/evidence.

Search growth + GitHub activity + job growth may raise commercial-demand confidence. It does not prove purchase intent. Purchase intent requires buyer behavior, checkout, contract or payment evidence.

## 6. Narrow agent judgment

Deterministic code owns IDs, dedupe, timestamps, expiry, thresholds, rate limits, known policy, revenue truth, checkout/payment state, capability state and retry count.

Agents may interpret pain, rank opportunities, interpret cross-signals, match assets and analyze failures.

Agent self-report is never success Evidence.

## 7. Polling hierarchy

Prefer:

```text
Webhook
> Event Trigger
> RSS / Feed
> Conditional Schedule
> Low-frequency Polling
> High-frequency Polling
```

Polling frequency must match expected signal-change speed. High-frequency polling is a last resort.

## 8. Owner is not the fallback worker

Connection failure does not automatically become owner copy/paste/relogin work. First search existing API, webhook, RSS, public source, connector, shared state or scheduled trigger alternatives.

Human gates remain limited to KYC, CAPTCHA, legal consent, identity verification, irreversible high-risk action, real-money operation, terms-required human action, or genuinely human judgment.

## 9. External action safety gate

`MOUTH_HANDS` capabilities require stricter preflight than observation-only capabilities. Before publish/contact/bid/claim/apply/reply/distribute:

- terms and authorization
- account role
- brand and audience
- rate limits
- duplicate-contact history
- previous buyer contact
- ban risk
- reversibility

No bulk unsolicited DM/email/comments/applications or repeated contact to the same buyer.

## 10. Brand/account routing

Before external action resolve:

```text
Content / Asset
-> Audience
-> Brand
-> Publishing Account
-> Destination
-> Revenue Destination
-> Measurement
```

Producer identity is not automatically publisher identity. GitHub repository ownership is not brand ownership. Existing MARKET brand/account mapping remains the higher-priority source of truth.

## 11. Free dependency risk

Free capability is never assumed permanently free or stable. Track:

- free-tier change risk
- API shutdown risk
- terms change risk
- vendor lock-in
- authentication risk
- rate-limit risk
- schema-change risk

Critical routes may hold one primary and one meaningful fallback. Do not build fallback collections.

## 12. Connection decay

Revalidate authentication, API response, webhook, write action, free tier, rate limit, commercial use, policy, schema and return path.

A broken connection is demoted to `PAUSED` or `RETIRED`; stale historical setup does not count as current capability.

## 13. GitHub storage boundary

GitHub is not a data lake. Do not persist bulk raw web pages, raw HTML, scrape dumps, giant logs or duplicate high-frequency events.

Prefer normalized event/state, evidence references, route decisions, failure patterns and reusable knowledge. Raw data retention requires explicit need, legal/policy fit, capacity and privacy justification.

## 14. PII minimization

Collect only the minimum information required for a Revenue Route. Avoid building unnecessary person databases, private-contact collections, sensitive-attribute stores or bulk personal-phone/email archives. Distinguish business buyer entities from private individuals.

## 15. Existing capability first

Before new agent/workflow/service introduction, check in order:

1. existing connector
2. existing plugin
3. existing API
4. existing GitHub Action
5. existing RSS / webhook
6. existing MARKET cell
7. existing MARKET assets
8. existing shared state

Only repeated unresolved gaps become capability gaps.

## 16. Research cannot preempt revenue

When a high-value Revenue Route exists, Buyer Reply / Checkout / Contract / Purchase / Reward outranks API/repo/tool research. Research exists to strengthen Revenue execution, not consume it.

## 17. Winner stop rule

After Purchase / Paid Contract / Reward, temporarily reduce new-capability exploration. First extract:

```text
Source
Signal
Buyer
Pain
Asset
Action
CTA
Transaction
Revenue
```

Then search for analogous signals using existing capabilities and repeat the winning route.

## 18. Failure is not an automatic expansion trigger

One failure does not justify a new API/agent/service/workflow. First classify failure as:

```text
Signal Quality
Buyer Fit
Asset Fit
Action Quality
Timing
Channel
Tracking
External Gate
Technical Failure
```

Only repeated failure that existing capability cannot resolve is a capability gap.

## 19. Capability Score != Revenue Evidence

Keep two independent scores:

- `capability_score` — structural usefulness/operability, 0–100
- `revenue_evidence_score` — external revenue proof, 0–100

A 95/100 capability with 20/100 revenue evidence is "strong-looking, revenue-unproven". Usage weight follows actual downstream outcomes, not structural score alone.

## 20. Exploration stop conditions

Pause new external-capability exploration when any condition is true:

- current Revenue Route has the necessary senses/actions/return path
- TOP1 Revenue Route is externally executable
- waiting on Human Signal
- checkout/contract boundary reached
- two same-class meaningful capabilities already exist
- another addition does not shorten Revenue Distance
- maintenance burden exceeds expected utility
- a winner route requires amplification instead

"More things can be discovered" is not justification to continue.

## Final principle

```text
CONNECT BROADLY.
ACT NARROWLY.
STORE MINIMALLY.
VERIFY EXTERNALLY.
TRUST MONEY MOST.
AMPLIFY WINNERS.
RETIRE NOISE.
```
