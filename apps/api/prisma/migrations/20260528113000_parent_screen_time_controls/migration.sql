CREATE TABLE "FamilyLink" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'parent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChildScreenTimeSetting" (
    "id" TEXT NOT NULL,
    "familyLinkId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyLimitMinutes" INTEGER NOT NULL DEFAULT 45,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChildScreenTimeSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FamilyLink_parentId_childId_key" ON "FamilyLink"("parentId", "childId");
CREATE INDEX "FamilyLink_childId_idx" ON "FamilyLink"("childId");
CREATE UNIQUE INDEX "ChildScreenTimeSetting_familyLinkId_key" ON "ChildScreenTimeSetting"("familyLinkId");

ALTER TABLE "FamilyLink" ADD CONSTRAINT "FamilyLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FamilyLink" ADD CONSTRAINT "FamilyLink_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChildScreenTimeSetting" ADD CONSTRAINT "ChildScreenTimeSetting_familyLinkId_fkey" FOREIGN KEY ("familyLinkId") REFERENCES "FamilyLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
