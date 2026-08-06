# Hard Ban Scan

## Scan Command

```text
rg -n "commission|payout|wallet|payment|Subscription|subscription|frontend|mobile|coupon|renewal" apps/api/src/channel-affiliate/channel-affiliate.service.ts apps/api/src/channel-affiliate/channel-affiliate.controller.ts apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts
```

## Result

No hard-ban implementation was added.

Hits are limited to tests:

- privacy decoy data and assertions for `payment-proof.pdf`
- financial counter safety checks for subscriptions, wallet ledger entries, commissions, payouts, and payments

## Not Implemented

- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click attribution engine
- attribution dispute/manual override workflow
- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- finance report redesign
- frontend/UI
- QR image rendering
- coupon/discount
- renewal ownership logic
- fraud/risk scoring
- broad channel hierarchy redesign
