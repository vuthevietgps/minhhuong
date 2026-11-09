import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningParentVisibleEscalationSummaryRow,
  DemoLearningRemedialRetryUnresolvedAttemptRow,
  DemoLearningRemedialRetryUnresolvedAttemptStatus,
  DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow,
  DemoLearningRemedialRetryUnresolvedSupportEscalationReport,
  DemoLearningRemedialRetryUnresolvedSupportEscalationSafety,
  DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts,
  DemoLearningSupportAdjustmentStatus,
  DemoLearningTeacherEscalationStatus,
  DemoLearningTeacherEscalationSupportAdjustmentRow,
  DemoLearningTeacherVisibleEscalationNextActionRow,
  DemoLearningUnresolvedSupportOutcomeEvidenceRow,
  DemoLearningUnresolvedSupportOutcomeReasonCode,
  DemoLearningUnresolvedSupportOutcomeStatus,
} from '../learning-local-demo.types';
import {
  countByStatus,
  requireDailyPlan,
  requirePracticeAttempt,
} from './shared';
import { buildTeacherInterventionRemedialAssignmentSupportPlanReport } from './teacher-intervention-remedial-assignment-support-plan.report';

export const remedialRetryUnresolvedAttemptStatuses: readonly DemoLearningRemedialRetryUnresolvedAttemptStatus[] =
  ['FAILED', 'INCOMPLETE'];

export const unresolvedSupportOutcomeStatuses: readonly DemoLearningUnresolvedSupportOutcomeStatus[] =
  ['UNRESOLVED'];

export const unresolvedSupportOutcomeReasonCodes: readonly DemoLearningUnresolvedSupportOutcomeReasonCode[] =
  ['RETRY_SCORE_BELOW_THRESHOLD', 'RETRY_INCOMPLETE'];

export const teacherEscalationStatuses: readonly DemoLearningTeacherEscalationStatus[] =
  ['SCHEDULED'];

export const supportAdjustmentStatuses: readonly DemoLearningSupportAdjustmentStatus[] =
  ['ADJUSTED'];

