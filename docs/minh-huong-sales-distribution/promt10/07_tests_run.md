# Tests Run

## Required Commands

| Command | Result |
| --- | --- |
| `npm --prefix apps/api run prisma:generate` | passed |
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts` | passed, 1 suite, 3 tests |
| `npm --prefix apps/api test -- --runInBand channel-admin-scope.integration.spec.ts` | passed, 1 suite, 3 tests |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | passed, 2 suites, 22 tests |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts` | passed, 1 suite, 7 tests |
| `npm --prefix apps/api test -- --runInBand learning.service.spec.ts` | passed, 1 suite, 13 tests |
| `npm --prefix apps/api test -- --runInBand` | passed, 18 suites, 100 tests |
| `npm --prefix apps/api run test:e2e -- --runInBand` | passed, 3 suites, 7 tests |
| `npm --prefix apps/api run build` | passed |

## Direct Constraint Proof

| Command | Result |
| --- | --- |
| `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` | passed, 1 suite, 1 test |

## Environment Check

| Command | Result |
| --- | --- |
| `git status --short` | failed: `fatal: not a git repository (or any of the parent directories): .git` |

## Notes

The DB-backed channel-admin/full Jest runs emit a non-failing `pg` package deprecation warning about SASL/SCRAM API usage. The warning does not fail the tests.
