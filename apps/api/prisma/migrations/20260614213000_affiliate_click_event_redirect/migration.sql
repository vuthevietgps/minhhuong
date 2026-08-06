-- CreateTable
CREATE TABLE "AffiliateClickEvent" (
    "id" TEXT NOT NULL,
    "affiliateLinkId" TEXT NOT NULL,
    "affiliateQrAssetId" TEXT,
    "participantId" TEXT NOT NULL,
    "agencyId" TEXT,
    "agencyMemberId" TEXT,
    "referralCode" TEXT,
    "clickId" TEXT NOT NULL,
    "dedupeKeyHash" TEXT,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "deviceHint" TEXT,
    "redirectUrl" TEXT NOT NULL,
    "campaign" TEXT,
    "channel" TEXT,
    "placement" TEXT,
    "packageCode" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateClickEvent_clickId_key" ON "AffiliateClickEvent"("clickId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateClickEvent_dedupeKeyHash_key" ON "AffiliateClickEvent"("dedupeKeyHash");

-- CreateIndex
CREATE INDEX "AffiliateClickEvent_affiliateLinkId_createdAt_idx" ON "AffiliateClickEvent"("affiliateLinkId", "createdAt");

-- CreateIndex
CREATE INDEX "AffiliateClickEvent_affiliateQrAssetId_createdAt_idx" ON "AffiliateClickEvent"("affiliateQrAssetId", "createdAt");

-- CreateIndex
CREATE INDEX "AffiliateClickEvent_participantId_createdAt_idx" ON "AffiliateClickEvent"("participantId", "createdAt");

-- CreateIndex
CREATE INDEX "AffiliateClickEvent_campaign_createdAt_idx" ON "AffiliateClickEvent"("campaign", "createdAt");

-- AddForeignKey
ALTER TABLE "AffiliateClickEvent" ADD CONSTRAINT "AffiliateClickEvent_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "AffiliateLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClickEvent" ADD CONSTRAINT "AffiliateClickEvent_affiliateQrAssetId_fkey" FOREIGN KEY ("affiliateQrAssetId") REFERENCES "AffiliateQrAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClickEvent" ADD CONSTRAINT "AffiliateClickEvent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ChannelParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClickEvent" ADD CONSTRAINT "AffiliateClickEvent_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClickEvent" ADD CONSTRAINT "AffiliateClickEvent_agencyMemberId_fkey" FOREIGN KEY ("agencyMemberId") REFERENCES "AgencyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
