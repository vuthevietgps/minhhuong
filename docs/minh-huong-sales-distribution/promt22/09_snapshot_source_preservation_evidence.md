# Snapshot Source Preservation Evidence

## Source Of Truth

Prompt 22 did not change the reporting source of truth:

```text
ActivationOrder.affiliateAttributionSnapshotJson
```

## Code Evidence

List JSON report and list CSV export still call:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:319`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:397`

Aggregate JSON and aggregate CSV still use the same aggregate computation:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:446`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:565`

The aggregate CSV path was explicitly kept from double-auditing JSON by using the internal aggregate builder:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:569`

Existing source tests still passed:

- Prompt 19 list snapshot tests
- Prompt 20 aggregate snapshot tests
- Prompt 21 CSV snapshot tests

## Audit Does Not Change Attribution

Audit writes use only report metadata and do not update orders, links, QR assets, clicks, or attribution snapshots.
