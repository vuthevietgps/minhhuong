# Tests Run

## Required Commands

| Command | Status | Summary |
| --- | --- | --- |
| `npm --prefix apps/api run prisma:generate` | passed | Prisma Client generated successfully after schema change. |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | passed | 2 suites, 22 tests. |
| `npm --prefix apps/api test -- --runInBand` | passed on final run | 14 suites, 81 tests. An earlier run of the same command failed in `learning.service.spec.ts`, then the isolated learning spec and the full unit suite passed without source changes after that failure. |
| `npm --prefix apps/api run test:e2e -- --runInBand` | passed | 1 suite, 1 test. |
| `npm --prefix apps/api run build` | passed | Nest build completed. |
| `git status --short` | failed | `fatal: not a git repository (or any of the parent directories): .git` |

## Additional Targeted Commands

| Command | Status | Summary |
| --- | --- | --- |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts` | passed | 1 suite, 7 tests. |
| `npm --prefix apps/api test -- --runInBand learning.service.spec.ts` | passed | 1 suite, 12 tests. |

## Note On Initial Full Unit Failure

The first full-unit attempt reported `this.learningPath.assertLessonAvailableForChild is not a function` from `learning.service.spec.ts`. The current file already includes that mock method, and the isolated learning spec plus a repeated full-unit run passed without any code changes after the failure. This is recorded as a residual test-run anomaly, not as an open source failure.

