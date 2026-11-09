import type { DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety } from './parent-teacher-report-permission-privacy-redaction.types';
import type {
  DemoLearningCurrency,
  DemoLearningReportPermissionActorRole,
  DemoLearningReportPermissionDecision,
  DemoLearningReportPermissionScope,
} from './shared-statuses.types';

export type DemoLearningReportPreviewDecisionStatus =
  'APPROVED' | 'HELD_NEEDS_EDIT';

export type DemoLearningReportReviewQueueReviewerRole = 'TEACHER' | 'ADMIN';

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety =
  DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety;

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  courseCount: number;
  reportSummaryCount: number;
  permissionRedactionReferenceCount: number;
  reviewQueueItemCount: number;
  messagePreviewCount: number;
  approvedPreviewCount: number;
  heldPreviewCount: number;
  redactionAwarePreviewCount: number;
  reviewDecisionTraceCount: number;
  casesWithStableRelationshipTraceCount: number;
  heldOrNeedsEditWithReasonCount: number;
  approvedWithPermissionRedactionEvidenceCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentTeacherReportReviewSummaryRow = {
  reportSummaryId: string;
  sourceProgressSummaryId: string;
  sourceParentSummaryId: string | null;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classId: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  summary: string;
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportPermissionRedactionReferenceRow = {
  permissionRedactionReferenceId: string;
  permissionCaseId: string;
  actorId: string;
  actorRole: DemoLearningReportPermissionActorRole;
  permissionDecision: DemoLearningReportPermissionDecision;
  reportScope: DemoLearningReportPermissionScope;
  visibleFieldCount: number;
  redactedFieldCount: number;
  deniedFieldCount: number;
  redactedFieldVisibilityIds: string[];
  deniedFieldVisibilityIds: string[];
  permissionReason: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportReviewQueueRow = {
  reviewQueueItemId: string;
  reportSummaryId: string;
  permissionCaseId: string;
  permissionRedactionReferenceId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classId: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: DemoLearningReportReviewQueueReviewerRole;
  reviewStatus: DemoLearningReportPreviewDecisionStatus;
  createdAt: string;
  reviewedAt: string;
  reviewReason: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportMessagePreviewRow = {
  messagePreviewId: string;
  reviewQueueItemId: string;
  reportSummaryId: string;
  permissionCaseId: string;
  permissionRedactionReferenceId: string;
  previewDecision: DemoLearningReportPreviewDecisionStatus;
  decisionTraceId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  reviewerName: string;
  permissionDecision: DemoLearningReportPermissionDecision;
  permissionEvidenceReferenced: boolean;
  redactionEvidenceReferenced: boolean;
  redactedFieldVisibilityIds: string[];
  deniedFieldVisibilityIds: string[];
  heldReason: string | null;
  approvalReason: string | null;
  messagePreview: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  aiProviderExecutionUsed: false;
  notificationDeliveryUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow =
  {
    evidenceKind:
      | 'REPORT_SUMMARY_SOURCE'
      | 'PERMISSION_REDACTION_REFERENCE'
      | 'REVIEW_QUEUE_DECISION'
      | 'APPROVED_PARENT_PREVIEW'
      | 'HELD_PARENT_PREVIEW'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningParentTeacherReportReviewQueueMessagePreviewReport = {
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
  safety: DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentTeacherReportReviewQueueMessagePreviewTotals;
  reportSummaryRows: DemoLearningParentTeacherReportReviewSummaryRow[];
  permissionRedactionReferenceRows: DemoLearningParentTeacherReportPermissionRedactionReferenceRow[];
  reviewQueueRows: DemoLearningParentTeacherReportReviewQueueRow[];
  messagePreviewRows: DemoLearningParentTeacherReportMessagePreviewRow[];
  evidenceRows: DemoLearningParentTeacherReportReviewQueueMessagePreviewEvidenceRow[];
};
