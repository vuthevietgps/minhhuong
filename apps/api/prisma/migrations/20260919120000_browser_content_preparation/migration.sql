CREATE TABLE "BrowserPreparation" (
  "id" TEXT PRIMARY KEY, "childId" TEXT NOT NULL, "sourceId" TEXT,
  "url" TEXT NOT NULL, "title" TEXT NOT NULL, "minutes" INTEGER NOT NULL DEFAULT 10,
  "status" TEXT NOT NULL DEFAULT 'WAITING_CONTEXT', "result" JSONB, "error" TEXT,
  "lease" TEXT, "startedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BrowserPreparation_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "BrowserPreparation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AiContextSource"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX "BrowserPreparation_childId_url_key" ON "BrowserPreparation"("childId", "url");
CREATE INDEX "BrowserPreparation_status_startedAt_idx" ON "BrowserPreparation"("status", "startedAt");
