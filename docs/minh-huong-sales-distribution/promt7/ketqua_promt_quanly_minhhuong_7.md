# Prompt 7 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: test-hardening / implementation-narrow-slice  
Verdict: CONDITIONAL

## Scope Implemented

Added DB-backed commercial channel scope integration coverage in `apps/api/src/channel-finance/channel-scope.integration.spec.ts`.

The new spec:

- creates an isolated PostgreSQL database per run;
- pushes the current Prisma schema into that temp database;
- asserts the test is connected to the temp database;
- seeds the required director/manager/agency/sale A/B channel tree;
- seeds sibling activation orders, commission earnings, ledger entries, and payout requests;
- tests activation-order visibility for sale, manager, director, admin, operations, and unscoped users;
- tests channel finance report, overview, wallet/ledger, payout list, and CSV export visibility by subtree;
- tests admin/operations global finance visibility and empty participant safety.

No product source code was changed for Prompt 7.

## Conditional Reason

Prompt 7 is marked `CONDITIONAL` for two documented reasons:

- Channel-admin participant/agency/user DB-backed scope tests were not added in this slice, although service seams exist and should be covered next.
- The DB pre-audit exposed Prisma migration history drift: current `schema.prisma` contains channel hierarchy fields used by scope filters, but the migration directory does not contain corresponding SQL for those fields. The Prompt 7 test harness therefore uses `prisma db push` against a disposable temp database to prove current-code behavior without pretending `migrate deploy` is already reliable.

Core activation-order, finance overview/report, wallet, payout, CSV, admin/ops, and unscoped scope claims are DB-backed and passing.

## Tests

- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts` -> passed, 1 suite, 3 tests.
- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 22 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts` -> passed, 1 suite, 7 tests.
- `npm --prefix apps/api test -- --runInBand learning.service.spec.ts` -> passed, 1 suite, 12 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 15 suites, 84 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api run build` -> passed.
- `git status --short` -> failed because workspace is not a git repository.

## Hard-Ban Check

No affiliate/QR, payment gateway/webhook/reconciliation, package entitlement/snapshot, entitlement enforcement, commission policy engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad model rename, or broad commercial architecture rewrite was implemented.

## Recommended Prompt 8

Reconcile Prisma migration history for the channel hierarchy fields used by commercial scope filters, then rerun the DB-backed scope harness using migration deployment semantics. Channel-admin DB-backed scope tests should follow after migration history is reliable.

