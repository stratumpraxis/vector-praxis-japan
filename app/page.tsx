"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Menu,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

type Lang = "ja" | "en";
type RouteId = "start" | "build" | "earn" | "creator" | "read" | "return";
type Status = "FREE" | "PAID" | "READ" | "GROUP";
type Destination = {
  ja: string;
  en: string;
  jaDesc: string;
  enDesc: string;
  href: string;
  status: Status;
  event: string;
};
type Route = {
  id: RouteId;
  icon: ReactNode;
  ja: string;
  en: string;
  shortJa: string;
  shortEn: string;
  promptJa: string;
  promptEn: string;
  destinations: Destination[];
};

const NOTE = "https://note.com/deft_eel6718";
const NOTE_MAGAZINE = "https://note.com/deft_eel6718/m/md4fd3d914fe5";
const NOTE_FREE = "https://note.com/deft_eel6718/n/n86dddd12d2b2";
const STRATUM = "https://stratumpraxis.com/";

const routes: Route[] = [
  {
    id: "start",
    icon: <Compass />,
    ja: "はじめる",
    en: "Start",
    shortJa: "現在地を知って、次を選ぶ",
    shortEn: "Find your current position",
    promptJa: "AIは使っている。でも次が曖昧",
    promptEn: "I use AI, but the next step is fuzzy",
    destinations: [
      {
        ja: "AI実務力チェック",
        en: "AI Practical Check",
        jaDesc: "実務で使う力を短く確認。",
        enDesc: "Check practical AI readiness in a few steps.",
        href: "https://ai-practical-check.pages.dev/",
        status: "FREE",
        event: "free_diagnostic_open",
      },
      {
        ja: "AI収益化の現実チェック",
        en: "AI Monetization Reality Check",
        jaDesc: "収益化の前提とEvidenceを確認。",
        enDesc: "Stress-test the assumptions behind AI monetization.",
        href: "https://stratumpraxis.com/ai-monetization-reality-check.html",
        status: "GROUP",
        event: "route_destination_open",
      },
    ],
  },
  {
    id: "build",
    icon: <Boxes />,
    ja: "作る",
    en: "Build",
    shortJa: "アイデアを形にする",
    shortEn: "Turn an idea into something usable",
    promptJa: "作りたいものはある。道具選びで止まる",
    promptEn: "I know what to build, but tool choice blocks me",
    destinations: [
      {
        ja: "AIアプリ開発ツール選び",
        en: "AI App Builder Router 2026",
        jaDesc: "目的と制約からBuilderを選ぶ。",
        enDesc: "Choose an app builder by goal and constraints.",
        href: "https://payhip.com/b/LBtbr",
        status: "PAID",
        event: "paid_product_cta",
      },
      {
        ja: "AIデジタル商品づくり入門",
        en: "Global Digital Product AI Starter Kit",
        jaDesc: "企画から公開までの実践ルート。",
        enDesc: "A practical route from idea to launch.",
        href: "https://stratumpraxis.com/global-digital-product-ai-starter-kit.html",
        status: "GROUP",
        event: "route_destination_open",
      },
      {
        ja: "スマホAIスライド制作",
        en: "Smartphone AI Slide Factory",
        jaDesc: "スマホ中心で制作を回す。",
        enDesc: "A phone-first AI slide workflow.",
        href: "https://stratumpraxis.com/smartphone-ai-slide-factory.html",
        status: "GROUP",
        event: "route_destination_open",
      },
    ],
  },
  {
    id: "earn",
    icon: <CircleDollarSign />,
    ja: "収益化する",
    en: "Earn",
    shortJa: "価値を収益行動へつなぐ",
    shortEn: "Move value toward revenue",
    promptJa: "作った。でも売上への一本線が見えない",
    promptEn: "I built something, but the revenue path is unclear",
    destinations: [
      {
        ja: "Revenue Router",
        en: "Revenue Router",
        jaDesc: "次の収益アクションを選ぶ。",
        enDesc: "Choose the next revenue action.",
        href: "https://stratumpraxis.com/revenue-router.html",
        status: "GROUP",
        event: "route_destination_open",
      },
      {
        ja: "AI収益化の現実チェック",
        en: "AI Monetization Reality Check",
        jaDesc: "数字とEvidenceから現実性を見る。",
        enDesc: "Evaluate monetization using evidence.",
        href: "https://stratumpraxis.com/ai-monetization-reality-check.html",
        status: "GROUP",
        event: "route_destination_open",
      },
    ],
  },
  {
    id: "creator",
    icon: <Sparkles />,
    ja: "Creator",
    en: "Creator",
    shortJa: "作ったものを届ける",
    shortEn: "Publish what you make",
    promptJa: "作品や知識を、公開できる形にしたい",
    promptEn: "I want to turn my work into something publishable",
    destinations: [
      {
        ja: "Vector Praxis note",
        en: "Vector Praxis on note",
        jaDesc: "Vectorの公開・販売レイヤー。",
        enDesc: "Vector's publishing and paid-content layer.",
        href: NOTE,
        status: "READ",
        event: "vector_note_open",
      },
      {
        ja: "AIデジタル商品づくり入門",
        en: "Global Digital Product AI Starter Kit",
        jaDesc: "制作物を公開まで運ぶ。",
        enDesc: "Move a digital product from idea to release.",
        href: "https://stratumpraxis.com/global-digital-product-ai-starter-kit.html",
        status: "GROUP",
        event: "route_destination_open",
      },
    ],
  },
  {
    id: "read",
    icon: <BookOpen />,
    ja: "読む",
    en: "Read",
    shortJa: "実践知からヒントを拾う",
    shortEn: "Pick up practical ideas",
    promptJa: "まず事例や考え方を読みたい",
    promptEn: "I want examples and practical thinking first",
    destinations: [
      {
        ja: "Vectorの記事を読む",
        en: "Read Vector",
        jaDesc: "無料・有料の記事一覧。",
        enDesc: "Browse Vector's free and paid articles.",
        href: NOTE,
        status: "READ",
        event: "vector_note_open",
      },
      {
        ja: "AI・note・個人収益化 実践設計",
        en: "AI / note / Solo Revenue Magazine",
        jaDesc: "テーマ別にまとめて読む。",
        enDesc: "Browse a focused Vector magazine.",
        href: NOTE_MAGAZINE,
        status: "READ",
        event: "vector_magazine_open",
      },
      {
        ja: "SEO記事作成で先に見直す5工程",
        en: "Five Steps Before AI SEO Writing",
        jaDesc: "まず無料記事から読む。",
        enDesc: "Start with a free practical article.",
        href: NOTE_FREE,
        status: "FREE",
        event: "vector_free_article_open",
      },
    ],
  },
  {
    id: "return",
    icon: <RefreshCw />,
    ja: "戻る",
    en: "Return",
    shortJa: "迷ったら、次の入口へ戻る",
    shortEn: "Return to a useful next step",
    promptJa: "前に見たものへ戻りたい。次を選び直したい",
    promptEn: "I want to revisit and choose again",
    destinations: [
      {
        ja: "Vectorの読み物へ戻る",
        en: "Return to Vector reading",
        jaDesc: "公開済みの記事から再開。",
        enDesc: "Resume from Vector's published articles.",
        href: NOTE,
        status: "READ",
        event: "vector_note_open",
      },
      {
        ja: "Praxis Group Return Gate",
        en: "Praxis Group Return Gate",
        jaDesc: "グループ内の再訪ルートを開く。",
        enDesc: "Open the group's repeat-use route.",
        href: "https://stratumpraxis.com/return-gate/",
        status: "GROUP",
        event: "return_gate_move",
      },
    ],
  },
];

