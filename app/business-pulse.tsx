import { Activity, ArrowUpRight, BriefcaseBusiness, Calculator, Route, Search, ShieldCheck, Sparkles } from "lucide-react";

const GWR = "https://global-work-radar.pages.dev/?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=market_signal";
const REVENUE_ARTICLE = "https://note.com/deft_eel6718/n/nc120a3159186?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=revenue_route";
const OWNED_AGENT_ARTICLE = "/ai-agent-bottleneck?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=agent_ops";
const OPERATING_KIT = "https://stratumpraxis.com/cross-agent-operating-kit.html?utm_source=vector_praxis&utm_medium=hub&utm_campaign=ai_business_pulse_20260907&utm_content=operating_kit&asset_id=cross_agent_operating_kit&route_id=vpj_business_pulse_v1";
const SPEND_CHECK = "https://stratumpraxis.com/ai-saas-waste-calculator.html?utm_source=vector_praxis&utm_medium=hub&utm_campaign=entry_radar_20260907&utm_content=saas_spend_check&route_id=vpj_entry_radar_spend_v1";

const signals = [
  { kicker: "FREE DIAGNOSTIC", value: "AI/SaaS spend check", detail: "free → $39 → $499 when justified", href: SPEND_CHECK, event: "business_pulse_spend_open" },
  { kicker: "WORK MARKET", value: "456 verified jobs", detail: "Japan-eligible global work", href: GWR, event: "business_pulse_gwr_open" },
  { kicker: "TOP PAY SIGNAL", value: "$42/hr", detail: "Japanese AI Data Trainer · verified 2026-09-06", href: GWR, event: "business_pulse_gwr_open" },
  { kicker: "REVENUE ROUTE", value: "AI → 収益パイプ", detail: "需要・入口・計測から設計", href: REVENUE_ARTICLE, event: "business_pulse_revenue_open" },
  { kicker: "AGENT OPS", value: "$69 implementation", detail: "Cross-Agent Operating Kit", href: OPERATING_KIT, event: "commerce_entry_click" },
];

const routes = [
  { icon: Calculator, title: "AI/SaaS支出を無料診断", copy: "登録なし。自分の数字から見直し額を出し、必要な場合だけ$39 / $499の次手へ進む。", href: SPEND_CHECK, event: "business_route_spend" },
  { icon: BriefcaseBusiness, title: "海外AI仕事を探す", copy: "日本から応募できるVerified Opportunityを比較する。", href: GWR, event: "business_route_gwr" },
  { icon: Sparkles, title: "AIで収益導線を作る", copy: "作る前に、需要→入口→CTA→購入までを一本にする。", href: REVENUE_ARTICLE, event: "business_route_revenue" },
  { icon: Activity, title: "AI運用の詰まりを直す", copy: "レビュー・権限・引き継ぎのボトルネックを先に特定する。", href: OWNED_AGENT_ARTICLE, event: "business_route_agent_ops" },
  { icon: Route, title: "実装キットで運用を固定する", copy: "複数AIの権限・停止条件・Human Gateを持ち運ぶ。", href: OPERATING_KIT, event: "commerce_entry_click" },
];

function SmartLink({ href, event, children, className = "", duplicate = false }: { href: string; event: string; children: React.ReactNode; className?: string; duplicate?: boolean }) {
  const external = href.startsWith("http");
  return <a href={href} data-event={event} className={className} aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}

