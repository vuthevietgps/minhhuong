# Schema Migration Inventory

## Prisma Schema Evidence

`apps/api/prisma/schema.prisma`

- `ActivationOrder.affiliateAttributionSnapshotJson Json?`: line 1104

## Migration Evidence

`apps/api/prisma/migrations/20260614223000_activation_order_affiliate_attribution_snapshot/migration.sql`

- `ALTER TABLE "ActivationOrder"`: line 1
- `ADD COLUMN "affiliateAttributionSnapshotJson" JSONB`: line 2

## Migration Deploy Proof

`apps/api/src/channel-affiliate/channel-affiliate-migration.integration.spec.ts`

- verifies the new `ActivationOrder` column exists: line 154
- checks `affiliateAttributionSnapshotJson`: line 162
- checks PostgreSQL type `jsonb`: line 167

## Data Safety

The migration adds one nullable JSONB column. It does not backfill, delete, update, or rewrite existing order, subscription, payment, commission, ledger, payout, affiliate link, QR, or click rows.
