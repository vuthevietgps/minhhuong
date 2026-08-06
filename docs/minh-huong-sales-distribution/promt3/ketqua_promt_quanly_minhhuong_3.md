# Prompt 3 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: technical spec / no-code design  
Verdict: PASS

## Prompt 2 Review

Prompt 2 outputs were read from `docs/minh-huong-sales-distribution/promt2/`. Prompt 2 passed with service-level commercial P0 tests and small fixes for duplicate side effects in activation approval and payout review.

## Source And Migration Changes

No product source code, Prisma schema, migration, controller, service, frontend, or test implementation was changed in Prompt 3. Only documentation was added under `docs/minh-huong-sales-distribution/promt3/`.

## Design Summary

Package entitlement/snapshot:

- Keep `ActivationPackage` as MVP canonical commercial package.
- Add `PackageEntitlement`.
- Store snapshots on both `ActivationOrder` and `Subscription`.
- Learning access keeps legacy active-subscription behavior until entitlement enforcement is phased in.

Order status history:

- Add `OrderStatusHistory` for lifecycle reconstruction.
- Keep `AuditLog` as generic system audit.
- Write history rows in the same transaction as status changes.

Idempotency:

- Add general `IdempotencyRecord`.
- Use `Idempotency-Key` header.
- First implementation should cover approve order, payout pay, and payout reject.
- Conditional status claims from Prompt 2 remain as second-line race protection.

Subscription traceability:

- Add `Subscription.sourceOrderId`.
- Add `Subscription.activationPackageId`.
- Keep `providerRef` for legacy/provider compatibility.
- Preserve current renewal stacking from latest active expiry.

Commission policy version/snapshot:

- Keep `CommissionPolicy`.
- Add `CommissionPolicyVersion`.
- Extend `CommissionEarning` with policy/calculation/upline snapshots.
- Convert current hardcoded formula into default version rules.

Channel scope integration tests:

- Design DB-backed sibling subtree fixture for director/manager/agency/sale/admin/operations.
- Cover orders, finance report, wallet, payout list, CSV, and channel admin scope.

BA canonical docs sync:

- Exact canonical v1.1 affiliate/QR BA docs were not found.
- Status: `MISSING_CANONICAL_BA_DOCS`.
- Affiliate/QR remains blocked until those docs are copied into repo docs.

## Recommended Prompt 4

`Promt_quanly_minhhuong_4.md` should be an implementation-narrow-slice prompt for `OrderStatusHistory` plus minimal `IdempotencyRecord` support for approve order, payout pay, and payout reject. This is the safest continuation from Prompt 2.

## Hard-Ban Check

- No source code changed.
- No schema migration created.
- Affiliate/QR not implemented.
- Payment gateway not implemented.
- Frontend rewrite not done.
