# Commission Attribution Resolver Evidence

## Resolver

- Added `resolveOrderCommissionAttribution(order)` in `ActivationOrdersService`.
- Missing snapshot returns the existing order channel participant id and marks `usesAffiliateSnapshot: false`.
- Valid affiliate snapshot returns the snapshot `participantId` and a sanitized `attributionSnapshotJson`.
- Malformed snapshot throws `BadRequestException`.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:1968`
- `apps/api/src/activation-orders/activation-orders.service.ts:1995`

## Snapshot Fields Preserved

The commission proof stores:

- `participantId`
- `agencyId`
- `agencyMemberId`
- `referralCode`
- `affiliateLinkId`
- `affiliateQrAssetId`
- `campaign`
- `channel`
- `placement`
- `packageCode`
- `clickId`
- `clickCreatedAt`
- `orderSnapshottedAt`

The proof source is normalized to `affiliate_order_snapshot`.

## No Current Link Lookup

- The approval/commission resolver parses `ActivationOrder.affiliateAttributionSnapshotJson`.
- It does not call `AffiliateLink.findUnique` or query current link campaign/channel/placement/referral code during approval.
- Test proves a mocked mutated `affiliateLink.findUnique` is not called.

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:686`
- `apps/api/src/activation-orders/activation-orders.service.spec.ts:734`

## Schema

- Added nullable `CommissionEarning.attributionSnapshotJson`.
- Migration is narrow and has no backfill.

Evidence:

- `apps/api/prisma/schema.prisma:1013`
- `apps/api/prisma/migrations/20260615090000_commission_attribution_snapshot/migration.sql`
