import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics & Privacy｜Vector Praxis",
  description: "Vector Praxis Hubで利用するアクセス計測、外部検索、外部遷移についての説明。",
};

export default function PrivacyPage() {
  return <main className="shell" style={{maxWidth:860,paddingTop:72,paddingBottom:96}}>
    <p style={{letterSpacing:".16em",fontSize:11,opacity:.65}}>ANALYTICS & PRIVACY</p>
    <h1 style={{fontSize:"clamp(36px,6vw,64px)",lineHeight:1.05,letterSpacing:"-.04em",margin:"10px 0 22px"}}>計測は、必要な範囲だけ。</h1>
    <p style={{lineHeight:1.9,opacity:.78}}>Vector Praxisは、どの入口やCTAが実際に使われているかを判断するためにアクセス計測を利用します。検索語や決済情報そのものをVector Praxis Hubの分析イベントへ送る設計にはしていません。</p>

    <section style={{marginTop:42}}>
      <h2>このHubで計測するもの</h2>
      <ul style={{lineHeight:1.9,opacity:.78}}>
        <li>ページのパス、参照元、UTMなどの流入情報</li>
        <li>Hub内の導線・CTA・外部リンクが利用されたこと</li>
        <li>Revenue Routeを区別するためのasset_id / route_idなどの識別子</li>
      </ul>
      <p style={{lineHeight:1.9,opacity:.78}}>PostHogは自動クリック収集を無効化し、セッション録画を無効化し、永続的なPerson Profileを作らない設定で利用します。MetricoolのWeb計測スクリプトも一部の流入把握に利用します。各サービスへの接続時には、HTTP通信に必要な技術情報がサービス側で処理される場合があります。</p>
    </section>

    <section style={{marginTop:36}}>
      <h2>Global Privacy Control / Do Not Track</h2>
      <p style={{lineHeight:1.9,opacity:.78}}>ブラウザがGlobal Privacy Control（GPC）またはDo Not Trackを有効にしている場合、このHubではPostHogとMetricoolの計測スクリプトを読み込まないようにしています。</p>
    </section>

    <section style={{marginTop:36}}>
      <h2>Vector内のBing検索</h2>
      <p style={{lineHeight:1.9,opacity:.78}}>AI Business Pulseの検索欄は通常のHTMLフォームでBingへ直接送信します。入力した検索語はVector Praxisのサーバーで処理・保存せず、Vector Praxisの分析イベントにも含めません。送信後はBing側の利用条件・プライバシー方針が適用されます。</p>
    </section>

    <section style={{marginTop:36}}>
      <h2>外部サイト・購入</h2>
      <p style={{lineHeight:1.9,opacity:.78}}>Global Work Radar、Stratum Praxis、note、Stripeなどへ移動した後は、それぞれのサイトの条件が適用されます。Vector Praxis Hub自体ではカード番号などの決済情報を入力させません。価格・在庫・求人条件など変動する情報は、最終的に遷移先の最新表示を確認してください。</p>
    </section>

    <p style={{marginTop:48,fontSize:12,opacity:.55}}>Last updated: 2026-09-07</p>
    <a href="/" style={{display:"inline-block",marginTop:20,color:"inherit"}}>← Vector Praxisへ戻る</a>
  </main>;
}
