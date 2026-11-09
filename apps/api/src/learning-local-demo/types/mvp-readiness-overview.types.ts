import type { DemoLearningFollowUpActionOutcomeReport } from './follow-up-action-outcome.types';
import type { DemoLearningCurrency } from './shared-statuses.types';

export type DemoLearningMvpReadinessOverviewStatus =
  'LOCAL_DEMO_READY' | 'LOCAL_DEMO_READY_WITH_NOTES' | 'NEEDS_LOCAL_DEMO_FIX';

export type DemoLearningMvpReadinessOverviewSliceKey =
  | 'ENROLLMENT'
  | 'SUBSCRIPTION_FIXTURE'
  | 'REFUNDS_COMMISSION_FIXTURE'
  | 'DAILY_PLAN'
  | 'LESSON_ASSIGNMENT'
  | 'PROGRESS'
  | 'SESSION_COMPLETION_PRACTICE_ROLLUP'
  | 'TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN'
  | 'REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP'
  | 'REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION'
  | 'TEACHER_ESCALATION_FOLLOWUP_RESOLUTION'
  | 'MVP_END_TO_END_READINESS_TRACE'
  | 'MVP_ROLE_JOURNEY_ENTRYPOINTS'
  | 'REPORT_REVIEW_PREVIEW'
  | 'PARENT_PORTAL_INBOX_READ_RECEIPT'
  | 'PARENT_SCREEN_TIME_DAILY_PLAN_GUARD'
  | 'AI_TUTOR_EVIDENCE'
  | 'ACHIEVEMENTS'
  | 'WEEKLY_DIGEST'
  | 'FOLLOW_UP_OUTCOMES';

export type DemoLearningMvpReadinessOverviewStatusCounts = {
  readinessStatus: Record<DemoLearningMvpReadinessOverviewStatus, number>;
};

export type DemoLearningMvpReadinessOverviewTotals = {
  sliceCount: number;
  localDemoReadySliceCount: number;
  localDemoReadyWithNotesSliceCount: number;
  needsLocalDemoFixSliceCount: number;
  productionReadySliceCount: number;
  fixtureOnlySliceCount: number;
  safetyClosedSliceCount: number;
  evidenceEndpointCount: number;
  jsonExportCount: number;
  markdownExportCount: number;
  readinessScorePercent: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
  studentCount: number;
  courseCount: number;
  enrollmentCount: number;
  activeEnrollmentCount: number;
  subscriptionCount: number;
  refundCount: number;
  commissionCount: number;
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  lessonCount: number;
  assignmentCount: number;
  progressRecordCount: number;
  needsSupportLearnerCount: number;
  aiTutorChatSessionCount: number;
  aiTutorSafetyFlagCount: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  teacherInterventionReviewCount: number;
  remedialAssignmentCount: number;
  supportPlanCount: number;
  remedialRetryCompletionCount: number;
  supportOutcomeEvidenceCount: number;
  remedialRetryUnresolvedAttemptCount: number;
  unresolvedSupportOutcomeCount: number;
  teacherEscalationCount: number;
  parentVisibleEscalationSummaryCount: number;
  teacherVisibleEscalationNextActionCount: number;
  teacherReviewedEscalationCount: number;
  adjustedSupportRetryCompletionCount: number;
  resolvedSupportOutcomeCount: number;
  parentVisibleClosureSummaryCount: number;
  teacherVisibleClosureNoteCount: number;
  stableEndToEndTraceCount: number;
  weeklyDigestCount: number;
  weeklyDigestActionCount: number;
  followUpOutcomeCount: number;
};

export type DemoLearningMvpReadinessOverviewRow = {
  sliceKey: DemoLearningMvpReadinessOverviewSliceKey;
  sliceName: string;
  readinessStatus: DemoLearningMvpReadinessOverviewStatus;
  productionReady: false;
  fixtureOnly: true;
  safetyClosed: boolean;
  sourceEndpointPath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  primaryMetricLabel: string;
  primaryMetricValue: number;
  secondaryMetricLabel: string;
  secondaryMetricValue: number;
  coverageLabel: string;
  coverageValue: number;
  riskNote: string;
  evidenceSummary: string;
};

export type DemoLearningMvpReadinessOverviewReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  productionReady: false;
  safety: DemoLearningFollowUpActionOutcomeReport['safety'] & {
    realLearningSessionCompletionMutationUsed: false;
    realParentProgressSummaryMutationUsed: false;
    realTeacherProgressSummaryMutationUsed: false;
    realTeacherInterventionReviewMutationUsed: false;
    realRemedialAssignmentMutationUsed: false;
    realSupportPlanMutationUsed: false;
    realParentSupportSummaryMutationUsed: false;
    realTeacherNextActionMutationUsed: false;
    realRemedialRetryCompletionMutationUsed: false;
    realSupportOutcomeEvidenceMutationUsed: false;
    realParentFollowupSummaryMutationUsed: false;
    realTeacherFollowupSummaryMutationUsed: false;
    realRemedialRetryUnresolvedAttemptMutationUsed: false;
    realUnresolvedSupportOutcomeMutationUsed: false;
    realTeacherEscalationMutationUsed: false;
    realSupportAdjustmentMutationUsed: false;
    realParentEscalationSummaryMutationUsed: false;
    realTeacherEscalationNextActionMutationUsed: false;
    realTeacherReviewedEscalationMutationUsed: false;
    realAdjustedSupportRetryCompletionMutationUsed: false;
    realResolvedSupportOutcomeMutationUsed: false;
    realParentClosureSummaryMutationUsed: false;
    realTeacherClosureNoteMutationUsed: false;
  };
  totals: DemoLearningMvpReadinessOverviewTotals;
  statusCounts: DemoLearningMvpReadinessOverviewStatusCounts;
  rows: DemoLearningMvpReadinessOverviewRow[];
};
