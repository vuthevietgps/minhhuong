import { AuthOperationalAlertStateCleanupJob } from './auth-operational-alert-state-cleanup.job';
import { FixtureBackedAuthOperationalAlertState } from './auth-operational-alert-state';

describe('AuthOperationalAlertStateCleanupJob', () => {
  it('runs exact alert-state retention cleanup', async () => {
    const now = new Date('2026-07-10T06:00:00.000Z');
    const state = new FixtureBackedAuthOperationalAlertState({
      clock: () => now,
      auditRetentionMs: 15 * 60 * 1000,
    });
    await state.evaluate({
      correlationId:
        'auth-alert-evaluation:00000000-0000-4000-8000-000000000010',
      evaluatedAt: new Date(now.getTime() - 16 * 60_000),
      candidates: [
        {
          alertCode: 'LOGIN_THROTTLE_THRESHOLD',
          fingerprint: 'auth-operational-alert:LOGIN_THROTTLE_THRESHOLD',
          cooldownMs: 15 * 60 * 1000,
        },
      ],
    });

    const job = new AuthOperationalAlertStateCleanupJob(state);
    await expect(job.cleanupExpired()).resolves.toEqual({
      expiredAlertStates: 1,
      expiredEvaluationAudits: 1,
    });
  });
});
