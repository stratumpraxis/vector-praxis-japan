"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, BookOpen, ChevronRight, ExternalLink, Sparkles } from "lucide-react";

type EditorialAsset = {
  id: string;
  title: string;
  label: string;
  status: "FREE" | "PAID";
  href: string;
};

const assets: EditorialAsset[] = [
  {
    id: "seo-five-steps",
    title: "AIでSEO記事作成を効率化するなら、『書く』より先に見直したい5つの工程",
    label: "SEO / WORKFLOW",
    status: "FREE",
    href: "https://note.com/deft_eel6718/n/n86dddd12d2b2",
  },
  {
    id: "ai-team-design",
    title: "AIを増やすほど仕事が遅くなる理由 ── ChatGPT・Claude・GitHubを『チーム』に変える設計",
    label: "AI TEAM / OPERATIONS",
    status: "PAID",
    href: "https://note.com/deft_eel6718/n/ncaff8351e529",
  },
  {
    id: "ai-revenue-system",
    title: "AI活用を、収益につながる仕組みへ。",
    label: "AI / REVENUE",
    status: "PAID",
    href: "https://note.com/deft_eel6718/n/nfce5ac047c15",
  },
  {
    id: "revenue-pipe-2026",
    title: "AIで作るだけでは稼げない。2026年、AIを『収益パイプ』に変える実践設計",
    label: "REVENUE PIPE",
    status: "PAID",
    href: "https://note.com/deft_eel6718/n/nc120a3159186",
  },
  {
    id: "anxiety-loop",
    title: "不安は再生される",
    label: "READ / INSIGHT",
    status: "PAID",
    href: "https://note.com/deft_eel6718/n/nee032c683c27",
  },
  {
    id: "codex-one-person-company",
    title: "Codexを『実装部隊』にして、広告費0円から外貨収益を作る一人会社の設計書",
    label: "CODEX / SOLO OPS",
    status: "PAID",
    href: "https://note.com/deft_eel6718/n/n6643ede87ad3",
  },
];

function capture(event: string, props: Record<string, unknown>) {
  try {
    (window as unknown as { posthog?: { capture: (name: string, properties?: Record<string, unknown>) => void } }).posthog?.capture(event, {
      surface: "vector_home_premium_layer",
      ...props,
    });
  } catch {}
}

function normalizeStatusLabels() {
  document.querySelectorAll<HTMLElement>(".vector-status").forEach((badge) => {
    const link = badge.closest<HTMLAnchorElement>("a[href]");
    const href = link?.href || "";
    const raw = badge.textContent?.trim().toUpperCase();

    let next = raw;
    if (raw === "READ") next = href.includes("note.com/deft_eel6718") ? "HUB" : "EXTERNAL";
    if (raw === "GROUP") next = "EXTERNAL";
    if (!next) return;

    badge.textContent = next;
    badge.dataset.vectorStatus = next;
    badge.classList.remove("status-read", "status-group");
    badge.classList.add(`status-${next.toLowerCase()}`);
  });
}

