# Backfill Migration Evidence

## Backfill Rules Implemented

Migration:

- `apps/api/prisma/migrations/20260614162000_subscription_traceability/migration.sql`

| Rule | Classification | Evidence |
| --- | --- | --- |
| Add fields nullable first | DIRECT | migration `:1-4`. |
| Backfill `sourceOrderId` only by direct `providerRef = ActivationOrder.id` | DIRECT | migration `:6-12`. |
| Backfill `activationPackageId` only through linked order package code | DIRECT | migration `:14-22`. |
| Non-matching rows remain null | DIRECT | update statements only touch rows with direct matches. |
| No fuzzy matching | DIRECT | migration uses only `providerRef`, `ActivationOrder.id`, `ActivationOrder.packageCode`, and `ActivationPackage.code`. |
| `providerRef` retained | DIRECT | schema still contains `providerRef`; migration does not drop it. |

## Live Data Application

The migration file was created but not applied to a live database during this prompt. `npm --prefix apps/api run prisma:generate` was run and passed against the updated schema.

## Unique Constraint

No unique constraint was added on `sourceOrderId` in this slice. Reason: live legacy duplicates cannot be audited here, and a unique index could turn a safe nullable backfill into a migration failure. This is the conditional item for Prompt 6.

