# Remaining Gaps And Risks

## Scope Coverage

Channel scope is partially covered at service level:

- Non-admin actor lineage and own orders are checked.
- Non-admin without participant receives empty filters.

Still missing:

- DB-backed integration tests with actual sibling sale/agency records.
- Full role matrix for director, manager, agency owner/manager, sale, operations, and admin.
- CSV/report/wallet/payout list cross-checks against seeded out-of-subtree rows.

## Schema And Contract Gaps Deferred By Prompt 2

- No `OrderStatusHistory` or equivalent event trail.
- No explicit idempotency key model/field for order create, proof upload, approval, or payout review.
- No subscription `sourceOrderId` / `packageId` or equivalent normalized trace.
- No package entitlement snapshot on subscription/order.
- No commission policy version/snapshot.

## Product Gaps Intentionally Not Implemented

- Affiliate link/QR.
- Payment gateway/webhook/reconciliation.
- Lead CRM.
- RenewalOpportunity.
- Frontend rewrite.

## Operational Risk

The new service-level tests harden orchestration behavior, but they do not replace database isolation tests. Prompt 3 should decide idempotency contracts and schema traces before broader implementation.
