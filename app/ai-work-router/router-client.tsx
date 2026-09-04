"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./router.module.css";

type WorkType = "research" | "coding" | "content" | "creative" | "analysis" | "operations";
type Risk = "low" | "medium" | "high";
type Complexity = "simple" | "standard" | "deep";
type StepMode = "RULE" | "AI" | "HUMAN";
type Frequency = "once" | "weekly" | "daily";
type FlowStep = { label: string; mode: StepMode; why: string };
type Preset = { label: string; task: string; workType: WorkType; risk: Risk; repeatable: boolean; needsCreative: boolean; needsMotion: boolean };
type SavedPlan = { id: string; task: string; workType: WorkType; complexity: Complexity; risk: Risk; frequency: Frequency; repeatable: boolean; needsCreative: boolean; needsMotion: boolean; savedAt: string };

const STORAGE_KEY = "ai-work-router-history-v1";

const workLabels: Record<WorkType, string> = {
  research: "調査・リサーチ",
  coding: "コード・実装",
  content: "文章・コンテンツ",
  creative: "画像・動画・広告クリエイティブ",
  analysis: "分析・意思決定支援",
  operations: "運用・定型業務",
};

const tierMap: Record<Complexity, { label: string; note: string }> = {
  simple: { label: "FAST", note: "分類・整形・定型処理向け。まずルールで処理できないか確認。" },
  standard: { label: "GENERAL", note: "通常の制作・比較・改善・ツール利用を含む実務向け。" },
  deep: { label: "DEEP", note: "複雑な設計・重要判断・多要因分析向け。高コスト処理は必要箇所だけに限定。" },
};

const presets: Preset[] = [
  { label: "競合リサーチ", task: "競合サービスを調査し、強み・弱み・価格・導入障壁を整理する", workType: "research", risk: "low", repeatable: true, needsCreative: false, needsMotion: false },
  { label: "サイト改善", task: "既存サイトを改善し、公開前に安全確認まで行う", workType: "coding", risk: "medium", repeatable: true, needsCreative: true, needsMotion: true },
  { label: "記事制作", task: "読者の課題から逆算して記事を設計し、事実確認と公開前QAまで行う", workType: "content", risk: "medium", repeatable: true, needsCreative: false, needsMotion: false },
  { label: "SNS制作", task: "短尺SNSコンテンツを企画し、複数案を比較して公開候補を作る", workType: "creative", risk: "medium", repeatable: true, needsCreative: true, needsMotion: true },
  { label: "定型運用", task: "毎日の定型業務を整理し、ルール処理・AI処理・人間承認に分解する", workType: "operations", risk: "medium", repeatable: true, needsCreative: false, needsMotion: false },
];

