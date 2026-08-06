import {
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AUTH_OPERATIONAL_CONTROL } from './auth-operational-control';
import type {
  AuthOperationalControl,
  AuthOperationalEventKind,
  AuthOperationalSnapshot,
} from './auth-operational-control';
import { AUTH_OPERATIONAL_ALERT_STATE } from './auth-operational-alert-state';
import type {
  AuthOperationalAlertEvaluationAudit,
  AuthOperationalAlertEvaluationContention,
  AuthOperationalAlertState,
  AuthOperationalAlertStateDecision,
} from './auth-operational-alert-state';
import { authOperationalAlertEvaluationCorrelationPrefix } from './auth-operational-alert-state';
import { AccountRole, AuthenticatedUser } from './auth.types';

export type AuthOperationalAlertCode =
  | 'LOGIN_THROTTLE_THRESHOLD'
  | 'REFRESH_THROTTLE_THRESHOLD'
  | 'REFRESH_REPLAY_DETECTED'
  | 'SESSION_REPOSITORY_ERROR_DETECTED';

export type AuthOperationalAlertSeverity = 'WARNING' | 'CRITICAL';
export type AuthOperationalAlertDecision = 'OPEN' | 'SUPPRESSED_COOLDOWN';

export type AuthOperationalAlertPolicy = {
  alertCode: AuthOperationalAlertCode;
  metricKind: AuthOperationalEventKind;
  threshold: number;
  severity: AuthOperationalAlertSeverity;
  cooldownMs: number;
};

export type AuthOperationalAlertCandidate = {
  alertCode: AuthOperationalAlertCode;
  fingerprint: string;
  metricKind: AuthOperationalEventKind;
  severity: AuthOperationalAlertSeverity;
  threshold: number;
  observedCount: number;
  lastOccurredAt: string;
  decision: AuthOperationalAlertDecision;
  cooldownUntil: string;
  delivery: 'NOT_SENT_LOCAL_POLICY_ONLY';
};

type ThresholdedAuthOperationalAlertCandidate = Omit<
  AuthOperationalAlertCandidate,
  'decision' | 'cooldownUntil' | 'delivery'
> & { cooldownMs: number };

export const authOperationalAlertInspectionRoles: AccountRole[] = [
  'ADMIN',
  'SUPPORT',
];

export const defaultAuthOperationalAlertPolicies: AuthOperationalAlertPolicy[] =
  [
    {
      alertCode: 'LOGIN_THROTTLE_THRESHOLD',
      metricKind: 'LOGIN_THROTTLED',
      threshold: 5,
      severity: 'WARNING',
      cooldownMs: 15 * 60 * 1000,
    },
    {
      alertCode: 'REFRESH_THROTTLE_THRESHOLD',
      metricKind: 'REFRESH_THROTTLED',
      threshold: 5,
      severity: 'WARNING',
      cooldownMs: 15 * 60 * 1000,
    },
    {
      alertCode: 'REFRESH_REPLAY_DETECTED',
      metricKind: 'REFRESH_REPLAY_DENIED',
      threshold: 1,
      severity: 'CRITICAL',
      cooldownMs: 60 * 60 * 1000,
    },
    {
      alertCode: 'SESSION_REPOSITORY_ERROR_DETECTED',
      metricKind: 'SESSION_REPOSITORY_ERROR',
      threshold: 1,
      severity: 'CRITICAL',
      cooldownMs: 60 * 60 * 1000,
    },
  ];

export const defaultAuthOperationalAlertSnapshotWindowMs = 60 * 60 * 1000;

const thresholdAuthOperationalAlertSnapshot = (input: {
  snapshot: AuthOperationalSnapshot;
  policies?: AuthOperationalAlertPolicy[];
}) => {
  const policies = input.policies ?? defaultAuthOperationalAlertPolicies;
  const counters = new Map(
    input.snapshot.counters.map((counter) => [counter.kind, counter]),
  );
  return {
    policies,
    candidates: policies.flatMap<ThresholdedAuthOperationalAlertCandidate>(
      (policy) => {
        const counter = counters.get(policy.metricKind);
        const observedCount = counter?.count ?? 0;
        if (observedCount < policy.threshold) {
          return [];
        }
        return [
          {
            alertCode: policy.alertCode,
            fingerprint: `auth-operational-alert:${policy.alertCode}`,
            metricKind: policy.metricKind,
            severity: policy.severity,
            threshold: policy.threshold,
            observedCount,
            lastOccurredAt:
              counter?.lastOccurredAt ?? input.snapshot.generatedAt,
            cooldownMs: policy.cooldownMs,
          },
        ];
      },
    ),
  };
};

