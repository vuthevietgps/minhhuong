# Scope And Baseline

## Repo

- Root used: `C:\Users\PC\Documents\code\minhhuong`
- Git status: not available; `git status --short` returned `fatal: not a git repository (or any of the parent directories): .git`.

## Prompt 1 Inputs Read

- `docs/minh-huong-sales-distribution/bromt1/00_chain_ledger.md`
- `docs/minh-huong-sales-distribution/bromt1/ketquabromt1.md`
- `docs/minh-huong-sales-distribution/bromt1/ketquabromt1.json`
- `docs/minh-huong-sales-distribution/bromt1/03_current_capability_matrix.md`
- `docs/minh-huong-sales-distribution/bromt1/04_gap_matrix_p0_p1_p2_p3.md`
- `docs/minh-huong-sales-distribution/bromt1/07_order_subscription_commission_flow_audit.md`
- `docs/minh-huong-sales-distribution/bromt1/08_channel_scope_rbac_audit.md`
- `docs/minh-huong-sales-distribution/bromt1/10_tests_run.md`
- `docs/minh-huong-sales-distribution/bromt1/11_risks_decisions_questions.md`
- `docs/minh-huong-sales-distribution/bromt1/12_next_bromt_recommendation.md`

## Baseline Before Changes

- `npm --prefix apps/api test -- --runInBand`: passed, 6 suites, 20 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand`: passed, 1 suite, 1 test.

## Scope Applied

- Added API service unit tests for current commercial service behavior.
- Applied minimal correctness fixes for duplicate side-effect risk in activation approval, commission release reporting, and payout review.
- No schema migration or feature expansion was performed.
