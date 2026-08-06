# Scope And Baseline

## Source Files Read

Prompt 5 blocker context:

- `docs/minh-huong-sales-distribution/promt5-review/review_ketqua_promt_quanly_minhhuong_5.md`
- `docs/minh-huong-sales-distribution/promt5-review/Promt_quanly_minhhuong_6.md`
- `docs/minh-huong-sales-distribution/promt5-review/truc_lam_viec_quanly_minhhuong.md`

Prompt 4 baseline:

- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.md`
- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.json`
- `docs/minh-huong-sales-distribution/promt4/04_idempotency_contract_evidence.md`
- `docs/minh-huong-sales-distribution/promt4/05_activation_approval_idempotency_evidence.md`
- `docs/minh-huong-sales-distribution/promt4/07_tests_run.md`

Prompt 3 design:

- `docs/minh-huong-sales-distribution/promt3/06_subscription_traceability_design.md`
- `docs/minh-huong-sales-distribution/promt3/10_migration_implementation_plan.md`
- `docs/minh-huong-sales-distribution/promt3/11_acceptance_test_plan.md`

Prompt 2 regression baseline:

- `docs/minh-huong-sales-distribution/promt2/03_order_subscription_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/04_commission_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/05_payout_scope_test_evidence.md`
- `docs/minh-huong-sales-distribution/promt2/07_tests_run.md`

## Scope Implemented

Implemented only subscription traceability:

- `Subscription.sourceOrderId`
- `Subscription.activationPackageId`
- relations to `ActivationOrder` and `ActivationPackage`
- nullable migration and direct backfill
- approval writes trace fields
- `providerRef` retained
- learning access compatibility tests
- result packet

## Hard Bans

No affiliate/QR, payment gateway, package entitlement, entitlement enforcement, commission policy engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad model rename, or broad commercial architecture rewrite was implemented.

