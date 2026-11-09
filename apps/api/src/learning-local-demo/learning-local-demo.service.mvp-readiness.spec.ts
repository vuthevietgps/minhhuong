import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (MVP readiness)', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only MVP readiness overview report', () => {
    const report = service.buildMvpReadinessOverviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T10:00:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      aiProviderExecutionUsed: false,
      certificateIssuerProviderUsed: false,
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
      realAiChatMutationUsed: false,
      realAiModerationMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realAchievementMutationUsed: false,
      realBadgeMutationUsed: false,
      realCertificateMutationUsed: false,
      realCredentialIssuanceUsed: false,
      realRecognitionNotificationMutationUsed: false,
      realParentSummaryMutationUsed: false,
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realWeeklyDigestNotificationMutationUsed: false,
      realFollowUpActionOutcomeMutationUsed: false,
      realLearningSessionCompletionMutationUsed: false,
      realParentProgressSummaryMutationUsed: false,
      realTeacherProgressSummaryMutationUsed: false,
      realTeacherInterventionReviewMutationUsed: false,
      realRemedialAssignmentMutationUsed: false,
      realSupportPlanMutationUsed: false,
      realParentSupportSummaryMutationUsed: false,
      realTeacherNextActionMutationUsed: false,
      realRemedialRetryCompletionMutationUsed: false,
      realSupportOutcomeEvidenceMutationUsed: false,
      realParentFollowupSummaryMutationUsed: false,
      realTeacherFollowupSummaryMutationUsed: false,
      realRemedialRetryUnresolvedAttemptMutationUsed: false,
      realUnresolvedSupportOutcomeMutationUsed: false,
      realTeacherEscalationMutationUsed: false,
      realSupportAdjustmentMutationUsed: false,
      realParentEscalationSummaryMutationUsed: false,
      realTeacherEscalationNextActionMutationUsed: false,
      realTeacherReviewedEscalationMutationUsed: false,
      realAdjustedSupportRetryCompletionMutationUsed: false,
      realResolvedSupportOutcomeMutationUsed: false,
      realParentClosureSummaryMutationUsed: false,
      realTeacherClosureNoteMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      sliceCount: 20,
      localDemoReadySliceCount: 19,
      localDemoReadyWithNotesSliceCount: 1,
      needsLocalDemoFixSliceCount: 0,
      productionReadySliceCount: 0,
      fixtureOnlySliceCount: 20,
      safetyClosedSliceCount: 20,
      evidenceEndpointCount: 18,
      jsonExportCount: 18,
      markdownExportCount: 18,
      readinessScorePercent: 100,
      safetyGateCount: 65,
      closedSafetyGateCount: 65,
      openSafetyGateCount: 0,
      studentCount: 4,
      courseCount: 2,
      enrollmentCount: 4,
      activeEnrollmentCount: 2,
      subscriptionCount: 4,
      refundCount: 1,
      commissionCount: 4,
      dailyPlanCount: 10,
      completedDailyPlanCount: 6,
      lessonCount: 5,
      assignmentCount: 6,
      progressRecordCount: 4,
      needsSupportLearnerCount: 1,
      aiTutorChatSessionCount: 4,
      aiTutorSafetyFlagCount: 4,
      achievementRecordCount: 6,
      badgeAwardCount: 4,
      teacherInterventionReviewCount: 1,
      remedialAssignmentCount: 1,
      supportPlanCount: 1,
      remedialRetryCompletionCount: 1,
      supportOutcomeEvidenceCount: 1,
      remedialRetryUnresolvedAttemptCount: 1,
      unresolvedSupportOutcomeCount: 1,
      teacherEscalationCount: 1,
      parentVisibleEscalationSummaryCount: 1,
      teacherVisibleEscalationNextActionCount: 1,
      teacherReviewedEscalationCount: 1,
      adjustedSupportRetryCompletionCount: 1,
      resolvedSupportOutcomeCount: 1,
      parentVisibleClosureSummaryCount: 1,
      teacherVisibleClosureNoteCount: 1,
      stableEndToEndTraceCount: 1,
      weeklyDigestCount: 5,
      weeklyDigestActionCount: 6,
      followUpOutcomeCount: 6,
    });
    expect(report.statusCounts).toEqual({
      readinessStatus: {
        LOCAL_DEMO_READY: 19,
        LOCAL_DEMO_READY_WITH_NOTES: 1,
        NEEDS_LOCAL_DEMO_FIX: 0,
      },
    });
  });

  it('rolls accepted local-demo slices into MVP readiness rows', () => {
    const report = service.buildMvpReadinessOverviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T10:00:00.000Z',
    );

    expect(report.rows.map((row) => row.sliceKey)).toEqual([
      'ENROLLMENT',
      'SUBSCRIPTION_FIXTURE',
      'REFUNDS_COMMISSION_FIXTURE',
      'DAILY_PLAN',
      'LESSON_ASSIGNMENT',
      'PROGRESS',
      'REPORT_REVIEW_PREVIEW',
      'PARENT_PORTAL_INBOX_READ_RECEIPT',
      'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD',
      'SESSION_COMPLETION_PRACTICE_ROLLUP',
      'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN',
      'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP',
      'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION',
      'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION',
      'MVP_END_TO_END_READINESS_TRACE',
      'MVP_ROLE_JOURNEY_ENTRYPOINTS',
      'AI_TUTOR_EVIDENCE',
      'ACHIEVEMENTS',
      'WEEKLY_DIGEST',
      'FOLLOW_UP_OUTCOMES',
    ]);

    const refunds = report.rows.find(
      (row) => row.sliceKey === 'REFUNDS_COMMISSION_FIXTURE',
    );
    const aiTutor = report.rows.find(
      (row) => row.sliceKey === 'AI_TUTOR_EVIDENCE',
    );
    const reportReviewPreview = report.rows.find(
      (row) => row.sliceKey === 'REPORT_REVIEW_PREVIEW',
    );
    const parentPortalInbox = report.rows.find(
      (row) => row.sliceKey === 'PARENT_PORTAL_INBOX_READ_RECEIPT',
    );
    const parentScreenTimeGuard = report.rows.find(
      (row) => row.sliceKey === 'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD',
    );
    const sessionCompletionRollup = report.rows.find(
      (row) => row.sliceKey === 'SESSION_COMPLETION_PRACTICE_ROLLUP',
    );
    const teacherInterventionSupportPlan = report.rows.find(
      (row) => row.sliceKey === 'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN',
    );
    const remedialRetryCompletion = report.rows.find(
      (row) =>
        row.sliceKey === 'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP',
    );
    const remedialRetryUnresolvedEscalation = report.rows.find(
      (row) => row.sliceKey === 'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION',
    );
    const teacherEscalationFollowupResolution = report.rows.find(
      (row) => row.sliceKey === 'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION',
    );
    const mvpEndToEndReadinessTrace = report.rows.find(
      (row) => row.sliceKey === 'MVP_END_TO_END_READINESS_TRACE',
    );
    const mvpRoleJourneyEntrypoints = report.rows.find(
      (row) => row.sliceKey === 'MVP_ROLE_JOURNEY_ENTRYPOINTS',
    );
    const followUp = report.rows.find(
      (row) => row.sliceKey === 'FOLLOW_UP_OUTCOMES',
    );

    expect(refunds).toEqual(
      expect.objectContaining({
        readinessStatus: 'LOCAL_DEMO_READY',
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: true,
        primaryMetricLabel: 'Commission rows',
        primaryMetricValue: 4,
        secondaryMetricLabel: 'Refund rows',
        secondaryMetricValue: 1,
        sourceEndpointPath:
          '/v1/learning-local-demo/student-course-enrollment-subscription-report',
      }),
    );
    expect(aiTutor).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/ai-tutor-chat-safety-teacher-review-report',
        primaryMetricValue: 4,
        secondaryMetricValue: 4,
        coverageValue: 4,
      }),
    );
    expect(reportReviewPreview).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
        primaryMetricValue: 2,
        secondaryMetricValue: 1,
        coverageValue: 1,
      }),
    );
    expect(parentPortalInbox).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
        primaryMetricValue: 3,
        secondaryMetricValue: 2,
        coverageValue: 1,
      }),
    );
    expect(parentScreenTimeGuard).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report',
        primaryMetricValue: 10,
        secondaryMetricValue: 4,
        coverageValue: 10,
      }),
    );
    expect(sessionCompletionRollup).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report',
        primaryMetricValue: 6,
        secondaryMetricValue: 6,
        coverageValue: 6,
      }),
    );
    expect(teacherInterventionSupportPlan).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report',
        primaryMetricValue: 1,
        secondaryMetricValue: 1,
        coverageValue: 1,
      }),
    );
    expect(remedialRetryCompletion).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report',
        primaryMetricValue: 1,
        secondaryMetricValue: 1,
        coverageValue: 1,
      }),
    );
    expect(remedialRetryUnresolvedEscalation).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report',
        primaryMetricValue: 1,
        secondaryMetricValue: 1,
        coverageValue: 1,
      }),
    );
    expect(teacherEscalationFollowupResolution).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/teacher-escalation-followup-resolution-report',
        primaryMetricValue: 1,
        secondaryMetricValue: 1,
        coverageValue: 1,
      }),
    );
    expect(mvpEndToEndReadinessTrace).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report',
        primaryMetricValue: 1,
        secondaryMetricValue: 1,
        coverageValue: expect.any(Number),
      }),
    );
    expect(mvpRoleJourneyEntrypoints).toEqual(
      expect.objectContaining({
        readinessStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
        sourceEndpointPath:
          '/v1/learning-local-demo/mvp-role-journey-entrypoints-report',
        primaryMetricValue: 4,
        secondaryMetricValue: 1,
        coverageValue: 4,
      }),
    );
    expect(followUp).toEqual(
      expect.objectContaining({
        sourceEndpointPath:
          '/v1/learning-local-demo/followup-action-outcome-report',
        primaryMetricValue: 6,
        secondaryMetricValue: 2,
        coverageValue: 4,
      }),
    );
  });

  it('renders MVP readiness overview Markdown evidence', () => {
    const report = service.buildMvpReadinessOverviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T10:00:00.000Z',
    );
    const markdown = service.toMvpReadinessOverviewMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('MVP readiness slices: 20');
    expect(markdown).toContain('Safety gates closed: 65/65');
    expect(markdown).toContain('## MVP Readiness Rows');
    expect(markdown).toContain('Report review queue and message preview');
    expect(markdown).toContain('Parent portal inbox and read receipt');
    expect(markdown).toContain('Parent screen-time daily plan guard');
    expect(markdown).toContain('Learning session completion practice rollup');
    expect(markdown).toContain('Teacher intervention remedial support plan');
    expect(markdown).toContain(
      'Remedial retry completion support outcome follow-up',
    );
    expect(markdown).toContain('Remedial retry unresolved support escalation');
    expect(markdown).toContain('Teacher escalation follow-up resolution');
    expect(markdown).toContain('MVP role journey entrypoints');
    expect(markdown).toContain('AI tutor safety evidence');
    expect(markdown).toContain(
      '/v1/learning-local-demo/mvp-readiness-overview-report',
    );
  });

  it('maps every MVP readiness slice to an acceptance criterion', () => {
    const report = service.buildAcceptanceTraceabilityGateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T11:00:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.totals).toEqual({
      sliceCount: 20,
      acceptanceCriterionCount: 20,
      mappedCriterionCount: 20,
      slicesWithMappingCount: 20,
      slicesMissingMappingCount: 0,
      productionReadyClaimCount: 0,
      fixtureOnlyCriterionCount: 20,
      safetyClosedCriterionCount: 20,
      evidenceEndpointCount: 18,
      jsonExportCount: 18,
      markdownExportCount: 18,
      dashboardEvidenceCount: 3,
      seedCommandCount: 1,
      reportCommandCount: 1,
      testCommandCount: 1,
      safetyGateCount: 65,
      closedSafetyGateCount: 65,
      openSafetyGateCount: 0,
    });
    expect(report.statusCounts).toEqual({
      acceptanceStatus: {
        MAPPED_LOCAL_DEMO: 20,
        NEEDS_LOCAL_DEMO_EVIDENCE: 0,
      },
    });
    expect(report.rows.map((row) => row.sliceKey)).toEqual([
      'ENROLLMENT',
      'SUBSCRIPTION_FIXTURE',
      'REFUNDS_COMMISSION_FIXTURE',
      'DAILY_PLAN',
      'LESSON_ASSIGNMENT',
      'PROGRESS',
      'REPORT_REVIEW_PREVIEW',
      'PARENT_PORTAL_INBOX_READ_RECEIPT',
      'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD',
      'SESSION_COMPLETION_PRACTICE_ROLLUP',
      'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN',
      'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP',
      'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION',
      'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION',
      'MVP_END_TO_END_READINESS_TRACE',
      'MVP_ROLE_JOURNEY_ENTRYPOINTS',
      'AI_TUTOR_EVIDENCE',
      'ACHIEVEMENTS',
      'WEEKLY_DIGEST',
      'FOLLOW_UP_OUTCOMES',
    ]);
    expect(report.rows.map((row) => row.acceptanceCriterionId)).toEqual([
      'LC-AC-001',
      'LC-AC-002',
      'LC-AC-003',
      'LC-AC-004',
      'LC-AC-005',
      'LC-AC-006',
      'LC-AC-007',
      'LC-AC-012',
      'LC-AC-013',
      'LC-AC-014',
      'LC-AC-015',
      'LC-AC-016',
      'LC-AC-017',
      'LC-AC-018',
      'LC-AC-019',
      'LC-AC-020',
      'LC-AC-008',
      'LC-AC-009',
      'LC-AC-010',
      'LC-AC-011',
    ]);
    for (const row of report.rows) {
      expect(row.acceptanceStatus).toBe('MAPPED_LOCAL_DEMO');
      expect(row.readinessStatus).toBe(
        row.sliceKey === 'MVP_ROLE_JOURNEY_ENTRYPOINTS'
          ? 'LOCAL_DEMO_READY_WITH_NOTES'
          : 'LOCAL_DEMO_READY',
      );
      expect(row.productionReady).toBe(false);
      expect(row.fixtureOnly).toBe(true);
      expect(row.safetyClosed).toBe(true);
      expect(row.evidenceEndpointPath).toMatch(/^\/v1\/learning-local-demo\//);
      expect(row.jsonExportPath).toMatch(/^exports\/learning-local-demo-/);
      expect(row.markdownExportPath).toMatch(/^exports\/learning-local-demo-/);
      expect(row.dashboardEvidencePath).toBe(
        row.sliceKey === 'MVP_END_TO_END_READINESS_TRACE'
          ? '/admin/learning-local-demo#mvp-end-to-end-readiness-trace'
          : row.sliceKey === 'MVP_ROLE_JOURNEY_ENTRYPOINTS'
            ? '/admin/learning-local-demo#mvp-role-journey-entrypoints'
            : '/admin/learning-local-demo#mvp-readiness-overview',
      );
      expect(row.seedCommand).toBe('npm run seed:demo');
      expect(row.reportCommand).toBe('npm run report:demo');
      expect(row.testCommand).toBe('npm run test:learning-local');
      expect(row.safetyGatesCovered.length).toBeGreaterThanOrEqual(4);
      expect(row.remainingLocalDemoNote).toContain('out of scope');
    }
  });

  it('keeps acceptance traceability safety gates closed', () => {
    const report = service.buildAcceptanceTraceabilityGateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T11:00:00.000Z',
    );

    expect(report.safety.fixtureOnly).toBe(true);
    expect(report.safety.productionDbUsed).toBe(false);
    expect(report.safety.noProductionDbRead).toBe(true);
    expect(report.safety.providerApiUsed).toBe(false);
    expect(report.safety.paymentProviderUsed).toBe(false);
    expect(report.safety.aiProviderExecutionUsed).toBe(false);
    expect(report.safety.notificationProviderUsed).toBe(false);
    expect(report.safety.realStudentMutationUsed).toBe(false);
    expect(report.safety.realCourseMutationUsed).toBe(false);
    expect(report.safety.realEnrollmentMutationUsed).toBe(false);
    expect(report.safety.realProgressMutationUsed).toBe(false);
    expect(report.safety.realLearningPathMutationUsed).toBe(false);
    expect(report.safety.realDailyPlanMutationUsed).toBe(false);
    expect(report.safety.realLearningSessionCompletionMutationUsed).toBe(false);
    expect(report.safety.realParentProgressSummaryMutationUsed).toBe(false);
    expect(report.safety.realTeacherProgressSummaryMutationUsed).toBe(false);
    expect(report.safety.realTeacherInterventionReviewMutationUsed).toBe(false);
    expect(report.safety.realRemedialAssignmentMutationUsed).toBe(false);
    expect(report.safety.realSupportPlanMutationUsed).toBe(false);
    expect(report.safety.realParentSupportSummaryMutationUsed).toBe(false);
    expect(report.safety.realTeacherNextActionMutationUsed).toBe(false);
    expect(report.safety.realRemedialRetryCompletionMutationUsed).toBe(false);
    expect(report.safety.realSupportOutcomeEvidenceMutationUsed).toBe(false);
    expect(report.safety.realParentFollowupSummaryMutationUsed).toBe(false);
    expect(report.safety.realTeacherFollowupSummaryMutationUsed).toBe(false);
    expect(report.safety.realRemedialRetryUnresolvedAttemptMutationUsed).toBe(
      false,
    );
    expect(report.safety.realUnresolvedSupportOutcomeMutationUsed).toBe(false);
    expect(report.safety.realTeacherEscalationMutationUsed).toBe(false);
    expect(report.safety.realSupportAdjustmentMutationUsed).toBe(false);
    expect(report.safety.realParentEscalationSummaryMutationUsed).toBe(false);
    expect(report.safety.realTeacherEscalationNextActionMutationUsed).toBe(
      false,
    );
    expect(report.safety.realTeacherReviewedEscalationMutationUsed).toBe(false);
    expect(report.safety.realAdjustedSupportRetryCompletionMutationUsed).toBe(
      false,
    );
    expect(report.safety.realResolvedSupportOutcomeMutationUsed).toBe(false);
    expect(report.safety.realParentClosureSummaryMutationUsed).toBe(false);
    expect(report.safety.realTeacherClosureNoteMutationUsed).toBe(false);
    expect(report.safety.realAiChatMutationUsed).toBe(false);
    expect(report.safety.realPaymentMutationUsed).toBe(false);
    expect(report.safety.realRefundMutationUsed).toBe(false);
    expect(report.safety.realCommissionMutationUsed).toBe(false);
    expect(report.safety.realErpMutationUsed).toBe(false);
    expect(report.totals.productionReadyClaimCount).toBe(0);
    expect(report.rows).toHaveLength(20);
    expect(report.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sliceKey: 'REPORT_REVIEW_PREVIEW',
          safetyGatesCovered: expect.arrayContaining([
            'aiProviderExecutionUsed=false',
            'notificationProviderUsed=false',
            'realParentMessageMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'PARENT_PORTAL_INBOX_READ_RECEIPT',
          safetyGatesCovered: expect.arrayContaining([
            'notificationProviderUsed=false',
            'realParentMessageMutationUsed=false',
            'realLearningMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD',
          safetyGatesCovered: expect.arrayContaining([
            'realScreenTimePolicyMutationUsed=false',
            'realLearningSessionGateMutationUsed=false',
            'realScreenTimeGrantMutationUsed=false',
            'realDailyPlanAccessMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'SESSION_COMPLETION_PRACTICE_ROLLUP',
          safetyGatesCovered: expect.arrayContaining([
            'realLearningSessionCompletionMutationUsed=false',
            'realParentProgressSummaryMutationUsed=false',
            'realTeacherProgressSummaryMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN',
          safetyGatesCovered: expect.arrayContaining([
            'realTeacherInterventionReviewMutationUsed=false',
            'realRemedialAssignmentMutationUsed=false',
            'realSupportPlanMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP',
          safetyGatesCovered: expect.arrayContaining([
            'realRemedialRetryCompletionMutationUsed=false',
            'realSupportOutcomeEvidenceMutationUsed=false',
            'realParentFollowupSummaryMutationUsed=false',
            'realTeacherFollowupSummaryMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION',
          safetyGatesCovered: expect.arrayContaining([
            'realRemedialRetryUnresolvedAttemptMutationUsed=false',
            'realUnresolvedSupportOutcomeMutationUsed=false',
            'realTeacherEscalationMutationUsed=false',
            'realSupportAdjustmentMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION',
          safetyGatesCovered: expect.arrayContaining([
            'realTeacherReviewedEscalationMutationUsed=false',
            'realAdjustedSupportRetryCompletionMutationUsed=false',
            'realResolvedSupportOutcomeMutationUsed=false',
            'realParentClosureSummaryMutationUsed=false',
            'realTeacherClosureNoteMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'MVP_ROLE_JOURNEY_ENTRYPOINTS',
          safetyGatesCovered: expect.arrayContaining([
            'productionReady=false',
            'notificationProviderUsed=false',
            'realLearningMutationUsed=false',
            'realParentMessageMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'AI_TUTOR_EVIDENCE',
          safetyGatesCovered: expect.arrayContaining([
            'aiProviderExecutionUsed=false',
            'realAiChatMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'REFUNDS_COMMISSION_FIXTURE',
          safetyGatesCovered: expect.arrayContaining([
            'paymentProviderUsed=false',
            'realRefundMutationUsed=false',
            'realCommissionMutationUsed=false',
          ]),
        }),
        expect.objectContaining({
          sliceKey: 'FOLLOW_UP_OUTCOMES',
          safetyGatesCovered: expect.arrayContaining([
            'realFollowUpActionOutcomeMutationUsed=false',
            'notificationProviderUsed=false',
          ]),
        }),
      ]),
    );
  });

  it('renders acceptance traceability Markdown evidence', () => {
    const report = service.buildAcceptanceTraceabilityGateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T11:00:00.000Z',
    );
    const markdown = service.toAcceptanceTraceabilityGateMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Acceptance criteria: 20');
    expect(markdown).toContain('Mapped criteria: 20');
    expect(markdown).toContain('Open safety gates: 0');
    expect(markdown).toContain('## Acceptance Traceability Rows');
    expect(markdown).toContain('LC-AC-007');
    expect(markdown).toContain('LC-AC-012');
    expect(markdown).toContain('LC-AC-013');
    expect(markdown).toContain('LC-AC-014');
    expect(markdown).toContain('LC-AC-015');
    expect(markdown).toContain('LC-AC-016');
    expect(markdown).toContain('LC-AC-017');
    expect(markdown).toContain('LC-AC-018');
    expect(markdown).toContain('LC-AC-019');
    expect(markdown).toContain('LC-AC-020');
    expect(markdown).toContain(
      '/v1/learning-local-demo/acceptance-traceability-gate-report',
    );
    expect(markdown).toContain(
      '/admin/learning-local-demo#mvp-readiness-overview',
    );
    expect(markdown).toContain(
      '/admin/learning-local-demo#mvp-end-to-end-readiness-trace',
    );
  });
});
