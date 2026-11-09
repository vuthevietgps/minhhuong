import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';

describe('LearningLocalDemoService (enrollment and access)', () => {
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
});
