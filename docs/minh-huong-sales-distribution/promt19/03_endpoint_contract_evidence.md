# Endpoint Contract Evidence

## Route

`apps/api/src/channel-affiliate/channel-affiliate.controller.ts`

- imports `channelAffiliateViewRoles`: line 20
- `GET order-attributions`: line 50
- `@Roles(...channelAffiliateViewRoles)`: line 51
- controller calls `listOrderAttributions`: line 56

Runtime route:

```text
GET /v1/channel-affiliate/order-attributions
```

## DTO

`apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`

- `ListAffiliateOrderAttributionsQueryDto`: line 52

## Service

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- `listOrderAttributions`: line 180
- reads page/pageSize: lines 185-186
- read-only Prisma operations:
  - `count`: line 190
  - `groupBy`: line 191
  - `aggregate`: line 196
  - `findMany`: line 201

## Response Contract

`serializeOrderAttribution`: line 546

Returned item fields:

- `orderId`
- `orderStatus`
- `orderCreatedAt`
- `orderAmountCents`
- `currency`
- `packageCode`
- `packageName`
- `customerEmail`
- `customerDisplayName`
- `affiliateAttribution`

Summary fields:

- `totalOrders`
- `countByStatus`
- `approvedOrders`
- `approvedAmountCents`
