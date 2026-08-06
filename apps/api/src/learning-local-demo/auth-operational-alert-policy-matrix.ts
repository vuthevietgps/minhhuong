import {
  AuthOperationalAlertCode,
  evaluateAuthOperationalAlertSnapshot,
} from '../auth/auth-operational-alert-policy';
import type { AuthOperationalSnapshot } from '../auth/auth-operational-control';

const buildSyntheticSnapshot = (
  generatedAt: string,
): AuthOperationalSnapshot => ({
  generatedAt,
  counters: [
    {
      kind: 'LOGIN_THROTTLED',
      count: 7,
      lastOccurredAt: generatedAt,
    },
    {
      kind: 'REFRESH_THROTTLED',
      count: 6,
      lastOccurredAt: generatedAt,
    },
    {
      kind: 'REFRESH_REPLAY_DENIED',
      count: 2,
      lastOccurredAt: generatedAt,
    },
    {
      kind: 'SESSION_REPOSITORY_ERROR',
      count: 1,
      lastOccurredAt: generatedAt,
    },
  ],
  window: {
    requestedWindowMs: 60 * 60 * 1000,
    requestedStartedAt: new Date(
      new Date(generatedAt).getTime() - 60 * 60 * 1000,
    ).toISOString(),
    effectiveStartedAt: new Date(
      new Date(generatedAt).getTime() - 60 * 60 * 1000,
    ).toISOString(),
    endedAt: generatedAt,
    source: 'EVENT_TIME',
    bucketResolutionMs: null,
  },
  retention: {
    metricRetentionMs: 30 * 24 * 60 * 60 * 1000,
    rateLimitAttemptsRetainedUntilWindowEnd: true,
  },
  safety: {
    rawRateLimitKeysExposed: false,
    externalProviderUsed: false,
    productionReady: false,
    sharedStore: true,
    rateLimitKeyProtection: 'HMAC_SHA256',
  },
});

