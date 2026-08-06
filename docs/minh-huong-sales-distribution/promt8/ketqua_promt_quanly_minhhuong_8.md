# Prompt 8 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: blocker-fix / test-hardening / migration-history reconciliation  
Verdict: CONDITIONAL

## Scope Implemented

Reconciled the migration-deploy path for the commercial channel scope foundation.

Changes:

- added migration `apps/api/prisma/migrations/20260614170000_reconcile_channel_scope_history/migration.sql`;
- changed the DB-backed channel scope integration harness to use `prisma migrate deploy`, not `prisma db push`;
- added DB assertions proving migration-created schema has the required channel scope enum values, columns, indexes, and self-FK;
- verified the Prompt 7 sibling subtree scope fixture still seeds and passes against a migration-created PostgreSQL database.

No product service/controller behavior was changed.

## Migration Reconciled

The reconciliation migration adds:

- `ChannelParticipantType` enum values `DIRECTOR` and `MANAGER`;
- `ChannelParticipant.parentParticipantId`;
- `ChannelParticipant.rootParticipantId`;
- `ChannelParticipant.lineage`;
- `ChannelParticipant.depth`;
- indexes on `parentParticipantId`, `rootParticipantId`, and `lineage`;
- guarded self-FK `ChannelParticipant_parentParticipantId_fkey`;
- `CommissionEarning.depth`;
- `CommissionEarning.availableAt`;
- `CommissionEarning.releasedAt`;
- index `CommissionEarning_status_availableAt_idx`;
- current-schema default for `CommissionEarning.status`;
- `ActivationOrder.trialEndsAt`;
- index `ActivationOrder_trialEndsAt_idx`.

Legacy channel participants receive deterministic lineage/root/depth backfill. Rows with no parent become their own root with lineage `/<id>/` and depth `0`. No fuzzy data matching was introduced.

## Migration Deploy Proof

The DB-backed scope test now runs:

```text
prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

Evidence in test harness:

- `apps/api/src/channel-finance/channel-scope.integration.spec.ts:51-65`
- schema assertion call: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:75`
- schema assertion implementation: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:264-334`

Additional standalone smoke proof created a temp database with `migrate deploy` and confirmed:

- migration `20260614170000_reconcile_channel_scope_history` finished;
- required columns exist;
- enum values include `SALE`, `AGENCY`, `DIRECTOR`, `MANAGER`;
- required indexes exist.

## Conditional Reason

Prompt 8 is marked `CONDITIONAL` because channel-admin DB-backed scope tests remain deferred. The migration-deploy blocker itself is fixed and passing.

## Tests

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts` -> passed, 1 suite, 3 tests, using `migrate deploy`.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 22 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts` -> passed, 1 suite, 7 tests.
- `npm --prefix apps/api test -- --runInBand learning.service.spec.ts` -> passed, 1 suite, 12 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed on final run, 15 suites, 84 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 2 suites, 4 tests.
- `npm --prefix apps/api run build` -> passed on final run.
- `git status --short` -> failed because workspace is not a git repository.

## Hard-Ban Check

No affiliate/QR, payment gateway/webhook/reconciliation, package entitlement/snapshot, entitlement enforcement, commission policy engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad model rename, or broad commercial architecture rewrite was implemented.

## Recommended Prompt 9

DB-backed channel-admin scope tests:

- participant list subtree visibility;
- agency list subtree visibility;
- user list subtree visibility;
- sibling or non-descendant action rejection.

Affiliate/QR remains blocked until channel-admin scope is covered.

