# Payout And Scope Test Evidence

## Payout Ledger Workflow

Evidence:

- `apps/api/src/channel-finance/channel-finance.service.spec.ts:137` payout request creates HOLD ledger.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts:180` pay creates RELEASE + DEBIT.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts:244` reject creates RELEASE.

Source under test:

- `apps/api/src/channel-finance/channel-finance.service.ts:631`
- `apps/api/src/channel-finance/channel-finance.service.ts:678`
- `apps/api/src/channel-finance/channel-finance.service.ts:754`

## Payout Idempotency And Terminal Guards

Evidence:

- `apps/api/src/channel-finance/channel-finance.service.spec.ts:222` repeated pay does not double-write RELEASE/DEBIT.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts:281` repeated reject does not double-write RELEASE.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts:306` pay after rejected and reject after paid are blocked before ledger writes.

Fix evidence:

- `apps/api/src/channel-finance/channel-finance.service.ts:702` conditional pay claim.
- `apps/api/src/channel-finance/channel-finance.service.ts:729` RELEASE ledger.
- `apps/api/src/channel-finance/channel-finance.service.ts:740` DEBIT ledger.
- `apps/api/src/channel-finance/channel-finance.service.ts:773` conditional reject claim.
- `apps/api/src/channel-finance/channel-finance.service.ts:793` reject RELEASE ledger.

## Channel Scope

Evidence:

- `apps/api/src/channel-finance/channel-finance.service.spec.ts:330` checks non-admin scope uses actor participant lineage and own `createdById`.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts:360` checks non-admin without channel participant receives no-data filters.

Source under test:

- `apps/api/src/channel-finance/channel-finance.service.ts:986`
- `apps/api/src/channel-finance/channel-finance.service.ts:1008`
- `apps/api/src/channel-finance/channel-finance.service.ts:1012`
- `apps/api/src/channel-finance/channel-finance.service.ts:1021`
- `apps/api/src/channel-finance/channel-finance.service.ts:1024`

Remaining scope gap: this is service-level scope-shape coverage, not a DB-backed sibling/director/agency/manager matrix.
