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

const schemaSurfaces: readonly LearningLocalDemoAuthSessionRepositorySchemaSurface[] =
  ['auth_sessions', 'auth_refresh_tokens', 'auth_session_audit_events'];

const transitionKinds: readonly LearningLocalDemoAuthSessionRepositoryTransitionKind[] =
  [
    'CREATE_SESSION',
    'ROTATE_REFRESH_TOKEN',
    'REVOKE_SESSION',
    'EXPIRE_SESSION',
    'REUSE_DETECTION',
    'FAIL_CLOSED_LOOKUP',
  ];

const dryRunKinds: readonly LearningLocalDemoAuthSessionRepositoryDryRunKind[] =
  ['MIGRATION_DRY_RUN', 'ROLLBACK_NOTE'];

const safetyGateFixtureIds = [
  'productionEnabled=false',
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
  'realErpMutationUsed=false',
  'secretsRequired=false',
  'deployUsed=false',
] as const;

export const learningLocalDemoAuthSessionRepositorySchemaFields: LearningLocalDemoAuthSessionRepositorySchemaField[] =
  [
    schemaField(
      'auth-sessions-id',
      'auth_sessions',
      'id',
      'uuid primary key',
      true,
      true,
      false,
      false,
      'Stable session identifier used by JWT sid lookup.',
    ),
    schemaField(
      'auth-sessions-user-id',
      'auth_sessions',
      'userId',
      'uuid/text foreign key',
      true,
      true,
      true,
      false,
      'Actor context for session ownership and fail-closed lookup.',
    ),
    schemaField(
      'auth-sessions-email',
      'auth_sessions',
      'email',
      'text',
      true,
      true,
      true,
      false,
      'Actor email snapshot for audit and support review.',
    ),
    schemaField(
      'auth-sessions-roles',
      'auth_sessions',
      'roles',
      'text array/json',
      true,
      false,
      true,
      false,
      'Actor role snapshot used for authorization evidence.',
    ),
    schemaField(
      'auth-sessions-device-id',
      'auth_sessions',
      'deviceId',
      'text',
      true,
      true,
      true,
      false,
      'Device context for cross-device revocation.',
    ),
    schemaField(
      'auth-sessions-state',
      'auth_sessions',
      'state',
      'ACTIVE | ENDED | REVOKED | EXPIRED',
      true,
      true,
      false,
      false,
      'Session state must gate JWT acceptance.',
    ),
    schemaField(
      'auth-sessions-issued-at',
      'auth_sessions',
      'issuedAt',
      'timestamp',
      true,
      true,
      false,
      false,
      'Session issuance timestamp for lifecycle audit.',
    ),
    schemaField(
      'auth-sessions-expires-at',
      'auth_sessions',
      'expiresAt',
      'timestamp',
      true,
      true,
      false,
      false,
      'Session expiration timestamp for cleanup and fail-closed checks.',
    ),
    schemaField(
      'auth-sessions-ended-at',
      'auth_sessions',
      'endedAt',
      'timestamp nullable',
      false,
      true,
      false,
      false,
      'Logout or expiry end timestamp.',
    ),
    schemaField(
      'auth-sessions-revoked-at',
      'auth_sessions',
      'revokedAt',
      'timestamp nullable',
      false,
      true,
      false,
      false,
      'Revocation timestamp for device and reuse response.',
    ),
    schemaField(
      'auth-sessions-reason',
      'auth_sessions',
      'reason',
      'text nullable',
      false,
      false,
      false,
      false,
      'Reason code for end, revoke, and expiry transitions.',
    ),
    schemaField(
      'auth-refresh-tokens-id',
      'auth_refresh_tokens',
      'id',
      'uuid primary key',
      true,
      true,
      false,
      false,
      'Refresh-token identifier parsed from the presented token.',
    ),
    schemaField(
      'auth-refresh-tokens-session-id',
      'auth_refresh_tokens',
      'sessionId',
      'uuid/text foreign key',
      true,
      true,
      false,
      false,
      'Links refresh-token state to the auth session.',
    ),
    schemaField(
      'auth-refresh-tokens-user-id',
      'auth_refresh_tokens',
      'userId',
      'uuid/text foreign key',
      true,
      true,
      true,
      false,
      'Actor context for token ownership validation.',
    ),
    schemaField(
      'auth-refresh-tokens-device-id',
      'auth_refresh_tokens',
      'deviceId',
      'text',
      true,
      true,
      true,
      false,
      'Device context copied from the session for revocation decisions.',
    ),
    schemaField(
      'auth-refresh-tokens-token-hash',
      'auth_refresh_tokens',
      'tokenHash',
      'sha256 hex digest',
      true,
      true,
      false,
      false,
      'Hashed refresh-token secret; raw refresh token must never be persisted.',
    ),
    schemaField(
      'auth-refresh-tokens-state',
      'auth_refresh_tokens',
      'state',
      'ACTIVE | ROTATED | REUSED | REVOKED | EXPIRED',
      true,
      true,
      false,
      false,
      'Refresh-token state for rotation, replay detection, and cleanup.',
    ),
    schemaField(
      'auth-refresh-tokens-issued-at',
      'auth_refresh_tokens',
      'issuedAt',
      'timestamp',
      true,
      true,
      false,
      false,
      'Refresh-token issuance timestamp.',
    ),
    schemaField(
      'auth-refresh-tokens-expires-at',
      'auth_refresh_tokens',
      'expiresAt',
      'timestamp',
      true,
      true,
      false,
      false,
      'Refresh-token expiration timestamp.',
    ),
    schemaField(
      'auth-refresh-tokens-rotated-at',
      'auth_refresh_tokens',
      'rotatedAt',
      'timestamp nullable',
      false,
      true,
      false,
      false,
      'Rotation timestamp for one-time use enforcement.',
    ),
    schemaField(
      'auth-refresh-tokens-reused-at',
      'auth_refresh_tokens',
      'reusedAt',
      'timestamp nullable',
      false,
      true,
      false,
      false,
      'Replay-detection timestamp.',
    ),
    schemaField(
      'auth-refresh-tokens-revoked-at',
      'auth_refresh_tokens',
      'revokedAt',
      'timestamp nullable',
      false,
      true,
      false,
      false,
      'Revocation timestamp when a session family is revoked.',
    ),
    schemaField(
      'auth-refresh-tokens-replaced-by-token-id',
      'auth_refresh_tokens',
      'replacedByTokenId',
      'uuid/text nullable',
      false,
      true,
      false,
      false,
      'Replacement token pointer for rotation lineage.',
    ),
    schemaField(
      'auth-refresh-tokens-reason',
      'auth_refresh_tokens',
      'reason',
      'text nullable',
      false,
      false,
      false,
      false,
      'Reason code for rotated, reused, revoked, or expired state.',
    ),
    schemaField(
      'auth-audit-events-id',
      'auth_session_audit_events',
      'id',
      'uuid primary key',
      true,
      true,
      false,
      true,
      'Append-only audit event identifier.',
    ),
    schemaField(
      'auth-audit-events-created-at',
      'auth_session_audit_events',
      'createdAt',
      'timestamp',
      true,
      true,
      false,
      true,
      'Append-only audit event creation timestamp.',
    ),
    schemaField(
      'auth-audit-events-action',
      'auth_session_audit_events',
      'action',
      'session/refresh lifecycle enum',
      true,
      true,
      false,
      true,
      'Lifecycle action for admin/support audit review.',
    ),
    schemaField(
      'auth-audit-events-session-id',
      'auth_session_audit_events',
      'sessionId',
      'uuid/text nullable',
      false,
      true,
      false,
      true,
      'Optional session reference for audit traceability.',
    ),
    schemaField(
      'auth-audit-events-refresh-token-id',
      'auth_session_audit_events',
      'refreshTokenId',
      'uuid/text nullable',
      false,
      true,
      false,
      true,
      'Optional refresh-token identifier; never stores raw token values.',
    ),
    schemaField(
      'auth-audit-events-user-id',
      'auth_session_audit_events',
      'userId',
      'uuid/text nullable',
      false,
      true,
      true,
      true,
      'Actor context for support audit traceability.',
    ),
    schemaField(
      'auth-audit-events-device-id',
      'auth_session_audit_events',
      'deviceId',
      'text nullable',
      false,
      true,
      true,
      true,
      'Device context for session-family investigations.',
    ),
    schemaField(
      'auth-audit-events-reason',
      'auth_session_audit_events',
      'reason',
      'text nullable',
      false,
      false,
      false,
      true,
      'Reason code for denial, reuse, revocation, and cleanup events.',
    ),
    schemaField(
      'auth-audit-events-visible-to-roles',
      'auth_session_audit_events',
      'visibleToRoles',
      'ADMIN | SUPPORT role list',
      true,
      true,
      true,
      true,
      'Read-only visibility scope for admin/support audit export.',
    ),
    schemaField(
      'auth-audit-events-metadata',
      'auth_session_audit_events',
      'metadata',
      'json nullable',
      false,
      false,
      false,
      true,
      'Redacted event metadata for counts and replacement token ids.',
    ),
  ];

