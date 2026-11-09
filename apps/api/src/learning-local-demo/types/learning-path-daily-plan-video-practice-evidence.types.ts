import type {
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningPathStatus,
  DemoLearningPracticeAttemptStatus,
  DemoLearningVideoEvidenceStatus,
} from './shared-statuses.types';

export type DemoLearningPathLearnerBand =
  'ON_TRACK' | 'NEEDS_SUPPORT' | 'INACTIVE' | 'WITHDRAWN';

export type DemoLearningPathDailyPlanVideoPracticeStatusCounts = {
  learningPath: Record<DemoLearningPathStatus, number>;
  dailyPlan: Record<DemoLearningDailyPlanStatus, number>;
  videoEvidence: Record<DemoLearningVideoEvidenceStatus, number>;
  practiceAttempt: Record<DemoLearningPracticeAttemptStatus, number>;
  learnerBand: Record<DemoLearningPathLearnerBand, number>;
};

export type DemoLearningPathDailyPlanVideoPracticeTotals = {
  studentCount: number;
  courseCount: number;
  learningPathCount: number;
  activeLearningPathCount: number;
  completedLearningPathCount: number;
  needsSupportLearningPathCount: number;
  withdrawnLearningPathCount: number;
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  inProgressDailyPlanCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  assignedDailyPlanCount: number;
  blockedSkippedIncompleteDailyPlanCount: number;
  videoEvidenceCount: number;
  completedVideoCount: number;
  incompleteVideoCount: number;
  skippedVideoCount: number;
  practiceAttemptCount: number;
  passedPracticeCount: number;
  needsRetryPracticeCount: number;
  incompletePracticeCount: number;
  skippedPracticeCount: number;
  averagePracticeScorePercent: number;
  overallDailyPlanCompletionPercent: number;
  averageLearnerProgressPercent: number;
  onTrackLearnerCount: number;
  needsSupportLearnerCount: number;
  inactiveLearnerCount: number;
  withdrawnLearnerCount: number;
};

export type DemoLearningPathEvidenceRow = {
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  title: string;
  pathStatus: DemoLearningPathStatus;
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  completedVideoCount: number;
  passedPracticeCount: number;
  averagePracticeScorePercent: number;
  progressPercent: number;
  learnerStatusBand: DemoLearningPathLearnerBand;
};

export type DemoLearningDailyPlanEvidenceRow = {
  dailyPlanId: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  sequence: number;
  planDate: string;
  title: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  videoEvidenceStatus: DemoLearningVideoEvidenceStatus;
  watchedSeconds: number;
  requiredVideoSeconds: number;
  videoCompletionPercent: number;
  practiceAttemptStatus: DemoLearningPracticeAttemptStatus;
  practiceAttemptNumber: number;
  practiceScorePercent: number | null;
};

export type DemoLearningPathDailyPlanVideoPracticeEvidenceReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    paymentProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningPathDailyPlanVideoPracticeTotals;
  statusCounts: DemoLearningPathDailyPlanVideoPracticeStatusCounts;
  learningPathRows: DemoLearningPathEvidenceRow[];
  dailyPlanRows: DemoLearningDailyPlanEvidenceRow[];
};
