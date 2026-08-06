CREATE TYPE "LearningDeviceType" AS ENUM ('PHONE', 'TABLET', 'COMPUTER', 'UNKNOWN');

CREATE TABLE "LearningUsageDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usageDate" TEXT NOT NULL,
    "deviceType" "LearningDeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "usedSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastRecordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningUsageDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearningUsageDay_userId_usageDate_deviceType_key" ON "LearningUsageDay"("userId", "usageDate", "deviceType");
CREATE INDEX "LearningUsageDay_userId_usageDate_idx" ON "LearningUsageDay"("userId", "usageDate");

ALTER TABLE "LearningUsageDay" ADD CONSTRAINT "LearningUsageDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
