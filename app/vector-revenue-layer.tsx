"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Layers3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

type IntentId = "organize" | "revenue" | "solo";
type RevenueAsset = {
  id: string;
  title: string;
  href: string;
  label: string;
  status: "FREE" | "PAID";
  price?: string;
  verified: string;
  intents: IntentId[];
  fit: string;
  outcome: string;
  next: string;
};

const revenueAssets: RevenueAsset[] = [
  {
    id: "ai-team-design",
    title: "AIを増やすほど仕事が遅くなる理由 ── ChatGPT・Claude・GitHubを『チーム』に変える設計",
    href: "https://note.com/deft_eel6718/n/ncaff8351e529",
    label: "AI TEAM / OPERATIONS",
    status: "PAID",
    price: "¥1,480",
    verified: "2026-09-02",
    intents: ["organize", "solo"],
    fit: "複数AIの役割・工程・引き継ぎが増え、運用が重くなっている人向け。",
    outcome: "AIを増やす前に、役割分担と仕事の流れを整理する。",
    next: "運用設計を見る",
  },
  {
    id: "ai-revenue-system",
    title: "AI活用を、収益につながる仕組みへ。",
    href: "https://note.com/deft_eel6718/n/nfce5ac047c15",
    label: "AI / REVENUE",
    status: "PAID",
    price: "¥3,850",
    verified: "2026-09-02",
    intents: ["revenue"],
    fit: "AI活用を『便利』で終わらせず、収益行動へ接続したい人向け。",
    outcome: "制作・運用・導線を、Revenueへ近い順に組み直す。",
    next: "収益設計を見る",
  },
  {
    id: "revenue-pipe-2026",
    title: "AIで作るだけでは稼げない。2026年、AIを『収益パイプ』に変える実践設計",
    href: "https://note.com/deft_eel6718/n/nc120a3159186",
    label: "REVENUE PIPE",
    status: "PAID",
    price: "¥1,980",
    verified: "repo verified",
    intents: ["revenue", "solo"],
    fit: "作る → 届ける → 次の収益行動まで一本につなげたい人向け。",
    outcome: "制作物を公開で止めず、Buyer actionまで流す。",
    next: "収益パイプを見る",
  },
  {
    id: "seo-five-steps",
    title: "AIでSEO記事作成を効率化するなら、『書く』より先に見直したい5つの工程",
    href: "https://note.com/deft_eel6718/n/n86dddd12d2b2",
    label: "SEO / WORKFLOW",
    status: "FREE",
    verified: "public",
    intents: ["organize", "revenue", "solo"],
    fit: "まず無料で、制作工程の詰まりを見直したい人向け。",
    outcome: "書く前の5工程から、無駄な作業を減らす。",
    next: "無料で読む",
  },
];

const intents: Array<{ id: IntentId; label: string; detail: string; icon: React.ReactNode }> = [
  { id: "organize", label: "AIの仕事を整える", detail: "役割・工程・引き継ぎを整理", icon: <Layers3 size={18} /> },
  { id: "revenue", label: "収益につなげる", detail: "制作からRevenueまで短くする", icon: <CircleDollarSign size={18} /> },
  { id: "solo", label: "一人運用を強くする", detail: "少人数で回る構造へ寄せる", icon: <Zap size={18} /> },
];

const legacyCrossProjectFragments = [
  "/revenue-router.html",
  "/ai-monetization-reality-check.html",
  "/global-digital-product-ai-starter-kit.html",
  "/smartphone-ai-slide-factory.html",
  "/return-gate/",
];

function capture(event: string, props: Record<string, unknown> = {}) {
  try {
    (window as unknown as { posthog?: { capture: (name: string, properties?: Record<string, unknown>) => void } }).posthog?.capture(event, {
      surface: "vector_independent_revenue_v2",
      ...props,
    });
  } catch {}
}

function withAttribution(asset: RevenueAsset, intent: IntentId) {
  try {
    const url = new URL(asset.href);
    url.searchParams.set("utm_source", "vector_praxis");
    url.searchParams.set("utm_medium", "owned_hub");
    url.searchParams.set("utm_campaign", "vector_independent_revenue_v2");
    url.searchParams.set("utm_content", `${intent}_${asset.id}`);
    return url.toString();
  } catch {
    return asset.href;
  }
}

function suppressLegacyCrossProjectRoutes() {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    if (!legacyCrossProjectFragments.some((fragment) => anchor.href.includes(fragment))) return;
    anchor.hidden = true;
    anchor.setAttribute("aria-hidden", "true");
    anchor.tabIndex = -1;
    anchor.dataset.vectorLegacyRoute = "suppressed";
  });
}

