-- Keep summaries, links, fingerprints and updatedAt unchanged so saved reports
-- keep their cache keys. Only queued input may temporarily contain a script.
UPDATE "AiContextSource"
SET "rawTranscript" = '', "transcriptSegments" = NULL
WHERE "processingStatus" <> 'PROCESSING';

-- Captions are no longer needed even for queued sources: their raw input or
-- YouTube link is sufficient for processing.
UPDATE "AiContextSource"
SET "transcriptSegments" = NULL
WHERE "transcriptSegments" IS NOT NULL;

ALTER TABLE "AiContextSource"
ADD CONSTRAINT "AiContextSource_context_only_terminal"
CHECK (
  "processingStatus" = 'PROCESSING'
  OR ("rawTranscript" = '' AND "transcriptSegments" IS NULL)
);
