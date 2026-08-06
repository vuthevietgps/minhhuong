# Idempotency And Duplicate History Evidence

## Approval Idempotency Preserved

Prompt 12 did not broaden idempotency to all lifecycle actions.

Existing approval idempotency remains covered:

- Same idempotency key replay does not duplicate payment/subscription/commission/history side effects: `apps/api/src/activation-orders/activation-orders.service.spec.ts:488`.
- Same idempotency key with different payload is rejected before transaction/history: `apps/api/src/activation-orders/activation-orders.service.spec.ts:542`.
- Stale repeated approval claim writes only one `APPROVE` history row: `apps/api/src/activation-orders/activation-orders.service.spec.ts:756`.

## Failed Claims Do Not Write History

Prompt 12 adds explicit stale-claim coverage for reject:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:893` verifies `updateMany` returning `count = 0` throws and does not call `orderStatusHistory.create`.

## No Broad Idempotency Expansion

Non-approval lifecycle actions do not receive new idempotency keys. The protection added here is transaction-bound stale status claiming, not broad duplicate request deduplication.

