# Channel Affiliate API Evidence

## Module Registration

- `ChannelAffiliateModule`: `apps/api/src/channel-affiliate/channel-affiliate.module.ts:11`
- imported into app module: `apps/api/src/app.module.ts:12`
- registered in app imports: `apps/api/src/app.module.ts:47`

## Controller

`apps/api/src/channel-affiliate/channel-affiliate.controller.ts`

- controller prefix `channel-affiliate`: line 19
- `GET /channel-affiliate/links`: line 26
- `POST /channel-affiliate/links`: line 35
- `PATCH /channel-affiliate/links/:id`: line 44
- `POST /channel-affiliate/links/:id/qr`: line 54

Runtime app uses URI versioning with default version `1`, so these are exposed under `/v1/...`.

## Roles

`apps/api/src/auth/permissions.ts`

- `channelAffiliateViewRoles`: line 84
- `channelAffiliateManageRoles`: line 93

Roles include:

- `ADMIN`
- `DIRECTOR`
- `OPERATIONS`
- `SALE`
- `AGENCY_OWNER`
- `AGENCY_MANAGER`

## DTOs

`apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`

Implemented DTOs:

- `ListAffiliateLinksQueryDto`
- `CreateAffiliateLinkDto`
- `UpdateAffiliateLinkDto`
- `CreateAffiliateQrAssetDto`

DTOs use class-validator constraints and the global validation pipe keeps whitelist/forbid-non-whitelisted behavior.
