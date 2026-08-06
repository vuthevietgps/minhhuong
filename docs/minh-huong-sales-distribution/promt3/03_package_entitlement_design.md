# Package Entitlement And Snapshot Design

## Decision

Keep `ActivationPackage` as the canonical commercial package for MVP. Do not rename it to `ProductPackage` in Prompt 4. The safer path is to extend it with entitlement rows and immutable snapshots.

## Proposed Schema Additions

Documentation only for Prompt 3. Do not implement here.

### `PackageEntitlement`

- `id`
- `packageId` -> `ActivationPackage.id`
- `entitlementKey`
- `valueJson`
- `status` (`ACTIVE`, `INACTIVE`)
- `createdAt`
- `updatedAt`

Recommended indexes:

- unique `(packageId, entitlementKey)` for active package entitlement definition.
- index `(entitlementKey, status)`.

### `ActivationPackage` Extensions

- optional `version` integer, default 1.
- optional `publicStatus` or keep `isActive` for MVP. Do not expand unless business requires archive/private.

## MVP Entitlement Keys

- `COURSE_ACCESS`
  - `valueJson`: `{ "courseIds": ["..."], "mode": "ALL_ACTIVE" | "INCLUDE_LIST" }`
- `AI_MESSAGES_PER_MONTH`
  - `valueJson`: `{ "limit": 500 }`
- `CHILD_COUNT`
  - `valueJson`: `{ "limit": 1 }`
- `DAILY_STUDY_MINUTES`
  - `valueJson`: `{ "limit": 60 }`
- `TEACHER_GRADING`
  - `valueJson`: `{ "enabled": true }`
- `OFFLINE_ACCESS`
  - `valueJson`: `{ "enabled": false }`

## Snapshot Placement

Store snapshot in both order and subscription:

- `ActivationOrder.entitlementSnapshotJson`
  - captures what was sold and approved.
  - useful for dispute/audit even if approval later fails or is revoked.
- `Subscription.entitlementSnapshotJson`
  - runtime learning access reads from this stable snapshot.
  - old subscriptions must not change when a package is edited later.

Snapshot shape:

```json
{
  "packageId": "pkg_...",
  "packageCode": "basic-30",
  "packageName": "Basic 30",
  "packageVersion": 1,
  "amountVnd": 100000,
  "durationDays": 30,
  "entitlements": [
    {"key": "COURSE_ACCESS", "value": {"mode": "ALL_ACTIVE"}},
    {"key": "AI_MESSAGES_PER_MONTH", "value": {"limit": 500}}
  ],
  "capturedAt": "2026-06-14T00:00:00.000Z"
}
```

## When To Capture

- Self-service order create: capture package and entitlement snapshot at order creation.
- Sale-assisted order create: if `packageCode` maps to an active package, capture snapshot. If custom amount/duration is used without package, snapshot must mark `customPackage: true`.
- Approve: copy order snapshot to subscription. If order snapshot is missing for legacy rows, reconstruct from `packageCode`, `packageName`, `amountCents`, and `requestedDurationDays`.

## Learning Branch Read Contract

Phase 1:

- Keep current access guard: active child subscription by status and date.
- Add helper to read `Subscription.entitlementSnapshotJson`.
- If snapshot missing, fall back to legacy default entitlement: active subscription grants existing behavior.

Phase 2:

- Enforce `COURSE_ACCESS`, `AI_MESSAGES_PER_MONTH`, `DAILY_STUDY_MINUTES`, and `CHILD_COUNT`.
- Keep teacher/admin bypass rules explicit.

## Backfill Plan

1. Add schema fields nullable.
2. Create default entitlements for each active `ActivationPackage`.
3. Backfill `ActivationOrder.entitlementSnapshotJson`:
   - by `packageCode` if package exists.
   - by legacy order fields if package not found.
4. Backfill `Subscription.entitlementSnapshotJson`:
   - by `sourceOrderId` after traceability exists.
   - otherwise by `providerRef` if it matches an order id.
   - otherwise legacy default.
5. After backfill and tests, decide whether new rows require non-null snapshots.

## Prompt 4 Tests

- package entitlement CRUD/factory tests.
- self-service order captures order snapshot.
- sale-assisted order captures order snapshot.
- approve copies snapshot to subscription.
- editing package entitlements does not alter existing order/subscription snapshots.
- legacy subscription without snapshot still gets current access behavior.
- learning access helper reads entitlement snapshot without blocking existing active subscriptions.
