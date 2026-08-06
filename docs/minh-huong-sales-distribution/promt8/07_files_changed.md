# Files Changed

## Migration

- `apps/api/prisma/migrations/20260614170000_reconcile_channel_scope_history/migration.sql`
  - Adds missing channel hierarchy enum values, columns, indexes, guarded self-FK, and deterministic backfill.
  - Adds missing `CommissionEarning` scope/release fields and index.
  - Adds missing `ActivationOrder.trialEndsAt` and index.

## Test

- `apps/api/src/channel-finance/channel-scope.integration.spec.ts`
  - Replaces `prisma db push` setup with `prisma migrate deploy`.
  - Adds direct schema assertions for migration-created DB.
  - Keeps Prompt 7 sibling A/B scope fixture and assertions.

## Result Packet

- `docs/minh-huong-sales-distribution/promt8/ketqua_promt_quanly_minhhuong_8.md`
- `docs/minh-huong-sales-distribution/promt8/ketqua_promt_quanly_minhhuong_8.json`
- `docs/minh-huong-sales-distribution/promt8/00_chain_ledger.md`
- `docs/minh-huong-sales-distribution/promt8/01_scope_and_baseline.md`
- `docs/minh-huong-sales-distribution/promt8/02_schema_migration_diff_audit.md`
- `docs/minh-huong-sales-distribution/promt8/03_migration_reconciliation_evidence.md`
- `docs/minh-huong-sales-distribution/promt8/04_migrate_deploy_test_db_evidence.md`
- `docs/minh-huong-sales-distribution/promt8/05_channel_scope_regression_evidence.md`
- `docs/minh-huong-sales-distribution/promt8/06_tests_run.md`
- `docs/minh-huong-sales-distribution/promt8/07_files_changed.md`
- `docs/minh-huong-sales-distribution/promt8/08_bugs_found_and_fixes.md`
- `docs/minh-huong-sales-distribution/promt8/09_remaining_gaps_and_risks.md`
- `docs/minh-huong-sales-distribution/promt8/10_next_prompt_recommendation.md`

## Product Source

No product service/controller behavior changed.

