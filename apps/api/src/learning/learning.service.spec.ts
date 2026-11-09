import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { LearningService } from './learning.service';
import { createLearningServiceForTest } from './learning.testing';

describe('LearningService', () => {
  const prisma = {
    activity: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    activityAttempt: {
      create: jest.fn(),
    },
    lessonProgress: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    lesson: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    learningPathItem: {
      findFirst: jest.fn(),
    },
    videoExposureLog: {
      create: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
    childProfile: {
      findUnique: jest.fn(),
    },
    learningUsageDay: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };
  const childAccess = {
    assertCanAccessChild: jest.fn(),
  };
  const entitlement = {
    assertActiveSubscription: jest.fn(),
    assertCapability: jest.fn(),
    assertTrialLessonAccess: jest.fn(),
    allowedFreeTrialLessonIds: jest.fn(),
    consumeTrialInitialAssessment: jest.fn(),
  };
  const learningPath = {
    getActiveAssignedLessonIds: jest.fn(),
    assertLessonAvailableForChild: jest.fn(),
  };
  const dailyPlan = {
    getOrGenerateTodayPlan: jest.fn(),
  };
  const screenTime = {
    heartbeat: jest.fn(),
    assertNotOnBreak: jest.fn(),
  };
  const service = createLearningServiceForTest(
    prisma as any,
    childAccess as any,
    entitlement as any,
    learningPath as any,
    dailyPlan as any,
    screenTime as any,
  );
  const parent = {
    sub: 'parent-1',
    email: 'parent@example.com',
    roles: ['PARENT'],
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
    childAccess.assertCanAccessChild.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });
    entitlement.assertActiveSubscription.mockResolvedValue({});
    entitlement.assertCapability.mockResolvedValue({});
    entitlement.assertTrialLessonAccess.mockResolvedValue(undefined);
    entitlement.allowedFreeTrialLessonIds.mockResolvedValue(null);
    entitlement.consumeTrialInitialAssessment.mockResolvedValue(undefined);
    screenTime.assertNotOnBreak.mockResolvedValue(undefined);
    prisma.childProfile.findUnique.mockResolvedValue({
      screenTime: null,
      deviceTimeGrants: [],
    });
    prisma.learningUsageDay.findMany.mockResolvedValue([]);
    prisma.lesson.findMany.mockResolvedValue([]);
    prisma.learningPathItem.findFirst.mockResolvedValue({
      minWatchPercent: 80,
    });
    prisma.videoExposureLog.create.mockResolvedValue({
      id: 'exposure-1',
      videoAssetId: 'video-1',
      eventType: 'PROGRESSED',
      positionSec: 0,
      durationWatchedSec: 0,
      watchPercent: 0,
      source: 'RUNTIME_WATCH_EVENT',
      createdAt: new Date('2026-06-14T00:00:00.000Z'),
    });
    learningPath.getActiveAssignedLessonIds.mockResolvedValue(null);
    learningPath.assertLessonAvailableForChild.mockResolvedValue({
      mode: 'UNASSIGNED_FALLBACK',
      reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
    });
    dailyPlan.getOrGenerateTodayPlan.mockResolvedValue({
      plan: null,
      planDate: '2026-06-14',
      timezone: 'Asia/Bangkok',
      generated: false,
      contentSource: {
        mode: 'UNASSIGNED_FALLBACK',
        reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
      },
      items: [],
    });
  });

  it('rejects duplicate question responses', async () => {
    prisma.activity.findUnique.mockResolvedValue(publishedActivity());

    await expect(
      service.submitAttempt(
        'activity-1',
        {
          responses: [
            { questionId: 'question-1', selectedAnswerIds: ['answer-1'] },
            { questionId: 'question-1', selectedAnswerIds: ['answer-1'] },
          ],
        },
        parent,
        'child-1',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.activityAttempt.create).not.toHaveBeenCalled();
  });

  it('keeps a lesson in progress until every activity is completed', async () => {
    prisma.activity.findUnique.mockResolvedValue(publishedActivity());
    prisma.activityAttempt.create.mockResolvedValue({
      id: 'attempt-1',
      score: 1,
      maxScore: 1,
      responses: [],
    });
    prisma.activity.findMany.mockResolvedValue([
      {
        questions: [{ points: 1 }],
        attempts: [{ score: 1 }],
      },
      {
        questions: [{ points: 1 }],
        attempts: [],
      },
    ]);
    prisma.lessonProgress.upsert.mockResolvedValue({});

    await service.submitAttempt(
      'activity-1',
      {
        responses: [
          { questionId: 'question-1', selectedAnswerIds: ['answer-1'] },
        ],
      },
      parent,
      'child-1',
    );

    expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          status: 'IN_PROGRESS',
          score: 50,
          completedAt: null,
        }),
      }),
    );
  });

  it('does not complete video when the client reports completed without enough watch evidence', async () => {
    prisma.lesson.findUnique.mockResolvedValue({
      id: 'lesson-1',
      status: 'PUBLISHED',
      durationSec: 600,
      videos: [{ id: 'video-1', durationSec: 600 }],
    });
    prisma.lessonProgress.findUnique.mockResolvedValue({
      status: 'IN_PROGRESS',
      completedAt: null,
      lastPositionSec: 12,
    });
    prisma.lessonProgress.upsert.mockResolvedValue({
      lessonId: 'lesson-1',
      status: 'IN_PROGRESS',
      watchCount: 2,
      lastPositionSec: 12,
      isFavorite: false,
    });
    prisma.videoExposureLog.create.mockResolvedValue({
      id: 'exposure-1',
      videoAssetId: 'video-1',
      eventType: 'COMPLETED',
      positionSec: 12,
      durationWatchedSec: 0,
      watchPercent: 2,
      source: 'RUNTIME_WATCH_EVENT',
      createdAt: new Date('2026-06-14T00:00:00.000Z'),
    });

    const result = await service.recordLessonWatch(
      'lesson-1',
      { event: 'COMPLETED' as any, lastPositionSec: 600 },
      parent,
      'child-1',
    );

    expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          status: 'IN_PROGRESS',
          lastPositionSec: 12,
          watchCount: { increment: 1 },
        }),
      }),
    );
    expect(result.watchEvidence).toMatchObject({
      watchPercent: 2,
      minWatchPercent: 80,
      passed: false,
    });
  });

  it('completes video when server-side watch evidence reaches the threshold', async () => {
    prisma.lesson.findUnique.mockResolvedValue({
      id: 'lesson-1',
      status: 'PUBLISHED',
      durationSec: 600,
      videos: [{ id: 'video-1', durationSec: 600 }],
    });
    prisma.lessonProgress.findUnique.mockResolvedValue({
      status: 'IN_PROGRESS',
      completedAt: null,
      lastPositionSec: 0,
    });
    prisma.lessonProgress.upsert.mockResolvedValue({
      lessonId: 'lesson-1',
      status: 'COMPLETED',
      watchCount: 1,
      lastPositionSec: 480,
      isFavorite: false,
    });
    prisma.videoExposureLog.create.mockResolvedValue({
      id: 'exposure-1',
      videoAssetId: 'video-1',
      eventType: 'PROGRESSED',
      positionSec: 480,
      durationWatchedSec: 480,
      watchPercent: 80,
      source: 'RUNTIME_WATCH_EVENT',
      createdAt: new Date('2026-06-14T00:00:00.000Z'),
    });

    const result = await service.recordLessonWatch(
      'lesson-1',
      {
        event: 'PROGRESSED' as any,
        lastPositionSec: 480,
        watchedDurationSec: 480,
      },
      parent,
      'child-1',
    );

    expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(Date),
          lastPositionSec: 480,
        }),
      }),
    );
    expect(prisma.videoExposureLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          childProfileId: 'child-1',
          lessonId: 'lesson-1',
          videoAssetId: 'video-1',
          positionSec: 480,
          durationWatchedSec: 480,
          watchPercent: 80,
        }),
      }),
    );
    expect(result.watchEvidence).toMatchObject({
      minWatchPercent: 80,
      passed: true,
    });
  });

  it('records watched seconds against the child device limit', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      parentId: 'parent-1',
      screenTime: { isEnabled: true, dailyLimitMinutes: 45 },
      deviceTimeGrants: [],
    });
    prisma.learningUsageDay.findMany
      .mockResolvedValueOnce([{ deviceType: 'COMPUTER', usedSeconds: 600 }])
      .mockResolvedValueOnce([{ deviceType: 'COMPUTER', usedSeconds: 600 }])
      .mockResolvedValueOnce([{ deviceType: 'COMPUTER', usedSeconds: 660 }]);
    prisma.learningUsageDay.upsert.mockResolvedValue({});
    prisma.lesson.findUnique.mockResolvedValue({
      id: 'lesson-1',
      status: 'PUBLISHED',
      durationSec: 600,
      videos: [{ id: 'video-1', durationSec: 600 }],
    });
    prisma.lessonProgress.findUnique.mockResolvedValue({
      status: 'IN_PROGRESS',
      completedAt: null,
      lastPositionSec: 120,
    });
    prisma.lessonProgress.upsert.mockResolvedValue({
      lessonId: 'lesson-1',
      status: 'IN_PROGRESS',
      watchCount: 1,
      lastPositionSec: 180,
      isFavorite: false,
    });
    prisma.subscription.findFirst.mockResolvedValue({ id: 'subscription-1' });

    await service.recordLessonWatch(
      'lesson-1',
      {
        event: 'PROGRESSED' as any,
        lastPositionSec: 180,
        watchedDurationSec: 60,
      },
      parent,
      'child-1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    );

    expect(prisma.learningUsageDay.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          childProfileId_usageDate_deviceType: expect.objectContaining({
            usageDate: expect.any(String),
            deviceType: 'COMPUTER',
          }),
        }),
        update: expect.objectContaining({
          usedSeconds: { increment: 60 },
        }),
      }),
    );
  });

  it('allows watching a lesson inside the assigned learning path', async () => {
    learningPath.assertLessonAvailableForChild.mockResolvedValue({
      mode: 'ASSIGNED_PATH',
      assignmentId: 'assignment-1',
      learningPathId: 'path-1',
      learningPathCode: 'LP-STARTER',
      packageId: 'package-1',
      packageCode: 'PKG-STARTER',
      lessonIds: ['lesson-1'],
    });
    prisma.lesson.findUnique.mockResolvedValue({
      id: 'lesson-1',
      status: 'PUBLISHED',
      durationSec: 600,
      videos: [{ id: 'video-1', durationSec: 600 }],
    });
    prisma.lessonProgress.findUnique.mockResolvedValue(null);
    prisma.lessonProgress.upsert.mockResolvedValue({
      lessonId: 'lesson-1',
      status: 'IN_PROGRESS',
      watchCount: 1,
      lastPositionSec: 0,
      isFavorite: false,
    });

    const result = await service.recordLessonWatch(
      'lesson-1',
      { event: 'STARTED' as any },
      parent,
      'child-1',
    );

    expect(learningPath.assertLessonAvailableForChild).toHaveBeenCalledWith(
      'child-1',
      'lesson-1',
    );
    expect(result.contentSource).toMatchObject({
      mode: 'ASSIGNED_PATH',
      assignmentId: 'assignment-1',
    });
    expect(prisma.lessonProgress.upsert).toHaveBeenCalled();
  });

  it('blocks watching a lesson outside the assigned learning path', async () => {
    learningPath.assertLessonAvailableForChild.mockRejectedValue(
      new ForbiddenException(
        'Lesson is outside the assigned learning path for this child',
      ),
    );

    await expect(
      service.recordLessonWatch(
        'lesson-outside',
        { event: 'STARTED' as any },
        parent,
        'child-1',
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.lessonProgress.upsert).not.toHaveBeenCalled();
  });

  it('blocks favoriting a lesson outside the assigned learning path', async () => {
    learningPath.assertLessonAvailableForChild.mockRejectedValue(
      new ForbiddenException(
        'Lesson is outside the assigned learning path for this child',
      ),
    );

    await expect(
      service.setLessonFavorite(
        'lesson-outside',
        { isFavorite: true },
        parent,
        'child-1',
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.lessonProgress.upsert).not.toHaveBeenCalled();
  });

  it('blocks practice for a lesson outside the assigned learning path', async () => {
    learningPath.assertLessonAvailableForChild.mockRejectedValue(
      new ForbiddenException(
        'Lesson is outside the assigned learning path for this child',
      ),
    );

    await expect(
      service.getLessonPractice('lesson-outside', parent, 'child-1'),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.lesson.findUnique).not.toHaveBeenCalled();
  });

  it('blocks submitting an attempt when the activity lesson is outside the assigned path', async () => {
    prisma.activity.findUnique.mockResolvedValue(publishedActivity());
    learningPath.assertLessonAvailableForChild.mockRejectedValue(
      new ForbiddenException(
        'Lesson is outside the assigned learning path for this child',
      ),
    );

    await expect(
      service.submitAttempt(
        'activity-1',
        {
          responses: [
            { questionId: 'question-1', selectedAnswerIds: ['answer-1'] },
          ],
        },
        parent,
        'child-1',
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(learningPath.assertLessonAvailableForChild).toHaveBeenCalledWith(
      'child-1',
      'lesson-1',
    );
    expect(prisma.activityAttempt.create).not.toHaveBeenCalled();
  });

  it('blocks lesson access after the daily device limit is reached', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      parentId: 'parent-1',
      screenTime: { isEnabled: true, dailyLimitMinutes: 45 },
      deviceTimeGrants: [],
    });
    prisma.learningUsageDay.findMany.mockResolvedValue([
      { deviceType: 'PHONE', usedSeconds: 45 * 60 },
    ]);
    prisma.subscription.findFirst.mockResolvedValue({ id: 'subscription-1' });

    await expect(
      service.recordLessonWatch(
        'lesson-1',
        { event: 'STARTED' as any },
        parent,
        'child-1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile',
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.lessonProgress.upsert).not.toHaveBeenCalled();
  });

  it('uses assigned learning path lessons before global published lessons', async () => {
    learningPath.getActiveAssignedLessonIds.mockResolvedValue({
      mode: 'ASSIGNED_PATH',
      assignmentId: 'assignment-1',
      contentPackageId: 'package-1',
      contentPackageCode: 'PKG-STARTER',
      contentPackageTitle: 'Starter Package',
      learningPathId: 'path-1',
      learningPathCode: 'LP-STARTER',
      learningPathTitle: 'Starter Path',
      lessonIds: ['lesson-2'],
    });
    prisma.lesson.findMany.mockResolvedValue([
      publishedVideoLesson('lesson-2'),
    ]);

    const home = await service.getLearningHome(parent, 'child-1');

    expect(prisma.lesson.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['lesson-2'] },
          status: 'PUBLISHED',
        }),
      }),
    );
    expect(home.contentSource).toMatchObject({
      mode: 'ASSIGNED_PATH',
      assignmentId: 'assignment-1',
      learningPathId: 'path-1',
      lessonCount: 1,
    });
    expect(home.summary.totalLessons).toBe(1);
  });

  it('surfaces a persistent assigned daily plan on the learning home', async () => {
    learningPath.getActiveAssignedLessonIds.mockResolvedValue({
      mode: 'ASSIGNED_PATH',
      assignmentId: 'assignment-1',
      contentPackageId: 'package-1',
      contentPackageCode: 'PKG-STARTER',
      contentPackageTitle: 'Starter Package',
      learningPathId: 'path-1',
      learningPathCode: 'LP-STARTER',
      learningPathTitle: 'Starter Path',
      lessonIds: ['lesson-1'],
    });
    prisma.lesson.findMany.mockResolvedValue([
      publishedVideoLesson('lesson-1'),
    ]);
    dailyPlan.getOrGenerateTodayPlan.mockResolvedValue({
      plan: {
        id: 'plan-1',
        childProfileId: 'child-1',
        planDate: '2026-06-14',
        status: 'ACTIVE',
      },
      planDate: '2026-06-14',
      timezone: 'Asia/Bangkok',
      generated: true,
      contentSource: {
        mode: 'ASSIGNED_PATH',
        contentPackageId: 'package-1',
        contentPackageCode: 'PKG-STARTER',
        contentPackageTitle: 'Starter Package',
        learningPathId: 'path-1',
        learningPathCode: 'LP-STARTER',
        learningPathTitle: 'Starter Path',
      },
      items: [
        {
          id: 'plan-item-video',
          itemType: 'VIDEO',
          lessonId: 'lesson-1',
          activityId: null,
          status: 'READY',
          lesson: {
            id: 'lesson-1',
            title: 'Lesson lesson-1',
            durationSec: 600,
          },
          activity: null,
        },
        {
          id: 'plan-item-practice',
          itemType: 'PRACTICE',
          lessonId: 'lesson-1',
          activityId: 'activity-1',
          status: 'LOCKED',
          lesson: {
            id: 'lesson-1',
            title: 'Lesson lesson-1',
            durationSec: 600,
          },
          activity: { id: 'activity-1', title: 'Practice 1' },
        },
      ],
    });

    const home = await service.getLearningHome(parent, 'child-1');

    expect(dailyPlan.getOrGenerateTodayPlan).toHaveBeenCalledWith(
      parent,
      'child-1',
    );
    expect(home.persistentDailyPlan.plan).toMatchObject({ id: 'plan-1' });
    expect(home.dailyPlan).toEqual([
      expect.objectContaining({
        id: 'plan-item-video',
        type: 'VIDEO',
        lessonId: 'lesson-1',
        status: 'READY',
      }),
      expect.objectContaining({
        id: 'plan-item-practice',
        type: 'PRACTICE',
        description: 'Practice 1',
        status: 'LOCKED',
      }),
    ]);
  });

  it('keeps an explicit unassigned fallback when no content assignment exists', async () => {
    learningPath.getActiveAssignedLessonIds.mockResolvedValue(null);
    prisma.lesson.findMany.mockResolvedValue([
      publishedVideoLesson('lesson-1'),
    ]);

    const home = await service.getLearningHome(parent, 'child-1');

    expect(prisma.lesson.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          id: expect.anything(),
        }),
      }),
    );
    expect(home.contentSource).toMatchObject({
      mode: 'UNASSIGNED_FALLBACK',
      reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
      lessonCount: 1,
    });
  });

  function publishedActivity() {
    return {
      id: 'activity-1',
      lessonId: 'lesson-1',
      lesson: { status: 'PUBLISHED' },
      questions: [
        {
          id: 'question-1',
          type: 'SINGLE_CHOICE',
          prompt: 'Pick one',
          explanation: 'Use the correct answer.',
          points: 1,
          answers: [
            {
              id: 'answer-1',
              text: 'Correct',
              isCorrect: true,
              sortOrder: 0,
            },
            {
              id: 'answer-2',
              text: 'Wrong',
              isCorrect: false,
              sortOrder: 1,
            },
          ],
        },
      ],
    };
  }

  function publishedVideoLesson(id: string) {
    return {
      id,
      slug: id,
      title: `Lesson ${id}`,
      description: null,
      durationSec: 600,
      sortOrder: 1,
      unit: {
        id: 'unit-1',
        title: 'Unit 1',
        description: null,
        sortOrder: 1,
        course: {
          id: 'course-1',
          title: 'Course 1',
          slug: 'course-1',
          description: null,
          sortOrder: 1,
          level: {
            code: 'A1',
            title: 'A1',
            sortOrder: 1,
          },
        },
      },
      videos: [
        {
          id: 'video-1',
          title: 'Video 1',
          provider: 'INTERNAL',
          sourceUrl: 'https://example.com/video.mp4',
          embedUrl: null,
          thumbnailUrl: null,
          durationSec: 600,
        },
      ],
      activities: [{ id: 'activity-1' }],
      tags: [],
      progress: [],
    };
  }
});
