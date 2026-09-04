---
title: "複数AIエージェント運用が遅くなる理由：レビュー待ち・引き継ぎ・Human-in-the-Loopがボトルネック"
emoji: "🧭"
type: "tech"
topics: ["ai", "agent", "automation", "productivity", "github"]
published: true
---

AIエージェントを増やせば、そのまま仕事が速くなる。最初はそう考えがちです。

実際には、ChatGPT、Claude、Codex、GitHub、各種APIを並列で使えるようになるほど、別の問題が目立ち始めます。

**生成は速いのに、全体が終わらない。**

原因はモデル性能ではなく、生成後の流れにあります。

この記事では、複数AIを実運用したときに起きやすい詰まりを、次の構造で整理します。

```text
Instruction
  ↓
Agent A / Agent B / Agent C
  ↓
Output
  ↓
Review
  ↓
Decision
  ↓
Execution
  ↓
Evidence
  ↓
Next Action
```

重要なのは、上段のAgent数ではありません。

下段の `Review → Decision → Execution → Evidence` が遅ければ、Agentを増やすほど未処理の出力だけが増えます。

## 1. AIのボトルネックは「生成」から「後工程」に移る

AI導入初期は、文章生成やコード作成そのものが価値になります。

ところが、複数Agentを並列で動かす段階に入ると、問題が変わります。

- 同じ作業を別Agentが重複して行う
- どれが最新版かわからなくなる
- 「完了」の意味がAgentごとに違う
- 実装したがDeployされていない
- DeployしたがPublic URLを確認していない
- CTAを置いたがClickを測っていない
- Checkoutを作ったがPurchaseまで追っていない

この状態では、AIの出力速度を上げてもスループットは上がりません。

むしろ、判断待ち・確認待ち・統合待ちが増えます。

式にすると単純です。

```text
System Throughput
≠ Agent Output Speed

System Throughput
= 最も遅い重要工程の処理能力
```

AIが10倍速くなっても、人間が毎回すべてを読んで判断する必要があるなら、全体速度は人間側で止まります。

## 2. 「担当を分ける」だけでは解決しない

そこでよく行うのが役割分担です。

```text
Research Agent
Writer Agent
Engineer Agent
QA Agent
Distribution Agent
Analytics Agent
```

これは必要ですが、十分ではありません。

役割だけ決めても、Agent間で状態が渡らなければ再確認が増えるからです。

たとえばEngineerが「完了」と報告しても、Distribution側が知りたいのは別の情報です。

- 何を変更したか
- 本番反映済みか
- 公開URLは何か
- CTAは動くか
- 計測イベントは取れているか
- 未解決Blockerは何か

つまり、必要なのは役割表より**handoff contract**です。

## 3. handoffを「会話」ではなく構造化する

実運用では、引き継ぎを次のような固定形式にすると状態ズレがかなり減ります。

```text
INPUT
ACTION
RESULT
EVIDENCE
BLOCKER
NEXT OWNER
NEXT ACTION
```

### INPUT
何を受け取って作業したか。

### ACTION
何を実行したか。

### RESULT
結果として何が変わったか。

### EVIDENCE
Commit、Public URL、計測値など、結果を外部から確認できる証拠。

### BLOCKER
未完了がある場合、その理由。

### NEXT OWNER
次に誰が担当するか。

### NEXT ACTION
次に行う具体的な1アクション。

ポイントは `RESULT` と `EVIDENCE` を分けることです。

「公開しました」はRESULTです。

実際にアクセスできるURLはEVIDENCEです。

この2つを混ぜると、AI組織は簡単に「完了したことになっている未完了」を大量生産します。

## 4. 完了条件をOutputではなくOutcome側に置く

複数Agent運用で特に危険なのが、各担当が自分の工程だけで完了判定することです。

たとえばコンテンツ施策なら、

```text
記事を書いた
```

ではなく、

