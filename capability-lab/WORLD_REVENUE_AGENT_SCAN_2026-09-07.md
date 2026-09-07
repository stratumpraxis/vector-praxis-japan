# World Revenue Agent Scan — 2026-09-07

Purpose: identify the strongest current GitHub capabilities for a 24h MARKET revenue agent. This is **architecture research**, not a claim that any external repository has already passed MARKET production gates.

## Truth rule

No repository becomes `KEEP` because of stars, demos, README claims, or agent self-report. The fit scores below are research-priority estimates only. Every candidate must pass license/security review, isolated proof-of-work, the relevant tasks in `revenue-agent-benchmark.json`, and regression protection before production connection.

## Core finding

The strongest design is **not one giant autonomous agent**. It is a layered Revenue Agent OS with deterministic state and evidence at the center, specialist agents at the edges, and external Revenue Truth outside the model.

```text
External Market / Buyer / Stripe / PostHog / GitHub / Web
        ↓
Event Intake + Durable Ledger
        ↓
Revenue State Machine / Hard-rule Router
        ↓
Ambiguous-only Agent Judgment
        ↓
Specialist Execution
  ├─ Browser
  ├─ Authenticated Tools
  ├─ Coding / Repair
  ├─ Research
  └─ Publishing / Distribution
        ↓
Independent External Verification
        ↓
Human Signal / Checkout / Purchase / Reward
        ↓
Revenue Truth + Evidence
        ↓
Failure Dataset / Regression / Policy Update
        ↓
Next External Action
        ↺
```

GitHub remains the **Control Plane + Evidence Plane**. Stripe/payment providers remain Revenue Truth. PostHog or equivalent remains human-behavior evidence. A database/event ledger owns high-frequency state. Agents never define their own success.

## Research-priority candidates

The `Revenue Agent Fit` numbers are MARKET architecture estimates before sandbox benchmarking.

