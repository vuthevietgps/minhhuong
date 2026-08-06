import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthSessionService } from './auth-session.service';
import { FixtureBackedAuthSessionStore } from './auth-session.store';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, AuthenticatedUser } from './auth.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

const jwtSecret = 'auth-session-smoke-secret';

const buildAuthService = () => {
  const jwt = new JwtService({
    secret: jwtSecret,
    signOptions: { expiresIn: '30m' },
  });
  const authSessions = new AuthSessionService();
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
  );

  return { jwt, authSessions, service };
};

const buildContext = (request: AuthenticatedRequest & { headers: object }) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as ExecutionContext;

describe('AuthSessionSmokeMatrix', () => {
  it('covers fixture demo login success for student, parent, teacher, admin, and support roles', async () => {
    const { service } = buildAuthService();

    const cases = [
      ['student@demo.local', 'STUDENT'],
      ['parent@demo.local', 'PARENT'],
      ['teacher@demo.local', 'TEACHER'],
      ['admin@demo.local', 'ADMIN'],
      ['support@demo.local', 'SUPPORT'],
    ] as const;

    for (const [email, role] of cases) {
      const login = await service.login({
        email,
        password: 'Demo@12345',
      });

      expect(login.user.roles).toContain(role);
      expect(login.accessToken).toEqual(expect.any(String));
      expect(login.session.id).toEqual(expect.any(String));
      expect(login.tokenType).toBe('Bearer');
      expect(login.expiresIn).toBe(1800);
    }
  });

  it('ends a logout session and denies the ended token afterward', async () => {
    const { authSessions, jwt, service } = buildAuthService();
    const guard = new JwtAuthGuard(jwt, authSessions);
    const login = await service.login({
      email: 'teacher@demo.local',
      password: 'Demo@12345',
    });
    const request = {
      headers: { authorization: `Bearer ${login.accessToken}` },
    } as AuthenticatedRequest & { headers: object };

    await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
    await expect(
      service.logout(request.user as AuthenticatedUser),
    ).resolves.toEqual({
      success: true,
      sessionEnded: true,
    });
    await expect(guard.canActivate(buildContext(request))).rejects.toThrow(
      'Session has ended',
    );
  });

  it('denies an expired token before role or data access', async () => {
    const { authSessions, jwt } = buildAuthService();
    const session = await authSessions.createSession({
      userId: 'demo-student',
      email: 'student@demo.local',
      roles: ['STUDENT'],
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const token = jwt.sign(
      {
        sub: 'demo-student',
        email: 'student@demo.local',
        roles: ['STUDENT'],
        sid: session.id,
      },
      { expiresIn: -1 },
    );
    const guard = new JwtAuthGuard(jwt, authSessions);
    const request = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthenticatedRequest & { headers: object };

    await expect(guard.canActivate(buildContext(request))).rejects.toThrow(
      'Invalid or expired token',
    );
  });

  it('denies a revoked session/device token', async () => {
    const { authSessions, jwt, service } = buildAuthService();
    const login = await service.login({
      email: 'parent@demo.local',
      password: 'Demo@12345',
    });
    const revoked = await authSessions.revokeSession(
      login.session.id,
      'DEVICE_REVOKED',
    );
    const guard = new JwtAuthGuard(jwt, authSessions);
    const request = {
      headers: { authorization: `Bearer ${login.accessToken}` },
    } as AuthenticatedRequest & { headers: object };

    expect(revoked).toBe(true);
    await expect(guard.canActivate(buildContext(request))).rejects.toThrow(
      'Session has been revoked',
    );
  });

  it('denies wrong-role access without weakening the role guard', () => {
    const rolesGuard = new RolesGuard({
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as never);
    const request = {
      headers: {},
      user: {
        sub: 'demo-support',
        email: 'support@demo.local',
        roles: ['SUPPORT'],
      },
    } as AuthenticatedRequest & { headers: object };

    expect(() => rolesGuard.canActivate(buildContext(request))).toThrow(
      ForbiddenException,
    );
  });

  it('persists fixture-backed session lookup across auth session service instances', async () => {
    const store = new FixtureBackedAuthSessionStore();
    const writer = new AuthSessionService(store);
    const reader = new AuthSessionService(store);
    const session = await writer.createSession({
      userId: 'demo-student',
      email: 'student@demo.local',
      roles: ['STUDENT'],
      deviceId: 'local-demo-web-student',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const refreshToken = await writer.issueRefreshToken({
      sessionId: session.id,
      userId: session.userId,
    });

    await expect(reader.getSession(session.id)).resolves.toEqual(
      expect.objectContaining({
        id: session.id,
        userId: 'demo-student',
        state: 'ACTIVE',
      }),
    );
    await expect(
      reader.listRefreshTokensForSession(session.id),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: refreshToken.id,
          state: 'ACTIVE',
        }),
      ]),
    );
  });

  it('rotates refresh tokens and denies reused refresh tokens', async () => {
    const { authSessions, service } = buildAuthService();
    const login = await service.login({
      email: 'parent@demo.local',
      password: 'Demo@12345',
    });
    const rotated = await service.refresh(login.refreshToken);

    expect(rotated.refreshToken).not.toBe(login.refreshToken);
    await expect(
      authSessions.getRefreshToken(login.session.refreshTokenId),
    ).resolves.toEqual(
      expect.objectContaining({
        state: 'ROTATED',
        replacedByTokenId: rotated.session.refreshTokenId,
      }),
    );

    await expect(service.refresh(login.refreshToken)).rejects.toThrow(
      'Refresh token reuse denied',
    );
    await expect(
      authSessions.getRefreshToken(login.session.refreshTokenId),
    ).resolves.toEqual(
      expect.objectContaining({
        state: 'REUSED',
        reason: 'REFRESH_TOKEN_REUSED',
      }),
    );
    await expect(authSessions.getSession(login.session.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'REFRESH_TOKEN_REUSED',
      }),
    );
  });

  it('revokes cross-device sessions while keeping the current device active', async () => {
    const authSessions = new AuthSessionService();
    const current = await authSessions.createSession({
      userId: 'demo-teacher',
      email: 'teacher@demo.local',
      roles: ['TEACHER'],
      deviceId: 'local-demo-web-teacher',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const other = await authSessions.createSession({
      userId: 'demo-teacher',
      email: 'teacher@demo.local',
      roles: ['TEACHER'],
      deviceId: 'local-demo-tablet-teacher',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await expect(
      authSessions.revokeOtherSessions(
        'demo-teacher',
        current.id,
        'CROSS_DEVICE_REVOKED',
      ),
    ).resolves.toEqual([other.id]);
    await expect(authSessions.getSession(current.id)).resolves.toEqual(
      expect.objectContaining({ state: 'ACTIVE' }),
    );
    await expect(authSessions.getSession(other.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'CROSS_DEVICE_REVOKED',
      }),
    );
  });

  it('cleans up expired sessions and refresh tokens', async () => {
    const authSessions = new AuthSessionService();
    const now = new Date();
    const session = await authSessions.createSession({
      userId: 'demo-student',
      email: 'student@demo.local',
      roles: ['STUDENT'],
      deviceId: 'local-demo-web-student-expired',
      expiresAt: new Date(now.getTime() - 60 * 1000),
    });
    const activeSession = await authSessions.createSession({
      userId: 'demo-parent',
      email: 'parent@demo.local',
      roles: ['PARENT'],
      deviceId: 'local-demo-web-parent-expired-refresh',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    });
    const expiredRefreshToken = await authSessions.issueRefreshToken({
      sessionId: activeSession.id,
      userId: activeSession.userId,
      expiresAt: new Date(now.getTime() - 60 * 1000),
    });

    const result = await authSessions.cleanupExpiredSessions(now);

    expect(result.expiredSessionIds).toEqual([session.id]);
    expect(result.expiredRefreshTokenIds).toEqual([expiredRefreshToken.id]);
    await expect(authSessions.getSession(session.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'EXPIRED',
        reason: 'SESSION_EXPIRED',
      }),
    );
    await expect(
      authSessions.getRefreshToken(expiredRefreshToken.id),
    ).resolves.toEqual(
      expect.objectContaining({
        state: 'EXPIRED',
        reason: 'REFRESH_TOKEN_EXPIRED',
      }),
    );
  });

  it('surfaces auth lifecycle audit events to admin and support only', async () => {
    const authSessions = new AuthSessionService();
    const session = await authSessions.createSession({
      userId: 'demo-support',
      email: 'support@demo.local',
      roles: ['SUPPORT'],
      deviceId: 'local-demo-support-console',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await authSessions.revokeSession(session.id, 'SUPPORT_AUDIT_FIXTURE');

    const adminEvents = await authSessions.listAuditEventsForRoles(['ADMIN']);
    const supportEvents = await authSessions.listAuditEventsForRoles([
      'SUPPORT',
    ]);

    expect(adminEvents.map((event) => event.action)).toEqual(
      expect.arrayContaining(['SESSION_CREATED', 'SESSION_REVOKED']),
    );
    expect(supportEvents).toHaveLength(adminEvents.length);
    await expect(
      authSessions.listAuditEventsForRoles(['STUDENT']),
    ).resolves.toEqual([]);
  });
});
