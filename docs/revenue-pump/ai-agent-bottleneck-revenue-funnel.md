# VECTOR｜AI Agent Bottleneck Revenue Funnel

Status: ACTIVE BASELINE
Route: `vpj_owned_ai_agent_bottleneck_v2`
Window: 1 day
Order: ordered
Reference: previous step
Test accounts: excluded

## Canonical funnel

1. `priority_entry_click`
   - `route_id = vpj_owned_ai_agent_bottleneck_v2`
   - Meaning: Vector内の診断入口クリック
2. `funnel_view`
   - `path = /ai-agent-bottleneck`
   - Meaning: 無料診断到達
3. `vector_bottleneck_select`
   - Meaning: ボトルネック選択
4. `vector_bottleneck_recommendation_view`
   - `destination_kind = paid`
   - Meaning: 有料結果表示
5. `primary_cta_click`
   - `route_id = vpj_owned_ai_agent_bottleneck_v2`
   - Meaning: ¥1,480 CTAクリック

## Revenue Pump interpretation

このファネルは、閲覧数ではなくRevenue Distanceを診断する。

`入口 → 到達 → 選択 → 有料提案表示 → 有料CTA` の各段階を前段比で見る。

### Bottleneck Resolver

- `priority_entry_click → funnel_view` で落ちる
  - 修正対象: link / routing / page load / destination mismatch
  - 原則: Offerや価格を触る前に到達障害を直す

- `funnel_view → vector_bottleneck_select` で落ちる
  - 修正対象: first view / diagnosis clarity / interaction friction
  - 原則: 診断開始を簡潔にし、選択負荷を下げる

- `vector_bottleneck_select → vector_bottleneck_recommendation_view(paid)` で落ちる
  - 修正対象: diagnosis-to-offer match / recommendation logic
  - 原則: 無理に全結果を有料へ寄せず、適合時のみ有料Routeを出す

- `vector_bottleneck_recommendation_view(paid) → primary_cta_click` で落ちる
  - 修正対象: offer relevance / evidence / CTA clarity / price framing
  - 原則: 新商品を作る前に既存Offerの説明とEvidenceを直す

- `primary_cta_click → Payment Evidence` で落ちる
  - 現状: Vector内PostHogだけではnote側の決済完了を直接証明できない
  - 修正対象: external checkout friction / payment evidence collection
  - 原則: CTAクリックを購入完了として扱わない

## Decision rule

同時に複数箇所を変更しない。

`最初に大きく落ちる地点 → その地点だけ修正 → 再計測 → 次の地点`

Reach増加よりRevenue Distance短縮を優先する。

## Evidence discipline

- 0件は「失敗」ではなく、露出不足・新規実装直後・計測未到達を区別する
- ClickをPaymentへ昇格させない
- PostHog上のファネル保存が未成立でも、このファイルをCanonical Definitionとする
- イベント名を増やさず、既存イベントを優先して二重計測を避ける

## Current state — 2026-09-13

- Canonical funnel query: validated
- `/ai-agent-bottleneck` recent traffic baseline: 0 before owned-entry rollout
- Vector-wide owned diagnostic entry: implemented
- PostHog saved insight: connector-side create action unavailable at execution time
- GitHub canonical definition: active
