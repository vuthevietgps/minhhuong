// Shared fixtures for the learning-local-demo.production-hardening specs (test-only).
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthSessionService } from '../auth/auth-session.service';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedRequest } from '../auth/auth.types';

export const buildAuthSmokeService = () => {
  const jwt = new JwtService({
    secret: 'learning-local-demo-auth-session-smoke-secret',
    signOptions: { expiresIn: '30m' },
  });
  const authSessions = new AuthSessionService();
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
  const auth = new AuthService(
    jwt,
    prisma as never,
    {} as never,
    {} as never,
    authSessions,
  );

  return { auth, authSessions, jwt };
};

export const buildAuthContext = (
  request: AuthenticatedRequest & { headers: object },
) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as ExecutionContext;
