import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { FREE_TRIAL_PROVIDER_REF } from '../entitlement/trial-policy';
import { ChildAccessService } from '../learning-access/child-access.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  LearningReportRange,
  addDaysToDateKey,
  averageOrNull,
  bangkokDateEnd,
  bangkokDateStart,
  calculateAttemptPercent,
  dateKeysBetween,
  defaultMinWatchPercent,
  emptyDayState,
  groupByDate,
  groupByKey,
  maxOrNull,
  parentBlockedMessage,
  secondsToMinutes,
  weekKey,
} from './parent-reports.helpers';
import { todayInBangkok } from './parent.helpers';

/** Child report and learning evidence report. */
@Injectable()
export class ParentReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
  ) {}

  async getChildReport(
    user: AuthenticatedUser,
    childProfileId: string,
    weeks: number = 4,
  ) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { parentId: true },
    });

    if (
      !child ||
      (child.parentId !== user.sub && !user.sub.startsWith('demo-'))
    ) {
      throw new NotFoundException('Child profile not found');
    }

    const weeksCount = Math.min(Math.max(1, weeks), 12);
    const sinceDate = new Date(
      Date.now() - weeksCount * 7 * 24 * 60 * 60 * 1000,
    );
    const sinceDateBangkok = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(sinceDate);

    const [progress, deviceUsage, grantsData] = await Promise.all([
      this.prisma.lessonProgress.findMany({
        where: { childProfileId, updatedAt: { gte: sinceDate } },
        select: {
          status: true,
          lastPositionSec: true,
          watchCount: true,
          lastWatchedAt: true,
          updatedAt: true,
          lesson: {
            select: {
              id: true,
              title: true,
              durationSec: true,
              activities: { select: { id: true }, take: 1 },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.learningUsageDay.findMany({
        where: {
          childProfileId,
          usageDate: { gte: sinceDateBangkok },
        },
        select: {
          usageDate: true,
          deviceType: true,
          usedSeconds: true,
        },
        orderBy: { usageDate: 'desc' },
      }),
      this.prisma.deviceTimeGrant.findMany({
        where: {
          childProfileId,
          createdAt: { gte: sinceDate },
        },
        select: {
          usageDate: true,
          extraMinutes: true,
          note: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const weeklyUsage = new Map<string, number>();
    for (const day of deviceUsage) {
      const wk = weekKey(new Date(day.usageDate));
      weeklyUsage.set(wk, (weeklyUsage.get(wk) ?? 0) + day.usedSeconds);
    }

    const weeklyProgress = new Map<
      string,
      { completed: number; watched: number; minutes: number }
    >();
    for (const p of progress) {
      const wk = p.lastWatchedAt
        ? weekKey(p.lastWatchedAt)
        : weekKey(p.updatedAt);
      const prev = weeklyProgress.get(wk) ?? {
        completed: 0,
        watched: 0,
        minutes: 0,
      };
      prev.watched += 1;
      if (p.status === 'COMPLETED') prev.completed += 1;
      const sec =
        p.status === 'COMPLETED'
          ? (p.lesson.durationSec ?? p.lastPositionSec)
          : p.lastPositionSec;
      prev.minutes += Math.ceil(Math.max(sec, 0) / 60);
      weeklyProgress.set(wk, prev);
    }

    return {
      childProfileId,
      period: { weeks: weeksCount, sinceDate },
      summary: {
        totalLessonsWatched: progress.length,
        completedLessons: progress.filter((p) => p.status === 'COMPLETED')
          .length,
        totalWatchCount: progress.reduce((s, p) => s + p.watchCount, 0),
        totalStudyMinutes: Math.ceil(
          progress.reduce((s, p) => {
            const sec =
              p.status === 'COMPLETED'
                ? (p.lesson.durationSec ?? p.lastPositionSec)
                : p.lastPositionSec;
            return s + Math.max(sec, 0);
          }, 0) / 60,
        ),
        totalDeviceMinutes: Math.ceil(
          deviceUsage.reduce((s, d) => s + d.usedSeconds, 0) / 60,
        ),
        totalGrantedExtraMinutes: grantsData.reduce(
          (s, g) => s + g.extraMinutes,
          0,
        ),
      },
      weeklyUsage: Array.from(weeklyUsage.entries()).map(
        ([week, usedSeconds]) => ({
          week,
          usedSeconds,
          usedMinutes: Math.ceil(usedSeconds / 60),
          ...(weeklyProgress.get(week) ?? {
            completed: 0,
            watched: 0,
            minutes: 0,
          }),
        }),
      ),
      recentLessons: progress.slice(0, 20).map((p) => ({
        lessonId: p.lesson.id,
        title: p.lesson.title,
        status: p.status,
        progressPercent:
          p.status === 'COMPLETED'
            ? 100
            : p.lesson.durationSec && p.lesson.durationSec > 0
              ? Math.min(
                  95,
                  Math.round((p.lastPositionSec / p.lesson.durationSec) * 100),
                )
              : p.status === 'IN_PROGRESS'
                ? 40
                : 0,
        watchCount: p.watchCount,
        lastWatchedAt: p.lastWatchedAt,
        hasPractice: (p.lesson.activities ?? []).length > 0,
      })),
      deviceGrants: grantsData,
    };
  }

  async getChildLearningReport(
    user: AuthenticatedUser,
    childProfileId: string,
    range: LearningReportRange = '7d',
  ) {
    if (!['7d', '30d'].includes(range)) {
      throw new BadRequestException('range must be 7d or 30d');
    }

    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      notFoundForDenied: true,
      purpose: 'parent-learning-report',
    });
    await this.assertTrialReportAvailable(childProfileId);

    const rangeDays = range === '30d' ? 30 : 7;
    const toDate = todayInBangkok();
    const fromDate = addDaysToDateKey(toDate, -(rangeDays - 1));
    const fromDateTime = bangkokDateStart(fromDate);
    const toDateTime = bangkokDateEnd(toDate);
    const dateKeys = dateKeysBetween(fromDate, toDate);

    const [child, activeAssignment, plans, videoLogs, attempts] =
      await Promise.all([
        this.prisma.childProfile.findUnique({
          where: { id: childProfileId },
          select: { id: true, displayName: true },
        }),
        this.prisma.childContentAssignment.findFirst({
          where: { childProfileId, status: 'ACTIVE' },
          orderBy: { startedAt: 'desc' },
          include: {
            contentPackage: {
              select: {
                id: true,
                code: true,
                title: true,
                learningPath: {
                  select: { id: true, code: true, title: true },
                },
              },
            },
          },
        }),
        this.prisma.dailyLearningPlan.findMany({
          where: {
            childProfileId,
            planDate: { gte: fromDate, lte: toDate },
          },
          orderBy: { planDate: 'asc' },
          include: {
            contentPackage: {
              select: { id: true, code: true, title: true },
            },
            learningPath: {
              select: { id: true, code: true, title: true },
            },
            items: {
              orderBy: { sequence: 'asc' },
              include: {
                lesson: { select: { id: true, title: true } },
                activity: { select: { id: true, title: true } },
              },
            },
          },
        }),
        this.prisma.videoExposureLog.findMany({
          where: {
            childProfileId,
            createdAt: { gte: fromDateTime, lte: toDateTime },
          },
          orderBy: [{ watchPercent: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            lessonId: true,
            videoAssetId: true,
            eventType: true,
            positionSec: true,
            durationWatchedSec: true,
            watchPercent: true,
            source: true,
            createdAt: true,
          },
        }),
        this.prisma.activityAttempt.findMany({
          where: {
            childProfileId,
            status: 'GRADED',
            submittedAt: { gte: fromDateTime, lte: toDateTime },
          },
          orderBy: [{ score: 'desc' }, { submittedAt: 'desc' }],
          select: {
            id: true,
            activityId: true,
            score: true,
            maxScore: true,
            submittedAt: true,
          },
        }),
      ]);

    if (!child) {
      throw new NotFoundException('Child profile not found');
    }

    const plansByDate = new Map(plans.map((plan) => [plan.planDate, plan]));
    const videoLogsByDate = groupByDate(videoLogs, (item) => item.createdAt);
    const attemptsByDate = groupByDate(
      attempts,
      (item) => item.submittedAt ?? fromDateTime,
    );
    const videoLogsByLessonId = groupByKey(videoLogs, (item) => item.lessonId);
    const attemptsByActivityId = groupByKey(
      attempts,
      (item) => item.activityId,
    );

    const days = dateKeys.map((date) => {
      const plan = plansByDate.get(date);
      const dateVideoLogs = videoLogsByDate.get(date) ?? [];
      const dateAttempts = attemptsByDate.get(date) ?? [];

      const items = (plan?.items ?? []).map((item) => {
        if (item.itemType === 'VIDEO') {
          const evidence = item.lessonId
            ? (videoLogsByLessonId.get(item.lessonId)?.[0] ?? null)
            : null;
          const minWatchPercent =
            item.minWatchPercent ?? defaultMinWatchPercent;
          const passed = (evidence?.watchPercent ?? 0) >= minWatchPercent;

          return {
            itemId: item.id,
            itemType: item.itemType,
            status: item.status,
            lessonId: item.lessonId,
            lessonTitle: item.lesson?.title ?? null,
            activityId: item.activityId,
            activityTitle: item.activity?.title ?? null,
            evidenceSummary: {
              type: 'VIDEO_EXPOSURE',
              evidenceId: evidence?.id ?? null,
              videoAssetId: evidence?.videoAssetId ?? null,
              eventType: evidence?.eventType ?? null,
              positionSec: evidence?.positionSec ?? 0,
              durationWatchedSec: evidence?.durationWatchedSec ?? 0,
              watchPercent: evidence?.watchPercent ?? 0,
              minWatchPercent,
              passed,
              source: evidence?.source ?? null,
              createdAt: evidence?.createdAt ?? null,
            },
            blockedReason: passed ? null : 'WATCH_EVIDENCE_INSUFFICIENT',
            blockedMessage: passed
              ? null
              : parentBlockedMessage('WATCH_EVIDENCE_INSUFFICIENT'),
          };
        }

        if (item.itemType === 'PRACTICE') {
          const attempt = item.activityId
            ? (attemptsByActivityId.get(item.activityId)?.[0] ?? null)
            : null;
          const percent = attempt
            ? calculateAttemptPercent(attempt.score, attempt.maxScore)
            : 0;
          const minScore = item.minScore;
          const passed =
            !!attempt && (minScore === null || percent >= minScore);
          const blockedReason = !attempt
            ? 'PRACTICE_ATTEMPT_REQUIRED'
            : passed
              ? null
              : 'PRACTICE_SCORE_BELOW_MIN';

          return {
            itemId: item.id,
            itemType: item.itemType,
            status: item.status,
            lessonId: item.lessonId,
            lessonTitle: item.lesson?.title ?? null,
            activityId: item.activityId,
            activityTitle: item.activity?.title ?? null,
            evidenceSummary: {
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
            blockedMessage: blockedReason
              ? parentBlockedMessage(blockedReason)
              : null,
          };
        }

        return {
          itemId: item.id,
          itemType: item.itemType,
          status: item.status,
          lessonId: item.lessonId,
          lessonTitle: item.lesson?.title ?? null,
          activityId: item.activityId,
          activityTitle: item.activity?.title ?? null,
          evidenceSummary: null,
          blockedReason: null,
          blockedMessage: null,
        };
      });

      const completedItems = items.filter(
        (item) => item.status === 'COMPLETED',
      ).length;
      const blockedItems = items.filter((item) => item.blockedReason).length;
      const videoItems = items.filter((item) => item.itemType === 'VIDEO');
      const practiceItems = items.filter(
        (item) => item.itemType === 'PRACTICE',
      );
      const maxWatchPercent = maxOrNull([
        ...dateVideoLogs.map((item) => item.watchPercent),
        ...videoItems.map(
          (item) =>
            (item.evidenceSummary as { watchPercent?: number } | null)
              ?.watchPercent ?? 0,
        ),
      ]);
      const dateAttemptPercents = dateAttempts.map((attempt) =>
        calculateAttemptPercent(attempt.score, attempt.maxScore),
      );

      return {
        date,
        planId: plan?.id ?? null,
        planStatus: plan?.status ?? null,
        title: plan
          ? (plan.contentPackage?.title ??
            plan.learningPath?.title ??
            'Kế hoạch học')
          : null,
        completedItems,
        totalItems: items.length,
        blockedItems,
        videoSummary: {
          completed: videoItems.filter(
            (item) =>
              (item.evidenceSummary as { passed?: boolean } | null)?.passed,
          ).length,
          insufficientEvidence: videoItems.filter(
            (item) => item.blockedReason === 'WATCH_EVIDENCE_INSUFFICIENT',
          ).length,
          maxWatchPercent,
          watchEvidenceMinutes: secondsToMinutes(
            dateVideoLogs.reduce(
              (sum, item) => sum + item.durationWatchedSec,
              0,
            ),
          ),
        },
        practiceSummary: {
          completed: practiceItems.filter(
            (item) =>
              (item.evidenceSummary as { passed?: boolean } | null)?.passed,
          ).length,
          attempts: dateAttempts.length,
          averageScorePercent: averageOrNull(dateAttemptPercents),
          belowMinScore: practiceItems.filter(
            (item) => item.blockedReason === 'PRACTICE_SCORE_BELOW_MIN',
          ).length,
        },
        items,
        emptyState: plan
          ? null
          : emptyDayState(activeAssignment ? 'NO_PLAN' : 'NO_ASSIGNMENT'),
      };
    });

    const allItems = days.flatMap((day) => day.items);
    const attemptPercents = attempts.map((attempt) =>
      calculateAttemptPercent(attempt.score, attempt.maxScore),
    );

    return {
      child: {
        id: child.id,
        displayName: child.displayName,
      },
      range,
      fromDate,
      toDate,
      activeAssignment: activeAssignment
        ? {
            packageId: activeAssignment.contentPackage.id,
            packageCode: activeAssignment.contentPackage.code,
            packageTitle: activeAssignment.contentPackage.title,
            learningPathId: activeAssignment.contentPackage.learningPath.id,
            learningPathCode: activeAssignment.contentPackage.learningPath.code,
            learningPathTitle:
              activeAssignment.contentPackage.learningPath.title,
          }
        : null,
      summary: {
        planDays: plans.length,
        completedPlanDays: days.filter((day) => day.planStatus === 'COMPLETED')
          .length,
        activeDays: days.filter(
          (day) =>
            day.totalItems > 0 ||
            day.videoSummary.watchEvidenceMinutes > 0 ||
            day.practiceSummary.attempts > 0,
        ).length,
        totalItems: allItems.length,
        completedItems: allItems.filter((item) => item.status === 'COMPLETED')
          .length,
        skippedItems: allItems.filter((item) => item.status === 'SKIPPED')
          .length,
        blockedItems: allItems.filter((item) => item.blockedReason).length,
        videoItemsCompleted: allItems.filter(
          (item) =>
            item.itemType === 'VIDEO' &&
            (item.evidenceSummary as { passed?: boolean } | null)?.passed,
        ).length,
        practiceItemsCompleted: allItems.filter(
          (item) =>
            item.itemType === 'PRACTICE' &&
            (item.evidenceSummary as { passed?: boolean } | null)?.passed,
        ).length,
        averagePracticeScorePercent: averageOrNull(attemptPercents),
        totalWatchEvidenceMinutes: secondsToMinutes(
          videoLogs.reduce((sum, item) => sum + item.durationWatchedSec, 0),
        ),
        bestWatchPercent: maxOrNull(videoLogs.map((item) => item.watchPercent)),
      },
      days,
      emptyState:
        plans.length === 0 && videoLogs.length === 0 && attempts.length === 0
          ? emptyDayState(activeAssignment ? 'NO_PLAN' : 'NO_ASSIGNMENT')
          : null,
    };
  }

  private async assertTrialReportAvailable(childProfileId: string) {
    const trial = await this.prisma.subscription.findFirst({
      where: {
        childProfileId,
        providerRef: FREE_TRIAL_PROVIDER_REF,
      },
      orderBy: { currentPeriodEnd: 'desc' },
      select: {
        childProfile: {
          select: {
            trialAccess: { select: { reportAvailableAt: true } },
          },
        },
      },
    });
    const availableAt = trial?.childProfile.trialAccess?.reportAvailableAt;
    if (availableAt && availableAt > new Date()) {
      throw new ForbiddenException(
        'Trial learning report becomes available at the end of day 2.',
      );
    }
  }
}
