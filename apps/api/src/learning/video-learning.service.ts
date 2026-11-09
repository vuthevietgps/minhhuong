import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VideoExposureSource } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { EntitlementService } from '../entitlement/entitlement.service';
import { LearningPathService } from '../learning-path/learning-path.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  RecordLessonWatchDto,
  SetLessonFavoriteDto,
  WatchEventDto,
} from './dto/video-immersion.dto';
import { LearningSupportService } from './learning-support.service';
import { tracksDeviceUsage } from './learning.helpers';
import {
  DEFAULT_MIN_WATCH_PERCENT,
  DEFAULT_VIDEO_DURATION_SEC,
  calculateAcceptedWatchPosition,
  calculateWatchPercent,
  normalizeWatchedDuration,
  toVideoExposureEventType,
  toVideoFeedCourses,
} from './video-learning.helpers';

/** Video feed, watch evidence and favorites. */
@Injectable()
export class VideoLearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly learningPath: LearningPathService,
    private readonly learningSupportService: LearningSupportService,
  ) {}

  async getVideoFeed(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    await this.learningSupportService.assertLearningAccess(
      user,
      childProfileId,
      'video',
    );
    await this.learningSupportService.assertDailyDeviceTimeAvailable(
      user,
      childProfileId,
      userAgent,
    );

    const rawLessonSource =
      await this.learningSupportService.getLearningLessonSource(childProfileId);
    if (rawLessonSource.contentSource.mode === 'ASSIGNED_PATH') {
      const allowedTrialLessons =
        await this.entitlement.allowedFreeTrialLessonIds(
          childProfileId,
          rawLessonSource.lessons.map((lesson) => lesson.id),
        );
      return {
        deviceUsage: await this.learningSupportService.getUsageStatus(
          user,
          childProfileId,
          userAgent,
        ),
        contentSource: rawLessonSource.contentSource,
        courses: toVideoFeedCourses(
          allowedTrialLessons
            ? rawLessonSource.lessons.filter((lesson) =>
                allowedTrialLessons.has(lesson.id),
              )
            : rawLessonSource.lessons,
        ),
      };
    }

    const courses = await this.prisma.course.findMany({
      where: {
        isPublished: true,
        units: {
          some: {
            lessons: {
              some: {
                status: 'PUBLISHED',
                videos: {
                  some: {
                    processingStatus: 'READY',
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ level: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        level: {
          select: {
            code: true,
            title: true,
          },
        },
        units: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            lessons: {
              where: {
                status: 'PUBLISHED',
                videos: {
                  some: {
                    processingStatus: 'READY',
                  },
                },
              },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                durationSec: true,
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
                  select: { id: true },
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
              },
            },
          },
        },
      },
    });

    const lessonIds = courses.flatMap((course) =>
      course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)),
    );
    const allowedTrialLessons =
      await this.entitlement.allowedFreeTrialLessonIds(
        childProfileId,
        lessonIds,
      );
    const progressItems =
      lessonIds.length > 0
        ? await this.prisma.lessonProgress.findMany({
            where: {
              childProfileId,
              lessonId: { in: lessonIds },
            },
            select: {
              lessonId: true,
              status: true,
              lastPositionSec: true,
              watchCount: true,
              lastWatchedAt: true,
              isFavorite: true,
            },
          })
        : [];
    const progressByLessonId = new Map(
      progressItems.map((progress) => [progress.lessonId, progress]),
    );

    return {
      deviceUsage: await this.learningSupportService.getUsageStatus(
        user,
        childProfileId,
        userAgent,
      ),
      contentSource: rawLessonSource.contentSource,
      courses: courses.map((course) => ({
        ...course,
        units: course.units
          .map((unit) => ({
            ...unit,
            lessons: unit.lessons
              .filter(
                (lesson) =>
                  !allowedTrialLessons || allowedTrialLessons.has(lesson.id),
              )
              .map((lesson) => {
                const progress = progressByLessonId.get(lesson.id);

                return {
                  ...lesson,
                  hasPractice: lesson.activities.length > 0,
                  activities: undefined,
                  tags: lesson.tags.map((item) => item.tag),
                  progress: progress
                    ? {
                        status: progress.status,
                        lastPositionSec: progress.lastPositionSec,
                        watchCount: progress.watchCount,
                        lastWatchedAt: progress.lastWatchedAt,
                        isFavorite: progress.isFavorite,
                      }
                    : {
                        status: 'NOT_STARTED',
                        lastPositionSec: 0,
                        watchCount: 0,
                        lastWatchedAt: null,
                        isFavorite: false,
                      },
                };
              }),
          }))
          .filter((unit) => unit.lessons.length > 0),
      })),
    };
  }

  async recordLessonWatch(
    lessonId: string,
    dto: RecordLessonWatchDto,
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    await this.learningSupportService.assertLearningAccess(
      user,
      childProfileId,
      'video',
    );
    await this.learningSupportService.assertDailyDeviceTimeAvailable(
      user,
      childProfileId,
      userAgent,
    );
    const contentSource = await this.learningPath.assertLessonAvailableForChild(
      childProfileId,
      lessonId,
    );
    const lesson = await this.assertPublishedVideoLesson(lessonId);
    await this.entitlement.assertTrialLessonAccess(childProfileId, lessonId);
    const minWatchPercent = await this.getRequiredWatchPercent(
      childProfileId,
      lessonId,
    );

    const event = dto.event ?? WatchEventDto.PROGRESSED;
    const now = new Date();
    const existing = await this.prisma.lessonProgress.findUnique({
      where: {
        childProfileId_lessonId: {
          childProfileId,
          lessonId,
        },
      },
    });
    const video = lesson.videos[0] ?? null;
    const durationSec =
      lesson.durationSec ?? video?.durationSec ?? DEFAULT_VIDEO_DURATION_SEC;
    const previousPositionSec = existing?.lastPositionSec ?? 0;
    const reportedPositionSec = dto.lastPositionSec ?? previousPositionSec;
    const durationWatchedSec = normalizeWatchedDuration(dto.watchedDurationSec);
    const acceptedPositionSec = calculateAcceptedWatchPosition({
      previousPositionSec,
      reportedPositionSec,
      durationWatchedSec,
      durationSec,
    });
    const watchPercent = calculateWatchPercent(
      acceptedPositionSec,
      durationSec,
    );
    const reachedWatchThreshold = watchPercent >= minWatchPercent;
    const incrementsWatchCount = [
      WatchEventDto.STARTED,
      WatchEventDto.COMPLETED,
      WatchEventDto.REPLAYED,
    ].includes(event);

    const usage =
      durationWatchedSec > 0
        ? await this.recordLearningUsage(
            user,
            childProfileId,
            durationWatchedSec,
            userAgent,
          )
        : await this.learningSupportService.getUsageStatus(
            user,
            childProfileId,
            userAgent,
          );
    const evidence = await this.prisma.videoExposureLog.create({
      data: {
        childProfileId,
        lessonId,
        videoAssetId: video?.id,
        eventType: toVideoExposureEventType(event),
        positionSec: acceptedPositionSec,
        durationWatchedSec,
        watchPercent,
        source: VideoExposureSource.RUNTIME_WATCH_EVENT,
      },
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
    });

    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        childProfileId_lessonId: {
          childProfileId,
          lessonId,
        },
      },
      update: {
        status: reachedWatchThreshold
          ? 'COMPLETED'
          : existing?.status === 'COMPLETED'
            ? 'COMPLETED'
            : 'IN_PROGRESS',
        completedAt: reachedWatchThreshold ? now : existing?.completedAt,
        lastPositionSec: acceptedPositionSec,
        lastWatchedAt: now,
        ...(incrementsWatchCount ? { watchCount: { increment: 1 } } : {}),
      },
      create: {
        childProfileId,
        lessonId,
        status: reachedWatchThreshold ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: reachedWatchThreshold ? now : null,
        lastPositionSec: acceptedPositionSec,
        lastWatchedAt: now,
        watchCount: incrementsWatchCount ? 1 : 0,
      },
      select: {
        lessonId: true,
        status: true,
        lastPositionSec: true,
        watchCount: true,
        lastWatchedAt: true,
        isFavorite: true,
      },
    });

    return {
      ...progress,
      usage,
      contentSource,
      watchEvidence: {
        ...evidence,
        minWatchPercent,
        passed: reachedWatchThreshold,
        durationSec,
      },
    };
  }

  async setLessonFavorite(
    lessonId: string,
    dto: SetLessonFavoriteDto,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    await this.learningSupportService.assertLearningAccess(
      user,
      childProfileId,
      'video',
    );
    const contentSource = await this.learningPath.assertLessonAvailableForChild(
      childProfileId,
      lessonId,
    );
    await this.assertPublishedVideoLesson(lessonId);

    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        childProfileId_lessonId: {
          childProfileId,
          lessonId,
        },
      },
      update: {
        isFavorite: dto.isFavorite,
      },
      create: {
        childProfileId,
        lessonId,
        status: 'NOT_STARTED',
        isFavorite: dto.isFavorite,
      },
      select: {
        lessonId: true,
        status: true,
        lastPositionSec: true,
        watchCount: true,
        lastWatchedAt: true,
        isFavorite: true,
      },
    });

    return {
      ...progress,
      contentSource,
    };
  }

  private async getRequiredWatchPercent(
    childProfileId: string,
    lessonId: string,
  ) {
    const pathItem = await this.prisma.learningPathItem.findFirst({
      where: {
        lessonId,
        learningPath: {
          status: 'PUBLISHED',
          packages: {
            some: {
              status: 'PUBLISHED',
              assignments: {
                some: {
                  childProfileId,
                  status: 'ACTIVE',
                },
              },
            },
          },
        },
      },
      orderBy: { sequence: 'asc' },
      select: {
        minWatchPercent: true,
      },
    });

    return pathItem?.minWatchPercent ?? DEFAULT_MIN_WATCH_PERCENT;
  }

  private async recordLearningUsage(
    user: AuthenticatedUser,
    childProfileId: string,
    watchedDurationSec: number,
    userAgent?: string,
  ) {
    if (!tracksDeviceUsage(user, childProfileId)) {
      return this.learningSupportService.getUsageStatus(
        user,
        childProfileId,
        userAgent,
      );
    }

    const before = await this.learningSupportService.getUsageStatus(
      user,
      childProfileId,
      userAgent,
    );
    if (before.limitReached) {
      throw new ForbiddenException(
        'Daily device limit reached. Ask your parent to adjust today limit.',
      );
    }

    const seconds = Math.max(
      1,
      Math.min(Math.floor(watchedDurationSec), 15 * 60),
    );
    const secondsToRecord = before.isLimited
      ? Math.min(seconds, before.remainingSeconds ?? 0)
      : seconds;

    if (secondsToRecord > 0) {
      await this.prisma.learningUsageDay.upsert({
        where: {
          childProfileId_usageDate_deviceType: {
            childProfileId,
            usageDate: before.usageDate,
            deviceType: before.deviceType,
          },
        },
        update: {
          usedSeconds: { increment: secondsToRecord },
          lastRecordedAt: new Date(),
        },
        create: {
          childProfileId,
          usageDate: before.usageDate,
          deviceType: before.deviceType,
          usedSeconds: secondsToRecord,
        },
      });
    }

    const after = await this.learningSupportService.getUsageStatus(
      user,
      childProfileId,
      userAgent,
    );
    if (before.isLimited && seconds > secondsToRecord) {
      throw new ForbiddenException(
        'Daily device limit reached. Ask your parent to adjust today limit.',
      );
    }

    return after;
  }

  private async assertPublishedVideoLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        status: true,
        durationSec: true,
        videos: {
          where: { processingStatus: 'READY' },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, durationSec: true },
          take: 1,
        },
      },
    });

    if (
      !lesson ||
      lesson.status !== 'PUBLISHED' ||
      lesson.videos.length === 0
    ) {
      throw new NotFoundException('Published video lesson not found');
    }

    return lesson;
  }
}
