# Scope And Baseline

## Source Files Read

Required Prompt 13 result packet:

- `docs/minh-huong-sales-distribution/promt13/ketqua_promt_quanly_minhhuong_13.md`
- `docs/minh-huong-sales-distribution/promt13/ketqua_promt_quanly_minhhuong_13.json`
- `docs/minh-huong-sales-distribution/promt13/02_read_surface_inventory.md`
- `docs/minh-huong-sales-distribution/promt13/03_history_read_implementation_evidence.md`
- `docs/minh-huong-sales-distribution/promt13/04_scope_rbac_evidence.md`
- `docs/minh-huong-sales-distribution/promt13/05_history_ordering_and_shape_evidence.md`
- `docs/minh-huong-sales-distribution/promt13/06_metadata_safety_evidence.md`
- `docs/minh-huong-sales-distribution/promt13/07_tests_run.md`
- `docs/minh-huong-sales-distribution/promt13/10_remaining_gaps_and_risks.md`
- `docs/minh-huong-sales-distribution/promt13/11_next_prompt_recommendation.md`

Accepted regression baselines:

- `docs/minh-huong-sales-distribution/promt12/ketqua_promt_quanly_minhhuong_12.md`
- `docs/minh-huong-sales-distribution/promt11/ketqua_promt_quanly_minhhuong_11.md`
- `docs/minh-huong-sales-distribution/promt10/ketqua_promt_quanly_minhhuong_10.md`
- `docs/minh-huong-sales-distribution/promt9/ketqua_promt_quanly_minhhuong_9.md`
- `docs/minh-huong-sales-distribution/promt8/ketqua_promt_quanly_minhhuong_8.md`
- `docs/minh-huong-sales-distribution/promt6/ketqua_promt_quanly_minhhuong_6.md`
- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.md`
- `docs/minh-huong-sales-distribution/promt2/07_tests_run.md`

## Scope Implemented

Only read-side actor summary was added to `GET /activation-orders/:orderId/status-history`.

## Scope Not Implemented

No affiliate/QR, payment gateway, webhook, reconciliation, package entitlement enforcement/UI, commission policy engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad hierarchy/model/order/subscription/commission rewrite, payout lifecycle history, customer-facing `/me` order history, write-side lifecycle changes, or schema migration was implemented.

