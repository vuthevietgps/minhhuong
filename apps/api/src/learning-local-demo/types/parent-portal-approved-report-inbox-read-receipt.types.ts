import type { DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety } from './parent-teacher-report-review-queue-message-preview.types';
import type {
  DemoLearningCurrency,
  DemoLearningReportPermissionDecision,
} from './shared-statuses.types';

export type DemoLearningParentPortalApprovedReportInboxVisibility =
  'VISIBLE_TO_PARENT' | 'HIDDEN_HELD_REVIEW';

export type DemoLearningParentPortalApprovedReportReadAckStatus =
  'READ_ACKNOWLEDGED';

export type DemoLearningParentPortalApprovedReportInboxReadReceiptSafety =
  DemoLearningParentTeacherReportReviewQueueMessagePreviewSafety;

export type DemoLearningParentPortalApprovedReportInboxReadReceiptTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  courseCount: number;
  approvedPreviewCount: number;
  heldPreviewCount: number;
  parentInboxItemCount: number;
  visibleParentInboxItemCount: number;
  hiddenHeldPreviewCount: number;
  readAckEvidenceCount: number;
  permissionRedactionReferenceCount: number;
  parentInboxTraceCount: number;
  visibleInboxItemsWithStableRelationshipTraceCount: number;
  hiddenHeldPreviewsWithReasonCount: number;
  visibleParentPreviewWithPermissionRedactionEvidenceCount: number;
  alignedApprovedParentInboxEntryCount: number;
  alignedParentReadReceiptCount: number;
  stableAlignedReadReceiptTraceCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentPortalApprovedReportInboxRow = {
  parentInboxItemId: string;
  messagePreviewId: string;
  reviewQueueItemId: string;
  reportSummaryId: string;
  permissionCaseId: string;
  permissionRedactionReferenceId: string;
  decisionTraceId: string;
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  classCode: string;
  parentGuardianId: string;
  parentGuardianName: string;
  inboxVisibility: DemoLearningParentPortalApprovedReportInboxVisibility;
  parentVisible: boolean;
  hiddenFromParent: boolean;
  hiddenReason: string | null;
  visibleSubject: string | null;
  visibleBody: string | null;
  visibleCourseLabel: string | null;
  permissionDecision: DemoLearningReportPermissionDecision;
  permissionEvidenceReferenced: boolean;
  redactionEvidenceReferenced: boolean;
  redactedFieldVisibilityIds: string[];
  deniedFieldVisibilityIds: string[];
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  aiProviderExecutionUsed: false;
  notificationDeliveryUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentPortalApprovedReportReadAckRow = {
  readAckEvidenceId: string;
  parentInboxItemId: string;
  messagePreviewId: string;
  parentGuardianId: string;
  parentGuardianName: string;
  studentId: string;
  childProfileId: string;
  readAckStatus: DemoLearningParentPortalApprovedReportReadAckStatus;
  readAt: string;
  acknowledgedAt: string;
  acknowledgementLabel: string;
  evidenceReason: string;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  notificationDeliveryUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow =
  {
    evidenceKind:
      | 'VISIBLE_PARENT_INBOX_ITEM'
      | 'HIDDEN_HELD_PREVIEW'
      | 'READ_ACK_RECEIPT'
      | 'ALIGNED_APPROVED_DELIVERY_READ_RECEIPT'
      | 'PERMISSION_REDACTION_REFERENCE'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningParentPortalApprovedReportInboxReadReceiptReport = {
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
  safety: DemoLearningParentPortalApprovedReportInboxReadReceiptSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentPortalApprovedReportInboxReadReceiptTotals;
  parentInboxRows: DemoLearningParentPortalApprovedReportInboxRow[];
  readAckRows: DemoLearningParentPortalApprovedReportReadAckRow[];
  evidenceRows: DemoLearningParentPortalApprovedReportInboxReadReceiptEvidenceRow[];
};
