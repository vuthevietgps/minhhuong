# Commission Test Evidence

## Pending Commission Creation

Evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:362`

Covered behavior:

- Commission is created only during operations approval.
- Closer receives depth 0 pending commission.
- Active upline receives depth 1 pending commission.

Source under test:

- `apps/api/src/activation-orders/activation-orders.service.ts:1190`
- `apps/api/src/activation-orders/activation-orders.service.ts:1228`

## Release Idempotency

Evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:483`

Covered behavior:

- First release updates due pending earning to available and creates one CREDIT ledger entry.
- Second stale release attempt with `updateMany.count = 0` creates no second CREDIT.
- Release result now reports `released: 0` for the second stale attempt.

Fix evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:1417`
- `apps/api/src/activation-orders/activation-orders.service.ts:1418`
- `apps/api/src/activation-orders/activation-orders.service.ts:1427`
- `apps/api/src/activation-orders/activation-orders.service.ts:1435`
- `apps/api/src/activation-orders/activation-orders.service.ts:1444`

## Canceled Source Order

Evidence: `apps/api/src/activation-orders/activation-orders.service.spec.ts:577`

Covered behavior:

- If the source order is no longer `APPROVED`, due pending commission is canceled.
- No CREDIT ledger entry is written.
