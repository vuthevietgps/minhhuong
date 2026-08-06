# Hard Ban Scan

## Command

```text
rg -n "paymentGateway|webhook|reconciliation|payout execution|first-click|last-click|CustomerAttribution|AppInstallAttribution|coupon|discount|renewal ownership|fraud|risk scoring|frontend|mobile first-open|deferred attribution|QR image|materialized view|async export" apps/api/src/activation-orders/activation-orders.service.ts apps/api/src/activation-orders/activation-orders.service.spec.ts apps/api/prisma/schema.prisma apps/api/prisma/migrations/20260615100000_activation_order_commission_chain_snapshot/migration.sql
```

## Result

- No matches in changed application files.

## Manual Check

Not implemented:

- broad commission redesign
- new commission tiers
- payout processing/execution
- payout request workflow
- payment gateway/webhook/reconciliation
- frontend/UI
- mobile/customer attribution
- first-click/last-click engine
- override/dispute workflow
- coupon/discount
- renewal ownership
- fraud/risk scoring
- QR image rendering
- async export/object storage
- materialized reporting redesign