export const learningLocalDemoAuthSessionRepositoryTransitions: LearningLocalDemoAuthSessionRepositoryTransition[] =
  [
    {
      transitionId: 'auth-session-contract-create-active-session',
      transitionKind: 'CREATE_SESSION',
      contractSurface: 'AuthSessionStore.createSession',
      repositoryMethods: ['createSession', 'appendAuditEvent'],
      precondition: 'Authenticated actor passes login checks.',
      expectedStateChange:
        'Insert ACTIVE session with actor roles, device id, issuedAt, and expiresAt.',
      auditRequirement:
        'Append SESSION_CREATED audit row visible to ADMIN and SUPPORT.',
      failureMode:
        'Repository write failure must deny session issuance and return no token.',
      requiresAtomicWrite: true,
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Fixture contract creates an ACTIVE session and append-only SESSION_CREATED audit evidence.',
    },
    {
      transitionId: 'auth-session-contract-rotate-refresh-token',
      transitionKind: 'ROTATE_REFRESH_TOKEN',
      contractSurface: 'AuthSessionStore.updateRefreshToken',
      repositoryMethods: [
        'findRefreshTokenById',
        'createRefreshToken',
        'updateRefreshToken',
        'appendAuditEvent',
      ],
      precondition: 'Refresh token hash matches an ACTIVE unexpired token.',
      expectedStateChange:
        'Insert replacement ACTIVE refresh-token hash, mark old token ROTATED, and set replacedByTokenId.',
      auditRequirement:
        'Append REFRESH_TOKEN_ISSUED and REFRESH_TOKEN_ROTATED audit rows.',
      failureMode:
        'Any mismatch, missing token, or inactive token must deny refresh.',
      requiresAtomicWrite: true,
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Fixture contract proves one-time refresh-token rotation and replacement metadata.',
    },
    {
      transitionId: 'auth-session-contract-revoke-session-family',
      transitionKind: 'REVOKE_SESSION',
      contractSurface:
        'AuthSessionStore.endSessionAtomically / revokeSessionAtomically',
      repositoryMethods: [
        'endSessionAtomically',
        'revokeSessionAtomically',
        'appendAuditEvent',
      ],
      precondition: 'Session exists and must be ended or revoked.',
      expectedStateChange:
        'Mark session REVOKED or ENDED and mark active refresh tokens REVOKED with a reason.',
      auditRequirement: 'Append SESSION_REVOKED or SESSION_ENDED audit row.',
      failureMode:
        'Missing session returns false and must not create a replacement session.',
      requiresAtomicWrite: true,
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Fixture and Prisma contracts terminate the session and active refresh-token family in one locked provider transaction with audit visibility.',
    },
    {
      transitionId: 'auth-session-contract-expire-session-and-refresh-token',
      transitionKind: 'EXPIRE_SESSION',
      contractSurface: 'AuthSessionStore.cleanupExpired',
      repositoryMethods: [
        'cleanupExpired',
        'updateSession',
        'updateRefreshToken',
        'appendAuditEvent',
      ],
      precondition:
        'Session or refresh token expires before or at cleanup time.',
      expectedStateChange:
        'Mark eligible ACTIVE sessions and refresh tokens EXPIRED with stable reason codes.',
      auditRequirement:
        'Append SESSION_CLEANUP_EXPIRED when cleanup changes session or token state.',
      failureMode:
        'Expired rows must be denied by guard/refresh paths before any protected action.',
      requiresAtomicWrite: true,
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Fixture contract expires sessions and refresh tokens without deleting audit history.',
    },
    {
      transitionId: 'auth-session-contract-refresh-reuse-detection',
      transitionKind: 'REUSE_DETECTION',
      contractSurface: 'AuthSessionStore.updateRefreshToken',
      repositoryMethods: [
        'findRefreshTokenById',
        'updateRefreshToken',
        'updateSession',
        'appendAuditEvent',
      ],
      precondition:
        'A presented refresh token resolves to ROTATED, REUSED, REVOKED, or EXPIRED state.',
      expectedStateChange:
        'Mark token REUSED once, revoke the related session family, and deny refresh.',
      auditRequirement:
        'Append REFRESH_TOKEN_REUSE_DENIED and SESSION_REVOKED audit rows.',
      failureMode:
        'Replay must fail closed with Unauthorized and no new refresh token.',
      requiresAtomicWrite: true,
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Fixture contract captures replay denial, REUSED state, and session-family revocation.',
    },
    {
      transitionId: 'auth-session-contract-fail-closed-lookup',
      transitionKind: 'FAIL_CLOSED_LOOKUP',
      contractSurface: 'AuthSessionStore.findSessionById',
      repositoryMethods: ['findSessionById', 'findRefreshTokenById'],
      precondition:
        'Session lookup, token lookup, or ownership check returns missing/mismatched state.',
      expectedStateChange:
        'No new session or refresh-token row is created; protected route or refresh request is denied.',
      auditRequirement:
        'Append REFRESH_TOKEN_DENIED for invalid refresh-token lookup when a token id is present.',
      failureMode:
        'Lookup gaps must deny access instead of allowing a stateless JWT fallback.',
      requiresAtomicWrite: false,
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Fixture contract requires missing repository rows to fail closed.',
    },
  ];

