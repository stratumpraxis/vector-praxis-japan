"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Compass, FileText, Layers3 } from "lucide-react";
import MotionEnhancer from "./motion-enhancer";
import AIWorkstyleCheck from "./ai-workstyle-check";

type Lang = "ja" | "en" | "zh" | "ko";
type LocalText = Record<Lang, string>;

const NOTE = "https://note.com/deft_eel6718";
const MAGAZINE = "https://note.com/deft_eel6718/m/md4fd3d914fe5";
const STRATUM = "https://stratumpraxis.com/";

const COPY: Record<Lang, Record<string, string>> = {
  ja: {
    navStart:"はじめる", navTools:"Tools", navArticles:"Articles", role:"@vector · 非B2B / Individual & Creator",
    heroA:"AIとデジタル実践を、", heroB:"次の一手へ。",
    heroText:"Vector Praxisは、個人・Creator・一人運営向けのAI活用、学習、制作、デジタル商品、収益化の実践資産をまとめた非B2Bラインです。情報を増やすより、次に何を試すかを見つけやすくします。",
    heroCta:"自分向けの入口を選ぶ", heroArticles:"記事を見る", index1:"AI活用", index2:"Creator / 個人", index3:"Digital Product",
    startKicker:"START HERE", startTitle:"今、何を進めたいですか？", startText:"目的から入口を選び、必要な資産だけに進めます。",
    toolsKicker:"TOOLS / PRODUCTS", toolsTitle:"非B2Bの実践資産を、用途別に整理。", toolsText:"診断・制作・商品化・収益化を、目的ごとに選べるようにしています。",
    legacy:"一部の旧資産は移管途中のため stratumpraxis.com で開きます。内容は非B2B資産として継続します。",
    articlesKicker:"ARTICLES · @vector", articlesTitle:"読むだけで終わらず、判断と実行につなぐ。", allArticles:"noteですべて見る",
    pathKicker:"PRACTICE ROUTE", pathTitle:"学ぶ → 作る → 確かめる → 収益へ。", path1:"理解する", path2:"作って試す", path3:"現実性を確認", path4:"次の行動へ",
    bridgeKicker:"BUSINESS / TEAM", bridgeTitle:"法人・チームのAI判断は @stratum へ。", bridgeText:"Workflow、ROI、AI Agent Control、業務システムなどB2B用途はStratum Praxisに分離しています。", bridgeCta:"@stratum を開く",
    footerText:"AI・Creator・Digital Productを、個人が使える実践へ。", jpContent:"日本語コンテンツ"
  },
  en: {
    navStart:"Start", navTools:"Tools", navArticles:"Articles", role:"@vector · Non-B2B / Individual & Creator",
    heroA:"Turn AI and digital practice", heroB:"into a clear next move.",
    heroText:"Vector Praxis is the non-B2B asset line for individuals, creators, and solo operators: AI use, learning, making, digital products, and monetization. The goal is not more information—it is an easier next experiment.",
    heroCta:"Choose your starting point", heroArticles:"Browse articles", index1:"AI Practice", index2:"Creator / Solo", index3:"Digital Product",
    startKicker:"START HERE", startTitle:"What do you want to move forward now?", startText:"Choose by goal and go only to the asset that fits the next step.",
    toolsKicker:"TOOLS / PRODUCTS", toolsTitle:"Non-B2B assets, organized by use case.", toolsText:"Diagnostics, creation, productization, and monetization routes without the catalog overload.",
    legacy:"Some legacy non-B2B assets still open on stratumpraxis.com while URLs are being separated. Their role remains non-B2B.",
    articlesKicker:"ARTICLES · @vector", articlesTitle:"Read to decide and act—not just to collect information.", allArticles:"See all on note",
    pathKicker:"PRACTICE ROUTE", pathTitle:"Learn → Make → Validate → Monetize.", path1:"Understand", path2:"Build & test", path3:"Check reality", path4:"Take the next action",
    bridgeKicker:"BUSINESS / TEAM", bridgeTitle:"For company and team AI decisions, use @stratum.", bridgeText:"Workflow, ROI, AI agent control, and business systems are separated into Stratum Praxis for B2B use.", bridgeCta:"Open @stratum",
    footerText:"AI, creator work, and digital products—made practical for individuals.", jpContent:"Japanese content"
  },
  zh: {
    navStart:"开始", navTools:"工具", navArticles:"文章", role:"@vector · 非B2B / 个人与Creator",
    heroA:"把AI与数字实践", heroB:"变成清晰的下一步。",
    heroText:"Vector Praxis 是面向个人、Creator 与单人运营者的非B2B资产线，涵盖AI使用、学习、制作、数字产品与变现。重点不是增加信息，而是更快找到下一次可验证的行动。",
    heroCta:"选择适合我的入口", heroArticles:"查看文章", index1:"AI实践", index2:"Creator / 个人", index3:"数字产品",
    startKicker:"START HERE", startTitle:"你现在最想推进什么？", startText:"按目标选择入口，只进入当前真正需要的资产。",
    toolsKicker:"TOOLS / PRODUCTS", toolsTitle:"按用途整理非B2B实践资产。", toolsText:"把诊断、制作、产品化与变现路径整理得更简单。",
    legacy:"部分旧的非B2B资产仍暂时从 stratumpraxis.com 打开，角色仍属于非B2B资产。",
    articlesKicker:"ARTICLES · @vector", articlesTitle:"阅读不是终点，要连接判断与行动。", allArticles:"在 note 查看全部",
    pathKicker:"PRACTICE ROUTE", pathTitle:"学习 → 制作 → 验证 → 变现。", path1:"理解", path2:"制作与测试", path3:"验证现实性", path4:"进入下一步",
    bridgeKicker:"BUSINESS / TEAM", bridgeTitle:"企业与团队的AI决策请前往 @stratum。", bridgeText:"Workflow、ROI、AI Agent Control 与业务系统等B2B用途由 Stratum Praxis 负责。", bridgeCta:"打开 @stratum",
    footerText:"让AI、Creator与数字产品成为个人可执行的实践。", jpContent:"日语内容"
  },
  ko: {
    navStart:"시작", navTools:"도구", navArticles:"아티클", role:"@vector · 비B2B / 개인 & Creator",
    heroA:"AI와 디지털 실천을", heroB:"명확한 다음 행동으로.",
    heroText:"Vector Praxis는 개인, Creator, 1인 운영자를 위한 비B2B 자산 라인입니다. AI 활용, 학습, 제작, 디지털 상품, 수익화를 다루며 정보량보다 다음 실험을 쉽게 찾는 데 집중합니다.",
    heroCta:"내 시작점 고르기", heroArticles:"아티클 보기", index1:"AI 활용", index2:"Creator / 개인", index3:"Digital Product",
    startKicker:"START HERE", startTitle:"지금 무엇을 가장 먼저 진행하고 싶나요?", startText:"목적에 맞는 입구를 선택하고 필요한 자산으로만 이동합니다.",
    toolsKicker:"TOOLS / PRODUCTS", toolsTitle:"비B2B 실천 자산을 용도별로 정리했습니다.", toolsText:"진단, 제작, 상품화, 수익화 경로를 복잡한 카탈로그 없이 선택할 수 있습니다.",
    legacy:"일부 기존 비B2B 자산은 URL 분리 중이라 stratumpraxis.com에서 열립니다. 역할은 계속 비B2B입니다.",
    articlesKicker:"ARTICLES · @vector", articlesTitle:"읽고 끝내지 않고 판단과 실행으로 연결합니다.", allArticles:"note에서 모두 보기",
    pathKicker:"PRACTICE ROUTE", pathTitle:"학습 → 제작 → 검증 → 수익화.", path1:"이해", path2:"만들고 테스트", path3:"현실성 확인", path4:"다음 행동",
    bridgeKicker:"BUSINESS / TEAM", bridgeTitle:"회사·팀의 AI 판단은 @stratum으로.", bridgeText:"Workflow, ROI, AI Agent Control, 비즈니스 시스템 등 B2B 용도는 Stratum Praxis로 분리되어 있습니다.", bridgeCta:"@stratum 열기",
    footerText:"AI·Creator·Digital Product를 개인이 실행할 수 있는 형태로.", jpContent:"일본어 콘텐츠"
  }
};

