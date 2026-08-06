import { BadRequestException } from '@nestjs/common';
import { AdminContentService } from './admin-content.service';

describe('AdminContentService', () => {
  const prisma = {
    lesson: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    course: {
      update: jest.fn(),
    },
    contentTag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    lessonTag: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
    auditLog: {
      create: jest.fn(),
    },
  };
  const service = new AdminContentService(prisma as any);
  const admin = {
    sub: 'admin-1',
    email: 'admin@example.com',
    roles: ['ADMIN'],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.auditLog.create.mockResolvedValue({});
    prisma.lessonTag.deleteMany.mockResolvedValue({});
    prisma.lessonTag.createMany.mockResolvedValue({});
    prisma.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );
  });

  it('does not publish a lesson before review', async () => {
    prisma.lesson.findUnique.mockResolvedValue({
      id: 'lesson-1',
      status: 'DRAFT',
      videos: [{ processingStatus: 'READY' }],
      activities: [],
      unit: { courseId: 'course-1' },
    });

    await expect(service.publishLesson('lesson-1', admin)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.lesson.update).not.toHaveBeenCalled();
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it('does not publish activities without questions', async () => {
    prisma.lesson.findUnique.mockResolvedValue({
      id: 'lesson-1',
      status: 'IN_REVIEW',
      videos: [{ processingStatus: 'READY' }],
      activities: [{ title: 'Empty activity', questions: [] }],
      unit: { courseId: 'course-1' },
    });

    await expect(service.publishLesson('lesson-1', admin)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.lesson.update).not.toHaveBeenCalled();
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it('creates unique topic tags for content discovery', async () => {
    prisma.contentTag.findUnique.mockResolvedValue(null);
    prisma.contentTag.create.mockResolvedValue({
      id: 'tag-1',
      slug: 'daily-routines',
      name: 'Daily routines',
      kind: 'TOPIC',
      isActive: true,
      _count: { lessons: 0 },
    });

    await expect(
      service.createTag(
        { name: 'Daily routines', kind: 'TOPIC' as any },
        admin,
      ),
    ).resolves.toEqual(expect.objectContaining({ slug: 'daily-routines' }));
    expect(prisma.contentTag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'TOPIC',
          slug: 'daily-routines',
        }),
      }),
    );
  });

  it('sets tags only when all requested tags are active', async () => {
    prisma.lesson.findUnique
      .mockResolvedValueOnce({ id: 'lesson-1', status: 'DRAFT' })
      .mockResolvedValueOnce({ id: 'lesson-1', tags: [] });
    prisma.contentTag.findMany.mockResolvedValue([{ id: 'tag-1' }]);

    await expect(
      service.setLessonTags(
        'lesson-1',
        { tagIds: ['tag-1', 'missing-tag'] },
        admin,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.lessonTag.deleteMany).not.toHaveBeenCalled();
  });

  it('deletes tags by hiding them instead of removing lesson history', async () => {
    prisma.contentTag.update.mockResolvedValue({
      id: 'tag-1',
      slug: 'daily-routines',
      name: 'Daily routines',
      kind: 'TOPIC',
      isActive: false,
      _count: { lessons: 3 },
    });

    await service.archiveTag('tag-1', admin);

    expect(prisma.contentTag.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tag-1' },
        data: { isActive: false },
      }),
    );
  });
});
