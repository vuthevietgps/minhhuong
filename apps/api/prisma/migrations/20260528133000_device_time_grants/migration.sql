CREATE TABLE "DeviceTimeGrant" (
    "id" TEXT NOT NULL,
    "familyLinkId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "usageDate" TEXT NOT NULL,
    "extraMinutes" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceTimeGrant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DeviceTimeGrant_familyLinkId_usageDate_idx" ON "DeviceTimeGrant"("familyLinkId", "usageDate");
CREATE INDEX "DeviceTimeGrant_grantedById_createdAt_idx" ON "DeviceTimeGrant"("grantedById", "createdAt");

ALTER TABLE "DeviceTimeGrant" ADD CONSTRAINT "DeviceTimeGrant_familyLinkId_fkey" FOREIGN KEY ("familyLinkId") REFERENCES "FamilyLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceTimeGrant" ADD CONSTRAINT "DeviceTimeGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
