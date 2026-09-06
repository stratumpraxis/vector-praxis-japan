import { Activity, ArrowUpRight, BriefcaseBusiness, Route, ShieldCheck, Sparkles } from "lucide-react";

const GWR = "https://global-work-radar.pages.dev/?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=market_signal";
const REVENUE_ARTICLE = "https://note.com/deft_eel6718/n/nc120a3159186?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=revenue_route";
const OWNED_AGENT_ARTICLE = "/ai-agent-bottleneck?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=agent_ops";
const OPERATING_KIT = "https://stratumpraxis.com/cross-agent-operating-kit.html?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=operating_kit&asset_id=cross_agent_operating_kit&route_id=vpj_business_pulse_v1";

const signals = [
  { kicker: "WORK MARKET", value: "456 verified jobs", detail: "Japan-eligible global work", href: GWR, event: "business_pulse_gwr_open" },
  { kicker: "TOP PAY SIGNAL", value: "$42/hr", detail: "Japanese AI Data Trainer · verified 2026-09-06", href: GWR, event: "business_pulse_gwr_open" },
  { kicker: "REVENUE ROUTE", value: "AI → 収益パイプ", detail: "需要・入口・計測から設計", href: REVENUE_ARTICLE, event: "business_pulse_revenue_open" },
  { kicker: "AGENT OPS", value: "$69 implementation", detail: "Cross-Agent Operating Kit", href: OPERATING_KIT, event: "business_pulse_kit_open" },
];

const routes = [
  { icon: Sparkles, title: "AIで収益導線を作る", copy: "作る前に、需要→入口→CTA→購入までを一本にする。", href: REVENUE_ARTICLE, event: "business_route_revenue" },
  { icon: Activity, title: "AI運用の詰まりを直す", copy: "レビュー・権限・引き継ぎのボトルネックを先に特定する。", href: OWNED_AGENT_ARTICLE, event: "business_route_agent_ops" },
  { icon: BriefcaseBusiness, title: "海外AI仕事を探す", copy: "日本から応募できるVerified Opportunityを比較する。", href: GWR, event: "business_route_gwr" },
  { icon: Route, title: "実装キットで運用を固定する", copy: "複数AIの権限・停止条件・Human Gateを持ち運ぶ。", href: OPERATING_KIT, event: "business_route_kit" },
];

function SmartLink({ href, event, children, className = "" }: { href: string; event: string; children: React.ReactNode; className?: string }) {
  const external = href.startsWith("http");
  return <a href={href} data-event={event} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}

export default function BusinessPulse() {
  return <section className="business-pulse" aria-labelledby="business-pulse-title">
    <div className="pulse-rail" aria-label="現在のAIビジネス・仕事市場シグナル">
      <div className="pulse-track">
        {[...signals, ...signals].map((signal, index) => <SmartLink key={`${signal.kicker}-${index}`} href={signal.href} event={signal.event} className="pulse-signal">
          <span>{signal.kicker}</span><strong>{signal.value}</strong><small>{signal.detail}</small><ArrowUpRight size={14}/>
        </SmartLink>)}
      </div>
    </div>

    <div className="shell business-pulse-inner">
      <div className="business-pulse-head">
        <div><p>AI BUSINESS PULSE</p><h2 id="business-pulse-title">興味から、すぐ次の行動へ。</h2></div>
        <div className="pulse-trust"><ShieldCheck size={17}/><span>Verified / owned destinations only</span></div>
      </div>
      <p className="business-pulse-copy">市場のシグナルを眺めるだけで終わらせず、目的に合う既存資産へ直接つなぎます。外部データは確認できる出所を優先し、未確認のAffiliateや転載コンテンツは載せません。</p>
      <div className="business-route-grid">
        {routes.map(({ icon: Icon, title, copy, href, event }) => <SmartLink key={title} href={href} event={event} className="business-route-card">
          <div className="business-route-icon"><Icon size={20}/></div>
          <div><b>{title}</b><small>{copy}</small></div>
          <ArrowUpRight size={18}/>
        </SmartLink>)}
      </div>
      <div className="business-source-note">CURRENT SIGNALS · GWR verified dataset generated 2026-09-06 · Prices and availability can change; final terms are confirmed at each destination.</div>
    </div>

    <style>{`
      .business-pulse{border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(14,19,24,.96),rgba(8,11,14,.98));overflow:hidden}
      .pulse-rail{border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden;background:#07090b}
      .pulse-track{display:flex;width:max-content;animation:pulseMarquee 34s linear infinite}
      .pulse-signal{display:grid;grid-template-columns:auto auto auto auto;gap:12px;align-items:center;min-width:max-content;padding:13px 22px;color:inherit;text-decoration:none;border-right:1px solid rgba(255,255,255,.08)}
      .pulse-signal span{font-size:10px;letter-spacing:.16em;color:#8e9aa5}.pulse-signal strong{font-size:13px;color:#f5f7f8}.pulse-signal small{font-size:11px;color:#91a0aa}.pulse-signal svg{color:#b9f7d2}
      .business-pulse-inner{padding-top:54px;padding-bottom:58px}.business-pulse-head{display:flex;justify-content:space-between;gap:24px;align-items:end}.business-pulse-head p{font-size:11px;letter-spacing:.2em;color:#8ea0aa;margin:0 0 10px}.business-pulse-head h2{font-size:clamp(30px,4vw,52px);line-height:1.02;margin:0;letter-spacing:-.04em}.pulse-trust{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid rgba(185,247,210,.22);border-radius:999px;color:#b9f7d2;font-size:11px;white-space:nowrap}.business-pulse-copy{max-width:760px;color:#aab5bc;line-height:1.8;margin:20px 0 28px}.business-route-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.business-route-card{position:relative;min-height:185px;padding:20px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.035);color:inherit;text-decoration:none;display:flex;flex-direction:column;transition:transform .2s ease,border-color .2s ease,background .2s ease}.business-route-card:hover{transform:translateY(-3px);border-color:rgba(185,247,210,.35);background:rgba(185,247,210,.06)}.business-route-card>svg{position:absolute;right:18px;top:18px;color:#b9f7d2}.business-route-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(185,247,210,.08);color:#b9f7d2;margin-bottom:auto}.business-route-card b{display:block;font-size:16px;line-height:1.35;margin:20px 30px 8px 0}.business-route-card small{display:block;color:#95a2aa;line-height:1.55}.business-source-note{margin-top:16px;font-size:10px;letter-spacing:.08em;color:#67747c}.pulse-signal:focus-visible,.business-route-card:focus-visible{outline:2px solid #b9f7d2;outline-offset:3px}
      @keyframes pulseMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @media(max-width:900px){.business-route-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.business-pulse-head{align-items:flex-start;flex-direction:column}.pulse-trust{white-space:normal}}
      @media(max-width:560px){.business-route-grid{grid-template-columns:1fr}.business-route-card{min-height:150px}.pulse-signal{padding:12px 16px;gap:8px}.pulse-signal small{display:none}}
      @media(prefers-reduced-motion:reduce){.pulse-track{animation:none}.business-route-card{transition:none}}
    `}</style>
  </section>;
}
