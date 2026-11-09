import type {
  DemoLearningCurrency,
  DemoLearningEnrollmentStatus,
  DemoLearningPaymentStatus,
  DemoLearningSubscriptionStatus,
} from './shared-statuses.types';

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety = {
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

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowTotals = {
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

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow =
  {
    relationshipKey: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    enrollmentId: string;
    enrollmentStatus: DemoLearningEnrollmentStatus;
    subscriptionId: string;
    subscriptionStatus: DemoLearningSubscriptionStatus;
    paymentId: string;
    paymentStatus: DemoLearningPaymentStatus;
    refundIds: string[];
    commissionIds: string[];
    fixtureOnly: true;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow = {
  evidenceKind:
    | 'STUDENT_PROFILE'
    | 'COURSE_PACKAGE'
    | 'ENROLLMENT_SUBSCRIPTION'
    | 'PAYMENT_FIXTURE'
    | 'REFUND_FIXTURE'
    | 'COMMISSION_FIXTURE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningStudentCourseEnrollmentSubscriptionFlowReport = {
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
  safety: DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningStudentCourseEnrollmentSubscriptionFlowTotals;
  relationshipRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowRelationshipRow[];
  evidenceRows: DemoLearningStudentCourseEnrollmentSubscriptionFlowEvidenceRow[];
};
