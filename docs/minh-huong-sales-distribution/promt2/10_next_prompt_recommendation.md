# Next Prompt Recommendation

Recommended file: `Promt_quanly_minhhuong_3.md`

Recommended type: technical spec / narrow design first, then implementation prompt.

## Scope

1. Package entitlement and entitlement snapshot.
2. Order status history.
3. Explicit idempotency contract for:
   - activation order create;
   - payment proof upload;
   - operations approve/reject/revoke;
   - payout pay/reject.
4. Subscription traceability:
   - `sourceOrderId` or equivalent;
   - `packageId` or equivalent.
5. Commission policy version/snapshot.
6. DB-backed channel scope integration fixtures for sibling/director/manager/agency/sale.
7. Canonical BA v1.1 affiliate/QR docs copied into repo before any affiliate implementation.

## Reason

Prompt 2 now has service-level P0 safety tests and small fixes for duplicate side-effect risks. The remaining work needs explicit data contracts and schema decisions so future affiliate, package, and reporting features do not attach to ambiguous commercial state.
