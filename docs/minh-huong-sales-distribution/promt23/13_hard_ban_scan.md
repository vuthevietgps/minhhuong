# Hard Ban Scan

## Code Scan

Scanned changed application files for banned implementation surfaces:

```text
rg -n "paymentGateway|webhook|reconciliation|payout execution|first-click|last-click|CustomerAttribution|AppInstallAttribution|coupon|discount|renewal ownership|fraud|risk scoring|frontend|mobile first-open|deferred attribution|QR image|materialized view|async export" apps/api/src/activation-orders/activation-orders.service.ts apps/api/src/activation-orders/activation-orders.service.spec.ts apps/api/prisma/schema.prisma apps/api/prisma/migrations/20260615090000_commission_attribution_snapshot/migration.sql
```

Result:

- No matches in changed application files.

## Manual Check

Not implemented:

- broad commission redesign
- new tiers
- payout execution
- payment gateway/webhook/reconciliation
- frontend/UI
- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- first-click/last-click engine
- coupon/discount
- renewal ownership logic
- fraud/risk scoring
- broad hierarchy redesign
- QR rendering
- async export storage
- report materialized view redesign
