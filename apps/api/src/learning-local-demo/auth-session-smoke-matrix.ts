export type LearningLocalDemoAuthSmokeRole =
  'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN' | 'SUPPORT';

export type LearningLocalDemoAuthSmokeScenario =
  | 'LOGIN_SUCCESS'
  | 'LOGOUT_SESSION_END'
  | 'EXPIRED_TOKEN_DENIAL'
  | 'REVOKED_SESSION_DEVICE_DENIAL'
  | 'WRONG_ROLE_ACCESS_DENIAL';

export type LearningLocalDemoAuthSmokeDecision = 'ALLOWED' | 'DENIED';

export type LearningLocalDemoAuthSmokeCase = {
  smokeCaseId: string;
  actorId: string;
  actorEmail: string;
  role: LearningLocalDemoAuthSmokeRole;
  scenario: LearningLocalDemoAuthSmokeScenario;
  targetSurface: string;
  expectedHttpStatus: 200 | 401 | 403;
  authDecision: LearningLocalDemoAuthSmokeDecision;
  tokenState: 'VALID' | 'EXPIRED' | 'ENDED' | 'REVOKED';
  sessionState: 'ACTIVE' | 'ENDED' | 'REVOKED' | 'NOT_CREATED';
  deviceId: string;
  denialReason: string | null;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthSmokeEvidenceRow = {
  evidenceKind:
    LearningLocalDemoAuthSmokeScenario | 'ROLE_COVERAGE' | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthSessionSmokeMatrixReport = {
  reportName: 'Learning Local Demo Auth Session Smoke Matrix';
  generatedFor: 'local-demo-auth-session-smoke-matrix';
  generatedAt: string;
  productionReady: false;
  fixtureOnly: true;
  endpointPath: '/v1/learning-local-demo/auth-session-smoke-matrix-report';
  dashboardEvidencePath: '/admin/learning-local-demo#auth-session-smoke-matrix';
  jsonExportPath: 'exports/learning-local-demo-auth-session-smoke-matrix-report.json';
  markdownExportPath: 'exports/learning-local-demo-auth-session-smoke-matrix-report.md';
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
    smokeCaseCount: number;
    roleCoverageCount: number;
    requiredRoleCoverageCount: number;
    scenarioCoverageCount: number;
    requiredScenarioCoverageCount: number;
    loginSuccessCount: number;
    logoutSessionEndCount: number;
    expiredTokenDeniedCount: number;
    revokedSessionDeviceDeniedCount: number;
    wrongRoleAccessDeniedCount: number;
    allowedCaseCount: number;
    deniedCaseCount: number;
    negativePermissionCaseCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  statusCounts: {
    role: Record<LearningLocalDemoAuthSmokeRole, number>;
    scenario: Record<LearningLocalDemoAuthSmokeScenario, number>;
    decision: Record<LearningLocalDemoAuthSmokeDecision, number>;
  };
  smokeCaseRows: LearningLocalDemoAuthSmokeCase[];
  evidenceRows: LearningLocalDemoAuthSmokeEvidenceRow[];
};

const requiredRoles: readonly LearningLocalDemoAuthSmokeRole[] = [
  'STUDENT',
  'PARENT',
  'TEACHER',
  'ADMIN',
  'SUPPORT',
];

const requiredScenarios: readonly LearningLocalDemoAuthSmokeScenario[] = [
  'LOGIN_SUCCESS',
  'LOGOUT_SESSION_END',
  'EXPIRED_TOKEN_DENIAL',
  'REVOKED_SESSION_DEVICE_DENIAL',
  'WRONG_ROLE_ACCESS_DENIAL',
];

export const learningLocalDemoAuthSessionSmokeCases: LearningLocalDemoAuthSmokeCase[] =
  [
    {
      smokeCaseId: 'auth-smoke-student-login-success',
      actorId: 'demo-student',
      actorEmail: 'student@demo.local',
      role: 'STUDENT',
      scenario: 'LOGIN_SUCCESS',
      targetSurface: '/me/dashboard',
      expectedHttpStatus: 200,
      authDecision: 'ALLOWED',
      tokenState: 'VALID',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-student',
      denialReason: null,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Student demo login issues a valid bearer token and active local session for dashboard access.',
    },
    {
      smokeCaseId: 'auth-smoke-parent-login-success',
      actorId: 'demo-parent',
      actorEmail: 'parent@demo.local',
      role: 'PARENT',
      scenario: 'LOGIN_SUCCESS',
      targetSurface: '/me/dashboard',
      expectedHttpStatus: 200,
      authDecision: 'ALLOWED',
      tokenState: 'VALID',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-parent',
      denialReason: null,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Parent demo login issues a valid bearer token and active local session for guardian dashboard access.',
    },
    {
      smokeCaseId: 'auth-smoke-teacher-login-success',
      actorId: 'demo-teacher',
      actorEmail: 'teacher@demo.local',
      role: 'TEACHER',
      scenario: 'LOGIN_SUCCESS',
      targetSurface: '/me/dashboard',
      expectedHttpStatus: 200,
      authDecision: 'ALLOWED',
      tokenState: 'VALID',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-teacher',
      denialReason: null,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Teacher demo login issues a valid bearer token and active local session for teacher dashboard access.',
    },
    {
      smokeCaseId: 'auth-smoke-admin-login-success',
      actorId: 'demo-admin',
      actorEmail: 'admin@demo.local',
      role: 'ADMIN',
      scenario: 'LOGIN_SUCCESS',
      targetSurface: '/me/admin-surface',
      expectedHttpStatus: 200,
      authDecision: 'ALLOWED',
      tokenState: 'VALID',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-admin',
      denialReason: null,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Admin demo login issues a valid bearer token and passes the admin/director role guard surface.',
    },
    {
      smokeCaseId: 'auth-smoke-support-login-success',
      actorId: 'demo-support',
      actorEmail: 'support@demo.local',
      role: 'SUPPORT',
      scenario: 'LOGIN_SUCCESS',
      targetSurface: '/me/dashboard',
      expectedHttpStatus: 200,
      authDecision: 'ALLOWED',
      tokenState: 'VALID',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-support',
      denialReason: null,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Support demo login issues a valid bearer token for support dashboard access without admin privileges.',
    },
    {
      smokeCaseId: 'auth-smoke-teacher-logout-session-end-denied',
      actorId: 'demo-teacher',
      actorEmail: 'teacher@demo.local',
      role: 'TEACHER',
      scenario: 'LOGOUT_SESSION_END',
      targetSurface: '/me/dashboard',
      expectedHttpStatus: 401,
      authDecision: 'DENIED',
      tokenState: 'ENDED',
      sessionState: 'ENDED',
      deviceId: 'local-demo-web-teacher',
      denialReason: 'Session has ended',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Teacher token is denied after logout ends the local auth session.',
    },
    {
      smokeCaseId: 'auth-smoke-student-expired-token-denied',
      actorId: 'demo-student',
      actorEmail: 'student@demo.local',
      role: 'STUDENT',
      scenario: 'EXPIRED_TOKEN_DENIAL',
      targetSurface: '/me/dashboard',
      expectedHttpStatus: 401,
      authDecision: 'DENIED',
      tokenState: 'EXPIRED',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-student',
      denialReason: 'Invalid or expired token',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Expired student bearer token is rejected before dashboard access.',
    },
    {
      smokeCaseId: 'auth-smoke-parent-revoked-device-denied',
      actorId: 'demo-parent',
      actorEmail: 'parent@demo.local',
      role: 'PARENT',
      scenario: 'REVOKED_SESSION_DEVICE_DENIAL',
      targetSurface: '/me/dashboard',
      expectedHttpStatus: 401,
      authDecision: 'DENIED',
      tokenState: 'REVOKED',
      sessionState: 'REVOKED',
      deviceId: 'local-demo-web-parent-revoked',
      denialReason: 'Session has been revoked',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Parent token is denied after the local demo device/session is revoked.',
    },
    {
      smokeCaseId: 'auth-smoke-support-wrong-role-admin-surface-denied',
      actorId: 'demo-support',
      actorEmail: 'support@demo.local',
      role: 'SUPPORT',
      scenario: 'WRONG_ROLE_ACCESS_DENIAL',
      targetSurface: '/me/admin-surface',
      expectedHttpStatus: 403,
      authDecision: 'DENIED',
      tokenState: 'VALID',
      sessionState: 'ACTIVE',
      deviceId: 'local-demo-web-support',
      denialReason: 'Insufficient role',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Support role is authenticated but denied on admin/director-only surface.',
    },
  ];

export const buildLearningLocalDemoAuthSessionSmokeMatrixReport = (
  generatedAt = new Date().toISOString(),
): LearningLocalDemoAuthSessionSmokeMatrixReport => {
  const rows = learningLocalDemoAuthSessionSmokeCases;
  const roleCounts = countBy(requiredRoles, rows, (row) => row.role);
  const scenarioCounts = countBy(
    requiredScenarios,
    rows,
    (row) => row.scenario,
  );
  const decisionCounts = countBy(
    ['ALLOWED', 'DENIED'] as const,
    rows,
    (row) => row.authDecision,
  );
  const evidenceRows: LearningLocalDemoAuthSmokeEvidenceRow[] = [
    ...requiredScenarios.map((scenario) => ({
      evidenceKind: scenario,
      evidenceCount: scenarioCounts[scenario],
      stableFixtureIds: rows
        .filter((row) => row.scenario === scenario)
        .map((row) => row.smokeCaseId),
      fixtureOnly: true as const,
      providerUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${scenarioCounts[scenario]} fixture-only ${scenario.toLowerCase()} smoke case(s).`,
    })),
    {
      evidenceKind: 'ROLE_COVERAGE',
      evidenceCount: requiredRoles.filter((role) => roleCounts[role] > 0)
        .length,
      stableFixtureIds: [...requiredRoles],
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Student, parent, teacher, admin, and support demo roles are covered by the auth smoke matrix.',
    },
    {
      evidenceKind: 'SAFETY_GATE',
      evidenceCount: 10,
      stableFixtureIds: [
        'productionDbUsed=false',
        'noProductionDbRead=true',
        'providerApiUsed=false',
        'paymentProviderUsed=false',
        'notificationProviderUsed=false',
        'aiProviderExecutionUsed=false',
        'realAuthMutationUsed=false',
        'realSessionMutationUsed=false',
        'realLearningMutationUsed=false',
        'secretsRequired=false',
      ],
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Auth/session smoke evidence uses local demo fixtures and in-process test state only.',
    },
  ];

  return {
    reportName: 'Learning Local Demo Auth Session Smoke Matrix',
    generatedFor: 'local-demo-auth-session-smoke-matrix',
    generatedAt,
    productionReady: false,
    fixtureOnly: true,
    endpointPath: '/v1/learning-local-demo/auth-session-smoke-matrix-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#auth-session-smoke-matrix',
    jsonExportPath:
      'exports/learning-local-demo-auth-session-smoke-matrix-report.json',
    markdownExportPath:
      'exports/learning-local-demo-auth-session-smoke-matrix-report.md',
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
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Auth/session smoke matrix covers login success, logout/session end, expired token denial, revoked device/session denial, wrong-role denial, and student/parent/teacher/admin/support demo roles.',
      remainingLocalDemoNotes: [
        'Production persistence for session revocation remains out of scope for this fixture-only slice.',
        'Production readiness remains false until external security review, persistent session storage, and deploy gates are approved.',
      ],
    },
    totals: {
      smokeCaseCount: rows.length,
      roleCoverageCount: requiredRoles.filter((role) => roleCounts[role] > 0)
        .length,
      requiredRoleCoverageCount: requiredRoles.length,
      scenarioCoverageCount: requiredScenarios.filter(
        (scenario) => scenarioCounts[scenario] > 0,
      ).length,
      requiredScenarioCoverageCount: requiredScenarios.length,
      loginSuccessCount: scenarioCounts.LOGIN_SUCCESS,
      logoutSessionEndCount: scenarioCounts.LOGOUT_SESSION_END,
      expiredTokenDeniedCount: scenarioCounts.EXPIRED_TOKEN_DENIAL,
      revokedSessionDeviceDeniedCount:
        scenarioCounts.REVOKED_SESSION_DEVICE_DENIAL,
      wrongRoleAccessDeniedCount: scenarioCounts.WRONG_ROLE_ACCESS_DENIAL,
      allowedCaseCount: decisionCounts.ALLOWED,
      deniedCaseCount: decisionCounts.DENIED,
      negativePermissionCaseCount: rows.filter(
        (row) => row.scenario === 'WRONG_ROLE_ACCESS_DENIAL',
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: 2,
      productionReadyClaimCount: 0,
      safetyGateCount: 10,
      closedSafetyGateCount: 10,
      openSafetyGateCount: 0,
    },
    statusCounts: {
      role: roleCounts,
      scenario: scenarioCounts,
      decision: decisionCounts,
    },
    smokeCaseRows: rows,
    evidenceRows,
  };
};

export const toLearningLocalDemoAuthSessionSmokeMatrixMarkdown = (
  report: LearningLocalDemoAuthSessionSmokeMatrixReport,
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
    '- realLearningMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Smoke cases: ${report.totals.smokeCaseCount}`,
    `- Role coverage: ${report.totals.roleCoverageCount}/${report.totals.requiredRoleCoverageCount}`,
    `- Scenario coverage: ${report.totals.scenarioCoverageCount}/${report.totals.requiredScenarioCoverageCount}`,
    `- Login success: ${report.totals.loginSuccessCount}`,
    `- Logout/session end denied: ${report.totals.logoutSessionEndCount}`,
    `- Expired token denied: ${report.totals.expiredTokenDeniedCount}`,
    `- Revoked session/device denied: ${report.totals.revokedSessionDeviceDeniedCount}`,
    `- Wrong-role access denied: ${report.totals.wrongRoleAccessDeniedCount}`,
    `- Allowed cases: ${report.totals.allowedCaseCount}`,
    `- Denied cases: ${report.totals.deniedCaseCount}`,
    `- Negative permission cases: ${report.totals.negativePermissionCaseCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Smoke Cases',
    '',
    '| Case | Role | Scenario | Surface | Expected | Decision | Token/session | Reason | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- | --- | --- |',
    ...report.smokeCaseRows.map(
      (row) =>
        `| ${[
          row.smokeCaseId,
          `${row.role} (${row.actorEmail})`,
          row.scenario,
          row.targetSurface,
          String(row.expectedHttpStatus),
          row.authDecision,
          `${row.tokenState}/${row.sessionState}`,
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
