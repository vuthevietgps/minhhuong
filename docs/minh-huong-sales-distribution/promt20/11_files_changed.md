# Files Changed

## Source

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
  - added shared `AffiliateOrderAttributionFiltersDto`
  - added aggregate `groupBy`, `sortBy`, `sortDirection`, and `limit` DTOs
  - kept list pagination in `ListAffiliateOrderAttributionsQueryDto`

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
  - added `GET /channel-affiliate/order-attributions/aggregates`
  - reused `channelAffiliateViewRoles`

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
  - added aggregate group mapping
  - added `listOrderAttributionAggregates`
  - reused Prompt 19 filter/scope helper
  - added aggregate validation, sorting, serialization, and currency-safe approved amount helpers

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
  - added aggregate behavior test
  - added aggregate scope test
  - added invalid aggregate query test
  - added aggregate helper `aggregateItemByKey`

## Evidence Packet

- `docs/minh-huong-sales-distribution/promt20/*`
