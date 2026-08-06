import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  DailyLearningPlanContentSourceMode,
  DailyLearningPlanGeneratedBy,
  DailyLearningPlanItemStatus,
  DailyLearningPlanItemType,
  DailyLearningPlanStatus,
} from '@prisma/client';
import { DailyPlanService } from './daily-plan.service';

describe('DailyPlanService', () => {
  const prisma = {
    dailyLearningPlan: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    dailyLearningPlanItem: {
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    childContentAssignment: {
      findFirst: jest.fn(),
    },
    lessonProgress: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    videoExposureLog: {
      findFirst: jest.fn(),
    },
    activityAttempt: {
      findFirst: jest.fn(),
    },
  };
  const childAccess = {
    assertCanAccessChild: jest.fn(),
  };
  const entitlement = {
    assertActiveSubscription: jest.fn(),
    assertCapability: jest.fn(),
  };
  const service = new DailyPlanService(
    prisma as any,
    childAccess as any,
    entitlement as any,
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
    prisma.dailyLearningPlan.findUnique.mockResolvedValue(null);
    prisma.childContentAssignment.findFirst.mockResolvedValue(
      activeAssignment(),
    );
    prisma.lessonProgress.findMany.mockResolvedValue([]);
    prisma.lessonProgress.findUnique.mockResolvedValue({
      status: 'COMPLETED',
    });
    prisma.videoExposureLog.findFirst.mockResolvedValue({
      id: 'exposure-1',
      videoAssetId: 'video-1',
      eventType: 'PROGRESSED',
      positionSec: 480,
      durationWatchedSec: 480,
      watchPercent: 80,
      source: 'RUNTIME_WATCH_EVENT',
      createdAt: new Date('2026-06-14T00:00:00.000Z'),
    });
    prisma.activityAttempt.findFirst.mockResolvedValue({
      id: 'attempt-1',
      score: 8,
      maxScore: 10,
      submittedAt: new Date('2026-06-14T00:00:00.000Z'),
    });
    prisma.dailyLearningPlan.create.mockResolvedValue(planWithItems());
    prisma.dailyLearningPlanItem.update.mockResolvedValue({});
    prisma.dailyLearningPlanItem.updateMany.mockResolvedValue({ count: 1 });
    prisma.dailyLearningPlanItem.findMany.mockResolvedValue([
      { status: DailyLearningPlanItemStatus.COMPLETED },
    ]);
    prisma.dailyLearningPlan.update.mockResolvedValue({});
  });

  it('generates a daily plan from the active published assignment path', async () => {
    const result = await service.getOrGeneratePlanForDate(
      parent,
      'child-1',
      '2026-06-14',
    );

    expect(prisma.childContentAssignment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          childProfileId: 'child-1',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(prisma.dailyLearningPlan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          childProfileId: 'child-1',
          planDate: '2026-06-14',
          contentSourceMode: DailyLearningPlanContentSourceMode.ASSIGNED_PATH,
          contentPackageId: 'package-1',
          learningPathId: 'path-1',
          generatedBy: DailyLearningPlanGeneratedBy.SYSTEM_RULE,
          items: {
            create: [
              expect.objectContaining({
                itemType: DailyLearningPlanItemType.VIDEO,
                lessonId: 'lesson-1',
                status: DailyLearningPlanItemStatus.READY,
              }),
              expect.objectContaining({
                itemType: DailyLearningPlanItemType.PRACTICE,
                activityId: 'activity-1',
                status: DailyLearningPlanItemStatus.LOCKED,
              }),
            ],
          },
        }),
      }),
    );
    expect(result.generated).toBe(true);
    expect(result.contentSource).toMatchObject({
      mode: 'ASSIGNED_PATH',
      contentPackageId: 'package-1',
      learningPathId: 'path-1',
    });
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      evidenceSummary: expect.objectContaining({
        type: 'VIDEO_EXPOSURE',
        watchPercent: 80,
        minWatchPercent: 80,
        passed: true,
      }),
      blockedReason: null,
    });
  });

  it('returns an unassigned fallback without persisting a plan', async () => {
    prisma.childContentAssignment.findFirst.mockResolvedValue(null);

    const result = await service.getOrGeneratePlanForDate(
      parent,
      'child-1',
      '2026-06-14',
    );

    expect(result).toMatchObject({
      plan: null,
      generated: false,
      contentSource: {
        mode: 'UNASSIGNED_FALLBACK',
        reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
      },
    });
    expect(prisma.dailyLearningPlan.create).not.toHaveBeenCalled();
  });

  it('returns an existing plan idempotently for the same child and date', async () => {
    prisma.dailyLearningPlan.findUnique.mockResolvedValueOnce(planWithItems());

    const result = await service.getOrGeneratePlanForDate(
      parent,
      'child-1',
      '2026-06-14',
    );

    expect(result.generated).toBe(false);
    expect(result.plan).toMatchObject({ id: 'plan-1' });
    expect(prisma.childContentAssignment.findFirst).not.toHaveBeenCalled();
    expect(prisma.dailyLearningPlan.create).not.toHaveBeenCalled();
  });

  it('returns evidence summary and blocked reason when watch evidence is insufficient', async () => {
    prisma.videoExposureLog.findFirst.mockResolvedValue(null);

    const result = await service.getOrGeneratePlanForDate(
      parent,
      'child-1',
      '2026-06-14',
    );

    expect(result.items[0]).toMatchObject({
      itemType: DailyLearningPlanItemType.VIDEO,
      evidenceSummary: expect.objectContaining({
        type: 'VIDEO_EXPOSURE',
        watchPercent: 0,
        minWatchPercent: 80,
        passed: false,
      }),
      blockedReason: 'WATCH_EVIDENCE_INSUFFICIENT',
    });
  });

  it('does not generate from unpublished or missing assignment content', async () => {
    prisma.childContentAssignment.findFirst.mockResolvedValue(null);

    const result = await service.getOrGeneratePlanForDate(
      parent,
      'child-1',
      '2026-06-14',
    );

    expect(result.plan).toBeNull();
    expect(prisma.dailyLearningPlan.create).not.toHaveBeenCalled();
  });

  it('blocks plan generation when the parent cannot access the child', async () => {
    childAccess.assertCanAccessChild.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await expect(
      service.getOrGeneratePlanForDate(parent, 'child-other', '2026-06-14'),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.childContentAssignment.findFirst).not.toHaveBeenCalled();
  });

  it('blocks plan generation without an active learning entitlement', async () => {
    entitlement.assertActiveSubscription.mockRejectedValue(
      new ForbiddenException('Learning access is not active'),
    );

    await expect(
      service.getOrGeneratePlanForDate(parent, 'child-1', '2026-06-14'),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.dailyLearningPlan.create).not.toHaveBeenCalled();
  });

  it('starts a ready item after checking item capability', async () => {
    prisma.dailyLearningPlan.findUnique
      .mockResolvedValueOnce(planWithItems({ items: [videoPlanItem()] }))
      .mockResolvedValueOnce(
        planWithItems({
          items: [
            videoPlanItem({
              status: DailyLearningPlanItemStatus.STARTED,
            }),
          ],
        }),
      );

    await service.startItem('plan-1', 'item-video', parent);

    expect(entitlement.assertCapability).toHaveBeenCalledWith(
      'child-1',
      'video',
    );
    expect(prisma.dailyLearningPlanItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-video' },
        data: expect.objectContaining({
          status: DailyLearningPlanItemStatus.STARTED,
        }),
      }),
    );
  });

  it('requires sufficient watch evidence before completing a video item', async () => {
    prisma.dailyLearningPlan.findUnique.mockResolvedValue(
      planWithItems({
        items: [
          videoPlanItem({
            status: DailyLearningPlanItemStatus.STARTED,
          }),
        ],
      }),
    );
    prisma.videoExposureLog.findFirst.mockResolvedValue(null);

    await expect(
      service.completeItem('plan-1', 'item-video', parent),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.dailyLearningPlanItem.update).not.toHaveBeenCalled();
  });

  it('completes a video item and unlocks the following practice item', async () => {
    prisma.videoExposureLog.findFirst.mockResolvedValue({
      id: 'exposure-1',
      videoAssetId: 'video-1',
      eventType: 'PROGRESSED',
      positionSec: 480,
      durationWatchedSec: 480,
      watchPercent: 80,
      source: 'RUNTIME_WATCH_EVENT',
      createdAt: new Date('2026-06-14T00:00:00.000Z'),
    });
    prisma.dailyLearningPlan.findUnique
      .mockResolvedValueOnce(
        planWithItems({
          items: [
            videoPlanItem({
              status: DailyLearningPlanItemStatus.STARTED,
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(planWithItems());

    const result = await service.completeItem('plan-1', 'item-video', parent);

    expect(prisma.dailyLearningPlanItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-video' },
        data: expect.objectContaining({
          status: DailyLearningPlanItemStatus.COMPLETED,
        }),
      }),
    );
    expect(prisma.dailyLearningPlanItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          planId: 'plan-1',
          lessonId: 'lesson-1',
          status: DailyLearningPlanItemStatus.LOCKED,
        }),
        data: { status: DailyLearningPlanItemStatus.READY },
      }),
    );
    expect(result.plan).toMatchObject({ id: 'plan-1' });
  });

  it('requires a backend-graded passing attempt before completing practice', async () => {
    prisma.dailyLearningPlan.findUnique.mockResolvedValue(
      planWithItems({
        items: [
          practicePlanItem({
            status: DailyLearningPlanItemStatus.STARTED,
            minScore: 80,
          }),
        ],
      }),
    );
    prisma.activityAttempt.findFirst.mockResolvedValue({
      id: 'attempt-low',
      score: 7,
      maxScore: 10,
      submittedAt: new Date('2026-06-14T00:00:00.000Z'),
    });

    await expect(
      service.completeItem('plan-1', 'item-practice', parent),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.dailyLearningPlanItem.update).not.toHaveBeenCalled();
  });

  it('blocks skipping required items', async () => {
    prisma.dailyLearningPlan.findUnique.mockResolvedValue(
      planWithItems({ items: [videoPlanItem({ required: true })] }),
    );

    await expect(
      service.skipItem('plan-1', 'item-video', parent),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.dailyLearningPlanItem.update).not.toHaveBeenCalled();
  });

  function activeAssignment(overrides: Record<string, any> = {}) {
    return {
      id: 'assignment-1',
      childProfileId: 'child-1',
      contentPackageId: 'package-1',
      contentPackage: {
        id: 'package-1',
        code: 'PKG-STARTER',
        title: 'Starter Package',
        learningPathId: 'path-1',
        learningPath: {
          id: 'path-1',
          code: 'LP-STARTER',
          title: 'Starter Path',
          items: [pathItem()],
        },
      },
      ...overrides,
    };
  }

  function pathItem(overrides: Record<string, any> = {}) {
    return {
      id: 'path-item-1',
      lessonId: 'lesson-1',
      sequence: 1,
      required: true,
      minScore: 80,
      minWatchPercent: 80,
      lesson: {
        id: 'lesson-1',
        slug: 'lesson-1',
        title: 'Lesson 1',
        description: null,
        durationSec: 600,
        status: 'PUBLISHED',
        videos: [{ id: 'video-1', durationSec: 600 }],
        activities: [{ id: 'activity-1', title: 'Practice 1', type: 'QUIZ' }],
      },
      ...overrides,
    };
  }

  function planWithItems(overrides: Record<string, any> = {}) {
    return {
      id: 'plan-1',
      childProfileId: 'child-1',
      planDate: '2026-06-14',
      status: DailyLearningPlanStatus.ACTIVE,
      contentSourceMode: DailyLearningPlanContentSourceMode.ASSIGNED_PATH,
      contentPackageId: 'package-1',
      learningPathId: 'path-1',
      targetMinutes: 15,
      generatedBy: DailyLearningPlanGeneratedBy.SYSTEM_RULE,
      createdAt: new Date('2026-06-14T00:00:00.000Z'),
      updatedAt: new Date('2026-06-14T00:00:00.000Z'),
      contentPackage: {
        id: 'package-1',
        code: 'PKG-STARTER',
        title: 'Starter Package',
      },
      learningPath: {
        id: 'path-1',
        code: 'LP-STARTER',
        title: 'Starter Path',
      },
      items: [videoPlanItem(), practicePlanItem()],
      ...overrides,
    };
  }

  function videoPlanItem(overrides: Record<string, any> = {}) {
    return {
      id: 'item-video',
      planId: 'plan-1',
      sequence: 1,
      itemType: DailyLearningPlanItemType.VIDEO,
      lessonId: 'lesson-1',
      activityId: null,
      learningPathItemId: 'path-item-1',
      required: true,
      status: DailyLearningPlanItemStatus.READY,
      minWatchPercent: 80,
      minScore: 80,
      startedAt: null,
      completedAt: null,
      lesson: {
        id: 'lesson-1',
        slug: 'lesson-1',
        title: 'Lesson 1',
        description: null,
        durationSec: 600,
      },
      activity: null,
      learningPathItem: { id: 'path-item-1', sequence: 1 },
      ...overrides,
    };
  }

  function practicePlanItem(overrides: Record<string, any> = {}) {
    return {
      id: 'item-practice',
      planId: 'plan-1',
      sequence: 2,
      itemType: DailyLearningPlanItemType.PRACTICE,
      lessonId: 'lesson-1',
      activityId: 'activity-1',
      learningPathItemId: 'path-item-1',
      required: true,
      status: DailyLearningPlanItemStatus.LOCKED,
      minWatchPercent: 80,
      minScore: 80,
      startedAt: null,
      completedAt: null,
      lesson: {
        id: 'lesson-1',
        slug: 'lesson-1',
        title: 'Lesson 1',
        description: null,
        durationSec: 600,
      },
      activity: { id: 'activity-1', title: 'Practice 1', type: 'QUIZ' },
      learningPathItem: { id: 'path-item-1', sequence: 1 },
      ...overrides,
    };
  }
});
