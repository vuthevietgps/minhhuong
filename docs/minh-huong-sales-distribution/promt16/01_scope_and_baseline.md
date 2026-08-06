# Scope And Baseline

## Scope Implemented

Prompt 16 implemented only:

- `AffiliateLink`
- `AffiliateQrAsset`
- related status enums
- channel-affiliate backend APIs
- encoded URL generation
- channel scope/RBAC tests
- financial safety proof

## Baseline Preserved

Prompt 14 read-side audit usability remains intact:

- activation order status-history actor summaries are unchanged
- order visibility helper behavior is unchanged

Prompt 13/12 lifecycle history behavior remains intact:

- no write-side order lifecycle semantics were changed
- no status history action enum or model was changed

Prompt 11 package entitlement snapshot behavior remains intact:

- no package entitlement enforcement or snapshot logic changed

Prompt 8-10 channel scope/migration safety remains intact:

- channel scope integration suites passed
- channel participant FK migration proof passed

## Hard Scope Boundary

No changes were made to:

- activation order creation/approval attribution
- subscription creation
- commission creation/release
- finance reports
- payment gateway/reconciliation
- frontend/UI
