# Subscription Snapshot Copy Evidence

## Approval

Approval now:

- parses existing `ActivationOrder.entitlementSnapshotJson`;
- copies it into `Subscription.entitlementSnapshotJson`;
- writes the same snapshot back to the approved order row;
- reconstructs deterministic fallback only when the legacy order snapshot is null.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:697`
- `apps/api/src/activation-orders/activation-orders.service.ts:702`
- `apps/api/src/activation-orders/activation-orders.service.ts:778`
- `apps/api/src/activation-orders/activation-orders.service.ts:816`

## Preserved Approval Contract

Prompt 4/6 behavior remains:

- optional idempotency key behavior unchanged;
- conditional status claim remains inside transaction;
- `providerRef` remains order id;
- `sourceOrderId` remains order id;
- `activationPackageId` remains resolved package id or null;
- renewal stacking still uses existing future subscription end.

## Tests

Coverage:

- order snapshot copied to subscription;
- package entitlement mutation after order creation does not mutate subscription snapshot;
- legacy null order snapshot gets fallback snapshot;
- activation order regressions still pass.
