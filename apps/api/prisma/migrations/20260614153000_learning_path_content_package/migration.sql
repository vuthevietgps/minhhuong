-- CreateEnum
CREATE TYPE "LearningPathStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentPackageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChildContentAssignmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'REVOKED');

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "levelId" TEXT,
    "ageBand" TEXT,
    "status" "LearningPathStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "updatedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathItem" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "lessonId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "minScore" INTEGER,
    "minWatchPercent" INTEGER,
    "prerequisiteItemId" TEXT,
    "reviewPolicyJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPackage" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "learningPathId" TEXT NOT NULL,
    "planId" TEXT,
    "status" "ContentPackageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildContentAssignment" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "contentPackageId" TEXT NOT NULL,
    "assignedById" TEXT,
    "status" "ChildContentAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildContentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_code_key" ON "LearningPath"("code");

-- CreateIndex
CREATE INDEX "LearningPath_status_idx" ON "LearningPath"("status");

-- CreateIndex
CREATE INDEX "LearningPath_levelId_status_idx" ON "LearningPath"("levelId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathItem_learningPathId_sequence_key" ON "LearningPathItem"("learningPathId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathItem_learningPathId_lessonId_key" ON "LearningPathItem"("learningPathId", "lessonId");

-- CreateIndex
CREATE INDEX "LearningPathItem_lessonId_idx" ON "LearningPathItem"("lessonId");

-- CreateIndex
CREATE INDEX "LearningPathItem_prerequisiteItemId_idx" ON "LearningPathItem"("prerequisiteItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPackage_code_key" ON "ContentPackage"("code");

-- CreateIndex
CREATE INDEX "ContentPackage_learningPathId_status_idx" ON "ContentPackage"("learningPathId", "status");

-- CreateIndex
CREATE INDEX "ContentPackage_planId_status_idx" ON "ContentPackage"("planId", "status");

-- CreateIndex
CREATE INDEX "ChildContentAssignment_childProfileId_status_idx" ON "ChildContentAssignment"("childProfileId", "status");

-- CreateIndex
CREATE INDEX "ChildContentAssignment_contentPackageId_status_idx" ON "ChildContentAssignment"("contentPackageId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChildContentAssignment_one_active_per_child" ON "ChildContentAssignment"("childProfileId") WHERE "status" = 'ACTIVE';

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathItem" ADD CONSTRAINT "LearningPathItem_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathItem" ADD CONSTRAINT "LearningPathItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathItem" ADD CONSTRAINT "LearningPathItem_prerequisiteItemId_fkey" FOREIGN KEY ("prerequisiteItemId") REFERENCES "LearningPathItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPackage" ADD CONSTRAINT "ContentPackage_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPackage" ADD CONSTRAINT "ContentPackage_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildContentAssignment" ADD CONSTRAINT "ChildContentAssignment_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildContentAssignment" ADD CONSTRAINT "ChildContentAssignment_contentPackageId_fkey" FOREIGN KEY ("contentPackageId") REFERENCES "ContentPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