const routes: {title:LocalText; description:LocalText; href:string; event:string}[] = [
  { title:{ja:"AIアプリを作りたい",en:"I want to build an AI app",zh:"我想做一个AI应用",ko:"AI 앱을 만들고 싶다"}, description:{ja:"目的・制約・実装方法から、自分に合うAI App Builderの進め方を選ぶ。",en:"Choose an AI app-building route from your goal, constraints, and implementation style.",zh:"从目标、限制与实现方式中选择适合自己的AI应用构建路线。",ko:"목적, 제약, 구현 방식에 맞는 AI App Builder 경로를 고릅니다."}, href:"https://payhip.com/b/LBtbr", event:"vector_app_builder_open" },
  { title:{ja:"AI実務タイプを知りたい",en:"I want to understand my AI work style",zh:"我想了解自己的AI工作类型",ko:"내 AI 실무 유형을 알고 싶다"}, description:{ja:"AIの使い方を診断して、自分に合う次の実践ルートを選ぶ。",en:"Check how you use AI and choose a better next practice route.",zh:"诊断你的AI使用方式，并选择更适合的下一步实践。",ko:"AI 사용 방식을 진단하고 나에게 맞는 다음 실천 경로를 고릅니다."}, href:"https://ai-practical-check.pages.dev/", event:"vector_practical_check_open" },
  { title:{ja:"AI収益化を現実的に見たい",en:"I want a reality check on AI monetization",zh:"我想现实地判断AI变现",ko:"AI 수익화를 현실적으로 보고 싶다"}, description:{ja:"AI収益化の主張を、Evidence・再現性・依存条件から確認する。",en:"Check monetization claims through evidence, repeatability, and dependencies.",zh:"从证据、可重复性和依赖条件检查AI变现主张。",ko:"근거, 재현성, 의존 조건으로 AI 수익화 주장을 확인합니다."}, href:"https://stratumpraxis.com/ai-monetization-reality-check.html", event:"vector_reality_check_open" },
  { title:{ja:"デジタル商品を作りたい",en:"I want to make a digital product",zh:"我想做数字产品",ko:"디지털 상품을 만들고 싶다"}, description:{ja:"個人・Creator向けのDigital Product設計と公開ルートへ進む。",en:"Move from product idea to a practical digital-product publishing route.",zh:"从产品想法进入面向个人与Creator的数字产品发布路线。",ko:"개인·Creator용 Digital Product 설계와 공개 경로로 이동합니다."}, href:"https://stratumpraxis.com/global-digital-product-ai-starter-kit.html", event:"vector_digital_product_open" },
  { title:{ja:"スマホ中心で作りたい",en:"I want a mobile-first workflow",zh:"我想以手机为主来制作",ko:"스마트폰 중심으로 만들고 싶다"}, description:{ja:"スマホでも進めやすい収益設計・制作の既存資産を見る。",en:"Use mobile-friendly assets for creation and monetization planning.",zh:"查看适合手机操作的制作与变现设计资产。",ko:"스마트폰에서도 진행하기 쉬운 제작·수익 설계 자산을 봅니다."}, href:"https://stratumpraxis.com/smartphone-income-blueprint.html", event:"vector_smartphone_open" },
  { title:{ja:"収益ルートを整理したい",en:"I want to organize my revenue route",zh:"我想整理收入路线",ko:"수익 경로를 정리하고 싶다"}, description:{ja:"ResearchやSignalを、次の収益アクションへ整理する。",en:"Turn research and signals into one concrete revenue action.",zh:"把研究与信号整理成一个明确的收入行动。",ko:"Research와 Signal을 하나의 구체적인 수익 행동으로 정리합니다."}, href:"https://stratumpraxis.com/revenue-router.html", event:"vector_revenue_router_open" },
];

