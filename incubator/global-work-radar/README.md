# Global Work Radar

Independent MVP incubator for a global-work intelligence service focused on Japan-based users.

## Objective

Continuously discover public job opportunities, normalize them into comparable structured data, surface Japan-eligible and Japanese-language opportunities, and route users to the original official source.

## Product boundary

Global Work Radar is an information/search layer, not a staffing, dispatch, recruitment-agency, payroll, application-management, or candidate-matching service.

Initial MVP intentionally excludes:

- employer job-posting accounts
- candidate profiles or resume storage
- DMs or employer/candidate messaging
- application submission on behalf of users
- salary/payroll handling
- hiring decisions or candidate recommendations to employers
- copied full job descriptions where avoidable

## MVP loop

Public/approved source
→ ingest
→ normalize
→ deduplicate
→ source-policy check
→ Japan eligibility classification
→ language / compensation / remote classification
→ publish searchable record
→ official-source outbound link
→ expiry/revalidation

## Core fields

- source_name
- source_url
- official_url
- employer
- title
- location
- remote_type
- japan_eligible
- japanese_required
- english_level
- employment_type
- compensation_min
- compensation_max
- compensation_currency
- compensation_period
- category
- first_seen_at
- last_verified_at
- expires_at
- source_status

## Evidence-backed work-structure fields

When an official source explicitly states them, GWR should also preserve work-density and time-constraint facts that ordinary job search often misses:

- actual workload / call or task volume
- standby pay / availability fee
- paid idle or waiting time
- other work permitted
- non-exclusive status
- simultaneous work allowed during standby
- response SLA / required response time
- current application status

These fields are evidence-first. Do not infer low workload, paid standby, or simultaneous-work permission merely from `remote`, `contractor`, `flexible`, `part-time`, `on-call`, or `non-exclusive` wording.

Detailed rules: [`WORK_STRUCTURE_CLASSIFICATION.md`](WORK_STRUCTURE_CLASSIFICATION.md)

Potential future derived intelligence, only after enough verified evidence exists:

- Work Density = active workload per paid availability period
- Constraint Level = how much paid time is actually restricted
- Standby Value = whether waiting/availability itself is compensated

Raw facts come first; do not publish speculative scores.

## Initial categories

- AI Trainer / Evaluator
- Data Annotation
- Localization
- Translation
- Customer Support
- Search / Ads Evaluation
- Remote Contractor

## Safety / source rules

1. Prefer official employer pages, public APIs, RSS/feeds, and sources that explicitly permit indexing or reuse.
2. Store structured facts and short source-derived metadata rather than reproducing full copyrighted listings.
3. Keep the official source URL visible and route applications externally.
4. Fail closed when source permission, listing authenticity, or eligibility is unclear.
5. Never infer that Global Work Radar is the employer or recruiter.
6. Work-density, standby-pay, exclusivity, simultaneous-work, and SLA fields require explicit source evidence; unknown is better than guessed.

## Success criteria for MVP

- scheduled ingestion works
- duplicate jobs collapse to one canonical record
- expired/dead listings are removed or marked inactive
- filters work for Japan eligibility, Japanese requirement, remote status, category, and compensation
- every public job record has an original source link and verification timestamp

## Distribution

The service remains independent. Existing Vector Praxis assets may provide contextual inbound links; no shared candidate database, application workflow, or employer account system is planned.
