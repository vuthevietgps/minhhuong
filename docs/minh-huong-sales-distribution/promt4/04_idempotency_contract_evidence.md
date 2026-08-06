# Idempotency Contract Evidence

## Helper

File: `apps/api/src/commercial-idempotency.ts`

- `:7` validates optional key format.
- `:19` builds stable request hash.
- `:27` converts response to JSON-safe value.
- `:31` resolves existing records into replay or conflict.

## Schema

- `IdempotencyRecordStatus`: `apps/api/prisma/schema.prisma:162`.
- `IdempotencyRecord`: `apps/api/prisma/schema.prisma:827`.
- Unique `(scope, key)`: migration `:48`.

## Runtime Semantics Implemented

- absent key: old behavior, Prompt 2 conditional claims still apply.
- same key + same request hash + `SUCCEEDED`: replay stored response.
- same key + different request hash: `ConflictException`.
- same key + `IN_PROGRESS`: `ConflictException`.
- expired key: `ConflictException`.

## Applied Actions

- approve activation order: `activation-orders.service.ts:546`, `:558`, `:654`, `:757`.
- payout pay: `channel-finance.service.ts:698`, `:710`, `:741`, `:808`.
- payout reject: `channel-finance.service.ts:835`, `:846`, `:877`, `:925`.