export const buildAuthOperationalAlertPolicyMatrixReport = (
  generatedAt = new Date().toISOString(),
) => {
  const evaluatedAt = new Date(generatedAt);
  const lastOpenedAt = new Map<AuthOperationalAlertCode, number>();
  const snapshot = buildSyntheticSnapshot(generatedAt);
  const initialEvaluation = evaluateAuthOperationalAlertSnapshot({
    snapshot,
    evaluatedAt,
    lastOpenedAt,
  });
  const cooldownEvaluation = evaluateAuthOperationalAlertSnapshot({
    snapshot,
    evaluatedAt: new Date(evaluatedAt.getTime() + 60 * 1000),
    lastOpenedAt,
  });
  const rolePermissionRows = [
    {
      role: 'ADMIN' as const,
      decision: 'ALLOWED_READ_ONLY' as const,
      snapshotReadAttempted: true,
      actorIdentityExposed: false,
    },
    {
      role: 'SUPPORT' as const,
      decision: 'ALLOWED_READ_ONLY' as const,
      snapshotReadAttempted: true,
      actorIdentityExposed: false,
    },
    {
      role: 'STUDENT' as const,
      decision: 'DENIED_BEFORE_SNAPSHOT' as const,
      snapshotReadAttempted: false,
      actorIdentityExposed: false,
    },
    {
      role: 'PARENT' as const,
      decision: 'DENIED_BEFORE_SNAPSHOT' as const,
      snapshotReadAttempted: false,
      actorIdentityExposed: false,
    },
  ];
  const auditReadModelFixture = {
    windowStartedAt: new Date(
      evaluatedAt.getTime() - 60 * 60 * 1000,
    ).toISOString(),
    windowEndedAt: new Date(
      evaluatedAt.getTime() + 60 * 60 * 1000,
    ).toISOString(),
    maximumWindowDays: 7,
    maximumPageSize: 100,
    pageSize: 2,
    correlationIdsNewestFirst: [
      'auth-alert-evaluation:00000000-0000-4000-8000-000000000003',
      'auth-alert-evaluation:00000000-0000-4000-8000-000000000002',
      'auth-alert-evaluation:00000000-0000-4000-8000-000000000001',
    ],
    expectedPageSizes: [2, 1],
    deterministicOrder: 'evaluatedAt_DESC_correlationId_DESC' as const,
    allowedRoles: ['ADMIN', 'SUPPORT'] as const,
    deniedRoles: ['STUDENT', 'PARENT'] as const,
    exposedAuditFields: [
      'correlationId',
      'evaluatedAt',
      'decision',
      'candidateCount',
      'openCandidateCount',
      'suppressedCandidateCount',
      'decisions',
      'expiresAt',
      'appendOnly',
      'redacted',
      'persisted',
    ],
    excludedFieldFamilies: [
      'identity',
      'rate-key',
      'credential',
      'access-token',
      'refresh-token',
      'input-digest',
      'fingerprint',
    ],
    repositoryOutageHttpStatus: 503,
    externalDeliveryUsed: false,
  };
  const productionBlockers = [
    'External alert routing and delivery are not implemented or called.',
    'Shared Prisma cooldown/audit state and explicit rolling windows are disposable-local verified only; approved staging migration and calibration remain open.',
    'Local redacted correlation and contention evidence do not replace production dashboards, log/trace integration, capacity testing, or approved on-call thresholds.',
    'The audit lookup/export is a bounded JSON read model only; incident ownership, approved retention/export handling, security review, and manual go-live approval remain open.',
  ];

  return {
    reportId: 'learning-local-demo-auth-operational-alert-policy-matrix',
    generatedAt,
    scope: 'repo-local-synthetic-plus-disposable-local-evidence',
    decision: 'AUTH_ALERT_AUDIT_READ_MODEL_DISPOSABLE_LOCAL_VERIFIED',
    productionReady: false,
    productionEnabled: false,
    fixture: {
      snapshotSource: 'SYNTHETIC_SHARED_COUNTER_SNAPSHOT',
      loginThrottled: 7,
      refreshThrottled: 6,
      refreshReplayDenied: 2,
      sessionRepositoryErrors: 1,
    },
    totals: {
      policyCount: initialEvaluation.totals.evaluatedPolicyCount,
      initialOpenCandidateCount: initialEvaluation.totals.openCandidateCount,
      cooldownSuppressedCandidateCount:
        cooldownEvaluation.totals.suppressedCandidateCount,
      rolePermissionCaseCount: rolePermissionRows.length,
      allowedReadOnlyRoleCount: rolePermissionRows.filter(
        (row) => row.decision === 'ALLOWED_READ_ONLY',
      ).length,
      deniedBeforeSnapshotRoleCount: rolePermissionRows.filter(
        (row) => row.decision === 'DENIED_BEFORE_SNAPSHOT',
      ).length,
      snapshotOutageDeniedCount: 1,
      stateOutageDeniedCount: 1,
      auditOutageDeniedCount: 1,
      sharedStateDisposableSmokeCount: 1,
      appendOnlyAuditDisposableSmokeCount: 1,
      contentionCapacityDisposableSmokeCount: 1,
      auditCorrelationLookupFixtureCount: 1,
      auditIncidentExportFixtureRowCount:
        auditReadModelFixture.correlationIdsNewestFirst.length,
      auditIncidentExportFixturePageCount:
        auditReadModelFixture.expectedPageSizes.length,
      auditReadModelDeniedRoleCount: auditReadModelFixture.deniedRoles.length,
      auditReadModelOutageDeniedCount: 2,
      productionBlockerCount: productionBlockers.length,
      productionReadyClaimCount: 0,
      openLocalSafetyGateCount: 0,
    },
    initialEvaluation,
    cooldownEvaluation,
    rolePermissionRows,
    auditReadModelFixture,
    snapshotOutageEvidence: {
      fixtureCase: 'synthetic operational snapshot rejection',
      expectedHttpStatus: 503,
      failClosed: true,
      evidencePath: 'apps/api/src/auth/auth-operational-alert-policy.spec.ts',
    },
    stateOutageEvidence: {
      fixtureCase: 'synthetic alert-state rejection',
      expectedHttpStatus: 503,
      failClosed: true,
      evidencePath: 'apps/api/src/auth/auth-operational-alert-policy.spec.ts',
    },
    auditOutageEvidence: {
      fixtureCase: 'synthetic append-only evaluation audit rejection',
      expectedHttpStatus: 503,
      failClosed: true,
      evidencePath: 'apps/api/src/auth/auth-operational-alert-policy.spec.ts',
    },
    disposableSmokeEvidence: {
      processCount: 2,
      randomLocalhostDatabaseCount: 1,
      concurrentEvaluationCount: 8,
      expectedOpenCandidateSets: 1,
      expectedCooldownSuppressedSets: 7,
      appendOnlyAudit: true,
      idempotentRedactedCorrelation: true,
      exactExpiredStateCleanup: true,
      exactExpiredAuditCleanup: true,
      lockContentionMeasured: true,
      correlationLookupVerified: true,
      deterministicIncidentPaginationVerified: true,
      boundedIncidentWindowVerified: true,
      auditReadModelOutageDenied: true,
      localTechnicalThresholdMs: 5_000,
      evidencePath:
        'exports/learning-local-demo-auth-operational-alert-state-disposable-smoke-report.json',
    },
    productionBlockers,
    evidencePaths: [
      'apps/api/src/auth/auth-operational-alert-policy.ts',
      'apps/api/src/auth/auth-operational-alerts.controller.ts',
      'apps/api/src/auth/auth-operational-alert-policy.spec.ts',
      'apps/api/src/auth/auth-operational-alert-state.ts',
      'apps/api/src/auth/prisma-auth-operational-alert-state.ts',
      'apps/api/src/auth/prisma-auth-operational-alert-state.spec.ts',
      'apps/api/src/auth/auth-operational-alert-audit-read-model.ts',
      'apps/api/src/auth/auth-operational-alert-audits.controller.ts',
      'apps/api/src/auth/auth-operational-alert-audit-read-model.spec.ts',
      'apps/api/prisma/migrations/20260710170000_auth_operational_alert_evaluation_audit/migration.sql',
      'apps/api/prisma/migrations/20260710183000_auth_operational_alert_audit_read_model/migration.sql',
      'apps/api/src/learning-local-demo/auth-operational-alert-policy-matrix.ts',
    ],
    safety: {
      fixtureOnly: false,
      disposableLocalOnly: true,
      productionDbUsed: false,
      stagingDbUsed: false,
      externalAlertProviderUsed: false,
      liveNotificationUsed: false,
      rawRateLimitKeysExposed: false,
      rawCredentialsOrTokensExposed: false,
      appendOnlyEvaluationAudit: true,
      evaluationAuditRedacted: true,
      auditReadModelRedacted: true,
      auditReadModelExternalDeliveryUsed: false,
      realAccountOrSessionUsed: false,
      productionReady: false,
    },
  };
};