export const learningLocalDemoAuthSessionRepositoryDryRunNotes: LearningLocalDemoAuthSessionRepositoryDryRunNote[] =
  [
    {
      noteId: 'auth-session-repository-migration-dry-run-schema',
      noteKind: 'MIGRATION_DRY_RUN',
      contractSurface: 'Prisma/PostgreSQL auth session migration draft',
      dryRunCommandOrCheck:
        'Verified non-production check: prisma migrate deploy plus schema/index/FK assertions against a random disposable localhost database.',
      rollbackExpectation:
        'Before production writes, rollback may drop draft tables; after writes, rollback must disable provider and preserve data.',
      productionBlocker: true,
      manualApprovalRequired: true,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      destructiveActionUsed: false,
      evidenceSummary:
        'The migration and Prisma repository are implemented and verified without production database access.',
    },
    {
      noteId: 'auth-session-repository-migration-dry-run-indexes',
      noteKind: 'MIGRATION_DRY_RUN',
      contractSurface: 'Auth persistence indexes and constraints',
      dryRunCommandOrCheck:
        'Disposable-local integration verifies primary keys, tokenHash index, session/user/device/state/expiresAt indexes, and audit indexes.',
      rollbackExpectation:
        'Index rollback must be staged and measured before any production auth traffic depends on it.',
      productionBlocker: true,
      manualApprovalRequired: true,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      destructiveActionUsed: false,
      evidenceSummary:
        'Index and constraint checks ran only against a random localhost fixture database.',
    },
    {
      noteId: 'auth-session-repository-rollback-provider-flag',
      noteKind: 'ROLLBACK_NOTE',
      contractSurface: 'AUTH_SESSION_STORE production repository provider flag',
      dryRunCommandOrCheck:
        'Provider tests prove local fixture default, explicit local/staging Prisma selection, and production rejection of fixture or missing configuration.',
      rollbackExpectation:
        'Rollback disables new persistent writes while preserving session, refresh-token hash, and audit rows for investigation.',
      productionBlocker: true,
      manualApprovalRequired: true,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      destructiveActionUsed: false,
      evidenceSummary:
        'Provider selection is implemented; post-activation rollback remains manual-gated and data-preserving.',
    },
    {
      noteId: 'auth-session-repository-rollback-backup-restore',
      noteKind: 'ROLLBACK_NOTE',
      contractSurface:
        'Backup and restore rehearsal for auth persistence tables',
      dryRunCommandOrCheck:
        'Disposable-local pre-activation rollback drops only the new auth objects and forward repair restores all three tables; staging backup/restore remains required.',
      rollbackExpectation:
        'Audit rows are append-only and must not be destructively rolled back after production enablement.',
      productionBlocker: true,
      manualApprovalRequired: true,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      destructiveActionUsed: false,
      evidenceSummary:
        'Backup/restore rehearsal remains a blocker before production_enabled can become true.',
    },
  ];

