# Publishing Revenue Cell Knowledge Supply Route

GitHub研究所 / AI Capability Acquisition Lab と Publishing Revenue Cell を、**Evidenceで往復する双方向ループ**として接続する。

## Forward Route

GitHub / OSS / Agent Framework / Skill / Toolchain
→ Research
→ Primary-source verification
→ Real execution / Sandbox
→ Success / Failure
→ Evidence
→ Reusable Pattern
→ Publishing handoff
→ External demand check
→ 3-stage Research
→ Fact / License / Legal / Media-policy review
→ Public / Member / Paid publishing
→ Distribution
→ Human Signal / Revenue

GitHub研究所は記事制作・販売・Membership運営を担当しない。Publishingは未検証Repoを成功例として扱わない。

## Reverse Route

Publishing / Market側で需要が確認されたテーマ
→ publishing-demand-queue
→ GitHub研究所が既存Evidenceを検索
→ Evidence不足なら実導入テスト
→ Trace / Eval / Regression / Failure / Successを記録
→ 再利用可能Pattern化
→ Publishingへ返却

## Supply Gate

Publishingへ渡せる項目は原則として次を満たす。

1. Discovery — 何を発見したか
2. Problem — 何の問題を解決するか
3. Execution — 実際に試したか
4. Result — SUCCESS / FAILURE / MIXED
5. Evidence — test / trace / artifact / benchmark / external side effect / regression
6. Reusable Pattern — 他者が再現できる形に抽象化できるか
7. Audience Value — 誰のどのPain / Curiosityに価値があるか
8. License / Security — 公開・再利用時の制約が確認されているか
9. Redaction — 個人・顧客・秘密情報が除去されているか

## Priority Supply

- 実導入して価値があったRepo / Skill
- Agent停止原因と修正Pattern
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
- 再利用可能Workflow / Template

## Hard Fail

- GitHubリンク集
- Star数だけの高評価
- 未実行Repoの成功扱い
- Agent自己申告だけのEvidence
- 実行していない構成
- License / Security不明のまま公開推奨
- 顧客機密・個人情報・契約上非公開情報

## Publishing Handoff Record

```yaml
id: capability-YYYYMMDD-slug
source_evidence: capability-lab/evidence/...
result: SUCCESS|FAILURE|MIXED
problem: ""
evidence:
  - type: test|trace|artifact|benchmark|external_side_effect|regression
    ref: ""
reusable_pattern: ""
audience_value:
  pain: ""
  audience: ""
  why_now: ""
publishing_candidate:
  eligible: true|false
  suggested_format: public_field_note|member_field_note|paid_article|newsletter|template|failure_note|success_pattern
  reason: ""
redaction_check: PASS|FAIL
publishing_state: HOLD|SUPPLY_READY|REJECT
```

## Final Principle

GitHub研究所 → Publishing → Market → Revenue → Research

研究量でも記事数でもなく、**外部で再利用価値が確認できるEvidenceの循環**を増やす。
