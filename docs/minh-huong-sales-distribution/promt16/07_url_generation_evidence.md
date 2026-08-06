# URL Generation Evidence

## Implementation

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- `publicUrl` added to serialized links: line 435
- `buildAffiliateUrl`: line 439
- URL shape `/r/{linkCode}`: line 449
- allowed query params are set through `setParam`: lines 450-454
- base URL config/fallback: lines 459-474

## Config

The service reads:

- `AFFILIATE_PUBLIC_BASE_URL`

Fallback:

- `https://go.minhhuong.app`

Invalid or unsupported protocols fall back to the safe default.

## Query Params

Implemented params:

- `pkg`
- `campaign`
- `channel`
- `placement`
- `qr`

## Test Evidence

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- link `publicUrl` matches canonical `/r/{linkCode}` URL with package/campaign/channel/placement: lines 174-180
- QR `encodedUrl` contains `/r/{linkCode}`, QR placement, and `qr={qrAssetId}`: lines 283-288

## Deferred

No public redirect route is implemented. Prompt 16 only generates/stores canonical URLs.
