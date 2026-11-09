import type { DemoLearningMvpEndToEndReadinessTraceSafety } from './mvp-end-to-end-readiness-trace.types';
import type { DemoLearningCurrency } from './shared-statuses.types';

export type DemoLearningMvpRoleJourneyEntrypointRole =
  'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN_OPERATOR';

export type DemoLearningMvpRoleJourneyEntrypointStatus =
  'LOCAL_DEMO_READY_WITH_NOTES';

export type DemoLearningMvpRoleJourneyEntrypointOwner =
  'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN_OPERATOR';

export type DemoLearningMvpRoleJourneyEntrypointsSafety =
  DemoLearningMvpEndToEndReadinessTraceSafety;

export type DemoLearningMvpRoleJourneyEntrypointsStatusCounts = {
  role: Record<DemoLearningMvpRoleJourneyEntrypointRole, number>;
  status: Record<DemoLearningMvpRoleJourneyEntrypointStatus, number>;
  ownerLabel: Record<DemoLearningMvpRoleJourneyEntrypointOwner, number>;
};

export type DemoLearningMvpRoleJourneyEntrypointsTotals = {
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

export type DemoLearningMvpRoleJourneyEntrypointRow = {
  roleEntrypointId: string;
  role: DemoLearningMvpRoleJourneyEntrypointRole;
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
  statusLabel: DemoLearningMvpRoleJourneyEntrypointStatus;
  reasonLabel: string;
  ownerLabel: DemoLearningMvpRoleJourneyEntrypointOwner;
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
};

export type DemoLearningMvpRoleJourneyTraceRow = {
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
  traceStatus: DemoLearningMvpRoleJourneyEntrypointStatus;
  reasonLabel: string;
  actionLabel: string;
  ownerLabel: 'ADMIN_OPERATOR';
  evidenceSummary: string;
};

export type DemoLearningMvpRoleJourneyEntrypointsEvidenceRow = {
  evidenceKind:
    | 'STUDENT_ENTRYPOINT'
    | 'PARENT_ENTRYPOINT'
    | 'TEACHER_ENTRYPOINT'
    | 'ADMIN_OPERATOR_ENTRYPOINT'
    | 'STABLE_ROLE_JOURNEY_TRACE'
    | 'SAFETY_GATE';
  evidenceCount: number;
  stableFixtureIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
  evidenceSummary: string;
};

export type DemoLearningMvpRoleJourneyEntrypointsReport = {
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
  safety: DemoLearningMvpRoleJourneyEntrypointsSafety;
  currentStatus: {
    status: DemoLearningMvpRoleJourneyEntrypointStatus;
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningMvpRoleJourneyEntrypointsTotals;
  statusCounts: DemoLearningMvpRoleJourneyEntrypointsStatusCounts;
  entrypointRows: DemoLearningMvpRoleJourneyEntrypointRow[];
  stableTraceRows: DemoLearningMvpRoleJourneyTraceRow[];
  evidenceRows: DemoLearningMvpRoleJourneyEntrypointsEvidenceRow[];
};
