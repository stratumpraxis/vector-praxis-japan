# AI Capability Acquisition Lab

External capability signals are continuously pulled into a controlled evaluation loop. The goal is not to collect repositories; it is to convert useful outside capability into measurable internal execution gains.

## Loop

```text
GitHub Search / GitGem / seeded primary repos
  -> primary GitHub metadata verification
  -> capability + activity + license + operability + velocity scoring
  -> PRIORITY_SANDBOX / SANDBOX_QUEUE / WATCH / KILL
  -> isolated proof-of-work test
  -> KEEP / KILL
  -> minimal connection to MARKET / GWR / Forwelle / Distribution
  -> production trace / failure evidence / regression
  -> next external scan
```

## What is automated

- Daily external discovery from GitHub Search.
- Best-effort GitGem trending extraction, with every extracted name re-verified against GitHub before use.
- Re-check of strategic seed repositories such as pstack, translate-book, X Algorithm, HyperFrames, OpenCLI, browser-use, Open Notebook, Stirling PDF, Spec Kit, Firecrawl, and CUDA Agent.
- Metadata normalization.
- Star-delta velocity against the previous snapshot.
- Deterministic preflight scoring.
- Routing toward MARKET Engineering, GWR, Forwelle, Distribution, or the general Lab.
- Sandbox test proposal and KEEP/KILL gate generation.
- Daily JSON evidence committed to Git, so important evidence is not dependent on GitHub Actions log/artifact retention.

## What is deliberately NOT automated

Third-party code is **never auto-installed into production** from a discovery signal. A high score only moves a candidate into an isolated sandbox queue.

Before KEEP:

1. Verify the repository's current primary-source license and commercial terms.
2. Review install scripts, dependencies, network access, credential requirements, and obvious supply-chain risk.
3. Run the minimum isolated test written in `queue.md`.
4. Require reproducible proof-of-work: tests, artifact hash, deterministic output, measurable runtime/cost/quality gain, or another machine-checkable result.
5. Compare against the existing stack. Redundant capability is killed even when the repository is popular.
6. Connect only the smallest useful capability to an existing project.

## Scoring

The deterministic preflight score uses:

- capability gain signals
- recent upstream activity
- license preflight
- agent/Codex/CLI/API operability
- adoption
- star velocity since the previous scan
- project fit
- testability
- penalties for archive/staleness/unknown license/fork status

This is a **triage score**, not a final security or legal approval.

## Evidence

Generated files:

- `capability-lab/evidence/latest.json` — most recent normalized scan
- `capability-lab/evidence/YYYY-MM-DD.json` — durable daily snapshot
- `capability-lab/queue.md` — human/agent-readable sandbox queue

The daily snapshot in repository history acts as the durable Evidence Ledger for discovery decisions. Production adoption should add its own test/deployment/revenue evidence in the owning project.

## Commands

```bash
npm run capability:test
npm run capability:scan
```

The scheduled GitHub Actions workflow runs at approximately 08:10 JST each day and can also be triggered manually.

## Kill rules

Kill or ignore a candidate when any of these is true:

- no measurable capability gain over the current stack
- license or terms do not fit the intended use
- archived or materially stale upstream
- unsafe credential/network/host access for the expected benefit
- no reproducible proof-of-work
- excessive operational complexity relative to the gain
- a simpler existing capability already solves the same problem
