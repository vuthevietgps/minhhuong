import { ForbiddenException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { ProgressStatusDto } from './dto/upsert-lesson-progress.dto';
import { ProgressController } from './progress.controller';

describe('ProgressController', () => {
  const progressService = {
    getUserProgress: jest.fn(),
    getSummary: jest.fn(),
    upsertLessonProgress: jest.fn(),
  };
  const childAccess = {
    assertCanAccessChild: jest.fn(),
  };
  const entitlement = {
    assertCapability: jest.fn(),
  };
  const controller = new ProgressController(
    progressService as any,
    childAccess as any,
    entitlement as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    childAccess.assertCanAccessChild.mockResolvedValue({
      id: 'child-1',
      parentId: 'user-1',
    });
    entitlement.assertCapability.mockResolvedValue({});
  });

  it('uses the verified child profile when updating progress', async () => {
    progressService.upsertLessonProgress.mockResolvedValue({
      id: 'progress-1',
    });

    await controller.upsertLessonProgress(
      {
        userId: 'other-user',
        lessonId: 'lesson-1',
        status: ProgressStatusDto.IN_PROGRESS,
      },
      'child-1',
      { sub: 'user-1', email: 'user@example.com', roles: ['STUDENT'] },
    );

    expect(childAccess.assertCanAccessChild).toHaveBeenCalledWith(
      { sub: 'user-1', email: 'user@example.com', roles: ['STUDENT'] },
      'child-1',
      expect.objectContaining({ purpose: 'progress:write-lesson' }),
    );
    expect(entitlement.assertCapability).toHaveBeenCalledWith(
      'child-1',
      'practice',
    );
    expect(progressService.upsertLessonProgress).toHaveBeenCalledWith(
      'child-1',
      expect.objectContaining({ userId: 'other-user' }),
    );
  });

  it('blocks learners from reading another user progress', async () => {
    await expect(
      controller.getUserProgress('user-2', 'child-2', {
        sub: 'user-1',
        email: 'user@example.com',
        roles: ['STUDENT'],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('blocks parent A from reading progress for child B', async () => {
    childAccess.assertCanAccessChild.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await expect(
      controller.getMyProgress('child-b', {
        sub: 'parent-a',
        email: 'parent-a@example.com',
        roles: ['PARENT'],
      }),
    ).rejects.toThrow(NotFoundException);
    expect(progressService.getUserProgress).not.toHaveBeenCalled();
  });
});
