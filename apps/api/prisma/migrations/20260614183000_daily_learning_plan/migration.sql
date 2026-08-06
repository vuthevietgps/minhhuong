CREATE TYPE "DailyLearningPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'SKIPPED', 'EXPIRED');
CREATE TYPE "DailyLearningPlanContentSourceMode" AS ENUM ('ASSIGNED_PATH', 'UNASSIGNED_FALLBACK');
CREATE TYPE "DailyLearningPlanGeneratedBy" AS ENUM ('SYSTEM_RULE');
CREATE TYPE "DailyLearningPlanItemType" AS ENUM ('VIDEO', 'PRACTICE', 'REVIEW', 'AI_CONVERSATION', 'REWARD');
CREATE TYPE "DailyLearningPlanItemStatus" AS ENUM ('READY', 'STARTED', 'COMPLETED', 'SKIPPED', 'LOCKED');

CREATE TABLE "DailyLearningPlan" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "planDate" TEXT NOT NULL,
    "status" "DailyLearningPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "contentSourceMode" "DailyLearningPlanContentSourceMode" NOT NULL,
    "contentPackageId" TEXT,
    "learningPathId" TEXT,
    "targetMinutes" INTEGER,
    "generatedBy" "DailyLearningPlanGeneratedBy" NOT NULL DEFAULT 'SYSTEM_RULE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLearningPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyLearningPlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "itemType" "DailyLearningPlanItemType" NOT NULL,
    "lessonId" TEXT,
    "activityId" TEXT,
    "learningPathItemId" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "status" "DailyLearningPlanItemStatus" NOT NULL DEFAULT 'READY',
    "minWatchPercent" INTEGER,
    "minScore" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLearningPlanItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyLearningPlan_childProfileId_planDate_key" ON "DailyLearningPlan"("childProfileId", "planDate");
CREATE INDEX "DailyLearningPlan_childProfileId_status_planDate_idx" ON "DailyLearningPlan"("childProfileId", "status", "planDate");
CREATE INDEX "DailyLearningPlan_contentPackageId_idx" ON "DailyLearningPlan"("contentPackageId");
CREATE INDEX "DailyLearningPlan_learningPathId_idx" ON "DailyLearningPlan"("learningPathId");

CREATE UNIQUE INDEX "DailyLearningPlanItem_planId_sequence_key" ON "DailyLearningPlanItem"("planId", "sequence");
CREATE INDEX "DailyLearningPlanItem_planId_status_idx" ON "DailyLearningPlanItem"("planId", "status");
CREATE INDEX "DailyLearningPlanItem_lessonId_idx" ON "DailyLearningPlanItem"("lessonId");
CREATE INDEX "DailyLearningPlanItem_activityId_idx" ON "DailyLearningPlanItem"("activityId");
CREATE INDEX "DailyLearningPlanItem_learningPathItemId_idx" ON "DailyLearningPlanItem"("learningPathItemId");

ALTER TABLE "DailyLearningPlan"
ADD CONSTRAINT "DailyLearningPlan_childProfileId_fkey"
FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyLearningPlan"
ADD CONSTRAINT "DailyLearningPlan_contentPackageId_fkey"
FOREIGN KEY ("contentPackageId") REFERENCES "ContentPackage"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DailyLearningPlan"
ADD CONSTRAINT "DailyLearningPlan_learningPathId_fkey"
FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DailyLearningPlanItem"
ADD CONSTRAINT "DailyLearningPlanItem_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "DailyLearningPlan"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyLearningPlanItem"
ADD CONSTRAINT "DailyLearningPlanItem_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DailyLearningPlanItem"
ADD CONSTRAINT "DailyLearningPlanItem_activityId_fkey"
FOREIGN KEY ("activityId") REFERENCES "Activity"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DailyLearningPlanItem"
ADD CONSTRAINT "DailyLearningPlanItem_learningPathItemId_fkey"
FOREIGN KEY ("learningPathItemId") REFERENCES "LearningPathItem"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
