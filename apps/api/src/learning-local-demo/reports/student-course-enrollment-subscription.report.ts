import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCommission,
  DemoLearningCommissionStatus,
  DemoLearningCoreFixture,
  DemoLearningCoreReport,
  DemoLearningCourse,
  DemoLearningCourseAggregateRow,
  DemoLearningEnrollment,
  DemoLearningEnrollmentReportRow,
  DemoLearningPayment,
  DemoLearningRefund,
  DemoLearningStatusCounts,
  DemoLearningStudent,
  DemoLearningSubscription,
} from '../learning-local-demo.types';
import {
  countByStatus,
  groupBy,
  requireCourse,
  requirePayment,
  requireStudent,
  requireSubscription,
} from './shared';

export const enrollmentStatuses = ['ACTIVE', 'PENDING', 'CANCELED'] as const;

export const subscriptionStatuses = [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'EXPIRED',
] as const;

export const paymentStatuses = [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REFUNDED',
] as const;

export const refundStatuses = ['PENDING', 'SUCCEEDED', 'FAILED'] as const;

export const commissionStatuses = [
  'PENDING',
  'PAYABLE',
  'APPROVED',
  'CANCELED',
] as const;

export function buildStudentCourseEnrollmentSubscriptionReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningCoreReport {
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
  const commissionsByEnrollmentId = groupBy(
    fixture.commissions,
    (commission) => commission.enrollmentId,
  );

  const rows = fixture.enrollments
    .map((enrollment) => {
      const student = requireStudent(studentsById, enrollment);
      const course = requireCourse(coursesById, enrollment);
      const subscription = requireSubscription(
        subscriptionsByEnrollmentId,
        enrollment,
      );
      const payment = requirePayment(paymentsBySubscriptionId, subscription);
      const refunds = refundsByPaymentId.get(payment.id) ?? [];
      const commissions = commissionsByEnrollmentId.get(enrollment.id) ?? [];

      return buildEnrollmentRow({
        enrollment,
        student,
        course,
        subscription,
        payment,
        refunds,
        commissions,
      });
    })
    .sort((left, right) =>
      [left.courseCode, left.studentName, left.enrollmentId]
        .join('|')
        .localeCompare(
          [right.courseCode, right.studentName, right.enrollmentId].join('|'),
        ),
    );

  const statusCounts = buildStatusCounts(fixture);

  return {
    reportName:
      'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment -> Refund/Commission Report',
    generatedFor: fixture.generatedFor,
    generatedAt,
    currency: fixture.currency,
    safety: {
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
    },
    totals: {
      studentCount: fixture.students.length,
      courseCount: fixture.courses.length,
      enrollmentCount: fixture.enrollments.length,
      activeEnrollmentCount: statusCounts.enrollment.ACTIVE,
      pendingEnrollmentCount: statusCounts.enrollment.PENDING,
      canceledEnrollmentCount: statusCounts.enrollment.CANCELED,
      subscriptionCount: fixture.subscriptions.length,
      activeSubscriptionCount: statusCounts.subscription.ACTIVE,
      trialingSubscriptionCount: statusCounts.subscription.TRIALING,
      canceledSubscriptionCount: statusCounts.subscription.CANCELED,
      paymentCount: fixture.payments.length,
      pendingPaymentCount: statusCounts.payment.PENDING,
      succeededPaymentCount: statusCounts.payment.SUCCEEDED,
      refundedPaymentCount: statusCounts.payment.REFUNDED,
      refundCount: fixture.refunds.length,
      succeededRefundCount: statusCounts.refund.SUCCEEDED,
      commissionCount: fixture.commissions.length,
      pendingCommissionCount: statusCounts.commission.PENDING,
      payableCommissionCount: statusCounts.commission.PAYABLE,
      approvedCommissionCount: statusCounts.commission.APPROVED,
      canceledCommissionCount: statusCounts.commission.CANCELED,
      grossPaidCents: rows.reduce((sum, row) => sum + row.grossPaidCents, 0),
      pendingPaymentCents: rows.reduce(
        (sum, row) => sum + row.pendingPaymentCents,
        0,
      ),
      refundedCents: rows.reduce((sum, row) => sum + row.refundedCents, 0),
      netRevenueCents: rows.reduce((sum, row) => sum + row.netRevenueCents, 0),
      commissionPendingCents: rows.reduce(
        (sum, row) => sum + row.commissionPendingCents,
        0,
      ),
      commissionPayableCents: rows.reduce(
        (sum, row) => sum + row.commissionPayableCents,
        0,
      ),
      commissionApprovedCents: rows.reduce(
        (sum, row) => sum + row.commissionApprovedCents,
        0,
      ),
      commissionCanceledCents: rows.reduce(
        (sum, row) => sum + row.commissionCanceledCents,
        0,
      ),
      commissionEarnedCents: rows.reduce(
        (sum, row) =>
          sum +
          row.commissionPendingCents +
          row.commissionPayableCents +
          row.commissionApprovedCents,
        0,
      ),
    },
    statusCounts,
    courseAggregates: buildCourseAggregates(rows),
    rows,
  };
}

