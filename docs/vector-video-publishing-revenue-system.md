# Vector Video / Publishing Revenue System

Status: ACTIVE
Owner: Vector Praxis
Updated: 2026-09-13

## Purpose

Vectorの動画・記事・SNS・外部出版を、制作本数ではなくRevenue Evidenceへ接続する。

評価順は固定する。

`Payment Confirmed > Checkout Reached > Qualified Buyer Action > Qualified Traffic > View > Play > Post Count > Production Count`

Stratum固有URL、SNS Account、Secret、Payment Link、Brand CopyはVectorへ流用しない。移植対象は判断構造、制作能力、自動化、品質基準、配信構造、計測構造、収益化構造、改善能力のみとする。

## 1. Pre-production gate

新規制作前に必ず次を確認する。

`Existing Asset → Existing Buyer → Existing Product → Existing Sales Page → Existing Payment → Existing Traffic → Existing Response Evidence`

強い既存資産がある場合は作り直さない。先に以下を決める。

- 何を売るか
- 誰に売るか
- どこへ送るか
- 支払いまで何段あるか
- 現在どこが詰まっているか

## 2. Revenue route

標準Route:

`External Contact → Vector → Free Entry / Diagnostic → Relevant Product → Checkout → Payment → Access Evidence`

原則は1 Asset = 1 Primary CTA。Buyer Intentごとに最短Routeへ送る。

複数CTAを乱立させない。

## 3. Video production capability

Vectorは外部有料動画サービスへ過度に依存せず、必要に応じて以下を組み合わせる。

- HTML / CSS / SVG
- JavaScript Timeline / GSAP
- Remotion / HyperFrames構成
- FFmpeg export
- Programmatic captions
- Graph / number animation
- UI demo / comparison / cards
- particles / background motion / transition
- audio sync / CTA focus
- existing image / video / audio reuse

標準Format:

- 9:16: TikTok / Reels / Shorts
- 1:1: Feed
- 16:9: YouTube / Web / Presentation
- Length: 15 / 30 / 45 / 60 sec

構成:

`Hook → Problem → Evidence → Demo → Value → Action`

標準3型:

- A / Stop: 強い一言で停止
- B / Evidence: 数字・比較・UI・実測
- C / Demo: 実物・操作・結果

## 4. Motion grammar

- 主張 → 強い静止 + 短い出現
- 数字 → Count + Scale + Graph
- 比較 → Split + Before / After
- 手順 → Ordered Cards
- 証拠 → UI Zoom + Focus Lock
- 問題 → Compression + Contrast
- 解決 → Expansion + Organization
- CTA → 動きを減らし一点集中

禁止:

- 意味のない3D回転
- 全要素Bounce
- 過剰Glow
- 字幕過密
- 装飾だけのMotion
- Template感の強い映像
- 読めないCTA

## 5. Video QA

100点満点:

- Hook 20
- Readability 15
- Composition 15
- Motion 10
- Evidence 15
- Action Route 15
- Brand 10

判定:

- <80: Regenerate / Rework
- 80–89: Publishable
- >=90: Primary Candidate

工程:

`Generate → Structure Check → Visual Check → Draft Export → Score → Fix → Re-export → Complete`

自動再生成は有限。最大3試行を標準とし、改善しない場合は原因を `hook / caption / composition / tempo / CTA / evidence / source-asset` に分類する。

## 6. Publishing / repurposing

1つのVector Assetを1回で終わらせない。

`Long Article → Summary → SNS Copy → Video Script → Short Video → Static → CTA Copy → External Media Version`

1 Assetを複数媒体・複数Format・複数Buyer Intentへ展開する。ただし負けAssetの大量生産は禁止。

Winnerは `1 → 5–20 variants` を優先する。

## 7. External publishing

記事配置後の理想処理:

`Detect → Adapt → Publish → Recover URL → Save Evidence → Generate SNS Assets`

Evidence最低項目:

- platform
- article_id / post_id
- public_url
- published_at
- source_asset
- destination
- campaign_id

公開台帳・記事ID・更新状態で重複投稿を防ぐ。

Platform rules:

