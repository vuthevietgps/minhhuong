import type { DemoLearningEnrollmentReportRow } from "./shared.types";

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: {
    productionReady: false;
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    paymentProviderUsed: false;
    aiProviderExecutionUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realSubscriptionMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realLearningMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
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
    fixturePaymentEvidenceCount: number;
    refundEvidenceCount: number;
    commissionEvidenceCount: number;
    relationshipTraceCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  relationshipRows: {
    relationshipKey: string;
    studentName: string;
    courseCode: string;
    enrollmentId: string;
    enrollmentStatus: DemoLearningEnrollmentReportRow["enrollmentStatus"];
    subscriptionId: string;
    subscriptionStatus: DemoLearningEnrollmentReportRow["subscriptionStatus"];
    paymentId: string;
    paymentStatus: DemoLearningEnrollmentReportRow["paymentStatus"];
    refundIds: string[];
    commissionIds: string[];
    fixtureOnly: true;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
  evidenceRows: {
    evidenceKind:
      | "STUDENT_PROFILE"
      | "COURSE_PACKAGE"
      | "ENROLLMENT_SUBSCRIPTION"
      | "PAYMENT_FIXTURE"
      | "REFUND_FIXTURE"
      | "COMMISSION_FIXTURE";
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
};