function RevenueExperience() {
  const [intent, setIntent] = useState<IntentId>("revenue");
  const [resumed, setResumed] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedIntent = localStorage.getItem("vector-revenue-intent") as IntentId | null;
      const savedAsset = localStorage.getItem("vector-revenue-last-asset");
      if (savedIntent && intents.some((item) => item.id === savedIntent)) setIntent(savedIntent);
      if (savedAsset && revenueAssets.some((asset) => asset.id === savedAsset)) setResumed(savedAsset);
    } catch {}
    capture("vector_revenue_surface_view", { paid_assets: 3, free_assets: 1 });
  }, []);

  const paidMatches = useMemo(
    () => revenueAssets.filter((asset) => asset.status === "PAID" && asset.intents.includes(intent)),
    [intent],
  );
  const primary = paidMatches[0] ?? revenueAssets.find((asset) => asset.status === "PAID")!;
  const alternatives = revenueAssets.filter((asset) => asset.status === "PAID" && asset.id !== primary.id).slice(0, 2);
  const freeAsset = revenueAssets.find((asset) => asset.status === "FREE")!;
  const resumedAsset = resumed ? revenueAssets.find((asset) => asset.id === resumed) ?? null : null;

  useEffect(() => {
    try { localStorage.setItem("vector-revenue-intent", intent); } catch {}
    capture("vector_revenue_match_view", { intent, primary_asset: primary.id, price: primary.price ?? null });
  }, [intent, primary.id, primary.price]);

  const openAsset = (asset: RevenueAsset, source: string) => {
    try { localStorage.setItem("vector-revenue-last-asset", asset.id); } catch {}
    setResumed(asset.id);
    capture(asset.status === "PAID" ? "vector_paid_asset_click" : "vector_free_asset_click", {
      intent,
      asset_id: asset.id,
      asset_status: asset.status,
      price: asset.price ?? null,
      source,
      destination_host: "note.com",
    });
  };

  return (
    <section className="vr2" aria-labelledby="vr2-title">
      <div className="vr2-motion" aria-hidden="true">
        <span className="vr2-orbit vr2-orbit-a" />
        <span className="vr2-orbit vr2-orbit-b" />
        <span className="vr2-orbit vr2-orbit-c" />
        <span className="vr2-signal vr2-signal-a" />
        <span className="vr2-signal vr2-signal-b" />
      </div>

      <div className="vr2-topline">
        <span><Sparkles size={13} /> VECTOR REVENUE FRONT DOOR</span>
        <span className="vr2-independent"><ShieldCheck size={13} /> VECTOR-OWNED ROUTES</span>
      </div>

      <div className="vr2-head">
        <div className="vr2-copy">
          <p className="vr2-kicker">USE → BUILD → EARN</p>
          <h2 id="vr2-title">AIを使うだけで終わらせない。<br />次の収益行動まで。</h2>
          <p>新商品を増やさず、Vectorの既存有料資産から目的に一番近い1つを先に出します。</p>
        </div>
        <div className="vr2-flow" aria-label="Vector revenue flow">
          <span>INTENT</span><ArrowRight size={14} /><span>MATCH</span><ArrowRight size={14} /><span>NOTE</span><ArrowRight size={14} /><b>CHECKOUT</b>
        </div>
      </div>

      <div className="vr2-trust" aria-label="Revenue route verification">
        <span><CheckCircle2 size={14} /> 既存資産のみ</span>
        <span><CheckCircle2 size={14} /> note決済導線</span>
        <span><CheckCircle2 size={14} /> 架空CTAなし</span>
      </div>

      <div className="vr2-intents" role="group" aria-label="目的を選ぶ">
        {intents.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={intent === item.id}
            onClick={() => {
              setIntent(item.id);
              capture("vector_revenue_intent_select", { intent: item.id });
            }}
          >
            <i>{item.icon}</i>
            <span><b>{item.label}</b><small>{item.detail}</small></span>
          </button>
        ))}
      </div>

      <div className="vr2-grid">
        <article className="vr2-primary">
          <div className="vr2-card-head">
            <span className="vr2-badge is-paid">BEST MATCH</span>
            <span className="vr2-price">{primary.price}</span>
          </div>
          <small>{primary.label}</small>
          <h3>{primary.title}</h3>
          <p>{primary.fit}</p>
          <div className="vr2-outcome"><CheckCircle2 size={16} /><span>{primary.outcome}</span></div>
          <div className="vr2-card-foot">
            <span>route verified: {primary.verified}</span>
            <a
              href={withAttribution(primary, intent)}
              target="_blank"
              rel="noreferrer"
              onClick={() => openAsset(primary, "primary_match")}
            >
              {primary.next} <ArrowUpRight size={16} />
            </a>
          </div>
        </article>

        <div className="vr2-alts">
          <div className="vr2-alts-head"><span>OTHER PAID ROUTES</span><span>{alternatives.length}</span></div>
          {alternatives.map((asset) => (
            <a
              key={asset.id}
              href={withAttribution(asset, intent)}
              target="_blank"
              rel="noreferrer"
              onClick={() => openAsset(asset, "alternative_match")}
            >
              <span className="vr2-mini-price">{asset.price}</span>
              <span><small>{asset.label}</small><b>{asset.title}</b></span>
              <ArrowUpRight size={15} />
            </a>
          ))}

          <a
            className="vr2-free"
            href={withAttribution(freeAsset, intent)}
            target="_blank"
            rel="noreferrer"
            onClick={() => openAsset(freeAsset, "free_entry")}
          >
            <BookOpen size={16} />
            <span><small>NOT READY TO BUY?</small><b>{freeAsset.next}</b></span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>

      <div className="vr2-bottom">
        <p>購入前に目的を選ぶ。商品一覧を眺める時間を減らす。</p>
        <div>
          {resumedAsset && (
            <a href={withAttribution(resumedAsset, intent)} target="_blank" rel="noreferrer" onClick={() => openAsset(resumedAsset, "resume")}>
              <RotateCcw size={14} /> 前回の続き
            </a>
          )}
          <a href="https://note.com/deft_eel6718" target="_blank" rel="noreferrer" onClick={() => capture("vector_note_library_open", { source: "revenue_front_door" })}>
            Vector note一覧 <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

