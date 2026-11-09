import type {
  DemoLearningAchievementKind,
  DemoLearningBadgeAwardStatus,
  DemoLearningCertificateFixtureStatus,
  DemoLearningCurrency,
  DemoLearningMilestoneStatus,
  DemoLearningProgressStatus,
  DemoLearningRecognitionAudience,
  DemoLearningRecognitionStatus,
} from './shared-statuses.types';

export type DemoLearningStudentAchievementBadgeCertificateStatusCounts = {
  achievementKind: Record<DemoLearningAchievementKind, number>;
  badgeAwardStatus: Record<DemoLearningBadgeAwardStatus, number>;
  certificateStatus: Record<DemoLearningCertificateFixtureStatus, number>;
  milestoneStatus: Record<DemoLearningMilestoneStatus, number>;
  recognitionAudience: Record<DemoLearningRecognitionAudience, number>;
  recognitionStatus: Record<DemoLearningRecognitionStatus, number>;
};

export type DemoLearningStudentAchievementBadgeCertificateTotals = {
  achievementRecords: number;
  badgeAwards: number;
  certificateFixtures: number;
  milestonesCompleted: number;
  milestonesPending: number;
  recognitionSummaries: number;
  parentVisibleRecognitions: number;
  teacherReviewItems: number;
  studentsWithBadges: number;
  studentsNearCertificate: number;
  studentsNeedingEncouragement: number;
};

export type DemoLearningStudentAchievementSummaryRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  completedMilestoneCount: number;
  pendingMilestoneCount: number;
  certificateStatus: DemoLearningCertificateFixtureStatus | 'NONE';
  parentVisibleRecognitionCount: number;
  teacherReviewItemCount: number;
  nearCertificate: boolean;
  needsEncouragement: boolean;
};

export type DemoLearningAchievementRecordRow = {
  achievementRecordId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  lessonCode: string;
  lessonTitle: string;
  dailyPlanTitle: string;
  assignmentTitle: string | null;
  progressStatus: DemoLearningProgressStatus;
  achievementKind: DemoLearningAchievementKind;
  earnedAt: string;
  evidenceScorePercent: number | null;
  points: number;
  aiTutorSupportRecommendationId: string | null;
  evidenceSummary: string;
};

export type DemoLearningBadgeAwardRow = {
  badgeAwardId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  badgeCode: string;
  badgeName: string;
  status: DemoLearningBadgeAwardStatus;
  awardedAt: string;
  achievementRecordCount: number;
  pointsRequired: number;
  badgeSummary: string;
};

export type DemoLearningCertificateFixtureRow = {
  certificateFixtureId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  learningPathTitle: string;
  certificateTitle: string;
  status: DemoLearningCertificateFixtureStatus;
  eligibleAt: string | null;
  heldReason: string;
  completedBadgeAwardCount: number;
  pendingMilestoneCount: number;
  certificatePreviewRef: string;
};

export type DemoLearningMilestoneRow = {
  milestoneId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  classCode: string;
  learningPathTitle: string;
  dailyPlanTitle: string;
  lessonCode: string;
  title: string;
  status: DemoLearningMilestoneStatus;
  completedAt: string | null;
  pendingReason: string;
};

export type DemoLearningRecognitionSummaryRow = {
  recognitionSummaryId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  audience: DemoLearningRecognitionAudience;
  status: DemoLearningRecognitionStatus;
  parentVisible: boolean;
  teacherReviewRequired: boolean;
  encouragementNeeded: boolean;
  sourceBadgeAwardId: string | null;
  sourceCertificateFixtureId: string | null;
  sourceAiTutorSupportRecommendationId: string | null;
  createdAt: string;
  summary: string;
};

export type DemoLearningStudentAchievementBadgeCertificateReport = {
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
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningStudentAchievementBadgeCertificateTotals;
  statusCounts: DemoLearningStudentAchievementBadgeCertificateStatusCounts;
  studentRows: DemoLearningStudentAchievementSummaryRow[];
  achievementRows: DemoLearningAchievementRecordRow[];
  badgeRows: DemoLearningBadgeAwardRow[];
  certificateRows: DemoLearningCertificateFixtureRow[];
  milestoneRows: DemoLearningMilestoneRow[];
  recognitionRows: DemoLearningRecognitionSummaryRow[];
};