function buildFlow(type: WorkType, risk: Risk): FlowStep[] {
  const flow: FlowStep[] = [
    { label: "目的と成功条件を固定", mode: "RULE", why: "曖昧なままAIを走らせない" },
    { label: "既存情報・資産・制約を確認", mode: "RULE", why: "重複や前提漏れを防ぐ" },
  ];
  const byType: Record<WorkType, FlowStep[]> = {
    research: [
      { label: "一次情報を優先して収集", mode: "AI", why: "探索を高速化" },
      { label: "事実・仮説・不明点を分離", mode: "AI", why: "断定ミスを減らす" },
      { label: "反対証拠を探索", mode: "AI", why: "都合の良い結論を避ける" },
      { label: "意思決定材料へ圧縮", mode: "AI", why: "情報収集だけで終わらせない" },
    ],
    coding: [
      { label: "既存構造を読む", mode: "AI", why: "破壊的変更を避ける" },
      { label: "最小変更を設計", mode: "AI", why: "差分を小さくする" },
      { label: "実装・テスト", mode: "AI", why: "機械的検証を自動化" },
      { label: "公開差分を確認", mode: risk === "high" ? "HUMAN" : "AI", why: "外部影響を確認" },
    ],
    content: [
      { label: "読者・目的・媒体を固定", mode: "RULE", why: "誰向けかを固定" },
      { label: "構成と複数案を作成", mode: "AI", why: "一案固定を避ける" },
      { label: "事実確認・表現調整", mode: "AI", why: "品質と安全性を確保" },
      { label: "公開前チェック", mode: "HUMAN", why: "誤解・権利・過剰表現を確認" },
    ],
    creative: [
      { label: "Briefを作成", mode: "RULE", why: "制作条件を先に固定" },
      { label: "複数クリエイティブ案を生成", mode: "AI", why: "比較可能にする" },
      { label: "編集・媒体最適化", mode: "AI", why: "生成物をそのまま出さない" },
      { label: "ブランド・権利・視認性QA", mode: "HUMAN", why: "外部公開リスクを抑える" },
    ],
    analysis: [
      { label: "指標と判断基準を選定", mode: "RULE", why: "数字だけを眺めない" },
      { label: "原因候補を分解", mode: "AI", why: "複数仮説を比較" },
      { label: "反証を確認", mode: "AI", why: "思い込みを抑える" },
      { label: "次の1アクションを選定", mode: risk === "high" ? "HUMAN" : "AI", why: "分析を実行へ接続" },
    ],
    operations: [
      { label: "入力条件を固定", mode: "RULE", why: "毎回の揺れを減らす" },
      { label: "ルールで処理できる部分を分離", mode: "RULE", why: "不要なAIコストを抑える" },
      { label: "例外だけAIへ渡す", mode: "AI", why: "AIを必要箇所に限定" },
      { label: "実行ログと例外ログを保存", mode: "RULE", why: "原因追跡を可能にする" },
    ],
  };
  flow.push(...byType[type]);
  flow.push({ label: risk === "low" ? "可逆範囲で実行" : "人間承認", mode: risk === "low" ? "RULE" : "HUMAN", why: risk === "low" ? "低リスク処理は停滞させない" : "重要操作の責任境界を残す" });
  flow.push({ label: "結果を記録し次回改善", mode: "RULE", why: "成功手順を再利用可能にする" });
  return flow;
}