const copy = {
  ja: {
    eyebrow: "AI PRACTICE / CREATOR / BUILD / EARN",
    hero: "AIを使って、次の一手まで。",
    sub: "個人・Creatorのための、実践ルート案内。",
    primary: "無料で現在地をチェック",
    secondary: "6つのルートを見る",
    choose: "いま、どこで止まってる？",
    chooseHint: "近いものを選ぶと、おすすめの入口が変わります。",
    routesLabel: "VECTOR ROUTES",
    routesTitle: "読むより先に、目的を選ぶ。",
    recommended: "おすすめ",
    open: "このルートを見る",
    close: "閉じる",
    group: "Praxis Group",
    groupText: "法人・チームのAI運用は Stratum Praxis へ。",
    viewGroup: "Stratumを見る",
    menu: "メニュー",
    footer: "AI Practice → Build → Earn → Return",
  },
  en: {
    eyebrow: "AI PRACTICE / CREATOR / BUILD / EARN",
    hero: "Use AI. Know what to do next.",
    sub: "A practical route guide for solo builders and creators.",
    primary: "Check where I am",
    secondary: "See all 6 routes",
    choose: "Where are you stuck right now?",
    chooseHint: "Choose the closest one and Vector will point to a route.",
    routesLabel: "VECTOR ROUTES",
    routesTitle: "Choose a direction before reading more.",
    recommended: "Recommended",
    open: "Open this route",
    close: "Close",
    group: "Praxis Group",
    groupText: "For company and team AI operations, use Stratum Praxis.",
    viewGroup: "Open Stratum",
    menu: "Menu",
    footer: "AI Practice → Build → Earn → Return",
  },
};

