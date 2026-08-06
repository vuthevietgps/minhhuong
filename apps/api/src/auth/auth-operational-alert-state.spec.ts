import {
  AuthOperationalAlertStateUnavailableError,
  FixtureBackedAuthOperationalAlertState,
} from './auth-operational-alert-state';

const candidates = [
  {
    alertCode: 'LOGIN_THROTTLE_THRESHOLD' as const,
    fingerprint: 'auth-operational-alert:LOGIN_THROTTLE_THRESHOLD',
    cooldownMs: 15 * 60 * 1000,
  },
  {
    alertCode: 'REFRESH_REPLAY_DETECTED' as const,
    fingerprint: 'auth-operational-alert:REFRESH_REPLAY_DETECTED',
    cooldownMs: 60 * 60 * 1000,
  },
];

const correlationId = (suffix: string) =>
  `auth-alert-evaluation:00000000-0000-4000-8000-${suffix.padStart(12, '0')}`;

describe('FixtureBackedAuthOperationalAlertState', () => {
  it('opens once, suppresses inside cooldown, and reopens afterward', async () => {
    const state = new FixtureBackedAuthOperationalAlertState();
    const startedAt = new Date('2026-07-10T06:00:00.000Z');

    const opened = await state.evaluate({
      correlationId: correlationId('1'),
      evaluatedAt: startedAt,
      candidates,
    });
    const suppressed = await state.evaluate({
      correlationId: correlationId('2'),
      evaluatedAt: new Date(startedAt.getTime() + 60_000),
      candidates,
    });
    const reopened = await state.evaluate({
      correlationId: correlationId('3'),
      evaluatedAt: new Date(startedAt.getTime() + 61 * 60_000),
      candidates,
    });

    expect(opened.decisions.every((row) => row.decision === 'OPEN')).toBe(true);
    expect(
      suppressed.decisions.every(
        (row) => row.decision === 'SUPPRESSED_COOLDOWN',
      ),
    ).toBe(true);
    expect(reopened.decisions.every((row) => row.decision === 'OPEN')).toBe(
      true,
    );
    expect(opened.audit).toEqual(
      expect.objectContaining({
        appendOnly: true,
        redacted: true,
        idempotentReplay: false,
      }),
    );
  });

  it('keeps one append-only redacted audit row for an idempotent correlation', async () => {
    const state = new FixtureBackedAuthOperationalAlertState();
    const input = {
      correlationId: correlationId('4'),
      evaluatedAt: new Date('2026-07-10T06:00:00.000Z'),
      candidates,
    };

    const first = await state.evaluate(input);
    const replay = await state.evaluate(input);

    expect(replay.decisions).toEqual(first.decisions);
    expect(replay.audit).toEqual(
      expect.objectContaining({
        correlationId: input.correlationId,
        idempotentReplay: true,
        appendOnly: true,
        redacted: true,
      }),
    );
    await expect(
      state.evaluate({
        ...input,
        evaluatedAt: new Date('2026-07-10T06:01:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(AuthOperationalAlertStateUnavailableError);
  });

  it('deletes only state whose cooldown has expired', async () => {
    const now = new Date('2026-07-10T06:00:00.000Z');
    const state = new FixtureBackedAuthOperationalAlertState({
      auditRetentionMs: 30 * 60 * 1000,
    });
    await state.evaluate({
      correlationId: correlationId('5'),
      evaluatedAt: new Date(now.getTime() - 61 * 60_000),
      candidates,
    });
    await state.evaluate({
      correlationId: correlationId('6'),
      evaluatedAt: now,
      candidates: [candidates[0]],
    });

    await expect(state.cleanupExpired(now)).resolves.toEqual({
      expiredAlertStates: 1,
      expiredEvaluationAudits: 1,
    });
    await expect(
      state.evaluate({
        correlationId: correlationId('7'),
        evaluatedAt: new Date(now.getTime() + 60_000),
        candidates: [candidates[0]],
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        decisions: [
          expect.objectContaining({ decision: 'SUPPRESSED_COOLDOWN' }),
        ],
      }),
    );
  });

  it('fails closed when the state or append-only audit provider is unavailable', async () => {
    const state = new FixtureBackedAuthOperationalAlertState({
      unavailable: true,
    });
    await expect(
      state.evaluate({
        correlationId: correlationId('8'),
        evaluatedAt: new Date(),
        candidates: [],
      }),
    ).rejects.toBeInstanceOf(AuthOperationalAlertStateUnavailableError);
    await expect(state.cleanupExpired()).rejects.toBeInstanceOf(
      AuthOperationalAlertStateUnavailableError,
    );

    const auditUnavailable = new FixtureBackedAuthOperationalAlertState({
      auditUnavailable: true,
    });
    await expect(
      auditUnavailable.evaluate({
        correlationId: correlationId('9'),
        evaluatedAt: new Date(),
        candidates,
      }),
    ).rejects.toBeInstanceOf(AuthOperationalAlertStateUnavailableError);
  });
});
