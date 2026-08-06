# Current History Contract Inventory

## Model

`OrderStatusHistory` already exists in `apps/api/prisma/schema.prisma` with:

- `orderId`
- nullable `fromStatus`
- required `toStatus`
- string `action`
- nullable `actorUserId`
- nullable `reason`
- nullable `metadataJson`
- `createdAt`

Indexes remain:

- `[orderId, createdAt]`
- `[action, createdAt]`
- `[actorUserId, createdAt]`

## Lifecycle Actions After Prompt 12

| Action | From | To | Write style |
| --- | --- | --- | --- |
| `CREATE_SELF_SERVICE` | `null` | `WAITING_PAYMENT` | nested `statusHistory.create` in order create |
| `CREATE_SALE_ASSISTED` | `null` | `PENDING_REVIEW` | nested `statusHistory.create` in order create |
| `UPLOAD_PAYMENT_PROOF` | `WAITING_PAYMENT` or `PENDING_REVIEW` | `PENDING_REVIEW` | transaction-bound after status claim |
| `RESUBMIT` | `REJECTED` | `PENDING_REVIEW` | transaction-bound after status claim |
| `APPROVE` | `PENDING_REVIEW` | `APPROVED` | existing transaction-bound history retained |
| `REJECT` | `WAITING_PAYMENT` or `PENDING_REVIEW` | `REJECTED` | transaction-bound after status claim |
| `CANCEL` | `WAITING_PAYMENT`, `PENDING_REVIEW`, or `REJECTED` | `CANCELED` | transaction-bound after status claim |
| `REVOKE` | `APPROVED` | `REVOKED` | transaction-bound after status claim |

## No Backfill

Historical orders that predate Prompt 12 were not backfilled. The absence of lifecycle rows for older orders remains readable and expected.

