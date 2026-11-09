import { DailyPlanService } from '../daily-plan/daily-plan.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { LearningPathService } from '../learning-path/learning-path.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScreenTimeService } from '../screen-time/screen-time.service';
import { LearningHomeService } from './learning-home.service';
import { LearningSupportService } from './learning-support.service';
import { LearningUsageService } from './learning-usage.service';
import { LearningService } from './learning.service';
import { LessonPracticeService } from './lesson-practice.service';
import { VideoLearningService } from './video-learning.service';

/**
 * Builds LearningService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createLearningServiceForTestParts(
  prisma: PrismaService,
  childAccess: ChildAccessService,
  entitlement: EntitlementService,
  learningPath: LearningPathService,
  dailyPlan: DailyPlanService,
  screenTime: ScreenTimeService,
) {
  const learningSupportService = new LearningSupportService(
    prisma,
    childAccess,
    entitlement,
    learningPath,
    screenTime,
  );
  const learningUsageService = new LearningUsageService(
    childAccess,
    screenTime,
    learningSupportService,
  );
  const learningHomeService = new LearningHomeService(
    prisma,
    entitlement,
    dailyPlan,
    learningSupportService,
  );
  const videoLearningService = new VideoLearningService(
    prisma,
    entitlement,
    learningPath,
    learningSupportService,
  );
  const lessonPracticeService = new LessonPracticeService(
    prisma,
    entitlement,
    learningPath,
    learningSupportService,
  );
  const service = new LearningService(
    learningUsageService,
    learningHomeService,
    videoLearningService,
    lessonPracticeService,
  );
  return {
    service,
    learningSupportService,
    learningUsageService,
    learningHomeService,
    videoLearningService,
    lessonPracticeService,
  };
}

export function createLearningServiceForTest(
  prisma: PrismaService,
  childAccess: ChildAccessService,
  entitlement: EntitlementService,
  learningPath: LearningPathService,
  dailyPlan: DailyPlanService,
  screenTime: ScreenTimeService,
) {
  return createLearningServiceForTestParts(
    prisma,
    childAccess,
    entitlement,
    learningPath,
    dailyPlan,
    screenTime,
  ).service;
}
