"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpRight, CheckCircle2, Coins, RotateCcw, Sparkles } from "lucide-react";

type IntentId = "organize" | "revenue" | "solo";
type RevenueAsset = {
  id: string;
  title: string;
  href: string;
  label: string;
  status: "FREE" | "PAID";
  intents: IntentId[];
  fit: string;
  next: string;
};

const revenueAssets: RevenueAsset[] = [
  {
    id: "market-origin-design",
    title: "AIエージェントを増やす前に、『仕事の発生源』を設計する",
    href: "https://note.com/deft_eel6718/n/n53d075c8e62d",
    label: "MARKET / AGENT / REVENUE",
    status: "PAID",
    intents: ["revenue", "solo"],
    fit: "市場・Buyer・外部Signalを起点に、AIの活動量をRevenueへ接続したい人向け。",
    next: "市場起点の設計を読む（¥14,800）",
  },
  {
    id: "ai-team-design",
    title: "AIを増やすほど仕事が遅くなる理由 ── ChatGPT・Claude・GitHubを『チーム』に変える設計",
    href: "https://note.com/deft_eel6718/n/ncaff8351e529",
    label: "AI TEAM / OPERATIONS",
    status: "PAID",
    intents: ["organize", "solo"],
    fit: "複数AIを増やす前に、役割分担と流れを整理したい人向け。",
    next: "運用設計を読む",
  },
  {
    id: "ai-revenue-system",
    title: "AI活用を、収益につながる仕組みへ。",
    href: "https://note.com/deft_eel6718/n/nfce5ac047c15",
    label: "AI / REVENUE",
    status: "PAID",
    intents: ["revenue"],
    fit: "AI活用を『便利』で終わらせず、収益行動へつなげたい人向け。",
    next: "収益設計を読む",
  },
  {
    id: "revenue-pipe-2026",
    title: "AIで作るだけでは稼げない。2026年、AIを『収益パイプ』に変える実践設計",
    href: "https://note.com/deft_eel6718/n/nc120a3159186",
    label: "REVENUE PIPE",
    status: "PAID",
    intents: ["revenue", "solo"],
    fit: "作る → 届ける → 次の収益行動まで一本につなげたい人向け。",
    next: "収益パイプを読む",
  },
  {
    id: "codex-one-person-company",
    title: "Codexを『実装部隊』にして、広告費0円から外貨収益を作る一人会社の設計書",
    href: "https://note.com/deft_eel6718/n/n6643ede87ad3",
    label: "CODEX / SOLO OPS",
    status: "PAID",
    intents: ["solo", "revenue"],
    fit: "実装・公開・収益行動を少人数運用へ寄せたい人向け。",
    next: "一人運用の設計を読む",
  },
  {
    id: "seo-five-steps",
    title: "AIでSEO記事作成を効率化するなら、『書く』より先に見直したい5つの工程",
    href: "https://note.com/deft_eel6718/n/n86dddd12d2b2",
    label: "SEO / WORKFLOW",
    status: "FREE",
    intents: ["organize"],
    fit: "まず無料で、制作工程の詰まりを見直したい人向け。",
    next: "無料で読む",
  },
];

const intents: Array<{ id: IntentId; label: string; detail: string }> = [
  { id: "organize", label: "AIの仕事を整える", detail: "役割・工程・実務の詰まりを整理" },
  { id: "revenue", label: "収益につなげる", detail: "制作からRevenue Routeまで短くする" },
  { id: "solo", label: "一人運用を強くする", detail: "実装・公開・収益行動を少人数化" },
];

function capture(event: string, props: Record<string, unknown> = {}) {
  try {
    (window as unknown as { posthog?: { capture: (name: string, properties?: Record<string, unknown>) => void } }).posthog?.capture(event, {
      surface: "vector_revenue_match_v1",
      ...props,
    });
  } catch {}
}

function withAttribution(asset: RevenueAsset, intent: IntentId) {
  try {
    const url = new URL(asset.href);
    url.searchParams.set("utm_source", "vector_hub");
    url.searchParams.set("utm_medium", "owned");
    url.searchParams.set("utm_campaign", "vector_revenue_match");
    url.searchParams.set("utm_content", `${intent}_${asset.id}`);
    return url.toString();
  } catch {
    return asset.href;
  }
}

