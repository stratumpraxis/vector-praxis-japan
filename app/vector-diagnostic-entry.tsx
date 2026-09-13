"use client";

import { usePathname } from "next/navigation";

const ROUTE_ID = "vpj_owned_ai_agent_bottleneck_v2";
const ASSET_ID = "ai_agent_bottleneck";
const DIAGNOSTIC_HREF = `/ai-agent-bottleneck?utm_source=vector_owned&utm_medium=site_entry&utm_campaign=vector_owned_entry_v2&utm_content=sticky_30sec&asset_id=${ASSET_ID}&route_id=${ROUTE_ID}`;

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
        width: "min(348px, calc(100vw - 36px))",
        border: "1px solid rgba(255,255,255,.20)",
        borderRadius: 18,
        background: "rgba(9,12,20,.97)",
        boxShadow: "0 22px 70px rgba(0,0,0,.42)",
        backdropFilter: "blur(16px)",
        padding: 15,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          fontSize: 10,
          letterSpacing: ".11em",
          opacity: 0.72,
          marginBottom: 8,
        }}
      >
        <span>VECTOR / FREE DIAGNOSTIC</span>
        <span style={{ letterSpacing: ".03em" }}>30 SEC · 3択</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 820, lineHeight: 1.4, marginBottom: 6 }}>
        AIが増えて遅くなったら、まず3択。
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.65, opacity: 0.76, marginBottom: 11 }}>
        待ち・権限・受け渡し。いま詰まっている場所だけ切り分けます。無料・登録不要。
      </div>
      <a
        href={DIAGNOSTIC_HREF}
        data-event="priority_entry_click"
        data-route-id={ROUTE_ID}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          borderRadius: 12,
          padding: "11px 13px",
          background: "#f4f5f7",
          color: "#11151c",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 850,
        }}
      >
        <span>30秒で詰まりを診断する</span>
        <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
