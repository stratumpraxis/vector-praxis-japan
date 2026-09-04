import type { Metadata } from "next";
import { ArrowUpRight, CheckCircle2, GitBranch, ShieldCheck, TimerReset } from "lucide-react";
import { siteOrigin } from "@/lib/site-url";

const ROUTE_ID = "vpj_owned_ai_agent_bottleneck_v1";
const OPERATING_KIT = `https://stratumpraxis.com/cross-agent-operating-kit.html?utm_source=vector_praxis&utm_medium=owned_article&utm_campaign=ai_agent_bottleneck_owned_20260904&utm_content=primary_cta&asset_id=cross_agent_operating_kit&route_id=${ROUTE_ID}`;
const NOTE_DEEP_DIVE = "https://note.com/deft_eel6718/n/ncaff8351e529?utm_source=vector_praxis_site&utm_medium=owned_article&utm_campaign=ai_agent_bottleneck_owned_20260904&utm_content=paid_note_secondary";

export const metadata: Metadata = {
  title: "複数AIエージェント運用が遅くなる理由｜Vector Praxis",
  description: "AIを増やしても仕事が速くならない原因を、レビュー待ち・引き継ぎ・権限境界から整理。複数AIを止めずに運用する実装設計へつなげます。",
  alternates: { canonical: `${siteOrigin}/ai-agent-bottleneck` },
  openGraph: {
    title: "複数AIエージェント運用が遅くなる理由",
    description: "ボトルネックは生成速度ではなく、レビュー待ち・引き継ぎ・権限境界にある。",
    type: "article",
    locale: "ja_JP",
    siteName: "Vector Praxis",
  },
};

function TrackedLink({ href, event, children, className = "" }: { href: string; event: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-event={event} className={className}>{children}</a>;
}

export default function AiAgentBottleneckPage() {
  return <main>
    <header className="site-header">
      <a href="/" className="brand" aria-label="Vector Praxis ホーム"><span className="brand-mark" aria-hidden="true">VP</span><span>Vector Praxis</span></a>
      <nav aria-label="ページナビゲーション"><a href="#bottleneck">詰まり</a><a href="#design">実装設計</a><a href="#next">次の一手</a></nav>
    </header>

    <section className="hero shell">
      <div className="eyebrow"><span/> OWNED REVENUE ARTICLE</div>
      <h1>AIを増やしても、<br/><em>仕事は速くならない。</em></h1>
      <p className="hero-copy">複数AI運用で詰まりやすいのは生成速度ではありません。レビュー待ち、誰が決めるか不明な状態、引き継ぎの欠落です。必要なのは、AIを追加することではなく、役割・権限・停止条件を一枚の運用ルールにすることです。</p>
      <div className="hero-actions">
        <TrackedLink href={OPERATING_KIT} event="commerce_entry_click" className="button primary">実装キットを見る · $69 <ArrowUpRight size={17}/></TrackedLink>
        <TrackedLink href={NOTE_DEEP_DIVE} event="product_click" className="button secondary">詳しい解説をnoteで読む</TrackedLink>
      </div>
      <div className="hero-index" aria-label="この記事の要点"><span>01 <b>レビュー待ち</b></span><span>02 <b>権限の曖昧さ</b></span><span>03 <b>引き継ぎ欠落</b></span></div>
    </section>

    <section id="bottleneck" className="section shell">
      <div className="section-heading"><p>WHERE SPEED DISAPPEARS</p><h2>遅くなる場所は、AIの外側にある。</h2></div>
      <div className="route-grid">
        <div className="route-card"><TimerReset/><span><b>レビュー待ち</b><small>生成は終わっているのに、人の確認待ちでキューが止まる。</small></span></div>
        <div className="route-card"><ShieldCheck/><span><b>権限境界が不明</b><small>どこまでAIが進めてよいか分からず、毎回確認が発生する。</small></span></div>
        <div className="route-card"><GitBranch/><span><b>引き継ぎが弱い</b><small>次のAIへ目的・状態・停止条件が渡らず、再説明とやり直しが増える。</small></span></div>
      </div>
    </section>

    <section id="design" className="section muted-section">
      <div className="shell">
        <div className="section-heading"><p>OPERATING CONTRACT</p><h2>必要なのは「もっと賢いAI」ではなく、共通の運用契約。</h2></div>
        <div className="resource-list">
          <article className="resource"><div className="resource-no">01</div><div className="resource-main"><span className="tag">ROLE</span><h3>誰が何を担当するか</h3><p>調査・判断・実装・QAを分け、同じ作業を複数AIが重複しないようにします。</p></div><CheckCircle2/></article>
          <article className="resource"><div className="resource-no">02</div><div className="resource-main"><span className="tag">AUTHORITY</span><h3>どこまで自律実行してよいか</h3><p>安全なread-only、低リスク変更、人間確認が必要な境界を先に固定します。</p></div><CheckCircle2/></article>
          <article className="resource"><div className="resource-no">03</div><div className="resource-main"><span className="tag">HANDOFF</span><h3>次の担当へ何を渡すか</h3><p>INPUT / ACTION / RESULT / EVIDENCE / BLOCKER / NEXT ACTION を共通形式にして、再説明を減らします。</p></div><CheckCircle2/></article>
        </div>
      </div>
    </section>

    <section id="next" className="section shell return-panel">
      <ShieldCheck size={26}/>
      <div><p>NEXT ACTION</p><h2>設計を読むだけで終わらせず、運用ルールとして持ち帰る。</h2><span>Cross-Agent Operating Kit Personalは、役割・権限・Human Gate・停止条件・状態引き継ぎをMarkdown + YAMLで実装する買い切りキットです。</span></div>
      <TrackedLink href={OPERATING_KIT} event="commerce_entry_click" className="button primary">Personal $69を見る <ArrowUpRight size={17}/></TrackedLink>
    </section>

    <section className="section shell">
      <div className="section-heading"><p>SECOND PATH</p><h2>まず背景から深く読みたい場合</h2></div>
      <div className="empty-panel"><span className="status-dot"/><div><b>有料noteで、複数AIが遅くなる構造を詳しく読む。</b><p>商品を先に見るより、レビュー・権限・受け渡しの考え方を理解してから判断したい方向けです。</p></div><TrackedLink href={NOTE_DEEP_DIVE} event="product_click" className="text-link">noteへ <ArrowUpRight size={15}/></TrackedLink></div>
    </section>

    <footer className="footer shell"><div><span className="brand-mark">VP</span><b>Vector Praxis</b></div><p>無料記事 → 実装 → Purchaseまでを短くするOwned Revenue Route。</p><small>© 2026 Vector Praxis</small></footer>
  </main>;
}