| Candidate | Primary role | Fit /100 | Research decision | Why it matters / main caution |
|---|---|---:|---|---|
| `pydantic/pydantic-ai` | typed agent core + eval + durable execution | 97 | PRIORITY_SANDBOX | Strong typed boundaries; first-party durable integrations including Temporal/DBOS/Prefect/Restate; HITL. Python-first. |
| `lastmile-ai/mcp-agent` | MCP-native orchestration + durable workflows | 97 | PRIORITY_SANDBOX | MCP-native; router/orchestrator/evaluator-optimizer patterns; Temporal backend can pause/resume/retry without rewriting workflow. |
| `browserbase/stagehand` | deterministic + agentic browser execution | 97 | PRIORITY_SANDBOX | Mix Playwright code with AI Act/Extract/Observe/Agent; repeatability is better suited to revenue operations than free-form browsing. Cloud-browser dependency optional but must be evaluated. |
| `ComposioHQ/composio` | authenticated external tool/action layer | 96 | PRIORITY_SANDBOX | 1000+ toolkits, auth, triggers, sessions, sandbox, MCP/adapters. Large capability gain; credential/data/security boundary requires strict review. |
| `triggerdotdev/trigger.dev` | durable TS background runtime | 96 | PRIORITY_SANDBOX | Long-running tasks, retries, queues, idempotency, wait/HITL, tracing. Attractive for TS execution without immediately operating Temporal infrastructure. |
| `langchain-ai/langgraph` | explicit state graph / checkpointing | 95 | PRIORITY_SANDBOX | Strong checkpoint/thread model, fault tolerance, HITL, time travel. Good control-state primitive; framework complexity must be justified against simpler state machine. |
| `browser-use/browser-use` | high-autonomy browser fallback | 95 | SANDBOX_QUEUE | Strong general browser agent. Use only after deterministic browser path fails; autonomous browser must not own payment or irreversible policy. |
| `vercel-labs/agent-browser` | low-overhead browser CLI | 94 | SANDBOX_QUEUE | Agent-friendly CLI and bounded browser surface. Strong deterministic specialist, not an orchestration core. |
| `temporalio/temporal` | maximum durable execution | 94 capability / 82 current fit | WATCH_UNTIL_NEEDED | Mature durable workflow engine. Very strong when multi-day waits/retries become real; current ops burden may exceed MARKET need while Make/GitHub remain sufficient. |
| `e2b-dev/E2B` | isolated code/computer sandbox | 94 | PRIORITY_SANDBOX | Secure isolated cloud sandboxes/microVM model; good for untrusted code and coding workers. External service cost/data boundaries need measurement. |
| `langfuse/langfuse` | agent traces + eval datasets | 93 | SANDBOX_QUEUE | Rich tracing, evaluations, datasets and experimentation. Add only if current GitHub evidence + PostHog cannot diagnose agent trajectories. |
| `comet-ml/opik` | permissive observability/evals alternative | 93 | SANDBOX_QUEUE | Strong observability/eval candidate. Compare actual setup/cost/privacy burden with Langfuse before KEEP. |
| `anomalyco/opencode` | coding/repair worker | 92 | SANDBOX_QUEUE | Strong open coding agent with build/plan permissions and subagent. Worker only; never Revenue Truth or route owner. |
| `mem0ai/mem0` | persistent agent memory | 90 | WATCH | Useful personalized/persistent memory layer. Verified event/revenue ledger must remain authoritative; memory cannot rewrite facts. |
| `getzep/graphiti` | temporal knowledge graph | 89 | WATCH | Valuable if evolving buyer/company/market relationships require temporal graph queries. Too heavy until that repeated need is proven. |
| `crewAIInc/crewAI` | role-based multi-agent | 82 | PATTERN_ONLY | Useful role/crew patterns but free-form multi-agent coordination can increase complexity and weakens deterministic revenue ownership. |
| `Significant-Gravitas/AutoGPT` | continuous-agent platform reference | 81 | PATTERN_ONLY | Useful reference for triggers/continuous agents; platform overlap and licensing/product complexity make embedding unattractive. |
| `agent0ai/agent-zero` | autonomous/subordinate-agent patterns | 78 | WATCH | Interesting scheduler/orchestrator patterns; reliability must be proven under background/async/state stress before any serious route. |

## The target composite — MARKET Revenue Agent OS

### 1. Control and state

Do not let a conversational agent decide the whole business. The owner of state is a deterministic Revenue State Machine using stable `event_id`, `route_id`, `correlation_id`, `causation_id`, and `action_id`. Candidate implementations to compare are a minimal in-house state machine, LangGraph, and Pydantic AI's typed agent/capability layer.

### 2. Durable execution

Use existing Make/GitHub event execution while it is reliable. Benchmark Trigger.dev as the first low-ops durable TS candidate. Promote Temporal only when production evidence shows multi-day waits, restart recovery, fan-out, or idempotent retries are repeatedly failing with the existing runtime. Pydantic AI or mcp-agent can sit on Temporal later without changing the revenue truth model.

### 3. External action

Use native connected tools first. Benchmark Composio only for repeated missing auth/tool integrations. MCP is the preferred portable tool contract; mcp-agent is the leading orchestration candidate for this layer. Every authenticated action gets an `action_id`, least-privilege credentials, and independent verification.

### 4. Browser execution

Revenue browser policy is deterministic-first:

`HTTP/API/official connector -> Playwright/Stagehand deterministic action -> agentic Stagehand/browser-use fallback -> STOP/HUMAN GATE for irreversible or account-risk actions`.

The browser agent cannot declare success from its own text output. Verify the resulting page/account state independently.

### 5. Coding and self-repair

OpenCode/Codex/OpenHands-class coding agents are workers behind sandbox boundaries. They can patch, test, benchmark, and open PRs. They do not choose prices, fabricate buyer signals, create payments, or mark their own changes production-ready. Production failure traces must become regression tests.

### 6. Memory

