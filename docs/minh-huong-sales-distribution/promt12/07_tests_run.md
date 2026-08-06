# Tests Run

## Required Commands

| Command | Result |
| --- | --- |
| `npm --prefix apps/api run prisma:generate` | passed |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` | passed, 1 suite, 15 tests |
| `npm --prefix apps/api test -- --runInBand package-entitlement` | passed, 3 suites, 12 tests |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | passed, 2 suites, 27 tests |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` | passed, 2 suites, 21 tests |
| `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` | passed, 1 suite, 1 test |
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` | passed, 2 suites, 6 tests |
| `npm --prefix apps/api test -- --runInBand` | passed, 21 suites, 121 tests |
| `npm --prefix apps/api run test:e2e -- --runInBand` | passed, 3 suites, 7 tests |
| `npm --prefix apps/api run build` | passed |

## Environment Check

| Command | Result |
| --- | --- |
| `git status --short` | failed: `fatal: not a git repository (or any of the parent directories): .git` |

## Warnings

DB-backed channel scope suites still emit the existing non-failing `pg` deprecation warning:

`Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0.`

