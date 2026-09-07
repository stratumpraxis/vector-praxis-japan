# MARKET Free External Nervous System

GitHub研究所はGitHub内部のRepo研究だけを担当しない。MARKETが外部世界を安全・低固定費・低Owner負担で観測し、必要な時だけ作用し、外部結果とเงินจริงをEvidenceとして戻すための標準External Capabilityを研究・管理する。

## North Star

```text
External World
  -> Eyes / Ears / Public Signals
  -> Signal Fusion
  -> GitHub Control + Evidence
  -> Revenue Router
  -> Existing MARKET Cell
  -> Bounded External Action
  -> Human
  -> CTA / Checkout / Contract
  -> Real Revenue
  -> Return Evidence
  -> GitHub
  -> Weight / Learn / Route
  -> Next Action
  ↺
```

KPIは接続数、API数、取得件数、Agent数、投稿数ではない。

```text
External Signal
-> Qualified Opportunity
-> External Action
-> Human Signal
-> Checkout / Contract
-> Purchase / Reward
-> Verified Revenue
-> Repeat
```

## Capability lifecycle

Every external capability must have exactly one lifecycle state:

```text
AVAILABLE
-> CONNECTED
-> VERIFIED
-> ON_DEMAND
-> ACTIVE
-> PAUSED / RETIRED
```

Definitions:

- `AVAILABLE`: plausible candidate; no connection claim.
- `CONNECTED`: credentials/webhook/API wiring exists, but real external proof may still be absent.
- `VERIFIED`: a bounded real request/event proved the connection works.
- `ON_DEMAND`: verified and kept ready, but not continuously polling.
- `ACTIVE`: currently used by a live Revenue Route or scheduled observation.
- `PAUSED`: intentionally disabled while retaining configuration/evidence.
- `RETIRED`: no longer counted as MARKET capability.

Never conflate available, connected, verified, active, or revenue-effective.

## Six external capability classes

### A — EYES

World observation: Search, public web, RSS/Atom, public API, GitHub events, datasets, trends, jobs, bounties, marketplaces, communities, OSS activity, company public information.

### B — EARS

Human demand: Buyer replies, community pain, comments, support/discussion, qualified visits, applications/interviews, CTA and other human signals.

### C — BRAIN_INPUT

Signal integration: normalize, deduplicate, entity resolution, time-series comparison, cross-source correlation, demand/buyer/pain classification, revenue scoring, existing-asset matching.

### D — MOUTH_HANDS

Bounded external action: publish, deploy, submit, apply, bid, claim, contact, reply, distribute, route CTA, submit deliverables. Every action must pass policy, permission and safety gates.

### E — NERVES

Return path: webhook, repository_dispatch, API return, PostHog/analytics state, buyer reply, contract state, external side-effect evidence.

### F — WALLET

Revenue truth: Stripe, commerce provider, commission/reward state, paid-contract evidence. Money truth must come from the system that actually manages the transaction.

## Event Graph contract

Prefer event relationships over bulk page storage. Important records should be correlatable across surfaces.

Recommended fields:

```text
event_id
source
source_event_id
timestamp
entity_id
buyer_id
route_id
correlation_id
causation_id
action_id
evidence_ref
state_before
state_after
confidence
reward
```

Confirmed fact, inference and hypothesis must remain separate.

## Revenue Distance

Priority is always:

```text
Purchase / Contract / Reward
> Checkout
> Buyer Reply / Interview
> CTA
> Qualified Visit
> High-value Opportunity
> Buyer Acquisition
> Weak Signal
> Noise
```

Signal popularity does not outrank proximity toเงินจริง.

## Existing-asset first

Before creating anything new:

```text
External Demand
× Existing Asset
× Buyer Fit
× Revenue Distance
× AI Completion Ability
```

Search existing MARKET assets first. New product, brand, LP, site, dashboard, agent or tool requires repeated Evidence that the existing stack cannot close the gap.

## Deterministic first

Use deterministic code for IDs, deduplication, expiry, rate limits, thresholds, known policy, state transitions, payment verification and Revenue Truth.

Use agent judgment only for ambiguous tasks such as pain interpretation, cross-signal interpretation, opportunity ranking, asset matching and failure analysis.

Agent self-report is never Evidence.

## Safety as capability quality

Do not promote capabilities that require unauthorized scraping, robots/terms violations, access-control or CAPTCHA bypass, rate-limit evasion, spam, bulk unsolicited outreach, credential commits, unnecessary personal-data collection, prohibited auto-posting, high-ban-risk behavior or fabricated Revenue Evidence.

Long-term safety is part of Revenue capability, not an external constraint.

## Free does not mean active

Free or free-tier capability is evaluated as an option, not automatically run. Avoid useless polling, duplicate observation, mass collection, mass posting and duplicate outreach.

Prefer event-driven activation and ON_DEMAND state when possible.

## 100-point capability score

Each external capability is scored on ten 0–10 dimensions:

1. External Reach
2. Signal Quality
3. Revenue Distance
4. Automation
5. Owner Burden (10 = low burden)
6. Free Sustainability
7. Safety / Policy
8. Reliability
9. Return Path
10. Existing MARKET Synergy

Score is triage, not proof. Evidence state overrides numerical score.

## Overlap policy

Classify relation to the existing stack as:

```text
NEW_SENSOR
COMPLEMENT
IMPORTANT_FALLBACK
PARTIAL_OVERLAP
FULL_DUPLICATE
```

Promotion priority follows that order. Ten interchangeable services are less valuable than one genuinely new external sense.

## Connection decay

No external capability is permanent. Revalidate API health, auth, free tier, terms, commercial conditions, webhook behavior, rate limits, schema and real side effects.

A dead connection is not counted as MARKET capability.

## Signal-source learning

Track which source / signal combination / buyer / pain / route progresses to:

```text
Qualified Visit
Reply
Checkout
Contract
Purchase
Reward
```

Increase weight only from external outcomes. Reduce frequency or weight for sources that generate noise without downstream progress.

## Winner amplification

After the first Purchase / Contract / Reward on a route, temporarily prioritize repeatability over adding new connections.

Extract:

```text
Source
Signal
Buyer
Pain
Asset
Action
CTA
Transaction
```

Then search for similar external signals and replay the same bounded route. Purchase is success Evidence; repeatability is the Revenue Engine.

## Handoff rule

The research lab does not duplicate sales, publishing, video, B2B or other MARKET cells.

High-value route:

```text
Signal
-> Normalize
-> Correlate
-> Score
-> Existing Asset Match
-> Safety / Policy Gate
-> Appropriate MARKET Cell
-> Bounded External Action
-> External Result
-> Evidence Return
```

Handoffs should be machine-readable where practical. Owner is not the message bus.

## Human gates

Human involvement is reserved for legal consent, KYC, CAPTCHA, irreversible high-risk action, real-money payment, terms-required human operation, or a decision whose substance must be human.

Only the affected route waits. MARKET continues on the next non-duplicate Revenue Route.

## Operating principle

```text
FREE DOES NOT MEAN RUN EVERYTHING.

FREE MEANS MARKET CAN HAVE MORE SAFE OPTIONS
WITHOUT RAISING FIXED COST.

CONNECT BROADLY.
ACT SELECTIVELY.
VERIFY EXTERNALLY.
LEARN FROM MONEY.
REPEAT WHAT WORKS.
```
