# Bugs Found And Fixes

## Bug 1: Package Entitlement/Snapshot Schema Was Missing

Finding:

- `ActivationPackage` existed, but package entitlement definitions and immutable order/subscription snapshots did not.

Fix:

- added `PackageEntitlement`;
- added `ActivationPackage.version`;
- added snapshot JSON fields on `ActivationOrder` and `Subscription`;
- added migration deploy proof.

## Bug 2: New Orders Did Not Capture What Was Sold

Finding:

- package price/duration and entitlement definitions could change after order creation, but orders had no immutable snapshot.

Fix:

- self-service and sale-assisted creation now write `ActivationOrder.entitlementSnapshotJson`;
- amount/duration overrides are captured as sold values.

## Bug 3: Approval Could Not Preserve Entitlement Snapshot Into Runtime Subscription

Finding:

- subscriptions had traceability fields but no package entitlement snapshot.

Fix:

- approval copies order snapshot to `Subscription.entitlementSnapshotJson`;
- legacy null order snapshots get deterministic fallback.

## Bug 4: Learning Code Had No Snapshot Read Seam

Finding:

- learning access was compatible with trace fields but could not read a package entitlement snapshot.

Fix:

- `EntitlementService` now selects/parses snapshot as read-only metadata while preserving existing active-subscription access logic.

## Harness Fixes

- started portable PostgreSQL when Docker/local Postgres was unavailable;
- shortened temp DB prefix in migration proof to avoid PostgreSQL identifier truncation.
