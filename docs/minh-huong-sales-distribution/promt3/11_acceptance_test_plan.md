# Acceptance Test Plan

## Regression Tests To Keep

Prompt 2 tests must remain green:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
- `apps/api/src/channel-finance/channel-finance.service.spec.ts`

Commands:

- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts`
- `npm --prefix apps/api test -- --runInBand`
- `npm --prefix apps/api run test:e2e -- --runInBand`

## Unit Tests

Order status history:

- status action builder maps from/to/action metadata.
- failed conditional claim does not create history.

Idempotency:

- same key and same hash returns replay.
- same key and different hash returns conflict.
- in-progress returns conflict.
- expired key behavior matches contract.

Package entitlement:

- entitlement snapshot builder includes package fields and entitlement rows.
- legacy fallback snapshot is deterministic.

Commission policy:

- current hardcoded equivalent version produces current depth rates.
- earning snapshot payload is stable.

## Service Integration Tests

Activation orders:

- create self-service writes initial history.
- proof upload writes history.
- approve writes history, idempotency record, payment, subscription, wallet, commission.
- repeated approve same idempotency key replays response.
- repeated approve different key fails without side effects.
- reject/cancel/revoke write history.

Channel finance:

- payout pay writes idempotency record and status history if payout history is added.
- payout reject same.
- repeated same key replays response.
- terminal status transitions remain blocked.

Learning:

- active legacy subscription still grants access.
- active traced subscription grants access.
- entitlement snapshot helper returns expected values.

## DB-Backed Tests

Channel scope:

- seed sibling subtrees.
- verify order/report/wallet/payout/CSV scope.
- verify admin/operations global.
- verify empty participant no-data filters.

Migration/backfill:

- legacy subscription with `providerRef` matching order gets `sourceOrderId`.
- legacy order gets reconstructed entitlement snapshot.
- existing commission earnings remain valid with null policy version.

## PASS Criteria

- No Prompt 2 regression.
- New migration tests pass.
- New status/idempotency tests prove no duplicate side effects.
- Legacy rows remain readable.
- JSON snapshot shapes are deterministic.

## FAIL Criteria

- Any Prompt 2 commercial P0 test fails.
- Migration/backfill loses subscription access.
- Same idempotency key with different payload is accepted.
- Any sibling subtree row leaks in DB-backed scope tests.
