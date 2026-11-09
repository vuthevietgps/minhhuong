import type {
  DemoLearningContentOwnerRole,
  DemoLearningCurrency,
  DemoLearningDailyPlanStatus,
  DemoLearningEnrollmentStatus,
  DemoLearningGuardianRelationship,
  DemoLearningPathStatus,
  DemoLearningPaymentStatus,
  DemoLearningPracticeAttemptStatus,
  DemoLearningProgressStatus,
  DemoLearningSubscriptionStatus,
  DemoLearningVideoEvidenceStatus,
} from './shared-statuses.types';
import type {
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety,
  DemoLearningSubscriptionEntitlementDailyPlanAccessStatus,
} from './subscription-entitlement-daily-plan-access.types';

export type DemoLearningParentTeacherProgressAccessSummarySafety =
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;

export type DemoLearningParentTeacherProgressAccessSummaryTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  courseCount: number;
  enrollmentCount: number;
  subscriptionCount: number;
  entitlementCount: number;
  dailyPlanAccessCaseCount: number;
  unlockedAccessCount: number;
  blockedAccessCount: number;
  blockedReasonCount: number;
  progressSummaryCount: number;
  parentSummaryCount: number;
  teacherSummaryCount: number;
  relationshipTraceCount: number;
  parentSummaryWithTraceCount: number;
  teacherSummaryWithTraceCount: number;
  blockedAccessInSummariesWithReasonCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentTeacherProgressAccessRow = {
  progressSummaryId: string;
  relationshipKey: string;
  progressEvidenceKey: string;
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  teacherOwnerIds: string[];
  teacherOwnerNames: string[];
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  teacherName: string;
  enrollmentId: string;
  enrollmentStatus: DemoLearningEnrollmentStatus;
  subscriptionId: string;
  subscriptionStatus: DemoLearningSubscriptionStatus;
  paymentStatus: DemoLearningPaymentStatus;
  entitlementId: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  blockedReason: string | null;
  nextSafeActionLabel: string;
  learningPathId: string;
  learningPathStatus: DemoLearningPathStatus;
  dailyPlanId: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  progressId: string;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  completedLessonCount: number;
  totalLessonCount: number;
  videoEvidenceId: string;
  videoEvidenceStatus: DemoLearningVideoEvidenceStatus;
  practiceAttemptId: string;
  practiceAttemptStatus: DemoLearningPracticeAttemptStatus;
  evidenceCoverageCount: number;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentTeacherProgressParentSummaryRow = {
  parentSummaryId: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  parentGuardianId: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  relationship: DemoLearningGuardianRelationship;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  courseTitle: string;
  entitlementStatus: 'GRANTED' | 'BLOCKED';
  accessStatus: DemoLearningSubscriptionEntitlementDailyPlanAccessStatus;
  blockedReason: string | null;
  nextSafeActionLabel: string;
  dailyPlanId: string;
  dailyPlanStatus: DemoLearningDailyPlanStatus;
  progressStatus: DemoLearningProgressStatus;
  completionPercent: number;
  evidenceCoverageCount: number;
  parentFacingSummary: string;
};

export type DemoLearningParentTeacherProgressTeacherSummaryRow = {
  teacherSummaryId: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  blockedRelationshipTraceIds: string[];
  teacherOwnerId: string;
  teacherName: string;
  teacherEmail: string;
  teacherRole: DemoLearningContentOwnerRole;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  classCode: string;
  classTitle: string;
  studentCount: number;
  progressSummaryIds: string[];
  enrollmentIds: string[];
  unlockedAccessCount: number;
  blockedAccessCount: number;
  blockedReasonCount: number;
  averageCompletionPercent: number;
  completedProgressCount: number;
  needsSupportProgressCount: number;
  withdrawnProgressCount: number;
  evidenceCoverageCount: number;
  teacherFacingSummary: string;
};

export type DemoLearningParentTeacherProgressAccessEvidenceRow = {
  evidenceKind:
    | 'PARENT_GUARDIAN_LINK'
    | 'TEACHER_COURSE_LINK'
    | 'PROGRESS_ACCESS_SUMMARY'
    | 'BLOCKED_REASON_SUMMARY'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningParentTeacherProgressAccessSummaryReport = {
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
  safety: DemoLearningParentTeacherProgressAccessSummarySafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentTeacherProgressAccessSummaryTotals;
  progressRows: DemoLearningParentTeacherProgressAccessRow[];
  parentSummaryRows: DemoLearningParentTeacherProgressParentSummaryRow[];
  teacherSummaryRows: DemoLearningParentTeacherProgressTeacherSummaryRow[];
  evidenceRows: DemoLearningParentTeacherProgressAccessEvidenceRow[];
};
