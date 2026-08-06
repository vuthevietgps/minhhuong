# Files Changed

## Schema And Migration

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260614143000_order_history_idempotency/migration.sql`

## Source

- `apps/api/src/commercial-idempotency.ts`
- `apps/api/src/activation-orders/activation-orders.controller.ts`
- `apps/api/src/activation-orders/activation-orders.service.ts`
- `apps/api/src/channel-finance/channel-finance.controller.ts`
- `apps/api/src/channel-finance/channel-finance.service.ts`

## Tests

- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
- `apps/api/src/channel-finance/channel-finance.service.spec.ts`

## Generated/Build

- `npm --prefix apps/api run prisma:generate` was run after schema changes.
- `npm --prefix apps/api run build` was run and may refresh local build artifacts under `apps/api/dist`.

## Reports

- All files under `docs/minh-huong-sales-distribution/promt4/`.
