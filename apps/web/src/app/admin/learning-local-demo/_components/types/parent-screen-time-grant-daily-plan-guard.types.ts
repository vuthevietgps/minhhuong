import type { DemoLearningParentScreenTimeGuardianControlsReport } from "./parent-screen-time-guardian-controls.types";

export type DemoLearningParentScreenTimeGrantDailyPlanGuardReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningParentScreenTimeGuardianControlsReport["safety"] & {
    productionReady: false;
    aiProviderExecutionUsed: false;
    realParentMutationUsed: false;
    realSubscriptionMutationUsed: false;
    realLearningMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    parentGuardianCount: number;
    courseCount: number;
    dailyPlanAccessCaseCount: number;
    parentGrantRuleCount: number;
    screenTimeRuleCount: number;
    allowedSessionCount: number;
    blockedSessionCount: number;
    blockedReasonCount: number;
    safeNextActionCount: number;
    blockedOrLimitedCaseWithSafeNextActionCount: number;
    sessionGuardTraceCount: number;
    accessCasesWithStableTraceCount: number;
    allowedCasesWithStableTraceCount: number;
    blockedCasesWithStableTraceCount: number;
    blockedCasesWithReasonAndNextActionCount: number;
    learningSessionEvidenceCount: number;
    allowedLearningSessionEvidenceCount: number;
    blockedLearningSessionEvidenceCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  accessRows: {
    accessCaseId: string;
    sessionGuardTraceKey: string;
    sessionGuardTraceIds: string[];
    parentGuardianName: string;
    parentGuardianEmail: string;
    relationship: "MOTHER" | "FATHER" | "GUARDIAN";
    studentName: string;
    childProfileId: string;
    courseCode: string;
    classCode: string;
    teacherName: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    lessonCode: string;
    screenTimePolicyStatus: "ACTIVE" | "PAUSED" | "DISABLED";
    dailyAllowedMinutes: number;
    parentGrantRuleId: string | null;
    parentGrantDecision: "APPROVED" | "DENIED" | "PENDING" | "NONE";
    requestedAt: string;
    requestedMinutes: number;
    usedMinutesBeforeSession: number;
    totalAllowedMinutesForCase: number;
    accessDecision: "ALLOWED" | "BLOCKED" | "OVERRIDE_ALLOWED";
    accessResult: "ALLOWED_SESSION" | "BLOCKED_SESSION";
    blockedReasonCode:
      | "DAILY_LIMIT_EXCEEDED"
      | "GUARDIAN_DENIED_GRANT"
      | "POLICY_DISABLED_WITHDRAWN"
      | "NONE";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    learningSessionEvidenceId: string;
    evidenceSummary: string;
  }[];
  grantRuleRows: {
    grantRuleId: string;
    parentGuardianName: string;
    studentName: string;
    childProfileId: string;
    dailyPlanTitle: string;
    requestedExtraMinutes: number;
    grantedMinutes: number;
    decision: "APPROVED" | "DENIED" | "PENDING";
    allowsDailyPlanAccess: boolean;
    decisionReason: string;
    ruleTraceKey: string;
  }[];
  sessionEvidenceRows: {
    learningSessionEvidenceId: string;
    sessionGuardTraceKey: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    dailyPlanTitle: string;
    accessResult: "ALLOWED_SESSION" | "BLOCKED_SESSION";
    accessDecision: "ALLOWED" | "BLOCKED" | "OVERRIDE_ALLOWED";
    sessionStarted: boolean;
    sessionDurationMinutes: number;
    blockedReason: string | null;
    nextSafeActionLabel: string;
  }[];
};
