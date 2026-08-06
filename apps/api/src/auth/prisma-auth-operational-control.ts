import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { createHmac, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthOperationalCleanupResult,
  AuthOperationalControl,
  AuthOperationalControlUnavailableError,
  AuthOperationalEvent,
  AuthOperationalSnapshot,
  AuthOperationalSnapshotQuery,
  AuthRateLimitExceededError,
  AuthRateLimitPolicy,
  AuthRateLimitSurface,
  defaultAuthMetricRetentionMs,
  defaultAuthRateLimitPolicies,
  resolveAuthOperationalSnapshotQuery,
} from './auth-operational-control';

type PrismaAuthOperationalControlOptions = {
  keySecret: string;
  clock?: () => Date;
  policies?: Partial<Record<AuthRateLimitSurface, AuthRateLimitPolicy>>;
  metricRetentionMs?: number;
  metricBucketMs?: number;
};

type RateLimitOutcome =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

const defaultMetricBucketMs = 60 * 1000;

@Injectable()
export class PrismaAuthOperationalControl implements AuthOperationalControl {
  private readonly clock: () => Date;
  private readonly policies: Record<AuthRateLimitSurface, AuthRateLimitPolicy>;
  private readonly metricRetentionMs: number;
  private readonly metricBucketMs: number;
  private readonly keySecret: string;

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaClient,
    input: PrismaAuthOperationalControlOptions,
  ) {
    if (input.keySecret.trim().length < 32) {
      throw new Error(
        'Prisma auth operational control requires a non-placeholder key secret of at least 32 characters',
      );
    }
    this.keySecret = input.keySecret;
    this.clock = input.clock ?? (() => new Date());
    this.policies = {
      LOGIN: input.policies?.LOGIN ?? defaultAuthRateLimitPolicies.LOGIN,
      REFRESH: input.policies?.REFRESH ?? defaultAuthRateLimitPolicies.REFRESH,
    };
    this.metricRetentionMs =
      input.metricRetentionMs ?? defaultAuthMetricRetentionMs;
    this.metricBucketMs = input.metricBucketMs ?? defaultMetricBucketMs;

    if (this.metricRetentionMs <= 0 || this.metricBucketMs <= 0) {
      throw new Error('Auth operational metric retention must be positive');
    }
  }

  async assertRateLimit(input: {
    surface: AuthRateLimitSurface;
    key: string;
    now?: Date;
  }): Promise<void> {
    const now = input.now ?? this.clock();
    const policy = this.policies[input.surface];
    const keyHash = this.hashRateLimitKey(input.key);
    const lockKey = `${input.surface}:${keyHash}`;
    const cutoff = new Date(now.getTime() - policy.windowMs);

    const outcome = await this.execute(
      `${input.surface.toLowerCase()} rate-limit check`,
      () =>
        this.prisma.$transaction(async (tx) => {
          await tx.$queryRaw`
            SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0)) IS NULL AS "locked"
          `;
          await tx.authRateLimitAttempt.deleteMany({
            where: {
              surface: input.surface,
              keyHash,
              expiresAt: { lte: now },
            },
          });

          const currentAttempts = await tx.authRateLimitAttempt.count({
            where: {
              surface: input.surface,
              keyHash,
              attemptedAt: { gt: cutoff },
            },
          });

          if (currentAttempts >= policy.maxAttempts) {
            const oldestAttempt = await tx.authRateLimitAttempt.findFirst({
              where: {
                surface: input.surface,
                keyHash,
                attemptedAt: { gt: cutoff },
              },
              orderBy: [{ attemptedAt: 'asc' }, { id: 'asc' }],
              select: { attemptedAt: true },
            });
            await this.recordWithClient(tx, {
              kind: `${input.surface}_THROTTLED`,
              occurredAt: now,
            });
            const oldestAttemptMs =
              oldestAttempt?.attemptedAt.getTime() ?? now.getTime();
            return {
              allowed: false,
              retryAfterSeconds: Math.max(
                1,
                Math.ceil(
                  (oldestAttemptMs + policy.windowMs - now.getTime()) / 1000,
                ),
              ),
            } satisfies RateLimitOutcome;
          }

          await tx.authRateLimitAttempt.create({
            data: {
              id: randomUUID(),
              surface: input.surface,
              keyHash,
              attemptedAt: now,
              expiresAt: new Date(now.getTime() + policy.windowMs),
            },
          });
          await this.recordWithClient(tx, {
            kind: `${input.surface}_ATTEMPT`,
            occurredAt: now,
          });
          return { allowed: true } satisfies RateLimitOutcome;
        }),
    );

    if (!outcome.allowed) {
      throw new AuthRateLimitExceededError(
        input.surface,
        outcome.retryAfterSeconds,
      );
    }
  }

  async record(event: AuthOperationalEvent): Promise<void> {
    await this.execute('metric record', () =>
      this.recordWithClient(this.prisma, event),
    );
  }

  async snapshot(
    query?: Date | AuthOperationalSnapshotQuery,
  ): Promise<AuthOperationalSnapshot> {
    return this.execute('metric snapshot', async () => {
      const { now, windowMs } = resolveAuthOperationalSnapshotQuery(query, {
        clock: this.clock,
        defaultWindowMs: this.metricRetentionMs,
      });
      const requestedStartedAt = new Date(now.getTime() - windowMs);
      const effectiveStartedAt = new Date(
        Math.ceil(requestedStartedAt.getTime() / this.metricBucketMs) *
          this.metricBucketMs,
      );
      const counters = await this.prisma.authOperationalMetricBucket.groupBy({
        by: ['kind'],
        where: {
          expiresAt: { gt: now },
          bucketStartedAt: { gte: effectiveStartedAt, lte: now },
          lastOccurredAt: { lte: now },
        },
        _sum: { count: true },
        _max: { lastOccurredAt: true },
      });

      return {
        generatedAt: now.toISOString(),
        counters: counters
          .map((counter) => ({
            kind: counter.kind as AuthOperationalEvent['kind'],
            count: counter._sum.count ?? 0,
            lastOccurredAt:
              counter._max.lastOccurredAt?.toISOString() ?? now.toISOString(),
          }))
          .sort((left, right) => left.kind.localeCompare(right.kind)),
        window: {
          requestedWindowMs: windowMs,
          requestedStartedAt: requestedStartedAt.toISOString(),
          effectiveStartedAt: effectiveStartedAt.toISOString(),
          endedAt: now.toISOString(),
          source: 'METRIC_BUCKET_START',
          bucketResolutionMs: this.metricBucketMs,
        },
        retention: {
          metricRetentionMs: this.metricRetentionMs,
          rateLimitAttemptsRetainedUntilWindowEnd: true,
        },
        safety: {
          rawRateLimitKeysExposed: false,
          externalProviderUsed: false,
          productionReady: false,
          sharedStore: true,
          rateLimitKeyProtection: 'HMAC_SHA256',
        },
      };
    });
  }

  async cleanupExpired(
    now = this.clock(),
  ): Promise<AuthOperationalCleanupResult> {
    return this.execute('retention cleanup', () =>
      this.prisma.$transaction(async (tx) => {
        const [attempts, metricBuckets] = await Promise.all([
          tx.authRateLimitAttempt.deleteMany({
            where: { expiresAt: { lte: now } },
          }),
          tx.authOperationalMetricBucket.deleteMany({
            where: { expiresAt: { lte: now } },
          }),
        ]);
        return {
          expiredRateLimitAttempts: attempts.count,
          expiredMetricBuckets: metricBuckets.count,
        };
      }),
    );
  }

  private hashRateLimitKey(key: string) {
    return createHmac('sha256', this.keySecret)
      .update(key.trim().toLowerCase())
      .digest('hex');
  }

  private async recordWithClient(
    client: PrismaClient | Prisma.TransactionClient,
    event: AuthOperationalEvent,
  ) {
    const occurredAt = event.occurredAt ?? this.clock();
    const value = event.value ?? 1;
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new Error('Auth operational metric increments must be positive');
    }
    const bucketStartedAt = new Date(
      Math.floor(occurredAt.getTime() / this.metricBucketMs) *
        this.metricBucketMs,
    );
    const expiresAt = new Date(
      bucketStartedAt.getTime() + this.metricRetentionMs,
    );

    await client.authOperationalMetricBucket.upsert({
      where: {
        kind_bucketStartedAt: {
          kind: event.kind,
          bucketStartedAt,
        },
      },
      create: {
        kind: event.kind,
        bucketStartedAt,
        count: value,
        lastOccurredAt: occurredAt,
        expiresAt,
      },
      update: {
        count: { increment: value },
        lastOccurredAt: occurredAt,
        expiresAt,
      },
    });
  }

  private async execute<T>(operation: string, task: () => Promise<T>) {
    try {
      return await task();
    } catch (error) {
      if (
        error instanceof AuthRateLimitExceededError ||
        error instanceof AuthOperationalControlUnavailableError
      ) {
        throw error;
      }
      throw new AuthOperationalControlUnavailableError(operation, {
        cause: error,
      });
    }
  }
}
