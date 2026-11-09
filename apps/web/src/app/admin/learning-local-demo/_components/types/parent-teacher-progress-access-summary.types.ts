import type { DemoLearningStudentCourseEnrollmentSubscriptionFlowReport } from "./student-course-enrollment-subscription-flow.types";

export type DemoLearningParentTeacherProgressAccessSummaryReport = {
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
    parentGuardianCount: number;
    teacherCount: number;
    courseCount: number;
    enrollmentCount: number;
    subscriptionCount: number;
    entitlementCount: number;
    dailyPlanAccessCaseCount: number;
    unlockedAccessCount: number;
    blockedAccessCount: number;
    blockedReasonCount: number;
    progressSummaryCount: number;
    parentSummaryCount: number;
    teacherSummaryCount: number;
    relationshipTraceCount: number;
    parentSummaryWithTraceCount: number;
    teacherSummaryWithTraceCount: number;
    blockedAccessInSummariesWithReasonCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  progressRows: {
    progressSummaryId: string;
    relationshipKey: string;
    progressEvidenceKey: string;
    parentGuardianName: string;
    teacherOwnerNames: string[];
    studentName: string;
    childProfileId: string;
    courseCode: string;
    classCode: string;
    enrollmentId: string;
    subscriptionStatus:
      "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
    entitlementStatus: "GRANTED" | "BLOCKED";
    accessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    dailyPlanId: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    completionPercent: number;
    videoEvidenceStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
    practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
    evidenceCoverageCount: number;
  }[];
  parentSummaryRows: {
    parentSummaryId: string;
    relationshipTraceKey: string;
    relationshipTraceIds: string[];
    parentGuardianName: string;
    parentGuardianEmail: string;
    relationship: "MOTHER" | "FATHER" | "GUARDIAN";
    studentName: string;
    childProfileId: string;
    courseCode: string;
    entitlementStatus: "GRANTED" | "BLOCKED";
    accessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    dailyPlanId: string;
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    completionPercent: number;
    parentFacingSummary: string;
  }[];
  teacherSummaryRows: {
    teacherSummaryId: string;
    relationshipTraceKey: string;
    relationshipTraceIds: string[];
    blockedRelationshipTraceIds: string[];
    teacherName: string;
    teacherEmail: string;
    teacherRole: "TEACHER" | "ADMIN";
    courseCode: string;
    classCode: string;
    studentCount: number;
    unlockedAccessCount: number;
    blockedAccessCount: number;
    blockedReasonCount: number;
    averageCompletionPercent: number;
    evidenceCoverageCount: number;
    teacherFacingSummary: string;
  }[];
};
