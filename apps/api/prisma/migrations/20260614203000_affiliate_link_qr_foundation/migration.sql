-- CreateEnum
CREATE TYPE "AffiliateLinkStatus" AS ENUM ('ACTIVE', 'PAUSED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AffiliateQrAssetStatus" AS ENUM ('ACTIVE', 'PAUSED', 'REVOKED');

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "agencyId" TEXT,
    "agencyMemberId" TEXT,
    "createdById" TEXT NOT NULL,
    "referralCode" TEXT,
    "linkCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "campaign" TEXT,
    "channel" TEXT,
    "placement" TEXT,
    "packageCode" TEXT,
    "packageScopeJson" JSONB,
    "status" "AffiliateLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateQrAsset" (
    "id" TEXT NOT NULL,
    "affiliateLinkId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "label" TEXT,
    "placement" TEXT,
    "encodedUrl" TEXT NOT NULL,
    "qrImageUrl" TEXT,
    "status" "AffiliateQrAssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateQrAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateLink_linkCode_key" ON "AffiliateLink"("linkCode");

-- CreateIndex
CREATE INDEX "AffiliateLink_participantId_status_idx" ON "AffiliateLink"("participantId", "status");

-- CreateIndex
CREATE INDEX "AffiliateLink_agencyId_status_idx" ON "AffiliateLink"("agencyId", "status");

-- CreateIndex
CREATE INDEX "AffiliateLink_campaign_idx" ON "AffiliateLink"("campaign");

-- CreateIndex
CREATE INDEX "AffiliateLink_createdAt_idx" ON "AffiliateLink"("createdAt");

-- CreateIndex
CREATE INDEX "AffiliateQrAsset_affiliateLinkId_status_idx" ON "AffiliateQrAsset"("affiliateLinkId", "status");

-- CreateIndex
CREATE INDEX "AffiliateQrAsset_placement_idx" ON "AffiliateQrAsset"("placement");

-- CreateIndex
CREATE INDEX "AffiliateQrAsset_createdAt_idx" ON "AffiliateQrAsset"("createdAt");

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ChannelParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_agencyMemberId_fkey" FOREIGN KEY ("agencyMemberId") REFERENCES "AgencyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateQrAsset" ADD CONSTRAINT "AffiliateQrAsset_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "AffiliateLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateQrAsset" ADD CONSTRAINT "AffiliateQrAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
