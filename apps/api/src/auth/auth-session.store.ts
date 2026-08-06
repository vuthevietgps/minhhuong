import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { AccountRole } from './auth.types';

export const AUTH_SESSION_STORE = 'AUTH_SESSION_STORE';

export type AuthSessionState = 'ACTIVE' | 'ENDED' | 'REVOKED' | 'EXPIRED';

export type AuthSessionRecord = {
  id: string;
  userId: string;
  email: string;
  roles: AccountRole[];
  deviceId: string;
  state: AuthSessionState;
  issuedAt: string;
  expiresAt: string;
  endedAt?: string;
  revokedAt?: string;
  reason?: string;
};

export type AuthRefreshTokenState =
  'ACTIVE' | 'ROTATED' | 'REUSED' | 'REVOKED' | 'EXPIRED';

export type AuthRefreshTokenRecord = {
  id: string;
  sessionId: string;
  userId: string;
  deviceId: string;
  tokenHash: string;
  state: AuthRefreshTokenState;
  issuedAt: string;
  expiresAt: string;
  rotatedAt?: string;
  reusedAt?: string;
  revokedAt?: string;
  replacedByTokenId?: string;
  reason?: string;
};

export type AuthSessionAuditAction =
  | 'SESSION_CREATED'
  | 'SESSION_ENDED'
  | 'SESSION_REVOKED'
  | 'SESSION_EXPIRED'
  | 'REFRESH_TOKEN_ISSUED'
  | 'REFRESH_TOKEN_ROTATED'
  | 'REFRESH_TOKEN_DENIED'
  | 'REFRESH_TOKEN_REUSE_DENIED'
  | 'SESSION_CLEANUP_EXPIRED';

export type AuthSessionAuditEvent = {
  id: string;
  createdAt: string;
  action: AuthSessionAuditAction;
  sessionId?: string;
  refreshTokenId?: string;
  userId?: string;
  deviceId?: string;
  reason?: string;
  visibleToRoles: Extract<AccountRole, 'ADMIN' | 'SUPPORT'>[];
  metadata?: Record<string, string | number | boolean | null>;
};

export type AuthSessionCleanupResult = {
  expiredSessionIds: string[];
  expiredRefreshTokenIds: string[];
};

export type AuthSessionAuditEventInput = Omit<
  AuthSessionAuditEvent,
  'id' | 'createdAt'
> & {
  createdAt?: string;
};

export interface AuthSessionStore {
  createSession(record: AuthSessionRecord): Promise<AuthSessionRecord>;
  updateSession(record: AuthSessionRecord): Promise<AuthSessionRecord>;
  endSessionAtomically(
    sessionId: string,
    userId: string,
    reason: string,
    endedAt: string,
  ): Promise<AuthSessionRecord | undefined>;
  revokeSessionAtomically(
    sessionId: string,
    reason: string,
    revokedAt: string,
  ): Promise<AuthSessionRecord | undefined>;
  findSessionById(sessionId: string): Promise<AuthSessionRecord | undefined>;
  listSessionsForUser(userId: string): Promise<AuthSessionRecord[]>;
  createRefreshToken(
    record: AuthRefreshTokenRecord,
  ): Promise<AuthRefreshTokenRecord>;
  updateRefreshToken(
    record: AuthRefreshTokenRecord,
  ): Promise<AuthRefreshTokenRecord>;
  rotateRefreshTokenAtomically(
    current: AuthRefreshTokenRecord,
    replacement: AuthRefreshTokenRecord,
  ): Promise<boolean>;
  findRefreshTokenById(
    tokenId: string,
  ): Promise<AuthRefreshTokenRecord | undefined>;
  listRefreshTokensForSession(
    sessionId: string,
  ): Promise<AuthRefreshTokenRecord[]>;
  appendAuditEvent(
    event: AuthSessionAuditEventInput,
  ): Promise<AuthSessionAuditEvent>;
  listAuditEventsForRoles(
    roles: readonly AccountRole[],
  ): Promise<AuthSessionAuditEvent[]>;
  cleanupExpired(now: Date): Promise<AuthSessionCleanupResult>;
}

export class AuthSessionStoreUnavailableError extends Error {
  constructor(operation: string, options?: { cause?: unknown }) {
    super(`Auth session repository unavailable during ${operation}`, options);
    this.name = 'AuthSessionStoreUnavailableError';
  }
}

