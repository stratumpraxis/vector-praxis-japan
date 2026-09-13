import type { Metadata } from "next";
import { ArrowUpRight, Check, Gauge, WalletCards } from "lucide-react";
import { siteOrigin } from "@/lib/site-url";
import { VectorFooter, VectorHeader } from "@/components/vector-chrome";
import { VectorNext } from "@/components/vector-next";
import BottleneckRouter from "./bottleneck-router";

const ROUTE_ID = "vpj_owned_ai_agent_bottleneck_v2";
const NOTE_DEEP_DIVE = `https://note.com/deft_eel6718/n/ncaff8351e529?utm_source=vector_praxis_site&utm_medium=owned_article&utm_campaign=ai_agent_bottleneck_owned_20260913&utm_content=paid_note_primary&asset_id=note_ncaff8351e529&route_id=${ROUTE_ID}`;

export const metadata: Metadata = {
  title: "複数AIエージェント運用が遅くなる理由｜Vector Praxis",
  description: "AIを増やしても仕事が速くならない原因を、レビュー待ち・引き継ぎ・権限境界から整理。詰まりを選び、Vectorの既存記事へ最短で進めます。",
  alternates: { canonical: `${siteOrigin}/ai-agent-bottleneck` },
  openGraph: { title: "複数AIエージェント運用が遅くなる理由", description: "ボトルネックは生成速度ではなく、レビュー待ち・引き継ぎ・権限境界にある。", type: "article", locale: "ja_JP", siteName: "Vector Praxis" },
};

function Out({ href, event, children, className = "" }: { href: string; event: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-event={event} data-route-id={ROUTE_ID} className={className}>{children}</a>;
}

export default function AiAgentBottleneckPage() {
  return <main className="vx-page tone-read">
    <VectorHeader tone="read"/>

    <section className="vx-article-hero shell">
      <div className="vx-breadcrumb">READ <span>→</span> AI PRACTICE <span>→</span> EARN</div>
      <div className="vx-article-layout">
        <div>
          <span className="vx-chip">5 min · Practical Guide</span>
          <h1>AIを増やしても、<br/><em>仕事は速くならない。</em></h1>
          <p>詰まるのはAIの性能ではなく、<strong>待ち・権限・引き継ぎ</strong>。まず無料で詰まりを切り分け、必要ならVectorの既存深掘り記事へ進みます。</p>
          <div className="vx-actions">
            <a href="#diagnose" className="vx-button primary">詰まりから次を選ぶ</a>
            <Out href={NOTE_DEEP_DIVE} event="primary_cta_click" className="vx-button ghost">深掘り記事を見る ¥1,480 <ArrowUpRight size={16}/></Out>
          </div>
        </div>
        <div className="vx-route-preview" aria-label="Vector revenue route preview">
          <span className="vx-preview-label">YOUR ROUTE</span>
          <div className="vx-route-step done"><Check size={15}/><span>Read<small>今ここ</small></span></div>
          <div className="vx-route-line"/>
          <div className="vx-route-step"><Gauge size={16}/><span>Diagnose<small>詰まりを選ぶ</small></span></div>
          <div className="vx-route-line"/>
          <div className="vx-route-step earn"><WalletCards size={16}/><span>Next<small>必要なら有料記事へ</small></span></div>
        </div>
      </div>
    </section>

    <section id="diagnose" className="vx-section shell">
      <div className="vx-section-head"><span>01 / ROUTE</span><h2>いま一番近い詰まりは？</h2><p>1つ選ぶだけ。まず原因を切り分け、詰まりに合う説明からVectorの既存有料記事へつなぎます。</p></div>
      <BottleneckRouter />
    </section>

    <section id="fix" className="vx-section vx-soft">
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
      <div><h2>AIを増やす前に、<br/>受け渡しの設計を深掘る。</h2><p>ChatGPT・Claude・GitHubなどを重複させず、役割・権限・受け渡し・計測まで一続きで整理したVectorの有料noteへ進めます。</p></div>
      <Out href={NOTE_DEEP_DIVE} event="primary_cta_click" className="vx-button earn">¥1,480の記事を見る <ArrowUpRight size={16}/></Out>
    </section>

    <VectorNext
      title="次へ進むなら"
      routes={[
        { label:"DEEP DIVE", title:"AIを増やすほど仕事が遅くなる理由", text:"ChatGPT・Claude・GitHubをチームとして動かす設計を、Vectorの有料noteで深掘り。", href:NOTE_DEEP_DIVE, event:"primary_cta_click", kind:"earn", external:true },
        { label:"RETURN", title:"Vector Hubへ戻る", text:"Start / Build / Earnから別ルートを選ぶ。", href:"/", event:"return_to_hub", kind:"return" },
      ]}
    />

    <VectorFooter/>
  </main>;
}
