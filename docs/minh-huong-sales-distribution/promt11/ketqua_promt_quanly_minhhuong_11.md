# Prompt 11 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: implementation-narrow-slice / commercial correctness  
Verdict: PASS

## Scope Implemented

Implemented package entitlement/snapshot foundation without affiliate/QR, payment gateway, entitlement enforcement, frontend rewrite, or commission policy engine scope.

Implemented:

- `PackageEntitlement` schema with `ACTIVE` / `INACTIVE` status.
- `ActivationPackage.version`.
- `ActivationOrder.entitlementSnapshotJson`.
- `Subscription.entitlementSnapshotJson`.
- partial unique SQL guard for one active entitlement definition per package/key.
- deterministic backfill for existing activation orders and directly linked subscriptions.
- reusable package entitlement snapshot builder.
- self-service order snapshot capture.
- sale-assisted order snapshot capture.
- approval snapshot copy to subscription.
- legacy approval fallback snapshot when an old order has no snapshot.
- snapshot reader seam in `EntitlementService`.
- channel-admin backend endpoints for package entitlement rows.

## Snapshot Rules

New orders capture immutable JSON at order creation. Approval copies that snapshot into the subscription. If a legacy pending order has no snapshot, approval reconstructs a deterministic fallback from order/package fields and does not use current entitlement rows.

Historical migration backfill is direct only:

- `ActivationOrder` backfill uses the order fields plus exact `ActivationPackage.code` match when present.
- `Subscription` backfill copies from linked orders by `sourceOrderId` or direct `providerRef = ActivationOrder.id`.
- no fuzzy matching by email, phone, name, child, price, or date.
- old subscriptions that cannot be directly linked remain null-safe and still grant access when active.

## Tests

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 22 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 6 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 21 suites, 116 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 3 suites, 7 tests.
- `npm --prefix apps/api run build` -> passed.

## Interim Failures

The first `package-entitlement` run failed because local PostgreSQL was not listening on `localhost:5432`. Diagnostic `pg` connection returned `ECONNREFUSED`. I started the repo portable PostgreSQL with `scripts/Start-LocalPostgres.ps1`.

The next `package-entitlement` run failed because the migration-proof temp database name exceeded PostgreSQL identifier length and was truncated. I shortened the test DB prefix to `p11_ent_`; final rerun passed.

## Hard-Ban Check

No affiliate/QR, payment gateway/webhook/reconciliation, entitlement enforcement that blocks learning access, commission policy version engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad model rename, broad channel hierarchy redesign, broad order/subscription/commission rewrite, or payment/refund/clawback redesign was implemented.

## Recommended Prompt 12

Implement OrderStatusHistory lifecycle expansion beyond approval: proof upload, resubmit, cancel, reject, and revoke history coverage. Keep affiliate/QR blocked until canonical BA v1.1 docs are present and reviewed.
