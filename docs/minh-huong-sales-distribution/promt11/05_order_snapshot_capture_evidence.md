# Order Snapshot Capture Evidence

## Self-Service Orders

`createSelfServiceOrder` now fetches active packages with active entitlement rows and writes `ActivationOrder.entitlementSnapshotJson` at order creation.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:454`
- `apps/api/src/activation-orders/activation-orders.service.ts:480`
- `apps/api/src/activation-orders/activation-orders.service.ts:531`

Behavior:

- package identity is captured;
- package version is captured;
- entitlement rows are captured if present;
- packages with no entitlement rows still create valid snapshots;
- fallback hardcoded package path remains supported.

## Sale-Assisted Orders

`createOrder` resolves `packageCode` when possible and writes `ActivationOrder.entitlementSnapshotJson`.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:301`
- `apps/api/src/activation-orders/activation-orders.service.ts:306`
- `apps/api/src/activation-orders/activation-orders.service.ts:331`

Behavior:

- sold `amountVnd` comes from the sale order DTO;
- sold duration uses `requestedDurationDays` override when present;
- unresolved/custom packages receive deterministic `LEGACY_ORDER_FIELDS` fallback snapshot with `customPackage: true`.

## Tests

`package-entitlement-order-flow.spec.ts` covers:

- self-service snapshot capture;
- package with no entitlement rows;
- sale-assisted override amount/duration;
- custom unresolved fallback.
