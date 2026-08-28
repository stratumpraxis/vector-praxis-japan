# Vector Praxis Japan — Social Distribution

This lane distributes approved Vector Praxis Japan content without fabricating publication state.

## Current campaign

- Destination: `https://note.com/deft_eel6718/n/n0645c2335ba8?app_launch=false`
- Queue: `distribution/social-queue.json`
- Cadence: at most one queued post per day; six distinct X angles are staged.
- Tracking: every post receives unique `utm_content` under campaign `note_ai_automation_20260828`.

## Safety contract

- Only items with `approval: USER_APPROVED` and `status: READY` are eligible.
- The publisher processes only one due item per workflow run.
- A post is never marked `PUBLISHED` unless the publisher returns `external_post_id`.
- Missing publisher connection is a no-op (`READY_BUT_NOT_CONNECTED`).
- HTTP/provider failure stops the run; there is no infinite retry loop.
- Identical copy is not intentionally reused.
- Secrets are never stored in the queue or repository.

## Publisher connection

GitHub Actions reads a single repository secret:

`SOCIAL_PUBLISH_WEBHOOK_URL`

The webhook must accept JSON containing `brand`, `campaign`, `id`, `platform`, `text`, `destination_url`, and `scheduled_at` and return JSON containing a real `external_post_id` after the external platform/publisher has accepted the post.

This keeps the repository provider-agnostic: the webhook can be implemented by a compliant Buffer/n8n/Make/custom publisher bridge without changing campaign data.
