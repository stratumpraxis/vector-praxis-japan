# Zero-cost production hosting migration

## Goal

Move the authoritative Vector Praxis Japan Hub to a free `*.vercel.app` production origin without removing or redirecting the existing Sites origin.

## Current verified state

- Existing public origin: https://vector-praxis-japan.user-ex26.chatgpt.site/
- Existing origin remains canonical until the replacement is publicly reachable.
- GitHub source: https://github.com/stratumpraxis/vector-praxis-japan
- GitHub `main`: `4a4befc66e43082ee6c3027e980859b0ca847e98`
- GitHub Actions verification: successful (`npm ci`, Vercel build, Sites build, 5 tests).
- Vercel production deployment request: `dpl_5WmZV9b2oYEYQn89coBajTSNb1yr`
- Issued deployment URL: https://vector-praxis-japan-2vnqe4hos-stratumpraxis-7205s-projects.vercel.app/
- Vercel inspector: https://vercel.com/stratumpraxis-7205s-projects/vector-praxis-japan/5WmZV9b2oYEYQn89coBajTSNb1yr

The earlier file-upload Vercel URL is **not an acceptable public production origin**. An unauthenticated request receives a `302` to Vercel SSO with `x-robots-tag: noindex`. The verified GitHub repository is now the preferred Vercel source. Canonical, sitemap, and robots remain pointed at the public Sites origin until the Git-backed Vercel deployment is public.

## Completed implementation

- Added a Vercel-specific Next.js production build (`npm run build:vercel`).
- Added `vercel.json` with Next.js framework and build command declarations.
- Kept the existing Sites/Vinext production build unchanged.
- Kept the centralized HTTPS-only canonical origin helper.
- Packaged the existing visual mark as a text-safe SVG wrapper for API deployment while preserving the original WebP asset.
- Verified both builds locally and ran the existing test suite.
- Published the complete source to the public GitHub repository.
- Added GitHub Actions verification for every `main` push and pull request.
- Confirmed the GitHub Actions run succeeds end to end.

## Smallest remaining human action

1. In Vercel, choose **Add New → Project**.
2. Import `stratumpraxis/vector-praxis-japan` from GitHub.
3. Keep Framework Preset as **Next.js**, Root Directory as repository root, and deploy. `vercel.json` already supplies the production build command.
4. Confirm the issued production alias ending in `.vercel.app` loads without Vercel Authentication.
5. Share that stable alias so the final canonical transition and public QA can be completed.

No domain purchase, DNS edit, redirect, or removal of the Sites deployment is required.

## Finalization after public access is enabled

1. Verify the stable Vercel URL returns `200` without authentication and has a valid TLS certificate.
2. Set `FALLBACK_SITE_ORIGIN` in `lib/site-url.ts` to that verified Vercel origin.
3. Push the canonical change to GitHub; Vercel then redeploys from `main`.
4. Confirm the GitHub Actions and Vercel deployment both succeed.
5. Redeploy the same source to Sites so the old URL stays functional while declaring the Vercel origin as canonical.
6. Verify canonical, Open Graph URL, sitemap URLs, and robots sitemap line on both hosts.

## Rollback

If the Vercel deployment becomes unavailable or protected again, leave the Sites deployment untouched and restore `FALLBACK_SITE_ORIGIN` to the Sites URL. The migration never depends on deleting the existing Sites project.
