"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  LockKeyhole,
  Play,
  ShieldCheck,
  TerminalSquare,
  TriangleAlert,
} from "lucide-react";

const DEFAULT_URL = "https://note.com/deft_eel6718/n/n1486dd84b614";
const DEFAULT_TITLE = "AI副業で稼げない人へ｜ChatGPT・顔出しなしYouTube・AI自動化を「収益」につなげる実践ガイド【2026年版】";
const RUNTIME_ENDPOINT = process.env.NEXT_PUBLIC_NOTE_OPERATOR_ENDPOINT ?? "";

type RunState =
  | { kind: "idle"; message: string }
  | { kind: "ready"; message: string }
  | { kind: "running"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

function parseNoteUrl(raw: string) {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" || url.hostname !== "note.com") {
      return { ok: false as const, error: "note.com のHTTPS URLだけ実行対象にできます。" };
    }
    const match = url.pathname.match(/^\/([^/]+)\/n\/(n[a-zA-Z0-9]+)$/);
    if (!match) {
      return { ok: false as const, error: "公開済みnote記事URL（/ユーザー名/n/n...）を指定してください。" };
    }
    return {
      ok: true as const,
      normalized: `https://note.com/${match[1]}/n/${match[2]}`,
      author: match[1],
      articleId: match[2],
    };
  } catch {
    return { ok: false as const, error: "URL形式を確認してください。" };
  }
}

