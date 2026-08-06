export type LearningLocalDemoAuthRefreshLifecycleRole =
  'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN' | 'SUPPORT';

export type LearningLocalDemoAuthRefreshLifecycleScenario =
  | 'PERSISTENT_SESSION_LOOKUP'
  | 'REFRESH_TOKEN_ROTATION_DENIAL'
  | 'REUSED_REFRESH_TOKEN_DENIAL'
  | 'CROSS_DEVICE_REVOCATION'
  | 'SESSION_CLEANUP_EXPIRY'
  | 'ADMIN_SUPPORT_AUDIT_READ_ONLY';

export type LearningLocalDemoAuthRefreshLifecycleDecision =
  'ALLOWED' | 'DENIED' | 'CLEANED_UP' | 'READ_ONLY_VISIBLE';

export type LearningLocalDemoAuthRefreshLifecycleCase = {
  lifecycleCaseId: string;
  actorId: string;
  actorEmail: string;
  role: LearningLocalDemoAuthRefreshLifecycleRole;
  scenario: LearningLocalDemoAuthRefreshLifecycleScenario;
  targetSurface: string;
  expectedHttpStatus: 200 | 401;
  authDecision: LearningLocalDemoAuthRefreshLifecycleDecision;
  sessionStore: 'FIXTURE_BACKED_PERSISTENT_STORE';
  tokenState: 'VALID' | 'ROTATED' | 'REUSED' | 'REVOKED' | 'EXPIRED';
  refreshTokenState:
    'ACTIVE' | 'ROTATED' | 'REUSED' | 'REVOKED' | 'EXPIRED' | 'NOT_REQUIRED';
  sessionState: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  deviceId: string;
  auditVisibleTo: ('ADMIN' | 'SUPPORT')[];
  denialReason: string | null;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthRefreshLifecycleEvidenceRow = {
  evidenceKind:
    | LearningLocalDemoAuthRefreshLifecycleScenario
    | 'STORE_ABSTRACTION'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthRefreshLifecycleMatrixReport = {
  reportName: 'Learning Local Demo Auth Refresh Lifecycle Matrix';
  generatedFor: 'local-demo-auth-refresh-lifecycle-matrix';
  generatedAt: string;
  productionReady: false;
  fixtureOnly: true;
  endpointPath: '/v1/learning-local-demo/auth-refresh-lifecycle-matrix-report';
  dashboardEvidencePath: '/admin/learning-local-demo#auth-refresh-lifecycle-matrix';
  jsonExportPath: 'exports/learning-local-demo-auth-refresh-lifecycle-matrix-report.json';
  markdownExportPath: 'exports/learning-local-demo-auth-refresh-lifecycle-matrix-report.md';
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    aiProviderExecutionUsed: false;
    liveAdsExecuted: false;
    realAuthMutationUsed: false;
    realSessionMutationUsed: false;
    realRefreshTokenMutationUsed: false;
    realLearningMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    lifecycleCaseCount: number;
    persistentSessionLookupCount: number;
    refreshTokenRotationDeniedCount: number;
    reusedRefreshTokenDeniedCount: number;
    crossDeviceRevocationCount: number;
    sessionCleanupExpiryCount: number;
    adminSupportAuditVisibilityCount: number;
    adminSupportAuditRoleCount: number;
    allowedCaseCount: number;
    deniedCaseCount: number;
    cleanedUpCaseCount: number;
    readOnlyVisibleCaseCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  statusCounts: {
    role: Record<LearningLocalDemoAuthRefreshLifecycleRole, number>;
    scenario: Record<LearningLocalDemoAuthRefreshLifecycleScenario, number>;
    decision: Record<LearningLocalDemoAuthRefreshLifecycleDecision, number>;
  };
  lifecycleCaseRows: LearningLocalDemoAuthRefreshLifecycleCase[];
  evidenceRows: LearningLocalDemoAuthRefreshLifecycleEvidenceRow[];
};

const requiredRoles: readonly LearningLocalDemoAuthRefreshLifecycleRole[] = [
  'STUDENT',
  'PARENT',
  'TEACHER',
  'ADMIN',
  'SUPPORT',
];

const requiredScenarios: readonly LearningLocalDemoAuthRefreshLifecycleScenario[] =
  [
    'PERSISTENT_SESSION_LOOKUP',
    'REFRESH_TOKEN_ROTATION_DENIAL',
    'REUSED_REFRESH_TOKEN_DENIAL',
    'CROSS_DEVICE_REVOCATION',
    'SESSION_CLEANUP_EXPIRY',
    'ADMIN_SUPPORT_AUDIT_READ_ONLY',
  ];

export const learningLocalDemoAuthRefreshLifecycleCases: LearningLocalDemoAuthRefreshLifecycleCase[] =
  [
    {
      lifecycleCaseId: 'auth-refresh-persistent-session-store-lookup',
      actorId: 'demo-student',
      actorEmail: 'student@demo.local',
      role: 'STUDENT',
      scenario: 'PERSISTENT_SESSION_LOOKUP',
      targetSurface: 'AuthSessionService.getSession',
      expectedHttpStatus: 200,
      authDecision: 'ALLOWED',
      sessionStore: 'FIXTURE_BACKED_PERSISTENT_STORE',
      tokenState: 'VALID',
      refreshTokenState: 'ACTIVE',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-student',
      auditVisibleTo: ['ADMIN', 'SUPPORT'],
      denialReason: null,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'A session created through one service instance is readable through another service instance sharing the fixture-backed store.',
    },
    {
      lifecycleCaseId: 'auth-refresh-rotated-token-denied',
      actorId: 'demo-parent',
      actorEmail: 'parent@demo.local',
      role: 'PARENT',
      scenario: 'REFRESH_TOKEN_ROTATION_DENIAL',
      targetSurface: 'POST /auth/refresh',
      expectedHttpStatus: 401,
      authDecision: 'DENIED',
      sessionStore: 'FIXTURE_BACKED_PERSISTENT_STORE',
      tokenState: 'ROTATED',
      refreshTokenState: 'ROTATED',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-parent',
      auditVisibleTo: ['ADMIN', 'SUPPORT'],
      denialReason: 'Refresh token reuse denied',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'A refresh token is rotated after first use and the old token is denied on replay.',
    },
    {
      lifecycleCaseId: 'auth-refresh-reused-token-denied-and-audited',
      actorId: 'demo-parent',
      actorEmail: 'parent@demo.local',
      role: 'PARENT',
      scenario: 'REUSED_REFRESH_TOKEN_DENIAL',
      targetSurface: 'POST /auth/refresh',
      expectedHttpStatus: 401,
      authDecision: 'DENIED',
      sessionStore: 'FIXTURE_BACKED_PERSISTENT_STORE',
      tokenState: 'REUSED',
      refreshTokenState: 'REUSED',
      sessionState: 'REVOKED',
      deviceId: 'local-demo-web-parent',
      auditVisibleTo: ['ADMIN', 'SUPPORT'],
      denialReason: 'Refresh token reuse denied',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'A replayed rotated token is marked reused, denied, and tied to admin/support audit visibility.',
    },
    {
      lifecycleCaseId: 'auth-refresh-cross-device-session-revoked',
      actorId: 'demo-teacher',
      actorEmail: 'teacher@demo.local',
      role: 'TEACHER',
      scenario: 'CROSS_DEVICE_REVOCATION',
      targetSurface: 'AuthSessionService.revokeOtherSessions',
      expectedHttpStatus: 401,
      authDecision: 'DENIED',
      sessionStore: 'FIXTURE_BACKED_PERSISTENT_STORE',
      tokenState: 'REVOKED',
      refreshTokenState: 'REVOKED',
      sessionState: 'REVOKED',
      deviceId: 'local-demo-tablet-teacher',
      auditVisibleTo: ['ADMIN', 'SUPPORT'],
      denialReason: 'Session has been revoked',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'A teacher session on a second fixture device is revoked while the current device remains active.',
    },
    {
      lifecycleCaseId: 'auth-refresh-session-cleanup-expiry',
      actorId: 'demo-student',
      actorEmail: 'student@demo.local',
      role: 'STUDENT',
      scenario: 'SESSION_CLEANUP_EXPIRY',
      targetSurface: 'AuthSessionService.cleanupExpiredSessions',
      expectedHttpStatus: 401,
      authDecision: 'CLEANED_UP',
      sessionStore: 'FIXTURE_BACKED_PERSISTENT_STORE',
      tokenState: 'EXPIRED',
      refreshTokenState: 'EXPIRED',
      sessionState: 'EXPIRED',
      deviceId: 'local-demo-web-student-expired',
      auditVisibleTo: ['ADMIN', 'SUPPORT'],
      denialReason: 'Invalid or expired token',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Expired sessions and active refresh tokens attached to them are cleaned up by the fixture-backed store.',
    },
    {
      lifecycleCaseId: 'auth-refresh-admin-support-read-only-audit-visible',
      actorId: 'demo-support',
      actorEmail: 'support@demo.local',
      role: 'SUPPORT',
      scenario: 'ADMIN_SUPPORT_AUDIT_READ_ONLY',
      targetSurface: 'AuthSessionService.listAuditEventsForRoles',
      expectedHttpStatus: 200,
      authDecision: 'READ_ONLY_VISIBLE',
      sessionStore: 'FIXTURE_BACKED_PERSISTENT_STORE',
      tokenState: 'VALID',
      refreshTokenState: 'NOT_REQUIRED',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-support-console',
      auditVisibleTo: ['ADMIN', 'SUPPORT'],
      denialReason: null,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Admin and support roles can read fixture audit events while learner roles receive no audit event rows.',
    },
  ];

export const buildLearningLocalDemoAuthRefreshLifecycleMatrixReport = (
  generatedAt = new Date().toISOString(),
): LearningLocalDemoAuthRefreshLifecycleMatrixReport => {
  const rows = learningLocalDemoAuthRefreshLifecycleCases;
  const roleCounts = countBy(requiredRoles, rows, (row) => row.role);
  const scenarioCounts = countBy(
    requiredScenarios,
    rows,
    (row) => row.scenario,
  );
  const decisionCounts = countBy(
    ['ALLOWED', 'DENIED', 'CLEANED_UP', 'READ_ONLY_VISIBLE'] as const,
    rows,
    (row) => row.authDecision,
  );
  const evidenceRows: LearningLocalDemoAuthRefreshLifecycleEvidenceRow[] = [
    ...requiredScenarios.map((scenario) => ({
      evidenceKind: scenario,
      evidenceCount: scenarioCounts[scenario],
      stableFixtureIds: rows
        .filter((row) => row.scenario === scenario)
        .map((row) => row.lifecycleCaseId),
      fixtureOnly: true as const,
      providerUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${scenarioCounts[scenario]} fixture-only ${scenario.toLowerCase()} case(s).`,
    })),
    {
      evidenceKind: 'STORE_ABSTRACTION',
      evidenceCount: 1,
      stableFixtureIds: ['FixtureBackedAuthSessionStore', 'AUTH_SESSION_STORE'],
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'AuthSessionService uses a store abstraction backed by a repo-local fixture store for this hardening slice.',
    },
    {
      evidenceKind: 'SAFETY_GATE',
      evidenceCount: 11,
      stableFixtureIds: [
        'productionDbUsed=false',
        'noProductionDbRead=true',
        'providerApiUsed=false',
        'paymentProviderUsed=false',
        'notificationProviderUsed=false',
        'aiProviderExecutionUsed=false',
        'realAuthMutationUsed=false',
        'realSessionMutationUsed=false',
        'realRefreshTokenMutationUsed=false',
        'realLearningMutationUsed=false',
        'secretsRequired=false',
      ],
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Refresh/session lifecycle evidence uses local demo fixtures and fixture-backed store state only.',
    },
  ];

  return {
    reportName: 'Learning Local Demo Auth Refresh Lifecycle Matrix',
    generatedFor: 'local-demo-auth-refresh-lifecycle-matrix',
    generatedAt,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/auth-refresh-lifecycle-matrix-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#auth-refresh-lifecycle-matrix',
    jsonExportPath:
      'exports/learning-local-demo-auth-refresh-lifecycle-matrix-report.json',
    markdownExportPath:
      'exports/learning-local-demo-auth-refresh-lifecycle-matrix-report.md',
    safety: {
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      notificationProviderUsed: false,
      aiProviderExecutionUsed: false,
      liveAdsExecuted: false,
      realAuthMutationUsed: false,
      realSessionMutationUsed: false,
      realRefreshTokenMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Persistent fixture-backed session lookup, refresh rotation/reuse denial, cross-device revocation, expiry cleanup, and admin/support audit visibility are covered without production readiness claims.',
      remainingLocalDemoNotes: [
        'Production-grade database persistence and cross-instance distributed revocation remain out of scope for this fixture-only slice.',
        'External security review, token retention policy, deploy gates, and monitoring gates remain required before any production claim.',
      ],
    },
    totals: {
      lifecycleCaseCount: rows.length,
      persistentSessionLookupCount: scenarioCounts.PERSISTENT_SESSION_LOOKUP,
      refreshTokenRotationDeniedCount:
        scenarioCounts.REFRESH_TOKEN_ROTATION_DENIAL,
      reusedRefreshTokenDeniedCount: scenarioCounts.REUSED_REFRESH_TOKEN_DENIAL,
      crossDeviceRevocationCount: scenarioCounts.CROSS_DEVICE_REVOCATION,
      sessionCleanupExpiryCount: scenarioCounts.SESSION_CLEANUP_EXPIRY,
      adminSupportAuditVisibilityCount:
        scenarioCounts.ADMIN_SUPPORT_AUDIT_READ_ONLY,
      adminSupportAuditRoleCount: 2,
      allowedCaseCount: decisionCounts.ALLOWED,
      deniedCaseCount: decisionCounts.DENIED,
      cleanedUpCaseCount: decisionCounts.CLEANED_UP,
      readOnlyVisibleCaseCount: decisionCounts.READ_ONLY_VISIBLE,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: 2,
      productionReadyClaimCount: 0,
      safetyGateCount: 11,
      closedSafetyGateCount: 11,
      openSafetyGateCount: 0,
    },
    statusCounts: {
      role: roleCounts,
      scenario: scenarioCounts,
      decision: decisionCounts,
    },
    lifecycleCaseRows: rows,
    evidenceRows,
  };
};

export const toLearningLocalDemoAuthRefreshLifecycleMatrixMarkdown = (
  report: LearningLocalDemoAuthRefreshLifecycleMatrixReport,
) => {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    `Endpoint: ${report.endpointPath}`,
    `JSON export: ${report.jsonExportPath}`,
    `Markdown export: ${report.markdownExportPath}`,
    `Dashboard: ${report.dashboardEvidencePath}`,
    '',
    '## Safety',
    '',
    '- Fixture-only local demo data.',
    '- production_ready=false',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- aiProviderExecutionUsed=false',
    '- realAuthMutationUsed=false',
    '- realSessionMutationUsed=false',
    '- realRefreshTokenMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Lifecycle cases: ${report.totals.lifecycleCaseCount}`,
    `- Persistent session lookup: ${report.totals.persistentSessionLookupCount}`,
    `- Refresh-token rotation denied: ${report.totals.refreshTokenRotationDeniedCount}`,
    `- Reused refresh-token denied: ${report.totals.reusedRefreshTokenDeniedCount}`,
    `- Cross-device revocation: ${report.totals.crossDeviceRevocationCount}`,
    `- Session cleanup/expiry: ${report.totals.sessionCleanupExpiryCount}`,
    `- Admin/support audit visibility: ${report.totals.adminSupportAuditVisibilityCount}`,
    `- Admin/support audit roles: ${report.totals.adminSupportAuditRoleCount}`,
    `- Denied cases: ${report.totals.deniedCaseCount}`,
    `- Cleaned-up cases: ${report.totals.cleanedUpCaseCount}`,
    `- Read-only visible cases: ${report.totals.readOnlyVisibleCaseCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Lifecycle Cases',
    '',
    '| Case | Role | Scenario | Surface | Expected | Decision | Token/refresh/session | Audit | Reason | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |',
    ...report.lifecycleCaseRows.map(
      (row) =>
        `| ${[
          row.lifecycleCaseId,
          `${row.role} (${row.actorEmail})`,
          row.scenario,
          row.targetSurface,
          String(row.expectedHttpStatus),
          row.authDecision,
          `${row.tokenState}/${row.refreshTokenState}/${row.sessionState}`,
          row.auditVisibleTo.join(','),
          row.denialReason ?? 'none',
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Evidence Rows',
    '',
    '| Evidence | Count | IDs | Summary |',
    '| --- | ---: | --- | --- |',
    ...report.evidenceRows.map(
      (row) =>
        `| ${[
          row.evidenceKind,
          String(row.evidenceCount),
          row.stableFixtureIds.join('<br>'),
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
};

const countBy = <TKey extends string, TItem>(
  keys: readonly TKey[],
  items: readonly TItem[],
  keyFor: (item: TItem) => TKey,
) => {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<
    TKey,
    number
  >;

  for (const item of items) {
    counts[keyFor(item)] += 1;
  }

  return counts;
};
