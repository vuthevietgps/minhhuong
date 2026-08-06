# Tests Run

## Required Commands

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api run build` -> passed.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` -> passed, 1 suite, 27 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 39 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 25 tests. Known non-failing `pg` deprecation warning emitted.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 19 tests. Known non-failing `pg` deprecation warning emitted.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests. Known non-failing `pg` deprecation warning emitted.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 163 tests. Known non-failing `pg` deprecation warning emitted.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `npm --prefix apps/api run build` -> passed.
- `git status --short` -> failed: `fatal: not a git repository (or any of the parent directories): .git`.

## Formatting

- `npx --prefix apps/api prettier --write apps/api/src/activation-orders/activation-orders.service.ts apps/api/src/activation-orders/activation-orders.service.spec.ts`
- `npx --prefix apps/api prisma format --schema apps/api/prisma/schema.prisma`
