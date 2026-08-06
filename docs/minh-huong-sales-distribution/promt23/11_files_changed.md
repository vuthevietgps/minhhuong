# Files Changed

## Application

- `apps/api/prisma/schema.prisma`
  - Added nullable `CommissionEarning.attributionSnapshotJson`.
- `apps/api/prisma/migrations/20260615090000_commission_attribution_snapshot/migration.sql`
  - Adds nullable JSONB column with no backfill.
- `apps/api/src/activation-orders/activation-orders.service.ts`
  - Added commission attribution resolver/parser.
  - Wires sanitized immutable order snapshot proof into approve-time commission creation.
  - Keeps existing non-affiliate fallback and amount/rate policy.
- `apps/api/src/activation-orders/activation-orders.service.spec.ts`
  - Added affiliate order snapshot fixture.
  - Added immutable snapshot/mutable link independence/privacy test.
  - Added malformed snapshot deterministic failure test.
  - Extended idempotency test to affiliate-attributed approval.
  - Added non-affiliate no-proof assertion.

## Evidence Packet

- `docs/minh-huong-sales-distribution/promt23/*`
