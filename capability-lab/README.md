# AI Capability Acquisition Lab

External capability signals are continuously pulled into a controlled evaluation loop. The goal is not to collect repositories; it is to convert useful outside capability into measurable internal execution gains.

## Operating Philosophy — Revenue Loop as Code

GitHub研究所は、GitHubを単なるコード置き場やRepo収集場所として扱わない。

**GitHub is the Control Plane and Evidence Plane for a reproducible external revenue loop.**

Revenue TruthそのものはGitHub内の自己申告ではなく、外部市場の客観状態で確定する。

- Purchase / Payment → Stripe等の実決済状態
- Contract / Reward → 実契約・報酬状態
- Human Signal → Buyer Reply / Qualified Visit / CTA / Checkout等の外部反応
- Capability Gain → test / trace / benchmark / artifact / external side effect

### Core Loop

```text
External Market / Buyer / OSS / GitHub / Web / Distribution
  -> External Signal
  -> Normalize / Deduplicate / Correlate
  -> Revenue-aware Routing
  -> Bounded Execution
  -> External Verification
  -> Evidence
  -> Human Signal / Checkout / Contract / Purchase / Reward
  -> Reward / Failure Learning
  -> Research + Routing Priority Update
  -> next External Signal
  -> repeat
```

**Return Path is mandatory.**

`External Signal -> GitHub -> Action -> External` だけではAutomationであり、循環ではない。

必ず、

`External Result -> Evidence / Revenue Truth -> GitHub Learning -> Next Action`

まで戻す。

### Revenue Priority

研究・実装・配布の優先順位は、コード量やRepo人気ではなくRevenue Distanceで決める。

```text
Purchase / Contract / Reward
  > Checkout
  > Buyer Reply / Interview
  > CTA
  > Qualified Visit
  > High-value Opportunity
  > Buyer Acquisition
```

外部待ちになったRouteは `WAITING_EXTERNAL` としてそのRouteだけ停止し、MARKET全体は重複しない次のRevenue Routeへ進む。

### Deterministic First, Agent Judgment Second

明確なイベントはRuleで処理する。

- Purchase → Revenue verified
- Qualified Buyer Reply → Closing priority
- Capability test failure → HOLD / KILL / Failure Dataset
- License不明 → Production adoption禁止

曖昧な分類・比較・優先順位判断だけをAgentへ渡す。

Agent自身の「完了した」「成功した」はEvidenceではない。

### Reproducibility Contract

再現可能なRevenue Loopでは、可能な限り以下を持つ。

- `event_id` — 個別Event識別
- `source_event_id` — 外部サービス上の元Event
- `correlation_id` / `route_id` — Revenue Route全体を追跡
- `causation_id` — 何が次Eventを生んだか
- `action_id` — 実行Action識別
- `evidence_ref` — test / trace / artifact / external side effect
- `state_before` / `state_after` — 状態遷移
- `reward` — Revenue / Human Signal / Failureによる結果

Webhookや外部Eventは重複・遅延・順不同を前提とし、処理は可能な限りidempotentにする。

### Evidence Hierarchy

```text
CLAIM
  -> IMPLEMENTED
  -> EXECUTED
  -> VERIFIED
  -> EXTERNAL_SIGNAL
  -> CHECKOUT / CONTRACT / REWARD
  -> VERIFIED_REVENUE
```

下位状態を上位状態として扱わない。

コード上のCTA存在はCTA Evidenceではなく、Checkout境界到達はPurchase Evidenceではない。

### Separation of Responsibilities

GitHubにすべてを保存しない。

- **GitHub** — policies, workflows, code, tests, regressions, durable high-value evidence
- **Event Ledger / Database** — high-frequency event/state history
- **PostHog等** — human behavior / qualified interaction evidence
- **Stripe等** — payment / revenue truth
- **Publishing / Distribution** — external market exposure

High-frequency pageview/clickをGit commitへ直接積み上げず、重要なState Transitionと再現EvidenceをGitHubへ残す。

### Revenue Loop as Code

再利用可能なLoopは、会話や暗黙知ではなくversioned artifactとして残す。

```text
market/
  events/      # event schemas
  routes/      # revenue route definitions
  policies/    # routing / risk / reward rules
  evals/       # qualification / attribution / regression tests
  failures/    # reproducible failure cases
  evidence/    # durable verified evidence
  workflows/   # intake / execute / verify / learn
```

別環境でも、外部account / secrets / destinationを接続すれば同じRevenue Behaviorを再現できる状態を目指す。

### Build Rule

新商品・新ブランド・新LP・新ページ・新Toolは、最初の解決策にしない。

既存能力で処理できない**反復的な欠損**がEvidenceで確認された場合だけ追加する。

研究の成果は、Repo数ではなく次のいずれかで評価する。

- 既存ProjectのCapability Gain
- Execution成功率・速度・品質・コスト改善
- Failure再発防止
- Human Signal前進
- Checkout / Contract / Purchase / Rewardへの距離短縮
- 再利用可能Knowledgeへの変換

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

## Knowledge Revenue Routes

Verified Capability Lab evidence can flow downstream without turning the research cell into a publishing team.

### Agent Lab

`Capability -> Execution -> Evidence -> Reusable Pattern -> Agent Lab`

See `AGENT_LAB_SUPPLY.md` and `agent-lab-supply-queue.md`.

### Publishing Revenue Cell

`Capability -> Execution -> Evidence -> Reusable Pattern -> Publishing -> Market -> Revenue -> Research`

See:

- `PUBLISHING_SUPPLY.md` — bidirectional role and Evidence Gate
- `publishing-supply-queue.md` — verified material ready for Publishing research/editorial evaluation
- `publishing-demand-queue.md` — external-demand themes returned by Publishing for evidence search or real implementation tests

Publishing owns external demand validation, three-stage research, fact/license/legal/media-policy review, editorial packaging, distribution, and revenue feedback. GitHub研究所 owns implementation truth, failure/success evidence, and reusable-pattern extraction.

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