export class AuthSessionStoreIntegrityError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AuthSessionStoreIntegrityError';
  }
}

@Injectable()
export class FixtureBackedAuthSessionStore implements AuthSessionStore {
  private readonly sessions = new Map<string, AuthSessionRecord>();
  private readonly refreshTokens = new Map<string, AuthRefreshTokenRecord>();
  private readonly auditEvents: AuthSessionAuditEvent[] = [];

  constructor(input?: {
    sessions?: AuthSessionRecord[];
    refreshTokens?: AuthRefreshTokenRecord[];
    auditEvents?: AuthSessionAuditEvent[];
  }) {
    for (const session of input?.sessions ?? []) {
      this.sessions.set(session.id, cloneSession(session));
    }

    for (const refreshToken of input?.refreshTokens ?? []) {
      this.refreshTokens.set(refreshToken.id, cloneRefreshToken(refreshToken));
    }

    for (const auditEvent of input?.auditEvents ?? []) {
      this.auditEvents.push(cloneAuditEvent(auditEvent));
    }
  }

  async createSession(record: AuthSessionRecord): Promise<AuthSessionRecord> {
    await Promise.resolve();
    const session = cloneSession(record);
    this.sessions.set(session.id, session);
    return cloneSession(session);
  }

  async updateSession(record: AuthSessionRecord): Promise<AuthSessionRecord> {
    await Promise.resolve();
    const session = cloneSession(record);
    this.sessions.set(session.id, session);
    return cloneSession(session);
  }

  async endSessionAtomically(
    sessionId: string,
    userId: string,
    reason: string,
    endedAt: string,
  ): Promise<AuthSessionRecord | undefined> {
    await Promise.resolve();
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) {
      return undefined;
    }

    if (session.state === 'ACTIVE') {
      session.state = 'ENDED';
      session.endedAt = endedAt;
      session.reason = reason;
    }

    const terminalReason = session.reason ?? reason;
    const terminalAt = session.endedAt ?? session.revokedAt ?? endedAt;
    for (const refreshToken of this.refreshTokens.values()) {
      if (
        refreshToken.sessionId !== sessionId ||
        refreshToken.state !== 'ACTIVE'
      ) {
        continue;
      }
      refreshToken.state = 'REVOKED';
      refreshToken.revokedAt = terminalAt;
      refreshToken.reason = terminalReason;
    }

