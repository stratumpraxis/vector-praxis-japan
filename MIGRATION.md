# GWR independent repository cutover

## Target state

Global Work Radar runs from its own repository and does not require Stratum, Vector Praxis, or Digital Index Base repositories at runtime.

Production URLs remain unchanged:

- https://global-work-radar.pages.dev/
- https://gwr-world-work-data.pages.dev/

## New repository bootstrap

Use the contents of the current independent export branch as the new repository `main`.

The repository must contain GWR files at the repository root. Do not restore the old `incubator/global-work-radar` nesting.

## Required repository secrets

Configure these before enabling deployment workflows:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The token must have the minimum permissions necessary to deploy the two existing GWR Cloudflare Pages projects.

## Pre-cutover verification

Run:

```bash
npm test
```

Expected:

```text
GWR_INDEPENDENCE_AUDIT=PASS
```

Then manually dispatch:

1. `GWR Independence Audit`
2. `GWR Scheduled Refresh & Deploy`
3. `GWR World Work Data Deploy`

Verify:

- the refresh workflow commits evidence to the new repository `main`
- `https://global-work-radar.pages.dev/data/verified-jobs.json` has a fresh `generated_at`
- the main GWR page still loads
- World Work Data still loads
- no workflow reads from or pushes to `stratumpraxis/vector-praxis-japan`

## Cutover gate

Do not disable the legacy GWR workflows until all new-repository checks above pass.

After they pass:

1. disable legacy GWR scheduled workflows in the old repository
2. keep the old branch temporarily as rollback evidence
3. confirm one full scheduled cycle succeeds from the new repository
4. only then treat the old repository as non-authoritative for GWR

## Rollback

If the independent repository fails to refresh or deploy:

1. re-enable the legacy GWR scheduled workflow
2. keep the current Cloudflare Pages projects and URLs unchanged
3. diagnose the new repository without changing public URLs
4. retry cutover only after `npm test` and manual workflow dispatches pass

This migration intentionally avoids a destructive cutover.
