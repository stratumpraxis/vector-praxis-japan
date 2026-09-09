import type { Metadata } from "next";
import { VectorFooter, VectorHeader } from "@/components/vector-chrome";

export const metadata: Metadata = {
  title: "Analytics & Privacy｜Vector Praxis",
  description: "Vector Praxis Hubで利用するアクセス計測、外部検索、外部遷移についての説明。",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <main className="vx-page">
    <VectorHeader tone="return"/>
    <article className="shell vx-legal">
      <span className="vx-chip">ANALYTICS & PRIVACY</span>
      <h1>計測は、必要な範囲だけ。</h1>
      <p>Vector Praxisは、どの入口やCTAが実際に使われているかを判断するために、PostHogによる最小限のファネル計測を利用します。検索語や決済情報そのものをVector Praxis Hubの分析イベントへ送る設計にはしていません。</p>

      <h2>このHubで計測するもの</h2>
      <ul><li>ページのパス、参照元、UTMなどの流入情報</li><li>Hub内の明示的な導線・CTA・外部リンクが利用されたこと</li><li>Revenue Routeを区別するためのasset_id / route_idなどの識別子</li></ul>
      <p>PostHogは自動クリック収集を無効化し、セッション録画を無効化し、永続的なPerson Profileを作らない設定で利用します。</p>

      <h2>Global Privacy Control / Do Not Track</h2>
      <p>ブラウザがGlobal Privacy Control（GPC）またはDo Not Trackを有効にしている場合、このHubではPostHogの計測スクリプトを読み込まないようにしています。</p>

      <h2>外部サイト・購入</h2>
      <p>Stratum Praxis、note、Stripeなどへ移動した後は、それぞれのサイトの条件が適用されます。Vector Praxis Hub自体ではカード番号などの決済情報を入力させません。</p>

      <p>Last updated: 2026-09-07</p>
      <a href="/" className="vx-back">← Vector Praxisへ戻る</a>
    </article>
    <VectorFooter/>
  </main>;
}
