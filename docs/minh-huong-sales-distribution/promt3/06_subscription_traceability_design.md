# Subscription Traceability Design

## Current State

`Subscription` is child-profile based and currently stores `providerRef`. Approval uses the order id as `providerRef`, but this is an overloaded text field rather than an explicit commercial relation.

Evidence:

- `apps/api/prisma/schema.prisma:516` current `Subscription`.
- `apps/api/src/activation-orders/activation-orders.service.ts:527` approval flow.
- `apps/api/src/learning/learning.service.ts:1091` learning access guard.

## Decision

Add explicit trace fields:

- `Subscription.sourceOrderId` nullable relation to `ActivationOrder.id`.
- `Subscription.activationPackageId` nullable relation to `ActivationPackage.id`.
- `Subscription.entitlementSnapshotJson` nullable JSON.

Keep `providerRef` for legacy/provider compatibility. Do not remove it in Prompt 4.

## Order To Subscription Rule

Prefer one approved order creates one subscription row.

Current behavior creates a new subscription row whose start date is:

- latest active/trial subscription `currentPeriodEnd` if it is in the future.
- otherwise now.

Keep this behavior for MVP. It preserves remaining days by stacking the new row after current expiry.

Recommended constraints:

- unique nullable `sourceOrderId` to prevent one order creating multiple subscription rows.
- index `(activationPackageId)`.
- existing index `(childProfileId, status)` remains.

## Backfill Plan

1. Add nullable fields.
2. Backfill `sourceOrderId`:
   - if `providerRef` matches an `ActivationOrder.id`, set it.
   - otherwise leave null and mark legacy in metadata/report.
3. Backfill `activationPackageId`:
   - from linked source order `packageCode` -> `ActivationPackage.code`.
   - if package not found, leave null and rely on snapshot.
4. Backfill `entitlementSnapshotJson`:
   - from linked order snapshot if available.
   - else reconstruct from package or legacy default.
5. Add unique index on `sourceOrderId` after duplicate check.

## Learning Access Guard

Phase 1:

- Keep active subscription date/status guard unchanged.
- Add optional helper to load entitlement snapshot for downstream features.

Phase 2:

- Enforce package entitlements in learning feature boundaries.
- If entitlement snapshot is absent, apply legacy behavior so existing users are not locked out.

## Package Change Rule

If package entitlements change after purchase:

- old subscriptions continue using `Subscription.entitlementSnapshotJson`.
- old orders continue using `ActivationOrder.entitlementSnapshotJson`.
- new orders use the latest active package entitlement definitions.

## Prompt 4 Tests

- approval stores `sourceOrderId` on subscription.
- approval stores `activationPackageId` when order package code resolves.
- repeated stale approval cannot create a second subscription for the same source order.
- renewal starts at existing future `currentPeriodEnd`.
- expired subscription renewal starts at now.
- legacy `providerRef` backfill maps to source order.
- learning access still works for legacy subscriptions with null trace fields.
