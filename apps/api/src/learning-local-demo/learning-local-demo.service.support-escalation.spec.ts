import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (support and escalation)', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only teacher intervention remedial assignment support plan report', () => {
    const report =
      service.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:45:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#teacher-intervention-remedial-assignment-support-plan',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.md',
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
        realLearningSessionCompletionMutationUsed: false,
        realParentProgressSummaryMutationUsed: false,
        realTeacherProgressSummaryMutationUsed: false,
        realTeacherInterventionMutationUsed: false,
        realTeacherInterventionReviewMutationUsed: false,
        realRemedialAssignmentMutationUsed: false,
        realSupportPlanMutationUsed: false,
        realParentSupportSummaryMutationUsed: false,
        realTeacherNextActionMutationUsed: false,
        realLearningMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        studentCount: 1,
        teacherCount: 1,
        courseCount: 1,
        needsSupportProgressRollupCount: 1,
        teacherInterventionReviewCount: 1,
        remedialAssignmentCount: 1,
        supportPlanCount: 1,
        parentVisibleSupportSummaryCount: 1,
        teacherVisibleNextActionCount: 1,
        supportReasonCount: 1,
        stableTraceCount: 1,
        interventionLinksCompleteCount: 1,
        supportPlansWithDeterministicStatusCount: 1,
        remedialAssignmentsWithDeterministicStatusCount: 1,
        teacherNextActionsWithSafeLabelCount: 1,
        evidenceRowCount: 8,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.totals.safetyGateCount).toBe(
      Object.keys(report.safety).length,
    );
    expect(report.statusCounts).toEqual({
      interventionReviewStatus: {
        REVIEWED: 1,
      },
      remedialAssignmentStatus: {
        ASSIGNED: 1,
      },
      supportPlanStatus: {
        PARENT_VISIBLE_REVIEW_READY: 1,
      },
      teacherNextActionStatus: {
        SCHEDULED: 1,
      },
    });
  });

  it('links needs-support progress rollups to teacher review support plan and parent summary evidence', () => {
    const report =
      service.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:45:00.000Z',
      );
    const review = report.interventionReviewRows[0];

    expect(review).toEqual(
      expect.objectContaining({
        studentId: 'student-minh',
        teacherId: 'content-owner-teacher-mai',
        courseId: 'course-a1-starter',
        progressRollupId:
          'progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        sourceDailyPlanId: 'plan-minh-a1-day-01',
        sourceSessionId: 'session-a1-001-greetings',
        remedialDailyPlanId: 'plan-minh-a1-day-02',
        remedialPracticeAttemptId: 'practice-minh-a1-day-02',
        sourceAssignmentId: 'assignment-a1-002-colors-quiz',
        reviewStatus: 'REVIEWED',
      }),
    );
    expect(review.supportReason).toContain('33% course completion');
    expect(review.safeNextActionLabel).toContain(
      'Schedule teacher-led remedial practice',
    );
    expect(report.remedialAssignmentRows[0]).toEqual(
      expect.objectContaining({
        remedialAssignmentId: review.remedialAssignmentId,
        status: 'ASSIGNED',
        remedialDailyPlanId: 'plan-minh-a1-day-02',
        remedialLessonCode: 'A1-L02',
      }),
    );
    expect(report.supportPlanRows[0]).toEqual(
      expect.objectContaining({
        supportPlanId: review.supportPlanId,
        status: 'PARENT_VISIBLE_REVIEW_READY',
        parentVisible: true,
        teacherVisible: true,
      }),
    );
    expect(report.parentSummaryRows[0]).toEqual(
      expect.objectContaining({
        parentVisibleSupportSummaryId: review.parentVisibleSupportSummaryId,
        parentGuardianId: 'guardian-minh-parent',
        parentVisible: true,
      }),
    );
    expect(report.teacherNextActionRows[0]).toEqual(
      expect.objectContaining({
        teacherVisibleNextActionId: review.teacherVisibleNextActionId,
        status: 'SCHEDULED',
        teacherVisible: true,
      }),
    );
    expect(
      [
        review.studentId,
        review.courseId,
        review.sourceDailyPlanId,
        review.sourceSessionId,
        review.learningSessionEvidenceId,
        review.progressRollupId,
        review.teacherId,
        review.interventionReviewId,
        review.remedialAssignmentId,
        review.supportPlanId,
        review.parentVisibleSupportSummaryId,
        review.teacherVisibleNextActionId,
      ].every((id) => review.stableTraceKey.includes(id)),
    ).toBe(true);
  });

  it('renders teacher intervention remedial assignment support plan Markdown evidence', () => {
    const report =
      service.buildTeacherInterventionRemedialAssignmentSupportPlanReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:45:00.000Z',
      );
    const markdown =
      service.toTeacherInterventionRemedialAssignmentSupportPlanMarkdown(
        report,
      );

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain(
      'realTeacherInterventionReviewMutationUsed=false',
    );
    expect(markdown).toContain('realRemedialAssignmentMutationUsed=false');
    expect(markdown).toContain('Teacher intervention reviews: 1');
    expect(markdown).toContain('Remedial assignments: 1');
    expect(markdown).toContain('Support plans: 1');
    expect(markdown).toContain('Parent-visible support summaries: 1');
    expect(markdown).toContain('Teacher-visible next actions: 1');
    expect(markdown).toContain('Stable traces: 1');
    expect(markdown).toContain('## Teacher Intervention Review Rows');
    expect(markdown).toContain('## Remedial Assignment Rows');
    expect(markdown).toContain('## Support Plan Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report',
    );
    expect(markdown).toContain('teacher-intervention-review-progress-rollup');
    expect(markdown).toContain('plan-minh-a1-day-02');
  });

  it('builds a fixture-only remedial retry completion support outcome follow-up report', () => {
    const report =
      service.buildRemedialRetryCompletionSupportOutcomeFollowupReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:50:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#remedial-retry-completion-support-outcome-followup-summary',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.md',
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
        realTeacherInterventionReviewMutationUsed: false,
        realRemedialAssignmentMutationUsed: false,
        realSupportPlanMutationUsed: false,
        realRemedialRetryCompletionMutationUsed: false,
        realSupportOutcomeEvidenceMutationUsed: false,
        realParentFollowupSummaryMutationUsed: false,
        realTeacherFollowupSummaryMutationUsed: false,
        realLearningMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        studentCount: 1,
        teacherCount: 1,
        courseCount: 1,
        supportPlanReferenceCount: 1,
        remedialAssignmentReferenceCount: 1,
        remedialRetryCompletionCount: 1,
        supportOutcomeEvidenceCount: 1,
        parentVisibleFollowupSummaryCount: 1,
        teacherVisibleFollowupSummaryCount: 1,
        safeNextActionCount: 1,
        stableTraceCount: 1,
        retryLinksCompleteCount: 1,
        outcomesWithDeterministicStatusCount: 1,
        retriesWithDeterministicStatusScoreCount: 1,
        evidenceRowCount: 8,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.totals.safetyGateCount).toBe(
      Object.keys(report.safety).length,
    );
    expect(report.statusCounts).toEqual({
      retryStatus: {
        COMPLETED: 1,
      },
      supportOutcomeStatus: {
        IMPROVED: 1,
      },
    });
  });

  it('links remedial retry completion to support plan outcome and follow-up summaries', () => {
    const report =
      service.buildRemedialRetryCompletionSupportOutcomeFollowupReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:50:00.000Z',
      );
    const retry = report.retryCompletionRows[0];

    expect(retry).toEqual(
      expect.objectContaining({
        retryCompletionId: 'remedial-retry-completion-minh-colors-2026-06-07',
        studentId: 'student-minh',
        teacherId: 'content-owner-teacher-mai',
        courseId: 'course-a1-starter',
        supportPlanId:
          'support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialAssignmentId:
          'remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialDailyPlanId: 'plan-minh-a1-day-02',
        remedialPracticeAttemptId: 'practice-minh-a1-day-02',
        retryStatus: 'COMPLETED',
        supportOutcomeStatus: 'IMPROVED',
        scorePercent: 82,
        completionPercent: 100,
        parentFollowupSummaryId: 'parent-followup-summary-minh-colors-retry',
        teacherFollowupSummaryId: 'teacher-followup-summary-minh-colors-retry',
      }),
    );
    expect(report.supportOutcomeRows[0]).toEqual(
      expect.objectContaining({
        supportOutcomeId: retry.supportOutcomeId,
        retryCompletionId: retry.retryCompletionId,
        status: 'IMPROVED',
        safeNextActionLabel: retry.safeNextActionLabel,
      }),
    );
    expect(report.parentFollowupSummaryRows[0]).toEqual(
      expect.objectContaining({
        parentFollowupSummaryId: retry.parentFollowupSummaryId,
        parentGuardianId: 'guardian-minh-parent',
        parentVisible: true,
        supportOutcomeStatus: 'IMPROVED',
      }),
    );
    expect(report.teacherFollowupSummaryRows[0]).toEqual(
      expect.objectContaining({
        teacherFollowupSummaryId: retry.teacherFollowupSummaryId,
        teacherVisible: true,
        supportOutcomeStatus: 'IMPROVED',
      }),
    );
    expect(
      [
        retry.studentId,
        retry.courseId,
        retry.progressRollupId,
        retry.interventionReviewId,
        retry.supportPlanId,
        retry.remedialAssignmentId,
        retry.remedialDailyPlanId,
        retry.remedialPracticeAttemptId,
        retry.retryCompletionId,
        retry.supportOutcomeId,
        retry.parentFollowupSummaryId,
        retry.teacherFollowupSummaryId,
      ].every((id) => retry.stableTraceKey.includes(id)),
    ).toBe(true);
  });

  it('renders remedial retry completion support outcome follow-up Markdown evidence', () => {
    const report =
      service.buildRemedialRetryCompletionSupportOutcomeFollowupReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T04:50:00.000Z',
      );
    const markdown =
      service.toRemedialRetryCompletionSupportOutcomeFollowupMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('realRemedialRetryCompletionMutationUsed=false');
    expect(markdown).toContain('realSupportOutcomeEvidenceMutationUsed=false');
    expect(markdown).toContain('Remedial retry completions: 1');
    expect(markdown).toContain('Support outcome evidence rows: 1');
    expect(markdown).toContain('Parent-visible follow-up summaries: 1');
    expect(markdown).toContain('Teacher-visible follow-up summaries: 1');
    expect(markdown).toContain('Stable traces: 1');
    expect(markdown).toContain('## Retry Completion Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report',
    );
    expect(markdown).toContain(
      'remedial-retry-completion-minh-colors-2026-06-07',
    );
    expect(markdown).toContain('support-outcome-minh-colors-retry-improved');
  });

  it('builds a fixture-only remedial retry unresolved support escalation report', () => {
    const report = service.buildRemedialRetryUnresolvedSupportEscalationReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:55:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#remedial-retry-unresolved-support-escalation',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.md',
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
        realTeacherInterventionReviewMutationUsed: false,
        realRemedialAssignmentMutationUsed: false,
        realSupportPlanMutationUsed: false,
        realRemedialRetryUnresolvedAttemptMutationUsed: false,
        realUnresolvedSupportOutcomeMutationUsed: false,
        realTeacherEscalationMutationUsed: false,
        realSupportAdjustmentMutationUsed: false,
        realParentEscalationSummaryMutationUsed: false,
        realTeacherEscalationNextActionMutationUsed: false,
        realLearningMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        studentCount: 1,
        teacherCount: 1,
        courseCount: 1,
        supportPlanReferenceCount: 1,
        remedialAssignmentReferenceCount: 1,
        remedialRetryAttemptCount: 1,
        failedOrIncompleteRetryCount: 1,
        unresolvedSupportOutcomeCount: 1,
        teacherEscalationCount: 1,
        supportAdjustmentCount: 1,
        parentVisibleEscalationSummaryCount: 1,
        teacherVisibleEscalationNextActionCount: 1,
        safeNextActionCount: 1,
        stableTraceCount: 1,
        unresolvedRetryLinksCompleteCount: 1,
        outcomesWithDeterministicStatusReasonActionCount: 1,
        attemptsWithDeterministicStatusScoreCount: 1,
        evidenceRowCount: 9,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.totals.safetyGateCount).toBe(
      Object.keys(report.safety).length,
    );
    expect(report.statusCounts).toEqual({
      retryStatus: {
        FAILED: 0,
        INCOMPLETE: 1,
      },
      unresolvedOutcomeStatus: {
        UNRESOLVED: 1,
      },
      reasonCode: {
        RETRY_SCORE_BELOW_THRESHOLD: 0,
        RETRY_INCOMPLETE: 1,
      },
      teacherEscalationStatus: {
        SCHEDULED: 1,
      },
      supportAdjustmentStatus: {
        ADJUSTED: 1,
      },
    });
  });

  it('links unresolved retry attempts to support outcome escalation and next actions', () => {
    const report = service.buildRemedialRetryUnresolvedSupportEscalationReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:55:00.000Z',
    );
    const retry = report.retryAttemptRows[0];

    expect(retry).toEqual(
      expect.objectContaining({
        retryAttemptId: 'remedial-retry-unresolved-minh-colors-2026-06-08',
        studentId: 'student-minh',
        teacherId: 'content-owner-teacher-mai',
        courseId: 'course-a1-starter',
        supportPlanId:
          'support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialAssignmentId:
          'remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialDailyPlanId: 'plan-minh-a1-day-02',
        remedialPracticeAttemptId: 'practice-minh-a1-day-02',
        retryStatus: 'INCOMPLETE',
        unresolvedOutcomeStatus: 'UNRESOLVED',
        reasonCode: 'RETRY_INCOMPLETE',
        scorePercent: 58,
        completionPercent: 45,
        teacherEscalationId: 'teacher-escalation-minh-colors-retry',
        supportAdjustmentId: 'support-adjustment-minh-colors-retry',
        parentEscalationSummaryId:
          'parent-escalation-summary-minh-colors-retry',
        teacherEscalationNextActionId:
          'teacher-escalation-next-action-minh-colors-retry',
      }),
    );
    expect(report.unresolvedOutcomeRows[0]).toEqual(
      expect.objectContaining({
        unresolvedOutcomeId: retry.unresolvedOutcomeId,
        retryAttemptId: retry.retryAttemptId,
        status: 'UNRESOLVED',
        reasonCode: 'RETRY_INCOMPLETE',
        safeNextActionLabel: retry.safeNextActionLabel,
      }),
    );
    expect(report.teacherEscalationRows[0]).toEqual(
      expect.objectContaining({
        teacherEscalationId: retry.teacherEscalationId,
        supportAdjustmentId: retry.supportAdjustmentId,
        escalationStatus: 'SCHEDULED',
        supportAdjustmentStatus: 'ADJUSTED',
      }),
    );
    expect(report.parentEscalationSummaryRows[0]).toEqual(
      expect.objectContaining({
        parentEscalationSummaryId: retry.parentEscalationSummaryId,
        parentGuardianId: 'guardian-minh-parent',
        parentVisible: true,
        unresolvedOutcomeStatus: 'UNRESOLVED',
      }),
    );
    expect(report.teacherEscalationNextActionRows[0]).toEqual(
      expect.objectContaining({
        teacherEscalationNextActionId: retry.teacherEscalationNextActionId,
        teacherVisible: true,
        unresolvedOutcomeStatus: 'UNRESOLVED',
      }),
    );
    expect(
      [
        retry.studentId,
        retry.courseId,
        retry.progressRollupId,
        retry.interventionReviewId,
        retry.supportPlanId,
        retry.remedialAssignmentId,
        retry.remedialDailyPlanId,
        retry.remedialPracticeAttemptId,
        retry.retryAttemptId,
        retry.unresolvedOutcomeId,
        retry.teacherEscalationId,
        retry.supportAdjustmentId,
        retry.parentEscalationSummaryId,
        retry.teacherEscalationNextActionId,
      ].every((id) => retry.stableTraceKey.includes(id)),
    ).toBe(true);
  });

  it('renders remedial retry unresolved support escalation Markdown evidence', () => {
    const report = service.buildRemedialRetryUnresolvedSupportEscalationReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:55:00.000Z',
    );
    const markdown =
      service.toRemedialRetryUnresolvedSupportEscalationMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain(
      'realRemedialRetryUnresolvedAttemptMutationUsed=false',
    );
    expect(markdown).toContain(
      'realUnresolvedSupportOutcomeMutationUsed=false',
    );
    expect(markdown).toContain('realTeacherEscalationMutationUsed=false');
    expect(markdown).toContain('Remedial retry attempts: 1');
    expect(markdown).toContain('Failed or incomplete retries: 1');
    expect(markdown).toContain('Unresolved support outcomes: 1');
    expect(markdown).toContain('Parent-visible escalation summaries: 1');
    expect(markdown).toContain('Teacher-visible escalation next actions: 1');
    expect(markdown).toContain('Stable traces: 1');
    expect(markdown).toContain('## Retry Attempt Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report',
    );
    expect(markdown).toContain(
      'remedial-retry-unresolved-minh-colors-2026-06-08',
    );
    expect(markdown).toContain('RETRY_INCOMPLETE');
  });

  it('builds a fixture-only teacher escalation follow-up resolution report', () => {
    const report = service.buildTeacherEscalationFollowupResolutionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:58:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/teacher-escalation-followup-resolution-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#teacher-escalation-followup-resolution',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-teacher-escalation-followup-resolution-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-teacher-escalation-followup-resolution-report.md',
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
        realRemedialRetryUnresolvedAttemptMutationUsed: false,
        realUnresolvedSupportOutcomeMutationUsed: false,
        realTeacherEscalationMutationUsed: false,
        realSupportAdjustmentMutationUsed: false,
        realTeacherReviewedEscalationMutationUsed: false,
        realAdjustedSupportRetryCompletionMutationUsed: false,
        realResolvedSupportOutcomeMutationUsed: false,
        realParentClosureSummaryMutationUsed: false,
        realTeacherClosureNoteMutationUsed: false,
        realLearningMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        studentCount: 1,
        teacherCount: 1,
        courseCount: 1,
        unresolvedEscalationReferenceCount: 1,
        teacherReviewedEscalationCount: 1,
        adjustedSupportRetryCompletionCount: 1,
        resolvedSupportOutcomeCount: 1,
        parentVisibleClosureSummaryCount: 1,
        teacherVisibleClosureNoteCount: 1,
        safeNextActionCount: 1,
        stableTraceCount: 1,
        resolvedFlowLinksCompleteCount: 1,
        outcomesWithDeterministicStatusReasonActionCount: 1,
        adjustedRetriesWithDeterministicStatusScoreCount: 1,
        evidenceRowCount: 9,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.totals.safetyGateCount).toBe(
      Object.keys(report.safety).length,
    );
    expect(report.statusCounts).toEqual({
      teacherReviewedEscalationStatus: {
        REVIEWED: 1,
      },
      adjustedSupportRetryStatus: {
        COMPLETED: 1,
      },
      resolvedOutcomeStatus: {
        RESOLVED: 1,
      },
      resolvedOutcomeReasonCode: {
        ADJUSTED_RETRY_COMPLETED: 1,
      },
    });
  });

  it('links teacher-reviewed escalation follow-up resolution to closure evidence', () => {
    const report = service.buildTeacherEscalationFollowupResolutionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:58:00.000Z',
    );
    const resolution = report.resolutionRows[0];

    expect(resolution).toEqual(
      expect.objectContaining({
        resolutionId:
          'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
        studentId: 'student-minh',
        teacherId: 'content-owner-teacher-mai',
        courseId: 'course-a1-starter',
        supportPlanId:
          'support-plan-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialAssignmentId:
          'remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialDailyPlanId: 'plan-minh-a1-day-02',
        remedialPracticeAttemptId: 'practice-minh-a1-day-02',
        unresolvedRetryAttemptId:
          'remedial-retry-unresolved-minh-colors-2026-06-08',
        unresolvedOutcomeId: 'unresolved-support-outcome-minh-colors-retry',
        teacherEscalationId: 'teacher-escalation-minh-colors-retry',
        supportAdjustmentId: 'support-adjustment-minh-colors-retry',
        teacherReviewedEscalationId:
          'teacher-reviewed-escalation-minh-colors-retry',
        adjustedSupportRetryCompletionId:
          'adjusted-support-retry-completion-minh-colors-2026-06-09',
        adjustedSupportRetryStatus: 'COMPLETED',
        resolvedSupportOutcomeId:
          'resolved-support-outcome-minh-colors-adjusted-retry',
        resolvedSupportOutcomeStatus: 'RESOLVED',
        resolvedOutcomeReasonCode: 'ADJUSTED_RETRY_COMPLETED',
        parentClosureSummaryId:
          'parent-closure-summary-minh-colors-adjusted-retry',
        teacherClosureNoteId: 'teacher-closure-note-minh-colors-adjusted-retry',
        scorePercent: 88,
        completionPercent: 100,
      }),
    );
    expect(report.teacherReviewedEscalationRows[0]).toEqual(
      expect.objectContaining({
        teacherReviewedEscalationId: resolution.teacherReviewedEscalationId,
        reviewStatus: 'REVIEWED',
        teacherVisible: true,
      }),
    );
    expect(report.adjustedSupportRetryCompletionRows[0]).toEqual(
      expect.objectContaining({
        adjustedSupportRetryCompletionId:
          resolution.adjustedSupportRetryCompletionId,
        retryStatus: 'COMPLETED',
        resolvedSupportOutcomeId: resolution.resolvedSupportOutcomeId,
      }),
    );
    expect(report.resolvedSupportOutcomeRows[0]).toEqual(
      expect.objectContaining({
        resolvedSupportOutcomeId: resolution.resolvedSupportOutcomeId,
        status: 'RESOLVED',
        reasonCode: 'ADJUSTED_RETRY_COMPLETED',
        safeNextActionLabel: resolution.safeNextActionLabel,
      }),
    );
    expect(report.parentClosureSummaryRows[0]).toEqual(
      expect.objectContaining({
        parentClosureSummaryId: resolution.parentClosureSummaryId,
        parentGuardianId: 'guardian-minh-parent',
        parentVisible: true,
        resolvedOutcomeStatus: 'RESOLVED',
      }),
    );
    expect(report.teacherClosureNoteRows[0]).toEqual(
      expect.objectContaining({
        teacherClosureNoteId: resolution.teacherClosureNoteId,
        teacherVisible: true,
        resolvedOutcomeStatus: 'RESOLVED',
      }),
    );
    expect(
      [
        resolution.studentId,
        resolution.courseId,
        resolution.progressRollupId,
        resolution.interventionReviewId,
        resolution.supportPlanId,
        resolution.remedialAssignmentId,
        resolution.remedialDailyPlanId,
        resolution.remedialPracticeAttemptId,
        resolution.unresolvedRetryAttemptId,
        resolution.unresolvedOutcomeId,
        resolution.teacherEscalationId,
        resolution.supportAdjustmentId,
        resolution.teacherReviewedEscalationId,
        resolution.adjustedSupportRetryCompletionId,
        resolution.resolvedSupportOutcomeId,
        resolution.parentClosureSummaryId,
        resolution.teacherClosureNoteId,
      ].every((id) => resolution.stableTraceKey.includes(id)),
    ).toBe(true);
  });

  it('renders teacher escalation follow-up resolution Markdown evidence', () => {
    const report = service.buildTeacherEscalationFollowupResolutionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:58:00.000Z',
    );
    const markdown =
      service.toTeacherEscalationFollowupResolutionMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain(
      'realTeacherReviewedEscalationMutationUsed=false',
    );
    expect(markdown).toContain(
      'realAdjustedSupportRetryCompletionMutationUsed=false',
    );
    expect(markdown).toContain('realResolvedSupportOutcomeMutationUsed=false');
    expect(markdown).toContain('Teacher-reviewed escalations: 1');
    expect(markdown).toContain('Adjusted support retry completions: 1');
    expect(markdown).toContain('Resolved support outcomes: 1');
    expect(markdown).toContain('Parent-visible closure summaries: 1');
    expect(markdown).toContain('Teacher-visible closure notes: 1');
    expect(markdown).toContain('Stable traces: 1');
    expect(markdown).toContain('## Resolution Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/teacher-escalation-followup-resolution-report',
    );
    expect(markdown).toContain(
      'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
    );
    expect(markdown).toContain('ADJUSTED_RETRY_COMPLETED');
  });
});
