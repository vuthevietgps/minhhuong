# Hard Ban Scan

## Scan Command

```text
rg -n "commission|payout|wallet|payment|Subscription|subscription|frontend|mobile|coupon|renewal|CustomerAttribution|AppInstallAttribution|gateway|webhook" apps/api/src/channel-affiliate/channel-affiliate.service.ts apps/api/src/channel-affiliate/channel-affiliate.controller.ts apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts
```

## Result

No hard-ban implementation was added.

Hits are limited to tests:

- privacy decoy value `payment-proof.pdf`
- financial counter safety checks for subscriptions, wallet ledger entries, commission records, payouts, and payments

## Not Implemented

- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- finance report redesign outside affiliate attribution export
- frontend/UI
- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click attribution engine
- manual override/dispute workflow
- coupon/discount
- renewal ownership
- fraud/risk scoring
- broad channel hierarchy redesign
- QR image rendering
- schema migration