const products = [
  { title:"AI App Builder Router 2026", note:"AI APP BUILDING", href:"https://payhip.com/b/LBtbr" },
  { title:"AI Practical Check", note:"AI WORKSTYLE", href:"https://ai-practical-check.pages.dev/" },
  { title:"AI Monetization Reality Check", note:"MONETIZATION", href:"https://stratumpraxis.com/ai-monetization-reality-check.html" },
  { title:"Global Digital Product AI Starter Kit", note:"DIGITAL PRODUCT", href:"https://stratumpraxis.com/global-digital-product-ai-starter-kit.html" },
  { title:"Smartphone Income Blueprint", note:"MOBILE FIRST", href:"https://stratumpraxis.com/smartphone-income-blueprint.html" },
  { title:"Smartphone AI Slide Factory", note:"CREATION", href:"https://stratumpraxis.com/smartphone-ai-slide-factory.html" },
  { title:"Revenue Router", note:"REVENUE ROUTING", href:"https://stratumpraxis.com/revenue-router.html" },
  { title:"Return Gate Growth OS", note:"RETENTION", href:"https://stratumpraxis.com/return-gate-growth-os.html" },
];

const resources = [
  { title:"AIでSEO記事作成を効率化するなら、\n「書く」より先に見直したい5つの工程", description:"記事制作を、キーワード・構成・執筆・確認・入稿までの工程として整理します。", href:"https://note.com/deft_eel6718/n/n86dddd12d2b2", event:"article_open" },
  { title:"AIアプリ開発に月額課金する前に｜\n無料AIビルダー使い分け完全ガイド 2026", description:"無料・有料AIビルダーの違いと、課金すべきタイミングを整理する実践ガイドです。", href:"https://note.com/deft_eel6718/n/n7574edd94a5b?app_launch=false", event:"product_click" },
  { title:"AIで作るだけでは稼げない。\nAIを「収益パイプ」に変える実践設計", description:"需要、入口、無料価値、収益化、計測をひとつの流れとして設計します。", href:"https://note.com/deft_eel6718/n/nc120a3159186", event:"product_click" },
  { title:"不安は再生される", description:"不安を増幅するコンテンツ構造を読み解き、行動へ変える判断の枠組みを扱います。", href:"https://note.com/deft_eel6718/n/nee032c683c27", event:"product_click" },
  { title:"Codexを「実装部隊」にして、\n広告費0円から外貨収益を作る一人会社の設計書", description:"制作で終わらせず、商品・導線・公開・計測をつなぐ一人運営の設計を扱います。", href:"https://note.com/deft_eel6718/n/n6643ede87ad3", event:"product_click" },
];

