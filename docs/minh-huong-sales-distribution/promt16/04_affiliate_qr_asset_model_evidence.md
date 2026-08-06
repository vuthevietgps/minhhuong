# Affiliate QR Asset Model Evidence

## Model

`AffiliateQrAsset` exists in `apps/api/prisma/schema.prisma:925`.

Key fields implemented:

- `affiliateLinkId`
- `createdById`
- `label`
- `placement`
- `encodedUrl`
- `qrImageUrl`
- `status`
- `metadataJson`
- timestamps

## Relations

- `affiliateLink` -> `AffiliateLink`
- `createdBy` -> `User`

## Service Evidence

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- QR create entry point: line 241
- QR encoded URL creation: line 250
- QR audit: line 270

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- QR asset created for scoped link: lines 267-300
- canonical encoded URL contains `/r/{linkCode}` and `qr={qrAssetId}`: lines 283-288
- sibling QR creation blocked: lines 291-298

## Deferred By Design

Prompt 16 does not render/store an actual QR image binary. `qrImageUrl` is optional, and `encodedUrl` is the canonical foundation for a future QR renderer/UI.
