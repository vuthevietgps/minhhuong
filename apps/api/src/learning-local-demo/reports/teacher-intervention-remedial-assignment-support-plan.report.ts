import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningDailyPlan,
  DemoLearningSessionCompletionPracticeProgressRollupRow,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety,
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts,
  DemoLearningTeacherInterventionReviewRow,
  DemoLearningParentVisibleSupportSummaryRow,
  DemoLearningRemedialAssignmentRow,
  DemoLearningSupportPlanRow,
  DemoLearningTeacherVisibleNextActionRow,
} from '../learning-local-demo.types';
import { buildLearningSessionCompletionPracticeProgressRollupReport } from './learning-session-completion-practice-progress-rollup.report';
import {
  countByStatus,
  requireDailyPlan,
  requireGuardian,
  requireLesson,
  requirePracticeAttempt,
} from './shared';

export const teacherInterventionReviewStatuses = ['REVIEWED'] as const;

export const remedialAssignmentFixtureStatuses = ['ASSIGNED'] as const;

export const supportPlanFixtureStatuses = [
  'PARENT_VISIBLE_REVIEW_READY',
] as const;

export const teacherNextActionStatuses = ['SCHEDULED'] as const;

export function buildTeacherInterventionRemedialAssignmentSupportPlanReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport {
  const progressRollupReport =
    buildLearningSessionCompletionPracticeProgressRollupReport(
      fixture,
      generatedAt,
    );
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((plan) => [plan.id, plan]),
  );
  const lessonsById = new Map(
    fixture.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const guardiansById = new Map(
    fixture.parentGuardians.map((guardian) => [guardian.id, guardian]),
  );
  const practiceAttemptByDailyPlanId = new Map(
    fixture.practiceAttempts.map((attempt) => [attempt.dailyPlanId, attempt]),
  );
  const needsSupportRollupRows = progressRollupReport.progressRollupRows.filter(
    (row) =>
      row.rollupStatus === 'NEEDS_SUPPORT' ||
      row.progressStatus === 'NEEDS_SUPPORT',
  );

  const interventionReviewRows: DemoLearningTeacherInterventionReviewRow[] =
    needsSupportRollupRows.map((row) => {
      const teacher = fixture.contentOwners.find(
        (owner) =>
          owner.role === 'TEACHER' && owner.classIds.includes(row.classId),
      );
      if (!teacher) {
        throw new Error(
          `Missing local demo teacher owner for class ${row.classId}`,
        );
      }
      const sourceDailyPlan = requireDailyPlan(dailyPlansById, row.dailyPlanId);
      const remedialDailyPlan = findRemedialDailyPlanForSupportPlan(
        fixture.dailyPlans,
        sourceDailyPlan,
      );
      const remedialPracticeAttempt = requirePracticeAttempt(
        practiceAttemptByDailyPlanId,
        remedialDailyPlan.id,
      );
      const remedialLesson = requireLesson(
        lessonsById,
        remedialDailyPlan.lessonId,
      );
      const interventionReviewId = `teacher-intervention-review-${row.progressRollupId}`;
      const remedialAssignmentId = `remedial-assignment-${row.progressRollupId}`;
      const supportPlanId = `support-plan-${row.progressRollupId}`;
      const parentVisibleSupportSummaryId = `parent-support-summary-${row.progressRollupId}`;
      const teacherVisibleNextActionId = `teacher-next-action-${row.progressRollupId}`;
      const supportReason = buildTeacherInterventionSupportReason(row);
      const safeNextActionLabel = buildTeacherInterventionSafeNextAction(row);
      const stableTraceIds = [
        row.studentId,
        row.courseId,
        row.dailyPlanId,
        row.sessionId,
        row.learningSessionEvidenceId,
        row.progressRecordId,
        row.progressRollupId,
        teacher.id,
        interventionReviewId,
        remedialDailyPlan.id,
        remedialPracticeAttempt.id,
        remedialAssignmentId,
        supportPlanId,
        parentVisibleSupportSummaryId,
        teacherVisibleNextActionId,
      ];

      return {
        interventionReviewId,
        progressRollupId: row.progressRollupId,
        stableTraceKey: stableTraceIds.join('->'),
        stableTraceIds,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        parentGuardianId: row.parentGuardianId,
        teacherId: teacher.id,
        teacherName: teacher.displayName,
        teacherEmail: teacher.email,
        courseId: row.courseId,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        classId: row.classId,
        classCode: row.classCode,
        learningPathId: row.learningPathId,
        sourceDailyPlanId: row.dailyPlanId,
        sourceDailyPlanTitle: row.dailyPlanTitle,
        sourceSessionId: row.sessionId,
        learningSessionEvidenceId: row.learningSessionEvidenceId,
        remedialDailyPlanId: remedialDailyPlan.id,
        remedialPracticeAttemptId: remedialPracticeAttempt.id,
        remedialLessonId: remedialLesson.id,
        remedialLessonCode: remedialLesson.code,
        sourceAssignmentId: remedialPracticeAttempt.assignmentId ?? null,
        progressRecordId: row.progressRecordId,
        rollupStatus: row.rollupStatus,
        completionPercent: row.completionPercent,
        practiceScorePercent: row.practiceScorePercent,
        supportReason,
        reviewStatus: 'REVIEWED',
        reviewedAt: generatedAt,
        remedialAssignmentId,
        supportPlanId,
        parentVisibleSupportSummaryId,
        teacherVisibleNextActionId,
        safeNextActionLabel,
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary: `${teacher.displayName} reviewed ${row.studentName} from ${row.progressRollupId}; ${supportReason}`,
      } satisfies DemoLearningTeacherInterventionReviewRow;
    });

  const remedialAssignmentRows: DemoLearningRemedialAssignmentRow[] =
    interventionReviewRows.map((row) => {
      const remedialDailyPlan = requireDailyPlan(
        dailyPlansById,
        row.remedialDailyPlanId,
      );

      return {
        remedialAssignmentId: row.remedialAssignmentId,
        interventionReviewId: row.interventionReviewId,
        supportPlanId: row.supportPlanId,
        progressRollupId: row.progressRollupId,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        courseId: row.courseId,
        courseCode: row.courseCode,
        remedialDailyPlanId: remedialDailyPlan.id,
        remedialDailyPlanTitle: remedialDailyPlan.title,
        remedialLessonId: row.remedialLessonId,
        remedialLessonCode: row.remedialLessonCode,
        sourcePracticeAttemptId: row.remedialPracticeAttemptId,
        sourceAssignmentId: row.sourceAssignmentId,
        status: 'ASSIGNED',
        dueAt: `${remedialDailyPlan.planDate}T17:00:00.000Z`,
        safeNextActionLabel: row.safeNextActionLabel,
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary: `${row.studentName} has a fixture remedial assignment on ${remedialDailyPlan.title} with ${row.teacherName} review evidence.`,
      } satisfies DemoLearningRemedialAssignmentRow;
    });

  const supportPlanRows: DemoLearningSupportPlanRow[] =
    interventionReviewRows.map((row) => ({
      supportPlanId: row.supportPlanId,
      interventionReviewId: row.interventionReviewId,
      progressRollupId: row.progressRollupId,
      remedialAssignmentId: row.remedialAssignmentId,
      parentVisibleSupportSummaryId: row.parentVisibleSupportSummaryId,
      teacherVisibleNextActionId: row.teacherVisibleNextActionId,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      teacherId: row.teacherId,
      teacherName: row.teacherName,
      courseId: row.courseId,
      courseCode: row.courseCode,
      supportReason: row.supportReason,
      status: 'PARENT_VISIBLE_REVIEW_READY',
      safeNextActionLabel: row.safeNextActionLabel,
      parentVisible: true,
      teacherVisible: true,
      planSummary: `${row.studentName} needs a teacher-reviewed remedial practice plan for ${row.courseCode}; parent summary is visible as fixture evidence only.`,
      fixtureOnly: true,
      providerUsed: false,
      mutationUsed: false,
    }));

  const parentSummaryRows: DemoLearningParentVisibleSupportSummaryRow[] =
    interventionReviewRows.map((row) => {
      const guardian = requireGuardian(guardiansById, row.parentGuardianId);

      return {
        parentVisibleSupportSummaryId: row.parentVisibleSupportSummaryId,
        supportPlanId: row.supportPlanId,
        interventionReviewId: row.interventionReviewId,
        progressRollupId: row.progressRollupId,
        parentGuardianId: guardian.id,
        parentGuardianName: guardian.displayName,
        parentGuardianEmail: guardian.email,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseCode: row.courseCode,
        supportReason: row.supportReason,
        safeNextActionLabel: row.safeNextActionLabel,
        parentVisible: true,
        summary: `${row.studentName} has a teacher-reviewed local-demo support plan: ${row.safeNextActionLabel}.`,
      } satisfies DemoLearningParentVisibleSupportSummaryRow;
    });

  const teacherNextActionRows: DemoLearningTeacherVisibleNextActionRow[] =
    interventionReviewRows.map((row) => ({
      teacherVisibleNextActionId: row.teacherVisibleNextActionId,
      supportPlanId: row.supportPlanId,
      interventionReviewId: row.interventionReviewId,
      progressRollupId: row.progressRollupId,
      teacherId: row.teacherId,
      teacherName: row.teacherName,
      teacherEmail: row.teacherEmail,
      classId: row.classId,
      classCode: row.classCode,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      courseCode: row.courseCode,
      status: 'SCHEDULED',
      dueAt: generatedAt,
      safeNextActionLabel: row.safeNextActionLabel,
      teacherVisible: true,
      summary: `${row.teacherName} should review ${row.studentName} with the remedial assignment and keep parent-visible support wording safe.`,
    }));

  const statusCounts: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts =
    {
      interventionReviewStatus: countByStatus(
        teacherInterventionReviewStatuses,
        interventionReviewRows,
        (row) => row.reviewStatus,
      ),
      remedialAssignmentStatus: countByStatus(
        remedialAssignmentFixtureStatuses,
        remedialAssignmentRows,
        (row) => row.status,
      ),
      supportPlanStatus: countByStatus(
        supportPlanFixtureStatuses,
        supportPlanRows,
        (row) => row.status,
      ),
      teacherNextActionStatus: countByStatus(
        teacherNextActionStatuses,
        teacherNextActionRows,
        (row) => row.status,
      ),
    };
  const rowsWithStableTrace = interventionReviewRows.filter((row) =>
    [
      row.studentId,
      row.courseId,
      row.sourceDailyPlanId,
      row.sourceSessionId,
      row.learningSessionEvidenceId,
      row.progressRecordId,
      row.progressRollupId,
      row.teacherId,
      row.interventionReviewId,
      row.remedialDailyPlanId,
      row.remedialPracticeAttemptId,
      row.remedialAssignmentId,
      row.supportPlanId,
      row.parentVisibleSupportSummaryId,
      row.teacherVisibleNextActionId,
    ].every((id) => row.stableTraceKey.includes(id)),
  );
  const linkedInterventionRows = interventionReviewRows.filter(
    (row) =>
      Boolean(row.studentId) &&
      Boolean(row.teacherId) &&
      Boolean(row.courseId) &&
      Boolean(row.progressRollupId) &&
      Boolean(row.supportReason) &&
      remedialAssignmentRows.some(
        (assignment) =>
          assignment.remedialAssignmentId === row.remedialAssignmentId,
      ) &&
      supportPlanRows.some(
        (plan) => plan.supportPlanId === row.supportPlanId,
      ) &&
      parentSummaryRows.some(
        (summary) =>
          summary.parentVisibleSupportSummaryId ===
          row.parentVisibleSupportSummaryId,
      ) &&
      teacherNextActionRows.some(
        (action) =>
          action.teacherVisibleNextActionId === row.teacherVisibleNextActionId,
      ),
  );
  const remainingLocalDemoNotes = [
    'Teacher intervention reviews are deterministic fixture rows derived from needs-support progress rollups.',
    'Remedial assignments, support plans, parent summaries, and teacher next actions are read-only evidence only.',
    'Production teacher workflow persistence, parent delivery, provider calls, AI execution, and real learner mutations remain out of scope.',
  ];
  const safety = {
    productionReady: false,
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
    realParentMutationUsed: false,
    realCourseMutationUsed: false,
    realEnrollmentMutationUsed: false,
    realSubscriptionMutationUsed: false,
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
    realLearningMutationUsed: false,
    realLearningSessionCompletionMutationUsed: false,
    realParentProgressSummaryMutationUsed: false,
    realTeacherProgressSummaryMutationUsed: false,
    realParentMessageMutationUsed: false,
    realTeacherInterventionMutationUsed: false,
    realTeacherInterventionReviewMutationUsed: false,
    realRemedialAssignmentMutationUsed: false,
    realSupportPlanMutationUsed: false,
    realParentSupportSummaryMutationUsed: false,
    realTeacherNextActionMutationUsed: false,
    realPaymentMutationUsed: false,
    realRefundMutationUsed: false,
    realCommissionMutationUsed: false,
    realErpMutationUsed: false,
    secretsRequired: false,
  } satisfies DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety;
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
  const evidenceRows: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow[] =
    [
      {
        evidenceKind: 'NEEDS_SUPPORT_PROGRESS_ROLLUP',
        evidenceCount: needsSupportRollupRows.length,
        stableFixtureIds: needsSupportRollupRows.map(
          (row) => row.progressRollupId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Needs-support rollups are the source for teacher intervention review evidence.',
      },
      {
        evidenceKind: 'TEACHER_INTERVENTION_REVIEW',
        evidenceCount: interventionReviewRows.length,
        stableFixtureIds: interventionReviewRows.map(
          (row) => row.interventionReviewId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher review rows link the needs-support learner, teacher, course, progress rollup, and support reason.',
      },
      {
        evidenceKind: 'REMEDIAL_ASSIGNMENT',
        evidenceCount: remedialAssignmentRows.length,
        stableFixtureIds: remedialAssignmentRows.map(
          (row) => row.remedialAssignmentId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Remedial assignments are deterministic fixture rows and do not write learner assignments.',
      },
      {
        evidenceKind: 'SUPPORT_PLAN',
        evidenceCount: supportPlanRows.length,
        stableFixtureIds: supportPlanRows.map((row) => row.supportPlanId),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Support plans include deterministic statuses and safe next-action labels.',
      },
      {
        evidenceKind: 'PARENT_VISIBLE_SUPPORT_SUMMARY',
        evidenceCount: parentSummaryRows.length,
        stableFixtureIds: parentSummaryRows.map(
          (row) => row.parentVisibleSupportSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent-visible support summaries are report rows only and do not send notifications.',
      },
      {
        evidenceKind: 'TEACHER_VISIBLE_NEXT_ACTION',
        evidenceCount: teacherNextActionRows.length,
        stableFixtureIds: teacherNextActionRows.map(
          (row) => row.teacherVisibleNextActionId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher-visible next actions are local-demo evidence and do not mutate teacher workflow state.',
      },
      {
        evidenceKind: 'STABLE_TRACE',
        evidenceCount: rowsWithStableTrace.length,
        stableFixtureIds: rowsWithStableTrace.map((row) => row.stableTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Stable traces connect student -> course -> daily plan/session -> progress rollup -> teacher review -> support plan evidence.',
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
          'All production, provider, payment, notification, AI, support-plan mutation, learning mutation, and ERP gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Teacher Intervention -> Remedial Assignment Support Plan Report',
    generatedFor:
      'local-demo-teacher-intervention-remedial-assignment-support-plan-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#teacher-intervention-remedial-assignment-support-plan',
    jsonExportPath:
      'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
    markdownExportPath:
      'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Needs-support progress rollups create teacher intervention review, remedial assignment, support plan, parent-visible support summary, and teacher next-action evidence.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: new Set(interventionReviewRows.map((row) => row.studentId))
        .size,
      teacherCount: new Set(interventionReviewRows.map((row) => row.teacherId))
        .size,
      courseCount: new Set(interventionReviewRows.map((row) => row.courseId))
        .size,
      needsSupportProgressRollupCount: needsSupportRollupRows.length,
      teacherInterventionReviewCount: interventionReviewRows.length,
      remedialAssignmentCount: remedialAssignmentRows.length,
      supportPlanCount: supportPlanRows.length,
      parentVisibleSupportSummaryCount: parentSummaryRows.length,
      teacherVisibleNextActionCount: teacherNextActionRows.length,
      supportReasonCount: interventionReviewRows.filter((row) =>
        Boolean(row.supportReason),
      ).length,
      stableTraceCount: rowsWithStableTrace.length,
      interventionLinksCompleteCount: linkedInterventionRows.length,
      supportPlansWithDeterministicStatusCount: supportPlanRows.filter(
        (row) => Boolean(row.status) && Boolean(row.safeNextActionLabel),
      ).length,
      remedialAssignmentsWithDeterministicStatusCount:
        remedialAssignmentRows.filter(
          (row) => Boolean(row.status) && Boolean(row.safeNextActionLabel),
        ).length,
      teacherNextActionsWithSafeLabelCount: teacherNextActionRows.filter(
        (row) => Boolean(row.safeNextActionLabel),
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    statusCounts,
    interventionReviewRows,
    remedialAssignmentRows,
    supportPlanRows,
    parentSummaryRows,
    teacherNextActionRows,
    evidenceRows,
  };
}

export function toTeacherInterventionRemedialAssignmentSupportPlanMarkdown(
  report: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport,
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
    '- aiProviderUsed=false',
    '- aiProviderExecutionUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realParentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realLearningSessionCompletionMutationUsed=false',
    '- realProgressMutationUsed=false',
    '- realVideoEvidenceMutationUsed=false',
    '- realPracticeMutationUsed=false',
    '- realParentProgressSummaryMutationUsed=false',
    '- realTeacherProgressSummaryMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realTeacherInterventionReviewMutationUsed=false',
    '- realRemedialAssignmentMutationUsed=false',
    '- realSupportPlanMutationUsed=false',
    '- realParentSupportSummaryMutationUsed=false',
    '- realTeacherNextActionMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realParentMessageMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Acceptance Counts',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Teachers: ${report.totals.teacherCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Needs-support progress rollups: ${report.totals.needsSupportProgressRollupCount}`,
    `- Teacher intervention reviews: ${report.totals.teacherInterventionReviewCount}`,
    `- Remedial assignments: ${report.totals.remedialAssignmentCount}`,
    `- Support plans: ${report.totals.supportPlanCount}`,
    `- Parent-visible support summaries: ${report.totals.parentVisibleSupportSummaryCount}`,
    `- Teacher-visible next actions: ${report.totals.teacherVisibleNextActionCount}`,
    `- Support reasons: ${report.totals.supportReasonCount}`,
    `- Stable traces: ${report.totals.stableTraceCount}`,
    `- Complete intervention links: ${report.totals.interventionLinksCompleteCount}`,
    `- Support plans with deterministic status: ${report.totals.supportPlansWithDeterministicStatusCount}`,
    `- Remedial assignments with deterministic status: ${report.totals.remedialAssignmentsWithDeterministicStatusCount}`,
    `- Teacher next actions with safe label: ${report.totals.teacherNextActionsWithSafeLabelCount}`,
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
    '## Teacher Intervention Review Rows',
    '',
    '| Review | Child | Teacher | Course | Source rollup | Support reason | Remedial/support | Parent summary | Teacher action | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.interventionReviewRows.map(
      (row) =>
        `| ${[
          `${row.interventionReviewId} ${row.reviewStatus}`,
          `${row.studentName} (${row.childProfileId})`,
          row.teacherName,
          row.courseCode,
          `${row.progressRollupId} ${row.rollupStatus}`,
          row.supportReason,
          `${row.remedialAssignmentId} / ${row.supportPlanId}`,
          row.parentVisibleSupportSummaryId,
          row.teacherVisibleNextActionId,
          row.stableTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Remedial Assignment Rows',
    '',
    '| Remedial assignment | Child | Teacher | Daily plan | Lesson | Status | Due | Next action |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.remedialAssignmentRows.map(
      (row) =>
        `| ${[
          row.remedialAssignmentId,
          `${row.studentName} (${row.childProfileId})`,
          row.teacherName,
          row.remedialDailyPlanTitle,
          row.remedialLessonCode,
          row.status,
          row.dueAt,
          row.safeNextActionLabel,
        ].join(' | ')} |`,
    ),
    '',
    '## Support Plan Rows',
    '',
    '| Support plan | Child | Teacher | Status | Parent visible | Teacher visible | Next action |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.supportPlanRows.map(
      (row) =>
        `| ${[
          row.supportPlanId,
          `${row.studentName} (${row.childProfileId})`,
          row.teacherName,
          row.status,
          row.parentVisible ? 'yes' : 'no',
          row.teacherVisible ? 'yes' : 'no',
          row.safeNextActionLabel,
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Support Summary Rows',
    '',
    '| Parent summary | Parent | Child | Course | Reason | Next action |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.parentSummaryRows.map(
      (row) =>
        `| ${[
          row.parentVisibleSupportSummaryId,
          `${row.parentGuardianName} (${row.parentGuardianEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          row.courseCode,
          row.supportReason,
          row.safeNextActionLabel,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Next Action Rows',
    '',
    '| Teacher action | Teacher | Child | Class | Status | Next action |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.teacherNextActionRows.map(
      (row) =>
        `| ${[
          row.teacherVisibleNextActionId,
          row.teacherName,
          `${row.studentName} (${row.childProfileId})`,
          row.classCode,
          row.status,
          row.safeNextActionLabel,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}

export function findRemedialDailyPlanForSupportPlan(
  dailyPlans: DemoLearningDailyPlan[],
  sourceDailyPlan: DemoLearningDailyPlan,
) {
  const nextBlockedOrSkippedPlan = dailyPlans
    .filter(
      (plan) =>
        plan.learningPathId === sourceDailyPlan.learningPathId &&
        plan.sequence > sourceDailyPlan.sequence &&
        (plan.status === 'BLOCKED' || plan.status === 'SKIPPED'),
    )
    .sort((left, right) => left.sequence - right.sequence)[0];

  return nextBlockedOrSkippedPlan ?? sourceDailyPlan;
}

export function buildTeacherInterventionSupportReason(
  row: DemoLearningSessionCompletionPracticeProgressRollupRow,
) {
  if (row.progressStatus === 'NEEDS_SUPPORT') {
    return `${row.studentName} is at ${row.completionPercent}% course completion and needs teacher support before the next parent-visible update.`;
  }

  if (row.practiceScorePercent < 75) {
    return `${row.studentName} has a ${row.practiceScorePercent}% practice score and needs a remedial retry.`;
  }

  return `${row.studentName} needs teacher review because the progress rollup status is ${row.rollupStatus}.`;
}

export function buildTeacherInterventionSafeNextAction(
  row: DemoLearningSessionCompletionPracticeProgressRollupRow,
) {
  if (row.progressStatus === 'NEEDS_SUPPORT') {
    return 'Schedule teacher-led remedial practice and share a parent-visible support summary';
  }

  if (row.practiceScorePercent < 75) {
    return 'Assign a fixture remedial retry before the next progress summary';
  }

  return 'Review the support plan before the next parent-visible progress update';
}
