# Vector Praxis — Social Publishing Route

Updated: 2026-09-10
Status: CANONICAL OPERATIONAL NOTE

## Purpose

This file is the canonical memo for Vector Praxis social publishing.
Before publishing any Vector note, video, article, or campaign, verify this file and the current social queue.

## Source of truth

Repository:
`stratumpraxis/vector-praxis-japan`

Primary queue:
`distribution/social-queue.json`

Manual trigger marker:
`distribution/social-trigger.txt`

Workflow:
`.github/workflows/social-publish.yml`

Execution path:

`Vector content / note`
→ `distribution/social-queue.json`
→ `GitHub Actions social-publish.yml`
→ `platform-specific provider`
→ `external post ID / public URL`
→ `evidence persisted back to repository`

A post is not considered complete until an external post ID or public URL is recorded.

## Vector-owned publishing accounts

- Instagram: `vect.orpraxis`
- TikTok: `vectorpraxismd`
- Bluesky: `vectorpx.bsky.social`
- Pinterest: `vectorpraxis`
- note: `https://note.com/deft_eel6718`

## Provider routes

### Bluesky

Primary route: direct provider from GitHub Actions.

Current status: ACTIVE / VERIFIED.

Known verified account:
`vectorpx.bsky.social`

Example verified publication from 2026-09-10:
`https://bsky.app/profile/vectorpx.bsky.social/post/3mv4xtjhyek24`

### Instagram

Direct Instagram Reels publisher exists in:
`scripts/social-provider-instagram.mjs`

Primary direct route requires GitHub Secrets:
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID`

Current observed state on 2026-09-10: direct code exists, but both secrets were absent, so the queue returned `READY_BUT_NOT_CONNECTED`.

Fallback / historical shared provider: Metricool.

Vector Metricool account:
`vect.orpraxis`

### TikTok

Vector account:
`vectorpraxismd`

Historical verified route: Metricool.

Current route should be verified before each publish because provider quota / connection state can change.

Do not substitute an ARVEN TikTok account.

### Pinterest

Vector account:
`vectorpraxis`

Pinterest publication requires a valid Board ID / board selection before publishing.

## Brand guardrail — critical

NEVER publish Vector content to ARVEN accounts.

Known non-Vector accounts that must not be used for Vector distribution:
- Instagram: `arenv.ox`
- Threads: `arenv.ox`
- TikTok: `arven_vox`
- Bluesky: `arvenvox.bsky.social`

On 2026-09-10, a Vector Decision Product note campaign was mistakenly posted to ARVEN accounts. Treat this as a routing incident and use it as a permanent guardrail.

Before any publish, check both:
1. Brand = Vector Praxis
2. Destination account username matches the Vector account map above

If either is uncertain, fail closed and do not publish.

## X rule

Do not automatically publish Vector content to X unless channel safety and account status have been explicitly re-verified.

The current social queue contains X as a disabled / blocked platform.

## Required pre-publish sequence

Use this exact order:

`Content URL / Asset`
→ `Brand check`
→ `Vector account check`
→ `Queue entry`
→ `Provider preflight`
→ `Publish`
→ `External post ID / URL verification`
→ `Persist evidence`

Do not treat `scheduled`, `pending`, `queued`, or provider acceptance as publication success.

## Video production note

For Vector short-form video, the preferred production stack is:

`Existing assets / research`
→ `Canva motion board when useful`
→ `Remotion / motion composition`
→ `Narration / TTS`
→ `commercial-safe original BGM`
→ `caption / rights / platform QA`
→ `Vector social queue`
→ `publication evidence`

Avoid copyrighted music, third-party logos, or unverified commercial-use media.

## Current Decision Product note example

Vector note:
`https://note.com/deft_eel6718/n/n7c20c67abf0c`

Correct brand: Vector Praxis.

Correct social route:
`Vector note → vector-praxis-japan social queue → verified Vector accounts`

Do not route this article through Stratum or ARVEN social accounts unless explicitly requested as a separate cross-brand campaign.
