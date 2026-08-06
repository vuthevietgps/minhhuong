import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

export const AUTH_OPERATIONAL_CONTROL = 'AUTH_OPERATIONAL_CONTROL';

export type AuthRateLimitSurface = 'LOGIN' | 'REFRESH';

export type AuthOperationalEventKind =
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCEEDED'
  | 'LOGIN_DENIED'
  | 'LOGIN_THROTTLED'
  | 'REFRESH_ATTEMPT'
  | 'REFRESH_SUCCEEDED'
  | 'REFRESH_DENIED'
  | 'REFRESH_THROTTLED'
  | 'REFRESH_REPLAY_DENIED'
  | 'SESSION_REPOSITORY_ERROR'
  | 'SESSION_CLEANUP_RUN'
  | 'SESSION_CLEANUP_EXPIRED_SESSION'
  | 'SESSION_CLEANUP_EXPIRED_REFRESH_TOKEN'
  | 'AUDIT_EXPORT_REQUESTED'
  | 'AUDIT_EXPORT_DENIED'
  | 'AUDIT_EXPORT_ROW';

export type AuthOperationalEvent = {
  kind: AuthOperationalEventKind;
  value?: number;
  occurredAt?: Date;
};

export type AuthOperationalMetric = {
  kind: AuthOperationalEventKind;
  count: number;
  lastOccurredAt: string;
};

export type AuthOperationalSnapshot = {
  generatedAt: string;
  counters: AuthOperationalMetric[];
  window: {
    requestedWindowMs: number;
    requestedStartedAt: string;
    effectiveStartedAt: string;
    endedAt: string;
    source: 'EVENT_TIME' | 'METRIC_BUCKET_START';
    bucketResolutionMs: number | null;
  };
  retention: {
    metricRetentionMs: number;
    rateLimitAttemptsRetainedUntilWindowEnd: true;
  };
  safety: {
    rawRateLimitKeysExposed: false;
    externalProviderUsed: false;
    productionReady: false;
    sharedStore: boolean;
    rateLimitKeyProtection: 'SHA256' | 'HMAC_SHA256';
  };
};

export type AuthOperationalCleanupResult = {
  expiredRateLimitAttempts: number;
  expiredMetricBuckets: number;
};

export type AuthOperationalSnapshotQuery = {
  now?: Date;
  windowMs?: number;
};

export interface AuthOperationalControl {
  assertRateLimit(input: {
    surface: AuthRateLimitSurface;
    key: string;
    now?: Date;
  }): Promise<void>;
  record(event: AuthOperationalEvent): Promise<void>;
  snapshot(
    query?: Date | AuthOperationalSnapshotQuery,
  ): Promise<AuthOperationalSnapshot>;
  cleanupExpired(now?: Date): Promise<AuthOperationalCleanupResult>;
}

export class AuthRateLimitExceededError extends Error {
  constructor(
    readonly surface: AuthRateLimitSurface,
    readonly retryAfterSeconds: number,
  ) {
    super(`${surface.toLowerCase()} rate limit exceeded`);
    this.name = 'AuthRateLimitExceededError';
  }
}

export class AuthOperationalControlUnavailableError extends Error {
  constructor(operation: string, options?: { cause?: unknown }) {
    super(`Auth operational control unavailable during ${operation}`, options);
    this.name = 'AuthOperationalControlUnavailableError';
  }
}

export type AuthRateLimitPolicy = {
  maxAttempts: number;
  windowMs: number;
};

export const defaultAuthRateLimitPolicies: Record<
  AuthRateLimitSurface,
  AuthRateLimitPolicy
> = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
  },
  REFRESH: {
    maxAttempts: 10,
    windowMs: 60 * 1000,
  },
};

export const defaultAuthMetricRetentionMs = 30 * 24 * 60 * 60 * 1000;

export const resolveAuthOperationalSnapshotQuery = (
  query: Date | AuthOperationalSnapshotQuery | undefined,
  input: { clock: () => Date; defaultWindowMs: number },
) => {
  const now = query instanceof Date ? query : (query?.now ?? input.clock());
  const windowMs =
    query instanceof Date
      ? input.defaultWindowMs
      : (query?.windowMs ?? input.defaultWindowMs);
  if (!Number.isSafeInteger(windowMs) || windowMs <= 0) {
    throw new Error('Auth operational snapshot window must be positive');
  }
  return { now, windowMs };
};

@Injectable()
export class FixtureBackedAuthOperationalControl implements AuthOperationalControl {
  private readonly attempts = new Map<string, number[]>();
  private readonly counters = new Map<
    AuthOperationalEventKind,
    AuthOperationalMetric
  >();
  private readonly counterExpiresAt = new Map<
    AuthOperationalEventKind,
    number
  >();
  private readonly events: Array<{
    kind: AuthOperationalEventKind;
    value: number;
    occurredAt: number;
  }> = [];
  private readonly clock: () => Date;
  private readonly policies: Record<AuthRateLimitSurface, AuthRateLimitPolicy>;
  private readonly metricRetentionMs: number;
  private readonly unavailable: boolean;

  constructor(input?: {
    clock?: () => Date;
    policies?: Partial<Record<AuthRateLimitSurface, AuthRateLimitPolicy>>;
    metricRetentionMs?: number;
    unavailable?: boolean;
  }) {
    this.clock = input?.clock ?? (() => new Date());
    this.policies = {
      LOGIN: input?.policies?.LOGIN ?? defaultAuthRateLimitPolicies.LOGIN,
      REFRESH: input?.policies?.REFRESH ?? defaultAuthRateLimitPolicies.REFRESH,
    };
    this.metricRetentionMs =
      input?.metricRetentionMs ?? defaultAuthMetricRetentionMs;
    this.unavailable = input?.unavailable ?? false;
  }

