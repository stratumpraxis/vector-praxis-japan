# Note Operator Runtime

Purpose: safely edit one existing note article with one meaningful change, using a logged-in browser session on the user's own Windows PC.

## Guardrails

- one article per run
- one mutation per run (`title` or `price`)
- no scheduler
- no internal/private note API
- no CAPTCHA bypass
- no credential entry by automation
- existing persistent browser session required
- public-page readback required after commit
- any selector ambiguity causes STOP instead of guessing

## Windows runner label

Register the GitHub self-hosted runner with the custom label:

`note-operator`

Expected runner labels:

`self-hosted, windows, x64, note-operator`

## Persistent session

The workflow uses:

`C:\\vector-note-profile`

Run the workflow manually with **mode = bootstrap-login**. A browser opens on the Windows runner. Log in to note yourself. The worker stores only the browser profile on that PC.

## Site dispatch secrets

The Vercel project needs:

- `NOTE_OPERATOR_ACCESS_KEY` — a long random passphrase used only to authorize the control UI request
- `GITHUB_NOTE_OPERATOR_TOKEN` — fine-grained GitHub token scoped only to this repository with Actions: Read and write
- optional `NOTE_OPERATOR_REPO` — defaults to `stratumpraxis/vector-praxis-japan`
- optional `NOTE_OPERATOR_WORKFLOW` — defaults to `note-operator.yml`

The GitHub token stays server-side. It is never included in the browser bundle.

## Calibration

note can change its UI. The worker intentionally uses conservative accessible selectors and stops when it cannot uniquely find a safe control. The first successful run should be a low-risk title-only change. Price changes should be attempted only after the editor's current UI has been verified on the logged-in runner.
