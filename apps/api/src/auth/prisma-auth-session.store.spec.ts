import { ServiceUnavailableException } from '@nestjs/common';
import { AuthSessionService } from './auth-session.service';
import {
  AuthSessionStoreIntegrityError,
  hashAuthRefreshToken,
} from './auth-session.store';
import { PrismaAuthSessionStore } from './prisma-auth-session.store';

describe('PrismaAuthSessionStore fail-closed behavior', () => {
  it('denies session validation when the repository lookup is unavailable', async () => {
    const prisma = {
      authSession: {
        findUnique: jest.fn().mockRejectedValue(new Error('database offline')),
      },
    };
    const authSessions = new AuthSessionService(
      new PrismaAuthSessionStore(prisma as never),
    );

    await expect(
      authSessions.assertTokenSessionActive({
        sub: 'local-user',
        email: 'local-user@example.test',
        roles: ['PARENT'],
        sid: 'local-session',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('denies session validation when repository role data is inconsistent', async () => {
    const prisma = {
      authSession: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'local-session',
          userId: 'local-user',
          email: 'local-user@example.test',
          roles: ['NOT_A_REAL_ROLE'],
          deviceId: 'local-device',
          state: 'ACTIVE',
          issuedAt: new Date('2026-07-10T00:00:00.000Z'),
          expiresAt: new Date('2026-07-11T00:00:00.000Z'),
          endedAt: null,
          revokedAt: null,
          reason: null,
        }),
      },
    };
    const authSessions = new AuthSessionService(
      new PrismaAuthSessionStore(prisma as never),
    );

    await expect(
      authSessions.assertTokenSessionActive({
        sub: 'local-user',
        email: 'local-user@example.test',
        roles: ['PARENT'],
        sid: 'local-session',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('denies refresh-token reads when a persisted value is not a lowercase SHA-256 hash', async () => {
    const prisma = {
      authRefreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'local-refresh-token',
          sessionId: 'local-session',
          userId: 'local-user',
          deviceId: 'local-device',
          tokenHash: 'plaintext-like-refresh-token',
          state: 'ACTIVE',
          issuedAt: new Date('2026-07-10T00:00:00.000Z'),
          expiresAt: new Date('2026-07-11T00:00:00.000Z'),
          rotatedAt: null,
          reusedAt: null,
          revokedAt: null,
          replacedByTokenId: null,
          reason: null,
          session: {
            id: 'local-session',
            userId: 'local-user',
            email: 'local-user@example.test',
            roles: ['PARENT'],
            deviceId: 'local-device',
            state: 'ACTIVE',
            issuedAt: new Date('2026-07-10T00:00:00.000Z'),
            expiresAt: new Date('2026-07-11T00:00:00.000Z'),
            endedAt: null,
            revokedAt: null,
            reason: null,
          },
        }),
      },
    };
    const authSessions = new AuthSessionService(
      new PrismaAuthSessionStore(prisma as never),
    );

    await expect(
      authSessions.getRefreshToken('local-refresh-token'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rejects malformed refresh-token hashes before the repository can persist them', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: 'local-session',
          userId: 'local-user',
          deviceId: 'local-device',
          state: 'ACTIVE',
        },
      ]),
      authRefreshToken: {
        create: jest.fn(),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (operation: (client: typeof tx) => Promise<unknown>) => operation(tx),
      ),
    };
    const store = new PrismaAuthSessionStore(prisma as never);

    await expect(
      store.createRefreshToken({
        id: 'local-refresh-token',
        sessionId: 'local-session',
        userId: 'local-user',
        deviceId: 'local-device',
        tokenHash: 'not-a-sha256-hash',
        state: 'ACTIVE',
        issuedAt: '2026-07-10T00:00:00.000Z',
        expiresAt: '2026-07-11T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(AuthSessionStoreIntegrityError);
    expect(tx.authRefreshToken.create).not.toHaveBeenCalled();
  });

  it('revokes the session and every active refresh token in one locked transaction', async () => {
    const revokedAt = '2026-07-10T08:00:00.000Z';
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: 'local-session',
          userId: 'local-user',
          deviceId: 'local-device',
          state: 'ACTIVE',
        },
      ]),
      authSession: {
        update: jest.fn().mockResolvedValue({
          id: 'local-session',
          userId: 'local-user',
          email: 'local-user@example.test',
          roles: ['PARENT'],
          deviceId: 'local-device',
          state: 'REVOKED',
          issuedAt: new Date('2026-07-10T00:00:00.000Z'),
          expiresAt: new Date('2026-07-11T00:00:00.000Z'),
          endedAt: null,
          revokedAt: new Date(revokedAt),
          reason: 'CROSS_INSTANCE_REVOKED',
        }),
      },
      authRefreshToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (operation: (client: typeof tx) => Promise<unknown>) => operation(tx),
      ),
    };
    const store = new PrismaAuthSessionStore(prisma as never);

    await expect(
      store.revokeSessionAtomically(
        'local-session',
        'CROSS_INSTANCE_REVOKED',
        revokedAt,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'local-session',
        state: 'REVOKED',
        reason: 'CROSS_INSTANCE_REVOKED',
      }),
    );
    expect(tx.authRefreshToken.updateMany).toHaveBeenCalledWith({
      where: { sessionId: 'local-session', state: 'ACTIVE' },
      data: {
        state: 'REVOKED',
        revokedAt: new Date(revokedAt),
        reason: 'CROSS_INSTANCE_REVOKED',
      },
    });
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.authSession.update.mock.invocationCallOrder[0],
    );
    expect(tx.authSession.update.mock.invocationCallOrder[0]).toBeLessThan(
      tx.authRefreshToken.updateMany.mock.invocationCallOrder[0],
    );
  });

  it('ends logout and revokes every active refresh token in one locked transaction', async () => {
    const endedAt = '2026-07-10T08:00:00.000Z';
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: 'local-session',
          userId: 'local-user',
          deviceId: 'local-device',
          state: 'ACTIVE',
        },
      ]),
      authSession: {
        update: jest.fn().mockResolvedValue({
          id: 'local-session',
          userId: 'local-user',
          email: 'local-user@example.test',
          roles: ['PARENT'],
          deviceId: 'local-device',
          state: 'ENDED',
          issuedAt: new Date('2026-07-10T00:00:00.000Z'),
          expiresAt: new Date('2026-07-11T00:00:00.000Z'),
          endedAt: new Date(endedAt),
          revokedAt: null,
          reason: 'LOGOUT',
        }),
      },
      authRefreshToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (operation: (client: typeof tx) => Promise<unknown>) => operation(tx),
      ),
    };
    const store = new PrismaAuthSessionStore(prisma as never);

    await expect(
      store.endSessionAtomically(
        'local-session',
        'local-user',
        'LOGOUT',
        endedAt,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'local-session',
        state: 'ENDED',
        reason: 'LOGOUT',
      }),
    );
    expect(tx.authRefreshToken.updateMany).toHaveBeenCalledWith({
      where: { sessionId: 'local-session', state: 'ACTIVE' },
      data: {
        state: 'REVOKED',
        revokedAt: new Date(endedAt),
        reason: 'LOGOUT',
      },
    });
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.authSession.update.mock.invocationCallOrder[0],
    );
    expect(tx.authSession.update.mock.invocationCallOrder[0]).toBeLessThan(
      tx.authRefreshToken.updateMany.mock.invocationCallOrder[0],
    );
  });

  it('refuses refresh rotation after the locked session is revoked', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: 'local-session',
          userId: 'local-user',
          deviceId: 'local-device',
          state: 'REVOKED',
        },
      ]),
      authRefreshToken: {
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (operation: (client: typeof tx) => Promise<unknown>) => operation(tx),
      ),
    };
    const store = new PrismaAuthSessionStore(prisma as never);
    const currentHash = hashAuthRefreshToken('current-refresh-token');

    await expect(
      store.rotateRefreshTokenAtomically(
        {
          id: 'current-refresh-token',
          sessionId: 'local-session',
          userId: 'local-user',
          deviceId: 'local-device',
          tokenHash: currentHash,
          state: 'ROTATED',
          issuedAt: '2026-07-10T00:00:00.000Z',
          expiresAt: '2026-07-11T00:00:00.000Z',
          rotatedAt: '2026-07-10T08:00:00.000Z',
          replacedByTokenId: 'replacement-refresh-token',
          reason: 'REFRESH_TOKEN_ROTATED',
        },
        {
          id: 'replacement-refresh-token',
          sessionId: 'local-session',
          userId: 'local-user',
          deviceId: 'local-device',
          tokenHash: hashAuthRefreshToken('replacement-refresh-token'),
          state: 'ACTIVE',
          issuedAt: '2026-07-10T08:00:00.000Z',
          expiresAt: '2026-07-17T08:00:00.000Z',
        },
      ),
    ).resolves.toBe(false);
    expect(tx.authRefreshToken.updateMany).not.toHaveBeenCalled();
    expect(tx.authRefreshToken.create).not.toHaveBeenCalled();
  });
});
