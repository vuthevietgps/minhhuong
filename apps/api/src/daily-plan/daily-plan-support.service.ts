import { Injectable } from '@nestjs/common';
import {
  DailyLearningPlanContentSourceMode,
  DailyLearningPlanItemType,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  EntitlementService,
  LearningCapability,
} from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_MIN_WATCH_PERCENT,
  PlanWithItems,
  calculateAttemptPercent,
  timezone,
} from './daily-plan.helpers';

/** Shared daily plan lookups and access checks. */
@Injectable()
export class DailyPlanSupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
  ) {}

  async assertPlanAccess(
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

  async findActivePublishedAssignment(childProfileId: string) {
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

  async toResponse(plan: PlanWithItems, generated: boolean) {
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
      ? calculateAttemptPercent(attempt.score, attempt.maxScore)
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
}
