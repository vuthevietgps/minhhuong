# Snapshot Source Of Truth Evidence

## Source

Prompt 20 aggregates from immutable order snapshots:

- `ActivationOrder.affiliateAttributionSnapshotJson`

It does not aggregate from current `AffiliateLink` mutable fields.

## Code Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:333` reads only activation orders for the aggregate.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:341` selects `affiliateAttributionSnapshotJson`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:352` normalizes each snapshot with `normalizeAffiliateSnapshot`.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:912` existing list serializer also normalizes the same snapshot source.
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:933` whitelists and validates snapshot fields.

## Immutable Snapshot Test

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:437` starts the Prompt 20 aggregate test.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:443` seeds orders with immutable snapshot data.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:445` mutates current `AffiliateLink` campaign, channel, placement, and referral code.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:599` filters by the mutated current campaign.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:602` asserts the mutated current campaign returns no aggregate rows.

This proves the aggregate uses the snapshot stored on the order, not current link metadata.
