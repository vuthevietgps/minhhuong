import { learningProductionRuntimeGateRows } from './production-runtime-gate-matrix';

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

export const parseLearningStagingRehearsalEvidence = (
  serialized: string,
): LearningStagingRehearsalEvidence => {
  const value: unknown = JSON.parse(serialized);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Staging rehearsal evidence must be a JSON object');
  }
  return value;
};

type RoleJourneyConfig = {
  actorFixtureId: string;
  targetSurface: string;
  fixtureRefs: string[];
  happyEvidence: string;
  deniedEvidence: string;
  inactiveEvidence: string;
  permissionEvidence: string;
};

const roleJourneyConfigs: Record<
  LearningReleaseCandidateRole,
  RoleJourneyConfig
> = {
  STUDENT: {
    actorFixtureId: 'student-ava',
    targetSurface: '/v1/learning/children/child-ava-demo/today-plan',
    fixtureRefs: [
      'enroll-ava-a1-active',
      'sub-ava-a1-active',
      'plan-ava-a1-day-02',
      'student-khoa',
      'sub-khoa-a1-canceled',
    ],
    happyEvidence:
      'The active student follows the published daily plan through video, practice, progress, and report evidence.',
    deniedEvidence:
      'A stale, unpublished, or screen-time-blocked plan cannot be started.',
    inactiveEvidence:
      'Expired and revoked entitlement snapshots block learning access with explicit reasons.',
    permissionEvidence:
      'A student cannot select another child profile or enter teacher/admin surfaces.',
  },
  PARENT: {
    actorFixtureId: 'guardian-ava-parent',
    targetSurface: '/v1/parent/children/child-ava-demo/learning-summary',
    fixtureRefs: [
      'guardian-ava-parent',
      'guardian-minh-parent',
      'student-ava',
      'student-khoa',
      'permission-case-parent-minh-non-owning-ava',
    ],
    happyEvidence:
      'The owning parent sees an approved report, reads the inbox, and grants fixture screen time.',
    deniedEvidence:
      'Held previews remain hidden and a non-owning parent receives no child evidence.',
    inactiveEvidence:
      'A refunded, revoked, or expired child entitlement stays visible as blocked evidence without granting learning access.',
    permissionEvidence:
      'Parent ownership is enforced and no parent can read another family child profile.',
  },
  TEACHER: {
    actorFixtureId: 'content-owner-teacher-mai',
    targetSurface: '/v1/teacher/classes/class-a1-june-weekday/review-queue',
    fixtureRefs: [
      'class-a1-june-weekday',
      'class-phonics-may-booster',
      'permission-case-teacher-mai-assigned-a1',
      'permission-case-teacher-mai-unassigned-phonics-denied',
      'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
    ],
    happyEvidence:
      'The assigned teacher reviews learning evidence, applies the support plan, and closes the fixture escalation.',
    deniedEvidence:
      'The teacher cannot read or change an unassigned class or its student evidence.',
    inactiveEvidence:
      'Withdrawn learner evidence is retained read-only and cannot restart a learning path.',
    permissionEvidence:
      'Assigned-class scope is required before report, intervention, or content actions.',
  },
  ADMIN: {
    actorFixtureId: 'content-owner-admin-hoa',
    targetSurface:
      '/v1/learning-local-demo/release-candidate-go-live-gate-matrix-report',
    fixtureRefs: [
      'permission-case-admin-hoa-phonics-class',
      'runtime-config-fail-closed',
      'manual-go-live-approval',
    ],
    happyEvidence:
      'Admin reads release-candidate, audit, runtime-safety, and fixture evidence only.',
    deniedEvidence:
      'Admin cannot use this local-demo surface for a production mutation or go-live enablement.',
    inactiveEvidence:
      'An expired or revoked admin session is denied before readiness evidence is returned.',
    permissionEvidence:
      'Admin visibility does not override provider, production database, or manual approval gates.',
  },
  SUPPORT: {
    actorFixtureId: 'support-ops-auditor-lan',
    targetSurface: '/v1/auth/operational-alert-audits/incident-export',
    fixtureRefs: [
      'permission-case-support-ops-lan-audit-read-only',
      'followup-outcome-minh-parent-practice-window',
      'auth-alert-audit-support-read-only',
    ],
    happyEvidence:
      'Support inspects redacted issue, escalation, and audit evidence without changing learner or money state.',
    deniedEvidence:
      'Support cannot bypass privacy redaction, teacher scope, or mutation restrictions.',
    inactiveEvidence:
      'An expired or revoked support session is denied before audit repository access.',
    permissionEvidence:
      'Support access is read-only, audited, bounded, and excludes identity/token/rate-key fields.',
  },
  SALES: {
    actorFixtureId: 'demo-sale-lan',
    targetSurface: '/fixture/subscription-payment-commission-trace',
    fixtureRefs: [
      'enroll-ava-a1-active',
      'pay-ava-a1-succeeded',
      'commission-ava-sale-pending',
      'commission-khoa-sale-canceled',
    ],
    happyEvidence:
      'Sales traces the fixture order, payment, entitlement, refund-window, and pending commission evidence.',
    deniedEvidence:
      'Sales cannot approve payout, issue a provider refund, or unlock an unpaid entitlement.',
    inactiveEvidence:
      'Refunded/canceled fixture business closes entitlement and cancels the related commission.',
    permissionEvidence:
      'Sales evidence excludes finance approval and unrelated learner/private report access.',
  },
  CHANNEL: {
    actorFixtureId: 'demo-agency-hcm',
    targetSurface: '/fixture/channel-commission-trace',
    fixtureRefs: [
      'enroll-linh-phonics-active',
      'pay-linh-phonics-succeeded',
      'commission-linh-agency-payable',
      'commission-khoa-sale-canceled',
    ],
    happyEvidence:
      'Channel reads its payable fixture commission after the refund window without executing payout.',
    deniedEvidence:
      'Channel cannot inspect another beneficiary ledger or bypass a commission hold/cancellation.',
    inactiveEvidence:
      'A refunded subscription keeps the canceled commission unavailable for payout.',
    permissionEvidence:
      'Channel scope is limited to its fixture beneficiary evidence and never exposes child learning details.',
  },
  FINANCE: {
    actorFixtureId: 'demo-finance-manager',
    targetSurface: '/fixture/refund-commission-payout-safety-trace',
    fixtureRefs: [
      'pay-khoa-a1-refunded',
      'refund-khoa-a1-succeeded',
      'commission-khoa-sale-canceled',
      'commission-linh-sale-approved',
    ],
    happyEvidence:
      'Finance reviews fixture payment/refund/commission evidence and the invoice/available-balance payout gate.',
    deniedEvidence:
      'No provider payment, refund, commission release, or payout mutation is available in this local gate.',
    inactiveEvidence:
      'Refunded payment and canceled commission remain non-payable and preserve the audit trace.',
    permissionEvidence:
      'Finance approval cannot set production_ready or bypass separate provider and manual go-live approvals.',
  },
};

