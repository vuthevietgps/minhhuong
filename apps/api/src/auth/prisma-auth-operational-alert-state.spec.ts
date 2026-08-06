import { AuthOperationalAlertStateUnavailableError } from './auth-operational-alert-state';
import { PrismaAuthOperationalAlertState } from './prisma-auth-operational-alert-state';

const buildPrismaMock = () => {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ locked: false }]),
    authOperationalAlertState: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    authOperationalAlertEvaluationAudit: {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };
  const prisma = {
    ...tx,
    $transaction: jest.fn((task: (client: typeof tx) => unknown) => task(tx)),
  };
  return { prisma, tx };
};

const candidate = {
  alertCode: 'LOGIN_THROTTLE_THRESHOLD' as const,
  fingerprint: 'auth-operational-alert:LOGIN_THROTTLE_THRESHOLD',
  cooldownMs: 15 * 60 * 1000,
};
const correlationId =
  'auth-alert-evaluation:00000000-0000-4000-8000-000000000101';
const persistedAuditRow = (input?: {
  correlationId?: string;
  evaluatedAt?: Date;
}) => ({
  correlationId: input?.correlationId ?? correlationId,
  inputDigest: 'a'.repeat(64),
  evaluatedAt: input?.evaluatedAt ?? new Date('2026-07-10T06:00:00.000Z'),
  decision: 'ALERT_CANDIDATES_OPEN',
  candidateCount: 1,
  openCandidateCount: 1,
  suppressedCandidateCount: 0,
  decisionsJson: [
    {
      alertCode: candidate.alertCode,
      fingerprint: candidate.fingerprint,
      decision: 'OPEN',
      cooldownUntil: '2026-07-10T06:15:00.000Z',
    },
  ],
  expiresAt: new Date('2026-08-09T06:00:00.000Z'),
  createdAt: new Date('2026-07-10T06:00:00.000Z'),
});

