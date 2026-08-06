# Tests Run

Date: 2026-06-14

| Command | Result | Summary |
|---|---|---|
| `npm --prefix apps/api run prisma:generate` | PASS | Prisma Client generated successfully. |
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts` | PASS | 1 suite, 3 tests. Final harness uses `prisma migrate deploy`. |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | PASS | 2 suites, 22 tests. |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts` | PASS | 1 suite, 7 tests. |
| `npm --prefix apps/api test -- --runInBand learning.service.spec.ts` | PASS | 1 suite, 12 tests. |
| `npm --prefix apps/api test -- --runInBand` | PASS | Final run passed: 15 suites, 84 tests. |
| `npm --prefix apps/api run test:e2e -- --runInBand` | PASS | 2 suites, 4 tests. |
| `npm --prefix apps/api run build` | PASS | Final build passed. |
| standalone migrate deploy temp DB smoke proof | PASS | Reconciliation migration applied and required columns/enum/indexes were verified. |
| `git status --short` | FAIL / ENV | `fatal: not a git repository (or any of the parent directories): .git` |

## Interim Failure Fixed

An interim run of:

```text
npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts
```

failed with:

```text
The column ActivationOrder.trialEndsAt does not exist in the current database.
```

Cause: `ActivationOrder.trialEndsAt` was present in current Prisma schema and selected by Prisma Client, but absent from migration SQL history.

Fix: added `ActivationOrder.trialEndsAt` and `ActivationOrder_trialEndsAt_idx` to the reconciliation migration, then reran the direct DB-backed spec successfully.

