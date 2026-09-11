import type { Metadata } from "next";
import Script from "next/script";
import { canonicalUrl, siteOrigin } from "@/lib/site-url";
import VectorPremiumLayer from "./vector-premium-layer";
import "./globals.css";
import "./vector-premium-layer.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Vector Praxis Works Hub｜AIを使う・作る・収益につなげる",
  description: "AI実践・制作・収益化・Publishingを目的から選べるVector Praxis Works Hub。Start / Build / Earn / Creator / Read / Return の6ルートから必要な場所へ進めます。",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Vector Praxis Works Hub",
    description: "AIを使う。作る。収益につなげる。そして、次に必要な場所へ進める。",
    type: "website",
    locale: "ja_JP",
    alternateLocale: ["en_US"],
    siteName: "Vector Praxis",
  },
  twitter: {
    card: "summary",
    title: "Vector Praxis Works Hub",
    description: "AI実践、制作、収益化、Publishingを目的から選べるHub。",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        {children}
        <VectorPremiumLayer />
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 24px 28px",fontSize:11,opacity:.58,textAlign:"right"}}><a href="/privacy" style={{color:"inherit"}}>Analytics & Privacy</a></div>
        <Script id="posthog-tracker" strategy="afterInteractive">
          {`(function(){
var privacySignal=navigator.globalPrivacyControl===true||navigator.doNotTrack==="1"||window.doNotTrack==="1";
window.__vpTrackingDisabled=privacySignal;
if(privacySignal)return;
!function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init("phc_oTYapRSNXDtn8aY7wMNHfCDexRTkfb2H44MDVXwoUMSN",{api_host:"https://us.i.posthog.com",defaults:"2026-05-30",autocapture:false,capture_pageview:false,disable_session_recording:true,person_profiles:"never"});
var params=new URLSearchParams(window.location.search);
var path=window.location.pathname||"/";
var assetId=path.indexOf("/vector-works")===0?"vector_works":"vector_hub";
var common={path:path,landing_path:path,asset_id:assetId,content_id:assetId,channel:"owned",route_id:"vp_main",utm_source:params.get("utm_source")||null,utm_medium:params.get("utm_medium")||null,utm_campaign:params.get("utm_campaign")||null,utm_content:params.get("utm_content")||null,referrer:document.referrer||null};
try{if(!sessionStorage.getItem("vp_revenue_session_v1")){posthog.capture("traffic_session_start",common);sessionStorage.setItem("vp_revenue_session_v1","1")}}catch(_e){posthog.capture("traffic_session_start",common)}
posthog.capture("funnel_view",common);
document.addEventListener("click",function(e){var target=e.target;var a=target&&target.closest?target.closest("a[data-event]"):null;if(!a)return;var eventName=a.getAttribute("data-event")||"outbound_click";var destination=(function(){try{return new URL(a.href,window.location.href)}catch(_e){return null}})();var clickProps=Object.assign({},common,{event_name:eventName,destination_url:destination?destination.href:(a.href||null),destination_host:destination?destination.host:null,destination_path:destination?destination.pathname:null,link_text:(a.innerText||"").trim().slice(0,120)});posthog.capture(eventName,clickProps)},true);
document.addEventListener("submit",function(e){var form=e.target;if(!form||!form.matches||!form.matches("form[data-event]"))return;var eventName=form.getAttribute("data-event")||"form_submit";var destination=(function(){try{return new URL(form.action,window.location.href)}catch(_e){return null}})();posthog.capture(eventName,Object.assign({},common,{event_name:eventName,destination_url:destination?destination.href:null,destination_host:destination?destination.host:null,destination_path:destination?destination.pathname:null}))},true);
})();`}
        </Script>
      </body>
    </html>
  );
}
