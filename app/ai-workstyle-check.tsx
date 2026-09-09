"use client";

import { useEffect, useMemo, useState } from "react";

const REVENUE_ROUTER = "https://stratumpraxis.com/revenue-router.html?utm_source=vector_praxis&utm_medium=diagnostic&utm_campaign=ai_workstyle_entry_20260909&utm_content=result_cta&route_id=vpj_ai_workstyle_router_v1";

type Answer = {
  mainAi: string;
  mode: string;
  split: string;
  count: string;
  goal: string;
};

type Result = {
  type: string;
  now: string;
  bias: string;
  placement: string;
  action: string;
};

const EMPTY: Answer = { mainAi: "", mode: "", split: "", count: "", goal: "" };

function track(event: string, extra: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...extra };
  (window as Window & { dataLayer?: unknown[] }).dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer || [];
  (window as Window & { dataLayer?: unknown[] }).dataLayer?.push(payload);
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") gtag("event", event, extra);
}

function classify(a: Answer): Result {
  let type = "情報統合型";
  if (a.mode === "command") type = "司令塔型";
  if (a.mode === "create") type = "制作集中型";
  if (a.mode === "research") type = "調査起点型";
  if (a.mode === "split" || a.split === "role" || a.count === "3plus") type = "複数AI分業型";

  const single = a.split === "single" || a.count === "1";
  const crowded = a.count === "3plus" && a.split !== "role";
  const goalLabel: Record<string, string> = {
    research: "調査と判断",
    create: "制作",
    execute: "実行",
    revenue: "収益化",
  };

  let bias = "大きな偏りは見えません。主役と補助役を固定すると、切り替えコストをさらに減らせます。";
  if (single) bias = "1つのAIに調査・制作・実行・検証を寄せやすい状態です。便利ですが、弱い工程まで同じAIに任せると見落としが増えます。";
  if (crowded) bias = "AIの数に対して役割境界が曖昧です。比較・やり直し・同じ説明の繰り返しが増えやすい配置です。";
  if (a.split === "role") bias = "役割分担はできています。次は『誰が最終判断するか』と『どこで検証するか』を固定すると安定します。";

  let placement = "主AIを判断の中心に置き、補助AIは調査か検証のどちらか1役に限定。制作→実行→確認の引き継ぎを1本にします。";
  if (type === "制作集中型") placement = "制作AIを主役にしつつ、調査と最終検証を別役に分けます。制作途中でAIを頻繁に切り替えない配置が向いています。";
  if (type === "調査起点型") placement = "調査AIで材料を集めた後、判断担当を1つに固定。調査結果をそのまま制作へ流さず、要点を圧縮して実行へ渡します。";
  if (type === "複数AI分業型") placement = "調査・制作・実行・検証の4工程に対し、各AIの担当を1つずつ明示。重複担当を減らし、最後の意思決定者を1つに固定します。";
  if (type === "司令塔型") placement = "主AIを司令塔に固定し、他AIは必要時だけ専門役として呼び出します。全AIに同じ仕事を投げる運用は避けます。";

  const action = a.goal === "revenue"
    ? "今のAI配置をRevenue Routeに接続し、次に外へ出す行動を1つ決める。"
    : `${goalLabel[a.goal] || "現在の目的"}に必要な役割だけ残し、次の実行を1つ決める。`;

  return {
    type,
    now: `現在の主軸：${a.mainAi || "未選択"}。運用タイプは「${type}」です。`,
    bias,
    placement,
    action,
  };
}

const questions = [
  {
    key: "mainAi" as const,
    title: "今、主に使っているAIは？",
    note: "性能比較ではなく、現在の運用起点を確認します。",
    options: ["ChatGPT", "Claude", "Gemini", "複数を同程度", "その他 / 決めていない"],
  },
  {
    key: "mode" as const,
    title: "そのAIを一番よく使う場面は？",
    note: "いちばん近いものを1つ。",
    options: [
      ["command", "指示・判断の司令塔"],
      ["create", "文章・画像・コードなどの制作"],
      ["integrate", "情報整理・要約・統合"],
      ["research", "検索・比較・調査"],
      ["split", "複数AIへの役割分担"],
    ],
  },
  {
    key: "split" as const,
    title: "調査・制作・実行・検証はどう分けている？",
    note: "役割の重なりを見ます。",
    options: [
      ["single", "ほぼ1つのAIで全部"],
      ["loose", "その時々で使い分け"],
      ["role", "役割を決めて分担"],
    ],
  },
  {
    key: "count" as const,
    title: "日常的に使うAIはいくつ？",
    note: "登録数ではなく、実際に行き来する数です。",
    options: [["1", "1つ"], ["2", "2つ"], ["3plus", "3つ以上"]],
  },
  {
    key: "goal" as const,
    title: "今いちばん進めたいことは？",
    note: "AI配置は目的から逆算します。",
    options: [
      ["research", "調べて判断したい"],
      ["create", "作る速度と質を上げたい"],
      ["execute", "実行まで止まらず進めたい"],
      ["revenue", "収益につながる行動を増やしたい"],
    ],
  },
];

