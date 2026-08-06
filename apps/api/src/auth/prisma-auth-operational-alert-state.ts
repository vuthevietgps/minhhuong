import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { performance } from 'node:perf_hooks';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AuthOperationalAlertState,
  AuthOperationalAlertStateCandidate,
  AuthOperationalAlertStateCleanupResult,
  AuthOperationalAlertStateDecision,
  AuthOperationalAlertStateEvaluation,
  AuthOperationalAlertEvaluationAuditCursor,
  AuthOperationalAlertEvaluationAuditPage,
  AuthOperationalAlertEvaluationAuditReadRecord,
} from './auth-operational-alert-state';
import {
  AuthOperationalAlertStateUnavailableError,
  buildAuthOperationalAlertEvaluationInputDigest,
  defaultAuthOperationalAlertAuditRetentionMs,
  summarizeAuthOperationalAlertDecisions,
} from './auth-operational-alert-state';

const sharedEvaluationLockKey = 'auth-operational-alert-state:evaluate';
const alertCodes = new Set([
  'LOGIN_THROTTLE_THRESHOLD',
  'REFRESH_THROTTLE_THRESHOLD',
  'REFRESH_REPLAY_DETECTED',
  'SESSION_REPOSITORY_ERROR_DETECTED',
]);

const parsePersistedDecisions = (
  value: unknown,
): AuthOperationalAlertStateDecision[] => {
  if (!Array.isArray(value)) {
    throw new Error('Persisted auth alert evaluation decisions are invalid');
  }
  const rows: unknown[] = value;
  return rows.map((row) => {
    if (
      typeof row !== 'object' ||
      row === null ||
      !('alertCode' in row) ||
      !('fingerprint' in row) ||
      !('decision' in row) ||
      !('cooldownUntil' in row) ||
      typeof row.alertCode !== 'string' ||
      !alertCodes.has(row.alertCode) ||
      typeof row.fingerprint !== 'string' ||
      !/^auth-operational-alert:[A-Z0-9_:-]+$/.test(row.fingerprint) ||
      (row.decision !== 'OPEN' && row.decision !== 'SUPPRESSED_COOLDOWN') ||
      typeof row.cooldownUntil !== 'string' ||
      Number.isNaN(Date.parse(row.cooldownUntil))
    ) {
      throw new Error('Persisted auth alert evaluation decision is invalid');
    }
    return {
      alertCode:
        row.alertCode as AuthOperationalAlertStateDecision['alertCode'],
      fingerprint: row.fingerprint,
      decision: row.decision,
      cooldownUntil: row.cooldownUntil,
    };
  });
};

const toPersistedAuditReadRecord = (row: {
  correlationId: string;
  evaluatedAt: Date;
  decision: string;
  candidateCount: number;
  openCandidateCount: number;
  suppressedCandidateCount: number;
  decisionsJson: unknown;
  expiresAt: Date;
}): AuthOperationalAlertEvaluationAuditReadRecord => {
  const decisions = parsePersistedDecisions(row.decisionsJson);
  const summary = summarizeAuthOperationalAlertDecisions(decisions);
  if (
    row.decision !== summary.decision ||
    row.candidateCount !== summary.candidateCount ||
    row.openCandidateCount !== summary.openCandidateCount ||
    row.suppressedCandidateCount !== summary.suppressedCandidateCount
  ) {
    throw new Error('Persisted auth alert evaluation audit is inconsistent');
  }
  return {
    correlationId: row.correlationId,
    evaluatedAt: row.evaluatedAt.toISOString(),
    ...summary,
    decisions: decisions.map(({ alertCode, decision, cooldownUntil }) => ({
      alertCode,
      decision,
      cooldownUntil,
    })),
    expiresAt: row.expiresAt.toISOString(),
    appendOnly: true,
    redacted: true,
    persisted: true,
  };
};

