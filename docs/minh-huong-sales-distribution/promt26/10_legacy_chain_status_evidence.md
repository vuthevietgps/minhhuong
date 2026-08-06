# Legacy Chain Status Evidence

Supported chain statuses:

- `frozen`
- `legacy_missing`

Aggregate source:

- chain status is normalized from `CommissionEarning.attributionSnapshotJson` and safe `ActivationOrder.commissionChainSnapshotJson`.
- no backfill is performed.

Evidence:

- chain status filter: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1359`
- chain proof normalization: `apps/api/src/channel-affiliate/channel-affiliate.service.ts:2204`
- aggregate groupBy test for frozen and legacy: `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1502`