const scenarios: readonly LearningReleaseCandidateScenario[] = [
  'HAPPY_PATH',
  'DENIED_PATH',
  'INACTIVE_OR_EXPIRED_PATH',
  'PERMISSION_NEGATIVE_PATH',
];

const roleEvidencePaths: Record<LearningReleaseCandidateRole, string[]> = {
  STUDENT: [
    'exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json',
    'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
  ],
  PARENT: [
    'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
    'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
  ],
  TEACHER: [
    'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
    'exports/learning-local-demo-teacher-escalation-followup-resolution-report.json',
  ],
  ADMIN: [
    'exports/learning-local-demo-production-runtime-gate-matrix-report.json',
    'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
  ],
  SUPPORT: [
    'exports/learning-local-demo-auth-operational-alert-policy-matrix-report.json',
    'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
  ],
  SALES: [
    'exports/learning-local-demo-student-course-enrollment-subscription-flow-report.json',
  ],
  CHANNEL: [
    'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
  ],
  FINANCE: [
    'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
    'apps/api/src/channel-finance/channel-finance.service.spec.ts',
  ],
};

const expectedEvidenceFor = (
  config: RoleJourneyConfig,
  scenario: LearningReleaseCandidateScenario,
) => {
  switch (scenario) {
    case 'HAPPY_PATH':
      return config.happyEvidence;
    case 'DENIED_PATH':
      return config.deniedEvidence;
    case 'INACTIVE_OR_EXPIRED_PATH':
      return config.inactiveEvidence;
    case 'PERMISSION_NEGATIVE_PATH':
      return config.permissionEvidence;
  }
};

const decisionFor = (
  scenario: LearningReleaseCandidateScenario,
): LearningReleaseCandidateDecision => {
  if (scenario === 'HAPPY_PATH') {
    return 'ALLOWED_FIXTURE_ONLY';
  }
  return scenario === 'INACTIVE_OR_EXPIRED_PATH' ? 'BLOCKED' : 'DENIED';
};

const lifecycleStatusFor = (
  scenario: LearningReleaseCandidateScenario,
): LearningReleaseCandidateFixtureLifecycleStatus =>
  scenario === 'INACTIVE_OR_EXPIRED_PATH' ? 'EXPIRED_OR_INACTIVE' : 'ACTIVE';

const scopeStatusFor = (
  scenario: LearningReleaseCandidateScenario,
): LearningReleaseCandidateFixtureScopeStatus => {
  if (scenario === 'HAPPY_PATH') {
    return 'AUTHORIZED';
  }
  return scenario === 'PERMISSION_NEGATIVE_PATH'
    ? 'OUT_OF_SCOPE'
    : 'ACTION_DENIED';
};

const scenarioFixtureIdFor = (
  role: LearningReleaseCandidateRole,
  scenario: LearningReleaseCandidateScenario,
) =>
  `rc-fixture-${role.toLowerCase()}-${scenario.toLowerCase().replaceAll('_', '-')}`;

