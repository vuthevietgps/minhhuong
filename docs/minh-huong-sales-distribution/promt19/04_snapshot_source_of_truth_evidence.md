# Snapshot Source Of Truth Evidence

## Implementation

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- base report filter requires snapshot `source = affiliate_click`: line 470
- all snapshot filters use `affiliateAttributionSnapshotJson`: lines 512 and 539
- `serializeOrderAttribution` reads `affiliateAttributionSnapshotJson`: line 561
- `normalizeAffiliateSnapshot` whitelists snapshot fields: line 582

The report does not join to current `AffiliateLink` state to determine campaign, channel, placement, referral code, participant, or link attribution.

## Immutable Snapshot Test

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- mutates current `AffiliateLink` fields after seeding orders: line 257
- asserts report still returns snapshot campaign/channel/placement/referral: lines 316-322
- asserts filtering by mutated current campaign returns empty: line 328

## Decision

`ActivationOrder.affiliateAttributionSnapshotJson` is the source of truth for historical affiliate attribution. Current link state can change without rewriting historical report output.
