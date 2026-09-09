import { ArrowUpRight } from "lucide-react";

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
    <main className="shell" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <a href="/" className="text-link">← Digital Index Base</a>
      <div className="section-heading" style={{ marginTop: 28 }}>
        <p>NON-B2B ASSET LIBRARY</p>
        <h1 style={{ maxWidth: 860 }}>旧Stratum / @vector の非B2B資産を、Digital Index Baseから見える形に。</h1>
        <p style={{ maxWidth: 760 }}>
          URLは急いで移動しません。まずブランド上の所属と入口をDigital Index Baseへ統一し、既存ページを壊さず段階的に移植・再構成します。
        </p>
      </div>

      {groups.map((group) => (
        <section className="section" key={group.title} style={{ paddingTop: 26, paddingBottom: 26 }}>
          <div className="section-heading"><p>CATEGORY</p><h2>{group.title}</h2></div>
          <div className="route-grid">
            {group.items.map(([title, href, note]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="route-card" data-event="dib_library_asset_open">
                <span><b>{title}</b><small>{note}</small></span><ArrowUpRight />
              </a>
            ))}
          </div>
        </section>
      ))}

      <section className="section muted-section" style={{ marginTop: 28 }}>
        <div className="shell" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="section-heading"><p>B2B ROUTE</p><h2>会社・チームの意思決定は @stratum</h2></div>
          <a href={STRATUM} target="_blank" rel="noopener noreferrer" className="button primary">Digital Index Base @stratum <ArrowUpRight size={17}/></a>
        </div>
      </section>
    </main>
  );
}
