import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DailyLearningPlanContentSourceMode,
  DailyLearningPlanGeneratedBy,
  DailyLearningPlanItemStatus,
  DailyLearningPlanItemType,
  DailyLearningPlanStatus,
  Prisma,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  EntitlementService,
  LearningCapability,
} from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { PrismaService } from '../prisma/prisma.service';

type PlanWithItems = Prisma.DailyLearningPlanGetPayload<{
  include: ReturnType<DailyPlanService['planInclude']>;
}>;

type AssignmentForPlan = NonNullable<
  Awaited<ReturnType<DailyPlanService['findActivePublishedAssignment']>>
>;

type PlannedItem = {
  sequence: number;
  itemType: DailyLearningPlanItemType;
  lessonId?: string;
  activityId?: string;
  learningPathItemId?: string;
  required: boolean;
  status: DailyLearningPlanItemStatus;
  minWatchPercent?: number;
  minScore?: number;
};

const timezone = 'Asia/Bangkok';
const DEFAULT_MIN_WATCH_PERCENT = 80;

@Injectable()
export class DailyPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
  ) {}

  async getOrGenerateTodayPlan(
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    return this.getOrGeneratePlanForDate(
      user,
      childProfileId,
      this.todayInBangkok(),
    );
  }

  async getOrGeneratePlanForDate(
    user: AuthenticatedUser,
    childProfileId: string,
    planDate: string,
  ) {
    await this.assertPlanAccess(user, childProfileId);

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
      return this.toResponse(existing, false);
    }

    const assignment = await this.findActivePublishedAssignment(childProfileId);
    if (!assignment) {
      return this.fallbackResponse(planDate);
    }

    return this.createAssignedPlan(childProfileId, planDate, assignment);
  }

  async startItem(planId: string, itemId: string, user: AuthenticatedUser) {
    const { item } = await this.requirePlanItemAccess(planId, itemId, user);

    if (item.status === DailyLearningPlanItemStatus.LOCKED) {
      throw new ForbiddenException('Plan item is locked');
    }
    if (
      item.status === DailyLearningPlanItemStatus.COMPLETED ||
      item.status === DailyLearningPlanItemStatus.SKIPPED
    ) {
      return this.requirePlanResponse(planId);
    }
    if (item.status === DailyLearningPlanItemStatus.STARTED) {
      return this.requirePlanResponse(planId);
    }

    await this.prisma.dailyLearningPlanItem.update({
      where: { id: itemId },
      data: {
        status: DailyLearningPlanItemStatus.STARTED,
        startedAt: item.startedAt ?? new Date(),
      },
    });

    return this.requirePlanResponse(planId);
  }

  async completeItem(planId: string, itemId: string, user: AuthenticatedUser) {
    const { plan, item } = await this.requirePlanItemAccess(
      planId,
      itemId,
      user,
    );

    if (item.status === DailyLearningPlanItemStatus.LOCKED) {
      throw new ForbiddenException('Plan item is locked');
    }
    if (item.status === DailyLearningPlanItemStatus.SKIPPED) {
      throw new BadRequestException('Skipped plan item cannot be completed');
    }

    await this.assertCompletionEvidence(item, plan.childProfileId);

    const now = new Date();
    await this.prisma.dailyLearningPlanItem.update({
      where: { id: itemId },
      data: {
        status: DailyLearningPlanItemStatus.COMPLETED,
        startedAt: item.startedAt ?? now,
        completedAt: now,
      },
    });

    if (item.itemType === DailyLearningPlanItemType.VIDEO && item.lessonId) {
      await this.prisma.dailyLearningPlanItem.updateMany({
        where: {
          planId,
          lessonId: item.lessonId,
          status: DailyLearningPlanItemStatus.LOCKED,
        },
        data: {
          status: DailyLearningPlanItemStatus.READY,
        },
      });
    }

    await this.recalculatePlanStatus(planId);
    return this.requirePlanResponse(planId);
  }

  async skipItem(planId: string, itemId: string, user: AuthenticatedUser) {
    const { item } = await this.requirePlanItemAccess(planId, itemId, user);

    if (item.required) {
      throw new ForbiddenException('Required plan items cannot be skipped');
    }
    if (item.status === DailyLearningPlanItemStatus.COMPLETED) {
      return this.requirePlanResponse(planId);
    }

    await this.prisma.dailyLearningPlanItem.update({
      where: { id: itemId },
      data: {
        status: DailyLearningPlanItemStatus.SKIPPED,
      },
    });

    await this.recalculatePlanStatus(planId);
    return this.requirePlanResponse(planId);
  }

  private async createAssignedPlan(
    childProfileId: string,
    planDate: string,
    assignment: AssignmentForPlan,
  ) {
    const candidate = await this.pickNextPathItem(childProfileId, assignment);
    const plannedItems = candidate ? this.buildPlannedItems(candidate) : [];
    const targetMinutes = plannedItems.reduce(
      (sum, item) => sum + this.estimateMinutesForItem(item, candidate),
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

      return this.toResponse(plan, true);
    } catch (error) {
      if (this.isUniqueConflict(error)) {
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
          return this.toResponse(existing, false);
        }
      }
      throw error;
    }
  }

  private async pickNextPathItem(
    childProfileId: string,
    assignment: AssignmentForPlan,
  ) {
    const publishedItems = assignment.contentPackage.learningPath.items.filter(
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

  private buildPlannedItems(
    pathItem: AssignmentForPlan['contentPackage']['learningPath']['items'][number],
  ): PlannedItem[] {
    const items: PlannedItem[] = [];
    let sequence = 1;
    const primaryActivity = pathItem.lesson.activities[0];

    if (pathItem.lesson.videos.length > 0) {
      items.push({
        sequence: sequence++,
        itemType: DailyLearningPlanItemType.VIDEO,
        lessonId: pathItem.lessonId,
        learningPathItemId: pathItem.id,
        required: pathItem.required,
        status: DailyLearningPlanItemStatus.READY,
        minWatchPercent: pathItem.minWatchPercent ?? 80,
        minScore: pathItem.minScore ?? undefined,
      });
    }

    if (primaryActivity) {
      items.push({
        sequence,
        itemType: DailyLearningPlanItemType.PRACTICE,
        lessonId: pathItem.lessonId,
        activityId: primaryActivity.id,
        learningPathItemId: pathItem.id,
        required: pathItem.required,
        status:
          items.length > 0
            ? DailyLearningPlanItemStatus.LOCKED
            : DailyLearningPlanItemStatus.READY,
        minScore: pathItem.minScore ?? 80,
        minWatchPercent: pathItem.minWatchPercent ?? undefined,
      });
    }

    return items;
  }

  private estimateMinutesForItem(
    item: PlannedItem,
    pathItem:
      | AssignmentForPlan['contentPackage']['learningPath']['items'][number]
      | null,
  ) {
    if (item.itemType === DailyLearningPlanItemType.PRACTICE) {
      return 5;
    }
    const durationSec =
      pathItem?.lesson.durationSec ?? pathItem?.lesson.videos[0]?.durationSec;
    return Math.max(5, Math.ceil((durationSec ?? 600) / 60));
  }

  private async assertCompletionEvidence(
    item: {
      itemType: DailyLearningPlanItemType;
      lessonId: string | null;
      activityId: string | null;
      minWatchPercent: number | null;
      minScore: number | null;
    },
    childProfileId: string,
  ) {
    if (item.itemType === DailyLearningPlanItemType.VIDEO) {
      if (!item.lessonId) {
        throw new BadRequestException('Video plan item has no lesson');
      }
      const minWatchPercent = item.minWatchPercent ?? DEFAULT_MIN_WATCH_PERCENT;
      const exposure = await this.prisma.videoExposureLog.findFirst({
        where: {
          childProfileId,
          lessonId: item.lessonId,
          watchPercent: { gte: minWatchPercent },
        },
        orderBy: [{ watchPercent: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
        },
      });

      if (!exposure) {
        throw new ForbiddenException({
          code: 'WATCH_EVIDENCE_INSUFFICIENT',
          message:
            'Watch evidence has not reached this plan item minimum percent',
          minWatchPercent,
        });
      }
      return;
    }

    if (item.itemType === DailyLearningPlanItemType.PRACTICE) {
      if (!item.activityId) {
        throw new BadRequestException('Practice plan item has no activity');
      }
      const bestAttempt = await this.prisma.activityAttempt.findFirst({
        where: {
          childProfileId,
          activityId: item.activityId,
          status: 'GRADED',
        },
        orderBy: [{ score: 'desc' }, { submittedAt: 'desc' }],
        select: {
          score: true,
          maxScore: true,
        },
      });

      if (!bestAttempt) {
        throw new ForbiddenException(
          'Complete a backend-graded attempt before completing this plan item',
        );
      }

      if (item.minScore !== null) {
        const percent =
          bestAttempt.maxScore > 0
            ? Math.round((bestAttempt.score / bestAttempt.maxScore) * 100)
            : bestAttempt.score;
        if (percent < item.minScore) {
          throw new ForbiddenException(
            'Practice score has not reached this plan item minimum',
          );
        }
      }
    }
  }

  private async requirePlanItemAccess(
    planId: string,
    itemId: string,
    user: AuthenticatedUser,
  ) {
    const plan = await this.prisma.dailyLearningPlan.findUnique({
      where: { id: planId },
      include: {
        ...this.planInclude(),
        items: {
          where: { id: itemId },
          include: {
            lesson: { select: { id: true, title: true } },
            activity: { select: { id: true, title: true } },
            learningPathItem: { select: { id: true, sequence: true } },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Daily learning plan not found');
    }
    const item = plan.items[0];
    if (!item) {
      throw new NotFoundException('Daily learning plan item not found');
    }

    await this.assertPlanAccess(
      user,
      plan.childProfileId,
      this.capabilityForItem(item.itemType),
    );

    return { plan: plan, item };
  }

  private async requirePlanResponse(planId: string) {
    const plan = await this.prisma.dailyLearningPlan.findUnique({
      where: { id: planId },
      include: this.planInclude(),
    });
    if (!plan) {
      throw new NotFoundException('Daily learning plan not found');
    }
    return this.toResponse(plan, false);
  }

  private async recalculatePlanStatus(planId: string) {
    const items = await this.prisma.dailyLearningPlanItem.findMany({
      where: { planId, required: true },
      select: { status: true },
    });
    const completed =
      items.length > 0 &&
      items.every((item) => {
        const terminalStatuses: DailyLearningPlanItemStatus[] = [
          DailyLearningPlanItemStatus.COMPLETED,
          DailyLearningPlanItemStatus.SKIPPED,
        ];

        return terminalStatuses.includes(item.status);
      });

    if (completed) {
      await this.prisma.dailyLearningPlan.update({
        where: { id: planId },
        data: { status: DailyLearningPlanStatus.COMPLETED },
      });
    }
  }

  private async assertPlanAccess(
    user: AuthenticatedUser,
    childProfileId: string,
    capability?: LearningCapability,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      purpose: capability ? `daily-plan:${capability}` : 'daily-plan:read',
    });

    if (capability) {
      await this.entitlement.assertCapability(childProfileId, capability);
      return;
    }

    await this.entitlement.assertActiveSubscription(childProfileId);
  }

  private capabilityForItem(
    itemType: DailyLearningPlanItemType,
  ): LearningCapability | undefined {
    if (itemType === DailyLearningPlanItemType.VIDEO) return 'video';
    if (itemType === DailyLearningPlanItemType.PRACTICE) return 'practice';
    return undefined;
  }

  private async findActivePublishedAssignment(childProfileId: string) {
    return this.prisma.childContentAssignment.findFirst({
      where: {
        childProfileId,
        status: 'ACTIVE',
        contentPackage: {
          status: 'PUBLISHED',
          learningPath: {
            status: 'PUBLISHED',
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      include: {
        contentPackage: {
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
        },
      },
    });
  }

  private fallbackResponse(planDate: string) {
    return {
      plan: null,
      planDate,
      timezone,
      generated: false,
      contentSource: {
        mode: 'UNASSIGNED_FALLBACK' as const,
        reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
      },
      items: [],
    };
  }

  private async toResponse(plan: PlanWithItems, generated: boolean) {
    const contentSource =
      plan.contentSourceMode ===
      DailyLearningPlanContentSourceMode.ASSIGNED_PATH
        ? {
            mode: 'ASSIGNED_PATH' as const,
            contentPackageId: plan.contentPackageId,
            contentPackageCode: plan.contentPackage?.code ?? null,
            contentPackageTitle: plan.contentPackage?.title ?? null,
            learningPathId: plan.learningPathId,
            learningPathCode: plan.learningPath?.code ?? null,
            learningPathTitle: plan.learningPath?.title ?? null,
          }
        : {
            mode: 'UNASSIGNED_FALLBACK' as const,
            reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
          };

    const evidenceByItemId = await this.buildEvidenceByItemId(plan);

    return {
      plan: {
        id: plan.id,
        childProfileId: plan.childProfileId,
        planDate: plan.planDate,
        status: plan.status,
        contentSourceMode: plan.contentSourceMode,
        contentPackageId: plan.contentPackageId,
        learningPathId: plan.learningPathId,
        targetMinutes: plan.targetMinutes,
        generatedBy: plan.generatedBy,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
      planDate: plan.planDate,
      timezone,
      generated,
      contentSource,
      items: plan.items.map((item) => {
        const evidence = evidenceByItemId.get(item.id);

        return {
          id: item.id,
          planId: item.planId,
          sequence: item.sequence,
          itemType: item.itemType,
          lessonId: item.lessonId,
          activityId: item.activityId,
          learningPathItemId: item.learningPathItemId,
          required: item.required,
          status: item.status,
          minWatchPercent: item.minWatchPercent,
          minScore: item.minScore,
          startedAt: item.startedAt,
          completedAt: item.completedAt,
          lesson: item.lesson,
          activity: item.activity,
          learningPathItem: item.learningPathItem,
          evidenceSummary: evidence?.summary ?? null,
          blockedReason: evidence?.blockedReason ?? null,
        };
      }),
    };
  }

  private async buildEvidenceByItemId(plan: PlanWithItems) {
    const evidenceByItemId = new Map<
      string,
      { summary: Record<string, unknown> | null; blockedReason: string | null }
    >();

    for (const item of plan.items) {
      if (item.itemType === DailyLearningPlanItemType.VIDEO) {
        evidenceByItemId.set(
          item.id,
          await this.buildVideoEvidenceSummary(plan.childProfileId, item),
        );
        continue;
      }

      if (item.itemType === DailyLearningPlanItemType.PRACTICE) {
        evidenceByItemId.set(
          item.id,
          await this.buildPracticeEvidenceSummary(plan.childProfileId, item),
        );
      }
    }

    return evidenceByItemId;
  }

  private async buildVideoEvidenceSummary(
    childProfileId: string,
    item: PlanWithItems['items'][number],
  ) {
    const minWatchPercent = item.minWatchPercent ?? DEFAULT_MIN_WATCH_PERCENT;
    const exposure = item.lessonId
      ? await this.prisma.videoExposureLog.findFirst({
          where: {
            childProfileId,
            lessonId: item.lessonId,
          },
          orderBy: [{ watchPercent: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            videoAssetId: true,
            eventType: true,
            positionSec: true,
            durationWatchedSec: true,
            watchPercent: true,
            source: true,
            createdAt: true,
          },
        })
      : null;
    const passed = (exposure?.watchPercent ?? 0) >= minWatchPercent;

    return {
      summary: {
        type: 'VIDEO_EXPOSURE',
        evidenceId: exposure?.id ?? null,
        videoAssetId: exposure?.videoAssetId ?? null,
        eventType: exposure?.eventType ?? null,
        positionSec: exposure?.positionSec ?? 0,
        durationWatchedSec: exposure?.durationWatchedSec ?? 0,
        watchPercent: exposure?.watchPercent ?? 0,
        minWatchPercent,
        passed,
        source: exposure?.source ?? null,
        createdAt: exposure?.createdAt ?? null,
      },
      blockedReason: passed ? null : 'WATCH_EVIDENCE_INSUFFICIENT',
    };
  }

  private async buildPracticeEvidenceSummary(
    childProfileId: string,
    item: PlanWithItems['items'][number],
  ) {
    const attempt = item.activityId
      ? await this.prisma.activityAttempt.findFirst({
          where: {
            childProfileId,
            activityId: item.activityId,
            status: 'GRADED',
          },
          orderBy: [{ score: 'desc' }, { submittedAt: 'desc' }],
          select: {
            id: true,
            score: true,
            maxScore: true,
            submittedAt: true,
          },
        })
      : null;
    const percent = attempt
      ? this.calculateAttemptPercent(attempt.score, attempt.maxScore)
      : 0;
    const minScore = item.minScore;
    const passed = !!attempt && (minScore === null || percent >= minScore);
    const blockedReason = !attempt
      ? 'PRACTICE_ATTEMPT_REQUIRED'
      : passed
        ? null
        : 'PRACTICE_SCORE_BELOW_MIN';

    return {
      summary: {
        type: 'ACTIVITY_ATTEMPT',
        attemptId: attempt?.id ?? null,
        score: attempt?.score ?? null,
        maxScore: attempt?.maxScore ?? null,
        percent,
        minScore,
        passed,
        submittedAt: attempt?.submittedAt ?? null,
      },
      blockedReason,
    };
  }

  private calculateAttemptPercent(score: number, maxScore: number) {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : score;
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

  private isUniqueConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private todayInBangkok() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }
}
