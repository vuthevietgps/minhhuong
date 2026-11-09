import { createActivationOrdersServiceForTest } from '../activation-orders/activation-orders.testing';

const opsUser = {
  sub: 'ops-1',
  email: 'ops@example.com',
  roles: ['OPERATIONS'],
};

const saleUser = {
  sub: 'sale-1',
  email: 'sale@example.com',
  roles: ['SALE'],
};

const proofFile = (name = 'proof.pdf') =>
  ({
    filename: name,
    originalname: name,
    mimetype: 'application/pdf',
    size: 1024,
  }) as any;

describe('package entitlement order snapshot flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('captures self-service order snapshots from package entitlements', async () => {
    const { prisma, service } = createService();
    prisma.activationPackage.findMany.mockResolvedValue([
      packageWithEntitlements(),
    ]);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'parent-1',
      email: 'p@example.com',
    });
    prisma.childProfile.findFirst.mockResolvedValue(null);
    prisma.childProfile.upsert.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'order-1', ...data }),
    );

    await service.createSelfServiceOrder({
      email: 'p@example.com',
      password: 'Password123!',
      displayName: 'Child',
      packageCode: 'basic-30',
    });

    expect(snapshotFromCreate(prisma)).toEqual(
      expect.objectContaining({
        packageId: 'pkg-1',
        packageCode: 'basic-30',
        packageName: 'Basic 30',
        packageVersion: 2,
        amountVnd: 100000,
        durationDays: 30,
        snapshotSource: 'PACKAGE_ENTITLEMENT',
        entitlements: [
          { key: 'AI_MESSAGES_PER_MONTH', value: { limit: 500 } },
          { key: 'COURSE_ACCESS', value: { mode: 'ALL_ACTIVE' } },
        ],
      }),
    );
  });

  it('captures package identity even when no entitlement rows exist yet', async () => {
    const { prisma, service } = createService();
    prisma.activationPackage.findMany.mockResolvedValue([
      packageWithEntitlements({ entitlements: [] }),
    ]);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'parent-1',
      email: 'p@example.com',
    });
    prisma.childProfile.findFirst.mockResolvedValue(null);
    prisma.childProfile.upsert.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'order-1', ...data }),
    );

    await service.createSelfServiceOrder({
      email: 'p@example.com',
      password: 'Password123!',
      displayName: 'Child',
      packageCode: 'basic-30',
    });

    expect(snapshotFromCreate(prisma)).toEqual(
      expect.objectContaining({
        packageId: 'pkg-1',
        entitlements: [],
        snapshotSource: 'PACKAGE_ENTITLEMENT',
      }),
    );
  });

  it('captures sale-assisted override amount and duration', async () => {
    const { prisma, service } = createService();
    prisma.activationOrder.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'learner-1',
      email: 'learner@example.com',
    });
    prisma.activationPackage.findUnique.mockResolvedValue(
      packageWithEntitlements(),
    );
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'order-2', ...data }),
    );

    await service.createOrder(
      {
        email: 'learner@example.com',
        amountVnd: 125000,
        packageCode: 'basic-30',
        requestedDurationDays: 45,
      },
      proofFile('sale-invoice.pdf'),
      saleUser as any,
    );

    expect(snapshotFromCreate(prisma)).toEqual(
      expect.objectContaining({
        amountVnd: 125000,
        durationDays: 45,
        snapshotSource: 'PACKAGE_ENTITLEMENT',
      }),
    );
  });

  it('captures custom sale-assisted fallback when package cannot resolve', async () => {
    const { prisma, service } = createService();
    prisma.activationOrder.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'learner-1',
      email: 'learner@example.com',
    });
    prisma.activationPackage.findUnique.mockResolvedValue(null);
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'order-2', ...data }),
    );

    await service.createOrder(
      {
        email: 'learner@example.com',
        amountVnd: 250000,
        packageCode: 'custom-60',
        packageName: 'Custom 60',
        requestedDurationDays: 60,
      },
      proofFile('sale-invoice.pdf'),
      saleUser as any,
    );

    expect(snapshotFromCreate(prisma)).toEqual(
      expect.objectContaining({
        customPackage: true,
        packageCode: 'custom-60',
        packageName: 'Custom 60',
        amountVnd: 250000,
        durationDays: 60,
        entitlements: [],
        snapshotSource: 'LEGACY_ORDER_FIELDS',
      }),
    );
  });

  it('copies the immutable order snapshot to subscription on approval', async () => {
    const { prisma, service } = createService();
    const soldSnapshot = {
      packageId: 'pkg-1',
      packageCode: 'basic-30',
      packageName: 'Basic 30',
      packageVersion: 2,
      amountVnd: 100000,
      durationDays: 30,
      entitlements: [{ key: 'AI_MESSAGES_PER_MONTH', value: { limit: 500 } }],
      capturedAt: '2026-06-14T00:00:00.000Z',
      snapshotSource: 'PACKAGE_ENTITLEMENT',
    };
    prisma.activationPackage.findUnique.mockResolvedValue(
      packageWithEntitlements({
        version: 3,
        entitlements: [
          {
            entitlementKey: 'AI_MESSAGES_PER_MONTH',
            valueJson: { limit: 999 },
            status: 'ACTIVE',
          },
        ],
      }),
    );
    prisma.activationOrder.findUnique.mockResolvedValue(
      pendingOrder({ entitlementSnapshotJson: soldSnapshot }),
    );
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...pendingOrder({ entitlementSnapshotJson: soldSnapshot }),
      status: 'APPROVED',
    });

    await service.approveOrder(
      'order-1',
      { durationDays: 30 },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entitlementSnapshotJson: soldSnapshot,
        }),
      }),
    );
    expect(prisma.__tx.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entitlementSnapshotJson: soldSnapshot,
        }),
      }),
    );
  });

  it('reconstructs legacy fallback snapshot on approval when order snapshot is null', async () => {
    const { prisma, service } = createService();
    prisma.activationPackage.findUnique.mockResolvedValue(
      packageWithEntitlements(),
    );
    prisma.activationOrder.findUnique.mockResolvedValue(
      pendingOrder({ entitlementSnapshotJson: null }),
    );
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...pendingOrder({ entitlementSnapshotJson: null }),
      status: 'APPROVED',
    });

    await service.approveOrder(
      'order-1',
      { durationDays: 30 },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    const subscriptionSnapshot =
      prisma.__tx.subscription.create.mock.calls[0][0].data
        .entitlementSnapshotJson;
    expect(subscriptionSnapshot).toEqual(
      expect.objectContaining({
        packageId: 'pkg-1',
        packageCode: 'basic-30',
        packageName: 'Basic 30',
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [],
        snapshotSource: 'LEGACY_ORDER_FIELDS',
      }),
    );
  });
});

