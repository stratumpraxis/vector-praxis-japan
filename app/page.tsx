"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Gauge,
  Menu,
  Sparkles,
  X,
} from "lucide-react";

type Lang = "ja" | "en";
type IntentId = "diagnose" | "learn" | "earn" | "create";
type AssetKind = "FREE" | "PAID" | "READ";

type Asset = {
  id: string;
  kind: AssetKind;
  ja: string;
  en: string;
  jaDesc: string;
  enDesc: string;
  href: string;
  price?: string;
  intent: IntentId[];
};

const NOTE = "https://note.com/deft_eel6718";
const MAGAZINE = "https://note.com/deft_eel6718/m/md4fd3d914fe5";

const assets: Asset[] = [
  {
    id: "ai-agent-bottleneck",
    kind: "FREE",
    ja: "AI運用の詰まりを3択で診断",
    en: "Diagnose Your AI Workflow Bottleneck",
    jaDesc: "レビュー待ち・引き継ぎ・権限境界から、いまの詰まりを1つに絞る。",
    enDesc: "Identify whether reviews, handoffs or authority boundaries are slowing the workflow.",
    href: "/ai-agent-bottleneck",
    intent: ["diagnose"],
  },
  {
    id: "ai-team-design-1480",
    kind: "PAID",
    ja: "AIを増やすほど仕事が遅くなる理由",
    en: "Why Adding More AI Slows Down Your Work",
    jaDesc: "ChatGPT・Claude・GitHubを、重複せず働く“チーム”へ変える設計。",
    enDesc: "A practical design for turning ChatGPT, Claude and GitHub into a coordinated team.",
    href: "https://note.com/deft_eel6718/n/ncaff8351e529",
    price: "¥1,480",
    intent: ["diagnose", "earn", "create"],
  },
  {
    id: "ai-revenue-system-3850",
    kind: "PAID",
    ja: "AI活用を、収益につながる仕組みへ。",
    en: "Turn AI Use Into a Revenue System",
    jaDesc: "AI活用を、運用・計測・収益導線までつなぐための実践設計。",
    enDesc: "Connect AI operations, measurement and revenue into one practical system.",
    href: "https://note.com/deft_eel6718/n/nfce5ac047c15",
    price: "¥3,850",
    intent: ["earn"],
  },
  {
    id: "ai-revenue-pipe-1980",
    kind: "PAID",
    ja: "AIを「収益パイプ」に変える実践設計",
    en: "Build an AI Revenue Pipeline",
    jaDesc: "作るだけで終わらず、価値を収益行動へつなぐための設計。",
    enDesc: "Move from AI creation to a repeatable revenue path.",
    href: "https://note.com/deft_eel6718/n/nc120a3159186",
    price: "¥1,980",
    intent: ["earn", "create"],
  },
  {
    id: "seo-five-steps",
    kind: "FREE",
    ja: "SEO記事作成で先に見直す5工程",
    en: "Five Steps Before AI SEO Writing",
    jaDesc: "無料で読める、AI記事制作の実務チェック。",
    enDesc: "A free practical check before producing AI-assisted SEO content.",
    href: "https://note.com/deft_eel6718/n/n86dddd12d2b2",
    intent: ["learn", "create"],
  },
  {
    id: "vector-magazine",
    kind: "READ",
    ja: "AI・note・個人収益化 実践設計",
    en: "AI / note / Solo Revenue Magazine",
    jaDesc: "Vectorの実践記事をテーマ別にまとめて読む。",
    enDesc: "Browse Vector's practical articles by theme.",
    href: MAGAZINE,
    intent: ["learn", "earn", "create"],
  },
];

const intentCopy: Record<IntentId, { ja: string; en: string; jaSub: string; enSub: string }> = {
  diagnose: {
    ja: "AIが増えて、逆に遅くなった",
    en: "More AI made my workflow slower",
    jaSub: "役割・受け渡し・重複を見直す",
    enSub: "Fix roles, handoffs and duplicated work",
  },
  learn: {
    ja: "まず実践例を読みたい",
    en: "I want practical examples first",
    jaSub: "無料記事・実践知から入る",
    enSub: "Start with free and practical material",
  },
  earn: {
    ja: "AIを収益につなげたい",
    en: "I want a clearer revenue path",
    jaSub: "価値→行動→収益の距離を縮める",
    enSub: "Shorten the distance from value to revenue",
  },
  create: {
    ja: "作ったものを届けたい",
    en: "I want to publish what I make",
    jaSub: "制作・公開・再利用をつなげる",
    enSub: "Connect creation, publishing and reuse",
  },
};

