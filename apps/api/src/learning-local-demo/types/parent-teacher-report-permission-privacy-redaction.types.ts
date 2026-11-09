import type {
  DemoLearningCurrency,
  DemoLearningReportPermissionActorRole,
} from './shared-statuses.types';
import type { DemoLearningParentTeacherReportPermissionCaseRow } from './shared.types';
import type { DemoLearningSubscriptionEntitlementDailyPlanAccessSafety } from './subscription-entitlement-daily-plan-access.types';

export type DemoLearningReportFieldVisibility =
  'VISIBLE' | 'REDACTED' | 'DENIED';

export type DemoLearningReportFieldScope =
  | 'PARENT_VISIBLE'
  | 'TEACHER_VISIBLE'
  | 'ADMIN_VISIBLE'
  | 'SUPPORT_AUDIT_VISIBLE'
  | 'SUPPORT_AUDIT_MUTATION'
  | 'TEACHER_INTERNAL'
  | 'GUARDIAN_PRIVATE'
  | 'NON_OWNING_CHILD_PRIVATE'
  | 'UNASSIGNED_CLASS_PRIVATE';

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety =
  DemoLearningSubscriptionEntitlementDailyPlanAccessSafety;

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionTotals = {
  studentCount: number;
  parentGuardianCount: number;
  teacherCount: number;
  supportOpsCount: number;
  courseCount: number;
  reportPermissionCaseCount: number;
  allowedReportCaseCount: number;
  deniedReportCaseCount: number;
  teacherUnassignedDeniedCaseCount: number;
  supportOpsAuditReadOnlyCaseCount: number;
  visibleFieldCount: number;
  redactedFieldCount: number;
  deniedFieldCount: number;
  parentVisibleFieldCount: number;
  teacherVisibleFieldCount: number;
  supportOpsVisibleFieldCount: number;
  parentRedactedFieldCount: number;
  teacherRedactedFieldCount: number;
  supportOpsDeniedFieldCount: number;
  permissionTraceCount: number;
  casesWithTraceCount: number;
  deniedOrRedactedCaseWithReasonCount: number;
  redactedOrDeniedFieldWithReasonCount: number;
  evidenceRowCount: number;
  localDemoNoteCount: number;
  productionReadyClaimCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningParentTeacherReportFieldVisibilityRow = {
  fieldVisibilityId: string;
  permissionCaseId: string;
  actorId: string;
  actorRole: DemoLearningReportPermissionActorRole;
  fieldKey: string;
  fieldLabel: string;
  fieldScope: DemoLearningReportFieldScope;
  visibility: DemoLearningReportFieldVisibility;
  visibleValue: string | null;
  redactedValue: string | null;
  reason: string | null;
  relationshipTraceKey: string;
  relationshipTraceIds: string[];
  fixtureOnly: true;
  providerUsed: false;
  mutationUsed: false;
};

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow =
  {
    evidenceKind:
      | 'PARENT_ALLOWED_REPORT_SCOPE'
      | 'PARENT_DENIED_NON_OWNER_SCOPE'
      | 'TEACHER_ASSIGNED_CLASS_SCOPE'
      | 'TEACHER_DENIED_UNASSIGNED_CLASS_SCOPE'
      | 'ADMIN_CLASS_SCOPE'
      | 'SUPPORT_OPS_AUDIT_READ_ONLY_SCOPE'
      | 'FIELD_VISIBILITY_REDACTION'
      | 'SAFETY_GATE';
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  };

export type DemoLearningParentTeacherReportPermissionPrivacyRedactionReport = {
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
  safety: DemoLearningParentTeacherReportPermissionPrivacyRedactionSafety;
  currentStatus: {
    status: 'LOCAL_DEMO_READY_WITH_NOTES';
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: DemoLearningParentTeacherReportPermissionPrivacyRedactionTotals;
  permissionCaseRows: DemoLearningParentTeacherReportPermissionCaseRow[];
  fieldVisibilityRows: DemoLearningParentTeacherReportFieldVisibilityRow[];
  evidenceRows: DemoLearningParentTeacherReportPermissionPrivacyRedactionEvidenceRow[];
};
