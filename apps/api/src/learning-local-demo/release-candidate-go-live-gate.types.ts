export type LearningReleaseCandidateRole =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'ADMIN'
  | 'SUPPORT'
  | 'SALES'
  | 'CHANNEL'
  | 'FINANCE';

export type LearningReleaseCandidateScenario =
  | 'HAPPY_PATH'
  | 'DENIED_PATH'
  | 'INACTIVE_OR_EXPIRED_PATH'
  | 'PERMISSION_NEGATIVE_PATH';

export type LearningReleaseCandidateDecision =
  'ALLOWED_FIXTURE_ONLY' | 'DENIED' | 'BLOCKED';

export type LearningReleaseCandidateFixtureLifecycleStatus =
  'ACTIVE' | 'EXPIRED_OR_INACTIVE';

export type LearningReleaseCandidateFixtureScopeStatus =
  'AUTHORIZED' | 'ACTION_DENIED' | 'OUT_OF_SCOPE';

export type LearningReleaseCandidatePermissionReasonCode =
  | 'MATCHED_ACTIVE_ROLE_FIXTURE'
  | 'ACTION_DENIED_BY_FIXTURE_POLICY'
  | 'EXPIRED_OR_INACTIVE_FIXTURE'
  | 'ROLE_SCOPE_MISMATCH'
  | 'UNKNOWN_SCENARIO_FIXTURE';

export type LearningReleaseCandidateRoleScenarioFixtureRow = {
  scenarioFixtureId: string;
  sourceActorFixtureId: string;
  role: LearningReleaseCandidateRole;
  scenario: LearningReleaseCandidateScenario;
  lifecycleStatus: LearningReleaseCandidateFixtureLifecycleStatus;
  scopeStatus: LearningReleaseCandidateFixtureScopeStatus;
  expectedDecision: LearningReleaseCandidateDecision;
  syntheticFixtureOnly: true;
  credentialsIncluded: false;
  realPersonDataUsed: false;
};

export type LearningReleaseCandidateRoleJourneyRow = {
  journeyId: string;
  scenarioFixtureId: string;
  role: LearningReleaseCandidateRole;
  scenario: LearningReleaseCandidateScenario;
  actorFixtureId: string;
  targetSurface: string;
  decision: LearningReleaseCandidateDecision;
  permissionReasonCode: LearningReleaseCandidatePermissionReasonCode;
  fixtureRefs: string[];
  evidencePaths: string[];
  expectedEvidence: string;
  productionMutationAllowed: false;
};

export type LearningReleaseCandidateSmokeStatus =
  'PASS_LOCAL' | 'APPROVED_PENDING_ISOLATED_STAGING' | 'PASS_ISOLATED_STAGING';

export type LearningReleaseCandidateSmokeRow = {
  smokeId: string;
  journey: string;
  verificationLevel:
    | 'AUTOMATED_UNIT'
    | 'FIXTURE_REPORT'
    | 'DISPOSABLE_LOCAL'
    | 'STAGING_REQUIRED';
  status: LearningReleaseCandidateSmokeStatus;
  commandOrEvidence: string;
  evidencePaths: string[];
  expectedResult: string;
  productionBlocker: boolean;
};

export type LearningReleaseApprovalOwnerRole =
  | 'DATABASE_OWNER'
  | 'PRIVACY_RETENTION_OWNER'
  | 'INCIDENT_OWNER'
  | 'SECURITY_OWNER'
  | 'PROVIDER_OWNER'
  | 'RELEASE_OWNER';

export type LearningReleaseApprovalRow = {
  approvalId: string;
  ownerRole: LearningReleaseApprovalOwnerRole;
  approvalScope: string;
  status:
    | 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL'
    | 'STAGING_REHEARSAL_APPROVED_PRODUCTION_NOT_APPROVED';
  approverName: null;
  authorityPrincipal: 'Minh Huong workspace/project owner';
  approvedAt: '2026-07-10T20:30:22+07:00';
  approvalEvidenceRefs: string[];
  acceptanceCriteria: string[];
  requiredEvidence: string[];
  stagingApprovalRequired: boolean;
  productionBlocker: true;
};

