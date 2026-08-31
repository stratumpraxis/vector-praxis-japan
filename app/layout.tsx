import type { Metadata } from "next";
import Script from "next/script";
import { canonicalUrl, siteOrigin } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Vector Praxis｜構造を、実務へ。",
  description: "AI・構造思考・知識整理を、実務と収益設計へつなげるVector Praxis公式Hub。無料記事、実践記事、テーマ別マガジンを整理しています。",
  alternates: { canonical: canonicalUrl },
  openGraph: { title: "Vector Praxis｜構造を、実務へ。", description: "複雑な情報を、判断と実装に使える構造へ。", type: "website", locale: "ja_JP", siteName: "Vector Praxis" },
  twitter: { card: "summary", title: "Vector Praxis｜構造を、実務へ。", description: "複雑な情報を、判断と実装に使える構造へ。" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Script id="metricool-tracker" strategy="afterInteractive">
          {`function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"a229c17a19d8043b2f5dc65d7ce5aa28"})});`}
        </Script>
      </body>
    </html>
  );
}
