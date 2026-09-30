import { chromium } from "playwright";
import fs from "node:fs";

const profileDir = process.env.NOTE_PROFILE_DIR || "C:\\vector-note-profile";
fs.mkdirSync(profileDir, { recursive: true });

console.log("[NOTE_OPERATOR] opening persistent browser profile:", profileDir);
const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = context.pages()[0] || await context.newPage();
await page.goto("https://note.com/login", { waitUntil: "domcontentloaded" });

console.log("[HUMAN_GATE] Login to note in the opened browser.");
console.log("[HUMAN_GATE] The session will be stored only in the local persistent profile.");

const deadline = Date.now() + 12 * 60 * 1000;
let verified = false;
while (Date.now() < deadline) {
  await page.waitForTimeout(3000);
  const url = page.url();
  const body = await page.locator("body").innerText().catch(() => "");
  const looksLoggedIn =
    !/\/login(?:$|\?)/.test(url) &&
    (body.includes("投稿") || body.includes("プロフィール") || body.includes("ダッシュボード") || body.includes("記事"));
  if (looksLoggedIn) {
    verified = true;
    break;
  }
}
if (!verified) {
  await context.close();
  throw new Error("LOGIN_NOT_VERIFIED: note session was not verified within 12 minutes.");
}

console.log("[OK] note login session verified and stored in persistent profile.");
await context.close();
