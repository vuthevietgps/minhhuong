# List Export Snapshot Source Evidence

## Source

List CSV export uses `ActivationOrder.affiliateAttributionSnapshotJson` as source of truth.

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:363` implements `exportOrderAttributionsCsv`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:367` reuses `affiliateOrderAttributionWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:378` selects `affiliateAttributionSnapshotJson`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:383` serializes rows through `serializeOrderAttributionExportRow`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:987` normalizes the snapshot for export rows.

## Immutable Snapshot Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:754` starts the list and aggregate CSV export test.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:758` seeds immutable snapshot attribution orders.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:770` mutates current `AffiliateLink` campaign, channel, placement, and referral code.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:821` asserts filtering by the mutated current campaign returns only the CSV header.

This proves list CSV export uses historical order snapshot data, not current mutable link metadata.
