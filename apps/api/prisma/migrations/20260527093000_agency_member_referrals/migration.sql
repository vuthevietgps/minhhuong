-- CreateEnum
CREATE TYPE "AgencyMemberRole" AS ENUM ('OWNER', 'MANAGER', 'SALE');

-- AlterTable
ALTER TABLE "AgencyMember"
ADD COLUMN "role" "AgencyMemberRole" NOT NULL DEFAULT 'SALE',
ADD COLUMN "referralCode" TEXT;

-- AlterTable
ALTER TABLE "ActivationOrder"
ADD COLUMN "referrerMemberId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AgencyMember_referralCode_key" ON "AgencyMember"("referralCode");

-- CreateIndex
CREATE INDEX "AgencyMember_agencyId_role_isActive_idx" ON "AgencyMember"("agencyId", "role", "isActive");

-- CreateIndex
CREATE INDEX "ActivationOrder_referrerMemberId_idx" ON "ActivationOrder"("referrerMemberId");

-- AddForeignKey
ALTER TABLE "ActivationOrder"
ADD CONSTRAINT "ActivationOrder_referrerMemberId_fkey"
FOREIGN KEY ("referrerMemberId") REFERENCES "AgencyMember"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
