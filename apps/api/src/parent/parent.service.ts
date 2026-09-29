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
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import { GrantExtraDeviceTimeDto } from './dto/grant-extra-device-time.dto';
import { UpdateChildScreenTimeDto } from './dto/update-child-screen-time.dto';

type ChildProgressSummary = {
  completedLessons: number;
  inProgressLessons: number;
  watchedLessons: number;
  totalWatchCount: number;
  weeklyStudyMinutes: number;
  currentLesson?: {
    id: string;
    title: string;
    progressPercent: number;
    hasPractice: boolean;
    lastWatchedAt: Date | null;
  };
};

type ChildDeviceUsageSummary = {
  usedSeconds: number;
  byDevice: Array<{
    deviceType: string;
    usedSeconds: number;
  }>;
};

type LearningReportRange = '7d' | '30d';

const defaultMinWatchPercent = 80;

@Injectable()
export class ParentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
  ) {}

  async listChildren(user: AuthenticatedUser) {
    const now = new Date();
    const usageDate = this.todayInBangkok();

    const children = await this.prisma.childProfile.findMany({
      where: { parentId: user.sub },
      orderBy: { createdAt: 'asc' },
      include: {
        subscriptions: {
          where: {
            status: { in: ['TRIALING', 'ACTIVE'] },
            currentPeriodStart: { lte: now },
            currentPeriodEnd: { gt: now },
          },
          orderBy: { currentPeriodEnd: 'desc' },
          take: 1,
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
        screenTime: true,
        deviceTimeGrants: {
          where: { usageDate },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const childIds = children.map((c) => c.id);
    const [progressItems, usageItems] = await Promise.all([
      childIds.length > 0
        ? this.prisma.lessonProgress.findMany({
            where: { childProfileId: { in: childIds } },
            select: {
              childProfileId: true,
              status: true,
              lastPositionSec: true,
              watchCount: true,
              lastWatchedAt: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  durationSec: true,
                  activities: { select: { id: true }, take: 1 },
                },
              },
            },
          })
        : Promise.resolve([]),
      childIds.length > 0
        ? this.prisma.learningUsageDay.findMany({
            where: { childProfileId: { in: childIds }, usageDate },
            select: {
              childProfileId: true,
              deviceType: true,
              usedSeconds: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const progressByChildId = this.summarizeProgress(progressItems);
    const usageByChildId = this.summarizeDeviceUsage(usageItems);

    return {
      children: children.map((child) => {
        const progress =
          progressByChildId.get(child.id) ?? this.emptyProgress();
        const deviceUsage =
          usageByChildId.get(child.id) ?? this.emptyDeviceUsage();
        const progressBase = Math.max(progress.watchedLessons, 1);

        return {
          id: child.id,
          displayName: child.displayName,
          avatarUrl: child.avatarUrl,
          subscription: child.subscriptions[0] ?? null,
          screenTime: this.toScreenTime(child.screenTime),
          deviceUsage: this.toDeviceUsage(
            child.screenTime,
            this.sumExtraMinutes(child.deviceTimeGrants ?? []),
            deviceUsage,
            usageDate,
          ),
          insight: this.toInsight(
            progress,
            deviceUsage,
            child.screenTime,
            this.sumExtraMinutes(child.deviceTimeGrants ?? []),
          ),
          progress: {
            ...progress,
            completionRate: Math.round(
              (progress.completedLessons / progressBase) * 100,
            ),
          },
        };
      }),
    };
  }

  async createChild(user: AuthenticatedUser, dto: CreateChildProfileDto) {
    if (user.sub.startsWith('demo-')) {
      throw new BadRequestException(
        'Demo accounts cannot manage child profiles',
      );
    }

    const child = await this.prisma.childProfile.create({
      data: {
        parentId: user.sub,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
    });

    return {
      id: child.id,
      displayName: child.displayName,
      avatarUrl: child.avatarUrl,
      createdAt: child.createdAt,
    };
  }

  async deleteChild(user: AuthenticatedUser, childProfileId: string) {
    if (user.sub.startsWith('demo-')) {
      throw new BadRequestException(
        'Demo accounts cannot manage child profiles',
      );
    }

    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { parentId: true },
    });

    if (!child || child.parentId !== user.sub) {
      throw new NotFoundException('Child profile not found');
    }

    await this.prisma.childProfile.delete({ where: { id: childProfileId } });

    return { success: true };
  }

  async updateScreenTime(
    childProfileId: string,
    dto: UpdateChildScreenTimeDto,
    user: AuthenticatedUser,
  ) {
    if (
      dto.isEnabled === undefined &&
      dto.dailyLimitMinutes === undefined &&
      dto.sessionLimitMinutes === undefined &&
      dto.breakMinutes === undefined
    ) {
      throw new BadRequestException('No screen time setting was provided');
    }

    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { parentId: true },
    });

    if (!child || child.parentId !== user.sub) {
      throw new NotFoundException('Child profile not found');
    }

    const settingUpdate: {
      isEnabled?: boolean;
      dailyLimitMinutes?: number;
      sessionLimitMinutes?: number;
      breakMinutes?: number;
    } = {};
    if (dto.isEnabled !== undefined) settingUpdate.isEnabled = dto.isEnabled;
    if (dto.dailyLimitMinutes !== undefined)
      settingUpdate.dailyLimitMinutes = dto.dailyLimitMinutes;
    if (dto.sessionLimitMinutes !== undefined)
      settingUpdate.sessionLimitMinutes = dto.sessionLimitMinutes;
    if (dto.breakMinutes !== undefined)
      settingUpdate.breakMinutes = dto.breakMinutes;

    const setting = await this.prisma.childScreenTimeSetting.upsert({
      where: { childProfileId },
      update: settingUpdate,
      create: {
        childProfileId,
        isEnabled: dto.isEnabled ?? true,
        dailyLimitMinutes: dto.dailyLimitMinutes ?? 45,
        sessionLimitMinutes: dto.sessionLimitMinutes ?? 30,
        breakMinutes: dto.breakMinutes ?? 10,
      },
    });

    return this.toScreenTime(setting);
  }

  async grantExtraDeviceTime(
    childProfileId: string,
    dto: GrantExtraDeviceTimeDto,
    user: AuthenticatedUser,
  ) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { parentId: true, screenTime: true },
    });

    if (!child || child.parentId !== user.sub) {
      throw new NotFoundException('Child profile not found');
    }

    if (!child.screenTime?.isEnabled) {
      throw new BadRequestException('Device limit must be enabled first');
    }

    const grant = await this.prisma.deviceTimeGrant.create({
      data: {
        childProfileId,
        grantedById: user.sub,
        usageDate: this.todayInBangkok(),
        extraMinutes: dto.extraMinutes,
        note: dto.note,
      },
    });

    return {
      id: grant.id,
      usageDate: grant.usageDate,
      extraMinutes: grant.extraMinutes,
      createdAt: grant.createdAt,
    };
  }

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
      const wk = this.weekKey(new Date(day.usageDate));
      weeklyUsage.set(wk, (weeklyUsage.get(wk) ?? 0) + day.usedSeconds);
    }

    const weeklyProgress = new Map<
      string,
      { completed: number; watched: number; minutes: number }
    >();
    for (const p of progress) {
      const wk = p.lastWatchedAt
        ? this.weekKey(p.lastWatchedAt)
        : this.weekKey(p.updatedAt);
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
    const toDate = this.todayInBangkok();
    const fromDate = this.addDaysToDateKey(toDate, -(rangeDays - 1));
    const fromDateTime = this.bangkokDateStart(fromDate);
    const toDateTime = this.bangkokDateEnd(toDate);
    const dateKeys = this.dateKeysBetween(fromDate, toDate);

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
    const videoLogsByDate = this.groupByDate(
      videoLogs,
      (item) => item.createdAt,
    );
    const attemptsByDate = this.groupByDate(
      attempts,
      (item) => item.submittedAt ?? fromDateTime,
    );
    const videoLogsByLessonId = this.groupByKey(
      videoLogs,
      (item) => item.lessonId,
    );
    const attemptsByActivityId = this.groupByKey(
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
              : this.parentBlockedMessage('WATCH_EVIDENCE_INSUFFICIENT'),
          };
        }

        if (item.itemType === 'PRACTICE') {
          const attempt = item.activityId
            ? (attemptsByActivityId.get(item.activityId)?.[0] ?? null)
            : null;
          const percent = attempt
            ? this.calculateAttemptPercent(attempt.score, attempt.maxScore)
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
              ? this.parentBlockedMessage(blockedReason)
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
      const maxWatchPercent = this.maxOrNull([
        ...dateVideoLogs.map((item) => item.watchPercent),
        ...videoItems.map(
          (item) =>
            (item.evidenceSummary as { watchPercent?: number } | null)
              ?.watchPercent ?? 0,
        ),
      ]);
      const dateAttemptPercents = dateAttempts.map((attempt) =>
        this.calculateAttemptPercent(attempt.score, attempt.maxScore),
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
          watchEvidenceMinutes: this.secondsToMinutes(
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
          averageScorePercent: this.averageOrNull(dateAttemptPercents),
          belowMinScore: practiceItems.filter(
            (item) => item.blockedReason === 'PRACTICE_SCORE_BELOW_MIN',
          ).length,
        },
        items,
        emptyState: plan
          ? null
          : this.emptyDayState(activeAssignment ? 'NO_PLAN' : 'NO_ASSIGNMENT'),
      };
    });

    const allItems = days.flatMap((day) => day.items);
    const attemptPercents = attempts.map((attempt) =>
      this.calculateAttemptPercent(attempt.score, attempt.maxScore),
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
        averagePracticeScorePercent: this.averageOrNull(attemptPercents),
        totalWatchEvidenceMinutes: this.secondsToMinutes(
          videoLogs.reduce((sum, item) => sum + item.durationWatchedSec, 0),
        ),
        bestWatchPercent: this.maxOrNull(
          videoLogs.map((item) => item.watchPercent),
        ),
      },
      days,
      emptyState:
        plans.length === 0 && videoLogs.length === 0 && attempts.length === 0
          ? this.emptyDayState(activeAssignment ? 'NO_PLAN' : 'NO_ASSIGNMENT')
          : null,
    };
  }

  private summarizeProgress(
    progressItems: Array<{
      childProfileId: string;
      status: string;
      lastPositionSec: number;
      watchCount: number;
      lastWatchedAt: Date | null;
      lesson: {
        id: string;
        title: string;
        durationSec: number | null;
        activities: Array<{ id: string }>;
      };
    }>,
  ) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const progressByChildId = new Map<string, ChildProgressSummary>();

    for (const item of progressItems) {
      const summary =
        progressByChildId.get(item.childProfileId) ?? this.emptyProgress();
      const studiedSeconds =
        item.status === 'COMPLETED'
          ? (item.lesson.durationSec ?? item.lastPositionSec)
          : item.lastPositionSec;

      summary.watchedLessons += 1;
      summary.totalWatchCount += item.watchCount;

      if (item.status === 'COMPLETED') summary.completedLessons += 1;
      if (item.status === 'IN_PROGRESS') summary.inProgressLessons += 1;

      if (item.lastWatchedAt && item.lastWatchedAt >= weekAgo) {
        summary.weeklyStudyMinutes += Math.ceil(
          Math.max(studiedSeconds, 0) / 60,
        );
      }

      const progressPercent =
        item.status === 'COMPLETED'
          ? 100
          : item.lesson.durationSec && item.lesson.durationSec > 0
            ? Math.min(
                95,
                Math.round(
                  (item.lastPositionSec / item.lesson.durationSec) * 100,
                ),
              )
            : item.status === 'IN_PROGRESS'
              ? 40
              : 0;

      const current = summary.currentLesson;
      if (
        item.lastWatchedAt &&
        (!current?.lastWatchedAt || item.lastWatchedAt > current.lastWatchedAt)
      ) {
        summary.currentLesson = {
          id: item.lesson.id,
          title: item.lesson.title,
          progressPercent,
          hasPractice: (item.lesson.activities ?? []).length > 0,
          lastWatchedAt: item.lastWatchedAt,
        };
      }

      progressByChildId.set(item.childProfileId, summary);
    }

    return progressByChildId;
  }

  private emptyProgress(): ChildProgressSummary {
    return {
      completedLessons: 0,
      inProgressLessons: 0,
      watchedLessons: 0,
      totalWatchCount: 0,
      weeklyStudyMinutes: 0,
    };
  }

  private summarizeDeviceUsage(
    usageItems: Array<{
      childProfileId: string;
      deviceType: string;
      usedSeconds: number;
    }>,
  ) {
    const usageByChildId = new Map<string, ChildDeviceUsageSummary>();

    for (const item of usageItems) {
      const summary =
        usageByChildId.get(item.childProfileId) ?? this.emptyDeviceUsage();
      summary.usedSeconds += item.usedSeconds;
      summary.byDevice.push({
        deviceType: item.deviceType,
        usedSeconds: item.usedSeconds,
      });
      usageByChildId.set(item.childProfileId, summary);
    }

    return usageByChildId;
  }

  private emptyDeviceUsage(): ChildDeviceUsageSummary {
    return { usedSeconds: 0, byDevice: [] };
  }

  private toScreenTime(
    setting: {
      isEnabled: boolean;
      dailyLimitMinutes: number;
      sessionLimitMinutes: number;
      breakMinutes: number;
      updatedAt: Date;
    } | null,
  ) {
    return {
      isEnabled: setting?.isEnabled ?? false,
      dailyLimitMinutes: setting?.dailyLimitMinutes ?? 45,
      sessionLimitMinutes: setting?.sessionLimitMinutes ?? 30,
      breakMinutes: setting?.breakMinutes ?? 10,
      updatedAt: setting?.updatedAt ?? null,
    };
  }

  private toDeviceUsage(
    setting: { isEnabled: boolean; dailyLimitMinutes: number } | null,
    extraMinutesToday: number,
    usage: ChildDeviceUsageSummary,
    usageDate: string,
  ) {
    const baseLimitMinutes = setting?.isEnabled
      ? setting.dailyLimitMinutes
      : null;
    const limitMinutes =
      baseLimitMinutes === null ? null : baseLimitMinutes + extraMinutesToday;
    const limitSeconds = limitMinutes === null ? null : limitMinutes * 60;
    const remainingSeconds =
      limitSeconds === null
        ? null
        : Math.max(0, limitSeconds - usage.usedSeconds);

    return {
      usageDate,
      isLimited: limitMinutes !== null,
      limitMinutes,
      baseLimitMinutes,
      grantedExtraMinutes: extraMinutesToday,
      usedSeconds: usage.usedSeconds,
      usedMinutes: Math.ceil(usage.usedSeconds / 60),
      remainingSeconds,
      remainingMinutes:
        remainingSeconds === null ? null : Math.ceil(remainingSeconds / 60),
      limitReached: limitSeconds !== null && usage.usedSeconds >= limitSeconds,
      byDevice: usage.byDevice.map((item) => ({
        deviceType: item.deviceType,
        usedSeconds: item.usedSeconds,
        usedMinutes: Math.ceil(item.usedSeconds / 60),
      })),
    };
  }

  private sumExtraMinutes(grants: Array<{ extraMinutes: number }>) {
    return grants.reduce((sum, grant) => sum + grant.extraMinutes, 0);
  }

  private toInsight(
    progress: ChildProgressSummary,
    usage: ChildDeviceUsageSummary,
    setting: { isEnabled: boolean; dailyLimitMinutes: number } | null,
    extraMinutesToday: number,
  ) {
    const effectiveLimit = setting?.isEnabled
      ? setting.dailyLimitMinutes + extraMinutesToday
      : null;
    const usedMinutes = Math.ceil(usage.usedSeconds / 60);

    if (effectiveLimit !== null && usedMinutes >= effectiveLimit) {
      return {
        status: 'LIMIT_REACHED',
        title: 'Đã hết thời gian thiết bị hôm nay',
        description: progress.currentLesson
          ? `${progress.currentLesson.title} đang tạm dừng ở ${progress.currentLesson.progressPercent}%.`
          : 'Học tập đã dừng cho đến khi được cộng thêm thời gian.',
        recommendedAction:
          'Cộng thêm 10 hoặc 15 phút nếu con cần hoàn thành bài hôm nay.',
        currentLesson: progress.currentLesson ?? null,
      };
    }

    if (
      progress.currentLesson?.hasPractice &&
      progress.currentLesson.progressPercent >= 70
    ) {
      return {
        status: 'PRACTICE_READY',
        title: 'Sẵn sàng làm bài kiểm tra',
        description: `${progress.currentLesson.title} đã xem đủ để làm bài kiểm tra sau video.`,
        recommendedAction:
          'Nhắc con làm nhanh phần kiểm tra trước khi tắt máy.',
        currentLesson: progress.currentLesson,
      };
    }

    if (progress.currentLesson) {
      return {
        status: 'IN_PROGRESS',
        title: 'Tiếp tục bài đang học',
        description: `${progress.currentLesson.title} đang ở ${progress.currentLesson.progressPercent}%.`,
        recommendedAction: 'Giữ mỗi buổi học ngắn và tập trung.',
        currentLesson: progress.currentLesson,
      };
    }

    return {
      status: 'NO_ACTIVITY',
      title: 'Chưa có hoạt động học tập',
      description: 'Con chưa xem bài học nào.',
      recommendedAction: 'Bắt đầu với video bài học đầu tiên.',
      currentLesson: null,
    };
  }

  private groupByDate<T>(
    items: T[],
    getDate: (item: T) => Date,
  ): Map<string, T[]> {
    const byDate = new Map<string, T[]>();
    for (const item of items) {
      const key = this.dateKeyInBangkok(getDate(item));
      const group = byDate.get(key) ?? [];
      group.push(item);
      byDate.set(key, group);
    }
    return byDate;
  }

  private groupByKey<T>(items: T[], getKey: (item: T) => string | null) {
    const byKey = new Map<string, T[]>();
    for (const item of items) {
      const key = getKey(item);
      if (!key) {
        continue;
      }
      const group = byKey.get(key) ?? [];
      group.push(item);
      byKey.set(key, group);
    }
    return byKey;
  }

  private dateKeysBetween(fromDate: string, toDate: string) {
    const dates: string[] = [];
    let current = fromDate;
    while (current <= toDate) {
      dates.push(current);
      current = this.addDaysToDateKey(current, 1);
    }
    return dates;
  }

  private addDaysToDateKey(dateKey: string, days: number) {
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private bangkokDateStart(dateKey: string) {
    return new Date(`${dateKey}T00:00:00.000+07:00`);
  }

  private bangkokDateEnd(dateKey: string) {
    const nextDay = this.addDaysToDateKey(dateKey, 1);
    return new Date(this.bangkokDateStart(nextDay).getTime() - 1);
  }

  private dateKeyInBangkok(date: Date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private secondsToMinutes(seconds: number) {
    return Math.round(Math.max(0, seconds) / 60);
  }

  private averageOrNull(values: number[]) {
    if (values.length === 0) {
      return null;
    }
    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }

  private maxOrNull(values: number[]) {
    if (values.length === 0) {
      return null;
    }
    return Math.max(...values);
  }

  private calculateAttemptPercent(score: number, maxScore: number) {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : score;
  }

  private parentBlockedMessage(reason: string) {
    const messages: Record<string, string> = {
      WATCH_EVIDENCE_INSUFFICIENT: 'Con chưa xem đủ video để tính hoàn thành.',
      PRACTICE_ATTEMPT_REQUIRED:
        'Con chưa làm bài luyện tập để có điểm hoàn thành.',
      PRACTICE_SCORE_BELOW_MIN:
        'Con đã làm bài nhưng điểm chưa đạt mức hoàn thành.',
      NO_PLAN: 'Chưa có kế hoạch học cho ngày này.',
      NO_ASSIGNMENT: 'Con chưa được gán lộ trình học chính.',
    };

    return messages[reason] ?? reason;
  }

  private emptyDayState(reason: 'NO_PLAN' | 'NO_ASSIGNMENT') {
    return {
      code: reason,
      message: this.parentBlockedMessage(reason),
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

  private todayInBangkok() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  private weekKey(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  }
}
