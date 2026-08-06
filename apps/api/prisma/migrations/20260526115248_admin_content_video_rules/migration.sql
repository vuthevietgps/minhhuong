/*
  Warnings:

  - Changed the type of `provider` on the `VideoAsset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContentPublishStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VideoProvider" AS ENUM ('INTERNAL', 'YOUTUBE', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "VideoProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- DropIndex
DROP INDEX "Lesson_unitId_sortOrder_idx";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ContentPublishStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "VideoAsset" ADD COLUMN     "embedUrl" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "processingStatus" "VideoProcessingStatus" NOT NULL DEFAULT 'READY',
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uploadedById" TEXT,
DROP COLUMN "provider",
ADD COLUMN     "provider" "VideoProvider" NOT NULL;

-- CreateIndex
CREATE INDEX "Lesson_unitId_status_sortOrder_idx" ON "Lesson"("unitId", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "VideoAsset_lessonId_provider_processingStatus_idx" ON "VideoAsset"("lessonId", "provider", "processingStatus");
