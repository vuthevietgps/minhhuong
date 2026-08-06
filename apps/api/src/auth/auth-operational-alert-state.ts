import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type {
  AuthOperationalAlertCode,
  AuthOperationalAlertDecision,
} from './auth-operational-alert-policy';

export const AUTH_OPERATIONAL_ALERT_STATE = 'AUTH_OPERATIONAL_ALERT_STATE';
export const authOperationalAlertEvaluationCorrelationPrefix =
  'auth-alert-evaluation:';
export const defaultAuthOperationalAlertAuditRetentionMs =
  30 * 24 * 60 * 60 * 1000;
export const maximumAuthOperationalAlertAuditRetentionMs =
  90 * 24 * 60 * 60 * 1000;

export type AuthOperationalAlertStateCandidate = {
  alertCode: AuthOperationalAlertCode;
  fingerprint: string;
  cooldownMs: number;
};

export type AuthOperationalAlertStateDecision = {
  alertCode: AuthOperationalAlertCode;
  fingerprint: string;
  decision: AuthOperationalAlertDecision;
  cooldownUntil: string;
};

export type AuthOperationalAlertEvaluationDecision =
  | 'ALERT_CANDIDATES_OPEN'
  | 'ALERT_CANDIDATES_SUPPRESSED'
  | 'NO_ALERT_CANDIDATES';

export type AuthOperationalAlertEvaluationAudit = {
  correlationId: string;
  decision: AuthOperationalAlertEvaluationDecision;
  candidateCount: number;
  openCandidateCount: number;
  suppressedCandidateCount: number;
  expiresAt: string;
  appendOnly: true;
  redacted: true;
  persisted: boolean;
  idempotentReplay: boolean;
};

export type AuthOperationalAlertEvaluationContention = {
  lockWaitMs: number;
  evaluationDurationMs: number;
};

export type AuthOperationalAlertStateEvaluation = {
  evaluatedAt: string;
  decisions: AuthOperationalAlertStateDecision[];
  sharedState: boolean;
  audit: AuthOperationalAlertEvaluationAudit;
  contention: AuthOperationalAlertEvaluationContention;
};

export type AuthOperationalAlertStateCleanupResult = {
  expiredAlertStates: number;
  expiredEvaluationAudits: number;
};

export type AuthOperationalAlertEvaluationAuditReadDecision = Pick<
  AuthOperationalAlertStateDecision,
  'alertCode' | 'decision' | 'cooldownUntil'
>;

export type AuthOperationalAlertEvaluationAuditReadRecord = {
  correlationId: string;
  evaluatedAt: string;
  decision: AuthOperationalAlertEvaluationDecision;
  candidateCount: number;
  openCandidateCount: number;
  suppressedCandidateCount: number;
  decisions: AuthOperationalAlertEvaluationAuditReadDecision[];
  expiresAt: string;
  appendOnly: true;
  redacted: true;
  persisted: boolean;
};

export type AuthOperationalAlertEvaluationAuditCursor = {
  evaluatedAt: Date;
  correlationId: string;
};

export type AuthOperationalAlertEvaluationAuditPage = {
  items: AuthOperationalAlertEvaluationAuditReadRecord[];
  hasMore: boolean;
};

export interface AuthOperationalAlertState {
  evaluate(input: {
    correlationId: string;
    evaluatedAt: Date;
    candidates: AuthOperationalAlertStateCandidate[];
  }): Promise<AuthOperationalAlertStateEvaluation>;
  findEvaluationAudit(input: {
    correlationId: string;
    now: Date;
  }): Promise<AuthOperationalAlertEvaluationAuditReadRecord | null>;
  listEvaluationAudits(input: {
    windowStartedAt: Date;
    windowEndedAt: Date;
    cursor?: AuthOperationalAlertEvaluationAuditCursor;
    limit: number;
    now: Date;
  }): Promise<AuthOperationalAlertEvaluationAuditPage>;
  cleanupExpired(now?: Date): Promise<AuthOperationalAlertStateCleanupResult>;
}