```text
Demand確認
→ 記事作成
→ 公開
→ Public URL確認
→ CTA確認
→ Click計測
→ Checkout
→ Purchase
→ Revenue
```

のどこまで到達したかで状態を持ちます。

開発でも同じです。

```text
Code generated
→ Test passed
→ Merged
→ Deployed
→ Public behavior verified
→ Event measured
```

この設計にすると、「AIが仕事をした量」と「事業が前に進んだ量」を分離できます。

## 5. 1指示を1タスクではなく1ループとして扱う

もう1つ有効だったのが、ユーザーの指示を単発タスクとして扱わないことです。

たとえば「この導線を改善して」という指示を、

```text
調査して改善案を出す
```

で終わらせず、

```text
Instruction
→ Existing Assets
→ Demand
→ Primary Route
→ Execute
→ Publish
→ Measure
→ Bottleneck
→ Improve
→ Revenue
```

という1ループとして扱います。

この違いは大きいです。

前者はAIの成果物が増えます。

後者は事業状態が変わります。

## 6. Agentを増やす前に「最大ボトルネックを1つ」潰す

複数Agent環境では、一度に全部改善したくなります。

しかし、改善点を増やしすぎると何が効いたかわからなくなります。

そこで毎回、最も深いボトルネックを1つだけ選びます。

たとえばRevenue Loopなら、

```text
Impression不足
→ Theme / Title

PVあり・CTA Clickなし
→ CTA

CTA Clickあり・Checkoutなし
→ Landing / Offer

Checkoutあり・Purchaseなし
→ Trust / Price / Checkout friction

Purchaseあり
→ 同構造を横展開
```

Agentの数を増やすより、このボトルネック判定を自動化した方が全体性能が上がることがあります。

## 7. Human Gateは消すのではなく、狭くする

完全自動化を目指すと、承認をすべて排除したくなります。

しかし現実には、人間が判断すべき場所があります。

- 新しい支出
- 法的リスク
- 本人認証
- API Key入力
- ブランド変更
- 既存戦略を大きく変える判断

問題はHuman Gateがあることではありません。

**あらゆる工程がHuman Gateになっていること**です。

理想は、

```text
Auto
→ Auto
→ Auto
→ Human Gate
→ Auto
→ Auto
→ Measurement
```

です。

承認前後を自動化し、判断が必要な一点だけ人間に戻します。

## 8. AI組織の設計で見るべき指標

Agent数や生成量は参考値です。

実運用では、次を優先します。

1. Revenue / Profit
2. Conversion
3. Checkout / Lead
4. Product arrival
5. Click
6. View / Impression
7. Reusable Asset

つまり、AI組織のKPIは「どれだけ生成したか」ではなく、**どれだけ状態を前に進めたか**です。

## まとめ

AIエージェントを増やしても全体が速くならない場合、モデルを変える前に運用構造を見る価値があります。

特に確認したいのは次の4点です。

- Handoffに固定フォーマットがあるか
- RESULTとEVIDENCEが分かれているか
- 完了条件が生成物ではなく下流Outcomeに置かれているか
- Human Gateが必要最小限に狭められているか

AIは作業を高速化します。

しかし、速くした工程の先が詰まっていれば、システム全体は速くなりません。

複数Agent運用では、Agent性能より先に**流れの設計**を作る必要があります。

---

### 実装用テンプレート

複数AIの役割分担、handoff、Evidence、Human Gate、次アクションまでを一枚の運用構造に落としたい場合は、実装テンプレートをまとめた Cross-Agent Operating Kit もあります。

[Cross-Agent Operating Kitを見る](https://stratumpraxis.com/cross-agent-operating-kit.html?utm_source=zenn&utm_medium=article&utm_campaign=ai_agent_bottleneck_execution_evidence&utm_content=primary_cta&asset_id=cross_agent_operating_kit&route_id=zenn_ai_agent_bottleneck_v1)
