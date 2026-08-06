# Mutable Link State Independence Evidence

## Scenario

The test configures a mutated current affiliate link with:

- `MUTATED-REF`
- `mutated-campaign`
- `mutated-channel`
- `mutated-placement`

Then approval creates commission proof from the immutable order snapshot:

- `SNAP-REF`
- `snapshot-campaign`
- `snapshot-channel`
- `snapshot-placement`

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:686`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:718`

## No Mutable Link Query

- `affiliateLink.findUnique` is mocked with mutated data.
- The approval flow does not call it.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:734`

## QR And Agency/Member Proof

The same test asserts the commission proof preserves:

- `affiliateQrAssetId: qr-snapshot-1`
- `agencyId: agency-snapshot-1`
- `agencyMemberId: member-snapshot-1`

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:718`
