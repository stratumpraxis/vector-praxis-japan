"use client";

import { useMemo, useState } from "react";
import styles from "./router.module.css";

type WorkType = "research" | "coding" | "content" | "creative" | "analysis" | "operations";
type Risk = "low" | "medium" | "high";
type Complexity = "simple" | "standard" | "deep";

const workLabels: Record<WorkType, string> = {
  research: "調査・リサーチ",
  coding: "コード・実装",
  content: "文章・コンテンツ",
  creative: "画像・動画・広告クリエイティブ",
  analysis: "分析・意思決定支援",
  operations: "運用・定型業務",
};

const tierMap: Record<Complexity, { label: string; note: string }> = {
  simple: { label: "FAST", note: "分類・整形・確認など、軽量で定型的な処理向け" },
  standard: { label: "GENERAL", note: "通常の実装・文章制作・比較・改善作業向け" },
  deep: { label: "DEEP", note: "複雑な設計・重要判断・多要因分析向け" },
};

function buildSteps(type: WorkType, risk: Risk) {
  const common = ["目的と成功条件を固定", "必要な情報・既存資産を確認"];
  const typeSteps: Record<WorkType, string[]> = {
    research: ["一次情報を優先して収集", "事実・仮説・不明点に分類", "判断材料を要約"],
    coding: ["既存構造を読む", "最小変更を設計", "実装", "テスト・差分確認"],
    content: ["読者・目的・媒体を固定", "構成案を作成", "本文生成", "事実確認と表現調整"],
    creative: ["目的・尺・媒体・CTAを定義", "クリエイティブ案を複数化", "素材生成・編集", "視認性とブランド整合を確認"],
    analysis: ["指標を選定", "原因候補を分解", "反証を確認", "次の1アクションを選定"],
    operations: ["入力条件を固定", "実行手順を標準化", "例外条件を定義", "結果ログを残す"],
  };
  const approval = risk === "high" ? ["人間承認", "実行・公開"] : risk === "medium" ? ["重要箇所のみ人間確認", "実行"] : ["自動実行候補"];
  return [...common, ...typeSteps[type], ...approval, "結果を計測し次の改善へ"];
}

