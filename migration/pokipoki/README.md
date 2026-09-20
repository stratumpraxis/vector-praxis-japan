# GitHub ぽちぽち分離準備

目的: Vector 本体から、外部 GitHub 上での小タスク探索・報酬機会スキャン・将来の提出補助を切り離し、専用 GitHub / 専用 repository へ移せる状態にする。

## 今回の結論

Vector 本体に残す:
- Web / 商品 / Buyer / Distribution / Revenue evidence
- Bluesky / Social publishing
- PostHog / Checkout / public route proof
- GWR / 通常の能力獲得・市場観測

専用 GitHub へ移す候補:
- `revenue-mesh/**`
- `.github/workflows/revenue-mesh-radar.yml`

保留:
- `capability-lab/**`
- `scripts/capability-scan.mjs`
- `.github/workflows/capability-acquisition-loop.yml`

理由: capability 系は「外部 GitHub を読む」要素はあるが、Vector 本体の能力改善にも使うため、現時点では移動対象にしない。

## 安全境界

専用 GitHub 側でも以下は禁止/停止:
- security / vulnerability / exploit / CVE / RCE / XSS / SQL injection / bug bounty
- credential / phishing / malware / weapon
- 認証回避・本番侵入・攻撃再現
- 自動 claim
- 自動 issue / PR / comment 投稿
- 報酬条件が曖昧な案件
- 支払い元が未確認の案件

現在の `revenue-mesh/config.json` は既に security-sensitive work を除外し、`auto_external_submit=false`、executor disabled になっているため、この方針は維持する。

## 新しい専用 GitHub / repo の役割

専用側は「探す・絞る・準備する」まで。

```
DISCOVERED
  -> QUALIFIED
  -> BUILDABLE
  -> SUBMISSION_READY
  -> HUMAN GATE
  -> SUBMITTED
  -> ACCEPTED
  -> PAID
```

外部への claim / comment / PR / submission は HUMAN GATE を超えるまで自動化しない。

## 移行時に必要なもの

1. 新しい GitHub account / repository を作る
2. `revenue-mesh/**` をコピー
3. `.github/workflows/revenue-mesh-radar.yml` をコピー
4. 必要なら `SUPERTEAM_AGENT_KEY` を新 repo の Secret に再登録
5. workflow permissions を最小化
6. 初回は schedule を無効のまま手動実行
7. 出力確認後に schedule を有効化
8. Vector 側の revenue-mesh workflow を停止
9. 数日問題なければ Vector 側の revenue-mesh 実装を削除

## Vector 側で今は触らないもの

- `.github/workflows/social-publish.yml`
- `.github/workflows/bluesky-buyer-match.yml`
- `.github/workflows/vector-revenue-probe-publish.yml`
- `.github/workflows/revenue-pump-*.yml`
- `distribution/**`
- PostHog / Buyer Match / Revenue Evidence 系

これらは Vector の販売・流通導線であり、ぽちぽち専用 GitHub へ移さない。

## 切替ルール

新専用 repo が動作確認できるまでは Vector 本体の既存ファイルを削除しない。
移行は Copy -> Verify -> Disable old -> Observe -> Delete old の順に行う。
