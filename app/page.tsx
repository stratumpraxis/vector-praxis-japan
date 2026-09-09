import { ArrowUpRight, Compass, FileText, Layers3 } from "lucide-react";
import MotionEnhancer from "./motion-enhancer";
import AIWorkstyleCheck from "./ai-workstyle-check";

const NOTE = "https://note.com/deft_eel6718";
const MAGAZINE = "https://note.com/deft_eel6718/m/md4fd3d914fe5";
const STRATUM = "https://stratumpraxis.com/";
const CONTACT = "mailto:digitalindexbase@gmail.com";

const routes = [
  { title:"AIアプリを作りたい", description:"目的・制約・実装方法から、自分に合うAI App Builderの進め方を選ぶ。", href:"https://payhip.com/b/LBtbr", event:"dib_app_builder_open" },
  { title:"AI実務タイプを知りたい", description:"AIの使い方を診断して、自分に合う次の実践ルートを選ぶ。", href:"https://ai-practical-check.pages.dev/", event:"dib_practical_check_open" },
  { title:"AI収益化を現実的に見たい", description:"AI収益化の主張を、Evidence・再現性・依存条件から確認する。", href:"https://stratumpraxis.com/ai-monetization-reality-check.html", event:"dib_reality_check_open" },
  { title:"デジタル商品を作りたい", description:"個人・クリエイター向けのDigital Product設計と公開ルートへ進む。", href:"https://stratumpraxis.com/global-digital-product-ai-starter-kit.html", event:"dib_digital_product_open" },
  { title:"スマホ中心で作りたい", description:"スマホだけでも進めやすい収益設計・スライド制作の既存資産を見る。", href:"https://stratumpraxis.com/smartphone-income-blueprint.html", event:"dib_smartphone_open" },
  { title:"収益ルートを整理したい", description:"ResearchやSignalを、次の収益アクションへ整理する。", href:"https://stratumpraxis.com/revenue-router.html", event:"dib_revenue_router_open" },
];

const resources = [
  { label:"無料記事 · @vector", title:"AIでSEO記事作成を効率化するなら、\n「書く」より先に見直したい5つの工程", description:"記事制作を、キーワード・構成・執筆・確認・入稿までの工程として整理します。", href:"https://note.com/deft_eel6718/n/n86dddd12d2b2", event:"article_open" },
  { label:"有料記事 · @vector", title:"AIアプリ開発に月額課金する前に｜\n無料AIビルダー使い分け完全ガイド 2026", description:"無料・有料AIビルダーの違いと、課金すべきタイミングを整理する実践ガイドです。", href:"https://note.com/deft_eel6718/n/n7574edd94a5b?app_launch=false", event:"product_click" },
  { label:"有料記事 · @vector", title:"AIで作るだけでは稼げない。\nAIを「収益パイプ」に変える実践設計", description:"需要、入口、無料価値、収益化、計測をひとつの流れとして設計するための実践記事です。", href:"https://note.com/deft_eel6718/n/nc120a3159186", event:"product_click" },
  { label:"有料記事 · @vector", title:"不安は再生される", description:"不安を増幅するコンテンツの構造を読み解き、行動へ変える判断の枠組みを扱います。", href:"https://note.com/deft_eel6718/n/nee032c683c27", event:"product_click" },
  { label:"有料記事 · @vector", title:"Codexを「実装部隊」にして、\n広告費0円から外貨収益を作る一人会社の設計書", description:"制作で終わらせず、商品・導線・公開・計測をつなぐ一人運営の設計を扱います。", href:"https://note.com/deft_eel6718/n/n6643ede87ad3", event:"product_click" },
];

const products = [
  { title:"AI App Builder Router 2026", note:"個人のAIアプリ開発ルート選択", href:"https://payhip.com/b/LBtbr" },
  { title:"AI Practical Check", note:"AI活用タイプ診断", href:"https://ai-practical-check.pages.dev/" },
  { title:"AI Monetization Reality Check", note:"AI収益化のEvidence確認", href:"https://stratumpraxis.com/ai-monetization-reality-check.html" },
  { title:"Global Digital Product AI Starter Kit", note:"デジタル商品づくり", href:"https://stratumpraxis.com/global-digital-product-ai-starter-kit.html" },
  { title:"Smartphone Income Blueprint", note:"スマホ中心の収益設計", href:"https://stratumpraxis.com/smartphone-income-blueprint.html" },
  { title:"Smartphone AI Slide Factory", note:"スマホ中心のスライド制作", href:"https://stratumpraxis.com/smartphone-ai-slide-factory.html" },
  { title:"Revenue Router", note:"個人・Creator向け収益ルート整理", href:"https://stratumpraxis.com/revenue-router.html" },
  { title:"Return Gate Growth OS", note:"再訪・Retention設計", href:"https://stratumpraxis.com/return-gate-growth-os.html" },
  { title:"Ordlume", note:"旧派生ライン", href:"https://stratumpraxis.com/ordlume/" },
];

function TrackedLink({href,event,children,className="",...rest}:{href:string;event:string;children:React.ReactNode;className?:string;[key:string]:unknown}) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-event={event} className={className} {...rest}>{children}</a>;
}

