# History Ordering And Shape Evidence

## Ordering

`apps/api/src/activation-orders/activation-orders.service.ts:145`

Rows are ordered by:

1. `createdAt ASC`
2. `id ASC`

The DB-backed fixture seeds two rows with the same timestamp and verifies stable id ordering:

- seed: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:693`
- assertion: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:165`

## Shape

The endpoint selects only:

- `id`
- `orderId`
- `fromStatus`
- `toStatus`
- `action`
- `actorUserId`
- `reason`
- `metadataJson`
- `createdAt`

## Lifecycle Coverage

Unit test `apps/api/src/activation-orders/activation-orders.service.spec.ts:274` covers all Prompt 12 action names in the read response:

- `CREATE_SELF_SERVICE`
- `CREATE_SALE_ASSISTED`
- `UPLOAD_PAYMENT_PROOF`
- `RESUBMIT`
- `APPROVE`
- `REJECT`
- `CANCEL`
- `REVOKE`

DB-backed test `apps/api/src/channel-finance/channel-scope.integration.spec.ts:149` confirms the same action set can be read through the scoped service path.

