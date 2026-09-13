import { ImageResponse } from "next/og";

export const alt = "AIを増やしても仕事が速くならない理由 — Vector Praxis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "68px 76px",
        background: "#0b0d12",
        color: "#f4f1e8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, fontWeight: 700 }}>VECTOR PRAXIS</div>
        <div
          style={{
            display: "flex",
            padding: "12px 20px",
            border: "1px solid #6e7480",
            borderRadius: 999,
            fontSize: 21,
          }}
        >
          3択・無料診断
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 70, lineHeight: 1.08, fontWeight: 800, letterSpacing: -2 }}>
          <span>AIを増やしても、</span>
          <span>仕事は速くならない。</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 32, lineHeight: 1.35, color: "#c7cbd2" }}>
          <span>待ち・権限・引き継ぎ。</span>
          <span>いま一番近い詰まりを切り分ける。</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", gap: 18, fontSize: 22, color: "#9ca3af" }}>
          <span>READ</span><span>→</span><span>DIAGNOSE</span><span>→</span><span>NEXT</span>
        </div>
        <div style={{ display: "flex", fontSize: 25, fontWeight: 700 }}>vector-praxis-japan-hub.vercel.app</div>
      </div>
    </div>,
    size,
  );
}
