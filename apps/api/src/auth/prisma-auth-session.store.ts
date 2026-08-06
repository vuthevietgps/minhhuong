import { Inject, Injectable } from '@nestjs/common';
import {
  AuthRefreshToken as PrismaAuthRefreshToken,
  AuthSession as PrismaAuthSession,
  AuthSessionAuditEvent as PrismaAuthSessionAuditEvent,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthRefreshTokenRecord,
  AuthSessionAuditEvent,
  AuthSessionAuditEventInput,
  AuthSessionCleanupResult,
  AuthSessionRecord,
  AuthSessionState,
  AuthSessionStore,
  AuthSessionStoreIntegrityError,
  AuthSessionStoreUnavailableError,
} from './auth-session.store';
import { AccountRole, accountRoles } from './auth.types';

type PrismaRefreshTokenWithSession = PrismaAuthRefreshToken & {
  session: PrismaAuthSession;
};

type LockedAuthSessionOwnership = {
  id: string;
  userId: string;
  deviceId: string;
  state: AuthSessionState;
};

@Injectable()
export class PrismaAuthSessionStore implements AuthSessionStore {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaClient,
  ) {}

  async createSession(record: AuthSessionRecord): Promise<AuthSessionRecord> {
    return this.execute('createSession', async () =>
      toSessionRecord(
        await this.prisma.authSession.create({
          data: sessionWriteData(record),
        }),
      ),
    );
  }

  async updateSession(record: AuthSessionRecord): Promise<AuthSessionRecord> {
    return this.execute('updateSession', async () =>
      toSessionRecord(
        await this.prisma.authSession.update({
          where: { id: record.id },
          data: sessionWriteData(record),
        }),
      ),
    );
  }

  async endSessionAtomically(
    sessionId: string,
    userId: string,
    reason: string,
    endedAt: string,
  ): Promise<AuthSessionRecord | undefined> {
    return this.execute('endSessionAtomically', () =>
      this.prisma.$transaction(async (tx) => {
        const lockedSession = await lockSessionForUpdate(tx, sessionId);
        if (!lockedSession || lockedSession.userId !== userId) {
          return undefined;
        }

        const endedAtDate = parseDate(endedAt);
        const session =
          lockedSession.state === 'ACTIVE'
            ? await tx.authSession.update({
                where: { id: sessionId },
                data: {
                  state: 'ENDED',
                  endedAt: endedAtDate,
                  reason,
                },
              })
            : await tx.authSession.findUniqueOrThrow({
                where: { id: sessionId },
              });
        const terminalReason = session.reason ?? reason;
        const terminalAt = session.endedAt ?? session.revokedAt ?? endedAtDate;
        await tx.authRefreshToken.updateMany({
          where: { sessionId, state: 'ACTIVE' },
          data: {
            state: 'REVOKED',
            revokedAt: terminalAt,
            reason: terminalReason,
          },
        });

        return session.state === 'ENDED' ? toSessionRecord(session) : undefined;
      }),
    );
  }

  async revokeSessionAtomically(
    sessionId: string,
    reason: string,
    revokedAt: string,
  ): Promise<AuthSessionRecord | undefined> {
    return this.execute('revokeSessionAtomically', () =>
      this.prisma.$transaction(async (tx) => {
        const lockedSession = await lockSessionForUpdate(tx, sessionId);
        if (!lockedSession) {
          return undefined;
        }

        const revokedAtDate = parseDate(revokedAt);
        const session =
          lockedSession.state === 'REVOKED'
            ? await tx.authSession.findUniqueOrThrow({
                where: { id: sessionId },
              })
            : await tx.authSession.update({
                where: { id: sessionId },
                data: {
                  state: 'REVOKED',
                  revokedAt: revokedAtDate,
                  reason,
                },
              });
        await tx.authRefreshToken.updateMany({
          where: { sessionId, state: 'ACTIVE' },
          data: {
            state: 'REVOKED',
            revokedAt: revokedAtDate,
            reason,
          },
        });

        return toSessionRecord(session);
      }),
    );
  }

  async findSessionById(
    sessionId: string,
  ): Promise<AuthSessionRecord | undefined> {
    return this.execute('findSessionById', async () => {
      const session = await this.prisma.authSession.findUnique({
        where: { id: sessionId },
      });
      return session ? toSessionRecord(session) : undefined;
    });
  }

  async listSessionsForUser(userId: string): Promise<AuthSessionRecord[]> {
    return this.execute('listSessionsForUser', async () =>
      (
        await this.prisma.authSession.findMany({
          where: { userId },
          orderBy: [{ issuedAt: 'asc' }, { id: 'asc' }],
        })
      ).map(toSessionRecord),
    );
  }

  async createRefreshToken(
    record: AuthRefreshTokenRecord,
  ): Promise<AuthRefreshTokenRecord> {
    return this.execute('createRefreshToken', () =>
      this.prisma.$transaction(async (tx) => {
        await requireMatchingActiveSession(tx, record);
        return toRefreshTokenRecord(
          await tx.authRefreshToken.create({
            data: refreshTokenWriteData(record),
            include: { session: true },
          }),
        );
      }),
    );
  }

  async updateRefreshToken(
    record: AuthRefreshTokenRecord,
  ): Promise<AuthRefreshTokenRecord> {
    return this.execute('updateRefreshToken', () =>
      this.prisma.$transaction(async (tx) => {
        await requireMatchingSession(tx, record);
        return toRefreshTokenRecord(
          await tx.authRefreshToken.update({
            where: { id: record.id },
            data: refreshTokenWriteData(record),
            include: { session: true },
          }),
        );
      }),
    );
  }

  async rotateRefreshTokenAtomically(
    current: AuthRefreshTokenRecord,
    replacement: AuthRefreshTokenRecord,
  ): Promise<boolean> {
    return this.execute('rotateRefreshTokenAtomically', () =>
      this.prisma.$transaction(async (tx) => {
        assertRefreshTokenHash(current.tokenHash, current.id);
        assertRefreshTokenHash(replacement.tokenHash, replacement.id);
        if (
          replacement.sessionId !== current.sessionId ||
          replacement.userId !== current.userId ||
          replacement.deviceId !== current.deviceId
        ) {
          throw new AuthSessionStoreIntegrityError(
            'Refresh-token rotation replacement ownership is inconsistent',
          );
        }
        const session = await requireMatchingSession(tx, current);
        assertSessionOwnership(session, replacement);
        if (session.state !== 'ACTIVE') {
          return false;
        }

        const claimed = await tx.authRefreshToken.updateMany({
          where: {
            id: current.id,
            state: 'ACTIVE',
            tokenHash: current.tokenHash,
          },
          data: refreshTokenMutableData(current),
        });
        if (claimed.count !== 1) {
          return false;
        }

        await tx.authRefreshToken.create({
          data: refreshTokenWriteData(replacement),
        });
        return true;
      }),
    );
  }

  async findRefreshTokenById(
    tokenId: string,
  ): Promise<AuthRefreshTokenRecord | undefined> {
    return this.execute('findRefreshTokenById', async () => {
      const refreshToken = await this.prisma.authRefreshToken.findUnique({
        where: { id: tokenId },
        include: { session: true },
      });
      return refreshToken ? toRefreshTokenRecord(refreshToken) : undefined;
    });
  }

  async listRefreshTokensForSession(
    sessionId: string,
  ): Promise<AuthRefreshTokenRecord[]> {
    return this.execute('listRefreshTokensForSession', async () =>
      (
        await this.prisma.authRefreshToken.findMany({
          where: { sessionId },
          include: { session: true },
          orderBy: [{ issuedAt: 'asc' }, { id: 'asc' }],
        })
      ).map(toRefreshTokenRecord),
    );
  }

  async appendAuditEvent(
    event: AuthSessionAuditEventInput,
  ): Promise<AuthSessionAuditEvent> {
    return this.execute('appendAuditEvent', async () => {
      assertAuditRoles(event.visibleToRoles);
      return toAuditEvent(
        await this.prisma.authSessionAuditEvent.create({
          data: {
            id: randomUUID(),
            createdAt: parseDate(event.createdAt ?? new Date().toISOString()),
            action: event.action,
            sessionId: event.sessionId,
            refreshTokenId: event.refreshTokenId,
            userId: event.userId,
            deviceId: event.deviceId,
            reason: event.reason,
            visibleToRoles: [...event.visibleToRoles],
            metadata: event.metadata
              ? (event.metadata as Prisma.InputJsonValue)
              : undefined,
          },
        }),
      );
    });
  }

  async listAuditEventsForRoles(
    roles: readonly AccountRole[],
  ): Promise<AuthSessionAuditEvent[]> {
    const auditRoles = roles.filter(
      (role): role is Extract<AccountRole, 'ADMIN' | 'SUPPORT'> =>
        role === 'ADMIN' || role === 'SUPPORT',
    );
    if (auditRoles.length === 0) {
      return [];
    }

    return this.execute('listAuditEventsForRoles', async () =>
      (
        await this.prisma.authSessionAuditEvent.findMany({
          where: { visibleToRoles: { hasSome: auditRoles } },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        })
      ).map(toAuditEvent),
    );
  }

  async cleanupExpired(now: Date): Promise<AuthSessionCleanupResult> {
    return this.execute('cleanupExpired', () =>
      this.prisma.$transaction(async (tx) => {
        const expiredSessions = await tx.authSession.findMany({
          where: { state: 'ACTIVE', expiresAt: { lte: now } },
          select: { id: true },
          orderBy: { id: 'asc' },
        });
        const expiredSessionIds = expiredSessions.map((session) => session.id);

        if (expiredSessionIds.length > 0) {
          await tx.authSession.updateMany({
            where: { id: { in: expiredSessionIds }, state: 'ACTIVE' },
            data: {
              state: 'EXPIRED',
              endedAt: now,
              reason: 'SESSION_EXPIRED',
            },
          });
        }

        const expiredRefreshTokens = await tx.authRefreshToken.findMany({
          where: {
            state: 'ACTIVE',
            OR: [
              { expiresAt: { lte: now } },
              ...(expiredSessionIds.length > 0
                ? [{ sessionId: { in: expiredSessionIds } }]
                : []),
            ],
          },
          select: { id: true, sessionId: true },
          orderBy: { id: 'asc' },
        });
        const sessionExpiredTokenIds = expiredRefreshTokens
          .filter((token) => expiredSessionIds.includes(token.sessionId))
          .map((token) => token.id);
        const ttlExpiredTokenIds = expiredRefreshTokens
          .filter((token) => !expiredSessionIds.includes(token.sessionId))
          .map((token) => token.id);

        if (sessionExpiredTokenIds.length > 0) {
          await tx.authRefreshToken.updateMany({
            where: { id: { in: sessionExpiredTokenIds }, state: 'ACTIVE' },
            data: { state: 'EXPIRED', reason: 'SESSION_EXPIRED' },
          });
        }
        if (ttlExpiredTokenIds.length > 0) {
          await tx.authRefreshToken.updateMany({
            where: { id: { in: ttlExpiredTokenIds }, state: 'ACTIVE' },
            data: { state: 'EXPIRED', reason: 'REFRESH_TOKEN_EXPIRED' },
          });
        }

        return {
          expiredSessionIds,
          expiredRefreshTokenIds: expiredRefreshTokens.map((token) => token.id),
        };
      }),
    );
  }

  private async execute<T>(
    operation: string,
    task: () => Promise<T>,
  ): Promise<T> {
    try {
      return await task();
    } catch (error) {
      if (
        error instanceof AuthSessionStoreIntegrityError ||
        error instanceof AuthSessionStoreUnavailableError
      ) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2003', 'P2014', 'P2025'].includes(error.code)
      ) {
        throw new AuthSessionStoreIntegrityError(
          `Auth session repository rejected inconsistent data during ${operation}`,
          { cause: error },
        );
      }

      throw new AuthSessionStoreUnavailableError(operation, { cause: error });
    }
  }
}

