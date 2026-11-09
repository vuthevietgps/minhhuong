import { learningLocalDemoCoreFixture } from '../learning-local-demo.fixtures';
import type {
  DemoLearningCoreFixture,
  DemoLearningMvpReadinessOverviewReport,
  DemoLearningMvpReadinessOverviewRow,
  DemoLearningMvpReadinessOverviewStatus,
} from '../learning-local-demo.types';
import { buildAiTutorChatSafetyTeacherReviewReport } from './ai-tutor-chat-safety-teacher-review.report';
import { buildClassSessionAttendanceProgressReport } from './class-session-attendance-progress.report';
import { buildFollowUpActionOutcomeReport } from './follow-up-action-outcome.report';
import { buildLearningPathDailyPlanVideoPracticeEvidenceReport } from './learning-path-daily-plan-video-practice-evidence.report';
import { buildLearningSessionCompletionPracticeProgressRollupReport } from './learning-session-completion-practice-progress-rollup.report';
import { buildLessonAssignmentAssessmentProgressReport } from './lesson-assignment-assessment-progress.report';
import { buildMvpEndToEndReadinessTraceReport } from './mvp-end-to-end-readiness-trace.report';
import { buildMvpRoleJourneyEntrypointsReport } from './mvp-role-journey-entrypoints.report';
import { buildParentPortalApprovedReportInboxReadReceiptReport } from './parent-portal-approved-report-inbox-read-receipt.report';
import { buildParentScreenTimeGrantDailyPlanGuardReport } from './parent-screen-time-grant-daily-plan-guard.report';
import { buildParentTeacherReportReviewQueueMessagePreviewReport } from './parent-teacher-report-review-queue-message-preview.report';
import { buildParentTeacherWeeklyDigestReport } from './parent-teacher-weekly-digest.report';
import { buildRemedialRetryCompletionSupportOutcomeFollowupReport } from './remedial-retry-completion-support-outcome-followup.report';
import { buildRemedialRetryUnresolvedSupportEscalationReport } from './remedial-retry-unresolved-support-escalation.report';
import { countByStatus, percent } from './shared';
import { buildStudentAchievementBadgeCertificateReport } from './student-achievement-badge-certificate.report';
import { buildStudentCourseEnrollmentSubscriptionReport } from './student-course-enrollment-subscription.report';
import { buildTeacherEscalationFollowupResolutionReport } from './teacher-escalation-followup-resolution.report';
import { buildTeacherInterventionRemedialAssignmentSupportPlanReport } from './teacher-intervention-remedial-assignment-support-plan.report';

export const mvpReadinessOverviewStatuses: readonly DemoLearningMvpReadinessOverviewStatus[] =
  ['LOCAL_DEMO_READY', 'LOCAL_DEMO_READY_WITH_NOTES', 'NEEDS_LOCAL_DEMO_FIX'];

