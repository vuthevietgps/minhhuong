import type { DemoLearningParentTeacherProgressAlertInterventionReport } from "./parent-teacher-progress-alert-intervention.types";
import type { DemoLearningParentScreenTimeChildControlsRow, DemoLearningParentScreenTimeGateRow, DemoLearningParentScreenTimeGrantRow } from "./shared.types";

export type DemoLearningParentScreenTimeGuardianControlsReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentTeacherProgressAlertInterventionReport["safety"] & {
    realParentGuardianMutationUsed: false;
    realScreenTimePolicyMutationUsed: false;
    realLearningSessionGateMutationUsed: false;
    realScreenTimeGrantMutationUsed: false;
    realDailyPlanAccessMutationUsed: false;
  };
  totals: {
    parentGuardianCount: number;
    childCount: number;
    activeScreenTimePolicyCount: number;
    allowedMinutes: number;
    usedMinutes: number;
    remainingMinutes: number;
    grantRequestCount: number;
    grantDecisionCount: number;
    approvedGrantCount: number;
    deniedGrantCount: number;
    allowedSessionCount: number;
    blockedSessionCount: number;
    overrideSessionCount: number;
    childrenNeedingParentAttentionCount: number;
  };
  childRows: DemoLearningParentScreenTimeChildControlsRow[];
  gateRows: DemoLearningParentScreenTimeGateRow[];
  grantRows: DemoLearningParentScreenTimeGrantRow[];
};
