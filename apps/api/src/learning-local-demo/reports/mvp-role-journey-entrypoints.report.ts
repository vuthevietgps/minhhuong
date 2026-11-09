import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningMvpRoleJourneyEntrypointOwner,
  DemoLearningMvpRoleJourneyEntrypointRole,
  DemoLearningMvpRoleJourneyEntrypointRow,
  DemoLearningMvpRoleJourneyEntrypointStatus,
  DemoLearningMvpRoleJourneyEntrypointsEvidenceRow,
  DemoLearningMvpRoleJourneyEntrypointsReport,
  DemoLearningMvpRoleJourneyEntrypointsSafety,
  DemoLearningMvpRoleJourneyEntrypointsStatusCounts,
  DemoLearningMvpRoleJourneyTraceRow,
} from '../learning-local-demo.types';
import { buildMvpEndToEndReadinessTraceReport } from './mvp-end-to-end-readiness-trace.report';
import { buildParentPortalApprovedReportInboxReadReceiptReport } from './parent-portal-approved-report-inbox-read-receipt.report';
import { countByStatus } from './shared';

export const mvpRoleJourneyEntrypointRoles: readonly DemoLearningMvpRoleJourneyEntrypointRole[] =
  ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN_OPERATOR'];

export const mvpRoleJourneyEntrypointStatuses: readonly DemoLearningMvpRoleJourneyEntrypointStatus[] =
  ['LOCAL_DEMO_READY_WITH_NOTES'];

export const mvpRoleJourneyEntrypointOwners: readonly DemoLearningMvpRoleJourneyEntrypointOwner[] =
  ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN_OPERATOR'];

export function buildMvpRoleJourneyEntrypointsReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningMvpRoleJourneyEntrypointsReport {
  const mvpReadinessTraceReport = buildMvpEndToEndReadinessTraceReport(
    fixture,
    generatedAt,
  );
  const parentPortalApprovedReportInboxReadReceiptReport =
    buildParentPortalApprovedReportInboxReadReceiptReport(fixture, generatedAt);
  const requireEvidence = <TRow>(
    row: TRow | undefined,
    description: string,
  ) => {
    if (!row) {
      throw new Error(
        `Missing local demo MVP role journey entrypoint evidence: ${description}`,
      );
    }

    return row;
  };
  const mvpTrace = requireEvidence(
    mvpReadinessTraceReport.traceRows.find(
      (row) =>
        row.studentId === 'student-minh' &&
        row.courseId === 'course-a1-starter',
    ),
    'student-minh/course-a1-starter readiness trace',
  );
  const parentReadAck = requireEvidence(
    parentPortalApprovedReportInboxReadReceiptReport.readAckRows.find(
      (row) =>
        row.readAckEvidenceId === mvpTrace.approvedDeliveryOrReadReceiptId,
    ),
    'aligned parent read receipt row',
  );
  const parentInbox = requireEvidence(
    parentPortalApprovedReportInboxReadReceiptReport.parentInboxRows.find(
      (row) => row.parentInboxItemId === parentReadAck.parentInboxItemId,
    ),
    'aligned parent inbox row',
  );
  const stableRoleJourneyTraceId =
    'mvp-role-journey-entrypoints-minh-a1-2026-06-09';
  const baseStableRoleJourneyTraceIds = [
    stableRoleJourneyTraceId,
    mvpTrace.traceId,
    mvpTrace.studentId,
    mvpTrace.courseId,
    mvpTrace.learningPathId,
    mvpTrace.dailyPlanId,
    mvpTrace.practiceAttemptId,
    parentInbox.parentInboxItemId,
    parentReadAck.readAckEvidenceId,
    mvpTrace.screenTimeGuardEvidenceId,
    mvpTrace.parentTeacherReportSummaryId,
    mvpTrace.teacherInterventionReviewId,
    mvpTrace.remedialAssignmentId,
    mvpTrace.remedialRetryOrEscalationId,
    mvpTrace.teacherEscalationId,
    mvpTrace.escalationResolutionId,
    mvpTrace.resolvedSupportOutcomeId,
  ];
  const buildEntrypointRow = (input: {
    role: DemoLearningMvpRoleJourneyEntrypointRole;
    roleLabel: string;
    routePath: string;
    dashboardAnchor: string;
    routeLabel: string;
    anchorLabel: string;
    actionLabel: string;
    reasonLabel: string;
    ownerLabel: DemoLearningMvpRoleJourneyEntrypointOwner;
    evidenceSummary: string;
  }): DemoLearningMvpRoleJourneyEntrypointRow => {
    const roleEntrypointId = `role-entrypoint-${input.role.toLowerCase().replace(/_/g, '-')}-minh-a1`;
    const stableRoleJourneyTraceIds = [
      ...baseStableRoleJourneyTraceIds,
      roleEntrypointId,
      input.role,
    ];

    return {
      roleEntrypointId,
      role: input.role,
      roleLabel: input.roleLabel,
      stableRoleJourneyTraceId,
      stableRoleJourneyTraceKey: stableRoleJourneyTraceIds.join('->'),
      stableRoleJourneyTraceIds,
      studentId: mvpTrace.studentId,
      childProfileId: mvpTrace.childProfileId,
      studentName: mvpTrace.studentName,
      parentGuardianId: mvpTrace.parentGuardianId,
      teacherId: mvpTrace.teacherId,
      teacherName: mvpTrace.teacherName,
      courseId: mvpTrace.courseId,
      courseCode: mvpTrace.courseCode,
      courseTitle: mvpTrace.courseTitle,
      learningPathId: mvpTrace.learningPathId,
      dailyPlanId: mvpTrace.dailyPlanId,
      dailyPlanTitle: mvpTrace.dailyPlanTitle,
      practiceAttemptId: mvpTrace.practiceAttemptId,
      routePath: input.routePath,
      dashboardAnchor: input.dashboardAnchor,
      routeLabel: input.routeLabel,
      anchorLabel: input.anchorLabel,
      actionLabel: input.actionLabel,
      statusLabel: 'LOCAL_DEMO_READY_WITH_NOTES',
      reasonLabel: input.reasonLabel,
      ownerLabel: input.ownerLabel,
      mvpReadinessTraceId: mvpTrace.traceId,
      parentInboxItemId: parentInbox.parentInboxItemId,
      parentReadReceiptEvidenceId: parentReadAck.readAckEvidenceId,
      screenTimeGuardEvidenceId: mvpTrace.screenTimeGuardEvidenceId,
      teacherProgressSummaryId: mvpTrace.parentTeacherReportSummaryId,
      teacherInterventionReviewId: mvpTrace.teacherInterventionReviewId,
      remedialAssignmentId: mvpTrace.remedialAssignmentId,
      remedialRetryOrEscalationId: mvpTrace.remedialRetryOrEscalationId,
      teacherEscalationResolutionId: mvpTrace.escalationResolutionId,
      safetyOverviewAnchor: '/admin/learning-local-demo#mvp-readiness-overview',
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      productionReady: false,
      evidenceSummary: input.evidenceSummary,
    };
  };
  const entrypointRows: DemoLearningMvpRoleJourneyEntrypointRow[] = [
    buildEntrypointRow({
      role: 'STUDENT',
      roleLabel: 'Student daily plan and practice entrypoint',
      routePath: `/student/learning/${mvpTrace.courseId}/daily-plans/${mvpTrace.dailyPlanId}#${mvpTrace.practiceAttemptId}`,
      dashboardAnchor:
        '/admin/learning-local-demo#learning-session-completion-practice-progress-rollup',
      routeLabel: 'Student daily plan route',
      anchorLabel: 'Daily plan practice evidence',
      actionLabel: 'Resume assigned daily plan practice',
      reasonLabel:
        'Student entrypoint starts from the accepted Minh/course A1 daily plan and practice attempt.',
      ownerLabel: 'STUDENT',
      evidenceSummary:
        'The student enters the same Minh A1 path through the daily plan/practice route tied to the MVP readiness trace.',
    }),
    buildEntrypointRow({
      role: 'PARENT',
      roleLabel: 'Parent inbox, read receipt, and screen-time guard entrypoint',
      routePath: `/parent/children/${mvpTrace.childProfileId}/reports/${parentInbox.parentInboxItemId}#${parentReadAck.readAckEvidenceId}`,
      dashboardAnchor:
        '/admin/learning-local-demo#parent-portal-approved-report-inbox-read-receipt',
      routeLabel: 'Parent report inbox route',
      anchorLabel: 'Approved inbox read receipt evidence',
      actionLabel:
        'Open approved report, acknowledge it, and review screen-time guard state',
      reasonLabel:
        'Parent entrypoint links the approved inbox item, read receipt, and screen-time guard to Minh/course A1.',
      ownerLabel: 'PARENT',
      evidenceSummary:
        'The parent enters through the approved parent portal inbox/read receipt path and sees the linked screen-time guard evidence.',
    }),
    buildEntrypointRow({
      role: 'TEACHER',
      roleLabel:
        'Teacher progress, intervention, remedial, and escalation entrypoint',
      routePath: `/teacher/classes/${mvpTrace.classId}/students/${mvpTrace.studentId}/interventions/${mvpTrace.teacherInterventionReviewId}`,
      dashboardAnchor:
        '/admin/learning-local-demo#teacher-intervention-remedial-assignment-support-plan',
      routeLabel: 'Teacher intervention workspace route',
      anchorLabel: 'Progress intervention remedial escalation evidence',
      actionLabel:
        'Review progress, support plan, remedial retry, and close escalation resolution',
      reasonLabel:
        'Teacher entrypoint links progress reporting, intervention, remedial retry, and escalation resolution evidence.',
      ownerLabel: 'TEACHER',
      evidenceSummary:
        'The teacher enters through the Minh A1 intervention workspace and can trace progress, support plan, remedial retry, and resolved escalation rows.',
    }),
    buildEntrypointRow({
      role: 'ADMIN_OPERATOR',
      roleLabel:
        'Admin/operator readiness trace and safety overview entrypoint',
      routePath: `/admin/learning-local-demo#mvp-role-journey-entrypoints`,
      dashboardAnchor:
        '/admin/learning-local-demo#mvp-role-journey-entrypoints',
      routeLabel: 'Admin/operator MVP role journey route',
      anchorLabel: 'MVP role journey entrypoint evidence',
      actionLabel:
        'Review role entrypoints, MVP readiness trace, and closed safety gates',
      reasonLabel:
        'Admin/operator entrypoint exposes the local-demo role journey and safety overview without production readiness claims.',
      ownerLabel: 'ADMIN_OPERATOR',
      evidenceSummary:
        'The admin/operator enters through the new dashboard anchor and links the role journey to readiness trace and safety overview evidence.',
    }),
  ];
  const stableTraceRows: DemoLearningMvpRoleJourneyTraceRow[] = [
    {
      stableRoleJourneyTraceId,
      stableRoleJourneyTraceKey: [
        stableRoleJourneyTraceId,
        ...entrypointRows.map((row) => row.roleEntrypointId),
        mvpTrace.traceId,
        parentReadAck.readAckEvidenceId,
        mvpTrace.escalationResolutionId,
      ].join('->'),
      studentId: mvpTrace.studentId,
      courseId: mvpTrace.courseId,
      learningPathId: mvpTrace.learningPathId,
      roleEntrypointIds: entrypointRows.map((row) => row.roleEntrypointId),
      roleLabels: entrypointRows.map((row) => row.roleLabel),
      mvpReadinessTraceId: mvpTrace.traceId,
      parentReadReceiptEvidenceId: parentReadAck.readAckEvidenceId,
      teacherEscalationResolutionId: mvpTrace.escalationResolutionId,
      traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
      reasonLabel:
        'All primary roles enter the accepted Minh/course A1 local-demo journey through one stable trace id.',
      actionLabel:
        'Use this entrypoint evidence for local review only; keep production_ready=false.',
      ownerLabel: 'ADMIN_OPERATOR',
      evidenceSummary:
        'Student, parent, teacher, and admin/operator entrypoints all share the same Minh/course A1 path and link to the accepted MVP readiness trace.',
    },
  ];
  const rowsWithSameStudentCoursePath = entrypointRows.filter(
    (row) =>
      row.studentId === mvpTrace.studentId &&
      row.courseId === mvpTrace.courseId &&
      row.learningPathId === mvpTrace.learningPathId &&
      row.dailyPlanId === mvpTrace.dailyPlanId &&
      row.practiceAttemptId === mvpTrace.practiceAttemptId,
  );
  const rowsWithDeterministicLabels = entrypointRows.filter(
    (row) =>
      Boolean(row.statusLabel) &&
      Boolean(row.reasonLabel) &&
      Boolean(row.actionLabel) &&
      Boolean(row.ownerLabel),
  );
  const rowsWithRouteAnchorActionStatusLabels = entrypointRows.filter(
    (row) =>
      Boolean(row.routePath) &&
      Boolean(row.dashboardAnchor) &&
      Boolean(row.routeLabel) &&
      Boolean(row.anchorLabel) &&
      Boolean(row.actionLabel) &&
      Boolean(row.statusLabel),
  );
  const remainingLocalDemoNotes = [
    'Role entrypoints are deterministic report/dashboard evidence only and do not create production navigation, authorization, or workflow state.',
    'Every role row links to student-minh, course-a1-starter, the aligned parent read receipt, and the accepted MVP readiness trace.',
    'Production database reads, provider APIs, payment/refund mutation, notification sends, AI execution, scheduler activation, secrets, and real learner mutations remain out of scope.',
  ];
  const safety = {
    ...mvpReadinessTraceReport.safety,
  } satisfies DemoLearningMvpRoleJourneyEntrypointsSafety;
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
  const evidenceRows: DemoLearningMvpRoleJourneyEntrypointsEvidenceRow[] = [
    {
      evidenceKind: 'STUDENT_ENTRYPOINT',
      evidenceCount: entrypointRows.filter((row) => row.role === 'STUDENT')
        .length,
      stableFixtureIds: entrypointRows
        .filter((row) => row.role === 'STUDENT')
        .map(
          (row) =>
            `${row.roleEntrypointId}->${row.dailyPlanId}->${row.practiceAttemptId}`,
        ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Student entrypoint links to the accepted daily plan and practice attempt.',
    },
    {
      evidenceKind: 'PARENT_ENTRYPOINT',
      evidenceCount: entrypointRows.filter((row) => row.role === 'PARENT')
        .length,
      stableFixtureIds: entrypointRows
        .filter((row) => row.role === 'PARENT')
        .map(
          (row) =>
            `${row.roleEntrypointId}->${row.parentInboxItemId}->${row.parentReadReceiptEvidenceId}->${row.screenTimeGuardEvidenceId}`,
        ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Parent entrypoint links approved inbox, read receipt, and screen-time guard evidence.',
    },
    {
      evidenceKind: 'TEACHER_ENTRYPOINT',
      evidenceCount: entrypointRows.filter((row) => row.role === 'TEACHER')
        .length,
      stableFixtureIds: entrypointRows
        .filter((row) => row.role === 'TEACHER')
        .map(
          (row) =>
            `${row.roleEntrypointId}->${row.teacherInterventionReviewId}->${row.remedialAssignmentId}->${row.remedialRetryOrEscalationId}->${row.teacherEscalationResolutionId}`,
        ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Teacher entrypoint links progress, intervention, remedial retry, and escalation resolution evidence.',
    },
    {
      evidenceKind: 'ADMIN_OPERATOR_ENTRYPOINT',
      evidenceCount: entrypointRows.filter(
        (row) => row.role === 'ADMIN_OPERATOR',
      ).length,
      stableFixtureIds: entrypointRows
        .filter((row) => row.role === 'ADMIN_OPERATOR')
        .map(
          (row) =>
            `${row.roleEntrypointId}->${row.mvpReadinessTraceId}->${row.safetyOverviewAnchor}`,
        ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Admin/operator entrypoint links the new role journey anchor, readiness trace, and safety overview.',
    },
    {
      evidenceKind: 'STABLE_ROLE_JOURNEY_TRACE',
      evidenceCount: stableTraceRows.length,
      stableFixtureIds: stableTraceRows.map(
        (row) => row.stableRoleJourneyTraceKey,
      ),
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'One stable trace id connects every role entrypoint to the same Minh/course A1 path.',
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
        'All local-demo safety gates remain closed and production_ready remains false.',
    },
  ];
  const statusCounts: DemoLearningMvpRoleJourneyEntrypointsStatusCounts = {
    role: countByStatus(
      mvpRoleJourneyEntrypointRoles,
      entrypointRows,
      (row) => row.role,
    ),
    status: countByStatus(
      mvpRoleJourneyEntrypointStatuses,
      entrypointRows,
      (row) => row.statusLabel,
    ),
    ownerLabel: countByStatus(
      mvpRoleJourneyEntrypointOwners,
      entrypointRows,
      (row) => row.ownerLabel,
    ),
  };

  return {
    reportName: 'Learning local demo MVP Role Journey Entrypoints Report',
    generatedFor: 'local-demo-mvp-role-journey-entrypoints-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath: '/v1/learning-local-demo/mvp-role-journey-entrypoints-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#mvp-role-journey-entrypoints',
    jsonExportPath:
      'exports/learning-local-demo-mvp-role-journey-entrypoints-report.json',
    markdownExportPath:
      'exports/learning-local-demo-mvp-role-journey-entrypoints-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Student, parent, teacher, and admin/operator local-demo entrypoints all link to the same accepted Minh/course A1 MVP readiness journey.',
      remainingLocalDemoNotes,
    },
    totals: {
      roleEntrypointCount: entrypointRows.length,
      studentRoleEntrypointCount: statusCounts.role.STUDENT,
      parentRoleEntrypointCount: statusCounts.role.PARENT,
      teacherRoleEntrypointCount: statusCounts.role.TEACHER,
      adminRoleEntrypointCount: statusCounts.role.ADMIN_OPERATOR,
      stableRoleJourneyTraceCount: stableTraceRows.length,
      sameStudentCoursePathCount: rowsWithSameStudentCoursePath.length,
      linkedMvpReadinessTraceCount: entrypointRows.filter(
        (row) => row.mvpReadinessTraceId === mvpTrace.traceId,
      ).length,
      linkedParentReadReceiptCount: entrypointRows.filter(
        (row) =>
          row.parentReadReceiptEvidenceId === parentReadAck.readAckEvidenceId,
      ).length,
      linkedTeacherEscalationResolutionCount: entrypointRows.filter(
        (row) =>
          row.teacherEscalationResolutionId === mvpTrace.escalationResolutionId,
      ).length,
      deterministicStatusReasonActionOwnerCount:
        rowsWithDeterministicLabels.length,
      routeAnchorActionStatusLabelCount:
        rowsWithRouteAnchorActionStatusLabels.length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    statusCounts,
    entrypointRows,
    stableTraceRows,
    evidenceRows,
  };
}

export function toMvpRoleJourneyEntrypointsMarkdown(
  report: DemoLearningMvpRoleJourneyEntrypointsReport,
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
    '- realLearningMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realParentMessageMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Role entrypoints: ${report.totals.roleEntrypointCount}`,
    `- Student role entrypoints: ${report.totals.studentRoleEntrypointCount}`,
    `- Parent role entrypoints: ${report.totals.parentRoleEntrypointCount}`,
    `- Teacher role entrypoints: ${report.totals.teacherRoleEntrypointCount}`,
    `- Admin/operator role entrypoints: ${report.totals.adminRoleEntrypointCount}`,
    `- Stable role journey traces: ${report.totals.stableRoleJourneyTraceCount}`,
    `- Same student/course path rows: ${report.totals.sameStudentCoursePathCount}`,
    `- Linked MVP readiness trace rows: ${report.totals.linkedMvpReadinessTraceCount}`,
    `- Linked parent read receipt rows: ${report.totals.linkedParentReadReceiptCount}`,
    `- Linked teacher escalation resolution rows: ${report.totals.linkedTeacherEscalationResolutionCount}`,
    `- Deterministic status/reason/action/owner rows: ${report.totals.deterministicStatusReasonActionOwnerCount}`,
    `- Route/anchor/action/status label rows: ${report.totals.routeAnchorActionStatusLabelCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Role Entrypoint Rows',
    '',
    '| Entrypoint | Role | Student | Course | Route | Dashboard anchor | Action | Status | Reason | Owner | Linked evidence | Trace key |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.entrypointRows.map(
      (row) =>
        `| ${[
          row.roleEntrypointId,
          `${row.roleLabel} (${row.role})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.courseCode} (${row.courseId})`,
          `${row.routeLabel}: ${row.routePath}`,
          `${row.anchorLabel}: ${row.dashboardAnchor}`,
          row.actionLabel,
          row.statusLabel,
          row.reasonLabel,
          row.ownerLabel,
          [
            row.mvpReadinessTraceId,
            row.parentInboxItemId,
            row.parentReadReceiptEvidenceId,
            row.screenTimeGuardEvidenceId,
            row.teacherInterventionReviewId,
            row.remedialAssignmentId,
            row.remedialRetryOrEscalationId,
            row.teacherEscalationResolutionId,
          ].join('<br>'),
          row.stableRoleJourneyTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Stable Trace Rows',
    '',
    '| Trace | Student/course | Roles | MVP trace | Parent read receipt | Teacher resolution | Status | Action | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.stableTraceRows.map(
      (row) =>
        `| ${[
          row.stableRoleJourneyTraceId,
          `${row.studentId} / ${row.courseId} / ${row.learningPathId}`,
          row.roleLabels.join('<br>'),
          row.mvpReadinessTraceId,
          row.parentReadReceiptEvidenceId,
          row.teacherEscalationResolutionId,
          `${row.traceStatus}: ${row.reasonLabel}`,
          row.actionLabel,
          row.evidenceSummary,
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
