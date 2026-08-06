# Tests Run

Date: 2026-06-14

| Command | Result | Summary |
|---|---|---|
| `npm --prefix apps/api run prisma:generate` | PASS ON FINAL RERUN | Prisma Client generated successfully. One earlier run failed and is documented below. |
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts` | PASS | 1 suite, 3 tests. |
| `npm --prefix apps/api test -- --runInBand channel-admin-scope.integration.spec.ts` | PASS | 1 suite, 3 tests. Uses `migrate deploy`. |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | PASS | 2 suites, 22 tests. |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts` | PASS | 1 suite, 7 tests. |
| `npm --prefix apps/api test -- --runInBand learning.service.spec.ts` | PASS | 1 suite, 12 tests. |
| `npm --prefix apps/api test -- --runInBand` | PASS | 16 suites, 87 tests. |
| `npm --prefix apps/api run test:e2e -- --runInBand` | PASS | 2 suites, 4 tests. |
| `npm --prefix apps/api run build` | PASS | Nest build completed. |
| `git status --short` | FAIL / ENV | `fatal: not a git repository (or any of the parent directories): .git` |

## Interim Anomaly

An initial `npm --prefix apps/api run prisma:generate` failed once with:

```text
P1012: DailyLearningPlanItem.activity relation field reported missing an opposite relation field on Activity.
```

No source was changed to address that error. `Activity.dailyPlanItems` was already present in schema, `prisma validate` passed from `apps/api`, and the same required command later passed.

This is why Prompt 9 is marked `CONDITIONAL` rather than PASS.

## Warnings

The DB-backed channel-admin spec and full suite emitted a `pg` deprecation warning:

```text
Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0.
```

It did not fail tests. It appears during the DB-backed service calls using the current Prisma PostgreSQL adapter path.

