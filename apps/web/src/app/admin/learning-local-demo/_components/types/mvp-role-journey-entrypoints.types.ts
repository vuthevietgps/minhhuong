import type { DemoLearningMvpEndToEndReadinessTraceReport } from "./mvp-end-to-end-readiness-trace.types";

export type DemoLearningMvpRoleJourneyEntrypointsReport = {
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
  safety: DemoLearningMvpEndToEndReadinessTraceReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    roleEntrypointCount: number;
    studentRoleEntrypointCount: number;
    parentRoleEntrypointCount: number;
    teacherRoleEntrypointCount: number;
    adminRoleEntrypointCount: number;
    stableRoleJourneyTraceCount: number;
    sameStudentCoursePathCount: number;
    linkedMvpReadinessTraceCount: number;
    linkedParentReadReceiptCount: number;
    linkedTeacherEscalationResolutionCount: number;
    deterministicStatusReasonActionOwnerCount: number;
    routeAnchorActionStatusLabelCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  statusCounts: {
    role: Record<"STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR", number>;
    status: Record<"LOCAL_DEMO_READY_WITH_NOTES", number>;
    ownerLabel: Record<
      "STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR",
      number
    >;
  };
  entrypointRows: {
    roleEntrypointId: string;
    role: "STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR";
    roleLabel: string;
    stableRoleJourneyTraceId: string;
    stableRoleJourneyTraceKey: string;
    stableRoleJourneyTraceIds: string[];
    studentId: string;
    childProfileId: string;
    studentName: string;
    parentGuardianId: string;
    teacherId: string;
    teacherName: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    learningPathId: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    practiceAttemptId: string;
    routePath: string;
    dashboardAnchor: string;
    routeLabel: string;
    anchorLabel: string;
    actionLabel: string;
    statusLabel: "LOCAL_DEMO_READY_WITH_NOTES";
    reasonLabel: string;
    ownerLabel: "STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR";
    mvpReadinessTraceId: string;
    parentInboxItemId: string;
    parentReadReceiptEvidenceId: string;
    screenTimeGuardEvidenceId: string;
    teacherProgressSummaryId: string;
    teacherInterventionReviewId: string;
    remedialAssignmentId: string;
    remedialRetryOrEscalationId: string;
    teacherEscalationResolutionId: string;
    safetyOverviewAnchor: string;
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    productionReady: false;
    evidenceSummary: string;
  }[];
  stableTraceRows: {
    stableRoleJourneyTraceId: string;
    stableRoleJourneyTraceKey: string;
    studentId: string;
    courseId: string;
    learningPathId: string;
    roleEntrypointIds: string[];
    roleLabels: string[];
    mvpReadinessTraceId: string;
    parentReadReceiptEvidenceId: string;
    teacherEscalationResolutionId: string;
    traceStatus: "LOCAL_DEMO_READY_WITH_NOTES";
    reasonLabel: string;
    actionLabel: string;
    ownerLabel: "ADMIN_OPERATOR";
    evidenceSummary: string;
  }[];
  evidenceRows: {
    evidenceKind:
      | "STUDENT_ENTRYPOINT"
      | "PARENT_ENTRYPOINT"
      | "TEACHER_ENTRYPOINT"
      | "ADMIN_OPERATOR_ENTRYPOINT"
      | "STABLE_ROLE_JOURNEY_TRACE"
      | "SAFETY_GATE";
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
};
