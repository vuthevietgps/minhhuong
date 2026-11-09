import type {
  DemoLearningCurrency,
  DemoLearningGuardianRelationship,
  DemoLearningScreenTimeGrantDecision,
  DemoLearningScreenTimePolicyStatus,
  DemoLearningSessionGateBlockedReason,
  DemoLearningSessionGateDecision,
} from './shared-statuses.types';
import type { DemoLearningSessionGate } from './shared.types';

export type DemoLearningParentScreenTimeGuardianControlsStatusCounts = {
  policyStatus: Record<DemoLearningScreenTimePolicyStatus, number>;
  gateDecision: Record<DemoLearningSessionGateDecision, number>;
  grantDecision: Record<DemoLearningScreenTimeGrantDecision, number>;
};

export type DemoLearningParentScreenTimeGuardianControlsTotals = {
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

export type DemoLearningParentScreenTimeChildControlsRow = {
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  relationship: DemoLearningGuardianRelationship;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseIds: string[];
  courseCodes: string[];
  activePolicyId: string | null;
  policyStatus: DemoLearningScreenTimePolicyStatus;
  dailyAllowedMinutes: number;
  approvedGrantMinutes: number;
  totalAllowedMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  grantRequestCount: number;
  grantDecisionCount: number;
  allowedSessionCount: number;
  blockedSessionCount: number;
  overrideSessionCount: number;
  needsParentAttention: boolean;
  parentAttentionReason: string;
};

export type DemoLearningParentScreenTimeGateRow = {
  gateId: string;
  dailyPlanId: string;
  learningPathId: string;
  enrollmentId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  guardianId: string;
  guardianName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  teacherName: string;
  lessonId: string;
  lessonCode: string;
  dailyPlanTitle: string;
  requestedAt: string;
  requestedMinutes: number;
  usedMinutesBeforeSession: number;
  sessionUsedMinutes: number;
  decision: DemoLearningSessionGateDecision;
  blockedReason: DemoLearningSessionGateBlockedReason | 'NONE';
  decidedBy: DemoLearningSessionGate['decidedBy'];
  accessMode: DemoLearningSessionGate['accessMode'];
  safeDailyPlanAccess: boolean;
};

export type DemoLearningParentScreenTimeGrantRow = {
  grantRequestId: string;
  sessionGateId: string;
  guardianId: string;
  guardianName: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  requestedExtraMinutes: number;
  requestedAt: string;
  decision: DemoLearningScreenTimeGrantDecision;
  decidedAt: string | null;
  grantedMinutes: number;
  decisionReason: string;
};

export type DemoLearningParentScreenTimeGuardianControlsReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    noProductionDbRead: true;
    providerApiUsed: false;
    aiProviderUsed: false;
    paymentProviderUsed: false;
    notificationProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
    realParentGuardianMutationUsed: false;
    realScreenTimePolicyMutationUsed: false;
    realLearningSessionGateMutationUsed: false;
    realScreenTimeGrantMutationUsed: false;
    realDailyPlanAccessMutationUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: DemoLearningParentScreenTimeGuardianControlsTotals;
  statusCounts: DemoLearningParentScreenTimeGuardianControlsStatusCounts;
  childRows: DemoLearningParentScreenTimeChildControlsRow[];
  gateRows: DemoLearningParentScreenTimeGateRow[];
  grantRows: DemoLearningParentScreenTimeGrantRow[];
};
