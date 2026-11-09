import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningAcceptanceTraceabilityGateReport,
  DemoLearningAcceptanceTraceabilityGateRow,
  DemoLearningAcceptanceTraceabilityGateStatus,
  DemoLearningCoreFixture,
  DemoLearningMvpReadinessOverviewSliceKey,
} from '../learning-local-demo.types';
import { buildMvpReadinessOverviewReport } from './mvp-readiness-overview.report';
import { countByStatus } from './shared';

export const acceptanceTraceabilityGateStatuses: readonly DemoLearningAcceptanceTraceabilityGateStatus[] =
  ['MAPPED_LOCAL_DEMO', 'NEEDS_LOCAL_DEMO_EVIDENCE'];

export const acceptanceCriteriaBySliceKey: Record<
  DemoLearningMvpReadinessOverviewSliceKey,
  {
    id: string;
    name: string;
    safetyGatesCovered: string[];
    remainingLocalDemoNote: string;
  }
> = {
  ENROLLMENT: {
    id: 'LC-AC-001',
    name: 'Students, courses, enrollments, and lifecycle states are visible in fixture evidence.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'realStudentMutationUsed=false',
      'realCourseMutationUsed=false',
      'realEnrollmentMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production enrollment creation, cancellation, and roster mutation remain out of scope.',
  },
  SUBSCRIPTION_FIXTURE: {
    id: 'LC-AC-002',
    name: 'Subscription and pending payment states are traceable without provider execution.',
    safetyGatesCovered: [
      'providerApiUsed=false',
      'paymentProviderUsed=false',
      'realPaymentMutationUsed=false',
      'realEnrollmentMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Provider-backed subscription renewal and payment capture remain out of scope.',
  },
  REFUNDS_COMMISSION_FIXTURE: {
    id: 'LC-AC-003',
    name: 'Refund and commission fixture rows reconcile to read-only revenue evidence.',
    safetyGatesCovered: [
      'paymentProviderUsed=false',
      'realRefundMutationUsed=false',
      'realCommissionMutationUsed=false',
      'realPaymentMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live refund, payout, clawback, and commission approval mutations remain out of scope.',
  },
  DAILY_PLAN: {
    id: 'LC-AC-004',
    name: 'Daily plan, video, and practice completion states are reproducible from fixtures.',
    safetyGatesCovered: [
      'realLearningPathMutationUsed=false',
      'realDailyPlanMutationUsed=false',
      'realVideoEvidenceMutationUsed=false',
      'realPracticeMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Real learner plan assignment and video/practice telemetry writes remain out of scope.',
  },
  LESSON_ASSIGNMENT: {
    id: 'LC-AC-005',
    name: 'Lessons, assignments, submissions, scores, and feedback are mapped to fixture rows.',
    safetyGatesCovered: [
      'realLessonMutationUsed=false',
      'realAssignmentMutationUsed=false',
      'realAssessmentMutationUsed=false',
      'realProgressMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Teacher grading, feedback edits, and assessment mutations remain out of scope.',
  },
  PROGRESS: {
    id: 'LC-AC-006',
    name: 'Attendance and learner progress rollups have deterministic local-demo evidence.',
    safetyGatesCovered: [
      'realClassMutationUsed=false',
      'realSessionMutationUsed=false',
      'realAttendanceMutationUsed=false',
      'realProgressMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live attendance capture and learner progress writes remain out of scope.',
  },
  SESSION_COMPLETION_PRACTICE_ROLLUP: {
    id: 'LC-AC-014',
    name: 'Allowed daily plan sessions roll up lesson completion, practice score, and parent/teacher progress summaries.',
    safetyGatesCovered: [
      'realLearningSessionGateMutationUsed=false',
      'realDailyPlanAccessMutationUsed=false',
      'realLearningSessionCompletionMutationUsed=false',
      'realVideoEvidenceMutationUsed=false',
      'realPracticeMutationUsed=false',
      'realProgressMutationUsed=false',
      'realParentProgressSummaryMutationUsed=false',
      'realTeacherProgressSummaryMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production session completion telemetry, persisted progress writes, parent delivery, and teacher workflow mutation remain out of scope.',
  },
  TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN: {
    id: 'LC-AC-015',
    name: 'Needs-support progress rollups create teacher review, remedial assignment, support plan, parent summary, and teacher next-action evidence.',
    safetyGatesCovered: [
      'realTeacherInterventionMutationUsed=false',
      'realTeacherInterventionReviewMutationUsed=false',
      'realRemedialAssignmentMutationUsed=false',
      'realSupportPlanMutationUsed=false',
      'realParentSupportSummaryMutationUsed=false',
      'realTeacherNextActionMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production teacher workflow persistence, remedial assignment writes, parent delivery, and live learning mutation remain out of scope.',
  },
  REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP: {
    id: 'LC-AC-016',
    name: 'Teacher support plans trace remedial retry completion, support outcome, and parent/teacher follow-up evidence.',
    safetyGatesCovered: [
      'realRemedialRetryCompletionMutationUsed=false',
      'realSupportOutcomeEvidenceMutationUsed=false',
      'realParentFollowupSummaryMutationUsed=false',
      'realTeacherFollowupSummaryMutationUsed=false',
      'realSupportPlanMutationUsed=false',
      'realRemedialAssignmentMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production retry completion persistence, parent delivery, teacher workflow mutation, and live learning mutation remain out of scope.',
  },
  REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION: {
    id: 'LC-AC-017',
    name: 'Incomplete remedial retries trace unresolved support outcomes, teacher escalation, support adjustment, parent escalation summary, and teacher next action evidence.',
    safetyGatesCovered: [
      'realRemedialRetryUnresolvedAttemptMutationUsed=false',
      'realUnresolvedSupportOutcomeMutationUsed=false',
      'realTeacherEscalationMutationUsed=false',
      'realSupportAdjustmentMutationUsed=false',
      'realParentEscalationSummaryMutationUsed=false',
      'realTeacherEscalationNextActionMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production unresolved retry persistence, escalation workflow mutation, support adjustment writes, parent delivery, and live learning mutation remain out of scope.',
  },
  TEACHER_ESCALATION_FOLLOWUP_RESOLUTION: {
    id: 'LC-AC-018',
    name: 'Teacher-reviewed escalations trace adjusted retry completion, resolved support outcome, parent closure summary, and teacher closure note evidence.',
    safetyGatesCovered: [
      'realTeacherReviewedEscalationMutationUsed=false',
      'realAdjustedSupportRetryCompletionMutationUsed=false',
      'realResolvedSupportOutcomeMutationUsed=false',
      'realParentClosureSummaryMutationUsed=false',
      'realTeacherClosureNoteMutationUsed=false',
      'realLearningMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production escalation resolution persistence, adjusted retry writes, parent closure delivery, teacher workflow mutation, and live learning mutation remain out of scope.',
  },
  MVP_END_TO_END_READINESS_TRACE: {
    id: 'LC-AC-019',
    name: 'A deterministic MVP readiness trace links the core learning journey from enrollment fixture through teacher escalation resolution evidence.',
    safetyGatesCovered: [
      'productionReady=false',
      'productionDbUsed=false',
      'providerApiUsed=false',
      'paymentProviderUsed=false',
      'notificationProviderUsed=false',
      'aiProviderExecutionUsed=false',
      'realLearningMutationUsed=false',
      'realTeacherReviewedEscalationMutationUsed=false',
      'realAdjustedSupportRetryCompletionMutationUsed=false',
      'realResolvedSupportOutcomeMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'This is a read-only local-demo trace over fixture evidence; production orchestration, persistence, provider calls, notification sends, and live learner mutations remain out of scope.',
  },
  MVP_ROLE_JOURNEY_ENTRYPOINTS: {
    id: 'LC-AC-020',
    name: 'Student, parent, teacher, and admin/operator entrypoints link to the same accepted Minh/course A1 MVP journey.',
    safetyGatesCovered: [
      'productionReady=false',
      'productionDbUsed=false',
      'providerApiUsed=false',
      'notificationProviderUsed=false',
      'realLearningMutationUsed=false',
      'realTeacherInterventionMutationUsed=false',
      'realParentMessageMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Role entrypoints are local-demo dashboard/report evidence only; production navigation state, authorization persistence, parent sends, teacher workflow mutation, and live learner mutation remain out of scope.',
  },
  REPORT_REVIEW_PREVIEW: {
    id: 'LC-AC-007',
    name: 'Parent-facing report previews require teacher/admin review and permission-redaction evidence.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'aiProviderExecutionUsed=false',
      'notificationProviderUsed=false',
      'realParentMessageMutationUsed=false',
      'realLearningMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live review workflow persistence, parent message sends, and production privacy enforcement remain out of scope.',
  },
  PARENT_PORTAL_INBOX_READ_RECEIPT: {
    id: 'LC-AC-012',
    name: 'Only approved report previews appear in the parent portal inbox and fixture read/ack evidence is traceable.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'notificationProviderUsed=false',
      'realParentMessageMutationUsed=false',
      'realLearningMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production parent portal authorization, persisted inbox state, and notification delivery remain out of scope.',
  },
  PARENT_SCREEN_TIME_DAILY_PLAN_GUARD: {
    id: 'LC-AC-013',
    name: 'Parent screen-time grants and limits guard child daily plan sessions with allowed and blocked fixture evidence.',
    safetyGatesCovered: [
      'productionDbUsed=false',
      'providerApiUsed=false',
      'notificationProviderUsed=false',
      'realParentGuardianMutationUsed=false',
      'realScreenTimePolicyMutationUsed=false',
      'realLearningSessionGateMutationUsed=false',
      'realScreenTimeGrantMutationUsed=false',
      'realDailyPlanAccessMutationUsed=false',
      'realLearningMutationUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Production parent controls, persisted session gates, grant mutation, and daily plan access writes remain out of scope.',
  },
  AI_TUTOR_EVIDENCE: {
    id: 'LC-AC-008',
    name: 'AI tutor guardrails, reviews, parent summaries, and support recommendations are fixture-only.',
    safetyGatesCovered: [
      'aiProviderUsed=false',
      'aiProviderExecutionUsed=false',
      'realAiChatMutationUsed=false',
      'realAiModerationMutationUsed=false',
      'realLearningSupportMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live AI model execution and persisted AI chat mutation remain out of scope.',
  },
  ACHIEVEMENTS: {
    id: 'LC-AC-009',
    name: 'Achievements, badges, certificates, and recognition are preview evidence only.',
    safetyGatesCovered: [
      'certificateIssuerProviderUsed=false',
      'realAchievementMutationUsed=false',
      'realBadgeMutationUsed=false',
      'realCertificateMutationUsed=false',
      'realCredentialIssuanceUsed=false',
      'realRecognitionNotificationMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Credential issuance, certificate sending, and recognition notification remain out of scope.',
  },
  WEEKLY_DIGEST: {
    id: 'LC-AC-010',
    name: 'Parent and teacher weekly digest evidence is generated without notification sends.',
    safetyGatesCovered: [
      'notificationProviderUsed=false',
      'realParentSummaryMutationUsed=false',
      'realParentMessageMutationUsed=false',
      'realTeacherInterventionMutationUsed=false',
      'realWeeklyDigestNotificationMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Live parent/teacher messaging and notification delivery remain out of scope.',
  },
  FOLLOW_UP_OUTCOMES: {
    id: 'LC-AC-011',
    name: 'Follow-up action outcomes link digest actions back to learning evidence without mutations.',
    safetyGatesCovered: [
      'realFollowUpActionOutcomeMutationUsed=false',
      'realParentMessageMutationUsed=false',
      'realTeacherInterventionMutationUsed=false',
      'notificationProviderUsed=false',
      'realErpMutationUsed=false',
    ],
    remainingLocalDemoNote:
      'Real follow-up state changes, parent sends, and teacher workflow mutations remain out of scope.',
  },
};

export function buildAcceptanceTraceabilityGateReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningAcceptanceTraceabilityGateReport {
  const mvpReadinessOverviewReport = buildMvpReadinessOverviewReport(
    fixture,
    generatedAt,
  );
  const rows: DemoLearningAcceptanceTraceabilityGateRow[] =
    mvpReadinessOverviewReport.rows.map((row) => {
      const acceptanceCriterion = acceptanceCriteriaBySliceKey[row.sliceKey];
      const acceptanceStatus =
        row.safetyClosed &&
        row.fixtureOnly &&
        !row.productionReady &&
        Boolean(row.sourceEndpointPath) &&
        Boolean(row.jsonExportPath) &&
        Boolean(row.markdownExportPath)
          ? 'MAPPED_LOCAL_DEMO'
          : 'NEEDS_LOCAL_DEMO_EVIDENCE';

      return {
        sliceKey: row.sliceKey,
        sliceName: row.sliceName,
        acceptanceCriterionId: acceptanceCriterion.id,
        acceptanceCriterionName: acceptanceCriterion.name,
        acceptanceStatus,
        readinessStatus: row.readinessStatus,
        productionReady: false,
        fixtureOnly: true,
        safetyClosed: row.safetyClosed,
        evidenceEndpointPath: row.sourceEndpointPath,
        jsonExportPath: row.jsonExportPath,
        markdownExportPath: row.markdownExportPath,
        dashboardEvidencePath:
          row.sliceKey === 'MVP_END_TO_END_READINESS_TRACE'
            ? '/admin/learning-local-demo#mvp-end-to-end-readiness-trace'
            : row.sliceKey === 'MVP_ROLE_JOURNEY_ENTRYPOINTS'
              ? '/admin/learning-local-demo#mvp-role-journey-entrypoints'
              : '/admin/learning-local-demo#mvp-readiness-overview',
        seedCommand: 'npm run seed:demo',
        reportCommand: 'npm run report:demo',
        testCommand: 'npm run test:learning-local',
        safetyGatesCovered: acceptanceCriterion.safetyGatesCovered,
        remainingLocalDemoNote: acceptanceCriterion.remainingLocalDemoNote,
        evidenceSummary: row.evidenceSummary,
      };
    });
  const statusCounts = {
    acceptanceStatus: countByStatus(
      acceptanceTraceabilityGateStatuses,
      rows,
      (row) => row.acceptanceStatus,
    ),
  };
  const safetyEntries = Object.entries(mvpReadinessOverviewReport.safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;

  return {
    reportName: 'Learning local demo Acceptance Traceability Gate Report',
    generatedFor: 'local-demo-acceptance-traceability-gate-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    fixtureOnly: true,
    safety: mvpReadinessOverviewReport.safety,
    totals: {
      sliceCount: mvpReadinessOverviewReport.totals.sliceCount,
      acceptanceCriterionCount: rows.length,
      mappedCriterionCount: statusCounts.acceptanceStatus.MAPPED_LOCAL_DEMO,
      slicesWithMappingCount: new Set(
        rows
          .filter((row) => row.acceptanceStatus === 'MAPPED_LOCAL_DEMO')
          .map((row) => row.sliceKey),
      ).size,
      slicesMissingMappingCount: new Set(
        rows
          .filter((row) => row.acceptanceStatus === 'NEEDS_LOCAL_DEMO_EVIDENCE')
          .map((row) => row.sliceKey),
      ).size,
      productionReadyClaimCount: 0,
      fixtureOnlyCriterionCount: rows.filter((row) => row.fixtureOnly).length,
      safetyClosedCriterionCount: rows.filter((row) => row.safetyClosed).length,
      evidenceEndpointCount: new Set(
        rows.map((row) => row.evidenceEndpointPath),
      ).size,
      jsonExportCount: new Set(rows.map((row) => row.jsonExportPath)).size,
      markdownExportCount: new Set(rows.map((row) => row.markdownExportPath))
        .size,
      dashboardEvidenceCount: new Set(
        rows.map((row) => row.dashboardEvidencePath),
      ).size,
      seedCommandCount: new Set(rows.map((row) => row.seedCommand)).size,
      reportCommandCount: new Set(rows.map((row) => row.reportCommand)).size,
      testCommandCount: new Set(rows.map((row) => row.testCommand)).size,
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
    },
    statusCounts,
    rows,
  };
}

export function toAcceptanceTraceabilityGateMarkdown(
  report: DemoLearningAcceptanceTraceabilityGateReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    'Traceability endpoint: /v1/learning-local-demo/acceptance-traceability-gate-report',
    '',
    '## Safety',
    '',
    '- Fixture-only local demo data.',
    '- production_ready=false',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- aiProviderUsed=false',
    '- aiProviderExecutionUsed=false',
    '- certificateIssuerProviderUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- liveAdsExecuted=false',
    '- realStudentMutationUsed=false',
    '- realCourseMutationUsed=false',
    '- realEnrollmentMutationUsed=false',
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
    '- realAiChatMutationUsed=false',
    '- realAiModerationMutationUsed=false',
    '- realLearningSupportMutationUsed=false',
    '- realAchievementMutationUsed=false',
    '- realBadgeMutationUsed=false',
    '- realCertificateMutationUsed=false',
    '- realCredentialIssuanceUsed=false',
    '- realRecognitionNotificationMutationUsed=false',
    '- realParentSummaryMutationUsed=false',
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
    '- realWeeklyDigestNotificationMutationUsed=false',
    '- realFollowUpActionOutcomeMutationUsed=false',
    '- realPaymentMutationUsed=false',
    '- realRefundMutationUsed=false',
    '- realCommissionMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '',
    '## Totals',
    '',
    `- MVP readiness slices: ${report.totals.sliceCount}`,
    `- Acceptance criteria: ${report.totals.acceptanceCriterionCount}`,
    `- Mapped criteria: ${report.totals.mappedCriterionCount}`,
    `- Slices with mapping: ${report.totals.slicesWithMappingCount}`,
    `- Slices missing mapping: ${report.totals.slicesMissingMappingCount}`,
    `- Production-ready claims: ${report.totals.productionReadyClaimCount}`,
    `- Fixture-only criteria: ${report.totals.fixtureOnlyCriterionCount}`,
    `- Safety-closed criteria: ${report.totals.safetyClosedCriterionCount}`,
    `- Evidence endpoints: ${report.totals.evidenceEndpointCount}`,
    `- JSON exports: ${report.totals.jsonExportCount}`,
    `- Markdown exports: ${report.totals.markdownExportCount}`,
    `- Dashboard evidence paths: ${report.totals.dashboardEvidenceCount}`,
    `- Seed commands: ${report.totals.seedCommandCount}`,
    `- Report commands: ${report.totals.reportCommandCount}`,
    `- Test commands: ${report.totals.testCommandCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Acceptance Traceability Rows',
    '',
    '| Criterion | Slice | Current status | Endpoint | Exports | Dashboard | Commands | Safety gates | Remaining local-demo note | Evidence |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.rows.map(
      (row) =>
        `| ${[
          `${row.acceptanceCriterionId} ${row.acceptanceCriterionName}`,
          `${row.sliceName} (${row.sliceKey})`,
          `${row.acceptanceStatus} / ${row.readinessStatus}`,
          row.evidenceEndpointPath,
          `${row.jsonExportPath}; ${row.markdownExportPath}`,
          row.dashboardEvidencePath,
          `${row.seedCommand}; ${row.reportCommand}; ${row.testCommand}`,
          row.safetyGatesCovered.join('<br>'),
          row.remainingLocalDemoNote,
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
