# Tests Run

## Baseline

Command: `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts`  
Status: passed  
Summary: 2 suites, 14 tests.

## Implementation Verification

Command: `npm --prefix apps/api run prisma:generate`  
Status: passed  
Summary: Prisma Client generated after schema update.

Command: `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts`  
Status: passed  
Summary: 2 suites, 20 tests.

Command: `npm --prefix apps/api test -- --runInBand`  
Status: passed  
Summary: 13 suites, 60 tests.

Command: `npm --prefix apps/api run test:e2e -- --runInBand`  
Status: passed  
Summary: 1 suite, 1 test.

Command: `npm --prefix apps/api run build`  
Status: passed  
Summary: Nest build completed.

Command: `git status --short`  
Status: failed  
Summary: workspace is not a git repository.

## Notes

Dotenv printed injected-file counts and generic tips only. No secret values were copied into this report.
