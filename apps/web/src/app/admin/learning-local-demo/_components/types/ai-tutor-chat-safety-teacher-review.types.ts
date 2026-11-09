import type { DemoLearningParentTeacherProgressAlertInterventionReport } from "./parent-teacher-progress-alert-intervention.types";
import type { DemoLearningAiTutorChatSessionRow, DemoLearningAiTutorSupportRecommendationRow, DemoLearningAiTutorTeacherReviewQueueRow } from "./shared.types";

export type DemoLearningAiTutorChatSafetyTeacherReviewReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentTeacherProgressAlertInterventionReport["safety"] & {
    aiProviderExecutionUsed: false;
    realAiChatMutationUsed: false;
    realAiModerationMutationUsed: false;
    realLearningSupportMutationUsed: false;
  };
  totals: {
    chatSessionCount: number;
    messageCount: number;
    allowedMessageCount: number;
    blockedMessageCount: number;
    safetyFlagCount: number;
    blockedTopicCount: number;
    teacherReviewItemCount: number;
    reviewedTeacherReviewItemCount: number;
    parentSummaryCount: number;
    studentsNeedingSupportCount: number;
    topicCategoryCount: number;
    supportRecommendationCount: number;
  };
  chatSessionRows: DemoLearningAiTutorChatSessionRow[];
  teacherReviewRows: DemoLearningAiTutorTeacherReviewQueueRow[];
  supportRecommendationRows: DemoLearningAiTutorSupportRecommendationRow[];
};