export function toLearningCoreMarkdown(report: DemoLearningCoreReport) {
  const money = (cents: number) =>
    `${Math.round(cents / 100).toLocaleString('en-US')} ${report.currency}`;

  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Safety',
    '',
    '- Fixture-only local demo data.',
    '- productionDbUsed=false',
    '- providerApiUsed=false',
    '- paymentProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realClassMutationUsed=false',
    '- realSessionMutationUsed=false',
    '- realAttendanceMutationUsed=false',
    '- realProgressMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Enrollments: ${report.totals.enrollmentCount}`,
    `- Active enrollments: ${report.totals.activeEnrollmentCount}`,
    `- Pending enrollments: ${report.totals.pendingEnrollmentCount}`,
    `- Canceled enrollments: ${report.totals.canceledEnrollmentCount}`,
    `- Subscriptions: ${report.totals.subscriptionCount}`,
    `- Payments: ${report.totals.paymentCount}`,
    `- Refunds: ${report.totals.refundCount}`,
    `- Commissions: ${report.totals.commissionCount}`,
    `- Gross paid: ${money(report.totals.grossPaidCents)}`,
    `- Pending payment amount: ${money(report.totals.pendingPaymentCents)}`,
    `- Refunded amount: ${money(report.totals.refundedCents)}`,
    `- Net revenue: ${money(report.totals.netRevenueCents)}`,
    `- Commission pending: ${money(report.totals.commissionPendingCents)}`,
    `- Commission payable: ${money(report.totals.commissionPayableCents)}`,
    `- Commission approved: ${money(report.totals.commissionApprovedCents)}`,
    `- Commission canceled: ${money(report.totals.commissionCanceledCents)}`,
    '',
    '## Course Aggregates',
    '',
    '| Course | Enrollments | Active | Pending | Canceled | Gross paid | Refunded | Net revenue | Earned commission |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...report.courseAggregates.map(
      (row) =>
        `| ${[
          `${row.courseCode} ${row.courseTitle}`,
          String(row.enrollmentCount),
          String(row.activeEnrollmentCount),
          String(row.pendingEnrollmentCount),
          String(row.canceledEnrollmentCount),
          money(row.grossPaidCents),
          money(row.refundedCents),
          money(row.netRevenueCents),
          money(row.commissionEarnedCents),
        ].join(' | ')} |`,
    ),
    '',
    '## Enrollment Rows',
    '',
    '| Student | Course | Enrollment | Subscription | Payment | Refund | Gross paid | Pending payment | Refunded | Net revenue | Commission pending | Commission payable | Commission approved | Commission canceled |',
    '| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...report.rows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.enrollmentStatus,
          row.subscriptionStatus,
          row.paymentStatus,
          row.refundStatus,
          money(row.grossPaidCents),
          money(row.pendingPaymentCents),
          money(row.refundedCents),
          money(row.netRevenueCents),
          money(row.commissionPendingCents),
          money(row.commissionPayableCents),
          money(row.commissionApprovedCents),
          money(row.commissionCanceledCents),
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function buildEnrollmentRow(input: {
  enrollment: DemoLearningEnrollment;
  student: DemoLearningStudent;
  course: DemoLearningCourse;
  subscription: DemoLearningSubscription;
  payment: DemoLearningPayment;
  refunds: DemoLearningRefund[];
  commissions: DemoLearningCommission[];
}): DemoLearningEnrollmentReportRow {
  const grossPaidCents = ['SUCCEEDED', 'REFUNDED'].includes(
    input.payment.status,
  )
    ? input.payment.amountCents
    : 0;
  const pendingPaymentCents =
    input.payment.status === 'PENDING' ? input.payment.amountCents : 0;
  const refundedCents = input.refunds.reduce(
    (sum, refund) =>
      refund.status === 'SUCCEEDED' ? sum + refund.amountCents : sum,
    0,
  );
  const commissionByStatus = sumCommissionsByStatus(input.commissions);

  return {
    enrollmentId: input.enrollment.id,
    studentId: input.student.id,
    childProfileId: input.student.childProfileId,
    studentName: input.student.displayName,
    parentEmail: input.student.parentEmail,
    courseId: input.course.id,
    courseCode: input.course.code,
    courseTitle: input.course.title,
    levelCode: input.course.levelCode,
    packageCode: input.course.packageCode,
    packageName: input.course.packageName,
    enrollmentStatus: input.enrollment.status,
    enrollmentSource: input.enrollment.source,
    subscriptionId: input.subscription.id,
    subscriptionStatus: input.subscription.status,
    planCode: input.subscription.planCode,
    paymentId: input.payment.id,
    paymentStatus: input.payment.status,
    refundIds: input.refunds.map((refund) => refund.id),
    refundStatus: input.refunds[0]?.status ?? 'NONE',
    commissionIds: input.commissions.map((commission) => commission.id),
    grossPaidCents,
    pendingPaymentCents,
    refundedCents,
    netRevenueCents: grossPaidCents - refundedCents,
    commissionPendingCents: commissionByStatus.PENDING,
    commissionPayableCents: commissionByStatus.PAYABLE,
    commissionApprovedCents: commissionByStatus.APPROVED,
    commissionCanceledCents: commissionByStatus.CANCELED,
  };
}