function installMotionSignals() {
  const root = document.documentElement;
  root.classList.add("vector-premium-ready");

  let raf = 0;
  const onPointer = (event: PointerEvent) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      root.style.setProperty("--vp-pointer-x", `${event.clientX}px`);
      root.style.setProperty("--vp-pointer-y", `${event.clientY}px`);
    });
  };

  const tiles = Array.from(document.querySelectorAll<HTMLElement>(".vector-route-tile"));
  const tileHandlers = tiles.map((tile) => {
    const move = (event: PointerEvent) => {
      const rect = tile.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      tile.style.setProperty("--vp-card-x", `${x * 100}%`);
      tile.style.setProperty("--vp-card-y", `${y * 100}%`);
      tile.style.setProperty("--vp-tilt-x", `${(0.5 - y) * 2.2}deg`);
      tile.style.setProperty("--vp-tilt-y", `${(x - 0.5) * 2.6}deg`);
    };
    const leave = () => {
      tile.style.setProperty("--vp-tilt-x", "0deg");
      tile.style.setProperty("--vp-tilt-y", "0deg");
    };
    tile.addEventListener("pointermove", move, { passive: true });
    tile.addEventListener("pointerleave", leave, { passive: true });
    return { tile, move, leave };
  });

  const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(
    ".vector-hero-copy,.vector-route-preview,.vector-goal-inner,.vector-section-head,.vector-route-tile,.vector-stratum"
  ));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("vp-in-view");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -7% 0px" });
  revealTargets.forEach((node, index) => {
    node.style.setProperty("--vp-reveal-delay", `${Math.min(index % 6, 5) * 46}ms`);
    observer.observe(node);
  });

  window.addEventListener("pointermove", onPointer, { passive: true });
  return () => {
    window.removeEventListener("pointermove", onPointer);
    cancelAnimationFrame(raf);
    observer.disconnect();
    tileHandlers.forEach(({ tile, move, leave }) => {
      tile.removeEventListener("pointermove", move);
      tile.removeEventListener("pointerleave", leave);
    });
    root.classList.remove("vector-premium-ready");
  };
}

function EditorialShelf() {
  const [active, setActive] = useState(0);
  const selected = assets[active];

  return (
    <section className="vp-editorial-shelf" aria-labelledby="vp-editorial-title">
      <div className="vp-editorial-intro">
        <div>
          <span className="vp-kicker"><Sparkles size={13} /> VECTOR NOTE / SELECTED ASSETS</span>
          <h3 id="vp-editorial-title">読むものも、目的から選ぶ。</h3>
          <p>既存のVector資産から、実践・制作・収益化につながる読み物を短く選べます。</p>
        </div>
        <a href="https://note.com/deft_eel6718" target="_blank" rel="noreferrer" data-event="vector_note_library_open">
          note一覧 <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="vp-editorial-board">
        <div className="vp-editorial-list" role="list" aria-label="Vector editorial assets">
          {assets.map((asset, index) => (
            <button
              key={asset.id}
              type="button"
              aria-pressed={active === index}
              onClick={() => {
                setActive(index);
                capture("vector_asset_preview", { asset_id: asset.id, status: asset.status, index });
              }}
            >
              <span className={`vp-asset-status is-${asset.status.toLowerCase()}`}>{asset.status}</span>
              <span className="vp-asset-list-copy"><small>{asset.label}</small><b>{asset.title}</b></span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>

        <article className="vp-editorial-focus" aria-live="polite">
          <div className="vp-focus-top"><span>{String(active + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}</span><BookOpen size={18} /></div>
          <span className={`vp-asset-status is-${selected.status.toLowerCase()}`}>{selected.status}</span>
          <small>{selected.label}</small>
          <h4>{selected.title}</h4>
          <p>Vector Praxisの既存公開資産です。サイト内に閉じ込めず、必要な人を正しい公開先へ送ります。</p>
          <a
            href={selected.href}
            target="_blank"
            rel="noreferrer"
            data-event="vector_selected_asset_open"
            onClick={() => capture("vector_asset_open", { asset_id: selected.id, status: selected.status, source: "editorial_shelf" })}
          >
            noteで開く <ArrowUpRight size={15} />
          </a>
        </article>
      </div>
    </section>
  );
}

export default function VectorPremiumLayer() {
  const [target, setTarget] = useState<Element | null>(null);
  const [enabled, setEnabled] = useState(false);
  const shelf = useMemo(() => <EditorialShelf />, []);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    setEnabled(true);
    setTarget(document.querySelector(".vector-routes"));

    normalizeStatusLabels();
    const cleanupMotion = installMotionSignals();
    const mutations = new MutationObserver(() => normalizeStatusLabels());
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      cleanupMotion();
      mutations.disconnect();
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className="vp-page-progress" aria-hidden="true"><span /></div>
      <div className="vp-ambient-light" aria-hidden="true" />
      {target ? createPortal(shelf, target) : null}
    </>
  );
}
