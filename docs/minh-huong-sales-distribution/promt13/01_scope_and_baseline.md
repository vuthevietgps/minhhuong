# Scope And Baseline

## Source Files Read

Prompt 13 source-of-truth files were read before editing:

- `docs/minh-huong-sales-distribution/promt12/ketqua_promt_quanly_minhhuong_12.md`
- `docs/minh-huong-sales-distribution/promt12/ketqua_promt_quanly_minhhuong_12.json`
- `docs/minh-huong-sales-distribution/promt12/02_current_history_contract_inventory.md`
- `docs/minh-huong-sales-distribution/promt12/03_history_write_implementation_evidence.md`
- `docs/minh-huong-sales-distribution/promt12/04_create_proof_resubmit_history_evidence.md`
- `docs/minh-huong-sales-distribution/promt12/05_reject_cancel_revoke_history_evidence.md`
- `docs/minh-huong-sales-distribution/promt12/06_idempotency_and_duplicate_history_evidence.md`
- `docs/minh-huong-sales-distribution/promt12/07_tests_run.md`
- `docs/minh-huong-sales-distribution/promt12/11_next_prompt_recommendation.md`
- `docs/minh-huong-sales-distribution/promt11/ketqua_promt_quanly_minhhuong_11.md`
- `docs/minh-huong-sales-distribution/promt10/ketqua_promt_quanly_minhhuong_10.md`
- `docs/minh-huong-sales-distribution/promt9/ketqua_promt_quanly_minhhuong_9.md`
- `docs/minh-huong-sales-distribution/promt8/ketqua_promt_quanly_minhhuong_8.md`
- `docs/minh-huong-sales-distribution/promt6/ketqua_promt_quanly_minhhuong_6.md`
- `docs/minh-huong-sales-distribution/promt4/ketqua_promt_quanly_minhhuong_4.md`
- `docs/minh-huong-sales-distribution/promt2/07_tests_run.md`

## Implemented Scope

Only activation order history read-side usability was implemented. Prompt 12 write semantics were not changed.

## Explicitly Not Implemented

- affiliate/QR
- payment gateway/webhook/reconciliation
- package entitlement enforcement/UI
- commission policy version engine
- frontend rewrite
- Lead CRM
- RenewalOpportunity
- `AgencyMember` cleanup
- broad hierarchy/model/order/subscription/commission rewrite
- converting `OrderStatusHistory.action` to enum
- payout lifecycle history