export default function AIWorkstyleCheck() {
  const [answers, setAnswers] = useState<Answer>(EMPTY);
  const [started, setStarted] = useState(false);
  const complete = questions.every((q) => Boolean(answers[q.key]));
  const result = useMemo(() => (complete ? classify(answers) : null), [answers, complete]);

  useEffect(() => { track("ai_workstyle_view"); }, []);
  useEffect(() => {
    if (complete && result) track("ai_workstyle_complete", { type: result.type, main_ai: answers.mainAi, goal: answers.goal });
  }, [complete]);

  function choose(key: keyof Answer, value: string) {
    if (!started) {
      setStarted(true);
      track("ai_workstyle_start");
    }
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <section id="ai-workstyle" className="aiw-wrap" aria-labelledby="aiw-title">
      <div className="aiw-head">
        <p>FREE · AI運用タイプ</p>
        <h2 id="aiw-title">AIを増やす前に、役割を整える。</h2>
        <span>5問で、今の使い方の偏りと次の配置を確認します。</span>
      </div>

      <div className="aiw-questions">
        {questions.map((q, index) => (
          <article className="aiw-question" key={q.key}>
            <small>0{index + 1}</small>
            <h3>{q.title}</h3>
            <p>{q.note}</p>
            <div className="aiw-options">
              {q.options.map((raw) => {
                const pair = Array.isArray(raw) ? raw : [raw, raw];
                const [value, label] = pair;
                const selected = answers[q.key] === value;
                return <button key={value} type="button" className={selected ? "selected" : ""} onClick={() => choose(q.key, value)}>{label}</button>;
              })}
            </div>
          </article>
        ))}
      </div>

      {result && <div className="aiw-result" aria-live="polite">
        <div className="aiw-type"><small>YOUR TYPE</small><strong>{result.type}</strong></div>
        <div className="aiw-result-grid">
          <div><small>現在地</small><p>{result.now}</p></div>
          <div><small>運用上の偏り</small><p>{result.bias}</p></div>
          <div><small>推奨配置</small><p>{result.placement}</p></div>
          <div><small>次のRevenue Action</small><p>{result.action}</p></div>
        </div>
        <a href={REVENUE_ROUTER} target="_blank" rel="noopener noreferrer" className="aiw-cta" onClick={() => track("ai_workstyle_next_cta", { type: result.type, goal: answers.goal })}>次に進める収益ルートを見る →</a>
      </div>}

      <p className="aiw-note">ChatGPT、Claude、Gemini等の名称は現在の利用状況を整理するための説明対象としてのみ使用しています。本コンテンツは各サービス提供企業とは独立しており、公式・提携・認定サービスではありません。ロゴや公式素材は使用していません。</p>

      <style jsx>{`
        .aiw-wrap{padding:88px 0;border-block:1px solid #262a2f;background:#0b0d0f;color:#f4f5f6}
        .aiw-wrap>*{width:min(1120px,calc(100% - 30px));margin-inline:auto}
        .aiw-head p,.aiw-question small,.aiw-result small{font-size:11px;letter-spacing:.15em;color:#9298a0;font-weight:700}
        .aiw-head h2{max-width:760px;margin:10px 0 12px;font-size:clamp(34px,5vw,56px);line-height:1.02;letter-spacing:-.045em}
        .aiw-head span,.aiw-question p,.aiw-note{color:#8f959d}
        .aiw-questions{display:grid;gap:12px;margin-top:38px}
        .aiw-question{padding:24px;border:1px solid #292d32;background:#111315}
        .aiw-question h3{margin:6px 0 2px;font-size:20px}
        .aiw-question p{margin:0 0 16px;font-size:13px}
        .aiw-options{display:flex;flex-wrap:wrap;gap:8px}
        .aiw-options button{appearance:none;border:1px solid #3a3f45;background:#0c0e10;color:#d7dade;border-radius:999px;padding:9px 13px;font:inherit;cursor:pointer}
        .aiw-options button:hover,.aiw-options button.selected{background:#f0f1f2;color:#101214;border-color:#f0f1f2}
        .aiw-result{margin-top:18px;padding:28px;border:1px solid #555c64;background:#e9eaeb;color:#111315}
        .aiw-type{display:flex;align-items:end;justify-content:space-between;gap:20px;border-bottom:1px solid #c5c8cb;padding-bottom:18px}
        .aiw-type strong{font-size:clamp(30px,5vw,52px);letter-spacing:-.04em}
        .aiw-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:18px 0}
        .aiw-result-grid>div{padding:16px 16px 16px 0;border-bottom:1px solid #c9cccf}
        .aiw-result-grid p{margin:5px 0 0;max-width:470px}
        .aiw-cta{display:inline-block;background:#111315;color:#fff;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:800;margin-top:6px}
        .aiw-note{font-size:11px;line-height:1.65;margin-top:18px}
        @media(max-width:700px){.aiw-wrap{padding:64px 0}.aiw-result-grid{grid-template-columns:1fr}.aiw-type{align-items:start;flex-direction:column}.aiw-options{display:grid;grid-template-columns:1fr}.aiw-options button{text-align:left;border-radius:6px}}
      `}</style>
    </section>
  );
}
