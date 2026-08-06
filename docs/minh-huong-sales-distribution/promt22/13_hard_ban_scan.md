# Hard Ban Scan

## Scan Command

```text
rg -n "commission|payout|wallet|payment|Subscription|subscription|frontend|mobile|coupon|renewal|CustomerAttribution|AppInstallAttribution|gateway|webhook|materialized|async export|object storage" apps/api/src/channel-affiliate/channel-affiliate.service.ts apps/api/src/channel-affiliate/channel-affiliate.controller.ts apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts
```

## Result

No hard-ban implementation was added.

Hits are limited to:

- existing sync CSV export method names from Prompt 21
- privacy decoy `payment-proof.pdf`
- financial counter safety checks for subscription, wallet, commission, payout, and payment tables

## Not Implemented

- commission policy changes
- commission calculation redesign
- payout/payment gateway/webhook/reconciliation
- frontend/UI
- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- customer/register attribution API
- first-click/last-click attribution engine
- attribution ownership changes
- manual override/dispute workflow
- coupon/discount
- renewal ownership
- fraud/risk scoring
- broad channel hierarchy redesign
- QR image rendering
- async export job/object storage
- report materialized view/read model table unrelated to audit
