import { LearningLocalDemoService } from './learning-local-demo.service';
import { evaluateLearningReleaseCandidateFixtureAccess } from './release-candidate-go-live-gate-matrix';

describe('LearningLocalDemoReleaseCandidateGoLiveGate', () => {
  const service = new LearningLocalDemoService();
  const generatedAt = '2026-07-10T10:00:00.000Z';
  const passingStagingEvidence = {
    schemaVersion: 'minh_huong.staging_rehearsal.v1',
    target: 'minhhuong-staging-rc-v3-local',
    status: 'PASS',
    approval: {
      code: 'MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01',
      scope: 'staging_dry_run',
    },
    gates: { status: 'PASS', failedChecks: [] },
    safety: { productionReady: false, productionEnabled: false },
    cleanup: {
      matchingDatabaseCount: 0,
      matchingProcessCount: 0,
      matchingListenerCount: 0,
      matchingTemporaryArtifactCount: 0,
    },
  };

  it('covers every required role with happy, denied, inactive, and permission-negative journeys', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);

    expect(report.totals).toEqual(
      expect.objectContaining({
        requiredRoleCount: 8,
        coveredRoleCount: 8,
        requiredScenarioCountPerRole: 4,
        completeRoleCoverageCount: 8,
        roleJourneyCount: 32,
        happyPathCount: 8,
        deniedPathCount: 8,
        inactiveOrExpiredPathCount: 8,
        permissionNegativePathCount: 8,
      }),
    );

    for (const row of report.roleJourneyRows) {
      expect(row.fixtureRefs.length).toBeGreaterThan(0);
      expect(row.evidencePaths.length).toBeGreaterThan(0);
      expect(row.productionMutationAllowed).toBe(false);
    }
  });

  it('resolves every journey to a unique synthetic role/scenario fixture without credentials or real-person data', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);

    expect(report.evidenceIntegrity).toEqual({
      status: 'PASS_LOCAL',
      scenarioFixtureCount: 32,
      uniqueScenarioFixtureCount: 32,
      resolvedJourneyFixtureCount: 32,
      roleMismatchCount: 0,
      unsafeEvidencePathCount: 0,
      uniqueEvidencePathCount: expect.any(Number),
    });
    expect(report.evidenceIntegrity.uniqueEvidencePathCount).toBeGreaterThan(0);
    expect(report.roleScenarioFixtureRows).toHaveLength(32);

    for (const fixture of report.roleScenarioFixtureRows) {
      expect(fixture.syntheticFixtureOnly).toBe(true);
      expect(fixture.credentialsIncluded).toBe(false);
      expect(fixture.realPersonDataUsed).toBe(false);
      expect(
        report.roleJourneyRows.some(
          (journey) =>
            journey.scenarioFixtureId === fixture.scenarioFixtureId &&
            journey.actorFixtureId === fixture.sourceActorFixtureId &&
            journey.role === fixture.role &&
            journey.scenario === fixture.scenario,
        ),
      ).toBe(true);
    }
  });

  it('fails unknown and cross-role fixture access closed', () => {
    expect(
      evaluateLearningReleaseCandidateFixtureAccess(
        'rc-fixture-parent-happy-path',
        'TEACHER',
      ),
    ).toEqual({ decision: 'DENIED', reasonCode: 'ROLE_SCOPE_MISMATCH' });
    expect(
      evaluateLearningReleaseCandidateFixtureAccess(
        'rc-fixture-does-not-exist',
        'ADMIN',
      ),
    ).toEqual({
      decision: 'DENIED',
      reasonCode: 'UNKNOWN_SCENARIO_FIXTURE',
    });
    expect(
      evaluateLearningReleaseCandidateFixtureAccess(
        'rc-fixture-student-inactive-or-expired-path',
        'STUDENT',
      ),
    ).toEqual({
      decision: 'BLOCKED',
      reasonCode: 'EXPIRED_OR_INACTIVE_FIXTURE',
    });
  });

  it('denies or blocks every negative and inactive path', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);
    const nonHappyRows = report.roleJourneyRows.filter(
      (row) => row.scenario !== 'HAPPY_PATH',
    );

    expect(nonHappyRows).toHaveLength(24);
    expect(
      nonHappyRows.every(
        (row) => row.decision === 'DENIED' || row.decision === 'BLOCKED',
      ),
    ).toBe(true);
    expect(
      report.roleJourneyRows
        .filter((row) => row.scenario === 'HAPPY_PATH')
        .every((row) => row.decision === 'ALLOWED_FIXTURE_ONLY'),
    ).toBe(true);
  });

  it('keeps the immutable test standard additive', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);

    expect(report.testStandard).toEqual({
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
    });
  });

  it('records local smoke evidence and the conditionally approved staging lane', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);

    expect(report.totals.localSmokePassCount).toBe(6);
    expect(report.totals.stagingSmokeBlockerCount).toBe(2);
    expect(report.smokeRows.filter((row) => row.productionBlocker)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          smokeId: 'rc-smoke-staging-release-rehearsal',
          status: 'APPROVED_PENDING_ISOLATED_STAGING',
        }),
        expect.objectContaining({
          smokeId: 'rc-smoke-observability-incident-drill',
          status: 'APPROVED_PENDING_ISOLATED_STAGING',
        }),
      ]),
    );
  });

  it('fails the go-live decision closed while retaining complete rollback and safety evidence', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);

    expect(report.goLiveDecision).toBe('GO_LIVE_BLOCKED');
    expect(report.releaseCandidateStatus).toBe(
      'NON_PRODUCTION_RC_EVIDENCE_READY',
    );
    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
    expect(report.manualGoLiveApprovalRequired).toBe(true);
    expect(report.totals.productionBlockerCount).toBeGreaterThan(0);
    expect(report.totals.rollbackOrContainmentCount).toBe(
      report.totals.deployGateCount,
    );
    expect(report.totals.productionReadyClaimCount).toBe(0);
    expect(report.totals.openSafetyGateCount).toBe(0);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(
      true,
    );
  });

  it('authorizes only the named conditional staging rehearsal and still blocks production', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);

    expect(report.approvalGateDecision).toBe(
      'STAGING_REHEARSAL_APPROVED_WITH_CONDITIONS',
    );
    expect(report.autoLoopDecision).toBe(
      'RESUME_APPROVED_STAGING_REHEARSAL_ONLY',
    );
    expect(report.stagingExecutionAuthorized).toBe(true);
    expect(report.productionExecutionAuthorized).toBe(false);
    expect(report.approvalRows.map((row) => row.ownerRole)).toEqual([
      'DATABASE_OWNER',
      'PRIVACY_RETENTION_OWNER',
      'INCIDENT_OWNER',
      'SECURITY_OWNER',
      'PROVIDER_OWNER',
      'RELEASE_OWNER',
    ]);
    expect(report.totals).toEqual(
      expect.objectContaining({
        requiredApprovalCount: 6,
        pendingApprovalCount: 0,
        approvedApprovalCount: 6,
        approvalEvidenceCount: 6,
        approvalsWithDefinedAcceptanceCriteriaCount: 6,
        stagingApprovalBlockerCount: 0,
      }),
    );

    for (const row of report.approvalRows) {
      expect(row.status).toMatch(/APPROVED/);
      expect(row.approverName).toBeNull();
      expect(row.authorityPrincipal).toBe('Minh Huong workspace/project owner');
      expect(row.approvedAt).toBe('2026-07-10T20:30:22+07:00');
      expect(row.approvalEvidenceRefs).toEqual([
        'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
      ]);
      expect(row.acceptanceCriteria.length).toBeGreaterThanOrEqual(3);
      expect(row.requiredEvidence.length).toBeGreaterThanOrEqual(3);
      expect(row.productionBlocker).toBe(true);
    }
    expect(report.approvalScope).toEqual(
      expect.objectContaining({
        target: 'minhhuong-staging-rc-v3-local',
        scope: 'staging_dry_run',
        productionApproved: false,
      }),
    );
  });

  it('accepts only passing exact-cleanup rehearsal evidence and then stops for a separate release decision', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(
      generatedAt,
      passingStagingEvidence,
    );

    expect(report.schemaVersion).toBe(
      'learning-release-candidate-go-live-gate.v4',
    );
    expect(report.releaseCandidateStatus).toBe(
      'ISOLATED_STAGING_REHEARSAL_EVIDENCE_READY',
    );
    expect(report.autoLoopDecision).toBe(
      'STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION',
    );
    expect(report.stagingRehearsal.evidenceAccepted).toBe(true);
    expect(report.totals.stagingSmokeBlockerCount).toBe(0);
    expect(report.totals.stagingSmokePassCount).toBe(2);
    expect(report.safety.stagingDbUsed).toBe(true);
    expect(report.productionReady).toBe(false);
    expect(report.productionExecutionAuthorized).toBe(false);
  });

  it('preserves the local 10-day refund, commission, clawback, and payout safety regression gate', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);
    const paidPilotSmoke = report.smokeRows.find(
      (row) => row.smokeId === 'rc-smoke-refund-commission-payout-safety',
    );

    expect(paidPilotSmoke).toEqual(
      expect.objectContaining({
        status: 'PASS_LOCAL',
        verificationLevel: 'AUTOMATED_UNIT',
        productionBlocker: false,
      }),
    );
    expect(paidPilotSmoke?.journey).toContain('10-day refund window');
    expect(paidPilotSmoke?.journey).toContain('commission hold/release');
    expect(paidPilotSmoke?.journey).toContain('refund clawback');
    expect(paidPilotSmoke?.journey).toContain('payout guards');
  });

  it('renders a reviewer-readable gate report with all mandatory sections', () => {
    const report = service.buildReleaseCandidateGoLiveGateReport(generatedAt);
    const markdown = service.toReleaseCandidateGoLiveGateMarkdown(report);

    expect(markdown).toContain('# Learning Release Candidate Go-Live Gate');
    expect(markdown).toContain('go_live_decision=GO_LIVE_BLOCKED');
    expect(markdown).toContain('## Role Journeys');
    expect(markdown).toContain('## Demo Role Scenario Fixtures');
    expect(markdown).toContain('## E2E / Smoke Matrix');
    expect(markdown).toContain(
      '## Deploy Readiness, Rollback, Backup, Monitoring, And Audit',
    );
    expect(markdown).toContain('## Manual Approval And Acceptance Gate');
    expect(markdown).toContain(
      'auto_loop_decision=RESUME_APPROVED_STAGING_REHEARSAL_ONLY',
    );
    expect(markdown).toContain('DATABASE_OWNER');
    expect(markdown).toContain('RELEASE_OWNER');
    expect(markdown).toContain('## Immutable Test Standard');
    expect(markdown).toContain('## Evidence Integrity');
    expect(markdown).toContain('production_ready=false');
  });
});
