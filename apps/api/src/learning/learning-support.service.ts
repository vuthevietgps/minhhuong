import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  EntitlementService,
  LearningCapability,
} from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { LearningPathService } from '../learning-path/learning-path.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScreenTimeService } from '../screen-time/screen-time.service';
import {
  detectDeviceType,
  todayInBangkok,
  tracksDeviceUsage,
} from './learning.helpers';

/** Shared learner access, entitlement and progress helpers. */
@Injectable()
export class LearningSupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
    private readonly learningPath: LearningPathService,
    private readonly screenTime: ScreenTimeService,
  ) {}

  async getLearningLessonSource(childProfileId: string) {
    const assignedPath = await this.learningPath.getActiveAssignedLessonIds(
      childProfileId,
      { requireReadyVideo: true },
    );

    if (assignedPath) {
      const lessons = await this.getPublishedVideoLessonsForUser(
        childProfileId,
        assignedPath.lessonIds,
      );

      return {
        contentSource: {
          ...assignedPath,
          lessonCount: lessons.length,
        },
        lessons,
      };
    }

    const lessons = await this.getPublishedVideoLessonsForUser(childProfileId);
    return {
      contentSource: {
        mode: 'UNASSIGNED_FALLBACK' as const,
        reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
        lessonCount: lessons.length,
      },
      lessons,
    };
  }

  async getPublishedVideoLessonsForUser(
    childProfileId: string,
    lessonIds?: string[],
  ) {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        ...(lessonIds ? { id: { in: lessonIds } } : {}),
        status: 'PUBLISHED',
        videos: {
          some: {
            processingStatus: 'READY',
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        durationSec: true,
        sortOrder: true,
        unit: {
          select: {
            id: true,
            title: true,
            description: true,
            sortOrder: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                sortOrder: true,
                level: {
                  select: {
                    code: true,
                    title: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
        videos: {
          where: { processingStatus: 'READY' },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            provider: true,
            sourceUrl: true,
            embedUrl: true,
            thumbnailUrl: true,
            durationSec: true,
          },
        },
        activities: {
          select: {
            id: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
          orderBy: {
            tag: {
              sortOrder: 'asc',
            },
          },
        },
        progress: {
          where: { childProfileId },
          take: 1,
          select: {
            status: true,
            score: true,
            lastPositionSec: true,
            watchCount: true,
            lastWatchedAt: true,
            isFavorite: true,
          },
        },
      },
    });

    if (!lessonIds) {
      return lessons;
    }

    const sequenceByLessonId = new Map(
      lessonIds.map((lessonId, index) => [lessonId, index]),
    );

    return lessons.sort(
      (left, right) =>
        (sequenceByLessonId.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (sequenceByLessonId.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }

  async assertDailyDeviceTimeAvailable(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    if (!tracksDeviceUsage(user, childProfileId)) {
      return;
    }

    const usage = await this.getUsageStatus(user, childProfileId, userAgent);
    if (usage.limitReached) {
      throw new ForbiddenException(
        'Daily device limit reached. Ask your parent to adjust today limit.',
      );
    }
  }

  async getUsageStatus(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    const usageDate = todayInBangkok();
    const deviceType = detectDeviceType(userAgent);

    if (!tracksDeviceUsage(user, childProfileId)) {
      return {
        usageDate,
        deviceType,
        isLimited: false,
        limitMinutes: null,
        usedSeconds: 0,
        usedMinutes: 0,
        remainingSeconds: null,
        remainingMinutes: null,
        isWarning: false,
        limitReached: false,
        byDevice: [],
      };
    }

    const [limitMinutes, usageRows] = await Promise.all([
      this.getActiveDeviceLimitMinutes(childProfileId),
      this.prisma.learningUsageDay.findMany({
        where: {
          childProfileId,
          usageDate,
        },
        select: {
          deviceType: true,
          usedSeconds: true,
        },
      }),
    ]);
    const usedSeconds = usageRows.reduce(
      (sum, row) => sum + row.usedSeconds,
      0,
    );
    const limitSeconds = limitMinutes ? limitMinutes * 60 : null;
    const remainingSeconds =
      limitSeconds === null ? null : Math.max(0, limitSeconds - usedSeconds);

    return {
      usageDate,
      deviceType,
      isLimited: limitMinutes !== null,
      limitMinutes,
      usedSeconds,
      usedMinutes: Math.ceil(usedSeconds / 60),
      remainingSeconds,
      remainingMinutes:
        remainingSeconds === null ? null : Math.ceil(remainingSeconds / 60),
      isWarning:
        remainingSeconds !== null &&
        remainingSeconds > 0 &&
        remainingSeconds <= 600,
      limitReached: limitSeconds !== null && usedSeconds >= limitSeconds,
      byDevice: usageRows.map((row) => ({
        deviceType: row.deviceType,
        usedSeconds: row.usedSeconds,
        usedMinutes: Math.ceil(row.usedSeconds / 60),
      })),
    };
  }

  private async getActiveDeviceLimitMinutes(childProfileId: string) {
    const usageDate = todayInBangkok();
    const childProfile = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: {
        screenTime: {
          select: {
            isEnabled: true,
            dailyLimitMinutes: true,
          },
        },
        deviceTimeGrants: {
          where: { usageDate },
          select: { extraMinutes: true },
        },
      },
    });

    if (!childProfile?.screenTime?.isEnabled) {
      return null;
    }

    const base = childProfile.screenTime.dailyLimitMinutes;
    const extra = childProfile.deviceTimeGrants.reduce(
      (sum, grant) => sum + grant.extraMinutes,
      0,
    );
    return base + extra;
  }

  async assertLearningAccess(
    user: AuthenticatedUser,
    childProfileId: string,
    capability?: LearningCapability,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      purpose: capability ? `learning:${capability}` : 'learning:active',
    });

    await this.screenTime.assertNotOnBreak(childProfileId);

    if (capability) {
      await this.entitlement.assertCapability(childProfileId, capability);
      return;
    }

    await this.entitlement.assertActiveSubscription(childProfileId);
  }
}