export default function RouterClient() {
  const [workType, setWorkType] = useState<WorkType>("coding");
  const [complexity, setComplexity] = useState<Complexity>("standard");
  const [risk, setRisk] = useState<Risk>("medium");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [repeatable, setRepeatable] = useState(true);
  const [needsCreative, setNeedsCreative] = useState(false);
  const [needsMotion, setNeedsMotion] = useState(false);
  const [task, setTask] = useState("既存サイトを改善し、公開前に安全確認まで行う");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SavedPlan[]>([]);
  const [notice, setNotice] = useState("");
  const taskReady = task.trim().length >= 4;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      setHistory([]);
    }
  }, []);

  const result = useMemo(() => {
    const flow = buildFlow(workType, risk);
    const humanBoundary = risk === "high"
      ? "公開・決済・削除・権限変更・顧客情報・重要判断は必ず人間承認"
      : risk === "medium"
        ? "外部公開・不可逆変更・金銭・個人情報に触れる直前で人間確認"
        : "可逆な範囲は自動化し、例外時だけ人間へ戻す";
    const skill = repeatable
      ? "反復するため、成功した入力・判断基準・禁止事項・出力形式をテンプレート化。3回以上安定したらSkill化候補。"
      : "単発性が高いためPromptテンプレートに留め、再発時にSkill化を検討。";
    const cadence = frequency === "daily" ? "日次" : frequency === "weekly" ? "週次" : "単発";
    const costGuard = complexity === "deep"
      ? "DEEP処理は設計・難所・最終レビューに限定し、分類・整形・定型処理はFAST/RULEへ戻す。"
      : "単純な分類・整形・転記はAIを使わずRULE処理に寄せられるか先に確認する。";
    const creative = needsCreative ? "Brief → 3案以上の生成 → 編集 → QA → 勝ち案選定。生成物を一発採用しない。" : "成果に直結しないクリエイティブ工程は追加しない。";
    const motion = needsMotion ? "モーションはCTA・状態変化・導線理解に効く箇所だけ。prefers-reduced-motionに配慮し、装飾目的の過剰演出を避ける。" : "モーションなし。読みやすさ・速度・操作理解を優先。";
    const stop = "権限不足 / CAPTCHA / 秘密情報・個人情報 / 決済変更 / 削除 / 想定外の外部送信 / 同一失敗2回 / 仕様矛盾で停止し、人間へ戻す。";
    const ruleCount = flow.filter((s) => s.mode === "RULE").length;
    const aiCount = flow.filter((s) => s.mode === "AI").length;
    const humanCount = flow.filter((s) => s.mode === "HUMAN").length;
    const readiness = Math.max(35, Math.min(95, 58 + (repeatable ? 12 : 0) + (risk === "low" ? 12 : risk === "medium" ? 4 : -8) + (frequency !== "once" ? 8 : 0) - (complexity === "deep" ? 5 : 0)));
    const automationDepth = risk === "high" ? "ASSIST" : readiness >= 80 ? "GUARDED AUTO" : "SEMI-AUTO";
    const observability = ["実行日時", "入力", "処理レベル", "承認者/承認有無", "結果", "例外", "再試行回数", "工数・コスト変化"];
    const prompt = `TASK\n${task}\n\nSUCCESS CONDITION\n目的達成に必要な最小の実行を完了し、結果・未解決・次の判断材料を残す。\n\nWORK TYPE\n${workLabels[workType]}\n\nPROCESSING LEVEL\n${tierMap[complexity].label}\n${costGuard}\n\nAUTOMATION DEPTH\n${automationDepth}\n\nCADENCE\n${cadence}\n\nFLOW\n${flow.map((s, i) => `${i + 1}. [${s.mode}] ${s.label} — ${s.why}`).join("\n")}\n\nHUMAN BOUNDARY\n${humanBoundary}\n\nSTOP CONDITIONS\n${stop}\n\nREUSE\n${skill}\n\nOBSERVABILITY\n${observability.join(" / ")}\n\nCREATIVE\n${creative}\n\nMOTION\n${motion}\n\nREPORT\n確認したこと / 実行したこと / 証拠 / 結果 / コストや工数の変化 / 未解決 / 人間確認事項 / 次の推奨アクション`;
    const markdown = `# AI Work Plan\n\n## Task\n${task}\n\n## Readiness\n- Score: ${readiness}/100\n- Automation depth: ${automationDepth}\n- Processing: ${tierMap[complexity].label}\n- RULE / AI / HUMAN: ${ruleCount} / ${aiCount} / ${humanCount}\n\n## Human boundary\n${humanBoundary}\n\n## Cost guard\n${costGuard}\n\n## Stop conditions\n${stop}\n\n## Flow\n${flow.map((s, i) => `${i + 1}. **${s.mode}** — ${s.label}: ${s.why}`).join("\n")}\n\n## Reuse\n${skill}\n\n## Observability\n${observability.map((v) => `- ${v}`).join("\n")}\n`;
    return { flow, humanBoundary, skill, costGuard, creative, motion, stop, prompt, markdown, readiness, automationDepth, ruleCount, aiCount, humanCount, observability };
  }, [workType, complexity, risk, frequency, repeatable, needsCreative, needsMotion, task]);

  const applyPreset = (preset: Preset) => {
    setTask(preset.task); setWorkType(preset.workType); setRisk(preset.risk);
    setRepeatable(preset.repeatable); setNeedsCreative(preset.needsCreative); setNeedsMotion(preset.needsMotion);
    setNotice("");
  };

  const copyPrompt = async () => {
    if (!taskReady) { setNotice("やりたいことを4文字以上で入力してください。"); return; }
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true); setNotice("Promptをコピーしました。");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setNotice("このブラウザでは自動コピーできません。下のPromptを長押ししてコピーしてください。");
    }
  };

  const downloadText = (text: string, filename: string, type = "text/plain;charset=utf-8") => {
    if (!taskReady) { setNotice("やりたいことを4文字以上で入力してください。"); return; }
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice("設計書を作成しました。");
  };

  const savePlan = () => {
    if (!taskReady) { setNotice("やりたいことを4文字以上で入力してください。"); return; }
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item: SavedPlan = { id, task: task.trim(), workType, complexity, risk, frequency, repeatable, needsCreative, needsMotion, savedAt: new Date().toISOString() };
    const next = [item, ...history].slice(0, 6);
    setHistory(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotice("この端末のブラウザに履歴を保存しました。");
    } catch {
      setNotice("ブラウザの保存機能が利用できないため、設計書 .md を保存してください。");
    }
  };

  const restorePlan = (item: SavedPlan) => {
    setTask(item.task); setWorkType(item.workType); setComplexity(item.complexity); setRisk(item.risk); setFrequency(item.frequency);
    setRepeatable(item.repeatable); setNeedsCreative(item.needsCreative); setNeedsMotion(item.needsMotion); setNotice("履歴から復元しました。");
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>AI WORK ROUTER</div>
        <h1>AIに任せる前に、仕事を設計する。</h1>
        <p>仕事をルール処理・AI処理・人間承認へ分解し、コスト・事故・ブラックボックス化を抑えながら、再利用できる実行設計へ変換します。</p>
      </section>

      <section className={styles.quickStart} aria-label="使い方">
        <div><b>01</b><strong>仕事を選ぶ</strong><span>プリセットか自由入力</span></div>
        <div><b>02</b><strong>分担を確認</strong><span>RULE / AI / HUMAN</span></div>
        <div><b>03</b><strong>実行へ渡す</strong><span>Prompt / Markdown</span></div>
      </section>

      <section className={styles.valueStrip} aria-label="主要価値">
        <div><strong>コスト制御</strong><span>AI不要工程をRULEへ</span></div>
        <div><strong>承認設計</strong><span>重要操作だけ人間へ</span></div>
        <div><strong>履歴・再利用</strong><span>保存して再編集</span></div>
        <div><strong>可観測性</strong><span>何が起きたか残す</span></div>
      </section>

      <section className={styles.presets} aria-label="用途別プリセット">
        {presets.map((preset) => <button type="button" key={preset.label} onClick={() => applyPreset(preset)}>{preset.label}</button>)}
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <h2>1. 仕事を入力</h2>
          <p className={styles.helper}>迷ったら上のプリセットを押してから、文章だけ自分の仕事に書き換えてください。</p>
          <label htmlFor="task">やりたいこと</label>
          <textarea id="task" value={task} onChange={(e) => { setTask(e.target.value); setNotice(""); }} rows={4} aria-invalid={!taskReady} />
          {!taskReady && <p className={styles.validation}>4文字以上で具体的に入力してください。</p>}
          <label htmlFor="workType">仕事の種類</label>
          <select id="workType" value={workType} onChange={(e) => setWorkType(e.target.value as WorkType)}>
            {Object.entries(workLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <label>処理の難しさ</label>
          <div className={styles.segmented}>{(["simple", "standard", "deep"] as Complexity[]).map((v) => <button type="button" key={v} className={complexity === v ? styles.active : ""} onClick={() => setComplexity(v)}>{tierMap[v].label}</button>)}</div>
          <label>外部影響リスク</label>
          <div className={styles.segmented}>{(["low", "medium", "high"] as Risk[]).map((v) => <button type="button" key={v} className={risk === v ? styles.active : ""} onClick={() => setRisk(v)}>{v === "low" ? "低" : v === "medium" ? "中" : "高"}</button>)}</div>
          <label>頻度</label>
          <div className={styles.segmented}>{(["once", "weekly", "daily"] as Frequency[]).map((v) => <button type="button" key={v} className={frequency === v ? styles.active : ""} onClick={() => setFrequency(v)}>{v === "once" ? "単発" : v === "weekly" ? "週次" : "日次"}</button>)}</div>
          <div className={styles.toggles}>
            <label><input type="checkbox" checked={repeatable} onChange={(e) => setRepeatable(e.target.checked)} /> 繰り返す仕事</label>
            <label><input type="checkbox" checked={needsCreative} onChange={(e) => setNeedsCreative(e.target.checked)} /> 画像・動画制作あり</label>
            <label><input type="checkbox" checked={needsMotion} onChange={(e) => setNeedsMotion(e.target.checked)} /> UIモーションを検討</label>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.scoreGrid}>
            <div><span>自動化準備度</span><strong>{result.readiness}</strong><small>/100</small></div>
            <div><span>推奨運用</span><strong className={styles.depth}>{result.automationDepth}</strong></div>
          </div>
          <div className={styles.resultHeader}><div><span>推奨処理レベル</span><strong>{tierMap[complexity].label}</strong></div><p>{tierMap[complexity].note}</p></div>
          <div className={styles.modeSummary}><span>RULE {result.ruleCount}</span><span>AI {result.aiCount}</span><span>HUMAN {result.humanCount}</span></div>
          <div className={styles.guardrail}><strong>コストガード</strong><p>{result.costGuard}</p></div>
          <h2>2. 実行フロー</h2>
          <div className={styles.flowCards}>{result.flow.map((step, i) => <div className={styles.flowCard} key={`${step.label}-${i}`}><span className={styles[`mode${step.mode}`]}>{step.mode}</span><div><strong>{step.label}</strong><p>{step.why}</p></div></div>)}</div>
          <div className={styles.card}><h3>人間確認ポイント</h3><p>{result.humanBoundary}</p></div>
          <div className={styles.card}><h3>再利用化</h3><p>{result.skill}</p></div>
          <div className={styles.card}><h3>停止条件</h3><p>{result.stop}</p></div>
        </div>
      </section>

      <section className={styles.observability}>
        <div><div className={styles.eyebrow}>OBSERVABILITY</div><h2>あとから「何が起きたか」を追える設計</h2><p>自動化は動くだけでは不十分。問題が起きたとき原因を追える項目を先に決めます。</p></div>
        <div className={styles.obsTags}>{result.observability.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className={styles.promptPanel}>
        <div className={styles.promptHead}><div><div className={styles.eyebrow}>READY TO USE</div><h2>3. そのまま渡せる実行Prompt</h2></div><span className={styles.localBadge}>入力内容はこの画面内で処理</span></div>
        <pre>{result.prompt}</pre>
        <div className={styles.actions}>
          <button type="button" className={styles.copy} onClick={copyPrompt} disabled={!taskReady}>{copied ? "コピーしました" : "Promptをコピー"}</button>
          <button type="button" className={styles.secondary} onClick={() => downloadText(result.markdown, "ai-work-plan.md", "text/markdown;charset=utf-8")} disabled={!taskReady}>設計書 .md</button>
          <button type="button" className={styles.secondary} onClick={savePlan} disabled={!taskReady}>履歴に保存</button>
        </div>
        <p className={styles.notice} aria-live="polite">{notice}</p>
      </section>

      {history.length > 0 && <section className={styles.history}><div><div className={styles.eyebrow}>HISTORY</div><h2>最近の設計</h2></div><div className={styles.historyGrid}>{history.map((item) => <button type="button" key={item.id} onClick={() => restorePlan(item)}><strong>{item.task}</strong><span>{workLabels[item.workType]} · {tierMap[item.complexity].label} · {new Date(item.savedAt).toLocaleDateString("ja-JP")}</span></button>)}</div></section>}

      <section className={styles.note}><strong>設計思想</strong><p>高性能なAIを常に使うのではなく、AIを使わない工程、止める場所、記録する項目まで含めて設計します。外部送信・決済・削除・権限変更はこのツール自身では実行しません。</p></section>
    </main>
  );
}
