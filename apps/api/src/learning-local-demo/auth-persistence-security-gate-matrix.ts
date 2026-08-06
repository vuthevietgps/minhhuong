export type LearningLocalDemoAuthPersistenceSecurityGateKind =
  | 'SCHEMA_REPOSITORY_CONTRACT'
  | 'DISTRIBUTED_REVOCATION_CONTRACT'
  | 'REFRESH_RETENTION_REUSE_POLICY'
  | 'AUDIT_RETENTION_EXPORT_POLICY'
  | 'RATE_LIMIT_MONITORING_HOOKS'
  | 'ROLLBACK_MIGRATION_NOTES';

export type LearningLocalDemoAuthPersistenceSecurityGateDecision =
  'LOCAL_DEMO_DESIGN_EVIDENCE_READY';

export type LearningLocalDemoAuthPersistenceSecurityGateRow = {
  gateRowId: string;
  gateKind: LearningLocalDemoAuthPersistenceSecurityGateKind;
  contractSurface: string;
  expectedProductionContract: string;
  localFixtureEvidence: string;
  requiredProductionControls: string[];
  plannedVerification: string[];
  rollbackOrMigrationNote: string;
  productionBlocker: true;
  manualApprovalRequired: true;
  readinessDecision: LearningLocalDemoAuthPersistenceSecurityGateDecision;
  fixtureOnly: true;
  productionDbUsed: false;
  noProductionDbRead: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthPersistenceSecurityGateEvidenceRow = {
  evidenceKind:
    LearningLocalDemoAuthPersistenceSecurityGateKind | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthPersistenceSecurityGateMatrixReport = {
  reportName: 'Learning Local Demo Auth Persistence Security Gate Matrix';
  generatedFor: 'local-demo-auth-persistence-security-gate-matrix';
  generatedAt: string;
  productionReady: false;
  fixtureOnly: true;
  endpointPath: '/v1/learning-local-demo/auth-persistence-security-gate-matrix-report';
  dashboardEvidencePath: '/admin/learning-local-demo#auth-persistence-security-gate-matrix';
  jsonExportPath: 'exports/learning-local-demo-auth-persistence-security-gate-matrix-report.json';
  markdownExportPath: 'exports/learning-local-demo-auth-persistence-security-gate-matrix-report.md';
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
    realAuditMutationUsed: false;
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
    securityDesignGateCount: number;
    schemaRepositoryContractCount: number;
    distributedRevocationContractCount: number;
    refreshRetentionReusePolicyCount: number;
    auditRetentionExportPolicyCount: number;
    rateLimitMonitoringHookCount: number;
    rollbackMigrationNoteCount: number;
    productionBlockerCount: number;
    manualApprovalRequiredCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  statusCounts: {
    gateKind: Record<LearningLocalDemoAuthPersistenceSecurityGateKind, number>;
    readinessDecision: Record<
      LearningLocalDemoAuthPersistenceSecurityGateDecision,
      number
    >;
  };
  securityGateRows: LearningLocalDemoAuthPersistenceSecurityGateRow[];
  evidenceRows: LearningLocalDemoAuthPersistenceSecurityGateEvidenceRow[];
};

const requiredGateKinds: readonly LearningLocalDemoAuthPersistenceSecurityGateKind[] =
  [
    'SCHEMA_REPOSITORY_CONTRACT',
    'DISTRIBUTED_REVOCATION_CONTRACT',
    'REFRESH_RETENTION_REUSE_POLICY',
    'AUDIT_RETENTION_EXPORT_POLICY',
    'RATE_LIMIT_MONITORING_HOOKS',
    'ROLLBACK_MIGRATION_NOTES',
  ];

const safetyGateFixtureIds = [
  'productionDbUsed=false',
  'noProductionDbRead=true',
  'providerApiUsed=false',
  'paymentProviderUsed=false',
  'notificationProviderUsed=false',
  'aiProviderExecutionUsed=false',
  'liveAdsExecuted=false',
  'realAuthMutationUsed=false',
  'realSessionMutationUsed=false',
  'realRefreshTokenMutationUsed=false',
  'realAuditMutationUsed=false',
  'realLearningMutationUsed=false',
  'secretsRequired=false',
] as const;

export const learningLocalDemoAuthPersistenceSecurityGateRows: LearningLocalDemoAuthPersistenceSecurityGateRow[] =
  [
    {
      gateRowId: 'auth-persistence-schema-repository-contract-design',
      gateKind: 'SCHEMA_REPOSITORY_CONTRACT',
      contractSurface:
        'AuthSessionStore production repository contract for auth_sessions, auth_refresh_tokens, and auth_session_audit_events.',
      expectedProductionContract:
        'A future PostgreSQL/Prisma repository must implement the existing AuthSessionStore methods with atomic writes for session state, refresh-token state, and append-only audit events.',
      localFixtureEvidence:
        'AUTH_SESSION_STORE now selects FixtureBackedAuthSessionStore for local demo or PrismaAuthSessionStore for explicit disposable local/staging use; the migration and repository contract pass against a random localhost database.',
      requiredProductionControls: [
        'Store only refresh-token hashes, never raw refresh tokens.',
        'Use indexed session id, user id, device id, state, and expiresAt columns.',
        'Constrain refresh-token state transitions to ACTIVE, ROTATED, REUSED, REVOKED, and EXPIRED.',
        'Write audit events append-only with admin/support read filters.',
      ],
      plannedVerification: [
        'Repository contract and migration/rollback tests pass against a disposable non-production database.',
        'Staging migration diff, backup/restore, and security review remain required before any production deploy.',
      ],
      rollbackOrMigrationNote:
        'Add tables behind a repository provider flag; rollback before production writes may drop tables, while rollback after writes must disable the provider and preserve data for audit.',
      productionBlocker: true,
      manualApprovalRequired: true,
      readinessDecision: 'LOCAL_DEMO_DESIGN_EVIDENCE_READY',
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Production schema/repository design is documented as a contract only; no production DB was read or mutated.',
    },
    {
      gateRowId: 'auth-persistence-distributed-revocation-contract',
      gateKind: 'DISTRIBUTED_REVOCATION_CONTRACT',
      contractSurface:
        'Cross-instance session and refresh-token revocation behavior for JWT guard and refresh endpoint.',
      expectedProductionContract:
        'Every API instance must deny a session after the central repository marks it ENDED, REVOKED, or EXPIRED; cache invalidation must be bounded by a documented max staleness window.',
      localFixtureEvidence:
        'Job 00059 uses two independent Prisma clients against one disposable localhost database; revocation by instance A is denied by instance B.',
      requiredProductionControls: [
        'Central revocation version or updatedAt cursor checked by every instance.',
        'Refresh-token reuse revokes the related session family across devices.',
        'JWT guard must fail closed when repository lookup or revocation cache is unavailable.',
      ],
      plannedVerification: [
        'Two-instance non-production smoke: revoke on instance A and deny on instance B.',
        'Cache outage test proves fail-closed behavior for protected routes.',
      ],
      rollbackOrMigrationNote:
        'Distributed revocation must launch with a kill switch that reverts traffic to the current local/session guard behavior only in non-production until manual approval.',
      productionBlocker: true,
      manualApprovalRequired: true,
      readinessDecision: 'LOCAL_DEMO_DESIGN_EVIDENCE_READY',
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Distributed revocation is specified as an expected cross-instance contract and remains a production blocker until staged.',
    },
    {
      gateRowId: 'auth-persistence-refresh-retention-reuse-policy',
      gateKind: 'REFRESH_RETENTION_REUSE_POLICY',
      contractSurface:
        'Refresh-token retention, rotation, reuse response, and session-family revocation policy.',
      expectedProductionContract:
        'Rotated, reused, revoked, and expired refresh-token hashes must be retained long enough for replay detection and audit while raw token values remain unavailable.',
      localFixtureEvidence:
        'Job 00037 refresh lifecycle matrix covers rotation denial, reuse denial, session revocation, and audit visibility with fixture rows.',
      requiredProductionControls: [
        'Retain inactive refresh-token hashes for at least 30 days, subject to legal/security review.',
        'On reused token detection, mark token REUSED, revoke the session family, and emit an audit event.',
        'Deny refresh for expired or non-active tokens with a stable unauthorized response.',
      ],
      plannedVerification: [
        'Retention cleanup dry-run report shows deleted candidates without deleting production data.',
        'Replay test proves reused token denial and session-family revocation.',
      ],
      rollbackOrMigrationNote:
        'Retention cleanup must run in dry-run mode first; rollback disables cleanup scheduling and preserves token hash rows.',
      productionBlocker: true,
      manualApprovalRequired: true,
      readinessDecision: 'LOCAL_DEMO_DESIGN_EVIDENCE_READY',
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Refresh-token retention and reuse response are policy evidence only; no production token data was accessed.',
    },
    {
      gateRowId: 'auth-persistence-audit-retention-read-only-export-policy',
      gateKind: 'AUDIT_RETENTION_EXPORT_POLICY',
      contractSurface:
        'Auth lifecycle audit retention, admin/support visibility, and read-only export policy.',
      expectedProductionContract:
        'Session and refresh-token lifecycle audit events must be append-only, retained according to policy, and exportable through a redacted read-only admin/support path.',
      localFixtureEvidence:
        'Fixture audit events are visible to ADMIN and SUPPORT roles while learner roles receive no audit rows.',
      requiredProductionControls: [
        'Audit export must be read-only and scoped to admin/support roles.',
        'Exports must redact token hashes and avoid raw IP/user-agent payloads unless approved.',
        'Retention must be documented before production enablement.',
      ],
      plannedVerification: [
        'Read-only export smoke proves admin/support can export and student cannot.',
        'Audit payload scan proves no raw refresh tokens or secrets are present.',
      ],
      rollbackOrMigrationNote:
        'Audit tables are append-only; rollback may disable export endpoints but must not delete retained audit rows.',
      productionBlocker: true,
      manualApprovalRequired: true,
      readinessDecision: 'LOCAL_DEMO_DESIGN_EVIDENCE_READY',
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Audit retention/export policy is represented as read-only fixture evidence and remains production gated.',
    },
    {
      gateRowId: 'auth-persistence-rate-limit-monitoring-hooks',
      gateKind: 'RATE_LIMIT_MONITORING_HOOKS',
      contractSurface:
        'Login, refresh, logout, session revocation, audit export, and cleanup monitoring hooks.',
      expectedProductionContract:
        'Auth endpoints must emit rate-limit decisions and monitoring counters for success, denial, reuse detection, cleanup, repository errors, and audit export reads.',
      localFixtureEvidence:
        'AUTH_OPERATIONAL_CONTROL now provides deterministic hashed-key login/refresh throttling and counters for success, denial, replay, cleanup, repository errors, and audit export without installing a live monitoring provider.',
      requiredProductionControls: [
        'Replace the process-local fixture with a shared multi-instance limiter keyed by approved actor, IP, and device signals.',
        'Export the implemented counters through an approved metrics adapter and retention policy.',
        'Route alerts for refresh-token replay spikes and repository lookup failures to an acknowledged incident owner.',
      ],
      plannedVerification: [
        'Completed locally: deterministic tests verify counter names, hashed-key snapshots, and role-scoped audit export totals.',
        'Completed locally: repeated login and refresh failures return 429; rate-limit seam outage returns service unavailable.',
        'Still required: multi-process staging smoke proves shared windows, metric export, and alert routing.',
      ],
      rollbackOrMigrationNote:
        'Monitoring hooks must be additive; rollback removes dashboards/alerts before removing emitted metric names.',
      productionBlocker: true,
      manualApprovalRequired: true,
      readinessDecision: 'LOCAL_DEMO_DESIGN_EVIDENCE_READY',
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Rate-limit and monitoring hooks are implemented and fixture-verified without calling any live provider or exposing secrets; shared production controls remain blocked.',
    },
    {
      gateRowId: 'auth-persistence-rollback-migration-notes',
      gateKind: 'ROLLBACK_MIGRATION_NOTES',
      contractSurface:
        'Auth persistence migration, rollback, and production enablement runbook notes.',
      expectedProductionContract:
        'Production auth persistence must ship through staged migrations, feature flags, backup verification, and a rollback plan that preserves security audit data.',
      localFixtureEvidence:
        'This local-demo matrix records the migration/rollback requirements before any schema migration is created.',
      requiredProductionControls: [
        'Run migration in staging with disposable fixtures before production.',
        'Take and verify backup/restore evidence before enabling persistent auth sessions.',
        'Keep production_ready=false until security review and manual go-live approval.',
      ],
      plannedVerification: [
        'Staging migration dry-run and rollback rehearsal evidence.',
        'Backup/restore rehearsal evidence tied to auth session tables.',
      ],
      rollbackOrMigrationNote:
        'Rollback after production writes must disable new writes and preserve tables; destructive rollback is allowed only before production enablement.',
      productionBlocker: true,
      manualApprovalRequired: true,
      readinessDecision: 'LOCAL_DEMO_DESIGN_EVIDENCE_READY',
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Rollback and migration notes are captured as local evidence; no deploy or production migration was run.',
    },
  ];

export const buildLearningLocalDemoAuthPersistenceSecurityGateMatrixReport = (
  generatedAt = new Date().toISOString(),
): LearningLocalDemoAuthPersistenceSecurityGateMatrixReport => {
  const rows = learningLocalDemoAuthPersistenceSecurityGateRows;
  const gateKindCounts = countBy(
    requiredGateKinds,
    rows,
    (row) => row.gateKind,
  );
  const readinessDecisionCounts = countBy(
    ['LOCAL_DEMO_DESIGN_EVIDENCE_READY'] as const,
    rows,
    (row) => row.readinessDecision,
  );
  const evidenceRows: LearningLocalDemoAuthPersistenceSecurityGateEvidenceRow[] =
    [
      ...requiredGateKinds.map((gateKind) => ({
        evidenceKind: gateKind,
        evidenceCount: gateKindCounts[gateKind],
        stableFixtureIds: rows
          .filter((row) => row.gateKind === gateKind)
          .map((row) => row.gateRowId),
        fixtureOnly: true as const,
        providerUsed: false as const,
        mutationUsed: false as const,
        evidenceSummary: `${gateKindCounts[gateKind]} fixture-only ${gateKind.toLowerCase()} design evidence row(s).`,
      })),
      {
        evidenceKind: 'SAFETY_GATE',
        evidenceCount: safetyGateFixtureIds.length,
        stableFixtureIds: [...safetyGateFixtureIds],
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Auth persistence security gate evidence is local-demo only and keeps production_ready=false.',
      },
    ];

  return {
    reportName: 'Learning Local Demo Auth Persistence Security Gate Matrix',
    generatedFor: 'local-demo-auth-persistence-security-gate-matrix',
    generatedAt,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/auth-persistence-security-gate-matrix-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#auth-persistence-security-gate-matrix',
    jsonExportPath:
      'exports/learning-local-demo-auth-persistence-security-gate-matrix-report.json',
    markdownExportPath:
      'exports/learning-local-demo-auth-persistence-security-gate-matrix-report.md',
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
      realAuditMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    },
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Prisma auth persistence code, schema, migration, fail-closed behavior, two-client revocation, rollback, and forward repair are disposable-local verified while production readiness remains false.',
      remainingLocalDemoNotes: [
        'The Prisma session and shared auth operational-control providers are implemented but not production-enabled; approved staging rehearsal, dashboards, alert routing, retention ownership, and manual go-live approval remain open.',
        'Security review, staging backup/restore rehearsal, migration approval, retention approval, and manual go-live approval remain required before production enablement.',
      ],
    },
    totals: {
      securityDesignGateCount: rows.length,
      schemaRepositoryContractCount: gateKindCounts.SCHEMA_REPOSITORY_CONTRACT,
      distributedRevocationContractCount:
        gateKindCounts.DISTRIBUTED_REVOCATION_CONTRACT,
      refreshRetentionReusePolicyCount:
        gateKindCounts.REFRESH_RETENTION_REUSE_POLICY,
      auditRetentionExportPolicyCount:
        gateKindCounts.AUDIT_RETENTION_EXPORT_POLICY,
      rateLimitMonitoringHookCount: gateKindCounts.RATE_LIMIT_MONITORING_HOOKS,
      rollbackMigrationNoteCount: gateKindCounts.ROLLBACK_MIGRATION_NOTES,
      productionBlockerCount: rows.filter((row) => row.productionBlocker)
        .length,
      manualApprovalRequiredCount: rows.filter(
        (row) => row.manualApprovalRequired,
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: 2,
      productionReadyClaimCount: 0,
      safetyGateCount: safetyGateFixtureIds.length,
      closedSafetyGateCount: safetyGateFixtureIds.length,
      openSafetyGateCount: 0,
    },
    statusCounts: {
      gateKind: gateKindCounts,
      readinessDecision: readinessDecisionCounts,
    },
    securityGateRows: rows,
    evidenceRows,
  };
};

export const toLearningLocalDemoAuthPersistenceSecurityGateMatrixMarkdown = (
  report: LearningLocalDemoAuthPersistenceSecurityGateMatrixReport,
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
    '- realAuditMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Security design gates: ${report.totals.securityDesignGateCount}`,
    `- Schema/repository contract rows: ${report.totals.schemaRepositoryContractCount}`,
    `- Distributed revocation contract rows: ${report.totals.distributedRevocationContractCount}`,
    `- Refresh retention/reuse policy rows: ${report.totals.refreshRetentionReusePolicyCount}`,
    `- Audit retention/export policy rows: ${report.totals.auditRetentionExportPolicyCount}`,
    `- Rate-limit/monitoring hook rows: ${report.totals.rateLimitMonitoringHookCount}`,
    `- Rollback/migration note rows: ${report.totals.rollbackMigrationNoteCount}`,
    `- Production blockers: ${report.totals.productionBlockerCount}`,
    `- Manual approvals required: ${report.totals.manualApprovalRequiredCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Security Gate Rows',
    '',
    '| Gate | Kind | Contract surface | Required controls | Planned verification | Rollback/migration | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.securityGateRows.map(
      (row) =>
        `| ${[
          row.gateRowId,
          row.gateKind,
          row.contractSurface,
          row.requiredProductionControls.join('<br>'),
          row.plannedVerification.join('<br>'),
          row.rollbackOrMigrationNote,
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
