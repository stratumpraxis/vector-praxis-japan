# GWR Revenue Integration — 2026-09-04

## Selected partner

Deel affiliate program.

Why selected:
- Direct fit with global hiring / contractor payment / payroll / compliance context.
- Official affiliate program currently advertises up to USD 1,500 per new customer: USD 500 per sales-qualified referral plus USD 1,000 per new paying customer.
- 90-day attribution window.
- Existing GWR product boundary is preserved because applications, employment, payroll, and hiring decisions remain external.

## Integration state

- CTA shell implemented in `index.html`.
- Revenue config isolated in `revenue-config.js`.
- CTA is fail-closed: hidden unless `enabled: true` and a valid HTTPS `affiliateUrl` are both present.
- Affiliate disclosure is shown when active.
- Outbound clicks emit `gwr_revenue_click` to `dataLayer` and a bounded localStorage audit trail.
- Cloudflare deployment workflow updated to include `revenue-config.js`.

## External blocker

A live revenue-generating CTA requires the approved unique Deel affiliate tracking URL issued after affiliate application / review. Do not substitute a generic Deel URL and call it revenue tracking.

## Activation

After approval, edit only `revenue-config.js`:

```js
window.GWR_REVENUE = Object.freeze({
  enabled: true,
  partner: 'Deel',
  affiliateUrl: 'APPROVED_UNIQUE_DEEL_TRACKING_URL',
  disclosure: 'このリンク経由で申込みが成立した場合、Global Work Radarが紹介料を受け取ることがあります。',
  campaign: 'gwr_deel_2026_09'
});
```

Then verify:
1. deploy succeeds,
2. CTA is visible,
3. CTA resolves to the approved tracking URL,
4. one test click is recorded,
5. PartnerStack records attribution,
6. commission is marked only after Deel reports a qualifying referral/customer.

Status: CONDITIONAL READY — code path complete; affiliate approval/tracking URL remains external dependency.
