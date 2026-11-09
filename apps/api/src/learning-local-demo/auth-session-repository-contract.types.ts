export type LearningLocalDemoAuthSessionRepositorySchemaSurface =
  'auth_sessions' | 'auth_refresh_tokens' | 'auth_session_audit_events';

export type LearningLocalDemoAuthSessionRepositoryTransitionKind =
  | 'CREATE_SESSION'
  | 'ROTATE_REFRESH_TOKEN'
  | 'REVOKE_SESSION'
  | 'EXPIRE_SESSION'
  | 'REUSE_DETECTION'
  | 'FAIL_CLOSED_LOOKUP';

export type LearningLocalDemoAuthSessionRepositoryDryRunKind =
  'MIGRATION_DRY_RUN' | 'ROLLBACK_NOTE';

export type LearningLocalDemoAuthSessionRepositorySchemaField = {
  fieldId: string;
  surface: LearningLocalDemoAuthSessionRepositorySchemaSurface;
  fieldName: string;
  contractType: string;
  required: boolean;
  indexed: boolean;
  storesRawRefreshToken: false;
  actorOrDeviceContext: boolean;
  appendOnlyAuditContext: boolean;
  fixtureOnly: true;
  productionDbUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthSessionRepositoryTransition = {
  transitionId: string;
  transitionKind: LearningLocalDemoAuthSessionRepositoryTransitionKind;
  contractSurface: string;
  repositoryMethods: string[];
  precondition: string;
  expectedStateChange: string;
  auditRequirement: string;
  failureMode: string;
  requiresAtomicWrite: boolean;
  fixtureOnly: true;
  productionDbUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthSessionRepositoryDryRunNote = {
  noteId: string;
  noteKind: LearningLocalDemoAuthSessionRepositoryDryRunKind;
  contractSurface: string;
  dryRunCommandOrCheck: string;
  rollbackExpectation: string;
  productionBlocker: true;
  manualApprovalRequired: true;
  fixtureOnly: true;
  productionDbUsed: false;
  noProductionDbRead: true;
  destructiveActionUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthSessionRepositoryEvidenceRow = {
  evidenceKind:
    | LearningLocalDemoAuthSessionRepositorySchemaSurface
    | LearningLocalDemoAuthSessionRepositoryTransitionKind
    | LearningLocalDemoAuthSessionRepositoryDryRunKind
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  productionDbUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type LearningLocalDemoAuthSessionRepositoryContractMatrixReport = {
  reportName: 'Learning Local Demo Auth Session Repository Contract Matrix';
  generatedFor: 'local-demo-auth-session-repository-contract-matrix';
  generatedAt: string;
  productionReady: false;
  productionEnabled: false;
  fixtureOnly: true;
  endpointPath: '/v1/learning-local-demo/auth-session-repository-contract-matrix-report';
  dashboardEvidencePath: '/admin/learning-local-demo#auth-session-repository-contract-matrix';
  jsonExportPath: 'exports/learning-local-demo-auth-session-repository-contract-matrix-report.json';
  markdownExportPath: 'exports/learning-local-demo-auth-session-repository-contract-matrix-report.md';
  safety: {
    fixtureOnly: true;
    productionEnabled: false;
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
    deployUsed: false;
  };
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    schemaSurfaceCount: number;
    schemaFieldCount: number;
    sessionSchemaFieldCount: number;
    refreshTokenSchemaFieldCount: number;
    auditSchemaFieldCount: number;
    refreshTokenHashMetadataFieldCount: number;
    actorDeviceContextFieldCount: number;
    appendOnlyAuditContextFieldCount: number;
    transitionConstraintCount: number;
    createTransitionCount: number;
    rotateTransitionCount: number;
    revokeTransitionCount: number;
    expireTransitionCount: number;
    reuseDetectionTransitionCount: number;
    failClosedLookupTransitionCount: number;
    migrationDryRunNoteCount: number;
    rollbackNoteCount: number;
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
    schemaSurface: Record<
      LearningLocalDemoAuthSessionRepositorySchemaSurface,
      number
    >;
    transitionKind: Record<
      LearningLocalDemoAuthSessionRepositoryTransitionKind,
      number
    >;
    dryRunKind: Record<
      LearningLocalDemoAuthSessionRepositoryDryRunKind,
      number
    >;
  };
  schemaFieldRows: LearningLocalDemoAuthSessionRepositorySchemaField[];
  transitionRows: LearningLocalDemoAuthSessionRepositoryTransition[];
  dryRunNotes: LearningLocalDemoAuthSessionRepositoryDryRunNote[];
  evidenceRows: LearningLocalDemoAuthSessionRepositoryEvidenceRow[];
};