export function buildMvpReadinessOverviewReport(
  fixture: DemoLearningCoreFixture = learningLocalDemoCoreFixture,
  generatedAt = new Date().toISOString(),
): DemoLearningMvpReadinessOverviewReport {
  const enrollmentReport = buildStudentCourseEnrollmentSubscriptionReport(
    fixture,
    generatedAt,
  );
  const progressReport = buildClassSessionAttendanceProgressReport(
    fixture,
    generatedAt,
  );
  const lessonAssignmentReport = buildLessonAssignmentAssessmentProgressReport(
    fixture,
    generatedAt,
  );
  const learningPathReport =
    buildLearningPathDailyPlanVideoPracticeEvidenceReport(fixture, generatedAt);
  const parentTeacherReportReviewQueueMessagePreviewReport =
    buildParentTeacherReportReviewQueueMessagePreviewReport(
      fixture,
      generatedAt,
    );
  const parentPortalApprovedReportInboxReadReceiptReport =
    buildParentPortalApprovedReportInboxReadReceiptReport(fixture, generatedAt);
  const parentScreenTimeGrantDailyPlanGuardReport =
    buildParentScreenTimeGrantDailyPlanGuardReport(fixture, generatedAt);
  const learningSessionCompletionPracticeProgressRollupReport =
    buildLearningSessionCompletionPracticeProgressRollupReport(
      fixture,
      generatedAt,
    );
  const teacherInterventionRemedialAssignmentSupportPlanReport =
    buildTeacherInterventionRemedialAssignmentSupportPlanReport(
      fixture,
      generatedAt,
    );
  const remedialRetryCompletionSupportOutcomeFollowupReport =
    buildRemedialRetryCompletionSupportOutcomeFollowupReport(
      fixture,
      generatedAt,
    );
  const remedialRetryUnresolvedSupportEscalationReport =
    buildRemedialRetryUnresolvedSupportEscalationReport(fixture, generatedAt);
  const teacherEscalationFollowupResolutionReport =
    buildTeacherEscalationFollowupResolutionReport(fixture, generatedAt);
  const mvpEndToEndReadinessTraceReport = buildMvpEndToEndReadinessTraceReport(
    fixture,
    generatedAt,
  );
  const mvpRoleJourneyEntrypointsReport = buildMvpRoleJourneyEntrypointsReport(
    fixture,
    generatedAt,
  );
  const aiTutorChatSafetyTeacherReviewReport =
    buildAiTutorChatSafetyTeacherReviewReport(fixture, generatedAt);
  const studentAchievementBadgeCertificateReport =
    buildStudentAchievementBadgeCertificateReport(fixture, generatedAt);
  const parentTeacherWeeklyDigestReport = buildParentTeacherWeeklyDigestReport(
    fixture,
    generatedAt,
  );
  const followUpActionOutcomeReport = buildFollowUpActionOutcomeReport(
    fixture,
    generatedAt,
  );
  const safety = {
    ...followUpActionOutcomeReport.safety,
    realLearningSessionCompletionMutationUsed:
      learningSessionCompletionPracticeProgressRollupReport.safety
        .realLearningSessionCompletionMutationUsed,
    realParentProgressSummaryMutationUsed:
      learningSessionCompletionPracticeProgressRollupReport.safety
        .realParentProgressSummaryMutationUsed,
    realTeacherProgressSummaryMutationUsed:
      learningSessionCompletionPracticeProgressRollupReport.safety
        .realTeacherProgressSummaryMutationUsed,
    realTeacherInterventionReviewMutationUsed:
      teacherInterventionRemedialAssignmentSupportPlanReport.safety
        .realTeacherInterventionReviewMutationUsed,
    realRemedialAssignmentMutationUsed:
      teacherInterventionRemedialAssignmentSupportPlanReport.safety
        .realRemedialAssignmentMutationUsed,
    realSupportPlanMutationUsed:
      teacherInterventionRemedialAssignmentSupportPlanReport.safety
        .realSupportPlanMutationUsed,
    realParentSupportSummaryMutationUsed:
      teacherInterventionRemedialAssignmentSupportPlanReport.safety
        .realParentSupportSummaryMutationUsed,
    realTeacherNextActionMutationUsed:
      teacherInterventionRemedialAssignmentSupportPlanReport.safety
        .realTeacherNextActionMutationUsed,
    realRemedialRetryCompletionMutationUsed:
      remedialRetryCompletionSupportOutcomeFollowupReport.safety
        .realRemedialRetryCompletionMutationUsed,
    realSupportOutcomeEvidenceMutationUsed:
      remedialRetryCompletionSupportOutcomeFollowupReport.safety
        .realSupportOutcomeEvidenceMutationUsed,
    realParentFollowupSummaryMutationUsed:
      remedialRetryCompletionSupportOutcomeFollowupReport.safety
        .realParentFollowupSummaryMutationUsed,
    realTeacherFollowupSummaryMutationUsed:
      remedialRetryCompletionSupportOutcomeFollowupReport.safety
        .realTeacherFollowupSummaryMutationUsed,
    realRemedialRetryUnresolvedAttemptMutationUsed:
      remedialRetryUnresolvedSupportEscalationReport.safety
        .realRemedialRetryUnresolvedAttemptMutationUsed,
    realUnresolvedSupportOutcomeMutationUsed:
      remedialRetryUnresolvedSupportEscalationReport.safety
        .realUnresolvedSupportOutcomeMutationUsed,
    realTeacherEscalationMutationUsed:
      remedialRetryUnresolvedSupportEscalationReport.safety
        .realTeacherEscalationMutationUsed,
    realSupportAdjustmentMutationUsed:
      remedialRetryUnresolvedSupportEscalationReport.safety
        .realSupportAdjustmentMutationUsed,
    realParentEscalationSummaryMutationUsed:
      remedialRetryUnresolvedSupportEscalationReport.safety
        .realParentEscalationSummaryMutationUsed,
    realTeacherEscalationNextActionMutationUsed:
      remedialRetryUnresolvedSupportEscalationReport.safety
        .realTeacherEscalationNextActionMutationUsed,
    realTeacherReviewedEscalationMutationUsed:
      teacherEscalationFollowupResolutionReport.safety
        .realTeacherReviewedEscalationMutationUsed,
    realAdjustedSupportRetryCompletionMutationUsed:
      teacherEscalationFollowupResolutionReport.safety
        .realAdjustedSupportRetryCompletionMutationUsed,
    realResolvedSupportOutcomeMutationUsed:
      teacherEscalationFollowupResolutionReport.safety
        .realResolvedSupportOutcomeMutationUsed,
    realParentClosureSummaryMutationUsed:
      teacherEscalationFollowupResolutionReport.safety
        .realParentClosureSummaryMutationUsed,
    realTeacherClosureNoteMutationUsed:
      teacherEscalationFollowupResolutionReport.safety
        .realTeacherClosureNoteMutationUsed,
  };
  const rows: DemoLearningMvpReadinessOverviewRow[] = [
    {
      sliceKey: 'ENROLLMENT',
      sliceName: 'Student enrollment',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/student-course-enrollment-subscription-report',
      jsonExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
      markdownExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-report.md',
      primaryMetricLabel: 'Enrollments',
      primaryMetricValue: enrollmentReport.totals.enrollmentCount,
      secondaryMetricLabel: 'Active enrollments',
      secondaryMetricValue: enrollmentReport.totals.activeEnrollmentCount,
      coverageLabel: 'Students covered',
      coverageValue: enrollmentReport.totals.studentCount,
      riskNote:
        'Local-demo fixture only; production enrollment lifecycle remains out of scope.',
      evidenceSummary: `${enrollmentReport.totals.studentCount} students, ${enrollmentReport.totals.courseCount} courses, ${enrollmentReport.totals.enrollmentCount} enrollment rows.`,
    },
    {
      sliceKey: 'SUBSCRIPTION_FIXTURE',
      sliceName: 'Subscription fixture',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/student-course-enrollment-subscription-report',
      jsonExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
      markdownExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-report.md',
      primaryMetricLabel: 'Subscriptions',
      primaryMetricValue: enrollmentReport.totals.subscriptionCount,
      secondaryMetricLabel: 'Active or trialing',
      secondaryMetricValue:
        enrollmentReport.totals.activeSubscriptionCount +
        enrollmentReport.totals.trialingSubscriptionCount,
      coverageLabel: 'Enrollment rows',
      coverageValue: enrollmentReport.totals.enrollmentCount,
      riskNote:
        'Provider-backed subscription creation and renewal are intentionally not executed.',
      evidenceSummary: `${enrollmentReport.totals.subscriptionCount} synthetic subscriptions with ${enrollmentReport.totals.pendingPaymentCount} pending payment fixture.`,
    },
    {
      sliceKey: 'REFUNDS_COMMISSION_FIXTURE',
      sliceName: 'Refunds and commission fixture',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/student-course-enrollment-subscription-report',
      jsonExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
      markdownExportPath:
        'exports/learning-local-demo-student-course-enrollment-subscription-report.md',
      primaryMetricLabel: 'Commission rows',
      primaryMetricValue: enrollmentReport.totals.commissionCount,
      secondaryMetricLabel: 'Refund rows',
      secondaryMetricValue: enrollmentReport.totals.refundCount,
      coverageLabel: 'Net revenue cents',
      coverageValue: enrollmentReport.totals.netRevenueCents,
      riskNote:
        'Refund and commission states are fixture evidence only; no payment provider mutation is used.',
      evidenceSummary: `${enrollmentReport.totals.refundCount} refund and ${enrollmentReport.totals.commissionCount} commission fixtures reconcile to ${enrollmentReport.totals.netRevenueCents} net revenue cents.`,
    },
    {
      sliceKey: 'DAILY_PLAN',
      sliceName: 'Daily plan and practice evidence',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/learning-path-daily-plan-video-practice-evidence-report',
      jsonExportPath:
        'exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json',
      markdownExportPath:
        'exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.md',
      primaryMetricLabel: 'Daily plans',
      primaryMetricValue: learningPathReport.totals.dailyPlanCount,
      secondaryMetricLabel: 'Completed plans',
      secondaryMetricValue: learningPathReport.totals.completedDailyPlanCount,
      coverageLabel: 'Learning paths',
      coverageValue: learningPathReport.totals.learningPathCount,
      riskNote:
        'Video and practice completion are deterministic evidence rows only.',
      evidenceSummary: `${learningPathReport.totals.completedDailyPlanCount}/${learningPathReport.totals.dailyPlanCount} daily plans complete with ${learningPathReport.totals.passedPracticeCount} passed practice attempts.`,
    },
    {
      sliceKey: 'LESSON_ASSIGNMENT',
      sliceName: 'Lesson and assignment evidence',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/lesson-assignment-assessment-progress-report',
      jsonExportPath:
        'exports/learning-local-demo-lesson-assignment-assessment-progress-report.json',
      markdownExportPath:
        'exports/learning-local-demo-lesson-assignment-assessment-progress-report.md',
      primaryMetricLabel: 'Assignments',
      primaryMetricValue: lessonAssignmentReport.totals.assignmentCount,
      secondaryMetricLabel: 'Lessons',
      secondaryMetricValue: lessonAssignmentReport.totals.lessonCount,
      coverageLabel: 'Expected submissions',
      coverageValue: lessonAssignmentReport.totals.expectedSubmissionCount,
      riskNote:
        'Assessment scoring and feedback remain local fixture evidence only.',
      evidenceSummary: `${lessonAssignmentReport.totals.assignmentCount} assignment or quiz items produce ${lessonAssignmentReport.totals.submissionRecordCount} submission fixture rows.`,
    },
    {
      sliceKey: 'PROGRESS',
      sliceName: 'Attendance and progress',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/class-session-attendance-progress-report',
      jsonExportPath:
        'exports/learning-local-demo-class-session-attendance-progress-report.json',
      markdownExportPath:
        'exports/learning-local-demo-class-session-attendance-progress-report.md',
      primaryMetricLabel: 'Progress records',
      primaryMetricValue: progressReport.totals.progressRecordCount,
      secondaryMetricLabel: 'Needs support',
      secondaryMetricValue: progressReport.totals.needsSupportCount,
      coverageLabel: 'Attendance rows',
      coverageValue: progressReport.totals.attendanceRecordCount,
      riskNote:
        'Attendance and progress rows are read-only snapshots, not learner mutations.',
      evidenceSummary: `${progressReport.totals.progressRecordCount} progress rows, ${progressReport.totals.attendanceRecordCount} attendance records, and ${progressReport.totals.attendanceRatePercent}% attendance.`,
    },
    {
      sliceKey: 'REPORT_REVIEW_PREVIEW',
      sliceName: 'Report review queue and message preview',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report',
      jsonExportPath:
        'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-teacher-report-review-queue-message-preview-report.md',
      primaryMetricLabel: 'Review items',
      primaryMetricValue:
        parentTeacherReportReviewQueueMessagePreviewReport.totals
          .reviewQueueItemCount,
      secondaryMetricLabel: 'Approved previews',
      secondaryMetricValue:
        parentTeacherReportReviewQueueMessagePreviewReport.totals
          .approvedPreviewCount,
      coverageLabel: 'Held previews',
      coverageValue:
        parentTeacherReportReviewQueueMessagePreviewReport.totals
          .heldPreviewCount,
      riskNote:
        'Review decisions and parent-facing previews are read-only fixture evidence; no notification or parent-message delivery is executed.',
      evidenceSummary: `${parentTeacherReportReviewQueueMessagePreviewReport.totals.reviewQueueItemCount} review queue items produce ${parentTeacherReportReviewQueueMessagePreviewReport.totals.approvedPreviewCount} approved and ${parentTeacherReportReviewQueueMessagePreviewReport.totals.heldPreviewCount} held parent-facing previews.`,
    },
    {
      sliceKey: 'PARENT_PORTAL_INBOX_READ_RECEIPT',
      sliceName: 'Parent portal inbox and read receipt',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report',
      jsonExportPath:
        'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.md',
      primaryMetricLabel: 'Parent inbox items',
      primaryMetricValue:
        parentPortalApprovedReportInboxReadReceiptReport.totals
          .parentInboxItemCount,
      secondaryMetricLabel: 'Read/ack evidence',
      secondaryMetricValue:
        parentPortalApprovedReportInboxReadReceiptReport.totals
          .readAckEvidenceCount,
      coverageLabel: 'Hidden held previews',
      coverageValue:
        parentPortalApprovedReportInboxReadReceiptReport.totals
          .hiddenHeldPreviewCount,
      riskNote:
        'Parent inbox and read/ack rows are fixture evidence only; no production portal state, notification delivery, or parent-message mutation is used.',
      evidenceSummary: `${parentPortalApprovedReportInboxReadReceiptReport.totals.visibleParentInboxItemCount} approved preview is visible in the parent inbox, ${parentPortalApprovedReportInboxReadReceiptReport.totals.hiddenHeldPreviewCount} held preview remains hidden, and ${parentPortalApprovedReportInboxReadReceiptReport.totals.readAckEvidenceCount} read/ack row is traced.`,
    },
    {
      sliceKey: 'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD',
      sliceName: 'Parent screen-time daily plan guard',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report',
      jsonExportPath:
        'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-screen-time-grant-daily-plan-guard-report.md',
      primaryMetricLabel: 'Daily plan guard cases',
      primaryMetricValue:
        parentScreenTimeGrantDailyPlanGuardReport.totals
          .dailyPlanAccessCaseCount,
      secondaryMetricLabel: 'Blocked sessions',
      secondaryMetricValue:
        parentScreenTimeGrantDailyPlanGuardReport.totals.blockedSessionCount,
      coverageLabel: 'Session guard traces',
      coverageValue:
        parentScreenTimeGrantDailyPlanGuardReport.totals.sessionGuardTraceCount,
      riskNote:
        'Parent grants, screen-time rules, and session guard evidence are fixture-only; no daily plan access or parent-control mutation is executed.',
      evidenceSummary: `${parentScreenTimeGrantDailyPlanGuardReport.totals.allowedSessionCount} allowed and ${parentScreenTimeGrantDailyPlanGuardReport.totals.blockedSessionCount} blocked learning session evidence rows trace parent -> child -> course/daily plan -> rule -> result.`,
    },
    {
      sliceKey: 'SESSION_COMPLETION_PRACTICE_ROLLUP',
      sliceName: 'Learning session completion practice rollup',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report',
      jsonExportPath:
        'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.json',
      markdownExportPath:
        'exports/learning-local-demo-learning-session-completion-practice-progress-rollup-report.md',
      primaryMetricLabel: 'Progress rollups',
      primaryMetricValue:
        learningSessionCompletionPracticeProgressRollupReport.totals
          .progressRollupCount,
      secondaryMetricLabel: 'Parent summaries',
      secondaryMetricValue:
        learningSessionCompletionPracticeProgressRollupReport.totals
          .parentVisibleProgressSummaryCount,
      coverageLabel: 'Stable traces',
      coverageValue:
        learningSessionCompletionPracticeProgressRollupReport.totals
          .stableTraceCount,
      riskNote:
        'Completion, practice, parent summary, and teacher summary rows are read-only fixture evidence only.',
      evidenceSummary: `${learningSessionCompletionPracticeProgressRollupReport.totals.progressRollupCount} allowed daily plan sessions roll up lesson/video completion, practice score, and progress evidence into ${learningSessionCompletionPracticeProgressRollupReport.totals.parentVisibleProgressSummaryCount} parent and ${learningSessionCompletionPracticeProgressRollupReport.totals.teacherVisibleProgressSummaryCount} teacher summaries.`,
    },
    {
      sliceKey: 'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN',
      sliceName: 'Teacher intervention remedial support plan',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report',
      jsonExportPath:
        'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
      markdownExportPath:
        'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.md',
      primaryMetricLabel: 'Teacher reviews',
      primaryMetricValue:
        teacherInterventionRemedialAssignmentSupportPlanReport.totals
          .teacherInterventionReviewCount,
      secondaryMetricLabel: 'Support plans',
      secondaryMetricValue:
        teacherInterventionRemedialAssignmentSupportPlanReport.totals
          .supportPlanCount,
      coverageLabel: 'Stable traces',
      coverageValue:
        teacherInterventionRemedialAssignmentSupportPlanReport.totals
          .stableTraceCount,
      riskNote:
        'Teacher interventions, remedial assignments, support plans, parent summaries, and teacher next actions are read-only fixture evidence only.',
      evidenceSummary: `${teacherInterventionRemedialAssignmentSupportPlanReport.totals.needsSupportProgressRollupCount} needs-support progress rollup creates ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.teacherInterventionReviewCount} teacher review, ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.remedialAssignmentCount} remedial assignment, ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.supportPlanCount} support plan, ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.parentVisibleSupportSummaryCount} parent summary, and ${teacherInterventionRemedialAssignmentSupportPlanReport.totals.teacherVisibleNextActionCount} teacher next action.`,
    },
    {
      sliceKey: 'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP',
      sliceName: 'Remedial retry completion support outcome follow-up',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report',
      jsonExportPath:
        'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.json',
      markdownExportPath:
        'exports/learning-local-demo-remedial-retry-completion-support-outcome-followup-summary-report.md',
      primaryMetricLabel: 'Retry completions',
      primaryMetricValue:
        remedialRetryCompletionSupportOutcomeFollowupReport.totals
          .remedialRetryCompletionCount,
      secondaryMetricLabel: 'Support outcomes',
      secondaryMetricValue:
        remedialRetryCompletionSupportOutcomeFollowupReport.totals
          .supportOutcomeEvidenceCount,
      coverageLabel: 'Stable traces',
      coverageValue:
        remedialRetryCompletionSupportOutcomeFollowupReport.totals
          .stableTraceCount,
      riskNote:
        'Retry completions, support outcomes, and parent/teacher follow-up summaries are read-only fixture evidence only.',
      evidenceSummary: `${remedialRetryCompletionSupportOutcomeFollowupReport.totals.remedialRetryCompletionCount} remedial retry completion links ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.supportPlanReferenceCount} support plan, ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.supportOutcomeEvidenceCount} support outcome, ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.parentVisibleFollowupSummaryCount} parent follow-up summary, and ${remedialRetryCompletionSupportOutcomeFollowupReport.totals.teacherVisibleFollowupSummaryCount} teacher follow-up summary.`,
    },
    {
      sliceKey: 'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION',
      sliceName: 'Remedial retry unresolved support escalation',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report',
      jsonExportPath:
        'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.json',
      markdownExportPath:
        'exports/learning-local-demo-remedial-retry-unresolved-support-escalation-report.md',
      primaryMetricLabel: 'Unresolved retry attempts',
      primaryMetricValue:
        remedialRetryUnresolvedSupportEscalationReport.totals
          .remedialRetryAttemptCount,
      secondaryMetricLabel: 'Teacher escalations',
      secondaryMetricValue:
        remedialRetryUnresolvedSupportEscalationReport.totals
          .teacherEscalationCount,
      coverageLabel: 'Stable traces',
      coverageValue:
        remedialRetryUnresolvedSupportEscalationReport.totals.stableTraceCount,
      riskNote:
        'Unresolved retry attempts, support outcomes, teacher escalations, support adjustments, parent summaries, and teacher next actions are read-only fixture evidence only.',
      evidenceSummary: `${remedialRetryUnresolvedSupportEscalationReport.totals.remedialRetryAttemptCount} incomplete or failed remedial retry links ${remedialRetryUnresolvedSupportEscalationReport.totals.supportPlanReferenceCount} support plan, ${remedialRetryUnresolvedSupportEscalationReport.totals.unresolvedSupportOutcomeCount} unresolved outcome, ${remedialRetryUnresolvedSupportEscalationReport.totals.teacherEscalationCount} teacher escalation, ${remedialRetryUnresolvedSupportEscalationReport.totals.parentVisibleEscalationSummaryCount} parent escalation summary, and ${remedialRetryUnresolvedSupportEscalationReport.totals.teacherVisibleEscalationNextActionCount} teacher next action.`,
    },
    {
      sliceKey: 'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION',
      sliceName: 'Teacher escalation follow-up resolution',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/teacher-escalation-followup-resolution-report',
      jsonExportPath:
        'exports/learning-local-demo-teacher-escalation-followup-resolution-report.json',
      markdownExportPath:
        'exports/learning-local-demo-teacher-escalation-followup-resolution-report.md',
      primaryMetricLabel: 'Resolved follow-ups',
      primaryMetricValue:
        teacherEscalationFollowupResolutionReport.totals
          .resolvedSupportOutcomeCount,
      secondaryMetricLabel: 'Adjusted retry completions',
      secondaryMetricValue:
        teacherEscalationFollowupResolutionReport.totals
          .adjustedSupportRetryCompletionCount,
      coverageLabel: 'Stable traces',
      coverageValue:
        teacherEscalationFollowupResolutionReport.totals.stableTraceCount,
      riskNote:
        'Teacher-reviewed escalation resolution, adjusted retry completion, parent closure summaries, and teacher closure notes are read-only fixture evidence only.',
      evidenceSummary: `${teacherEscalationFollowupResolutionReport.totals.unresolvedEscalationReferenceCount} unresolved escalation reference links ${teacherEscalationFollowupResolutionReport.totals.teacherReviewedEscalationCount} teacher review, ${teacherEscalationFollowupResolutionReport.totals.adjustedSupportRetryCompletionCount} adjusted retry completion, ${teacherEscalationFollowupResolutionReport.totals.resolvedSupportOutcomeCount} resolved outcome, ${teacherEscalationFollowupResolutionReport.totals.parentVisibleClosureSummaryCount} parent closure summary, and ${teacherEscalationFollowupResolutionReport.totals.teacherVisibleClosureNoteCount} teacher closure note.`,
    },
    {
      sliceKey: 'MVP_END_TO_END_READINESS_TRACE',
      sliceName: 'MVP end-to-end readiness trace',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report',
      jsonExportPath:
        'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
      markdownExportPath:
        'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.md',
      primaryMetricLabel: 'Stable traces',
      primaryMetricValue:
        mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount,
      secondaryMetricLabel: 'Resolution evidence',
      secondaryMetricValue:
        mvpEndToEndReadinessTraceReport.totals
          .escalationResolutionEvidenceCount,
      coverageLabel: 'Safety gates closed',
      coverageValue:
        mvpEndToEndReadinessTraceReport.totals.closedSafetyGateCount,
      riskNote:
        'End-to-end readiness is a local-demo evidence trace only; no production orchestration, provider call, notification send, scheduler, or live learner mutation is used.',
      evidenceSummary: `${mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount} stable end-to-end trace links enrollment/subscription, entitlement, practice progress, reporting/privacy, inbox read/ack evidence, screen-time guard, teacher intervention, remedial escalation, and teacher escalation resolution.`,
    },
    {
      sliceKey: 'MVP_ROLE_JOURNEY_ENTRYPOINTS',
      sliceName: 'MVP role journey entrypoints',
      readinessStatus: 'LOCAL_DEMO_READY_WITH_NOTES',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/mvp-role-journey-entrypoints-report',
      jsonExportPath:
        'exports/learning-local-demo-mvp-role-journey-entrypoints-report.json',
      markdownExportPath:
        'exports/learning-local-demo-mvp-role-journey-entrypoints-report.md',
      primaryMetricLabel: 'Role entrypoints',
      primaryMetricValue:
        mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount,
      secondaryMetricLabel: 'Stable role traces',
      secondaryMetricValue:
        mvpRoleJourneyEntrypointsReport.totals.stableRoleJourneyTraceCount,
      coverageLabel: 'Same-path rows',
      coverageValue:
        mvpRoleJourneyEntrypointsReport.totals.sameStudentCoursePathCount,
      riskNote:
        'Role entrypoints are local-demo navigation evidence only; no production route state, authorization mutation, provider call, notification send, scheduler, or live learner mutation is used.',
      evidenceSummary: `${mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount} role entrypoints link student, parent, teacher, and admin/operator journeys to ${mvpRoleJourneyEntrypointsReport.totals.stableRoleJourneyTraceCount} stable Minh/course A1 trace with ${mvpRoleJourneyEntrypointsReport.totals.openSafetyGateCount} open safety gates.`,
    },
    {
      sliceKey: 'AI_TUTOR_EVIDENCE',
      sliceName: 'AI tutor safety evidence',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/ai-tutor-chat-safety-teacher-review-report',
      jsonExportPath:
        'exports/learning-local-demo-ai-tutor-chat-safety-teacher-review-report.json',
      markdownExportPath:
        'exports/learning-local-demo-ai-tutor-chat-safety-teacher-review-report.md',
      primaryMetricLabel: 'Chat sessions',
      primaryMetricValue:
        aiTutorChatSafetyTeacherReviewReport.totals.chatSessionCount,
      secondaryMetricLabel: 'Safety flags',
      secondaryMetricValue:
        aiTutorChatSafetyTeacherReviewReport.totals.safetyFlagCount,
      coverageLabel: 'Teacher reviews',
      coverageValue:
        aiTutorChatSafetyTeacherReviewReport.totals.teacherReviewItemCount,
      riskNote:
        'No AI provider execution is used; messages and guard decisions are fixture rows.',
      evidenceSummary: `${aiTutorChatSafetyTeacherReviewReport.totals.chatSessionCount} chat sessions, ${aiTutorChatSafetyTeacherReviewReport.totals.blockedMessageCount} blocked messages, and ${aiTutorChatSafetyTeacherReviewReport.totals.supportRecommendationCount} support recommendations.`,
    },
    {
      sliceKey: 'ACHIEVEMENTS',
      sliceName: 'Achievements and certificates',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/student-achievement-badge-certificate-report',
      jsonExportPath:
        'exports/learning-local-demo-student-achievement-badge-certificate-report.json',
      markdownExportPath:
        'exports/learning-local-demo-student-achievement-badge-certificate-report.md',
      primaryMetricLabel: 'Achievement records',
      primaryMetricValue:
        studentAchievementBadgeCertificateReport.totals.achievementRecords,
      secondaryMetricLabel: 'Badge awards',
      secondaryMetricValue:
        studentAchievementBadgeCertificateReport.totals.badgeAwards,
      coverageLabel: 'Certificate fixtures',
      coverageValue:
        studentAchievementBadgeCertificateReport.totals.certificateFixtures,
      riskNote:
        'Certificates are previews only; no credential issuer or notification provider is called.',
      evidenceSummary: `${studentAchievementBadgeCertificateReport.totals.achievementRecords} achievement rows, ${studentAchievementBadgeCertificateReport.totals.badgeAwards} badges, and ${studentAchievementBadgeCertificateReport.totals.certificateFixtures} certificate fixtures.`,
    },
    {
      sliceKey: 'WEEKLY_DIGEST',
      sliceName: 'Parent and teacher weekly digest',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/parent-teacher-weekly-digest-report',
      jsonExportPath:
        'exports/learning-local-demo-parent-teacher-weekly-digest-report.json',
      markdownExportPath:
        'exports/learning-local-demo-parent-teacher-weekly-digest-report.md',
      primaryMetricLabel: 'Weekly digests',
      primaryMetricValue: parentTeacherWeeklyDigestReport.totals.digestCount,
      secondaryMetricLabel: 'Digest actions',
      secondaryMetricValue: parentTeacherWeeklyDigestReport.totals.actionCount,
      coverageLabel: 'Students covered',
      coverageValue: parentTeacherWeeklyDigestReport.totals.studentsCovered,
      riskNote:
        'Digest delivery is readiness evidence only; no notification provider send is executed.',
      evidenceSummary: `${parentTeacherWeeklyDigestReport.totals.digestCount} digests include ${parentTeacherWeeklyDigestReport.totals.actionCount} actions and ${parentTeacherWeeklyDigestReport.totals.readyToSendDigestCount} ready-to-send rows.`,
    },
    {
      sliceKey: 'FOLLOW_UP_OUTCOMES',
      sliceName: 'Follow-up outcomes',
      readinessStatus: 'LOCAL_DEMO_READY',
      productionReady: false,
      fixtureOnly: true,
      safetyClosed: true,
      sourceEndpointPath:
        '/v1/learning-local-demo/followup-action-outcome-report',
      jsonExportPath:
        'exports/learning-local-demo-followup-action-outcome-report.json',
      markdownExportPath:
        'exports/learning-local-demo-followup-action-outcome-report.md',
      primaryMetricLabel: 'Follow-up outcomes',
      primaryMetricValue: followUpActionOutcomeReport.totals.outcomeCount,
      secondaryMetricLabel: 'Done or verified',
      secondaryMetricValue:
        followUpActionOutcomeReport.totals.completedOutcomeCount +
        followUpActionOutcomeReport.totals.verifiedOutcomeCount,
      coverageLabel: 'Students covered',
      coverageValue: followUpActionOutcomeReport.totals.studentsCovered,
      riskNote:
        'Outcomes are report rows only; parent messages, teacher interventions, and follow-up mutations are disabled.',
      evidenceSummary: `${followUpActionOutcomeReport.totals.outcomeCount} outcomes link ${followUpActionOutcomeReport.totals.linkedDailyPlanCount} daily plans and ${followUpActionOutcomeReport.totals.linkedSupportRecommendationCount} support recommendations.`,
    },
  ];
  const statusCounts = {
    readinessStatus: countByStatus(
      mvpReadinessOverviewStatuses,
      rows,
      (row) => row.readinessStatus,
    ),
  };
  const readyOrReadyWithNotesCount =
    statusCounts.readinessStatus.LOCAL_DEMO_READY +
    statusCounts.readinessStatus.LOCAL_DEMO_READY_WITH_NOTES;
  const safetyEntries = Object.entries(safety);
  const openSafetyGateCount = safetyEntries.filter(([gate, value]) => {
    if (gate === 'fixtureOnly' || gate === 'noProductionDbRead') {
      return value !== true;
    }

    return value !== false;
  }).length;
  const safetyGateCount = safetyEntries.length;

  return {
    reportName: 'Learning local demo MVP Readiness Overview Report',
    generatedFor: 'local-demo-mvp-readiness-overview-report',
    generatedAt,
    currency: fixture.currency,
    productionReady: false,
    safety,
    totals: {
      sliceCount: rows.length,
      localDemoReadySliceCount: statusCounts.readinessStatus.LOCAL_DEMO_READY,
      localDemoReadyWithNotesSliceCount:
        statusCounts.readinessStatus.LOCAL_DEMO_READY_WITH_NOTES,
      needsLocalDemoFixSliceCount:
        statusCounts.readinessStatus.NEEDS_LOCAL_DEMO_FIX,
      productionReadySliceCount: 0,
      fixtureOnlySliceCount: rows.length,
      safetyClosedSliceCount: rows.filter((row) => row.safetyClosed).length,
      evidenceEndpointCount: new Set(rows.map((row) => row.sourceEndpointPath))
        .size,
      jsonExportCount: new Set(rows.map((row) => row.jsonExportPath)).size,
      markdownExportCount: new Set(rows.map((row) => row.markdownExportPath))
        .size,
      readinessScorePercent: percent(readyOrReadyWithNotesCount, rows.length),
      safetyGateCount,
      closedSafetyGateCount: safetyGateCount - openSafetyGateCount,
      openSafetyGateCount,
      studentCount: enrollmentReport.totals.studentCount,
      courseCount: enrollmentReport.totals.courseCount,
      enrollmentCount: enrollmentReport.totals.enrollmentCount,
      activeEnrollmentCount: enrollmentReport.totals.activeEnrollmentCount,
      subscriptionCount: enrollmentReport.totals.subscriptionCount,
      refundCount: enrollmentReport.totals.refundCount,
      commissionCount: enrollmentReport.totals.commissionCount,
      dailyPlanCount: learningPathReport.totals.dailyPlanCount,
      completedDailyPlanCount:
        learningPathReport.totals.completedDailyPlanCount,
      lessonCount: lessonAssignmentReport.totals.lessonCount,
      assignmentCount: lessonAssignmentReport.totals.assignmentCount,
      progressRecordCount: progressReport.totals.progressRecordCount,
      needsSupportLearnerCount:
        lessonAssignmentReport.totals.needsSupportLearnerCount,
      aiTutorChatSessionCount:
        aiTutorChatSafetyTeacherReviewReport.totals.chatSessionCount,
      aiTutorSafetyFlagCount:
        aiTutorChatSafetyTeacherReviewReport.totals.safetyFlagCount,
      achievementRecordCount:
        studentAchievementBadgeCertificateReport.totals.achievementRecords,
      badgeAwardCount:
        studentAchievementBadgeCertificateReport.totals.badgeAwards,
      teacherInterventionReviewCount:
        teacherInterventionRemedialAssignmentSupportPlanReport.totals
          .teacherInterventionReviewCount,
      remedialAssignmentCount:
        teacherInterventionRemedialAssignmentSupportPlanReport.totals
          .remedialAssignmentCount,
      supportPlanCount:
        teacherInterventionRemedialAssignmentSupportPlanReport.totals
          .supportPlanCount,
      remedialRetryCompletionCount:
        remedialRetryCompletionSupportOutcomeFollowupReport.totals
          .remedialRetryCompletionCount,
      supportOutcomeEvidenceCount:
        remedialRetryCompletionSupportOutcomeFollowupReport.totals
          .supportOutcomeEvidenceCount,
      remedialRetryUnresolvedAttemptCount:
        remedialRetryUnresolvedSupportEscalationReport.totals
          .remedialRetryAttemptCount,
      unresolvedSupportOutcomeCount:
        remedialRetryUnresolvedSupportEscalationReport.totals
          .unresolvedSupportOutcomeCount,
      teacherEscalationCount:
        remedialRetryUnresolvedSupportEscalationReport.totals
          .teacherEscalationCount,
      parentVisibleEscalationSummaryCount:
        remedialRetryUnresolvedSupportEscalationReport.totals
          .parentVisibleEscalationSummaryCount,
      teacherVisibleEscalationNextActionCount:
        remedialRetryUnresolvedSupportEscalationReport.totals
          .teacherVisibleEscalationNextActionCount,
      teacherReviewedEscalationCount:
        teacherEscalationFollowupResolutionReport.totals
          .teacherReviewedEscalationCount,
      adjustedSupportRetryCompletionCount:
        teacherEscalationFollowupResolutionReport.totals
          .adjustedSupportRetryCompletionCount,
      resolvedSupportOutcomeCount:
        teacherEscalationFollowupResolutionReport.totals
          .resolvedSupportOutcomeCount,
      parentVisibleClosureSummaryCount:
        teacherEscalationFollowupResolutionReport.totals
          .parentVisibleClosureSummaryCount,
      teacherVisibleClosureNoteCount:
        teacherEscalationFollowupResolutionReport.totals
          .teacherVisibleClosureNoteCount,
      stableEndToEndTraceCount:
        mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount,
      weeklyDigestCount: parentTeacherWeeklyDigestReport.totals.digestCount,
      weeklyDigestActionCount:
        parentTeacherWeeklyDigestReport.totals.actionCount,
      followUpOutcomeCount: followUpActionOutcomeReport.totals.outcomeCount,
    },
    statusCounts,
    rows,
  };
}

