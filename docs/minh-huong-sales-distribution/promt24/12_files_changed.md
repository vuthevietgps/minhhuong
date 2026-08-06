# Files Changed

## Application

- `apps/api/prisma/schema.prisma`
  - Added nullable `ActivationOrder.commissionChainSnapshotJson`.
- `apps/api/prisma/migrations/20260615100000_activation_order_commission_chain_snapshot/migration.sql`
  - Adds nullable JSONB order chain snapshot column; no backfill.
- `apps/api/src/activation-orders/activation-orders.service.ts`
  - Builds chain snapshot during affiliate order creation.
  - Parses and consumes chain snapshot during approval.
  - Preserves legacy missing-chain fallback with explicit proof flag.
- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
  - Adds chain snapshot fixtures and tests for creation, approval consumption, mutable hierarchy independence, malformed snapshot failure, privacy, and idempotency.

## Packet

- `docs/minh-huong-sales-distribution/promt24/*`
