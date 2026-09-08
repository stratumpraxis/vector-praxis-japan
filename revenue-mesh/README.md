# Revenue Mesh

A low-noise, GitHub-centered radar for paid external work.

The owner is not the operator. The system is designed to keep scanning while the repository remains the visible control surface.

## Objective

Market -> paid task -> qualification -> buildable candidate -> submission -> acceptance -> payment evidence -> next task.

The current production stage automates the first half of that loop:

1. Scan public paid-task surfaces continuously.
2. Reject unsafe, ambiguous, low-value, stale, or over-contested work.
3. Estimate effort, win probability, and expected JPY/hour.
4. Surface only actionable candidates.
5. Keep one GitHub Radar issue current instead of creating repeated zero-value reports.

## Sources

- GitHub open issues carrying bounty/reward signals.
- Algora bounty signals discoverable through GitHub issue comments.
- IssueHunt public funded-issue feed.
- Superteam Earn Agent API when `SUPERTEAM_AGENT_KEY` is available as a repository secret.

Superteam is intentionally credential-gated. The API key must never be committed to the repository.

## Qualification policy

Default gate:

- explicit reward >= $25
- expected value >= ¥5,000/hour
- <= 25 issue comments
- <= 365 days old when age is known
- no security/vulnerability/exploit work
- no unclear-payment work

Expected value is a ranking heuristic, not a promise of earnings:

`reward_usd * usd_jpy * estimated_win_probability / estimated_hours`

## Noise policy

- The scheduled scan does not commit scan results.
- No new issue is created when there is no actionable work.
- One `Revenue Mesh Radar` issue is created/updated only when actionable candidates exist and the candidate set changes.
- Workflow runs are concurrency-cancelled so old scans do not pile up.

## Safety boundary

External submission is disabled by default. A listing may be discovered and ranked automatically, but it is not submitted until the corresponding platform has an authenticated agent path and the work product can be validated against explicit acceptance criteria.

Security research, vulnerability exploitation, credential collection, deceptive engagement, fake reviews, and unclear reward schemes are excluded.

## Files

- `config.json` — economic and safety gates.
- `scan.mjs` — source ingestion, normalization, scoring, and report generation.
- `.github/workflows/revenue-mesh-radar.yml` — hourly 24/7 runner with low-noise issue updates.

## State machine

`DISCOVERED -> QUALIFIED -> BUILDABLE -> SUBMISSION_READY -> SUBMITTED -> ACCEPTED -> PAID`

Only evidence may advance an item to the next state. A PR, submission URL, acceptance message, or payment record is required where applicable.
