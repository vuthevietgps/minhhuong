import {
  Inject,
  Injectable,
  Optional,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import {
  AUTH_OPERATIONAL_CONTROL,
  FixtureBackedAuthOperationalControl,
} from './auth-operational-control';
import type {
  AuthOperationalControl,
  AuthOperationalEventKind,
} from './auth-operational-control';
import {
  AUTH_SESSION_STORE,
  AuthSessionStoreIntegrityError,
  AuthSessionStoreUnavailableError,
  FixtureBackedAuthSessionStore,
  hashAuthRefreshToken,
} from './auth-session.store';
import type {
  AuthRefreshTokenRecord,
  AuthSessionAuditEvent,
  AuthSessionRecord,
  AuthSessionState,
  AuthSessionStore,
} from './auth-session.store';
import { AccountRole, AuthenticatedUser } from './auth.types';

export type { AuthRefreshTokenRecord, AuthSessionRecord, AuthSessionState };

@Injectable()
export class AuthSessionService {
  private readonly refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000;

  constructor(
    @Optional()
    @Inject(AUTH_SESSION_STORE)
    private readonly store: AuthSessionStore = new FixtureBackedAuthSessionStore(),
    @Optional()
    @Inject(AUTH_OPERATIONAL_CONTROL)
    private readonly operationalControl: AuthOperationalControl = new FixtureBackedAuthOperationalControl(),
  ) {}

  async createSession(input: {
    userId: string;
    email: string;
    roles: AccountRole[];
    deviceId?: string;
    expiresAt: Date;
  }) {
    const session: AuthSessionRecord = {
      id: randomUUID(),
      userId: input.userId,
      email: input.email,
      roles: [...input.roles],
      deviceId: input.deviceId ?? 'local-demo-web',
      state: 'ACTIVE',
      issuedAt: new Date().toISOString(),
      expiresAt: input.expiresAt.toISOString(),
    };

    const persisted = await this.storeCall(() =>
      this.store.createSession(session),
    );
    await this.audit({
      action: 'SESSION_CREATED',
      sessionId: persisted.id,
      userId: persisted.userId,
      deviceId: persisted.deviceId,
    });

    return persisted;
  }

  async endSession(sessionId: string, userId: string, reason = 'LOGOUT') {
    const session = await this.storeCall(() =>
      this.store.endSessionAtomically(
        sessionId,
        userId,
        reason,
        new Date().toISOString(),
      ),
    );

    if (!session) {
      return false;
    }
    await this.audit({
      action: 'SESSION_ENDED',
      sessionId: session.id,
      userId: session.userId,
      deviceId: session.deviceId,
      reason,
    });

    return true;
  }

  async revokeSession(sessionId: string, reason = 'DEVICE_REVOKED') {
    const session = await this.storeCall(() =>
      this.store.revokeSessionAtomically(
        sessionId,
        reason,
        new Date().toISOString(),
      ),
    );

    if (!session) {
      return false;
    }

    await this.audit({
      action: 'SESSION_REVOKED',
      sessionId: session.id,
      userId: session.userId,
      deviceId: session.deviceId,
      reason,
    });

    return true;
  }

  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
    reason = 'CROSS_DEVICE_REVOKED',
  ) {
    const sessions = await this.storeCall(() =>
      this.store.listSessionsForUser(userId),
    );
    const revokedSessionIds: string[] = [];
    for (const session of sessions) {
      if (session.id === currentSessionId || session.state !== 'ACTIVE') {
        continue;
      }
      await this.revokeSession(session.id, reason);
      revokedSessionIds.push(session.id);
    }
    return revokedSessionIds;
  }

  async assertTokenSessionActive(user: AuthenticatedUser) {
    if (!user.sid) {
      return;
    }

    const session = await this.storeCall(() =>
      this.store.findSessionById(user.sid as string),
    );

    if (!session || session.userId !== user.sub) {
      throw new UnauthorizedException('Invalid session');
    }

    await this.assertSessionRecordActive(session);
  }

  async getSession(sessionId: string) {
    return this.storeCall(() => this.store.findSessionById(sessionId));
  }

  async listSessionsForUser(userId: string) {
    return this.storeCall(() => this.store.listSessionsForUser(userId));
  }

  async issueRefreshToken(input: {
    sessionId: string;
    userId: string;
    expiresAt?: Date;
  }) {
    const session = await this.storeCall(() =>
      this.store.findSessionById(input.sessionId),
    );

    if (!session || session.userId !== input.userId) {
      throw new UnauthorizedException('Invalid session');
    }

    await this.assertSessionRecordActive(session);

    const id = randomUUID();
    const token = `${id}.${randomBytes(32).toString('hex')}`;
    const refreshToken = await this.storeCall(() =>
      this.store.createRefreshToken({
        id,
        sessionId: session.id,
        userId: session.userId,
        deviceId: session.deviceId,
        tokenHash: hashAuthRefreshToken(token),
        state: 'ACTIVE',
        issuedAt: new Date().toISOString(),
        expiresAt:
          input.expiresAt?.toISOString() ??
          new Date(Date.now() + this.refreshTokenTtlMs).toISOString(),
      }),
    );

    await this.audit({
      action: 'REFRESH_TOKEN_ISSUED',
      sessionId: session.id,
      refreshTokenId: refreshToken.id,
      userId: session.userId,
      deviceId: session.deviceId,
    });

    return {
      id: refreshToken.id,
      token,
      expiresAt: refreshToken.expiresAt,
    };
  }

  async rotateRefreshToken(rawToken: string, now = new Date()) {
    const tokenId = this.extractRefreshTokenId(rawToken);
    const refreshToken = tokenId
      ? await this.storeCall(() => this.store.findRefreshTokenById(tokenId))
      : undefined;

    if (!refreshToken || !this.matchesRefreshToken(rawToken, refreshToken)) {
      await this.audit({
        action: 'REFRESH_TOKEN_DENIED',
        refreshTokenId: tokenId,
        reason: 'INVALID_REFRESH_TOKEN',
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.state !== 'ACTIVE') {
      await this.markRefreshTokenReuse(refreshToken, now);
      throw new UnauthorizedException('Refresh token reuse denied');
    }

    if (new Date(refreshToken.expiresAt).getTime() <= now.getTime()) {
      refreshToken.state = 'EXPIRED';
      refreshToken.reason = 'REFRESH_TOKEN_EXPIRED';
      await this.storeCall(() => this.store.updateRefreshToken(refreshToken));
      await this.audit({
        action: 'REFRESH_TOKEN_DENIED',
        sessionId: refreshToken.sessionId,
        refreshTokenId: refreshToken.id,
        userId: refreshToken.userId,
        deviceId: refreshToken.deviceId,
        reason: 'REFRESH_TOKEN_EXPIRED',
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const session = await this.storeCall(() =>
      this.store.findSessionById(refreshToken.sessionId),
    );

    if (!session || session.userId !== refreshToken.userId) {
      throw new UnauthorizedException('Invalid session');
    }

    await this.assertSessionRecordActive(session);

    const nextRefreshTokenId = randomUUID();
    const nextRawRefreshToken = `${nextRefreshTokenId}.${randomBytes(32).toString('hex')}`;
    const nextRefreshToken: AuthRefreshTokenRecord = {
      id: nextRefreshTokenId,
      sessionId: session.id,
      userId: session.userId,
      deviceId: session.deviceId,
      tokenHash: hashAuthRefreshToken(nextRawRefreshToken),
      state: 'ACTIVE',
      issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + this.refreshTokenTtlMs).toISOString(),
    };
    refreshToken.state = 'ROTATED';
    refreshToken.rotatedAt = now.toISOString();
    refreshToken.replacedByTokenId = nextRefreshTokenId;
    refreshToken.reason = 'REFRESH_TOKEN_ROTATED';
    const rotationClaimed = await this.storeCall(() =>
      this.store.rotateRefreshTokenAtomically(refreshToken, nextRefreshToken),
    );
    if (!rotationClaimed) {
      const latest = await this.storeCall(() =>
        this.store.findRefreshTokenById(refreshToken.id),
      );
      if (latest) {
        await this.markRefreshTokenReuse(latest, now);
      }
      throw new UnauthorizedException('Refresh token reuse denied');
    }
    await this.audit({
      action: 'REFRESH_TOKEN_ISSUED',
      sessionId: session.id,
      refreshTokenId: nextRefreshTokenId,
      userId: session.userId,
      deviceId: session.deviceId,
    });
    await this.audit({
      action: 'REFRESH_TOKEN_ROTATED',
      sessionId: session.id,
      refreshTokenId: refreshToken.id,
      userId: session.userId,
      deviceId: session.deviceId,
      reason: 'REFRESH_TOKEN_ROTATED',
      metadata: { replacedByTokenId: nextRefreshTokenId },
    });

    return {
      session,
      refreshToken: nextRawRefreshToken,
      refreshTokenId: nextRefreshTokenId,
      refreshTokenExpiresAt: nextRefreshToken.expiresAt,
    };
  }

  async getRefreshToken(tokenId: string) {
    return this.storeCall(() => this.store.findRefreshTokenById(tokenId));
  }

  async listRefreshTokensForSession(sessionId: string) {
    return this.storeCall(() =>
      this.store.listRefreshTokensForSession(sessionId),
    );
  }

  async cleanupExpiredSessions(now = new Date()) {
    const result = await this.storeCall(() => this.store.cleanupExpired(now));

    await this.recordOperationalEvent('SESSION_CLEANUP_RUN');
    await this.recordOperationalEvent(
      'SESSION_CLEANUP_EXPIRED_SESSION',
      result.expiredSessionIds.length,
    );
    await this.recordOperationalEvent(
      'SESSION_CLEANUP_EXPIRED_REFRESH_TOKEN',
      result.expiredRefreshTokenIds.length,
    );

    if (
      result.expiredSessionIds.length > 0 ||
      result.expiredRefreshTokenIds.length > 0
    ) {
      await this.audit({
        action: 'SESSION_CLEANUP_EXPIRED',
        reason: 'SESSION_OR_REFRESH_TOKEN_EXPIRED',
        metadata: {
          expiredSessionCount: result.expiredSessionIds.length,
          expiredRefreshTokenCount: result.expiredRefreshTokenIds.length,
        },
      });
    }

    return result;
  }

  async listAuditEventsForRoles(roles: readonly AccountRole[]) {
    await this.recordOperationalEvent('AUDIT_EXPORT_REQUESTED');
    const events = await this.storeCall(() =>
      this.store.listAuditEventsForRoles(roles),
    );
    const canViewAudit = roles.some((role) =>
      ['ADMIN', 'SUPPORT'].includes(role),
    );
    if (!canViewAudit) {
      await this.recordOperationalEvent('AUDIT_EXPORT_DENIED');
    }
    await this.recordOperationalEvent('AUDIT_EXPORT_ROW', events.length);
    return events;
  }

  private async assertSessionRecordActive(session: AuthSessionRecord) {
    if (session.state === 'ENDED') {
      throw new UnauthorizedException('Session has ended');
    }

    if (session.state === 'REVOKED') {
      throw new UnauthorizedException('Session has been revoked');
    }

    if (session.state === 'EXPIRED') {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      session.state = 'EXPIRED';
      session.endedAt = new Date().toISOString();
      session.reason = 'SESSION_EXPIRED';
      await this.storeCall(() => this.store.updateSession(session));
      await this.audit({
        action: 'SESSION_EXPIRED',
        sessionId: session.id,
        userId: session.userId,
        deviceId: session.deviceId,
        reason: 'SESSION_EXPIRED',
      });
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async markRefreshTokenReuse(
    refreshToken: AuthRefreshTokenRecord,
    now: Date,
  ) {
    if (refreshToken.state !== 'REUSED') {
      refreshToken.state = 'REUSED';
      refreshToken.reusedAt = now.toISOString();
      refreshToken.reason = 'REFRESH_TOKEN_REUSED';
      await this.storeCall(() => this.store.updateRefreshToken(refreshToken));
    }

    await this.revokeSession(refreshToken.sessionId, 'REFRESH_TOKEN_REUSED');
    await this.audit({
      action: 'REFRESH_TOKEN_REUSE_DENIED',
      sessionId: refreshToken.sessionId,
      refreshTokenId: refreshToken.id,
      userId: refreshToken.userId,
      deviceId: refreshToken.deviceId,
      reason: 'REFRESH_TOKEN_REUSED',
    });
    await this.recordOperationalEvent('REFRESH_REPLAY_DENIED');
  }

  private extractRefreshTokenId(rawToken: string) {
    const [tokenId, tokenSecret] = rawToken.split('.');
    return tokenId && tokenSecret ? tokenId : undefined;
  }

  private matchesRefreshToken(
    rawToken: string,
    refreshToken: AuthRefreshTokenRecord,
  ) {
    const actual = Buffer.from(hashAuthRefreshToken(rawToken));
    const expected = Buffer.from(refreshToken.tokenHash);

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private async audit(
    event: Omit<AuthSessionAuditEvent, 'id' | 'createdAt' | 'visibleToRoles'>,
  ) {
    await this.storeCall(() =>
      this.store.appendAuditEvent({
        ...event,
        visibleToRoles: ['ADMIN', 'SUPPORT'],
      }),
    );
  }

  private async storeCall<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof AuthSessionStoreUnavailableError ||
        error instanceof AuthSessionStoreIntegrityError
      ) {
        await this.recordOperationalEvent('SESSION_REPOSITORY_ERROR');
        throw new ServiceUnavailableException(
          'Authentication session repository unavailable',
        );
      }
      throw error;
    }
  }

  private async recordOperationalEvent(
    kind: AuthOperationalEventKind,
    value = 1,
  ) {
    if (value <= 0) {
      return;
    }

    try {
      await this.operationalControl.record({ kind, value });
    } catch {
      // Authentication remains fail-closed at the repository/rate-limit seams;
      // telemetry export itself must not create a partial login/session response.
    }
  }
}