export const buildLearningReleaseCandidateRoleScenarioFixtureRows = () =>
  (
    Object.entries(roleJourneyConfigs) as Array<
      [LearningReleaseCandidateRole, RoleJourneyConfig]
    >
  ).flatMap(([role, config]) =>
    scenarios.map(
      (scenario): LearningReleaseCandidateRoleScenarioFixtureRow => ({
        scenarioFixtureId: scenarioFixtureIdFor(role, scenario),
        sourceActorFixtureId: config.actorFixtureId,
        role,
        scenario,
        lifecycleStatus: lifecycleStatusFor(scenario),
        scopeStatus: scopeStatusFor(scenario),
        expectedDecision: decisionFor(scenario),
        syntheticFixtureOnly: true,
        credentialsIncluded: false,
        realPersonDataUsed: false,
      }),
    ),
  );

export const evaluateLearningReleaseCandidateFixtureAccess = (
  scenarioFixtureId: string,
  requestedRole: LearningReleaseCandidateRole,
  fixtureRows = buildLearningReleaseCandidateRoleScenarioFixtureRows(),
): {
  decision: LearningReleaseCandidateDecision;
  reasonCode: LearningReleaseCandidatePermissionReasonCode;
} => {
  const fixture = fixtureRows.find(
    (row) => row.scenarioFixtureId === scenarioFixtureId,
  );

  if (!fixture) {
    return { decision: 'DENIED', reasonCode: 'UNKNOWN_SCENARIO_FIXTURE' };
  }
  if (fixture.role !== requestedRole) {
    return { decision: 'DENIED', reasonCode: 'ROLE_SCOPE_MISMATCH' };
  }
  if (fixture.lifecycleStatus === 'EXPIRED_OR_INACTIVE') {
    return {
      decision: 'BLOCKED',
      reasonCode: 'EXPIRED_OR_INACTIVE_FIXTURE',
    };
  }
  if (fixture.scopeStatus !== 'AUTHORIZED') {
    return {
      decision: 'DENIED',
      reasonCode:
        fixture.scopeStatus === 'OUT_OF_SCOPE'
          ? 'ROLE_SCOPE_MISMATCH'
          : 'ACTION_DENIED_BY_FIXTURE_POLICY',
    };
  }
  return {
    decision: 'ALLOWED_FIXTURE_ONLY',
    reasonCode: 'MATCHED_ACTIVE_ROLE_FIXTURE',
  };
};

export const buildLearningReleaseCandidateRoleJourneyRows = (
  fixtureRows = buildLearningReleaseCandidateRoleScenarioFixtureRows(),
) =>
  fixtureRows.map((fixture): LearningReleaseCandidateRoleJourneyRow => {
    const config = roleJourneyConfigs[fixture.role];
    const evaluation = evaluateLearningReleaseCandidateFixtureAccess(
      fixture.scenarioFixtureId,
      fixture.role,
      fixtureRows,
    );

    return {
      journeyId: `rc-${fixture.role.toLowerCase()}-${fixture.scenario.toLowerCase().replaceAll('_', '-')}`,
      scenarioFixtureId: fixture.scenarioFixtureId,
      role: fixture.role,
      scenario: fixture.scenario,
      actorFixtureId: fixture.sourceActorFixtureId,
      targetSurface: config.targetSurface,
      decision: evaluation.decision,
      permissionReasonCode: evaluation.reasonCode,
      fixtureRefs: [fixture.scenarioFixtureId, ...config.fixtureRefs],
      evidencePaths: [...roleEvidencePaths[fixture.role]],
      expectedEvidence: expectedEvidenceFor(config, fixture.scenario),
      productionMutationAllowed: false,
    };
  });

