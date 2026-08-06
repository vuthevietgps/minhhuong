# Schema Migration Inventory

## Prisma Schema

Schema additions:

- `PackageEntitlementStatus` enum.
- `PackageEntitlement` model.
- `ActivationPackage.version`.
- `ActivationPackage.entitlements`.
- `ActivationOrder.entitlementSnapshotJson`.
- `Subscription.entitlementSnapshotJson`.

Evidence:

- `apps/api/prisma/schema.prisma:119`
- `apps/api/prisma/schema.prisma:769`
- `apps/api/prisma/schema.prisma:996`
- `apps/api/prisma/schema.prisma:1049`
- `apps/api/prisma/schema.prisma:1055`
- `apps/api/prisma/schema.prisma:1060`

## Migration

Migration:

- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql`

Adds:

- enum `PackageEntitlementStatus`;
- nullable snapshot JSONB columns;
- `ActivationPackage.version`;
- `PackageEntitlement` table;
- FK to `ActivationPackage`;
- indexes on `packageId` and `(entitlementKey, status)`;
- partial unique index for active `(packageId, entitlementKey)`;
- deterministic direct backfill.

Evidence:

- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:4`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:7`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:10`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:13`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:15`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:33`
- `apps/api/prisma/migrations/20260614190000_package_entitlement_snapshot/migration.sql:43`

## Migration Deploy Proof

`package-entitlement-migration.integration.spec.ts` creates a temp PostgreSQL DB, runs `prisma migrate deploy`, and asserts table, columns, indexes, and FK exist.

Evidence:

- `apps/api/src/package-entitlement/package-entitlement-migration.integration.spec.ts:22`
- `apps/api/src/package-entitlement/package-entitlement-migration.integration.spec.ts:34`
- `apps/api/src/package-entitlement/package-entitlement-migration.integration.spec.ts:66`
- `apps/api/src/package-entitlement/package-entitlement-migration.integration.spec.ts:115`
