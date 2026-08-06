-- Prompt 11: package entitlement definitions and immutable order/subscription
-- snapshots. Additive and nullable for backward-compatible deployment.

CREATE TYPE "PackageEntitlementStatus" AS ENUM ('ACTIVE', 'INACTIVE');

ALTER TABLE "ActivationPackage"
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "ActivationOrder"
ADD COLUMN "entitlementSnapshotJson" JSONB;

ALTER TABLE "Subscription"
ADD COLUMN "entitlementSnapshotJson" JSONB;

CREATE TABLE "PackageEntitlement" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "entitlementKey" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "status" "PackageEntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageEntitlement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PackageEntitlement_packageId_idx"
ON "PackageEntitlement"("packageId");

CREATE INDEX "PackageEntitlement_entitlementKey_status_idx"
ON "PackageEntitlement"("entitlementKey", "status");

CREATE UNIQUE INDEX "PackageEntitlement_packageId_entitlementKey_active_key"
ON "PackageEntitlement"("packageId", "entitlementKey")
WHERE "status" = 'ACTIVE';

ALTER TABLE "PackageEntitlement"
ADD CONSTRAINT "PackageEntitlement_packageId_fkey"
FOREIGN KEY ("packageId") REFERENCES "ActivationPackage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Deterministic direct backfill for existing activation orders. Historical
-- rows did not capture entitlement rows at sale time, so legacy snapshots keep
-- entitlements empty instead of pretending current package definitions applied.
UPDATE "ActivationOrder" AS ao
SET "entitlementSnapshotJson" = jsonb_strip_nulls(jsonb_build_object(
    'packageId', ap."id",
    'packageCode', COALESCE(ap."code", ao."packageCode"),
    'packageName', COALESCE(ap."name", ao."packageName"),
    'packageVersion', COALESCE(ap."version", 1),
    'amountVnd', CAST(ROUND(ao."amountCents"::numeric / 100) AS INTEGER),
    'durationDays', COALESCE(ao."durationDays", ao."requestedDurationDays", ap."durationDays", 0),
    'entitlements', '[]'::jsonb,
    'capturedAt', to_char(ao."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'snapshotSource', 'LEGACY_ORDER_FIELDS'
))
FROM "ActivationPackage" AS ap
WHERE ao."entitlementSnapshotJson" IS NULL
  AND ao."packageCode" = ap."code";

UPDATE "ActivationOrder" AS ao
SET "entitlementSnapshotJson" = jsonb_strip_nulls(jsonb_build_object(
    'packageCode', ao."packageCode",
    'packageName', ao."packageName",
    'amountVnd', CAST(ROUND(ao."amountCents"::numeric / 100) AS INTEGER),
    'durationDays', COALESCE(ao."durationDays", ao."requestedDurationDays", 0),
    'entitlements', '[]'::jsonb,
    'capturedAt', to_char(ao."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'snapshotSource', 'LEGACY_ORDER_FIELDS',
    'customPackage', true
))
WHERE ao."entitlementSnapshotJson" IS NULL;

UPDATE "Subscription" AS s
SET "entitlementSnapshotJson" = ao."entitlementSnapshotJson"
FROM "ActivationOrder" AS ao
WHERE s."entitlementSnapshotJson" IS NULL
  AND s."sourceOrderId" = ao."id"
  AND ao."entitlementSnapshotJson" IS NOT NULL;

UPDATE "Subscription" AS s
SET "entitlementSnapshotJson" = ao."entitlementSnapshotJson"
FROM "ActivationOrder" AS ao
WHERE s."entitlementSnapshotJson" IS NULL
  AND s."providerRef" = ao."id"
  AND ao."entitlementSnapshotJson" IS NOT NULL;
