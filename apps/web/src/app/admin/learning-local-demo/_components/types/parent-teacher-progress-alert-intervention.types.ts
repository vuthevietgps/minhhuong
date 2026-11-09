import type { DemoLearningParentTeacherAlertReasonSummaryRow, DemoLearningParentTeacherProgressAlertRow, DemoLearningPathDailyPlanVideoPracticeEvidenceReport } from "./shared.types";

export type DemoLearningParentTeacherProgressAlertInterventionReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningPathDailyPlanVideoPracticeEvidenceReport["safety"] & {
    aiProviderUsed: false;
    notificationProviderUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
  };
  totals: {
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
  topAlertReasons: DemoLearningParentTeacherAlertReasonSummaryRow[];
  alertRows: DemoLearningParentTeacherProgressAlertRow[];
};
