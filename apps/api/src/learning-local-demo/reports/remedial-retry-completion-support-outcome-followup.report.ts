import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningParentVisibleFollowupSummaryRow,
  DemoLearningRemedialRetryCompletionRow,
  DemoLearningRemedialRetryCompletionStatus,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety,
  DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts,
  DemoLearningSupportOutcomeEvidenceRow,
  DemoLearningSupportOutcomeEvidenceStatus,
  DemoLearningTeacherVisibleFollowupSummaryRow,
} from '../learning-local-demo.types';
import {
  countByStatus,
  requireDailyPlan,
  requirePracticeAttempt,
} from './shared';
import { buildTeacherInterventionRemedialAssignmentSupportPlanReport } from './teacher-intervention-remedial-assignment-support-plan.report';

export const remedialRetryCompletionStatuses: readonly DemoLearningRemedialRetryCompletionStatus[] =
  ['COMPLETED'];

export const supportOutcomeEvidenceStatuses: readonly DemoLearningSupportOutcomeEvidenceStatus[] =
  ['IMPROVED'];

export function buildRemedialRetryCompletionSupportOutcomeFollowupReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport {
  const supportPlanReport =
    buildTeacherInterventionRemedialAssignmentSupportPlanReport(
      fixture,
      generatedAt,
    );
  const supportPlansById = new Map(
    supportPlanReport.supportPlanRows.map((row) => [row.supportPlanId, row]),
  );
  const remedialAssignmentsById = new Map(
    supportPlanReport.remedialAssignmentRows.map((row) => [
      row.remedialAssignmentId,
      row,
    ]),
  );
  const reviewsById = new Map(
    supportPlanReport.interventionReviewRows.map((row) => [
      row.interventionReviewId,
      row,
    ]),
  );
  const parentSupportSummariesById = new Map(
    supportPlanReport.parentSummaryRows.map((row) => [
      row.parentVisibleSupportSummaryId,
      row,
    ]),
  );
  const teacherNextActionsById = new Map(
    supportPlanReport.teacherNextActionRows.map((row) => [
      row.teacherVisibleNextActionId,
      row,
    ]),
  );
  const dailyPlansById = new Map(
    fixture.dailyPlans.map((dailyPlan) => [dailyPlan.id, dailyPlan]),
  );
  const practiceAttemptsById = new Map(
    fixture.practiceAttempts.map((attempt) => [attempt.id, attempt]),
  );

  const retryCompletionRows: DemoLearningRemedialRetryCompletionRow[] =
    fixture.remedialRetryCompletions.map((retry) => {
      const supportPlan = supportPlansById.get(retry.supportPlanId);
      if (!supportPlan) {
        throw new Error(
          `Missing local demo support plan for remedial retry ${retry.id}`,
        );
      }
      const remedialAssignment = remedialAssignmentsById.get(
        retry.remedialAssignmentId,
      );
      if (!remedialAssignment) {
        throw new Error(
          `Missing local demo remedial assignment for remedial retry ${retry.id}`,
        );
      }
      const review = reviewsById.get(supportPlan.interventionReviewId);
      if (!review) {
        throw new Error(
          `Missing local demo teacher review for remedial retry ${retry.id}`,
        );
      }
      const parentSupportSummary = parentSupportSummariesById.get(
        supportPlan.parentVisibleSupportSummaryId,
      );
      if (!parentSupportSummary) {
        throw new Error(
          `Missing local demo parent support summary for remedial retry ${retry.id}`,
        );
      }
      const teacherNextAction = teacherNextActionsById.get(
        supportPlan.teacherVisibleNextActionId,
      );
      if (!teacherNextAction) {
        throw new Error(
          `Missing local demo teacher next action for remedial retry ${retry.id}`,
        );
      }
      const remedialDailyPlan = requireDailyPlan(
        dailyPlansById,
        retry.remedialDailyPlanId,
      );
      const remedialPracticeAttempt = requirePracticeAttempt(
        practiceAttemptsById,
        retry.remedialPracticeAttemptId,
      );

      if (
        retry.studentId !== review.studentId ||
        supportPlan.remedialAssignmentId !==
          remedialAssignment.remedialAssignmentId ||
        remedialAssignment.supportPlanId !== supportPlan.supportPlanId ||
        remedialAssignment.remedialDailyPlanId !== remedialDailyPlan.id ||
        remedialAssignment.sourcePracticeAttemptId !==
          remedialPracticeAttempt.id ||
        remedialDailyPlan.studentId !== review.studentId ||
        remedialDailyPlan.courseId !== review.courseId ||
        remedialPracticeAttempt.studentId !== review.studentId ||
        remedialPracticeAttempt.dailyPlanId !== remedialDailyPlan.id
      ) {
        throw new Error(
          `Mismatched local demo remedial retry fixture for ${retry.id}`,
        );
      }

      const stableTraceIds = [
        review.studentId,
        review.courseId,
        review.progressRollupId,
        review.interventionReviewId,
        supportPlan.supportPlanId,
        remedialAssignment.remedialAssignmentId,
        remedialDailyPlan.id,
        remedialPracticeAttempt.id,
        retry.id,
        retry.supportOutcomeId,
        retry.parentFollowupSummaryId,
        retry.teacherFollowupSummaryId,
      ];

      return {
        retryCompletionId: retry.id,
        stableTraceKey: stableTraceIds.join('->'),
        stableTraceIds,
        studentId: review.studentId,
        childProfileId: review.childProfileId,
        studentName: review.studentName,
        parentGuardianId: parentSupportSummary.parentGuardianId,
        teacherId: review.teacherId,
        teacherName: review.teacherName,
        teacherEmail: review.teacherEmail,
        courseId: review.courseId,
        courseCode: review.courseCode,
        courseTitle: review.courseTitle,
        classId: review.classId,
        classCode: review.classCode,
        learningPathId: review.learningPathId,
        progressRollupId: review.progressRollupId,
        interventionReviewId: review.interventionReviewId,
        supportPlanId: supportPlan.supportPlanId,
        remedialAssignmentId: remedialAssignment.remedialAssignmentId,
        remedialDailyPlanId: remedialDailyPlan.id,
        remedialDailyPlanTitle: remedialDailyPlan.title,
        remedialPracticeAttemptId: remedialPracticeAttempt.id,
        remedialLessonCode: remedialAssignment.remedialLessonCode,
        retryStatus: retry.retryStatus,
        completedAt: retry.completedAt,
        completionPercent: retry.completionPercent,
        scorePercent: retry.scorePercent,
        supportOutcomeId: retry.supportOutcomeId,
        supportOutcomeStatus: retry.supportOutcomeStatus,
        supportOutcomeAt: retry.outcomeAt,
        parentFollowupSummaryId: retry.parentFollowupSummaryId,
        teacherFollowupSummaryId: retry.teacherFollowupSummaryId,
        parentVisible: retry.parentVisible,
        teacherVisible: retry.teacherVisible,
        safeNextActionLabel: retry.safeNextActionLabel,
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary: retry.evidenceSummary,
        outcomeSummary: retry.outcomeSummary,
        parentFollowupSummary: retry.parentFollowupSummary,
        teacherFollowupSummary: retry.teacherFollowupSummary,
      } satisfies DemoLearningRemedialRetryCompletionRow;
    });

  const supportOutcomeRows: DemoLearningSupportOutcomeEvidenceRow[] =
    retryCompletionRows.map((row) => ({
      supportOutcomeId: row.supportOutcomeId,
      retryCompletionId: row.retryCompletionId,
      supportPlanId: row.supportPlanId,
      remedialAssignmentId: row.remedialAssignmentId,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      teacherId: row.teacherId,
      teacherName: row.teacherName,
      courseCode: row.courseCode,
      status: row.supportOutcomeStatus,
      scorePercent: row.scorePercent,
      completionPercent: row.completionPercent,
      outcomeAt: row.supportOutcomeAt,
      parentFollowupSummaryId: row.parentFollowupSummaryId,
      teacherFollowupSummaryId: row.teacherFollowupSummaryId,
      safeNextActionLabel: row.safeNextActionLabel,
      parentVisible: row.parentVisible,
      teacherVisible: row.teacherVisible,
      outcomeSummary: row.outcomeSummary,
    }));

  const parentFollowupSummaryRows: DemoLearningParentVisibleFollowupSummaryRow[] =
    retryCompletionRows
      .filter((row) => row.parentVisible)
      .map((row) => {
        const parentSupportSummary = parentSupportSummariesById.get(
          supportPlansById.get(row.supportPlanId)
            ?.parentVisibleSupportSummaryId ?? '',
        );
        if (!parentSupportSummary) {
          throw new Error(
            `Missing parent support summary for retry completion ${row.retryCompletionId}`,
          );
        }

        return {
          parentFollowupSummaryId: row.parentFollowupSummaryId,
          supportOutcomeId: row.supportOutcomeId,
          retryCompletionId: row.retryCompletionId,
          supportPlanId: row.supportPlanId,
          remedialAssignmentId: row.remedialAssignmentId,
          parentGuardianId: parentSupportSummary.parentGuardianId,
          parentGuardianName: parentSupportSummary.parentGuardianName,
          parentGuardianEmail: parentSupportSummary.parentGuardianEmail,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          retryStatus: row.retryStatus,
          supportOutcomeStatus: row.supportOutcomeStatus,
          scorePercent: row.scorePercent,
          completionPercent: row.completionPercent,
          safeNextActionLabel: row.safeNextActionLabel,
          parentVisible: true,
          summary: row.parentFollowupSummary,
        } satisfies DemoLearningParentVisibleFollowupSummaryRow;
      });

  const teacherFollowupSummaryRows: DemoLearningTeacherVisibleFollowupSummaryRow[] =
    retryCompletionRows
      .filter((row) => row.teacherVisible)
      .map((row) => ({
        teacherFollowupSummaryId: row.teacherFollowupSummaryId,
        supportOutcomeId: row.supportOutcomeId,
        retryCompletionId: row.retryCompletionId,
        supportPlanId: row.supportPlanId,
        remedialAssignmentId: row.remedialAssignmentId,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        teacherEmail: row.teacherEmail,
        classId: row.classId,
        classCode: row.classCode,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseCode: row.courseCode,
        retryStatus: row.retryStatus,
        supportOutcomeStatus: row.supportOutcomeStatus,
        scorePercent: row.scorePercent,
        completionPercent: row.completionPercent,
        safeNextActionLabel: row.safeNextActionLabel,
        teacherVisible: true,
        summary: row.teacherFollowupSummary,
      }));

  const statusCounts: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts =
    {
      retryStatus: countByStatus(
        remedialRetryCompletionStatuses,
        retryCompletionRows,
        (row) => row.retryStatus,
      ),
      supportOutcomeStatus: countByStatus(
        supportOutcomeEvidenceStatuses,
        supportOutcomeRows,
        (row) => row.status,
      ),
    };
  const rowsWithStableTrace = retryCompletionRows.filter((row) =>
    [
      row.studentId,
      row.courseId,
      row.progressRollupId,
      row.interventionReviewId,
      row.supportPlanId,
      row.remedialAssignmentId,
      row.remedialDailyPlanId,
      row.remedialPracticeAttemptId,
      row.retryCompletionId,
      row.supportOutcomeId,
      row.parentFollowupSummaryId,
      row.teacherFollowupSummaryId,
    ].every((id) => row.stableTraceKey.includes(id)),
  );
  const linkedRetryRows = retryCompletionRows.filter(
    (row) =>
      Boolean(row.studentId) &&
      Boolean(row.teacherId) &&
      Boolean(row.courseId) &&
      supportPlanReport.supportPlanRows.some(
        (plan) => plan.supportPlanId === row.supportPlanId,
      ) &&
      supportPlanReport.remedialAssignmentRows.some(
        (assignment) =>
          assignment.remedialAssignmentId === row.remedialAssignmentId,
      ) &&
      supportOutcomeRows.some(
        (outcome) => outcome.supportOutcomeId === row.supportOutcomeId,
      ) &&
      parentFollowupSummaryRows.some(
        (summary) =>
          summary.parentFollowupSummaryId === row.parentFollowupSummaryId,
      ) &&
      teacherFollowupSummaryRows.some(
        (summary) =>
          summary.teacherFollowupSummaryId === row.teacherFollowupSummaryId,
      ),
  );
  const remainingLocalDemoNotes = [
    'Remedial retry completions are deterministic fixture rows linked to the existing teacher support plan.',
    'Support outcome, parent follow-up summary, and teacher follow-up summary rows are read-only evidence only.',
    'Production retry persistence, teacher workflow mutation, parent delivery, provider calls, AI execution, and real learner mutations remain out of scope.',
  ];
  const safety = {
    ...supportPlanReport.safety,
    realRemedialRetryCompletionMutationUsed: false,
    realSupportOutcomeEvidenceMutationUsed: false,
    realParentFollowupSummaryMutationUsed: false,
    realTeacherFollowupSummaryMutationUsed: false,
  } satisfies DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety;
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
  const evidenceRows: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow[] =
    [
      {
        evidenceKind: 'SUPPORT_PLAN_REFERENCE',
        evidenceCount: supportPlanReport.supportPlanRows.length,
        stableFixtureIds: supportPlanReport.supportPlanRows.map(
          (row) => row.supportPlanId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Support plan references come from the prior teacher intervention fixture report.',
      },
      {
        evidenceKind: 'REMEDIAL_ASSIGNMENT_REFERENCE',
        evidenceCount: supportPlanReport.remedialAssignmentRows.length,
        stableFixtureIds: supportPlanReport.remedialAssignmentRows.map(
          (row) => row.remedialAssignmentId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Remedial assignment references are reused without writing learner assignments.',
      },
      {
        evidenceKind: 'REMEDIAL_RETRY_COMPLETION',
        evidenceCount: retryCompletionRows.length,
        stableFixtureIds: retryCompletionRows.map(
          (row) => row.retryCompletionId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Remedial retry completions include deterministic status, completion percent, and score evidence.',
      },
      {
        evidenceKind: 'SUPPORT_OUTCOME_EVIDENCE',
        evidenceCount: supportOutcomeRows.length,
        stableFixtureIds: supportOutcomeRows.map((row) => row.supportOutcomeId),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Support outcome evidence records a deterministic outcome status and safe next-action label.',
      },
      {
        evidenceKind: 'PARENT_VISIBLE_FOLLOWUP_SUMMARY',
        evidenceCount: parentFollowupSummaryRows.length,
        stableFixtureIds: parentFollowupSummaryRows.map(
          (row) => row.parentFollowupSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent-visible follow-up summaries are report evidence and do not send notifications.',
      },
      {
        evidenceKind: 'TEACHER_VISIBLE_FOLLOWUP_SUMMARY',
        evidenceCount: teacherFollowupSummaryRows.length,
        stableFixtureIds: teacherFollowupSummaryRows.map(
          (row) => row.teacherFollowupSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher-visible follow-up summaries are local-demo rows and do not mutate teacher workflow state.',
      },
      {
        evidenceKind: 'STABLE_TRACE',
        evidenceCount: rowsWithStableTrace.length,
        stableFixtureIds: rowsWithStableTrace.map((row) => row.stableTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Stable traces connect student -> course -> support plan/remedial assignment -> retry completion -> outcome -> follow-up summaries.',
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
          'All production, provider, payment, notification, AI, retry completion, support outcome, learning mutation, and ERP gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Remedial Retry Completion -> Support Outcome Follow-up Summary Report',
    generatedFor:
      'local-demo-remedial-retry-completion-support-outcome-followup-summary-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#remedial-retry-completion-support-outcome-followup-summary',
    jsonExportPath:
      'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.json',
    markdownExportPath:
      'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Teacher support plan evidence now traces remedial retry completion to support outcome evidence and parent/teacher follow-up summaries.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: new Set(retryCompletionRows.map((row) => row.studentId))
        .size,
      teacherCount: new Set(retryCompletionRows.map((row) => row.teacherId))
        .size,
      courseCount: new Set(retryCompletionRows.map((row) => row.courseId)).size,
      supportPlanReferenceCount: new Set(
        retryCompletionRows.map((row) => row.supportPlanId),
      ).size,
      remedialAssignmentReferenceCount: new Set(
        retryCompletionRows.map((row) => row.remedialAssignmentId),
      ).size,
      remedialRetryCompletionCount: retryCompletionRows.length,
      supportOutcomeEvidenceCount: supportOutcomeRows.length,
      parentVisibleFollowupSummaryCount: parentFollowupSummaryRows.length,
      teacherVisibleFollowupSummaryCount: teacherFollowupSummaryRows.length,
      safeNextActionCount: retryCompletionRows.filter((row) =>
        Boolean(row.safeNextActionLabel),
      ).length,
      stableTraceCount: rowsWithStableTrace.length,
      retryLinksCompleteCount: linkedRetryRows.length,
      outcomesWithDeterministicStatusCount: supportOutcomeRows.filter(
        (row) => Boolean(row.status) && Boolean(row.safeNextActionLabel),
      ).length,
      retriesWithDeterministicStatusScoreCount: retryCompletionRows.filter(
        (row) =>
          Boolean(row.retryStatus) &&
          row.completionPercent >= 0 &&
          row.scorePercent >= 0,
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: remainingLocalDemoNotes.length,
      productionReadyClaimCount: 0,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    statusCounts,
    retryCompletionRows,
    supportOutcomeRows,
    parentFollowupSummaryRows,
    teacherFollowupSummaryRows,
    evidenceRows,
  };
}

export function toRemedialRetryCompletionSupportOutcomeFollowupMarkdown(
  report: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    `Endpoint: ${report.endpointPath}`,
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
    '- realParentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
    '- realSubscriptionMutationUsed=false',
    '- realClassMutationUsed=false',
    '- realSessionMutationUsed=false',
    '- realAttendanceMutationUsed=false',
    '- realProgressMutationUsed=false',
    '- realLessonMutationUsed=false',
    '- realAssignmentMutationUsed=false',
    '- realAssessmentMutationUsed=false',
    '- realLearningPathMutationUsed=false',
    '- realDailyPlanMutationUsed=false',
    '- realVideoEvidenceMutationUsed=false',
    '- realPracticeMutationUsed=false',
    '- realParentGuardianMutationUsed=false',
    '- realScreenTimePolicyMutationUsed=false',
    '- realLearningSessionGateMutationUsed=false',
    '- realScreenTimeGrantMutationUsed=false',
    '- realDailyPlanAccessMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realLearningSessionCompletionMutationUsed=false',
    '- realParentProgressSummaryMutationUsed=false',
    '- realTeacherProgressSummaryMutationUsed=false',
    '- realParentMessageMutationUsed=false',
    '- realTeacherInterventionMutationUsed=false',
    '- realTeacherInterventionReviewMutationUsed=false',
    '- realRemedialAssignmentMutationUsed=false',
    '- realSupportPlanMutationUsed=false',
    '- realParentSupportSummaryMutationUsed=false',
    '- realTeacherNextActionMutationUsed=false',
    '- realRemedialRetryCompletionMutationUsed=false',
    '- realSupportOutcomeEvidenceMutationUsed=false',
    '- realParentFollowupSummaryMutationUsed=false',
    '- realTeacherFollowupSummaryMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- Students: ${report.totals.studentCount}`,
    `- Teachers: ${report.totals.teacherCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Support plan references: ${report.totals.supportPlanReferenceCount}`,
    `- Remedial assignment references: ${report.totals.remedialAssignmentReferenceCount}`,
    `- Remedial retry completions: ${report.totals.remedialRetryCompletionCount}`,
    `- Support outcome evidence rows: ${report.totals.supportOutcomeEvidenceCount}`,
    `- Parent-visible follow-up summaries: ${report.totals.parentVisibleFollowupSummaryCount}`,
    `- Teacher-visible follow-up summaries: ${report.totals.teacherVisibleFollowupSummaryCount}`,
    `- Safe next actions: ${report.totals.safeNextActionCount}`,
    `- Stable traces: ${report.totals.stableTraceCount}`,
    `- Complete retry links: ${report.totals.retryLinksCompleteCount}`,
    `- Outcomes with deterministic status: ${report.totals.outcomesWithDeterministicStatusCount}`,
    `- Retries with deterministic status/score: ${report.totals.retriesWithDeterministicStatusScoreCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Retry Completion Rows',
    '',
    '| Retry completion | Student | Teacher | Support plan | Remedial assignment | Status | Score | Outcome | Parent summary | Teacher summary | Next action | Trace |',
    '| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |',
    ...report.retryCompletionRows.map(
      (row) =>
        `| ${[
          row.retryCompletionId,
          `${row.studentName} (${row.childProfileId})`,
          row.teacherName,
          row.supportPlanId,
          row.remedialAssignmentId,
          row.retryStatus,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          `${row.supportOutcomeId} / ${row.supportOutcomeStatus}`,
          row.parentFollowupSummaryId,
          row.teacherFollowupSummaryId,
          row.safeNextActionLabel,
          row.stableTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Support Outcome Rows',
    '',
    '| Outcome | Retry completion | Student | Status | Score | Visibility | Next action | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- | --- |',
    ...report.supportOutcomeRows.map(
      (row) =>
        `| ${[
          row.supportOutcomeId,
          row.retryCompletionId,
          `${row.studentName} (${row.childProfileId})`,
          row.status,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          `${row.parentVisible ? 'parent-visible' : 'parent-held'} / ${
            row.teacherVisible ? 'teacher-visible' : 'teacher-held'
          }`,
          row.safeNextActionLabel,
          row.outcomeSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Follow-up Summary Rows',
    '',
    '| Parent summary | Parent | Student | Status | Score | Next action | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...report.parentFollowupSummaryRows.map(
      (row) =>
        `| ${[
          row.parentFollowupSummaryId,
          `${row.parentGuardianName} (${row.parentGuardianEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.retryStatus} / ${row.supportOutcomeStatus}`,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          row.safeNextActionLabel,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Follow-up Summary Rows',
    '',
    '| Teacher summary | Teacher | Student | Status | Score | Next action | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...report.teacherFollowupSummaryRows.map(
      (row) =>
        `| ${[
          row.teacherFollowupSummaryId,
          `${row.teacherName} (${row.teacherEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.retryStatus} / ${row.supportOutcomeStatus}`,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          row.safeNextActionLabel,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