export class AuthOperationalAlertStateUnavailableError extends Error {
  constructor(operation: string, options?: { cause?: unknown }) {
    super(
      `Auth operational alert state unavailable during ${operation}`,
      options,
    );
    this.name = 'AuthOperationalAlertStateUnavailableError';
  }
}

type FixtureAlertStateRow = {
  alertCode: AuthOperationalAlertCode;
  fingerprint: string;
  cooldownUntil: number;
  expiresAt: number;
};

type FixtureAlertEvaluationAuditRow = AuthOperationalAlertEvaluationAudit & {
  evaluatedAt: string;
  inputDigest: string;
  decisions: AuthOperationalAlertStateDecision[];
};

const toFixtureEvaluationAudit = (
  row: FixtureAlertEvaluationAuditRow,
  idempotentReplay: boolean,
): AuthOperationalAlertEvaluationAudit => ({
  correlationId: row.correlationId,
  decision: row.decision,
  candidateCount: row.candidateCount,
  openCandidateCount: row.openCandidateCount,
  suppressedCandidateCount: row.suppressedCandidateCount,
  expiresAt: row.expiresAt,
  appendOnly: true,
  redacted: true,
  persisted: false,
  idempotentReplay,
});

const toEvaluationAuditReadRecord = (
  row: FixtureAlertEvaluationAuditRow,
): AuthOperationalAlertEvaluationAuditReadRecord => ({
  correlationId: row.correlationId,
  evaluatedAt: row.evaluatedAt,
  decision: row.decision,
  candidateCount: row.candidateCount,
  openCandidateCount: row.openCandidateCount,
  suppressedCandidateCount: row.suppressedCandidateCount,
  decisions: row.decisions.map(({ alertCode, decision, cooldownUntil }) => ({
    alertCode,
    decision,
    cooldownUntil,
  })),
  expiresAt: row.expiresAt,
  appendOnly: true,
  redacted: true,
  persisted: false,
});

const compareEvaluationAuditNewestFirst = (
  left: AuthOperationalAlertEvaluationAuditReadRecord,
  right: AuthOperationalAlertEvaluationAuditReadRecord,
) => {
  const evaluatedAtDifference =
    new Date(right.evaluatedAt).getTime() -
    new Date(left.evaluatedAt).getTime();
  return (
    evaluatedAtDifference ||
    right.correlationId.localeCompare(left.correlationId)
  );
};

export const assertAuthOperationalAlertEvaluationCorrelationId = (
  correlationId: string,
) => {
  if (
    !/^auth-alert-evaluation:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      correlationId,
    )
  ) {
    throw new Error('Auth operational alert evaluation correlation is invalid');
  }
};

export const buildAuthOperationalAlertEvaluationInputDigest = (input: {
  correlationId: string;
  evaluatedAt: Date;
  candidates: AuthOperationalAlertStateCandidate[];
}) => {
  assertAuthOperationalAlertEvaluationCorrelationId(input.correlationId);
  return createHash('sha256')
    .update(
      JSON.stringify({
        evaluatedAt: input.evaluatedAt.toISOString(),
        candidates: input.candidates.map((candidate) => ({
          alertCode: candidate.alertCode,
          fingerprint: candidate.fingerprint,
          cooldownMs: candidate.cooldownMs,
        })),
      }),
    )
    .digest('hex');
};

export const summarizeAuthOperationalAlertDecisions = (
  decisions: AuthOperationalAlertStateDecision[],
) => {
  const openCandidateCount = decisions.filter(
    (decision) => decision.decision === 'OPEN',
  ).length;
  const suppressedCandidateCount = decisions.length - openCandidateCount;
  const decision: AuthOperationalAlertEvaluationDecision =
    openCandidateCount > 0
      ? 'ALERT_CANDIDATES_OPEN'
      : suppressedCandidateCount > 0
        ? 'ALERT_CANDIDATES_SUPPRESSED'
        : 'NO_ALERT_CANDIDATES';
  return {
    decision,
    candidateCount: decisions.length,
    openCandidateCount,
    suppressedCandidateCount,
  };
};

