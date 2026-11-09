import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createParentServiceForTest } from './parent.testing';

describe('ParentService', () => {
  const prisma = {
    childProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    childContentAssignment: {
      findFirst: jest.fn(),
    },
    dailyLearningPlan: {
      findMany: jest.fn(),
    },
    videoExposureLog: {
      findMany: jest.fn(),
    },
    activityAttempt: {
      findMany: jest.fn(),
    },
    lessonProgress: {
      findMany: jest.fn(),
    },
    childScreenTimeSetting: {
      upsert: jest.fn(),
    },
    learningUsageDay: {
      findMany: jest.fn(),
    },
    deviceTimeGrant: {
      create: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
  };
  const childAccess = {
    assertCanAccessChild: jest.fn(),
  };
  const service = createParentServiceForTest(prisma as any, childAccess as any);
  const parent = {
    sub: 'parent-1',
    email: 'parent@example.com',
    roles: ['PARENT'],
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-06-14T03:00:00.000Z'));
    childAccess.assertCanAccessChild.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });
    prisma.childContentAssignment.findFirst.mockResolvedValue(null);
    prisma.dailyLearningPlan.findMany.mockResolvedValue([]);
    prisma.videoExposureLog.findMany.mockResolvedValue([]);
    prisma.activityAttempt.findMany.mockResolvedValue([]);
    prisma.subscription.findFirst.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns linked child progress and phone limit settings', async () => {
    const now = new Date();
    prisma.childProfile.findMany.mockResolvedValue([
      {
        id: 'child-1',
        displayName: 'Child One',
        avatarUrl: null,
        subscriptions: [
          {
            status: 'ACTIVE',
            currentPeriodEnd: now,
          },
        ],
        screenTime: {
          isEnabled: true,
          dailyLimitMinutes: 45,
          updatedAt: now,
        },
        deviceTimeGrants: [{ extraMinutes: 10 }],
      },
    ]);
    prisma.lessonProgress.findMany.mockResolvedValue([
      {
        childProfileId: 'child-1',
        status: 'IN_PROGRESS',
        lastPositionSec: 300,
        watchCount: 2,
        lastWatchedAt: now,
        lesson: {
          id: 'lesson-1',
          title: 'Greeting Basics',
          durationSec: 480,
          activities: [{ id: 'activity-1' }],
        },
      },
    ]);
    prisma.learningUsageDay.findMany.mockResolvedValue([
      {
        childProfileId: 'child-1',
        deviceType: 'COMPUTER',
        usedSeconds: 600,
      },
    ]);

    await expect(service.listChildren(parent)).resolves.toEqual({
      children: [
        expect.objectContaining({
          id: 'child-1',
          displayName: 'Child One',
          screenTime: expect.objectContaining({
            isEnabled: true,
            dailyLimitMinutes: 45,
          }),
          progress: expect.objectContaining({
            inProgressLessons: 1,
            watchedLessons: 1,
            totalWatchCount: 2,
            weeklyStudyMinutes: 5,
          }),
          deviceUsage: expect.objectContaining({
            usedMinutes: 10,
            limitMinutes: 55,
            remainingMinutes: 45,
            grantedExtraMinutes: 10,
          }),
          insight: expect.objectContaining({
            title: 'Tiếp tục bài đang học',
            status: 'IN_PROGRESS',
          }),
        }),
      ],
    });
    expect(prisma.childProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { parentId: 'parent-1' },
      }),
    );
  });

  it('updates a screen time setting only for a linked child', async () => {
    const now = new Date();
    prisma.childProfile.findUnique.mockResolvedValue({ parentId: 'parent-1' });
    prisma.childScreenTimeSetting.upsert.mockResolvedValue({
      childProfileId: 'child-1',
      isEnabled: true,
      dailyLimitMinutes: 60,
      sessionLimitMinutes: 30,
      breakMinutes: 10,
      updatedAt: now,
    });

    await expect(
      service.updateScreenTime(
        'child-1',
        { isEnabled: true, dailyLimitMinutes: 60 },
        parent,
      ),
    ).resolves.toEqual({
      isEnabled: true,
      dailyLimitMinutes: 60,
      sessionLimitMinutes: 30,
      breakMinutes: 10,
      updatedAt: now,
    });
    expect(prisma.childScreenTimeSetting.upsert).toHaveBeenCalledWith({
      where: { childProfileId: 'child-1' },
      update: {
        isEnabled: true,
        dailyLimitMinutes: 60,
      },
      create: {
        childProfileId: 'child-1',
        isEnabled: true,
        dailyLimitMinutes: 60,
        sessionLimitMinutes: 30,
        breakMinutes: 10,
      },
    });
  });

  it('rejects updates for children outside the parent account', async () => {
    prisma.childProfile.findUnique.mockResolvedValue(null);

    await expect(
      service.updateScreenTime('child-2', { dailyLimitMinutes: 30 }, parent),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.childScreenTimeSetting.upsert).not.toHaveBeenCalled();
  });

  it('grants extra device time for today', async () => {
    const now = new Date();
    prisma.childProfile.findUnique.mockResolvedValue({
      parentId: 'parent-1',
      screenTime: {
        isEnabled: true,
        dailyLimitMinutes: 45,
      },
    });
    prisma.deviceTimeGrant.create.mockResolvedValue({
      id: 'grant-1',
      usageDate: '2026-05-28',
      extraMinutes: 15,
      createdAt: now,
    });

    await expect(
      service.grantExtraDeviceTime(
        'child-1',
        { extraMinutes: 15, note: 'finish lesson' },
        parent,
      ),
    ).resolves.toEqual({
      id: 'grant-1',
      usageDate: '2026-05-28',
      extraMinutes: 15,
      createdAt: now,
    });
    expect(prisma.deviceTimeGrant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          childProfileId: 'child-1',
          grantedById: 'parent-1',
          extraMinutes: 15,
        }),
      }),
    );
  });

  it('rejects extra time when the limit is off', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      parentId: 'parent-1',
      screenTime: {
        isEnabled: false,
        dailyLimitMinutes: 45,
      },
    });

    await expect(
      service.grantExtraDeviceTime('child-1', { extraMinutes: 10 }, parent),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.deviceTimeGrant.create).not.toHaveBeenCalled();
  });

  it('builds a 7-day parent learning report from plan, video evidence, and practice attempts', async () => {
    const videoEvidenceAt = new Date('2026-06-14T02:00:00.000Z');
    const attemptAt = new Date('2026-06-14T02:10:00.000Z');

    prisma.childProfile.findUnique.mockResolvedValue({
      id: 'child-1',
      displayName: 'Child One',
    });
    prisma.childContentAssignment.findFirst.mockResolvedValue({
      id: 'assignment-1',
      contentPackage: {
        id: 'package-1',
        code: 'starter',
        title: 'Starter Pack',
        learningPath: {
          id: 'path-1',
          code: 'A1',
          title: 'A1 Starter',
        },
      },
    });
    prisma.dailyLearningPlan.findMany.mockResolvedValue([
      {
        id: 'plan-1',
        planDate: '2026-06-14',
        status: 'COMPLETED',
        contentPackage: {
          id: 'package-1',
          code: 'starter',
          title: 'Starter Pack',
        },
        learningPath: { id: 'path-1', code: 'A1', title: 'A1 Starter' },
        items: [
          {
            id: 'item-video',
            itemType: 'VIDEO',
            status: 'COMPLETED',
            lessonId: 'lesson-1',
            activityId: null,
            minWatchPercent: 80,
            minScore: null,
            lesson: { id: 'lesson-1', title: 'Greeting video' },
            activity: null,
          },
          {
            id: 'item-practice',
            itemType: 'PRACTICE',
            status: 'COMPLETED',
            lessonId: 'lesson-1',
            activityId: 'activity-1',
            minWatchPercent: null,
            minScore: 70,
            lesson: { id: 'lesson-1', title: 'Greeting video' },
            activity: { id: 'activity-1', title: 'Greeting quiz' },
          },
        ],
      },
    ]);
    prisma.videoExposureLog.findMany.mockResolvedValue([
      {
        id: 'evidence-1',
        lessonId: 'lesson-1',
        videoAssetId: 'video-1',
        eventType: 'PROGRESSED',
        positionSec: 480,
        durationWatchedSec: 480,
        watchPercent: 80,
        source: 'RUNTIME_WATCH_EVENT',
        createdAt: videoEvidenceAt,
      },
    ]);
    prisma.activityAttempt.findMany.mockResolvedValue([
      {
        id: 'attempt-1',
        activityId: 'activity-1',
        score: 8,
        maxScore: 10,
        submittedAt: attemptAt,
      },
    ]);

    const report = await service.getChildLearningReport(
      parent,
      'child-1',
      '7d',
    );

    expect(report).toMatchObject({
      child: { id: 'child-1', displayName: 'Child One' },
      range: '7d',
      fromDate: '2026-06-08',
      toDate: '2026-06-14',
      activeAssignment: {
        packageId: 'package-1',
        learningPathId: 'path-1',
      },
      summary: {
        planDays: 1,
        completedPlanDays: 1,
        activeDays: 1,
        totalItems: 2,
        completedItems: 2,
        blockedItems: 0,
        videoItemsCompleted: 1,
        practiceItemsCompleted: 1,
        averagePracticeScorePercent: 80,
        totalWatchEvidenceMinutes: 8,
        bestWatchPercent: 80,
      },
    });
    expect(report.days).toHaveLength(7);
    expect(report.days[6]).toMatchObject({
      date: '2026-06-14',
      planId: 'plan-1',
      videoSummary: {
        completed: 1,
        insufficientEvidence: 0,
        maxWatchPercent: 80,
        watchEvidenceMinutes: 8,
      },
      practiceSummary: {
        completed: 1,
        attempts: 1,
        averageScorePercent: 80,
        belowMinScore: 0,
      },
    });
  });

  it('supports 30-day report range without faking empty data', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      id: 'child-1',
      displayName: 'Child One',
    });

    const report = await service.getChildLearningReport(
      parent,
      'child-1',
      '30d',
    );

    expect(prisma.dailyLearningPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          childProfileId: 'child-1',
          planDate: { gte: '2026-05-16', lte: '2026-06-14' },
        }),
      }),
    );
    expect(report.summary).toMatchObject({
      planDays: 0,
      totalItems: 0,
      completedItems: 0,
      blockedItems: 0,
      averagePracticeScorePercent: null,
      bestWatchPercent: null,
    });
    expect(report.days).toHaveLength(30);
    expect(report.emptyState).toEqual({
      code: 'NO_ASSIGNMENT',
      message: 'Con chưa được gán lộ trình học chính.',
    });
  });

  it('surfaces blocked reasons when video and practice evidence are insufficient', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      id: 'child-1',
      displayName: 'Child One',
    });
    prisma.childContentAssignment.findFirst.mockResolvedValue({
      id: 'assignment-1',
      contentPackage: {
        id: 'package-1',
        code: 'starter',
        title: 'Starter Pack',
        learningPath: {
          id: 'path-1',
          code: 'A1',
          title: 'A1 Starter',
        },
      },
    });
    prisma.dailyLearningPlan.findMany.mockResolvedValue([
      {
        id: 'plan-1',
        planDate: '2026-06-14',
        status: 'ACTIVE',
        contentPackage: null,
        learningPath: null,
        items: [
          {
            id: 'item-video',
            itemType: 'VIDEO',
            status: 'READY',
            lessonId: 'lesson-1',
            activityId: null,
            minWatchPercent: 80,
            minScore: null,
            lesson: { id: 'lesson-1', title: 'Greeting video' },
            activity: null,
          },
          {
            id: 'item-practice',
            itemType: 'PRACTICE',
            status: 'READY',
            lessonId: 'lesson-1',
            activityId: 'activity-1',
            minWatchPercent: null,
            minScore: 70,
            lesson: { id: 'lesson-1', title: 'Greeting video' },
            activity: { id: 'activity-1', title: 'Greeting quiz' },
          },
        ],
      },
    ]);
    prisma.activityAttempt.findMany.mockResolvedValue([
      {
        id: 'attempt-low',
        activityId: 'activity-1',
        score: 4,
        maxScore: 10,
        submittedAt: new Date('2026-06-14T02:10:00.000Z'),
      },
    ]);

    const report = await service.getChildLearningReport(
      parent,
      'child-1',
      '7d',
    );
    const day = report.days[6];

    expect(report.summary.blockedItems).toBe(2);
    expect(day.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: 'item-video',
          blockedReason: 'WATCH_EVIDENCE_INSUFFICIENT',
          blockedMessage: 'Con chưa xem đủ video để tính hoàn thành.',
        }),
        expect.objectContaining({
          itemId: 'item-practice',
          blockedReason: 'PRACTICE_SCORE_BELOW_MIN',
          blockedMessage: 'Con đã làm bài nhưng điểm chưa đạt mức hoàn thành.',
        }),
      ]),
    );
  });

  it('does not query report evidence when the parent cannot access the child', async () => {
    childAccess.assertCanAccessChild.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await expect(
      service.getChildLearningReport(parent, 'child-other', '7d'),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.dailyLearningPlan.findMany).not.toHaveBeenCalled();
    expect(prisma.videoExposureLog.findMany).not.toHaveBeenCalled();
    expect(prisma.activityAttempt.findMany).not.toHaveBeenCalled();
  });
});
