import type {
  DemoLearningCurrency,
  DemoLearningProgressStatus,
} from './shared-statuses.types';

export type DemoLearningProgressAlertSeverity = 'HIGH' | 'MEDIUM';

export type DemoLearningProgressAlertReason =
  | 'MISSING_SUBMISSIONS'
  | 'LOW_PRACTICE_SCORE'
  | 'SKIPPED_VIDEO'
  | 'ATTENDANCE_SESSION_GAP'
  | 'STALLED_DAILY_PLAN';

export type DemoLearningProgressAlertFollowUpStatus =
  'OPEN' | 'SCHEDULED' | 'RESOLVED' | 'MONITORING';

export type DemoLearningParentTeacherProgressAlertStatusCounts = {
  alertSeverity: Record<DemoLearningProgressAlertSeverity, number>;
  alertReason: Record<DemoLearningProgressAlertReason, number>;
  followUpStatus: Record<DemoLearningProgressAlertFollowUpStatus, number>;
};

export type DemoLearningParentTeacherProgressAlertTotals = {
  studentCount: number;
  courseCount: number;
  learnerProgressSummaryCount: number;
  alertCount: number;
  highRiskAlertCount: number;
  mediumRiskAlertCount: number;
  resolvedAlertCount: number;
  followUpNeededAlertCount: number;
  teacherInterventionRecommendationCount: number;
  parentSummaryCount: number;
  openFollowUpCount: number;
  scheduledFollowUpCount: number;
  resolvedFollowUpCount: number;
  monitoringFollowUpCount: number;
};

export type DemoLearningParentTeacherAlertReasonSummaryRow = {
  alertReason: DemoLearningProgressAlertReason;
  reasonLabel: string;
  alertCount: number;
};

export type DemoLearningParentTeacherLearnerSummaryRow = {
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  teacherName: string;
  progressStatus: DemoLearningProgressStatus;
  progressPercent: number;
  attendanceRatePercent: number;
  missingSubmissionCount: number;
  skippedVideoCount: number;
  blockedDailyPlanCount: number;
  averagePracticeScorePercent: number;
  alertCount: number;
  highRiskAlertCount: number;
  mediumRiskAlertCount: number;
  followUpNeededAlertCount: number;
  highestAlertSeverity: DemoLearningProgressAlertSeverity | 'NONE';
};

export type DemoLearningParentTeacherProgressAlertRow = {
  alertId: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  teacherName: string;
  alertSeverity: DemoLearningProgressAlertSeverity;
  alertReason: DemoLearningProgressAlertReason;
  reasonLabel: string;
  evidenceSummary: string;
  progressPercent: number;
  attendanceRatePercent: number;
  missingSubmissionCount: number;
  skippedVideoCount: number;
  blockedDailyPlanCount: number;
  averagePracticeScorePercent: number;
  teacherInterventionRecommendation: string;
  parentSummary: string;
  followUpStatus: DemoLearningProgressAlertFollowUpStatus;
  recommendedFollowUpAt: string;
};

export type DemoLearningParentTeacherProgressAlertInterventionReport = {
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
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningParentTeacherProgressAlertTotals;
  statusCounts: DemoLearningParentTeacherProgressAlertStatusCounts;
  topAlertReasons: DemoLearningParentTeacherAlertReasonSummaryRow[];
  learnerSummaries: DemoLearningParentTeacherLearnerSummaryRow[];
  alertRows: DemoLearningParentTeacherProgressAlertRow[];
};