function track(event: string, props: Record<string, unknown> = {}) {
  try {
    (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog?.capture(event, {
      surface: "vector_home_revenue_surface_v2",
      ...props,
    });
  } catch {}
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [intent, setIntent] = useState<IntentId>("diagnose");
  const [menuOpen, setMenuOpen] = useState(false);
  const recommended = useMemo(() => assets.filter((asset) => asset.intent.includes(intent)), [intent]);
  const primary = recommended[0] ?? assets[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vector-lang") as Lang | null;
      if (saved === "ja" || saved === "en") setLang(saved);
    } catch {}
    track("vector_home_view");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("vector-lang", lang); } catch {}
  }, [lang]);

  useEffect(() => {
    track("vector_revenue_match_view", { intent, asset_id: primary.id, asset_kind: primary.kind });
  }, [intent, primary.id, primary.kind]);

  const chooseIntent = (next: IntentId) => {
    setIntent(next);
    track("vector_revenue_intent_select", { intent: next });
  };

  const trackAsset = (asset: Asset, source: string) => {
    track(asset.kind === "PAID" ? "vector_paid_asset_click" : "vector_free_asset_click", {
      asset_id: asset.id,
      asset_kind: asset.kind,
      source,
      intent,
    });
  };

  const t = {
    ja: {
      eyebrow: "VECTOR PRAXIS / PRACTICAL AI / CREATOR / REVENUE",
      hero: "AIを増やす前に、次の一手を決める。",
      sub: "Vectorは、個人・Creator向けの実践AI、制作、出版、収益化をつなぐ入口です。目的を選ぶと、確認済みの公開Assetから近いものだけを案内します。",
      choose: "いま一番近い状態は？",
      chooseSub: "読むものを増やす前に、目的を1つ選ぶ。",
      recommended: "いまのおすすめ",
      why: "このAssetをすすめる理由",
      whyText: "選んだ目的に近く、現在公開確認できているVector資産だから。",
      open: "内容を確認する",
      all: "確認済みAsset",
      allSub: "未確認の商品URLや他プロジェクトの導線は混ぜません。",
      evidence: "PUBLIC EVIDENCE",
      evidenceText: "公開済みURL・価格・Vector所有Assetを基準に表示。クリックを購入完了とは扱いません。",
      note: "Vectorの記事一覧を見る",
      footer: "Intent → Relevant Asset → Action → Evidence",
      menu: "メニュー",
    },
    en: {
      eyebrow: "VECTOR PRAXIS / PRACTICAL AI / CREATOR / REVENUE",
      hero: "Choose the next move before adding more AI.",
      sub: "Vector connects practical AI, creator work, publishing and solo revenue. Pick an intent and get the closest verified public asset.",
      choose: "What is closest to your situation?",
      chooseSub: "Pick one intent before collecting more information.",
      recommended: "Recommended now",
      why: "Why this asset",
      whyText: "It matches your selected intent and is currently verified as a public Vector asset.",
      open: "Review this asset",
      all: "Verified assets",
      allSub: "Unverified product URLs and other project routes are not mixed in.",
      evidence: "PUBLIC EVIDENCE",
      evidenceText: "Only verified public URLs, prices and Vector-owned assets are shown. A click is never treated as a purchase.",
      note: "Browse Vector on note",
      footer: "Intent → Relevant Asset → Action → Evidence",
      menu: "Menu",
    },
  }[lang];

  return (
    <main className="vp-home" id="top">
      <header className="vp-header">
        <a className="vp-brand" href="#top" aria-label="Vector Praxis home">
          <span className="vp-mark">V</span>
          <span><b>Vector Praxis</b><small>Practice / Build / Earn</small></span>
        </a>
        <nav className="vp-nav" aria-label="Primary">
          <a href="#intent">Intent</a><a href="#assets">Assets</a><a href={NOTE} target="_blank" rel="noreferrer">Read</a>
        </nav>
        <div className="vp-actions">
          <div className="vp-lang"><button aria-pressed={lang === "ja"} onClick={() => setLang("ja")}>JA</button><button aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button></div>
          <button className="vp-menu" aria-label={t.menu} onClick={() => setMenuOpen(true)}><Menu size={19} /></button>
        </div>
      </header>

      <section className="vp-hero vp-shell">
        <div className="vp-hero-copy">
          <span className="vp-kicker">{t.eyebrow}</span>
          <h1>{t.hero}</h1>
          <p>{t.sub}</p>
          <div className="vp-hero-actions">
            <a className="vp-primary" href="#intent">{t.choose}<ArrowRight size={17} /></a>
            <a className="vp-secondary" href={NOTE} target="_blank" rel="noreferrer" onClick={() => track("vector_note_open", { source: "hero" })}>{t.note}<ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="vp-signal" aria-label="Vector revenue path">
          <div className="vp-signal-head"><span>VECTOR / LIVE ROUTE</span><CheckCircle2 size={18} /></div>
          <div className="vp-flow"><span>Intent</span><i /><span>Asset</span><i /><span>Action</span><i /><span>Evidence</span></div>
          <div className="vp-signal-card"><small>{t.recommended}</small><b>{lang === "ja" ? primary.ja : primary.en}</b><span>{primary.price ?? primary.kind}</span></div>
        </div>
      </section>

      <section className="vp-intent-band" id="intent">
        <div className="vp-shell">
          <div className="vp-section-head"><div><span className="vp-kicker">INTENT ROUTER</span><h2>{t.choose}</h2><p>{t.chooseSub}</p></div><Compass /></div>
          <div className="vp-intents">
            {(Object.keys(intentCopy) as IntentId[]).map((id, index) => {
              const item = intentCopy[id];
              return <button key={id} aria-pressed={intent === id} onClick={() => chooseIntent(id)}><span>0{index + 1}</span><b>{lang === "ja" ? item.ja : item.en}</b><small>{lang === "ja" ? item.jaSub : item.enSub}</small><ChevronRight size={17} /></button>;
            })}
          </div>
        </div>
      </section>

      <section className="vp-match vp-shell" aria-live="polite">
        <div className="vp-match-copy"><span className="vp-kicker">{t.recommended}</span><h2>{lang === "ja" ? primary.ja : primary.en}</h2><p>{lang === "ja" ? primary.jaDesc : primary.enDesc}</p><div className="vp-reason"><Gauge size={17} /><span><b>{t.why}</b><small>{t.whyText}</small></span></div></div>
        <div className="vp-match-action"><span className={`vp-badge kind-${primary.kind.toLowerCase()}`}>{primary.kind}</span>{primary.price && <strong>{primary.price}</strong>}<a href={primary.href} target="_blank" rel="noreferrer" onClick={() => trackAsset(primary, "recommended")}>{t.open}<ArrowUpRight size={16} /></a><small>{primary.kind === "PAID" ? "External article / checkout is handled by note" : "External public asset"}</small></div>
      </section>

      <section className="vp-assets vp-shell" id="assets">
        <div className="vp-section-head"><div><span className="vp-kicker">ASSET MAP</span><h2>{t.all}</h2><p>{t.allSub}</p></div><BookOpen /></div>
        <div className="vp-asset-grid">
          {assets.map((asset) => <a key={asset.id} href={asset.href} target="_blank" rel="noreferrer" onClick={() => trackAsset(asset, "asset_grid")}><div className="vp-card-top"><span className={`vp-badge kind-${asset.kind.toLowerCase()}`}>{asset.kind}</span>{asset.price && <strong>{asset.price}</strong>}</div><h3>{lang === "ja" ? asset.ja : asset.en}</h3><p>{lang === "ja" ? asset.jaDesc : asset.enDesc}</p><span className="vp-card-link">{t.open}<ArrowUpRight size={14} /></span></a>)}
        </div>
      </section>

      <section className="vp-evidence vp-shell"><div><Sparkles size={18} /><span><b>{t.evidence}</b><small>{t.evidenceText}</small></span></div></section>
      <footer className="vp-footer vp-shell"><span>{t.footer}</span><a href={NOTE} target="_blank" rel="noreferrer">note <ArrowUpRight size={13} /></a></footer>

      {menuOpen && <div className="vp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}><aside className="vp-sheet" role="dialog" aria-modal="true"><div className="vp-sheet-head"><b>Vector Praxis</b><button onClick={() => setMenuOpen(false)} aria-label="Close"><X size={18} /></button></div><a href="#intent" onClick={() => setMenuOpen(false)}>Intent Router<ChevronRight size={17} /></a><a href="#assets" onClick={() => setMenuOpen(false)}>Verified Assets<ChevronRight size={17} /></a><a href={NOTE} target="_blank" rel="noreferrer">Vector on note<ArrowUpRight size={17} /></a></aside></div>}

      <style jsx global>{`
        :root{color-scheme:light;--ink:#17212a;--muted:#66727d;--paper:#f4f2ed;--surface:#fff;--line:#dfe3e4;--mint:#dff2e8;--blue:#e5edf8;--peach:#f7e8de;--accent:#2b6655;--shadow:#d9ddd8}
        *{box-sizing:border-box}html{scroll-behavior:smooth;background:var(--paper)}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans JP",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}a,button{font:inherit}button{touch-action:manipulation}.vp-home{min-height:100vh}.vp-shell{width:min(1180px,calc(100% - 40px));margin-inline:auto}.vp-header{position:sticky;top:0;z-index:30;height:72px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:28px;padding:0 max(20px,calc((100vw - 1180px)/2));background:rgba(244,242,237,.92);border-bottom:1px solid rgba(23,33,42,.08);backdrop-filter:blur(16px)}.vp-brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none}.vp-mark{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:var(--ink);color:#fff;font-weight:900;box-shadow:4px 4px 0 var(--shadow)}.vp-brand b{display:block;font-size:13px}.vp-brand small{display:block;margin-top:2px;color:var(--muted);font-size:9px;letter-spacing:.11em;text-transform:uppercase}.vp-nav{display:flex;justify-content:center;gap:4px}.vp-nav a{padding:9px 11px;border-radius:9px;color:var(--muted);font-size:11px;font-weight:800;text-decoration:none}.vp-nav a:hover{background:#fff;color:var(--ink)}.vp-actions{display:flex;align-items:center;gap:8px}.vp-lang{display:flex;padding:3px;background:#fff;border:1px solid var(--line);border-radius:10px}.vp-lang button{border:0;background:transparent;color:#8a929b;padding:6px 8px;border-radius:7px;font-size:9px;font-weight:850;cursor:pointer}.vp-lang button[aria-pressed="true"]{background:var(--ink);color:#fff}.vp-menu{display:none;width:38px;height:38px;border:1px solid var(--line);background:#fff;border-radius:11px;color:var(--ink)}
        .vp-hero{min-height:600px;padding:92px 0 78px;display:grid;grid-template-columns:minmax(0,1fr) minmax(370px,.78fr);align-items:center;gap:78px}.vp-kicker{display:inline-block;color:#547164;font-size:10px;font-weight:900;letter-spacing:.16em}.vp-hero h1{max-width:760px;margin:16px 0 18px;font-size:clamp(48px,6.5vw,86px);line-height:.98;letter-spacing:-.066em}.vp-hero-copy>p{max-width:680px;margin:0;color:var(--muted);font-size:15px;line-height:1.8}.vp-hero-actions{display:flex;align-items:center;gap:18px;margin-top:30px}.vp-primary{min-height:49px;padding:0 18px;border-radius:13px;background:var(--ink);color:#fff;display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:850;text-decoration:none;box-shadow:5px 5px 0 var(--shadow);transition:.18s ease}.vp-primary:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 var(--shadow)}.vp-secondary{display:inline-flex;align-items:center;gap:5px;color:#59656f;font-size:11px;font-weight:850;text-decoration:none}.vp-signal{padding:24px;border:1px solid #d8dedc;border-radius:26px;background:#fff;box-shadow:12px 12px 0 #e7e3dc}.vp-signal-head{display:flex;justify-content:space-between;color:#6a7778;font-size:8px;letter-spacing:.13em}.vp-signal-head svg{color:var(--accent)}.vp-flow{margin:54px 0 24px;display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr auto;align-items:center;gap:8px;color:#566168;font-size:8px;font-weight:850}.vp-flow i{height:2px;background:#d6dcda}.vp-signal-card{padding:15px;border-radius:15px;background:#f1f7f3;border:1px solid #d7e5dc;display:grid;grid-template-columns:1fr auto;gap:5px 12px}.vp-signal-card small{grid-column:1/3;color:#678176;font-size:8px;letter-spacing:.1em;text-transform:uppercase}.vp-signal-card b{font-size:12px;line-height:1.4}.vp-signal-card span{align-self:start;font-size:10px;font-weight:900}
        .vp-intent-band{padding:54px 0;background:#fff;border-top:1px solid #e5e2dc;border-bottom:1px solid #e5e2dc}.vp-section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}.vp-section-head h2{margin:7px 0 7px;font-size:clamp(28px,3.4vw,44px);letter-spacing:-.05em}.vp-section-head p{margin:0;color:var(--muted);font-size:11px}.vp-section-head>svg{color:#87928e}.vp-intents{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.vp-intents button{min-height:142px;padding:16px;border:1px solid var(--line);border-radius:18px;background:#fafafa;color:var(--ink);display:grid;grid-template-columns:auto 1fr auto;grid-template-rows:auto 1fr auto;gap:9px;text-align:left;cursor:pointer;transition:.18s ease}.vp-intents button:hover{transform:translateY(-3px)}.vp-intents button[aria-pressed="true"]{border-color:#9dbdaf;background:#edf7f1;box-shadow:0 12px 26px rgba(43,102,85,.08)}.vp-intents button>span{font-size:8px;color:#8c969b}.vp-intents button>b{grid-column:1/4;align-self:end;font-size:13px;line-height:1.4}.vp-intents button>small{grid-column:1/3;color:#717c82;font-size:9px;line-height:1.45}.vp-intents button>svg{align-self:end}
        .vp-match{margin-top:72px;padding:34px;border-radius:26px;background:var(--ink);color:#fff;display:grid;grid-template-columns:1fr auto;gap:44px;align-items:center;box-shadow:12px 12px 0 #dedbd4}.vp-match .vp-kicker{color:#b8d5c9}.vp-match h2{max-width:750px;margin:10px 0 10px;font-size:clamp(28px,4vw,48px);line-height:1.04;letter-spacing:-.05em}.vp-match p{max-width:690px;margin:0;color:#c2cbd1;font-size:12px;line-height:1.7}.vp-reason{margin-top:22px;display:flex;align-items:flex-start;gap:10px;color:#dbe4df}.vp-reason span{display:block}.vp-reason b{display:block;font-size:9px;letter-spacing:.07em}.vp-reason small{display:block;margin-top:4px;color:#9eabb2;font-size:9px}.vp-match-action{min-width:220px;padding:18px;border:1px solid #3c4850;border-radius:18px;background:#222e37;display:grid;gap:10px}.vp-match-action>strong{font-size:28px;letter-spacing:-.04em}.vp-match-action>a{min-height:46px;padding:0 14px;border-radius:12px;background:#fff;color:var(--ink);display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:900;text-decoration:none}.vp-match-action>small{color:#93a0a8;font-size:8px;line-height:1.5}.vp-badge{width:max-content;padding:5px 7px;border-radius:99px;font-size:7px;font-weight:900;letter-spacing:.08em;border:1px solid currentColor}.kind-paid{color:#7b6bd0}.kind-free{color:#28704f}.kind-read{color:#8b6d18}.vp-match .kind-paid{color:#d2c9ff}.vp-match .kind-free{color:#a8e0c1}.vp-match .kind-read{color:#f0db8f}
        .vp-assets{padding:92px 0 76px}.vp-asset-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}.vp-asset-grid>a{grid-column:span 4;min-height:260px;padding:20px;border:1px solid rgba(23,33,42,.11);border-radius:20px;background:#fff;color:var(--ink);display:flex;flex-direction:column;text-decoration:none;transition:.18s ease}.vp-asset-grid>a:nth-child(1){grid-column:span 7;background:var(--mint)}.vp-asset-grid>a:nth-child(2){grid-column:span 5;background:var(--blue)}.vp-asset-grid>a:nth-child(3){background:var(--peach)}.vp-asset-grid>a:hover{transform:translateY(-4px);box-shadow:0 16px 30px rgba(30,38,44,.08)}.vp-card-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.vp-card-top strong{font-size:11px}.vp-asset-grid h3{margin:38px 0 9px;font-size:22px;letter-spacing:-.03em;line-height:1.15}.vp-asset-grid p{margin:0;color:#657079;font-size:10px;line-height:1.6}.vp-card-link{margin-top:auto;padding-top:22px;display:flex;align-items:center;gap:6px;font-size:9px;font-weight:900}.vp-evidence{margin-bottom:36px;padding:20px 22px;border-top:1px solid #d8d4cc;border-bottom:1px solid #d8d4cc}.vp-evidence>div{display:flex;align-items:flex-start;gap:12px}.vp-evidence b{display:block;font-size:9px;letter-spacing:.1em}.vp-evidence small{display:block;margin-top:4px;color:#737e84;font-size:9px;line-height:1.5}.vp-footer{padding:22px 0 42px;display:flex;justify-content:space-between;color:#8a9297;font-size:9px}.vp-footer a{display:flex;align-items:center;gap:4px;color:#68737a;text-decoration:none}
        .vp-overlay{position:fixed;inset:0;z-index:60;background:rgba(23,30,36,.25);backdrop-filter:blur(5px);display:flex;justify-content:flex-end}.vp-sheet{width:min(420px,92vw);height:100%;padding:22px;background:#fff;box-shadow:-20px 0 60px rgba(29,36,40,.12)}.vp-sheet-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:1px solid var(--line)}.vp-sheet-head button{width:36px;height:36px;border:1px solid var(--line);border-radius:11px;background:#f8f8f7}.vp-sheet>a{min-height:66px;border-bottom:1px solid #eceeee;color:var(--ink);display:flex;align-items:center;justify-content:space-between;text-decoration:none;font-size:12px;font-weight:800}
        @media(max-width:920px){.vp-nav{display:none}.vp-menu{display:grid;place-items:center}.vp-hero{grid-template-columns:1fr;gap:42px;padding:68px 0 62px}.vp-signal{max-width:620px}.vp-intents{grid-template-columns:repeat(2,1fr)}.vp-match{grid-template-columns:1fr}.vp-match-action{min-width:0}.vp-asset-grid>a,.vp-asset-grid>a:nth-child(1),.vp-asset-grid>a:nth-child(2){grid-column:span 6}}
        @media(max-width:620px){.vp-shell{width:min(100% - 26px,1180px)}.vp-header{height:64px;padding:0 13px}.vp-brand small{display:none}.vp-hero{min-height:auto;padding:54px 0 48px}.vp-hero h1{font-size:clamp(42px,13vw,62px)}.vp-hero-copy>p{font-size:13px}.vp-hero-actions{align-items:flex-start;flex-direction:column}.vp-primary{width:100%;justify-content:space-between}.vp-signal{padding:18px;border-radius:20px;box-shadow:8px 8px 0 #e7e3dc}.vp-flow{margin:36px 0 18px;gap:5px}.vp-flow span{font-size:7px}.vp-intent-band{padding:42px 0}.vp-intents{grid-template-columns:1fr}.vp-intents button{min-height:112px}.vp-match{margin-top:46px;padding:24px 20px;border-radius:22px;box-shadow:8px 8px 0 #dedbd4}.vp-assets{padding:66px 0 56px}.vp-asset-grid{display:grid;grid-template-columns:1fr}.vp-asset-grid>a,.vp-asset-grid>a:nth-child(1),.vp-asset-grid>a:nth-child(2){grid-column:1;min-height:230px}.vp-section-head{align-items:flex-start}.vp-section-head>svg{display:none}.vp-footer{padding-bottom:28px}}
        @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{transition:none!important;animation:none!important}}
        @media(hover:none){.vp-primary:hover,.vp-intents button:hover,.vp-asset-grid>a:hover{transform:none}}
      `}</style>
    </main>
  );
}