# Schema And Migration Inventory

## Prisma Schema

| Evidence | Classification | Notes |
| --- | --- | --- |
| `apps/api/prisma/schema.prisma:634` | DIRECT | `Subscription.sourceOrderId String?` added. |
| `apps/api/prisma/schema.prisma:635` | DIRECT | `Subscription.activationPackageId String?` added. |
| `apps/api/prisma/schema.prisma:645` | DIRECT | `sourceOrder` relation to `ActivationOrder`. |
| `apps/api/prisma/schema.prisma:646` | DIRECT | `activationPackage` relation to `ActivationPackage`. |
| `apps/api/prisma/schema.prisma:650` | DIRECT | `@@index([sourceOrderId])`. |
| `apps/api/prisma/schema.prisma:651` | DIRECT | `@@index([activationPackageId])`. |
| `apps/api/prisma/schema.prisma:893` | DIRECT | Back relation from `ActivationOrder`. |
| `apps/api/prisma/schema.prisma:918` | DIRECT | Back relation from `ActivationPackage`. |

`providerRef` remains present at `apps/api/prisma/schema.prisma:640`.

## Migration

Migration file:

- `apps/api/prisma/migrations/20260614162000_subscription_traceability/migration.sql`

| Evidence | Classification | Notes |
| --- | --- | --- |
| migration `:3-4` | DIRECT | Adds nullable `sourceOrderId` and `activationPackageId`. |
| migration `:9-12` | DIRECT | Backfills `sourceOrderId` only by `providerRef = ActivationOrder.id`. |
| migration `:17-22` | DIRECT | Backfills `activationPackageId` only through linked order package code to package code. |
| migration `:24-25` | DIRECT | Creates indexes for trace fields. |
| migration `:28-34` | DIRECT | Adds foreign keys to `ActivationOrder` and `ActivationPackage`. |

## Unique Guard Decision

`sourceOrderId` was not made unique in this migration. This is intentional because legacy duplicate subscriptions with the same `providerRef` cannot be audited from this local repo. A unique index could fail during migration on legacy data. Duplicate prevention is enforced by approval logic and tests:

- same-key replay does not create duplicate subscriptions;
- stale retry after the order is already claimed does not create duplicate subscriptions.