export type LearningReleaseCandidateGateReport = {
  schemaVersion: 'learning-release-candidate-go-live-gate.v4';
  generatedAt: string;
  fixtureKind: 'learning-local-demo-only';
  releaseCandidateStatus:
    | 'NON_PRODUCTION_RC_EVIDENCE_READY'
    | 'ISOLATED_STAGING_REHEARSAL_EVIDENCE_READY';
  goLiveDecision: 'GO_LIVE_BLOCKED';
  approvalGateDecision: 'STAGING_REHEARSAL_APPROVED_WITH_CONDITIONS';
  autoLoopDecision:
    | 'RESUME_APPROVED_STAGING_REHEARSAL_ONLY'
    | 'STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION';
  stagingExecutionAuthorized: true;
  productionExecutionAuthorized: false;
  productionReady: false;
  productionEnabled: false;
  manualGoLiveApprovalRequired: true;
  approvalScope: {
    approvalCode: 'MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01';
    decisionId: 'MH-RC-V3-STAGING-CONDITIONAL-20260710-01';
    target: 'minhhuong-staging-rc-v3-local';
    classification: 'isolated_nonproduction_local_staging';
    scope: 'staging_dry_run';
    productionApproved: false;
    evidencePath: 'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json';
  };
  stagingRehearsal: {
    evidenceStatus: 'PENDING_REHEARSAL' | 'PASS';
    evidenceAccepted: boolean;
    evidencePath: 'exports/minhhuong-staging-rc-v3-local-rehearsal.json';
    failedCheckCount: number;
    productionReady: false;
    productionEnabled: false;
  };
  roleScenarioFixtureRows: LearningReleaseCandidateRoleScenarioFixtureRow[];
  roleJourneyRows: LearningReleaseCandidateRoleJourneyRow[];
  smokeRows: LearningReleaseCandidateSmokeRow[];
  approvalRows: LearningReleaseApprovalRow[];
  deployReadinessRows: Array<{
    gateId: string;
    area: string;
    decision: string;
    productionBlocker: boolean;
    evidencePaths: string[];
    requiredNextEvidence: string[];
    rollbackOrContainment: string;
  }>;
  testStandard: {
    baselineJobId: 'codex_job_minhhuong_00073_staging_rehearsal_conditional_approval';
    baselineLearningLocalTestCount: 118;
    verificationCommand: 'npm run test:learning-local';
    existingTestsDeleted: false;
    existingTestsSkipped: false;
    existingTestsRenamed: false;
    assertionsRelaxed: false;
    acceptanceCriteriaWeakened: false;
    newTestsAdded: true;
    testStandardChangeRequestRequired: false;
  };
  evidenceIntegrity: {
    status: 'PASS_LOCAL' | 'FAIL_CLOSED';
    scenarioFixtureCount: number;
    uniqueScenarioFixtureCount: number;
    resolvedJourneyFixtureCount: number;
    roleMismatchCount: number;
    unsafeEvidencePathCount: number;
    uniqueEvidencePathCount: number;
  };
  safety: {
    productionDbUsed: false;
    stagingDbUsed: boolean;
    providerApiUsed: false;
    paymentProviderMutationUsed: false;
    refundProviderMutationUsed: false;
    payoutProviderMutationUsed: false;
    notificationDeliveryUsed: false;
    liveAiProviderUsed: false;
    realCustomerOrStudentMutationUsed: false;
    productionDeployUsed: false;
    plaintextSecretsIncluded: false;
  };
  totals: {
    requiredRoleCount: number;
    coveredRoleCount: number;
    requiredScenarioCountPerRole: number;
    completeRoleCoverageCount: number;
    roleScenarioFixtureCount: number;
    resolvedJourneyFixtureCount: number;
    roleJourneyCount: number;
    happyPathCount: number;
    deniedPathCount: number;
    inactiveOrExpiredPathCount: number;
    permissionNegativePathCount: number;
    localSmokePassCount: number;
    stagingSmokeBlockerCount: number;
    stagingSmokePassCount: number;
    deployGateCount: number;
    productionBlockerCount: number;
    rollbackOrContainmentCount: number;
    requiredApprovalCount: number;
    pendingApprovalCount: number;
    approvedApprovalCount: number;
    approvalEvidenceCount: number;
    approvalsWithDefinedAcceptanceCriteriaCount: number;
    stagingApprovalBlockerCount: number;
    uniqueEvidencePathCount: number;
    unsafeEvidencePathCount: number;
    productionReadyClaimCount: 0;
    openSafetyGateCount: number;
  };
};

export type LearningStagingRehearsalEvidence = {
  schemaVersion?: string;
  target?: string;
  status?: string;
  approval?: { code?: string; scope?: string };
  gates?: { status?: string; failedChecks?: string[] };
  safety?: { productionReady?: boolean; productionEnabled?: boolean };
  cleanup?: {
    matchingDatabaseCount?: number;
    matchingProcessCount?: number;
    matchingListenerCount?: number;
    matchingTemporaryArtifactCount?: number;
  };
};

export type RoleJourneyConfig = {
  actorFixtureId: string;
  targetSurface: string;
  fixtureRefs: string[];
  happyEvidence: string;
  deniedEvidence: string;
  inactiveEvidence: string;
  permissionEvidence: string;
};
