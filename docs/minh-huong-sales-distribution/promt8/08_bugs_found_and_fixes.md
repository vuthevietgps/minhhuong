# Bugs Found And Fixes

## Migration History Drift

Finding: migration history did not create the current channel hierarchy fields used by commercial scope filters.

Fix: added reconciliation migration:

- `apps/api/prisma/migrations/20260614170000_reconcile_channel_scope_history/migration.sql`

## Enum Drift

Finding: `ChannelParticipantType` migration history only had `SALE` and `AGENCY`, but current schema and scope fixtures require `DIRECTOR` and `MANAGER`.

Fix: added enum values with `ADD VALUE IF NOT EXISTS`.

## Commission Earning Drift

Finding: `CommissionEarning.depth`, `availableAt`, `releasedAt`, and `status/availableAt` index were present in current schema but absent from migration-created DB.

Fix: added missing columns/index and aligned default status to `PENDING`.

## Activation Order Drift

Finding: after switching the DB-backed scope test to `migrate deploy`, `ActivationOrdersService.listOrders` failed because `ActivationOrder.trialEndsAt` was absent from migration-created DB.

Fix: added `ActivationOrder.trialEndsAt` and `ActivationOrder_trialEndsAt_idx` to the reconciliation migration.

## Test Harness Drift

Finding: Prompt 7 DB-backed scope test used `prisma db push`, which proved current schema behavior but not migration deployment behavior.

Fix: changed the harness to `prisma migrate deploy` and added schema assertions before seeding the fixture.

