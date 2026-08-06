import { AuthOperationalControlCleanupJob } from './auth-operational-control-cleanup.job';
import { FixtureBackedAuthOperationalControl } from './auth-operational-control';

describe('AuthOperationalControlCleanupJob', () => {
  it('runs the bounded operational retention cleanup', async () => {
    const now = new Date('2026-07-10T06:00:00.000Z');
    const control = new FixtureBackedAuthOperationalControl({
      clock: () => now,
      metricRetentionMs: 60_000,
      policies: { LOGIN: { maxAttempts: 2, windowMs: 60_000 } },
    });
    const expiredAt = new Date(now.getTime() - 2 * 60_000);
    await control.assertRateLimit({
      surface: 'LOGIN',
      key: 'expired@example.test',
      now: expiredAt,
    });
    const job = new AuthOperationalControlCleanupJob(control);

    await expect(job.cleanupExpired()).resolves.toEqual({
      expiredRateLimitAttempts: 1,
      expiredMetricBuckets: 1,
    });
  });
});