export const learningReleaseCandidateSmokeRows: LearningReleaseCandidateSmokeRow[] =
  [
    {
      smokeId: 'rc-smoke-auth-session-negative-matrix',
      journey:
        'login -> logout -> expired token -> revoked session -> wrong role',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'apps/api/src/learning-local-demo/learning-local-demo.production-hardening.spec.ts',
        'exports/learning-local-demo-auth-session-smoke-matrix-report.json',
      ],
      expectedResult:
        'All required auth/session denial scenarios remain covered.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-parent-child-learning-flow',
      journey:
        'parent -> owned child -> active entitlement -> daily plan -> video -> practice -> approved report',
      verificationLevel: 'FIXTURE_REPORT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run seed:demo && npm run report:demo',
      evidencePaths: [
        'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
        'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
      ],
      expectedResult:
        'The preserved fixture journey is complete and parent-owned.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-role-permission-negative-paths',
      journey:
        'non-owning parent + unassigned teacher + learner wrong role + support mutation denial',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'apps/api/src/learning-local-demo/learning-local-demo.production-hardening.spec.ts',
      ],
      expectedResult:
        'Every required role has a permission-negative fixture row.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-entitlement-lifecycle',
      journey: 'active + pending payment + refunded + expired + revoked',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
      ],
      expectedResult: 'Only active entitlement unlocks the learning fixture.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-refund-commission-payout-safety',
      journey:
        'fixture payment -> 10-day refund window -> commission hold/release -> refund clawback -> payout guards',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence:
        'npm --prefix apps/api run test -- activation-orders.service.spec.ts entitlement.service.spec.ts package-entitlement-order-flow.spec.ts package-entitlement-snapshot.spec.ts channel-finance.service.spec.ts --runInBand',
      evidencePaths: [
        'apps/api/src/activation-orders/activation-orders.service.spec.ts',
        'apps/api/src/channel-finance/channel-finance.service.spec.ts',
      ],
      expectedResult:
        'Fixture-only money policy remains preserved with no provider call.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-local-demo-production-containment',
      journey: 'production environment -> local-demo route -> not found',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'apps/api/src/runtime-safety/local-demo-only.guard.ts',
        'exports/learning-local-demo-production-runtime-gate-matrix-report.json',
      ],
      expectedResult: 'Fixture routes cannot be exposed in production mode.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-staging-release-rehearsal',
      journey:
        'backup -> migrate -> smoke -> rollback/forward repair -> restore verify',
      verificationLevel: 'STAGING_REQUIRED',
      status: 'APPROVED_PENDING_ISOLATED_STAGING',
      commandOrEvidence: 'npm --prefix apps/api run rehearse:staging',
      evidencePaths: [
        'docs/hoctap_minhhuong/prisma_auth_session_store_runbook.md',
        'exports/minhhuong-staging-rc-v3-local-rehearsal.json',
      ],
      expectedResult:
        'Named owners approve RPO/RTO, rollback, and restore evidence.',
      productionBlocker: true,
    },
    {
      smokeId: 'rc-smoke-observability-incident-drill',
      journey:
        'health/error/latency alert -> correlation -> owner ack -> containment',
      verificationLevel: 'STAGING_REQUIRED',
      status: 'APPROVED_PENDING_ISOLATED_STAGING',
      commandOrEvidence: 'npm --prefix apps/api run rehearse:staging',
      evidencePaths: [
        'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
        'exports/minhhuong-staging-rc-v3-local-rehearsal.json',
      ],
      expectedResult:
        'Dashboards, routing, thresholds, and incident drill are accepted.',
      productionBlocker: true,
    },
  ];

export const learningReleaseApprovalRows: LearningReleaseApprovalRow[] = [
  {
    approvalId: 'release-approval-database-owner',
    ownerRole: 'DATABASE_OWNER',
    approvalScope:
      'Staging migration, read validation, backup, restore, forward repair, rollback, capacity, failover, RPO, and RTO',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'The target is an explicitly named non-production staging database with sanitized fixtures, least-privilege access, and an approved change window.',
      'Migration, schema/read validation, backup checksum, restore integrity, forward repair, and rollback or containment steps have named stop conditions.',
      'Numeric RPO/RTO, capacity, connection, concurrency, and failover thresholds are accepted before rehearsal.',
    ],
    requiredEvidence: [
      'Named database-owner approval with timestamp, staging target identifier, release version, and change window.',
      'Migration/read/backup/restore/forward-repair rehearsal record with checksums, timings, abort criteria, and exact cleanup.',
      'Accepted RPO/RTO, rollback, capacity, and failover evidence.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-privacy-retention-owner',
    ownerRole: 'PRIVACY_RETENTION_OWNER',
    approvalScope:
      'Child data, auth/audit, upload, transcript, deletion, redaction, retention, and export handling',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Retention and deletion periods are approved for child data, auth/audit rows, uploads, exports, and any future AI transcript data.',
      'Support access, privacy redaction, export purpose, incident access, and deletion exceptions are documented and auditable.',
      'A staging-only export/deletion/redaction dry-run uses synthetic or sanitized data and has explicit cleanup criteria.',
    ],
    requiredEvidence: [
      'Named privacy/retention-owner approval with policy version and effective date.',
      'Approved retention/deletion/export schedule and access-control matrix.',
      'Synthetic staging dry-run evidence with redaction and access audit results.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-incident-owner',
    ownerRole: 'INCIDENT_OWNER',
    approvalScope:
      'Monitoring, alert routing, log/trace correlation, incident response, rollback, and drill ownership',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Dashboards and alerts cover health, error rate, latency, auth denial/replay, refund, commission, payout, and repository failure signals.',
      'Thresholds, routing, acknowledgement, escalation, containment, rollback, and recovery owners are named.',
      'A staging incident drill proves alert-to-correlation-to-owner acknowledgement and safe containment within accepted targets.',
    ],
    requiredEvidence: [
      'Named incident-owner approval, on-call route, escalation path, and rollback owner.',
      'Approved dashboard/alert threshold inventory with log/trace correlation fields.',
      'Timed staging incident drill and after-action record.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-security-owner',
    ownerRole: 'SECURITY_OWNER',
    approvalScope:
      'External security review, secret handling, least privilege, webhook verification, abuse controls, and residual findings',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Secrets remain in an approved secret store; staging and production credentials are separated and never exported in evidence.',
      'Least-privilege access, webhook signature verification, idempotency, rate limiting, replay defense, and audit redaction are reviewed.',
      'External security findings have severity, owner, due date, accepted residual risk, and release-blocking disposition.',
    ],
    requiredEvidence: [
      'Named security-owner approval and external review reference.',
      'Threat model and access/secret/webhook control checklist for the release version.',
      'Finding register showing closure or explicit risk acceptance for every release-relevant item.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-provider-owner',
    ownerRole: 'PROVIDER_OWNER',
    approvalScope:
      'Payment, refund, payout, notification, and AI provider acceptance, reconciliation, loss limits, and kill switches',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Each provider has separately approved staging credentials, webhook verification, idempotency, reconciliation, rate/loss limits, and a tested kill switch.',
      'Payment, 10-day refund, commission release/clawback, payout approval, notification, and AI boundaries have provider-specific rollback or containment criteria.',
      'No live or production provider mode is enabled by the Codex auto-loop; every staging provider smoke requires explicit scoped approval.',
    ],
    requiredEvidence: [
      'Named owner approval per provider and explicitly scoped staging-smoke authorization.',
      'Provider acceptance matrix covering secrets, webhooks, idempotency, reconciliation, limits, kill switch, rollback, and incident routing.',
      'Staging-only smoke evidence with synthetic transactions and confirmed cleanup or reversal.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-release-owner',
    ownerRole: 'RELEASE_OWNER',
    approvalScope:
      'Named release decision, accepted residual risk, rollback ownership, and production enablement record',
    status: 'STAGING_REHEARSAL_APPROVED_PRODUCTION_NOT_APPROVED',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'The named release owner reviews the exact release version, all prerequisite approvals, unresolved risks, and rollback or containment ownership.',
      'The go-live decision records approver, timestamp, release version, accepted residual risks, enablement window, and rollback owner.',
      'production_ready and production_enabled remain false until that separate signed decision exists; no auto-loop output can substitute for it.',
    ],
    requiredEvidence: [
      'Named release-owner approval referencing every prerequisite approval and the immutable release version.',
      'Signed residual-risk acceptance and rollback/containment ownership record.',
      'Separate production enablement record outside the Codex auto-loop.',
    ],
    stagingApprovalRequired: false,
    productionBlocker: true,
  },
];

