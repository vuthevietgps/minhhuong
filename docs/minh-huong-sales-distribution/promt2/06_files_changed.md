# Files Changed

## Source

- `apps/api/src/activation-orders/activation-orders.service.ts`
  - Added transactional conditional claim for activation approval before side effects.
  - Fixed commission release result count to increment only when release actually happens.
- `apps/api/src/channel-finance/channel-finance.service.ts`
  - Added transactional conditional payout pay/reject claims before ledger writes.

## Tests

- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
  - New service-level unit tests for order, subscription, approval idempotency, commission creation, and release idempotency.
- `apps/api/src/channel-finance/channel-finance.service.spec.ts`
  - New service-level unit tests for payout ledger workflow, payout idempotency, terminal status guards, and finance scope.

## Reports

- `docs/minh-huong-sales-distribution/promt2/ketqua_promt_quanly_minhhuong_2.md`
- `docs/minh-huong-sales-distribution/promt2/ketqua_promt_quanly_minhhuong_2.json`
- `docs/minh-huong-sales-distribution/promt2/00_chain_ledger.md`
- `docs/minh-huong-sales-distribution/promt2/01_scope_and_baseline.md`
- `docs/minh-huong-sales-distribution/promt2/02_tests_added_or_changed.md`
- `docs/minh-huong-sales-distribution/promt2/03_order_subscription_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/04_commission_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/05_payout_scope_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/06_files_changed.md`
- `docs/minh-huong-sales-distribution/promt2/07_tests_run.md`
- `docs/minh-huong-sales-distribution/promt2/08_bugs_found_and_fixes.md`
- `docs/minh-huong-sales-distribution/promt2/09_remaining_gaps_and_risks.md`
- `docs/minh-huong-sales-distribution/promt2/10_next_prompt_recommendation.md`

Note: `npm --prefix apps/api run build` was run and may refresh local build output under `apps/api/dist` depending on local build state. Functional source changes are listed above.
