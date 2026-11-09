import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowReport,
  DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety,
} from '../learning-local-demo.types';
import { buildStudentCourseEnrollmentSubscriptionReport } from './student-course-enrollment-subscription.report';

export function buildStudentCourseEnrollmentSubscriptionFlowReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningStudentCourseEnrollmentSubscriptionFlowReport {
  const coreReport = buildStudentCourseEnrollmentSubscriptionReport(
    fixture,
    generatedAt,
  );
  const relationshipRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow[] =
    coreReport.rows.map((row) => ({
      relationshipKey: [
        row.studentId,
        row.courseId,
        row.enrollmentId,
        row.subscriptionId,
      ].join('->'),
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      courseId: row.courseId,
      courseCode: row.courseCode,
      courseTitle: row.courseTitle,
      enrollmentId: row.enrollmentId,
      enrollmentStatus: row.enrollmentStatus,
      subscriptionId: row.subscriptionId,
      subscriptionStatus: row.subscriptionStatus,
      paymentId: row.paymentId,
      paymentStatus: row.paymentStatus,
      refundIds: row.refundIds,
      commissionIds: row.commissionIds,
      fixtureOnly: true,
      mutationUsed: false,
      evidenceSummary: `${row.studentName} links ${row.courseCode} through ${row.enrollmentId}, ${row.subscriptionId}, ${row.paymentId}, ${row.refundIds.length} refund fixture, and ${row.commissionIds.length} commission fixture rows.`,
    }));
  const evidenceRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow[] =
    [
      {
        evidenceKind: 'STUDENT_PROFILE',
        evidenceCount: fixture.students.length,
        stableFixtureIds: fixture.students.map((student) => student.id),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Fixture student profiles use stable child profile and parent email IDs only.',
      },
      {
        evidenceKind: 'COURSE_PACKAGE',
        evidenceCount: fixture.courses.length,
        stableFixtureIds: fixture.courses.map((course) => course.id),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Fixture courses expose course code, level, package code, and package name.',
      },
      {
        evidenceKind: 'ENROLLMENT_SUBSCRIPTION',
        evidenceCount: relationshipRows.length,
        stableFixtureIds: relationshipRows.map((row) => row.relationshipKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Each enrollment row has one traceable fixture subscription and payment row.',
      },
      {
        evidenceKind: 'PAYMENT_FIXTURE',
        evidenceCount: fixture.payments.length,
        stableFixtureIds: fixture.payments.map((payment) => payment.id),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Payment evidence is fixture_manual_bank_transfer status data only.',
      },
      {
        evidenceKind: 'REFUND_FIXTURE',
        evidenceCount: fixture.refunds.length,
        stableFixtureIds: fixture.refunds.map((refund) => refund.id),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Refund evidence is a deliberate synthetic cancellation example with no real refund mutation.',
      },
      {
        evidenceKind: 'COMMISSION_FIXTURE',
        evidenceCount: fixture.commissions.length,
        stableFixtureIds: fixture.commissions.map(
          (commission) => commission.id,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Commission evidence includes pending, payable, approved, and canceled fixture rows with no payout mutation.',
      },
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
  } satisfies DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety;
  const remainingLocalDemoNotes = [
    'Production enrollment, subscription lifecycle, payment provider capture, refund mutation, and commission payout are out of scope.',
    'Provider refs are fixture_manual_bank_transfer identifiers only; no provider API read or mutation is executed.',
    'Dashboard and exports are read-only evidence for local-demo review.',
  ];
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;

  return {
    reportName:
      'Learning local demo Student -> Course -> Enrollment -> Subscription/Payment fixture -> Refund/Commission fixture Flow Report',
    generatedFor:
      'local-demo-student-course-enrollment-subscription-flow-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/student-course-enrollment-subscription-flow-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#student-course-enrollment-subscription-flow',
    jsonExportPath:
      'exports/learning-local-demo-student-course-enrollment-subscription-flow-report.json',
    markdownExportPath:
      'exports/learning-local-demo-student-course-enrollment-subscription-flow-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'The local-demo spine connects fixture students, courses, enrollments, subscriptions, payment statuses, refund evidence, and commission evidence without production or provider access.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: coreReport.totals.studentCount,
      courseCount: coreReport.totals.courseCount,
      enrollmentCount: coreReport.totals.enrollmentCount,
      subscriptionCount: coreReport.totals.subscriptionCount,
      fixturePaymentEvidenceCount: coreReport.totals.paymentCount,
      refundEvidenceCount: coreReport.totals.refundCount,
      commissionEvidenceCount: coreReport.totals.commissionCount,
      relationshipTraceCount: relationshipRows.length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    relationshipRows,
    evidenceRows,
  };
}

export function toStudentCourseEnrollmentSubscriptionFlowMarkdown(
  report: DemoLearningStudentCourseEnrollmentSubscriptionFlowReport,
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
    `- Fixture payment evidence: ${report.totals.fixturePaymentEvidenceCount}`,
    `- Refund evidence: ${report.totals.refundEvidenceCount}`,
    `- Commission evidence: ${report.totals.commissionEvidenceCount}`,
    `- Relationship traces: ${report.totals.relationshipTraceCount}`,
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
    '## Relationship Trace Rows',
    '',
    '| Student | Course | Enrollment | Subscription | Payment | Refunds | Commissions | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.relationshipRows.map(
      (row) =>
        `| ${[
          `${row.studentName} (${row.studentId})`,
          `${row.courseCode} (${row.courseId})`,
          `${row.enrollmentId} ${row.enrollmentStatus}`,
          `${row.subscriptionId} ${row.subscriptionStatus}`,
          `${row.paymentId} ${row.paymentStatus}`,
          row.refundIds.join(', ') || 'NONE',
          row.commissionIds.join(', ') || 'NONE',
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
