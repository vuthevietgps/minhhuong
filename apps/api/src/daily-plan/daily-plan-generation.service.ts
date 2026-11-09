import { Injectable } from '@nestjs/common';
import {
  DailyLearningPlanContentSourceMode,
  DailyLearningPlanGeneratedBy,
  DailyLearningPlanStatus,
  Prisma,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignmentForPlan,
  DEFAULT_STARTER_PACKAGE_CODE,
  DefaultPackageForPlan,
  PlanPathItem,
  buildPlannedItems,
  estimateMinutesForItem,
  fallbackResponse,
  isUniqueConflict,
} from './daily-plan-generation.helpers';
import { DailyPlanSupportService } from './daily-plan-support.service';
import { todayInBangkok } from './daily-plan.helpers';

/** Generates and loads daily learning plans. */
@Injectable()
export class DailyPlanGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyPlanSupportService: DailyPlanSupportService,
  ) {}

  async getOrGenerateTodayPlan(
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    return this.getOrGeneratePlanForDate(
      user,
      childProfileId,
      todayInBangkok(),
    );
  }

  async getOrGeneratePlanForDate(
    user: AuthenticatedUser,
    childProfileId: string,
    planDate: string,
  ) {
    await this.dailyPlanSupportService.assertPlanAccess(user, childProfileId);

    const existing = await this.prisma.dailyLearningPlan.findUnique({
      where: {
        childProfileId_planDate: {
          childProfileId,
          planDate,
        },
      },
      include: this.planInclude(),
    });

    if (existing) {
      return this.dailyPlanSupportService.toResponse(existing, false);
    }

    const assignment =
      await this.dailyPlanSupportService.findActivePublishedAssignment(
        childProfileId,
      );
    if (!assignment) {
      const defaultPackage = await this.findDefaultPublishedPackage();
      return defaultPackage
        ? this.createDefaultRecommendationPlan(
            childProfileId,
            planDate,
            defaultPackage,
          )
        : fallbackResponse(planDate);
    }

    return this.createAssignedPlan(childProfileId, planDate, assignment);
  }

  private async createAssignedPlan(
    childProfileId: string,
    planDate: string,
    assignment: AssignmentForPlan,
  ) {
    const candidate = await this.pickNextPathItem(
      childProfileId,
      assignment.contentPackage.learningPath.items,
    );
    const plannedItems = candidate ? buildPlannedItems(candidate) : [];
    const targetMinutes = plannedItems.reduce(
      (sum, item) => sum + estimateMinutesForItem(item, candidate),
      0,
    );

    try {
      const plan = await this.prisma.dailyLearningPlan.create({
        data: {
          childProfileId,
          planDate,
          status:
            plannedItems.length > 0
              ? DailyLearningPlanStatus.ACTIVE
              : DailyLearningPlanStatus.COMPLETED,
          contentSourceMode: DailyLearningPlanContentSourceMode.ASSIGNED_PATH,
          contentPackageId: assignment.contentPackageId,
          learningPathId: assignment.contentPackage.learningPathId,
          targetMinutes,
          generatedBy: DailyLearningPlanGeneratedBy.SYSTEM_RULE,
          items: {
            create: plannedItems,
          },
        },
        include: this.planInclude(),
      });

      return this.dailyPlanSupportService.toResponse(plan, true);
    } catch (error) {
      if (isUniqueConflict(error)) {
        const existing = await this.prisma.dailyLearningPlan.findUnique({
          where: {
            childProfileId_planDate: {
              childProfileId,
              planDate,
            },
          },
          include: this.planInclude(),
        });
        if (existing) {
          return this.dailyPlanSupportService.toResponse(existing, false);
        }
      }
      throw error;
    }
  }

  /**
   * A starter package makes the first visit feel guided, while the video feed
   * remains open for free exploration because there is no child assignment.
   */
  private async createDefaultRecommendationPlan(
    childProfileId: string,
    planDate: string,
    contentPackage: DefaultPackageForPlan,
  ) {
    const candidate = await this.pickNextPathItem(
      childProfileId,
      contentPackage.learningPath.items,
    );
    const plannedItems = candidate ? buildPlannedItems(candidate) : [];
    const targetMinutes = plannedItems.reduce(
      (sum, item) => sum + estimateMinutesForItem(item, candidate),
      0,
    );

    try {
      const plan = await this.prisma.dailyLearningPlan.create({
        data: {
          childProfileId,
          planDate,
          status:
            plannedItems.length > 0
              ? DailyLearningPlanStatus.ACTIVE
              : DailyLearningPlanStatus.COMPLETED,
          // This is a recommendation, not a restrictive child assignment.
          contentSourceMode:
            DailyLearningPlanContentSourceMode.UNASSIGNED_FALLBACK,
          contentPackageId: contentPackage.id,
          learningPathId: contentPackage.learningPathId,
          targetMinutes,
          generatedBy: DailyLearningPlanGeneratedBy.SYSTEM_RULE,
          items: { create: plannedItems },
        },
        include: this.planInclude(),
      });
      return this.dailyPlanSupportService.toResponse(plan, true);
    } catch (error) {
      if (isUniqueConflict(error)) {
        const existing = await this.prisma.dailyLearningPlan.findUnique({
          where: {
            childProfileId_planDate: { childProfileId, planDate },
          },
          include: this.planInclude(),
        });
        if (existing)
          return this.dailyPlanSupportService.toResponse(existing, false);
      }
      throw error;
    }
  }

  private async pickNextPathItem(
    childProfileId: string,
    pathItems: PlanPathItem[],
  ) {
    const publishedItems = pathItems.filter(
      (item) => item.lesson.status === 'PUBLISHED',
    );
    const lessonIds = publishedItems.map((item) => item.lessonId);
    const progressRows =
      lessonIds.length > 0
        ? await this.prisma.lessonProgress.findMany({
            where: {
              childProfileId,
              lessonId: { in: lessonIds },
            },
            select: {
              lessonId: true,
              status: true,
              score: true,
            },
          })
        : [];
    const progressByLessonId = new Map(
      progressRows.map((progress) => [progress.lessonId, progress]),
    );

    return (
      publishedItems.find((item) => {
        const progress = progressByLessonId.get(item.lessonId);
        if (!progress || progress.status !== 'COMPLETED') {
          return true;
        }
        if (item.minScore === null || item.minScore === undefined) {
          return false;
        }
        return (progress.score ?? 0) < item.minScore;
      }) ?? null
    );
  }

  async findDefaultPublishedPackage() {
    return this.prisma.contentPackage.findFirst({
      where: {
        code: DEFAULT_STARTER_PACKAGE_CODE,
        status: 'PUBLISHED',
        learningPath: { status: 'PUBLISHED' },
      },
      include: {
        learningPath: {
          include: {
            items: {
              orderBy: { sequence: 'asc' },
              include: {
                lesson: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    durationSec: true,
                    status: true,
                    videos: {
                      where: { processingStatus: 'READY' },
                      orderBy: { sortOrder: 'asc' },
                      select: {
                        id: true,
                        durationSec: true,
                      },
                    },
                    activities: {
                      orderBy: { sortOrder: 'asc' },
                      select: {
                        id: true,
                        title: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  planInclude() {
    return {
      contentPackage: {
        select: {
          id: true,
          code: true,
          title: true,
        },
      },
      learningPath: {
        select: {
          id: true,
          code: true,
          title: true,
        },
      },
      items: {
        orderBy: { sequence: 'asc' },
        include: {
          lesson: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              durationSec: true,
            },
          },
          activity: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          learningPathItem: {
            select: {
              id: true,
              sequence: true,
            },
          },
        },
      },
    } satisfies Prisma.DailyLearningPlanInclude;
  }
}
