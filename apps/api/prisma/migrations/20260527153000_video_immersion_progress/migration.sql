ALTER TABLE "LessonProgress"
ADD COLUMN "watchCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastWatchedAt" TIMESTAMP(3),
ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "LessonProgress_userId_isFavorite_idx" ON "LessonProgress"("userId", "isFavorite");
CREATE INDEX "LessonProgress_userId_lastWatchedAt_idx" ON "LessonProgress"("userId", "lastWatchedAt");
