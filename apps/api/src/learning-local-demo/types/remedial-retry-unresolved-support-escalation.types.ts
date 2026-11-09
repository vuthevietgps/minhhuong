import type {
  DemoLearningCurrency,
  DemoLearningRemedialRetryUnresolvedAttemptStatus,
  DemoLearningSupportAdjustmentStatus,
  DemoLearningTeacherEscalationStatus,
  DemoLearningUnresolvedSupportOutcomeReasonCode,
  DemoLearningUnresolvedSupportOutcomeStatus,
} from './shared-statuses.types';
import type { DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety } from './teacher-intervention-remedial-assignment-support-plan.types';

export type DemoLearningRemedialRetryUnresolvedSupportEscalation = {
  id: string;
  studentId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialDailyPlanId: string;
  remedialPracticeAttemptId: string;
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  attemptedAt: string;
  completionPercent: number;
  scorePercent: number;
  unresolvedOutcomeId: string;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  outcomeAt: string;
  teacherEscalationId: string;
  teacherEscalationStatus: DemoLearningTeacherEscalationStatus;
  supportAdjustmentId: string;
  supportAdjustmentStatus: DemoLearningSupportAdjustmentStatus;
  parentEscalationSummaryId: string;
  teacherEscalationNextActionId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  evidenceSummary: string;
  unresolvedOutcomeSummary: string;
  teacherEscalationSummary: string;
  supportAdjustmentSummary: string;
  parentEscalationSummary: string;
  teacherNextActionSummary: string;
  fixtureRetrySource: 'fixture_remedial_retry_unresolved_support_escalation';
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationSafety =
  DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety & {
    realRemedialRetryUnresolvedAttemptMutationUsed: false;
    realUnresolvedSupportOutcomeMutationUsed: false;
    realTeacherEscalationMutationUsed: false;
    realSupportAdjustmentMutationUsed: false;
    realParentEscalationSummaryMutationUsed: false;
    realTeacherEscalationNextActionMutationUsed: false;
  };

export type DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts = {
  retryStatus: Record<DemoLearningRemedialRetryUnresolvedAttemptStatus, number>;
  unresolvedOutcomeStatus: Record<
    DemoLearningUnresolvedSupportOutcomeStatus,
    number
  >;
  reasonCode: Record<DemoLearningUnresolvedSupportOutcomeReasonCode, number>;
  teacherEscalationStatus: Record<DemoLearningTeacherEscalationStatus, number>;
  supportAdjustmentStatus: Record<DemoLearningSupportAdjustmentStatus, number>;
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationTotals = {
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  supportPlanReferenceCount: number;
  remedialAssignmentReferenceCount: number;
  remedialRetryAttemptCount: number;
  failedOrIncompleteRetryCount: number;
  unresolvedSupportOutcomeCount: number;
  teacherEscalationCount: number;
  supportAdjustmentCount: number;
  parentVisibleEscalationSummaryCount: number;
  teacherVisibleEscalationNextActionCount: number;
  safeNextActionCount: number;
  stableTraceCount: number;
  unresolvedRetryLinksCompleteCount: number;
  outcomesWithDeterministicStatusReasonActionCount: number;
  attemptsWithDeterministicStatusScoreCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningRemedialRetryUnresolvedAttemptRow = {
  retryAttemptId: string;
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
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  attemptedAt: string;
  completionPercent: number;
  scorePercent: number;
  unresolvedOutcomeId: string;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  outcomeAt: string;
  teacherEscalationId: string;
  teacherEscalationStatus: DemoLearningTeacherEscalationStatus;
  supportAdjustmentId: string;
  supportAdjustmentStatus: DemoLearningSupportAdjustmentStatus;
  parentEscalationSummaryId: string;
  teacherEscalationNextActionId: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
  unresolvedOutcomeSummary: string;
  teacherEscalationSummary: string;
  supportAdjustmentSummary: string;
  parentEscalationSummary: string;
  teacherNextActionSummary: string;
};

export type DemoLearningUnresolvedSupportOutcomeEvidenceRow = {
  unresolvedOutcomeId: string;
  retryAttemptId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseCode: string;
  status: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  outcomeAt: string;
  teacherEscalationId: string;
  parentEscalationSummaryId: string;
  teacherEscalationNextActionId: string;
  safeNextActionLabel: string;
  parentVisible: boolean;
  teacherVisible: boolean;
  outcomeSummary: string;
};

export type DemoLearningTeacherEscalationSupportAdjustmentRow = {
  teacherEscalationId: string;
  supportAdjustmentId: string;
  unresolvedOutcomeId: string;
  retryAttemptId: string;
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
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  escalationStatus: DemoLearningTeacherEscalationStatus;
  supportAdjustmentStatus: DemoLearningSupportAdjustmentStatus;
  safeNextActionLabel: string;
  teacherVisible: true;
  escalationSummary: string;
  supportAdjustmentSummary: string;
};

export type DemoLearningParentVisibleEscalationSummaryRow = {
  parentEscalationSummaryId: string;
  unresolvedOutcomeId: string;
  retryAttemptId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  scorePercent: number;
  completionPercent: number;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleEscalationNextActionRow = {
  teacherEscalationNextActionId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  unresolvedOutcomeId: string;
  retryAttemptId: string;
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
  retryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeStatus: DemoLearningUnresolvedSupportOutcomeStatus;
  reasonCode: DemoLearningUnresolvedSupportOutcomeReasonCode;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow = {
  evidenceKind:
    | 'SUPPORT_PLAN_REFERENCE'
    | 'REMEDIAL_ASSIGNMENT_REFERENCE'
    | 'FAILED_OR_INCOMPLETE_RETRY'
    | 'UNRESOLVED_SUPPORT_OUTCOME'
    | 'TEACHER_ESCALATION_SUPPORT_ADJUSTMENT'
    | 'PARENT_VISIBLE_ESCALATION_SUMMARY'
    | 'TEACHER_VISIBLE_ESCALATION_NEXT_ACTION'
    | 'STABLE_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningRemedialRetryUnresolvedSupportEscalationReport = {
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
  safety: DemoLearningRemedialRetryUnresolvedSupportEscalationSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningRemedialRetryUnresolvedSupportEscalationTotals;
  statusCounts: DemoLearningRemedialRetryUnresolvedSupportEscalationStatusCounts;
  retryAttemptRows: DemoLearningRemedialRetryUnresolvedAttemptRow[];
  unresolvedOutcomeRows: DemoLearningUnresolvedSupportOutcomeEvidenceRow[];
  teacherEscalationRows: DemoLearningTeacherEscalationSupportAdjustmentRow[];
  parentEscalationSummaryRows: DemoLearningParentVisibleEscalationSummaryRow[];
  teacherEscalationNextActionRows: DemoLearningTeacherVisibleEscalationNextActionRow[];
  evidenceRows: DemoLearningRemedialRetryUnresolvedSupportEscalationEvidenceRow[];
};
