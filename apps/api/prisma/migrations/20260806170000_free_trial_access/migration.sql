CREATE TABLE "TrialAccess" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "initialAssessmentCount" INTEGER NOT NULL DEFAULT 0,
    "lessonCount" INTEGER NOT NULL DEFAULT 0,
    "aiResponseCount" INTEGER NOT NULL DEFAULT 0,
    "reportAvailableAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrialLesson" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialLesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrialExtensionAudit" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "previousPeriodEnd" TIMESTAMP(3) NOT NULL,
    "nextPeriodEnd" TIMESTAMP(3) NOT NULL,
    "requestedDays" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialExtensionAudit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrialAccess_childProfileId_key" ON "TrialAccess"("childProfileId");
CREATE INDEX "TrialAccess_reportAvailableAt_idx" ON "TrialAccess"("reportAvailableAt");
CREATE UNIQUE INDEX "TrialLesson_childProfileId_lessonId_key" ON "TrialLesson"("childProfileId", "lessonId");
CREATE INDEX "TrialLesson_lessonId_idx" ON "TrialLesson"("lessonId");
CREATE INDEX "TrialExtensionAudit_subscriptionId_createdAt_idx" ON "TrialExtensionAudit"("subscriptionId", "createdAt");
CREATE INDEX "TrialExtensionAudit_childProfileId_createdAt_idx" ON "TrialExtensionAudit"("childProfileId", "createdAt");
CREATE INDEX "TrialExtensionAudit_actorUserId_createdAt_idx" ON "TrialExtensionAudit"("actorUserId", "createdAt");

ALTER TABLE "TrialAccess"
ADD CONSTRAINT "TrialAccess_childProfileId_fkey"
FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrialLesson"
ADD CONSTRAINT "TrialLesson_childProfileId_fkey"
FOREIGN KEY ("childProfileId") REFERENCES "TrialAccess"("childProfileId")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrialExtensionAudit"
ADD CONSTRAINT "TrialExtensionAudit_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrialExtensionAudit"
ADD CONSTRAINT "TrialExtensionAudit_childProfileId_fkey"
FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrialExtensionAudit"
ADD CONSTRAINT "TrialExtensionAudit_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