    return session.state === 'ENDED' ? cloneSession(session) : undefined;
  }

  async revokeSessionAtomically(
    sessionId: string,
    reason: string,
    revokedAt: string,
  ): Promise<AuthSessionRecord | undefined> {
    await Promise.resolve();
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    if (session.state !== 'REVOKED') {
      session.state = 'REVOKED';
      session.revokedAt = revokedAt;
      session.reason = reason;
    }

    for (const refreshToken of this.refreshTokens.values()) {
      if (
        refreshToken.sessionId !== sessionId ||
        refreshToken.state !== 'ACTIVE'
      ) {
        continue;
      }
      refreshToken.state = 'REVOKED';
      refreshToken.revokedAt = revokedAt;
      refreshToken.reason = reason;
    }

    return cloneSession(session);
  }

  async findSessionById(
    sessionId: string,
  ): Promise<AuthSessionRecord | undefined> {
    await Promise.resolve();
    const session = this.sessions.get(sessionId);
    return session ? cloneSession(session) : undefined;
  }

  async listSessionsForUser(userId: string): Promise<AuthSessionRecord[]> {
    await Promise.resolve();
    return [...this.sessions.values()]
      .filter((session) => session.userId === userId)
      .map(cloneSession);
  }

  async createRefreshToken(
    record: AuthRefreshTokenRecord,
  ): Promise<AuthRefreshTokenRecord> {
    await Promise.resolve();
    const refreshToken = cloneRefreshToken(record);
    this.refreshTokens.set(refreshToken.id, refreshToken);
    return cloneRefreshToken(refreshToken);
  }

  async updateRefreshToken(
    record: AuthRefreshTokenRecord,
  ): Promise<AuthRefreshTokenRecord> {
    await Promise.resolve();
    const refreshToken = cloneRefreshToken(record);
    this.refreshTokens.set(refreshToken.id, refreshToken);
    return cloneRefreshToken(refreshToken);
  }

  async rotateRefreshTokenAtomically(
    current: AuthRefreshTokenRecord,
    replacement: AuthRefreshTokenRecord,
  ): Promise<boolean> {
    await Promise.resolve();
    const persisted = this.refreshTokens.get(current.id);
    if (
      !persisted ||
      persisted.state !== 'ACTIVE' ||
      persisted.tokenHash !== current.tokenHash
    ) {
      return false;
    }
    if (
      replacement.sessionId !== current.sessionId ||
      replacement.userId !== current.userId ||
      replacement.deviceId !== current.deviceId
    ) {
      throw new AuthSessionStoreIntegrityError(
        'Refresh-token rotation replacement ownership is inconsistent',
      );
    }

    this.refreshTokens.set(current.id, cloneRefreshToken(current));
    this.refreshTokens.set(replacement.id, cloneRefreshToken(replacement));
    return true;
  }

  async findRefreshTokenById(
    tokenId: string,
  ): Promise<AuthRefreshTokenRecord | undefined> {
    await Promise.resolve();
    const refreshToken = this.refreshTokens.get(tokenId);
    return refreshToken ? cloneRefreshToken(refreshToken) : undefined;
  }

  async listRefreshTokensForSession(
    sessionId: string,
  ): Promise<AuthRefreshTokenRecord[]> {
    await Promise.resolve();
    return [...this.refreshTokens.values()]
      .filter((refreshToken) => refreshToken.sessionId === sessionId)
      .map(cloneRefreshToken);
  }

  async appendAuditEvent(
    event: AuthSessionAuditEventInput,
  ): Promise<AuthSessionAuditEvent> {
    await Promise.resolve();
    const auditEvent: AuthSessionAuditEvent = {
      ...event,
      id: randomUUID(),
      createdAt: event.createdAt ?? new Date().toISOString(),
      visibleToRoles: [...event.visibleToRoles],
      metadata: event.metadata ? { ...event.metadata } : undefined,
    };
    this.auditEvents.push(auditEvent);
    return cloneAuditEvent(auditEvent);
  }

  async listAuditEventsForRoles(
    roles: readonly AccountRole[],
  ): Promise<AuthSessionAuditEvent[]> {
    await Promise.resolve();
    const canViewAudit = roles.some((role) =>
      ['ADMIN', 'SUPPORT'].includes(role),
    );

    if (!canViewAudit) {
      return [];
    }

    return this.auditEvents.map(cloneAuditEvent);
  }

  async cleanupExpired(now: Date): Promise<AuthSessionCleanupResult> {
    await Promise.resolve();
    const nowMs = now.getTime();
    const expiredSessionIds: string[] = [];
    const expiredRefreshTokenIds: string[] = [];

    for (const session of this.sessions.values()) {
      if (session.state !== 'ACTIVE') {
        continue;
      }

      if (new Date(session.expiresAt).getTime() > nowMs) {
        continue;
      }

      session.state = 'EXPIRED';
      session.endedAt = now.toISOString();
      session.reason = 'SESSION_EXPIRED';
      expiredSessionIds.push(session.id);
    }

    for (const refreshToken of this.refreshTokens.values()) {
      if (refreshToken.state !== 'ACTIVE') {
        continue;
      }

      const sessionExpired = expiredSessionIds.includes(refreshToken.sessionId);
      const refreshExpired =
        new Date(refreshToken.expiresAt).getTime() <= nowMs;

      if (!sessionExpired && !refreshExpired) {
        continue;
      }

      refreshToken.state = 'EXPIRED';
      refreshToken.reason = sessionExpired
        ? 'SESSION_EXPIRED'
        : 'REFRESH_TOKEN_EXPIRED';
      expiredRefreshTokenIds.push(refreshToken.id);
    }

    return { expiredSessionIds, expiredRefreshTokenIds };
  }
}

export const hashAuthRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const cloneSession = (
  session: AuthSessionRecord,
): AuthSessionRecord => ({
  ...session,
  roles: [...session.roles],
});

export const cloneRefreshToken = (
  refreshToken: AuthRefreshTokenRecord,
): AuthRefreshTokenRecord => ({
  ...refreshToken,
});

export const cloneAuditEvent = (
  auditEvent: AuthSessionAuditEvent,
): AuthSessionAuditEvent => ({
  ...auditEvent,
  visibleToRoles: [...auditEvent.visibleToRoles],
  metadata: auditEvent.metadata ? { ...auditEvent.metadata } : undefined,
});
