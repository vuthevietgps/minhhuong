# Tests Run

## Environment Note

The first DB-backed focused run failed before tests executed because Postgres was not accepting connections:

```text
ECONNREFUSED
```

Docker Desktop was started, `minhhuong-postgres` became healthy, and the same DB-backed tests passed on rerun.

## Commands

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api run build` -> passed before focused tests and final.
- `npm --prefix apps/api test -- --runInBand channel-affiliate` -> passed, 2 suites, 23 tests.
- `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` -> passed, 1 suite, 17 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 33 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 23 suites, 155 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 5 suites, 12 tests.
- `npm --prefix apps/api run build` -> passed final build.
- `git status --short` -> failed because this workspace is not a git repository.

## Non-Failing Warning

DB-backed suites still emit the known `pg` deprecation warning:

```text
DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0.
```