The event ledger and revenue ledger are facts. Optional memory systems such as Mem0 enrich context only. Graphiti becomes relevant only if MARKET proves that temporal relationship graphs materially improve route selection. Never promote a memory-generated assertion to Evidence without source verification.

### 7. Observability

Keep Run -> Trace -> Thread. GitHub retains durable engineering evidence; PostHog retains human interaction; Stripe retains payment truth. Add Langfuse/Opik only when agent-level traces/evals create measurable diagnosis or regression gain.

### 8. Revenue verification

`VERIFIED_HUMAN_PURCHASE` is deliberately a compound gate, not a single Stripe status:

```text
Payment Truth
  × Route Attribution
  × Non-test / non-owner provenance
  × Human-likelihood evidence
  × Durable post-purchase state
```

A test payment, owner purchase, crawler-created checkout, link preview, synthetic browser run, or agent-created payment never counts. The live-only benchmark in `revenue-agent-benchmark.json` encodes this rule.

## Revenue reward hierarchy

The routing policy must optimize for external economic evidence, not activity volume:

`Verified Purchase/Reward > Contract > Verified Human Checkout > Qualified Buyer Reply > Concrete CTA > Qualified Visit > generic engagement`.

Views, stars, followers, generated emails, and internal task counts can inform diagnostics but must never overpower deeper revenue evidence.

## Hard architecture rules

1. **Deterministic first, agent judgment second.** Clear routing/payment/safety rules are code, not prompts.
2. **One route owner.** Multi-agent teams may execute subtasks, but one state machine owns each Revenue Route.
3. **No self-certified completion.** State changes require external readback, tests, artifacts, or payment truth.
4. **At-least-once safe.** Every external event/action must be deduplicated and idempotent where possible.
5. **WAITING_EXTERNAL is local.** One waiting route freezes; MARKET proceeds to the highest-value non-overlapping route.
6. **Reversible autonomy, irreversible gates.** Low-risk reversible tasks can run automatically; sensitive/high-risk/irreversible effects stop at policy or human gate.
7. **Capability gain must beat complexity debt.** A famous framework that duplicates Make/GitHub/native connectors is KILL until a repeated failure proves the gap.
8. **Revenue outcome updates research priority.** A capability that improves real human conversion, time-to-action, reliability, or verified revenue gains future priority; one that adds complexity without external gain is demoted.

## First sandbox sequence

Do not test all candidates at once. The highest information-gain sequence is:

1. **Stagehand** — browser deterministic-vs-agentic proof-of-work on one disposable web task.
2. **mcp-agent** — MCP tool routing + evaluator/optimizer + pause/resume proof.
3. **Pydantic AI** — typed output/tool validation + durable restart proof + eval.
4. **Trigger.dev** — idempotent long-running wait/retry/recovery proof.
5. **Composio** — one non-sensitive authenticated sandbox action, compared against existing native connector effort.
6. **E2B** — isolated coding worker with network/credential boundary and resumable artifact.
7. **LangGraph** — only if explicit graph/checkpoint behavior materially beats the simpler control core.
8. **Langfuse vs Opik** — only after trace volume proves current GitHub/PostHog evidence insufficient.

Each candidate is scored against `revenue-agent-benchmark.json`. A production core candidate needs >=90 on relevant sandbox tasks plus regression protection. No framework can receive the 16 live purchase points until a genuine third-party purchase occurs.

## Current conclusion

The strongest present architecture hypothesis is **a deterministic MARKET control plane with Pydantic AI or a minimal state core, mcp-agent/MCP for portable tool orchestration, Stagehand for browser execution, Trigger.dev as the first durable-runtime candidate, Composio only for missing integrations, E2B for isolated workers, and GitHub/PostHog/Stripe as Evidence/Human/Revenue truth planes**.

This is intentionally modular. If a candidate fails a benchmark, replace only that layer. The goal is not to own the most frameworks; it is to produce the shortest reliable loop from external demand to verified human revenue, then learn from the outcome.
