"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, GitBranch, ShieldCheck, TimerReset, WalletCards } from "lucide-react";
import styles from "./bottleneck-router.module.css";

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
  external?: boolean;
};

const ROUTE_ID = "vpj_owned_ai_agent_bottleneck_v2";
const NOTE_DEEP_DIVE_BASE = "https://note.com/deft_eel6718/n/ncaff8351e529";

function paidNote(content: string) {
  return `${NOTE_DEEP_DIVE_BASE}?utm_source=vector_praxis_site&utm_medium=diagnostic&utm_campaign=ai_agent_bottleneck_owned_20260913&utm_content=${content}&asset_id=note_ncaff8351e529&route_id=${ROUTE_ID}`;
}

const items: Bottleneck[] = [
  {
    id: "wait",
    label: "WAIT",
    title: "レビュー待ち",
    text: "生成後に人の確認で止まる。",
    icon: <TimerReset />,
    nextLabel: "FREE FIRST",
    nextTitle: "3つの運用ルールを先に確認",
    nextText: "Role・Authority・Handoffをこのページ内で整理してから、必要なら深掘り記事へ進みます。",
    href: "#fix",
    event: "qualified_tool_action",
    kind: "free",
  },
  {
    id: "authority",
    label: "RULE",
    title: "権限が曖昧",
    text: "毎回「ここまで進めていい？」が発生。",
    icon: <ShieldCheck />,
    nextLabel: "VECTOR DEEP DIVE",
    nextTitle: "AIを増やすほど仕事が遅くなる理由",
    nextText: "複数AIの役割・権限・Human Gateを、Vectorの既存有料noteでまとめて確認します。",
    href: paidNote("diagnosis_authority"),
    event: "primary_cta_click",
    kind: "paid",
    external: true,
  },
  {
    id: "handoff",
    label: "HANDOFF",
    title: "引き継ぎ不足",
    text: "次のAIが状態を読み直す。",
    icon: <GitBranch />,
    nextLabel: "VECTOR DEEP DIVE",
    nextTitle: "AIを増やすほど仕事が遅くなる理由",
    nextText: "ChatGPT・Claude・GitHub間の受け渡しを重複させない設計を、Vectorの既存有料noteで深掘りします。",
    href: paidNote("diagnosis_handoff"),
    event: "primary_cta_click",
    kind: "paid",
    external: true,
  },
];

function capture(event: string, props: Record<string, unknown> = {}) {
  try {
    (window as unknown as { posthog?: { capture: (name: string, properties?: Record<string, unknown>) => void } }).posthog?.capture(event, {
      analytics_scope: "vector_praxis_japan",
      surface: "vector_ai_agent_bottleneck",
      route_id: ROUTE_ID,
      asset_id: "ai_agent_bottleneck",
      ...props,
    });
  } catch {}
}

export default function BottleneckRouter() {
  const [selected, setSelected] = useState<BottleneckId>("wait");

  useEffect(() => {
    capture("free_tool_start", { tool_id: "ai_agent_bottleneck" });
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

  const complete = () => {
    capture("vector_bottleneck_next_click", {
      bottleneck: current.id,
      destination: current.nextTitle,
      destination_kind: current.kind,
    });
    capture("free_tool_complete", {
      tool_id: "ai_agent_bottleneck",
      bottleneck: current.id,
      destination: current.nextTitle,
      destination_kind: current.kind,
    });
  };

  return (
    <>
      <div className="vx-choice-grid" role="group" aria-label="AI運用のボトルネック">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`vx-choice ${styles.choiceButton}`}
            aria-pressed={selected === item.id}
            onClick={() => choose(item.id)}
          >
            <span className="vx-choice-icon">{item.icon}</span>
            <span><small>{item.label}</small><b>{item.title}</b><em>{item.text}</em></span>
            {selected === item.id && <mark>今の詰まり</mark>}
          </button>
        ))}
      </div>

      <div className={`${styles.result} ${current.kind === "paid" ? styles.resultPaid : styles.resultFree}`} aria-live="polite">
        <div className={styles.resultIcon}>{current.kind === "free" ? <BookOpen /> : <WalletCards />}</div>
        <div>
          <small>{current.nextLabel}</small>
          <h3>{current.nextTitle}</h3>
          <p>{current.nextText}</p>
        </div>
        <a
          href={current.href}
          target={current.external ? "_blank" : undefined}
          rel={current.external ? "noopener noreferrer" : undefined}
          data-event={current.event}
          data-route-id={ROUTE_ID}
          onClick={complete}
        >
          {current.kind === "free" ? "先に確認する" : "¥1,480の記事を見る"} <ArrowUpRight size={15} />
        </a>
      </div>
    </>
  );
}