# Files Changed

## Runtime And Schema

- `.env.example`
  - added `AFFILIATE_ATTRIBUTION_WINDOW_DAYS=30`
- `apps/api/prisma/schema.prisma`
  - added `ActivationOrder.affiliateAttributionSnapshotJson`
- `apps/api/prisma/migrations/20260614223000_activation_order_affiliate_attribution_snapshot/migration.sql`
  - added nullable JSONB snapshot column
- `apps/api/src/activation-orders/dto/create-activation-order.dto.ts`
  - added optional `affiliateClickId`
- `apps/api/src/activation-orders/dto/create-self-service-activation-order.dto.ts`
  - added optional `affiliateClickId`
- `apps/api/src/activation-orders/activation-orders.service.ts`
  - added click resolution and snapshot builder
  - wired sale-assisted and self-service create paths
  - added attribution window fallback
  - preserved approve/proof lifecycle immutability

## Tests

- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
  - added self-service valid click snapshot test
  - added malformed/not-found/expired/inactive click tests
  - added sale-assisted compatible click test
  - added sale-assisted conflict test
  - added lifecycle immutability assertions
- `apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`
  - added migration deploy proof for new `ActivationOrder` snapshot column

## Packet

- `docs/minh-huong-sales-distribution/promt18/*`
