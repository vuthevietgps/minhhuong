import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoController } from './learning-local-demo.controller';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService', () => {
  const service = new LearningLocalDemoService();

  it('builds a fixture-only student to course to subscription report', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionReport(
      learningLocalDemoCoreFixture,
      '2026-06-29T00:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      providerApiUsed: false,
      paymentProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realClassMutationUsed: false,
      realSessionMutationUsed: false,
      realAttendanceMutationUsed: false,
      realProgressMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      enrollmentCount: 4,
      activeEnrollmentCount: 2,
      pendingEnrollmentCount: 1,
      canceledEnrollmentCount: 1,
      subscriptionCount: 4,
      activeSubscriptionCount: 2,
      trialingSubscriptionCount: 1,
      canceledSubscriptionCount: 1,
      paymentCount: 4,
      pendingPaymentCount: 1,
      succeededPaymentCount: 2,
      refundedPaymentCount: 1,
      refundCount: 1,
      succeededRefundCount: 1,
      commissionCount: 4,
      pendingCommissionCount: 1,
      payableCommissionCount: 1,
      approvedCommissionCount: 1,
      canceledCommissionCount: 1,
      grossPaidCents: 840000000,
      pendingPaymentCents: 240000000,
      refundedCents: 240000000,
      netRevenueCents: 600000000,
      commissionPendingCents: 24000000,
      commissionPayableCents: 25200000,
      commissionApprovedCents: 28800000,
      commissionCanceledCents: 24000000,
      commissionEarnedCents: 78000000,
    });
  });

  it('keeps pending enrollment payment separate from recognized revenue', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionReport(
      learningLocalDemoCoreFixture,
      '2026-06-29T00:00:00.000Z',
    );
    const pending = report.rows.find(
      (row) => row.enrollmentId === 'enroll-minh-a1-pending',
    );

    expect(pending).toEqual(
      expect.objectContaining({
        enrollmentStatus: 'PENDING',
        subscriptionStatus: 'TRIALING',
        paymentStatus: 'PENDING',
        grossPaidCents: 0,
        pendingPaymentCents: 240000000,
        refundedCents: 0,
        netRevenueCents: 0,
      }),
    );
  });

  it('nets refunded subscriptions to zero revenue and canceled commission', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionReport(
      learningLocalDemoCoreFixture,
      '2026-06-29T00:00:00.000Z',
    );
    const refunded = report.rows.find(
      (row) => row.enrollmentId === 'enroll-khoa-a1-canceled',
    );

    expect(refunded).toEqual(
      expect.objectContaining({
        enrollmentStatus: 'CANCELED',
        subscriptionStatus: 'CANCELED',
        paymentStatus: 'REFUNDED',
        refundStatus: 'SUCCEEDED',
        grossPaidCents: 240000000,
        refundedCents: 240000000,
        netRevenueCents: 0,
        commissionCanceledCents: 24000000,
      }),
    );
  });

  it('aggregates payable and approved commission on a paid learning course', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionReport(
      learningLocalDemoCoreFixture,
      '2026-06-29T00:00:00.000Z',
    );
    const phonics = report.courseAggregates.find(
      (row) => row.courseCode === 'MH-PHONICS-BOOSTER',
    );

    expect(phonics).toEqual(
      expect.objectContaining({
        enrollmentCount: 1,
        activeEnrollmentCount: 1,
        grossPaidCents: 360000000,
        refundedCents: 0,
        netRevenueCents: 360000000,
        commissionEarnedCents: 54000000,
      }),
    );
  });

  it('renders Markdown evidence for fast review', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionReport(
      learningLocalDemoCoreFixture,
      '2026-06-29T00:00:00.000Z',
    );
    const markdown = service.toLearningCoreMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('paymentProviderUsed=false');
    expect(markdown).toContain('## Enrollment Rows');
    expect(markdown).toContain('MH-PHONICS-BOOSTER');
  });

  it('builds the fixture-only student course enrollment subscription flow report', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionFlowReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T12:00:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/student-course-enrollment-subscription-flow-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#student-course-enrollment-subscription-flow',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      enrollmentCount: 4,
      subscriptionCount: 4,
      fixturePaymentEvidenceCount: 4,
      refundEvidenceCount: 1,
      commissionEvidenceCount: 4,
      relationshipTraceCount: 4,
      evidenceRowCount: 6,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('traces stable fixture IDs across the learning business flow', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionFlowReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T12:00:00.000Z',
    );
    const refunded = report.relationshipRows.find(
      (row) => row.enrollmentId === 'enroll-khoa-a1-canceled',
    );
    const payments = report.evidenceRows.find(
      (row) => row.evidenceKind === 'PAYMENT_FIXTURE',
    );
    const commissions = report.evidenceRows.find(
      (row) => row.evidenceKind === 'COMMISSION_FIXTURE',
    );

    expect(refunded).toEqual(
      expect.objectContaining({
        relationshipKey:
          'student-khoa->course-a1-starter->enroll-khoa-a1-canceled->sub-khoa-a1-canceled',
        studentId: 'student-khoa',
        courseId: 'course-a1-starter',
        subscriptionId: 'sub-khoa-a1-canceled',
        paymentId: 'pay-khoa-a1-refunded',
        refundIds: ['refund-khoa-a1-succeeded'],
        commissionIds: ['commission-khoa-sale-canceled'],
        fixtureOnly: true,
        mutationUsed: false,
      }),
    );
    expect(payments).toEqual(
      expect.objectContaining({
        evidenceCount: 4,
        stableFixtureIds: expect.arrayContaining([
          'pay-minh-a1-pending',
          'pay-khoa-a1-refunded',
        ]),
        providerUsed: false,
        mutationUsed: false,
      }),
    );
    expect(commissions).toEqual(
      expect.objectContaining({
        evidenceCount: 4,
        stableFixtureIds: expect.arrayContaining([
          'commission-linh-sale-approved',
          'commission-khoa-sale-canceled',
        ]),
        providerUsed: false,
        mutationUsed: false,
      }),
    );
  });

  it('renders student course enrollment subscription flow Markdown evidence', () => {
    const report = service.buildStudentCourseEnrollmentSubscriptionFlowReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T12:00:00.000Z',
    );
    const markdown =
      service.toStudentCourseEnrollmentSubscriptionFlowMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('noProductionDbRead=true');
    expect(markdown).toContain('Fixture payment evidence: 4');
    expect(markdown).toContain('Refund evidence: 1');
    expect(markdown).toContain('Commission evidence: 4');
    expect(markdown).toContain('## Relationship Trace Rows');
    expect(markdown).toContain(
      '/v1/learning-local-demo/student-course-enrollment-subscription-flow-report',
    );
    expect(markdown).toContain('commission-khoa-sale-canceled');
  });

  it('builds the fixture-only subscription entitlement daily plan access report', () => {
    const report = service.buildSubscriptionEntitlementDailyPlanAccessReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T12:30:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/subscription-entitlement-daily-plan-access-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#subscription-entitlement-daily-plan-access',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      enrollmentCount: 4,
      subscriptionCount: 4,
      entitlementCount: 4,
      learningPathCount: 4,
      dailyPlanAccessCaseCount: 4,
      unlockedAccessCount: 2,
      blockedAccessCount: 2,
      blockedPendingPaymentCount: 1,
      blockedExpiredCount: 1,
      blockedRevokedCount: 1,
      blockedRefundedCount: 1,
      blockedCanceledCount: 0,
      lifecycleRowCount: 5,
      lifecycleExpiredRowCount: 1,
      lifecycleRevokedRowCount: 1,
      lifecycleRowsWithReasonCount: 5,
      relationshipTraceCount: 4,
      accessCasesWithRelationshipTraceCount: 4,
      blockedAccessWithReasonCount: 2,
      evidenceRowCount: 6,
      localDemoNoteCount: 4,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('traces unlocked and blocked entitlement access cases with stable IDs', () => {
    const report = service.buildSubscriptionEntitlementDailyPlanAccessReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T12:30:00.000Z',
    );
    const ava = report.accessRows.find(
      (row) => row.enrollmentId === 'enroll-ava-a1-active',
    );
    const minh = report.accessRows.find(
      (row) => row.enrollmentId === 'enroll-minh-a1-pending',
    );
    const khoa = report.accessRows.find(
      (row) => row.enrollmentId === 'enroll-khoa-a1-canceled',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        entitlementId: 'entitlement-sub-ava-a1-active',
        accessStatus: 'UNLOCKED',
        entitlementStatus: 'GRANTED',
        blockedReason: null,
        dailyPlanId: 'plan-ava-a1-day-03',
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
      }),
    );
    expect(minh).toEqual(
      expect.objectContaining({
        relationshipKey:
          'student-minh->course-a1-starter->enroll-minh-a1-pending->sub-minh-a1-trialing->entitlement-sub-minh-a1-trialing->plan-minh-a1-day-02',
        entitlementId: 'entitlement-sub-minh-a1-trialing',
        accessStatus: 'BLOCKED_PENDING_PAYMENT',
        entitlementStatus: 'BLOCKED',
        dailyPlanId: 'plan-minh-a1-day-02',
        nextSafeActionLabel: 'Confirm fixture payment before unlocking',
      }),
    );
    expect(minh?.blockedReason).toContain('payment confirmation');
    expect(khoa).toEqual(
      expect.objectContaining({
        accessStatus: 'BLOCKED_REFUNDED',
        entitlementStatus: 'BLOCKED',
        dailyPlanId: 'plan-khoa-a1-day-02',
        refundIds: ['refund-khoa-a1-succeeded'],
        nextSafeActionLabel: 'Keep blocked after synthetic refund',
      }),
    );
    expect(khoa?.blockedReason).toContain('refunded');
    expect(report.lifecycleRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lifecycleRowId: 'entitlement-lifecycle-sub-ava-a1-expired-snapshot',
          lifecycleState: 'EXPIRED',
          accessStatus: 'BLOCKED_EXPIRED',
          entitlementStatus: 'BLOCKED',
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
        }),
        expect.objectContaining({
          lifecycleRowId: 'entitlement-lifecycle-sub-khoa-a1-revoked-snapshot',
          lifecycleState: 'REVOKED',
          accessStatus: 'BLOCKED_REVOKED',
          entitlementStatus: 'BLOCKED',
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
        }),
      ]),
    );
    expect(
      report.lifecycleRows.every(
        (row) =>
          row.auditTraceIds.length > 0 &&
          row.auditTraceKey.includes(row.entitlementId) &&
          Boolean(row.decisionReason),
      ),
    ).toBe(true);
    expect(
      report.accessRows.every((row) =>
        row.relationshipKey.includes(row.entitlementId),
      ),
    ).toBe(true);
    expect(
      report.accessRows
        .filter((row) => row.accessStatus !== 'UNLOCKED')
        .every((row) => row.blockedReason),
    ).toBe(true);
  });

  it('renders subscription entitlement daily plan access Markdown evidence', () => {
    const report = service.buildSubscriptionEntitlementDailyPlanAccessReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T12:30:00.000Z',
    );
    const markdown =
      service.toSubscriptionEntitlementDailyPlanAccessMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Daily plan access cases: 4');
    expect(markdown).toContain('Unlocked access: 2');
    expect(markdown).toContain('Blocked access: 2');
    expect(markdown).toContain('Blocked expired: 1');
    expect(markdown).toContain('Blocked revoked: 1');
    expect(markdown).toContain('Lifecycle rows: 5');
    expect(markdown).toContain('Lifecycle expired rows: 1');
    expect(markdown).toContain('Lifecycle revoked rows: 1');
    expect(markdown).toContain('Blocked access with reason: 2');
    expect(markdown).toContain('## Access Case Rows');
    expect(markdown).toContain('## Lifecycle Hardening Rows');
    expect(markdown).toContain('BLOCKED_PENDING_PAYMENT');
    expect(markdown).toContain('BLOCKED_EXPIRED');
    expect(markdown).toContain('BLOCKED_REVOKED');
    expect(markdown).toContain('BLOCKED_REFUNDED');
    expect(markdown).toContain(
      '/v1/learning-local-demo/subscription-entitlement-daily-plan-access-report',
    );
  });

  it('builds a fixture-only parent teacher progress access summary report', () => {
    const report = service.buildParentTeacherProgressAccessSummaryReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T13:00:00.000Z',
    );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-teacher-progress-access-summary-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-teacher-progress-access-summary',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-progress-access-summary-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-progress-access-summary-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      courseCount: 2,
      enrollmentCount: 4,
      subscriptionCount: 4,
      entitlementCount: 4,
      dailyPlanAccessCaseCount: 4,
      unlockedAccessCount: 2,
      blockedAccessCount: 2,
      blockedReasonCount: 2,
      progressSummaryCount: 4,
      parentSummaryCount: 4,
      teacherSummaryCount: 4,
      relationshipTraceCount: 4,
      parentSummaryWithTraceCount: 4,
      teacherSummaryWithTraceCount: 4,
      blockedAccessInSummariesWithReasonCount: 2,
      evidenceRowCount: 5,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('surfaces parent and teacher summaries with trace IDs and blocked reasons', () => {
    const report = service.buildParentTeacherProgressAccessSummaryReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T13:00:00.000Z',
    );
    const minhParent = report.parentSummaryRows.find(
      (row) => row.studentId === 'student-minh',
    );
    const teacherMai = report.teacherSummaryRows.find(
      (row) => row.teacherOwnerId === 'content-owner-teacher-mai',
    );

    expect(minhParent).toEqual(
      expect.objectContaining({
        parentGuardianId: 'guardian-minh-parent',
        accessStatus: 'BLOCKED_PENDING_PAYMENT',
        progressStatus: 'NEEDS_SUPPORT',
        dailyPlanId: 'plan-minh-a1-day-02',
        completionPercent: 33,
        nextSafeActionLabel: 'Confirm fixture payment before unlocking',
      }),
    );
    expect(minhParent?.blockedReason).toContain('payment confirmation');
    expect(minhParent?.relationshipTraceKey).toContain(
      'guardian-minh-parent->student-minh->course-a1-starter',
    );
    expect(
      report.parentSummaryRows.every(
        (row) =>
          row.relationshipTraceIds.length >= 3 &&
          row.relationshipTraceKey.includes(row.parentGuardianId),
      ),
    ).toBe(true);
    expect(teacherMai).toEqual(
      expect.objectContaining({
        classCode: 'MH-A1-JUN-WEEKDAY',
        courseCode: 'MH-A1-STARTER',
        studentCount: 3,
        unlockedAccessCount: 1,
        blockedAccessCount: 2,
        blockedReasonCount: 2,
        averageCompletionPercent: 44,
      }),
    );
    expect(
      report.teacherSummaryRows.every(
        (row) =>
          row.relationshipTraceIds.length > 0 &&
          row.relationshipTraceKey.includes(row.teacherOwnerId),
      ),
    ).toBe(true);
    expect(report.totals.blockedAccessInSummariesWithReasonCount).toBe(
      report.totals.blockedAccessCount,
    );
  });

  it('renders parent teacher progress access summary Markdown evidence', () => {
    const report = service.buildParentTeacherProgressAccessSummaryReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T13:00:00.000Z',
    );
    const markdown =
      service.toParentTeacherProgressAccessSummaryMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Parent guardians: 4');
    expect(markdown).toContain('Teachers/admins: 3');
    expect(markdown).toContain('Progress summaries: 4');
    expect(markdown).toContain('Blocked access in summaries with reason: 2');
    expect(markdown).toContain('## Parent Summary Rows');
    expect(markdown).toContain('## Teacher Summary Rows');
    expect(markdown).toContain('BLOCKED_PENDING_PAYMENT');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-teacher-progress-access-summary-report',
    );
  });

  it('builds a fixture-only parent teacher report permission privacy redaction report', () => {
    const report =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:30:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-teacher-report-permission-privacy-redaction',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      supportOpsCount: 1,
      courseCount: 2,
      reportPermissionCaseCount: 6,
      allowedReportCaseCount: 4,
      deniedReportCaseCount: 2,
      teacherUnassignedDeniedCaseCount: 1,
      supportOpsAuditReadOnlyCaseCount: 1,
      visibleFieldCount: 15,
      redactedFieldCount: 2,
      deniedFieldCount: 7,
      parentVisibleFieldCount: 4,
      teacherVisibleFieldCount: 8,
      supportOpsVisibleFieldCount: 3,
      parentRedactedFieldCount: 1,
      teacherRedactedFieldCount: 1,
      supportOpsDeniedFieldCount: 1,
      permissionTraceCount: 6,
      casesWithTraceCount: 6,
      deniedOrRedactedCaseWithReasonCount: 5,
      redactedOrDeniedFieldWithReasonCount: 9,
      evidenceRowCount: 8,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('traces allowed denied visible and redacted parent teacher report fields', () => {
    const report =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:30:00.000Z',
      );
    const owningParent = report.permissionCaseRows.find(
      (row) => row.permissionCaseId === 'permission-case-parent-ava-own-child',
    );
    const nonOwningParent = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-parent-minh-non-owning-ava',
    );
    const teacher = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-teacher-mai-assigned-a1',
    );
    const teacherUnassigned = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId ===
        'permission-case-teacher-mai-unassigned-phonics-denied',
    );
    const supportOps = report.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId ===
        'permission-case-support-ops-lan-audit-read-only',
    );
    const parentRedacted = report.fieldVisibilityRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-parent-ava-own-child' &&
        row.visibility === 'REDACTED',
    );
    const teacherRedacted = report.fieldVisibilityRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-teacher-mai-assigned-a1' &&
        row.visibility === 'REDACTED',
    );
    const deniedFields = report.fieldVisibilityRows.filter(
      (row) =>
        row.permissionCaseId === 'permission-case-parent-minh-non-owning-ava',
    );
    const teacherUnassignedDeniedFields = report.fieldVisibilityRows.filter(
      (row) =>
        row.permissionCaseId ===
        'permission-case-teacher-mai-unassigned-phonics-denied',
    );
    const supportOpsDeniedFields = report.fieldVisibilityRows.filter(
      (row) =>
        row.permissionCaseId ===
          'permission-case-support-ops-lan-audit-read-only' &&
        row.visibility === 'DENIED',
    );

    expect(owningParent).toEqual(
      expect.objectContaining({
        actorId: 'guardian-ava-parent',
        actorRole: 'PARENT_GUARDIAN',
        reportScope: 'OWN_CHILD',
        permissionDecision: 'ALLOWED',
        targetChildProfileId: 'child-ava-demo',
        progressSummaryId: 'progress-access-enroll-ava-a1-active',
        visibleFieldCount: 4,
        redactedFieldCount: 1,
      }),
    );
    expect(owningParent?.relationshipTraceKey).toContain('guardian-ava-parent');
    expect(nonOwningParent).toEqual(
      expect.objectContaining({
        actorId: 'guardian-minh-parent',
        reportScope: 'NON_OWNING_CHILD',
        permissionDecision: 'DENIED',
        targetChildProfileId: 'child-ava-demo',
        visibleFieldCount: 0,
        deniedFieldCount: 3,
      }),
    );
    expect(nonOwningParent?.decisionReason).toContain('not linked');
    expect(teacher).toEqual(
      expect.objectContaining({
        actorId: 'content-owner-teacher-mai',
        actorRole: 'TEACHER',
        reportScope: 'ASSIGNED_CLASS',
        permissionDecision: 'ALLOWED',
        targetClassId: 'class-a1-june-weekday',
        visibleFieldCount: 4,
        redactedFieldCount: 1,
      }),
    );
    expect(teacherUnassigned).toEqual(
      expect.objectContaining({
        actorId: 'content-owner-teacher-mai',
        actorRole: 'TEACHER',
        reportScope: 'UNASSIGNED_CLASS',
        permissionDecision: 'DENIED',
        targetClassId: 'class-phonics-may-booster',
        visibleFieldCount: 0,
        deniedFieldCount: 3,
      }),
    );
    expect(teacherUnassigned?.decisionReason).toContain('not assigned');
    expect(supportOps).toEqual(
      expect.objectContaining({
        actorId: 'support-ops-auditor-lan',
        actorRole: 'SUPPORT_OPS',
        reportScope: 'SUPPORT_AUDIT_READ_ONLY',
        permissionDecision: 'ALLOWED',
        targetClassId: 'class-a1-june-weekday',
        visibleFieldCount: 3,
        deniedFieldCount: 1,
      }),
    );
    expect(supportOps?.decisionReason).toContain('read-only');
    expect(parentRedacted).toEqual(
      expect.objectContaining({
        fieldKey: 'teacherInternalSummary',
        fieldScope: 'TEACHER_INTERNAL',
        visibility: 'REDACTED',
        redactedValue: 'REDACTED_LOCAL_DEMO',
      }),
    );
    expect(parentRedacted?.reason).toContain('Parent report hides');
    expect(teacherRedacted).toEqual(
      expect.objectContaining({
        fieldKey: 'guardianEmail',
        fieldScope: 'GUARDIAN_PRIVATE',
        visibility: 'REDACTED',
        redactedValue: 'REDACTED_LOCAL_DEMO',
      }),
    );
    expect(teacherRedacted?.reason).toContain('redacts guardian email');
    expect(deniedFields).toHaveLength(3);
    expect(deniedFields.every((row) => row.visibility === 'DENIED')).toBe(true);
    expect(deniedFields.every((row) => Boolean(row.reason))).toBe(true);
    expect(teacherUnassignedDeniedFields).toHaveLength(3);
    expect(
      teacherUnassignedDeniedFields.every(
        (row) => row.visibility === 'DENIED' && Boolean(row.reason),
      ),
    ).toBe(true);
    expect(supportOpsDeniedFields).toEqual([
      expect.objectContaining({
        fieldKey: 'liveMutation',
        fieldScope: 'SUPPORT_AUDIT_MUTATION',
        redactedValue: 'DENIED_LOCAL_DEMO',
      }),
    ]);
    expect(
      report.permissionCaseRows.every(
        (row) =>
          row.relationshipTraceIds.length > 0 &&
          row.relationshipTraceKey.includes(row.actorId),
      ),
    ).toBe(true);
    expect(
      report.fieldVisibilityRows
        .filter((row) => row.visibility !== 'VISIBLE')
        .every((row) => Boolean(row.reason)),
    ).toBe(true);
  });

  it('renders parent teacher report permission privacy redaction Markdown evidence', () => {
    const report =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:30:00.000Z',
      );
    const markdown =
      service.toParentTeacherReportPermissionPrivacyRedactionMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Support/ops actors: 1');
    expect(markdown).toContain('Report permission cases: 6');
    expect(markdown).toContain('Allowed cases: 4');
    expect(markdown).toContain('Denied cases: 2');
    expect(markdown).toContain('Teacher unassigned denied cases: 1');
    expect(markdown).toContain('Support/ops audit read-only cases: 1');
    expect(markdown).toContain('Redacted fields: 2');
    expect(markdown).toContain('Denied fields: 7');
    expect(markdown).toContain('Parent-visible fields: 4');
    expect(markdown).toContain('Teacher/admin-visible fields: 8');
    expect(markdown).toContain('Support/ops-visible fields: 3');
    expect(markdown).toContain('## Permission Case Rows');
    expect(markdown).toContain('## Field Visibility Rows');
    expect(markdown).toContain(
      'permission-case-teacher-mai-unassigned-phonics-denied',
    );
    expect(markdown).toContain(
      'permission-case-support-ops-lan-audit-read-only',
    );
    expect(markdown).toContain('REDACTED_LOCAL_DEMO');
    expect(markdown).toContain('DENIED_LOCAL_DEMO');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report',
    );
  });

  it('builds a fixture-only parent teacher report review queue message preview report', () => {
    const report =
      service.buildParentTeacherReportReviewQueueMessagePreviewReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:45:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-teacher-report-review-queue-message-preview',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      courseCount: 2,
      reportSummaryCount: 1,
      permissionRedactionReferenceCount: 2,
      reviewQueueItemCount: 2,
      messagePreviewCount: 2,
      approvedPreviewCount: 1,
      heldPreviewCount: 1,
      redactionAwarePreviewCount: 2,
      reviewDecisionTraceCount: 2,
      casesWithStableRelationshipTraceCount: 2,
      heldOrNeedsEditWithReasonCount: 1,
      approvedWithPermissionRedactionEvidenceCount: 1,
      evidenceRowCount: 6,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('traces approved and held report preview decisions to permission redaction evidence', () => {
    const report =
      service.buildParentTeacherReportReviewQueueMessagePreviewReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:45:00.000Z',
      );
    const approved = report.messagePreviewRows.find(
      (row) => row.previewDecision === 'APPROVED',
    );
    const held = report.messagePreviewRows.find(
      (row) => row.previewDecision === 'HELD_NEEDS_EDIT',
    );

    expect(approved).toEqual(
      expect.objectContaining({
        messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
        reviewQueueItemId:
          'review-queue-ava-a1-parent-progress-preview-approve',
        permissionCaseId: 'permission-case-parent-ava-own-child',
        permissionDecision: 'ALLOWED',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        aiProviderExecutionUsed: false,
        mutationUsed: false,
      }),
    );
    expect(approved?.redactedFieldVisibilityIds).toContain(
      'field-visibility-permission-case-parent-ava-own-child-teacherInternalSummary',
    );
    expect(approved?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-ava',
        'course-a1-starter',
        'report-summary-preview-progress-access-enroll-ava-a1-active',
        'permission-case-parent-ava-own-child',
        'review-queue-ava-a1-parent-progress-preview-approve',
        'message-preview-ava-a1-parent-progress-approved',
      ]),
    );

    expect(held).toEqual(
      expect.objectContaining({
        messagePreviewId: 'message-preview-ava-a1-non-owner-held',
        reviewQueueItemId: 'review-queue-ava-a1-non-owner-preview-held',
        permissionCaseId: 'permission-case-parent-minh-non-owning-ava',
        permissionDecision: 'DENIED',
        previewDecision: 'HELD_NEEDS_EDIT',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        aiProviderExecutionUsed: false,
        mutationUsed: false,
      }),
    );
    expect(held?.heldReason).toContain('not linked');
    expect(held?.messagePreview).toContain('HELD_LOCAL_DEMO');
    expect(held?.deniedFieldVisibilityIds).toHaveLength(3);
    expect(
      report.reviewQueueRows.every(
        (row) =>
          row.relationshipTraceIds.includes(row.studentId) &&
          row.relationshipTraceIds.includes(row.courseId) &&
          row.relationshipTraceIds.includes(row.reportSummaryId) &&
          row.relationshipTraceIds.includes(row.permissionCaseId) &&
          row.relationshipTraceIds.includes(row.reviewQueueItemId),
      ),
    ).toBe(true);
  });

  it('renders parent teacher report review queue message preview Markdown evidence', () => {
    const report =
      service.buildParentTeacherReportReviewQueueMessagePreviewReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T13:45:00.000Z',
      );
    const markdown =
      service.toParentTeacherReportReviewQueueMessagePreviewMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Review queue items: 2');
    expect(markdown).toContain('Approved previews: 1');
    expect(markdown).toContain('Held previews: 1');
    expect(markdown).toContain(
      'Approved with permission/redaction evidence: 1',
    );
    expect(markdown).toContain('## Permission Redaction References');
    expect(markdown).toContain('## Review Queue Rows');
    expect(markdown).toContain('## Message Preview Rows');
    expect(markdown).toContain('HELD_LOCAL_DEMO');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
    );
  });

  it('builds a fixture-only parent portal approved report inbox read receipt report', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.endpointPath).toBe(
      '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
    );
    expect(report.dashboardEvidencePath).toBe(
      '/admin/learning-local-demo#parent-portal-approved-report-inbox-read-receipt',
    );
    expect(report.jsonExportPath).toBe(
      'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
    );
    expect(report.markdownExportPath).toBe(
      'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md',
    );
    expect(report.totals).toEqual({
      studentCount: 4,
      parentGuardianCount: 4,
      teacherCount: 3,
      courseCount: 2,
      approvedPreviewCount: 2,
      heldPreviewCount: 1,
      parentInboxItemCount: 3,
      visibleParentInboxItemCount: 2,
      hiddenHeldPreviewCount: 1,
      readAckEvidenceCount: 2,
      permissionRedactionReferenceCount: 3,
      parentInboxTraceCount: 3,
      visibleInboxItemsWithStableRelationshipTraceCount: 2,
      hiddenHeldPreviewsWithReasonCount: 1,
      visibleParentPreviewWithPermissionRedactionEvidenceCount: 2,
      alignedApprovedParentInboxEntryCount: 1,
      alignedParentReadReceiptCount: 1,
      stableAlignedReadReceiptTraceCount: 1,
      evidenceRowCount: 6,
      localDemoNoteCount: 3,
      productionReadyClaimCount: 0,
      safetyGateCount: 19,
      closedSafetyGateCount: 19,
      openSafetyGateCount: 0,
    });
    expect(report.safety).toEqual({
      productionReady: false,
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      aiProviderExecutionUsed: false,
      notificationProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realSubscriptionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
  });

  it('shows only approved previews in the parent inbox and keeps held previews hidden', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );
    const visible = report.parentInboxRows.find((row) => row.parentVisible);
    const hidden = report.parentInboxRows.find((row) => row.hiddenFromParent);
    const readAck = report.readAckRows[0];

    expect(visible).toEqual(
      expect.objectContaining({
        parentInboxItemId:
          'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
        reviewQueueItemId:
          'review-queue-ava-a1-parent-progress-preview-approve',
        inboxVisibility: 'VISIBLE_TO_PARENT',
        parentVisible: true,
        hiddenFromParent: false,
        hiddenReason: null,
        permissionDecision: 'ALLOWED',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        aiProviderExecutionUsed: false,
        mutationUsed: false,
      }),
    );
    expect(visible?.visibleSubject).toContain('Ava');
    expect(visible?.visibleBody).toContain('Ava is on track');
    expect(visible?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-ava',
        'course-a1-starter',
        'report-summary-preview-progress-access-enroll-ava-a1-active',
        'review-queue-ava-a1-parent-progress-preview-approve',
        'message-preview-ava-a1-parent-progress-approved',
        'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
      ]),
    );

    expect(hidden).toEqual(
      expect.objectContaining({
        parentInboxItemId:
          'parent-inbox-hidden-held-message-preview-ava-a1-non-owner-held',
        messagePreviewId: 'message-preview-ava-a1-non-owner-held',
        reviewQueueItemId: 'review-queue-ava-a1-non-owner-preview-held',
        inboxVisibility: 'HIDDEN_HELD_REVIEW',
        parentVisible: false,
        hiddenFromParent: true,
        visibleSubject: null,
        visibleBody: null,
        permissionDecision: 'DENIED',
      }),
    );
    expect(hidden?.hiddenReason).toContain('not linked');
    expect(hidden?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'permission-case-parent-minh-non-owning-ava',
        'message-preview-ava-a1-non-owner-held',
        'parent-inbox-hidden-held-message-preview-ava-a1-non-owner-held',
      ]),
    );

    expect(readAck).toEqual(
      expect.objectContaining({
        readAckEvidenceId:
          'read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        parentInboxItemId:
          'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        messagePreviewId: 'message-preview-ava-a1-parent-progress-approved',
        readAckStatus: 'READ_ACKNOWLEDGED',
        notificationDeliveryUsed: false,
        mutationUsed: false,
      }),
    );
    expect(readAck.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
        'read-ack-parent-inbox-item-message-preview-ava-a1-parent-progress-approved',
      ]),
    );
  });

  it('adds an aligned Minh A1 approved parent inbox row and read receipt for the MVP trace', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );
    const alignedInbox = report.parentInboxRows.find(
      (row) =>
        row.studentId === 'student-minh' &&
        row.courseId === 'course-a1-starter' &&
        row.parentVisible,
    );
    const alignedReadAck = report.readAckRows.find(
      (row) => row.parentInboxItemId === alignedInbox?.parentInboxItemId,
    );

    expect(report.totals).toEqual(
      expect.objectContaining({
        alignedApprovedParentInboxEntryCount: 1,
        alignedParentReadReceiptCount: 1,
        stableAlignedReadReceiptTraceCount: 1,
      }),
    );
    expect(alignedInbox).toEqual(
      expect.objectContaining({
        parentInboxItemId:
          'parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        messagePreviewId: 'message-preview-minh-a1-parent-progress-approved',
        reviewQueueItemId:
          'review-queue-minh-a1-parent-progress-preview-approve',
        reportSummaryId:
          'report-summary-preview-progress-access-enroll-minh-a1-pending',
        permissionCaseId: 'permission-case-parent-minh-own-child-aligned',
        studentId: 'student-minh',
        childProfileId: 'child-minh-demo',
        courseId: 'course-a1-starter',
        parentGuardianId: 'guardian-minh-parent',
        inboxVisibility: 'VISIBLE_TO_PARENT',
        permissionDecision: 'ALLOWED',
        permissionEvidenceReferenced: true,
        redactionEvidenceReferenced: true,
        notificationDeliveryUsed: false,
        mutationUsed: false,
      }),
    );
    expect(alignedInbox?.visibleBody).toContain('Minh Tran cannot open');
    expect(alignedInbox?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-minh',
        'course-a1-starter',
        'progress-access-enroll-minh-a1-pending',
        'parent-access-summary-guardian-minh-parent-enroll-minh-a1-pending',
        'permission-case-parent-minh-own-child-aligned',
        'parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
      ]),
    );
    expect(alignedReadAck).toEqual(
      expect.objectContaining({
        readAckEvidenceId:
          'read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        studentId: 'student-minh',
        childProfileId: 'child-minh-demo',
        parentGuardianId: 'guardian-minh-parent',
        readAckStatus: 'READ_ACKNOWLEDGED',
        notificationDeliveryUsed: false,
        mutationUsed: false,
      }),
    );
    expect(alignedReadAck?.relationshipTraceIds).toEqual(
      expect.arrayContaining([
        'student-minh',
        'course-a1-starter',
        'parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
        'read-ack-parent-inbox-item-message-preview-minh-a1-parent-progress-approved',
      ]),
    );
  });

  it('renders parent portal approved report inbox read receipt Markdown evidence', () => {
    const report =
      service.buildParentPortalApprovedReportInboxReadReceiptReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T14:00:00.000Z',
      );
    const markdown =
      service.toParentPortalApprovedReportInboxReadReceiptMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Parent inbox items: 3');
    expect(markdown).toContain('Visible parent inbox items: 2');
    expect(markdown).toContain('Hidden held previews: 1');
    expect(markdown).toContain('Read/ack evidence: 2');
    expect(markdown).toContain(
      'Aligned approved Minh/course A1 inbox entries: 1',
    );
    expect(markdown).toContain('Aligned Minh/course A1 read receipts: 1');
    expect(markdown).toContain('## Parent Inbox Rows');
    expect(markdown).toContain('## Read/Ack Rows');
    expect(markdown).toContain('HIDDEN_LOCAL_DEMO');
    expect(markdown).toContain(
      '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
    );
  });

  it('builds a fixture-only class session attendance progress report', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      providerApiUsed: false,
      paymentProviderUsed: false,
      liveAdsExecuted: false,
      realStudentMutationUsed: false,
      realCourseMutationUsed: false,
      realEnrollmentMutationUsed: false,
      realClassMutationUsed: false,
      realSessionMutationUsed: false,
      realAttendanceMutationUsed: false,
      realProgressMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      classCount: 2,
      activeClassCount: 1,
      completedClassCount: 1,
      sessionCount: 5,
      completedSessionCount: 4,
      scheduledSessionCount: 1,
      attendanceRecordCount: 8,
      presentAttendanceCount: 4,
      lateAttendanceCount: 2,
      absentAttendanceCount: 1,
      excusedAttendanceCount: 1,
      attendedAttendanceCount: 6,
      attendanceRatePercent: 75,
      progressRecordCount: 4,
      completedProgressCount: 1,
      inProgressCount: 1,
      needsSupportCount: 1,
      withdrawnProgressCount: 1,
      completedLessonCount: 6,
      totalLessonCount: 11,
      overallCompletionPercent: 55,
      averageLearnerCompletionPercent: 58,
    });
    expect(report.statusCounts.attendance).toEqual({
      PRESENT: 4,
      ABSENT: 1,
      LATE: 2,
      EXCUSED: 1,
    });
    expect(report.statusCounts.progress).toEqual({
      NOT_STARTED: 0,
      IN_PROGRESS: 1,
      NEEDS_SUPPORT: 1,
      COMPLETED: 1,
      WITHDRAWN: 1,
    });
  });

  it('aggregates class attendance and completion states', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );
    const a1 = report.classAggregates.find(
      (row) => row.classCode === 'MH-A1-JUN-WEEKDAY',
    );
    const phonics = report.classAggregates.find(
      (row) => row.classCode === 'MH-PHONICS-MAY',
    );

    expect(a1).toEqual(
      expect.objectContaining({
        studentCount: 3,
        sessionCount: 3,
        completedSessionCount: 2,
        scheduledSessionCount: 1,
        attendanceRecordCount: 6,
        presentAttendanceCount: 3,
        lateAttendanceCount: 1,
        absentAttendanceCount: 1,
        excusedAttendanceCount: 1,
        attendanceRatePercent: 67,
        averageLearnerCompletionPercent: 44,
        needsSupportCount: 1,
      }),
    );
    expect(phonics).toEqual(
      expect.objectContaining({
        studentCount: 1,
        completedSessionCount: 2,
        attendanceRecordCount: 2,
        lateAttendanceCount: 1,
        attendanceRatePercent: 100,
        averageLearnerCompletionPercent: 100,
        completedProgressCount: 1,
      }),
    );
  });

  it('keeps scheduled sessions read-only without attendance records', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );
    const scheduled = report.sessionRows.find(
      (row) => row.sessionId === 'session-a1-003-family',
    );

    expect(scheduled).toEqual(
      expect.objectContaining({
        status: 'SCHEDULED',
        attendanceRecordCount: 0,
        presentAttendanceCount: 0,
        absentAttendanceCount: 0,
        lateAttendanceCount: 0,
        excusedAttendanceCount: 0,
      }),
    );
  });

  it('renders class session attendance progress Markdown evidence', () => {
    const report = service.buildClassSessionAttendanceProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T00:00:00.000Z',
    );
    const markdown = service.toClassSessionAttendanceProgressMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realAttendanceMutationUsed=false');
    expect(markdown).toContain('## Session Rows');
    expect(markdown).toContain('MH-A1-JUN-WEEKDAY');
    expect(markdown).toContain('NEEDS_SUPPORT');
  });

  it('builds a fixture-only lesson assignment assessment progress report', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      providerApiUsed: false,
      paymentProviderUsed: false,
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      classCount: 2,
      lessonCount: 5,
      publishedLessonCount: 4,
      scheduledLessonCount: 1,
      assignmentCount: 6,
      quizCount: 3,
      assignmentTaskCount: 3,
      openAssignmentCount: 2,
      closedAssignmentCount: 4,
      expectedSubmissionCount: 14,
      submissionRecordCount: 14,
      submittedSubmissionCount: 5,
      lateSubmissionCount: 2,
      missingSubmissionCount: 6,
      resubmittedSubmissionCount: 1,
      completedSubmissionCount: 8,
      scoredSubmissionCount: 8,
      feedbackGivenCount: 6,
      pendingFeedbackCount: 2,
      feedbackNotRequiredCount: 6,
      excellentScoreCount: 3,
      onTrackScoreCount: 4,
      needsSupportScoreCount: 1,
      missingScoreCount: 6,
      averageScorePercent: 86,
      learnerAssessmentCount: 4,
      excellentLearnerCount: 1,
      onTrackLearnerCount: 1,
      needsSupportLearnerCount: 1,
      missingLearnerCount: 0,
      withdrawnLearnerCount: 1,
      overallAssignmentCompletionPercent: 57,
      averageLearnerScorePercent: 83,
    });
  });

  it('covers submitted missing late and resubmitted assessment states', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );

    expect(report.statusCounts.submission).toEqual({
      SUBMITTED: 5,
      LATE: 2,
      MISSING: 6,
      RESUBMITTED: 1,
    });
    expect(report.statusCounts.feedback).toEqual({
      GIVEN: 6,
      PENDING: 2,
      NOT_REQUIRED: 6,
    });

    const colorsQuiz = report.assignmentRows.find(
      (row) => row.assignmentId === 'assignment-a1-002-colors-quiz',
    );
    expect(colorsQuiz).toEqual(
      expect.objectContaining({
        kind: 'QUIZ',
        expectedSubmissionCount: 3,
        missingSubmissionCount: 2,
        resubmittedSubmissionCount: 1,
        scoredSubmissionCount: 1,
        averageScorePercent: 90,
      }),
    );
  });

  it('aggregates learner assessment bands with progress evidence', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );
    const ava = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-ava-a1-active',
    );
    const minh = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-minh-a1-pending',
    );
    const khoa = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-khoa-a1-canceled',
    );
    const linh = report.learnerRows.find(
      (row) => row.enrollmentId === 'enroll-linh-phonics-active',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        expectedAssignmentCount: 4,
        submittedSubmissionCount: 3,
        resubmittedSubmissionCount: 1,
        missingSubmissionCount: 0,
        averageScorePercent: 88,
        assignmentCompletionPercent: 100,
        progressCompletionPercent: 67,
        assessmentBand: 'ON_TRACK',
      }),
    );
    expect(minh).toEqual(
      expect.objectContaining({
        expectedAssignmentCount: 4,
        lateSubmissionCount: 1,
        missingSubmissionCount: 3,
        averageScorePercent: 70,
        assignmentCompletionPercent: 25,
        progressCompletionPercent: 33,
        assessmentBand: 'NEEDS_SUPPORT',
      }),
    );
    expect(khoa).toEqual(
      expect.objectContaining({
        missingSubmissionCount: 3,
        progressStatus: 'WITHDRAWN',
        assessmentBand: 'WITHDRAWN',
      }),
    );
    expect(linh).toEqual(
      expect.objectContaining({
        expectedAssignmentCount: 2,
        lateSubmissionCount: 1,
        averageScorePercent: 94,
        assignmentCompletionPercent: 100,
        progressCompletionPercent: 100,
        assessmentBand: 'EXCELLENT',
      }),
    );
  });

  it('renders lesson assignment assessment Markdown evidence', () => {
    const report = service.buildLessonAssignmentAssessmentProgressReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T01:00:00.000Z',
    );
    const markdown =
      service.toLessonAssignmentAssessmentProgressMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realLessonMutationUsed=false');
    expect(markdown).toContain('realAssignmentMutationUsed=false');
    expect(markdown).toContain('realAssessmentMutationUsed=false');
    expect(markdown).toContain('## Assignment Rows');
    expect(markdown).toContain('Colors and objects quiz');
    expect(markdown).toContain('Resubmitted');
    expect(markdown).toContain('WITHDRAWN');
  });

  it('builds a fixture-only learning path daily plan video practice report', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      learningPathCount: 4,
      activeLearningPathCount: 1,
      completedLearningPathCount: 1,
      needsSupportLearningPathCount: 1,
      withdrawnLearningPathCount: 1,
      dailyPlanCount: 10,
      completedDailyPlanCount: 6,
      inProgressDailyPlanCount: 1,
      blockedDailyPlanCount: 1,
      skippedDailyPlanCount: 2,
      assignedDailyPlanCount: 0,
      blockedSkippedIncompleteDailyPlanCount: 4,
      videoEvidenceCount: 10,
      completedVideoCount: 6,
      incompleteVideoCount: 2,
      skippedVideoCount: 2,
      practiceAttemptCount: 10,
      passedPracticeCount: 6,
      needsRetryPracticeCount: 1,
      incompletePracticeCount: 1,
      skippedPracticeCount: 2,
      averagePracticeScorePercent: 82,
      overallDailyPlanCompletionPercent: 60,
      averageLearnerProgressPercent: 63,
      onTrackLearnerCount: 2,
      needsSupportLearnerCount: 1,
      inactiveLearnerCount: 0,
      withdrawnLearnerCount: 1,
    });
  });

  it('covers daily-plan blocked skipped incomplete video and practice states', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );

    expect(report.statusCounts.dailyPlan).toEqual({
      COMPLETED: 6,
      IN_PROGRESS: 1,
      BLOCKED: 1,
      SKIPPED: 2,
      ASSIGNED: 0,
    });
    expect(report.statusCounts.videoEvidence).toEqual({
      COMPLETED: 6,
      INCOMPLETE: 2,
      SKIPPED: 2,
    });
    expect(report.statusCounts.practiceAttempt).toEqual({
      PASSED: 6,
      NEEDS_RETRY: 1,
      INCOMPLETE: 1,
      SKIPPED: 2,
    });

    const minhBlockedPlan = report.dailyPlanRows.find(
      (row) => row.dailyPlanId === 'plan-minh-a1-day-02',
    );
    expect(minhBlockedPlan).toEqual(
      expect.objectContaining({
        dailyPlanStatus: 'BLOCKED',
        videoEvidenceStatus: 'INCOMPLETE',
        videoCompletionPercent: 21,
        practiceAttemptStatus: 'NEEDS_RETRY',
        practiceScorePercent: 58,
      }),
    );
  });

  it('aggregates learner path progress bands for parent and teacher review', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );
    const ava = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-ava-a1-june',
    );
    const minh = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-minh-a1-june',
    );
    const linh = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-linh-phonics-may',
    );
    const khoa = report.learningPathRows.find(
      (row) => row.learningPathId === 'path-khoa-a1-withdrawn',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        dailyPlanCount: 3,
        completedDailyPlanCount: 2,
        completedVideoCount: 2,
        passedPracticeCount: 2,
        averagePracticeScorePercent: 88,
        progressPercent: 67,
        learnerStatusBand: 'ON_TRACK',
      }),
    );
    expect(minh).toEqual(
      expect.objectContaining({
        blockedDailyPlanCount: 1,
        skippedDailyPlanCount: 1,
        averagePracticeScorePercent: 65,
        progressPercent: 33,
        learnerStatusBand: 'NEEDS_SUPPORT',
      }),
    );
    expect(linh).toEqual(
      expect.objectContaining({
        averagePracticeScorePercent: 94,
        progressPercent: 100,
        learnerStatusBand: 'ON_TRACK',
      }),
    );
    expect(khoa).toEqual(
      expect.objectContaining({
        pathStatus: 'WITHDRAWN',
        progressPercent: 50,
        learnerStatusBand: 'WITHDRAWN',
      }),
    );
  });

  it('renders learning path daily plan video practice Markdown evidence', () => {
    const report =
      service.buildLearningPathDailyPlanVideoPracticeEvidenceReport(
        learningLocalDemoCoreFixture,
        '2026-06-30T02:00:00.000Z',
      );
    const markdown =
      service.toLearningPathDailyPlanVideoPracticeEvidenceMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('noProductionDbRead=true');
    expect(markdown).toContain('realLearningPathMutationUsed=false');
    expect(markdown).toContain('realDailyPlanMutationUsed=false');
    expect(markdown).toContain('realVideoEvidenceMutationUsed=false');
    expect(markdown).toContain('realPracticeMutationUsed=false');
    expect(markdown).toContain('## Daily Plan Video Practice Rows');
    expect(markdown).toContain('Ava A1 daily video and practice path');
    expect(markdown).toContain('NEEDS_RETRY');
  });

  it('builds a fixture-only parent teacher progress alert intervention report', () => {
    const report = service.buildParentTeacherProgressAlertInterventionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T03:00:00.000Z',
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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      studentCount: 4,
      courseCount: 2,
      learnerProgressSummaryCount: 4,
      alertCount: 7,
      highRiskAlertCount: 2,
      mediumRiskAlertCount: 5,
      resolvedAlertCount: 1,
      followUpNeededAlertCount: 6,
      teacherInterventionRecommendationCount: 7,
      parentSummaryCount: 7,
      openFollowUpCount: 3,
      scheduledFollowUpCount: 2,
      resolvedFollowUpCount: 1,
      monitoringFollowUpCount: 1,
    });
    expect(report.statusCounts.alertReason).toEqual({
      MISSING_SUBMISSIONS: 1,
      LOW_PRACTICE_SCORE: 1,
      SKIPPED_VIDEO: 2,
      ATTENDANCE_SESSION_GAP: 1,
      STALLED_DAILY_PLAN: 2,
    });
  });

  it('derives deterministic parent teacher alert rows from fixture evidence', () => {
    const report = service.buildParentTeacherProgressAlertInterventionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T03:00:00.000Z',
    );

    const minh = report.learnerSummaries.find(
      (row) => row.enrollmentId === 'enroll-minh-a1-pending',
    );
    const avaStalled = report.alertRows.find(
      (row) => row.alertId === 'alert-student-ava-stalled-daily-plan',
    );
    const khoaResolved = report.alertRows.find(
      (row) => row.alertId === 'alert-student-khoa-skipped-video',
    );

    expect(minh).toEqual(
      expect.objectContaining({
        progressStatus: 'NEEDS_SUPPORT',
        progressPercent: 33,
        attendanceRatePercent: 50,
        missingSubmissionCount: 3,
        skippedVideoCount: 1,
        blockedDailyPlanCount: 1,
        averagePracticeScorePercent: 65,
        alertCount: 5,
        highRiskAlertCount: 2,
        mediumRiskAlertCount: 3,
        followUpNeededAlertCount: 5,
        highestAlertSeverity: 'HIGH',
      }),
    );
    expect(avaStalled).toEqual(
      expect.objectContaining({
        alertSeverity: 'MEDIUM',
        alertReason: 'STALLED_DAILY_PLAN',
        followUpStatus: 'MONITORING',
        parentSummary:
          'Ava Nguyen is on track but should finish the open fixture daily plan.',
      }),
    );
    expect(khoaResolved).toEqual(
      expect.objectContaining({
        alertSeverity: 'MEDIUM',
        alertReason: 'SKIPPED_VIDEO',
        followUpStatus: 'RESOLVED',
        teacherInterventionRecommendation:
          'Teacher marks the skipped-video item resolved because this learner is withdrawn in synthetic fixtures.',
      }),
    );
  });

  it('renders parent teacher alert intervention Markdown evidence', () => {
    const report = service.buildParentTeacherProgressAlertInterventionReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T03:00:00.000Z',
    );
    const markdown =
      service.toParentTeacherProgressAlertInterventionMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('aiProviderUsed=false');
    expect(markdown).toContain('notificationProviderUsed=false');
    expect(markdown).toContain('realParentMessageMutationUsed=false');
    expect(markdown).toContain('realTeacherInterventionMutationUsed=false');
    expect(markdown).toContain('## Top Alert Reasons');
    expect(markdown).toContain('Missing submissions');
    expect(markdown).toContain('Teacher intervention');
    expect(markdown).toContain('Parent summary');
  });

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

  it('builds a fixture-only AI tutor chat safety teacher review report', () => {
    const report = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T06:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      aiProviderUsed: false,
      aiProviderExecutionUsed: false,
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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realLearningSupportMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      chatSessionCount: 4,
      messageCount: 12,
      allowedMessageCount: 8,
      blockedMessageCount: 4,
      safetyFlagCount: 4,
      blockedTopicCount: 4,
      teacherReviewItemCount: 4,
      reviewedTeacherReviewItemCount: 2,
      parentSummaryCount: 3,
      studentsNeedingSupportCount: 3,
      topicCategoryCount: 8,
      supportRecommendationCount: 4,
    });
    expect(report.statusCounts).toEqual({
      sessionStatus: {
        ACTIVE: 0,
        ESCALATED: 3,
        CLOSED: 1,
      },
      messageRole: {
        STUDENT: 8,
        AI_TUTOR: 4,
      },
      guardDecision: {
        ALLOWED: 8,
        BLOCKED: 4,
      },
      topicCategory: {
        LESSON_HELP: 2,
        PRACTICE_HINT: 4,
        STUDY_PLANNING: 1,
        PERSONAL_DATA: 1,
        OFF_TOPIC_GAMING: 1,
        ACCOUNT_ACCESS: 1,
        SAFETY_REDIRECT: 1,
        ACADEMIC_INTEGRITY: 1,
      },
      safetySeverity: {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 1,
      },
      teacherReviewStatus: {
        OPEN: 2,
        REVIEWED: 1,
        RESOLVED: 1,
      },
      supportPriority: {
        LOW: 0,
        MEDIUM: 2,
        HIGH: 2,
      },
      supportRecommendationStatus: {
        RECOMMENDED: 1,
        MONITORING: 1,
        COMPLETED: 2,
      },
    });
  });

  it('derives AI tutor safety review and learning support rollups', () => {
    const report = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T06:00:00.000Z',
    );

    const minhSession = report.chatSessionRows.find(
      (row) => row.chatSessionId === 'ai-chat-minh-colors-off-topic',
    );
    const linhSession = report.chatSessionRows.find(
      (row) => row.chatSessionId === 'ai-chat-linh-phonics-short-e',
    );
    const accountReview = report.teacherReviewRows.find(
      (row) => row.teacherReviewItemId === 'ai-review-khoa-account-access',
    );
    const avaSummary = report.parentSummaryRows.find(
      (row) => row.parentSummaryId === 'ai-parent-summary-ava-colors',
    );
    const khoaSupportRows = report.supportRecommendationRows.filter(
      (row) => row.studentId === 'student-khoa',
    );

    expect(minhSession).toEqual(
      expect.objectContaining({
        studentName: 'Minh Tran',
        dailyPlanId: 'plan-minh-a1-day-02',
        lessonCode: 'A1-L02',
        messageCount: 3,
        allowedMessageCount: 2,
        blockedMessageCount: 1,
        safetyFlagCount: 1,
        teacherReviewItemCount: 1,
        supportRecommendationCount: 1,
        parentSummaryReady: true,
      }),
    );
    expect(linhSession).toEqual(
      expect.objectContaining({
        sessionStatus: 'CLOSED',
        safetyFlagCount: 0,
        teacherReviewItemCount: 0,
        parentSummaryReady: true,
      }),
    );
    expect(accountReview).toEqual(
      expect.objectContaining({
        studentName: 'Khoa Le',
        topicCategory: 'ACCOUNT_ACCESS',
        severity: 'HIGH',
        reviewStatus: 'OPEN',
        parentSummaryReady: false,
        supportRecommendationCount: 1,
      }),
    );
    expect(avaSummary).toEqual(
      expect.objectContaining({
        parentGuardianName: 'Ava Parent',
        courseCode: 'MH-A1-STARTER',
        classCode: 'MH-A1-JUN-WEEKDAY',
      }),
    );
    expect(khoaSupportRows).toHaveLength(2);
    expect(khoaSupportRows).toContainEqual(
      expect.objectContaining({
        priority: 'HIGH',
        status: 'MONITORING',
      }),
    );
  });

  it('renders AI tutor chat safety teacher review Markdown evidence', () => {
    const report = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T06:00:00.000Z',
    );
    const markdown = service.toAiTutorChatSafetyTeacherReviewMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('aiProviderExecutionUsed=false');
    expect(markdown).toContain('realAiChatMutationUsed=false');
    expect(markdown).toContain('realAiModerationMutationUsed=false');
    expect(markdown).toContain('realParentMessageMutationUsed=false');
    expect(markdown).toContain('realTeacherInterventionMutationUsed=false');
    expect(markdown).toContain('realLearningSupportMutationUsed=false');
    expect(markdown).toContain('Chat sessions: 4');
    expect(markdown).toContain('Blocked messages: 4');
    expect(markdown).toContain('## Teacher Review Queue');
    expect(markdown).toContain('ai-chat-minh-colors-off-topic');
    expect(markdown).toContain('## Learning Support Recommendation Rows');
  });

  it('builds a fixture-only student achievement badge certificate report', () => {
    const report = service.buildStudentAchievementBadgeCertificateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T07:00:00.000Z',
    );

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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      achievementRecords: 6,
      badgeAwards: 4,
      certificateFixtures: 3,
      milestonesCompleted: 5,
      milestonesPending: 2,
      recognitionSummaries: 5,
      parentVisibleRecognitions: 3,
      teacherReviewItems: 3,
      studentsWithBadges: 2,
      studentsNearCertificate: 1,
      studentsNeedingEncouragement: 2,
    });
    expect(report.statusCounts).toEqual({
      achievementKind: {
        LESSON_MASTERY: 1,
        PRACTICE_STREAK: 1,
        ASSESSMENT_SCORE: 2,
        SAFE_TUTOR_USE: 1,
        COURSE_COMPLETION: 1,
      },
      badgeAwardStatus: {
        AWARDED: 4,
        HELD_FOR_TEACHER_REVIEW: 0,
      },
      certificateStatus: {
        READY: 1,
        PENDING: 1,
        HELD_FOR_REVIEW: 1,
      },
      milestoneStatus: {
        COMPLETED: 5,
        PENDING: 2,
      },
      recognitionAudience: {
        PARENT: 2,
        TEACHER: 3,
      },
      recognitionStatus: {
        PARENT_VISIBLE: 2,
        TEACHER_REVIEW: 1,
        ENCOURAGEMENT_NEEDED: 2,
      },
    });
  });

  it('derives achievement recognition and certificate rows from existing learning evidence', () => {
    const report = service.buildStudentAchievementBadgeCertificateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T07:00:00.000Z',
    );

    const ava = report.studentRows.find(
      (row) => row.studentId === 'student-ava',
    );
    const linhCertificate = report.certificateRows.find(
      (row) => row.certificateFixtureId === 'certificate-linh-phonics-ready',
    );
    const minhRecognition = report.recognitionRows.find(
      (row) =>
        row.recognitionSummaryId === 'recognition-minh-parent-encouragement',
    );
    const khoaAchievement = report.achievementRows.find(
      (row) =>
        row.achievementRecordId === 'achievement-khoa-prewithdrawal-greetings',
    );

    expect(ava).toEqual(
      expect.objectContaining({
        studentName: 'Ava Nguyen',
        progressStatus: 'IN_PROGRESS',
        achievementRecordCount: 2,
        badgeAwardCount: 2,
        completedMilestoneCount: 2,
        pendingMilestoneCount: 1,
        certificateStatus: 'PENDING',
        nearCertificate: true,
        needsEncouragement: false,
      }),
    );
    expect(linhCertificate).toEqual(
      expect.objectContaining({
        studentName: 'Linh Pham',
        courseCode: 'MH-PHONICS-BOOSTER',
        status: 'READY',
        completedBadgeAwardCount: 2,
        pendingMilestoneCount: 0,
        certificatePreviewRef: 'fixture-certificate-preview-linh-phonics',
      }),
    );
    expect(minhRecognition).toEqual(
      expect.objectContaining({
        parentGuardianName: 'Minh Parent',
        status: 'ENCOURAGEMENT_NEEDED',
        parentVisible: true,
        teacherReviewRequired: true,
        sourceAiTutorSupportRecommendationId: 'ai-support-minh-colors-redirect',
      }),
    );
    expect(khoaAchievement).toEqual(
      expect.objectContaining({
        studentName: 'Khoa Le',
        progressStatus: 'WITHDRAWN',
        aiTutorSupportRecommendationId: 'ai-support-khoa-hint-only',
        evidenceScorePercent: 80,
      }),
    );
  });

  it('renders student achievement badge certificate Markdown evidence', () => {
    const report = service.buildStudentAchievementBadgeCertificateReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T07:00:00.000Z',
    );
    const markdown =
      service.toStudentAchievementBadgeCertificateMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('certificateIssuerProviderUsed=false');
    expect(markdown).toContain('realAchievementMutationUsed=false');
    expect(markdown).toContain('realBadgeMutationUsed=false');
    expect(markdown).toContain('realCertificateMutationUsed=false');
    expect(markdown).toContain('realCredentialIssuanceUsed=false');
    expect(markdown).toContain('realRecognitionNotificationMutationUsed=false');
    expect(markdown).toContain('Achievement records: 6');
    expect(markdown).toContain('Badge awards: 4');
    expect(markdown).toContain('## Certificate Fixture Rows');
    expect(markdown).toContain('certificate-linh-phonics-ready');
    expect(markdown).toContain('## Recognition Summary Rows');
    expect(markdown).toContain('ai-support-minh-colors-redirect');
  });

  it('builds a fixture-only parent teacher weekly digest report', () => {
    const report = service.buildParentTeacherWeeklyDigestReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T08:00:00.000Z',
    );

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
      realParentMessageMutationUsed: false,
      realTeacherInterventionMutationUsed: false,
      realWeeklyDigestNotificationMutationUsed: false,
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      digestCount: 5,
      parentDigestCount: 3,
      teacherDigestCount: 2,
      readyToSendDigestCount: 2,
      teacherReviewDigestCount: 2,
      heldWithdrawnDigestCount: 1,
      parentVisibleDigestCount: 2,
      teacherOnlyDigestCount: 3,
      actionCount: 6,
      highPriorityActionCount: 2,
      scheduledActionCount: 2,
      completedActionCount: 1,
      studentsCovered: 4,
      studentsNeedingTeacherReview: 3,
      studentsReadyForParentSend: 2,
    });
    expect(report.statusCounts).toEqual({
      audience: {
        PARENT: 3,
        TEACHER: 2,
      },
      deliveryStatus: {
        READY_TO_SEND: 2,
        TEACHER_REVIEW: 2,
        HELD_WITHDRAWN: 1,
      },
      actionPriority: {
        LOW: 1,
        MEDIUM: 3,
        HIGH: 2,
      },
      actionStatus: {
        RECOMMENDED: 2,
        SCHEDULED: 2,
        COMPLETED: 1,
        HELD: 1,
      },
      actionOwner: {
        PARENT: 3,
        TEACHER: 3,
      },
    });
  });

  it('derives weekly digest rows from progress alerts achievements and review evidence', () => {
    const report = service.buildParentTeacherWeeklyDigestReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T08:00:00.000Z',
    );

    const avaTeacher = report.digestRows.find(
      (row) => row.digestId === 'digest-ava-teacher-2026-w23',
    );
    const minhParent = report.digestRows.find(
      (row) => row.digestId === 'digest-minh-parent-2026-w23',
    );
    const khoaTeacher = report.digestRows.find(
      (row) => row.digestId === 'digest-khoa-teacher-2026-w23',
    );
    const linhStudent = report.studentRows.find(
      (row) => row.studentId === 'student-linh',
    );

    expect(avaTeacher).toEqual(
      expect.objectContaining({
        audience: 'TEACHER',
        deliveryStatus: 'TEACHER_REVIEW',
        parentVisible: false,
        progressStatus: 'IN_PROGRESS',
        completionPercent: 67,
        certificateStatus: 'PENDING',
        actionCount: 1,
        sourceCertificateFixtureId: 'certificate-ava-a1-near-ready',
      }),
    );
    expect(avaTeacher?.sourceAiTutorTeacherReviewItemIds).toContain(
      'ai-review-ava-personal-data',
    );
    expect(minhParent).toEqual(
      expect.objectContaining({
        studentName: 'Minh Tran',
        audience: 'PARENT',
        deliveryStatus: 'TEACHER_REVIEW',
        parentVisible: false,
        assignmentCompletionPercent: 25,
        averagePracticeScorePercent: 65,
        alertCount: 3,
        highRiskAlertCount: 2,
        highPriorityActionCount: 1,
      }),
    );
    expect(khoaTeacher).toEqual(
      expect.objectContaining({
        studentName: 'Khoa Le',
        deliveryStatus: 'HELD_WITHDRAWN',
        progressStatus: 'WITHDRAWN',
        parentVisible: false,
        certificateStatus: 'HELD_FOR_REVIEW',
        sourceCertificateFixtureId: 'certificate-khoa-a1-held',
      }),
    );
    expect(linhStudent).toEqual(
      expect.objectContaining({
        parentDigestCount: 1,
        teacherDigestCount: 0,
        readyToSendDigestCount: 1,
        actionCount: 1,
        completedActionCount: 1,
        nextActionDueAt: null,
      }),
    );
  });

  it('renders parent teacher weekly digest Markdown evidence', () => {
    const report = service.buildParentTeacherWeeklyDigestReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T08:00:00.000Z',
    );
    const markdown = service.toParentTeacherWeeklyDigestMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain(
      'realWeeklyDigestNotificationMutationUsed=false',
    );
    expect(markdown).toContain('Weekly digests: 5');
    expect(markdown).toContain('Students needing teacher review: 3');
    expect(markdown).toContain('## Weekly Digest Rows');
    expect(markdown).toContain('digest-minh-parent-2026-w23');
    expect(markdown).toContain('## Action Rows');
    expect(markdown).toContain('digest-action-khoa-teacher-hold');
  });

  it('builds a fixture-only follow-up action outcome report', () => {
    const report = service.buildFollowUpActionOutcomeReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T09:00:00.000Z',
    );

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
      realPaymentMutationUsed: false,
      realRefundMutationUsed: false,
      realCommissionMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
    });
    expect(report.totals).toEqual({
      outcomeCount: 6,
      completedOutcomeCount: 1,
      verifiedOutcomeCount: 1,
      scheduledOutcomeCount: 1,
      monitoringOutcomeCount: 2,
      heldOutcomeCount: 1,
      parentVisibleOutcomeCount: 2,
      teacherOnlyOutcomeCount: 4,
      positiveOutcomeCount: 2,
      needsSupportOutcomeCount: 2,
      noSendOutcomeCount: 1,
      linkedDailyPlanCount: 6,
      linkedSupportRecommendationCount: 5,
      linkedAchievementCount: 4,
      linkedParentSummaryCount: 3,
      linkedTeacherReviewCount: 3,
      studentsCovered: 4,
      studentsWithCompletedOrVerifiedOutcome: 2,
      studentsWithOpenOutcome: 3,
    });
    expect(report.statusCounts).toEqual({
      outcomeStatus: {
        COMPLETED: 1,
        VERIFIED: 1,
        SCHEDULED: 1,
        MONITORING: 2,
        HELD: 1,
      },
      impactBand: {
        POSITIVE: 2,
        STABLE: 1,
        NEEDS_SUPPORT: 2,
        NO_SEND: 1,
      },
      actionOwner: {
        PARENT: 3,
        TEACHER: 3,
      },
      actionPriority: {
        LOW: 1,
        MEDIUM: 3,
        HIGH: 2,
      },
    });
  });

  it('derives follow-up outcome rows from digest actions and learning evidence', () => {
    const report = service.buildFollowUpActionOutcomeReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T09:00:00.000Z',
    );

    const minhTeacher = report.outcomeRows.find(
      (row) => row.outcomeId === 'followup-outcome-minh-teacher-recovery-plan',
    );
    const linhParent = report.outcomeRows.find(
      (row) => row.outcomeId === 'followup-outcome-linh-parent-celebrate',
    );
    const khoaHold = report.outcomeRows.find(
      (row) => row.outcomeId === 'followup-outcome-khoa-teacher-hold',
    );
    const avaStudent = report.studentRows.find(
      (row) => row.studentId === 'student-ava',
    );

    expect(minhTeacher).toEqual(
      expect.objectContaining({
        studentName: 'Minh Tran',
        actionId: 'digest-action-minh-teacher-recovery-plan',
        digestDeliveryStatus: 'TEACHER_REVIEW',
        actionOwner: 'TEACHER',
        actionPriority: 'HIGH',
        outcomeStatus: 'SCHEDULED',
        impactBand: 'NEEDS_SUPPORT',
        parentVisible: false,
        dailyPlanStatus: 'BLOCKED',
        supportRecommendationId: 'ai-support-minh-colors-redirect',
        supportStatus: 'RECOMMENDED',
        achievementKind: 'SAFE_TUTOR_USE',
        teacherReviewItemId: 'ai-review-minh-off-topic-game',
        teacherReviewStatus: 'OPEN',
      }),
    );
    expect(linhParent).toEqual(
      expect.objectContaining({
        actionOwner: 'PARENT',
        outcomeStatus: 'COMPLETED',
        impactBand: 'POSITIVE',
        parentVisible: true,
        parentSummaryReady: true,
        achievementKind: 'COURSE_COMPLETION',
      }),
    );
    expect(khoaHold).toEqual(
      expect.objectContaining({
        actionStatus: 'HELD',
        outcomeStatus: 'HELD',
        impactBand: 'NO_SEND',
        dailyPlanStatus: 'COMPLETED',
        supportStatus: 'MONITORING',
        teacherReviewStatus: 'OPEN',
        parentSummaryReady: false,
      }),
    );
    expect(avaStudent).toEqual(
      expect.objectContaining({
        outcomeCount: 2,
        completedOrVerifiedCount: 1,
        scheduledOrMonitoringCount: 1,
        parentVisibleOutcomeCount: 1,
        nextReviewAt: '2026-06-07T09:00:00.000Z',
      }),
    );
  });

  it('renders follow-up action outcome Markdown evidence', () => {
    const report = service.buildFollowUpActionOutcomeReport(
      learningLocalDemoCoreFixture,
      '2026-06-30T09:00:00.000Z',
    );
    const markdown = service.toFollowUpActionOutcomeMarkdown(report);

    expect(markdown).toContain('## Safety');
    expect(markdown).toContain('realFollowUpActionOutcomeMutationUsed=false');
    expect(markdown).toContain('Follow-up outcomes: 6');
    expect(markdown).toContain('Linked support recommendations: 5');
    expect(markdown).toContain('## Outcome Rows');
    expect(markdown).toContain('followup-outcome-minh-teacher-recovery-plan');
    expect(markdown).toContain('ai-support-minh-colors-redirect');
    expect(markdown).toContain('ai-review-khoa-account-access');
  });

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

  it('exposes the report through the controller', () => {
    const controller = new LearningLocalDemoController(service);
    const report = controller.getStudentCourseEnrollmentSubscriptionReport();

    expect(report.reportName).toBe(
      'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment -> Refund/Commission Report',
    );
    expect(report.rows).toHaveLength(4);
    expect(report.rows).toContainEqual(
      expect.objectContaining({
        enrollmentId: 'enroll-linh-phonics-active',
        commissionPayableCents: 25200000,
        commissionApprovedCents: 28800000,
      }),
    );

    const flowReport =
      controller.getStudentCourseEnrollmentSubscriptionFlowReport();
    expect(flowReport.reportName).toBe(
      'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment fixture -> Refund/Commission fixture Flow Report',
    );
    expect(flowReport.productionReady).toBe(false);
    expect(flowReport.fixtureOnly).toBe(true);
    expect(flowReport.totals).toEqual(
      expect.objectContaining({
        studentCount: 4,
        courseCount: 2,
        enrollmentCount: 4,
        subscriptionCount: 4,
        fixturePaymentEvidenceCount: 4,
        refundEvidenceCount: 1,
        commissionEvidenceCount: 4,
        openSafetyGateCount: 0,
      }),
    );

    const accessReport =
      controller.getSubscriptionEntitlementDailyPlanAccessReport();
    expect(accessReport.reportName).toBe(
      'Learning local demo Subscription Entitlement -> Daily Plan Access Gate Report',
    );
    expect(accessReport.productionReady).toBe(false);
    expect(accessReport.fixtureOnly).toBe(true);
    expect(accessReport.totals).toEqual(
      expect.objectContaining({
        studentCount: 4,
        courseCount: 2,
        enrollmentCount: 4,
        subscriptionCount: 4,
        entitlementCount: 4,
        dailyPlanAccessCaseCount: 4,
        unlockedAccessCount: 2,
        blockedAccessCount: 2,
        blockedExpiredCount: 1,
        blockedRevokedCount: 1,
        lifecycleRowCount: 5,
        openSafetyGateCount: 0,
      }),
    );

    const parentTeacherProgressAccessSummaryReport =
      controller.getParentTeacherProgressAccessSummaryReport();
    expect(parentTeacherProgressAccessSummaryReport.reportName).toBe(
      'Learning local demo Parent/Teacher Progress Access Summary Report',
    );
    expect(parentTeacherProgressAccessSummaryReport.progressRows).toHaveLength(
      4,
    );
    expect(
      parentTeacherProgressAccessSummaryReport.parentSummaryRows,
    ).toHaveLength(4);
    expect(
      parentTeacherProgressAccessSummaryReport.teacherSummaryRows,
    ).toHaveLength(4);
    expect(parentTeacherProgressAccessSummaryReport.totals).toEqual(
      expect.objectContaining({
        parentGuardianCount: 4,
        teacherCount: 3,
        progressSummaryCount: 4,
        parentSummaryCount: 4,
        teacherSummaryCount: 4,
        blockedReasonCount: 2,
        blockedAccessInSummariesWithReasonCount: 2,
        openSafetyGateCount: 0,
      }),
    );

    const parentTeacherReportPermissionPrivacyRedactionReport =
      controller.getParentTeacherReportPermissionPrivacyRedactionReport();
    expect(parentTeacherReportPermissionPrivacyRedactionReport.reportName).toBe(
      'Learning local demo Parent/Teacher Report Permission Privacy Redaction Report',
    );
    expect(
      parentTeacherReportPermissionPrivacyRedactionReport.permissionCaseRows,
    ).toHaveLength(6);
    expect(
      parentTeacherReportPermissionPrivacyRedactionReport.fieldVisibilityRows,
    ).toHaveLength(24);
    expect(parentTeacherReportPermissionPrivacyRedactionReport.totals).toEqual(
      expect.objectContaining({
        reportPermissionCaseCount: 6,
        allowedReportCaseCount: 4,
        deniedReportCaseCount: 2,
        teacherUnassignedDeniedCaseCount: 1,
        supportOpsAuditReadOnlyCaseCount: 1,
        redactedFieldCount: 2,
        parentVisibleFieldCount: 4,
        teacherVisibleFieldCount: 8,
        supportOpsVisibleFieldCount: 3,
        permissionTraceCount: 6,
        openSafetyGateCount: 0,
      }),
    );

    const parentTeacherReportReviewQueueMessagePreviewReport =
      controller.getParentTeacherReportReviewQueueMessagePreviewReport();
    expect(parentTeacherReportReviewQueueMessagePreviewReport.reportName).toBe(
      'Learning local demo Parent/Teacher Report Review Queue Message Preview Report',
    );
    expect(
      parentTeacherReportReviewQueueMessagePreviewReport.reviewQueueRows,
    ).toHaveLength(2);
    expect(
      parentTeacherReportReviewQueueMessagePreviewReport.messagePreviewRows,
    ).toHaveLength(2);
    expect(parentTeacherReportReviewQueueMessagePreviewReport.totals).toEqual(
      expect.objectContaining({
        reportSummaryCount: 1,
        permissionRedactionReferenceCount: 2,
        reviewQueueItemCount: 2,
        approvedPreviewCount: 1,
        heldPreviewCount: 1,
        reviewDecisionTraceCount: 2,
        approvedWithPermissionRedactionEvidenceCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const parentPortalApprovedReportInboxReadReceiptReport =
      controller.getParentPortalApprovedReportInboxReadReceiptReport();
    expect(parentPortalApprovedReportInboxReadReceiptReport.reportName).toBe(
      'Learning local demo Parent Portal Approved Report Inbox Read Receipt Report',
    );
    expect(
      parentPortalApprovedReportInboxReadReceiptReport.parentInboxRows,
    ).toHaveLength(3);
    expect(
      parentPortalApprovedReportInboxReadReceiptReport.readAckRows,
    ).toHaveLength(2);
    expect(parentPortalApprovedReportInboxReadReceiptReport.totals).toEqual(
      expect.objectContaining({
        approvedPreviewCount: 2,
        heldPreviewCount: 1,
        parentInboxItemCount: 3,
        visibleParentInboxItemCount: 2,
        hiddenHeldPreviewCount: 1,
        readAckEvidenceCount: 2,
        permissionRedactionReferenceCount: 3,
        alignedApprovedParentInboxEntryCount: 1,
        alignedParentReadReceiptCount: 1,
        stableAlignedReadReceiptTraceCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const classSessionReport =
      controller.getClassSessionAttendanceProgressReport();
    expect(classSessionReport.reportName).toBe(
      'Learning local demo Class -> Session -> Attendance -> Progress Report',
    );
    expect(classSessionReport.learnerRows).toHaveLength(4);
    expect(classSessionReport.sessionRows).toHaveLength(5);
    expect(classSessionReport.totals).toEqual(
      expect.objectContaining({
        attendanceRecordCount: 8,
        presentAttendanceCount: 4,
        absentAttendanceCount: 1,
        lateAttendanceCount: 2,
        excusedAttendanceCount: 1,
        completedProgressCount: 1,
        needsSupportCount: 1,
      }),
    );

    const lessonAssignmentReport =
      controller.getLessonAssignmentAssessmentProgressReport();
    expect(lessonAssignmentReport.reportName).toBe(
      'Learning local demo Lesson -> Assignment/Quiz -> Submission -> Score/Feedback -> Progress Report',
    );
    expect(lessonAssignmentReport.lessonRows).toHaveLength(5);
    expect(lessonAssignmentReport.assignmentRows).toHaveLength(6);
    expect(lessonAssignmentReport.learnerRows).toHaveLength(4);
    expect(lessonAssignmentReport.totals).toEqual(
      expect.objectContaining({
        expectedSubmissionCount: 14,
        submissionRecordCount: 14,
        missingSubmissionCount: 6,
        lateSubmissionCount: 2,
        resubmittedSubmissionCount: 1,
        averageScorePercent: 86,
        overallAssignmentCompletionPercent: 57,
      }),
    );

    const learningPathReport =
      controller.getLearningPathDailyPlanVideoPracticeEvidenceReport();
    expect(learningPathReport.reportName).toBe(
      'Learning local demo Learning Path -> Daily Plan -> Video Evidence -> Practice Attempt -> Progress Report',
    );
    expect(learningPathReport.learningPathRows).toHaveLength(4);
    expect(learningPathReport.dailyPlanRows).toHaveLength(10);
    expect(learningPathReport.totals).toEqual(
      expect.objectContaining({
        learningPathCount: 4,
        dailyPlanCount: 10,
        videoEvidenceCount: 10,
        completedVideoCount: 6,
        practiceAttemptCount: 10,
        passedPracticeCount: 6,
        blockedSkippedIncompleteDailyPlanCount: 4,
        averagePracticeScorePercent: 82,
        averageLearnerProgressPercent: 63,
      }),
    );

    const parentTeacherAlertReport =
      controller.getParentTeacherProgressAlertInterventionReport();
    expect(parentTeacherAlertReport.reportName).toBe(
      'Learning local demo Parent/Teacher Progress Alert -> Intervention -> Parent Summary Report',
    );
    expect(parentTeacherAlertReport.learnerSummaries).toHaveLength(4);
    expect(parentTeacherAlertReport.alertRows).toHaveLength(7);
    expect(parentTeacherAlertReport.totals).toEqual(
      expect.objectContaining({
        alertCount: 7,
        highRiskAlertCount: 2,
        mediumRiskAlertCount: 5,
        followUpNeededAlertCount: 6,
        resolvedAlertCount: 1,
        teacherInterventionRecommendationCount: 7,
        parentSummaryCount: 7,
      }),
    );

    const parentScreenTimeReport =
      controller.getParentScreenTimeGuardianControlsReport();
    expect(parentScreenTimeReport.reportName).toBe(
      'Learning local demo Parent/Guardian Screen Time -> Session Gate -> Grant -> Controls Report',
    );
    expect(parentScreenTimeReport.childRows).toHaveLength(4);
    expect(parentScreenTimeReport.gateRows).toHaveLength(10);
    expect(parentScreenTimeReport.grantRows).toHaveLength(2);
    expect(parentScreenTimeReport.totals).toEqual(
      expect.objectContaining({
        parentGuardianCount: 4,
        childCount: 4,
        activeScreenTimePolicyCount: 3,
        allowedMinutes: 155,
        usedMinutes: 121,
        remainingMinutes: 34,
        grantRequestCount: 2,
        grantDecisionCount: 2,
        allowedSessionCount: 5,
        blockedSessionCount: 4,
        overrideSessionCount: 1,
        childrenNeedingParentAttentionCount: 2,
      }),
    );

    const parentScreenTimeGrantDailyPlanGuardReport =
      controller.getParentScreenTimeGrantDailyPlanGuardReport();
    expect(parentScreenTimeGrantDailyPlanGuardReport.reportName).toBe(
      'Learning local demo Parent Screen-Time Grant -> Daily Plan Guard Report',
    );
    expect(parentScreenTimeGrantDailyPlanGuardReport.accessRows).toHaveLength(
      10,
    );
    expect(
      parentScreenTimeGrantDailyPlanGuardReport.grantRuleRows,
    ).toHaveLength(2);
    expect(
      parentScreenTimeGrantDailyPlanGuardReport.sessionEvidenceRows,
    ).toHaveLength(10);
    expect(parentScreenTimeGrantDailyPlanGuardReport.totals).toEqual(
      expect.objectContaining({
        dailyPlanAccessCaseCount: 10,
        parentGrantRuleCount: 2,
        screenTimeRuleCount: 4,
        allowedSessionCount: 6,
        blockedSessionCount: 4,
        blockedReasonCount: 4,
        sessionGuardTraceCount: 10,
        learningSessionEvidenceCount: 10,
        openSafetyGateCount: 0,
      }),
    );

    const learningSessionCompletionPracticeProgressRollupReport =
      controller.getLearningSessionCompletionPracticeProgressRollupReport();
    expect(
      learningSessionCompletionPracticeProgressRollupReport.reportName,
    ).toBe(
      'Learning local demo Learning Session Completion -> Practice Progress Rollup Report',
    );
    expect(
      learningSessionCompletionPracticeProgressRollupReport.progressRollupRows,
    ).toHaveLength(6);
    expect(
      learningSessionCompletionPracticeProgressRollupReport.parentSummaryRows,
    ).toHaveLength(6);
    expect(
      learningSessionCompletionPracticeProgressRollupReport.teacherSummaryRows,
    ).toHaveLength(6);
    expect(
      learningSessionCompletionPracticeProgressRollupReport.totals,
    ).toEqual(
      expect.objectContaining({
        dailyPlanSessionReferenceCount: 6,
        lessonCompletionEvidenceCount: 6,
        practiceAttemptEvidenceCount: 6,
        progressRollupCount: 6,
        parentVisibleProgressSummaryCount: 6,
        teacherVisibleProgressSummaryCount: 6,
        stableTraceCount: 6,
        openSafetyGateCount: 0,
      }),
    );

    const teacherInterventionRemedialAssignmentSupportPlanReport =
      controller.getTeacherInterventionRemedialAssignmentSupportPlanReport();
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.reportName,
    ).toBe(
      'Learning local demo Teacher Intervention -> Remedial Assignment Support Plan Report',
    );
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.interventionReviewRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.remedialAssignmentRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.supportPlanRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.parentSummaryRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.teacherNextActionRows,
    ).toHaveLength(1);
    expect(
      teacherInterventionRemedialAssignmentSupportPlanReport.totals,
    ).toEqual(
      expect.objectContaining({
        teacherInterventionReviewCount: 1,
        remedialAssignmentCount: 1,
        supportPlanCount: 1,
        parentVisibleSupportSummaryCount: 1,
        teacherVisibleNextActionCount: 1,
        stableTraceCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const remedialRetryCompletionSupportOutcomeFollowupReport =
      controller.getRemedialRetryCompletionSupportOutcomeFollowupReport();
    expect(remedialRetryCompletionSupportOutcomeFollowupReport.reportName).toBe(
      'Learning local demo Remedial Retry Completion -> Support Outcome Follow-up Summary Report',
    );
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.retryCompletionRows,
    ).toHaveLength(1);
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.supportOutcomeRows,
    ).toHaveLength(1);
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.parentFollowupSummaryRows,
    ).toHaveLength(1);
    expect(
      remedialRetryCompletionSupportOutcomeFollowupReport.teacherFollowupSummaryRows,
    ).toHaveLength(1);
    expect(remedialRetryCompletionSupportOutcomeFollowupReport.totals).toEqual(
      expect.objectContaining({
        remedialRetryCompletionCount: 1,
        supportOutcomeEvidenceCount: 1,
        parentVisibleFollowupSummaryCount: 1,
        teacherVisibleFollowupSummaryCount: 1,
        stableTraceCount: 1,
        retryLinksCompleteCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const remedialRetryUnresolvedSupportEscalationReport =
      controller.getRemedialRetryUnresolvedSupportEscalationReport();
    expect(remedialRetryUnresolvedSupportEscalationReport.reportName).toBe(
      'Learning local demo Remedial Retry Unresolved -> Support Escalation Report',
    );
    expect(
      remedialRetryUnresolvedSupportEscalationReport.retryAttemptRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.unresolvedOutcomeRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.teacherEscalationRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.parentEscalationSummaryRows,
    ).toHaveLength(1);
    expect(
      remedialRetryUnresolvedSupportEscalationReport.teacherEscalationNextActionRows,
    ).toHaveLength(1);
    expect(remedialRetryUnresolvedSupportEscalationReport.totals).toEqual(
      expect.objectContaining({
        remedialRetryAttemptCount: 1,
        failedOrIncompleteRetryCount: 1,
        unresolvedSupportOutcomeCount: 1,
        teacherEscalationCount: 1,
        parentVisibleEscalationSummaryCount: 1,
        teacherVisibleEscalationNextActionCount: 1,
        stableTraceCount: 1,
        unresolvedRetryLinksCompleteCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const teacherEscalationFollowupResolutionReport =
      controller.getTeacherEscalationFollowupResolutionReport();
    expect(teacherEscalationFollowupResolutionReport.reportName).toBe(
      'Learning local demo Teacher Escalation Follow-up Resolution Report',
    );
    expect(
      teacherEscalationFollowupResolutionReport.resolutionRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.teacherReviewedEscalationRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.adjustedSupportRetryCompletionRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.resolvedSupportOutcomeRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.parentClosureSummaryRows,
    ).toHaveLength(1);
    expect(
      teacherEscalationFollowupResolutionReport.teacherClosureNoteRows,
    ).toHaveLength(1);
    expect(teacherEscalationFollowupResolutionReport.totals).toEqual(
      expect.objectContaining({
        unresolvedEscalationReferenceCount: 1,
        teacherReviewedEscalationCount: 1,
        adjustedSupportRetryCompletionCount: 1,
        resolvedSupportOutcomeCount: 1,
        parentVisibleClosureSummaryCount: 1,
        teacherVisibleClosureNoteCount: 1,
        stableTraceCount: 1,
        resolvedFlowLinksCompleteCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const mvpEndToEndReadinessTraceReport =
      controller.getMvpEndToEndReadinessTraceReport();
    expect(mvpEndToEndReadinessTraceReport.reportName).toBe(
      'Learning local demo MVP End-to-End Readiness Trace Report',
    );
    expect(mvpEndToEndReadinessTraceReport.traceRows).toHaveLength(1);
    expect(mvpEndToEndReadinessTraceReport.evidenceRows).toHaveLength(13);
    expect(mvpEndToEndReadinessTraceReport.totals).toEqual(
      expect.objectContaining({
        stableEndToEndTraceCount: 1,
        sameStudentCoursePathCount: 1,
        alignedApprovedDeliveryStudentCoursePathCount: 1,
        deterministicStatusReasonActionOwnerCount: 1,
        openSafetyGateCount: 0,
      }),
    );

    const mvpRoleJourneyEntrypointsReport =
      controller.getMvpRoleJourneyEntrypointsReport();
    expect(mvpRoleJourneyEntrypointsReport.reportName).toBe(
      'Learning local demo MVP Role Journey Entrypoints Report',
    );
    expect(mvpRoleJourneyEntrypointsReport.entrypointRows).toHaveLength(4);
    expect(mvpRoleJourneyEntrypointsReport.stableTraceRows).toHaveLength(1);
    expect(mvpRoleJourneyEntrypointsReport.totals).toEqual(
      expect.objectContaining({
        studentRoleEntrypointCount: 1,
        parentRoleEntrypointCount: 1,
        teacherRoleEntrypointCount: 1,
        adminRoleEntrypointCount: 1,
        stableRoleJourneyTraceCount: 1,
        sameStudentCoursePathCount: 4,
        linkedMvpReadinessTraceCount: 4,
        linkedParentReadReceiptCount: 4,
        linkedTeacherEscalationResolutionCount: 4,
        openSafetyGateCount: 0,
      }),
    );

    const teacherContentPublishReport =
      controller.getTeacherContentLibraryLearningPathPublishReport();
    expect(teacherContentPublishReport.reportName).toBe(
      'Learning local demo Teacher Content Library -> Learning Path Publish -> Parent Summary Report',
    );
    expect(teacherContentPublishReport.contentRows).toHaveLength(6);
    expect(teacherContentPublishReport.classAssignmentRows).toHaveLength(6);
    expect(teacherContentPublishReport.studentVisibilityRows).toHaveLength(8);
    expect(teacherContentPublishReport.parentSummaryRows).toHaveLength(3);
    expect(teacherContentPublishReport.totals).toEqual(
      expect.objectContaining({
        teacherAdminCount: 3,
        contentItemCount: 6,
        videoAssetCount: 2,
        practiceAssetCount: 2,
        lessonAssetCount: 2,
        learningPathPublishCount: 6,
        classAssignmentCount: 6,
        studentVisibilityCount: 6,
        parentVisibleSummaryCount: 3,
        blockedUnpublishedItemCount: 2,
        itemsNeedingTeacherReviewCount: 2,
      }),
    );

    const aiTutorChatSafetyTeacherReviewReport =
      controller.getAiTutorChatSafetyTeacherReviewReport();
    expect(aiTutorChatSafetyTeacherReviewReport.reportName).toBe(
      'Learning local demo AI Tutor Chat -> Safety Guard -> Teacher Review -> Parent Summary -> Learning Support Report',
    );
    expect(aiTutorChatSafetyTeacherReviewReport.chatSessionRows).toHaveLength(
      4,
    );
    expect(aiTutorChatSafetyTeacherReviewReport.messageRows).toHaveLength(12);
    expect(aiTutorChatSafetyTeacherReviewReport.safetyFlagRows).toHaveLength(4);
    expect(aiTutorChatSafetyTeacherReviewReport.teacherReviewRows).toHaveLength(
      4,
    );
    expect(aiTutorChatSafetyTeacherReviewReport.parentSummaryRows).toHaveLength(
      3,
    );
    expect(
      aiTutorChatSafetyTeacherReviewReport.supportRecommendationRows,
    ).toHaveLength(4);
    expect(aiTutorChatSafetyTeacherReviewReport.totals).toEqual(
      expect.objectContaining({
        chatSessionCount: 4,
        messageCount: 12,
        allowedMessageCount: 8,
        blockedMessageCount: 4,
        safetyFlagCount: 4,
        teacherReviewItemCount: 4,
        reviewedTeacherReviewItemCount: 2,
        parentSummaryCount: 3,
        studentsNeedingSupportCount: 3,
        topicCategoryCount: 8,
        supportRecommendationCount: 4,
      }),
    );

    const studentAchievementBadgeCertificateReport =
      controller.getStudentAchievementBadgeCertificateReport();
    expect(studentAchievementBadgeCertificateReport.reportName).toBe(
      'Learning local demo Student Achievement -> Badge -> Certificate -> Recognition Report',
    );
    expect(studentAchievementBadgeCertificateReport.studentRows).toHaveLength(
      4,
    );
    expect(
      studentAchievementBadgeCertificateReport.achievementRows,
    ).toHaveLength(6);
    expect(studentAchievementBadgeCertificateReport.badgeRows).toHaveLength(4);
    expect(
      studentAchievementBadgeCertificateReport.certificateRows,
    ).toHaveLength(3);
    expect(studentAchievementBadgeCertificateReport.milestoneRows).toHaveLength(
      7,
    );
    expect(
      studentAchievementBadgeCertificateReport.recognitionRows,
    ).toHaveLength(5);
    expect(studentAchievementBadgeCertificateReport.totals).toEqual(
      expect.objectContaining({
        achievementRecords: 6,
        badgeAwards: 4,
        certificateFixtures: 3,
        milestonesCompleted: 5,
        milestonesPending: 2,
        recognitionSummaries: 5,
        parentVisibleRecognitions: 3,
        teacherReviewItems: 3,
        studentsWithBadges: 2,
        studentsNearCertificate: 1,
        studentsNeedingEncouragement: 2,
      }),
    );

    const parentTeacherWeeklyDigestReport =
      controller.getParentTeacherWeeklyDigestReport();
    expect(parentTeacherWeeklyDigestReport.reportName).toBe(
      'Learning local demo Parent/Teacher Weekly Digest Report',
    );
    expect(parentTeacherWeeklyDigestReport.digestRows).toHaveLength(5);
    expect(parentTeacherWeeklyDigestReport.actionRows).toHaveLength(6);
    expect(parentTeacherWeeklyDigestReport.studentRows).toHaveLength(4);
    expect(parentTeacherWeeklyDigestReport.totals).toEqual(
      expect.objectContaining({
        digestCount: 5,
        parentDigestCount: 3,
        teacherDigestCount: 2,
        readyToSendDigestCount: 2,
        teacherReviewDigestCount: 2,
        heldWithdrawnDigestCount: 1,
        actionCount: 6,
        highPriorityActionCount: 2,
        studentsCovered: 4,
        studentsNeedingTeacherReview: 3,
        studentsReadyForParentSend: 2,
      }),
    );

    const followUpActionOutcomeReport =
      controller.getFollowUpActionOutcomeReport();
    expect(followUpActionOutcomeReport.reportName).toBe(
      'Learning local demo Follow-up Action Outcome Report',
    );
    expect(followUpActionOutcomeReport.outcomeRows).toHaveLength(6);
    expect(followUpActionOutcomeReport.studentRows).toHaveLength(4);
    expect(followUpActionOutcomeReport.totals).toEqual(
      expect.objectContaining({
        outcomeCount: 6,
        completedOutcomeCount: 1,
        verifiedOutcomeCount: 1,
        monitoringOutcomeCount: 2,
        heldOutcomeCount: 1,
        linkedDailyPlanCount: 6,
        linkedSupportRecommendationCount: 5,
        studentsCovered: 4,
      }),
    );

    const mvpReadinessOverviewReport =
      controller.getMvpReadinessOverviewReport();
    expect(mvpReadinessOverviewReport.reportName).toBe(
      'Learning local demo MVP Readiness Overview Report',
    );
    expect(mvpReadinessOverviewReport.rows).toHaveLength(20);
    expect(mvpReadinessOverviewReport.totals).toEqual(
      expect.objectContaining({
        sliceCount: 20,
        localDemoReadySliceCount: 19,
        localDemoReadyWithNotesSliceCount: 1,
        evidenceEndpointCount: 18,
        teacherInterventionReviewCount: 1,
        remedialAssignmentCount: 1,
        supportPlanCount: 1,
        remedialRetryCompletionCount: 1,
        supportOutcomeEvidenceCount: 1,
        remedialRetryUnresolvedAttemptCount: 1,
        unresolvedSupportOutcomeCount: 1,
        teacherEscalationCount: 1,
        teacherReviewedEscalationCount: 1,
        adjustedSupportRetryCompletionCount: 1,
        resolvedSupportOutcomeCount: 1,
        stableEndToEndTraceCount: 1,
        readinessScorePercent: 100,
        followUpOutcomeCount: 6,
        openSafetyGateCount: 0,
      }),
    );

    const acceptanceTraceabilityGateReport =
      controller.getAcceptanceTraceabilityGateReport();
    expect(acceptanceTraceabilityGateReport.reportName).toBe(
      'Learning local demo Acceptance Traceability Gate Report',
    );
    expect(acceptanceTraceabilityGateReport.rows).toHaveLength(20);
    expect(acceptanceTraceabilityGateReport.totals).toEqual(
      expect.objectContaining({
        acceptanceCriterionCount: 20,
        mappedCriterionCount: 20,
        slicesWithMappingCount: 20,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
  });
});
