# Bugs Found And Fixes

## Scope Leaks

No product scope leak was found in the tested surfaces:

- activation order list;
- finance overview/report;
- wallet/ledger;
- payout list;
- orders CSV export;
- admin/operations global scope;
- empty participant scope.

No product code fix was required for these tested surfaces.

## Test Harness Issues Fixed

### Prisma CLI Invocation

Initial local harness attempts using `npx.cmd` from Jest were unreliable in this Windows environment.

Fix: invoke the local Prisma CLI through `process.execPath` and `apps/api/node_modules/prisma/build/index.js`.

Evidence: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:51-65`

### Database Isolation

Schema/search_path isolation was not reliable enough with the Prisma PostgreSQL adapter for this DB-backed proof.

Fix: create a dedicated PostgreSQL database per test run and drop it afterward.

Evidence:

- creation: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:41-48`
- current database assertion: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:71-74`
- drop: `apps/api/src/channel-finance/channel-scope.integration.spec.ts:86-93`

## Migration History Gap

Current Prisma schema contains channel hierarchy fields used by the commercial scope filters, but migration SQL history does not contain those fields.

Prompt 7 did not add a migration fix because this prompt was scoped to DB-backed scope tests. The gap is documented and escalated as the recommended next blocker-fix.

