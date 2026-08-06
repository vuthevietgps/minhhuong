# Backfill Or Legacy Fallback Evidence

## Migration Backfill

Prompt 11 includes deterministic direct backfill.

Activation orders:

- if exact `ActivationPackage.code` matches `ActivationOrder.packageCode`, use package id/code/name/version plus order amount/duration;
- if no package matches, use order fields and `customPackage: true`;
- historical entitlement arrays are empty because current entitlement rows may not represent what was sold in the past.

Subscriptions:

- copy snapshot by `sourceOrderId`;
- copy snapshot by direct `providerRef = ActivationOrder.id`;
- no fuzzy fallback for unmatched subscriptions.

Evidence:

- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:43`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:63`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:80`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:87`

## Runtime Fallback

For a legacy pending order whose snapshot is still null at approval, approval reconstructs a `LEGACY_ORDER_FIELDS` snapshot from order/package fields and writes it into the subscription.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:702`

## Safety

No fuzzy matching by email, phone, child, name, price, date, or user names was introduced.
