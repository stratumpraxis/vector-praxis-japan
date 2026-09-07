# Agent Lab Knowledge Supply Route

GitHub研究所 / AI Capability Acquisition Lab から Agent Lab へ渡すのは、**実証済みで再利用可能な知識だけ**です。

## Route

GitHub / OSS / Agent Framework / Skill / Toolchain
→ Research
→ Primary-source verification
→ Sandbox / real execution
→ Success / Failure
→ Evidence
→ Reusable Pattern
→ Agent Lab handoff

GitHub研究所は Agent Lab の記事制作・会員運営・新サイト作成を担当しません。

## Supply Gate

Agent Lab へ渡せる項目は、以下をすべて満たすこと。

1. **Discovery** — 何を発見したか
2. **Problem** — 何の問題を解決するか
3. **Execution** — 実際に試したか
4. **Result** — SUCCESS / FAILURE / MIXED
5. **Evidence** — test / trace / artifact / external side effect / benchmark 等の客観証拠
6. **Reusable Pattern** — 他者が再利用できる形に抽象化できるか
7. **Membership Value** — Public Field Note / Premium Field Note / Template / Failure Note / Success Pattern のどれに変換できるか

### Hard Fail

以下は Agent Lab へ供給しない。

- 未実行Repoの紹介
- Star数だけの評価
- Agent自己申告のみ
- 設計だけで実行Evidenceなし
- 既存能力と重複し、Capability Gainが確認できないもの
- ライセンス / Security / 商用利用条件が不明なもの
- 機密情報・個人情報・顧客固有情報を含むもの

## Priority Topics

- 実導入して価値があった Repo / Skill
- Agent が止まる原因と修正
- Trace / Eval / Regression Test
- Agent Observability
- 長時間Agent運用
- Browser / Tool Use
- Multi-Agent coordination
- Coding Agent運用
- Automation
- Revenue実行に効いたOSS
- 導入失敗したTool
- 期待ほど価値がなかったRepo
- MARKET能力を明確に強化したPattern

## Evidence Ladder

`CLAIM` → `IMPLEMENTED` → `EXECUTED` → `VERIFIED` → `REUSABLE` → `SUPPLY_READY`

`SUPPLY_READY` だけを Agent Lab へ渡す。

## Required Record

```yaml
id: capability-YYYYMMDD-slug
source_repo: owner/repo
source_url: https://github.com/owner/repo
problem: ""
project_target: MARKET|GWR|Forwelle|Stratum|Vector|Other
execution_state: IMPLEMENTED|EXECUTED|VERIFIED
result: SUCCESS|FAILURE|MIXED
evidence:
  - type: test|trace|artifact|benchmark|external_side_effect|regression
    ref: ""
capability_gain: ""
reusable_pattern: ""
risks:
  license: ""
  security: ""
  operational: ""
agent_lab_value:
  eligible: true|false
  format: public_field_note|premium_field_note|template|failure_note|success_pattern
  reason: ""
redaction_check: PASS|FAIL
supply_state: HOLD|SUPPLY_READY|REJECT
```

## Scoring

Agent Lab供給価値はStarsではなく、次で評価する。

- Capability Gain — 25
- Execution Evidence — 25
- Reusability — 20
- MARKET / Revenue relevance — 15
- Novelty / learning value — 10
- Safety / license clarity — 5

**80+**: Supply candidate  
**65–79**: Internal learning only  
**<65**: Reject / archive

ただしEvidence Gate未通過なら、点数に関係なく `HOLD`。

## Final Principle

研究のための研究ではなく、

**Capability → Execution → Evidence → Reusable Knowledge → Membership Value**

までつながる研究を優先する。
