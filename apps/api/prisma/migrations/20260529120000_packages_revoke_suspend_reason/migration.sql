-- AlterEnum: Add REVOKED to ActivationOrderStatus
ALTER TYPE "ActivationOrderStatus" ADD VALUE 'REVOKED';

-- AlterTable: Add suspendReason to User
ALTER TABLE "User" ADD COLUMN "suspendReason" TEXT;

-- AlterTable: Add revoke fields to ActivationOrder
ALTER TABLE "ActivationOrder" ADD COLUMN "revokedById" TEXT;
ALTER TABLE "ActivationOrder" ADD COLUMN "revokedAt" TIMESTAMP(3);
ALTER TABLE "ActivationOrder" ADD COLUMN "revokeReason" TEXT;

-- CreateTable: ActivationPackage
CREATE TABLE "ActivationPackage" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amountVnd" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivationPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivationPackage_code_key" ON "ActivationPackage"("code");

-- CreateIndex
CREATE INDEX "ActivationPackage_isActive_sortOrder_idx" ON "ActivationPackage"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ActivationOrder_revokedById_idx" ON "ActivationOrder"("revokedById");

-- AddForeignKey
ALTER TABLE "ActivationOrder" ADD CONSTRAINT "ActivationOrder_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default packages (migrate from hardcoded values)
INSERT INTO "ActivationPackage" ("id", "code", "name", "description", "amountVnd", "durationDays", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'one-month',    '1 tháng học',   'Gói học 1 tháng',  300000,  30,  true, 1, NOW(), NOW()),
  (gen_random_uuid()::text, 'three-months', '3 tháng học',   'Gói học 3 tháng',  800000,  90,  true, 2, NOW(), NOW()),
  (gen_random_uuid()::text, 'one-year',     '1 năm học',     'Gói học 1 năm',    2400000, 365, true, 3, NOW(), NOW());
