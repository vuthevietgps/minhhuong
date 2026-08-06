import { AuthOperationalControlUnavailableError } from './auth-operational-control';
import { PrismaAuthOperationalControl } from './prisma-auth-operational-control';

const keySecret = 'local-prisma-auth-control-test-secret-0001';

const buildPrismaMock = () => {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
    authRateLimitAttempt: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    authOperationalMetricBucket: {
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      groupBy: jest.fn().mockResolvedValue([]),
    },
  };
  const prisma = {
    ...tx,
    $transaction: jest.fn((task: (client: typeof tx) => unknown) => task(tx)),
  };
  return { prisma, tx };
};

describe('PrismaAuthOperationalControl', () => {
  it('persists only an HMAC rate key and records the admission atomically', async () => {
    const { prisma, tx } = buildPrismaMock();
    const control = new PrismaAuthOperationalControl(prisma as never, {
      keySecret,
      clock: () => new Date('2026-07-10T05:00:00.000Z'),
    });

    await control.assertRateLimit({
      surface: 'LOGIN',
      key: 'Parent@Example.Test',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.authRateLimitAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        surface: 'LOGIN',
        keyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    });
    const persisted = tx.authRateLimitAttempt.create.mock.calls[0][0];
    expect(JSON.stringify(persisted)).not.toContain('parent@example.test');
    expect(tx.authOperationalMetricBucket.upsert).toHaveBeenCalledTimes(1);
  });

  it('surfaces repository outage as a fail-closed control error', async () => {
    const { prisma } = buildPrismaMock();
    prisma.$transaction.mockRejectedValueOnce(new Error('repository down'));
    const control = new PrismaAuthOperationalControl(prisma as never, {
      keySecret,
    });

    await expect(
      control.assertRateLimit({ surface: 'REFRESH', key: 'opaque-token' }),
    ).rejects.toBeInstanceOf(AuthOperationalControlUnavailableError);
  });

  it('deletes only expired rate attempts and metric buckets', async () => {
    const { prisma, tx } = buildPrismaMock();
    tx.authRateLimitAttempt.deleteMany.mockResolvedValueOnce({ count: 3 });
    tx.authOperationalMetricBucket.deleteMany.mockResolvedValueOnce({
      count: 2,
    });
    const control = new PrismaAuthOperationalControl(prisma as never, {
      keySecret,
    });
    const now = new Date('2026-07-10T06:00:00.000Z');

    await expect(control.cleanupExpired(now)).resolves.toEqual({
      expiredRateLimitAttempts: 3,
      expiredMetricBuckets: 2,
    });
    expect(tx.authRateLimitAttempt.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lte: now } },
    });
    expect(tx.authOperationalMetricBucket.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lte: now } },
    });
  });

  it('rejects a missing or short HMAC key secret', () => {
    const { prisma } = buildPrismaMock();
    expect(
      () =>
        new PrismaAuthOperationalControl(prisma as never, {
          keySecret: 'too-short',
        }),
    ).toThrow('at least 32 characters');
  });
});
