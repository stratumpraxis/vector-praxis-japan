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
        <Script id="posthog-tracker" strategy="afterInteractive">
          {`!function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init("phc_oTYapRSNXDtn8aY7wMNHfCDexRTkfb2H44MDVXwoUMSN",{api_host:"https://us.i.posthog.com",defaults:"2026-05-30"});
(function(){
  var params=new URLSearchParams(window.location.search);
  var path=window.location.pathname||"/";
  var isOwnedAgentBottleneck=path.indexOf("/ai-agent-bottleneck")===0;
  var assetId=isOwnedAgentBottleneck?"owned_ai_agent_bottleneck":(path.indexOf("/vector-works")===0?"vector_works":"vector_hub");
  var routeId=isOwnedAgentBottleneck?"vpj_owned_ai_agent_bottleneck_v1":"vp_main";
  var common={
    path:path,
    landing_path:path,
    asset_id:assetId,
    content_id:assetId,
    channel:"owned",
    route_id:routeId,
    utm_source:params.get("utm_source")||null,
    utm_medium:params.get("utm_medium")||null,
    utm_campaign:params.get("utm_campaign")||null,
    utm_content:params.get("utm_content")||null,
    referrer:document.referrer||null
  };
  try{
    if(!sessionStorage.getItem("vp_revenue_session_v1")){
      posthog.capture("traffic_session_start",common);
      sessionStorage.setItem("vp_revenue_session_v1","1");
    }
  }catch(_e){posthog.capture("traffic_session_start",common)}
  posthog.capture("funnel_view",common);
  document.addEventListener("click",function(e){
    var target=e.target;
    var a=target&&target.closest?target.closest("a[data-event]"):null;
    if(!a)return;
    var eventName=a.getAttribute("data-event")||"outbound_click";
    var destination=(function(){try{return new URL(a.href,window.location.href)}catch(_e){return null}})();
    var clickProps=Object.assign({},common,{
      event_name:eventName,
      destination_url:destination?destination.href:(a.href||null),
      destination_host:destination?destination.host:null,
      destination_path:destination?destination.pathname:null,
      link_text:(a.innerText||"").trim().slice(0,120)
    });
    posthog.capture(eventName,clickProps);
    if(eventName==="commerce_entry_click"){
      posthog.capture("primary_cta_click",Object.assign({},clickProps,{
        route_id:(destination&&destination.searchParams.get("route_id"))||clickProps.route_id,
        destination_asset_id:(destination&&destination.searchParams.get("asset_id"))||null,
        cta_id:isOwnedAgentBottleneck?"owned_ai_agent_bottleneck_cross_agent_kit":"vector_hub_cross_agent_kit",
        offer_id:"cross_agent_operating_kit_69",
        product_id:"cross_agent_operating_kit",
        product:"cross_agent_operating_kit"
      }));
    }
  },true);
})();`}
        </Script>
        <Script id="metricool-tracker" strategy="afterInteractive">
          {`function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"a229c17a19d8043b2f5dc65d7ce5aa28"})});`}
        </Script>
      </body>
    </html>
  );
}