const sessionWriteData = (record: AuthSessionRecord) => ({
  id: record.id,
  userId: record.userId,
  email: record.email,
  roles: [...record.roles] as Prisma.InputJsonValue,
  deviceId: record.deviceId,
  state: record.state,
  issuedAt: parseDate(record.issuedAt),
  expiresAt: parseDate(record.expiresAt),
  endedAt: record.endedAt ? parseDate(record.endedAt) : null,
  revokedAt: record.revokedAt ? parseDate(record.revokedAt) : null,
  reason: record.reason ?? null,
});

const refreshTokenWriteData = (record: AuthRefreshTokenRecord) => {
  assertRefreshTokenHash(record.tokenHash, record.id);
  return {
    id: record.id,
    sessionId: record.sessionId,
    userId: record.userId,
    deviceId: record.deviceId,
    tokenHash: record.tokenHash,
    state: record.state,
    issuedAt: parseDate(record.issuedAt),
    expiresAt: parseDate(record.expiresAt),
    rotatedAt: record.rotatedAt ? parseDate(record.rotatedAt) : null,
    reusedAt: record.reusedAt ? parseDate(record.reusedAt) : null,
    revokedAt: record.revokedAt ? parseDate(record.revokedAt) : null,
    replacedByTokenId: record.replacedByTokenId ?? null,
    reason: record.reason ?? null,
  };
};

