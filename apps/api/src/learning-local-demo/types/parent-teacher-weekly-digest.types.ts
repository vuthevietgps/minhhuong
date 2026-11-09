import type {
  DemoLearningCertificateFixtureStatus,
  DemoLearningCurrency,
  DemoLearningProgressStatus,
  DemoLearningWeeklyDigestActionOwner,
  DemoLearningWeeklyDigestActionPriority,
  DemoLearningWeeklyDigestActionStatus,
  DemoLearningWeeklyDigestAudience,
  DemoLearningWeeklyDigestDeliveryStatus,
} from './shared-statuses.types';

export type DemoLearningParentTeacherWeeklyDigestStatusCounts = {
  audience: Record<DemoLearningWeeklyDigestAudience, number>;
  deliveryStatus: Record<DemoLearningWeeklyDigestDeliveryStatus, number>;
  actionPriority: Record<DemoLearningWeeklyDigestActionPriority, number>;
  actionStatus: Record<DemoLearningWeeklyDigestActionStatus, number>;
  actionOwner: Record<DemoLearningWeeklyDigestActionOwner, number>;
};

export type DemoLearningParentTeacherWeeklyDigestTotals = {
  digestCount: number;
  parentDigestCount: number;
  teacherDigestCount: number;
  readyToSendDigestCount: number;
  teacherReviewDigestCount: number;
  heldWithdrawnDigestCount: number;
  parentVisibleDigestCount: number;
  teacherOnlyDigestCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  scheduledActionCount: number;
  completedActionCount: number;
  studentsCovered: number;
  studentsNeedingTeacherReview: number;
  studentsReadyForParentSend: number;
};

export type DemoLearningParentTeacherWeeklyDigestRow = {
  digestId: string;
  weekStart: string;
  weekEnd: string;
  audience: DemoLearningWeeklyDigestAudience;
  deliveryStatus: DemoLearningWeeklyDigestDeliveryStatus;
  parentVisible: boolean;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  parentEmail: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  attendanceRatePercent: number;
  assignmentCompletionPercent: number;
  averagePracticeScorePercent: number;
  alertCount: number;
  highRiskAlertCount: number;
  followUpNeededAlertCount: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  certificateStatus: DemoLearningCertificateFixtureStatus | 'NONE';
  recognitionSummaryCount: number;
  parentVisibleRecognitionCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  sourceAlertIds: string[];
  sourceRecognitionSummaryIds: string[];
  sourceAiTutorTeacherReviewItemIds: string[];
  sourceCertificateFixtureId: string | null;
  highlight: string;
  riskSummary: string;
  parentSummary: string;
  teacherNote: string;
};

export type DemoLearningParentTeacherWeeklyDigestActionRow = {
  actionId: string;
  digestId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  owner: DemoLearningWeeklyDigestActionOwner;
  priority: DemoLearningWeeklyDigestActionPriority;
  status: DemoLearningWeeklyDigestActionStatus;
  dueAt: string;
  sourceAlertId: string | null;
  sourceRecognitionSummaryId: string | null;
  actionSummary: string;
};

export type DemoLearningParentTeacherWeeklyDigestStudentRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  parentDigestCount: number;
  teacherDigestCount: number;
  readyToSendDigestCount: number;
  teacherReviewDigestCount: number;
  heldWithdrawnDigestCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  completedActionCount: number;
  nextActionDueAt: string | null;
  weeklySummary: string;
};

export type DemoLearningParentTeacherWeeklyDigestReport = {
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
    certificateIssuerProviderUsed: false;
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
    realLearningSupportMutationUsed: false;
    realAchievementMutationUsed: false;
    realBadgeMutationUsed: false;
    realCertificateMutationUsed: false;
    realCredentialIssuanceUsed: false;
    realRecognitionNotificationMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realWeeklyDigestNotificationMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningParentTeacherWeeklyDigestTotals;
  statusCounts: DemoLearningParentTeacherWeeklyDigestStatusCounts;
  studentRows: DemoLearningParentTeacherWeeklyDigestStudentRow[];
  digestRows: DemoLearningParentTeacherWeeklyDigestRow[];
  actionRows: DemoLearningParentTeacherWeeklyDigestActionRow[];
};
