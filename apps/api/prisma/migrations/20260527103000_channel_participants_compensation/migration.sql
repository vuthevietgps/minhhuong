-- Add a common settlement target for company sales and external agencies.
CREATE TYPE "ChannelParticipantType" AS ENUM ('SALE', 'AGENCY');
CREATE TYPE "ChannelParticipantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

CREATE TABLE "ChannelParticipant" (
    "id" TEXT NOT NULL,
    "type" "ChannelParticipantType" NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" "ChannelParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT,
    "agencyId" TEXT,
    "baseSalaryCents" INTEGER NOT NULL DEFAULT 0,
    "commissionRateBps" INTEGER,
    "kpiBonusConfig" JSONB,
    "penaltyConfig" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelParticipant_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CommissionPolicy"
ADD COLUMN "baseSalaryCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "kpiBonusConfig" JSONB,
ADD COLUMN "penaltyConfig" JSONB;

ALTER TABLE "ActivationOrder" ADD COLUMN "channelParticipantId" TEXT;
ALTER TABLE "CommissionEarning" ADD COLUMN "participantId" TEXT;
ALTER TABLE "CommissionLedgerEntry" ADD COLUMN "participantId" TEXT;
ALTER TABLE "PayoutRequest" ADD COLUMN "participantId" TEXT;

INSERT INTO "ChannelParticipant" (
    "id",
    "type",
    "code",
    "displayName",
    "status",
    "agencyId",
    "baseSalaryCents",
    "commissionRateBps",
    "createdAt",
    "updatedAt"
)
SELECT
    'agency-' || "id",
    'AGENCY'::"ChannelParticipantType",
    "code",
    "name",
    CASE
        WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"ChannelParticipantStatus"
        ELSE 'SUSPENDED'::"ChannelParticipantStatus"
    END,
    "id",
    0,
    NULLIF("defaultRateBps", 0),
    "createdAt",
    "updatedAt"
FROM "Agency"
ON CONFLICT DO NOTHING;

INSERT INTO "ChannelParticipant" (
    "id",
    "type",
    "code",
    "displayName",
    "status",
    "userId",
    "baseSalaryCents",
    "commissionRateBps",
    "createdAt",
    "updatedAt"
)
SELECT
    'sale-' || "User"."id",
    'SALE'::"ChannelParticipantType",
    'SALE-' || upper("User"."id"),
    COALESCE("Profile"."displayName", "User"."email"),
    CASE
        WHEN "User"."status" = 'ACTIVE' THEN 'ACTIVE'::"ChannelParticipantStatus"
        ELSE 'SUSPENDED'::"ChannelParticipantStatus"
    END,
    "User"."id",
    0,
    (
        SELECT "rateBps"
        FROM "CommissionPolicy"
        WHERE "beneficiaryType" = 'SALE'
            AND "isDefaultForSale" = true
            AND "isActive" = true
        ORDER BY "createdAt" DESC
        LIMIT 1
    ),
    "User"."createdAt",
    "User"."updatedAt"
FROM "User"
JOIN "UserRole" ON "UserRole"."userId" = "User"."id"
JOIN "Role" ON "Role"."id" = "UserRole"."roleId" AND "Role"."name" = 'SALE'
LEFT JOIN "Profile" ON "Profile"."userId" = "User"."id"
ON CONFLICT DO NOTHING;

UPDATE "ActivationOrder"
SET "channelParticipantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "ActivationOrder"."agencyId" = "ChannelParticipant"."agencyId"
    AND "ChannelParticipant"."type" = 'AGENCY'
    AND "ActivationOrder"."channelParticipantId" IS NULL;

UPDATE "ActivationOrder"
SET "channelParticipantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "ActivationOrder"."createdById" = "ChannelParticipant"."userId"
    AND "ChannelParticipant"."type" = 'SALE'
    AND "ActivationOrder"."channelParticipantId" IS NULL;

UPDATE "CommissionEarning"
SET "participantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "CommissionEarning"."beneficiaryAgencyId" = "ChannelParticipant"."agencyId"
    AND "ChannelParticipant"."type" = 'AGENCY'
    AND "CommissionEarning"."participantId" IS NULL;

UPDATE "CommissionEarning"
SET "participantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "CommissionEarning"."beneficiaryUserId" = "ChannelParticipant"."userId"
    AND "ChannelParticipant"."type" = 'SALE'
    AND "CommissionEarning"."participantId" IS NULL;

UPDATE "CommissionLedgerEntry"
SET "participantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "CommissionLedgerEntry"."beneficiaryAgencyId" = "ChannelParticipant"."agencyId"
    AND "ChannelParticipant"."type" = 'AGENCY'
    AND "CommissionLedgerEntry"."participantId" IS NULL;

UPDATE "CommissionLedgerEntry"
SET "participantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "CommissionLedgerEntry"."beneficiaryUserId" = "ChannelParticipant"."userId"
    AND "ChannelParticipant"."type" = 'SALE'
    AND "CommissionLedgerEntry"."participantId" IS NULL;

UPDATE "PayoutRequest"
SET "participantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "PayoutRequest"."beneficiaryAgencyId" = "ChannelParticipant"."agencyId"
    AND "ChannelParticipant"."type" = 'AGENCY'
    AND "PayoutRequest"."participantId" IS NULL;

UPDATE "PayoutRequest"
SET "participantId" = "ChannelParticipant"."id"
FROM "ChannelParticipant"
WHERE "PayoutRequest"."beneficiaryUserId" = "ChannelParticipant"."userId"
    AND "ChannelParticipant"."type" = 'SALE'
    AND "PayoutRequest"."participantId" IS NULL;

CREATE UNIQUE INDEX "ChannelParticipant_code_key" ON "ChannelParticipant"("code");
CREATE UNIQUE INDEX "ChannelParticipant_userId_key" ON "ChannelParticipant"("userId");
CREATE UNIQUE INDEX "ChannelParticipant_agencyId_key" ON "ChannelParticipant"("agencyId");
CREATE INDEX "ChannelParticipant_type_status_idx" ON "ChannelParticipant"("type", "status");
CREATE INDEX "ActivationOrder_channelParticipantId_idx" ON "ActivationOrder"("channelParticipantId");
CREATE INDEX "CommissionEarning_participantId_status_idx" ON "CommissionEarning"("participantId", "status");
CREATE INDEX "CommissionLedgerEntry_participantId_createdAt_idx" ON "CommissionLedgerEntry"("participantId", "createdAt");
CREATE INDEX "PayoutRequest_participantId_status_idx" ON "PayoutRequest"("participantId", "status");

ALTER TABLE "ChannelParticipant" ADD CONSTRAINT "ChannelParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChannelParticipant" ADD CONSTRAINT "ChannelParticipant_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActivationOrder" ADD CONSTRAINT "ActivationOrder_channelParticipantId_fkey" FOREIGN KEY ("channelParticipantId") REFERENCES "ChannelParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommissionEarning" ADD CONSTRAINT "CommissionEarning_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ChannelParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommissionLedgerEntry" ADD CONSTRAINT "CommissionLedgerEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ChannelParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ChannelParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
