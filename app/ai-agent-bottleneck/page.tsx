import type { Metadata } from "next";
import { ArrowUpRight, Check, GitBranch, Gauge, ShieldCheck, TimerReset, WalletCards } from "lucide-react";
import { siteOrigin } from "@/lib/site-url";
import { VectorFooter, VectorHeader } from "@/components/vector-chrome";
import { VectorNext } from "@/components/vector-next";

const ROUTE_ID = "vpj_owned_ai_agent_bottleneck_v1";
const OPERATING_KIT = `https://stratumpraxis.com/cross-agent-operating-kit.html?utm_source=vector_praxis&utm_medium=owned_article&utm_campaign=ai_agent_bottleneck_owned_20260904&utm_content=primary_cta&asset_id=cross_agent_operating_kit&route_id=${ROUTE_ID}`;
const AGENT_ECONOMICS_CALCULATOR = `https://stratumpraxis.com/ai-agent-economics-calculator.html?utm_source=vector_praxis&utm_medium=owned_article&utm_campaign=agent_economics_20260908&utm_content=bottleneck_cta&route_id=${ROUTE_ID}`;
const NOTE_DEEP_DIVE = "https://note.com/deft_eel6718/n/ncaff8351e529?utm_source=vector_praxis_site&utm_medium=owned_article&utm_campaign=ai_agent_bottleneck_owned_20260904&utm_content=paid_note_secondary";

export const metadata: Metadata = {
  title: "複数AIエージェント運用が遅くなる理由｜Vector Praxis",
  description: "AIを増やしても仕事が速くならない原因を、レビュー待ち・引き継ぎ・権限境界から整理。次の実装ルートまで短く案内します。",
  alternates: { canonical: `${siteOrigin}/ai-agent-bottleneck` },
  openGraph: { title: "複数AIエージェント運用が遅くなる理由", description: "ボトルネックは生成速度ではなく、レビュー待ち・引き継ぎ・権限境界にある。", type: "article", locale: "ja_JP", siteName: "Vector Praxis" },
};

function Out({ href, event, children, className = "" }: { href: string; event: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-event={event} className={className}>{children}</a>;
}

const bottlenecks = [
  { icon:<TimerReset/>, label:"WAIT", title:"レビュー待ち", text:"生成後に人の確認で止まる。" },
  { icon:<ShieldCheck/>, label:"RULE", title:"権限が曖昧", text:"毎回「ここまで進めていい？」が発生。" },
  { icon:<GitBranch/>, label:"HANDOFF", title:"引き継ぎ不足", text:"次のAIが状態を読み直す。" },
];

export default function AiAgentBottleneckPage() {
  return <main className="vx-page tone-read">
    <VectorHeader tone="read"/>

    <section className="vx-article-hero shell">
      <div className="vx-breadcrumb">READ <span>→</span> AI PRACTICE <span>→</span> EARN</div>
      <div className="vx-article-layout">
        <div>
          <span className="vx-chip">5 min · Practical Guide</span>
          <h1>AIを増やしても、<br/><em>仕事は速くならない。</em></h1>
          <p>詰まるのはAIの性能ではなく、<strong>待ち・権限・引き継ぎ</strong>。まず3つだけ確認します。</p>
          <div className="vx-actions">
            <Out href={AGENT_ECONOMICS_CALCULATOR} event="agent_economics_calculator_open" className="vx-button primary"><Gauge size={18}/> 無料で採算を見る <ArrowUpRight size={16}/></Out>
            <a href="#diagnose" className="vx-button ghost">まず原因を見る</a>
          </div>
        </div>
        <div className="vx-route-preview" aria-label="Vector revenue route preview">
          <span className="vx-preview-label">YOUR ROUTE</span>
          <div className="vx-route-step done"><Check size={15}/><span>Read<small>今ここ</small></span></div>
          <div className="vx-route-line"/>
          <div className="vx-route-step"><Gauge size={16}/><span>Check<small>採算を確認</small></span></div>
          <div className="vx-route-line"/>
          <div className="vx-route-step earn"><WalletCards size={16}/><span>Earn<small>実装へ</small></span></div>
        </div>
      </div>
    </section>

    <section id="diagnose" className="vx-section shell">
      <div className="vx-section-head"><span>01 / CHECK</span><h2>どこで止まっていますか？</h2><p>長い診断は不要。近いものを1つ見るだけでOKです。</p></div>
      <div className="vx-choice-grid">
        {bottlenecks.map((item, i)=><article className={`vx-choice ${i===0?"recommended":""}`} key={item.label}>
          <span className="vx-choice-icon">{item.icon}</span>
          <span><small>{item.label}</small><b>{item.title}</b><em>{item.text}</em></span>
          {i===0&&<mark>よくある</mark>}
        </article>)}
      </div>
    </section>

    <section className="vx-section vx-soft">
      <div className="shell vx-solution-layout">
        <div className="vx-section-head"><span>02 / FIX</span><h2>増やすより、先に3つ決める。</h2></div>
        <ol className="vx-rule-list">
          <li><span>01</span><div><b>Role</b><p>誰が調査・判断・実装するか。</p></div></li>
          <li><span>02</span><div><b>Authority</b><p>どこまで自動で進めてよいか。</p></div></li>
          <li><span>03</span><div><b>Handoff</b><p>次の担当へ何を渡すか。</p></div></li>
        </ol>
      </div>
    </section>

    <section className="vx-earn-focus shell">
      <div className="vx-earn-badge"><WalletCards size={18}/> EARN ROUTE</div>
      <div><h2>次は「速いか」ではなく、<br/>成功1件あたりの採算を見る。</h2><p>モデル/API費・再試行・失敗・人レビューを含めて、続ける価値があるかを判断します。</p></div>
      <Out href={AGENT_ECONOMICS_CALCULATOR} event="agent_economics_calculator_open" className="vx-button earn">無料で計算する <ArrowUpRight size={16}/></Out>
    </section>

    <VectorNext
      title="結果に合わせて、次へ"
      routes={[
        { label:"RECOMMENDED PRODUCT", title:"Cross-Agent Operating Kit", text:"役割・権限・Human Gateを実装する。", href:OPERATING_KIT, event:"commerce_entry_click", kind:"earn", external:true },
        { label:"READ MORE", title:"AIを増やすほど仕事が遅くなる理由", text:"背景を文章で深く理解する。", href:NOTE_DEEP_DIVE, event:"product_click", kind:"read", external:true },
        { label:"RETURN", title:"Vector Hubへ戻る", text:"Start / Build / Earnから別ルートを選ぶ。", href:"/", event:"return_to_hub", kind:"return" },
      ]}
    />

    <VectorFooter/>
  </main>;
}
