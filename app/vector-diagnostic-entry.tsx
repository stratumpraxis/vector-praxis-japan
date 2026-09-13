"use client";

import { usePathname } from "next/navigation";

const ROUTE_ID = "vpj_owned_ai_agent_bottleneck_v2";

export default function VectorDiagnosticEntry() {
  const pathname = usePathname();

  if (pathname?.startsWith("/ai-agent-bottleneck")) return null;

  return (
    <aside
      aria-label="Vector AI bottleneck diagnostic"
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 40,
        width: "min(330px, calc(100vw - 36px))",
        border: "1px solid rgba(255,255,255,.14)",
        borderRadius: 16,
        background: "rgba(12,15,22,.94)",
        boxShadow: "0 18px 50px rgba(0,0,0,.28)",
        backdropFilter: "blur(14px)",
        padding: 14,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: ".12em", opacity: 0.62, marginBottom: 6 }}>
        VECTOR / FREE DIAGNOSTIC
      </div>
      <div style={{ fontSize: 14, fontWeight: 750, lineHeight: 1.45, marginBottom: 5 }}>
        AIが増えて、逆に遅くなった？
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.72, marginBottom: 10 }}>
        待ち・権限・受け渡し。3択で最初のボトルネックを切り分けます。
      </div>
      <a
        href="/ai-agent-bottleneck?utm_source=vector_owned&utm_medium=site_entry&utm_campaign=ai_agent_bottleneck&utm_content=diagnostic_entry"
        data-event="priority_entry_click"
        data-route-id={ROUTE_ID}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          borderRadius: 11,
          padding: "10px 12px",
          background: "#f4f5f7",
          color: "#11151c",
          textDecoration: "none",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        <span>無料で診断する</span>
        <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
