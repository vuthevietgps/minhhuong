# Aggregate Export Snapshot Source Evidence

## Source

Aggregate CSV export reuses the Prompt 20 aggregate method, which already reads `ActivationOrder.affiliateAttributionSnapshotJson`.

Code evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:508` implements `exportOrderAttributionAggregatesCsv`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:512` calls `listOrderAttributionAggregates`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:397` aggregate report reuses `affiliateOrderAttributionWhere`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:407` selects `affiliateAttributionSnapshotJson`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:418` normalizes each snapshot.

## Immutable Snapshot Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:770` mutates the current `AffiliateLink`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:824` exports aggregate CSV filtered by the mutated current campaign.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:828` asserts the result is header-only.

This proves aggregate CSV export is based on immutable order snapshots, not current mutable link state.
