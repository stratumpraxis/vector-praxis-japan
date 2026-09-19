# Global Work Radar

Global Work Radar (GWR) is an independent global-work and labor-intelligence service.

## Production

- Main site: https://global-work-radar.pages.dev/
- World Work Data: https://gwr-world-work-data.pages.dev/

## Repository boundary

This repository contains only GWR-owned code, data, deployment workflows, measurement logic, and GWR data utilities.

It is intentionally independent from Stratum, Vector Praxis, and Digital Index Base repositories. Other brands may consume verified GWR signals through explicit handoff or public links, but they are not runtime dependencies.

## Core loop

Public/approved source
→ ingest
→ normalize
→ verify
→ publish
→ measure human action
→ retain evidence
→ refresh

## Operations

The scheduled refresh workflow updates verified job data and deploys the public site to Cloudflare Pages. Social growth output is GWR-only and remains candidate-only until a GWR-owned publishing channel is verified.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Technical product notes live under `incubator/global-work-radar/README.md`.
