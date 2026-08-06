# Order Status History Design

## Purpose

`OrderStatusHistory` reconstructs the lifecycle of one activation order. `AuditLog` remains a generic system audit trail. They are related but not interchangeable.

## Proposed Schema

### `OrderStatusHistory`

- `id`
- `orderId` -> `ActivationOrder.id`
- `fromStatus` nullable `ActivationOrderStatus`
- `toStatus` `ActivationOrderStatus`
- `action`
- `actorUserId` nullable -> `User.id`
- `reason` nullable text
- `metadataJson` nullable JSON
- `createdAt`

Recommended indexes:

- `(orderId, createdAt)`
- `(action, createdAt)`
- `(actorUserId, createdAt)`

Recommended action enum or string constants:

- `CREATE_SELF_SERVICE`
- `CREATE_SALE_ASSISTED`
- `UPLOAD_PAYMENT_PROOF`
- `RESUBMIT`
- `APPROVE`
- `REJECT`
- `CANCEL`
- `REVOKE`
- `REFUND`
- `ADMIN_OVERRIDE`

## Lifecycle Events

| Event | From | To | Actor | Required metadata |
|---|---|---|---|---|
| self-service create | null | `WAITING_PAYMENT` | public/null or parent user | package, amount, transfer content |
| sale-assisted create | null | `PENDING_REVIEW` | creator | package/custom amount, channel participant |
| proof upload | `WAITING_PAYMENT` or `PENDING_REVIEW` | `PENDING_REVIEW` | public/null or parent user | proof file metadata, email hash only if needed |
| resubmit | `REJECTED` | `PENDING_REVIEW` | creator or owner | invoice metadata, reason |
| approve | `PENDING_REVIEW` | `APPROVED` | operations/admin | operation invoice, duration, subscription id |
| reject | `WAITING_PAYMENT`/`PENDING_REVIEW` | `REJECTED` | operations/admin | reason |
| cancel | `WAITING_PAYMENT`/`PENDING_REVIEW`/`REJECTED` | `CANCELED` | owner/manager/admin | reason |
| revoke | `APPROVED` | `REVOKED` | operations/admin | reason, subscription ids, commission reversal summary |
| refund future | any paid state | refund state or event | operations/admin | payment/ledger refs |
| admin override future | any | any | admin | required reason and before/after |

## Relation To `AuditLog`

- `OrderStatusHistory` is domain-specific and queryable by order lifecycle.
- `AuditLog` is system-wide and can store broader metadata such as IP/user-agent/action.
- Prompt 4 should write both for high-value actions where `AuditLog` already exists, but status history must be authoritative for status reconstruction.

## Write Contract

- Create history row in the same transaction as the status change.
- If a conditional status claim fails, no history row is written.
- For create actions, write history in the same transaction as order create if implementation is refactored; otherwise immediately after create with retry-safe handling.
- Use idempotency record response replay to avoid duplicate history on retried requests.

## Acceptance Criteria

- Every new activation order has exactly one initial history row.
- Every status change has exactly one history row.
- Repeated approve/pay style stale retries do not create duplicate history.
- History rows preserve actor and reason.
- Current order status equals the last history row `toStatus`.

## Prompt 4 Test Plan

- create self-service writes `CREATE_SELF_SERVICE`.
- create sale-assisted writes `CREATE_SALE_ASSISTED`.
- upload proof writes `UPLOAD_PAYMENT_PROOF`.
- approve writes `APPROVE` in same transaction as side effects.
- reject/cancel/revoke write their actions.
- failed stale approve writes no duplicate history.
- admin/order detail can include history later, but UI is not required in the first slice.