export function buildRemedialRetryUnresolvedSupportEscalationReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningRemedialRetryUnresolvedSupportEscalationReport {
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

  const retryAttemptRows: DemoLearningRemedialRetryUnresolvedAttemptRow[] =
    fixture.remedialRetryUnresolvedEscalations.map((retry) => {
      const supportPlan = supportPlansById.get(retry.supportPlanId);
      if (!supportPlan) {
        throw new Error(
          `Missing local demo support plan for unresolved remedial retry ${retry.id}`,
        );
      }
      const remedialAssignment = remedialAssignmentsById.get(
        retry.remedialAssignmentId,
      );
      if (!remedialAssignment) {
        throw new Error(
          `Missing local demo remedial assignment for unresolved remedial retry ${retry.id}`,
        );
      }
      const review = reviewsById.get(supportPlan.interventionReviewId);
      if (!review) {
        throw new Error(
          `Missing local demo teacher review for unresolved remedial retry ${retry.id}`,
        );
      }
      const parentSupportSummary = parentSupportSummariesById.get(
        supportPlan.parentVisibleSupportSummaryId,
      );
      if (!parentSupportSummary) {
        throw new Error(
          `Missing local demo parent support summary for unresolved remedial retry ${retry.id}`,
        );
      }
      const teacherNextAction = teacherNextActionsById.get(
        supportPlan.teacherVisibleNextActionId,
      );
      if (!teacherNextAction) {
        throw new Error(
          `Missing local demo teacher next action for unresolved remedial retry ${retry.id}`,
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
          `Mismatched local demo unresolved remedial retry fixture for ${retry.id}`,
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
        retry.unresolvedOutcomeId,
        retry.teacherEscalationId,
        retry.supportAdjustmentId,
        retry.parentEscalationSummaryId,
        retry.teacherEscalationNextActionId,
      ];

      return {
        retryAttemptId: retry.id,
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
        attemptedAt: retry.attemptedAt,
        completionPercent: retry.completionPercent,
        scorePercent: retry.scorePercent,
        unresolvedOutcomeId: retry.unresolvedOutcomeId,
        unresolvedOutcomeStatus: retry.unresolvedOutcomeStatus,
        reasonCode: retry.reasonCode,
        outcomeAt: retry.outcomeAt,
        teacherEscalationId: retry.teacherEscalationId,
        teacherEscalationStatus: retry.teacherEscalationStatus,
        supportAdjustmentId: retry.supportAdjustmentId,
        supportAdjustmentStatus: retry.supportAdjustmentStatus,
        parentEscalationSummaryId: retry.parentEscalationSummaryId,
        teacherEscalationNextActionId: retry.teacherEscalationNextActionId,
        parentVisible: retry.parentVisible,
        teacherVisible: retry.teacherVisible,
        safeNextActionLabel: retry.safeNextActionLabel,
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary: retry.evidenceSummary,
        unresolvedOutcomeSummary: retry.unresolvedOutcomeSummary,
        teacherEscalationSummary: retry.teacherEscalationSummary,
        supportAdjustmentSummary: retry.supportAdjustmentSummary,
        parentEscalationSummary: retry.parentEscalationSummary,
        teacherNextActionSummary: retry.teacherNextActionSummary,
      } satisfies DemoLearningRemedialRetryUnresolvedAttemptRow;
    });

  const unresolvedOutcomeRows: DemoLearningUnresolvedSupportOutcomeEvidenceRow[] =
    retryAttemptRows.map((row) => ({
      unresolvedOutcomeId: row.unresolvedOutcomeId,
      retryAttemptId: row.retryAttemptId,
      supportPlanId: row.supportPlanId,
      remedialAssignmentId: row.remedialAssignmentId,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      teacherId: row.teacherId,
      teacherName: row.teacherName,
      courseCode: row.courseCode,
      status: row.unresolvedOutcomeStatus,
      reasonCode: row.reasonCode,
      scorePercent: row.scorePercent,
      completionPercent: row.completionPercent,
      outcomeAt: row.outcomeAt,
      teacherEscalationId: row.teacherEscalationId,
      parentEscalationSummaryId: row.parentEscalationSummaryId,
      teacherEscalationNextActionId: row.teacherEscalationNextActionId,
      safeNextActionLabel: row.safeNextActionLabel,
      parentVisible: row.parentVisible,
      teacherVisible: row.teacherVisible,
      outcomeSummary: row.unresolvedOutcomeSummary,
    }));

  const teacherEscalationRows: DemoLearningTeacherEscalationSupportAdjustmentRow[] =
    retryAttemptRows
      .filter((row) => row.teacherVisible)
      .map((row) => ({
        teacherEscalationId: row.teacherEscalationId,
        supportAdjustmentId: row.supportAdjustmentId,
        unresolvedOutcomeId: row.unresolvedOutcomeId,
        retryAttemptId: row.retryAttemptId,
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
        unresolvedOutcomeStatus: row.unresolvedOutcomeStatus,
        reasonCode: row.reasonCode,
        escalationStatus: row.teacherEscalationStatus,
        supportAdjustmentStatus: row.supportAdjustmentStatus,
        safeNextActionLabel: row.safeNextActionLabel,
        teacherVisible: true,
        escalationSummary: row.teacherEscalationSummary,
        supportAdjustmentSummary: row.supportAdjustmentSummary,
      }));

  const parentEscalationSummaryRows: DemoLearningParentVisibleEscalationSummaryRow[] =
    retryAttemptRows
      .filter((row) => row.parentVisible)
      .map((row) => {
        const parentSupportSummary = parentSupportSummariesById.get(
          supportPlansById.get(row.supportPlanId)
            ?.parentVisibleSupportSummaryId ?? '',
        );
        if (!parentSupportSummary) {
          throw new Error(
            `Missing parent support summary for unresolved retry ${row.retryAttemptId}`,
          );
        }

        return {
          parentEscalationSummaryId: row.parentEscalationSummaryId,
          unresolvedOutcomeId: row.unresolvedOutcomeId,
          retryAttemptId: row.retryAttemptId,
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
          unresolvedOutcomeStatus: row.unresolvedOutcomeStatus,
          reasonCode: row.reasonCode,
          scorePercent: row.scorePercent,
          completionPercent: row.completionPercent,
          safeNextActionLabel: row.safeNextActionLabel,
          parentVisible: true,
          summary: row.parentEscalationSummary,
        } satisfies DemoLearningParentVisibleEscalationSummaryRow;
      });

  const teacherEscalationNextActionRows: DemoLearningTeacherVisibleEscalationNextActionRow[] =
    retryAttemptRows
      .filter((row) => row.teacherVisible)
      .map((row) => ({
        teacherEscalationNextActionId: row.teacherEscalationNextActionId,
        teacherEscalationId: row.teacherEscalationId,
        supportAdjustmentId: row.supportAdjustmentId,
        unresolvedOutcomeId: row.unresolvedOutcomeId,
        retryAttemptId: row.retryAttemptId,
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
        unresolvedOutcomeStatus: row.unresolvedOutcomeStatus,
        reasonCode: row.reasonCode,
        safeNextActionLabel: row.safeNextActionLabel,
        teacherVisible: true,
        summary: row.teacherNextActionSummary,
      }));

  const statusCounts: DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts =
    {
      retryStatus: countByStatus(
        remedialRetryUnresolvedAttemptStatuses,
        retryAttemptRows,
        (row) => row.retryStatus,
      ),
      unresolvedOutcomeStatus: countByStatus(
        unresolvedSupportOutcomeStatuses,
        unresolvedOutcomeRows,
        (row) => row.status,
      ),
      reasonCode: countByStatus(
        unresolvedSupportOutcomeReasonCodes,
        unresolvedOutcomeRows,
        (row) => row.reasonCode,
      ),
      teacherEscalationStatus: countByStatus(
        teacherEscalationStatuses,
        teacherEscalationRows,
        (row) => row.escalationStatus,
      ),
      supportAdjustmentStatus: countByStatus(
        supportAdjustmentStatuses,
        teacherEscalationRows,
        (row) => row.supportAdjustmentStatus,
      ),
    };
  const rowsWithStableTrace = retryAttemptRows.filter((row) =>
    [
      row.studentId,
      row.courseId,
      row.progressRollupId,
      row.interventionReviewId,
      row.supportPlanId,
      row.remedialAssignmentId,
      row.remedialDailyPlanId,
      row.remedialPracticeAttemptId,
      row.retryAttemptId,
      row.unresolvedOutcomeId,
      row.teacherEscalationId,
      row.supportAdjustmentId,
      row.parentEscalationSummaryId,
      row.teacherEscalationNextActionId,
    ].every((id) => row.stableTraceKey.includes(id)),
  );
  const linkedRetryRows = retryAttemptRows.filter(
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
      unresolvedOutcomeRows.some(
        (outcome) => outcome.unresolvedOutcomeId === row.unresolvedOutcomeId,
      ) &&
      teacherEscalationRows.some(
        (escalation) =>
          escalation.teacherEscalationId === row.teacherEscalationId &&
          escalation.supportAdjustmentId === row.supportAdjustmentId,
      ) &&
      parentEscalationSummaryRows.some(
        (summary) =>
          summary.parentEscalationSummaryId === row.parentEscalationSummaryId,
      ) &&
      teacherEscalationNextActionRows.some(
        (action) =>
          action.teacherEscalationNextActionId ===
          row.teacherEscalationNextActionId,
      ),
  );
  const remainingLocalDemoNotes = [
    'Unresolved remedial retry attempts are deterministic fixture rows linked to the existing teacher support plan.',
    'Teacher escalation, support adjustment, parent summary, and teacher next action rows are read-only evidence only.',
    'Production retry persistence, escalation workflow mutation, parent delivery, provider calls, AI execution, schedulers, and real learner mutations remain out of scope.',
  ];
  const safety = {
    ...supportPlanReport.safety,
    realRemedialRetryUnresolvedAttemptMutationUsed: false,
    realUnresolvedSupportOutcomeMutationUsed: false,
    realTeacherEscalationMutationUsed: false,
    realSupportAdjustmentMutationUsed: false,
    realParentEscalationSummaryMutationUsed: false,
    realTeacherEscalationNextActionMutationUsed: false,
  } satisfies DemoLearningRemedialRetryUnresolvedSupportEscalationSafety;
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
  const evidenceRows: DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow[] =
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
        evidenceKind: 'FAILED_OR_INCOMPLETE_RETRY',
        evidenceCount: retryAttemptRows.length,
        stableFixtureIds: retryAttemptRows.map((row) => row.retryAttemptId),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Retry attempts include deterministic incomplete or failed status, completion percent, and score evidence.',
      },
      {
        evidenceKind: 'UNRESOLVED_SUPPORT_OUTCOME',
        evidenceCount: unresolvedOutcomeRows.length,
        stableFixtureIds: unresolvedOutcomeRows.map(
          (row) => row.unresolvedOutcomeId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Unresolved support outcome evidence records deterministic status, reason code, and safe next-action label.',
      },
      {
        evidenceKind: 'TEACHER_ESCALATION_SUPPORT_ADJUSTMENT',
        evidenceCount: teacherEscalationRows.length,
        stableFixtureIds: teacherEscalationRows.flatMap((row) => [
          row.teacherEscalationId,
          row.supportAdjustmentId,
        ]),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher escalation and support adjustment rows are local-demo evidence and do not mutate teacher workflow state.',
      },
      {
        evidenceKind: 'PARENT_VISIBLE_ESCALATION_SUMMARY',
        evidenceCount: parentEscalationSummaryRows.length,
        stableFixtureIds: parentEscalationSummaryRows.map(
          (row) => row.parentEscalationSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent-visible escalation summaries are report evidence and do not send notifications.',
      },
      {
        evidenceKind: 'TEACHER_VISIBLE_ESCALATION_NEXT_ACTION',
        evidenceCount: teacherEscalationNextActionRows.length,
        stableFixtureIds: teacherEscalationNextActionRows.map(
          (row) => row.teacherEscalationNextActionId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher-visible escalation next actions are local-demo rows and do not mutate teacher workflow state.',
      },
      {
        evidenceKind: 'STABLE_TRACE',
        evidenceCount: rowsWithStableTrace.length,
        stableFixtureIds: rowsWithStableTrace.map((row) => row.stableTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Stable traces connect student -> course -> support plan/remedial assignment -> retry attempt -> unresolved outcome -> escalation/support adjustment -> parent summary -> teacher next action.',
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
          'All production, provider, payment, notification, AI, scheduler, retry escalation, learning mutation, and ERP gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Remedial Retry Unresolved -> Support Escalation Report',
    generatedFor:
      'local-demo-remedial-retry-unresolved-support-escalation-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#remedial-retry-unresolved-support-escalation',
    jsonExportPath:
      'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.json',
    markdownExportPath:
      'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Teacher support plan evidence now traces an incomplete remedial retry to unresolved outcome, teacher escalation, parent escalation summary, and teacher next action evidence.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: new Set(retryAttemptRows.map((row) => row.studentId)).size,
      teacherCount: new Set(retryAttemptRows.map((row) => row.teacherId)).size,
      courseCount: new Set(retryAttemptRows.map((row) => row.courseId)).size,
      supportPlanReferenceCount: new Set(
        retryAttemptRows.map((row) => row.supportPlanId),
      ).size,
      remedialAssignmentReferenceCount: new Set(
        retryAttemptRows.map((row) => row.remedialAssignmentId),
      ).size,
      remedialRetryAttemptCount: retryAttemptRows.length,
      failedOrIncompleteRetryCount: retryAttemptRows.filter((row) =>
        ['FAILED', 'INCOMPLETE'].includes(row.retryStatus),
      ).length,
      unresolvedSupportOutcomeCount: unresolvedOutcomeRows.length,
      teacherEscalationCount: teacherEscalationRows.length,
      supportAdjustmentCount: teacherEscalationRows.filter((row) =>
        Boolean(row.supportAdjustmentId),
      ).length,
      parentVisibleEscalationSummaryCount: parentEscalationSummaryRows.length,
      teacherVisibleEscalationNextActionCount:
        teacherEscalationNextActionRows.length,
      safeNextActionCount: retryAttemptRows.filter((row) =>
        Boolean(row.safeNextActionLabel),
      ).length,
      stableTraceCount: rowsWithStableTrace.length,
      unresolvedRetryLinksCompleteCount: linkedRetryRows.length,
      outcomesWithDeterministicStatusReasonActionCount:
        unresolvedOutcomeRows.filter(
          (row) =>
            Boolean(row.status) &&
            Boolean(row.reasonCode) &&
            Boolean(row.safeNextActionLabel),
        ).length,
      attemptsWithDeterministicStatusScoreCount: retryAttemptRows.filter(
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
    retryAttemptRows,
    unresolvedOutcomeRows,
    teacherEscalationRows,
    parentEscalationSummaryRows,
    teacherEscalationNextActionRows,
    evidenceRows,
  };
}

export function toRemedialRetryUnresolvedSupportEscalationMarkdown(
  report: DemoLearningRemedialRetryUnresolvedSupportEscalationReport,
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
    '- realRemedialRetryUnresolvedAttemptMutationUsed=false',
    '- realUnresolvedSupportOutcomeMutationUsed=false',
    '- realTeacherEscalationMutationUsed=false',
    '- realSupportAdjustmentMutationUsed=false',
    '- realParentEscalationSummaryMutationUsed=false',
    '- realTeacherEscalationNextActionMutationUsed=false',
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
    `- Remedial retry attempts: ${report.totals.remedialRetryAttemptCount}`,
    `- Failed or incomplete retries: ${report.totals.failedOrIncompleteRetryCount}`,
    `- Unresolved support outcomes: ${report.totals.unresolvedSupportOutcomeCount}`,
    `- Teacher escalations: ${report.totals.teacherEscalationCount}`,
    `- Support adjustments: ${report.totals.supportAdjustmentCount}`,
    `- Parent-visible escalation summaries: ${report.totals.parentVisibleEscalationSummaryCount}`,
    `- Teacher-visible escalation next actions: ${report.totals.teacherVisibleEscalationNextActionCount}`,
    `- Safe next actions: ${report.totals.safeNextActionCount}`,
    `- Stable traces: ${report.totals.stableTraceCount}`,
    `- Complete unresolved retry links: ${report.totals.unresolvedRetryLinksCompleteCount}`,
    `- Outcomes with deterministic status/reason/action: ${report.totals.outcomesWithDeterministicStatusReasonActionCount}`,
    `- Attempts with deterministic status/score: ${report.totals.attemptsWithDeterministicStatusScoreCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Retry Attempt Rows',
    '',
    '| Retry attempt | Student | Teacher | Support plan | Remedial assignment | Status | Reason | Score | Outcome | Escalation | Next action | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |',
    ...report.retryAttemptRows.map(
      (row) =>
        `| ${[
          row.retryAttemptId,
          `${row.studentName} (${row.childProfileId})`,
          row.teacherName,
          row.supportPlanId,
          row.remedialAssignmentId,
          row.retryStatus,
          row.reasonCode,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          `${row.unresolvedOutcomeId} / ${row.unresolvedOutcomeStatus}`,
          `${row.teacherEscalationId} / ${row.supportAdjustmentId}`,
          row.safeNextActionLabel,
          row.stableTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Unresolved Outcome Rows',
    '',
    '| Outcome | Retry attempt | Student | Status | Reason | Score | Visibility | Next action | Summary |',
    '| --- | --- | --- | --- | --- | ---: | --- | --- | --- |',
    ...report.unresolvedOutcomeRows.map(
      (row) =>
        `| ${[
          row.unresolvedOutcomeId,
          row.retryAttemptId,
          `${row.studentName} (${row.childProfileId})`,
          row.status,
          row.reasonCode,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          `${row.parentVisible ? 'parent-visible' : 'parent-held'} / ${
            row.teacherVisible ? 'teacher-visible' : 'teacher-held'
          }`,
          row.safeNextActionLabel,
          row.outcomeSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Escalation Rows',
    '',
    '| Escalation | Support adjustment | Teacher | Student | Status | Reason | Next action | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.teacherEscalationRows.map(
      (row) =>
        `| ${[
          row.teacherEscalationId,
          row.supportAdjustmentId,
          `${row.teacherName} (${row.teacherEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.escalationStatus} / ${row.supportAdjustmentStatus}`,
          row.reasonCode,
          row.safeNextActionLabel,
          `${row.escalationSummary} ${row.supportAdjustmentSummary}`,
        ].join(' | ')} |`,
    ),
    '',
    '## Parent Escalation Summary Rows',
    '',
    '| Parent summary | Parent | Student | Status | Reason | Score | Next action | Summary |',
    '| --- | --- | --- | --- | --- | ---: | --- | --- |',
    ...report.parentEscalationSummaryRows.map(
      (row) =>
        `| ${[
          row.parentEscalationSummaryId,
          `${row.parentGuardianName} (${row.parentGuardianEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.retryStatus} / ${row.unresolvedOutcomeStatus}`,
          row.reasonCode,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          row.safeNextActionLabel,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Escalation Next Action Rows',
    '',
    '| Teacher next action | Teacher | Student | Status | Reason | Next action | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.teacherEscalationNextActionRows.map(
      (row) =>
        `| ${[
          row.teacherEscalationNextActionId,
          `${row.teacherName} (${row.teacherEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.retryStatus} / ${row.unresolvedOutcomeStatus}`,
          row.reasonCode,
          row.safeNextActionLabel,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
