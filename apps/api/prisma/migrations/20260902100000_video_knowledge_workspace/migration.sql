-- Preserve existing sources. The canonical URL is the cache identity; distinct
-- videos may have identical captions and must retain their own reference URLs.
DROP INDEX "AiContextSource_transcriptHash_key";
ALTER TABLE "AiContextSource"
  ALTER COLUMN "transcriptHash" DROP NOT NULL,
  ADD COLUMN "transcriptSegments" JSONB,
  ADD COLUMN "processingLease" TEXT,
  ADD COLUMN "processingStartedAt" TIMESTAMP(3);
CREATE INDEX "AiContextSource_transcriptHash_idx" ON "AiContextSource"("transcriptHash");
CREATE INDEX "AiContextSource_processingStatus_processingStartedAt_idx"
  ON "AiContextSource"("processingStatus", "processingStartedAt");

CREATE TABLE "AiContextDocument" (
  "id" TEXT NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "topic" TEXT NOT NULL DEFAULT '',
  "content" TEXT,
  "processingStatus" "AiContextProcessingStatus" NOT NULL DEFAULT 'PROCESSING',
  "processingLease" TEXT,
  "processingStartedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiContextDocument_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiContextDocument_cacheKey_key" ON "AiContextDocument"("cacheKey");
CREATE INDEX "AiContextDocument_processingStatus_processingStartedAt_idx"
  ON "AiContextDocument"("processingStatus", "processingStartedAt");
CREATE TABLE "AiContextDocumentSource" (
  "documentId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  CONSTRAINT "AiContextDocumentSource_pkey" PRIMARY KEY ("documentId", "sourceId")
);
CREATE INDEX "AiContextDocumentSource_sourceId_idx" ON "AiContextDocumentSource"("sourceId");
ALTER TABLE "AiContextDocumentSource" ADD CONSTRAINT "AiContextDocumentSource_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "AiContextDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiContextDocumentSource" ADD CONSTRAINT "AiContextDocumentSource_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "AiContextSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
