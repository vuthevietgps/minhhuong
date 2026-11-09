import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningAdjustedSupportRetryCompletionRow,
  DemoLearningAdjustedSupportRetryCompletionStatus,
  DemoLearningCoreFixture,
  DemoLearningResolvedSupportOutcomeEvidenceRow,
  DemoLearningResolvedSupportOutcomeReasonCode,
  DemoLearningResolvedSupportOutcomeStatus,
  DemoLearningParentVisibleClosureSummaryRow,
  DemoLearningTeacherEscalationFollowupResolutionEvidenceRow,
  DemoLearningTeacherEscalationFollowupResolutionReport,
  DemoLearningTeacherEscalationFollowupResolutionRow,
  DemoLearningTeacherEscalationFollowupResolutionSafety,
  DemoLearningTeacherEscalationFollowupResolutionStatusCounts,
  DemoLearningTeacherReviewedEscalationRow,
  DemoLearningTeacherReviewedEscalationStatus,
  DemoLearningTeacherVisibleClosureNoteRow,
} from '../learning-local-demo.types';
import { buildRemedialRetryUnresolvedSupportEscalationReport } from './remedial-retry-unresolved-support-escalation.report';
import { countByStatus } from './shared';

export const teacherReviewedEscalationStatuses: readonly DemoLearningTeacherReviewedEscalationStatus[] =
  ['REVIEWED'];

export const adjustedSupportRetryCompletionStatuses: readonly DemoLearningAdjustedSupportRetryCompletionStatus[] =
  ['COMPLETED'];

export const resolvedSupportOutcomeStatuses: readonly DemoLearningResolvedSupportOutcomeStatus[] =
  ['RESOLVED'];

export const resolvedSupportOutcomeReasonCodes: readonly DemoLearningResolvedSupportOutcomeReasonCode[] =
  ['ADJUSTED_RETRY_COMPLETED'];

export function buildTeacherEscalationFollowupResolutionReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningTeacherEscalationFollowupResolutionReport {
  const unresolvedReport = buildRemedialRetryUnresolvedSupportEscalationReport(
    fixture,
    generatedAt,
  );
  const unresolvedRowsByAttemptId = new Map(
    unresolvedReport.retryAttemptRows.map((row) => [row.retryAttemptId, row]),
  );
  const parentEscalationSummariesById = new Map(
    unresolvedReport.parentEscalationSummaryRows.map((row) => [
      row.parentEscalationSummaryId,
      row,
    ]),
  );

  const resolutionRows: DemoLearningTeacherEscalationFollowupResolutionRow[] =
    fixture.teacherEscalationFollowupResolutions.map((resolution) => {
      const unresolvedRetry = unresolvedRowsByAttemptId.get(
        resolution.unresolvedRetryAttemptId,
      );
      if (!unresolvedRetry) {
        throw new Error(
          `Missing unresolved retry escalation for teacher follow-up resolution ${resolution.id}`,
        );
      }
      const parentEscalationSummary = parentEscalationSummariesById.get(
        unresolvedRetry.parentEscalationSummaryId,
      );
      if (!parentEscalationSummary) {
        throw new Error(
          `Missing parent escalation summary for teacher follow-up resolution ${resolution.id}`,
        );
      }

      if (
        resolution.studentId !== unresolvedRetry.studentId ||
        resolution.unresolvedOutcomeId !==
          unresolvedRetry.unresolvedOutcomeId ||
        resolution.teacherEscalationId !==
          unresolvedRetry.teacherEscalationId ||
        resolution.supportAdjustmentId !== unresolvedRetry.supportAdjustmentId
      ) {
        throw new Error(
          `Mismatched teacher follow-up resolution fixture for ${resolution.id}`,
        );
      }

      const stableTraceIds = [
        unresolvedRetry.studentId,
        unresolvedRetry.courseId,
        unresolvedRetry.progressRollupId,
        unresolvedRetry.interventionReviewId,
        unresolvedRetry.supportPlanId,
        unresolvedRetry.remedialAssignmentId,
        unresolvedRetry.remedialDailyPlanId,
        unresolvedRetry.remedialPracticeAttemptId,
        unresolvedRetry.retryAttemptId,
        unresolvedRetry.unresolvedOutcomeId,
        unresolvedRetry.teacherEscalationId,
        unresolvedRetry.supportAdjustmentId,
        resolution.teacherReviewedEscalationId,
        resolution.adjustedSupportRetryCompletionId,
        resolution.resolvedSupportOutcomeId,
        resolution.parentClosureSummaryId,
        resolution.teacherClosureNoteId,
      ];

      return {
        resolutionId: resolution.id,
        stableTraceKey: stableTraceIds.join('->'),
        stableTraceIds,
        studentId: unresolvedRetry.studentId,
        childProfileId: unresolvedRetry.childProfileId,
        studentName: unresolvedRetry.studentName,
        parentGuardianId: unresolvedRetry.parentGuardianId,
        teacherId: unresolvedRetry.teacherId,
        teacherName: unresolvedRetry.teacherName,
        teacherEmail: unresolvedRetry.teacherEmail,
        courseId: unresolvedRetry.courseId,
        courseCode: unresolvedRetry.courseCode,
        courseTitle: unresolvedRetry.courseTitle,
        classId: unresolvedRetry.classId,
        classCode: unresolvedRetry.classCode,
        learningPathId: unresolvedRetry.learningPathId,
        progressRollupId: unresolvedRetry.progressRollupId,
        interventionReviewId: unresolvedRetry.interventionReviewId,
        supportPlanId: unresolvedRetry.supportPlanId,
        remedialAssignmentId: unresolvedRetry.remedialAssignmentId,
        remedialDailyPlanId: unresolvedRetry.remedialDailyPlanId,
        remedialDailyPlanTitle: unresolvedRetry.remedialDailyPlanTitle,
        remedialPracticeAttemptId: unresolvedRetry.remedialPracticeAttemptId,
        remedialLessonCode: unresolvedRetry.remedialLessonCode,
        unresolvedRetryAttemptId: unresolvedRetry.retryAttemptId,
        unresolvedRetryStatus: unresolvedRetry.retryStatus,
        unresolvedOutcomeId: unresolvedRetry.unresolvedOutcomeId,
        unresolvedOutcomeStatus: unresolvedRetry.unresolvedOutcomeStatus,
        unresolvedReasonCode: unresolvedRetry.reasonCode,
        teacherEscalationId: unresolvedRetry.teacherEscalationId,
        supportAdjustmentId: unresolvedRetry.supportAdjustmentId,
        teacherReviewedEscalationId: resolution.teacherReviewedEscalationId,
        teacherReviewedEscalationStatus:
          resolution.teacherReviewedEscalationStatus,
        teacherReviewedAt: resolution.teacherReviewedAt,
        adjustedSupportRetryCompletionId:
          resolution.adjustedSupportRetryCompletionId,
        adjustedSupportRetryStatus: resolution.adjustedSupportRetryStatus,
        completedAt: resolution.completedAt,
        completionPercent: resolution.completionPercent,
        scorePercent: resolution.scorePercent,
        resolvedSupportOutcomeId: resolution.resolvedSupportOutcomeId,
        resolvedSupportOutcomeStatus: resolution.resolvedSupportOutcomeStatus,
        resolvedOutcomeReasonCode: resolution.resolvedOutcomeReasonCode,
        resolvedOutcomeAt: resolution.resolvedOutcomeAt,
        parentClosureSummaryId: resolution.parentClosureSummaryId,
        teacherClosureNoteId: resolution.teacherClosureNoteId,
        parentVisible: resolution.parentVisible,
        teacherVisible: resolution.teacherVisible,
        safeNextActionLabel: resolution.safeNextActionLabel,
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary: resolution.evidenceSummary,
        teacherReviewSummary: resolution.teacherReviewSummary,
        adjustedRetryCompletionSummary:
          resolution.adjustedRetryCompletionSummary,
        resolvedOutcomeSummary: resolution.resolvedOutcomeSummary,
        parentClosureSummary: resolution.parentClosureSummary,
        teacherClosureNoteSummary: resolution.teacherClosureNoteSummary,
      } satisfies DemoLearningTeacherEscalationFollowupResolutionRow;
    });

  const teacherReviewedEscalationRows: DemoLearningTeacherReviewedEscalationRow[] =
    resolutionRows
      .filter((row) => row.teacherVisible)
      .map((row) => ({
        teacherReviewedEscalationId: row.teacherReviewedEscalationId,
        teacherEscalationId: row.teacherEscalationId,
        supportAdjustmentId: row.supportAdjustmentId,
        unresolvedOutcomeId: row.unresolvedOutcomeId,
        unresolvedRetryAttemptId: row.unresolvedRetryAttemptId,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        teacherEmail: row.teacherEmail,
        courseCode: row.courseCode,
        classCode: row.classCode,
        reviewStatus: row.teacherReviewedEscalationStatus,
        reviewedAt: row.teacherReviewedAt,
        safeNextActionLabel: row.safeNextActionLabel,
        teacherVisible: true,
        summary: row.teacherReviewSummary,
      }));

  const adjustedSupportRetryCompletionRows: DemoLearningAdjustedSupportRetryCompletionRow[] =
    resolutionRows.map((row) => ({
      adjustedSupportRetryCompletionId: row.adjustedSupportRetryCompletionId,
      teacherReviewedEscalationId: row.teacherReviewedEscalationId,
      supportAdjustmentId: row.supportAdjustmentId,
      unresolvedRetryAttemptId: row.unresolvedRetryAttemptId,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      teacherName: row.teacherName,
      courseCode: row.courseCode,
      remedialAssignmentId: row.remedialAssignmentId,
      remedialDailyPlanId: row.remedialDailyPlanId,
      remedialPracticeAttemptId: row.remedialPracticeAttemptId,
      retryStatus: row.adjustedSupportRetryStatus,
      completedAt: row.completedAt,
      scorePercent: row.scorePercent,
      completionPercent: row.completionPercent,
      resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
      safeNextActionLabel: row.safeNextActionLabel,
      summary: row.adjustedRetryCompletionSummary,
    }));

  const resolvedSupportOutcomeRows: DemoLearningResolvedSupportOutcomeEvidenceRow[] =
    resolutionRows.map((row) => ({
      resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
      adjustedSupportRetryCompletionId: row.adjustedSupportRetryCompletionId,
      teacherReviewedEscalationId: row.teacherReviewedEscalationId,
      unresolvedOutcomeId: row.unresolvedOutcomeId,
      supportAdjustmentId: row.supportAdjustmentId,
      studentId: row.studentId,
      childProfileId: row.childProfileId,
      studentName: row.studentName,
      teacherId: row.teacherId,
      teacherName: row.teacherName,
      courseCode: row.courseCode,
      status: row.resolvedSupportOutcomeStatus,
      reasonCode: row.resolvedOutcomeReasonCode,
      scorePercent: row.scorePercent,
      completionPercent: row.completionPercent,
      outcomeAt: row.resolvedOutcomeAt,
      parentClosureSummaryId: row.parentClosureSummaryId,
      teacherClosureNoteId: row.teacherClosureNoteId,
      safeNextActionLabel: row.safeNextActionLabel,
      parentVisible: row.parentVisible,
      teacherVisible: row.teacherVisible,
      outcomeSummary: row.resolvedOutcomeSummary,
    }));

  const parentClosureSummaryRows: DemoLearningParentVisibleClosureSummaryRow[] =
    resolutionRows
      .filter((row) => row.parentVisible)
      .map((row) => {
        const parentEscalationSummary = parentEscalationSummariesById.get(
          unresolvedRowsByAttemptId.get(row.unresolvedRetryAttemptId)
            ?.parentEscalationSummaryId ?? '',
        );
        if (!parentEscalationSummary) {
          throw new Error(
            `Missing parent closure reference for teacher follow-up resolution ${row.resolutionId}`,
          );
        }

        return {
          parentClosureSummaryId: row.parentClosureSummaryId,
          resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
          adjustedSupportRetryCompletionId:
            row.adjustedSupportRetryCompletionId,
          parentGuardianId: parentEscalationSummary.parentGuardianId,
          parentGuardianName: parentEscalationSummary.parentGuardianName,
          parentGuardianEmail: parentEscalationSummary.parentGuardianEmail,
          studentId: row.studentId,
          childProfileId: row.childProfileId,
          studentName: row.studentName,
          courseCode: row.courseCode,
          resolvedOutcomeStatus: row.resolvedSupportOutcomeStatus,
          resolvedOutcomeReasonCode: row.resolvedOutcomeReasonCode,
          scorePercent: row.scorePercent,
          completionPercent: row.completionPercent,
          safeNextActionLabel: row.safeNextActionLabel,
          parentVisible: true,
          summary: row.parentClosureSummary,
        } satisfies DemoLearningParentVisibleClosureSummaryRow;
      });

  const teacherClosureNoteRows: DemoLearningTeacherVisibleClosureNoteRow[] =
    resolutionRows
      .filter((row) => row.teacherVisible)
      .map((row) => ({
        teacherClosureNoteId: row.teacherClosureNoteId,
        resolvedSupportOutcomeId: row.resolvedSupportOutcomeId,
        adjustedSupportRetryCompletionId: row.adjustedSupportRetryCompletionId,
        teacherReviewedEscalationId: row.teacherReviewedEscalationId,
        teacherId: row.teacherId,
        teacherName: row.teacherName,
        teacherEmail: row.teacherEmail,
        classId: row.classId,
        classCode: row.classCode,
        studentId: row.studentId,
        childProfileId: row.childProfileId,
        studentName: row.studentName,
        courseCode: row.courseCode,
        resolvedOutcomeStatus: row.resolvedSupportOutcomeStatus,
        resolvedOutcomeReasonCode: row.resolvedOutcomeReasonCode,
        scorePercent: row.scorePercent,
        completionPercent: row.completionPercent,
        safeNextActionLabel: row.safeNextActionLabel,
        teacherVisible: true,
        summary: row.teacherClosureNoteSummary,
      }));

  const statusCounts: DemoLearningTeacherEscalationFollowupResolutionStatusCounts =
    {
      teacherReviewedEscalationStatus: countByStatus(
        teacherReviewedEscalationStatuses,
        teacherReviewedEscalationRows,
        (row) => row.reviewStatus,
      ),
      adjustedSupportRetryStatus: countByStatus(
        adjustedSupportRetryCompletionStatuses,
        adjustedSupportRetryCompletionRows,
        (row) => row.retryStatus,
      ),
      resolvedOutcomeStatus: countByStatus(
        resolvedSupportOutcomeStatuses,
        resolvedSupportOutcomeRows,
        (row) => row.status,
      ),
      resolvedOutcomeReasonCode: countByStatus(
        resolvedSupportOutcomeReasonCodes,
        resolvedSupportOutcomeRows,
        (row) => row.reasonCode,
      ),
    };
  const rowsWithStableTrace = resolutionRows.filter((row) =>
    [
      row.studentId,
      row.courseId,
      row.progressRollupId,
      row.interventionReviewId,
      row.supportPlanId,
      row.remedialAssignmentId,
      row.remedialDailyPlanId,
      row.remedialPracticeAttemptId,
      row.unresolvedRetryAttemptId,
      row.unresolvedOutcomeId,
      row.teacherEscalationId,
      row.supportAdjustmentId,
      row.teacherReviewedEscalationId,
      row.adjustedSupportRetryCompletionId,
      row.resolvedSupportOutcomeId,
      row.parentClosureSummaryId,
      row.teacherClosureNoteId,
    ].every((id) => row.stableTraceKey.includes(id)),
  );
  const linkedResolutionRows = resolutionRows.filter(
    (row) =>
      Boolean(row.studentId) &&
      Boolean(row.teacherId) &&
      Boolean(row.courseId) &&
      unresolvedReport.retryAttemptRows.some(
        (retry) => retry.retryAttemptId === row.unresolvedRetryAttemptId,
      ) &&
      teacherReviewedEscalationRows.some(
        (review) =>
          review.teacherReviewedEscalationId ===
          row.teacherReviewedEscalationId,
      ) &&
      adjustedSupportRetryCompletionRows.some(
        (completion) =>
          completion.adjustedSupportRetryCompletionId ===
          row.adjustedSupportRetryCompletionId,
      ) &&
      resolvedSupportOutcomeRows.some(
        (outcome) =>
          outcome.resolvedSupportOutcomeId === row.resolvedSupportOutcomeId,
      ) &&
      parentClosureSummaryRows.some(
        (summary) =>
          summary.parentClosureSummaryId === row.parentClosureSummaryId,
      ) &&
      teacherClosureNoteRows.some(
        (note) => note.teacherClosureNoteId === row.teacherClosureNoteId,
      ),
  );
  const remainingLocalDemoNotes = [
    'Teacher escalation follow-up resolutions are deterministic fixture rows linked to the prior unresolved support escalation.',
    'Adjusted retry completion, resolved outcome, parent closure summary, and teacher closure note rows are read-only evidence only.',
    'Production escalation resolution persistence, adjusted retry writes, parent delivery, provider calls, AI execution, schedulers, and real learner mutations remain out of scope.',
  ];
  const safety = {
    ...unresolvedReport.safety,
    realTeacherReviewedEscalationMutationUsed: false,
    realAdjustedSupportRetryCompletionMutationUsed: false,
    realResolvedSupportOutcomeMutationUsed: false,
    realParentClosureSummaryMutationUsed: false,
    realTeacherClosureNoteMutationUsed: false,
  } satisfies DemoLearningTeacherEscalationFollowupResolutionSafety;
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
  const evidenceRows: DemoLearningTeacherEscalationFollowupResolutionEvidenceRow[] =
    [
      {
        evidenceKind: 'UNRESOLVED_ESCALATION_REFERENCE',
        evidenceCount: unresolvedReport.retryAttemptRows.length,
        stableFixtureIds: unresolvedReport.retryAttemptRows.map(
          (row) => row.retryAttemptId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Unresolved escalation references come from the prior remedial retry unresolved support escalation report.',
      },
      {
        evidenceKind: 'TEACHER_REVIEWED_ESCALATION',
        evidenceCount: teacherReviewedEscalationRows.length,
        stableFixtureIds: teacherReviewedEscalationRows.map(
          (row) => row.teacherReviewedEscalationId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher-reviewed escalation rows confirm the support adjustment before retry closure evidence.',
      },
      {
        evidenceKind: 'ADJUSTED_SUPPORT_RETRY_COMPLETION',
        evidenceCount: adjustedSupportRetryCompletionRows.length,
        stableFixtureIds: adjustedSupportRetryCompletionRows.map(
          (row) => row.adjustedSupportRetryCompletionId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Adjusted support retry completion rows include deterministic completion status, completion percent, and score evidence.',
      },
      {
        evidenceKind: 'RESOLVED_SUPPORT_OUTCOME',
        evidenceCount: resolvedSupportOutcomeRows.length,
        stableFixtureIds: resolvedSupportOutcomeRows.map(
          (row) => row.resolvedSupportOutcomeId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Resolved support outcome evidence records deterministic status, reason code, and safe next-action label.',
      },
      {
        evidenceKind: 'PARENT_VISIBLE_CLOSURE_SUMMARY',
        evidenceCount: parentClosureSummaryRows.length,
        stableFixtureIds: parentClosureSummaryRows.map(
          (row) => row.parentClosureSummaryId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Parent-visible closure summaries are report evidence and do not send notifications.',
      },
      {
        evidenceKind: 'TEACHER_VISIBLE_CLOSURE_NOTE',
        evidenceCount: teacherClosureNoteRows.length,
        stableFixtureIds: teacherClosureNoteRows.map(
          (row) => row.teacherClosureNoteId,
        ),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Teacher-visible closure notes are local-demo rows and do not mutate teacher workflow state.',
      },
      {
        evidenceKind: 'SAFE_NEXT_ACTION',
        evidenceCount: resolutionRows.filter((row) =>
          Boolean(row.safeNextActionLabel),
        ).length,
        stableFixtureIds: resolutionRows.map((row) => row.safeNextActionLabel),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Safe next-action labels close the escalation without live scheduler, parent delivery, or learner mutation.',
      },
      {
        evidenceKind: 'STABLE_TRACE',
        evidenceCount: rowsWithStableTrace.length,
        stableFixtureIds: rowsWithStableTrace.map((row) => row.stableTraceKey),
        fixtureOnly: true,
        providerUsed: false,
        mutationUsed: false,
        evidenceSummary:
          'Stable traces connect unresolved escalation -> teacher review -> adjusted retry completion -> resolved outcome -> parent closure -> teacher closure.',
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
          'All production, provider, payment, notification, AI, scheduler, escalation resolution, learning mutation, and ERP gates remain closed.',
      },
    ];

  return {
    reportName:
      'Learning local demo Teacher Escalation Follow-up Resolution Report',
    generatedFor: 'local-demo-teacher-escalation-followup-resolution-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/teacher-escalation-followup-resolution-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#teacher-escalation-followup-resolution',
    jsonExportPath:
      'exports/learning-local-demo-teacher-escalation-followup-resolution-report.json',
    markdownExportPath:
      'exports/learning-local-demo-teacher-escalation-followup-resolution-report.md',
    safety,
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'Teacher escalation evidence now traces reviewed escalation, adjusted retry completion, resolved outcome, parent closure summary, and teacher closure note rows.',
      remainingLocalDemoNotes,
    },
    totals: {
      studentCount: new Set(resolutionRows.map((row) => row.studentId)).size,
      teacherCount: new Set(resolutionRows.map((row) => row.teacherId)).size,
      courseCount: new Set(resolutionRows.map((row) => row.courseId)).size,
      unresolvedEscalationReferenceCount: new Set(
        resolutionRows.map((row) => row.unresolvedRetryAttemptId),
      ).size,
      teacherReviewedEscalationCount: teacherReviewedEscalationRows.length,
      adjustedSupportRetryCompletionCount:
        adjustedSupportRetryCompletionRows.length,
      resolvedSupportOutcomeCount: resolvedSupportOutcomeRows.length,
      parentVisibleClosureSummaryCount: parentClosureSummaryRows.length,
      teacherVisibleClosureNoteCount: teacherClosureNoteRows.length,
      safeNextActionCount: resolutionRows.filter((row) =>
        Boolean(row.safeNextActionLabel),
      ).length,
      stableTraceCount: rowsWithStableTrace.length,
      resolvedFlowLinksCompleteCount: linkedResolutionRows.length,
      outcomesWithDeterministicStatusReasonActionCount:
        resolvedSupportOutcomeRows.filter(
          (row) =>
            Boolean(row.status) &&
            Boolean(row.reasonCode) &&
            Boolean(row.safeNextActionLabel),
        ).length,
      adjustedRetriesWithDeterministicStatusScoreCount:
        adjustedSupportRetryCompletionRows.filter(
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
    resolutionRows,
    teacherReviewedEscalationRows,
    adjustedSupportRetryCompletionRows,
    resolvedSupportOutcomeRows,
    parentClosureSummaryRows,
    teacherClosureNoteRows,
    evidenceRows,
  };
}

export function toTeacherEscalationFollowupResolutionMarkdown(
  report: DemoLearningTeacherEscalationFollowupResolutionReport,
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
    `- Teachers: ${report.totals.teacherCount}`,
    `- Courses: ${report.totals.courseCount}`,
    `- Unresolved escalation references: ${report.totals.unresolvedEscalationReferenceCount}`,
    `- Teacher-reviewed escalations: ${report.totals.teacherReviewedEscalationCount}`,
    `- Adjusted support retry completions: ${report.totals.adjustedSupportRetryCompletionCount}`,
    `- Resolved support outcomes: ${report.totals.resolvedSupportOutcomeCount}`,
    `- Parent-visible closure summaries: ${report.totals.parentVisibleClosureSummaryCount}`,
    `- Teacher-visible closure notes: ${report.totals.teacherVisibleClosureNoteCount}`,
    `- Safe next actions: ${report.totals.safeNextActionCount}`,
    `- Stable traces: ${report.totals.stableTraceCount}`,
    `- Complete resolved flow links: ${report.totals.resolvedFlowLinksCompleteCount}`,
    `- Outcomes with deterministic status/reason/action: ${report.totals.outcomesWithDeterministicStatusReasonActionCount}`,
    `- Adjusted retries with deterministic status/score: ${report.totals.adjustedRetriesWithDeterministicStatusScoreCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Resolution Rows',
    '',
    '| Resolution | Student | Teacher | Unresolved escalation | Adjusted retry | Resolved outcome | Closures | Next action | Trace |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.resolutionRows.map(
      (row) =>
        `| ${[
          row.resolutionId,
          `${row.studentName} (${row.childProfileId})`,
          `${row.teacherName} (${row.teacherEmail})`,
          `${row.unresolvedRetryAttemptId} / ${row.unresolvedOutcomeId} / ${row.supportAdjustmentId}`,
          `${row.adjustedSupportRetryCompletionId} / ${row.adjustedSupportRetryStatus} / ${row.scorePercent}%`,
          `${row.resolvedSupportOutcomeId} / ${row.resolvedSupportOutcomeStatus} / ${row.resolvedOutcomeReasonCode}`,
          `${row.parentClosureSummaryId} / ${row.teacherClosureNoteId}`,
          row.safeNextActionLabel,
          row.stableTraceKey,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Reviewed Escalation Rows',
    '',
    '| Review | Escalation | Teacher | Student | Status | Next action | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.teacherReviewedEscalationRows.map(
      (row) =>
        `| ${[
          row.teacherReviewedEscalationId,
          `${row.teacherEscalationId} / ${row.supportAdjustmentId}`,
          `${row.teacherName} (${row.teacherEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          row.reviewStatus,
          row.safeNextActionLabel,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
    '## Adjusted Support Retry Completion Rows',
    '',
    '| Adjusted retry | Student | Support adjustment | Status | Score | Outcome | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...report.adjustedSupportRetryCompletionRows.map(
      (row) =>
        `| ${[
          row.adjustedSupportRetryCompletionId,
          `${row.studentName} (${row.childProfileId})`,
          row.supportAdjustmentId,
          row.retryStatus,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          row.resolvedSupportOutcomeId,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
    '## Resolved Outcome Rows',
    '',
    '| Outcome | Adjusted retry | Student | Status | Reason | Score | Visibility | Next action | Summary |',
    '| --- | --- | --- | --- | --- | ---: | --- | --- | --- |',
    ...report.resolvedSupportOutcomeRows.map(
      (row) =>
        `| ${[
          row.resolvedSupportOutcomeId,
          row.adjustedSupportRetryCompletionId,
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
    '## Parent Closure Summary Rows',
    '',
    '| Parent closure | Parent | Student | Status | Score | Next action | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...report.parentClosureSummaryRows.map(
      (row) =>
        `| ${[
          row.parentClosureSummaryId,
          `${row.parentGuardianName} (${row.parentGuardianEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.resolvedOutcomeStatus} / ${row.resolvedOutcomeReasonCode}`,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          row.safeNextActionLabel,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
    '## Teacher Closure Note Rows',
    '',
    '| Teacher closure | Teacher | Student | Status | Score | Next action | Summary |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...report.teacherClosureNoteRows.map(
      (row) =>
        `| ${[
          row.teacherClosureNoteId,
          `${row.teacherName} (${row.teacherEmail})`,
          `${row.studentName} (${row.childProfileId})`,
          `${row.resolvedOutcomeStatus} / ${row.resolvedOutcomeReasonCode}`,
          `${row.scorePercent}% / ${row.completionPercent}%`,
          row.safeNextActionLabel,
          row.summary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
