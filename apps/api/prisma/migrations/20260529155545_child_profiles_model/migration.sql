/*
  Warnings:

  - You are about to drop the column `userId` on the `ActivityAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AiChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `familyLinkId` on the `ChildScreenTimeSetting` table. All the data in the column will be lost.
  - You are about to drop the column `familyLinkId` on the `DeviceTimeGrant` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LearningUsageDay` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `FamilyLink` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[childProfileId]` on the table `ChildScreenTimeSetting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[childProfileId,usageDate,deviceType]` on the table `LearningUsageDay` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[childProfileId,lessonId]` on the table `LessonProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `childProfileId` to the `ActivityAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childProfileId` to the `AiChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childProfileId` to the `ChildScreenTimeSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childProfileId` to the `DeviceTimeGrant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childProfileId` to the `LearningUsageDay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childProfileId` to the `LessonProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childProfileId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ActivityAttempt" DROP CONSTRAINT "ActivityAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "AiChatSession" DROP CONSTRAINT "AiChatSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChildScreenTimeSetting" DROP CONSTRAINT "ChildScreenTimeSetting_familyLinkId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceTimeGrant" DROP CONSTRAINT "DeviceTimeGrant_familyLinkId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyLink" DROP CONSTRAINT "FamilyLink_childId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyLink" DROP CONSTRAINT "FamilyLink_parentId_fkey";

-- DropForeignKey
ALTER TABLE "LearningUsageDay" DROP CONSTRAINT "LearningUsageDay_userId_fkey";

-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropIndex
DROP INDEX "ActivityAttempt_userId_activityId_submittedAt_idx";

-- DropIndex
DROP INDEX "ChildScreenTimeSetting_familyLinkId_key";

-- DropIndex
DROP INDEX "DeviceTimeGrant_familyLinkId_usageDate_idx";

-- DropIndex
DROP INDEX "LearningUsageDay_userId_usageDate_deviceType_key";

-- DropIndex
DROP INDEX "LearningUsageDay_userId_usageDate_idx";

-- DropIndex
DROP INDEX "LessonProgress_userId_isFavorite_idx";

-- DropIndex
DROP INDEX "LessonProgress_userId_lastWatchedAt_idx";

-- DropIndex
DROP INDEX "LessonProgress_userId_lessonId_key";

-- DropIndex
DROP INDEX "Subscription_userId_status_idx";

-- AlterTable
ALTER TABLE "ActivationOrder" ADD COLUMN     "childProfileId" TEXT;

-- AlterTable
ALTER TABLE "ActivityAttempt" DROP COLUMN "userId",
ADD COLUMN     "childProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AiChatSession" DROP COLUMN "userId",
ADD COLUMN     "childProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ChildScreenTimeSetting" DROP COLUMN "familyLinkId",
ADD COLUMN     "childProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DeviceTimeGrant" DROP COLUMN "familyLinkId",
ADD COLUMN     "childProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LearningUsageDay" DROP COLUMN "userId",
ADD COLUMN     "childProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "userId",
ADD COLUMN     "childProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "userId",
ADD COLUMN     "childProfileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "FamilyLink";

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChildProfile_parentId_idx" ON "ChildProfile"("parentId");

-- CreateIndex
CREATE INDEX "ActivationOrder_childProfileId_idx" ON "ActivationOrder"("childProfileId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_childProfileId_activityId_submittedAt_idx" ON "ActivityAttempt"("childProfileId", "activityId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChildScreenTimeSetting_childProfileId_key" ON "ChildScreenTimeSetting"("childProfileId");

-- CreateIndex
CREATE INDEX "DeviceTimeGrant_childProfileId_usageDate_idx" ON "DeviceTimeGrant"("childProfileId", "usageDate");

-- CreateIndex
CREATE INDEX "LearningUsageDay_childProfileId_usageDate_idx" ON "LearningUsageDay"("childProfileId", "usageDate");

-- CreateIndex
CREATE UNIQUE INDEX "LearningUsageDay_childProfileId_usageDate_deviceType_key" ON "LearningUsageDay"("childProfileId", "usageDate", "deviceType");

-- CreateIndex
CREATE INDEX "LessonProgress_childProfileId_isFavorite_idx" ON "LessonProgress"("childProfileId", "isFavorite");

-- CreateIndex
CREATE INDEX "LessonProgress_childProfileId_lastWatchedAt_idx" ON "LessonProgress"("childProfileId", "lastWatchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_childProfileId_lessonId_key" ON "LessonProgress"("childProfileId", "lessonId");

-- CreateIndex
CREATE INDEX "Subscription_childProfileId_status_idx" ON "Subscription"("childProfileId", "status");

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildScreenTimeSetting" ADD CONSTRAINT "ChildScreenTimeSetting_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningUsageDay" ADD CONSTRAINT "LearningUsageDay_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceTimeGrant" ADD CONSTRAINT "DeviceTimeGrant_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationOrder" ADD CONSTRAINT "ActivationOrder_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
