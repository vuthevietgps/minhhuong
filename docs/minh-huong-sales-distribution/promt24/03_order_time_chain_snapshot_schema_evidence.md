# Order-Time Chain Snapshot Schema Evidence

## Schema

Added nullable JSON field:

- `ActivationOrder.commissionChainSnapshotJson Json?`

Evidence:

- `apps/api/prisma/schema.prisma:1106`

## Migration

Added narrow no-backfill migration:

- `apps/api/prisma/migrations/20260615100000_activation_order_commission_chain_snapshot/migration.sql`

Migration SQL:

```sql
ALTER TABLE "ActivationOrder" ADD COLUMN "commissionChainSnapshotJson" JSONB;
```

## Snapshot Shape

The snapshot stores:

- `source: affiliate_order_snapshot`
- `policyVersion: commission_chain_v1`
- `snapshottedAt`
- `rootParticipantId`
- `items[]` with `depth`, `participantId`, `beneficiaryType`, `beneficiaryId`, `rateBps`, `agencyId`, `agencyMemberId`, and `parentParticipantId`

Evidence:

- `apps/api/src/activation-orders/activation-orders.service.ts:2038`
- `apps/api/src/activation-orders/activation-orders.service.ts:2088`