export default function NoteOperatorPage() {
  const [articleUrl, setArticleUrl] = useState(DEFAULT_URL);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [runState, setRunState] = useState<RunState>({
    kind: "idle",
    message: "対象URLと新タイトルを確認してください。",
  });
  const parsed = useMemo(() => parseNoteUrl(articleUrl), [articleUrl]);

  const command = useMemo(() => {
    if (!parsed.ok || !title.trim()) return null;
    return {
      version: "note-operator.v1",
      action: "NOTE_EDIT_EXISTING_ARTICLE",
      target: {
        url: parsed.normalized,
        author: parsed.author,
        articleId: parsed.articleId,
      },
      mutation: {
        field: "title",
        value: title.trim(),
      },
      policy: {
        maxArticlesPerRun: 1,
        maxMeaningfulChanges: 1,
        maxRetries: 2,
        schedule: false,
        internalApi: false,
        captchaBypass: false,
        requireExistingSession: true,
        directReadback: true,
      },
      evidence: {
        readbackUrl: parsed.normalized,
        expectedTitle: title.trim(),
      },
    };
  }, [parsed, title]);

  const commandText = useMemo(() => (command ? JSON.stringify(command, null, 2) : ""), [command]);

  async function copyCommand() {
    if (!commandText) return;
    await navigator.clipboard.writeText(commandText);
    setRunState({ kind: "ready", message: "Operator Commandをコピーしました。" });
  }

  async function runOperator() {
    if (!command || !RUNTIME_ENDPOINT) return;
    setRunState({ kind: "running", message: "Local Runtimeへ実行要求を送信中…" });
    try {
      const response = await fetch(RUNTIME_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(command),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `HTTP ${response.status}`);
      }
      setRunState({
        kind: "success",
        message: text || "実行要求を受理しました。公開ページのDirect Readbackを確認してください。",
      });
    } catch (error) {
      setRunState({
        kind: "error",
        message: error instanceof Error ? error.message : "Runtime実行に失敗しました。",
      });
    }
  }

  const valid = parsed.ok && title.trim().length > 0;

  return (
    <main className="note-operator">
      <header className="op-header">
        <a href="/" className="op-back"><ArrowLeft size={16}/>Vector Praxis</a>
        <div className="op-brand">
          <span>VP</span>
          <div><b>Note Operator</b><small>ONE ARTICLE / ONE DIFF / DIRECT READBACK</small></div>
        </div>
        <div className={`runtime-chip ${RUNTIME_ENDPOINT ? "live" : "wait"}`}>
          <span />
          {RUNTIME_ENDPOINT ? "RUNTIME CONNECTED" : "RUNTIME WAIT"}
        </div>
      </header>

      <section className="op-shell hero">
        <div>
          <span className="eyebrow">VECTOR INTERNAL CONTROL</span>
          <h1>既存note記事を、<br/><em>1件1差分</em>で更新する。</h1>
          <p>
            新しい投稿機を作らず、公開済み記事だけを安全に編集するためのControl UIです。
            内部APIは使わず、既存ブラウザセッション＋Playwright/Chromium Runtimeを前提にします。
          </p>
        </div>
        <div className="status-card">
          <div><CheckCircle2 size={18}/><span><b>CONTROL UI</b><small>LIVE / command generation ready</small></span></div>
          <div className={RUNTIME_ENDPOINT ? "ok" : "warn"}>
            {RUNTIME_ENDPOINT ? <ShieldCheck size={18}/> : <TriangleAlert size={18}/>}
            <span><b>EXECUTION RUNTIME</b><small>{RUNTIME_ENDPOINT ? "endpoint configured" : "existing note session not connected"}</small></span>
          </div>
          <div><LockKeyhole size={18}/><span><b>HUMAN GATE</b><small>login / captcha / identity only</small></span></div>
        </div>
      </section>

      <section className="op-shell grid">
        <div className="panel form-panel">
          <div className="panel-head">
            <div><span className="eyebrow">01 / TARGET</span><h2>変更対象</h2></div>
            <span className="pill">TITLE ONLY</span>
          </div>

          <label>
            <span>note記事URL</span>
            <input value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} spellCheck={false}/>
            <small className={parsed.ok ? "good" : "bad"}>{parsed.ok ? `対象: ${parsed.articleId}` : parsed.error}</small>
          </label>

          <label>
            <span>新しいタイトル</span>
            <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={5}/>
            <small>{title.trim().length} chars</small>
          </label>

          <div className="guard-grid">
            <span>1 article/run</span><span>1 meaningful diff</span><span>retry ≤ 2</span>
            <span>no schedule</span><span>no internal API</span><span>readback required</span>
          </div>

          <div className="actions">
            <button onClick={copyCommand} disabled={!valid} className="secondary"><Clipboard size={16}/>Commandコピー</button>
            <button onClick={runOperator} disabled={!valid || !RUNTIME_ENDPOINT} className="primary"><Play size={16}/>{RUNTIME_ENDPOINT ? "Runtime実行" : "Runtime未接続"}</button>
          </div>

          {parsed.ok && (
            <a className="article-link" href={parsed.normalized} target="_blank" rel="noreferrer">
              公開記事を開く <ExternalLink size={14}/>
            </a>
          )}
        </div>

        <div className="panel command-panel">
          <div className="panel-head">
            <div><span className="eyebrow">02 / COMMAND</span><h2>実行契約</h2></div>
            <TerminalSquare size={20}/>
          </div>
          <pre>{commandText || "// URLとタイトルを入力するとCommandが生成されます。"}</pre>
          <div className={`run-state ${runState.kind}`}>
            <span />
            <p>{runState.message}</p>
          </div>
        </div>
      </section>

      <section className="op-shell flow">
        <div><small>INPUT</small><b>note URL + title</b></div><i>→</i>
        <div><small>GUARD</small><b>1 article / 1 diff</b></div><i>→</i>
        <div><small>EXECUTE</small><b>existing browser session</b></div><i>→</i>
        <div><small>VERIFY</small><b>public Direct Readback</b></div>
      </section>

      <footer className="op-shell footer">
        <span>Vector Praxis / Note Operator v1</span>
        <span>NO BULK EDIT · NO SCHEDULE · NO CAPTCHA BYPASS</span>
      </footer>

      <style jsx global>{`
        :root{--ink:#15201c;--muted:#6f7b75;--paper:#f4f6f1;--surface:#fff;--line:#dbe2dc;--green:#174f3b;--mint:#dff3e8;--amber:#f4c766;--amber-soft:#fff3cb;--red:#b74f49}
        *{box-sizing:border-box}html{background:var(--paper)}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans JP","Yu Gothic",system-ui,sans-serif}.note-operator{min-height:100vh;background:radial-gradient(circle at 80% 0,#e7f4eb 0,transparent 34%),linear-gradient(180deg,#fafbf7 0,#f3f5f0 100%)}.op-shell{width:min(1120px,calc(100% - 36px));margin-inline:auto}.op-header{position:sticky;top:0;z-index:20;height:68px;padding:0 max(18px,calc((100vw - 1120px)/2));display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:1px solid #e3e8e2;background:#fafbf7e8;backdrop-filter:blur(18px)}.op-back{justify-self:start;display:flex;align-items:center;gap:6px;color:#65706b;font-size:11px;font-weight:800}.op-brand{display:flex;align-items:center;gap:10px}.op-brand>span{width:35px;height:35px;border-radius:11px;background:var(--green);color:white;display:grid;place-items:center;font-size:9px;font-weight:900}.op-brand div{display:flex;flex-direction:column}.op-brand b{font-size:12px}.op-brand small{margin-top:2px;color:#89938e;font-size:7px;letter-spacing:.1em}.runtime-chip{justify-self:end;display:flex;align-items:center;gap:7px;padding:8px 10px;border:1px solid var(--line);border-radius:99px;background:white;font-size:8px;font-weight:900;letter-spacing:.08em}.runtime-chip>span{width:7px;height:7px;border-radius:50%;background:#be8a25}.runtime-chip.live>span{background:#2d8b65}.hero{padding:76px 0 46px;display:grid;grid-template-columns:1.2fr .8fr;gap:70px;align-items:end}.eyebrow{display:block;color:#7d8a84;font-size:8px;font-weight:900;letter-spacing:.16em}.hero h1{margin:14px 0 18px;font-size:clamp(42px,6.2vw,76px);line-height:1.02;letter-spacing:-.055em}.hero h1 em{font-style:normal;color:var(--green)}.hero p{max-width:650px;margin:0;color:var(--muted);font-size:12px;line-height:1.8}.status-card{padding:18px;border:1px solid var(--line);border-radius:23px;background:#fff;box-shadow:0 18px 50px #1831260d}.status-card>div{min-height:58px;display:grid;grid-template-columns:30px 1fr;align-items:center;gap:9px;padding:10px 11px;border-radius:14px;background:#f6f8f4;margin-top:7px}.status-card>div:first-child{margin-top:0}.status-card .warn{background:var(--amber-soft);color:#745816}.status-card .ok{background:var(--mint);color:#235d47}.status-card span{display:flex;flex-direction:column}.status-card b{font-size:9px;letter-spacing:.08em}.status-card small{margin-top:3px;font-size:8px;opacity:.7}.grid{display:grid;grid-template-columns:1.05fr .95fr;gap:14px;align-items:start}.panel{border:1px solid var(--line);border-radius:26px;background:#fff;box-shadow:0 16px 48px #17312709}.form-panel{padding:26px}.command-panel{padding:26px;position:sticky;top:88px}.panel-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.panel-head h2{margin:7px 0 0;font-size:25px;letter-spacing:-.03em}.pill{padding:7px 9px;border-radius:99px;background:var(--mint);color:#2b6a51;font-size:8px;font-weight:900;letter-spacing:.08em}label{display:block;margin-top:18px}label>span{display:block;margin-bottom:7px;font-size:9px;font-weight:850;color:#4d5a54}input,textarea{width:100%;border:1px solid #d8e0da;border-radius:14px;background:#fbfcfa;color:#1d2a24;padding:13px 14px;font:inherit;font-size:11px;outline:none;transition:border .15s,box-shadow .15s}textarea{resize:vertical;line-height:1.7}input:focus,textarea:focus{border-color:#83ac99;box-shadow:0 0 0 3px #dff3e8}label small{display:block;margin-top:6px;color:#87918c;font-size:8px}.good{color:#357158}.bad{color:var(--red)}.guard-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:20px}.guard-grid span{padding:9px 8px;border-radius:10px;background:#f2f5f1;color:#64716b;text-align:center;font-size:7px;font-weight:850}.actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:22px}.actions button{height:44px;border-radius:12px;border:1px solid #cad4cd;display:flex;align-items:center;justify-content:center;gap:7px;font-size:10px;font-weight:850;cursor:pointer}.actions .secondary{background:#fff;color:#33423b}.actions .primary{background:var(--green);border-color:var(--green);color:#fff}.actions button:disabled{opacity:.42;cursor:not-allowed}.article-link{margin-top:12px;display:inline-flex;align-items:center;gap:5px;color:#567168;font-size:9px;font-weight:800}.command-panel pre{min-height:358px;max-height:520px;margin:0;overflow:auto;padding:17px;border-radius:17px;background:#17231e;color:#dff2e8;font:9px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word}.run-state{margin-top:12px;display:flex;align-items:flex-start;gap:9px;padding:12px;border-radius:13px;background:#f4f6f3}.run-state>span{width:8px;height:8px;border-radius:50%;background:#8b9690;margin-top:3px}.run-state p{margin:0;color:#65716b;font-size:9px;line-height:1.5}.run-state.ready>span{background:#2d8b65}.run-state.running>span{background:#bd8b28}.run-state.success{background:var(--mint)}.run-state.success>span{background:#2d8b65}.run-state.error{background:#f9e9e7}.run-state.error>span{background:var(--red)}.flow{margin-top:14px;padding:18px 20px;border:1px solid var(--line);border-radius:20px;background:#edf2ed;display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:12px;align-items:center}.flow div{display:flex;flex-direction:column}.flow small{color:#89948f;font-size:7px;font-weight:900;letter-spacing:.12em}.flow b{margin-top:4px;font-size:9px}.flow i{font-style:normal;color:#9aa49f}.footer{padding:30px 0 38px;display:flex;justify-content:space-between;color:#8a948f;font-size:8px;letter-spacing:.07em}
        @media(max-width:800px){.op-header{grid-template-columns:auto 1fr auto}.op-brand div{display:none}.hero{grid-template-columns:1fr;gap:25px;padding-top:50px}.grid{grid-template-columns:1fr}.command-panel{position:static}.flow{grid-template-columns:1fr 1fr}.flow i{display:none}.footer{flex-direction:column;gap:6px}}
        @media(max-width:560px){.op-shell{width:calc(100% - 22px)}.op-header{padding-inline:12px}.op-back{font-size:0}.runtime-chip{font-size:0;padding:8px}.hero h1{font-size:43px}.form-panel,.command-panel{padding:18px;border-radius:20px}.guard-grid{grid-template-columns:1fr 1fr}.actions{grid-template-columns:1fr}.command-panel pre{min-height:290px}.flow{grid-template-columns:1fr}.footer{padding-bottom:24px}}
      `}</style>
    </main>
  );
}
