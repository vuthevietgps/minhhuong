import type {
  DemoLearningCurrency,
  DemoLearningSessionCompletionPracticeProgressRollupStatus,
} from './shared-statuses.types';
import type { DemoLearningSessionCompletionPracticeProgressRollupSafety } from './shared.types';

export type DemoLearningTeacherInterventionReviewStatus = 'REVIEWED';

export type DemoLearningRemedialAssignmentFixtureStatus = 'ASSIGNED';

export type DemoLearningSupportPlanFixtureStatus =
  'PARENT_VISIBLE_REVIEW_READY';

export type DemoLearningTeacherNextActionStatus = 'SCHEDULED';

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety =
  DemoLearningSessionCompletionPracticeProgressRollupSafety & {
    realTeacherInterventionReviewMutationUsed: false;
    realRemedialAssignmentMutationUsed: false;
    realSupportPlanMutationUsed: false;
    realParentSupportSummaryMutationUsed: false;
    realTeacherNextActionMutationUsed: false;
  };

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts =
  {
    interventionReviewStatus: Record<
      DemoLearningTeacherInterventionReviewStatus,
      number
    >;
    remedialAssignmentStatus: Record<
      DemoLearningRemedialAssignmentFixtureStatus,
      number
    >;
    supportPlanStatus: Record<DemoLearningSupportPlanFixtureStatus, number>;
    teacherNextActionStatus: Record<
      DemoLearningTeacherNextActionStatus,
      number
    >;
  };

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanTotals =
  {
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    needsSupportProgressRollupCount: number;
    teacherInterventionReviewCount: number;
    remedialAssignmentCount: number;
    supportPlanCount: number;
    parentVisibleSupportSummaryCount: number;
    teacherVisibleNextActionCount: number;
    supportReasonCount: number;
    stableTraceCount: number;
    interventionLinksCompleteCount: number;
    supportPlansWithDeterministicStatusCount: number;
    remedialAssignmentsWithDeterministicStatusCount: number;
    teacherNextActionsWithSafeLabelCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };

export type DemoLearningTeacherInterventionReviewRow = {
  interventionReviewId: string;
  progressRollupId: string;
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
  sourceDailyPlanId: string;
  sourceDailyPlanTitle: string;
  sourceSessionId: string;
  learningSessionEvidenceId: string;
  remedialDailyPlanId: string;
  remedialPracticeAttemptId: string;
  remedialLessonId: string;
  remedialLessonCode: string;
  sourceAssignmentId: string | null;
  progressRecordId: string;
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  completionPercent: number;
  practiceScorePercent: number;
  supportReason: string;
  reviewStatus: DemoLearningTeacherInterventionReviewStatus;
  reviewedAt: string;
  remedialAssignmentId: string;
  supportPlanId: string;
  parentVisibleSupportSummaryId: string;
  teacherVisibleNextActionId: string;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningRemedialAssignmentRow = {
  remedialAssignmentId: string;
  interventionReviewId: string;
  supportPlanId: string;
  progressRollupId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  remedialDailyPlanId: string;
  remedialDailyPlanTitle: string;
  remedialLessonId: string;
  remedialLessonCode: string;
  sourcePracticeAttemptId: string;
  sourceAssignmentId: string | null;
  status: DemoLearningRemedialAssignmentFixtureStatus;
  dueAt: string;
  safeNextActionLabel: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSupportPlanRow = {
  supportPlanId: string;
  interventionReviewId: string;
  progressRollupId: string;
  remedialAssignmentId: string;
  parentVisibleSupportSummaryId: string;
  teacherVisibleNextActionId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  supportReason: string;
  status: DemoLearningSupportPlanFixtureStatus;
  safeNextActionLabel: string;
  parentVisible: true;
  teacherVisible: true;
  planSummary: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentVisibleSupportSummaryRow = {
  parentVisibleSupportSummaryId: string;
  supportPlanId: string;
  interventionReviewId: string;
  progressRollupId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  supportReason: string;
  safeNextActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningTeacherVisibleNextActionRow = {
  teacherVisibleNextActionId: string;
  supportPlanId: string;
  interventionReviewId: string;
  progressRollupId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  classId: string;
  classCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  status: DemoLearningTeacherNextActionStatus;
  dueAt: string;
  safeNextActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow =
  {
    evidenceKind:
      | 'NEEDS_SUPPORT_PROGRESS_ROLLUP'
      | 'TEACHER_INTERVENTION_REVIEW'
      | 'REMEDIAL_ASSIGNMENT'
      | 'SUPPORT_PLAN'
      | 'PARENT_VISIBLE_SUPPORT_SUMMARY'
      | 'TEACHER_VISIBLE_NEXT_ACTION'
      | 'STABLE_TRACE'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport =
  {
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
    safety: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanSafety;
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES';
      summary: string;
      remainingLocalDemoNotes: string[];
    };
    totals: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanTotals;
    statusCounts: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanStatusCounts;
    interventionReviewRows: DemoLearningTeacherInterventionReviewRow[];
    remedialAssignmentRows: DemoLearningRemedialAssignmentRow[];
    supportPlanRows: DemoLearningSupportPlanRow[];
    parentSummaryRows: DemoLearningParentVisibleSupportSummaryRow[];
    teacherNextActionRows: DemoLearningTeacherVisibleNextActionRow[];
    evidenceRows: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanEvidenceRow[];
  };