const refreshTokenMutableData = (record: AuthRefreshTokenRecord) => ({
  state: record.state,
  rotatedAt: record.rotatedAt ? parseDate(record.rotatedAt) : null,
  reusedAt: record.reusedAt ? parseDate(record.reusedAt) : null,
  revokedAt: record.revokedAt ? parseDate(record.revokedAt) : null,
  replacedByTokenId: record.replacedByTokenId ?? null,
  reason: record.reason ?? null,
});

const toSessionRecord = (session: PrismaAuthSession): AuthSessionRecord => {
  const roles = parseRoles(session.roles, session.id);
  assertNonEmpty(session.userId, 'session.userId', session.id);
  assertNonEmpty(session.email, 'session.email', session.id);
  assertNonEmpty(session.deviceId, 'session.deviceId', session.id);

  return {
    id: session.id,
    userId: session.userId,
    email: session.email,
    roles,
    deviceId: session.deviceId,
    state: session.state,
    issuedAt: toIso(session.issuedAt, 'session.issuedAt', session.id),
    expiresAt: toIso(session.expiresAt, 'session.expiresAt', session.id),
    endedAt: session.endedAt
      ? toIso(session.endedAt, 'session.endedAt', session.id)
      : undefined,
    revokedAt: session.revokedAt
      ? toIso(session.revokedAt, 'session.revokedAt', session.id)
      : undefined,
    reason: session.reason ?? undefined,
  };
};

