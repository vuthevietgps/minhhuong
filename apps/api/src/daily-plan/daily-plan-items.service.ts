import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DailyLearningPlanItemStatus,
  DailyLearningPlanItemType,
  DailyLearningPlanStatus,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { DailyPlanGenerationService } from './daily-plan-generation.service';
import { DailyPlanSupportService } from './daily-plan-support.service';
import {
  DEFAULT_MIN_WATCH_PERCENT,
  capabilityForItem,
} from './daily-plan.helpers';

/** Start, complete and skip plan items. */
@Injectable()
export class DailyPlanItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyPlanGenerationService: DailyPlanGenerationService,
    private readonly dailyPlanSupportService: DailyPlanSupportService,
  ) {}

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
        ...this.dailyPlanGenerationService.planInclude(),
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

    await this.dailyPlanSupportService.assertPlanAccess(
      user,
      plan.childProfileId,
      capabilityForItem(item.itemType),
    );

    return { plan: plan, item };
  }

  private async requirePlanResponse(planId: string) {
    const plan = await this.prisma.dailyLearningPlan.findUnique({
      where: { id: planId },
      include: this.dailyPlanGenerationService.planInclude(),
    });
    if (!plan) {
      throw new NotFoundException('Daily learning plan not found');
    }
    return this.dailyPlanSupportService.toResponse(plan, false);
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
}
