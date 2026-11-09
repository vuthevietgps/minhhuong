import type {
  DemoLearningAchievementKind,
  DemoLearningAiTutorSupportPriority,
  DemoLearningAiTutorSupportRecommendationStatus,
  DemoLearningAiTutorTeacherReviewStatus,
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningWeeklyDigestActionOwner,
  DemoLearningWeeklyDigestActionPriority,
  DemoLearningWeeklyDigestActionStatus,
  DemoLearningWeeklyDigestAudience,
  DemoLearningWeeklyDigestDeliveryStatus,
} from './shared-statuses.types';

export type DemoLearningFollowUpActionOutcomeStatus =
  'COMPLETED' | 'VERIFIED' | 'SCHEDULED' | 'MONITORING' | 'HELD';

export type DemoLearningFollowUpActionOutcomeImpact =
  'POSITIVE' | 'STABLE' | 'NEEDS_SUPPORT' | 'NO_SEND';

export type DemoLearningFollowUpActionOutcome = {
  id: string;
  weeklyDigestActionId: string;
  digestId: string;
  studentId: string;
  outcomeStatus: DemoLearningFollowUpActionOutcomeStatus;
  impactBand: DemoLearningFollowUpActionOutcomeImpact;
  parentVisible: boolean;
  outcomeAt?: string;
  nextReviewAt?: string;
  sourceDailyPlanId?: string;
  sourceAiTutorSupportRecommendationId?: string;
  sourceAchievementRecordId?: string;
  sourceAiTutorParentSummaryId?: string;
  sourceAiTutorTeacherReviewItemId?: string;
  evidenceSummary: string;
  outcomeSummary: string;
  fixtureOutcomeSource: 'fixture_followup_action_outcome_report';
};

export type DemoLearningFollowUpActionOutcomeStatusCounts = {
  outcomeStatus: Record<DemoLearningFollowUpActionOutcomeStatus, number>;
  impactBand: Record<DemoLearningFollowUpActionOutcomeImpact, number>;
  actionOwner: Record<DemoLearningWeeklyDigestActionOwner, number>;
  actionPriority: Record<DemoLearningWeeklyDigestActionPriority, number>;
};

export type DemoLearningFollowUpActionOutcomeTotals = {
  outcomeCount: number;
  completedOutcomeCount: number;
  verifiedOutcomeCount: number;
  scheduledOutcomeCount: number;
  monitoringOutcomeCount: number;
  heldOutcomeCount: number;
  parentVisibleOutcomeCount: number;
  teacherOnlyOutcomeCount: number;
  positiveOutcomeCount: number;
  needsSupportOutcomeCount: number;
  noSendOutcomeCount: number;
  linkedDailyPlanCount: number;
  linkedSupportRecommendationCount: number;
  linkedAchievementCount: number;
  linkedParentSummaryCount: number;
  linkedTeacherReviewCount: number;
  studentsCovered: number;
  studentsWithCompletedOrVerifiedOutcome: number;
  studentsWithOpenOutcome: number;
};

export type DemoLearningFollowUpActionOutcomeStudentRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  outcomeCount: number;
  completedOrVerifiedCount: number;
  scheduledOrMonitoringCount: number;
  heldOutcomeCount: number;
  needsSupportOutcomeCount: number;
  parentVisibleOutcomeCount: number;
  nextReviewAt: string | null;
  outcomeSummary: string;
};

export type DemoLearningFollowUpActionOutcomeRow = {
  outcomeId: string;
  actionId: string;
  digestId: string;
  weekStart: string;
  weekEnd: string;
  actionOwner: DemoLearningWeeklyDigestActionOwner;
  actionPriority: DemoLearningWeeklyDigestActionPriority;
  actionStatus: DemoLearningWeeklyDigestActionStatus;
  outcomeStatus: DemoLearningFollowUpActionOutcomeStatus;
  impactBand: DemoLearningFollowUpActionOutcomeImpact;
  parentVisible: boolean;
  outcomeAt: string | null;
  nextReviewAt: string | null;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  parentEmail: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  digestAudience: DemoLearningWeeklyDigestAudience;
  digestDeliveryStatus: DemoLearningWeeklyDigestDeliveryStatus;
  dailyPlanId: string | null;
  dailyPlanTitle: string | null;
  dailyPlanStatus: DemoLearningDailyPlanStatus | 'NONE';
  supportRecommendationId: string | null;
  supportPriority: DemoLearningAiTutorSupportPriority | 'NONE';
  supportStatus: DemoLearningAiTutorSupportRecommendationStatus | 'NONE';
  achievementRecordId: string | null;
  achievementKind: DemoLearningAchievementKind | 'NONE';
  achievementPoints: number;
  parentSummaryId: string | null;
  parentSummaryReady: boolean;
  teacherReviewItemId: string | null;
  teacherReviewStatus: DemoLearningAiTutorTeacherReviewStatus | 'NONE';
  sourceAlertId: string | null;
  sourceRecognitionSummaryId: string | null;
  actionSummary: string;
  evidenceSummary: string;
  outcomeSummary: string;
};

export type DemoLearningFollowUpActionOutcomeReport = {
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
    realParentSummaryMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realWeeklyDigestNotificationMutationUsed: false;
    realFollowUpActionOutcomeMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningFollowUpActionOutcomeTotals;
  statusCounts: DemoLearningFollowUpActionOutcomeStatusCounts;
  studentRows: DemoLearningFollowUpActionOutcomeStudentRow[];
  outcomeRows: DemoLearningFollowUpActionOutcomeRow[];
};
