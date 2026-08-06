import { ChannelAdminService } from './channel-admin.service';

describe('ChannelAdminService', () => {
  const tx = {
    activationPackage: {
      update: jest.fn(),
    },
    packageEntitlement: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const prisma = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    activationPackage: {
      findUnique: jest.fn(),
    },
    packageEntitlement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback: (txArg: typeof tx) => unknown) =>
      callback(tx),
    ),
    __tx: tx,
  };
  const service = new ChannelAdminService(prisma as any);
  const admin = {
    sub: 'admin-1',
    email: 'admin@example.com',
    roles: ['ADMIN'],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.activationPackage.findUnique.mockResolvedValue({ id: 'pkg-1' });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    prisma.$transaction.mockImplementation(
      (callback: (txArg: typeof tx) => unknown) => callback(tx),
    );
  });

  it('returns a cursor page for large user lists', async () => {
    prisma.user.count.mockResolvedValue(101);
    prisma.user.findMany.mockResolvedValue(
      Array.from({ length: 4 }, (_, index) => ({
        id: `user-${index + 1}`,
        email: `user-${index + 1}@example.com`,
      })),
    );

    await expect(
      service.listUsers(admin, {
        limit: 3,
        q: 'sale',
        status: 'ACTIVE' as any,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        total: 101,
        limit: 3,
        nextCursor: 'user-3',
        items: [
          expect.objectContaining({ id: 'user-1' }),
          expect.objectContaining({ id: 'user-2' }),
          expect.objectContaining({ id: 'user-3' }),
        ],
      }),
    );
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 4,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('uses cursor skip when loading the next page', async () => {
    prisma.user.count.mockResolvedValue(3);
    prisma.user.findMany.mockResolvedValue([
      { id: 'user-2', email: 'user-2@example.com' },
      { id: 'user-3', email: 'user-3@example.com' },
    ]);

    await service.listUsers(admin, { limit: 2, cursor: 'user-1' });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: 'user-1' },
        skip: 1,
        take: 3,
      }),
    );
  });

  it('creates package entitlement rows and bumps package version', async () => {
    tx.packageEntitlement.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'ent-1', ...data }),
    );
    tx.activationPackage.update.mockResolvedValue({ id: 'pkg-1', version: 2 });

    await expect(
      service.createPackageEntitlement(
        'pkg-1',
        {
          entitlementKey: 'course_access',
          valueJson: { mode: 'ALL_ACTIVE' },
        } as any,
        admin,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'ent-1',
        packageId: 'pkg-1',
        entitlementKey: 'COURSE_ACCESS',
        status: 'ACTIVE',
      }),
    );
    expect(tx.activationPackage.update).toHaveBeenCalledWith({
      where: { id: 'pkg-1' },
      data: { version: { increment: 1 } },
    });
  });

  it('updates package entitlement rows in package scope', async () => {
    prisma.packageEntitlement.findFirst.mockResolvedValue({
      id: 'ent-1',
      packageId: 'pkg-1',
    });
    tx.packageEntitlement.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'ent-1', ...data }),
    );
    tx.activationPackage.update.mockResolvedValue({ id: 'pkg-1', version: 3 });

    await service.updatePackageEntitlement(
      'pkg-1',
      'ent-1',
      {
        valueJson: { limit: 500 },
        status: 'INACTIVE',
      } as any,
      admin,
    );

    expect(tx.packageEntitlement.update).toHaveBeenCalledWith({
      where: { id: 'ent-1' },
      data: {
        valueJson: { limit: 500 },
        status: 'INACTIVE',
      },
    });
    expect(tx.activationPackage.update).toHaveBeenCalledWith({
      where: { id: 'pkg-1' },
      data: { version: { increment: 1 } },
    });
  });
});
