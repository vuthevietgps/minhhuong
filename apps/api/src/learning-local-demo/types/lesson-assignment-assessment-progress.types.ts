import type {
  DemoLearningAssignmentKind,
  DemoLearningAssignmentStatus,
  DemoLearningCurrency,
  DemoLearningFeedbackStatus,
  DemoLearningLessonStatus,
  DemoLearningProgressStatus,
  DemoLearningSubmissionStatus,
} from './shared-statuses.types';

export type DemoLearningAssessmentBand =
  'EXCELLENT' | 'ON_TRACK' | 'NEEDS_SUPPORT' | 'MISSING' | 'WITHDRAWN';

export type DemoLearningLessonAssignmentAssessmentStatusCounts = {
  lesson: Record<DemoLearningLessonStatus, number>;
  assignment: Record<DemoLearningAssignmentStatus, number>;
  submission: Record<DemoLearningSubmissionStatus, number>;
  feedback: Record<DemoLearningFeedbackStatus, number>;
  progress: Record<DemoLearningProgressStatus, number>;
};

export type DemoLearningLessonAssignmentAssessmentTotals = {
  studentCount: number;
  courseCount: number;
  classCount: number;
  lessonCount: number;
  publishedLessonCount: number;
  scheduledLessonCount: number;
  assignmentCount: number;
  quizCount: number;
  assignmentTaskCount: number;
  openAssignmentCount: number;
  closedAssignmentCount: number;
  expectedSubmissionCount: number;
  submissionRecordCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  completedSubmissionCount: number;
  scoredSubmissionCount: number;
  feedbackGivenCount: number;
  pendingFeedbackCount: number;
  feedbackNotRequiredCount: number;
  excellentScoreCount: number;
  onTrackScoreCount: number;
  needsSupportScoreCount: number;
  missingScoreCount: number;
  averageScorePercent: number;
  learnerAssessmentCount: number;
  excellentLearnerCount: number;
  onTrackLearnerCount: number;
  needsSupportLearnerCount: number;
  missingLearnerCount: number;
  withdrawnLearnerCount: number;
  overallAssignmentCompletionPercent: number;
  averageLearnerScorePercent: number;
};

export type DemoLearningLessonAssessmentRow = {
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  lessonStatus: DemoLearningLessonStatus;
  classId: string;
  classCode: string;
  courseCode: string;
  sequence: number;
  assignmentCount: number;
  quizCount: number;
  assignmentTaskCount: number;
  expectedSubmissionCount: number;
  submissionRecordCount: number;
  missingSubmissionCount: number;
  averageScorePercent: number;
};

export type DemoLearningAssignmentAssessmentRow = {
  assignmentId: string;
  lessonId: string;
  lessonCode: string;
  classId: string;
  classCode: string;
  courseCode: string;
  kind: DemoLearningAssignmentKind;
  title: string;
  status: DemoLearningAssignmentStatus;
  dueAt: string;
  expectedSubmissionCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  scoredSubmissionCount: number;
  feedbackGivenCount: number;
  pendingFeedbackCount: number;
  averageScorePercent: number;
};

export type DemoLearningLearnerAssessmentRow = {
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
  progressStatus: DemoLearningProgressStatus;
  expectedAssignmentCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  scoredSubmissionCount: number;
  feedbackPendingCount: number;
  averageScorePercent: number;
  assignmentCompletionPercent: number;
  progressCompletionPercent: number;
  assessmentBand: DemoLearningAssessmentBand;
};

export type DemoLearningLessonAssignmentAssessmentProgressReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
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
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningLessonAssignmentAssessmentTotals;
  statusCounts: DemoLearningLessonAssignmentAssessmentStatusCounts;
  lessonRows: DemoLearningLessonAssessmentRow[];
  assignmentRows: DemoLearningAssignmentAssessmentRow[];
  learnerRows: DemoLearningLearnerAssessmentRow[];
};
