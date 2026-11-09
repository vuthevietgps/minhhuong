import type {
  DemoLearningAiTutorChatSessionStatus,
  DemoLearningAiTutorGuardDecision,
  DemoLearningAiTutorMessageRole,
  DemoLearningAiTutorSafetySeverity,
  DemoLearningAiTutorSupportPriority,
  DemoLearningAiTutorSupportRecommendationStatus,
  DemoLearningAiTutorTeacherReviewStatus,
  DemoLearningAiTutorTopicCategory,
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
} from './shared-statuses.types';

export type DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts = {
  sessionStatus: Record<DemoLearningAiTutorChatSessionStatus, number>;
  messageRole: Record<DemoLearningAiTutorMessageRole, number>;
  guardDecision: Record<DemoLearningAiTutorGuardDecision, number>;
  topicCategory: Record<DemoLearningAiTutorTopicCategory, number>;
  safetySeverity: Record<DemoLearningAiTutorSafetySeverity, number>;
  teacherReviewStatus: Record<DemoLearningAiTutorTeacherReviewStatus, number>;
  supportPriority: Record<DemoLearningAiTutorSupportPriority, number>;
  supportRecommendationStatus: Record<
    DemoLearningAiTutorSupportRecommendationStatus,
    number
  >;
};

export type DemoLearningAiTutorChatSafetyTeacherReviewTotals = {
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

export type DemoLearningAiTutorChatSessionRow = {
  chatSessionId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  classId: string;
  classCode: string;
  teacherName: string;
  learningPathId: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  sessionStatus: DemoLearningAiTutorChatSessionStatus;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  allowedMessageCount: number;
  blockedMessageCount: number;
  safetyFlagCount: number;
  teacherReviewItemCount: number;
  supportRecommendationCount: number;
  parentSummaryReady: boolean;
};

export type DemoLearningAiTutorChatMessageRow = {
  messageId: string;
  chatSessionId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  sequence: number;
  role: DemoLearningAiTutorMessageRole;
  sentAt: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  guardDecision: DemoLearningAiTutorGuardDecision;
  blockedTopic: boolean;
  messagePreview: string;
};

export type DemoLearningAiTutorSafetyFlagRow = {
  safetyFlagId: string;
  chatSessionId: string;
  messageId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  guardDecision: DemoLearningAiTutorGuardDecision;
  severity: DemoLearningAiTutorSafetySeverity;
  blockedTopic: boolean;
  reason: string;
};

export type DemoLearningAiTutorTeacherReviewQueueRow = {
  teacherReviewItemId: string;
  chatSessionId: string;
  safetyFlagId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  lessonCode: string;
  dailyPlanTitle: string;
  assignedTeacherName: string;
  topicCategory: DemoLearningAiTutorTopicCategory;
  severity: DemoLearningAiTutorSafetySeverity;
  reviewStatus: DemoLearningAiTutorTeacherReviewStatus;
  createdAt: string;
  reviewedAt: string | null;
  actionSummary: string;
  parentSummaryReady: boolean;
  supportRecommendationCount: number;
};

export type DemoLearningAiTutorParentSummaryRow = {
  parentSummaryId: string;
  chatSessionId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  createdAt: string;
  summary: string;
};

export type DemoLearningAiTutorSupportRecommendationRow = {
  supportRecommendationId: string;
  chatSessionId: string;
  teacherReviewItemId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  dailyPlanTitle: string;
  priority: DemoLearningAiTutorSupportPriority;
  status: DemoLearningAiTutorSupportRecommendationStatus;
  recommendation: string;
};

export type DemoLearningAiTutorChatSafetyTeacherReviewReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    aiProviderExecutionUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
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
    realAiChatMutationUsed: false;
    realAiModerationMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realLearningSupportMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningAiTutorChatSafetyTeacherReviewTotals;
  statusCounts: DemoLearningAiTutorChatSafetyTeacherReviewStatusCounts;
  chatSessionRows: DemoLearningAiTutorChatSessionRow[];
  messageRows: DemoLearningAiTutorChatMessageRow[];
  safetyFlagRows: DemoLearningAiTutorSafetyFlagRow[];
  teacherReviewRows: DemoLearningAiTutorTeacherReviewQueueRow[];
  parentSummaryRows: DemoLearningAiTutorParentSummaryRow[];
  supportRecommendationRows: DemoLearningAiTutorSupportRecommendationRow[];
};