const requiredRoles = Object.keys(
  roleJourneyConfigs,
) as LearningReleaseCandidateRole[];

const isUnsafeRepoEvidencePath = (path: string) =>
  path.length === 0 ||
  /^(?:[a-z]+:|[\\/])/i.test(path) ||
  path.split(/[\\/]/).includes('..');

export const isAcceptedLearningStagingRehearsalEvidence = (
  evidence?: LearningStagingRehearsalEvidence,
) =>
  Boolean(
    evidence?.schemaVersion === 'minh_huong.staging_rehearsal.v1' &&
    evidence.target === 'minhhuong-staging-rc-v3-local' &&
    evidence.status === 'PASS' &&
    evidence.approval?.code ===
      'MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01' &&
    evidence.approval?.scope === 'staging_dry_run' &&
    evidence.gates?.status === 'PASS' &&
    evidence.gates.failedChecks?.length === 0 &&
    evidence.safety?.productionReady === false &&
    evidence.safety?.productionEnabled === false &&
    evidence.cleanup?.matchingDatabaseCount === 0 &&
    evidence.cleanup?.matchingProcessCount === 0 &&
    evidence.cleanup?.matchingListenerCount === 0 &&
    evidence.cleanup?.matchingTemporaryArtifactCount === 0,
  );

