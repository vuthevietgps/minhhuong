-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CommissionBeneficiaryType" AS ENUM ('SALE', 'AGENCY');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'AVAILABLE', 'CANCELED');

-- CreateEnum
CREATE TYPE "CommissionLedgerEntryType" AS ENUM ('CREDIT', 'DEBIT', 'HOLD', 'RELEASE');

-- CreateEnum
CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "ActivationOrder" ADD COLUMN     "agencyId" TEXT;

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AgencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "defaultRateBps" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyMember" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "rateBps" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionPolicy" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "beneficiaryType" "CommissionBeneficiaryType" NOT NULL,
    "rateBps" INTEGER NOT NULL,
    "isDefaultForSale" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultForAgency" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionEarning" (
    "id" TEXT NOT NULL,
    "activationOrderId" TEXT NOT NULL,
    "beneficiaryType" "CommissionBeneficiaryType" NOT NULL,
    "beneficiaryUserId" TEXT,
    "beneficiaryAgencyId" TEXT,
    "policyId" TEXT,
    "baseAmountCents" INTEGER NOT NULL,
    "rateBps" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" "CommissionStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionLedgerEntry" (
    "id" TEXT NOT NULL,
    "beneficiaryUserId" TEXT,
    "beneficiaryAgencyId" TEXT,
    "type" "CommissionLedgerEntryType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "reason" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "beneficiaryUserId" TEXT,
    "beneficiaryAgencyId" TEXT,
    "reviewedById" TEXT,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "bankName" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "bankAccountName" TEXT NOT NULL,
    "requestNotes" TEXT,
    "reviewNotes" TEXT,
    "payoutInvoiceUrl" TEXT,
    "payoutInvoiceStorageKey" TEXT,
    "payoutInvoiceMimeType" TEXT,
    "payoutInvoiceFileSizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agency_code_key" ON "Agency"("code");

-- CreateIndex
CREATE INDEX "Agency_status_idx" ON "Agency"("status");

-- CreateIndex
CREATE INDEX "AgencyMember_userId_isActive_idx" ON "AgencyMember"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyMember_agencyId_userId_key" ON "AgencyMember"("agencyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionPolicy_code_key" ON "CommissionPolicy"("code");

-- CreateIndex
CREATE INDEX "CommissionPolicy_beneficiaryType_isActive_idx" ON "CommissionPolicy"("beneficiaryType", "isActive");

-- CreateIndex
CREATE INDEX "CommissionEarning_activationOrderId_idx" ON "CommissionEarning"("activationOrderId");

-- CreateIndex
CREATE INDEX "CommissionEarning_beneficiaryUserId_status_idx" ON "CommissionEarning"("beneficiaryUserId", "status");

-- CreateIndex
CREATE INDEX "CommissionEarning_beneficiaryAgencyId_status_idx" ON "CommissionEarning"("beneficiaryAgencyId", "status");

-- CreateIndex
CREATE INDEX "CommissionLedgerEntry_beneficiaryUserId_createdAt_idx" ON "CommissionLedgerEntry"("beneficiaryUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CommissionLedgerEntry_beneficiaryAgencyId_createdAt_idx" ON "CommissionLedgerEntry"("beneficiaryAgencyId", "createdAt");

-- CreateIndex
CREATE INDEX "PayoutRequest_beneficiaryUserId_status_idx" ON "PayoutRequest"("beneficiaryUserId", "status");

-- CreateIndex
CREATE INDEX "PayoutRequest_beneficiaryAgencyId_status_idx" ON "PayoutRequest"("beneficiaryAgencyId", "status");

-- CreateIndex
CREATE INDEX "PayoutRequest_status_createdAt_idx" ON "PayoutRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ActivationOrder_agencyId_idx" ON "ActivationOrder"("agencyId");

-- AddForeignKey
ALTER TABLE "AgencyMember" ADD CONSTRAINT "AgencyMember_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyMember" ADD CONSTRAINT "AgencyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEarning" ADD CONSTRAINT "CommissionEarning_activationOrderId_fkey" FOREIGN KEY ("activationOrderId") REFERENCES "ActivationOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEarning" ADD CONSTRAINT "CommissionEarning_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEarning" ADD CONSTRAINT "CommissionEarning_beneficiaryAgencyId_fkey" FOREIGN KEY ("beneficiaryAgencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEarning" ADD CONSTRAINT "CommissionEarning_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "CommissionPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionLedgerEntry" ADD CONSTRAINT "CommissionLedgerEntry_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionLedgerEntry" ADD CONSTRAINT "CommissionLedgerEntry_beneficiaryAgencyId_fkey" FOREIGN KEY ("beneficiaryAgencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_beneficiaryAgencyId_fkey" FOREIGN KEY ("beneficiaryAgencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationOrder" ADD CONSTRAINT "ActivationOrder_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
