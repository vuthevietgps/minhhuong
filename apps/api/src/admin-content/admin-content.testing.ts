import { PrismaService } from '../prisma/prisma.service';
import { AdminContentSupportService } from './admin-content-support.service';
import { AdminContentService } from './admin-content.service';
import { ContentTagsService } from './content-tags.service';
import { CourseContentService } from './course-content.service';
import { LessonExerciseService } from './lesson-exercise.service';
import { LessonVideoService } from './lesson-video.service';

/**
 * Builds AdminContentService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createAdminContentServiceForTestParts(prisma: PrismaService) {
  const adminContentSupportService = new AdminContentSupportService(prisma);
  const courseContentService = new CourseContentService(
    prisma,
    adminContentSupportService,
  );
  const contentTagsService = new ContentTagsService(
    prisma,
    adminContentSupportService,
  );
  const lessonVideoService = new LessonVideoService(
    prisma,
    adminContentSupportService,
  );
  const lessonExerciseService = new LessonExerciseService(
    prisma,
    adminContentSupportService,
  );
  const service = new AdminContentService(
    courseContentService,
    contentTagsService,
    lessonVideoService,
    lessonExerciseService,
  );
  return {
    service,
    adminContentSupportService,
    courseContentService,
    contentTagsService,
    lessonVideoService,
    lessonExerciseService,
  };
}

export function createAdminContentServiceForTest(prisma: PrismaService) {
  return createAdminContentServiceForTestParts(prisma).service;
}
