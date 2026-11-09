import type { DemoLearningStudentCourseEnrollmentSubscriptionFlowReport } from "./student-course-enrollment-subscription-flow.types";

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionReport = {
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
    reportPermissionCaseCount: number;
    allowedReportCaseCount: number;
    deniedReportCaseCount: number;
    visibleFieldCount: number;
    redactedFieldCount: number;
    deniedFieldCount: number;
    parentVisibleFieldCount: number;
    teacherVisibleFieldCount: number;
    parentRedactedFieldCount: number;
    teacherRedactedFieldCount: number;
    permissionTraceCount: number;
    casesWithTraceCount: number;
    deniedOrRedactedCaseWithReasonCount: number;
    redactedOrDeniedFieldWithReasonCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  permissionCaseRows: {
    permissionCaseId: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
    actorRole: "PARENT_GUARDIAN" | "TEACHER" | "ADMIN";
    reportScope:
      "OWN_CHILD" | "NON_OWNING_CHILD" | "ASSIGNED_CLASS" | "ADMIN_CLASS";
    permissionDecision: "ALLOWED" | "DENIED";
    decisionReason: string;
    targetStudentName: string | null;
    targetChildProfileId: string | null;
    targetCourseCode: string | null;
    targetClassCode: string | null;
    sourceAccessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED"
      | "CLASS_SCOPE"
      | "DENIED_SCOPE";
    relationshipTraceKey: string;
    visibleFieldCount: number;
    redactedFieldCount: number;
    deniedFieldCount: number;
    caseSummary: string;
  }[];
  fieldVisibilityRows: {
    fieldVisibilityId: string;
    permissionCaseId: string;
    actorId: string;
    actorRole: "PARENT_GUARDIAN" | "TEACHER" | "ADMIN";
    fieldKey: string;
    fieldLabel: string;
    fieldScope:
      | "PARENT_VISIBLE"
      | "TEACHER_VISIBLE"
      | "ADMIN_VISIBLE"
      | "TEACHER_INTERNAL"
      | "GUARDIAN_PRIVATE"
      | "NON_OWNING_CHILD_PRIVATE";
    visibility: "VISIBLE" | "REDACTED" | "DENIED";
    visibleValue: string | null;
    redactedValue: string | null;
    reason: string | null;
    relationshipTraceKey: string;
  }[];
};
