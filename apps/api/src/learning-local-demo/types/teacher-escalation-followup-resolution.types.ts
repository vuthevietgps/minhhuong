import type { DemoLearningRemedialRetryUnresolvedSupportEscalationSafety } from './remedial-retry-unresolved-support-escalation.types';
import type {
  DemoLearningAdjustedSupportRetryCompletionStatus,
  DemoLearningCurrency,
  DemoLearningRemedialRetryUnresolvedAttemptStatus,
  DemoLearningResolvedSupportOutcomeReasonCode,
  DemoLearningResolvedSupportOutcomeStatus,
  DemoLearningTeacherReviewedEscalationStatus,
  DemoLearningUnresolvedSupportOutcomeReasonCode,
  DemoLearningUnresolvedSupportOutcomeStatus,
} from './shared-statuses.types';

export type DemoLearningTeacherEscalationFollowupResolution = {
  id: string;
  studentId: string;
  unresolvedRetryAttemptId: string;
  unresolvedOutcomeId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  teacherReviewedEscalationId: string;
  teacherReviewedEscalationStatus: DemoLearningTeacherReviewedEscalationStatus;
  teacherReviewedAt: string;
  adjustedSupportRetryCompletionId: string;
  adjustedSupportRetryStatus: DemoLearningAdjustedSupportRetryCompletionStatus;
  completedAt: string;
  completionPercent: number;
  scorePercent: number;
  resolvedSupportOutcomeId: string;
  resolvedSupportOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  resolvedOutcomeAt: string;
  parentClosureSummaryId: string;
  teacherClosureNoteId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  evidenceSummary: string;
  teacherReviewSummary: string;
  adjustedRetryCompletionSummary: string;
  resolvedOutcomeSummary: string;
  parentClosureSummary: string;
  teacherClosureNoteSummary: string;
  fixtureResolutionSource: 'fixture_teacher_escalation_followup_resolution_report';
};

export type DemoLearningTeacherEscalationFollowupResolutionSafety =
  DemoLearningRemedialRetryUnresolvedSupportEscalationSafety & {
    realTeacherReviewedEscalationMutationUsed: false;
    realAdjustedSupportRetryCompletionMutationUsed: false;
    realResolvedSupportOutcomeMutationUsed: false;
    realParentClosureSummaryMutationUsed: false;
    realTeacherClosureNoteMutationUsed: false;
  };

export type DemoLearningTeacherEscalationFollowupResolutionStatusCounts = {
  teacherReviewedEscalationStatus: Record<
    DemoLearningTeacherReviewedEscalationStatus,
    number
  >;
  adjustedSupportRetryStatus: Record<
    DemoLearningAdjustedSupportRetryCompletionStatus,
    number
  >;
  resolvedOutcomeStatus: Record<
    DemoLearningResolvedSupportOutcomeStatus,
    number
  >;
  resolvedOutcomeReasonCode: Record<
    DemoLearningResolvedSupportOutcomeReasonCode,
    number
  >;
};