export const buildLearningLocalDemoAuthSessionRepositoryContractMatrixReport = (
  generatedAt = new Date().toISOString(),
): LearningLocalDemoAuthSessionRepositoryContractMatrixReport => {
  const schemaRows = learningLocalDemoAuthSessionRepositorySchemaFields;
  const transitionRows = learningLocalDemoAuthSessionRepositoryTransitions;
  const dryRunNotes = learningLocalDemoAuthSessionRepositoryDryRunNotes;
  const schemaSurfaceCounts = countBy(
    schemaSurfaces,
    schemaRows,
    (row) => row.surface,
  );
  const transitionCounts = countBy(
    transitionKinds,
    transitionRows,
    (row) => row.transitionKind,
  );
  const dryRunCounts = countBy(dryRunKinds, dryRunNotes, (row) => row.noteKind);
  const evidenceRows: LearningLocalDemoAuthSessionRepositoryEvidenceRow[] = [
    ...schemaSurfaces.map((surface) => ({
      evidenceKind: surface,
      evidenceCount: schemaSurfaceCounts[surface],
      stableFixtureIds: schemaRows
        .filter((row) => row.surface === surface)
        .map((row) => row.fieldId),
      fixtureOnly: true as const,
      productionDbUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${schemaSurfaceCounts[surface]} fixture-only ${surface} schema contract field(s).`,
    })),
    ...transitionKinds.map((transitionKind) => ({
      evidenceKind: transitionKind,
      evidenceCount: transitionCounts[transitionKind],
      stableFixtureIds: transitionRows
        .filter((row) => row.transitionKind === transitionKind)
        .map((row) => row.transitionId),
      fixtureOnly: true as const,
      productionDbUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${transitionCounts[transitionKind]} fixture-only ${transitionKind.toLowerCase()} transition contract(s).`,
    })),
    ...dryRunKinds.map((noteKind) => ({
      evidenceKind: noteKind,
      evidenceCount: dryRunCounts[noteKind],
      stableFixtureIds: dryRunNotes
        .filter((row) => row.noteKind === noteKind)
        .map((row) => row.noteId),
      fixtureOnly: true as const,
      productionDbUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${dryRunCounts[noteKind]} fixture-only ${noteKind.toLowerCase()} note(s).`,
    })),
    {
      evidenceKind: 'SAFETY_GATE',
      evidenceCount: safetyGateFixtureIds.length,
      stableFixtureIds: [...safetyGateFixtureIds],
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Repository contract evidence is local-demo only and keeps production_ready=false and production_enabled=false.',
    },
  ];

  return {
    reportName: 'Learning Local Demo Auth Session Repository Contract Matrix',
    generatedFor: 'local-demo-auth-session-repository-contract-matrix',
    generatedAt,
    productionReady: false,
    productionEnabled: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/auth-session-repository-contract-matrix-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#auth-session-repository-contract-matrix',
    jsonExportPath:
      'exports/learning-local-demo-auth-session-repository-contract-matrix-report.json',
    markdownExportPath:
      'exports/learning-local-demo-auth-session-repository-contract-matrix-report.md',
    safety: {
      fixtureOnly: true,
      productionEnabled: false,
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
      deployUsed: false,
    },
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'AuthSessionStore repository schema, Prisma implementation, refresh-token hash metadata, state transitions, fail-closed lookup, audit behavior, migration, rollback, and forward repair are disposable-local verified.',
      remainingLocalDemoNotes: [
        'The provider is not production-enabled; staging two-process API and backup/restore rehearsal remain required.',
        'Monitoring, retention approval, external security review, and manual go-live approval remain required.',
      ],
    },
    totals: {
      schemaSurfaceCount: schemaSurfaces.length,
      schemaFieldCount: schemaRows.length,
      sessionSchemaFieldCount: schemaSurfaceCounts.auth_sessions,
      refreshTokenSchemaFieldCount: schemaSurfaceCounts.auth_refresh_tokens,
      auditSchemaFieldCount: schemaSurfaceCounts.auth_session_audit_events,
      refreshTokenHashMetadataFieldCount: schemaRows.filter(
        (row) =>
          row.surface === 'auth_refresh_tokens' &&
          [
            'tokenHash',
            'rotatedAt',
            'reusedAt',
            'revokedAt',
            'replacedByTokenId',
          ].includes(row.fieldName),
      ).length,
      actorDeviceContextFieldCount: schemaRows.filter(
        (row) => row.actorOrDeviceContext,
      ).length,
      appendOnlyAuditContextFieldCount: schemaRows.filter(
        (row) => row.appendOnlyAuditContext,
      ).length,
      transitionConstraintCount: transitionRows.length,
      createTransitionCount: transitionCounts.CREATE_SESSION,
      rotateTransitionCount: transitionCounts.ROTATE_REFRESH_TOKEN,
      revokeTransitionCount: transitionCounts.REVOKE_SESSION,
      expireTransitionCount: transitionCounts.EXPIRE_SESSION,
      reuseDetectionTransitionCount: transitionCounts.REUSE_DETECTION,
      failClosedLookupTransitionCount: transitionCounts.FAIL_CLOSED_LOOKUP,
      migrationDryRunNoteCount: dryRunCounts.MIGRATION_DRY_RUN,
      rollbackNoteCount: dryRunCounts.ROLLBACK_NOTE,
      productionBlockerCount: dryRunNotes.filter((row) => row.productionBlocker)
        .length,
      manualApprovalRequiredCount: dryRunNotes.filter(
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
      schemaSurface: schemaSurfaceCounts,
      transitionKind: transitionCounts,
      dryRunKind: dryRunCounts,
    },
    schemaFieldRows: schemaRows,
    transitionRows,
    dryRunNotes,
    evidenceRows,
  };
};

export const toLearningLocalDemoAuthSessionRepositoryContractMatrixMarkdown = (
  report: LearningLocalDemoAuthSessionRepositoryContractMatrixReport,
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
    '- production_enabled=false',
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
    '- deployUsed=false',
    '',
    '## Totals',
    '',
    `- Schema surfaces: ${report.totals.schemaSurfaceCount}`,
    `- Schema fields: ${report.totals.schemaFieldCount}`,
    `- Session schema fields: ${report.totals.sessionSchemaFieldCount}`,
    `- Refresh-token schema fields: ${report.totals.refreshTokenSchemaFieldCount}`,
    `- Audit schema fields: ${report.totals.auditSchemaFieldCount}`,
    `- Refresh-token hash metadata fields: ${report.totals.refreshTokenHashMetadataFieldCount}`,
    `- Actor/device context fields: ${report.totals.actorDeviceContextFieldCount}`,
    `- Append-only audit context fields: ${report.totals.appendOnlyAuditContextFieldCount}`,
    `- Transition constraints: ${report.totals.transitionConstraintCount}`,
    `- Create transitions: ${report.totals.createTransitionCount}`,
    `- Rotate transitions: ${report.totals.rotateTransitionCount}`,
    `- Revoke transitions: ${report.totals.revokeTransitionCount}`,
    `- Expire transitions: ${report.totals.expireTransitionCount}`,
    `- Reuse-detection transitions: ${report.totals.reuseDetectionTransitionCount}`,
    `- Fail-closed lookup transitions: ${report.totals.failClosedLookupTransitionCount}`,
    `- Migration dry-run notes: ${report.totals.migrationDryRunNoteCount}`,
    `- Rollback notes: ${report.totals.rollbackNoteCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Schema Fields',
    '',
    '| Field | Surface | Type | Required | Indexed | Actor/device | Audit context | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.schemaFieldRows.map(
      (row) =>
        `| ${[
          row.fieldName,
          row.surface,
          row.contractType,
          String(row.required),
          String(row.indexed),
          String(row.actorOrDeviceContext),
          String(row.appendOnlyAuditContext),
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Transition Constraints',
    '',
    '| Transition | Kind | Methods | Precondition | State change | Audit | Failure mode | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.transitionRows.map(
      (row) =>
        `| ${[
          row.transitionId,
          row.transitionKind,
          row.repositoryMethods.join('<br>'),
          row.precondition,
          row.expectedStateChange,
          row.auditRequirement,
          row.failureMode,
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Migration And Rollback Notes',
    '',
    '| Note | Kind | Surface | Dry-run check | Rollback expectation | Summary |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.dryRunNotes.map(
      (row) =>
        `| ${[
          row.noteId,
          row.noteKind,
          row.contractSurface,
          row.dryRunCommandOrCheck,
          row.rollbackExpectation,
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

function schemaField(
  fieldId: string,
  surface: LearningLocalDemoAuthSessionRepositorySchemaSurface,
  fieldName: string,
  contractType: string,
  required: boolean,
  indexed: boolean,
  actorOrDeviceContext: boolean,
  appendOnlyAuditContext: boolean,
  evidenceSummary: string,
): LearningLocalDemoAuthSessionRepositorySchemaField {
  return {
    fieldId,
    surface,
    fieldName,
    contractType,
    required,
    indexed,
    storesRawRefreshToken: false,
    actorOrDeviceContext,
    appendOnlyAuditContext,
    fixtureOnly: true,
    productionDbUsed: false,
    evidenceSummary,
  };
}

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
