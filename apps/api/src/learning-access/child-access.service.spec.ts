import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChildAccessService } from './child-access.service';

describe('ChildAccessService', () => {
  const prisma = {
    childProfile: {
      findUnique: jest.fn(),
    },
  };
  const service = new ChildAccessService(prisma as any);
  const parent = {
    sub: 'parent-1',
    email: 'parent@example.com',
    roles: ['PARENT'],
  } as any;
  const otherParent = {
    sub: 'parent-2',
    email: 'other@example.com',
    roles: ['PARENT'],
  } as any;
  const admin = {
    sub: 'admin-1',
    email: 'admin@example.com',
    roles: ['ADMIN'],
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('allows a parent to access an owned child profile', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });

    await expect(
      service.assertCanAccessChild(parent, 'child-1'),
    ).resolves.toEqual({
      id: 'child-1',
      parentId: 'parent-1',
    });
  });

  it('blocks parent A from accessing child B', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });

    await expect(
      service.assertCanAccessChild(otherParent, 'child-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('does not allow staff bypass unless explicitly requested', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });

    await expect(
      service.assertCanAccessChild(admin, 'child-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('allows explicit admin/support bypass for guarded internal routes', async () => {
    prisma.childProfile.findUnique.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });

    await expect(
      service.assertCanAccessChild(admin, 'child-1', { allowStaff: true }),
    ).resolves.toEqual({
      id: 'child-1',
      parentId: 'parent-1',
    });
  });

  it('requires a childProfileId', async () => {
    await expect(service.assertCanAccessChild(parent, '')).rejects.toThrow(
      BadRequestException,
    );
  });
});
