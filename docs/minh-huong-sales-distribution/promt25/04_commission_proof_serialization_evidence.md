# Commission Proof Serialization Evidence

## Affiliate Proof

`affiliateProof` is normalized from `CommissionEarning.attributionSnapshotJson` and only returns whitelisted fields:

- source
- participant/agency/member ids
- referral/link/QR ids
- campaign/channel/placement/package
- click id and timestamps
- `commissionChainSnapshotStatus`

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1794`

## Chain Proof

`chainProof` is derived from `ActivationOrder.commissionChainSnapshotJson` if present and matched to the commission row by depth/participant id.

If missing, it exposes `snapshotStatus: legacy_missing`.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts:1912`

## Tests

- Frozen proof and chain proof assertions.
- Legacy missing proof assertion.

Evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1144`
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:1235`
