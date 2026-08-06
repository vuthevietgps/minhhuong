# Export Endpoint Contract Evidence

## List Export

Route:

```text
GET /v1/channel-affiliate/order-attributions/export.csv
```

Controller evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:69` declares `@Get('order-attributions/export.csv')`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:70` applies `channelAffiliateViewRoles`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:71` defines `exportOrderAttributionsCsv`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:73` binds `ExportAffiliateOrderAttributionsQueryDto`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:76` sets download headers.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:77` calls `ChannelAffiliateService.exportOrderAttributionsCsv`.

Query contract:

- same Prompt 19 filters via `AffiliateOrderAttributionFiltersDto`
- `limit` optional, default 500, max 1000

DTO evidence:

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts:140` defines `ExportAffiliateOrderAttributionsQueryDto`.

## Aggregate Export

Route:

```text
GET /v1/channel-affiliate/order-attributions/aggregates/export.csv
```

Controller evidence:

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:92` declares `@Get('order-attributions/aggregates/export.csv')`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:93` applies `channelAffiliateViewRoles`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:94` defines `exportOrderAttributionAggregatesCsv`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:96` binds `AffiliateOrderAttributionAggregateQueryDto`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:99` sets download headers.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:100` calls `ChannelAffiliateService.exportOrderAttributionAggregatesCsv`.

Query contract:

- same Prompt 20 `groupBy`
- same Prompt 20 filters
- same Prompt 20 `sortBy`, `sortDirection`, and `limit` 1-100

## Headers

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:43` sets `Content-Type: text/csv; charset=utf-8`.
- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts:44` sets `Content-Disposition`.

Test evidence:

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:837` asserts `Content-Type`.
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts:841` asserts `Content-Disposition`.
