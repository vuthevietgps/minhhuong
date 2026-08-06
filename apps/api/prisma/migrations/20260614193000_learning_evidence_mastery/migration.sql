CREATE TYPE "VideoExposureEventType" AS ENUM ('STARTED', 'PROGRESSED', 'COMPLETED', 'REPLAYED', 'SKIPPED');
CREATE TYPE "VideoExposureSource" AS ENUM ('RUNTIME_WATCH_EVENT', 'HEARTBEAT', 'MANUAL_SAFE', 'LEGACY_PROGRESS');

CREATE TABLE "VideoExposureLog" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "videoAssetId" TEXT,
    "eventType" "VideoExposureEventType" NOT NULL,
    "positionSec" INTEGER NOT NULL DEFAULT 0,
    "durationWatchedSec" INTEGER NOT NULL DEFAULT 0,
    "watchPercent" INTEGER NOT NULL DEFAULT 0,
    "source" "VideoExposureSource" NOT NULL DEFAULT 'RUNTIME_WATCH_EVENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoExposureLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VideoExposureLog_childProfileId_lessonId_createdAt_idx" ON "VideoExposureLog"("childProfileId", "lessonId", "createdAt");
CREATE INDEX "VideoExposureLog_childProfileId_lessonId_watchPercent_idx" ON "VideoExposureLog"("childProfileId", "lessonId", "watchPercent");
CREATE INDEX "VideoExposureLog_videoAssetId_idx" ON "VideoExposureLog"("videoAssetId");
CREATE INDEX "VideoExposureLog_eventType_createdAt_idx" ON "VideoExposureLog"("eventType", "createdAt");

ALTER TABLE "VideoExposureLog"
ADD CONSTRAINT "VideoExposureLog_childProfileId_fkey"
FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VideoExposureLog"
ADD CONSTRAINT "VideoExposureLog_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VideoExposureLog"
ADD CONSTRAINT "VideoExposureLog_videoAssetId_fkey"
FOREIGN KEY ("videoAssetId") REFERENCES "VideoAsset"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
