# Tests Run

## Environment Setup

Local PostgreSQL was not initially listening on `localhost:5432`, so the repo portable PostgreSQL script was started:

```bash
powershell -ExecutionPolicy Bypass -File scripts\Start-LocalPostgres.ps1
```

Result: passed.

## Required Commands

| Command | Result |
| --- | --- |
| `npm --prefix apps/api run prisma:generate` | passed |
| `npm --prefix apps/api test -- --runInBand package-entitlement` | passed, 3 suites, 12 tests |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | passed, 2 suites, 22 tests |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` | passed, 2 suites, 21 tests |
| `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` | passed, 1 suite, 1 test |
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` | passed, 2 suites, 6 tests |
| `npm --prefix apps/api test -- --runInBand` | passed, 21 suites, 116 tests |
| `npm --prefix apps/api run test:e2e -- --runInBand` | passed, 3 suites, 7 tests |
| `npm --prefix apps/api run build` | passed |

## Environment Check

| Command | Result |
| --- | --- |
| `git status --short` | failed: `fatal: not a git repository (or any of the parent directories): .git` |

## Interim Failures

- First `package-entitlement` run failed because local PostgreSQL was not listening. Diagnostic `pg` returned `ECONNREFUSED`.
- Second `package-entitlement` run failed because the temp database name was truncated by PostgreSQL identifier length. The test DB prefix was shortened and final rerun passed.
- `docker ps` failed as a diagnostic because Docker Desktop Linux engine was not available; portable PostgreSQL was used instead.

## Notes

DB-backed channel tests still emit the existing non-failing `pg` deprecation warning.