function TrackedLink({href,event,children,className="",...rest}:{href:string;event:string;children:React.ReactNode;className?:string;[key:string]:unknown}) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-event={event} className={className} {...rest}>{children}</a>;
}

export default function Home(){
  const [lang,setLang] = useState<Lang>("ja");
  const c = COPY[lang];

  useEffect(()=>{
    let preferred:Lang="ja";
    try {
      const saved=localStorage.getItem("vector-lang") as Lang | null;
      if(saved && ["ja","en","zh","ko"].includes(saved)) preferred=saved;
      else {
        const n=(navigator.language||"ja").toLowerCase();
        preferred=n.startsWith("en")?"en":n.startsWith("zh")?"zh":n.startsWith("ko")?"ko":"ja";
      }
    } catch {}
    setLang(preferred);
  },[]);

  useEffect(()=>{
    document.documentElement.lang=lang==="zh"?"zh-CN":lang;
    try{localStorage.setItem("vector-lang",lang)}catch{}
  },[lang]);

  return <main><MotionEnhancer/>
    <header className="site-header vp-header">
      <a href="#top" className="brand" aria-label="Vector Praxis home"><span className="brand-mark" aria-hidden="true">VP</span><span>Vector Praxis</span></a>
      <nav aria-label="Main navigation"><a href="#start">{c.navStart}</a><a href="#products">{c.navTools}</a><a href="#articles">{c.navArticles}</a></nav>
      <div className="vp-lang-switch" role="group" aria-label="Language">
        {(["ja","en","zh","ko"] as Lang[]).map(l=><button key={l} type="button" aria-pressed={lang===l} onClick={()=>setLang(l)}>{l==="ja"?"日本語":l==="en"?"EN":l==="zh"?"中文":"한국어"}</button>)}
      </div>
    </header>

    <section id="top" className="hero shell vp-hero">
      <div className="eyebrow"><span/> {c.role}</div>
      <h1>{c.heroA}<br/><em>{c.heroB}</em></h1>
      <p className="hero-copy">{c.heroText}</p>
      <div className="hero-actions"><a href="#start" className="button primary">{c.heroCta} <ArrowUpRight size={17}/></a><a href="#articles" className="button secondary">{c.heroArticles}</a></div>
      <div className="hero-index" aria-label="Vector Praxis areas"><span>01 <b>{c.index1}</b></span><span>02 <b>{c.index2}</b></span><span>03 <b>{c.index3}</b></span></div>
    </section>

    <AIWorkstyleCheck/>

    <section id="start" className="section shell"><div className="section-heading"><p>{c.startKicker}</p><h2>{c.startTitle}</h2><span className="vp-section-copy">{c.startText}</span></div><div className="route-grid">{routes.map(item=><TrackedLink key={item.href} href={item.href} event={item.event} className="route-card"><Compass/><span><b>{item.title[lang]}</b><small>{item.description[lang]}</small></span><ArrowUpRight/></TrackedLink>)}</div></section>

    <section id="products" className="section muted-section"><div className="shell tool-empty"><div className="section-heading"><p>{c.toolsKicker}</p><h2>{c.toolsTitle}</h2><span className="vp-section-copy">{c.toolsText}</span></div><div><div className="route-grid vp-product-grid">{products.map(item=><TrackedLink key={item.href} href={item.href} event="vector_product_open" className="route-card vp-product"><Layers3/><span><small className="vp-product-label">{item.note}</small><b>{item.title}</b></span><ArrowUpRight/></TrackedLink>)}</div><p className="price-note">{c.legacy}</p></div></div></section>

    <section id="articles" className="section shell"><div className="section-heading split"><div><p>{c.articlesKicker}</p><h2>{c.articlesTitle}</h2></div><TrackedLink href={NOTE} event="article_open" className="text-link">{c.allArticles} <ArrowUpRight size={15}/></TrackedLink></div><div className="resource-list">{resources.map((item,index)=><article className="resource" key={item.href}><div className="resource-no">0{index+1}</div><div className="resource-main"><span className="tag">{c.jpContent} · @vector</span><h3>{item.title.split("\n").map(line=><span key={line}>{line}<br/></span>)}</h3><p>{item.description}</p></div><TrackedLink href={item.href} event={item.event} className="round-link" aria-label={`${item.title}を開く`}><ArrowUpRight/></TrackedLink></article>)}</div></section>

    <section className="section path-section"><div className="shell path-layout"><div className="section-heading"><p>{c.pathKicker}</p><h2>{c.pathTitle}</h2></div><ol className="path"><li><span>01</span><b>{c.path1}</b><small>Articles / Check</small></li><li><span>02</span><b>{c.path2}</b><small>Builder / Product</small></li><li><span>03</span><b>{c.path3}</b><small>Reality / Evidence</small></li><li><span>04</span><b>{c.path4}</b><small>Revenue Route</small></li></ol></div></section>

    <section className="section shell return-panel vp-bridge"><FileText size={26}/><div><p>{c.bridgeKicker}</p><h2>{c.bridgeTitle}</h2><span>{c.bridgeText}</span></div><TrackedLink href={STRATUM} event="vector_to_stratum" className="button secondary">{c.bridgeCta} <ArrowUpRight size={15}/></TrackedLink></section>

    <footer className="footer shell"><div><span className="brand-mark">VP</span><b>Vector Praxis</b></div><p>{c.footerText}</p><nav aria-label="Footer navigation"><TrackedLink href={NOTE} event="article_open">note</TrackedLink><TrackedLink href={MAGAZINE} event="article_open">@vector magazine</TrackedLink><TrackedLink href={STRATUM} event="vector_to_stratum">@stratum</TrackedLink></nav><small>© 2026 Vector Praxis · @vector</small></footer>

    <style jsx global>{`
      .vp-header{grid-template-columns:1fr auto auto;display:grid;gap:22px}.vp-lang-switch{display:flex;gap:4px;padding:4px;border:1px solid #29364a;border-radius:10px;background:#090e16}.vp-lang-switch button{border:0;background:transparent;color:#758397;padding:7px 8px;border-radius:7px;font:700 10px/1 system-ui;cursor:pointer}.vp-lang-switch button[aria-pressed="true"],.vp-lang-switch button:hover{background:#172337;color:#eef6ff}.vp-hero .eyebrow{max-width:max-content}.vp-section-copy{display:block;margin-top:13px;max-width:660px;color:#8f9aaa;font-size:13px;line-height:1.8}.vp-product-grid{grid-template-columns:repeat(2,1fr)}.vp-product{min-height:190px}.vp-product-label{color:#74c7ff!important;font-size:9px!important;letter-spacing:.12em}.vp-bridge{border-color:#35465c;background:linear-gradient(120deg,#101a2b,#0b111b)}
      @media(max-width:980px){.vp-header{grid-template-columns:1fr auto}.vp-header nav{display:none}.vp-lang-switch{justify-self:end}.tool-empty{grid-template-columns:1fr}.vp-product-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:650px){.vp-header{height:auto;min-height:72px;grid-template-columns:1fr;padding-block:10px}.vp-lang-switch{justify-self:start;max-width:100%;overflow:auto}.vp-product-grid{grid-template-columns:1fr}.vp-lang-switch button{white-space:nowrap}}
    `}</style>
  </main>
}
