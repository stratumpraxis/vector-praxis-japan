# Publishing → GitHub研究所 Demand Queue

Publishing Revenue Cellで外部需要が確認され、**実導入テストや追加Evidenceが必要になったテーマだけ**をここへ返す。

Active demand requests: **0**

## Intake Template

```yaml
id: publishing-demand-YYYYMMDD-slug
market_signal: ""
audience: ""
pain_or_curiosity: ""
external_evidence: ""
requested_research:
  repo_or_topic: ""
  test_needed: ""
  success_condition: ""
  failure_condition: ""
revenue_relevance: ""
priority: P0|P1|P2
state: NEW|TESTING|VERIFIED|REJECTED|RETURNED_TO_PUBLISHING
```

## Rules

- 「記事にしたいから試す」ではなく、外部需要Evidenceがあるテーマを優先する。
- 既存Capability Lab Evidenceで回答できる場合、新規テストを重複させない。
- 新規Repo導入はSandbox / License / Security Gateを必ず通す。
- SUCCESSだけでなくFAILURE / MIXEDも価値あるEvidenceとして返す。
- Agent自己申告を結果Evidenceにしない。

## Return Route

Publishing Demand
→ Existing Evidence Search
→ Missing Evidence Test
→ Execution
→ Success / Failure
→ Evidence
→ Reusable Pattern
→ Publishing Supply Queue