- Ghost: API利用可能ならcreate/updateを区別しEvidence保存
- DEV.to: official API、article ID保持、重複禁止、rate limitは有限retry
- Tips: 正規MCP接続時のみdraft/edit/price/category/tag/publish/sales historyを扱う
- Medium: 原稿生成まで。無人自動公開しない
- Hashnode: API/plan条件を都度確認
- Zenn: GitHub連携優先
- Other: API/規約/認証を確認してから追加

## 8. SNS role separation

- Bluesky: immediate traffic / short copy / link / video
- Instagram: Reels / brand / save / profile transition
- TikTok: discovery / hook-first / platform-specific edit
- Pinterest: search / long-tail traffic
- YouTube Shorts: search + reusable video asset
- Other: confirmed Buyer presence only

Vector専用Accountだけを使う。他Brand Accountは代用しない。

Publish auth priority:

`Official API > OAuth > Official MCP > Approved Connection`

認証がない場合は `Copy + Media + Description + UTM + Queue` まで生成し、認証地点だけHuman Gateとする。

## 9. Measurement contract

可能な限り全流入に付与:

- utm_source
- utm_medium
- utm_campaign
- utm_content
- route_id
- asset_id

Canonical funnel:

`traffic_session_start → free_tool_start → free_tool_complete → paid_product_view → primary_cta_click → checkout_click → confirmed_checkout_departure → checkout_return → verified_access → purchase`

重要:

- `primary_cta_click` と `confirmed_checkout_departure` を同一視しない
- 外部商品ページへのClickをPurchase/Checkout Reachとして扱わない
- offsiteで観測できない段階はUnverifiedのままにする

## 10. Evidence state machine

以下は推測で確定しない。

- PUBLISHED
- DEPLOYED
- PURCHASED
- REVENUE
- SUCCESS

Evidence mapping:

- Publish → Public URL + external ID
- Deploy → public behavior / deploy evidence
- Traffic → Analytics
- Checkout Reach → provider checkout/session evidence
- Purchase → payment_status / PaymentIntent / platform sales evidence
- Access → verified_access

Evidenceが無い場合の状態:

- UNVERIFIED
- UNKNOWN
- AUTH_WAIT
- PERMISSION_WAIT
- FAILED_REVIEW

## 11. Bottleneck engine

毎Cycleで最大ボトルネックを1つだけ選ぶ。

- Traffic 0 → distribution / hook / Buyer match
- Traffic >0, operation 0 → entry page
- Operation >0, product view 0 → route
- Product view >0, CTA 0 → offer
- CTA >0, checkout departure 0 → technical route
- Checkout reached >0, purchase 0 → trust / price / payment friction
- Purchase >0 → amplify winner

制作量最大化ではなく、最細部を1つずつ太くする。

## 12. Channel allocation

媒体は感覚で評価しない。

Buyerが実際に来る媒体へ配分を寄せる。

新規SNS追加前に以下を再確認する。

`GitHub / Article / Search / Referral / Existing Buyer / Past Video`

既存流入が強い場合は新規開拓より先に `Existing Surface → Product → Payment` を太くする。

## 13. Checkout continuity

Vector pageと決済画面で以下の連続性を確認する。

- brand name
- logo
- color
- product name
- price
- one-time / subscription
- post-purchase flow
- delivery/access method
- return URL

別Brandに見える状態を禁止する。

## 14. Automation safety

理想Automation:

`Article Added → Transform → Publish → Generate SNS Assets → Save Evidence → Deploy`

無限retry禁止:

- auth error
- permission error
- policy error
- payment error

Transient network errorのみ有限retryする。

## 15. Winner amplification

反応が取れたAsset / CTAは、別媒体・別尺・別Hook・別Buyer・別言語へ再利用する。

負けAssetを量産するよりWinnerを5–20展開する。

## 16. Current initial route installed 2026-09-13

Selected existing product:

- Vector note: AIを増やすほど仕事が遅くなる理由──ChatGPT・Claude・GitHubを「チーム」に変える設計
- Price: ¥1,480

Installed route:

`Bluesky → /ai-agent-bottleneck → 3-choice diagnosis → Vector paid note`

Route ID:

`vpj_owned_ai_agent_bottleneck_v2`

Current primary bottleneck after first execution:

`Qualified Traffic / attribution evidence`

Do not promote this route to Revenue Success until checkout/purchase evidence exists.
