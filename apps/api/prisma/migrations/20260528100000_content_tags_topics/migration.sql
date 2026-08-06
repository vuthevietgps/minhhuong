CREATE TYPE "ContentTagKind" AS ENUM ('TOPIC', 'AUDIENCE', 'LEVEL', 'SKILL', 'FORMAT', 'INTENT', 'CUSTOM');

CREATE TABLE "ContentTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ContentTagKind" NOT NULL DEFAULT 'TOPIC',
    "description" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonTag" (
    "lessonId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonTag_pkey" PRIMARY KEY ("lessonId","tagId")
);

CREATE UNIQUE INDEX "ContentTag_slug_key" ON "ContentTag"("slug");
CREATE INDEX "ContentTag_kind_isActive_sortOrder_idx" ON "ContentTag"("kind", "isActive", "sortOrder");
CREATE INDEX "LessonTag_tagId_idx" ON "LessonTag"("tagId");

ALTER TABLE "LessonTag" ADD CONSTRAINT "LessonTag_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonTag" ADD CONSTRAINT "LessonTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ContentTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
