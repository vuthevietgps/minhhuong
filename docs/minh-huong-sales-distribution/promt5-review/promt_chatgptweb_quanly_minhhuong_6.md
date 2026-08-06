# promt_chatgptweb_quanly_minhhuong_6.md

Date created: 2026-06-14  
Purpose: Review result of `Promt_quanly_minhhuong_6.md`.

## 1. Role

This file guides ChatGPT Web review of Prompt 6.

Prompt 6 is a fix/blocker prompt because Prompt 5 review failed due missing outputs and missing subscription traceability in source. Review must decide Prompt 6 PASS / CONDITIONAL / FAIL using only repo evidence and uploaded result files.

Do not rely on conversation memory.

## 2. Source Of Truth To Read

Prompt 6 result:

- `docs/minh-huong-sales-distribution/promt6/ketqua_promt_quanly_minhhuong_6.md`
- `docs/minh-huong-sales-distribution/promt6/ketqua_promt_quanly_minhhuong_6.json`
- all files in `docs/minh-huong-sales-distribution/promt6/`

Prompt 5 review baseline:

- `docs/minh-huong-sales-distribution/promt5-review/review_ketqua_promt_quanly_minhhuong_5.md`
- `docs/minh-huong-sales-distribution/promt5-review/Promt_quanly_minhhuong_6.md`

Prompt 4 regression baseline:

- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.md/json`
- `docs/minh-huong-sales-distribution/promt4/04_idempotency_contract_evidence.md`
- `docs/minh-huong-sales-distribution/promt4/05_activation_approval_idempotency_evidence.md`
- `docs/minh-huong-sales-distribution/promt4/07_tests_run.md`

Prompt 3 design baseline:

- `docs/minh-huong-sales-distribution/promt3/06_subscription_traceability_design.md`
- `docs/minh-huong-sales-distribution/promt3/10_migration_implementation_plan.md`
- `docs/minh-huong-sales-distribution/promt3/11_acceptance_test_plan.md`

Prompt 2 commercial regression baseline:

- `docs/minh-huong-sales-distribution/promt2/03_order_subscription_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/04_commission_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/05_payout_scope_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/07_tests_run.md`

## 3. Evidence Quality Rules

Classify each major claim:

- `DIRECT_EVIDENCE`: source line, migration line, test name, or command output is present.
- `ASSERTION`: result file says it happened but proof is weak.
- `MISSING`: evidence is absent.
- `CONFLICT`: files disagree or source contradicts report.

Do not accept summary-only claims.

## 4. Claims To Verify

1. `Subscription.sourceOrderId` exists in schema and migration.
2. `Subscription.sourceOrderId` relates to `ActivationOrder.id`.
3. `Subscription.activationPackageId` exists in schema and migration.
4. `Subscription.activationPackageId` relates to `ActivationPackage.id`.
5. `providerRef` remains present and compatible.
6. Migration is nullable/backward-compatible.
7. Backfill uses only direct `providerRef = ActivationOrder.id`.
8. Package backfill uses only `ActivationOrder.packageCode = ActivationPackage.code`.
9. Non-matching legacy subscriptions remain null, not guessed.
10. Approval writes `sourceOrderId = order.id`.
11. Approval writes `activationPackageId` when package resolves.
12. Package miss does not fail approval.
13. Renewal stacking behavior is unchanged.
14. Same-key approve replay creates no duplicate subscription.
15. Stale/different-key approve retry creates no duplicate subscription.
16. Active legacy subscription with null trace fields still grants learning access.
17. Active traced subscription grants learning access.
18. Expired/canceled access behavior is unchanged.
19. Prompt 2/4 regression tests still pass.
20. No scope creep.

## 5. Required Command Evidence

PASS requires command evidence for:

```bash
npm --prefix apps/api run prisma:generate
npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts
npm --prefix apps/api test -- --runInBand
npm --prefix apps/api run test:e2e -- --runInBand
npm --prefix apps/api run build
```

If a command failed or was skipped, evaluate whether this is a blocker. Do not mark PASS if Prompt 2/4 regression tests fail.

## 6. Scope Creep Check

Prompt 6 must not implement:

- affiliate/QR;
- payment gateway/webhook/reconciliation;
- package entitlement/snapshot;
- entitlement enforcement;
- commission policy version engine;
- frontend rewrite;
- Lead CRM;
- RenewalOpportunity;
- broad model rename or cleanup unrelated to traceability.

If scope creep exists, require direct justification and tests. Large scope creep is FAIL.

## 7. Verdict Rules

PASS only if:

- traceability fields, relations, migration, and source writes are correct;
- `providerRef` compatibility remains;
- backfill is direct and non-fuzzy;
- learning access compatibility is tested;
- required test commands pass;
- reports are complete;
- no hard-banned scope creep.

CONDITIONAL only if:

- implementation is correct but live-data backfill application is clearly deferred and honestly documented; or
- a unique constraint is deferred due duplicate legacy risk, with source-side duplicate prevention and tests; or
- a minor report detail is missing without affecting source/test confidence.

FAIL if:

- trace fields are absent;
- approval cannot trace new subscriptions;
- learning access can lock out legacy subscriptions;
- Prompt 2/4 regression tests fail;
- migration risks existing data without documentation;
- core evidence is missing;
- hard-banned scope creep is introduced.

## 8. Expected Review Output

After review, output:

- `review_ketqua_promt_quanly_minhhuong_6.md`
- next implementation prompt only if Prompt 6 is PASS or CONDITIONAL and there is a justified next slice
- updated `truc_lam_viec_quanly_minhhuong.md`

If Prompt 6 is not PASS/CONDITIONAL, the next prompt must remain a fix/blocker prompt.

