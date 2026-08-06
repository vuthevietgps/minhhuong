# Immutable Snapshot Report Evidence

## Required Proof

The Prompt 19 test creates orders with affiliate snapshots, mutates current `AffiliateLink` fields, then runs the report.

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- test starts: line 250
- order snapshot seed starts: line 902
- current link mutation: line 257
- snapshot channel filter uses `snapshot-channel`: line 305
- report assertion keeps snapshot channel/referral values: lines 316-322
- mutated current campaign filter returns empty: lines 326-330

## Interpretation

The report output is stable because it reads:

```text
ActivationOrder.affiliateAttributionSnapshotJson
```

It does not recompute attribution from current `AffiliateLink` fields.

## Historical Behavior

If a link campaign, placement, referral code, or status changes after an order is created, old order attribution rows remain reportable with their original snapshot values.