export default function Home(){return <main><MotionEnhancer/>
  <header className="site-header"><a href="#top" className="brand" aria-label="Digital Index Base ホーム"><span className="brand-mark" aria-hidden="true">DI</span><span>Digital Index Base</span></a><nav aria-label="メインナビゲーション"><a href="#start">はじめる</a><a href="#products">Tools</a><a href="#articles">Articles</a></nav></header>

  <section id="top" className="hero shell"><div className="eyebrow"><span/> DIGITAL INDEX BASE · @vector</div><h1>AIとデジタル実践を、<br/><em>使える形</em>へ。</h1><p className="hero-copy">Digital Index Baseは、個人・クリエイター・一人運営向けのAI活用、学習、制作、収益化、デジタル商品をまとめる主流サイトです。英語・日本語では分けず、「事業者としての法人購買か、個人としての実践か」で入口を分けます。</p><div className="hero-actions"><a href="#start" className="button primary">自分向けの入口を選ぶ <ArrowUpRight size={17}/></a><TrackedLink href={STRATUM} event="dib_to_stratum" className="button secondary">Business / B2B は Stratum</TrackedLink></div><div className="hero-index" aria-label="Digital Index Baseの領域"><span>01 <b>AI活用</b></span><span>02 <b>Creator / 個人</b></span><span>03 <b>Digital Product</b></span></div></section>

  <AIWorkstyleCheck/>

  <section id="start" className="section shell"><div className="section-heading"><p>START HERE</p><h2>何をしたいですか？</h2></div><div className="route-grid">{routes.map(item=><TrackedLink key={item.href} href={item.href} event={item.event} className="route-card"><Compass/><span><b>{item.title}</b><small>{item.description}</small></span><ArrowUpRight/></TrackedLink>)}</div></section>

  <section id="products" className="section muted-section"><div className="shell tool-empty"><div className="section-heading"><p>TOOLS / PRODUCTS</p><h2>非B2B資産をここに集約</h2><p>旧Stratum内に混在していた個人・Creator向け資産を、Digital Index Base側の入口として整理しています。URL移管は段階的に行い、まず入口とブランド責任を分離します。</p></div><div className="route-grid">{products.map(item=><TrackedLink key={item.href} href={item.href} event="dib_product_open" className="route-card"><Layers3/><span><b>{item.title}</b><small>{item.note}</small></span><ArrowUpRight/></TrackedLink>)}</div><p className="price-note">Business / team / workflow / ROI / governance / procurement / audit用途は Digital Index Base @stratum に分離します。</p></div></section>

  <section id="articles" className="section shell"><div className="section-heading split"><div><p>ARTICLES · LEGACY @vector</p><h2>旧Vector資産は、Digital Index Base配下で継続</h2></div><TrackedLink href={NOTE} event="article_open" className="text-link">noteですべて見る <ArrowUpRight size={15}/></TrackedLink></div><div className="resource-list">{resources.map((item,index)=><article className="resource" key={item.href}><div className="resource-no">0{index+1}</div><div className="resource-main"><span className="tag">{item.label}</span><h3>{item.title.split("\n").map(line=><span key={line}>{line}<br/></span>)}</h3><p>{item.description}</p></div><TrackedLink href={item.href} event={item.event} className="round-link" aria-label={`${item.title}を開く`}><ArrowUpRight/></TrackedLink></article>)}</div></section>

  <section className="section path-section"><div className="shell path-layout"><div className="section-heading"><p>BRAND ROUTING</p><h2>迷ったら、買う目的で分ける。</h2></div><ol className="path"><li><span>01</span><b>個人として使う</b><small>Digital Index Base</small></li><li><span>02</span><b>Creator / 学習 / 収益化</b><small>Digital Index Base</small></li><li><span>03</span><b>会社・チームの意思決定</b><small>Digital Index Base @stratum</small></li><li><span>04</span><b>仕事市場・求人探索</b><small>Digital Index Base @GWR</small></li></ol></div></section>

  <section className="section shell return-panel"><FileText size={26}/><div><p>DIGITAL INDEX BASE</p><h2>旧Vectorから、次の主流サイトへ。</h2><span>旧Vector由来の資産は @vector として段階的に整理します。新規の非B2B資産は Digital Index Base を正規ブランドとして扱います。</span></div><TrackedLink href={CONTACT} event="contact_open" className="button secondary">digitalindexbase@gmail.com</TrackedLink></section>

  <footer className="footer shell"><div><span className="brand-mark">DI</span><b>Digital Index Base</b></div><p>AI・Creator・Digital Productを、個人が使える実践へ。</p><nav aria-label="フッターナビゲーション"><TrackedLink href={NOTE} event="article_open">note</TrackedLink><TrackedLink href={MAGAZINE} event="article_open">@vector magazine</TrackedLink><TrackedLink href={STRATUM} event="dib_to_stratum">@stratum</TrackedLink></nav><small>© 2026 Digital Index Base</small></footer>
  <script dangerouslySetInnerHTML={{__html:`document.addEventListener('click',function(e){var a=e.target.closest('[data-event]');if(!a)return;var n=a.dataset.event;var d={event:n,link_url:a.href,link_text:(a.innerText||'').trim().slice(0,100)};window.dataLayer=window.dataLayer||[];window.dataLayer.push(d);if(typeof window.gtag==='function')window.gtag('event',n,d)});window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'digital_index_base_hub_view'});if(typeof window.gtag==='function')window.gtag('event','digital_index_base_hub_view');`}}/>
 </main>}