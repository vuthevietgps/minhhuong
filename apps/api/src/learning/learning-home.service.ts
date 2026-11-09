import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { DailyPlanService } from '../daily-plan/daily-plan.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildDailyPlan,
  pickContinueLesson,
  toLearningHomeDailyPlan,
  toLearningHomeLesson,
} from './learning-home.helpers';
import { LearningSupportService } from './learning-support.service';
import { dateInBangkok, todayInBangkok } from './learning.helpers';

/** Learner home payload. */
@Injectable()
export class LearningHomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly dailyPlan: DailyPlanService,
    private readonly learningSupportService: LearningSupportService,
  ) {}

  async getLearningHome(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    await this.learningSupportService.assertLearningAccess(
      user,
      childProfileId,
    );

    const [
      usage,
      rawLessonSource,
      weeklyUsageRows,
      streak,
      persistentDailyPlan,
    ] = await Promise.all([
      this.learningSupportService.getUsageStatus(
        user,
        childProfileId,
        userAgent,
      ),
      this.learningSupportService.getLearningLessonSource(childProfileId),
      this.getWeeklyUsageRows(childProfileId),
      this.getLearningStreak(childProfileId),
      this.dailyPlan.getOrGenerateTodayPlan(user, childProfileId),
    ]);
    const allowedTrialLessons =
      await this.entitlement.allowedFreeTrialLessonIds(
        childProfileId,
        rawLessonSource.lessons.map((lesson) => lesson.id),
      );
    const lessonSource = allowedTrialLessons
      ? {
          ...rawLessonSource,
          lessons: rawLessonSource.lessons.filter((lesson) =>
            allowedTrialLessons.has(lesson.id),
          ),
        }
      : rawLessonSource;
    const lessonCards = lessonSource.lessons.map((lesson) =>
      toLearningHomeLesson(lesson),
    );
    const continueLesson = pickContinueLesson(lessonCards);
    const nextLesson = lessonCards.find(
      (lesson) =>
        lesson.progress.status === 'NOT_STARTED' &&
        lesson.id !== continueLesson?.id,
    );
    const weeklyStudyMinutes = Math.ceil(
      weeklyUsageRows.reduce((sum, row) => sum + row.usedSeconds, 0) / 60,
    );
    const fallbackDailyPlan = buildDailyPlan(
      continueLesson,
      nextLesson,
      usage,
      lessonCards,
    );
    const dailyPlan =
      persistentDailyPlan.plan && !usage.limitReached
        ? toLearningHomeDailyPlan(persistentDailyPlan)
        : fallbackDailyPlan;

    return {
      deviceUsage: usage,
      contentSource: lessonSource.contentSource,
      continueLesson,
      streak,
      dailyPlan,
      persistentDailyPlan,
      summary: {
        totalLessons: lessonCards.length,
        completedLessons: lessonCards.filter(
          (lesson) => lesson.progress.status === 'COMPLETED',
        ).length,
        inProgressLessons: lessonCards.filter(
          (lesson) => lesson.progress.status === 'IN_PROGRESS',
        ).length,
        weeklyStudyMinutes,
      },
    };
  }

  private async getWeeklyUsageRows(childProfileId: string) {
    const today = todayInBangkok();
    const weekAgo = dateInBangkok(-6);

    return this.prisma.learningUsageDay.findMany({
      where: {
        childProfileId,
        usageDate: {
          gte: weekAgo,
          lte: today,
        },
      },
      select: {
        usedSeconds: true,
      },
    });
  }

  private async getLearningStreak(childProfileId: string): Promise<number> {
    if (!childProfileId) return 0;

    const rows = await this.prisma.learningUsageDay.findMany({
      where: { childProfileId, usedSeconds: { gt: 0 } },
      orderBy: { usageDate: 'desc' },
      select: { usageDate: true },
      take: 365,
    });

    if (rows.length === 0) return 0;

    const today = todayInBangkok();
    let streak = 0;
    let cursor = today;

    for (const row of rows) {
      if (row.usageDate === cursor) {
        streak++;
        cursor = dateInBangkok(-streak);
      } else {
        break;
      }
    }

    return streak;
  }
}
