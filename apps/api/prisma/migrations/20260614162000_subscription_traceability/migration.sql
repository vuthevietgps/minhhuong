-- Add nullable traceability fields for commercial activation subscriptions.
ALTER TABLE "Subscription"
ADD COLUMN "sourceOrderId" TEXT,
ADD COLUMN "activationPackageId" TEXT;

-- Direct backfill only: providerRef is already the activation order id for
-- commercial approvals. Non-matching legacy rows remain NULL.
UPDATE "Subscription" AS s
SET "sourceOrderId" = ao."id"
FROM "ActivationOrder" AS ao
WHERE s."sourceOrderId" IS NULL
  AND s."providerRef" = ao."id";

-- Direct package backfill only through the linked order package code.
-- Rows with no linked order or no matching package code remain NULL.
UPDATE "Subscription" AS s
SET "activationPackageId" = ap."id"
FROM "ActivationOrder" AS ao
JOIN "ActivationPackage" AS ap
  ON ao."packageCode" = ap."code"
WHERE s."activationPackageId" IS NULL
  AND s."sourceOrderId" = ao."id";

CREATE INDEX "Subscription_sourceOrderId_idx" ON "Subscription"("sourceOrderId");
CREATE INDEX "Subscription_activationPackageId_idx" ON "Subscription"("activationPackageId");

ALTER TABLE "Subscription"
ADD CONSTRAINT "Subscription_sourceOrderId_fkey"
FOREIGN KEY ("sourceOrderId") REFERENCES "ActivationOrder"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Subscription"
ADD CONSTRAINT "Subscription_activationPackageId_fkey"
FOREIGN KEY ("activationPackageId") REFERENCES "ActivationPackage"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
