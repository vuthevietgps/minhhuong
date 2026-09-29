CREATE TYPE "AgencyApplicationStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

CREATE TABLE "AgencyApplication" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "agencyName" TEXT NOT NULL,
    "requestedCode" TEXT NOT NULL,
    "contactPhone" TEXT,
    "notes" TEXT,
    "status" "AgencyApplicationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "agencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgencyApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgencyApplication_email_key" ON "AgencyApplication"("email");
CREATE INDEX "AgencyApplication_status_createdAt_idx" ON "AgencyApplication"("status", "createdAt");
CREATE INDEX "AgencyApplication_requestedCode_idx" ON "AgencyApplication"("requestedCode");
