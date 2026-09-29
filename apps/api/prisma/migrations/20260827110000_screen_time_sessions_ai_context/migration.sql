-- Session-based screen-time controls.
CREATE TYPE "LearningAppSessionStatus" AS ENUM ('ACTIVE', 'BREAK_REQUIRED', 'ENDED');

ALTER TABLE "ChildScreenTimeSetting"
  ADD COLUMN "sessionLimitMinutes" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "breakMinutes" INTEGER NOT NULL DEFAULT 10;

CREATE TABLE "LearningAppSession" (
  "id" TEXT NOT NULL,
  "childProfileId" TEXT NOT NULL,
  "deviceKey" TEXT NOT NULL,
  "status" "LearningAppSessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "activeSeconds" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "breakUntil" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearningAppSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LearningAppSession_childProfileId_status_lastHeartbeatAt_idx"
  ON "LearningAppSession"("childProfileId", "status", "lastHeartbeatAt");
CREATE INDEX "LearningAppSession_childProfileId_deviceKey_createdAt_idx"
  ON "LearningAppSession"("childProfileId", "deviceKey", "createdAt");
ALTER TABLE "LearningAppSession" ADD CONSTRAINT "LearningAppSession_childProfileId_fkey"
  FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Shared, deduplicated AI context library.
CREATE TYPE "AiContextSourceKind" AS ENUM ('YOUTUBE', 'MANUAL_SCRIPT');
CREATE TYPE "AiContextProcessingStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

CREATE TABLE "AiContextSource" (
  "id" TEXT NOT NULL,
  "kind" "AiContextSourceKind" NOT NULL,
  "canonicalKey" TEXT NOT NULL,
  "youtubeVideoId" TEXT,
  "sourceUrl" TEXT,
  "title" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'vi',
  "rawTranscript" TEXT NOT NULL,
  "transcriptHash" TEXT NOT NULL,
  "structuredContent" TEXT,
  "processingStatus" "AiContextProcessingStatus" NOT NULL DEFAULT 'PROCESSING',
  "processingVersion" TEXT NOT NULL DEFAULT 'context-v1',
  "errorMessage" TEXT,
  "rightsBasis" TEXT NOT NULL,
  "rightsConfirmedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiContextSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiContextAudience" (
  "sourceId" TEXT NOT NULL,
  "accountRole" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiContextAudience_pkey" PRIMARY KEY ("sourceId", "accountRole")
);

CREATE UNIQUE INDEX "AiContextSource_canonicalKey_key" ON "AiContextSource"("canonicalKey");
CREATE UNIQUE INDEX "AiContextSource_transcriptHash_key" ON "AiContextSource"("transcriptHash");
CREATE INDEX "AiContextSource_processingStatus_createdAt_idx" ON "AiContextSource"("processingStatus", "createdAt");
CREATE INDEX "AiContextSource_youtubeVideoId_idx" ON "AiContextSource"("youtubeVideoId");
CREATE INDEX "AiContextAudience_accountRole_sourceId_idx" ON "AiContextAudience"("accountRole", "sourceId");
ALTER TABLE "AiContextSource" ADD CONSTRAINT "AiContextSource_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiContextAudience" ADD CONSTRAINT "AiContextAudience_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "AiContextSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
