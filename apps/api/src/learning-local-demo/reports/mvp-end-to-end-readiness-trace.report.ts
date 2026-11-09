import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningMvpEndToEndReadinessTraceEvidenceRow,
  DemoLearningMvpEndToEndReadinessTraceReport,
  DemoLearningMvpEndToEndReadinessTraceRow,
  DemoLearningMvpEndToEndReadinessTraceSafety,
  DemoLearningMvpEndToEndReadinessTraceStatusCounts,
} from '../learning-local-demo.types';
import { buildLearningSessionCompletionPracticeProgressRollupReport } from './learning-session-completion-practice-progress-rollup.report';
import { buildParentPortalApprovedReportInboxReadReceiptReport } from './parent-portal-approved-report-inbox-read-receipt.report';
import { buildParentScreenTimeGrantDailyPlanGuardReport } from './parent-screen-time-grant-daily-plan-guard.report';
import { buildParentTeacherProgressAccessSummaryReport } from './parent-teacher-progress-access-summary.report';
import { buildParentTeacherReportPermissionPrivacyRedactionReport } from './parent-teacher-report-permission-privacy-redaction.report';
import { buildRemedialRetryUnresolvedSupportEscalationReport } from './remedial-retry-unresolved-support-escalation.report';
import { buildStudentCourseEnrollmentSubscriptionFlowReport } from './student-course-enrollment-subscription-flow.report';
import { buildSubscriptionEntitlementDailyPlanAccessReport } from './subscription-entitlement-daily-plan-access.report';
import { buildTeacherEscalationFollowupResolutionReport } from './teacher-escalation-followup-resolution.report';
import { buildTeacherInterventionRemedialAssignmentSupportPlanReport } from './teacher-intervention-remedial-assignment-support-plan.report';

export function buildMvpEndToEndReadinessTraceReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningMvpEndToEndReadinessTraceReport {
  const studentCourseFlowReport =
    buildStudentCourseEnrollmentSubscriptionFlowReport(fixture, generatedAt);
  const subscriptionEntitlementDailyPlanAccessReport =
    buildSubscriptionEntitlementDailyPlanAccessReport(fixture, generatedAt);
  const parentTeacherProgressAccessSummaryReport =
    buildParentTeacherProgressAccessSummaryReport(fixture, generatedAt);
  const permissionRedactionReport =
    buildParentTeacherReportPermissionPrivacyRedactionReport(
      fixture,
      generatedAt,
    );
  const parentPortalApprovedReportInboxReadReceiptReport =
    buildParentPortalApprovedReportInboxReadReceiptReport(fixture, generatedAt);
  const screenTimeGuardReport = buildParentScreenTimeGrantDailyPlanGuardReport(
    fixture,
    generatedAt,
  );
  const practiceRollupReport =
    buildLearningSessionCompletionPracticeProgressRollupReport(
      fixture,
      generatedAt,
    );
  const teacherInterventionReport =
    buildTeacherInterventionRemedialAssignmentSupportPlanReport(
      fixture,
      generatedAt,
    );
  const remedialRetryUnresolvedReport =
    buildRemedialRetryUnresolvedSupportEscalationReport(fixture, generatedAt);
  const teacherEscalationResolutionReport =
    buildTeacherEscalationFollowupResolutionReport(fixture, generatedAt);

  const requireEvidence = <TRow>(
    row: TRow | undefined,
    description: string,
  ) => {
    if (!row) {
      throw new Error(
        `Missing local demo MVP end-to-end readiness trace evidence: ${description}`,
      );
    }

    return row;
  };

  const resolution = requireEvidence(
    teacherEscalationResolutionReport.resolutionRows.find(
      (row) =>
        row.studentId === 'student-minh' &&
        row.courseId === 'course-a1-starter',
    ),
    'student-minh teacher escalation resolution',
  );
  const studentCourse = requireEvidence(
    studentCourseFlowReport.relationshipRows.find(
      (row) =>
        row.studentId === resolution.studentId &&
        row.courseId === resolution.courseId,
    ),
    'student/course/enrollment/subscription relationship',
  );
  const entitlement = requireEvidence(
    subscriptionEntitlementDailyPlanAccessReport.accessRows.find(
      (row) =>
        row.studentId === resolution.studentId &&
        row.courseId === resolution.courseId &&
        row.learningPathId === resolution.learningPathId,
    ),
    'subscription entitlement and daily plan access',
  );
  const practiceRollup = requireEvidence(
    practiceRollupReport.progressRollupRows.find(
      (row) =>
        row.studentId === resolution.studentId &&
        row.courseId === resolution.courseId,
    ),
    'practice completion/progress rollup',
  );
  const parentTeacherReport = requireEvidence(
    parentTeacherProgressAccessSummaryReport.parentSummaryRows.find(
      (row) =>
        row.studentId === resolution.studentId &&
        row.courseCode === resolution.courseCode,
    ),
    'parent/teacher progress reporting summary',
  );
  const permissionCase = requireEvidence(
    permissionRedactionReport.permissionCaseRows.find(
      (row) =>
        row.permissionCaseId === 'permission-case-teacher-mai-assigned-a1',
    ),
    'permission and privacy redaction case',
  );
  const permissionEvidence = requireEvidence(
    permissionRedactionReport.fieldVisibilityRows.find(
      (row) =>
        row.permissionCaseId === permissionCase.permissionCaseId &&
        row.visibility === 'REDACTED',
    ),
    'redacted field evidence',
  );
  const parentInboxRowsById = new Map(
    parentPortalApprovedReportInboxReadReceiptReport.parentInboxRows.map(
      (row) => [row.parentInboxItemId, row],
    ),
  );
  const readAck = requireEvidence(
    parentPortalApprovedReportInboxReadReceiptReport.readAckRows.find((row) => {
      const parentInboxRow = parentInboxRowsById.get(row.parentInboxItemId);

      return (
        row.studentId === resolution.studentId &&
        parentInboxRow?.courseId === resolution.courseId
      );
    }),
    'aligned approved parent inbox read receipt',
  );
  const readAckParentInbox = requireEvidence(
    parentInboxRowsById.get(readAck.parentInboxItemId),
    'aligned approved parent inbox row for read receipt',
  );
  const screenTimeGuard = requireEvidence(
    screenTimeGuardReport.accessRows.find(
      (row) =>
        row.studentId === resolution.studentId &&
        row.courseId === resolution.courseId,
    ),
    'screen-time daily plan guard',
  );
  const teacherIntervention = requireEvidence(
    teacherInterventionReport.interventionReviewRows.find(
      (row) => row.interventionReviewId === resolution.interventionReviewId,
    ),
    'teacher intervention review',
  );
  const remedialRetry = requireEvidence(
    remedialRetryUnresolvedReport.retryAttemptRows.find(
      (row) => row.retryAttemptId === resolution.unresolvedRetryAttemptId,
    ),
    'remedial retry escalation',
  );
  const traceId = 'mvp-end-to-end-readiness-trace-minh-a1-2026-06-09';
  const stableEndToEndTraceIds = [
    resolution.studentId,
    resolution.courseId,
    studentCourse.enrollmentId,
    studentCourse.subscriptionId,
    studentCourse.paymentId,
    entitlement.entitlementId,
    entitlement.dailyPlanId,
    practiceRollup.progressRollupId,
    parentTeacherReport.parentSummaryId,
    permissionCase.permissionCaseId,
    permissionEvidence.fieldVisibilityId,
    readAckParentInbox.parentInboxItemId,
    readAck.readAckEvidenceId,
    screenTimeGuard.accessCaseId,
    teacherIntervention.interventionReviewId,
    resolution.supportPlanId,
    resolution.remedialAssignmentId,
    remedialRetry.retryAttemptId,
    resolution.teacherEscalationId,
    resolution.supportAdjustmentId,
    resolution.resolutionId,
    resolution.resolvedSupportOutcomeId,
  ];
  const traceRows: DemoLearningMvpEndToEndReadinessTraceRow[] = [
    {
      traceId,
      stableEndToEndTraceKey: stableEndToEndTraceIds.join('->'),
      stableEndToEndTraceIds,
      studentId: resolution.studentId,
      childProfileId: resolution.childProfileId,
      studentName: resolution.studentName,
      parentGuardianId: resolution.parentGuardianId,
      teacherId: resolution.teacherId,
      teacherName: resolution.teacherName,
      courseId: resolution.courseId,
      courseCode: resolution.courseCode,
      courseTitle: resolution.courseTitle,
      classId: resolution.classId,
      classCode: resolution.classCode,
      enrollmentId: studentCourse.enrollmentId,
      enrollmentStatus: studentCourse.enrollmentStatus,
      subscriptionId: studentCourse.subscriptionId,
      subscriptionStatus: studentCourse.subscriptionStatus,
      paymentId: studentCourse.paymentId,
      paymentStatus: studentCourse.paymentStatus,
      refundIds: studentCourse.refundIds,
      commissionIds: studentCourse.commissionIds,
      entitlementId: entitlement.entitlementId,
      entitlementStatus: entitlement.entitlementStatus,
      entitlementAccessStatus: entitlement.accessStatus,
      learningPathId: resolution.learningPathId,
      dailyPlanId: entitlement.dailyPlanId,
      dailyPlanTitle: entitlement.dailyPlanTitle,
      dailyPlanStatus: entitlement.dailyPlanStatus,
      practiceProgressRollupId: practiceRollup.progressRollupId,
      practiceAttemptId: practiceRollup.practiceAttemptId,
      practiceAttemptStatus: practiceRollup.practiceAttemptStatus,
      practiceScorePercent: practiceRollup.practiceScorePercent,
      progressStatus: practiceRollup.progressStatus,
      parentTeacherReportSummaryId: parentTeacherReport.parentSummaryId,
      parentTeacherPermissionCaseId: permissionCase.permissionCaseId,
      permissionRedactionEvidenceId: permissionEvidence.fieldVisibilityId,
      approvedDeliveryOrReadReceiptId: readAck.readAckEvidenceId,
      approvedDeliveryStudentId: readAck.studentId,
      approvedDeliveryCourseId: readAckParentInbox.courseId,
      screenTimeGuardEvidenceId: screenTimeGuard.accessCaseId,
      screenTimeAccessResult: screenTimeGuard.accessResult,
      teacherInterventionReviewId: teacherIntervention.interventionReviewId,
      supportPlanId: resolution.supportPlanId,
      remedialAssignmentId: resolution.remedialAssignmentId,
      remedialRetryOrEscalationId: remedialRetry.retryAttemptId,
      remedialRetryStatus: remedialRetry.retryStatus,
      unresolvedOutcomeId: resolution.unresolvedOutcomeId,
      teacherEscalationId: resolution.teacherEscalationId,
      supportAdjustmentId: resolution.supportAdjustmentId,
      escalationResolutionId: resolution.resolutionId,
      resolvedSupportOutcomeId: resolution.resolvedSupportOutcomeId,
      resolutionStatus: resolution.resolvedSupportOutcomeStatus,
      traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
      reasonLabel:
        'Fixture-only MVP readiness trace links all accepted learning-core slices and keeps production_ready=false.',
      actionLabel:
        'Review the trace evidence locally; do not run providers, sends, schedulers, or live mutations.',
      ownerLabel: 'TEACHER',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      productionReady: false,
      evidenceSummary:
        'Minh A1 local-demo journey links enrollment/subscription, entitlement and daily plan evidence, practice progress, reporting/privacy evidence, parent inbox read receipt evidence, screen-time guard, teacher intervention, remedial retry escalation, and teacher escalation resolution.',
    },
  ];

  const rowsWithStableTrace = traceRows.filter((row) =>
    [
      row.studentId,
      row.courseId,
      row.enrollmentId,
      row.subscriptionId,
      row.entitlementId,
      row.dailyPlanId,
      row.practiceProgressRollupId,
      row.approvedDeliveryOrReadReceiptId,
      row.teacherInterventionReviewId,
      row.remedialRetryOrEscalationId,
      row.escalationResolutionId,
      row.resolvedSupportOutcomeId,
    ].every((id) => row.stableEndToEndTraceKey.includes(id)),
  );
  const rowsWithSameStudentCoursePath = traceRows.filter(
    (row) =>
      row.studentId === resolution.studentId &&
      row.courseId === resolution.courseId &&
      row.enrollmentId === studentCourse.enrollmentId &&
      row.subscriptionId === studentCourse.subscriptionId &&
      row.learningPathId === resolution.learningPathId &&
      row.approvedDeliveryStudentId === row.studentId &&
      row.approvedDeliveryCourseId === row.courseId &&
      row.teacherInterventionReviewId === resolution.interventionReviewId &&
      row.escalationResolutionId === resolution.resolutionId,
  );
  const rowsWithAlignedApprovedDeliveryStudentCoursePath = traceRows.filter(
    (row) =>
      row.approvedDeliveryOrReadReceiptId &&
      row.approvedDeliveryStudentId === row.studentId &&
      row.approvedDeliveryCourseId === row.courseId,
  );
  const rowsWithDeterministicLabels = traceRows.filter(
    (row) =>
      Boolean(row.traceStatus) &&
      Boolean(row.reasonLabel) &&
      Boolean(row.actionLabel) &&
      Boolean(row.ownerLabel),
  );
  const remainingLocalDemoNotes = [
    'The trace is a deterministic local-demo evidence derivation over accepted slices; it does not create production orchestration state.',
    'The approved delivery/read receipt source is the aligned Minh/course A1 parent portal read/ack gate evidence and is kept explicit in the trace row.',
    'Production database reads, provider APIs, payment/refund mutation, notification sends, AI execution, scheduler activation, secrets, and real learner mutations remain out of scope.',
  ];
  const safety = {
    ...teacherEscalationResolutionReport.safety,
  } satisfies DemoLearningMvpEndToEndReadinessTraceSafety;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (
      gate === 'fixtureOnly' ||
      gate === 'noProductionDbRead' ||
      gate === 'productionReady'
    ) {
      return gate === 'productionReady' ? value !== false : value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;
  const evidenceRows: DemoLearningMvpEndToEndReadinessTraceEvidenceRow[] = [
    {
      evidenceKind: 'STUDENT_COURSE_ENROLLMENT_SUBSCRIPTION',
      evidenceCount: traceRows.filter(
        (row) => row.enrollmentId && row.subscriptionId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) =>
          `${row.studentId}->${row.courseId}->${row.enrollmentId}->${row.subscriptionId}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'The trace starts from deterministic student, course, enrollment, and subscription fixture IDs.',
    },
    {
      evidenceKind: 'PAYMENT_REFUND_COMMISSION_FIXTURE',
      evidenceCount: traceRows.filter((row) => row.paymentId).length,
      stableFixtureIds: traceRows.flatMap((row) => [
        row.paymentId,
        ...row.refundIds,
        ...row.commissionIds,
      ]),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Payment/refund/commission evidence is fixture-only; no provider or live financial mutation is used.',
    },
    {
      evidenceKind: 'ENTITLEMENT_DAILY_PLAN',
      evidenceCount: traceRows.filter(
        (row) => row.entitlementId && row.dailyPlanId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) => `${row.entitlementId}->${row.dailyPlanId}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Entitlement and daily plan IDs connect the learner path into local-demo access evidence.',
    },
    {
      evidenceKind: 'PRACTICE_PROGRESS_COMPLETION',
      evidenceCount: traceRows.filter(
        (row) => row.practiceProgressRollupId && row.practiceAttemptId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) =>
          `${row.practiceProgressRollupId}->${row.practiceAttemptId}:${row.practiceScorePercent}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Practice progress rows carry deterministic status and score evidence.',
    },
    {
      evidenceKind: 'PARENT_TEACHER_REPORTING',
      evidenceCount: traceRows.filter((row) => row.parentTeacherReportSummaryId)
        .length,
      stableFixtureIds: traceRows.map(
        (row) => row.parentTeacherReportSummaryId,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Parent/teacher reporting evidence is read-only fixture summary data.',
    },
    {
      evidenceKind: 'PERMISSION_REDACTION',
      evidenceCount: traceRows.filter(
        (row) =>
          row.parentTeacherPermissionCaseId &&
          row.permissionRedactionEvidenceId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) =>
          `${row.parentTeacherPermissionCaseId}->${row.permissionRedactionEvidenceId}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Permission and redaction references prove privacy handling remains fixture-only and reviewable.',
    },
    {
      evidenceKind: 'APPROVED_DELIVERY_READ_RECEIPT',
      evidenceCount: traceRows.filter(
        (row) => row.approvedDeliveryOrReadReceiptId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) => row.approvedDeliveryOrReadReceiptId,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Aligned Minh/course A1 approved parent inbox read/ack evidence is referenced without notification delivery or parent-message mutation.',
    },
    {
      evidenceKind: 'SCREEN_TIME_GUARD',
      evidenceCount: traceRows.filter((row) => row.screenTimeGuardEvidenceId)
        .length,
      stableFixtureIds: traceRows.map(
        (row) =>
          `${row.screenTimeGuardEvidenceId}->${row.screenTimeAccessResult}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Screen-time guard evidence links the daily plan path to read-only parent-control fixture decisions.',
    },
    {
      evidenceKind: 'TEACHER_INTERVENTION',
      evidenceCount: traceRows.filter(
        (row) => row.teacherInterventionReviewId && row.supportPlanId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) =>
          `${row.teacherInterventionReviewId}->${row.supportPlanId}->${row.remedialAssignmentId}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Teacher intervention evidence links needs-support progress to support plan and remedial assignment rows.',
    },
    {
      evidenceKind: 'REMEDIAL_RETRY_OR_ESCALATION',
      evidenceCount: traceRows.filter(
        (row) => row.remedialRetryOrEscalationId && row.teacherEscalationId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) =>
          `${row.remedialRetryOrEscalationId}->${row.unresolvedOutcomeId}->${row.teacherEscalationId}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Remedial retry escalation evidence carries deterministic retry status, unresolved outcome, and teacher escalation IDs.',
    },
    {
      evidenceKind: 'ESCALATION_RESOLUTION',
      evidenceCount: traceRows.filter(
        (row) => row.escalationResolutionId && row.resolvedSupportOutcomeId,
      ).length,
      stableFixtureIds: traceRows.map(
        (row) =>
          `${row.escalationResolutionId}->${row.resolvedSupportOutcomeId}->${row.resolutionStatus}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Teacher escalation resolution closes the local-demo journey with resolved support outcome evidence.',
    },
    {
      evidenceKind: 'STABLE_END_TO_END_TRACE',
      evidenceCount: rowsWithStableTrace.length,
      stableFixtureIds: rowsWithStableTrace.map(
        (row) => row.stableEndToEndTraceKey,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Stable trace keys connect accepted learning-core slice IDs into one reviewable MVP readiness path.',
    },
    {
      evidenceKind: 'SAFETY_GATE',
      evidenceCount: safetyGateCount,
      stableFixtureIds: safetyEntries.map(
        ([gate, value]) => `${gate}=${String(value)}`,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'All production, provider, payment, notification, AI, scheduler, learning mutation, and ERP gates remain closed.',
    },
  ];
  const statusCounts: DemoLearningMvpEndToEndReadinessTraceStatusCounts = {
    traceStatus: {
      LOCAL_DEMO_READY_WITH_NOTES: traceRows.length,
    },
    ownerLabel: {
      TEACHER: traceRows.length,
    },
  };

  return {
    reportName: 'Learning local demo MVP End-to-End Readiness Trace Report',
    generatedFor: 'local-demo-mvp-end-to-end-readiness-trace-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#mvp-end-to-end-readiness-trace',
    jsonExportPath:
      'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
    markdownExportPath:
      'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'The local-demo MVP readiness trace links accepted learning-core evidence from enrollment fixture through teacher escalation resolution while keeping production_ready=false.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: new Set(traceRows.map((row) => row.studentId)).size,
      courseCount: new Set(traceRows.map((row) => row.courseId)).size,
      enrollmentOrSubscriptionCount: traceRows.filter(
        (row) => row.enrollmentId && row.subscriptionId,
      ).length,
      paymentRefundCommissionFixtureEvidenceCount: traceRows.filter(
        (row) =>
          row.paymentId ||
          row.refundIds.length > 0 ||
          row.commissionIds.length > 0,
      ).length,
      entitlementOrDailyPlanCount: traceRows.filter(
        (row) => row.entitlementId && row.dailyPlanId,
      ).length,
      practiceProgressOrCompletionCount: traceRows.filter(
        (row) => row.practiceProgressRollupId && row.practiceAttemptId,
      ).length,
      parentTeacherReportCount: traceRows.filter(
        (row) => row.parentTeacherReportSummaryId,
      ).length,
      permissionRedactionEvidenceCount: traceRows.filter(
        (row) => row.permissionRedactionEvidenceId,
      ).length,
      approvedDeliveryOrReadReceiptCount: traceRows.filter(
        (row) => row.approvedDeliveryOrReadReceiptId,
      ).length,
      alignedApprovedDeliveryStudentCoursePathCount:
        rowsWithAlignedApprovedDeliveryStudentCoursePath.length,
      screenTimeGuardEvidenceCount: traceRows.filter(
        (row) => row.screenTimeGuardEvidenceId,
      ).length,
      teacherInterventionEvidenceCount: traceRows.filter(
        (row) => row.teacherInterventionReviewId && row.supportPlanId,
      ).length,
      remedialRetryOrEscalationEvidenceCount: traceRows.filter(
        (row) => row.remedialRetryOrEscalationId && row.teacherEscalationId,
      ).length,
      escalationResolutionEvidenceCount: traceRows.filter(
        (row) => row.escalationResolutionId && row.resolvedSupportOutcomeId,
      ).length,
      stableEndToEndTraceCount: rowsWithStableTrace.length,
      deterministicStatusReasonActionOwnerCount:
        rowsWithDeterministicLabels.length,
      sameStudentCoursePathCount: rowsWithSameStudentCoursePath.length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    statusCounts,
    traceRows,
    evidenceRows,
  };
}

export function toMvpEndToEndReadinessTraceMarkdown(
  report: DemoLearningMvpEndToEndReadinessTraceReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    `Endpoint: ${report.endpointPath}`,
    `JSON export: ${report.jsonExportPath}`,
    `Markdown export: ${report.markdownExportPath}`,
    `Dashboard: ${report.dashboardEvidencePath}`,
    '',
    '## Safety',
    '',
    '- Fixture-only local demo data.',
    '- production_ready=false',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- aiProviderExecutionUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realSubscriptionMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realRemedialRetryUnresolvedAttemptMutationUsed=false',
    '- realTeacherEscalationMutationUsed=false',
    '- realTeacherReviewedEscalationMutationUsed=false',
    '- realAdjustedSupportRetryCompletionMutationUsed=false',
    '- realResolvedSupportOutcomeMutationUsed=false',
    '- realParentClosureSummaryMutationUsed=false',
    '- realTeacherClosureNoteMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Enrollment/subscription links: ${report.totals.enrollmentOrSubscriptionCount}`,
    `- Payment/refund/commission fixture evidence: ${report.totals.paymentRefundCommissionFixtureEvidenceCount}`,
    `- Entitlement/daily plan evidence: ${report.totals.entitlementOrDailyPlanCount}`,
    `- Practice progress/completion evidence: ${report.totals.practiceProgressOrCompletionCount}`,
    `- Parent/teacher report evidence: ${report.totals.parentTeacherReportCount}`,
    `- Permission/redaction evidence: ${report.totals.permissionRedactionEvidenceCount}`,
    `- Approved delivery/read receipt evidence: ${report.totals.approvedDeliveryOrReadReceiptCount}`,
    `- Aligned approved delivery student/course path rows: ${report.totals.alignedApprovedDeliveryStudentCoursePathCount}`,
    `- Screen-time guard evidence: ${report.totals.screenTimeGuardEvidenceCount}`,
    `- Teacher intervention evidence: ${report.totals.teacherInterventionEvidenceCount}`,
    `- Remedial retry/escalation evidence: ${report.totals.remedialRetryOrEscalationEvidenceCount}`,
    `- Escalation resolution evidence: ${report.totals.escalationResolutionEvidenceCount}`,
    `- Stable end-to-end traces: ${report.totals.stableEndToEndTraceCount}`,
    `- Deterministic status/reason/action/owner rows: ${report.totals.deterministicStatusReasonActionOwnerCount}`,
    `- Same student/course path rows: ${report.totals.sameStudentCoursePathCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Trace Rows',
    '',
    '| Trace | Student | Course | Enrollment/subscription | Entitlement/daily plan | Practice | Reporting/privacy | Read receipt | Guard | Intervention | Retry/escalation | Resolution | Status | Owner | Trace key |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.traceRows.map(
      (row) =>
        `| ${[
          row.traceId,
          `${row.studentName} (${row.childProfileId})`,
          `${row.courseCode} (${row.courseId})`,
          `${row.enrollmentId} / ${row.subscriptionId} / ${row.paymentId}`,
          `${row.entitlementId} / ${row.dailyPlanId} / ${row.entitlementAccessStatus}`,
          `${row.practiceProgressRollupId} / ${row.practiceAttemptId} / ${row.practiceAttemptStatus} / ${row.practiceScorePercent}%`,
          `${row.parentTeacherReportSummaryId} / ${row.parentTeacherPermissionCaseId} / ${row.permissionRedactionEvidenceId}`,
          `${row.approvedDeliveryOrReadReceiptId} (${row.approvedDeliveryStudentId}/${row.approvedDeliveryCourseId})`,
          `${row.screenTimeGuardEvidenceId} / ${row.screenTimeAccessResult}`,
          `${row.teacherInterventionReviewId} / ${row.supportPlanId} / ${row.remedialAssignmentId}`,
          `${row.remedialRetryOrEscalationId} / ${row.unresolvedOutcomeId} / ${row.teacherEscalationId}`,
          `${row.escalationResolutionId} / ${row.resolvedSupportOutcomeId} / ${row.resolutionStatus}`,
          `${row.traceStatus}: ${row.reasonLabel}; ${row.actionLabel}`,
          row.ownerLabel,
          row.stableEndToEndTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Evidence Rows',
    '',
    '| Evidence | Count | IDs | Summary |',
    '| --- | ---: | --- | --- |',
    ...report.evidenceRows.map(
      (row) =>
        `| ${[
          row.evidenceKind,
          String(row.evidenceCount),
          row.stableFixtureIds.join('<br>'),
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
