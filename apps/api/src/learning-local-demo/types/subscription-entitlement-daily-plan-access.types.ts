import type {
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningEnrollmentStatus,
  DemoLearningPathStatus,
  DemoLearningPaymentStatus,
  DemoLearningSubscriptionStatus,
} from './shared-statuses.types';
import type { DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety } from './student-course-enrollment-subscription-flow.types';

export type DemoLearningSubscriptionEntitlementDailyPlanAccessStatus =
  | 'UNLOCKED'
  | 'BLOCKED_PENDING_PAYMENT'
  | 'BLOCKED_EXPIRED'
  | 'BLOCKED_REVOKED'
  | 'BLOCKED_REFUNDED'
  | 'BLOCKED_CANCELED';

export type DemoLearningSubscriptionEntitlementLifecycleState =
  | 'ACTIVE'
  | 'PENDING_PAYMENT'
  | 'EXPIRED'
  | 'REVOKED'
  | 'REFUNDED'
  | 'CANCELED';

export type DemoLearningSubscriptionEntitlementDailyPlanAccessSafety =
  DemoLearningStudentCourseEnrollmentSubscriptionFlowSafety;

export type DemoLearningSubscriptionEntitlementDailyPlanAccessTotals = {
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
  blockedRevokedCount: number;
  blockedRefundedCount: number;
  blockedCanceledCount: number;
  lifecycleRowCount: number;
  lifecycleExpiredRowCount: number;
  lifecycleRevokedRowCount: number;
  lifecycleRowsWithReasonCount: number;
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

export type DemoLearningSubscriptionEntitlementDailyPlanAccessRow = {
  relationshipKey: string;
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  blockedReason: string | null;
  nextSafeActionLabel: string;
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
  learningPathId: string;
  learningPathTitle: string;
  learningPathStatus: DemoLearningPathStatus;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  planDate: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSubscriptionEntitlementLifecycleRow = {
  lifecycleRowId: string;
  lifecycleState: DemoLearningSubscriptionEntitlementLifecycleState;
  relationshipKey: string;
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  sourceEnrollmentId: string;
  sourceSubscriptionId: string;
  sourcePaymentId: string;
  sourceRefundIds: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  decisionReason: string;
  nextSafeActionLabel: string;
  auditTraceKey: string;
  auditTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow = {
  evidenceKind:
    | 'COURSE_ENTITLEMENT'
    | 'UNLOCKED_DAILY_PLAN_ACCESS'
    | 'BLOCKED_DAILY_PLAN_ACCESS'
    | 'ENTITLEMENT_LIFECYCLE_HARDENING'
    | 'RELATIONSHIP_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningSubscriptionEntitlementDailyPlanAccessReport = {
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
  safety: DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningSubscriptionEntitlementDailyPlanAccessTotals;
  accessRows: DemoLearningSubscriptionEntitlementDailyPlanAccessRow[];
  lifecycleRows: DemoLearningSubscriptionEntitlementLifecycleRow[];
  evidenceRows: DemoLearningSubscriptionEntitlementDailyPlanAccessEvidenceRow[];
};
