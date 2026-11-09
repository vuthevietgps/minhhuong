import type { DemoLearningEnrollmentReportRow } from "./shared.types";
import type { DemoLearningTeacherEscalationFollowupResolutionReport } from "./teacher-escalation-followup-resolution.types";

export type DemoLearningMvpEndToEndReadinessTraceReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningTeacherEscalationFollowupResolutionReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
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
  statusCounts: {
    traceStatus: Record<"LOCAL_DEMO_READY_WITH_NOTES", number>;
    ownerLabel: Record<"TEACHER", number>;
  };
  traceRows: {
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
    enrollmentStatus: DemoLearningEnrollmentReportRow["enrollmentStatus"];
    subscriptionId: string;
    subscriptionStatus: DemoLearningEnrollmentReportRow["subscriptionStatus"];
    paymentId: string;
    paymentStatus: DemoLearningEnrollmentReportRow["paymentStatus"];
    refundIds: string[];
    commissionIds: string[];
    entitlementId: string;
    entitlementStatus: "GRANTED" | "BLOCKED";
    entitlementAccessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    learningPathId: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    practiceProgressRollupId: string;
    practiceAttemptId: string;
    practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
    practiceScorePercent: number;
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    parentTeacherReportSummaryId: string;
    parentTeacherPermissionCaseId: string;
    permissionRedactionEvidenceId: string;
    approvedDeliveryOrReadReceiptId: string;
    approvedDeliveryStudentId: string;
    approvedDeliveryCourseId: string;
    screenTimeGuardEvidenceId: string;
    screenTimeAccessResult: "ALLOWED_SESSION" | "BLOCKED_SESSION";
    teacherInterventionReviewId: string;
    supportPlanId: string;
    remedialAssignmentId: string;
    remedialRetryOrEscalationId: string;
    remedialRetryStatus: "FAILED" | "INCOMPLETE";
    unresolvedOutcomeId: string;
    teacherEscalationId: string;
    supportAdjustmentId: string;
    escalationResolutionId: string;
    resolvedSupportOutcomeId: string;
    resolutionStatus: "RESOLVED";
    traceStatus: "LOCAL_DEMO_READY_WITH_NOTES";
    reasonLabel: string;
    actionLabel: string;
    ownerLabel: "TEACHER";
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    productionReady: false;
    evidenceSummary: string;
  }[];
  evidenceRows: {
    evidenceKind:
      | "STUDENT_COURSE_ENROLLMENT_SUBSCRIPTION"
      | "PAYMENT_REFUND_COMMISSION_FIXTURE"
      | "ENTITLEMENT_DAILY_PLAN"
      | "PRACTICE_PROGRESS_COMPLETION"
      | "PARENT_TEACHER_REPORTING"
      | "PERMISSION_REDACTION"
      | "APPROVED_DELIVERY_READ_RECEIPT"
      | "SCREEN_TIME_GUARD"
      | "TEACHER_INTERVENTION"
      | "REMEDIAL_RETRY_OR_ESCALATION"
      | "ESCALATION_RESOLUTION"
      | "STABLE_END_TO_END_TRACE"
      | "SAFETY_GATE";
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
};
