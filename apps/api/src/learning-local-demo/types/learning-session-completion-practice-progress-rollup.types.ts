import type {
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
  DemoLearningPracticeAttemptStatus,
  DemoLearningSessionCompletionPracticeProgressRollupStatus,
} from './shared-statuses.types';
import type {
  DemoLearningSessionCompletionPracticeProgressRollupRow,
  DemoLearningSessionCompletionPracticeProgressRollupSafety,
} from './shared.types';

export type DemoLearningSessionCompletionPracticeProgressRollupStatusCounts = {
  accessResult: Record<
    DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
    number
  >;
  dailyPlanStatus: Record<DemoLearningDailyPlanStatus, number>;
  practiceAttemptStatus: Record<DemoLearningPracticeAttemptStatus, number>;
  rollupStatus: Record<
    DemoLearningSessionCompletionPracticeProgressRollupStatus,
    number
  >;
};

export type DemoLearningSessionCompletionPracticeProgressRollupTotals = {
  studentCount: number;
  courseCount: number;
  dailyPlanSessionReferenceCount: number;
  allowedDailyPlanSessionReferenceCount: number;
  lessonCompletionEvidenceCount: number;
  practiceAttemptEvidenceCount: number;
  scoredPracticeAttemptEvidenceCount: number;
  progressRollupCount: number;
  parentVisibleProgressSummaryCount: number;
  teacherVisibleProgressSummaryCount: number;
  stableTraceCount: number;
  rollupsWithStudentCourseDailyPlanSessionCount: number;
  rollupsWithLessonPracticeEvidenceCount: number;
  rollupsWithParentTeacherSummaryCount: number;
  practiceAttemptsWithDeterministicScoreStatusCount: number;
  rollupsWithCompletionPercentCount: number;
  rollupsWithSafeNextActionLabelCount: number;
  completedRollupCount: number;
  needsSupportRollupCount: number;
  averageCompletionPercent: number;
  averagePracticeScorePercent: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningSessionCompletionPracticeProgressParentSummaryRow = {
  parentVisibleProgressSummaryId: string;
  progressRollupId: string;
  stableTraceKey: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  completionPercent: number;
  practiceScorePercent: number;
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  nextSafeActionLabel: string;
  parentVisible: true;
  summary: string;
};

export type DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow = {
  teacherVisibleProgressSummaryId: string;
  progressRollupId: string;
  stableTraceKey: string;
  teacherName: string;
  classId: string;
  classCode: string;
  courseCode: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  dailyPlanId: string;
  lessonCode: string;
  completionPercent: number;
  practiceScorePercent: number;
  rollupStatus: DemoLearningSessionCompletionPracticeProgressRollupStatus;
  nextSafeActionLabel: string;
  teacherVisible: true;
  summary: string;
};

export type DemoLearningSessionCompletionPracticeProgressEvidenceRow = {
  evidenceKind:
    | 'ALLOWED_DAILY_PLAN_SESSION_REFERENCE'
    | 'LESSON_VIDEO_COMPLETION'
    | 'PRACTICE_SCORE_ATTEMPT'
    | 'PROGRESS_ROLLUP'
    | 'PARENT_VISIBLE_SUMMARY'
    | 'TEACHER_VISIBLE_SUMMARY'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSessionCompletionPracticeProgressRollupReport = {
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
  safety: DemoLearningSessionCompletionPracticeProgressRollupSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningSessionCompletionPracticeProgressRollupTotals;
  statusCounts: DemoLearningSessionCompletionPracticeProgressRollupStatusCounts;
  progressRollupRows: DemoLearningSessionCompletionPracticeProgressRollupRow[];
  parentSummaryRows: DemoLearningSessionCompletionPracticeProgressParentSummaryRow[];
  teacherSummaryRows: DemoLearningSessionCompletionPracticeProgressTeacherSummaryRow[];
  evidenceRows: DemoLearningSessionCompletionPracticeProgressEvidenceRow[];
};
