# Explicit Idempotency Contract Design

## Decision

Use a general `IdempotencyRecord` table. Conditional status claims from Prompt 2 remain necessary, but they are not a complete API contract because clients cannot safely replay responses or detect mismatched retry payloads.

## Proposed Schema

### `IdempotencyRecord`

- `id`
- `scope`
- `key`
- `actorUserId` nullable
- `resourceType`
- `resourceId` nullable
- `requestHash`
- `status` (`IN_PROGRESS`, `SUCCEEDED`, `FAILED`)
- `responseJson` nullable
- `errorCode` nullable
- `expiresAt`
- `createdAt`
- `updatedAt`

Recommended unique index:

- `(scope, key)`

Why not `(scope, actorUserId, key)`:

- public self-service flows may not have an actor.
- scope can already include action and public identity boundary, for example `activation-order:self-service-create:emailHash`.

## Request Header

Recommended header: `Idempotency-Key`.

Rules:

- Required for public payment-sensitive actions after Prompt 4 adoption.
- Optional but supported during compatibility rollout.
- Must be 16 to 128 chars, printable safe charset.

## Actions To Cover

| Action | Scope example | Resource |
|---|---|---|
| self-service order create | `activation-order:self-service-create:{emailHash}` | order id after success |
| sale-assisted order create | `activation-order:sale-create:{actorUserId}` | order id |
| payment proof upload | `activation-order:proof:{orderId}:{emailHash}` | order id |
| approve order | `activation-order:approve:{orderId}` | order id |
| reject order | `activation-order:reject:{orderId}` | order id |
| cancel order | `activation-order:cancel:{orderId}` | order id |
| revoke order | `activation-order:revoke:{orderId}` | order id |
| payout request | `payout:create:{participantId}` | payout id |
| payout pay | `payout:pay:{payoutId}` | payout id |
| payout reject | `payout:reject:{payoutId}` | payout id |

## Request Hash

Hash must include:

- HTTP method and route action.
- normalized DTO body.
- stable file metadata for upload actions: original name, mime type, size, storage key after upload if available.
- actor id or public identity boundary.

Do not hash raw file bytes in the request path unless storage architecture already makes it cheap. File storage checksum can be added later.

## TTL

- create order: 48 hours, aligned with current duplicate window.
- proof upload: 7 days.
- approve/reject/cancel/revoke: 30 days.
- payout create/pay/reject: 30 days.
- failed records: 24 hours unless error is a stable validation error worth replaying.

## Runtime Semantics

1. Begin transaction or use an insert-first helper.
2. Try to create `IdempotencyRecord` with `IN_PROGRESS`.
3. If unique conflict:
   - same `requestHash` + `SUCCEEDED`: replay `responseJson`.
   - same `requestHash` + `IN_PROGRESS`: return 409 `IDEMPOTENCY_IN_PROGRESS`.
   - same key + different `requestHash`: return 409 `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`.
   - expired: allow a new record only after archival/delete policy, or return 409 with explicit expired message in first implementation.
4. Execute business transaction.
5. Store `resourceId`, `responseJson`, `SUCCEEDED`.
6. On business validation failure before side effects, mark `FAILED` only if response replay is desired. Otherwise delete the record and return error.

## Race Handling

- Idempotency record prevents duplicate same-key execution.
- Conditional status claims still protect against two different keys racing on the same order/payout.
- For approve and payout review, keep Prompt 2 `updateMany` status claim in the same business transaction.

## Error Semantics

- duplicate same payload after success: 200/201 replay with header `Idempotency-Replayed: true`.
- duplicate same payload while in progress: 409.
- duplicate different payload: 409.
- expired key: 409 in first implementation; later allow purge and reuse only after clear product decision.
- failed previous request: return original stable error if stored; otherwise allow retry only if no side effects occurred.

## Prompt 4 First Slice

Implement only:

- `approve order`.
- `payout pay`.
- `payout reject`.

Reason: Prompt 2 found P0 duplicate side-effect risk there, and conditional claims already exist. Adding explicit records around these actions gives replay semantics without widening public create/proof behavior immediately.
