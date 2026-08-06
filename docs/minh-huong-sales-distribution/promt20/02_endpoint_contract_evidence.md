# Endpoint Contract Evidence

## Route

Runtime route:

```text
GET /v1/channel-affiliate/order-attributions/aggregates
```

The app uses URI versioning with default version `1`, matching existing `channel-affiliate` routes.

## Controller Evidence

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:60` declares `@Get('order-attributions/aggregates')`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:61` applies `channelAffiliateViewRoles`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:62` defines `listOrderAttributionAggregates`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:64` binds `AffiliateOrderAttributionAggregateQueryDto`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:66` calls `ChannelAffiliateService.listOrderAttributionAggregates`.

## Query Contract

Required:

- `groupBy`: one of `participant`, `agency`, `agencyMember`, `affiliateLink`, `affiliateQrAsset`, `campaign`, `channel`, `placement`, `package`

Optional filters reused from Prompt 19:

- `participantId`
- `agencyId`
- `agencyMemberId`
- `affiliateLinkId`
- `affiliateQrAssetId`
- `clickId`
- `campaign`
- `channel`
- `placement`
- `packageCode`
- `orderStatus`
- `createdFrom`
- `createdTo`
- `clickFrom`
- `clickTo`

Optional aggregate controls:

- `limit`: 1 to 100, default 50
- `sortBy`: `totalAttributedOrders`, `approvedOrders`, `approvedAmountCents`, `lastOrderCreatedAt`
- `sortDirection`: `asc` or `desc`, default `desc`

## DTO Evidence

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:52` defines shared `AffiliateOrderAttributionFiltersDto`.
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:124` keeps list pagination in `ListAffiliateOrderAttributionsQueryDto`.
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:133` defines aggregate `groupBy` enum.
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:145` defines aggregate `sortBy` enum.
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:152` defines aggregate `sortDirection` enum.
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:165` defines `AffiliateOrderAttributionAggregateQueryDto`.
