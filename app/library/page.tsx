import { ArrowUpRight, LibraryBig } from "lucide-react";
import { VectorFooter, VectorHeader } from "@/components/vector-chrome";
import { VectorNext } from "@/components/vector-next";

const STRATUM = "https://stratumpraxis.com/";

const groups = [
  {
    title: "AI / 個人実践",
    items: [
      ["AI App Builder Router 2026", "https://payhip.com/b/LBtbr", "AIアプリ開発の進め方を選ぶ個人向けルーター"],
      ["AI Practical Check", "https://ai-practical-check.pages.dev/", "AI活用タイプ診断"],
      ["AI Monetization Reality Check", "https://stratumpraxis.com/ai-monetization-reality-check.html", "AI収益化の主張をEvidence・再現性・依存条件で確認"],
      ["AI Income Claim Checklist", "https://stratumpraxis.com/ai-income-claim-checklist.html", "AI収益主張を無料で確認する入口"],
      ["Solo Company Score", "https://stratumpraxis.com/solo-company-score.html", "一人運営の状態を確認"],
      ["One-Person Business AI Operating System", "https://stratumpraxis.com/one-person-business-ai-operating-system.html", "一人運営向けAIオペレーション"],
    ],
  },
  {
    title: "Creator / Digital Product",
    items: [
      ["Global Digital Product AI Starter Kit", "https://stratumpraxis.com/global-digital-product-ai-starter-kit.html", "デジタル商品づくりの基礎"],
      ["Smartphone Income Blueprint", "https://stratumpraxis.com/smartphone-income-blueprint.html", "スマホ中心の収益設計"],
      ["Smartphone AI Slide Factory", "https://stratumpraxis.com/smartphone-ai-slide-factory.html", "スマホ中心のスライド制作"],
      ["AI Revenue Toolkit", "https://stratumpraxis.com/ai-revenue-toolkit.html", "個人向け収益化ツール群"],
      ["Image Commerce", "https://stratumpraxis.com/image-commerce/", "画像・Commerce系の旧派生資産"],
      ["Prompt Systems", "https://stratumpraxis.com/prompt-systems.html", "Promptを再利用可能な仕組みにする旧資産"],
    ],
  },
  {
    title: "Revenue / Growth",
    items: [
      ["Revenue Router", "https://stratumpraxis.com/revenue-router.html", "Signalを次の収益アクションへ整理"],
      ["Return Gate Growth OS", "https://stratumpraxis.com/return-gate-growth-os.html", "再訪・Retention設計"],
      ["Return Gate", "https://stratumpraxis.com/return-gate/", "再訪導線の旧派生資産"],
      ["Passage Hub", "https://stratumpraxis.com/passage-hub/", "旧コンテンツ導線Hub"],
      ["Passage Network", "https://stratumpraxis.com/passage-network.html", "旧ネットワーク導線"],
      ["Folio Junction", "https://stratumpraxis.com/folio-junction/", "旧Publishing / content資産"],
      ["Ordlume", "https://stratumpraxis.com/ordlume/", "旧派生プロダクトライン"],
    ],
  },
  {
    title: "Life / Household",
    items: [
      ["Life Resilience Check", "https://stratumpraxis.com/life-resilience-check/", "生活レジリエンス診断"],
      ["Life Resilience Toolkit", "https://stratumpraxis.com/life-resilience-toolkit/", "生活レジリエンス実践資産"],
      ["Household Resilience Checklist", "https://stratumpraxis.com/household-resilience-checklist/", "家庭向けチェックリスト"],
      ["72-Hour Household Readiness", "https://stratumpraxis.com/72-hour-household-readiness/", "家庭向け備え"],
      ["Monthly Money Leak Audit", "https://stratumpraxis.com/monthly-money-leak-audit/", "個人・家庭向け支出チェック"],
    ],
  },
];

export default function LibraryPage() {
  return (
    <main className="vx-page tone-read">
      <VectorHeader tone="read" />

      <section className="vx-work-hero shell">
        <div className="vx-breadcrumb">VECTOR <span>→</span> LINKED ASSETS <span>→</span> RETURN</div>
        <span className="vx-chip"><LibraryBig size={14} /> Linked Asset Index</span>
        <h1>必要な資産を探す。<br/>所有ブランドは混ぜない。</h1>
        <p>
          Digital Index Base @vector から辿れる既存の非B2B資産を一覧化しています。
          リンク先がStratumや外部サービスの場合、その資産の運営・商品主体までVectorに移るわけではありません。
        </p>
        <div className="vx-actions">
          <a href="/" className="vx-button primary">Vector Hubへ戻る</a>
          <a href="#assets" className="vx-button ghost">資産を見る</a>
        </div>
      </section>

      <div id="assets">
        {groups.map((group, groupIndex) => (
          <section className="vx-section shell" key={group.title}>
            <div className="vx-section-head">
              <span>{String(groupIndex + 1).padStart(2, "0")} / LINKED CATEGORY</span>
              <h2>{group.title}</h2>
              <p>既存URLを維持したまま、必要な公開先へ移動します。外部遷移は新しいタブで開きます。</p>
            </div>
            <div>
              {group.items.map(([title, href, note], itemIndex) => (
                <div className="vx-asset-row" key={href}>
                  <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{title}</b>
                    <small>{note} · External destination</small>
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" data-event="dib_library_asset_open">
                    開く <ArrowUpRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="vx-earn-focus shell">
        <div className="vx-earn-badge">BRAND BOUNDARY</div>
        <div>
          <h2>会社・チーム向けの意思決定は、Stratumへ。</h2>
          <p>Vectorは一般ユーザー / Creator向けの入口です。B2B商品・監査・業務意思決定の主体はStratum側に残します。</p>
        </div>
        <a href={STRATUM} target="_blank" rel="noopener noreferrer" className="vx-button earn" data-event="vector_library_to_stratum">
          Stratumを見る <ArrowUpRight size={15} />
        </a>
      </section>

      <VectorNext
        eyebrow="RETURN / CONTINUE"
        title="次の入口へ戻る"
        routes={[
          { label:"RETURN", title:"Vector Hub", text:"Start / Build / Earn / Creator / Read / Return から選び直す。", href:"/", event:"return_to_hub", kind:"return" },
          { label:"BUILD", title:"Vector Works", text:"既存資産を作る・届ける・反応へ戻す。", href:"/vector-works", event:"vector_works_open", kind:"build" },
          { label:"READ", title:"Vector note", text:"公開済みの無料・有料記事を読む。", href:"https://note.com/deft_eel6718", event:"vector_note_open", kind:"read", external:true },
        ]}
      />

      <VectorFooter />
    </main>
  );
}
