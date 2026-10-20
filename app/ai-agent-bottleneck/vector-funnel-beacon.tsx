// deploy-sync: first-party sensor production proof 2026-09-25
"use client";

import { useEffect } from "react";

const ENDPOINT = "https://fzqgpaxqolrjjhmxdcrf.supabase.co/functions/v1/vector-funnel-sensor";
const PROJECT = "vector";
const ROUTE = "vpj_owned_ai_agent_bottleneck_v2";

function refHost() {
  try {
    return document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}

function sessionKey() {
  try {
    const existing = sessionStorage.getItem("vector-funnel-session");
    if (existing) return existing;
    const created = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random();
    sessionStorage.setItem("vector-funnel-session", created);
    return created;
  } catch {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random();
  }
}

export default function VectorFunnelBeacon() {
  useEffect(() => {
    // Match the existing site analytics opt-out boundary.
    const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    const dnt = navigator.doNotTrack === "1" || (window as Window & { doNotTrack?: string }).doNotTrack === "1";
    if (gpc || dnt || (window as Window & { __vpTrackingDisabled?: boolean }).__vpTrackingDisabled === true) return;
    const startedAt = Date.now();
    const session = sessionKey();
    const params = new URLSearchParams(location.search);
    let engagedSent = false;

    const send = (eventType: "PAGE_ENGAGED" | "CTA_CLICK", extra: Record<string, unknown> = {}) => {
      const payload = {
        event_id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random(),
        project_unit_id: PROJECT,
        route_id: ROUTE,
        event_type: eventType,
        path: location.pathname,
        utm_source: (params.get("utm_source") || "").slice(0, 100),
        utm_medium: (params.get("utm_medium") || "").slice(0, 100),
        utm_campaign: (params.get("utm_campaign") || "").slice(0, 160),
        utm_content: (params.get("utm_content") || "").slice(0, 160),
        referrer_host: refHost().slice(0, 160),
        session_key: session,
        webdriver: !!navigator.webdriver,
        dwell_ms: Math.max(0, Date.now() - startedAt),
        qa: false,
        ...extra,
      };
      try {
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
          mode: "cors",
        });
      } catch {}
    };

    const timer = window.setTimeout(() => {
      if (engagedSent) return;
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;
      engagedSent = true;
      send("PAGE_ENGAGED", { input_trusted: false });
    }, 7000);

    const onClick = (ev: MouseEvent) => {
      if (!ev.isTrusted) return;
      const target = ev.target instanceof Element ? ev.target.closest('a[data-event="primary_cta_click"]') : null;
      if (!target) return;
      send("CTA_CLICK", {
        input_trusted: true,
        utm_content: "primary_cta_click",
      });
    };

    document.addEventListener("click", onClick, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return <span hidden data-vector-first-party-sensor="v1" aria-hidden="true" />;
}