export default function RouterClient() {
  const [workType, setWorkType] = useState<WorkType>("coding");
  const [complexity, setComplexity] = useState<Complexity>("standard");
  const [risk, setRisk] = useState<Risk>("medium");
  const [repeatable, setRepeatable] = useState(true);
  const [needsCreative, setNeedsCreative] = useState(false);
  const [needsMotion, setNeedsMotion] = useState(false);
  const [task, setTask] = useState("既存サイトを改善し、公開前に安全確認まで行う");

  const result = useMemo(() => {
    const steps = buildSteps(workType, risk);
    const humanBoundary =
      risk === "high"
        ? "公開・決済・削除・権限変更・顧客情報・重要判断は必ず人間承認"
        : risk === "medium"
          ? "外部公開や重要変更の直前に人間確認を入れる"
          : "可逆な範囲は自動化し、例外発生時のみ人間へ戻す";

    const skill = repeatable
      ? `この仕事は再利用向きです。成功した手順をSkillとして保存し、入力・判断基準・禁止事項・出力形式を固定してください。`
      : `単発性が高いため、まずはPromptテンプレート化に留め、反復が確認できたらSkill化してください。`;

    const creative = needsCreative
      ? "クリエイティブ工程を独立させ、Brief → 生成 → 編集 → QAの順に分ける。広告・動画は1案固定ではなく複数案比較を前提にする。"
      : "クリエイティブ工程は必須ではありません。成果に直結する場合のみ追加します。";

    const motion = needsMotion
      ? "UIの動きは目的別に限定。CTA、状態変化、導線理解に効く箇所だけ軽いアニメーションを付け、装飾目的の過剰モーションは避ける。"
      : "モーション追加は不要。情報密度と読みやすさを優先。";

    const prompt = `TASK\n${task}\n\nGOAL\n成果物を増やすことではなく、目的達成に必要な最小の実行を完了する。\n\nWORK MODE\n${workLabels[workType]} / ${tierMap[complexity].label}\n\nPROCESS\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nHUMAN BOUNDARY\n${humanBoundary}\n\nSTOP CONDITIONS\n権限不足、CAPTCHA、決済変更、秘密情報、個人情報、削除、想定外の外部送信、同一失敗の連続発生で停止する。\n\nREPORT\n確認したこと / 実行したこと / 結果 / 未解決 / 人間確認が必要なこと / 次の推奨アクション`;

    return { steps, humanBoundary, skill, creative, motion, prompt };
  }, [workType, complexity, risk, repeatable, needsCreative, needsMotion, task]);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(result.prompt);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>AI WORK ROUTER</div>
        <h1>仕事ごとに、AIの使い方を設計する。</h1>
        <p>
          仕事の種類・複雑さ・リスクから、処理レベル、実行フロー、人間確認、Skill化、クリエイティブ工程まで自動で整理します。
        </p>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <h2>1. 仕事を入力</h2>
          <label>やりたいこと</label>
          <textarea value={task} onChange={(e) => setTask(e.target.value)} rows={4} />

          <label>仕事の種類</label>
          <select value={workType} onChange={(e) => setWorkType(e.target.value as WorkType)}>
            {Object.entries(workLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <label>複雑さ</label>
          <div className={styles.segmented}>
            {(["simple", "standard", "deep"] as Complexity[]).map((v) => (
              <button key={v} className={complexity === v ? styles.active : ""} onClick={() => setComplexity(v)}>
                {tierMap[v].label}
              </button>
            ))}
          </div>

          <label>リスク</label>
          <div className={styles.segmented}>
            {(["low", "medium", "high"] as Risk[]).map((v) => (
              <button key={v} className={risk === v ? styles.active : ""} onClick={() => setRisk(v)}>
                {v === "low" ? "低" : v === "medium" ? "中" : "高"}
              </button>
            ))}
          </div>

          <div className={styles.toggles}>
            <label><input type="checkbox" checked={repeatable} onChange={(e) => setRepeatable(e.target.checked)} /> 繰り返す仕事</label>
            <label><input type="checkbox" checked={needsCreative} onChange={(e) => setNeedsCreative(e.target.checked)} /> 画像・動画制作あり</label>
            <label><input type="checkbox" checked={needsMotion} onChange={(e) => setNeedsMotion(e.target.checked)} /> UIモーションを検討</label>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.resultHeader}>
            <div>
              <span>推奨処理レベル</span>
              <strong>{tierMap[complexity].label}</strong>
            </div>
            <p>{tierMap[complexity].note}</p>
          </div>

          <h2>2. 実行フロー</h2>
          <ol className={styles.flow}>
            {result.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>

          <div className={styles.card}>
            <h3>人間確認ポイント</h3>
            <p>{result.humanBoundary}</p>
          </div>
          <div className={styles.card}>
            <h3>再利用化</h3>
            <p>{result.skill}</p>
          </div>
          <div className={styles.card}>
            <h3>クリエイティブ工程</h3>
            <p>{result.creative}</p>
          </div>
          <div className={styles.card}>
            <h3>モーション判断</h3>
            <p>{result.motion}</p>
          </div>
        </div>
      </section>

      <section className={styles.promptPanel}>
        <div>
          <div className={styles.eyebrow}>READY TO USE</div>
          <h2>3. そのまま渡せる実行Prompt</h2>
        </div>
        <pre>{result.prompt}</pre>
        <button className={styles.copy} onClick={copyPrompt}>Promptをコピー</button>
      </section>

      <section className={styles.note}>
        <strong>設計思想</strong>
        <p>
          高性能なAIを常に使うのではなく、仕事の難しさに合わせて処理能力を変え、再利用できる仕事はSkill化し、重要な操作だけ人間承認に残します。
        </p>
      </section>
    </main>
  );
}