const buildAuthOperationalAlertEvaluation = (input: {
  snapshot: AuthOperationalSnapshot;
  evaluatedAt: Date;
  policies: AuthOperationalAlertPolicy[];
  thresholdedCandidates: ThresholdedAuthOperationalAlertCandidate[];
  stateDecisions: AuthOperationalAlertStateDecision[];
  evaluationAudit?: AuthOperationalAlertEvaluationAudit;
  contention?: AuthOperationalAlertEvaluationContention;
  deduplicationScope:
    | 'PROCESS_LOCAL_FIXTURE_ONLY'
    | 'FIXTURE_PROVIDER_INSTANCE'
    | 'SHARED_PRISMA_STATE';
}) => {
  const decisionsByFingerprint = new Map(
    input.stateDecisions.map((decision) => [decision.fingerprint, decision]),
  );
  if (
    decisionsByFingerprint.size !== input.thresholdedCandidates.length ||
    input.thresholdedCandidates.some(
      (candidate) => !decisionsByFingerprint.has(candidate.fingerprint),
    )
  ) {
    throw new Error('Auth operational alert state returned inconsistent rows');
  }

  const candidates =
    input.thresholdedCandidates.map<AuthOperationalAlertCandidate>(
      ({ cooldownMs, ...candidate }) => {
        const state = decisionsByFingerprint.get(candidate.fingerprint);
        if (
          !state ||
          state.alertCode !== candidate.alertCode ||
          cooldownMs <= 0
        ) {
          throw new Error(
            'Auth operational alert state returned an inconsistent decision',
          );
        }
        return {
          ...candidate,
          decision: state.decision,
          cooldownUntil: state.cooldownUntil,
          delivery: 'NOT_SENT_LOCAL_POLICY_ONLY',
        };
      },
    );
  const openCandidateCount = candidates.filter(
    (candidate) => candidate.decision === 'OPEN',
  ).length;
  const suppressedCandidateCount = candidates.length - openCandidateCount;
  if (
    input.evaluationAudit &&
    (input.evaluationAudit.candidateCount !== candidates.length ||
      input.evaluationAudit.openCandidateCount !== openCandidateCount ||
      input.evaluationAudit.suppressedCandidateCount !==
        suppressedCandidateCount)
  ) {
    throw new Error(
      'Auth operational alert evaluation audit returned inconsistent totals',
    );
  }

  return {
    evaluatedAt: input.evaluatedAt.toISOString(),
    snapshotGeneratedAt: input.snapshot.generatedAt,
    snapshotWindow: input.snapshot.window,
    decision:
      openCandidateCount > 0
        ? ('ALERT_CANDIDATES_OPEN' as const)
        : suppressedCandidateCount > 0
          ? ('ALERT_CANDIDATES_SUPPRESSED' as const)
          : ('NO_ALERT_CANDIDATES' as const),
    totals: {
      evaluatedPolicyCount: input.policies.length,
      candidateCount: candidates.length,
      openCandidateCount,
      suppressedCandidateCount,
    },
    candidates,
    evaluationAudit:
      input.evaluationAudit ??
      ({
        correlationId: null,
        decision:
          openCandidateCount > 0
            ? 'ALERT_CANDIDATES_OPEN'
            : suppressedCandidateCount > 0
              ? 'ALERT_CANDIDATES_SUPPRESSED'
              : 'NO_ALERT_CANDIDATES',
        candidateCount: candidates.length,
        openCandidateCount,
        suppressedCandidateCount,
        expiresAt: null,
        appendOnly: false,
        redacted: true,
        persisted: false,
        idempotentReplay: false,
      } as const),
    contention:
      input.contention ?? ({ lockWaitMs: 0, evaluationDurationMs: 0 } as const),
    safety: {
      productionReady: false as const,
      externalAlertProviderUsed: false as const,
      liveNotificationUsed: false as const,
      rawRateLimitKeysExposed: false as const,
      rawCredentialsOrTokensExposed: false as const,
      retainedSnapshotTotalsOnly: false as const,
      explicitRollingWindow: true as const,
      appendOnlyEvaluationAudit:
        input.evaluationAudit?.appendOnly ?? (false as const),
      redactedEvaluationAudit: true as const,
      deduplicationScope: input.deduplicationScope,
    },
  };
};

