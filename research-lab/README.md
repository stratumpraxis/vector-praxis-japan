# AI Capability Acquisition Lab

This lab turns external AI/OSS signals into verified capability, not a bookmark list.

## Operating loop

`DISCOVER -> VERIFY -> SANDBOX -> EVAL -> EVIDENCE -> REGRESSION -> PROMOTE/KILL`

A capability is not production-ready because it is popular, installed, or because an agent says it worked.

Promotion requires observable evidence: changed state, artifact, test result, external side effect, or another reproducible proof appropriate to the task.

## Core rules

1. **Model-independent harness** — workflows, traces, eval inputs, outputs, and evidence must not depend on one model vendor.
2. **Evidence before promotion** — `promoted` capabilities require at least one evidence reference and one regression reference.
3. **License/security gate** — anything that may be vendored, redistributed, or used commercially must have an explicit license/security status before promotion.
4. **Root-cause over patching** — recurring failures become regression tests or reusable checks.
5. **No fake completion** — agent self-reports are never evidence by themselves.
6. **Revenue relevance matters** — capability gain is prioritized when it improves execution, distribution, delivery, or verified revenue distance.

## Initial upstreams

- **pstack** — engineering rigor: proof-of-work, root-cause fixes, TDD, verification, autonomous execution patterns. Adopt principles selectively; do not blindly vendor the stack.
- **translate-book** — long-form multilingual document delivery pipeline candidate. Verify upstream license and current behavior before any vendoring or production dependency.
- **X Algorithm** — read-only distribution research asset. Use public ranking architecture to understand healthy content/distribution fit; do not use it to manipulate or evade platform systems.

See `capabilities.json` for current stage and evidence status.

## AI Visibility Eval

`research-lab/evals/ai-visibility.prompts.json` contains neutral, brand-unaware prompts for Global Work Radar. The prompts intentionally do not mention GWR so spontaneous model visibility can be measured.

The scorer is provider-agnostic:

```bash
npm run visibility:score -- path/to/results.json
```

Accepted result records:

```json
{
  "prompt_id": "gwr-remote-japan-01",
  "provider": "provider-name",
  "model": "model-name",
  "answer": "model answer text",
  "citations": ["https://example.com/source"]
}
```

The scorer reports:

- prompt coverage
- brand/domain mention rate
- owned-domain citation rate
- provider-level breakdown

No result is treated as revenue evidence. Visibility becomes commercially meaningful only when linked downstream to referral/visit/CTA/checkout/purchase evidence.

## Research loop in GitHub

Use the `Capability experiment` issue template for any new tool or technique. The issue must define:

- capability gap
- hypothesis
- upstream/source
- license/security status
- sandbox test
- success/failure metric
- proof artifact
- regression protection
- rollback/kill condition

This makes GitHub the state/evidence layer for agent work: issue -> branch/workspace -> diff/artifact -> test -> PR -> verified outcome.

## Commands

```bash
npm run research:gate
npm run visibility:score -- path/to/results.json
npm test
```
