import { HttpException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthRateLimitExceededError,
  FixtureBackedAuthOperationalControl,
} from './auth-operational-control';
import { AuthSessionService } from './auth-session.service';
import {
  AuthSessionStoreUnavailableError,
  FixtureBackedAuthSessionStore,
} from './auth-session.store';
import { AuthService } from './auth.service';

const jwtSecret = 'auth-operational-control-spec-secret';

const metricCount = (
  counters: Awaited<
    ReturnType<FixtureBackedAuthOperationalControl['snapshot']>
  >['counters'],
  kind: string,
) => counters.find((counter) => counter.kind === kind)?.count ?? 0;

const buildAuthService = (control: FixtureBackedAuthOperationalControl) => {
  const jwt = new JwtService({
    secret: jwtSecret,
    signOptions: { expiresIn: '30m' },
  });
  const store = new FixtureBackedAuthSessionStore();
  const authSessions = new AuthSessionService(store, control);
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
  const service = new AuthService(
    jwt,
    prisma as never,
    {} as never,
    {} as never,
    authSessions,
    control,
  );

  return { authSessions, service };
};

describe('FixtureBackedAuthOperationalControl', () => {
  it('throttles deterministic login attempts inside the window and stores no raw identity in its snapshot', async () => {
    let now = new Date('2026-07-10T05:00:00.000Z');
    const control = new FixtureBackedAuthOperationalControl({
      clock: () => now,
      policies: { LOGIN: { maxAttempts: 2, windowMs: 60_000 } },
    });

    await expect(
      control.assertRateLimit({ surface: 'LOGIN', key: 'Parent@Demo.Local' }),
    ).resolves.toBeUndefined();
    await expect(
      control.assertRateLimit({ surface: 'LOGIN', key: 'parent@demo.local' }),
    ).resolves.toBeUndefined();
    await expect(
      control.assertRateLimit({ surface: 'LOGIN', key: 'parent@demo.local' }),
    ).rejects.toBeInstanceOf(AuthRateLimitExceededError);

    const throttledSnapshot = await control.snapshot();
    expect(metricCount(throttledSnapshot.counters, 'LOGIN_ATTEMPT')).toBe(2);
    expect(metricCount(throttledSnapshot.counters, 'LOGIN_THROTTLED')).toBe(1);
    expect(JSON.stringify(throttledSnapshot)).not.toContain(
      'parent@demo.local',
    );

    now = new Date('2026-07-10T05:01:01.000Z');
    await expect(
      control.assertRateLimit({ surface: 'LOGIN', key: 'parent@demo.local' }),
    ).resolves.toBeUndefined();
  });

  it('returns 429 after repeated invalid login and refresh-token attempts', async () => {
    const control = new FixtureBackedAuthOperationalControl({
      policies: {
        LOGIN: { maxAttempts: 2, windowMs: 60_000 },
        REFRESH: { maxAttempts: 1, windowMs: 60_000 },
      },
    });
    const { service } = buildAuthService(control);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await expect(
        service.login({
          email: 'unknown@demo.local',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Invalid email or password');
    }
    await expect(
      service.login({
        email: 'unknown@demo.local',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject<HttpException>({ status: 429 });

    await expect(service.refresh('invalid.token')).rejects.toThrow(
      'Invalid refresh token',
    );
    await expect(
      service.refresh('invalid.token'),
    ).rejects.toMatchObject<HttpException>({ status: 429 });

    const snapshot = await control.snapshot();
    expect(metricCount(snapshot.counters, 'LOGIN_DENIED')).toBe(2);
    expect(metricCount(snapshot.counters, 'LOGIN_THROTTLED')).toBe(1);
    expect(metricCount(snapshot.counters, 'REFRESH_DENIED')).toBe(1);
    expect(metricCount(snapshot.counters, 'REFRESH_THROTTLED')).toBe(1);
  });

  it('records successful refresh and replay denial counters without persisting the raw token', async () => {
    const control = new FixtureBackedAuthOperationalControl({
      policies: { REFRESH: { maxAttempts: 5, windowMs: 60_000 } },
    });
    const { service } = buildAuthService(control);
    const login = await service.login({
      email: 'parent@demo.local',
      password: 'Demo@12345',
    });

    await expect(service.refresh(login.refreshToken)).resolves.toEqual(
      expect.objectContaining({ accessToken: expect.any(String) }),
    );
    await expect(service.refresh(login.refreshToken)).rejects.toThrow(
      'Refresh token reuse denied',
    );

    const snapshot = await control.snapshot();
    expect(metricCount(snapshot.counters, 'REFRESH_SUCCEEDED')).toBe(1);
    expect(metricCount(snapshot.counters, 'REFRESH_DENIED')).toBe(1);
    expect(metricCount(snapshot.counters, 'REFRESH_REPLAY_DENIED')).toBe(1);
    expect(JSON.stringify(snapshot)).not.toContain(login.refreshToken);
  });

  it('records repository outage and fails the session read closed', async () => {
    const control = new FixtureBackedAuthOperationalControl();
    const authSessions = new AuthSessionService(
      {
        findSessionById: jest
          .fn()
          .mockRejectedValue(
            new AuthSessionStoreUnavailableError('findSessionById'),
          ),
      } as never,
      control,
    );

    await expect(
      authSessions.getSession('session-outage'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    const snapshot = await control.snapshot();
    expect(metricCount(snapshot.counters, 'SESSION_REPOSITORY_ERROR')).toBe(1);
  });

  it('records cleanup and role-scoped audit export counters', async () => {
    const control = new FixtureBackedAuthOperationalControl();
    const authSessions = new AuthSessionService(
      new FixtureBackedAuthSessionStore(),
      control,
    );
    const now = new Date('2026-07-10T06:00:00.000Z');
    await authSessions.createSession({
      userId: 'demo-student',
      email: 'student@demo.local',
      roles: ['STUDENT'],
      expiresAt: new Date(now.getTime() - 1_000),
    });
    const activeSession = await authSessions.createSession({
      userId: 'demo-parent',
      email: 'parent@demo.local',
      roles: ['PARENT'],
      expiresAt: new Date('2099-01-01T00:00:00.000Z'),
    });
    await authSessions.issueRefreshToken({
      sessionId: activeSession.id,
      userId: activeSession.userId,
      expiresAt: new Date(now.getTime() - 1_000),
    });

    await authSessions.cleanupExpiredSessions(now);
    const adminEvents = await authSessions.listAuditEventsForRoles(['ADMIN']);
    await expect(
      authSessions.listAuditEventsForRoles(['STUDENT']),
    ).resolves.toEqual([]);

    const snapshot = await control.snapshot();
    expect(metricCount(snapshot.counters, 'SESSION_CLEANUP_RUN')).toBe(1);
    expect(
      metricCount(snapshot.counters, 'SESSION_CLEANUP_EXPIRED_SESSION'),
    ).toBe(1);
    expect(
      metricCount(snapshot.counters, 'SESSION_CLEANUP_EXPIRED_REFRESH_TOKEN'),
    ).toBe(1);
    expect(metricCount(snapshot.counters, 'AUDIT_EXPORT_REQUESTED')).toBe(2);
    expect(metricCount(snapshot.counters, 'AUDIT_EXPORT_DENIED')).toBe(1);
    expect(metricCount(snapshot.counters, 'AUDIT_EXPORT_ROW')).toBe(
      adminEvents.length,
    );
  });

  it('fails login closed when the rate-limit control is unavailable', async () => {
    const control = new FixtureBackedAuthOperationalControl({
      unavailable: true,
    });
    const { service } = buildAuthService(control);

    await expect(
      service.login({
        email: 'parent@demo.local',
        password: 'Demo@12345',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
