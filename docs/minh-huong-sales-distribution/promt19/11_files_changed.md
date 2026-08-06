# Files Changed

## Runtime

- `apps/api/src/channel-affiliate/channel-affiliate.controller.ts`
  - added `GET /channel-affiliate/order-attributions`
  - reused `channelAffiliateViewRoles`
- `apps/api/src/channel-affiliate/channel-affiliate.service.ts`
  - added `listOrderAttributions`
  - added snapshot JSON filter builder
  - added safe serializer/normalizer
  - added page/pageSize guards
- `apps/api/src/channel-affiliate/dto/channel-affiliate.dto.ts`
  - added `ListAffiliateOrderAttributionsQueryDto`

## Tests

- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
  - added report behavior/filter/pagination/privacy/read-only test
  - added scope/RBAC test
  - added invalid query test
  - expanded financial count helper to include wallet, payout, and click events

## Packet

- `docs/minh-huong-sales-distribution/promt19/*`

## No Schema Change

Prompt 19 did not change Prisma schema or add migrations. It reads the Prompt 18 snapshot column.