export const evaluateAuthOperationalAlertSnapshot = (input: {
  snapshot: AuthOperationalSnapshot;
  evaluatedAt: Date;
  lastOpenedAt: Map<AuthOperationalAlertCode, number>;
  policies?: AuthOperationalAlertPolicy[];
}) => {
  const thresholded = thresholdAuthOperationalAlertSnapshot(input);
  const stateDecisions = thresholded.candidates.map((candidate) => {
    const lastOpenedAt = input.lastOpenedAt.get(candidate.alertCode);
    const nextAllowedAt = (lastOpenedAt ?? 0) + candidate.cooldownMs;
    const suppressed =
      lastOpenedAt !== undefined && input.evaluatedAt.getTime() < nextAllowedAt;
    if (!suppressed) {
      input.lastOpenedAt.set(candidate.alertCode, input.evaluatedAt.getTime());
    }
    return {
      alertCode: candidate.alertCode,
      fingerprint: candidate.fingerprint,
      decision: suppressed ? 'SUPPRESSED_COOLDOWN' : 'OPEN',
      cooldownUntil: new Date(
        suppressed
          ? nextAllowedAt
          : input.evaluatedAt.getTime() + candidate.cooldownMs,
      ).toISOString(),
    } satisfies AuthOperationalAlertStateDecision;
  });

  return buildAuthOperationalAlertEvaluation({
    snapshot: input.snapshot,
    evaluatedAt: input.evaluatedAt,
    policies: thresholded.policies,
    thresholdedCandidates: thresholded.candidates,
    stateDecisions,
    deduplicationScope: 'PROCESS_LOCAL_FIXTURE_ONLY',
  });
};

@Injectable()
export class AuthOperationalAlertPolicyService {
  constructor(
    @Inject(AUTH_OPERATIONAL_CONTROL)
    private readonly operationalControl: AuthOperationalControl,
    @Inject(AUTH_OPERATIONAL_ALERT_STATE)
    private readonly alertState: AuthOperationalAlertState,
  ) {}

  async inspect(user: AuthenticatedUser, now = new Date()) {
    const viewerRoles = user.roles.filter((role) =>
      authOperationalAlertInspectionRoles.includes(role),
    );
    if (viewerRoles.length === 0) {
      throw new ForbiddenException(
        'Auth operational alerts are restricted to ADMIN and SUPPORT',
      );
    }

    let snapshot: AuthOperationalSnapshot;
    try {
      snapshot = await this.operationalControl.snapshot({
        now,
        windowMs: defaultAuthOperationalAlertSnapshotWindowMs,
      });
    } catch {
      throw new ServiceUnavailableException(
        'Auth operational alert snapshot unavailable',
      );
    }

    const thresholded = thresholdAuthOperationalAlertSnapshot({ snapshot });
    let alertEvaluation: ReturnType<typeof buildAuthOperationalAlertEvaluation>;
    try {
      const stateEvaluation = await this.alertState.evaluate({
        correlationId: `${authOperationalAlertEvaluationCorrelationPrefix}${randomUUID()}`,
        evaluatedAt: now,
        candidates: thresholded.candidates.map((candidate) => ({
          alertCode: candidate.alertCode,
          fingerprint: candidate.fingerprint,
          cooldownMs: candidate.cooldownMs,
        })),
      });
      alertEvaluation = buildAuthOperationalAlertEvaluation({
        snapshot,
        evaluatedAt: now,
        policies: thresholded.policies,
        thresholdedCandidates: thresholded.candidates,
        stateDecisions: stateEvaluation.decisions,
        evaluationAudit: stateEvaluation.audit,
        contention: stateEvaluation.contention,
        deduplicationScope: stateEvaluation.sharedState
          ? 'SHARED_PRISMA_STATE'
          : 'FIXTURE_PROVIDER_INSTANCE',
      });
    } catch {
      throw new ServiceUnavailableException(
        'Auth operational alert state or evaluation audit unavailable',
      );
    }

    return {
      ...alertEvaluation,
      inspection: {
        viewerRoles,
        actorIdentityExposed: false as const,
        readOnly: true as const,
      },
    };
  }
}
