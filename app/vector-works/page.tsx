import { ArrowUpRight, Network, Radar, RefreshCw } from "lucide-react";

const HANDOFF_ARTICLE = "https://note.com/deft_eel6718/n/ncaff8351e529?utm_source=vector_praxis_site&utm_medium=owned&utm_campaign=vector_works_reuse_20260902&utm_content=handoff_article";
const REVENUE_ARTICLE = "https://note.com/deft_eel6718/n/nfce5ac047c15?utm_source=vector_praxis_site&utm_medium=owned&utm_campaign=vector_works_reuse_20260902&utm_content=revenue_article";
const FREE_ENTRY = "https://note.com/deft_eel6718/n/n86dddd12d2b2?utm_source=vector_praxis_site&utm_medium=owned&utm_campaign=vector_works_reuse_20260902&utm_content=free_entry";

function Outbound({ href, event, children, className = "" }: { href: string; event: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-event={event} className={className}>{children}</a>;
}

export default function VectorWorksPage() {
  return <main>
    <header className="site-header"><a href="/" className="brand" aria-label="Vector Praxis ホーム"><span className="brand-mark" aria-hidden="true">VP</span><span>Vector.Works</span></a><nav aria-label="ページナビゲーション"><a href="#route">導線</a><a href="#assets">既存資産</a></nav></header>

    <section className="hero shell"><div className="eyebrow"><span/> JAPANESE DISTRIBUTION & REVENUE</div><h1>作る前に拾う。<br/><em>配って、測って、戻す。</em></h1><p className="hero-copy">Vector.Worksは、Vector Praxisの既存記事・動画・販売導線を日本語圏へ再配置する実行レーンです。新規制作を増やすより、公開済み資産を自社サイトへ戻し、適切な媒体へ渡し、クリックと成果を次の配信判断へ返します。</p><div className="hero-actions"><Outbound href={FREE_ENTRY} event="vector_free_entry_click" className="button primary">無料記事から入る <ArrowUpRight size={17}/></Outbound><Outbound href={HANDOFF_ARTICLE} event="vector_handoff_article_click" className="button secondary">AIチーム設計を見る</Outbound></div></section>

    <section id="route" className="section shell"><div className="section-heading"><p>EXECUTION LOOP</p><h2>Vectorの配信ループ</h2></div><div className="route-grid"><div className="route-card"><Radar/><span><b>SCAN｜既存資産を拾う</b><small>note・サイト・動画・CTAを再利用候補として確認</small></span></div><div className="route-card"><Network/><span><b>MATCH｜導線をつなぐ</b><small>読者テーマと販売先が一致する経路だけを採用</small></span></div><div className="route-card"><RefreshCw/><span><b>MEASURE｜数字を戻す</b><small>流入・クリック・CVを見て勝ち資産を再配信</small></span></div></div></section>

    <section id="assets" className="section shell"><div className="section-heading split"><div><p>REUSED ASSETS</p><h2>今回、再利用する公開済み資産</h2></div></div><div className="resource-list">
      <article className="resource"><div className="resource-no">01</div><div className="resource-main"><span className="tag">有料note · ¥1,480</span><h3>AIを増やすほど仕事が遅くなる理由<br/>ChatGPT・Claude・GitHubを「チーム」に変える設計</h3><p>複数AIの性能比較ではなく、役割・権限・受け渡し・Buffer・PostHog・Stripeまでを一つの仕事としてつなぐ記事です。</p></div><Outbound href={HANDOFF_ARTICLE} event="vector_handoff_article_click" className="round-link"><ArrowUpRight/></Outbound></article>
      <article className="resource"><div className="resource-no">02</div><div className="resource-main"><span className="tag">有料note · ¥3,850</span><h3>AI活用を、収益につながる仕組みへ。</h3><p>生成量ではなく、AIの役割・権限・成果確認を設計し、収益へ接続するための実践記事です。</p></div><Outbound href={REVENUE_ARTICLE} event="vector_revenue_article_click" className="round-link"><ArrowUpRight/></Outbound></article>
    </div><p className="price-note">価格は2026年9月2日の公開ページ確認時点です。購入前にnote上の最新表示をご確認ください。アフィリエイト案件は、関連性・掲載条件・広告表記を確認できた場合のみ追加します。</p></section>

    <section className="section shell return-panel"><RefreshCw size={26}/><div><p>RETURN LOOP</p><h2>公開 → 計測 → 再配信。</h2><span>このページへの流入と外向きリンク操作を計測し、成果の良い資産を次の日本語媒体へ渡します。</span></div><a href="/" className="button secondary">Vector Praxis Hubへ戻る</a></section>

    <footer className="footer shell"><div><span className="brand-mark">VP</span><b>Vector.Works</b></div><p>日本語圏の配信・実行・収益回収レーン。</p><small>© 2026 Vector Praxis</small></footer>
  </main>;
}