function RevenueMatch() {
  const [intent, setIntent] = useState<IntentId>("revenue");
  const [resumed, setResumed] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedIntent = localStorage.getItem("vector-revenue-intent") as IntentId | null;
      const savedAsset = localStorage.getItem("vector-revenue-last-asset");
      if (savedIntent && intents.some((item) => item.id === savedIntent)) setIntent(savedIntent);
      if (savedAsset && revenueAssets.some((asset) => asset.id === savedAsset)) setResumed(savedAsset);
    } catch {}
  }, []);

  const matches = useMemo(() => revenueAssets.filter((asset) => asset.intents.includes(intent)), [intent]);
  const primary = matches[0];
  const alternatives = matches.slice(1, 3);
  const resumedAsset = resumed ? revenueAssets.find((asset) => asset.id === resumed) ?? null : null;

  useEffect(() => {
    try { localStorage.setItem("vector-revenue-intent", intent); } catch {}
    capture("vector_revenue_match_view", {
      intent,
      primary_asset: primary?.id ?? null,
      paid_primary: primary?.status === "PAID",
    });
  }, [intent, primary?.id, primary?.status]);

  const openAsset = (asset: RevenueAsset, source: string) => {
    try { localStorage.setItem("vector-revenue-last-asset", asset.id); } catch {}
    setResumed(asset.id);
    capture(asset.status === "PAID" ? "vector_paid_asset_click" : "vector_free_asset_click", {
      intent,
      asset_id: asset.id,
      asset_status: asset.status,
      source,
      destination_host: "note.com",
    });
  };

  if (!primary) return null;

  return (
    <section className="vrm" aria-labelledby="vrm-title">
      <div className="vrm-head">
        <div>
          <span className="vrm-kicker"><Coins size={13} /> REVENUE MATCH / EXISTING ASSETS ONLY</span>
          <h3 id="vrm-title">読むものではなく、次の収益行動から選ぶ。</h3>
          <p>新商品は増やさず、いまの目的に近い既存Vector資産だけを出します。</p>
        </div>
        {resumedAsset && (
          <a
            className="vrm-resume"
            href={withAttribution(resumedAsset, intent)}
            target="_blank"
            rel="noreferrer"
            onClick={() => openAsset(resumedAsset, "resume")}
          >
            <RotateCcw size={14} /> 前回の続き
          </a>
        )}
      </div>

      <div className="vrm-intents" role="group" aria-label="Revenue intent">
        {intents.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={intent === item.id}
            onClick={() => {
              setIntent(item.id);
              capture("vector_revenue_intent_select", { intent: item.id });
            }}
          >
            <span>{item.label}</span>
            <small>{item.detail}</small>
          </button>
        ))}
      </div>

      <div className="vrm-grid">
        <article className="vrm-primary">
          <div className="vrm-primary-top">
            <span className={`vrm-status is-${primary.status.toLowerCase()}`}>{primary.status}</span>
            <span>{primary.label}</span>
          </div>
          <h4>{primary.title}</h4>
          <p>{primary.fit}</p>
          <div className="vrm-why"><CheckCircle2 size={15} /><span>この目的に最も近い既存資産</span></div>
          <a
            href={withAttribution(primary, intent)}
            target="_blank"
            rel="noreferrer"
            onClick={() => openAsset(primary, "primary_match")}
          >
            {primary.next} <ArrowUpRight size={15} />
          </a>
        </article>

        <div className="vrm-alts" aria-label="Other relevant assets">
          <span>他に近い既存資産</span>
          {alternatives.map((asset) => (
            <a
              key={asset.id}
              href={withAttribution(asset, intent)}
              target="_blank"
              rel="noreferrer"
              onClick={() => openAsset(asset, "alternative_match")}
            >
              <span className={`vrm-status is-${asset.status.toLowerCase()}`}>{asset.status}</span>
              <span><small>{asset.label}</small><b>{asset.title}</b></span>
              <ArrowRight size={15} />
            </a>
          ))}
          <a className="vrm-all" href="https://note.com/deft_eel6718" target="_blank" rel="noreferrer" onClick={() => capture("vector_note_library_open", { source: "revenue_match" })}>
            Vector noteをすべて見る <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function VectorRevenueLayer() {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const host = document.querySelector(".vector-routes");
    setTarget(host);
    capture("vector_revenue_layer_ready", { existing_asset_count: revenueAssets.length, intent_count: intents.length });
  }, []);

  return target ? createPortal(<RevenueMatch />, target) : null;
}
