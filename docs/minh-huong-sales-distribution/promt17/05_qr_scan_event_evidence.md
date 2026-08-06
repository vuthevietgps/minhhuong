# QR Scan Event Evidence

## QR Resolution

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- QR query param is read in redirect resolver: line 340
- `resolveQrAssetForRedirect`: line 643
- QR is attached only when `id`, `affiliateLinkId`, and `status = ACTIVE` all match: lines 650-654

## Placement Snapshot

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- QR placement takes priority over link/query placement: lines 671-675

## Tests

`apps/api/src/channel-affiliate/channel-affiliate-redirect.integration.spec.ts`

- valid QR attaches `affiliateQrAssetId`: lines 189-201
- QR from another link does not attach: lines 203-214
- paused QR does not attach: lines 216-226

## Decision

Invalid QR does not block the link click. It creates a normal link click event and leaves `affiliateQrAssetId` null, preventing false QR attribution.