@Injectable()
export class PrismaAuthOperationalAlertState implements AuthOperationalAlertState {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaClient,
  ) {}

  async evaluate(input: {
    correlationId: string;
    evaluatedAt: Date;
    candidates: AuthOperationalAlertStateCandidate[];
  }): Promise<AuthOperationalAlertStateEvaluation> {
    const evaluationStartedAt = performance.now();
    const inputDigest = buildAuthOperationalAlertEvaluationInputDigest(input);
    return this.execute('evaluation and append-only audit', () =>
      this.prisma.$transaction(async (tx) => {
        const lockStartedAt = performance.now();
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(hashtextextended(${sharedEvaluationLockKey}, 0)) IS NULL AS "locked"
        `;
        const lockWaitMs = performance.now() - lockStartedAt;

        const existingAudit =
          await tx.authOperationalAlertEvaluationAudit.findUnique({
            where: { correlationId: input.correlationId },
          });
        if (existingAudit) {
          if (existingAudit.inputDigest !== inputDigest) {
            throw new Error(
              'Auth operational alert evaluation correlation conflict',
            );
          }
          const decisions = parsePersistedDecisions(
            existingAudit.decisionsJson,
          );
          const summary = summarizeAuthOperationalAlertDecisions(decisions);
          if (
            existingAudit.decision !== summary.decision ||
            existingAudit.candidateCount !== summary.candidateCount ||
            existingAudit.openCandidateCount !== summary.openCandidateCount ||
            existingAudit.suppressedCandidateCount !==
              summary.suppressedCandidateCount
          ) {
            throw new Error(
              'Persisted auth alert evaluation audit is inconsistent',
            );
          }
          return {
            evaluatedAt: existingAudit.evaluatedAt.toISOString(),
            decisions,
            sharedState: true,
            audit: {
              correlationId: existingAudit.correlationId,
              ...summary,
              expiresAt: existingAudit.expiresAt.toISOString(),
              appendOnly: true,
              redacted: true,
              persisted: true,
              idempotentReplay: true,
            },
            contention: {
              lockWaitMs,
              evaluationDurationMs: performance.now() - evaluationStartedAt,
            },
          };
        }

        const fingerprints = input.candidates.map(
          (candidate) => candidate.fingerprint,
        );
        const existingRows = fingerprints.length
          ? await tx.authOperationalAlertState.findMany({
              where: { fingerprint: { in: fingerprints } },
            })
          : [];
        const existingByFingerprint = new Map(
          existingRows.map((row) => [row.fingerprint, row]),
        );

        const decisions: AuthOperationalAlertStateDecision[] = [];
        for (const candidate of input.candidates) {
          const existing = existingByFingerprint.get(candidate.fingerprint);
          const suppressed =
            existing !== undefined &&
            existing.cooldownUntil.getTime() > input.evaluatedAt.getTime();
          const cooldownUntil = suppressed
            ? existing.cooldownUntil
            : new Date(input.evaluatedAt.getTime() + candidate.cooldownMs);

          if (!suppressed) {
            await tx.authOperationalAlertState.upsert({
              where: { fingerprint: candidate.fingerprint },
              create: {
                fingerprint: candidate.fingerprint,
                alertCode: candidate.alertCode,
                lastOpenedAt: input.evaluatedAt,
                cooldownUntil,
                expiresAt: cooldownUntil,
              },
              update: {
                alertCode: candidate.alertCode,
                lastOpenedAt: input.evaluatedAt,
                cooldownUntil,
                expiresAt: cooldownUntil,
              },
            });
          }

          decisions.push({
            alertCode: candidate.alertCode,
            fingerprint: candidate.fingerprint,
            decision: suppressed ? 'SUPPRESSED_COOLDOWN' : 'OPEN',
            cooldownUntil: cooldownUntil.toISOString(),
          });
        }

        const summary = summarizeAuthOperationalAlertDecisions(decisions);
        const expiresAt = new Date(
          input.evaluatedAt.getTime() +
            defaultAuthOperationalAlertAuditRetentionMs,
        );
        await tx.authOperationalAlertEvaluationAudit.create({
          data: {
            correlationId: input.correlationId,
            inputDigest,
            evaluatedAt: input.evaluatedAt,
            ...summary,
            decisionsJson: decisions,
            expiresAt,
          },
        });

        return {
          evaluatedAt: input.evaluatedAt.toISOString(),
          decisions,
          sharedState: true,
          audit: {
            correlationId: input.correlationId,
            ...summary,
            expiresAt: expiresAt.toISOString(),
            appendOnly: true,
            redacted: true,
            persisted: true,
            idempotentReplay: false,
          },
          contention: {
            lockWaitMs,
            evaluationDurationMs: performance.now() - evaluationStartedAt,
          },
        };
      }),
    );
  }

  async cleanupExpired(
    now = new Date(),
  ): Promise<AuthOperationalAlertStateCleanupResult> {
    return this.execute('retention cleanup', () =>
      this.prisma.$transaction(async (tx) => {
        const [stateResult, auditResult] = await Promise.all([
          tx.authOperationalAlertState.deleteMany({
            where: { expiresAt: { lte: now } },
          }),
          tx.authOperationalAlertEvaluationAudit.deleteMany({
            where: { expiresAt: { lte: now } },
          }),
        ]);
        return {
          expiredAlertStates: stateResult.count,
          expiredEvaluationAudits: auditResult.count,
        };
      }),
    );
  }

  async findEvaluationAudit(input: {
    correlationId: string;
    now: Date;
  }): Promise<AuthOperationalAlertEvaluationAuditReadRecord | null> {
    return this.execute('evaluation audit correlation lookup', async () => {
      const row =
        await this.prisma.authOperationalAlertEvaluationAudit.findFirst({
          where: {
            correlationId: input.correlationId,
            expiresAt: { gt: input.now },
          },
        });
      return row ? toPersistedAuditReadRecord(row) : null;
    });
  }

  async listEvaluationAudits(input: {
    windowStartedAt: Date;
    windowEndedAt: Date;
    cursor?: AuthOperationalAlertEvaluationAuditCursor;
    limit: number;
    now: Date;
  }): Promise<AuthOperationalAlertEvaluationAuditPage> {
    return this.execute('evaluation audit incident export', async () => {
      const rows =
        await this.prisma.authOperationalAlertEvaluationAudit.findMany({
          where: {
            evaluatedAt: {
              gte: input.windowStartedAt,
              lte: input.windowEndedAt,
            },
            expiresAt: { gt: input.now },
            ...(input.cursor
              ? {
                  OR: [
                    { evaluatedAt: { lt: input.cursor.evaluatedAt } },
                    {
                      evaluatedAt: input.cursor.evaluatedAt,
                      correlationId: { lt: input.cursor.correlationId },
                    },
                  ],
                }
              : {}),
          },
          orderBy: [{ evaluatedAt: 'desc' }, { correlationId: 'desc' }],
          take: input.limit + 1,
        });
      return {
        items: rows.slice(0, input.limit).map(toPersistedAuditReadRecord),
        hasMore: rows.length > input.limit,
      };
    });
  }

  private async execute<T>(operation: string, task: () => Promise<T>) {
    try {
      return await task();
    } catch (error) {
      if (error instanceof AuthOperationalAlertStateUnavailableError) {
        throw error;
      }
      throw new AuthOperationalAlertStateUnavailableError(operation, {
        cause: error,
      });
    }
  }
}
