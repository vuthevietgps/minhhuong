# Migration Reconciliation Evidence

## Migration File

File: `apps/api/prisma/migrations/20260614170000_reconcile_channel_scope_history/migration.sql`

Evidence:

- enum values `DIRECTOR` and `MANAGER`: lines 5-6
- channel hierarchy columns: lines 8-12
- deterministic recursive lineage/root/depth backfill: lines 14-48
- fallback own-root backfill for disconnected rows: lines 50-55
- parent/root/lineage indexes: lines 57-59
- guarded parent self-FK with `NOT VALID`: lines 61-76
- `CommissionEarning.depth`, `availableAt`, `releasedAt`: lines 78-81
- `CommissionEarning.status` default alignment: lines 83-84
- `CommissionEarning_status_availableAt_idx`: line 86
- `ActivationOrder.trialEndsAt`: lines 88-89
- `ActivationOrder_trialEndsAt_idx`: line 91

## Safety Notes

The migration uses:

- `ADD VALUE IF NOT EXISTS`;
- `ADD COLUMN IF NOT EXISTS`;
- `CREATE INDEX IF NOT EXISTS`;
- guarded constraint creation through `pg_constraint`;
- nullable/defaulted additions;
- deterministic tree backfill based only on existing `parentParticipantId` relationships.

No fuzzy matching was used. Existing rows without a parent become their own root with lineage `/<id>/` and depth `0`.

The parent self-FK is added as `NOT VALID` to avoid breaking migration on legacy rows that may contain invalid parent IDs in environments where the column already exists. New writes are still constrained.

