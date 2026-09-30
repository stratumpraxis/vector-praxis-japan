import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPO = process.env.NOTE_OPERATOR_REPO || "stratumpraxis/vector-praxis-japan";
const WORKFLOW = process.env.NOTE_OPERATOR_WORKFLOW || "note-operator.yml";

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

function validateCommand(command: unknown) {
  if (!command || typeof command !== "object") return "command is required";
  const c = command as Record<string, any>;
  if (c.version !== "note-operator.v1") return "unsupported command version";
  if (c.action !== "NOTE_EDIT_EXISTING_ARTICLE") return "unsupported action";
  const url = c?.target?.url;
  if (typeof url !== "string") return "target.url is required";
  let parsed: URL;
  try { parsed = new URL(url); } catch { return "invalid target.url"; }
  if (parsed.protocol !== "https:" || parsed.hostname !== "note.com") return "target must be note.com";
  if (!/^\/[^/]+\/n\/n[a-zA-Z0-9]+$/.test(parsed.pathname)) return "target must be a note article URL";
  const mutation = c?.mutation;
  if (!mutation || !["title", "price"].includes(mutation.field)) return "mutation.field must be title or price";
  if (mutation.field === "title" && (typeof mutation.value !== "string" || !mutation.value.trim())) return "title is required";
  if (mutation.field === "price") {
    const price = Number(mutation.value);
    if (!Number.isInteger(price) || price < 100 || price > 50000) return "price must be an integer from 100 to 50000";
  }
  if (c?.policy?.maxArticlesPerRun !== 1 || c?.policy?.maxMeaningfulChanges !== 1) return "one-article/one-diff policy required";
  return null;
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.GITHUB_NOTE_OPERATOR_TOKEN && process.env.NOTE_OPERATOR_ACCESS_KEY),
    workflow: WORKFLOW,
    repo: REPO,
  });
}

export async function POST(request: Request) {
  const token = process.env.GITHUB_NOTE_OPERATOR_TOKEN;
  const expectedKey = process.env.NOTE_OPERATOR_ACCESS_KEY;
  if (!token || !expectedKey) {
    return NextResponse.json({ ok: false, error: "runtime_not_configured" }, { status: 503 });
  }

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const suppliedKey = String(body?.accessKey || "");
  if (!suppliedKey || !safeEqual(suppliedKey, expectedKey)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const error = validateCommand(body?.command);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  const commandB64 = Buffer.from(JSON.stringify(body.command), "utf8").toString("base64");
  const [owner, repo] = REPO.split("/");
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${WORKFLOW}/dispatches`;

  const gh = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref: "main",
      inputs: { mode: "execute", command_b64: commandB64 },
    }),
    cache: "no-store",
  });

  if (!gh.ok) {
    const detail = await gh.text();
    return NextResponse.json({ ok: false, error: "github_dispatch_failed", detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true, state: "DISPATCHED", target: body.command.target.url, mutation: body.command.mutation.field });
}
