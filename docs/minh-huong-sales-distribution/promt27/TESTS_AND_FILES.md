# Tests And Files

## Commands Run

| Command | Result |
| --- | --- |
| `npm --prefix apps/api run prisma:generate` | passed |
| `npm --prefix apps/api run build` | passed |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` | passed, 1 suite, 27 tests |
| `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` | passed, 2 suites, 39 tests |
| `npm --prefix apps/api test -- --runInBand channel-affiliate` | passed, 2 suites, 32 tests |
| `npm --prefix apps/api test -- --runInBand channel-affiliate-migration.integration.spec.ts` | passed, 1 suite, 26 tests |
| `npm --prefix apps/api test -- --runInBand package-entitlement` | passed, 3 suites, 12 tests |
| `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` | passed, 2 suites, 21 tests |
| `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` | passed, 1 suite, 1 test |
| `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` | passed, 2 suites, 7 tests |
| `npm --prefix apps/api test -- --runInBand` | passed, 23 suites, 170 tests |
| `npm --prefix apps/api run test:e2e -- --runInBand` | passed, 5 suites, 12 tests |
| `npm --prefix apps/api run build` | passed |
| `git status --short` | failed: `fatal: not a git repository (or any of the parent directories): .git` |

## Warnings

- DB-backed suites emit the known non-failing `pg` deprecation warning.

## Files Changed

Code:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

Documentation:

- `docs/minh-huong-sales-distribution/promt27/ketqua_promt_quanly_minhhuong_27.md`
- `docs/minh-huong-sales-distribution/promt27/ketqua_promt_quanly_minhhuong_27.json`
- `docs/minh-huong-sales-distribution/promt27/EVIDENCE.md`
- `docs/minh-huong-sales-distribution/promt27/TESTS_AND_FILES.md`
- `docs/minh-huong-sales-distribution/promt27/NEXT.md`

No Prisma schema migration was needed.

## Bugs Found And Fixes

No blocking pre-existing bug was found.

Implementation fixes/decisions:

- list export uses the existing commission sort validator and export limit helper;
- aggregate export reuses Prompt 26 builder, preserving currency-safety rejection for unsafe amount sorting;
- audit keeps existing report types and distinguishes export access with `format: CSV`, matching the existing order attribution export convention.