const toRefreshTokenRecord = (
  refreshToken: PrismaRefreshTokenWithSession,
): AuthRefreshTokenRecord => {
  if (
    refreshToken.userId !== refreshToken.session.userId ||
    refreshToken.deviceId !== refreshToken.session.deviceId
  ) {
    throw new AuthSessionStoreIntegrityError(
      `Refresh token ${refreshToken.id} does not match its session ownership`,
    );
  }
  assertNonEmpty(
    refreshToken.tokenHash,
    'refreshToken.tokenHash',
    refreshToken.id,
  );
  assertRefreshTokenHash(refreshToken.tokenHash, refreshToken.id);

  return {
    id: refreshToken.id,
    sessionId: refreshToken.sessionId,
    userId: refreshToken.userId,
    deviceId: refreshToken.deviceId,
    tokenHash: refreshToken.tokenHash,
    state: refreshToken.state,
    issuedAt: toIso(
      refreshToken.issuedAt,
      'refreshToken.issuedAt',
      refreshToken.id,
    ),
    expiresAt: toIso(
      refreshToken.expiresAt,
      'refreshToken.expiresAt',
      refreshToken.id,
    ),
    rotatedAt: refreshToken.rotatedAt
      ? toIso(refreshToken.rotatedAt, 'refreshToken.rotatedAt', refreshToken.id)
      : undefined,
    reusedAt: refreshToken.reusedAt
      ? toIso(refreshToken.reusedAt, 'refreshToken.reusedAt', refreshToken.id)
      : undefined,
    revokedAt: refreshToken.revokedAt
      ? toIso(refreshToken.revokedAt, 'refreshToken.revokedAt', refreshToken.id)
      : undefined,
    replacedByTokenId: refreshToken.replacedByTokenId ?? undefined,
    reason: refreshToken.reason ?? undefined,
  };
};

const toAuditEvent = (
  event: PrismaAuthSessionAuditEvent,
): AuthSessionAuditEvent => {
  const visibleToRoles = event.visibleToRoles.filter(
    (role): role is Extract<AccountRole, 'ADMIN' | 'SUPPORT'> =>
      role === 'ADMIN' || role === 'SUPPORT',
  );
  if (visibleToRoles.length !== event.visibleToRoles.length) {
    throw new AuthSessionStoreIntegrityError(
      `Audit event ${event.id} has an invalid visibility role`,
    );
  }

  return {
    id: event.id,
    createdAt: toIso(event.createdAt, 'audit.createdAt', event.id),
    action: event.action,
    sessionId: event.sessionId ?? undefined,
    refreshTokenId: event.refreshTokenId ?? undefined,
    userId: event.userId ?? undefined,
    deviceId: event.deviceId ?? undefined,
    reason: event.reason ?? undefined,
    visibleToRoles,
    metadata: parseMetadata(event.metadata, event.id),
  };
};

