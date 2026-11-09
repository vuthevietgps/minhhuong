import type {
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningEnrollmentStatus,
  DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
  DemoLearningPaymentStatus,
  DemoLearningPracticeAttemptStatus,
  DemoLearningProgressStatus,
  DemoLearningRemedialRetryUnresolvedAttemptStatus,
  DemoLearningResolvedSupportOutcomeStatus,
  DemoLearningSubscriptionStatus,
} from './shared-statuses.types';
import type { DemoLearningSubscriptionEntitlementDailyPlanAccessStatus } from './subscription-entitlement-daily-plan-access.types';
import type { DemoLearningTeacherEscalationFollowupResolutionSafety } from './teacher-escalation-followup-resolution.types';

export type DemoLearningMvpEndToEndReadinessTraceSafety =
  DemoLearningTeacherEscalationFollowupResolutionSafety;

export type DemoLearningMvpEndToEndReadinessTraceStatusCounts = {
  traceStatus: Record<'LOCAL_DEMO_READY_WITH_NOTES', number>;
  ownerLabel: Record<'TEACHER', number>;
};

export type DemoLearningMvpEndToEndReadinessTraceTotals = {
  studentCount: number;
  courseCount: number;
  enrollmentOrSubscriptionCount: number;
  paymentRefundCommissionFixtureEvidenceCount: number;
  entitlementOrDailyPlanCount: number;
  practiceProgressOrCompletionCount: number;
  parentTeacherReportCount: number;
  permissionRedactionEvidenceCount: number;
  approvedDeliveryOrReadReceiptCount: number;
  alignedApprovedDeliveryStudentCoursePathCount: number;
  screenTimeGuardEvidenceCount: number;
  teacherInterventionEvidenceCount: number;
  remedialRetryOrEscalationEvidenceCount: number;
  escalationResolutionEvidenceCount: number;
  stableEndToEndTraceCount: number;
  deterministicStatusReasonActionOwnerCount: number;
  sameStudentCoursePathCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningMvpEndToEndReadinessTraceRow = {
  traceId: string;
  stableEndToEndTraceKey: string;
  stableEndToEndTraceIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianId: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  enrollmentId: string;
  enrollmentStatus: DemoLearningEnrollmentStatus;
  subscriptionId: string;
  subscriptionStatus: DemoLearningSubscriptionStatus;
  paymentId: string;
  paymentStatus: DemoLearningPaymentStatus;
  refundIds: string[];
  commissionIds: string[];
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  entitlementAccessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  learningPathId: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  practiceProgressRollupId: string;
  practiceAttemptId: string;
  practiceAttemptStatus: DemoLearningPracticeAttemptStatus;
  practiceScorePercent: number;
  progressStatus: DemoLearningProgressStatus;
  parentTeacherReportSummaryId: string;
  parentTeacherPermissionCaseId: string;
  permissionRedactionEvidenceId: string;
  approvedDeliveryOrReadReceiptId: string;
  approvedDeliveryStudentId: string;
  approvedDeliveryCourseId: string;
  screenTimeGuardEvidenceId: string;
  screenTimeAccessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult;
  teacherInterventionReviewId: string;
  supportPlanId: string;
  remedialAssignmentId: string;
  remedialRetryOrEscalationId: string;
  remedialRetryStatus: DemoLearningRemedialRetryUnresolvedAttemptStatus;
  unresolvedOutcomeId: string;
  teacherEscalationId: string;
  supportAdjustmentId: string;
  escalationResolutionId: string;
  resolvedSupportOutcomeId: string;
  resolutionStatus: DemoLearningResolvedSupportOutcomeStatus;
  traceStatus: 'LOCAL_DEMO_READY_WITH_NOTES';
  reasonLabel: string;
  actionLabel: string;
  ownerLabel: 'TEACHER';
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  productionReady: false;
  evidenceSummary: string;
};

export type DemoLearningMvpEndToEndReadinessTraceEvidenceRow = {
  evidenceKind:
    | 'STUDENT_COURSE_ENROLLMENT_SUBSCRIPTION'
    | 'PAYMENT_REFUND_COMMISSION_FIXTURE'
    | 'ENTITLEMENT_DAILY_PLAN'
    | 'PRACTICE_PROGRESS_COMPLETION'
    | 'PARENT_TEACHER_REPORTING'
    | 'PERMISSION_REDACTION'
    | 'APPROVED_DELIVERY_READ_RECEIPT'
    | 'SCREEN_TIME_GUARD'
    | 'TEACHER_INTERVENTION'
    | 'REMEDIAL_RETRY_OR_ESCALATION'
    | 'ESCALATION_RESOLUTION'
    | 'STABLE_END_TO_END_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningMvpEndToEndReadinessTraceReport = {
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
  safety: DemoLearningMvpEndToEndReadinessTraceSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningMvpEndToEndReadinessTraceTotals;
  statusCounts: DemoLearningMvpEndToEndReadinessTraceStatusCounts;
  traceRows: DemoLearningMvpEndToEndReadinessTraceRow[];
  evidenceRows: DemoLearningMvpEndToEndReadinessTraceEvidenceRow[];
};
