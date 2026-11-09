import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (MVP journeys and content)', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only MVP end-to-end readiness trace report', () => {
    const report = service.buildMvpEndToEndReadinessTraceReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:59:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#mvp-end-to-end-readiness-trace',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.md',
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
        realTeacherReviewedEscalationMutationUsed: false,
        realAdjustedSupportRetryCompletionMutationUsed: false,
        realResolvedSupportOutcomeMutationUsed: false,
        realLearningMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.traceRows).toHaveLength(1);
    expect(report.evidenceRows).toHaveLength(13);
    expect(report.totals).toEqual(
      expect.objectContaining({
        studentCount: 1,
        courseCount: 1,
        enrollmentOrSubscriptionCount: 1,
        paymentRefundCommissionFixtureEvidenceCount: 1,
        entitlementOrDailyPlanCount: 1,
        practiceProgressOrCompletionCount: 1,
        parentTeacherReportCount: 1,
        permissionRedactionEvidenceCount: 1,
        approvedDeliveryOrReadReceiptCount: 1,
        alignedApprovedDeliveryStudentCoursePathCount: 1,
        screenTimeGuardEvidenceCount: 1,
        teacherInterventionEvidenceCount: 1,
        remedialRetryOrEscalationEvidenceCount: 1,
        escalationResolutionEvidenceCount: 1,
        stableEndToEndTraceCount: 1,
        deterministicStatusReasonActionOwnerCount: 1,
        sameStudentCoursePathCount: 1,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.statusCounts).toEqual({
      traceStatus: {
        LOCAL_DEMO_READY_WITH_NOTES: 1,
      },
      ownerLabel: {
        TEACHER: 1,
      },
    });
  });

  it('links one stable Minh A1 path across the MVP end-to-end readiness trace', () => {
    const report = service.buildMvpEndToEndReadinessTraceReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:59:00.000Z',
    );
    const trace = report.traceRows[0];

    expect(trace).toEqual(
      expect.objectContaining({
        traceId: 'mvp-end-to-end-readiness-trace-minh-a1-2026-06-09',
        studentId: 'student-minh',
        courseId: 'course-a1-starter',
        enrollmentId: 'enroll-minh-a1-pending',
        subscriptionId: 'sub-minh-a1-trialing',
        paymentId: 'pay-minh-a1-pending',
        entitlementId: 'entitlement-sub-minh-a1-trialing',
        dailyPlanId: 'plan-minh-a1-day-02',
        practiceProgressRollupId:
          'progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        parentTeacherReportSummaryId:
          'parent-access-summary-guardian-minh-parent-enroll-minh-a1-pending',
        parentTeacherPermissionCaseId:
          'permission-case-teacher-mai-assigned-a1',
        permissionRedactionEvidenceId:
          'field-visibility-permission-case-teacher-mai-assigned-a1-guardianEmail',
        approvedDeliveryOrReadReceiptId:
          'read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        approvedDeliveryStudentId: 'student-minh',
        approvedDeliveryCourseId: 'course-a1-starter',
        screenTimeGuardEvidenceId: 'daily-plan-guard-gate-minh-a1-day-01',
        teacherInterventionReviewId:
          'teacher-intervention-review-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialRetryOrEscalationId:
          'remedial-retry-unresolved-minh-colors-2026-06-08',
        teacherEscalationId: 'teacher-escalation-minh-colors-retry',
        supportAdjustmentId: 'support-adjustment-minh-colors-retry',
        escalationResolutionId:
          'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
        resolvedSupportOutcomeId:
          'resolved-support-outcome-minh-colors-adjusted-retry',
        traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
        ownerLabel: 'TEACHER',
        providerUsed: false,
        mutationUsed: false,
      }),
    );
    expect(
      [
        trace.studentId,
        trace.courseId,
        trace.enrollmentId,
        trace.subscriptionId,
        trace.entitlementId,
        trace.dailyPlanId,
        trace.practiceProgressRollupId,
        trace.parentTeacherReportSummaryId,
        trace.parentTeacherPermissionCaseId,
        trace.permissionRedactionEvidenceId,
        trace.approvedDeliveryOrReadReceiptId,
        trace.screenTimeGuardEvidenceId,
        trace.teacherInterventionReviewId,
        trace.remedialRetryOrEscalationId,
        trace.teacherEscalationId,
        trace.supportAdjustmentId,
        trace.escalationResolutionId,
        trace.resolvedSupportOutcomeId,
      ].every((id) => trace.stableEndToEndTraceKey.includes(id)),
    ).toBe(true);
    expect(trace.approvedDeliveryStudentId).toBe(trace.studentId);
    expect(trace.approvedDeliveryCourseId).toBe(trace.courseId);
    expect(trace.approvedDeliveryOrReadReceiptId).not.toBe(
      'read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
    );
    expect(trace.reasonLabel).toContain('production_ready=false');
    expect(trace.actionLabel).toContain('do not run providers');
  });

  it('renders MVP end-to-end readiness trace Markdown evidence', () => {
    const report = service.buildMvpEndToEndReadinessTraceReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:59:00.000Z',
    );
    const markdown = service.toMvpEndToEndReadinessTraceMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Stable end-to-end traces: 1');
    expect(markdown).toContain('Permission/redaction evidence: 1');
    expect(markdown).toContain('Approved delivery/read receipt evidence: 1');
    expect(markdown).toContain(
      'Aligned approved delivery student/course path rows: 1',
    );
    expect(markdown).toContain('## Trace Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report',
    );
    expect(markdown).toContain(
      'mvp-end-to-end-readiness-trace-minh-a1-2026-06-09',
    );
    expect(markdown).toContain(
      'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
    );
    expect(markdown).toContain(
      'read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved (student-minh/course-a1-starter)',
    );
  });

  it('builds fixture-only MVP role journey entrypoint evidence', () => {
    const report = service.buildMvpRoleJourneyEntrypointsReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:59:30.000Z',
    );

    expect(report.reportName).toBe(
      'Learning local demo MVP Role Journey Entrypoints Report',
    );
    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/mvp-role-journey-entrypoints-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#mvp-role-journey-entrypoints',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-mvp-role-journey-entrypoints-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-mvp-role-journey-entrypoints-report.md',
    );
    expect(report.safety).toEqual(
      expect.objectContaining({
        productionReady: false,
        fixtureOnly: true,
        productionDbUsed: false,
        noProductionDbRead: true,
        providerApiUsed: false,
        paymentProviderUsed: false,
        notificationProviderUsed: false,
        aiProviderExecutionUsed: false,
        realLearningMutationUsed: false,
        realTeacherInterventionMutationUsed: false,
        realParentMessageMutationUsed: false,
        realErpMutationUsed: false,
        secretsRequired: false,
      }),
    );
    expect(report.entrypointRows).toHaveLength(4);
    expect(report.stableTraceRows).toHaveLength(1);
    expect(report.evidenceRows).toHaveLength(6);
    expect(report.totals).toEqual(
      expect.objectContaining({
        roleEntrypointCount: 4,
        studentRoleEntrypointCount: 1,
        parentRoleEntrypointCount: 1,
        teacherRoleEntrypointCount: 1,
        adminRoleEntrypointCount: 1,
        stableRoleJourneyTraceCount: 1,
        sameStudentCoursePathCount: 4,
        linkedMvpReadinessTraceCount: 4,
        linkedParentReadReceiptCount: 4,
        linkedTeacherEscalationResolutionCount: 4,
        deterministicStatusReasonActionOwnerCount: 4,
        routeAnchorActionStatusLabelCount: 4,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.statusCounts).toEqual({
      role: {
        STUDENT: 1,
        PARENT: 1,
        TEACHER: 1,
        ADMIN_OPERATOR: 1,
      },
      status: {
        LOCAL_DEMO_READY_WITH_NOTES: 4,
      },
      ownerLabel: {
        STUDENT: 1,
        PARENT: 1,
        TEACHER: 1,
        ADMIN_OPERATOR: 1,
      },
    });
  });

  it('links every MVP role journey entrypoint to the same Minh A1 path', () => {
    const report = service.buildMvpRoleJourneyEntrypointsReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:59:30.000Z',
    );
    const trace = report.stableTraceRows[0];

    expect(trace).toEqual(
      expect.objectContaining({
        stableRoleJourneyTraceId:
          'mvp-role-journey-entrypoints-minh-a1-2026-06-09',
        studentId: 'student-minh',
        courseId: 'course-a1-starter',
        learningPathId: 'path-minh-a1-june',
        mvpReadinessTraceId:
          'mvp-end-to-end-readiness-trace-minh-a1-2026-06-09',
        parentReadReceiptEvidenceId:
          'read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        teacherEscalationResolutionId:
          'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
        traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
        ownerLabel: 'ADMIN_OPERATOR',
      }),
    );
    expect(trace.roleEntrypointIds).toEqual([
      'role-entrypoint-student-minh-a1',
      'role-entrypoint-parent-minh-a1',
      'role-entrypoint-teacher-minh-a1',
      'role-entrypoint-admin-operator-minh-a1',
    ]);

    for (const row of report.entrypointRows) {
      expect(row.studentId).toBe('student-minh');
      expect(row.courseId).toBe('course-a1-starter');
      expect(row.learningPathId).toBe('path-minh-a1-june');
      expect(row.stableRoleJourneyTraceId).toBe(trace.stableRoleJourneyTraceId);
      expect(row.mvpReadinessTraceId).toBe(trace.mvpReadinessTraceId);
      expect(row.parentReadReceiptEvidenceId).toBe(
        trace.parentReadReceiptEvidenceId,
      );
      expect(row.teacherEscalationResolutionId).toBe(
        trace.teacherEscalationResolutionId,
      );
      expect(row.statusLabel).toBe('LOCAL_DEMO_READY_WITH_NOTES');
      expect(row.routePath).not.toBe('');
      expect(row.dashboardAnchor).toMatch(/^\/admin\/learning-local-demo#/);
      expect(row.routeLabel).not.toBe('');
      expect(row.anchorLabel).not.toBe('');
      expect(row.actionLabel).not.toBe('');
      expect(row.reasonLabel).not.toBe('');
      expect(row.ownerLabel).toBe(row.role);
      expect(row.providerUsed).toBe(false);
      expect(row.mutationUsed).toBe(false);
      expect(row.productionReady).toBe(false);
    }

    const parent = report.entrypointRows.find((row) => row.role === 'PARENT');
    const teacher = report.entrypointRows.find((row) => row.role === 'TEACHER');
    const admin = report.entrypointRows.find(
      (row) => row.role === 'ADMIN_OPERATOR',
    );
    expect(parent).toEqual(
      expect.objectContaining({
        parentInboxItemId:
          'parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        screenTimeGuardEvidenceId: 'daily-plan-guard-gate-minh-a1-day-01',
      }),
    );
    expect(teacher).toEqual(
      expect.objectContaining({
        teacherInterventionReviewId:
          'teacher-intervention-review-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialAssignmentId:
          'remedial-assignment-progress-rollup-learning-session-evidence-gate-minh-a1-day-01',
        remedialRetryOrEscalationId:
          'remedial-retry-unresolved-minh-colors-2026-06-08',
      }),
    );
    expect(admin).toEqual(
      expect.objectContaining({
        safetyOverviewAnchor:
          '/admin/learning-local-demo#mvp-readiness-overview',
      }),
    );
  });

  it('renders MVP role journey entrypoints Markdown evidence', () => {
    const report = service.buildMvpRoleJourneyEntrypointsReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T04:59:30.000Z',
    );
    const markdown = service.toMvpRoleJourneyEntrypointsMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Role entrypoints: 4');
    expect(markdown).toContain('Student role entrypoints: 1');
    expect(markdown).toContain('Parent role entrypoints: 1');
    expect(markdown).toContain('Teacher role entrypoints: 1');
    expect(markdown).toContain('Admin/operator role entrypoints: 1');
    expect(markdown).toContain('Stable role journey traces: 1');
    expect(markdown).toContain('Same student/course path rows: 4');
    expect(markdown).toContain('Linked parent read receipt rows: 4');
    expect(markdown).toContain('## Role Entrypoint Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/mvp-role-journey-entrypoints-report',
    );
    expect(markdown).toContain(
      'mvp-role-journey-entrypoints-minh-a1-2026-06-09',
    );
    expect(markdown).toContain('role-entrypoint-student-minh-a1');
    expect(markdown).toContain('role-entrypoint-parent-minh-a1');
    expect(markdown).toContain('role-entrypoint-teacher-minh-a1');
    expect(markdown).toContain('role-entrypoint-admin-operator-minh-a1');
  });

  it('builds a fixture-only teacher content library learning path publish report', () => {
    const report = service.buildTeacherContentLibraryLearningPathPublishReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T05:00:00.000Z',
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
      realContentLibraryMutationUsed: false,
      realContentPublishMutationUsed: false,
      realContentUploadMutationUsed: false,
      realStorageCdnMutationUsed: false,
      realTeacherAdminAccountMutationUsed: false,
      realStudentClassVisibilityMutationUsed: false,
      realParentSummaryMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      teacherAdminCount: 3,
      contentItemCount: 6,
      videoAssetCount: 2,
      practiceAssetCount: 2,
      lessonAssetCount: 2,
      draftContentCount: 1,
      publishedContentCount: 4,
      archivedContentCount: 1,
      learningPathPublishCount: 6,
      classAssignmentCount: 6,
      studentVisibilityCount: 6,
      parentVisibleSummaryCount: 3,
      blockedUnpublishedItemCount: 2,
      itemsNeedingTeacherReviewCount: 2,
    });
    expect(report.statusCounts).toEqual({
      ownerRole: {
        TEACHER: 2,
        ADMIN: 1,
      },
      assetKind: {
        VIDEO: 2,
        PRACTICE: 2,
        LESSON: 2,
      },
      publishStatus: {
        DRAFT: 1,
        PUBLISHED: 4,
        ARCHIVED: 1,
      },
      classAssignmentStatus: {
        PUBLISHED: 4,
        BLOCKED_UNPUBLISHED: 2,
      },
      studentVisibilityStatus: {
        VISIBLE: 6,
        BLOCKED_UNPUBLISHED: 1,
        BLOCKED_ARCHIVED: 1,
      },
    });
  });

  it('derives teacher content publish and parent visibility rollups', () => {
    const report = service.buildTeacherContentLibraryLearningPathPublishReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T05:00:00.000Z',
    );

    const greetingsVideo = report.contentRows.find(
      (row) => row.contentItemId === 'content-video-a1-greetings',
    );
    const familyDraft = report.contentRows.find(
      (row) => row.contentItemId === 'content-lesson-a1-family-preview',
    );
    const familyAssignment = report.classAssignmentRows.find(
      (row) => row.classAssignmentId === 'content-assign-a1-family-draft',
    );
    const avaSummary = report.parentSummaryRows.find(
      (row) => row.studentId === 'student-ava',
    );
    const archivedVisibility = report.studentVisibilityRows.find(
      (row) => row.visibilityId === 'content-blocked-khoa-archived-phrases',
    );

    expect(greetingsVideo).toEqual(
      expect.objectContaining({
        publishStatus: 'PUBLISHED',
        assetKind: 'VIDEO',
        classAssignmentCount: 1,
        learningPathPublishCount: 2,
        studentVisibilityCount: 2,
        parentVisibleSummaryCount: 2,
        needsTeacherReview: false,
      }),
    );
    expect(familyDraft).toEqual(
      expect.objectContaining({
        publishStatus: 'DRAFT',
        assetKind: 'LESSON',
        learningPathPublishCount: 0,
        studentVisibilityCount: 0,
        needsTeacherReview: true,
      }),
    );
    expect(familyAssignment).toEqual(
      expect.objectContaining({
        assignmentStatus: 'BLOCKED_UNPUBLISHED',
        visibleStudentCount: 0,
        blockedStudentVisibilityCount: 1,
      }),
    );
    expect(avaSummary).toEqual(
      expect.objectContaining({
        parentGuardianName: 'Ava Parent',
        parentVisibleItemCount: 2,
        blockedItemCount: 1,
        itemsNeedingTeacherReviewCount: 1,
        nextAvailableDailyPlanDate: '2026-06-01',
      }),
    );
    expect(archivedVisibility).toEqual(
      expect.objectContaining({
        visibilityStatus: 'BLOCKED_ARCHIVED',
        studentVisible: false,
        parentVisible: false,
        availableOnDailyPlan: false,
      }),
    );
  });

  it('renders teacher content library learning path publish Markdown evidence', () => {
    const report = service.buildTeacherContentLibraryLearningPathPublishReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T05:00:00.000Z',
    );
    const markdown =
      service.toTeacherContentLibraryLearningPathPublishMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realContentLibraryMutationUsed=false');
    expect(markdown).toContain('realContentPublishMutationUsed=false');
    expect(markdown).toContain('realContentUploadMutationUsed=false');
    expect(markdown).toContain('realStorageCdnMutationUsed=false');
    expect(markdown).toContain('realTeacherAdminAccountMutationUsed=false');
    expect(markdown).toContain('realStudentClassVisibilityMutationUsed=false');
    expect(markdown).toContain('realParentSummaryMutationUsed=false');
    expect(markdown).toContain('Learning-path publishes: 6');
    expect(markdown).toContain('## Content Library Rows');
    expect(markdown).toContain('A1 family preview lesson asset');
    expect(markdown).toContain('## Parent Summary Rows');
  });
});