  async assertRateLimit(input: {
    surface: AuthRateLimitSurface;
    key: string;
    now?: Date;
  }): Promise<void> {
    if (this.unavailable) {
      throw new AuthOperationalControlUnavailableError(
        `${input.surface.toLowerCase()} rate-limit check`,
      );
    }

    const now = input.now ?? this.clock();
    const policy = this.policies[input.surface];
    const rateLimitKey = `${input.surface}:${hashRateLimitKey(input.key)}`;
    const cutoff = now.getTime() - policy.windowMs;
    const currentAttempts = (this.attempts.get(rateLimitKey) ?? []).filter(
      (attemptedAt) => attemptedAt > cutoff,
    );

    if (currentAttempts.length >= policy.maxAttempts) {
      await this.record({
        kind: `${input.surface}_THROTTLED`,
        occurredAt: now,
      });
      const oldestAttempt = currentAttempts[0] ?? now.getTime();
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldestAttempt + policy.windowMs - now.getTime()) / 1000),
      );
      throw new AuthRateLimitExceededError(input.surface, retryAfterSeconds);
    }

    currentAttempts.push(now.getTime());
    this.attempts.set(rateLimitKey, currentAttempts);
    await this.record({
      kind: `${input.surface}_ATTEMPT`,
      occurredAt: now,
    });
  }

  async record(event: AuthOperationalEvent): Promise<void> {
    await Promise.resolve();
    const occurredAt = event.occurredAt ?? this.clock();
    const currentExpiry = this.counterExpiresAt.get(event.kind) ?? 0;
    const existing =
      currentExpiry > occurredAt.getTime()
        ? this.counters.get(event.kind)
        : undefined;
    this.counters.set(event.kind, {
      kind: event.kind,
      count: (existing?.count ?? 0) + (event.value ?? 1),
      lastOccurredAt: occurredAt.toISOString(),
    });
    this.counterExpiresAt.set(
      event.kind,
      occurredAt.getTime() + this.metricRetentionMs,
    );
    this.events.push({
      kind: event.kind,
      value: event.value ?? 1,
      occurredAt: occurredAt.getTime(),
    });
  }

  async snapshot(
    query?: Date | AuthOperationalSnapshotQuery,
  ): Promise<AuthOperationalSnapshot> {
    await Promise.resolve();
    if (this.unavailable) {
      throw new AuthOperationalControlUnavailableError('metric snapshot');
    }
    const { now, windowMs } = resolveAuthOperationalSnapshotQuery(query, {
      clock: this.clock,
      defaultWindowMs: this.metricRetentionMs,
    });
    const startedAt = new Date(now.getTime() - windowMs);
    const grouped = new Map<AuthOperationalEventKind, AuthOperationalMetric>();
    for (const event of this.events) {
      if (
        event.occurredAt < startedAt.getTime() ||
        event.occurredAt > now.getTime()
      ) {
        continue;
      }
      const existing = grouped.get(event.kind);
      grouped.set(event.kind, {
        kind: event.kind,
        count: (existing?.count ?? 0) + event.value,
        lastOccurredAt: new Date(
          Math.max(
            existing ? new Date(existing.lastOccurredAt).getTime() : 0,
            event.occurredAt,
          ),
        ).toISOString(),
      });
    }
    return {
      generatedAt: now.toISOString(),
      counters: [...grouped.values()]
        .map((counter) => ({ ...counter }))
        .sort((left, right) => left.kind.localeCompare(right.kind)),
      window: {
        requestedWindowMs: windowMs,
        requestedStartedAt: startedAt.toISOString(),
        effectiveStartedAt: startedAt.toISOString(),
        endedAt: now.toISOString(),
        source: 'EVENT_TIME',
        bucketResolutionMs: null,
      },
      retention: {
        metricRetentionMs: this.metricRetentionMs,
        rateLimitAttemptsRetainedUntilWindowEnd: true,
      },
      safety: {
        rawRateLimitKeysExposed: false,
        externalProviderUsed: false,
        productionReady: false,
        sharedStore: false,
        rateLimitKeyProtection: 'SHA256',
      },
    };
  }

  async cleanupExpired(
    now = this.clock(),
  ): Promise<AuthOperationalCleanupResult> {
    await Promise.resolve();
    let expiredRateLimitAttempts = 0;
    for (const [rateLimitKey, attemptedAt] of this.attempts.entries()) {
      const surface = rateLimitKey.startsWith('LOGIN:') ? 'LOGIN' : 'REFRESH';
      const cutoff = now.getTime() - this.policies[surface].windowMs;
      const current = attemptedAt.filter((timestamp) => timestamp > cutoff);
      expiredRateLimitAttempts += attemptedAt.length - current.length;
      if (current.length === 0) {
        this.attempts.delete(rateLimitKey);
      } else {
        this.attempts.set(rateLimitKey, current);
      }
    }

    let expiredMetricBuckets = 0;
    for (const [kind, expiresAt] of this.counterExpiresAt.entries()) {
      if (expiresAt > now.getTime()) {
        continue;
      }
      this.counterExpiresAt.delete(kind);
      this.counters.delete(kind);
      expiredMetricBuckets += 1;
    }

    const metricCutoff = now.getTime() - this.metricRetentionMs;
    const currentEvents = this.events.filter(
      (event) => event.occurredAt > metricCutoff,
    );
    this.events.splice(0, this.events.length, ...currentEvents);

    return { expiredRateLimitAttempts, expiredMetricBuckets };
  }
}

const hashRateLimitKey = (key: string) =>
  createHash('sha256').update(key.trim().toLowerCase()).digest('hex');