const assertAuditRetentionMs = (retentionMs: number) => {
  if (
    !Number.isSafeInteger(retentionMs) ||
    retentionMs <= 0 ||
    retentionMs > maximumAuthOperationalAlertAuditRetentionMs
  ) {
    throw new Error(
      'Auth operational alert audit retention must be between 1 ms and 90 days',
    );
  }
};

@Injectable()
export class FixtureBackedAuthOperationalAlertState implements AuthOperationalAlertState {
  private readonly rows = new Map<string, FixtureAlertStateRow>();
  private readonly auditRows = new Map<
    string,
    FixtureAlertEvaluationAuditRow
  >();
  private readonly clock: () => Date;
  private readonly unavailable: boolean;
  private readonly auditUnavailable: boolean;
  private readonly auditRetentionMs: number;

  constructor(input?: {
    clock?: () => Date;
    unavailable?: boolean;
    auditUnavailable?: boolean;
    auditRetentionMs?: number;
  }) {
    this.clock = input?.clock ?? (() => new Date());
    this.unavailable = input?.unavailable ?? false;
    this.auditUnavailable = input?.auditUnavailable ?? false;
    this.auditRetentionMs =
      input?.auditRetentionMs ?? defaultAuthOperationalAlertAuditRetentionMs;
    assertAuditRetentionMs(this.auditRetentionMs);
  }

  async evaluate(input: {
    correlationId: string;
    evaluatedAt: Date;
    candidates: AuthOperationalAlertStateCandidate[];
  }): Promise<AuthOperationalAlertStateEvaluation> {
    await Promise.resolve();
    if (this.unavailable) {
      throw new AuthOperationalAlertStateUnavailableError('evaluation');
    }

    const inputDigest = buildAuthOperationalAlertEvaluationInputDigest(input);
    const existingAudit = this.auditRows.get(input.correlationId);
    if (existingAudit) {
      if (existingAudit.inputDigest !== inputDigest) {
        throw new AuthOperationalAlertStateUnavailableError(
          'evaluation audit correlation conflict',
        );
      }
      return {
        evaluatedAt: existingAudit.evaluatedAt,
        decisions: existingAudit.decisions,
        sharedState: false,
        audit: toFixtureEvaluationAudit(existingAudit, true),
        contention: { lockWaitMs: 0, evaluationDurationMs: 0 },
      };
    }
    if (this.auditUnavailable) {
      throw new AuthOperationalAlertStateUnavailableError('evaluation audit');
    }

    const evaluatedAtMs = input.evaluatedAt.getTime();
    const nextRows = new Map(this.rows);
    const decisions = input.candidates.map<AuthOperationalAlertStateDecision>(
      (candidate) => {
        const existing = nextRows.get(candidate.fingerprint);
        const suppressed =
          existing !== undefined && existing.cooldownUntil > evaluatedAtMs;
        const cooldownUntil = suppressed
          ? existing.cooldownUntil
          : evaluatedAtMs + candidate.cooldownMs;

        if (!suppressed) {
          nextRows.set(candidate.fingerprint, {
            alertCode: candidate.alertCode,
            fingerprint: candidate.fingerprint,
            cooldownUntil,
            expiresAt: cooldownUntil,
          });
        }

        return {
          alertCode: candidate.alertCode,
          fingerprint: candidate.fingerprint,
          decision: suppressed ? 'SUPPRESSED_COOLDOWN' : 'OPEN',
          cooldownUntil: new Date(cooldownUntil).toISOString(),
        };
      },
    );
    const summary = summarizeAuthOperationalAlertDecisions(decisions);
    const audit: FixtureAlertEvaluationAuditRow = {
      correlationId: input.correlationId,
      evaluatedAt: input.evaluatedAt.toISOString(),
      inputDigest,
      decisions,
      ...summary,
      expiresAt: new Date(
        input.evaluatedAt.getTime() + this.auditRetentionMs,
      ).toISOString(),
      appendOnly: true,
      redacted: true,
      persisted: false,
      idempotentReplay: false,
    };

    this.rows.clear();
    nextRows.forEach((row, fingerprint) => this.rows.set(fingerprint, row));
    this.auditRows.set(input.correlationId, audit);

    return {
      evaluatedAt: input.evaluatedAt.toISOString(),
      decisions,
      sharedState: false,
      audit: toFixtureEvaluationAudit(audit, false),
      contention: { lockWaitMs: 0, evaluationDurationMs: 0 },
    };
  }

