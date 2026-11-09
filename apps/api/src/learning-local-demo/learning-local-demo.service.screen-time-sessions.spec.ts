import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (screen time and sessions)', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only parent screen-time guardian controls report', () => {
    const report = service.buildParentScreenTimeGuardianControlsReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      paymentProviderUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realClassMutationUsed: false,
      realSessionMutationUsed: false,
      realAttendanceMutationUsed: false,
      realProgressMutationUsed: false,
      realLessonMutationUsed: false,
      realAssignmentMutationUsed: false,
      realAssessmentMutationUsed: false,
      realLearningPathMutationUsed: false,
      realDailyPlanMutationUsed: false,
      realVideoEvidenceMutationUsed: false,
      realPracticeMutationUsed: false,
      realParentGuardianMutationUsed: false,
      realScreenTimePolicyMutationUsed: false,
      realLearningSessionGateMutationUsed: false,
      realScreenTimeGrantMutationUsed: false,
      realDailyPlanAccessMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      parentGuardianCount: 4,
      childCount: 4,
      activeScreenTimePolicyCount: 3,
      allowedMinutes: 155,
      usedMinutes: 121,
      remainingMinutes: 34,
      grantRequestCount: 2,
      grantDecisionCount: 2,
      approvedGrantCount: 1,
      deniedGrantCount: 1,
      allowedSessionCount: 5,
      blockedSessionCount: 4,
      overrideSessionCount: 1,
      childrenNeedingParentAttentionCount: 2,
    });
    expect(report.statusCounts).toEqual({
      policyStatus: {
        ACTIVE: 3,
        PAUSED: 0,
        DISABLED: 1,
      },
      gateDecision: {
        ALLOWED: 5,
        BLOCKED: 4,
        OVERRIDE_ALLOWED: 1,
      },
      grantDecision: {
        APPROVED: 1,
        DENIED: 1,
        PENDING: 0,
      },
    });
  });

  it('derives screen-time child, gate, and grant rows from daily-plan fixtures', () => {
    const report = service.buildParentScreenTimeGuardianControlsReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:00:00.000Z',
    );

    const ava = report.childRows.find((row) => row.studentId === 'student-ava');
    const minh = report.childRows.find(
      (row) => row.studentId === 'student-minh',
    );
    const khoa = report.childRows.find(
      (row) => row.studentId === 'student-khoa',
    );
    const avaOverride = report.gateRows.find(
      (row) => row.gateId === 'gate-ava-a1-day-03',
    );
    const minhDeniedGate = report.gateRows.find(
      (row) => row.gateId === 'gate-minh-a1-day-03',
    );
    const approvedGrant = report.grantRows.find(
      (row) => row.grantRequestId === 'grant-ava-day-03-extra-time-approved',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        guardianName: 'Ava Parent',
        policyStatus: 'ACTIVE',
        dailyAllowedMinutes: 45,
        approvedGrantMinutes: 15,
        totalAllowedMinutes: 60,
        usedMinutes: 53,
        remainingMinutes: 7,
        allowedSessionCount: 2,
        blockedSessionCount: 0,
        overrideSessionCount: 1,
        needsParentAttention: false,
      }),
    );
    expect(minh).toEqual(
      expect.objectContaining({
        policyStatus: 'ACTIVE',
        dailyAllowedMinutes: 35,
        usedMinutes: 16,
        remainingMinutes: 19,
        grantRequestCount: 1,
        grantDecisionCount: 1,
        allowedSessionCount: 1,
        blockedSessionCount: 2,
        needsParentAttention: true,
        parentAttentionReason:
          '1 denied grant and 2 blocked session gate rows need parent review.',
      }),
    );
    expect(khoa).toEqual(
      expect.objectContaining({
        activePolicyId: null,
        policyStatus: 'DISABLED',
        dailyAllowedMinutes: 0,
        usedMinutes: 0,
        blockedSessionCount: 2,
        needsParentAttention: true,
      }),
    );
    expect(avaOverride).toEqual(
      expect.objectContaining({
        decision: 'OVERRIDE_ALLOWED',
        sessionUsedMinutes: 15,
        safeDailyPlanAccess: true,
        decidedBy: 'fixture_parent_grant',
      }),
    );
    expect(minhDeniedGate).toEqual(
      expect.objectContaining({
        decision: 'BLOCKED',
        blockedReason: 'GUARDIAN_DENIED_GRANT',
        sessionUsedMinutes: 0,
        safeDailyPlanAccess: false,
      }),
    );
    expect(approvedGrant).toEqual(
      expect.objectContaining({
        decision: 'APPROVED',
        requestedExtraMinutes: 15,
        grantedMinutes: 15,
      }),
    );
  });

  it('renders parent screen-time guardian controls Markdown evidence', () => {
    const report = service.buildParentScreenTimeGuardianControlsReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:00:00.000Z',
    );
    const markdown = service.toParentScreenTimeGuardianControlsMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realParentGuardianMutationUsed=false');
    expect(markdown).toContain('realScreenTimePolicyMutationUsed=false');
    expect(markdown).toContain('realLearningSessionGateMutationUsed=false');
    expect(markdown).toContain('realScreenTimeGrantMutationUsed=false');
    expect(markdown).toContain('realDailyPlanAccessMutationUsed=false');
    expect(markdown).toContain('Allowed sessions: 5');
    expect(markdown).toContain('## Child Controls Rows');
    expect(markdown).toContain('## Learning Session Gate Rows');
    expect(markdown).toContain('## Parent Grant Rows');
  });

  it('builds a fixture-only parent screen-time grant daily plan guard report', () => {
    const report = service.buildParentScreenTimeGrantDailyPlanGuardReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:15:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-screen-time-grant-daily-plan-guard',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md',
    );
    expect(report.safety).toEqual(
      expect.objectContaining({
        productionReady: false,
        fixtureOnly: true,
        productionDbUsed: false,
        noProductionDbRead: true,
        providerApiUsed: false,
        aiProviderUsed: false,
        aiProviderExecutionUsed: false,
        paymentProviderUsed: false,
        notificationProviderUsed: false,
        realParentMutationUsed: false,
        realParentGuardianMutationUsed: false,
        realScreenTimePolicyMutationUsed: false,
        realLearningSessionGateMutationUsed: false,
        realScreenTimeGrantMutationUsed: false,
        realDailyPlanAccessMutationUsed: false,
        realLearningMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        studentCount: 4,
        parentGuardianCount: 4,
        courseCount: 2,
        dailyPlanAccessCaseCount: 10,
        parentGrantRuleCount: 2,
        screenTimeRuleCount: 4,
        allowedSessionCount: 6,
        blockedSessionCount: 4,
        blockedReasonCount: 4,
        safeNextActionCount: 10,
        blockedOrLimitedCaseWithSafeNextActionCount: 5,
        sessionGuardTraceCount: 10,
        accessCasesWithStableTraceCount: 10,
        allowedCasesWithStableTraceCount: 6,
        blockedCasesWithStableTraceCount: 4,
        blockedCasesWithReasonAndNextActionCount: 4,
        learningSessionEvidenceCount: 10,
        allowedLearningSessionEvidenceCount: 6,
        blockedLearningSessionEvidenceCount: 4,
        evidenceRowCount: 6,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.totals.safetyGateCount).toBe(
      Object.keys(report.safety).length,
    );
    expect(report.totals.closedSafetyGateCount).toBe(
      report.totals.safetyGateCount,
    );
    expect(report.statusCounts).toEqual({
      policyStatus: {
        ACTIVE: 3,
        PAUSED: 0,
        DISABLED: 1,
      },
      gateDecision: {
        ALLOWED: 5,
        BLOCKED: 4,
        OVERRIDE_ALLOWED: 1,
      },
      grantDecision: {
        APPROVED: 1,
        DENIED: 1,
        PENDING: 0,
      },
      accessResult: {
        ALLOWED_SESSION: 6,
        BLOCKED_SESSION: 4,
      },
    });
  });

  it('traces allowed and blocked daily plan guard cases with stable IDs', () => {
    const report = service.buildParentScreenTimeGrantDailyPlanGuardReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:15:00.000Z',
    );
    const avaOverride = report.accessRows.find(
      (row) => row.accessCaseId === 'daily-plan-guard-gate-ava-a1-day-03',
    );
    const minhDenied = report.accessRows.find(
      (row) => row.accessCaseId === 'daily-plan-guard-gate-minh-a1-day-03',
    );
    const approvedGrant = report.grantRuleRows.find(
      (row) => row.grantRuleId === 'grant-ava-day-03-extra-time-approved',
    );
    const blockedSessionEvidence = report.sessionEvidenceRows.find(
      (row) =>
        row.learningSessionEvidenceId ===
        'learning-session-evidence-gate-minh-a1-day-03',
    );

    expect(avaOverride).toEqual(
      expect.objectContaining({
        parentGuardianId: 'guardian-ava-parent',
        childProfileId: 'child-ava-demo',
        courseId: 'course-a1-starter',
        dailyPlanId: 'plan-ava-a1-day-03',
        screenTimePolicyId: 'screen-policy-ava-a1',
        parentGrantRuleId: 'grant-ava-day-03-extra-time-approved',
        parentGrantDecision: 'APPROVED',
        accessDecision: 'OVERRIDE_ALLOWED',
        accessResult: 'ALLOWED_SESSION',
        blockedReason: null,
        learningSessionEvidenceId:
          'learning-session-evidence-gate-ava-a1-day-03',
      }),
    );
    expect(avaOverride?.nextSafeActionLabel).toContain('approved parent grant');
    expect(avaOverride?.sessionGuardTraceKey).toContain(
      'guardian-ava-parent->child-ava-demo->student-ava->course-a1-starter->plan-ava-a1-day-03',
    );
    expect(minhDenied).toEqual(
      expect.objectContaining({
        parentGuardianId: 'guardian-minh-parent',
        childProfileId: 'child-minh-demo',
        dailyPlanId: 'plan-minh-a1-day-03',
        parentGrantRuleId: 'grant-minh-day-03-extra-time-denied',
        parentGrantDecision: 'DENIED',
        accessDecision: 'BLOCKED',
        accessResult: 'BLOCKED_SESSION',
        blockedReasonCode: 'GUARDIAN_DENIED_GRANT',
      }),
    );
    expect(minhDenied?.blockedReason).toContain('denied');
    expect(minhDenied?.nextSafeActionLabel).toContain('guardian review');
    expect(approvedGrant).toEqual(
      expect.objectContaining({
        decision: 'APPROVED',
        allowsDailyPlanAccess: true,
        grantedMinutes: 15,
      }),
    );
    expect(blockedSessionEvidence).toEqual(
      expect.objectContaining({
        accessResult: 'BLOCKED_SESSION',
        sessionStarted: false,
        sessionDurationMinutes: 0,
        blockedReason: expect.stringContaining('denied'),
      }),
    );
    expect(
      report.accessRows.every(
        (row) =>
          row.sessionGuardTraceIds.length >= 10 &&
          row.sessionGuardTraceKey.includes(row.parentGuardianId) &&
          row.sessionGuardTraceKey.includes(row.childProfileId) &&
          row.sessionGuardTraceKey.includes(row.courseId) &&
          row.sessionGuardTraceKey.includes(row.dailyPlanId) &&
          row.sessionGuardTraceKey.includes(row.screenTimePolicyId) &&
          row.sessionGuardTraceKey.includes(row.learningSessionEvidenceId),
      ),
    ).toBe(true);
    expect(
      report.accessRows
        .filter((row) => row.accessResult === 'BLOCKED_SESSION')
        .every((row) => row.blockedReason && row.nextSafeActionLabel),
    ).toBe(true);
  });

  it('renders parent screen-time grant daily plan guard Markdown evidence', () => {
    const report = service.buildParentScreenTimeGrantDailyPlanGuardReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:15:00.000Z',
    );
    const markdown =
      service.toParentScreenTimeGrantDailyPlanGuardMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Daily plan access cases: 10');
    expect(markdown).toContain('Parent grant rules: 2');
    expect(markdown).toContain('Allowed sessions: 6');
    expect(markdown).toContain('Blocked sessions: 4');
    expect(markdown).toContain('Session guard traces: 10');
    expect(markdown).toContain('## Daily Plan Guard Rows');
    expect(markdown).toContain('## Parent Grant Rule Rows');
    expect(markdown).toContain('## Learning Session Evidence Rows');
    expect(markdown).toContain('grant-ava-day-03-extra-time-approved');
    expect(markdown).toContain('GUARDIAN_DENIED_GRANT');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report',
    );
  });

  it('builds a fixture-only learning session completion practice progress rollup report', () => {
    const report =
      service.buildLearningSessionCompletionPracticeProgressRollupReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:30:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#learning-session-completion-practice-progress-rollup',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.md',
    );
    expect(report.safety).toEqual(
      expect.objectContaining({
        productionReady: false,
        fixtureOnly: true,
        productionDbUsed: false,
        noProductionDbRead: true,
        providerApiUsed: false,
        aiProviderExecutionUsed: false,
        paymentProviderUsed: false,
        notificationProviderUsed: false,
        realLearningSessionGateMutationUsed: false,
        realDailyPlanAccessMutationUsed: false,
        realLearningSessionCompletionMutationUsed: false,
        realProgressMutationUsed: false,
        realVideoEvidenceMutationUsed: false,
        realPracticeMutationUsed: false,
        realParentProgressSummaryMutationUsed: false,
        realTeacherProgressSummaryMutationUsed: false,
        realLearningMutationUsed: false,
        realParentMessageMutationUsed: false,
        realTeacherInterventionMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        studentCount: 3,
        courseCount: 2,
        dailyPlanSessionReferenceCount: 6,
        allowedDailyPlanSessionReferenceCount: 6,
        lessonCompletionEvidenceCount: 6,
        practiceAttemptEvidenceCount: 6,
        scoredPracticeAttemptEvidenceCount: 6,
        progressRollupCount: 6,
        parentVisibleProgressSummaryCount: 6,
        teacherVisibleProgressSummaryCount: 6,
        stableTraceCount: 6,
        rollupsWithStudentCourseDailyPlanSessionCount: 6,
        rollupsWithLessonPracticeEvidenceCount: 6,
        rollupsWithParentTeacherSummaryCount: 6,
        practiceAttemptsWithDeterministicScoreStatusCount: 6,
        rollupsWithCompletionPercentCount: 6,
        rollupsWithSafeNextActionLabelCount: 6,
        completedRollupCount: 2,
        needsSupportRollupCount: 1,
        averageCompletionPercent: 72,
        averagePracticeScorePercent: 73,
        evidenceRowCount: 7,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.totals.safetyGateCount).toBe(
      Object.keys(report.safety).length,
    );
    expect(report.totals.closedSafetyGateCount).toBe(
      report.totals.safetyGateCount,
    );
    expect(report.statusCounts).toEqual({
      accessResult: {
        ALLOWED_SESSION: 6,
        BLOCKED_SESSION: 0,
      },
      dailyPlanStatus: {
        COMPLETED: 5,
        IN_PROGRESS: 1,
        BLOCKED: 0,
        SKIPPED: 0,
        ASSIGNED: 0,
      },
      practiceAttemptStatus: {
        PASSED: 5,
        NEEDS_RETRY: 0,
        INCOMPLETE: 1,
        SKIPPED: 0,
      },
      rollupStatus: {
        COMPLETED: 2,
        ON_TRACK: 2,
        NEEDS_SUPPORT: 1,
        IN_PROGRESS: 1,
      },
    });
  });

  it('links allowed session rollups to lesson practice parent and teacher summaries', () => {
    const report =
      service.buildLearningSessionCompletionPracticeProgressRollupReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:30:00.000Z',
      );
    const avaPreview = report.progressRollupRows.find(
      (row) => row.dailyPlanId === 'plan-ava-a1-day-03',
    );
    const minhCatchup = report.progressRollupRows.find(
      (row) => row.dailyPlanId === 'plan-minh-a1-day-01',
    );
    const linhComplete = report.progressRollupRows.find(
      (row) => row.dailyPlanId === 'plan-linh-phonics-day-02',
    );

    expect(avaPreview).toEqual(
      expect.objectContaining({
        accessCaseId: 'daily-plan-guard-gate-ava-a1-day-03',
        learningSessionEvidenceId:
          'learning-session-evidence-gate-ava-a1-day-03',
        videoEvidenceId: 'video-ava-a1-day-03',
        lessonCompletionEvidenceId: 'lesson-completion-video-ava-a1-day-03',
        practiceAttemptId: 'practice-ava-a1-day-03',
        practiceAttemptStatus: 'INCOMPLETE',
        practiceScorePercent: 0,
        rollupStatus: 'IN_PROGRESS',
      }),
    );
    expect(avaPreview?.nextSafeActionLabel).toContain(
      'Complete the fixture lesson video',
    );
    expect(minhCatchup).toEqual(
      expect.objectContaining({
        studentId: 'student-minh',
        practiceAttemptStatus: 'PASSED',
        practiceScorePercent: 72,
        progressStatus: 'NEEDS_SUPPORT',
        rollupStatus: 'NEEDS_SUPPORT',
      }),
    );
    expect(minhCatchup?.nextSafeActionLabel).toContain(
      'Schedule teacher support',
    );
    expect(linhComplete).toEqual(
      expect.objectContaining({
        studentId: 'student-linh',
        courseCode: 'MH-PHONICS-BOOSTER',
        dailyPlanId: 'plan-linh-phonics-day-02',
        practiceScorePercent: 92,
        completionPercent: 100,
        rollupStatus: 'COMPLETED',
      }),
    );
    expect(
      report.progressRollupRows.every((row) => {
        const parentSummary = report.parentSummaryRows.find(
          (summary) =>
            summary.parentVisibleProgressSummaryId ===
            row.parentVisibleProgressSummaryId,
        );
        const teacherSummary = report.teacherSummaryRows.find(
          (summary) =>
            summary.teacherVisibleProgressSummaryId ===
            row.teacherVisibleProgressSummaryId,
        );

        return (
          parentSummary?.progressRollupId === row.progressRollupId &&
          parentSummary.parentVisible &&
          teacherSummary?.progressRollupId === row.progressRollupId &&
          teacherSummary.teacherVisible &&
          row.stableTraceIds.length >= 12 &&
          row.stableTraceKey.includes(row.studentId) &&
          row.stableTraceKey.includes(row.courseId) &&
          row.stableTraceKey.includes(row.dailyPlanId) &&
          row.stableTraceKey.includes(row.learningSessionEvidenceId) &&
          row.stableTraceKey.includes(row.lessonCompletionEvidenceId) &&
          row.stableTraceKey.includes(row.practiceAttemptId) &&
          row.stableTraceKey.includes(row.progressRollupId) &&
          row.stableTraceKey.includes(row.parentVisibleProgressSummaryId) &&
          row.stableTraceKey.includes(row.teacherVisibleProgressSummaryId)
        );
      }),
    ).toBe(true);
  });

  it('renders learning session completion practice progress rollup Markdown evidence', () => {
    const report =
      service.buildLearningSessionCompletionPracticeProgressRollupReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:30:00.000Z',
      );
    const markdown =
      service.toLearningSessionCompletionPracticeProgressRollupMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain(
      'realLearningSessionCompletionMutationUsed=false',
    );
    expect(markdown).toContain('realParentProgressSummaryMutationUsed=false');
    expect(markdown).toContain('realTeacherProgressSummaryMutationUsed=false');
    expect(markdown).toContain('Progress rollups: 6');
    expect(markdown).toContain('Parent-visible progress summaries: 6');
    expect(markdown).toContain('Teacher-visible progress summaries: 6');
    expect(markdown).toContain('Stable traces: 6');
    expect(markdown).toContain('## Progress Rollup Rows');
    expect(markdown).toContain('## Parent Summary Rows');
    expect(markdown).toContain('## Teacher Summary Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report',
    );
    expect(markdown).toContain('learning-session-evidence-gate-ava-a1-day-03');
  });
});