export const buildLearningReleaseCandidateGoLiveGateReport = (
  generatedAt = new Date().toISOString(),
  stagingRehearsalEvidence?: LearningStagingRehearsalEvidence,
): LearningReleaseCandidateGateReport => {
  const stagingRehearsalAccepted = isAcceptedLearningStagingRehearsalEvidence(
    stagingRehearsalEvidence,
  );
  const roleScenarioFixtureRows =
    buildLearningReleaseCandidateRoleScenarioFixtureRows();
  const roleJourneyRows = buildLearningReleaseCandidateRoleJourneyRows(
    roleScenarioFixtureRows,
  );
  const smokeRows = learningReleaseCandidateSmokeRows.map((row) => ({
    ...row,
    status:
      stagingRehearsalAccepted &&
      row.status === 'APPROVED_PENDING_ISOLATED_STAGING'
        ? ('PASS_ISOLATED_STAGING' as const)
        : row.status,
    evidencePaths: [...row.evidencePaths],
  }));
  const approvalRows = learningReleaseApprovalRows.map((row) => ({
    ...row,
    approvalEvidenceRefs: [...row.approvalEvidenceRefs],
    acceptanceCriteria: [...row.acceptanceCriteria],
    requiredEvidence: [...row.requiredEvidence],
  }));
  const deployReadinessRows = learningProductionRuntimeGateRows.map((row) => ({
    gateId: row.gateId,
    area: row.area,
    decision: row.decision,
    productionBlocker: row.productionBlocker,
    evidencePaths: [...row.evidencePaths],
    requiredNextEvidence: [...row.requiredNextEvidence],
    rollbackOrContainment: row.rollbackOrContainment,
  }));
  const evidencePaths = [
    ...roleJourneyRows.flatMap((row) => row.evidencePaths),
    ...smokeRows.flatMap((row) => row.evidencePaths),
    ...deployReadinessRows.flatMap((row) => row.evidencePaths),
  ];
  const uniqueEvidencePaths = new Set(evidencePaths);
  const uniqueScenarioFixtureIds = new Set(
    roleScenarioFixtureRows.map((row) => row.scenarioFixtureId),
  );
  const resolvedJourneyFixtureCount = roleJourneyRows.filter((journey) =>
    roleScenarioFixtureRows.some(
      (fixture) =>
        fixture.scenarioFixtureId === journey.scenarioFixtureId &&
        fixture.sourceActorFixtureId === journey.actorFixtureId &&
        fixture.role === journey.role &&
        fixture.scenario === journey.scenario,
    ),
  ).length;
  const roleMismatchCount = roleJourneyRows.filter((journey) => {
    const fixture = roleScenarioFixtureRows.find(
      (candidate) => candidate.scenarioFixtureId === journey.scenarioFixtureId,
    );
    return fixture !== undefined && fixture.role !== journey.role;
  }).length;
  const unsafeEvidencePathCount = [...uniqueEvidencePaths].filter(
    isUnsafeRepoEvidencePath,
  ).length;
  const evidenceIntegrityStatus =
    uniqueScenarioFixtureIds.size === roleScenarioFixtureRows.length &&
    resolvedJourneyFixtureCount === roleJourneyRows.length &&
    roleMismatchCount === 0 &&
    unsafeEvidencePathCount === 0
      ? 'PASS_LOCAL'
      : 'FAIL_CLOSED';

  const completeRoleCoverageCount = requiredRoles.filter((role) =>
    scenarios.every((scenario) =>
      roleJourneyRows.some(
        (row) => row.role === role && row.scenario === scenario,
      ),
    ),
  ).length;

  return {
    schemaVersion: 'learning-release-candidate-go-live-gate.v4',
    generatedAt,
    fixtureKind: 'learning-local-demo-only',
    releaseCandidateStatus: stagingRehearsalAccepted
      ? 'ISOLATED_STAGING_REHEARSAL_EVIDENCE_READY'
      : 'NON_PRODUCTION_RC_EVIDENCE_READY',
    goLiveDecision: 'GO_LIVE_BLOCKED',
    approvalGateDecision: 'STAGING_REHEARSAL_APPROVED_WITH_CONDITIONS',
    autoLoopDecision: stagingRehearsalAccepted
      ? 'STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION'
      : 'RESUME_APPROVED_STAGING_REHEARSAL_ONLY',
    stagingExecutionAuthorized: true,
    productionExecutionAuthorized: false,
    productionReady: false,
    productionEnabled: false,
    manualGoLiveApprovalRequired: true,
    approvalScope: {
      approvalCode: 'MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01',
      decisionId: 'MH-RC-V3-STAGING-CONDITIONAL-20260710-01',
      target: 'minhhuong-staging-rc-v3-local',
      classification: 'isolated_nonproduction_local_staging',
      scope: 'staging_dry_run',
      productionApproved: false,
      evidencePath:
        'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    },
    stagingRehearsal: {
      evidenceStatus: stagingRehearsalAccepted ? 'PASS' : 'PENDING_REHEARSAL',
      evidenceAccepted: stagingRehearsalAccepted,
      evidencePath: 'exports/minhhuong-staging-rc-v3-local-rehearsal.json',
      failedCheckCount:
        stagingRehearsalEvidence?.gates?.failedChecks?.length ?? 0,
      productionReady: false,
      productionEnabled: false,
    },
    roleScenarioFixtureRows,
    roleJourneyRows,
    smokeRows,
    approvalRows,
    deployReadinessRows,
    testStandard: {
      baselineJobId:
        'codex_job_minhhuong_00073_staging_rehearsal_conditional_approval',
      baselineLearningLocalTestCount: 118,
      verificationCommand: 'npm run test:learning-local',
      existingTestsDeleted: false,
      existingTestsSkipped: false,
      existingTestsRenamed: false,
      assertionsRelaxed: false,
      acceptanceCriteriaWeakened: false,
      newTestsAdded: true,
      testStandardChangeRequestRequired: false,
    },
    evidenceIntegrity: {
      status: evidenceIntegrityStatus,
      scenarioFixtureCount: roleScenarioFixtureRows.length,
      uniqueScenarioFixtureCount: uniqueScenarioFixtureIds.size,
      resolvedJourneyFixtureCount,
      roleMismatchCount,
      unsafeEvidencePathCount,
      uniqueEvidencePathCount: uniqueEvidencePaths.size,
    },
    safety: {
      productionDbUsed: false,
      stagingDbUsed: stagingRehearsalAccepted,
      providerApiUsed: false,
      paymentProviderMutationUsed: false,
      refundProviderMutationUsed: false,
      payoutProviderMutationUsed: false,
      notificationDeliveryUsed: false,
      liveAiProviderUsed: false,
      realCustomerOrStudentMutationUsed: false,
      productionDeployUsed: false,
      plaintextSecretsIncluded: false,
    },
    totals: {
      requiredRoleCount: requiredRoles.length,
      coveredRoleCount: new Set(roleJourneyRows.map((row) => row.role)).size,
      requiredScenarioCountPerRole: scenarios.length,
      completeRoleCoverageCount,
      roleScenarioFixtureCount: roleScenarioFixtureRows.length,
      resolvedJourneyFixtureCount,
      roleJourneyCount: roleJourneyRows.length,
      happyPathCount: roleJourneyRows.filter(
        (row) => row.scenario === 'HAPPY_PATH',
      ).length,
      deniedPathCount: roleJourneyRows.filter(
        (row) => row.scenario === 'DENIED_PATH',
      ).length,
      inactiveOrExpiredPathCount: roleJourneyRows.filter(
        (row) => row.scenario === 'INACTIVE_OR_EXPIRED_PATH',
      ).length,
      permissionNegativePathCount: roleJourneyRows.filter(
        (row) => row.scenario === 'PERMISSION_NEGATIVE_PATH',
      ).length,
      localSmokePassCount: smokeRows.filter(
        (row) => row.status === 'PASS_LOCAL',
      ).length,
      stagingSmokeBlockerCount: smokeRows.filter(
        (row) => row.status === 'APPROVED_PENDING_ISOLATED_STAGING',
      ).length,
      stagingSmokePassCount: smokeRows.filter(
        (row) => row.status === 'PASS_ISOLATED_STAGING',
      ).length,
      deployGateCount: deployReadinessRows.length,
      productionBlockerCount: deployReadinessRows.filter(
        (row) => row.productionBlocker,
      ).length,
      rollbackOrContainmentCount: deployReadinessRows.filter(
        (row) => row.rollbackOrContainment.length > 0,
      ).length,
      requiredApprovalCount: approvalRows.length,
      pendingApprovalCount: 0,
      approvedApprovalCount: approvalRows.length,
      approvalEvidenceCount: approvalRows.reduce(
        (count, row) => count + row.approvalEvidenceRefs.length,
        0,
      ),
      approvalsWithDefinedAcceptanceCriteriaCount: approvalRows.filter(
        (row) =>
          row.acceptanceCriteria.length > 0 && row.requiredEvidence.length > 0,
      ).length,
      stagingApprovalBlockerCount: approvalRows.filter(
        (row) =>
          row.stagingApprovalRequired &&
          row.status !== 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
      ).length,
      uniqueEvidencePathCount: uniqueEvidencePaths.size,
      unsafeEvidencePathCount,
      productionReadyClaimCount: 0,
      openSafetyGateCount: evidenceIntegrityStatus === 'PASS_LOCAL' ? 0 : 1,
    },
  };
};

export const toLearningReleaseCandidateGoLiveGateMarkdown = (
  report: LearningReleaseCandidateGateReport,
) =>
  [
    '# Learning Release Candidate Go-Live Gate',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Decision',
    '',
    `- release_candidate_status=${report.releaseCandidateStatus}`,
    `- go_live_decision=${report.goLiveDecision}`,
    `- approval_gate_decision=${report.approvalGateDecision}`,
    `- auto_loop_decision=${report.autoLoopDecision}`,
    `- staging_execution_authorized=${report.stagingExecutionAuthorized}`,
    '- production_execution_authorized=false',
    '- production_ready=false',
    '- production_enabled=false',
    '- manual_go_live_approval_required=true',
    `- approval_code=${report.approvalScope.approvalCode}`,
    `- approval_scope=${report.approvalScope.scope}`,
    `- approved_target=${report.approvalScope.target}`,
    `- staging_rehearsal_evidence=${report.stagingRehearsal.evidenceStatus}`,
    '',
    '## Coverage',
    '',
    `- Roles complete: ${report.totals.completeRoleCoverageCount}/${report.totals.requiredRoleCount}`,
    `- Synthetic role/scenario fixtures: ${report.totals.roleScenarioFixtureCount}`,
    `- Resolved journey fixtures: ${report.totals.resolvedJourneyFixtureCount}`,
    `- Role journeys: ${report.totals.roleJourneyCount}`,
    `- Happy/denied/inactive/permission-negative: ${report.totals.happyPathCount}/${report.totals.deniedPathCount}/${report.totals.inactiveOrExpiredPathCount}/${report.totals.permissionNegativePathCount}`,
    `- Local smoke pass: ${report.totals.localSmokePassCount}`,
    `- Staging smoke blockers: ${report.totals.stagingSmokeBlockerCount}`,
    `- Staging smoke pass: ${report.totals.stagingSmokePassCount}`,
    `- Production blockers: ${report.totals.productionBlockerCount}`,
    `- Required approvals: ${report.totals.requiredApprovalCount}`,
    `- Pending approvals: ${report.totals.pendingApprovalCount}`,
    `- Approved staging-scope approvals: ${report.totals.approvedApprovalCount}`,
    `- Staging approval blockers: ${report.totals.stagingApprovalBlockerCount}`,
    `- Evidence integrity: ${report.evidenceIntegrity.status}`,
    `- Unique repo-relative evidence paths: ${report.evidenceIntegrity.uniqueEvidencePathCount}`,
    `- Unsafe evidence paths: ${report.evidenceIntegrity.unsafeEvidencePathCount}`,
    '',
    '## Demo Role Scenario Fixtures',
    '',
    '| Scenario fixture | Source actor | Role | Scenario | Lifecycle | Scope | Expected decision | Credentials | Real-person data |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: |',
    ...report.roleScenarioFixtureRows.map(
      (row) =>
        `| ${row.scenarioFixtureId} | ${row.sourceActorFixtureId} | ${row.role} | ${row.scenario} | ${row.lifecycleStatus} | ${row.scopeStatus} | ${row.expectedDecision} | ${row.credentialsIncluded ? 'yes' : 'no'} | ${row.realPersonDataUsed ? 'yes' : 'no'} |`,
    ),
    '',
    '## Role Journeys',
    '',
    '| Journey | Role | Scenario | Decision | Reason | Actor | Target | Fixture refs | Evidence |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.roleJourneyRows.map(
      (row) =>
        `| ${row.journeyId} | ${row.role} | ${row.scenario} | ${row.decision} | ${row.permissionReasonCode} | ${row.actorFixtureId} | ${row.targetSurface} | ${row.fixtureRefs.join('<br>')} | ${row.expectedEvidence} |`,
    ),
    '',
    '## E2E / Smoke Matrix',
    '',
    '| Smoke | Level | Status | Journey | Command/evidence | Expected |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.smokeRows.map(
      (row) =>
        `| ${row.smokeId} | ${row.verificationLevel} | ${row.status} | ${row.journey} | ${row.commandOrEvidence} | ${row.expectedResult} |`,
    ),
    '',
    '## Deploy Readiness, Rollback, Backup, Monitoring, And Audit',
    '',
    '| Gate | Area | Decision | Blocker | Required next evidence | Rollback / containment |',
    '| --- | --- | --- | ---: | --- | --- |',
    ...report.deployReadinessRows.map(
      (row) =>
        `| ${row.gateId} | ${row.area} | ${row.decision} | ${row.productionBlocker ? 'yes' : 'no'} | ${row.requiredNextEvidence.join('<br>') || 'None; local code gate closed.'} | ${row.rollbackOrContainment} |`,
    ),
    '',
    '## Manual Approval And Acceptance Gate',
    '',
    '| Approval | Owner role | Status | Scope | Staging approval required | Acceptance criteria | Required evidence |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...report.approvalRows.map(
      (row) =>
        `| ${row.approvalId} | ${row.ownerRole} | ${row.status} | ${row.approvalScope} | ${row.stagingApprovalRequired ? 'yes' : 'no'} | ${row.acceptanceCriteria.join('<br>')} | ${row.requiredEvidence.join('<br>')} |`,
    ),
    '',
    '## Immutable Test Standard',
    '',
    `- baseline_job=${report.testStandard.baselineJobId}`,
    `- baseline_learning_local_tests=${report.testStandard.baselineLearningLocalTestCount}`,
    `- verification_command=${report.testStandard.verificationCommand}`,
    '- existing_tests_deleted=false',
    '- existing_tests_skipped=false',
    '- existing_tests_renamed=false',
    '- assertions_relaxed=false',
    '- acceptance_criteria_weakened=false',
    '- new_tests_added=true',
    '- test_standard_change_request_required=false',
    '',
    '## Evidence Integrity',
    '',
    `- status=${report.evidenceIntegrity.status}`,
    `- scenario_fixture_count=${report.evidenceIntegrity.scenarioFixtureCount}`,
    `- unique_scenario_fixture_count=${report.evidenceIntegrity.uniqueScenarioFixtureCount}`,
    `- resolved_journey_fixture_count=${report.evidenceIntegrity.resolvedJourneyFixtureCount}`,
    `- role_mismatch_count=${report.evidenceIntegrity.roleMismatchCount}`,
    `- unique_evidence_path_count=${report.evidenceIntegrity.uniqueEvidencePathCount}`,
    `- unsafe_evidence_path_count=${report.evidenceIntegrity.unsafeEvidencePathCount}`,
    '',
    '## Safety',
    '',
    ...Object.entries(report.safety).map(
      ([key, value]) => `- ${key}=${String(value)}`,
    ),
    '',
  ].join('\n');