  async cleanupExpired(
    now = this.clock(),
  ): Promise<AuthOperationalAlertStateCleanupResult> {
    await Promise.resolve();
    if (this.unavailable) {
      throw new AuthOperationalAlertStateUnavailableError('retention cleanup');
    }

    let expiredAlertStates = 0;
    for (const [fingerprint, row] of this.rows.entries()) {
      if (row.expiresAt > now.getTime()) {
        continue;
      }
      this.rows.delete(fingerprint);
      expiredAlertStates += 1;
    }
    let expiredEvaluationAudits = 0;
    for (const [correlationId, row] of this.auditRows.entries()) {
      if (new Date(row.expiresAt).getTime() > now.getTime()) {
        continue;
      }
      this.auditRows.delete(correlationId);
      expiredEvaluationAudits += 1;
    }
    return { expiredAlertStates, expiredEvaluationAudits };
  }

  async findEvaluationAudit(input: {
    correlationId: string;
    now: Date;
  }): Promise<AuthOperationalAlertEvaluationAuditReadRecord | null> {
    await Promise.resolve();
    this.assertAuditReadAvailable();
    assertAuthOperationalAlertEvaluationCorrelationId(input.correlationId);
    const row = this.auditRows.get(input.correlationId);
    if (!row || new Date(row.expiresAt).getTime() <= input.now.getTime()) {
      return null;
    }
    return toEvaluationAuditReadRecord(row);
  }

  async listEvaluationAudits(input: {
    windowStartedAt: Date;
    windowEndedAt: Date;
    cursor?: AuthOperationalAlertEvaluationAuditCursor;
    limit: number;
    now: Date;
  }): Promise<AuthOperationalAlertEvaluationAuditPage> {
    await Promise.resolve();
    this.assertAuditReadAvailable();
    const windowStartedAtMs = input.windowStartedAt.getTime();
    const windowEndedAtMs = input.windowEndedAt.getTime();
    const cursorEvaluatedAtMs = input.cursor?.evaluatedAt.getTime();
    const rows = [...this.auditRows.values()]
      .filter((row) => {
        const evaluatedAtMs = new Date(row.evaluatedAt).getTime();
        if (
          evaluatedAtMs < windowStartedAtMs ||
          evaluatedAtMs > windowEndedAtMs ||
          new Date(row.expiresAt).getTime() <= input.now.getTime()
        ) {
          return false;
        }
        if (!input.cursor || cursorEvaluatedAtMs === undefined) {
          return true;
        }
        return (
          evaluatedAtMs < cursorEvaluatedAtMs ||
          (evaluatedAtMs === cursorEvaluatedAtMs &&
            row.correlationId < input.cursor.correlationId)
        );
      })
      .map(toEvaluationAuditReadRecord)
      .sort(compareEvaluationAuditNewestFirst)
      .slice(0, input.limit + 1);
    return {
      items: rows.slice(0, input.limit),
      hasMore: rows.length > input.limit,
    };
  }

  private assertAuditReadAvailable() {
    if (this.unavailable || this.auditUnavailable) {
      throw new AuthOperationalAlertStateUnavailableError(
        'evaluation audit read',
      );
    }
  }
}