describe('PrismaAuthOperationalAlertState', () => {
  it('serializes and persists one redacted open decision atomically', async () => {
    const { prisma, tx } = buildPrismaMock();
    const state = new PrismaAuthOperationalAlertState(prisma as never);
    const evaluatedAt = new Date('2026-07-10T06:00:00.000Z');

    const result = await state.evaluate({
      correlationId,
      evaluatedAt,
      candidates: [candidate],
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.authOperationalAlertState.upsert).toHaveBeenCalledWith({
      where: { fingerprint: candidate.fingerprint },
      create: expect.objectContaining({
        fingerprint: candidate.fingerprint,
        alertCode: candidate.alertCode,
        lastOpenedAt: evaluatedAt,
      }),
      update: expect.objectContaining({
        alertCode: candidate.alertCode,
        lastOpenedAt: evaluatedAt,
      }),
    });
    expect(tx.authOperationalAlertEvaluationAudit.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        correlationId,
        inputDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
        decision: 'ALERT_CANDIDATES_OPEN',
        candidateCount: 1,
        openCandidateCount: 1,
        suppressedCandidateCount: 0,
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        sharedState: true,
        decisions: [expect.objectContaining({ decision: 'OPEN' })],
        audit: expect.objectContaining({
          correlationId,
          appendOnly: true,
          redacted: true,
          persisted: true,
          idempotentReplay: false,
        }),
      }),
    );
    expect(
      JSON.stringify(tx.authOperationalAlertState.upsert.mock.calls),
    ).not.toContain('@example.test');
  });

  it('suppresses a candidate while the shared cooldown remains active', async () => {
    const { prisma, tx } = buildPrismaMock();
    const evaluatedAt = new Date('2026-07-10T06:01:00.000Z');
    tx.authOperationalAlertState.findMany.mockResolvedValueOnce([
      {
        fingerprint: candidate.fingerprint,
        alertCode: candidate.alertCode,
        lastOpenedAt: new Date('2026-07-10T06:00:00.000Z'),
        cooldownUntil: new Date('2026-07-10T06:15:00.000Z'),
        expiresAt: new Date('2026-07-10T06:15:00.000Z'),
        updatedAt: new Date('2026-07-10T06:00:00.000Z'),
      },
    ]);
    const state = new PrismaAuthOperationalAlertState(prisma as never);

    const result = await state.evaluate({
      correlationId:
        'auth-alert-evaluation:00000000-0000-4000-8000-000000000102',
      evaluatedAt,
      candidates: [candidate],
    });

    expect(result.decisions).toEqual([
      expect.objectContaining({
        decision: 'SUPPRESSED_COOLDOWN',
        cooldownUntil: '2026-07-10T06:15:00.000Z',
      }),
    ]);
    expect(tx.authOperationalAlertState.upsert).not.toHaveBeenCalled();
  });

  it('returns the persisted decision without rewriting an idempotent correlation', async () => {
    const { prisma, tx } = buildPrismaMock();
    const evaluatedAt = new Date('2026-07-10T06:00:00.000Z');
    const state = new PrismaAuthOperationalAlertState(prisma as never);
    const first = await state.evaluate({
      correlationId,
      evaluatedAt,
      candidates: [candidate],
    });
    tx.authOperationalAlertEvaluationAudit.findUnique.mockResolvedValueOnce({
      correlationId,
      inputDigest:
        tx.authOperationalAlertEvaluationAudit.create.mock.calls[0][0].data
          .inputDigest,
      evaluatedAt,
      decision: 'ALERT_CANDIDATES_OPEN',
      candidateCount: 1,
      openCandidateCount: 1,
      suppressedCandidateCount: 0,
      decisionsJson: first.decisions,
      expiresAt: new Date('2026-08-09T06:00:00.000Z'),
      createdAt: evaluatedAt,
    });

    const replay = await state.evaluate({
      correlationId,
      evaluatedAt,
      candidates: [candidate],
    });

    expect(replay.decisions).toEqual(first.decisions);
    expect(replay.audit.idempotentReplay).toBe(true);
    expect(tx.authOperationalAlertEvaluationAudit.create).toHaveBeenCalledTimes(
      1,
    );
    expect(tx.authOperationalAlertState.upsert).toHaveBeenCalledTimes(1);
  });

  it('looks up one retained correlation without exposing digest or fingerprint fields', async () => {
    const { prisma, tx } = buildPrismaMock();
    const now = new Date('2026-07-10T06:05:00.000Z');
    tx.authOperationalAlertEvaluationAudit.findFirst.mockResolvedValueOnce(
      persistedAuditRow(),
    );
    const state = new PrismaAuthOperationalAlertState(prisma as never);

    const result = await state.findEvaluationAudit({ correlationId, now });

    expect(
      tx.authOperationalAlertEvaluationAudit.findFirst,
    ).toHaveBeenCalledWith({
      where: { correlationId, expiresAt: { gt: now } },
    });
    expect(result).toEqual(
      expect.objectContaining({
        correlationId,
        persisted: true,
        redacted: true,
        decisions: [
          {
            alertCode: candidate.alertCode,
            decision: 'OPEN',
            cooldownUntil: '2026-07-10T06:15:00.000Z',
          },
        ],
      }),
    );
    expect(JSON.stringify(result)).not.toContain('inputDigest');
    expect(JSON.stringify(result)).not.toContain('fingerprint');
  });

  it('reads a deterministic retained incident page with a compound cursor', async () => {
    const { prisma, tx } = buildPrismaMock();
    const windowStartedAt = new Date('2026-07-10T05:00:00.000Z');
    const windowEndedAt = new Date('2026-07-10T07:00:00.000Z');
    const now = new Date('2026-07-10T06:05:00.000Z');
    const cursor = {
      evaluatedAt: new Date('2026-07-10T06:00:00.000Z'),
      correlationId:
        'auth-alert-evaluation:00000000-0000-4000-8000-000000000103',
    };
    tx.authOperationalAlertEvaluationAudit.findMany.mockResolvedValueOnce([
      persistedAuditRow({
        correlationId:
          'auth-alert-evaluation:00000000-0000-4000-8000-000000000102',
      }),
      persistedAuditRow({
        correlationId:
          'auth-alert-evaluation:00000000-0000-4000-8000-000000000101',
      }),
    ]);
    const state = new PrismaAuthOperationalAlertState(prisma as never);

    const result = await state.listEvaluationAudits({
      windowStartedAt,
      windowEndedAt,
      cursor,
      limit: 1,
      now,
    });

    expect(
      tx.authOperationalAlertEvaluationAudit.findMany,
    ).toHaveBeenCalledWith({
      where: {
        evaluatedAt: { gte: windowStartedAt, lte: windowEndedAt },
        expiresAt: { gt: now },
        OR: [
          { evaluatedAt: { lt: cursor.evaluatedAt } },
          {
            evaluatedAt: cursor.evaluatedAt,
            correlationId: { lt: cursor.correlationId },
          },
        ],
      },
      orderBy: [{ evaluatedAt: 'desc' }, { correlationId: 'desc' }],
      take: 2,
    });
    expect(result.hasMore).toBe(true);
    expect(result.items).toHaveLength(1);
  });

  it('deletes only expired state and fails closed on repository outage', async () => {
    const { prisma, tx } = buildPrismaMock();
    const state = new PrismaAuthOperationalAlertState(prisma as never);
    const now = new Date('2026-07-10T06:00:00.000Z');
    tx.authOperationalAlertState.deleteMany.mockResolvedValueOnce({ count: 2 });
    tx.authOperationalAlertEvaluationAudit.deleteMany.mockResolvedValueOnce({
      count: 3,
    });

    await expect(state.cleanupExpired(now)).resolves.toEqual({
      expiredAlertStates: 2,
      expiredEvaluationAudits: 3,
    });
    expect(tx.authOperationalAlertState.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lte: now } },
    });
    expect(
      tx.authOperationalAlertEvaluationAudit.deleteMany,
    ).toHaveBeenCalledWith({ where: { expiresAt: { lte: now } } });

    prisma.$transaction.mockRejectedValueOnce(new Error('repository down'));
    await expect(
      state.evaluate({
        correlationId:
          'auth-alert-evaluation:00000000-0000-4000-8000-000000000103',
        evaluatedAt: now,
        candidates: [],
      }),
    ).rejects.toBeInstanceOf(AuthOperationalAlertStateUnavailableError);
    tx.authOperationalAlertEvaluationAudit.findFirst.mockRejectedValueOnce(
      new Error('repository down'),
    );
    await expect(
      state.findEvaluationAudit({ correlationId, now }),
    ).rejects.toBeInstanceOf(AuthOperationalAlertStateUnavailableError);
    tx.authOperationalAlertEvaluationAudit.findMany.mockRejectedValueOnce(
      new Error('repository down'),
    );
    await expect(
      state.listEvaluationAudits({
        windowStartedAt: new Date(now.getTime() - 60_000),
        windowEndedAt: now,
        limit: 10,
        now,
      }),
    ).rejects.toBeInstanceOf(AuthOperationalAlertStateUnavailableError);
  });

  it('fails closed when append-only audit creation fails', async () => {
    const { prisma, tx } = buildPrismaMock();
    tx.authOperationalAlertEvaluationAudit.create.mockRejectedValueOnce(
      new Error('audit unavailable'),
    );
    const state = new PrismaAuthOperationalAlertState(prisma as never);

    await expect(
      state.evaluate({
        correlationId:
          'auth-alert-evaluation:00000000-0000-4000-8000-000000000104',
        evaluatedAt: new Date('2026-07-10T06:00:00.000Z'),
        candidates: [candidate],
      }),
    ).rejects.toBeInstanceOf(AuthOperationalAlertStateUnavailableError);
  });
});