export function buildStatusCounts(
  fixture: DemoLearningCoreFixture,
): DemoLearningStatusCounts {
  return {
    enrollment: countByStatus(
      enrollmentStatuses,
      fixture.enrollments,
      (enrollment) => enrollment.status,
    ),
    subscription: countByStatus(
      subscriptionStatuses,
      fixture.subscriptions,
      (subscription) => subscription.status,
    ),
    payment: countByStatus(
      paymentStatuses,
      fixture.payments,
      (payment) => payment.status,
    ),
    refund: countByStatus(
      refundStatuses,
      fixture.refunds,
      (refund) => refund.status,
    ),
    commission: countByStatus(
      commissionStatuses,
      fixture.commissions,
      (commission) => commission.status,
    ),
  };
}

export function buildCourseAggregates(
  rows: DemoLearningEnrollmentReportRow[],
): DemoLearningCourseAggregateRow[] {
  const aggregates = new Map<string, DemoLearningCourseAggregateRow>();

  for (const row of rows) {
    const existing =
      aggregates.get(row.courseId) ??
      ({
        courseId: row.courseId,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        enrollmentCount: 0,
        activeEnrollmentCount: 0,
        pendingEnrollmentCount: 0,
        canceledEnrollmentCount: 0,
        grossPaidCents: 0,
        refundedCents: 0,
        netRevenueCents: 0,
        commissionEarnedCents: 0,
      } satisfies DemoLearningCourseAggregateRow);

    existing.enrollmentCount += 1;
    if (row.enrollmentStatus === 'ACTIVE') {
      existing.activeEnrollmentCount += 1;
    }
    if (row.enrollmentStatus === 'PENDING') {
      existing.pendingEnrollmentCount += 1;
    }
    if (row.enrollmentStatus === 'CANCELED') {
      existing.canceledEnrollmentCount += 1;
    }
    existing.grossPaidCents += row.grossPaidCents;
    existing.refundedCents += row.refundedCents;
    existing.netRevenueCents += row.netRevenueCents;
    existing.commissionEarnedCents +=
      row.commissionPendingCents +
      row.commissionPayableCents +
      row.commissionApprovedCents;
    aggregates.set(row.courseId, existing);
  }

  return [...aggregates.values()].sort((left, right) =>
    left.courseCode.localeCompare(right.courseCode),
  );
}

export function sumCommissionsByStatus(commissions: DemoLearningCommission[]) {
  return commissions.reduce(
    (totals, commission) => {
      totals[commission.status] += commission.amountCents;
      return totals;
    },
    {
      PENDING: 0,
      PAYABLE: 0,
      APPROVED: 0,
      CANCELED: 0,
    } satisfies Record<DemoLearningCommissionStatus, number>,
  );
}
