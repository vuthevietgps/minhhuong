# Truc lam viec quan ly Minh Huong

Updated: 2026-06-14

## Current Chain State

| Step | Type | Status | Notes |
| --- | --- | --- | --- |
| Prompt 1 | Audit | CONDITIONAL | MVP commercial skeleton exists; major gaps identified. |
| Prompt 2 | Implementation/test hardening | PASS | Approval/subscription/commission/payout tests and fixes completed. |
| Prompt 3 | Design/spec packet | PASS | Designed package entitlement, idempotency, status history, subscription traceability, and channel-scope tests. |
| Prompt 4 | Implementation narrow slice | PASS | Implemented activation order history plus idempotency for approve and payout pay/reject; tests/build passed. |
| Prompt 5 | Expected implementation | FAIL / MISSING_OUTPUTS | No `docs/minh-huong-sales-distribution/promt5/` result packet exists; current source lacks `sourceOrderId` and `activationPackageId`. |
| Prompt 6 | Next required action | BLOCKER FIX | Implement missing subscription traceability slice and produce full `promt6` result packet. |

## Active Baseline

The latest accepted implementation baseline is Prompt 4.

Prompt 4 evidence:

- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.md`
- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.json`
- `docs/minh-huong-sales-distribution/promt4/07_tests_run.md`

Prompt 5 is not accepted because it is not present as reviewable repo evidence.

## Immediate Next Work

Run `Promt_quanly_minhhuong_6.md` from this folder:

- `docs/minh-huong-sales-distribution/promt5-review/Promt_quanly_minhhuong_6.md`

Expected output path:

- `docs/minh-huong-sales-distribution/promt6/`

Expected implementation target:

- add `Subscription.sourceOrderId`;
- add `Subscription.activationPackageId`;
- keep `providerRef`;
- backfill only by direct `providerRef = ActivationOrder.id`;
- resolve package only by `ActivationOrder.packageCode = ActivationPackage.code`;
- preserve approval idempotency and renewal stacking;
- preserve learning access for legacy subscriptions;
- run Prompt 2/4 regression commands.

## Blocked Until Later

Do not start these until Prompt 6 passes review:

- affiliate/QR;
- payment gateway/webhook/reconciliation;
- package entitlement/snapshot and entitlement enforcement;
- commission policy version engine;
- frontend rewrite;
- Lead CRM;
- RenewalOpportunity;
- broad channel hierarchy cleanup.

## Review Discipline

Every future result must include:

- result `.md` and valid `.json`;
- source/migration inventory;
- targeted test evidence;
- full regression command evidence;
- files changed;
- bugs fixed;
- remaining risks;
- next prompt recommendation.

Claims must be classified as direct evidence, assertion, missing, or conflict when reviewed.

