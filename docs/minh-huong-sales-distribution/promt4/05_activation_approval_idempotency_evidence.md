# Activation Approval Idempotency Evidence

## Service

- request hash and existing replay check: `apps/api/src/activation-orders/activation-orders.service.ts:546`.
- idempotency record create: `apps/api/src/activation-orders/activation-orders.service.ts:654`.
- order status claim remains inside transaction.
- order history create: `apps/api/src/activation-orders/activation-orders.service.ts:734`.
- idempotency record success update: `apps/api/src/activation-orders/activation-orders.service.ts:757`.

## Controller

- optional `Idempotency-Key` header passed at `apps/api/src/activation-orders/activation-orders.controller.ts:130`.

## Tests

- approval writes `APPROVE` history: `apps/api/src/activation-orders/activation-orders.service.spec.ts:374`.
- same-key replay without duplicate side effects/history: `apps/api/src/activation-orders/activation-orders.service.spec.ts:388`.
- same-key different payload conflict: `apps/api/src/activation-orders/activation-orders.service.spec.ts:433`.
- stale repeated approval still creates no duplicate history: `apps/api/src/activation-orders/activation-orders.service.spec.ts:671`.
