# Payout Idempotency Evidence

## Pay

Service evidence:

- request hash and existing replay check: `apps/api/src/channel-finance/channel-finance.service.ts:698`.
- idempotency record create: `apps/api/src/channel-finance/channel-finance.service.ts:741`.
- idempotency record success update: `apps/api/src/channel-finance/channel-finance.service.ts:808`.

Tests:

- same-key replay without duplicate RELEASE/DEBIT: `apps/api/src/channel-finance/channel-finance.service.spec.ts:254`.
- same-key different payload conflict: `apps/api/src/channel-finance/channel-finance.service.spec.ts:292`.
- stale no-key/different-key guard from Prompt 2 remains covered by `:222`.

## Reject

Service evidence:

- request hash and existing replay check: `apps/api/src/channel-finance/channel-finance.service.ts:835`.
- idempotency record create: `apps/api/src/channel-finance/channel-finance.service.ts:877`.
- idempotency record success update: `apps/api/src/channel-finance/channel-finance.service.ts:925`.

Tests:

- same-key replay without duplicate RELEASE: `apps/api/src/channel-finance/channel-finance.service.spec.ts:377`.
- same-key different payload conflict: `apps/api/src/channel-finance/channel-finance.service.spec.ts:415`.
- repeated no-key/different-key reject guard from Prompt 2 remains covered by `:337`.

## Payout Status History

Not implemented in Prompt 4. The prompt's new status-history model is `OrderStatusHistory` for activation orders. Payout idempotency is implemented; payout lifecycle history remains a later design decision.