export default function BusinessPulse() {
  return <section className="business-pulse" aria-labelledby="business-pulse-title">
    <div className="pulse-rail" aria-label="現在のAIビジネス・仕事市場シグナル">
      <div className="pulse-track">
        {[...signals, ...signals].map((signal, index) => <SmartLink key={`${signal.kicker}-${index}`} href={signal.href} event={signal.event} className="pulse-signal" duplicate={index >= signals.length}>
          <span>{signal.kicker}</span><strong>{signal.value}</strong><small>{signal.detail}</small><ArrowUpRight size={14}/>
        </SmartLink>)}
      </div>
    </div>

    <div className="shell business-pulse-inner">
      <div className="business-pulse-head">
        <div><p>AI BUSINESS PULSE</p><h2 id="business-pulse-title">興味から、すぐ次の行動へ。</h2></div>
        <div className="pulse-trust"><ShieldCheck size={17}/><span>Owned / verified routes · no copied results</span></div>
      </div>
      <p className="business-pulse-copy">市場のシグナルを眺めるだけで終わらせず、無料診断・仕事検索・既存商品へ直接つなぎます。他社の設問、結果文、ロゴ、検索結果、画面デザインは転載せず、使うのは「すぐ試せる入口→自分向け結果→必要な次手」という一般的な導線原理だけです。</p>

      <div className="business-route-grid">
        {routes.map(({ icon: Icon, title, copy, href, event }) => <SmartLink key={title} href={href} event={event} className="business-route-card">
          <div className="business-route-icon"><Icon size={20}/></div>
          <div><b>{title}</b><small>{copy}</small></div>
          <ArrowUpRight size={18}/>
        </SmartLink>)}
      </div>

      <div className="search-antenna" aria-labelledby="search-antenna-title">
        <div className="search-antenna-copy"><Search size={20}/><div><b id="search-antenna-title">外の情報をその場で探す</b><small>入力内容はVector Praxisで処理・保存せず、通常のWeb検索としてBingへ直接送ります。検索語そのものはVectorの分析イベントへ送信しません。</small></div></div>
        <form action="https://www.bing.com/search" method="get" target="_blank" rel="noopener noreferrer" className="business-search" role="search" data-event="business_web_search_submit">
          <label htmlFor="vector-web-search" className="sr-only">Web検索</label>
          <input id="vector-web-search" name="q" type="search" placeholder="例：AI 自動化 ROI 比較" autoComplete="off" required />
          <button type="submit">Bingで検索 <ArrowUpRight size={15}/></button>
        </form>
      </div>

      <div className="business-source-note">SAFE ENTRY RULE · no third-party logos, copied questionnaires, copied result text, SERP mirroring, or affiliate links without verified permission. CURRENT SIGNALS · GWR dataset generated 2026-09-06 · prices and availability can change.</div>
    </div>

    <style>{`
      .business-pulse{border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(14,19,24,.96),rgba(8,11,14,.98));overflow:hidden}
      .pulse-rail{border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden;background:#07090b}
      .pulse-track{display:flex;width:max-content;animation:pulseMarquee 34s linear infinite}
      .pulse-signal{display:grid;grid-template-columns:auto auto auto auto;gap:12px;align-items:center;min-width:max-content;padding:13px 22px;color:inherit;text-decoration:none;border-right:1px solid rgba(255,255,255,.08)}
      .pulse-signal span{font-size:10px;letter-spacing:.16em;color:#8e9aa5}.pulse-signal strong{font-size:13px;color:#f5f7f8}.pulse-signal small{font-size:11px;color:#91a0aa}.pulse-signal svg{color:#b9f7d2}
      .business-pulse-inner{padding-top:54px;padding-bottom:58px}.business-pulse-head{display:flex;justify-content:space-between;gap:24px;align-items:end}.business-pulse-head p{font-size:11px;letter-spacing:.2em;color:#8ea0aa;margin:0 0 10px}.business-pulse-head h2{font-size:clamp(30px,4vw,52px);line-height:1.02;margin:0;letter-spacing:-.04em}.pulse-trust{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid rgba(185,247,210,.22);border-radius:999px;color:#b9f7d2;font-size:11px;white-space:nowrap}.business-pulse-copy{max-width:820px;color:#aab5bc;line-height:1.8;margin:20px 0 28px}.business-route-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.business-route-card{position:relative;min-height:185px;padding:20px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.035);color:inherit;text-decoration:none;display:flex;flex-direction:column;transition:transform .2s ease,border-color .2s ease,background .2s ease}.business-route-card:hover{transform:translateY(-3px);border-color:rgba(185,247,210,.35);background:rgba(185,247,210,.06)}.business-route-card>svg{position:absolute;right:18px;top:18px;color:#b9f7d2}.business-route-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(185,247,210,.08);color:#b9f7d2;margin-bottom:auto}.business-route-card b{display:block;font-size:16px;line-height:1.35;margin:20px 30px 8px 0}.business-route-card small{display:block;color:#95a2aa;line-height:1.55}.search-antenna{margin-top:18px;padding:20px;border:1px solid rgba(121,200,255,.2);border-radius:18px;background:linear-gradient(120deg,rgba(121,200,255,.055),rgba(255,255,255,.025));display:grid;grid-template-columns:minmax(240px,.8fr) minmax(320px,1.2fr);gap:24px;align-items:center}.search-antenna-copy{display:flex;gap:12px;align-items:flex-start}.search-antenna-copy>svg{color:#79c8ff;margin-top:2px;flex:none}.search-antenna-copy b{display:block;font-size:15px}.search-antenna-copy small{display:block;color:#8f9da7;line-height:1.6;margin-top:5px}.business-search{display:grid;grid-template-columns:1fr auto;gap:8px}.business-search input{min-width:0;padding:13px 14px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#070a0d;color:#f5f7f8;font:inherit}.business-search input::placeholder{color:#65727c}.business-search button{display:inline-flex;align-items:center;gap:8px;padding:0 15px;border:1px solid rgba(121,200,255,.35);border-radius:10px;background:#101d28;color:#dff2ff;font-weight:700;cursor:pointer}.business-search button:hover{background:#152737}.business-source-note{margin-top:16px;font-size:10px;letter-spacing:.06em;line-height:1.6;color:#67747c}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.pulse-signal:focus-visible,.business-route-card:focus-visible,.business-search input:focus-visible,.business-search button:focus-visible{outline:2px solid #b9f7d2;outline-offset:3px}
      @keyframes pulseMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @media(max-width:1050px){.business-route-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:900px){.business-route-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.business-pulse-head{align-items:flex-start;flex-direction:column}.pulse-trust{white-space:normal}.search-antenna{grid-template-columns:1fr}}
      @media(max-width:560px){.business-route-grid{grid-template-columns:1fr}.business-route-card{min-height:150px}.pulse-signal{padding:12px 16px;gap:8px}.pulse-signal small{display:none}.business-search{grid-template-columns:1fr}.business-search button{min-height:44px;justify-content:center}}
      @media(prefers-reduced-motion:reduce){.pulse-track{animation:none}.business-route-card{transition:none}}
    `}</style>
  </section>;
}
