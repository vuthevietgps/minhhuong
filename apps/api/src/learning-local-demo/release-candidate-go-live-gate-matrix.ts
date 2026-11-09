import { learningProductionRuntimeGateRows } from './production-runtime-gate-matrix';
import {
  learningReleaseApprovalRows,
  learningReleaseCandidateSmokeRows,
  requiredRoles,
  roleEvidencePaths,
  roleJourneyConfigs,
  scenarios,
} from './release-candidate-go-live-gate.data';
import type {
  LearningReleaseCandidateDecision,
  LearningReleaseCandidateFixtureLifecycleStatus,
  LearningReleaseCandidateFixtureScopeStatus,
  LearningReleaseCandidateGateReport,
  LearningReleaseCandidatePermissionReasonCode,
  LearningReleaseCandidateRole,
  LearningReleaseCandidateRoleJourneyRow,
  LearningReleaseCandidateRoleScenarioFixtureRow,
  LearningReleaseCandidateScenario,
  LearningStagingRehearsalEvidence,
  RoleJourneyConfig,
} from './release-candidate-go-live-gate.types';

export {
  learningReleaseCandidateSmokeRows,
  learningReleaseApprovalRows,
} from './release-candidate-go-live-gate.data';

export type {
  LearningReleaseCandidateRole,
  LearningReleaseCandidateScenario,
  LearningReleaseCandidateDecision,
  LearningReleaseCandidateFixtureLifecycleStatus,
  LearningReleaseCandidateFixtureScopeStatus,
  LearningReleaseCandidatePermissionReasonCode,
  LearningReleaseCandidateRoleScenarioFixtureRow,
  LearningReleaseCandidateRoleJourneyRow,
  LearningReleaseCandidateSmokeStatus,
  LearningReleaseCandidateSmokeRow,
  LearningReleaseApprovalOwnerRole,
  LearningReleaseApprovalRow,
  LearningReleaseCandidateGateReport,
  LearningStagingRehearsalEvidence,
} from './release-candidate-go-live-gate.types';

export const parseLearningStagingRehearsalEvidence = (
  serialized: string,
): LearningStagingRehearsalEvidence => {
  const value: unknown = JSON.parse(serialized);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Staging rehearsal evidence must be a JSON object');
  }
  return value;
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