export function toMvpReadinessOverviewMarkdown(
  report: DemoLearningMvpReadinessOverviewReport,
) {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    'Overview endpoint: /v1/learning-local-demo/mvp-readiness-overview-report',
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
    `- Local-demo ready slices: ${report.totals.localDemoReadySliceCount}`,
    `- Needs local-demo fix slices: ${report.totals.needsLocalDemoFixSliceCount}`,
    `- Production-ready slices: ${report.totals.productionReadySliceCount}`,
    `- Readiness score: ${report.totals.readinessScorePercent}%`,
    `- Evidence endpoints: ${report.totals.evidenceEndpointCount}`,
    `- JSON exports: ${report.totals.jsonExportCount}`,
    `- Markdown exports: ${report.totals.markdownExportCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Students: ${report.totals.studentCount}`,
    `- Enrollments: ${report.totals.enrollmentCount}`,
    `- Subscriptions: ${report.totals.subscriptionCount}`,
    `- Refund rows: ${report.totals.refundCount}`,
    `- Commission rows: ${report.totals.commissionCount}`,
    `- Daily plans: ${report.totals.dailyPlanCount}`,
    `- Lessons: ${report.totals.lessonCount}`,
    `- Assignments: ${report.totals.assignmentCount}`,
    `- Progress records: ${report.totals.progressRecordCount}`,
    `- AI tutor chat sessions: ${report.totals.aiTutorChatSessionCount}`,
    `- Achievement records: ${report.totals.achievementRecordCount}`,
    `- Teacher intervention reviews: ${report.totals.teacherInterventionReviewCount}`,
    `- Remedial assignments: ${report.totals.remedialAssignmentCount}`,
    `- Support plans: ${report.totals.supportPlanCount}`,
    `- Remedial retry completions: ${report.totals.remedialRetryCompletionCount}`,
    `- Support outcome evidence rows: ${report.totals.supportOutcomeEvidenceCount}`,
    `- Unresolved remedial retry attempts: ${report.totals.remedialRetryUnresolvedAttemptCount}`,
    `- Unresolved support outcome rows: ${report.totals.unresolvedSupportOutcomeCount}`,
    `- Teacher escalations: ${report.totals.teacherEscalationCount}`,
    `- Parent escalation summaries: ${report.totals.parentVisibleEscalationSummaryCount}`,
    `- Teacher escalation next actions: ${report.totals.teacherVisibleEscalationNextActionCount}`,
    `- Teacher-reviewed escalations: ${report.totals.teacherReviewedEscalationCount}`,
    `- Adjusted retry completions: ${report.totals.adjustedSupportRetryCompletionCount}`,
    `- Resolved support outcomes: ${report.totals.resolvedSupportOutcomeCount}`,
    `- Parent closure summaries: ${report.totals.parentVisibleClosureSummaryCount}`,
    `- Teacher closure notes: ${report.totals.teacherVisibleClosureNoteCount}`,
    `- Stable end-to-end traces: ${report.totals.stableEndToEndTraceCount}`,
    `- Weekly digests: ${report.totals.weeklyDigestCount}`,
    `- Follow-up outcomes: ${report.totals.followUpOutcomeCount}`,
    '',
    '## MVP Readiness Rows',
    '',
    '| Slice | Status | Primary metric | Secondary metric | Coverage | Endpoint | Exports | Evidence | Risk note |',
    '| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |',
    ...report.rows.map(
      (row) =>
        `| ${[
          `${row.sliceName} (${row.sliceKey})`,
          row.readinessStatus,
          `${row.primaryMetricValue} ${row.primaryMetricLabel}`,
          `${row.secondaryMetricValue} ${row.secondaryMetricLabel}`,
          `${row.coverageValue} ${row.coverageLabel}`,
          row.sourceEndpointPath,
          `${row.jsonExportPath}; ${row.markdownExportPath}`,
          row.evidenceSummary,
          row.riskNote,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
}
