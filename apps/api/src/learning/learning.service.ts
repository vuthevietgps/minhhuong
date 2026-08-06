import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LearningDeviceType,
  Prisma,
  VideoExposureEventType,
  VideoExposureSource,
} from '@prisma/client';
import { createHash } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { DailyPlanService } from '../daily-plan/daily-plan.service';
import {
  EntitlementService,
  LearningCapability,
} from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { LearningPathService } from '../learning-path/learning-path.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubmitActivityAttemptDto,
  SubmitQuestionResponseDto,
} from './dto/submit-activity-attempt.dto';
import {
  RecordLessonWatchDto,
  SetLessonFavoriteDto,
  WatchEventDto,
} from './dto/video-immersion.dto';

function createStableSortKey(input: string) {
  return createHash('sha1').update(input).digest('hex');
}

const DEFAULT_MIN_WATCH_PERCENT = 80;
const DEFAULT_VIDEO_DURATION_SEC = 600;

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
    private readonly learningPath: LearningPathService,
    private readonly dailyPlan: DailyPlanService,
  ) {}

  async getTodayUsage(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    await this.assertLearningAccess(user, childProfileId);

    return this.getUsageStatus(user, childProfileId, userAgent);
  }

  async getLearningHome(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    await this.assertLearningAccess(user, childProfileId);

    const [usage, lessonSource, weeklyUsageRows, streak, persistentDailyPlan] =
      await Promise.all([
        this.getUsageStatus(user, childProfileId, userAgent),
        this.getLearningLessonSource(childProfileId),
        this.getWeeklyUsageRows(childProfileId),
        this.getLearningStreak(childProfileId),
        this.dailyPlan.getOrGenerateTodayPlan(user, childProfileId),
      ]);
    const lessonCards = lessonSource.lessons.map((lesson) =>
      this.toLearningHomeLesson(lesson),
    );
    const continueLesson = this.pickContinueLesson(lessonCards);
    const nextLesson = lessonCards.find(
      (lesson) =>
        lesson.progress.status === 'NOT_STARTED' &&
        lesson.id !== continueLesson?.id,
    );
    const weeklyStudyMinutes = Math.ceil(
      weeklyUsageRows.reduce((sum, row) => sum + row.usedSeconds, 0) / 60,
    );
    const fallbackDailyPlan = this.buildDailyPlan(
      continueLesson,
      nextLesson,
      usage,
      lessonCards,
    );
    const dailyPlan =
      persistentDailyPlan.plan && !usage.limitReached
        ? this.toLearningHomeDailyPlan(persistentDailyPlan)
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

  async getVideoFeed(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    await this.assertLearningAccess(user, childProfileId, 'video');
    await this.assertDailyDeviceTimeAvailable(user, childProfileId, userAgent);

    const lessonSource = await this.getLearningLessonSource(childProfileId);
    if (lessonSource.contentSource.mode === 'ASSIGNED_PATH') {
      return {
        deviceUsage: await this.getUsageStatus(user, childProfileId, userAgent),
        contentSource: lessonSource.contentSource,
        courses: this.toVideoFeedCourses(lessonSource.lessons),
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
      deviceUsage: await this.getUsageStatus(user, childProfileId, userAgent),
      contentSource: lessonSource.contentSource,
      courses: courses.map((course) => ({
        ...course,
        units: course.units
          .map((unit) => ({
            ...unit,
            lessons: unit.lessons.map((lesson) => {
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
    await this.assertLearningAccess(user, childProfileId, 'video');
    await this.assertDailyDeviceTimeAvailable(user, childProfileId, userAgent);
    const contentSource = await this.learningPath.assertLessonAvailableForChild(
      childProfileId,
      lessonId,
    );
    const lesson = await this.assertPublishedVideoLesson(lessonId);
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
    const durationWatchedSec = this.normalizeWatchedDuration(
      dto.watchedDurationSec,
    );
    const acceptedPositionSec = this.calculateAcceptedWatchPosition({
      previousPositionSec,
      reportedPositionSec,
      durationWatchedSec,
      durationSec,
    });
    const watchPercent = this.calculateWatchPercent(
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
        : await this.getUsageStatus(user, childProfileId, userAgent);
    const evidence = await this.prisma.videoExposureLog.create({
      data: {
        childProfileId,
        lessonId,
        videoAssetId: video?.id,
        eventType: this.toVideoExposureEventType(event),
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
    await this.assertLearningAccess(user, childProfileId, 'video');
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

  async getLessonPractice(
    lessonId: string,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    await this.assertLearningAccess(user, childProfileId, 'practice');
    await this.assertDailyDeviceTimeAvailable(user, childProfileId);
    const contentSource = await this.learningPath.assertLessonAvailableForChild(
      childProfileId,
      lessonId,
    );

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        status: true,
        activities: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            questions: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                type: true,
                prompt: true,
                points: true,
                metadata: true,
                answers: {
                  orderBy: { sortOrder: 'asc' },
                  select: {
                    id: true,
                    text: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson || lesson.status !== 'PUBLISHED') {
      throw new NotFoundException('Published lesson not found');
    }

    return {
      ...lesson,
      contentSource,
      activities: lesson.activities.map((activity) => ({
        ...activity,
        questions: activity.questions.map((question) => ({
          ...question,
          answers: this.toPublicAnswers(question),
        })),
      })),
    };
  }

  async submitAttempt(
    activityId: string,
    dto: SubmitActivityAttemptDto,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    await this.assertLearningAccess(user, childProfileId, 'practice');
    await this.assertDailyDeviceTimeAvailable(user, childProfileId);

    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        lesson: true,
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            answers: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (!activity || activity.lesson.status !== 'PUBLISHED') {
      throw new NotFoundException('Published activity not found');
    }

    const contentSource = await this.learningPath.assertLessonAvailableForChild(
      childProfileId,
      activity.lessonId,
    );

    this.validateResponsesBelongToActivity(
      dto.responses,
      activity.questions.map((question) => question.id),
    );

    const responseByQuestionId = new Map(
      dto.responses.map((response) => [response.questionId, response]),
    );
    const gradedResponses = activity.questions.map((question) => {
      const response = responseByQuestionId.get(question.id);
      return this.gradeQuestion(question, response);
    });
    const maxScore = activity.questions.reduce(
      (sum, question) => sum + question.points,
      0,
    );
    const score = gradedResponses.reduce(
      (sum, response) => sum + response.score,
      0,
    );

    const attempt = await this.prisma.activityAttempt.create({
      data: {
        childProfileId,
        activityId,
        status: 'GRADED',
        score,
        maxScore,
        submittedAt: new Date(),
        responses: {
          create: gradedResponses.map((response) => ({
            questionId: response.questionId,
            selectedAnswerIds: response.selectedAnswerIds,
            textAnswer: response.textAnswer,
            orderedAnswer: response.orderedAnswer,
            isCorrect: response.isCorrect,
            score: response.score,
            feedback: response.feedback,
          })),
        },
      },
      include: {
        responses: {
          include: {
            question: {
              select: {
                prompt: true,
                explanation: true,
              },
            },
          },
        },
      },
    });

    await this.recalculateLessonProgress(childProfileId, activity.lessonId);

    return {
      ...attempt,
      contentSource,
    };
  }

  private validateResponsesBelongToActivity(
    responses: SubmitQuestionResponseDto[],
    questionIds: string[],
  ) {
    const allowedQuestionIds = new Set(questionIds);
    const seenQuestionIds = new Set<string>();

    for (const response of responses) {
      if (!allowedQuestionIds.has(response.questionId)) {
        throw new BadRequestException(
          'Response contains a question outside this activity',
        );
      }

      if (seenQuestionIds.has(response.questionId)) {
        throw new BadRequestException(
          'Response contains duplicate question answers',
        );
      }

      seenQuestionIds.add(response.questionId);
    }
  }

  private async recalculateLessonProgress(
    childProfileId: string,
    lessonId: string,
  ) {
    const activities = await this.prisma.activity.findMany({
      where: { lessonId },
      select: {
        id: true,
        questions: {
          select: {
            points: true,
          },
        },
        attempts: {
          where: {
            childProfileId,
            status: 'GRADED',
          },
          select: {
            score: true,
          },
        },
      },
    });

    const scoredActivities = activities
      .map((activity) => {
        const maxScore = activity.questions.reduce(
          (sum, question) => sum + question.points,
          0,
        );
        const bestScore = activity.attempts.reduce(
          (best, attempt) => Math.max(best, attempt.score),
          0,
        );

        return { maxScore, bestScore: Math.min(bestScore, maxScore) };
      })
      .filter((activity) => activity.maxScore > 0);

    const totalMaxScore = scoredActivities.reduce(
      (sum, activity) => sum + activity.maxScore,
      0,
    );
    const totalBestScore = scoredActivities.reduce(
      (sum, activity) => sum + activity.bestScore,
      0,
    );
    const overallScore =
      totalMaxScore > 0
        ? Math.round((totalBestScore / totalMaxScore) * 100)
        : 0;
    const isCompleted = scoredActivities.length > 0 && overallScore >= 80;
    const now = new Date();

    await this.prisma.lessonProgress.upsert({
      where: {
        childProfileId_lessonId: {
          childProfileId,
          lessonId,
        },
      },
      update: {
        status: isCompleted
          ? 'COMPLETED'
          : totalBestScore > 0
            ? 'IN_PROGRESS'
            : 'NOT_STARTED',
        score: overallScore,
        completedAt: isCompleted ? now : null,
      },
      create: {
        childProfileId,
        lessonId,
        status: isCompleted
          ? 'COMPLETED'
          : totalBestScore > 0
            ? 'IN_PROGRESS'
            : 'NOT_STARTED',
        score: overallScore,
        completedAt: isCompleted ? now : null,
      },
    });
  }

  private async getLearningLessonSource(childProfileId: string) {
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

  private async getPublishedVideoLessonsForUser(
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
          take: 1,
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

  private toLearningHomeLesson(
    lesson: Awaited<
      ReturnType<LearningService['getPublishedVideoLessonsForUser']>
    >[number],
  ) {
    const progress = lesson.progress[0];
    const durationSec =
      lesson.durationSec ?? lesson.videos[0]?.durationSec ?? 0;
    const lastPositionSec = progress?.lastPositionSec ?? 0;
    const progressPercent =
      progress?.status === 'COMPLETED'
        ? 100
        : durationSec > 0
          ? Math.min(95, Math.round((lastPositionSec / durationSec) * 100))
          : progress?.status === 'IN_PROGRESS'
            ? 40
            : 0;

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      durationSec,
      estimateMinutes: Math.max(5, Math.ceil((durationSec || 600) / 60)),
      courseTitle: lesson.unit.course.title,
      courseSlug: lesson.unit.course.slug,
      unitTitle: lesson.unit.title,
      levelCode: lesson.unit.course.level.code,
      hasPractice: lesson.activities.length > 0,
      tags: lesson.tags.map((item) => item.tag),
      video: lesson.videos[0] ?? null,
      progress: {
        status: progress?.status ?? 'NOT_STARTED',
        score: progress?.score ?? null,
        lastPositionSec,
        watchCount: progress?.watchCount ?? 0,
        lastWatchedAt: progress?.lastWatchedAt ?? null,
        isFavorite: progress?.isFavorite ?? false,
        progressPercent,
      },
    };
  }

  private toVideoFeedCourses(
    lessons: Awaited<
      ReturnType<LearningService['getPublishedVideoLessonsForUser']>
    >,
  ) {
    type VideoFeedUnit = {
      id: string;
      title: string;
      description: string | null;
      lessons: Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        durationSec: number | null;
        videos: (typeof lessons)[number]['videos'];
        hasPractice: boolean;
        tags: Array<(typeof lessons)[number]['tags'][number]['tag']>;
        progress: {
          status: string;
          lastPositionSec: number;
          watchCount: number;
          lastWatchedAt: Date | null;
          isFavorite: boolean;
        };
      }>;
    };
    type VideoFeedCourse = {
      id: string;
      slug: string;
      title: string;
      description: string | null;
      level: {
        code: string;
        title: string;
      };
      units: VideoFeedUnit[];
    };

    const courses = new Map<string, VideoFeedCourse>();
    const unitsByKey = new Map<string, VideoFeedUnit>();

    for (const lesson of lessons) {
      const courseKey = lesson.unit.course.slug;
      let course = courses.get(courseKey);

      if (!course) {
        course = {
          id: lesson.unit.course.id,
          slug: lesson.unit.course.slug,
          title: lesson.unit.course.title,
          description: lesson.unit.course.description,
          level: {
            code: lesson.unit.course.level.code,
            title: lesson.unit.course.level.title,
          },
          units: [],
        };
        courses.set(courseKey, course);
      }

      const unitKey = `${courseKey}:${lesson.unit.id}`;
      let unit = unitsByKey.get(unitKey);

      if (!unit) {
        unit = {
          id: lesson.unit.id,
          title: lesson.unit.title,
          description: lesson.unit.description,
          lessons: [],
        };
        unitsByKey.set(unitKey, unit);
        course.units.push(unit);
      }

      const progress = lesson.progress[0];
      unit.lessons.push({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        durationSec: lesson.durationSec,
        videos: lesson.videos,
        hasPractice: lesson.activities.length > 0,
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
      });
    }

    return Array.from(courses.values());
  }

  private pickContinueLesson(
    lessons: ReturnType<LearningService['toLearningHomeLesson']>[],
  ) {
    const inProgress = lessons
      .filter((lesson) => lesson.progress.status === 'IN_PROGRESS')
      .sort((left, right) => {
        const leftTime = left.progress.lastWatchedAt?.getTime() ?? 0;
        const rightTime = right.progress.lastWatchedAt?.getTime() ?? 0;
        return rightTime - leftTime;
      })[0];

    return (
      inProgress ??
      lessons.find((lesson) => lesson.progress.status === 'NOT_STARTED') ??
      lessons[0] ??
      null
    );
  }

  private toLearningHomeDailyPlan(
    dailyPlan: Awaited<ReturnType<DailyPlanService['getOrGenerateTodayPlan']>>,
  ) {
    const sourceTitle =
      dailyPlan.contentSource.mode === 'ASSIGNED_PATH'
        ? (dailyPlan.contentSource.learningPathTitle ??
          dailyPlan.contentSource.contentPackageTitle ??
          'Assigned plan')
        : 'Daily plan';

    return dailyPlan.items.map((item) => {
      const lessonTitle = item.lesson?.title ?? 'Assigned lesson';
      const type =
        item.itemType === 'PRACTICE'
          ? 'PRACTICE'
          : item.itemType === 'VIDEO'
            ? 'VIDEO'
            : 'REVIEW';
      const title =
        type === 'PRACTICE'
          ? `Practice ${lessonTitle}`
          : type === 'VIDEO'
            ? `Watch ${lessonTitle}`
            : `Review ${lessonTitle}`;
      const estimateMinutes =
        type === 'VIDEO'
          ? Math.max(5, Math.ceil((item.lesson?.durationSec ?? 600) / 60))
          : 5;

      return {
        id: item.id,
        type,
        title,
        description: item.activity?.title ?? sourceTitle,
        lessonId: item.lessonId,
        estimateMinutes,
        status: item.status === 'LOCKED' ? 'LOCKED' : 'READY',
      };
    });
  }

  private buildDailyPlan(
    continueLesson: ReturnType<LearningService['toLearningHomeLesson']> | null,
    nextLesson: ReturnType<LearningService['toLearningHomeLesson']> | undefined,
    usage: Awaited<ReturnType<LearningService['getUsageStatus']>>,
    allLessons: ReturnType<LearningService['toLearningHomeLesson']>[],
  ) {
    if (usage.limitReached) {
      return [
        {
          id: 'limit-reached',
          type: 'REST',
          title: 'Device limit reached',
          description: 'Learning is paused until a parent adds more time.',
          lessonId: null,
          estimateMinutes: 0,
          status: 'LOCKED',
        },
      ];
    }

    const items: Array<{
      id: string;
      type: 'VIDEO' | 'PRACTICE' | 'NEXT_LESSON' | 'REVIEW';
      title: string;
      description: string;
      lessonId: string;
      estimateMinutes: number;
      status: 'READY';
    }> = [];

    if (continueLesson) {
      const remainingMinutes =
        continueLesson.durationSec > 0
          ? Math.max(
              5,
              Math.ceil(
                Math.max(
                  continueLesson.durationSec -
                    continueLesson.progress.lastPositionSec,
                  0,
                ) / 60,
              ),
            )
          : continueLesson.estimateMinutes;

      items.push({
        id: `video-${continueLesson.id}`,
        type: 'VIDEO',
        title:
          continueLesson.progress.status === 'IN_PROGRESS'
            ? `Continue ${continueLesson.title}`
            : `Start ${continueLesson.title}`,
        description: `${continueLesson.levelCode} / ${continueLesson.unitTitle}`,
        lessonId: continueLesson.id,
        estimateMinutes: remainingMinutes,
        status: 'READY',
      });

      if (continueLesson.hasPractice) {
        items.push({
          id: `practice-${continueLesson.id}`,
          type: 'PRACTICE',
          title: 'Do the after-video practice',
          description: `Practice follows ${continueLesson.title}`,
          lessonId: continueLesson.id,
          estimateMinutes: 5,
          status: 'READY',
        });
      }
    }

    if (nextLesson && items.length < 3) {
      items.push({
        id: `next-${nextLesson.id}`,
        type: 'NEXT_LESSON',
        title: `Preview ${nextLesson.title}`,
        description: `${nextLesson.levelCode} / ${nextLesson.unitTitle}`,
        lessonId: nextLesson.id,
        estimateMinutes: Math.min(nextLesson.estimateMinutes, 10),
        status: 'READY',
      });
    }

    if (items.length < 3) {
      const reviewLesson = allLessons
        .filter(
          (l) =>
            l.progress.status === 'COMPLETED' &&
            l.progress.score !== null &&
            l.progress.score < 70 &&
            l.id !== continueLesson?.id,
        )
        .sort(
          (a, b) => (a.progress.score ?? 100) - (b.progress.score ?? 100),
        )[0];

      if (reviewLesson) {
        items.push({
          id: `review-${reviewLesson.id}`,
          type: 'REVIEW',
          title: `Review: ${reviewLesson.title}`,
          description: `Score was ${reviewLesson.progress.score}% — redo the practice to improve`,
          lessonId: reviewLesson.id,
          estimateMinutes: 5,
          status: 'READY',
        });
      }
    }

    return items;
  }

  private async getWeeklyUsageRows(childProfileId: string) {
    const today = this.todayInBangkok();
    const weekAgo = this.dateInBangkok(-6);

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

    const today = this.todayInBangkok();
    let streak = 0;
    let cursor = today;

    for (const row of rows) {
      if (row.usageDate === cursor) {
        streak++;
        cursor = this.dateInBangkok(-streak);
      } else {
        break;
      }
    }

    return streak;
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

  private normalizeWatchedDuration(value?: number) {
    return Math.max(0, Math.min(Math.floor(value ?? 0), 15 * 60));
  }

  private calculateAcceptedWatchPosition(input: {
    previousPositionSec: number;
    reportedPositionSec: number;
    durationWatchedSec: number;
    durationSec: number;
  }) {
    const durationSec = Math.max(1, input.durationSec);
    const previousPositionSec = Math.max(
      0,
      Math.min(Math.floor(input.previousPositionSec), durationSec),
    );
    const reportedPositionSec = Math.max(
      0,
      Math.min(Math.floor(input.reportedPositionSec), durationSec),
    );
    const maxPositionByDuration = Math.min(
      durationSec,
      previousPositionSec + input.durationWatchedSec,
    );

    return Math.max(
      previousPositionSec,
      Math.min(reportedPositionSec, maxPositionByDuration),
    );
  }

  private calculateWatchPercent(positionSec: number, durationSec: number) {
    return Math.max(
      0,
      Math.min(100, Math.round((positionSec / Math.max(1, durationSec)) * 100)),
    );
  }

  private toVideoExposureEventType(event: WatchEventDto) {
    const eventTypes: Record<WatchEventDto, VideoExposureEventType> = {
      [WatchEventDto.STARTED]: VideoExposureEventType.STARTED,
      [WatchEventDto.PROGRESSED]: VideoExposureEventType.PROGRESSED,
      [WatchEventDto.COMPLETED]: VideoExposureEventType.COMPLETED,
      [WatchEventDto.REPLAYED]: VideoExposureEventType.REPLAYED,
    };

    return eventTypes[event];
  }

  private async assertDailyDeviceTimeAvailable(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    if (!this.tracksDeviceUsage(user, childProfileId)) {
      return;
    }

    const usage = await this.getUsageStatus(user, childProfileId, userAgent);
    if (usage.limitReached) {
      throw new ForbiddenException(
        'Daily device limit reached. Ask your parent to adjust today limit.',
      );
    }
  }

  private async recordLearningUsage(
    user: AuthenticatedUser,
    childProfileId: string,
    watchedDurationSec: number,
    userAgent?: string,
  ) {
    if (!this.tracksDeviceUsage(user, childProfileId)) {
      return this.getUsageStatus(user, childProfileId, userAgent);
    }

    const before = await this.getUsageStatus(user, childProfileId, userAgent);
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

    const after = await this.getUsageStatus(user, childProfileId, userAgent);
    if (before.isLimited && seconds > secondsToRecord) {
      throw new ForbiddenException(
        'Daily device limit reached. Ask your parent to adjust today limit.',
      );
    }

    return after;
  }

  private async getUsageStatus(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    const usageDate = this.todayInBangkok();
    const deviceType = this.detectDeviceType(userAgent);

    if (!this.tracksDeviceUsage(user, childProfileId)) {
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
    const usageDate = this.todayInBangkok();
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

  private tracksDeviceUsage(user: AuthenticatedUser, childProfileId: string) {
    return !user.sub.startsWith('demo-') && childProfileId.length > 0;
  }

  private todayInBangkok() {
    return this.dateInBangkok(0);
  }

  private dateInBangkok(offsetDays: number) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private detectDeviceType(userAgent?: string): LearningDeviceType {
    const normalized = userAgent?.toLowerCase() ?? '';

    if (/ipad|tablet|kindle|silk/.test(normalized)) {
      return LearningDeviceType.TABLET;
    }

    if (/mobile|iphone|android/.test(normalized)) {
      return LearningDeviceType.PHONE;
    }

    if (/windows|macintosh|linux|cros/.test(normalized)) {
      return LearningDeviceType.COMPUTER;
    }

    return LearningDeviceType.UNKNOWN;
  }

  private async assertLearningAccess(
    user: AuthenticatedUser,
    childProfileId: string,
    capability?: LearningCapability,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      purpose: capability ? `learning:${capability}` : 'learning:active',
    });

    if (capability) {
      await this.entitlement.assertCapability(childProfileId, capability);
      return;
    }

    await this.entitlement.assertActiveSubscription(childProfileId);
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

  private toPublicAnswers(question: {
    id: string;
    type: string;
    answers: Array<{ id: string; text: string; sortOrder: number }>;
  }) {
    const answers =
      question.type === 'ORDERING'
        ? this.seededShuffle(question.answers, question.id)
        : question.answers;

    return answers.map((answer) => ({
      id: answer.id,
      text: answer.text,
    }));
  }

  private seededShuffle<T>(items: T[], seed: string): T[] {
    return items
      .map((item, index) => ({
        item,
        key: createStableSortKey(`${seed}:${index}`),
      }))
      .sort((left, right) => left.key.localeCompare(right.key))
      .map(({ item }) => item);
  }

  private gradeQuestion(
    question: Prisma.QuestionGetPayload<{ include: { answers: true } }>,
    response: SubmitQuestionResponseDto | undefined,
  ) {
    if (!response) {
      return {
        questionId: question.id,
        selectedAnswerIds: undefined,
        textAnswer: undefined,
        orderedAnswer: undefined,
        isCorrect: false,
        score: 0,
        feedback: 'No answer submitted.',
      };
    }

    if (
      question.type === 'SINGLE_CHOICE' ||
      question.type === 'MULTIPLE_CHOICE'
    ) {
      const selected = [...(response.selectedAnswerIds ?? [])].sort();
      const correct = question.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.id)
        .sort();
      const isCorrect =
        selected.length === correct.length &&
        selected.every((answerId, index) => answerId === correct[index]);

      return {
        questionId: question.id,
        selectedAnswerIds: selected,
        textAnswer: undefined,
        orderedAnswer: undefined,
        isCorrect,
        score: isCorrect ? question.points : 0,
        feedback: isCorrect
          ? 'Correct.'
          : (question.explanation ?? 'Review the explanation.'),
      };
    }

    if (question.type === 'TEXT_INPUT') {
      const submitted = this.normalizeText(response.textAnswer ?? '');
      const accepted = question.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => this.normalizeText(answer.text));
      const isCorrect = accepted.includes(submitted);

      return {
        questionId: question.id,
        selectedAnswerIds: undefined,
        textAnswer: response.textAnswer,
        orderedAnswer: undefined,
        isCorrect,
        score: isCorrect ? question.points : 0,
        feedback: isCorrect
          ? 'Correct.'
          : (question.explanation ?? 'Accepted answer differs.'),
      };
    }

    if (question.type === 'ORDERING') {
      const submitted = response.orderedAnswerIds ?? [];
      const correct = question.answers
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((answer) => answer.id);
      const isCorrect =
        submitted.length === correct.length &&
        submitted.every((answerId, index) => answerId === correct[index]);

      return {
        questionId: question.id,
        selectedAnswerIds: undefined,
        textAnswer: undefined,
        orderedAnswer: submitted,
        isCorrect,
        score: isCorrect ? question.points : 0,
        feedback: isCorrect
          ? 'Correct.'
          : (question.explanation ?? 'Check the correct order.'),
      };
    }

    throw new BadRequestException('This question type is not auto-graded yet');
  }

  private normalizeText(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