async function requireMatchingSession(
  tx: Prisma.TransactionClient,
  record: AuthRefreshTokenRecord,
) {
  const session = await lockSessionForUpdate(tx, record.sessionId);
  if (!session) {
    throw new AuthSessionStoreIntegrityError(
      `Refresh token ${record.id} does not match an auth session`,
    );
  }
  assertSessionOwnership(session, record);
  return session;
}

async function requireMatchingActiveSession(
  tx: Prisma.TransactionClient,
  record: AuthRefreshTokenRecord,
) {
  const session = await requireMatchingSession(tx, record);
  if (session.state !== 'ACTIVE') {
    throw new AuthSessionStoreIntegrityError(
      `Refresh token ${record.id} cannot be issued for a non-active session`,
    );
  }
  return session;
}

async function lockSessionForUpdate(
  tx: Prisma.TransactionClient,
  sessionId: string,
): Promise<LockedAuthSessionOwnership | undefined> {
  const sessions = await tx.$queryRaw<LockedAuthSessionOwnership[]>(Prisma.sql`
    SELECT
      "id",
      "user_id" AS "userId",
      "device_id" AS "deviceId",
      "state"
    FROM "auth_sessions"
    WHERE "id" = ${sessionId}
    FOR UPDATE
  `);
  return sessions[0];
}

function assertSessionOwnership(
  session: LockedAuthSessionOwnership,
  record: AuthRefreshTokenRecord,
) {
  if (
    session.userId !== record.userId ||
    session.deviceId !== record.deviceId
  ) {
    throw new AuthSessionStoreIntegrityError(
      `Refresh token ${record.id} does not match an auth session`,
    );
  }
}

const parseRoles = (
  value: Prisma.JsonValue,
  sessionId: string,
): AccountRole[] => {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every(
      (role) =>
        typeof role === 'string' && accountRoles.includes(role as AccountRole),
    )
  ) {
    throw new AuthSessionStoreIntegrityError(
      `Auth session ${sessionId} has invalid role data`,
    );
  }
  return value as AccountRole[];
};

const parseMetadata = (
  value: Prisma.JsonValue | null,
  eventId: string,
): Record<string, string | number | boolean | null> | undefined => {
  if (value === null) {
    return undefined;
  }
  if (Array.isArray(value) || typeof value !== 'object') {
    throw new AuthSessionStoreIntegrityError(
      `Auth audit event ${eventId} has invalid metadata`,
    );
  }
  const metadata = value as Record<string, Prisma.JsonValue>;
  if (
    Object.values(metadata).some(
      (entry) =>
        entry !== null &&
        !['string', 'number', 'boolean'].includes(typeof entry),
    )
  ) {
    throw new AuthSessionStoreIntegrityError(
      `Auth audit event ${eventId} has nested metadata`,
    );
  }
  return metadata as Record<string, string | number | boolean | null>;
};

const assertAuditRoles = (
  roles: readonly Extract<AccountRole, 'ADMIN' | 'SUPPORT'>[],
) => {
  if (
    roles.length === 0 ||
    roles.some((role) => role !== 'ADMIN' && role !== 'SUPPORT')
  ) {
    throw new AuthSessionStoreIntegrityError(
      'Auth session audit visibility must be limited to ADMIN or SUPPORT',
    );
  }
};

const assertNonEmpty = (value: string, field: string, id: string) => {
  if (!value.trim()) {
    throw new AuthSessionStoreIntegrityError(`${field} is empty for ${id}`);
  }
};

const assertRefreshTokenHash = (value: string, tokenId: string) => {
  if (!/^[a-f0-9]{64}$/.test(value)) {
    throw new AuthSessionStoreIntegrityError(
      `Refresh token ${tokenId} does not contain a lowercase SHA-256 hash`,
    );
  }
};

const parseDate = (value: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AuthSessionStoreIntegrityError(
      `Invalid auth session date ${value}`,
    );
  }
  return date;
};

const toIso = (date: Date, field: string, id: string): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new AuthSessionStoreIntegrityError(`${field} is invalid for ${id}`);
  }
  return date.toISOString();
};