const goalRoute: Record<string, RouteId> = {
  learn: "start",
  make: "build",
  money: "earn",
};

function track(event: string, props: Record<string, unknown> = {}) {
  try {
    (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog?.capture(event, {
      surface: "vector_home_phase1",
      ...props,
    });
  } catch {}
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [active, setActive] = useState<RouteId | null>(null);
  const [goal, setGoal] = useState("learn");
  const [menuOpen, setMenuOpen] = useState(false);
  const c = copy[lang];
  const selected = useMemo(() => routes.find((route) => route.id === active) ?? null, [active]);
  const recommended = goalRoute[goal];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vector-lang") as Lang | null;
      if (saved === "ja" || saved === "en") setLang(saved);
    } catch {}
    track("vector_home_view");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("vector-lang", lang);
    } catch {}
  }, [lang]);

  useEffect(() => {
    document.body.style.overflow = selected || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, menuOpen]);

  const openRoute = (id: RouteId, source: string) => {
    setMenuOpen(false);
    setActive(id);
    track("vector_route_open", { route: id, source });
  };

  const chooseGoal = (id: string) => {
    setGoal(id);
    track("vector_goal_select", { goal: id, recommended_route: goalRoute[id] });
  };

  return (
    <main className="vector-home" id="top">
      <header className="vector-header">
        <a className="vector-brand" href="#top" aria-label="Vector Praxis home">
          <span className="vector-mark">V</span>
          <span>
            <b>Vector Praxis</b>
            <small>Practice Hub</small>
          </span>
        </a>

        <nav className="vector-desktop-nav" aria-label="Primary">
          {routes.map((route) => (
            <button key={route.id} onClick={() => openRoute(route.id, "header")}>{route.en}</button>
          ))}
        </nav>

        <div className="vector-header-actions">
          <div className="vector-lang" aria-label="Language">
            <button aria-pressed={lang === "ja"} onClick={() => setLang("ja")}>JA</button>
            <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
          </div>
          <button className="vector-menu-button" aria-label={c.menu} onClick={() => setMenuOpen(true)}><Menu size={19} /></button>
        </div>
      </header>

      <section className="vector-hero vector-shell">
        <div className="vector-hero-copy">
          <span className="vector-eyebrow">{c.eyebrow}</span>
          <h1>{c.hero}</h1>
          <p>{c.sub}</p>
          <div className="vector-hero-actions">
            <button className="vector-primary" onClick={() => openRoute("start", "hero_primary")}>{c.primary}<ArrowRight size={17} /></button>
            <a className="vector-text-link" href="#routes">{c.secondary}<ChevronRight size={15} /></a>
          </div>
        </div>

        <div className="vector-route-preview" aria-label="Vector route preview">
          <div className="vector-preview-top">
            <span>VECTOR / 01—06</span>
            <b>{lang === "ja" ? "次の一手を選ぶ" : "Choose the next move"}</b>
          </div>
          <div className="vector-pathline" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
          <div className="vector-preview-labels">
            {routes.map((route, index) => <span key={route.id}><i>0{index + 1}</i>{route.en}</span>)}
          </div>
          <button className="vector-preview-pick" onClick={() => openRoute(recommended, "hero_preview")}> 
            <span>{c.recommended}</span>
            <strong>{routes.find((route) => route.id === recommended)?.en}</strong>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="vector-goal-band">
        <div className="vector-shell vector-goal-inner">
          <div>
            <span className="vector-section-kicker">QUICK PICK</span>
            <h2>{c.choose}</h2>
            <p>{c.chooseHint}</p>
          </div>
          <div className="vector-goal-options" role="group" aria-label={c.choose}>
            <button aria-pressed={goal === "learn"} onClick={() => chooseGoal("learn")}>
              <span>01</span><b>{lang === "ja" ? "まず現在地を知りたい" : "Find my current position"}</b><small>Start</small>
            </button>
            <button aria-pressed={goal === "make"} onClick={() => chooseGoal("make")}>
              <span>02</span><b>{lang === "ja" ? "何かを作りたい" : "I want to build something"}</b><small>Build</small>
            </button>
            <button aria-pressed={goal === "money"} onClick={() => chooseGoal("money")}>
              <span>03</span><b>{lang === "ja" ? "収益につなげたい" : "I want a revenue path"}</b><small>Earn</small>
            </button>
          </div>
          <button className="vector-recommendation" onClick={() => openRoute(recommended, "quick_pick")}> 
            <span>{c.recommended}</span>
            <b>{routes.find((route) => route.id === recommended)?.en}</b>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="vector-routes vector-shell" id="routes">
        <div className="vector-section-head">
          <div><span className="vector-section-kicker">{c.routesLabel}</span><h2>{c.routesTitle}</h2></div>
          <span className="vector-route-count">06 ROUTES</span>
        </div>

        <div className="vector-route-map">
          {routes.map((route, index) => (
            <button
              key={route.id}
              className={`vector-route-tile route-${route.id} ${recommended === route.id ? "is-recommended" : ""}`}
              onClick={() => openRoute(route.id, "route_map")}
            >
              <span className="vector-tile-index">0{index + 1}</span>
              <span className="vector-tile-icon">{route.icon}</span>
              <span className="vector-tile-copy">
                <small>{route.en}</small>
                <strong>{lang === "ja" ? route.ja : route.en}</strong>
                <em>{lang === "ja" ? route.shortJa : route.shortEn}</em>
              </span>
              {recommended === route.id && <span className="vector-tile-reco">{c.recommended}</span>}
              <ArrowRight className="vector-tile-arrow" size={17} />
            </button>
          ))}
        </div>
      </section>

      <section className="vector-stratum vector-shell">
        <div><span>{c.group}</span><b>{c.groupText}</b></div>
        <a href={STRATUM} target="_blank" rel="noreferrer" onClick={() => track("vector_to_stratum", { source: "home_bridge" })}>{c.viewGroup}<ArrowUpRight size={15} /></a>
      </section>

      <footer className="vector-footer vector-shell">
        <span>{c.footer}</span>
        <a href={NOTE} target="_blank" rel="noreferrer">note <ArrowUpRight size={13} /></a>
      </footer>

      <nav className="vector-bottom-nav" aria-label="Mobile primary">
        <button onClick={() => openRoute("start", "bottom_nav")}><Compass /><span>Start</span></button>
        <button onClick={() => openRoute("build", "bottom_nav")}><Boxes /><span>Build</span></button>
        <button onClick={() => openRoute("earn", "bottom_nav")}><CircleDollarSign /><span>Earn</span></button>
        <button onClick={() => setMenuOpen(true)}><Menu /><span>More</span></button>
      </nav>

      {selected && (
        <div className="vector-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
          <aside className={`vector-drawer drawer-${selected.id}`} role="dialog" aria-modal="true" aria-label={selected.en}>
            <div className="vector-drawer-head">
              <div className="vector-drawer-title">
                <span className="vector-drawer-icon">{selected.icon}</span>
                <div><small>{selected.en.toUpperCase()}</small><h2>{lang === "ja" ? selected.ja : selected.en}</h2><p>{lang === "ja" ? selected.promptJa : selected.promptEn}</p></div>
              </div>
              <button className="vector-close" aria-label={c.close} onClick={() => setActive(null)}><X /></button>
            </div>

            <div className="vector-destinations">
              {selected.destinations.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track(item.event, { route: selected.id, destination: item.en, status: item.status })}
                >
                  <span className={`vector-status status-${item.status.toLowerCase()}`}>{item.status}</span>
                  <span className="vector-destination-copy"><small>0{index + 1}</small><b>{lang === "ja" ? item.ja : item.en}</b><em>{lang === "ja" ? item.jaDesc : item.enDesc}</em></span>
                  <ArrowUpRight size={17} />
                </a>
              ))}
            </div>

            <div className="vector-drawer-foot"><span>{selected.en}</span><b>{lang === "ja" ? selected.shortJa : selected.shortEn}</b></div>
          </aside>
        </div>
      )}

      {menuOpen && (
        <div className="vector-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
          <aside className="vector-menu-sheet" role="dialog" aria-modal="true">
            <div className="vector-menu-head"><b>Vector Praxis</b><button className="vector-close" onClick={() => setMenuOpen(false)}><X /></button></div>
            <div className="vector-menu-routes">
              {routes.map((route, index) => <button key={route.id} onClick={() => openRoute(route.id, "mobile_menu")}><span>0{index + 1}</span><b>{route.en}</b><small>{lang === "ja" ? route.shortJa : route.shortEn}</small><ChevronRight size={17} /></button>)}
            </div>
          </aside>
        </div>
      )}

      <style jsx global>{`
        :root{color-scheme:light;--ink:#1e2630;--muted:#66717d;--line:#dde2e6;--paper:#f6f4ef;--surface:#ffffff;--mint:#dff3e8;--blue:#e2ecfb;--peach:#f7e7dc;--yellow:#f6efc9;--lav:#ece5f7;--rose:#f5e5e8;--accent:#2b5f52}
        *{box-sizing:border-box}
        html{scroll-behavior:smooth;background:var(--paper)}
        body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans JP",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
        button,a{font:inherit}
        button{touch-action:manipulation}
        .vector-home{min-height:100vh;padding-bottom:0;background:var(--paper)}
        .vector-shell{width:min(1180px,calc(100% - 40px));margin-inline:auto}
        .vector-header{position:sticky;top:0;z-index:30;height:72px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:28px;padding:0 max(20px,calc((100vw - 1180px)/2));background:rgba(246,244,239,.92);border-bottom:1px solid rgba(30,38,48,.08);backdrop-filter:blur(16px)}
        .vector-brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;white-space:nowrap}
        .vector-mark{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:var(--ink);color:#fff;font-weight:900;font-size:14px;box-shadow:4px 4px 0 #d9dfd8}
        .vector-brand b{display:block;font-size:13px;letter-spacing:-.01em}.vector-brand small{display:block;margin-top:2px;color:var(--muted);font-size:9px;letter-spacing:.11em;text-transform:uppercase}
        .vector-desktop-nav{display:flex;justify-content:center;gap:3px}.vector-desktop-nav button{border:0;background:transparent;color:#66717d;padding:9px 10px;border-radius:9px;font-size:11px;font-weight:750;cursor:pointer}.vector-desktop-nav button:hover{background:#fff;color:var(--ink)}
        .vector-header-actions{display:flex;align-items:center;gap:8px}.vector-lang{display:flex;padding:3px;background:#fff;border:1px solid var(--line);border-radius:10px}.vector-lang button{border:0;background:transparent;color:#8a929b;padding:6px 8px;border-radius:7px;font-size:9px;font-weight:850;cursor:pointer}.vector-lang button[aria-pressed="true"]{background:var(--ink);color:#fff}.vector-menu-button{display:none;width:38px;height:38px;border:1px solid var(--line);background:#fff;border-radius:11px;color:var(--ink)}
        .vector-hero{min-height:565px;padding:84px 0 72px;display:grid;grid-template-columns:minmax(0,1fr) minmax(390px,.82fr);align-items:center;gap:76px}
        .vector-eyebrow,.vector-section-kicker{display:inline-block;color:#537064;font-size:10px;font-weight:850;letter-spacing:.16em}.vector-hero h1{max-width:720px;margin:16px 0 16px;font-size:clamp(48px,6.6vw,86px);line-height:.98;letter-spacing:-.065em;font-weight:850}.vector-hero-copy>p{margin:0;color:var(--muted);font-size:15px;line-height:1.7}.vector-hero-actions{display:flex;align-items:center;gap:18px;margin-top:30px}.vector-primary{min-height:48px;padding:0 18px;border:0;border-radius:13px;background:var(--ink);color:#fff;display:inline-flex;align-items:center;gap:10px;font-weight:850;font-size:12px;cursor:pointer;box-shadow:5px 5px 0 #d9dfd8;transition:transform .18s ease,box-shadow .18s ease}.vector-primary:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 #d9dfd8}.vector-text-link{display:inline-flex;align-items:center;gap:4px;color:#58636e;text-decoration:none;font-size:11px;font-weight:800}.vector-text-link:hover{color:var(--ink)}
        .vector-route-preview{position:relative;padding:24px;border:1px solid #d8dedc;border-radius:26px;background:#fff;box-shadow:12px 12px 0 #e8e4dc;overflow:hidden}.vector-route-preview:after{content:"";position:absolute;width:110px;height:26px;right:-18px;top:18px;background:var(--yellow);transform:rotate(4deg);z-index:0}.vector-preview-top{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:20px}.vector-preview-top span{font-size:8px;letter-spacing:.13em;color:#87908f}.vector-preview-top b{font-size:11px}.vector-pathline{display:grid;grid-template-columns:repeat(6,1fr);align-items:center;margin:58px 2px 18px;position:relative}.vector-pathline:before{content:"";position:absolute;left:3%;right:3%;height:2px;background:#d6dcda}.vector-pathline span{position:relative;z-index:1;width:13px;height:13px;border-radius:50%;background:#fff;border:3px solid var(--accent);justify-self:center;transition:transform .25s ease}.vector-route-preview:hover .vector-pathline span:nth-child(2),.vector-route-preview:hover .vector-pathline span:nth-child(5){transform:translateY(-5px)}.vector-preview-labels{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}.vector-preview-labels span{text-align:center;color:#4d5862;font-size:8px;font-weight:800}.vector-preview-labels i{display:block;margin-bottom:3px;color:#a1a8ac;font-size:7px;font-style:normal}.vector-preview-pick{width:100%;margin-top:28px;padding:12px 13px;border:1px solid #dbe1de;background:#f4f8f5;border-radius:13px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;text-align:left;color:var(--ink);cursor:pointer}.vector-preview-pick span{font-size:8px;color:#658074;letter-spacing:.11em}.vector-preview-pick strong{font-size:12px}.vector-preview-pick svg{transition:transform .18s ease}.vector-preview-pick:hover svg{transform:translateX(3px)}
        .vector-goal-band{padding:42px 0;background:#fff;border-top:1px solid #e5e2dc;border-bottom:1px solid #e5e2dc}.vector-goal-inner{display:grid;grid-template-columns:minmax(260px,.72fr) minmax(0,1.5fr) auto;gap:30px;align-items:center}.vector-goal-inner h2{margin:7px 0 7px;font-size:24px;letter-spacing:-.035em}.vector-goal-inner p{margin:0;color:var(--muted);font-size:11px;line-height:1.6}.vector-goal-options{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.vector-goal-options button{min-height:92px;padding:12px;border:1px solid #dde2e3;border-radius:15px;background:#fafafa;color:var(--ink);display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:9px;text-align:left;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}.vector-goal-options button:hover{transform:translateY(-2px)}.vector-goal-options button[aria-pressed="true"]{border-color:#9abaae;background:#eef7f1}.vector-goal-options span{grid-row:1 / 3;color:#8e969c;font-size:8px;font-weight:850}.vector-goal-options b{align-self:end;font-size:10px;line-height:1.35}.vector-goal-options small{color:#6e7e76;font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.08em}.vector-recommendation{min-width:126px;min-height:92px;padding:14px;border:0;border-radius:16px;background:var(--ink);color:#fff;display:grid;grid-template-columns:1fr auto;align-items:center;text-align:left;cursor:pointer}.vector-recommendation span{grid-column:1 / 3;color:#b9c4c0;font-size:8px;letter-spacing:.1em;text-transform:uppercase}.vector-recommendation b{font-size:13px}.vector-recommendation svg{transition:transform .18s ease}.vector-recommendation:hover svg{transform:translateX(3px)}
        .vector-routes{padding:86px 0 72px}.vector-section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}.vector-section-head h2{margin:8px 0 0;font-size:clamp(28px,3.5vw,44px);letter-spacing:-.05em}.vector-route-count{color:#9aa1a6;font-size:9px;letter-spacing:.14em}.vector-route-map{display:grid;grid-template-columns:repeat(12,1fr);gap:12px;align-items:stretch}.vector-route-tile{position:relative;min-height:190px;padding:18px;border:1px solid rgba(30,38,48,.11);border-radius:20px;color:var(--ink);display:grid;grid-template-columns:auto 1fr auto;grid-template-rows:auto 1fr auto;gap:14px;text-align:left;cursor:pointer;overflow:hidden;transition:transform .2s ease,box-shadow .2s ease}.vector-route-tile:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(31,38,44,.08)}.route-start{grid-column:span 5;background:var(--mint)}.route-build{grid-column:span 7;background:var(--blue)}.route-earn{grid-column:span 7;background:var(--peach)}.route-creator{grid-column:span 5;background:var(--lav)}.route-read{grid-column:span 6;background:var(--yellow)}.route-return{grid-column:span 6;background:var(--rose)}.vector-route-tile.is-recommended{outline:3px solid rgba(43,95,82,.16);outline-offset:2px}.vector-tile-index{font-size:9px;color:#6f787e;font-weight:850}.vector-tile-icon{width:38px;height:38px;border:1px solid rgba(30,38,48,.12);background:rgba(255,255,255,.62);border-radius:12px;display:grid;place-items:center}.vector-tile-icon svg{width:17px}.vector-tile-copy{grid-column:1 / 4;align-self:end}.vector-tile-copy small{display:block;color:#5e696f;font-size:8px;letter-spacing:.13em;text-transform:uppercase;font-weight:850}.vector-tile-copy strong{display:block;margin-top:5px;font-size:21px;letter-spacing:-.025em}.vector-tile-copy em{display:block;margin-top:5px;color:#59636b;font-size:10px;font-style:normal}.vector-tile-reco{position:absolute;right:15px;top:14px;padding:5px 7px;border-radius:99px;background:rgba(255,255,255,.7);font-size:7px;font-weight:850;letter-spacing:.08em}.vector-tile-arrow{position:absolute;right:17px;bottom:18px;color:#4f5961;transition:transform .18s ease}.vector-route-tile:hover .vector-tile-arrow{transform:translateX(3px)}
        .vector-stratum{margin-bottom:32px;padding:20px 22px;border-top:1px solid #d8d4cc;border-bottom:1px solid #d8d4cc;display:flex;align-items:center;justify-content:space-between;gap:20px}.vector-stratum div{display:flex;align-items:center;gap:14px}.vector-stratum span{color:#7b858b;font-size:8px;letter-spacing:.13em;text-transform:uppercase}.vector-stratum b{font-size:11px}.vector-stratum a{display:inline-flex;align-items:center;gap:6px;color:var(--ink);font-size:10px;font-weight:850;text-decoration:none}.vector-footer{padding:26px 0 40px;display:flex;justify-content:space-between;color:#8a9297;font-size:9px}.vector-footer a{display:inline-flex;align-items:center;gap:5px;color:#68737a;text-decoration:none}
        .vector-bottom-nav{display:none}.vector-overlay{position:fixed;inset:0;z-index:60;background:rgba(28,34,38,.24);backdrop-filter:blur(5px);display:flex;justify-content:flex-end;animation:vectorFade .18s ease}.vector-drawer{width:min(480px,92vw);height:100%;padding:26px;background:#fff;border-left:1px solid #dfe4e5;box-shadow:-20px 0 60px rgba(29,36,40,.1);animation:vectorDrawerIn .26s cubic-bezier(.2,.8,.2,1)}.drawer-start{border-top:8px solid #a9d8bc}.drawer-build{border-top:8px solid #a8c5ed}.drawer-earn{border-top:8px solid #e7b99e}.drawer-creator{border-top:8px solid #cab7e6}.drawer-read{border-top:8px solid #e7d97d}.drawer-return{border-top:8px solid #deb8bf}.vector-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding-bottom:22px;border-bottom:1px solid #e4e7e7}.vector-drawer-title{display:flex;gap:13px}.vector-drawer-icon{flex:0 0 auto;width:42px;height:42px;border-radius:13px;background:#f4f5f3;border:1px solid #e0e3e2;display:grid;place-items:center}.vector-drawer-icon svg{width:18px}.vector-drawer-title small{font-size:8px;letter-spacing:.13em;color:#708078}.vector-drawer-title h2{margin:4px 0 6px;font-size:25px;letter-spacing:-.035em}.vector-drawer-title p{max-width:285px;margin:0;color:#707980;font-size:10px;line-height:1.55}.vector-close{flex:0 0 auto;width:36px;height:36px;border:1px solid #e0e3e3;border-radius:11px;background:#f8f8f7;color:#50595f;display:grid;place-items:center;cursor:pointer}.vector-close svg{width:17px}.vector-destinations{display:grid;gap:10px;margin-top:18px}.vector-destinations>a{min-height:94px;padding:13px;border:1px solid #dfe3e3;border-radius:15px;background:#fbfbfa;color:var(--ink);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;text-decoration:none;transition:transform .18s ease,border-color .18s ease,background .18s ease}.vector-destinations>a:hover{transform:translateX(-3px);border-color:#b7c6c0;background:#f5f9f6}.vector-status{padding:5px 6px;border-radius:7px;font-size:7px;font-weight:900;letter-spacing:.07em;border:1px solid currentColor}.status-free{color:#28704f}.status-paid{color:#5b55a7}.status-read{color:#8a6b16}.status-group{color:#52606b}.vector-destination-copy small{display:block;color:#a1a7aa;font-size:7px}.vector-destination-copy b{display:block;margin-top:3px;font-size:12px}.vector-destination-copy em{display:block;margin-top:4px;color:#737b80;font-size:9px;font-style:normal;line-height:1.45}.vector-drawer-foot{margin-top:24px;padding:16px 4px;border-top:1px solid #eceeed}.vector-drawer-foot span{display:block;color:#8a9397;font-size:8px;letter-spacing:.12em}.vector-drawer-foot b{display:block;margin-top:5px;font-size:11px}.vector-menu-sheet{width:min(430px,92vw);height:100%;padding:22px;background:#fff;box-shadow:-20px 0 60px rgba(29,36,40,.1);animation:vectorDrawerIn .26s cubic-bezier(.2,.8,.2,1)}.vector-menu-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:1px solid #e4e7e7}.vector-menu-head b{font-size:14px}.vector-menu-routes{display:grid;margin-top:12px}.vector-menu-routes button{min-height:70px;padding:12px 4px;border:0;border-bottom:1px solid #eceeee;background:transparent;color:var(--ink);display:grid;grid-template-columns:auto 1fr auto;grid-template-rows:auto auto;column-gap:11px;text-align:left;cursor:pointer}.vector-menu-routes button>span{grid-row:1 / 3;color:#9ba2a6;font-size:8px}.vector-menu-routes button>b{font-size:12px}.vector-menu-routes button>small{color:#7b8489;font-size:9px}.vector-menu-routes button>svg{grid-column:3;grid-row:1 / 3;align-self:center}
        @keyframes vectorFade{from{opacity:0}}@keyframes vectorDrawerIn{from{transform:translateX(24px);opacity:.75}}
        @media(max-width:920px){.vector-desktop-nav{display:none}.vector-menu-button{display:grid;place-items:center}.vector-hero{grid-template-columns:1fr .82fr;gap:36px;padding-top:62px}.vector-goal-inner{grid-template-columns:1fr}.vector-goal-options{grid-column:1}.vector-recommendation{grid-column:1;min-height:58px;grid-template-columns:auto 1fr auto}.vector-recommendation span{grid-column:auto}.vector-route-map{gap:10px}.route-start,.route-creator{grid-column:span 5}.route-build,.route-earn{grid-column:span 7}.route-read,.route-return{grid-column:span 6}}
        @media(max-width:660px){body{padding-bottom:74px}.vector-shell{width:min(100% - 24px,1180px)}.vector-header{height:60px;padding:0 12px;grid-template-columns:1fr auto}.vector-mark{width:32px;height:32px;border-radius:10px}.vector-brand b{font-size:11px}.vector-brand small{font-size:7px}.vector-lang button{padding:5px 7px}.vector-menu-button{width:34px;height:34px}.vector-hero{min-height:auto;padding:44px 0 38px;display:block}.vector-eyebrow{font-size:8px}.vector-hero h1{margin:12px 0 11px;max-width:94%;font-size:clamp(42px,13vw,60px);line-height:1.01}.vector-hero-copy>p{font-size:11px}.vector-hero-actions{margin-top:22px;gap:12px}.vector-primary{min-height:44px;padding:0 14px;font-size:10px;box-shadow:4px 4px 0 #d9dfd8}.vector-text-link{font-size:9px}.vector-route-preview{margin-top:34px;padding:18px;border-radius:20px;box-shadow:8px 8px 0 #e8e4dc}.vector-preview-top b{font-size:9px}.vector-pathline{margin:40px 0 14px}.vector-preview-labels span{font-size:6px}.vector-preview-pick{margin-top:20px}.vector-goal-band{padding:30px 0}.vector-goal-inner{gap:18px}.vector-goal-inner h2{font-size:20px}.vector-goal-inner p{font-size:9px}.vector-goal-options{display:grid;grid-template-columns:1fr;gap:7px}.vector-goal-options button{min-height:64px;grid-template-columns:auto 1fr auto;grid-template-rows:1fr;align-items:center}.vector-goal-options button span{grid-row:auto}.vector-goal-options button b{align-self:center}.vector-goal-options button small{justify-self:end}.vector-recommendation{min-height:54px}.vector-routes{padding:58px 0 42px}.vector-section-head h2{font-size:30px}.vector-route-count{display:none}.vector-route-map{display:grid;grid-template-columns:1fr;gap:8px}.vector-route-tile,.route-start,.route-build,.route-earn,.route-creator,.route-read,.route-return{grid-column:auto;min-height:126px;border-radius:17px}.vector-tile-copy strong{font-size:17px}.vector-tile-copy em{font-size:9px}.vector-stratum{margin-bottom:22px;padding:16px 2px}.vector-stratum div{display:block}.vector-stratum b{display:block;margin-top:5px;font-size:9px;max-width:220px;line-height:1.45}.vector-stratum a{font-size:9px;white-space:nowrap}.vector-footer{padding:22px 0 24px}.vector-bottom-nav{position:fixed;left:8px;right:8px;bottom:8px;z-index:45;height:58px;padding:5px;display:grid;grid-template-columns:repeat(4,1fr);background:rgba(255,255,255,.94);border:1px solid #dfe3e3;border-radius:18px;box-shadow:0 12px 36px rgba(25,32,36,.14);backdrop-filter:blur(14px)}.vector-bottom-nav button{border:0;background:transparent;color:#6d767c;border-radius:12px;display:grid;place-items:center;align-content:center;gap:2px}.vector-bottom-nav button:active{background:#f1f4f2;color:var(--ink)}.vector-bottom-nav svg{width:17px;height:17px}.vector-bottom-nav span{font-size:7px;font-weight:850}.vector-overlay{align-items:flex-end}.vector-drawer,.vector-menu-sheet{width:100%;height:auto;max-height:82vh;padding:16px 14px 20px;border-left:0;border-radius:22px 22px 0 0;animation:vectorSheetIn .26s cubic-bezier(.2,.8,.2,1);overflow:auto}.vector-drawer:before,.vector-menu-sheet:before{content:"";display:block;width:38px;height:4px;border-radius:99px;background:#d8dcdd;margin:0 auto 12px}.vector-drawer-head{padding-bottom:15px}.vector-drawer-title h2{font-size:21px}.vector-destination-copy b{font-size:10px}.vector-destination-copy em{font-size:8px}.vector-destinations>a{min-height:80px;padding:11px}.vector-status{font-size:6px}.vector-menu-routes button{min-height:62px}@keyframes vectorSheetIn{from{transform:translateY(25px);opacity:.75}}}
        @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
      `}</style>
    </main>
  );
}
