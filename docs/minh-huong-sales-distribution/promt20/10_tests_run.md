# Tests Run

## Commands

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api run build` -> passed before focused tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` -> passed, 1 suite, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 20 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 14 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 33 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 152 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `npm --prefix apps/api run build` -> passed final build. One immediate prior retry attempt after e2e hit `EPERM: operation not permitted, rmdir 'apps/api/dist/src/health'`; rerun passed without code changes.
- `git status --short` -> failed because workspace is not a git repository.

## Non-Failing Warnings

Some DB-backed suites still emit the known `pg` deprecation warning:

```text
DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0.
```

The warning did not fail tests.