function createService() {
  const tx = {
    user: { update: jest.fn().mockResolvedValue({ id: 'parent-1' }) },
    payment: { create: jest.fn().mockResolvedValue({ id: 'payment-1' }) },
    subscription: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'subscription-1' }),
    },
    walletLedgerEntry: {
      create: jest.fn().mockResolvedValue({ id: 'wallet-1' }),
    },
    activationOrder: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn().mockResolvedValue({ id: 'history-1' }),
    },
    idempotencyRecord: {
      create: jest.fn().mockResolvedValue({ id: 'idem-1' }),
      update: jest.fn().mockResolvedValue({ id: 'idem-1' }),
    },
    commissionEarning: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
    },
    channelParticipant: {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    commissionLedgerEntry: {
      create: jest.fn().mockResolvedValue({ id: 'ledger-1' }),
    },
  };
  const prisma = {
    activationPackage: {
      findMany: jest.fn().mockResolvedValue([packageWithEntitlements()]),
      findUnique: jest.fn().mockResolvedValue(packageWithEntitlements()),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: { upsert: jest.fn() },
    userRole: { upsert: jest.fn() },
    childProfile: {
      findFirst: jest.fn().mockResolvedValue(null),
      upsert: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'child-1' }),
    },
    activationOrder: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    idempotencyRecord: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    channelParticipant: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    agency: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    agencyMember: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    plan: {
      upsert: jest.fn().mockResolvedValue({ id: 'manual-plan-1' }),
    },
    subscription: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    },
    $transaction: jest.fn((callback: (txArg: typeof tx) => unknown) =>
      callback(tx),
    ),
    __tx: tx,
  };
  const notifications = {
    sendOrderCreated: jest.fn(),
    sendOrderApproved: jest.fn(),
    sendOrderRejected: jest.fn(),
    sendOrderRevoked: jest.fn(),
  };

  return {
    prisma,
    notifications,
    service: createActivationOrdersServiceForTest(
      prisma as any,
      notifications as any,
    ),
  };
}

function packageWithEntitlements(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pkg-1',
    code: 'basic-30',
    name: 'Basic 30',
    version: 2,
    amountVnd: 100000,
    durationDays: 30,
    isActive: true,
    entitlements: [
      {
        entitlementKey: 'COURSE_ACCESS',
        valueJson: { mode: 'ALL_ACTIVE' },
        status: 'ACTIVE',
      },
      {
        entitlementKey: 'AI_MESSAGES_PER_MONTH',
        valueJson: { limit: 500 },
        status: 'ACTIVE',
      },
    ],
    ...overrides,
  };
}

function pendingOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    source: 'SELF_SERVICE',
    status: 'PENDING_REVIEW',
    userId: 'parent-1',
    childProfileId: 'child-1',
    createdById: null,
    channelParticipantId: null,
    agencyId: null,
    referrerMemberId: null,
    customerEmail: 'parent@example.com',
    packageCode: 'basic-30',
    packageName: 'Basic 30',
    amountCents: 10000000,
    currency: 'VND',
    requestedDurationDays: 30,
    entitlementSnapshotJson: null,
    user: {
      id: 'parent-1',
      email: 'parent@example.com',
      profile: { displayName: 'Parent' },
    },
    createdBy: null,
    referrerMember: null,
    agency: null,
    channelParticipant: null,
    commissionEarnings: [],
    ...overrides,
  };
}

function snapshotFromCreate(
  prisma: ReturnType<typeof createService>['prisma'],
) {
  return prisma.activationOrder.create.mock.calls[0][0].data
    .entitlementSnapshotJson;
}
