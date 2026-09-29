import { ForbiddenException } from '@nestjs/common';
import { EntitlementService } from './entitlement.service';

describe('EntitlementService', () => {
  const prisma = {
    subscription: {
      findFirst: jest.fn(),
    },
    childProfile: {
      findUnique: jest.fn(),
    },
  };
  const service = new EntitlementService(prisma as any);
  const originalAiChatFlag = process.env.AI_CHAT_MOCK_ENABLED;
  const originalAiProvider = process.env.AI_PROVIDER;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.AI_CHAT_MOCK_ENABLED;
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    prisma.childProfile.findUnique.mockResolvedValue({
      screenTime: {
        isEnabled: true,
        dailyLimitMinutes: 45,
      },
    });
  });

  afterAll(() => {
    if (originalAiChatFlag === undefined) {
      delete process.env.AI_CHAT_MOCK_ENABLED;
    } else {
      process.env.AI_CHAT_MOCK_ENABLED = originalAiChatFlag;
    }
    if (originalAiProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalAiProvider;
    }
    if (originalOpenAiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAiKey;
    }
  });

  it('denies protected capability without an active subscription', async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);

    await expect(
      service.assertCapability('child-1', 'practice'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows video and practice with an active subscription', async () => {
    prisma.subscription.findFirst.mockResolvedValue(activeSubscription());

    await expect(service.assertCapability('child-1', 'video')).resolves.toEqual(
      expect.objectContaining({
        capabilities: expect.objectContaining({
          video: true,
          practice: true,
          aiChat: false,
          maxDailyMinutes: 45,
        }),
      }),
    );
    await expect(
      service.assertCapability('child-1', 'practice'),
    ).resolves.toEqual(
      expect.objectContaining({
        hasActiveSubscription: true,
      }),
    );
  });

  it('allows active legacy subscriptions with null trace fields', async () => {
    prisma.subscription.findFirst.mockResolvedValue(
      activeSubscription({
        sourceOrderId: null,
        activationPackageId: null,
        entitlementSnapshotJson: null,
      }),
    );

    await expect(
      service.assertCapability('child-1', 'practice'),
    ).resolves.toEqual(
      expect.objectContaining({
        hasActiveSubscription: true,
        subscription: expect.objectContaining({
          id: 'sub-1',
          entitlementSnapshot: null,
        }),
      }),
    );
  });

  it('allows active traced subscriptions with a snapshot', async () => {
    const snapshot = {
      packageId: 'pkg-1',
      packageCode: 'basic-30',
      packageName: 'Basic 30',
      packageVersion: 2,
      amountVnd: 100000,
      durationDays: 30,
      entitlements: [{ key: 'COURSE_ACCESS', value: { mode: 'ALL_ACTIVE' } }],
      capturedAt: '2026-06-14T00:00:00.000Z',
      snapshotSource: 'PACKAGE_ENTITLEMENT',
    };
    prisma.subscription.findFirst.mockResolvedValue(
      activeSubscription({
        sourceOrderId: 'order-1',
        activationPackageId: 'pkg-1',
        entitlementSnapshotJson: snapshot,
      }),
    );

    await expect(service.assertCapability('child-1', 'video')).resolves.toEqual(
      expect.objectContaining({
        hasActiveSubscription: true,
        subscription: expect.objectContaining({
          entitlementSnapshot: snapshot,
        }),
        capabilities: expect.objectContaining({
          video: true,
          practice: true,
        }),
      }),
    );
  });

  it('keeps expired and canceled subscriptions outside the active access query', async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);

    await expect(
      service.assertCapability('child-1', 'practice'),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['TRIALING', 'ACTIVE'] },
          currentPeriodStart: { lte: expect.any(Date) },
          currentPeriodEnd: { gt: expect.any(Date) },
        }),
      }),
    );
  });

  it('keeps aiChat disabled by default even when subscription is active', async () => {
    prisma.subscription.findFirst.mockResolvedValue(activeSubscription());

    await expect(service.assertCapability('child-1', 'aiChat')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows aiChat only when mock/dev mode is explicitly enabled', async () => {
    process.env.AI_CHAT_MOCK_ENABLED = 'true';
    prisma.subscription.findFirst.mockResolvedValue(activeSubscription());

    await expect(
      service.assertCapability('child-1', 'aiChat'),
    ).resolves.toEqual(
      expect.objectContaining({
        capabilities: expect.objectContaining({
          aiChat: true,
        }),
      }),
    );
  });

  it('allows aiChat when OpenAI is explicitly configured server-side', async () => {
    process.env.AI_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'server-only-key';
    prisma.subscription.findFirst.mockResolvedValue(activeSubscription());

    await expect(
      service.assertCapability('child-1', 'aiChat'),
    ).resolves.toEqual(
      expect.objectContaining({
        capabilities: expect.objectContaining({ aiChat: true }),
      }),
    );
  });

  function activeSubscription(overrides: Record<string, unknown> = {}) {
    return {
      id: 'sub-1',
      status: 'ACTIVE',
      currentPeriodEnd: new Date('2026-12-31T00:00:00.000Z'),
      plan: {
        code: 'monthly',
        name: 'Monthly',
      },
      ...overrides,
    };
  }
});
