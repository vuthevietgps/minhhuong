import type {
  DemoLearningCurrency,
  DemoLearningRemedialRetryCompletionStatus,
  DemoLearningSupportOutcomeEvidenceStatus,
} from './shared-statuses.types';
import type { DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety } from './teacher-intervention-remedial-assignment-support-plan.types';

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety =
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety & {
    realRemedialRetryCompletionMutationUsed: false;
    realSupportOutcomeEvidenceMutationUsed: false;
    realParentFollowupSummaryMutationUsed: false;
    realTeacherFollowupSummaryMutationUsed: false;
  };

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts =
  {
    retryStatus: Record<DemoLearningRemedialRetryCompletionStatus, number>;
    supportOutcomeStatus: Record<
      DemoLearningSupportOutcomeEvidenceStatus,
      number
    >;
  };

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupTotals = {
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  supportPlanReferenceCount: number;
  remedialAssignmentReferenceCount: number;
  remedialRetryCompletionCount: number;
  supportOutcomeEvidenceCount: number;
  parentVisibleFollowupSummaryCount: number;
  teacherVisibleFollowupSummaryCount: number;
  safeNextActionCount: number;
  stableTraceCount: number;
  retryLinksCompleteCount: number;
  outcomesWithDeterministicStatusCount: number;
  retriesWithDeterministicStatusScoreCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningRemedialRetryCompletionRow = {
  retryCompletionId: string;
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
  retryStatus: DemoLearningRemedialRetryCompletionStatus;
  completedAt: string;
  completionPercent: number;
  scorePercent: number;
  supportOutcomeId: string;
  supportOutcomeStatus: DemoLearningSupportOutcomeEvidenceStatus;
  supportOutcomeAt: string;
  parentFollowupSummaryId: string;
  teacherFollowupSummaryId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
  outcomeSummary: string;
  parentFollowupSummary: string;
  teacherFollowupSummary: string;
};

export type DemoLearningSupportOutcomeEvidenceRow = {
  supportOutcomeId: string;
  retryCompletionId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseCode: string;
  status: DemoLearningSupportOutcomeEvidenceStatus;
  scorePercent: number;
  completionPercent: number;
  outcomeAt: string;
  parentFollowupSummaryId: string;
  teacherFollowupSummaryId: string;
  safeNextActionLabel: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  outcomeSummary: string;
};

export type DemoLearningParentVisibleFollowupSummaryRow = {
  parentFollowupSummaryId: string;
  supportOutcomeId: string;
  retryCompletionId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryCompletionStatus;
  supportOutcomeStatus: DemoLearningSupportOutcomeEvidenceStatus;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleFollowupSummaryRow = {
  teacherFollowupSummaryId: string;
  supportOutcomeId: string;
  retryCompletionId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryCompletionStatus;
  supportOutcomeStatus: DemoLearningSupportOutcomeEvidenceStatus;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow =
  {
    evidenceKind:
      | 'SUPPORT_PLAN_REFERENCE'
      | 'REMEDIAL_ASSIGNMENT_REFERENCE'
      | 'REMEDIAL_RETRY_COMPLETION'
      | 'SUPPORT_OUTCOME_EVIDENCE'
      | 'PARENT_VISIBLE_FOLLOWUP_SUMMARY'
      | 'TEACHER_VISIBLE_FOLLOWUP_SUMMARY'
      | 'STABLE_TRACE'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport = {
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
  safety: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupTotals;
  statusCounts: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupStatusCounts;
  retryCompletionRows: DemoLearningRemedialRetryCompletionRow[];
  supportOutcomeRows: DemoLearningSupportOutcomeEvidenceRow[];
  parentFollowupSummaryRows: DemoLearningParentVisibleFollowupSummaryRow[];
  teacherFollowupSummaryRows: DemoLearningTeacherVisibleFollowupSummaryRow[];
  evidenceRows: DemoLearningRemedialRetryCompletionSupportOutcomeFollowupEvidenceRow[];
};
