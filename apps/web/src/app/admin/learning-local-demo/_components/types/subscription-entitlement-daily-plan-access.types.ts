import type { DemoLearningEnrollmentReportRow } from "./shared.types";
import type { DemoLearningStudentCourseEnrollmentSubscriptionFlowReport } from "./student-course-enrollment-subscription-flow.types";

export type DemoLearningSubscriptionEntitlementDailyPlanAccessReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningStudentCourseEnrollmentSubscriptionFlowReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    courseCount: number;
    enrollmentCount: number;
    subscriptionCount: number;
    entitlementCount: number;
    learningPathCount: number;
    dailyPlanAccessCaseCount: number;
    unlockedAccessCount: number;
    blockedAccessCount: number;
    blockedPendingPaymentCount: number;
    blockedExpiredCount: number;
    blockedRefundedCount: number;
    blockedCanceledCount: number;
    relationshipTraceCount: number;
    accessCasesWithRelationshipTraceCount: number;
    blockedAccessWithReasonCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  accessRows: {
    relationshipKey: string;
    entitlementId: string;
    entitlementStatus: "GRANTED" | "BLOCKED";
    accessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    enrollmentId: string;
    enrollmentStatus: DemoLearningEnrollmentReportRow["enrollmentStatus"];
    subscriptionId: string;
    subscriptionStatus: DemoLearningEnrollmentReportRow["subscriptionStatus"];
    paymentId: string;
    paymentStatus: DemoLearningEnrollmentReportRow["paymentStatus"];
    refundIds: string[];
    learningPathId: string;
    learningPathTitle: string;
    learningPathStatus: "ACTIVE" | "COMPLETED" | "NEEDS_SUPPORT" | "WITHDRAWN";
    dailyPlanId: string;
    dailyPlanTitle: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    planDate: string;
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
  evidenceRows: {
    evidenceKind:
      | "COURSE_ENTITLEMENT"
      | "UNLOCKED_DAILY_PLAN_ACCESS"
      | "BLOCKED_DAILY_PLAN_ACCESS"
      | "RELATIONSHIP_TRACE"
      | "SAFETY_GATE";
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
};
