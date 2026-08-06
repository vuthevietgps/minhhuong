# Tests Run

Date: 2026-06-14

| Command | Result | Summary |
|---|---|---|
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts` | PASS | 1 suite, 3 tests. |
| `npm --prefix apps/api run prisma:generate` | PASS | Prisma Client generated successfully. |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | PASS | 2 suites, 22 tests. |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts` | PASS | 1 suite, 7 tests. |
| `npm --prefix apps/api test -- --runInBand learning.service.spec.ts` | PASS | 1 suite, 12 tests. |
| `npm --prefix apps/api test -- --runInBand` | PASS | 15 suites, 84 tests. |
| `npm --prefix apps/api run test:e2e -- --runInBand` | PASS | 1 suite, 1 test. |
| `npm --prefix apps/api run build` | PASS | Nest build completed. |
| `git status --short` | FAIL / ENV | `fatal: not a git repository (or any of the parent directories): .git` |

## Notes

The new DB-backed integration test file was run directly before the full regression commands.

No source changes were made after the passing regression/build runs except this result packet.

