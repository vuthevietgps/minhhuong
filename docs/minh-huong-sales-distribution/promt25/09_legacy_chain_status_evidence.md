# Legacy Chain Status Evidence

## Behavior

The endpoint distinguishes:

- `frozen`: commission row has safe order-time chain snapshot on the related `ActivationOrder`;
- `legacy_missing`: old affiliate commission proof marked by Prompt 24 fallback or missing chain snapshot.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1794`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1912`

## Filter

`commissionChainSnapshotStatus` supports:

- `frozen`
- `legacy_missing`

Invalid values throw.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1176`

## Tests

The test asserts `legacy_missing` rows are returned and exposed clearly.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1235`
