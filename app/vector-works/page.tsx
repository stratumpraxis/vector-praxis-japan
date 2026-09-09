import { ArrowUpRight, BookOpen, Gauge, RefreshCw, Share2 } from "lucide-react";
import { VectorFooter, VectorHeader } from "@/components/vector-chrome";
import { VectorNext } from "@/components/vector-next";

const HANDOFF_ARTICLE = "https://note.com/deft_eel6718/n/ncaff8351e529?utm_source=vector_praxis_site&utm_medium=owned&utm_campaign=vector_works_reuse_20260902&utm_content=handoff_article";
const REVENUE_ARTICLE = "https://note.com/deft_eel6718/n/nfce5ac047c15?utm_source=vector_praxis_site&utm_medium=owned&utm_campaign=vector_works_reuse_20260902&utm_content=revenue_article";
const FREE_ENTRY = "https://note.com/deft_eel6718/n/n86dddd12d2b2?utm_source=vector_praxis_site&utm_medium=owned&utm_campaign=vector_works_reuse_20260902&utm_content=free_entry";

function Out({ href, event, children, className = "" }: { href: string; event: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-event={event} className={className}>{children}</a>;
}

export default function VectorWorksPage() {
  return <main className="vx-page tone-build">
    <VectorHeader tone="build"/>

    <section className="vx-work-hero shell">
      <div className="vx-breadcrumb">BUILD <span>→</span> DISTRIBUTE <span>→</span> EARN <span>→</span> RETURN</div>
      <span className="vx-chip">Vector Works</span>
      <h1>作るだけで終わらせない。<br/>届けて、反応を次へ戻す。</h1>
      <p>公開済みのVector資産を、必要な人へ届け、クリックと購入反応を次の行動へ返す実行レーンです。</p>
      <div className="vx-actions"><Out href={FREE_ENTRY} event="vector_free_entry_click" className="vx-button primary"><BookOpen size={17}/> 無料記事から見る <ArrowUpRight size={15}/></Out><a href="#loop" className="vx-button ghost">流れを見る</a></div>
      <div id="loop" className="vx-loop" aria-label="Vector distribution loop">
        <div><small>01 / READ</small><b>既存資産を拾う</b></div>
        <div><small>02 / SHARE</small><b>適切な場所へ届ける</b></div>
        <div><small>03 / EARN</small><b>CTA・購入を見る</b></div>
        <div><small>04 / RETURN</small><b>反応を次へ戻す</b></div>
      </div>
    </section>

    <section className="vx-section shell">
      <div className="vx-section-head"><span>ACTIVE ASSETS</span><h2>いま使う公開資産</h2><p>新しく増やす前に、既に公開されているVector資産から使います。</p></div>
      <div>
        <div className="vx-asset-row"><span>01</span><div><b>AIを増やすほど仕事が遅くなる理由</b><small>複数AIの役割・権限・引き継ぎ。</small></div><Out href={HANDOFF_ARTICLE} event="vector_handoff_article_click">読む <ArrowUpRight size={14}/></Out></div>
        <div className="vx-asset-row"><span>02</span><div><b>AI活用を、収益につながる仕組みへ。</b><small>AI運用を成果確認とRevenueまでつなぐ。</small></div><Out href={REVENUE_ARTICLE} event="vector_revenue_article_click">読む <ArrowUpRight size={14}/></Out></div>
      </div>
    </section>

    <section className="vx-earn-focus shell">
      <div className="vx-earn-badge"><Gauge size={18}/> MEASURE</div>
      <div><h2>配った数ではなく、<br/>次へ進んだ反応を見る。</h2><p>Read → CTA → Product → Checkout のどこで動いたかを次の配信判断へ戻します。</p></div>
      <a href="/" className="vx-button earn"><RefreshCw size={16}/> Hubへ戻る</a>
    </section>

    <VectorNext
      title="このあと何をする？"
      routes={[
        { label:"READ", title:"無料記事を読む", text:"低摩擦でVectorを試す。", href:FREE_ENTRY, event:"vector_free_entry_click", kind:"read", external:true },
        { label:"BUILD", title:"AIチーム設計を見る", text:"複数AIを止めない構造へ。", href:HANDOFF_ARTICLE, event:"vector_handoff_article_click", kind:"build", external:true },
        { label:"RETURN", title:"Vector Hub", text:"Start / Build / Earnから別ルートへ。", href:"/", event:"return_to_hub", kind:"return" },
      ]}
    />

    <VectorFooter/>
  </main>;
}
