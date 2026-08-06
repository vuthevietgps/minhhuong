# Tests Run

## Baseline Before Changes

Command: `git status --short`  
Result: failed  
Summary: `fatal: not a git repository (or any of the parent directories): .git`

Command: `npm --prefix apps/api test -- --runInBand`  
Result: passed  
Summary: 6 suites, 20 tests.

Command: `npm --prefix apps/api run test:e2e -- --runInBand`  
Result: passed  
Summary: 1 suite, 1 test.

## After Changes

Command: `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts`  
Result: passed  
Summary: 2 suites, 14 tests.

Command: `npm --prefix apps/api test -- --runInBand`  
Result: passed  
Summary: 8 suites, 34 tests.

Command: `npm --prefix apps/api run test:e2e -- --runInBand`  
Result: passed  
Summary: 1 suite, 1 test.

Command: `npm --prefix apps/api run build`  
Result: passed  
Summary: Nest build completed.

## Notes

Dotenv printed only injected-file counts and generic tips during tests. No secret values were copied into this report.
