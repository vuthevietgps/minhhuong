# Tests Run

| Command | Result | Summary |
| --- | --- | --- |
| `npm --prefix apps/api run prisma:generate` | passed | Prisma Client generated. |
| `npm --prefix apps/api run build` | passed | Early TypeScript/build check passed. |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` | passed | 1 suite, 21 tests. |
| `npm --prefix apps/api test -- --runInBand channel-affiliate` | passed | 2 suites, 17 tests. |
| `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` | passed | 1 suite, 11 tests. |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | passed | 2 suites, 33 tests. |
| `npm --prefix apps/api test -- --runInBand package-entitlement` | passed | 3 suites, 12 tests. |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` | passed | 2 suites, 21 tests. |
| `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` | passed | 1 suite, 1 test. |
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` | passed | 2 suites, 7 tests. |
| `npm --prefix apps/api test -- --runInBand` | passed | 23 suites, 149 tests. |
| `npm --prefix apps/api run test:e2e -- --runInBand` | passed | 5 suites, 12 tests. |
| `npm --prefix apps/api run build` | passed | Final Nest build completed. |
| `git status --short` | failed | `fatal: not a git repository (or any of the parent directories): .git` |

## Notes

DB-backed suites still emit the known non-failing `pg` deprecation warning:

```text
DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0.
```

This warning existed in prior accepted baselines and did not fail any suite.
