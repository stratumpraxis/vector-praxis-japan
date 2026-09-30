import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const commandPath = process.argv[2];
if (!commandPath) throw new Error("command file path is required");

const command = JSON.parse(fs.readFileSync(commandPath, "utf8"));
const profileDir = process.env.NOTE_PROFILE_DIR || "C:\\vector-note-profile";
const evidenceRoot = process.env.NOTE_OPERATOR_EVIDENCE_DIR || path.resolve("note-operator-evidence");
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const evidenceDir = path.join(evidenceRoot, runId);
fs.mkdirSync(evidenceDir, { recursive: true });

const evidence = {
  version: "note-operator-evidence.v1",
  startedAt: new Date().toISOString(),
  state: "STARTED",
  target: command?.target?.url ?? null,
  mutation: command?.mutation ?? null,
  steps: [],
};

function writeEvidence() {
  fs.writeFileSync(path.join(evidenceDir, "evidence.json"), JSON.stringify(evidence, null, 2), "utf8");
}
function record(step, data = {}) {
  evidence.steps.push({ at: new Date().toISOString(), step, ...data });
  writeEvidence();
}
function stop(code, message) {
  evidence.state = "STOP";
  evidence.error = { code, message };
  evidence.finishedAt = new Date().toISOString();
  record("STOP", { code, message });
  throw new Error(`${code}: ${message}`);
}
function validate() {
  if (command?.version !== "note-operator.v1") stop("INVALID_VERSION", "unsupported command");
  if (command?.action !== "NOTE_EDIT_EXISTING_ARTICLE") stop("INVALID_ACTION", "unsupported action");
  if (command?.policy?.maxArticlesPerRun !== 1 || command?.policy?.maxMeaningfulChanges !== 1) stop("POLICY_BLOCK", "one article / one diff required");
  const u = new URL(command.target.url);
  if (u.protocol !== "https:" || u.hostname !== "note.com" || !/^\/[^/]+\/n\/n[a-zA-Z0-9]+$/.test(u.pathname)) stop("TARGET_BLOCK", "target must be a public note article URL");
  if (!["title", "price"].includes(command?.mutation?.field)) stop("MUTATION_BLOCK", "only title or price is allowed");
  if (command.mutation.field === "price") {
    const p = Number(command.mutation.value);
    if (!Number.isInteger(p) || p < 100 || p > 50000) stop("PRICE_BLOCK", "invalid price");
  }
}
validate();

const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: { width: 1365, height: 900 },
});
const page = context.pages()[0] || await context.newPage();

async function screenshot(name) {
  await page.screenshot({ path: path.join(evidenceDir, name), fullPage: true }).catch(() => {});
}
async function visibleText() {
  return await page.locator("body").innerText().catch(() => "");
}
async function clickFirst(candidates, timeout = 2500) {
  for (const locator of candidates) {
    try {
      if (await locator.first().isVisible({ timeout })) {
        await locator.first().click();
        return true;
      }
    } catch {}
  }
  return false;
}
async function fillFirst(candidates, value) {
  for (const locator of candidates) {
    try {
      const first = locator.first();
      if (await first.isVisible({ timeout: 2000 })) {
        await first.fill(String(value));
        return true;
      }
    } catch {}
  }
  return false;
}

try {
  await page.goto(command.target.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  record("PUBLIC_OPEN", { url: page.url() });
  await screenshot("01-public.png");

  const publicBody = await visibleText();
  if (/ログイン/.test(publicBody) && !/編集/.test(publicBody)) {
    stop("LOGIN_REQUIRED", "note login session is missing or expired");
  }

  const editOpened = await clickFirst([
    page.getByRole("link", { name: /^編集$/ }),
    page.getByRole("button", { name: /^編集$/ }),
    page.getByText(/^編集$/, { exact: true }),
  ], 1800);
  if (!editOpened) stop("EDIT_ENTRY_NOT_FOUND", "could not find the article edit entry; no changes made");

  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(1200);
  record("EDIT_OPEN", { url: page.url() });
  await screenshot("02-edit.png");

  if (command.mutation.field === "title") {
    const titleValue = String(command.mutation.value).trim();
    const titleCandidates = [
      page.locator('textarea[placeholder*="タイトル"]'),
      page.locator('input[placeholder*="タイトル"]'),
      page.getByRole("textbox", { name: /タイトル/ }),
    ];
    let current = "";
    for (const locator of titleCandidates) {
      try {
        if (await locator.first().isVisible({ timeout: 1200 })) {
          current = await locator.first().inputValue().catch(() => "");
          break;
        }
      } catch {}
    }
    if (current === titleValue) {
      record("IDEMPOTENT", { field: "title", value: titleValue });
    } else {
      const changed = await fillFirst(titleCandidates, titleValue);
      if (!changed) stop("TITLE_FIELD_NOT_FOUND", "title field was not found; no changes committed");
      record("TITLE_FILLED", { before: current || null, after: titleValue });
    }
  }

  if (command.mutation.field === "price") {
    const openedSettings = await clickFirst([
      page.getByRole("button", { name: /公開設定|公開に進む|設定/ }),
      page.getByText(/公開設定|公開に進む/, { exact: false }),
    ], 1800);
    if (!openedSettings) stop("PRICE_SETTINGS_NOT_FOUND", "publish/price settings entry was not found; no changes committed");
    await page.waitForTimeout(800);
    const price = Number(command.mutation.value);
    const priceChanged = await fillFirst([
      page.locator('input[name*="price" i]'),
      page.locator('input[placeholder*="価格"]'),
      page.getByRole("spinbutton", { name: /価格/ }),
      page.getByRole("textbox", { name: /価格/ }),
    ], String(price));
    if (!priceChanged) stop("PRICE_FIELD_NOT_FOUND", "price field was not found; no changes committed");
    record("PRICE_FILLED", { after: price });
  }

  await screenshot("03-before-commit.png");

  const committed = await clickFirst([
    page.getByRole("button", { name: /^更新する$/ }),
    page.getByRole("button", { name: /^保存$/ }),
    page.getByRole("button", { name: /更新して公開|変更を保存|公開する/ }),
  ], 2500);

  if (!committed) stop("COMMIT_CONTROL_NOT_FOUND", "safe commit control was not found; browser left without committing");

  record("COMMIT_CLICKED");
  await page.waitForTimeout(1800);

  await page.goto(command.evidence?.readbackUrl || command.target.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  const readbackBody = await visibleText();
  await screenshot("04-readback.png");

  if (command.mutation.field === "title") {
    const expected = String(command.mutation.value).trim();
    const title = await page.locator("h1").first().innerText().catch(() => "");
    if (title.trim() !== expected && !readbackBody.includes(expected)) {
      stop("READBACK_MISMATCH", `expected title was not found on public page: ${expected}`);
    }
    record("READBACK_OK", { field: "title", value: expected });
  } else {
    const expected = Number(command.mutation.value);
    const formatted = expected.toLocaleString("ja-JP");
    const yenPatterns = [`¥${formatted}`, `${formatted}円`, `￥${formatted}`];
    if (!yenPatterns.some((p) => readbackBody.includes(p))) {
      stop("READBACK_MISMATCH", `expected price was not found on public page: ${expected}`);
    }
    record("READBACK_OK", { field: "price", value: expected });
  }

  evidence.state = "SUCCESS";
  evidence.finishedAt = new Date().toISOString();
  record("COMPLETE");
  console.log(JSON.stringify({ ok: true, state: evidence.state, evidenceDir }, null, 2));
} finally {
  await context.close().catch(() => {});
}