export type DemoLearningTeacherEscalationFollowupResolutionTotals = {
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  unresolvedEscalationReferenceCount: number;
  teacherReviewedEscalationCount: number;
  adjustedSupportRetryCompletionCount: number;
  resolvedSupportOutcomeCount: number;
  parentVisibleClosureSummaryCount: number;
  teacherVisibleClosureNoteCount: number;
  safeNextActionCount: number;
  stableTraceCount: number;
  resolvedFlowLinksCompleteCount: number;
  outcomesWithDeterministicStatusReasonActionCount: number;
  adjustedRetriesWithDeterministicStatusScoreCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningTeacherEscalationFollowupResolutionRow = {
  resolutionId: string;
  stableTraceKey: string;
  stableTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  learningPathId: string;
  progressRollupId: string;
  interventionReviewId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialDailyPlanTitle: string;
  remedialPracticeAttemptId: string;
  remedialLessonCode: string;
  unresolvedRetryAttemptId: string;
  unresolvedRetryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeId: string;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  unresolvedReasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  teacherReviewedEscalationId: string;
  teacherReviewedEscalationStatus: DemoLearningTeacherReviewedEscalationStatus;
  teacherReviewedAt: string;
  adjustedSupportRetryCompletionId: string;
  adjustedSupportRetryStatus: DemoLearningAdjustedSupportRetryCompletionStatus;
  completedAt: string;
  completionPercent: number;
  scorePercent: number;
  resolvedSupportOutcomeId: string;
  resolvedSupportOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  resolvedOutcomeAt: string;
  parentClosureSummaryId: string;
  teacherClosureNoteId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
  teacherReviewSummary: string;
  adjustedRetryCompletionSummary: string;
  resolvedOutcomeSummary: string;
  parentClosureSummary: string;
  teacherClosureNoteSummary: string;
};

export type DemoLearningTeacherReviewedEscalationRow = {
  teacherReviewedEscalationId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  unresolvedOutcomeId: string;
  unresolvedRetryAttemptId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseCode: string;
  classCode: string;
  reviewStatus: DemoLearningTeacherReviewedEscalationStatus;
  reviewedAt: string;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningAdjustedSupportRetryCompletionRow = {
  adjustedSupportRetryCompletionId: string;
  teacherReviewedEscalationId: string;
  supportAdjustmentId: string;
  unresolvedRetryAttemptId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherName: string;
  courseCode: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialPracticeAttemptId: string;
  retryStatus: DemoLearningAdjustedSupportRetryCompletionStatus;
  completedAt: string;
  scorePercent: number;
  completionPercent: number;
  resolvedSupportOutcomeId: string;
  safeNextActionLabel: string;
  summary: string;
};

export type DemoLearningResolvedSupportOutcomeEvidenceRow = {
  resolvedSupportOutcomeId: string;
  adjustedSupportRetryCompletionId: string;
  teacherReviewedEscalationId: string;
  unresolvedOutcomeId: string;
  supportAdjustmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseCode: string;
  status: DemoLearningResolvedSupportOutcomeStatus;
  reasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  outcomeAt: string;
  parentClosureSummaryId: string;
  teacherClosureNoteId: string;
  safeNextActionLabel: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  outcomeSummary: string;
};

export type DemoLearningParentVisibleClosureSummaryRow = {
  parentClosureSummaryId: string;
  resolvedSupportOutcomeId: string;
  adjustedSupportRetryCompletionId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  resolvedOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleClosureNoteRow = {
  teacherClosureNoteId: string;
  resolvedSupportOutcomeId: string;
  adjustedSupportRetryCompletionId: string;
  teacherReviewedEscalationId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  resolvedOutcomeStatus: DemoLearningResolvedSupportOutcomeStatus;
  resolvedOutcomeReasonCode: DemoLearningResolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningTeacherEscalationFollowupResolutionEvidenceRow = {
  evidenceKind:
    | 'UNRESOLVED_ESCALATION_REFERENCE'
    | 'TEACHER_REVIEWED_ESCALATION'
    | 'ADJUSTED_SUPPORT_RETRY_COMPLETION'
    | 'RESOLVED_SUPPORT_OUTCOME'
    | 'PARENT_VISIBLE_CLOSURE_SUMMARY'
    | 'TEACHER_VISIBLE_CLOSURE_NOTE'
    | 'SAFE_NEXT_ACTION'
    | 'STABLE_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningTeacherEscalationFollowupResolutionReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningTeacherEscalationFollowupResolutionSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningTeacherEscalationFollowupResolutionTotals;
  statusCounts: DemoLearningTeacherEscalationFollowupResolutionStatusCounts;
  resolutionRows: DemoLearningTeacherEscalationFollowupResolutionRow[];
  teacherReviewedEscalationRows: DemoLearningTeacherReviewedEscalationRow[];
  adjustedSupportRetryCompletionRows: DemoLearningAdjustedSupportRetryCompletionRow[];
  resolvedSupportOutcomeRows: DemoLearningResolvedSupportOutcomeEvidenceRow[];
  parentClosureSummaryRows: DemoLearningParentVisibleClosureSummaryRow[];
  teacherClosureNoteRows: DemoLearningTeacherVisibleClosureNoteRow[];
  evidenceRows: DemoLearningTeacherEscalationFollowupResolutionEvidenceRow[];
};
