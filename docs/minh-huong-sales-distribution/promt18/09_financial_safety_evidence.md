# Financial Safety Evidence

## Order Creation Boundary

Prompt 18 writes the affiliate snapshot only during order creation:

- sale-assisted snapshot write: `apps/api/src/activation-orders/activation-orders.service.ts:391`
- self-service snapshot write: `apps/api/src/activation-orders/activation-orders.service.ts:683`

Order creation does not create:

- `Payment`
- `Subscription`
- `WalletLedgerEntry`
- `CommissionEarning`
- `CommissionLedgerEntry`
- `PayoutRequest`

## Existing Approval Boundary

Existing approve flow remains the only place that creates financial side effects:

- `payment.create`: line 1000
- `subscription.create`: line 1015
- `walletLedgerEntry.create`: line 1029
- `createCommissionEntries`: line 1041
- `commissionEarning.create`: line 2016

## Test Evidence

`apps/api/src/activation-orders/activation-orders.service.spec.ts`

- self-service valid click creates no financial side effects: lines 705-708
- malformed/not-found/expired/inactive click creates no order or financial side effects: lines 760-763
- sale-assisted compatible click creates no financial side effects: lines 1083-1085
- sale-assisted conflict creates no order or financial side effects: lines 1129-1132
- existing approve regression still creates commission only after approval.

## Hard-Ban Scan

Scan over `apps/api/src` and `apps/api/prisma/schema.prisma` for mobile/customer attribution, payment webhook/reconciliation, coupon/discount, and attribution override terms returned no matches.
