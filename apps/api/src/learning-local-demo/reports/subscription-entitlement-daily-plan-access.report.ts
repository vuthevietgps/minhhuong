import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningDailyPlan,
  DemoLearningEnrollment,
  DemoLearningPayment,
  DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow,
  DemoLearningSubscriptionEntitlementDailyPlanAccessReport,
  DemoLearningSubscriptionEntitlementDailyPlanAccessRow,
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety,
  DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
  DemoLearningSubscriptionEntitlementLifecycleRow,
  DemoLearningSubscription,
} from '../learning-local-demo.types';
import {
  groupBy,
  requireCourse,
  requirePayment,
  requireStudent,
  requireSubscription,
} from './shared';
import { buildStudentCourseEnrollmentSubscriptionReport } from './student-course-enrollment-subscription.report';

export function buildSubscriptionEntitlementDailyPlanAccessReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = '2026-06-30T12:30:00.000Z',
): DemoLearningSubscriptionEntitlementDailyPlanAccessReport {
  const coreReport = buildStudentCourseEnrollmentSubscriptionReport(
    fixture,
    generatedAt,
  );
  const studentsById = new Map(
    fixture.students.map((student) => [student.id, student]),
  );
  const coursesById = new Map(
    fixture.courses.map((course) => [course.id, course]),
  );
  const subscriptionsByEnrollmentId = new Map(
    fixture.subscriptions.map((subscription) => [
      subscription.enrollmentId,
      subscription,
    ]),
  );
  const paymentsBySubscriptionId = new Map(
    fixture.payments.map((payment) => [payment.subscriptionId, payment]),
  );
  const refundsByPaymentId = groupBy(
    fixture.refunds,
    (refund) => refund.paymentId,
  );
  const learningPathsByEnrollmentId = new Map(
    fixture.learningPaths.map((path) => [path.enrollmentId, path]),
  );
  const dailyPlansByPathId = groupBy(
    fixture.dailyPlans,
    (plan) => plan.learningPathId,
  );

  const accessRows: DemoLearningSubscriptionEntitlementDailyPlanAccessRow[] =
    fixture.enrollments
      .map((enrollment) => {
        const student = requireStudent(studentsById, enrollment);
        const course = requireCourse(coursesById, enrollment);
        const subscription = requireSubscription(
          subscriptionsByEnrollmentId,
          enrollment,
        );
        const payment = requirePayment(paymentsBySubscriptionId, subscription);
        const refunds = refundsByPaymentId.get(payment.id) ?? [];
        const learningPath = learningPathsByEnrollmentId.get(enrollment.id);
        if (!learningPath) {
          throw new Error(
            `Missing local demo learning path for enrollment ${enrollment.id}`,
          );
        }
        const accessStatus = buildSubscriptionEntitlementAccessStatus({
          enrollment,
          subscription,
          payment,
          refundCount: refunds.length,
          generatedAt,
        });
        const dailyPlan = selectDailyPlanForAccess(
          dailyPlansByPathId.get(learningPath.id) ?? [],
          accessStatus,
          learningPath.id,
        );
        const entitlementId = `entitlement-${subscription.id}`;
        const relationshipKey = [
          student.id,
          course.id,
          enrollment.id,
          subscription.id,
          entitlementId,
          dailyPlan.id,
        ].join('->');
        const blockedReason =
          buildSubscriptionEntitlementBlockedReason(accessStatus);
        const nextSafeActionLabel =
          buildSubscriptionEntitlementNextAction(accessStatus);
        const entitlementStatus: 'GRANTED' | 'BLOCKED' =
          accessStatus === 'UNLOCKED' ? 'GRANTED' : 'BLOCKED';

        return {
          relationshipKey,
          entitlementId,
          entitlementStatus,
          accessStatus,
          blockedReason,
          nextSafeActionLabel,
          studentId: student.id,
          childProfileId: student.childProfileId,
          studentName: student.displayName,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          enrollmentId: enrollment.id,
          enrollmentStatus: enrollment.status,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          paymentId: payment.id,
          paymentStatus: payment.status,
          refundIds: refunds.map((refund) => refund.id),
          learningPathId: learningPath.id,
          learningPathTitle: learningPath.title,
          learningPathStatus: learningPath.status,
          dailyPlanId: dailyPlan.id,
          dailyPlanTitle: dailyPlan.title,
          dailyPlanStatus: dailyPlan.status,
          planDate: dailyPlan.planDate,
          fixtureOnly: true,
          providerUsed: false,
          mutationUsed: false,
          evidenceSummary:
            accessStatus === 'UNLOCKED'
              ? `${student.displayName} has fixture entitlement ${entitlementId} and can open ${dailyPlan.id}.`
              : `${student.displayName} is blocked from ${dailyPlan.id}: ${blockedReason}.`,
        } satisfies DemoLearningSubscriptionEntitlementDailyPlanAccessRow;
      })
      .sort((left, right) =>
        [left.courseCode, left.studentName, left.dailyPlanId]
          .join('|')
          .localeCompare(
            [right.courseCode, right.studentName, right.dailyPlanId].join('|'),
          ),
      );

  const unlockedRows = accessRows.filter(
    (row) => row.accessStatus === 'UNLOCKED',
  );
  const blockedRows = accessRows.filter(
    (row) => row.accessStatus !== 'UNLOCKED',
  );
  const lifecycleRows = buildSubscriptionEntitlementLifecycleRows(accessRows);
  const expiredLifecycleRows = lifecycleRows.filter(
    (row) => row.lifecycleState === 'EXPIRED',
  );
  const revokedLifecycleRows = lifecycleRows.filter(
    (row) => row.lifecycleState === 'REVOKED',
  );
  const remainingLocalDemoNotes = [
    'Entitlements are derived from fixture enrollment, subscription, payment, refund, learning path, and daily plan rows only.',
    'Blocked rows explain the local-demo reason and next safe action without calling providers or mutating learning access.',
    'Lifecycle hardening rows add expired and revoked entitlement audit coverage as fixture-only snapshots over stable local-demo IDs.',
    'Production entitlement sync, subscription lifecycle, payment capture, refund mutation, and learner access writes are out of scope.',
  ];
  const safety = {
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
  } satisfies DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;
  const evidenceRows: DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow[] =
    [
      {
        evidenceKind: 'COURSE_ENTITLEMENT',
        evidenceCount: accessRows.length,
        stableFixtureIds: accessRows.map((row) => row.entitlementId),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Each entitlement is a deterministic local-demo ID derived from the fixture subscription ID.',
      },
      {
        evidenceKind: 'UNLOCKED_DAILY_PLAN_ACCESS',
        evidenceCount: unlockedRows.length,
        stableFixtureIds: unlockedRows.map((row) => row.relationshipKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Active paid fixture subscriptions unlock representative learning path and daily plan access.',
      },
      {
        evidenceKind: 'BLOCKED_DAILY_PLAN_ACCESS',
        evidenceCount: blockedRows.length,
        stableFixtureIds: blockedRows.map((row) => row.relationshipKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Non-active or refunded fixture subscriptions are blocked with explicit reasons and safe next actions.',
      },
      {
        evidenceKind: 'ENTITLEMENT_LIFECYCLE_HARDENING',
        evidenceCount: lifecycleRows.length,
        stableFixtureIds: lifecycleRows.map((row) => row.auditTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Lifecycle matrix covers active, pending payment, refunded, expired, and revoked entitlement outcomes without provider calls or access mutations.',
      },
      {
        evidenceKind: 'RELATIONSHIP_TRACE',
        evidenceCount: accessRows.length,
        stableFixtureIds: accessRows.map((row) => row.relationshipKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Relationship keys trace student -> course -> enrollment -> subscription -> entitlement -> daily plan.',
      },
      {
        evidenceKind: 'SAFETY_GATE',
        evidenceCount: safetyGateCount,
        stableFixtureIds: Object.entries(safety).map(
          ([gate, value]) => `${gate}=${String(value)}`,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'All production, provider, payment, notification, learning mutation, and ERP mutation gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Subscription Entitlement -> Daily Plan Access Gate Report',
    generatedFor:
      'local-demo-subscription-entitlement-daily-plan-access-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/subscription-entitlement-daily-plan-access-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#subscription-entitlement-daily-plan-access',
    jsonExportPath:
      'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
    markdownExportPath:
      'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'The local-demo access gate derives course entitlements from fixture enrollment, subscription, payment, refund, learning path, and daily plan rows.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: coreReport.totals.studentCount,
      courseCount: coreReport.totals.courseCount,
      enrollmentCount: coreReport.totals.enrollmentCount,
      subscriptionCount: coreReport.totals.subscriptionCount,
      entitlementCount: accessRows.length,
      learningPathCount: fixture.learningPaths.length,
      dailyPlanAccessCaseCount: accessRows.length,
      unlockedAccessCount: unlockedRows.length,
      blockedAccessCount: blockedRows.length,
      blockedPendingPaymentCount: accessRows.filter(
        (row) => row.accessStatus === 'BLOCKED_PENDING_PAYMENT',
      ).length,
      blockedExpiredCount:
        accessRows.filter((row) => row.accessStatus === 'BLOCKED_EXPIRED')
          .length + expiredLifecycleRows.length,
      blockedRevokedCount:
        accessRows.filter((row) => row.accessStatus === 'BLOCKED_REVOKED')
          .length + revokedLifecycleRows.length,
      blockedRefundedCount: accessRows.filter(
        (row) => row.accessStatus === 'BLOCKED_REFUNDED',
      ).length,
      blockedCanceledCount: accessRows.filter(
        (row) => row.accessStatus === 'BLOCKED_CANCELED',
      ).length,
      lifecycleRowCount: lifecycleRows.length,
      lifecycleExpiredRowCount: expiredLifecycleRows.length,
      lifecycleRevokedRowCount: revokedLifecycleRows.length,
      lifecycleRowsWithReasonCount: lifecycleRows.filter((row) =>
        Boolean(row.decisionReason),
      ).length,
      relationshipTraceCount: accessRows.length,
      accessCasesWithRelationshipTraceCount: accessRows.filter(
        (row) =>
          row.relationshipKey.includes(row.entitlementId) &&
          row.relationshipKey.includes(row.dailyPlanId),
      ).length,
      blockedAccessWithReasonCount: blockedRows.filter((row) =>
        Boolean(row.blockedReason),
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    accessRows,
    lifecycleRows,
    evidenceRows,
  };
}

export function toSubscriptionEntitlementDailyPlanAccessMarkdown(
  report: DemoLearningSubscriptionEntitlementDailyPlanAccessReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Current Status',
    '',
    `- Status: ${report.currentStatus.status}`,
    `- Summary: ${report.currentStatus.summary}`,
    `- Endpoint: ${report.endpointPath}`,
    `- Dashboard evidence: ${report.dashboardEvidencePath}`,
    `- JSON export: ${report.jsonExportPath}`,
    `- Markdown export: ${report.markdownExportPath}`,
    '',
    '## Safety',
    '',
    '- production_ready=false',
    '- fixtureOnly=true',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- paymentProviderUsed=false',
    '- aiProviderExecutionUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realSubscriptionMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Acceptance Counts',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Enrollments: ${report.totals.enrollmentCount}`,
    `- Subscriptions: ${report.totals.subscriptionCount}`,
    `- Entitlements: ${report.totals.entitlementCount}`,
    `- Daily plan access cases: ${report.totals.dailyPlanAccessCaseCount}`,
    `- Unlocked access: ${report.totals.unlockedAccessCount}`,
    `- Blocked access: ${report.totals.blockedAccessCount}`,
    `- Blocked pending payment: ${report.totals.blockedPendingPaymentCount}`,
    `- Blocked expired: ${report.totals.blockedExpiredCount}`,
    `- Blocked revoked: ${report.totals.blockedRevokedCount}`,
    `- Blocked refunded: ${report.totals.blockedRefundedCount}`,
    `- Blocked canceled: ${report.totals.blockedCanceledCount}`,
    `- Lifecycle rows: ${report.totals.lifecycleRowCount}`,
    `- Lifecycle expired rows: ${report.totals.lifecycleExpiredRowCount}`,
    `- Lifecycle revoked rows: ${report.totals.lifecycleRevokedRowCount}`,
    `- Lifecycle rows with reason: ${report.totals.lifecycleRowsWithReasonCount}`,
    `- Relationship traces: ${report.totals.relationshipTraceCount}`,
    `- Blocked access with reason: ${report.totals.blockedAccessWithReasonCount}`,
    `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Remaining Local-Demo Notes',
    '',
    ...report.currentStatus.remainingLocalDemoNotes.map((note) => `- ${note}`),
    '',
    '## Evidence Rows',
    '',
    '| Evidence | Count | Fixture IDs | Summary |',
    '| --- | ---: | --- | --- |',
    ...report.evidenceRows.map(
      (row) =>
        `| ${[
          row.evidenceKind,
          String(row.evidenceCount),
          row.stableFixtureIds.join(', '),
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Access Case Rows',
    '',
    '| Student | Course | Enrollment | Subscription | Entitlement | Learning path | Daily plan | Access | Blocked reason | Next safe action | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.accessRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.studentId})`,
          `${row.courseCode} (${row.courseId})`,
          `${row.enrollmentId} ${row.enrollmentStatus}`,
          `${row.subscriptionId} ${row.subscriptionStatus} / ${row.paymentId} ${row.paymentStatus}`,
          `${row.entitlementId} ${row.entitlementStatus}`,
          `${row.learningPathId} ${row.learningPathStatus}`,
          `${row.dailyPlanId} ${row.dailyPlanStatus}`,
          row.accessStatus,
          row.blockedReason ?? 'NONE',
          row.nextSafeActionLabel,
          row.relationshipKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Lifecycle Hardening Rows',
    '',
    '| Lifecycle | Student | Entitlement | Access | Reason | Next safe action | Audit trace |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.lifecycleRows.map(
      (row) =>
        `| ${[
          `${row.lifecycleState} (${row.lifecycleRowId})`,
          `${row.studentName} (${row.studentId})`,
          `${row.entitlementId} ${row.entitlementStatus}`,
          row.accessStatus,
          row.decisionReason,
          row.nextSafeActionLabel,
          row.auditTraceKey,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildSubscriptionEntitlementLifecycleRows(
  accessRows: DemoLearningSubscriptionEntitlementDailyPlanAccessRow[],
): DemoLearningSubscriptionEntitlementLifecycleRow[] {
  const requireAccessRow = (
    predicate: (
      row: DemoLearningSubscriptionEntitlementDailyPlanAccessRow,
    ) => boolean,
    label: string,
  ) => {
    const row = accessRows.find(predicate);
    if (!row) {
      throw new Error(`Missing local demo entitlement access row for ${label}`);
    }

    return row;
  };

  const activeRow = requireAccessRow(
    (row) => row.enrollmentId === 'enroll-ava-a1-active',
    'active entitlement lifecycle hardening',
  );
  const pendingPaymentRow = requireAccessRow(
    (row) => row.enrollmentId === 'enroll-minh-a1-pending',
    'pending-payment entitlement lifecycle hardening',
  );
  const refundedRow = requireAccessRow(
    (row) => row.enrollmentId === 'enroll-khoa-a1-canceled',
    'refunded entitlement lifecycle hardening',
  );

  const lifecycleInputs = [
    {
      lifecycleRowId: 'entitlement-lifecycle-sub-ava-a1-active',
      lifecycleState: 'ACTIVE' as const,
      sourceRow: activeRow,
      entitlementStatus: 'GRANTED' as const,
      accessStatus: 'UNLOCKED' as const,
      decisionReason:
        'Active paid fixture entitlement remains unlocked for the local-demo daily plan.',
      nextSafeActionLabel: 'Allow read-only local-demo daily plan access',
    },
    {
      lifecycleRowId: 'entitlement-lifecycle-sub-minh-a1-pending-payment',
      lifecycleState: 'PENDING_PAYMENT' as const,
      sourceRow: pendingPaymentRow,
      entitlementStatus: 'BLOCKED' as const,
      accessStatus: 'BLOCKED_PENDING_PAYMENT' as const,
      decisionReason:
        'Pending fixture payment keeps learning access blocked until the local-demo payment evidence succeeds.',
      nextSafeActionLabel: 'Keep blocked and review fixture payment evidence',
    },
    {
      lifecycleRowId: 'entitlement-lifecycle-sub-khoa-a1-refunded',
      lifecycleState: 'REFUNDED' as const,
      sourceRow: refundedRow,
      entitlementStatus: 'BLOCKED' as const,
      accessStatus: 'BLOCKED_REFUNDED' as const,
      decisionReason:
        'Refunded fixture payment keeps course path access blocked and review-only.',
      nextSafeActionLabel: 'Keep blocked after synthetic refund',
    },
    {
      lifecycleRowId: 'entitlement-lifecycle-sub-ava-a1-expired-snapshot',
      lifecycleState: 'EXPIRED' as const,
      sourceRow: activeRow,
      entitlementStatus: 'BLOCKED' as const,
      accessStatus: 'BLOCKED_EXPIRED' as const,
      decisionReason:
        'Expired fixture snapshot blocks the same Ava entitlement after the period end without changing the active base row.',
      nextSafeActionLabel: 'Renew fixture subscription before unlocking',
    },
    {
      lifecycleRowId: 'entitlement-lifecycle-sub-khoa-a1-revoked-snapshot',
      lifecycleState: 'REVOKED' as const,
      sourceRow: refundedRow,
      entitlementStatus: 'BLOCKED' as const,
      accessStatus: 'BLOCKED_REVOKED' as const,
      decisionReason:
        'Revoked fixture snapshot documents support/ops manual entitlement removal after refund review, with no provider mutation.',
      nextSafeActionLabel:
        'Keep revoked until a new fixture entitlement exists',
    },
  ];

  return lifecycleInputs.map((input) => {
    const auditTraceKey = [
      input.lifecycleRowId,
      input.sourceRow.entitlementId,
      input.lifecycleState,
      input.accessStatus,
    ].join('->');

    return {
      lifecycleRowId: input.lifecycleRowId,
      lifecycleState: input.lifecycleState,
      relationshipKey: input.sourceRow.relationshipKey,
      entitlementId: input.sourceRow.entitlementId,
      entitlementStatus: input.entitlementStatus,
      accessStatus: input.accessStatus,
      sourceEnrollmentId: input.sourceRow.enrollmentId,
      sourceSubscriptionId: input.sourceRow.subscriptionId,
      sourcePaymentId: input.sourceRow.paymentId,
      sourceRefundIds: input.sourceRow.refundIds,
      studentId: input.sourceRow.studentId,
      childProfileId: input.sourceRow.childProfileId,
      studentName: input.sourceRow.studentName,
      courseId: input.sourceRow.courseId,
      courseCode: input.sourceRow.courseCode,
      decisionReason: input.decisionReason,
      nextSafeActionLabel: input.nextSafeActionLabel,
      auditTraceKey,
      auditTraceIds: [
        input.sourceRow.relationshipKey,
        input.sourceRow.entitlementId,
        input.lifecycleRowId,
        auditTraceKey,
      ],
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary: `${input.lifecycleState} entitlement lifecycle row maps ${input.sourceRow.studentName} to ${input.accessStatus} with fixture-only audit evidence.`,
    } satisfies DemoLearningSubscriptionEntitlementLifecycleRow;
  });
}

export function buildSubscriptionEntitlementAccessStatus(input: {
  enrollment: DemoLearningEnrollment;
  subscription: DemoLearningSubscription;
  payment: DemoLearningPayment;
  refundCount: number;
  generatedAt: string;
}): DemoLearningSubscriptionEntitlementDailyPlanAccessStatus {
  if (input.payment.status === 'REFUNDED' || input.refundCount > 0) {
    return 'BLOCKED_REFUNDED';
  }

  if (
    input.enrollment.status === 'CANCELED' ||
    input.subscription.status === 'CANCELED'
  ) {
    return 'BLOCKED_CANCELED';
  }

  if (
    input.subscription.status === 'EXPIRED' ||
    new Date(input.subscription.currentPeriodEnd).getTime() <
      new Date(input.generatedAt).getTime()
  ) {
    return 'BLOCKED_EXPIRED';
  }

  if (
    input.enrollment.status !== 'ACTIVE' ||
    input.subscription.status !== 'ACTIVE' ||
    input.payment.status !== 'SUCCEEDED'
  ) {
    return 'BLOCKED_PENDING_PAYMENT';
  }

  return 'UNLOCKED';
}

export function buildSubscriptionEntitlementBlockedReason(
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
) {
  switch (accessStatus) {
    case 'UNLOCKED':
      return null;
    case 'BLOCKED_PENDING_PAYMENT':
      return 'Fixture subscription or enrollment is not active paid; wait for the local-demo payment confirmation before unlocking learning access.';
    case 'BLOCKED_EXPIRED':
      return 'Fixture subscription period has expired; renew the local-demo subscription before unlocking this course path.';
    case 'BLOCKED_REVOKED':
      return 'Fixture entitlement was revoked by support/ops audit review; keep course path and daily plan access blocked.';
    case 'BLOCKED_REFUNDED':
      return 'Fixture payment was refunded; keep course path and daily plan access blocked in read-only evidence.';
    case 'BLOCKED_CANCELED':
      return 'Fixture enrollment or subscription was canceled; keep learning path access blocked until a new fixture entitlement exists.';
  }
}

export function buildSubscriptionEntitlementNextAction(
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
) {
  switch (accessStatus) {
    case 'UNLOCKED':
      return 'Open local-demo daily plan';
    case 'BLOCKED_PENDING_PAYMENT':
      return 'Confirm fixture payment before unlocking';
    case 'BLOCKED_EXPIRED':
      return 'Renew fixture subscription before unlocking';
    case 'BLOCKED_REVOKED':
      return 'Keep revoked until support/ops audit review creates a new fixture entitlement';
    case 'BLOCKED_REFUNDED':
      return 'Keep blocked after synthetic refund';
    case 'BLOCKED_CANCELED':
      return 'Create a new fixture entitlement before unlocking';
  }
}

export function selectDailyPlanForAccess(
  dailyPlans: DemoLearningDailyPlan[],
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
  learningPathId: string,
) {
  const sortedDailyPlans = [...dailyPlans].sort(
    (left, right) =>
      left.sequence - right.sequence || left.id.localeCompare(right.id),
  );
  if (sortedDailyPlans.length === 0) {
    throw new Error(
      `Missing local demo daily plan for learning path ${learningPathId}`,
    );
  }

  if (accessStatus === 'UNLOCKED') {
    return (
      sortedDailyPlans.find((plan) =>
        ['IN_PROGRESS', 'ASSIGNED'].includes(plan.status),
      ) ??
      sortedDailyPlans.find((plan) => plan.status === 'COMPLETED') ??
      sortedDailyPlans[0]
    );
  }

  return (
    sortedDailyPlans.find((plan) =>
      ['BLOCKED', 'SKIPPED'].includes(plan.status),
    ) ?? sortedDailyPlans[0]
  );
}
