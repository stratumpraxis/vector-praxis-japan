"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Calculator, GitBranch, ShieldCheck, TimerReset, WalletCards } from "lucide-react";

type BottleneckId = "wait" | "authority" | "handoff";

type Bottleneck = {
  id: BottleneckId;
  label: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  nextLabel: string;
  nextTitle: string;
  nextText: string;
  href: string;
  event: string;
  kind: "free" | "paid";
};

const ROUTE_ID = "vpj_owned_ai_agent_bottleneck_v1";
const OPERATING_KIT = `https://stratumpraxis.com/cross-agent-operating-kit.html?utm_source=vector_praxis&utm_medium=owned_article&utm_campaign=ai_agent_bottleneck_owned_20260911&utm_content=diagnosis_operating_kit&asset_id=cross_agent_operating_kit&route_id=${ROUTE_ID}`;
const AGENT_ECONOMICS_CALCULATOR = `https://stratumpraxis.com/ai-agent-economics-calculator.html?utm_source=vector_praxis&utm_medium=owned_article&utm_campaign=agent_economics_20260911&utm_content=diagnosis_calculator&route_id=${ROUTE_ID}`;

const items: Bottleneck[] = [
  {
    id: "wait",
    label: "WAIT",
    title: "レビュー待ち",
    text: "生成後に人の確認で止まる。",
    icon: <TimerReset />,
    nextLabel: "FREE FIRST",
    nextTitle: "Agent Economics Calculator",
    nextText: "レビュー時間・失敗・再試行まで含めて、待ち時間が採算を壊していないか先に測ります。",
    href: AGENT_ECONOMICS_CALCULATOR,
    event: "agent_economics_calculator_open",
    kind: "free",
  },
  {
    id: "authority",
    label: "RULE",
    title: "権限が曖昧",
    text: "毎回「ここまで進めていい？」が発生。",
    icon: <ShieldCheck />,
    nextLabel: "PAID IMPLEMENTATION",
    nextTitle: "Cross-Agent Operating Kit",
    nextText: "Role・Authority・Human Gateを、既存の運用テンプレートへ落とすルートです。",
    href: OPERATING_KIT,
    event: "commerce_entry_click",
    kind: "paid",
  },
  {
    id: "handoff",
    label: "HANDOFF",
    title: "引き継ぎ不足",
    text: "次のAIが状態を読み直す。",
    icon: <GitBranch />,
    nextLabel: "PAID IMPLEMENTATION",
    nextTitle: "Cross-Agent Operating Kit",
    nextText: "Agent間で何を渡すかを固定し、handoffを毎回の説明作業にしないための既存ルートです。",
    href: OPERATING_KIT,
    event: "commerce_entry_click",
    kind: "paid",
  },
];

function capture(event: string, props: Record<string, unknown> = {}) {
  try {
    (window as unknown as { posthog?: { capture: (name: string, properties?: Record<string, unknown>) => void } }).posthog?.capture(event, {
      surface: "vector_ai_agent_bottleneck",
      route_id: ROUTE_ID,
      ...props,
    });
  } catch {}
}

export default function BottleneckRouter() {
  const [selected, setSelected] = useState<BottleneckId>("wait");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vector-agent-bottleneck") as BottleneckId | null;
      if (saved && items.some((item) => item.id === saved)) setSelected(saved);
    } catch {}
  }, []);

  const current = useMemo(() => items.find((item) => item.id === selected) ?? items[0], [selected]);

  useEffect(() => {
    capture("vector_bottleneck_recommendation_view", {
      bottleneck: current.id,
      recommended_destination: current.nextTitle,
      destination_kind: current.kind,
    });
  }, [current.id, current.kind, current.nextTitle]);

  const choose = (id: BottleneckId) => {
    setSelected(id);
    try { localStorage.setItem("vector-agent-bottleneck", id); } catch {}
    const item = items.find((entry) => entry.id === id);
    capture("vector_bottleneck_select", {
      bottleneck: id,
      recommended_destination: item?.nextTitle ?? null,
      destination_kind: item?.kind ?? null,
    });
  };

  return (
    <>
      <div className="vx-choice-grid" role="group" aria-label="AI運用のボトルネック">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`vx-choice vx-choice-button ${selected === item.id ? "is-selected" : ""}`}
            aria-pressed={selected === item.id}
            onClick={() => choose(item.id)}
          >
            <span className="vx-choice-icon">{item.icon}</span>
            <span><small>{item.label}</small><b>{item.title}</b><em>{item.text}</em></span>
            {selected === item.id && <mark>今の詰まり</mark>}
          </button>
        ))}
      </div>

      <div className={`vx-bottleneck-result is-${current.kind}`} aria-live="polite">
        <div className="vx-bottleneck-result-icon">{current.kind === "free" ? <Calculator /> : <WalletCards />}</div>
        <div>
          <small>{current.nextLabel}</small>
          <h3>{current.nextTitle}</h3>
          <p>{current.nextText}</p>
        </div>
        <a
          href={current.href}
          target="_blank"
          rel="noopener noreferrer"
          data-event={current.event}
          onClick={() => capture("vector_bottleneck_next_click", {
            bottleneck: current.id,
            destination: current.nextTitle,
            destination_kind: current.kind,
          })}
        >
          {current.kind === "free" ? "無料で測る" : "実装ルートを見る"} <ArrowUpRight size={15} />
        </a>
      </div>
    </>
  );
}
