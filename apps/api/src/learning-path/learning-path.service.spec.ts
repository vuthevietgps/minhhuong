import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { LearningPathService } from './learning-path.service';

describe('LearningPathService', () => {
  const prisma = {
    learningPath: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    learningPathItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lesson: {
      findUnique: jest.fn(),
    },
    contentPackage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    childContentAssignment: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const childAccess = {
    assertCanAccessChild: jest.fn(),
  };
  const service = new LearningPathService(prisma as any, childAccess as any);
  const admin = {
    sub: 'admin-1',
    email: 'admin@example.com',
    roles: ['ADMIN'],
  } as any;
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
    prisma.auditLog.create.mockResolvedValue({});
    prisma.$transaction.mockImplementation(async (input: any) => {
      if (typeof input === 'function') {
        return input({
          childContentAssignment: prisma.childContentAssignment,
        });
      }
      return Promise.all(input);
    });
  });

  it('rejects publishing an empty learning path', async () => {
    prisma.learningPath.findUnique.mockResolvedValue(
      learningPathDetail({ status: 'IN_REVIEW', items: [] }),
    );

    await expect(service.publishLearningPath('path-1', admin)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.learningPath.update).not.toHaveBeenCalled();
  });

  it('rejects publishing a path containing an unpublished lesson', async () => {
    prisma.learningPath.findUnique.mockResolvedValue(
      learningPathDetail({
        status: 'IN_REVIEW',
        items: [
          pathItem({
            lesson: lesson({ id: 'lesson-draft', status: 'DRAFT' }),
          }),
        ],
      }),
    );

    await expect(service.publishLearningPath('path-1', admin)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.learningPath.update).not.toHaveBeenCalled();
  });

  it('rejects duplicate item order inside a learning path', async () => {
    prisma.learningPath.findUnique.mockResolvedValue({
      id: 'path-1',
      status: 'DRAFT',
    });
    prisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1' });
    prisma.learningPathItem.findFirst.mockResolvedValue({
      id: 'item-existing',
      sequence: 2,
      lessonId: 'lesson-other',
    });

    await expect(
      service.addLearningPathItem(
        'path-1',
        { lessonId: 'lesson-1', sequence: 2 },
        admin,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.learningPathItem.create).not.toHaveBeenCalled();
  });

  it('does not reveal a child assignment when child access fails', async () => {
    childAccess.assertCanAccessChild.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await expect(
      service.getActiveAssignmentForChild('child-2', parent),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.childContentAssignment.findFirst).not.toHaveBeenCalled();
  });

  it('allows staff-scoped child assignment reads when explicitly enabled', async () => {
    prisma.childContentAssignment.findFirst.mockResolvedValue({
      id: 'assignment-1',
    });

    await expect(
      service.getActiveAssignmentForChild('child-1', admin, {
        allowStaff: true,
      }),
    ).resolves.toEqual({ id: 'assignment-1' });
    expect(childAccess.assertCanAccessChild).toHaveBeenCalledWith(
      admin,
      'child-1',
      { allowStaff: true },
    );
  });

  it('replaces the active child assignment transactionally', async () => {
    prisma.contentPackage.findUnique.mockResolvedValue(
      contentPackageDetail({
        status: 'PUBLISHED',
        learningPath: learningPathDetail({
          status: 'PUBLISHED',
          items: [pathItem()],
        }),
      }),
    );
    prisma.childContentAssignment.updateMany.mockResolvedValue({ count: 1 });
    prisma.childContentAssignment.create.mockResolvedValue({
      id: 'assignment-new',
      childProfileId: 'child-1',
      contentPackageId: 'package-1',
    });

    await expect(
      service.assignContentPackageToChild(
        'child-1',
        { contentPackageId: 'package-1' },
        admin,
      ),
    ).resolves.toMatchObject({ id: 'assignment-new' });
    expect(prisma.childContentAssignment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { childProfileId: 'child-1', status: 'ACTIVE' },
        data: expect.objectContaining({ status: 'REVOKED' }),
      }),
    );
    expect(prisma.childContentAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          childProfileId: 'child-1',
          contentPackageId: 'package-1',
          status: 'ACTIVE',
          assignedById: 'admin-1',
        }),
      }),
    );
  });

  it('allows direct lesson access when no active assignment exists', async () => {
    prisma.childContentAssignment.findFirst.mockResolvedValue(null);

    await expect(
      service.assertLessonAvailableForChild('child-1', 'lesson-any'),
    ).resolves.toMatchObject({
      mode: 'UNASSIGNED_FALLBACK',
      reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
    });
  });

  it('allows direct lesson access only for lessons in the assigned path', async () => {
    prisma.childContentAssignment.findFirst.mockResolvedValue(
      activeAssignment({
        items: [
          pathItem({
            lessonId: 'lesson-quiz',
            lesson: lesson({
              id: 'lesson-quiz',
              type: 'QUIZ',
              videos: [],
            }),
          }),
        ],
      }),
    );

    await expect(
      service.assertLessonAvailableForChild('child-1', 'lesson-quiz'),
    ).resolves.toMatchObject({
      mode: 'ASSIGNED_PATH',
      assignmentId: 'assignment-1',
      lessonIds: ['lesson-quiz'],
    });
  });

  it('rejects direct lesson access outside the assigned path', async () => {
    prisma.childContentAssignment.findFirst.mockResolvedValue(
      activeAssignment({
        items: [pathItem({ lessonId: 'lesson-1' })],
      }),
    );

    await expect(
      service.assertLessonAvailableForChild('child-1', 'lesson-outside'),
    ).rejects.toThrow(ForbiddenException);
  });

  function learningPathDetail(overrides: Record<string, any> = {}) {
    return {
      id: 'path-1',
      code: 'LP-STARTER',
      title: 'Starter Path',
      status: 'DRAFT',
      items: [pathItem()],
      packages: [],
      ...overrides,
    };
  }

  function contentPackageDetail(overrides: Record<string, any> = {}) {
    return {
      id: 'package-1',
      code: 'PKG-STARTER',
      title: 'Starter Package',
      status: 'DRAFT',
      learningPathId: 'path-1',
      learningPath: learningPathDetail(),
      ...overrides,
    };
  }

  function pathItem(overrides: Record<string, any> = {}) {
    return {
      id: 'item-1',
      learningPathId: 'path-1',
      lessonId: 'lesson-1',
      sequence: 1,
      lesson: lesson(),
      ...overrides,
    };
  }

  function lesson(overrides: Record<string, any> = {}) {
    return {
      id: 'lesson-1',
      slug: 'lesson-1',
      title: 'Lesson 1',
      status: 'PUBLISHED',
      type: 'VIDEO',
      videos: [{ id: 'video-1' }],
      ...overrides,
    };
  }

  function activeAssignment(overrides: { items?: any[] } = {}) {
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
          items: overrides.items ?? [pathItem()],
        },
      },
    };
  }
});
