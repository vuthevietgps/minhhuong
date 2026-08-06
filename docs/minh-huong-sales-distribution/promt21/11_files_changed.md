# Files Changed

## Source

- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
  - added `ExportAffiliateOrderAttributionsQueryDto`
  - added list export `limit` validation, max 1000

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
  - added list CSV export route
  - added aggregate CSV export route
  - added CSV response headers

- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
  - added deterministic list CSV headers
  - added deterministic aggregate CSV headers
  - added `exportOrderAttributionsCsv`
  - added `exportOrderAttributionAggregatesCsv`
  - added safe CSV serialization helpers
  - added list export limit guard
  - added export row whitelist serializer

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
  - added list/aggregate CSV export behavior test
  - added CSV scope test
  - added invalid export query test
  - added controller header assertion
  - added additional USD approved order helper for currency safety

## Evidence Packet

- `docs/minh-huong-sales-distribution/promt21/*`