export type AuthOperationalAlertPolicyMatrixReport = ReturnType<
  typeof buildAuthOperationalAlertPolicyMatrixReport
>;

export const toAuthOperationalAlertPolicyMatrixMarkdown = (
  report: AuthOperationalAlertPolicyMatrixReport,
) =>
  [
    '# Auth Operational Alert Policy Matrix',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Decision: ${report.decision}`,
    '',
    '- production_ready=false',
    '- production_enabled=false',
    '- disposableLocalOnly=true',
    '- externalAlertProviderUsed=false',
    '- liveNotificationUsed=false',
    '',
    '## Threshold And Cooldown Evidence',
    '',
    '| Alert | Metric | Severity | Threshold | Observed | Initial | Repeated inside cooldown |',
    '| --- | --- | --- | ---: | ---: | --- | --- |',
    ...report.initialEvaluation.candidates.map((candidate) => {
      const repeated = report.cooldownEvaluation.candidates.find(
        (row) => row.alertCode === candidate.alertCode,
      );
      return `| ${candidate.alertCode} | ${candidate.metricKind} | ${candidate.severity} | ${candidate.threshold} | ${candidate.observedCount} | ${candidate.decision} | ${repeated?.decision ?? 'MISSING'} |`;
    }),
    '',
    '## Inspection Permission Evidence',
    '',
    '| Role | Decision | Snapshot read attempted | Actor identity exposed |',
    '| --- | --- | --- | --- |',
    ...report.rolePermissionRows.map(
      (row) =>
        `| ${row.role} | ${row.decision} | ${row.snapshotReadAttempted ? 'YES' : 'NO'} | ${row.actorIdentityExposed ? 'YES' : 'NO'} |`,
    ),
    '',
    '## Audit Correlation Lookup And Incident Export',
    '',
    `- Fixture correlations: ${report.auditReadModelFixture.correlationIdsNewestFirst.length}`,
    `- Expected page sizes: ${report.auditReadModelFixture.expectedPageSizes.join(', ')}`,
    `- Deterministic order: ${report.auditReadModelFixture.deterministicOrder}`,
    `- Maximum window days: ${report.auditReadModelFixture.maximumWindowDays}`,
    `- Maximum page size: ${report.auditReadModelFixture.maximumPageSize}`,
    `- Allowed roles: ${report.auditReadModelFixture.allowedRoles.join(', ')}`,
    `- Denied before repository read: ${report.auditReadModelFixture.deniedRoles.join(', ')}`,
    `- Repository outage HTTP status: ${report.auditReadModelFixture.repositoryOutageHttpStatus}`,
    `- External delivery used: ${report.auditReadModelFixture.externalDeliveryUsed}`,
    `- Excluded field families: ${report.auditReadModelFixture.excludedFieldFamilies.join(', ')}`,
    '',
    '## Snapshot Outage',
    '',
    `- Expected HTTP status: ${report.snapshotOutageEvidence.expectedHttpStatus}`,
    `- Fail closed: ${report.snapshotOutageEvidence.failClosed}`,
    `- State outage expected HTTP status: ${report.stateOutageEvidence.expectedHttpStatus}`,
    `- State outage fail closed: ${report.stateOutageEvidence.failClosed}`,
    `- Audit outage expected HTTP status: ${report.auditOutageEvidence.expectedHttpStatus}`,
    `- Audit outage fail closed: ${report.auditOutageEvidence.failClosed}`,
    '',
    '## Disposable Shared-State Smoke Contract',
    '',
    `- Independent Nest processes: ${report.disposableSmokeEvidence.processCount}`,
    `- Random localhost PostgreSQL databases: ${report.disposableSmokeEvidence.randomLocalhostDatabaseCount}`,
    `- Concurrent evaluations: ${report.disposableSmokeEvidence.concurrentEvaluationCount}`,
    `- OPEN candidate sets: ${report.disposableSmokeEvidence.expectedOpenCandidateSets}`,
    `- Cooldown-suppressed candidate sets: ${report.disposableSmokeEvidence.expectedCooldownSuppressedSets}`,
    `- Exact expired-state cleanup: ${report.disposableSmokeEvidence.exactExpiredStateCleanup}`,
    `- Append-only audit: ${report.disposableSmokeEvidence.appendOnlyAudit}`,
    `- Idempotent redacted correlation: ${report.disposableSmokeEvidence.idempotentRedactedCorrelation}`,
    `- Exact expired-audit cleanup: ${report.disposableSmokeEvidence.exactExpiredAuditCleanup}`,
    `- Lock contention measured: ${report.disposableSmokeEvidence.lockContentionMeasured}`,
    `- Local technical threshold (ms): ${report.disposableSmokeEvidence.localTechnicalThresholdMs}`,
    '',
    '## Production Blockers',
    '',
    ...report.productionBlockers.map((blocker) => `- ${blocker}`),
    '',
  ].join('\n');