const styles = `
html.vector-independent-revenue-v2 .vector-home{position:relative;isolation:isolate;overflow:hidden}
html.vector-independent-revenue-v2 .vector-home::before{content:"";position:fixed;inset:-20vh -10vw auto;z-index:-2;height:78vh;pointer-events:none;background:radial-gradient(circle at 18% 28%,rgba(37,99,235,.20),transparent 34%),radial-gradient(circle at 82% 20%,rgba(14,165,233,.14),transparent 30%),radial-gradient(circle at 50% 55%,rgba(99,102,241,.10),transparent 38%);filter:blur(10px);animation:vr2-aurora 16s ease-in-out infinite alternate}
html.vector-independent-revenue-v2 .vector-home::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.18;background-image:linear-gradient(rgba(148,163,184,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.08) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(to bottom,black,transparent 72%);animation:vr2-grid 22s linear infinite}
.vr2-portal-host{position:relative;z-index:3}
.vr2{position:relative;max-width:1160px;margin:34px auto 68px;padding:34px;border:1px solid rgba(148,163,184,.16);border-radius:30px;overflow:hidden;background:linear-gradient(145deg,rgba(7,12,24,.94),rgba(11,18,34,.90));box-shadow:0 32px 90px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.04);color:#e5eefc}
.vr2::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(120deg,rgba(56,189,248,.05),transparent 32%,transparent 67%,rgba(99,102,241,.06))}
.vr2-motion{position:absolute;inset:0;pointer-events:none;overflow:hidden;opacity:.74}
.vr2-orbit{position:absolute;border:1px solid rgba(96,165,250,.15);border-radius:999px;transform-origin:center}
.vr2-orbit-a{width:520px;height:520px;right:-180px;top:-260px;animation:vr2-spin 28s linear infinite}
.vr2-orbit-b{width:350px;height:350px;right:-70px;top:-155px;border-style:dashed;animation:vr2-spin-rev 20s linear infinite}
.vr2-orbit-c{width:210px;height:210px;right:0;top:-80px;border-color:rgba(34,211,238,.22);animation:vr2-pulse 5s ease-in-out infinite}
.vr2-signal{position:absolute;height:1px;background:linear-gradient(90deg,transparent,rgba(56,189,248,.8),transparent);filter:drop-shadow(0 0 5px rgba(56,189,248,.5));animation:vr2-scan 7s ease-in-out infinite}
.vr2-signal-a{width:46%;right:-12%;top:22%}.vr2-signal-b{width:34%;left:-8%;bottom:17%;animation-delay:-3.4s}
.vr2-topline,.vr2-head,.vr2-trust,.vr2-intents,.vr2-grid,.vr2-bottom{position:relative;z-index:2}
.vr2-topline{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:28px;font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.13em;color:#8ba4c9}
.vr2-topline>span{display:inline-flex;align-items:center;gap:7px}.vr2-independent{color:#67e8f9!important}
.vr2-head{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(270px,.7fr);gap:32px;align-items:end}
.vr2-kicker{margin:0 0 10px!important;font:700 12px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.17em;color:#38bdf8!important}
.vr2-copy h2{margin:0;font-size:clamp(34px,5vw,64px);line-height:1.02;letter-spacing:-.045em;color:#f8fbff;max-width:790px}
.vr2-copy>p:last-child{max-width:690px;margin:18px 0 0;color:#9fb1ca;font-size:15px;line-height:1.8}
.vr2-flow{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap;padding:14px 16px;border:1px solid rgba(148,163,184,.13);border-radius:16px;background:rgba(3,8,19,.48);font:700 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#8094b0}
.vr2-flow b{color:#67e8f9}.vr2-trust{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 18px}.vr2-trust span{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid rgba(52,211,153,.13);border-radius:999px;background:rgba(16,185,129,.045);font-size:11px;color:#9acbb9}
.vr2-intents{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 20px}.vr2-intents button{display:flex;gap:12px;align-items:center;text-align:left;padding:16px;border:1px solid rgba(148,163,184,.13);border-radius:17px;background:rgba(15,23,42,.46);color:#b8c7dc;cursor:pointer;transition:.22s ease}.vr2-intents button:hover{transform:translateY(-2px);border-color:rgba(56,189,248,.30);background:rgba(15,32,56,.72)}.vr2-intents button[aria-pressed="true"]{border-color:rgba(56,189,248,.48);background:linear-gradient(145deg,rgba(14,38,66,.85),rgba(13,24,47,.82));box-shadow:0 12px 28px rgba(2,132,199,.10),inset 0 1px 0 rgba(255,255,255,.035)}.vr2-intents i{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:rgba(56,189,248,.08);color:#67e8f9;font-style:normal}.vr2-intents span{display:grid;gap:4px}.vr2-intents b{font-size:13px;color:#e5eefc}.vr2-intents small{font-size:10px;color:#7387a5}
.vr2-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(310px,.75fr);gap:14px}.vr2-primary{padding:26px;border:1px solid rgba(96,165,250,.22);border-radius:23px;background:linear-gradient(150deg,rgba(12,27,51,.88),rgba(7,15,31,.82));box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}.vr2-card-head{display:flex;justify-content:space-between;align-items:center;gap:16px}.vr2-badge{padding:6px 8px;border-radius:999px;font:800 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em}.vr2-badge.is-paid{background:rgba(34,211,238,.09);color:#67e8f9;border:1px solid rgba(34,211,238,.18)}.vr2-price{font-size:22px;font-weight:800;letter-spacing:-.035em;color:#fff}.vr2-primary>small{display:block;margin-top:22px;color:#5f789c;font:700 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em}.vr2-primary h3{margin:8px 0 10px;max-width:720px;font-size:clamp(21px,2.4vw,30px);line-height:1.35;letter-spacing:-.028em;color:#eef6ff}.vr2-primary>p{margin:0;color:#90a5c2;line-height:1.75;font-size:13px;max-width:720px}.vr2-outcome{display:flex;align-items:flex-start;gap:9px;margin:19px 0;padding:13px 14px;border-radius:14px;background:rgba(56,189,248,.055);color:#b7d7e8;font-size:12px}.vr2-outcome svg{color:#67e8f9;flex:0 0 auto;margin-top:1px}.vr2-card-foot{display:flex;justify-content:space-between;gap:16px;align-items:center;border-top:1px solid rgba(148,163,184,.10);padding-top:17px}.vr2-card-foot>span{font:600 9px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;color:#536b8b;text-transform:uppercase;letter-spacing:.08em}.vr2-card-foot a,.vr2-bottom a{display:inline-flex;align-items:center;gap:7px;color:#06111e;background:#e6f7ff;padding:11px 14px;border-radius:12px;font-size:12px;font-weight:800;text-decoration:none;transition:.2s ease}.vr2-card-foot a:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(56,189,248,.14)}
.vr2-alts{display:grid;align-content:start;gap:8px;padding:15px;border:1px solid rgba(148,163,184,.11);border-radius:23px;background:rgba(3,9,20,.54)}.vr2-alts-head{display:flex;justify-content:space-between;padding:3px 4px 8px;font:700 9px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.13em;color:#536b8b}.vr2-alts>a{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:11px;padding:13px;border:1px solid rgba(148,163,184,.10);border-radius:14px;background:rgba(15,23,42,.52);text-decoration:none;color:#a9bad0;transition:.2s ease}.vr2-alts>a:hover{border-color:rgba(96,165,250,.30);transform:translateX(2px);background:rgba(17,31,55,.72)}.vr2-alts a>span:nth-child(2){display:grid;gap:4px}.vr2-alts small{font:700 8px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:#526b8b}.vr2-alts b{font-size:11px;line-height:1.45;color:#c9d7e8}.vr2-mini-price{min-width:57px;color:#67e8f9!important;font-weight:800;font-size:11px}.vr2-alts .vr2-free{margin-top:3px;border-style:dashed;background:rgba(2,132,199,.035)}.vr2-free>svg:first-child{color:#67e8f9}.vr2-free span{display:grid!important;gap:4px}.vr2-free b{color:#d7eefb!important}
.vr2-bottom{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:18px;padding-top:18px;border-top:1px solid rgba(148,163,184,.09)}.vr2-bottom p{margin:0;color:#607792;font-size:11px}.vr2-bottom>div{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.vr2-bottom a{padding:8px 10px;background:transparent;color:#8ea8c6;border:1px solid rgba(148,163,184,.13);font-weight:700}.vr2-bottom a:hover{border-color:rgba(56,189,248,.28);color:#dff7ff}
@keyframes vr2-aurora{0%{transform:translate3d(-2%,0,0) scale(1)}100%{transform:translate3d(3%,3%,0) scale(1.08)}}@keyframes vr2-grid{to{background-position:48px 48px}}@keyframes vr2-spin{to{transform:rotate(360deg)}}@keyframes vr2-spin-rev{to{transform:rotate(-360deg)}}@keyframes vr2-pulse{50%{transform:scale(1.08);opacity:.45}}@keyframes vr2-scan{0%,100%{transform:translateX(-8%);opacity:.16}50%{transform:translateX(22%);opacity:.8}}
@media(max-width:900px){.vr2{margin:24px 16px 52px;padding:23px;border-radius:24px}.vr2-head,.vr2-grid{grid-template-columns:1fr}.vr2-flow{justify-content:flex-start}.vr2-intents{grid-template-columns:1fr}.vr2-copy h2{font-size:clamp(34px,9vw,50px)}.vr2-topline{align-items:flex-start;flex-direction:column}.vr2-bottom,.vr2-card-foot{align-items:flex-start;flex-direction:column}.vr2-bottom>div{justify-content:flex-start}.vr2-card-foot a{width:100%;justify-content:center}}
@media(max-width:520px){.vr2{margin-inline:10px;padding:18px}.vr2-copy h2{font-size:35px}.vr2-flow{gap:6px;padding:11px}.vr2-primary{padding:19px}.vr2-alts{padding:10px}.vr2-card-head{align-items:flex-start}.vr2-price{font-size:19px}}
@media(prefers-reduced-motion:reduce){html.vector-independent-revenue-v2 .vector-home::before,html.vector-independent-revenue-v2 .vector-home::after,.vr2-orbit,.vr2-signal{animation:none!important}.vr2-intents button,.vr2-alts>a,.vr2-card-foot a{transition:none!important}}
`;

export default function VectorRevenueLayer() {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    document.documentElement.classList.add("vector-independent-revenue-v2");

    const routes = document.querySelector(".vector-routes");
    if (!routes?.parentElement) return;

    const host = document.createElement("div");
    host.className = "vr2-portal-host";
    routes.parentElement.insertBefore(host, routes);
    setTarget(host);

    suppressLegacyCrossProjectRoutes();
    const observer = new MutationObserver(suppressLegacyCrossProjectRoutes);
    observer.observe(document.body, { childList: true, subtree: true });

    capture("vector_revenue_layer_ready", {
      independent_mode: true,
      paid_asset_count: 3,
      free_asset_count: 1,
      suppressed_legacy_route_count: legacyCrossProjectFragments.length,
    });

    return () => {
      observer.disconnect();
      host.remove();
      document.documentElement.classList.remove("vector-independent-revenue-v2");
    };
  }, []);

  return (
    <>
      <style>{styles}</style>
      {target ? createPortal(<RevenueExperience />, target) : null}
    </>
  );
}
