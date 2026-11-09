import type { DemoLearningAssignmentAssessmentRow, DemoLearningCoreReport, DemoLearningLearnerAssessmentRow } from "./shared.types";

export type DemoLearningLessonAssignmentAssessmentProgressReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningCoreReport["safety"] & {
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
  };
  totals: {
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
    averageScorePercent: number;
    excellentLearnerCount: number;
    onTrackLearnerCount: number;
    needsSupportLearnerCount: number;
    withdrawnLearnerCount: number;
    overallAssignmentCompletionPercent: number;
    averageLearnerScorePercent: number;
  };
  assignmentRows: DemoLearningAssignmentAssessmentRow[];
  learnerRows: DemoLearningLearnerAssessmentRow[];
};
