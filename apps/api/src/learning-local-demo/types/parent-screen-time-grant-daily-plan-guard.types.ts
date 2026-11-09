import type {
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningGuardianRelationship,
  DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
  DemoLearningPathStatus,
  DemoLearningScreenTimeGrantDecision,
  DemoLearningScreenTimePolicyStatus,
  DemoLearningSessionGateBlockedReason,
  DemoLearningSessionGateDecision,
} from './shared-statuses.types';
import type { DemoLearningSubscriptionEntitlementDailyPlanAccessSafety } from './subscription-entitlement-daily-plan-access.types';

export type DemoLearningParentScreenTimeGrantDailyPlanGuardSafety =
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety & {
    aiProviderUsed: false;
    realParentMutationUsed: false;
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
  };

export type DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts = {
  policyStatus: Record<DemoLearningScreenTimePolicyStatus, number>;
  gateDecision: Record<DemoLearningSessionGateDecision, number>;
  grantDecision: Record<DemoLearningScreenTimeGrantDecision, number>;
  accessResult: Record<
    DemoLearningParentScreenTimeDailyPlanGuardAccessResult,
    number
  >;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardTotals = {
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

export type DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow = {
  accessCaseId: string;
  sessionGuardTraceKey: string;
  sessionGuardTraceIds: string[];
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  relationship: DemoLearningGuardianRelationship;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  teacherName: string;
  learningPathId: string;
  learningPathTitle: string;
  learningPathStatus: DemoLearningPathStatus;
  dailyPlanId: string;
  dailyPlanTitle: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  lessonId: string;
  lessonCode: string;
  sessionId: string;
  screenTimePolicyId: string;
  screenTimePolicyStatus: DemoLearningScreenTimePolicyStatus;
  dailyAllowedMinutes: number;
  safeLearningWindowStart: string;
  safeLearningWindowEnd: string;
  parentGrantRuleId: string | null;
  parentGrantDecision: DemoLearningScreenTimeGrantDecision | 'NONE';
  parentGrantRuleApplied: boolean;
  grantedMinutes: number;
  requestedAt: string;
  requestedMinutes: number;
  usedMinutesBeforeSession: number;
  totalAllowedMinutesForCase: number;
  accessDecision: DemoLearningSessionGateDecision;
  accessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult;
  blockedReasonCode: DemoLearningSessionGateBlockedReason | 'NONE';
  blockedReason: string | null;
  nextSafeActionLabel: string;
  learningSessionEvidenceId: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow = {
  grantRuleId: string;
  sessionGateId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  dailyPlanId: string;
  dailyPlanTitle: string;
  requestedExtraMinutes: number;
  grantedMinutes: number;
  requestedAt: string;
  decidedAt: string | null;
  decision: DemoLearningScreenTimeGrantDecision;
  allowsDailyPlanAccess: boolean;
  decisionReason: string;
  ruleTraceKey: string;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow =
  {
    learningSessionEvidenceId: string;
    sessionGuardTraceKey: string;
    sessionGateId: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    courseCode: string;
    requestedAt: string;
    accessResult: DemoLearningParentScreenTimeDailyPlanGuardAccessResult;
    accessDecision: DemoLearningSessionGateDecision;
    sessionStarted: boolean;
    sessionDurationMinutes: number;
    blockedReason: string | null;
    nextSafeActionLabel: string;
    evidenceSummary: string;
  };

export type DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow = {
  evidenceKind:
    | 'PARENT_CHILD_COURSE_PLAN_TRACE'
    | 'PARENT_GRANT_RULE'
    | 'SCREEN_TIME_RULE'
    | 'ALLOWED_LEARNING_SESSION'
    | 'BLOCKED_LEARNING_SESSION'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentScreenTimeGrantDailyPlanGuardReport = {
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
  safety: DemoLearningParentScreenTimeGrantDailyPlanGuardSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentScreenTimeGrantDailyPlanGuardTotals;
  statusCounts: DemoLearningParentScreenTimeGrantDailyPlanGuardStatusCounts;
  accessRows: DemoLearningParentScreenTimeGrantDailyPlanGuardAccessRow[];
  grantRuleRows: DemoLearningParentScreenTimeGrantDailyPlanGuardGrantRuleRow[];
  sessionEvidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardSessionEvidenceRow[];
  evidenceRows: DemoLearningParentScreenTimeGrantDailyPlanGuardEvidenceRow[];
};
