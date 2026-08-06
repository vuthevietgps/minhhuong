-- Reconcile migration history with the channel hierarchy fields used by
-- commercial scope filters. Keep additions nullable/defaulted so existing
-- legacy rows can migrate without fuzzy matching.

ALTER TYPE "ChannelParticipantType" ADD VALUE IF NOT EXISTS 'DIRECTOR';
ALTER TYPE "ChannelParticipantType" ADD VALUE IF NOT EXISTS 'MANAGER';

ALTER TABLE "ChannelParticipant"
ADD COLUMN IF NOT EXISTS "parentParticipantId" TEXT,
ADD COLUMN IF NOT EXISTS "rootParticipantId" TEXT,
ADD COLUMN IF NOT EXISTS "lineage" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "depth" INTEGER NOT NULL DEFAULT 0;

WITH RECURSIVE participant_tree AS (
    SELECT
        "id",
        "parentParticipantId",
        "id" AS "rootId",
        '/' || "id" || '/' AS "computedLineage",
        0 AS "computedDepth"
    FROM "ChannelParticipant"
    WHERE "parentParticipantId" IS NULL

    UNION ALL

    SELECT
        child."id",
        child."parentParticipantId",
        participant_tree."rootId",
        participant_tree."computedLineage" || child."id" || '/',
        participant_tree."computedDepth" + 1
    FROM "ChannelParticipant" child
    JOIN participant_tree ON child."parentParticipantId" = participant_tree."id"
    WHERE participant_tree."computedDepth" < 50
)
UPDATE "ChannelParticipant" participant
SET
    "rootParticipantId" = COALESCE(NULLIF(participant."rootParticipantId", ''), participant_tree."rootId"),
    "lineage" = CASE
        WHEN participant."lineage" IS NULL OR participant."lineage" = '' THEN participant_tree."computedLineage"
        ELSE participant."lineage"
    END,
    "depth" = CASE
        WHEN participant."lineage" IS NULL OR participant."lineage" = '' THEN participant_tree."computedDepth"
        ELSE participant."depth"
    END
FROM participant_tree
WHERE participant."id" = participant_tree."id";

UPDATE "ChannelParticipant"
SET
    "rootParticipantId" = COALESCE(NULLIF("rootParticipantId", ''), "id"),
    "lineage" = '/' || "id" || '/',
    "depth" = 0
WHERE "lineage" IS NULL OR "lineage" = '';

CREATE INDEX IF NOT EXISTS "ChannelParticipant_parentParticipantId_idx" ON "ChannelParticipant"("parentParticipantId");
CREATE INDEX IF NOT EXISTS "ChannelParticipant_rootParticipantId_idx" ON "ChannelParticipant"("rootParticipantId");
CREATE INDEX IF NOT EXISTS "ChannelParticipant_lineage_idx" ON "ChannelParticipant"("lineage");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ChannelParticipant_parentParticipantId_fkey'
    ) THEN
        ALTER TABLE "ChannelParticipant"
        ADD CONSTRAINT "ChannelParticipant_parentParticipantId_fkey"
        FOREIGN KEY ("parentParticipantId")
        REFERENCES "ChannelParticipant"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT VALID;
    END IF;
END $$;

ALTER TABLE "CommissionEarning"
ADD COLUMN IF NOT EXISTS "depth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "availableAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);

ALTER TABLE "CommissionEarning"
ALTER COLUMN "status" SET DEFAULT 'PENDING'::"CommissionStatus";

CREATE INDEX IF NOT EXISTS "CommissionEarning_status_availableAt_idx" ON "CommissionEarning"("status", "availableAt");

ALTER TABLE "ActivationOrder"
ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ActivationOrder_trialEndsAt_idx" ON "ActivationOrder"("trialEndsAt");
