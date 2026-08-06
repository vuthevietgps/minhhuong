"use client";

import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMoney, publicApiBaseUrl } from "../_lib/admin-client";

type DemoLearningEnrollmentReportRow = {
  enrollmentId: string;
  childProfileId: string;
  studentName: string;
  courseCode: string;
  courseTitle: string;
  enrollmentStatus: "ACTIVE" | "PENDING" | "CANCELED";
  subscriptionStatus:
    "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  refundStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "NONE";
  grossPaidCents: number;
  pendingPaymentCents: number;
  refundedCents: number;
  netRevenueCents: number;
  commissionPendingCents: number;
  commissionPayableCents: number;
  commissionApprovedCents: number;
  commissionCanceledCents: number;
};

type DemoLearningCoreReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    paymentProviderUsed: false;
    liveAdsExecuted: false;
    realStudentMutationUsed: false;
    realCourseMutationUsed: false;
    realEnrollmentMutationUsed: false;
    realPaymentMutationUsed: false;
    realRefundMutationUsed: false;
    realCommissionMutationUsed: false;
    realClassMutationUsed: false;
    realSessionMutationUsed: false;
    realAttendanceMutationUsed: false;
    realProgressMutationUsed: false;
    realErpMutationUsed: false;
    secretsRequired: false;
  };
  totals: {
    studentCount: number;
    courseCount: number;
    enrollmentCount: number;
    activeEnrollmentCount: number;
    pendingEnrollmentCount: number;
    canceledEnrollmentCount: number;
    subscriptionCount: number;
    activeSubscriptionCount: number;
    trialingSubscriptionCount: number;
    paymentCount: number;
    pendingPaymentCount: number;
    succeededPaymentCount: number;
    refundedPaymentCount: number;
    refundCount: number;
    commissionCount: number;
    pendingCommissionCount: number;
    payableCommissionCount: number;
    approvedCommissionCount: number;
    canceledCommissionCount: number;
    grossPaidCents: number;
    pendingPaymentCents: number;
    refundedCents: number;
    netRevenueCents: number;
    commissionEarnedCents: number;
  };
  rows: DemoLearningEnrollmentReportRow[];
};

type DemoLearningStudentCourseEnrollmentSubscriptionFlowReport = {
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

type DemoLearningSubscriptionEntitlementDailyPlanAccessReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningStudentCourseEnrollmentSubscriptionFlowReport["safety"];
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
    entitlementCount: number;
    learningPathCount: number;
    dailyPlanAccessCaseCount: number;
    unlockedAccessCount: number;
    blockedAccessCount: number;
    blockedPendingPaymentCount: number;
    blockedExpiredCount: number;
    blockedRefundedCount: number;
    blockedCanceledCount: number;
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
  accessRows: {
    relationshipKey: string;
    entitlementId: string;
    entitlementStatus: "GRANTED" | "BLOCKED";
    accessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    enrollmentId: string;
    enrollmentStatus: DemoLearningEnrollmentReportRow["enrollmentStatus"];
    subscriptionId: string;
    subscriptionStatus: DemoLearningEnrollmentReportRow["subscriptionStatus"];
    paymentId: string;
    paymentStatus: DemoLearningEnrollmentReportRow["paymentStatus"];
    refundIds: string[];
    learningPathId: string;
    learningPathTitle: string;
    learningPathStatus: "ACTIVE" | "COMPLETED" | "NEEDS_SUPPORT" | "WITHDRAWN";
    dailyPlanId: string;
    dailyPlanTitle: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    planDate: string;
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
  evidenceRows: {
    evidenceKind:
      | "COURSE_ENTITLEMENT"
      | "UNLOCKED_DAILY_PLAN_ACCESS"
      | "BLOCKED_DAILY_PLAN_ACCESS"
      | "RELATIONSHIP_TRACE"
      | "SAFETY_GATE";
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
};

type DemoLearningParentTeacherProgressAccessSummaryReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningStudentCourseEnrollmentSubscriptionFlowReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
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
  progressRows: {
    progressSummaryId: string;
    relationshipKey: string;
    progressEvidenceKey: string;
    parentGuardianName: string;
    teacherOwnerNames: string[];
    studentName: string;
    childProfileId: string;
    courseCode: string;
    classCode: string;
    enrollmentId: string;
    subscriptionStatus:
      "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
    entitlementStatus: "GRANTED" | "BLOCKED";
    accessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    dailyPlanId: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    completionPercent: number;
    videoEvidenceStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
    practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
    evidenceCoverageCount: number;
  }[];
  parentSummaryRows: {
    parentSummaryId: string;
    relationshipTraceKey: string;
    relationshipTraceIds: string[];
    parentGuardianName: string;
    parentGuardianEmail: string;
    relationship: "MOTHER" | "FATHER" | "GUARDIAN";
    studentName: string;
    childProfileId: string;
    courseCode: string;
    entitlementStatus: "GRANTED" | "BLOCKED";
    accessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    dailyPlanId: string;
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    completionPercent: number;
    parentFacingSummary: string;
  }[];
  teacherSummaryRows: {
    teacherSummaryId: string;
    relationshipTraceKey: string;
    relationshipTraceIds: string[];
    blockedRelationshipTraceIds: string[];
    teacherName: string;
    teacherEmail: string;
    teacherRole: "TEACHER" | "ADMIN";
    courseCode: string;
    classCode: string;
    studentCount: number;
    unlockedAccessCount: number;
    blockedAccessCount: number;
    blockedReasonCount: number;
    averageCompletionPercent: number;
    evidenceCoverageCount: number;
    teacherFacingSummary: string;
  }[];
};

type DemoLearningParentTeacherReportPermissionPrivacyRedactionReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningStudentCourseEnrollmentSubscriptionFlowReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    parentGuardianCount: number;
    teacherCount: number;
    courseCount: number;
    reportPermissionCaseCount: number;
    allowedReportCaseCount: number;
    deniedReportCaseCount: number;
    visibleFieldCount: number;
    redactedFieldCount: number;
    deniedFieldCount: number;
    parentVisibleFieldCount: number;
    teacherVisibleFieldCount: number;
    parentRedactedFieldCount: number;
    teacherRedactedFieldCount: number;
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
  permissionCaseRows: {
    permissionCaseId: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
    actorRole: "PARENT_GUARDIAN" | "TEACHER" | "ADMIN";
    reportScope:
      "OWN_CHILD" | "NON_OWNING_CHILD" | "ASSIGNED_CLASS" | "ADMIN_CLASS";
    permissionDecision: "ALLOWED" | "DENIED";
    decisionReason: string;
    targetStudentName: string | null;
    targetChildProfileId: string | null;
    targetCourseCode: string | null;
    targetClassCode: string | null;
    sourceAccessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED"
      | "CLASS_SCOPE"
      | "DENIED_SCOPE";
    relationshipTraceKey: string;
    visibleFieldCount: number;
    redactedFieldCount: number;
    deniedFieldCount: number;
    caseSummary: string;
  }[];
  fieldVisibilityRows: {
    fieldVisibilityId: string;
    permissionCaseId: string;
    actorId: string;
    actorRole: "PARENT_GUARDIAN" | "TEACHER" | "ADMIN";
    fieldKey: string;
    fieldLabel: string;
    fieldScope:
      | "PARENT_VISIBLE"
      | "TEACHER_VISIBLE"
      | "ADMIN_VISIBLE"
      | "TEACHER_INTERNAL"
      | "GUARDIAN_PRIVATE"
      | "NON_OWNING_CHILD_PRIVATE";
    visibility: "VISIBLE" | "REDACTED" | "DENIED";
    visibleValue: string | null;
    redactedValue: string | null;
    reason: string | null;
    relationshipTraceKey: string;
  }[];
};

type DemoLearningParentTeacherReportReviewQueueMessagePreviewReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningParentTeacherReportPermissionPrivacyRedactionReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
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
  reportSummaryRows: {
    reportSummaryId: string;
    sourceProgressSummaryId: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    courseId: string;
    courseCode: string;
    classId: string;
    classCode: string;
    parentGuardianName: string;
    relationshipTraceKey: string;
    summary: string;
  }[];
  permissionRedactionReferenceRows: {
    permissionRedactionReferenceId: string;
    permissionCaseId: string;
    actorId: string;
    actorRole: "PARENT_GUARDIAN" | "TEACHER" | "ADMIN";
    permissionDecision: "ALLOWED" | "DENIED";
    reportScope:
      "OWN_CHILD" | "NON_OWNING_CHILD" | "ASSIGNED_CLASS" | "ADMIN_CLASS";
    visibleFieldCount: number;
    redactedFieldCount: number;
    deniedFieldCount: number;
    permissionReason: string;
    relationshipTraceKey: string;
  }[];
  reviewQueueRows: {
    reviewQueueItemId: string;
    reportSummaryId: string;
    permissionCaseId: string;
    permissionRedactionReferenceId: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    classCode: string;
    parentGuardianName: string;
    reviewerName: string;
    reviewerRole: "TEACHER" | "ADMIN";
    reviewStatus: "APPROVED" | "HELD_NEEDS_EDIT";
    reviewedAt: string;
    reviewReason: string;
    relationshipTraceKey: string;
  }[];
  messagePreviewRows: {
    messagePreviewId: string;
    reviewQueueItemId: string;
    permissionCaseId: string;
    previewDecision: "APPROVED" | "HELD_NEEDS_EDIT";
    decisionTraceId: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    classCode: string;
    parentGuardianName: string;
    reviewerName: string;
    permissionDecision: "ALLOWED" | "DENIED";
    permissionEvidenceReferenced: boolean;
    redactionEvidenceReferenced: boolean;
    redactedFieldVisibilityIds: string[];
    deniedFieldVisibilityIds: string[];
    heldReason: string | null;
    approvalReason: string | null;
    messagePreview: string;
    relationshipTraceKey: string;
    notificationDeliveryUsed: false;
    aiProviderExecutionUsed: false;
    mutationUsed: false;
  }[];
};

type DemoLearningParentPortalApprovedReportInboxReadReceiptReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningParentTeacherReportReviewQueueMessagePreviewReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
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
  parentInboxRows: {
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
    inboxVisibility: "VISIBLE_TO_PARENT" | "HIDDEN_HELD_REVIEW";
    parentVisible: boolean;
    hiddenFromParent: boolean;
    hiddenReason: string | null;
    visibleSubject: string | null;
    visibleBody: string | null;
    visibleCourseLabel: string | null;
    permissionDecision: "ALLOWED" | "DENIED";
    permissionEvidenceReferenced: boolean;
    redactionEvidenceReferenced: boolean;
    redactedFieldVisibilityIds: string[];
    deniedFieldVisibilityIds: string[];
    relationshipTraceKey: string;
    notificationDeliveryUsed: false;
    aiProviderExecutionUsed: false;
    mutationUsed: false;
  }[];
  readAckRows: {
    readAckEvidenceId: string;
    parentInboxItemId: string;
    messagePreviewId: string;
    parentGuardianName: string;
    childProfileId: string;
    readAckStatus: "READ_ACKNOWLEDGED";
    readAt: string;
    acknowledgedAt: string;
    acknowledgementLabel: string;
    evidenceReason: string;
    relationshipTraceKey: string;
    notificationDeliveryUsed: false;
    mutationUsed: false;
  }[];
};

type DemoLearningClassAggregateRow = {
  classCode: string;
  classTitle: string;
  courseCode: string;
  teacherName: string;
  status: "ACTIVE" | "COMPLETED";
  studentCount: number;
  sessionCount: number;
  completedSessionCount: number;
  scheduledSessionCount: number;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
  attendanceRatePercent: number;
  averageLearnerCompletionPercent: number;
  completedProgressCount: number;
  needsSupportCount: number;
};

type DemoLearningSessionReportRow = {
  sessionId: string;
  classCode: string;
  courseCode: string;
  sequence: number;
  lessonCode: string;
  title: string;
  status: "SCHEDULED" | "COMPLETED";
  scheduledStart: string;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
};

type DemoLearningLearnerProgressRow = {
  enrollmentId: string;
  studentName: string;
  classCode: string;
  attendanceRecordCount: number;
  presentAttendanceCount: number;
  lateAttendanceCount: number;
  absentAttendanceCount: number;
  excusedAttendanceCount: number;
  attendanceRatePercent: number;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
  completedLessonCount: number;
  totalLessonCount: number;
  completionPercent: number;
};

type DemoLearningClassSessionAttendanceProgressReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningCoreReport["safety"];
  totals: {
    studentCount: number;
    courseCount: number;
    classCount: number;
    activeClassCount: number;
    completedClassCount: number;
    sessionCount: number;
    completedSessionCount: number;
    scheduledSessionCount: number;
    attendanceRecordCount: number;
    presentAttendanceCount: number;
    lateAttendanceCount: number;
    absentAttendanceCount: number;
    excusedAttendanceCount: number;
    attendanceRatePercent: number;
    progressRecordCount: number;
    completedProgressCount: number;
    inProgressCount: number;
    needsSupportCount: number;
    withdrawnProgressCount: number;
    completedLessonCount: number;
    totalLessonCount: number;
    overallCompletionPercent: number;
    averageLearnerCompletionPercent: number;
  };
  classAggregates: DemoLearningClassAggregateRow[];
  sessionRows: DemoLearningSessionReportRow[];
  learnerRows: DemoLearningLearnerProgressRow[];
};

type DemoLearningAssignmentAssessmentRow = {
  assignmentId: string;
  lessonCode: string;
  classCode: string;
  kind: "ASSIGNMENT" | "QUIZ";
  title: string;
  status: "OPEN" | "CLOSED";
  expectedSubmissionCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  scoredSubmissionCount: number;
  pendingFeedbackCount: number;
  averageScorePercent: number;
};

type DemoLearningLearnerAssessmentRow = {
  enrollmentId: string;
  studentName: string;
  classCode: string;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
  expectedAssignmentCount: number;
  submittedSubmissionCount: number;
  lateSubmissionCount: number;
  missingSubmissionCount: number;
  resubmittedSubmissionCount: number;
  scoredSubmissionCount: number;
  feedbackPendingCount: number;
  averageScorePercent: number;
  assignmentCompletionPercent: number;
  progressCompletionPercent: number;
  assessmentBand:
    "EXCELLENT" | "ON_TRACK" | "NEEDS_SUPPORT" | "MISSING" | "WITHDRAWN";
};

type DemoLearningLessonAssignmentAssessmentProgressReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningCoreReport["safety"] & {
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
  };
  totals: {
    lessonCount: number;
    publishedLessonCount: number;
    scheduledLessonCount: number;
    assignmentCount: number;
    quizCount: number;
    assignmentTaskCount: number;
    openAssignmentCount: number;
    closedAssignmentCount: number;
    expectedSubmissionCount: number;
    submissionRecordCount: number;
    submittedSubmissionCount: number;
    lateSubmissionCount: number;
    missingSubmissionCount: number;
    resubmittedSubmissionCount: number;
    completedSubmissionCount: number;
    scoredSubmissionCount: number;
    feedbackGivenCount: number;
    pendingFeedbackCount: number;
    feedbackNotRequiredCount: number;
    averageScorePercent: number;
    excellentLearnerCount: number;
    onTrackLearnerCount: number;
    needsSupportLearnerCount: number;
    withdrawnLearnerCount: number;
    overallAssignmentCompletionPercent: number;
    averageLearnerScorePercent: number;
  };
  assignmentRows: DemoLearningAssignmentAssessmentRow[];
  learnerRows: DemoLearningLearnerAssessmentRow[];
};

type DemoLearningPathEvidenceRow = {
  learningPathId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  title: string;
  pathStatus: "ACTIVE" | "COMPLETED" | "NEEDS_SUPPORT" | "WITHDRAWN";
  dailyPlanCount: number;
  completedDailyPlanCount: number;
  blockedDailyPlanCount: number;
  skippedDailyPlanCount: number;
  completedVideoCount: number;
  passedPracticeCount: number;
  averagePracticeScorePercent: number;
  progressPercent: number;
  learnerStatusBand: "ON_TRACK" | "NEEDS_SUPPORT" | "INACTIVE" | "WITHDRAWN";
};

type DemoLearningDailyPlanEvidenceRow = {
  dailyPlanId: string;
  studentName: string;
  classCode: string;
  lessonCode: string;
  planDate: string;
  title: string;
  dailyPlanStatus:
    "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
  videoEvidenceStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
  videoCompletionPercent: number;
  practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
  practiceScorePercent: number | null;
};

type DemoLearningPathDailyPlanVideoPracticeEvidenceReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningCoreReport["safety"] & {
    noProductionDbRead: true;
    realLessonMutationUsed: false;
    realAssignmentMutationUsed: false;
    realAssessmentMutationUsed: false;
    realLearningPathMutationUsed: false;
    realDailyPlanMutationUsed: false;
    realVideoEvidenceMutationUsed: false;
    realPracticeMutationUsed: false;
  };
  totals: {
    learningPathCount: number;
    dailyPlanCount: number;
    completedDailyPlanCount: number;
    blockedSkippedIncompleteDailyPlanCount: number;
    videoEvidenceCount: number;
    completedVideoCount: number;
    incompleteVideoCount: number;
    skippedVideoCount: number;
    practiceAttemptCount: number;
    passedPracticeCount: number;
    needsRetryPracticeCount: number;
    incompletePracticeCount: number;
    skippedPracticeCount: number;
    averagePracticeScorePercent: number;
    overallDailyPlanCompletionPercent: number;
    averageLearnerProgressPercent: number;
    onTrackLearnerCount: number;
    needsSupportLearnerCount: number;
    inactiveLearnerCount: number;
    withdrawnLearnerCount: number;
  };
  learningPathRows: DemoLearningPathEvidenceRow[];
  dailyPlanRows: DemoLearningDailyPlanEvidenceRow[];
};

type DemoLearningParentTeacherProgressAlertRow = {
  alertId: string;
  studentName: string;
  childProfileId: string;
  parentEmail: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  alertSeverity: "HIGH" | "MEDIUM";
  alertReason:
    | "MISSING_SUBMISSIONS"
    | "LOW_PRACTICE_SCORE"
    | "SKIPPED_VIDEO"
    | "ATTENDANCE_SESSION_GAP"
    | "STALLED_DAILY_PLAN";
  reasonLabel: string;
  evidenceSummary: string;
  progressPercent: number;
  attendanceRatePercent: number;
  teacherInterventionRecommendation: string;
  parentSummary: string;
  followUpStatus: "OPEN" | "SCHEDULED" | "RESOLVED" | "MONITORING";
  recommendedFollowUpAt: string;
};

type DemoLearningParentTeacherAlertReasonSummaryRow = {
  alertReason:
    | "MISSING_SUBMISSIONS"
    | "LOW_PRACTICE_SCORE"
    | "SKIPPED_VIDEO"
    | "ATTENDANCE_SESSION_GAP"
    | "STALLED_DAILY_PLAN";
  reasonLabel: string;
  alertCount: number;
};

type DemoLearningParentTeacherProgressAlertInterventionReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningPathDailyPlanVideoPracticeEvidenceReport["safety"] & {
    aiProviderUsed: false;
    notificationProviderUsed: false;
    realParentMessageMutationUsed: false;
    realTeacherInterventionMutationUsed: false;
  };
  totals: {
    learnerProgressSummaryCount: number;
    alertCount: number;
    highRiskAlertCount: number;
    mediumRiskAlertCount: number;
    resolvedAlertCount: number;
    followUpNeededAlertCount: number;
    teacherInterventionRecommendationCount: number;
    parentSummaryCount: number;
    openFollowUpCount: number;
    scheduledFollowUpCount: number;
    resolvedFollowUpCount: number;
    monitoringFollowUpCount: number;
  };
  topAlertReasons: DemoLearningParentTeacherAlertReasonSummaryRow[];
  alertRows: DemoLearningParentTeacherProgressAlertRow[];
};

type DemoLearningParentScreenTimeChildControlsRow = {
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  relationship: "MOTHER" | "FATHER" | "GUARDIAN";
  studentId: string;
  childProfileId: string;
  studentName: string;
  courseCodes: string[];
  activePolicyId: string | null;
  policyStatus: "ACTIVE" | "PAUSED" | "DISABLED";
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

type DemoLearningParentScreenTimeGateRow = {
  gateId: string;
  dailyPlanId: string;
  studentName: string;
  childProfileId: string;
  guardianName: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  lessonCode: string;
  dailyPlanTitle: string;
  requestedAt: string;
  requestedMinutes: number;
  usedMinutesBeforeSession: number;
  sessionUsedMinutes: number;
  decision: "ALLOWED" | "BLOCKED" | "OVERRIDE_ALLOWED";
  blockedReason:
    | "DAILY_LIMIT_EXCEEDED"
    | "GUARDIAN_DENIED_GRANT"
    | "POLICY_DISABLED_WITHDRAWN"
    | "NONE";
  decidedBy:
    | "fixture_screen_time_policy"
    | "fixture_parent_grant"
    | "fixture_withdrawal_guard";
  safeDailyPlanAccess: boolean;
};

type DemoLearningParentScreenTimeGrantRow = {
  grantRequestId: string;
  sessionGateId: string;
  guardianName: string;
  studentName: string;
  childProfileId: string;
  requestedExtraMinutes: number;
  requestedAt: string;
  decision: "APPROVED" | "DENIED" | "PENDING";
  decidedAt: string | null;
  grantedMinutes: number;
  decisionReason: string;
};

type DemoLearningParentScreenTimeGuardianControlsReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentTeacherProgressAlertInterventionReport["safety"] & {
    realParentGuardianMutationUsed: false;
    realScreenTimePolicyMutationUsed: false;
    realLearningSessionGateMutationUsed: false;
    realScreenTimeGrantMutationUsed: false;
    realDailyPlanAccessMutationUsed: false;
  };
  totals: {
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
  childRows: DemoLearningParentScreenTimeChildControlsRow[];
  gateRows: DemoLearningParentScreenTimeGateRow[];
  grantRows: DemoLearningParentScreenTimeGrantRow[];
};

type DemoLearningParentScreenTimeGrantDailyPlanGuardReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningParentScreenTimeGuardianControlsReport["safety"] & {
    productionReady: false;
    aiProviderExecutionUsed: false;
    realParentMutationUsed: false;
    realSubscriptionMutationUsed: false;
    realLearningMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
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
  accessRows: {
    accessCaseId: string;
    sessionGuardTraceKey: string;
    sessionGuardTraceIds: string[];
    parentGuardianName: string;
    parentGuardianEmail: string;
    relationship: "MOTHER" | "FATHER" | "GUARDIAN";
    studentName: string;
    childProfileId: string;
    courseCode: string;
    classCode: string;
    teacherName: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    lessonCode: string;
    screenTimePolicyStatus: "ACTIVE" | "PAUSED" | "DISABLED";
    dailyAllowedMinutes: number;
    parentGrantRuleId: string | null;
    parentGrantDecision: "APPROVED" | "DENIED" | "PENDING" | "NONE";
    requestedAt: string;
    requestedMinutes: number;
    usedMinutesBeforeSession: number;
    totalAllowedMinutesForCase: number;
    accessDecision: "ALLOWED" | "BLOCKED" | "OVERRIDE_ALLOWED";
    accessResult: "ALLOWED_SESSION" | "BLOCKED_SESSION";
    blockedReasonCode:
      | "DAILY_LIMIT_EXCEEDED"
      | "GUARDIAN_DENIED_GRANT"
      | "POLICY_DISABLED_WITHDRAWN"
      | "NONE";
    blockedReason: string | null;
    nextSafeActionLabel: string;
    learningSessionEvidenceId: string;
    evidenceSummary: string;
  }[];
  grantRuleRows: {
    grantRuleId: string;
    parentGuardianName: string;
    studentName: string;
    childProfileId: string;
    dailyPlanTitle: string;
    requestedExtraMinutes: number;
    grantedMinutes: number;
    decision: "APPROVED" | "DENIED" | "PENDING";
    allowsDailyPlanAccess: boolean;
    decisionReason: string;
    ruleTraceKey: string;
  }[];
  sessionEvidenceRows: {
    learningSessionEvidenceId: string;
    sessionGuardTraceKey: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    dailyPlanTitle: string;
    accessResult: "ALLOWED_SESSION" | "BLOCKED_SESSION";
    accessDecision: "ALLOWED" | "BLOCKED" | "OVERRIDE_ALLOWED";
    sessionStarted: boolean;
    sessionDurationMinutes: number;
    blockedReason: string | null;
    nextSafeActionLabel: string;
  }[];
};

type DemoLearningSessionCompletionPracticeProgressRollupReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningParentScreenTimeGrantDailyPlanGuardReport["safety"] & {
    realLearningSessionCompletionMutationUsed: false;
    realParentProgressSummaryMutationUsed: false;
    realTeacherProgressSummaryMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    courseCount: number;
    dailyPlanSessionReferenceCount: number;
    allowedDailyPlanSessionReferenceCount: number;
    lessonCompletionEvidenceCount: number;
    practiceAttemptEvidenceCount: number;
    scoredPracticeAttemptEvidenceCount: number;
    progressRollupCount: number;
    parentVisibleProgressSummaryCount: number;
    teacherVisibleProgressSummaryCount: number;
    stableTraceCount: number;
    rollupsWithStudentCourseDailyPlanSessionCount: number;
    rollupsWithLessonPracticeEvidenceCount: number;
    rollupsWithParentTeacherSummaryCount: number;
    practiceAttemptsWithDeterministicScoreStatusCount: number;
    rollupsWithCompletionPercentCount: number;
    rollupsWithSafeNextActionLabelCount: number;
    completedRollupCount: number;
    needsSupportRollupCount: number;
    averageCompletionPercent: number;
    averagePracticeScorePercent: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  progressRollupRows: {
    progressRollupId: string;
    stableTraceKey: string;
    stableTraceIds: string[];
    accessCaseId: string;
    learningSessionEvidenceId: string;
    sessionGateId: string;
    sessionId: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    parentGuardianId: string;
    parentGuardianName: string;
    teacherName: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    classId: string;
    classCode: string;
    learningPathId: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    lessonId: string;
    lessonCode: string;
    lessonTitle: string;
    videoEvidenceId: string;
    videoEvidenceStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
    videoCompletionPercent: number;
    lessonCompletionEvidenceId: string;
    lessonCompletionStatus: "COMPLETED" | "INCOMPLETE" | "SKIPPED";
    practiceAttemptId: string;
    practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
    practiceAttemptNumber: number;
    practiceScorePercent: number;
    progressRecordId: string;
    completionPercent: number;
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    rollupStatus: "COMPLETED" | "ON_TRACK" | "NEEDS_SUPPORT" | "IN_PROGRESS";
    parentVisibleProgressSummaryId: string;
    teacherVisibleProgressSummaryId: string;
    nextSafeActionLabel: string;
    evidenceSummary: string;
  }[];
  parentSummaryRows: {
    parentVisibleProgressSummaryId: string;
    progressRollupId: string;
    stableTraceKey: string;
    parentGuardianName: string;
    parentGuardianEmail: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    dailyPlanTitle: string;
    completionPercent: number;
    practiceScorePercent: number;
    rollupStatus: "COMPLETED" | "ON_TRACK" | "NEEDS_SUPPORT" | "IN_PROGRESS";
    nextSafeActionLabel: string;
    parentVisible: true;
    summary: string;
  }[];
  teacherSummaryRows: {
    teacherVisibleProgressSummaryId: string;
    progressRollupId: string;
    stableTraceKey: string;
    teacherName: string;
    classCode: string;
    courseCode: string;
    studentName: string;
    childProfileId: string;
    dailyPlanId: string;
    lessonCode: string;
    completionPercent: number;
    practiceScorePercent: number;
    rollupStatus: "COMPLETED" | "ON_TRACK" | "NEEDS_SUPPORT" | "IN_PROGRESS";
    nextSafeActionLabel: string;
    teacherVisible: true;
    summary: string;
  }[];
};

type DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningSessionCompletionPracticeProgressRollupReport["safety"] & {
    realTeacherInterventionReviewMutationUsed: false;
    realRemedialAssignmentMutationUsed: false;
    realSupportPlanMutationUsed: false;
    realParentSupportSummaryMutationUsed: false;
    realTeacherNextActionMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    needsSupportProgressRollupCount: number;
    teacherInterventionReviewCount: number;
    remedialAssignmentCount: number;
    supportPlanCount: number;
    parentVisibleSupportSummaryCount: number;
    teacherVisibleNextActionCount: number;
    supportReasonCount: number;
    stableTraceCount: number;
    interventionLinksCompleteCount: number;
    supportPlansWithDeterministicStatusCount: number;
    remedialAssignmentsWithDeterministicStatusCount: number;
    teacherNextActionsWithSafeLabelCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  interventionReviewRows: {
    interventionReviewId: string;
    progressRollupId: string;
    stableTraceKey: string;
    studentId: string;
    childProfileId: string;
    studentName: string;
    parentGuardianId: string;
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    classId: string;
    classCode: string;
    sourceDailyPlanId: string;
    sourceDailyPlanTitle: string;
    sourceSessionId: string;
    learningSessionEvidenceId: string;
    remedialDailyPlanId: string;
    remedialPracticeAttemptId: string;
    remedialLessonCode: string;
    progressRecordId: string;
    rollupStatus: "COMPLETED" | "ON_TRACK" | "NEEDS_SUPPORT" | "IN_PROGRESS";
    completionPercent: number;
    practiceScorePercent: number;
    supportReason: string;
    reviewStatus: "REVIEWED";
    remedialAssignmentId: string;
    supportPlanId: string;
    parentVisibleSupportSummaryId: string;
    teacherVisibleNextActionId: string;
    safeNextActionLabel: string;
    evidenceSummary: string;
  }[];
  remedialAssignmentRows: {
    remedialAssignmentId: string;
    interventionReviewId: string;
    supportPlanId: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    courseCode: string;
    remedialDailyPlanId: string;
    remedialDailyPlanTitle: string;
    remedialLessonCode: string;
    sourcePracticeAttemptId: string;
    sourceAssignmentId: string | null;
    status: "ASSIGNED";
    dueAt: string;
    safeNextActionLabel: string;
  }[];
  supportPlanRows: {
    supportPlanId: string;
    interventionReviewId: string;
    progressRollupId: string;
    remedialAssignmentId: string;
    parentVisibleSupportSummaryId: string;
    teacherVisibleNextActionId: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    courseCode: string;
    supportReason: string;
    status: "PARENT_VISIBLE_REVIEW_READY";
    safeNextActionLabel: string;
    parentVisible: true;
    teacherVisible: true;
    planSummary: string;
  }[];
  parentSummaryRows: {
    parentVisibleSupportSummaryId: string;
    supportPlanId: string;
    parentGuardianName: string;
    parentGuardianEmail: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    supportReason: string;
    safeNextActionLabel: string;
    parentVisible: true;
    summary: string;
  }[];
  teacherNextActionRows: {
    teacherVisibleNextActionId: string;
    supportPlanId: string;
    teacherName: string;
    teacherEmail: string;
    classCode: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    status: "SCHEDULED";
    dueAt: string;
    safeNextActionLabel: string;
    teacherVisible: true;
    summary: string;
  }[];
};

type DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport["safety"] & {
    realRemedialRetryCompletionMutationUsed: false;
    realSupportOutcomeEvidenceMutationUsed: false;
    realParentFollowupSummaryMutationUsed: false;
    realTeacherFollowupSummaryMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    supportPlanReferenceCount: number;
    remedialAssignmentReferenceCount: number;
    remedialRetryCompletionCount: number;
    supportOutcomeEvidenceCount: number;
    parentVisibleFollowupSummaryCount: number;
    teacherVisibleFollowupSummaryCount: number;
    safeNextActionCount: number;
    stableTraceCount: number;
    retryLinksCompleteCount: number;
    outcomesWithDeterministicStatusCount: number;
    retriesWithDeterministicStatusScoreCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  retryCompletionRows: {
    retryCompletionId: string;
    stableTraceKey: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    teacherEmail: string;
    courseCode: string;
    classCode: string;
    supportPlanId: string;
    remedialAssignmentId: string;
    remedialDailyPlanTitle: string;
    remedialPracticeAttemptId: string;
    retryStatus: "COMPLETED";
    completedAt: string;
    completionPercent: number;
    scorePercent: number;
    supportOutcomeId: string;
    supportOutcomeStatus: "IMPROVED";
    parentFollowupSummaryId: string;
    teacherFollowupSummaryId: string;
    safeNextActionLabel: string;
    evidenceSummary: string;
  }[];
  supportOutcomeRows: {
    supportOutcomeId: string;
    retryCompletionId: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    courseCode: string;
    status: "IMPROVED";
    scorePercent: number;
    completionPercent: number;
    outcomeAt: string;
    parentFollowupSummaryId: string;
    teacherFollowupSummaryId: string;
    safeNextActionLabel: string;
    parentVisible: boolean;
    teacherVisible: boolean;
    outcomeSummary: string;
  }[];
  parentFollowupSummaryRows: {
    parentFollowupSummaryId: string;
    supportOutcomeId: string;
    parentGuardianName: string;
    parentGuardianEmail: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    retryStatus: "COMPLETED";
    supportOutcomeStatus: "IMPROVED";
    scorePercent: number;
    completionPercent: number;
    safeNextActionLabel: string;
    parentVisible: true;
    summary: string;
  }[];
  teacherFollowupSummaryRows: {
    teacherFollowupSummaryId: string;
    supportOutcomeId: string;
    teacherName: string;
    teacherEmail: string;
    classCode: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    retryStatus: "COMPLETED";
    supportOutcomeStatus: "IMPROVED";
    scorePercent: number;
    completionPercent: number;
    safeNextActionLabel: string;
    teacherVisible: true;
    summary: string;
  }[];
};

type DemoLearningRemedialRetryUnresolvedSupportEscalationReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport["safety"] & {
    realRemedialRetryUnresolvedAttemptMutationUsed: false;
    realUnresolvedSupportOutcomeMutationUsed: false;
    realTeacherEscalationMutationUsed: false;
    realSupportAdjustmentMutationUsed: false;
    realParentEscalationSummaryMutationUsed: false;
    realTeacherEscalationNextActionMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    supportPlanReferenceCount: number;
    remedialAssignmentReferenceCount: number;
    remedialRetryAttemptCount: number;
    failedOrIncompleteRetryCount: number;
    unresolvedSupportOutcomeCount: number;
    teacherEscalationCount: number;
    supportAdjustmentCount: number;
    parentVisibleEscalationSummaryCount: number;
    teacherVisibleEscalationNextActionCount: number;
    safeNextActionCount: number;
    stableTraceCount: number;
    unresolvedRetryLinksCompleteCount: number;
    outcomesWithDeterministicStatusReasonActionCount: number;
    attemptsWithDeterministicStatusScoreCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  retryAttemptRows: {
    retryAttemptId: string;
    stableTraceKey: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    teacherEmail: string;
    courseCode: string;
    classCode: string;
    supportPlanId: string;
    remedialAssignmentId: string;
    remedialDailyPlanTitle: string;
    remedialPracticeAttemptId: string;
    retryStatus: "FAILED" | "INCOMPLETE";
    attemptedAt: string;
    completionPercent: number;
    scorePercent: number;
    unresolvedOutcomeId: string;
    unresolvedOutcomeStatus: "UNRESOLVED";
    reasonCode: "RETRY_SCORE_BELOW_THRESHOLD" | "RETRY_INCOMPLETE";
    teacherEscalationId: string;
    supportAdjustmentId: string;
    parentEscalationSummaryId: string;
    teacherEscalationNextActionId: string;
    safeNextActionLabel: string;
    evidenceSummary: string;
  }[];
  unresolvedOutcomeRows: {
    unresolvedOutcomeId: string;
    retryAttemptId: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    courseCode: string;
    status: "UNRESOLVED";
    reasonCode: "RETRY_SCORE_BELOW_THRESHOLD" | "RETRY_INCOMPLETE";
    scorePercent: number;
    completionPercent: number;
    outcomeAt: string;
    teacherEscalationId: string;
    parentEscalationSummaryId: string;
    teacherEscalationNextActionId: string;
    safeNextActionLabel: string;
    parentVisible: boolean;
    teacherVisible: boolean;
    outcomeSummary: string;
  }[];
  teacherEscalationRows: {
    teacherEscalationId: string;
    supportAdjustmentId: string;
    teacherName: string;
    teacherEmail: string;
    classCode: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    retryStatus: "FAILED" | "INCOMPLETE";
    unresolvedOutcomeStatus: "UNRESOLVED";
    reasonCode: "RETRY_SCORE_BELOW_THRESHOLD" | "RETRY_INCOMPLETE";
    escalationStatus: "SCHEDULED";
    supportAdjustmentStatus: "ADJUSTED";
    safeNextActionLabel: string;
    escalationSummary: string;
    supportAdjustmentSummary: string;
  }[];
  parentEscalationSummaryRows: {
    parentEscalationSummaryId: string;
    parentGuardianName: string;
    parentGuardianEmail: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    retryStatus: "FAILED" | "INCOMPLETE";
    unresolvedOutcomeStatus: "UNRESOLVED";
    reasonCode: "RETRY_SCORE_BELOW_THRESHOLD" | "RETRY_INCOMPLETE";
    scorePercent: number;
    completionPercent: number;
    safeNextActionLabel: string;
    parentVisible: true;
    summary: string;
  }[];
  teacherEscalationNextActionRows: {
    teacherEscalationNextActionId: string;
    teacherName: string;
    teacherEmail: string;
    classCode: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    retryStatus: "FAILED" | "INCOMPLETE";
    unresolvedOutcomeStatus: "UNRESOLVED";
    reasonCode: "RETRY_SCORE_BELOW_THRESHOLD" | "RETRY_INCOMPLETE";
    safeNextActionLabel: string;
    teacherVisible: true;
    summary: string;
  }[];
};

type DemoLearningTeacherEscalationFollowupResolutionReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningRemedialRetryUnresolvedSupportEscalationReport["safety"] & {
    realTeacherReviewedEscalationMutationUsed: false;
    realAdjustedSupportRetryCompletionMutationUsed: false;
    realResolvedSupportOutcomeMutationUsed: false;
    realParentClosureSummaryMutationUsed: false;
    realTeacherClosureNoteMutationUsed: false;
  };
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    teacherCount: number;
    courseCount: number;
    unresolvedEscalationReferenceCount: number;
    teacherReviewedEscalationCount: number;
    adjustedSupportRetryCompletionCount: number;
    resolvedSupportOutcomeCount: number;
    parentVisibleClosureSummaryCount: number;
    teacherVisibleClosureNoteCount: number;
    safeNextActionCount: number;
    stableTraceCount: number;
    resolvedFlowLinksCompleteCount: number;
    outcomesWithDeterministicStatusReasonActionCount: number;
    adjustedRetriesWithDeterministicStatusScoreCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  resolutionRows: {
    resolutionId: string;
    stableTraceKey: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    teacherEmail: string;
    courseCode: string;
    classCode: string;
    supportPlanId: string;
    remedialAssignmentId: string;
    remedialDailyPlanTitle: string;
    remedialPracticeAttemptId: string;
    unresolvedRetryAttemptId: string;
    unresolvedOutcomeId: string;
    teacherEscalationId: string;
    supportAdjustmentId: string;
    teacherReviewedEscalationId: string;
    teacherReviewedEscalationStatus: "REVIEWED";
    teacherReviewedAt: string;
    adjustedSupportRetryCompletionId: string;
    adjustedSupportRetryStatus: "COMPLETED";
    completedAt: string;
    completionPercent: number;
    scorePercent: number;
    resolvedSupportOutcomeId: string;
    resolvedSupportOutcomeStatus: "RESOLVED";
    resolvedOutcomeReasonCode: "ADJUSTED_RETRY_COMPLETED";
    parentClosureSummaryId: string;
    teacherClosureNoteId: string;
    safeNextActionLabel: string;
    evidenceSummary: string;
  }[];
  teacherReviewedEscalationRows: {
    teacherReviewedEscalationId: string;
    teacherEscalationId: string;
    supportAdjustmentId: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    teacherEmail: string;
    courseCode: string;
    classCode: string;
    reviewStatus: "REVIEWED";
    reviewedAt: string;
    safeNextActionLabel: string;
    summary: string;
  }[];
  adjustedSupportRetryCompletionRows: {
    adjustedSupportRetryCompletionId: string;
    supportAdjustmentId: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    courseCode: string;
    retryStatus: "COMPLETED";
    completedAt: string;
    scorePercent: number;
    completionPercent: number;
    resolvedSupportOutcomeId: string;
    safeNextActionLabel: string;
    summary: string;
  }[];
  resolvedSupportOutcomeRows: {
    resolvedSupportOutcomeId: string;
    adjustedSupportRetryCompletionId: string;
    studentName: string;
    childProfileId: string;
    teacherName: string;
    courseCode: string;
    status: "RESOLVED";
    reasonCode: "ADJUSTED_RETRY_COMPLETED";
    scorePercent: number;
    completionPercent: number;
    outcomeAt: string;
    parentClosureSummaryId: string;
    teacherClosureNoteId: string;
    safeNextActionLabel: string;
    parentVisible: boolean;
    teacherVisible: boolean;
    outcomeSummary: string;
  }[];
  parentClosureSummaryRows: {
    parentClosureSummaryId: string;
    resolvedSupportOutcomeId: string;
    parentGuardianName: string;
    parentGuardianEmail: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    resolvedOutcomeStatus: "RESOLVED";
    resolvedOutcomeReasonCode: "ADJUSTED_RETRY_COMPLETED";
    scorePercent: number;
    completionPercent: number;
    safeNextActionLabel: string;
    parentVisible: true;
    summary: string;
  }[];
  teacherClosureNoteRows: {
    teacherClosureNoteId: string;
    resolvedSupportOutcomeId: string;
    teacherName: string;
    teacherEmail: string;
    classCode: string;
    studentName: string;
    childProfileId: string;
    courseCode: string;
    resolvedOutcomeStatus: "RESOLVED";
    resolvedOutcomeReasonCode: "ADJUSTED_RETRY_COMPLETED";
    scorePercent: number;
    completionPercent: number;
    safeNextActionLabel: string;
    teacherVisible: true;
    summary: string;
  }[];
};

type DemoLearningTeacherContentLibraryItemRow = {
  contentItemId: string;
  ownerName: string;
  ownerEmail: string;
  ownerRole: "TEACHER" | "ADMIN";
  courseCode: string;
  lessonCode: string;
  assetKind: "VIDEO" | "PRACTICE" | "LESSON";
  title: string;
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  classAssignmentCount: number;
  learningPathPublishCount: number;
  studentVisibilityCount: number;
  parentVisibleSummaryCount: number;
  needsTeacherReview: boolean;
  blockedReason: string;
};

type DemoLearningTeacherContentStudentVisibilityRow = {
  visibilityId: string;
  contentTitle: string;
  assetKind: "VIDEO" | "PRACTICE" | "LESSON";
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibilityStatus: "VISIBLE" | "BLOCKED_UNPUBLISHED" | "BLOCKED_ARCHIVED";
  dailyPlanTitle: string;
  dailyPlanStatus:
    "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
  planDate: string;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  lessonCode: string;
  studentVisible: boolean;
  parentVisible: boolean;
  availableOnDailyPlan: boolean;
  blockedReason: string;
};

type DemoLearningTeacherContentParentSummaryRow = {
  parentGuardianName: string;
  studentName: string;
  childProfileId: string;
  courseCodes: string[];
  classCodes: string[];
  parentVisibleItemCount: number;
  blockedItemCount: number;
  itemsNeedingTeacherReviewCount: number;
  nextAvailableDailyPlanDate: string | null;
  summary: string;
};

type DemoLearningTeacherContentLibraryLearningPathPublishReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentScreenTimeGuardianControlsReport["safety"] & {
    realContentLibraryMutationUsed: false;
    realContentPublishMutationUsed: false;
    realContentUploadMutationUsed: false;
    realStorageCdnMutationUsed: false;
    realTeacherAdminAccountMutationUsed: false;
    realStudentClassVisibilityMutationUsed: false;
    realParentSummaryMutationUsed: false;
  };
  totals: {
    teacherAdminCount: number;
    contentItemCount: number;
    videoAssetCount: number;
    practiceAssetCount: number;
    lessonAssetCount: number;
    draftContentCount: number;
    publishedContentCount: number;
    archivedContentCount: number;
    learningPathPublishCount: number;
    classAssignmentCount: number;
    studentVisibilityCount: number;
    parentVisibleSummaryCount: number;
    blockedUnpublishedItemCount: number;
    itemsNeedingTeacherReviewCount: number;
  };
  contentRows: DemoLearningTeacherContentLibraryItemRow[];
  studentVisibilityRows: DemoLearningTeacherContentStudentVisibilityRow[];
  parentSummaryRows: DemoLearningTeacherContentParentSummaryRow[];
};

type DemoLearningAiTutorChatSessionRow = {
  chatSessionId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  dailyPlanTitle: string;
  lessonCode: string;
  sessionStatus: "ACTIVE" | "ESCALATED" | "CLOSED";
  messageCount: number;
  allowedMessageCount: number;
  blockedMessageCount: number;
  safetyFlagCount: number;
  teacherReviewItemCount: number;
  supportRecommendationCount: number;
  parentSummaryReady: boolean;
};

type DemoLearningAiTutorTeacherReviewQueueRow = {
  teacherReviewItemId: string;
  studentName: string;
  childProfileId: string;
  classCode: string;
  lessonCode: string;
  dailyPlanTitle: string;
  assignedTeacherName: string;
  topicCategory:
    | "LESSON_HELP"
    | "PRACTICE_HINT"
    | "STUDY_PLANNING"
    | "PERSONAL_DATA"
    | "OFF_TOPIC_GAMING"
    | "ACCOUNT_ACCESS"
    | "SAFETY_REDIRECT"
    | "ACADEMIC_INTEGRITY";
  severity: "LOW" | "MEDIUM" | "HIGH";
  reviewStatus: "OPEN" | "REVIEWED" | "RESOLVED";
  actionSummary: string;
  parentSummaryReady: boolean;
  supportRecommendationCount: number;
};

type DemoLearningAiTutorSupportRecommendationRow = {
  supportRecommendationId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  dailyPlanTitle: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "RECOMMENDED" | "MONITORING" | "COMPLETED";
  recommendation: string;
};

type DemoLearningAiTutorChatSafetyTeacherReviewReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentTeacherProgressAlertInterventionReport["safety"] & {
    aiProviderExecutionUsed: false;
    realAiChatMutationUsed: false;
    realAiModerationMutationUsed: false;
    realLearningSupportMutationUsed: false;
  };
  totals: {
    chatSessionCount: number;
    messageCount: number;
    allowedMessageCount: number;
    blockedMessageCount: number;
    safetyFlagCount: number;
    blockedTopicCount: number;
    teacherReviewItemCount: number;
    reviewedTeacherReviewItemCount: number;
    parentSummaryCount: number;
    studentsNeedingSupportCount: number;
    topicCategoryCount: number;
    supportRecommendationCount: number;
  };
  chatSessionRows: DemoLearningAiTutorChatSessionRow[];
  teacherReviewRows: DemoLearningAiTutorTeacherReviewQueueRow[];
  supportRecommendationRows: DemoLearningAiTutorSupportRecommendationRow[];
};

type DemoLearningStudentAchievementSummaryRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  teacherName: string;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
  completionPercent: number;
  achievementRecordCount: number;
  badgeAwardCount: number;
  completedMilestoneCount: number;
  pendingMilestoneCount: number;
  certificateStatus: "READY" | "PENDING" | "HELD_FOR_REVIEW" | "NONE";
  parentVisibleRecognitionCount: number;
  teacherReviewItemCount: number;
  nearCertificate: boolean;
  needsEncouragement: boolean;
};

type DemoLearningCertificateFixtureRow = {
  certificateFixtureId: string;
  studentName: string;
  childProfileId: string;
  courseCode: string;
  classCode: string;
  certificateTitle: string;
  status: "READY" | "PENDING" | "HELD_FOR_REVIEW";
  completedBadgeAwardCount: number;
  pendingMilestoneCount: number;
  certificatePreviewRef: string;
};

type DemoLearningRecognitionSummaryRow = {
  recognitionSummaryId: string;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  audience: "PARENT" | "TEACHER";
  status: "PARENT_VISIBLE" | "TEACHER_REVIEW" | "ENCOURAGEMENT_NEEDED";
  parentVisible: boolean;
  teacherReviewRequired: boolean;
  encouragementNeeded: boolean;
  sourceAiTutorSupportRecommendationId: string | null;
  summary: string;
};

type DemoLearningStudentAchievementBadgeCertificateReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningAiTutorChatSafetyTeacherReviewReport["safety"] & {
    certificateIssuerProviderUsed: false;
    realAchievementMutationUsed: false;
    realBadgeMutationUsed: false;
    realCertificateMutationUsed: false;
    realCredentialIssuanceUsed: false;
    realRecognitionNotificationMutationUsed: false;
  };
  totals: {
    achievementRecords: number;
    badgeAwards: number;
    certificateFixtures: number;
    milestonesCompleted: number;
    milestonesPending: number;
    recognitionSummaries: number;
    parentVisibleRecognitions: number;
    teacherReviewItems: number;
    studentsWithBadges: number;
    studentsNearCertificate: number;
    studentsNeedingEncouragement: number;
  };
  studentRows: DemoLearningStudentAchievementSummaryRow[];
  certificateRows: DemoLearningCertificateFixtureRow[];
  recognitionRows: DemoLearningRecognitionSummaryRow[];
};

type DemoLearningParentTeacherWeeklyDigestStudentRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  parentDigestCount: number;
  teacherDigestCount: number;
  readyToSendDigestCount: number;
  teacherReviewDigestCount: number;
  heldWithdrawnDigestCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  completedActionCount: number;
  nextActionDueAt: string | null;
  weeklySummary: string;
};

type DemoLearningParentTeacherWeeklyDigestRow = {
  digestId: string;
  weekStart: string;
  weekEnd: string;
  audience: "PARENT" | "TEACHER";
  deliveryStatus: "READY_TO_SEND" | "TEACHER_REVIEW" | "HELD_WITHDRAWN";
  parentVisible: boolean;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  progressStatus:
    "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_SUPPORT" | "COMPLETED" | "WITHDRAWN";
  completionPercent: number;
  attendanceRatePercent: number;
  assignmentCompletionPercent: number;
  averagePracticeScorePercent: number;
  alertCount: number;
  highRiskAlertCount: number;
  actionCount: number;
  highPriorityActionCount: number;
  certificateStatus: "READY" | "PENDING" | "HELD_FOR_REVIEW" | "NONE";
  highlight: string;
  riskSummary: string;
};

type DemoLearningParentTeacherWeeklyDigestActionRow = {
  actionId: string;
  digestId: string;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  owner: "PARENT" | "TEACHER";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "RECOMMENDED" | "SCHEDULED" | "COMPLETED" | "HELD";
  dueAt: string;
  sourceAlertId: string | null;
  actionSummary: string;
};

type DemoLearningParentTeacherWeeklyDigestReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningStudentAchievementBadgeCertificateReport["safety"] & {
    realWeeklyDigestNotificationMutationUsed: false;
  };
  totals: {
    digestCount: number;
    parentDigestCount: number;
    teacherDigestCount: number;
    readyToSendDigestCount: number;
    teacherReviewDigestCount: number;
    heldWithdrawnDigestCount: number;
    parentVisibleDigestCount: number;
    teacherOnlyDigestCount: number;
    actionCount: number;
    highPriorityActionCount: number;
    scheduledActionCount: number;
    completedActionCount: number;
    studentsCovered: number;
    studentsNeedingTeacherReview: number;
    studentsReadyForParentSend: number;
  };
  studentRows: DemoLearningParentTeacherWeeklyDigestStudentRow[];
  digestRows: DemoLearningParentTeacherWeeklyDigestRow[];
  actionRows: DemoLearningParentTeacherWeeklyDigestActionRow[];
};

type DemoLearningFollowUpActionOutcomeStudentRow = {
  studentId: string;
  childProfileId: string;
  studentName: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  outcomeCount: number;
  completedOrVerifiedCount: number;
  scheduledOrMonitoringCount: number;
  heldOutcomeCount: number;
  needsSupportOutcomeCount: number;
  parentVisibleOutcomeCount: number;
  nextReviewAt: string | null;
  outcomeSummary: string;
};

type DemoLearningFollowUpActionOutcomeRow = {
  outcomeId: string;
  actionId: string;
  digestId: string;
  actionOwner: "PARENT" | "TEACHER";
  actionPriority: "LOW" | "MEDIUM" | "HIGH";
  actionStatus: "RECOMMENDED" | "SCHEDULED" | "COMPLETED" | "HELD";
  outcomeStatus: "COMPLETED" | "VERIFIED" | "SCHEDULED" | "MONITORING" | "HELD";
  impactBand: "POSITIVE" | "STABLE" | "NEEDS_SUPPORT" | "NO_SEND";
  parentVisible: boolean;
  outcomeAt: string | null;
  nextReviewAt: string | null;
  studentName: string;
  childProfileId: string;
  parentGuardianName: string;
  courseCode: string;
  classCode: string;
  digestDeliveryStatus: "READY_TO_SEND" | "TEACHER_REVIEW" | "HELD_WITHDRAWN";
  dailyPlanTitle: string | null;
  dailyPlanStatus:
    "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED" | "NONE";
  supportRecommendationId: string | null;
  supportStatus: "RECOMMENDED" | "MONITORING" | "COMPLETED" | "NONE";
  achievementKind:
    | "LESSON_MASTERY"
    | "PRACTICE_STREAK"
    | "ASSESSMENT_SCORE"
    | "SAFE_TUTOR_USE"
    | "COURSE_COMPLETION"
    | "NONE";
  parentSummaryReady: boolean;
  teacherReviewStatus: "OPEN" | "REVIEWED" | "RESOLVED" | "NONE";
  evidenceSummary: string;
  outcomeSummary: string;
};

type DemoLearningFollowUpActionOutcomeReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  safety: DemoLearningParentTeacherWeeklyDigestReport["safety"] & {
    realParentSummaryMutationUsed: false;
    realFollowUpActionOutcomeMutationUsed: false;
  };
  totals: {
    outcomeCount: number;
    completedOutcomeCount: number;
    verifiedOutcomeCount: number;
    scheduledOutcomeCount: number;
    monitoringOutcomeCount: number;
    heldOutcomeCount: number;
    parentVisibleOutcomeCount: number;
    teacherOnlyOutcomeCount: number;
    positiveOutcomeCount: number;
    needsSupportOutcomeCount: number;
    noSendOutcomeCount: number;
    linkedDailyPlanCount: number;
    linkedSupportRecommendationCount: number;
    linkedAchievementCount: number;
    linkedParentSummaryCount: number;
    linkedTeacherReviewCount: number;
    studentsCovered: number;
    studentsWithCompletedOrVerifiedOutcome: number;
    studentsWithOpenOutcome: number;
  };
  studentRows: DemoLearningFollowUpActionOutcomeStudentRow[];
  outcomeRows: DemoLearningFollowUpActionOutcomeRow[];
};

type DemoLearningMvpReadinessOverviewStatus =
  "LOCAL_DEMO_READY" | "LOCAL_DEMO_READY_WITH_NOTES" | "NEEDS_LOCAL_DEMO_FIX";

type DemoLearningMvpReadinessOverviewSliceKey =
  | "ENROLLMENT"
  | "SUBSCRIPTION_FIXTURE"
  | "REFUNDS_COMMISSION_FIXTURE"
  | "DAILY_PLAN"
  | "LESSON_ASSIGNMENT"
  | "PROGRESS"
  | "REPORT_REVIEW_PREVIEW"
  | "PARENT_PORTAL_INBOX_READ_RECEIPT"
  | "PARENT_SCREEN_TIME_DAILY_PLAN_GUARD"
  | "SESSION_COMPLETION_PRACTICE_ROLLUP"
  | "TEACHER_INTERVENTION_REMEDIAL_SUPPORT_PLAN"
  | "REMEDIAL_RETRY_COMPLETION_SUPPORT_OUTCOME_FOLLOWUP"
  | "REMEDIAL_RETRY_UNRESOLVED_SUPPORT_ESCALATION"
  | "TEACHER_ESCALATION_FOLLOWUP_RESOLUTION"
  | "MVP_END_TO_END_READINESS_TRACE"
  | "MVP_ROLE_JOURNEY_ENTRYPOINTS"
  | "AI_TUTOR_EVIDENCE"
  | "ACHIEVEMENTS"
  | "WEEKLY_DIGEST"
  | "FOLLOW_UP_OUTCOMES";

type DemoLearningMvpEndToEndReadinessTraceReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningTeacherEscalationFollowupResolutionReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
    studentCount: number;
    courseCount: number;
    enrollmentOrSubscriptionCount: number;
    paymentRefundCommissionFixtureEvidenceCount: number;
    entitlementOrDailyPlanCount: number;
    practiceProgressOrCompletionCount: number;
    parentTeacherReportCount: number;
    permissionRedactionEvidenceCount: number;
    approvedDeliveryOrReadReceiptCount: number;
    alignedApprovedDeliveryStudentCoursePathCount: number;
    screenTimeGuardEvidenceCount: number;
    teacherInterventionEvidenceCount: number;
    remedialRetryOrEscalationEvidenceCount: number;
    escalationResolutionEvidenceCount: number;
    stableEndToEndTraceCount: number;
    deterministicStatusReasonActionOwnerCount: number;
    sameStudentCoursePathCount: number;
    evidenceRowCount: number;
    localDemoNoteCount: number;
    productionReadyClaimCount: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
  };
  statusCounts: {
    traceStatus: Record<"LOCAL_DEMO_READY_WITH_NOTES", number>;
    ownerLabel: Record<"TEACHER", number>;
  };
  traceRows: {
    traceId: string;
    stableEndToEndTraceKey: string;
    stableEndToEndTraceIds: string[];
    studentId: string;
    childProfileId: string;
    studentName: string;
    parentGuardianId: string;
    teacherId: string;
    teacherName: string;
    courseId: string;
    courseCode: string;
    courseTitle: string;
    classId: string;
    classCode: string;
    enrollmentId: string;
    enrollmentStatus: DemoLearningEnrollmentReportRow["enrollmentStatus"];
    subscriptionId: string;
    subscriptionStatus: DemoLearningEnrollmentReportRow["subscriptionStatus"];
    paymentId: string;
    paymentStatus: DemoLearningEnrollmentReportRow["paymentStatus"];
    refundIds: string[];
    commissionIds: string[];
    entitlementId: string;
    entitlementStatus: "GRANTED" | "BLOCKED";
    entitlementAccessStatus:
      | "UNLOCKED"
      | "BLOCKED_PENDING_PAYMENT"
      | "BLOCKED_EXPIRED"
      | "BLOCKED_REFUNDED"
      | "BLOCKED_CANCELED";
    learningPathId: string;
    dailyPlanId: string;
    dailyPlanTitle: string;
    dailyPlanStatus:
      "COMPLETED" | "IN_PROGRESS" | "BLOCKED" | "SKIPPED" | "ASSIGNED";
    practiceProgressRollupId: string;
    practiceAttemptId: string;
    practiceAttemptStatus: "PASSED" | "NEEDS_RETRY" | "INCOMPLETE" | "SKIPPED";
    practiceScorePercent: number;
    progressStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "NEEDS_SUPPORT"
      | "COMPLETED"
      | "WITHDRAWN";
    parentTeacherReportSummaryId: string;
    parentTeacherPermissionCaseId: string;
    permissionRedactionEvidenceId: string;
    approvedDeliveryOrReadReceiptId: string;
    approvedDeliveryStudentId: string;
    approvedDeliveryCourseId: string;
    screenTimeGuardEvidenceId: string;
    screenTimeAccessResult: "ALLOWED_SESSION" | "BLOCKED_SESSION";
    teacherInterventionReviewId: string;
    supportPlanId: string;
    remedialAssignmentId: string;
    remedialRetryOrEscalationId: string;
    remedialRetryStatus: "FAILED" | "INCOMPLETE";
    unresolvedOutcomeId: string;
    teacherEscalationId: string;
    supportAdjustmentId: string;
    escalationResolutionId: string;
    resolvedSupportOutcomeId: string;
    resolutionStatus: "RESOLVED";
    traceStatus: "LOCAL_DEMO_READY_WITH_NOTES";
    reasonLabel: string;
    actionLabel: string;
    ownerLabel: "TEACHER";
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    productionReady: false;
    evidenceSummary: string;
  }[];
  evidenceRows: {
    evidenceKind:
      | "STUDENT_COURSE_ENROLLMENT_SUBSCRIPTION"
      | "PAYMENT_REFUND_COMMISSION_FIXTURE"
      | "ENTITLEMENT_DAILY_PLAN"
      | "PRACTICE_PROGRESS_COMPLETION"
      | "PARENT_TEACHER_REPORTING"
      | "PERMISSION_REDACTION"
      | "APPROVED_DELIVERY_READ_RECEIPT"
      | "SCREEN_TIME_GUARD"
      | "TEACHER_INTERVENTION"
      | "REMEDIAL_RETRY_OR_ESCALATION"
      | "ESCALATION_RESOLUTION"
      | "STABLE_END_TO_END_TRACE"
      | "SAFETY_GATE";
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
};

type DemoLearningMvpRoleJourneyEntrypointsReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  fixtureOnly: true;
  endpointPath: string;
  dashboardEvidencePath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  safety: DemoLearningMvpEndToEndReadinessTraceReport["safety"];
  currentStatus: {
    status: "LOCAL_DEMO_READY_WITH_NOTES";
    summary: string;
    remainingLocalDemoNotes: string[];
  };
  totals: {
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
  statusCounts: {
    role: Record<"STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR", number>;
    status: Record<"LOCAL_DEMO_READY_WITH_NOTES", number>;
    ownerLabel: Record<
      "STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR",
      number
    >;
  };
  entrypointRows: {
    roleEntrypointId: string;
    role: "STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR";
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
    statusLabel: "LOCAL_DEMO_READY_WITH_NOTES";
    reasonLabel: string;
    ownerLabel: "STUDENT" | "PARENT" | "TEACHER" | "ADMIN_OPERATOR";
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
  }[];
  stableTraceRows: {
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
    traceStatus: "LOCAL_DEMO_READY_WITH_NOTES";
    reasonLabel: string;
    actionLabel: string;
    ownerLabel: "ADMIN_OPERATOR";
    evidenceSummary: string;
  }[];
  evidenceRows: {
    evidenceKind:
      | "STUDENT_ENTRYPOINT"
      | "PARENT_ENTRYPOINT"
      | "TEACHER_ENTRYPOINT"
      | "ADMIN_OPERATOR_ENTRYPOINT"
      | "STABLE_ROLE_JOURNEY_TRACE"
      | "SAFETY_GATE";
    evidenceCount: number;
    stableFixtureIds: string[];
    fixtureOnly: true;
    providerUsed: false;
    mutationUsed: false;
    evidenceSummary: string;
  }[];
};

type DemoLearningMvpReadinessOverviewRow = {
  sliceKey: DemoLearningMvpReadinessOverviewSliceKey;
  sliceName: string;
  readinessStatus: DemoLearningMvpReadinessOverviewStatus;
  productionReady: false;
  fixtureOnly: true;
  safetyClosed: boolean;
  sourceEndpointPath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  primaryMetricLabel: string;
  primaryMetricValue: number;
  secondaryMetricLabel: string;
  secondaryMetricValue: number;
  coverageLabel: string;
  coverageValue: number;
  riskNote: string;
  evidenceSummary: string;
};

type DemoLearningMvpReadinessOverviewReport = {
  reportName: string;
  generatedAt: string;
  currency: "VND";
  productionReady: false;
  safety: DemoLearningFollowUpActionOutcomeReport["safety"] & {
    realLearningSessionCompletionMutationUsed: false;
    realParentProgressSummaryMutationUsed: false;
    realTeacherProgressSummaryMutationUsed: false;
    realTeacherInterventionReviewMutationUsed: false;
    realRemedialAssignmentMutationUsed: false;
    realSupportPlanMutationUsed: false;
    realParentSupportSummaryMutationUsed: false;
    realTeacherNextActionMutationUsed: false;
    realRemedialRetryCompletionMutationUsed: false;
    realSupportOutcomeEvidenceMutationUsed: false;
    realParentFollowupSummaryMutationUsed: false;
    realTeacherFollowupSummaryMutationUsed: false;
    realRemedialRetryUnresolvedAttemptMutationUsed: false;
    realUnresolvedSupportOutcomeMutationUsed: false;
    realTeacherEscalationMutationUsed: false;
    realSupportAdjustmentMutationUsed: false;
    realParentEscalationSummaryMutationUsed: false;
    realTeacherEscalationNextActionMutationUsed: false;
    realTeacherReviewedEscalationMutationUsed: false;
    realAdjustedSupportRetryCompletionMutationUsed: false;
    realResolvedSupportOutcomeMutationUsed: false;
    realParentClosureSummaryMutationUsed: false;
    realTeacherClosureNoteMutationUsed: false;
  };
  totals: {
    sliceCount: number;
    localDemoReadySliceCount: number;
    localDemoReadyWithNotesSliceCount: number;
    needsLocalDemoFixSliceCount: number;
    productionReadySliceCount: number;
    fixtureOnlySliceCount: number;
    safetyClosedSliceCount: number;
    evidenceEndpointCount: number;
    jsonExportCount: number;
    markdownExportCount: number;
    readinessScorePercent: number;
    safetyGateCount: number;
    closedSafetyGateCount: number;
    openSafetyGateCount: number;
    studentCount: number;
    courseCount: number;
    enrollmentCount: number;
    activeEnrollmentCount: number;
    subscriptionCount: number;
    refundCount: number;
    commissionCount: number;
    dailyPlanCount: number;
    completedDailyPlanCount: number;
    lessonCount: number;
    assignmentCount: number;
    progressRecordCount: number;
    needsSupportLearnerCount: number;
    aiTutorChatSessionCount: number;
    aiTutorSafetyFlagCount: number;
    achievementRecordCount: number;
    badgeAwardCount: number;
    teacherInterventionReviewCount: number;
    remedialAssignmentCount: number;
    supportPlanCount: number;
    remedialRetryCompletionCount: number;
    supportOutcomeEvidenceCount: number;
    remedialRetryUnresolvedAttemptCount: number;
    unresolvedSupportOutcomeCount: number;
    teacherEscalationCount: number;
    parentVisibleEscalationSummaryCount: number;
    teacherVisibleEscalationNextActionCount: number;
    teacherReviewedEscalationCount: number;
    adjustedSupportRetryCompletionCount: number;
    resolvedSupportOutcomeCount: number;
    parentVisibleClosureSummaryCount: number;
    teacherVisibleClosureNoteCount: number;
    stableEndToEndTraceCount: number;
    weeklyDigestCount: number;
    weeklyDigestActionCount: number;
    followUpOutcomeCount: number;
  };
  rows: DemoLearningMvpReadinessOverviewRow[];
};

const enrollmentReportPath =
  "/v1/learning-local-demo/student-course-enrollment-subscription-report";
const studentCourseFlowReportPath =
  "/v1/learning-local-demo/student-course-enrollment-subscription-flow-report";
const subscriptionEntitlementDailyPlanAccessReportPath =
  "/v1/learning-local-demo/subscription-entitlement-daily-plan-access-report";
const parentTeacherProgressAccessSummaryReportPath =
  "/v1/learning-local-demo/parent-teacher-progress-access-summary-report";
const parentTeacherReportPermissionPrivacyRedactionReportPath =
  "/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report";
const parentTeacherReportReviewQueueMessagePreviewReportPath =
  "/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report";
const parentPortalApprovedReportInboxReadReceiptReportPath =
  "/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report";
const progressReportPath =
  "/v1/learning-local-demo/class-session-attendance-progress-report";
const assessmentReportPath =
  "/v1/learning-local-demo/lesson-assignment-assessment-progress-report";
const learningPathReportPath =
  "/v1/learning-local-demo/learning-path-daily-plan-video-practice-evidence-report";
const parentTeacherAlertReportPath =
  "/v1/learning-local-demo/parent-teacher-progress-alert-intervention-report";
const parentScreenTimeReportPath =
  "/v1/learning-local-demo/parent-screen-time-guardian-controls-report";
const parentScreenTimeGrantDailyPlanGuardReportPath =
  "/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report";
const learningSessionCompletionPracticeProgressRollupReportPath =
  "/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report";
const teacherInterventionRemedialAssignmentSupportPlanReportPath =
  "/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report";
const remedialRetryCompletionSupportOutcomeFollowupReportPath =
  "/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report";
const remedialRetryUnresolvedSupportEscalationReportPath =
  "/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report";
const teacherEscalationFollowupResolutionReportPath =
  "/v1/learning-local-demo/teacher-escalation-followup-resolution-report";
const mvpEndToEndReadinessTraceReportPath =
  "/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report";
const mvpRoleJourneyEntrypointsReportPath =
  "/v1/learning-local-demo/mvp-role-journey-entrypoints-report";
const teacherContentPublishReportPath =
  "/v1/learning-local-demo/teacher-content-library-learning-path-publish-report";
const aiTutorChatSafetyTeacherReviewReportPath =
  "/v1/learning-local-demo/ai-tutor-chat-safety-teacher-review-report";
const studentAchievementBadgeCertificateReportPath =
  "/v1/learning-local-demo/student-achievement-badge-certificate-report";
const parentTeacherWeeklyDigestReportPath =
  "/v1/learning-local-demo/parent-teacher-weekly-digest-report";
const followUpActionOutcomeReportPath =
  "/v1/learning-local-demo/followup-action-outcome-report";
const mvpReadinessOverviewReportPath =
  "/v1/learning-local-demo/mvp-readiness-overview-report";
const enrollmentEndpointUrl = `${publicApiBaseUrl}${enrollmentReportPath}`;
const studentCourseFlowEndpointUrl = `${publicApiBaseUrl}${studentCourseFlowReportPath}`;
const subscriptionEntitlementDailyPlanAccessEndpointUrl = `${publicApiBaseUrl}${subscriptionEntitlementDailyPlanAccessReportPath}`;
const parentTeacherProgressAccessSummaryEndpointUrl = `${publicApiBaseUrl}${parentTeacherProgressAccessSummaryReportPath}`;
const parentTeacherReportPermissionPrivacyRedactionEndpointUrl = `${publicApiBaseUrl}${parentTeacherReportPermissionPrivacyRedactionReportPath}`;
const parentTeacherReportReviewQueueMessagePreviewEndpointUrl = `${publicApiBaseUrl}${parentTeacherReportReviewQueueMessagePreviewReportPath}`;
const parentPortalApprovedReportInboxReadReceiptEndpointUrl = `${publicApiBaseUrl}${parentPortalApprovedReportInboxReadReceiptReportPath}`;
const progressEndpointUrl = `${publicApiBaseUrl}${progressReportPath}`;
const assessmentEndpointUrl = `${publicApiBaseUrl}${assessmentReportPath}`;
const learningPathEndpointUrl = `${publicApiBaseUrl}${learningPathReportPath}`;
const parentTeacherAlertEndpointUrl = `${publicApiBaseUrl}${parentTeacherAlertReportPath}`;
const parentScreenTimeEndpointUrl = `${publicApiBaseUrl}${parentScreenTimeReportPath}`;
const parentScreenTimeGrantDailyPlanGuardEndpointUrl = `${publicApiBaseUrl}${parentScreenTimeGrantDailyPlanGuardReportPath}`;
const learningSessionCompletionPracticeProgressRollupEndpointUrl = `${publicApiBaseUrl}${learningSessionCompletionPracticeProgressRollupReportPath}`;
const teacherInterventionRemedialAssignmentSupportPlanEndpointUrl = `${publicApiBaseUrl}${teacherInterventionRemedialAssignmentSupportPlanReportPath}`;
const remedialRetryCompletionSupportOutcomeFollowupEndpointUrl = `${publicApiBaseUrl}${remedialRetryCompletionSupportOutcomeFollowupReportPath}`;
const remedialRetryUnresolvedSupportEscalationEndpointUrl = `${publicApiBaseUrl}${remedialRetryUnresolvedSupportEscalationReportPath}`;
const teacherEscalationFollowupResolutionEndpointUrl = `${publicApiBaseUrl}${teacherEscalationFollowupResolutionReportPath}`;
const mvpEndToEndReadinessTraceEndpointUrl = `${publicApiBaseUrl}${mvpEndToEndReadinessTraceReportPath}`;
const mvpRoleJourneyEntrypointsEndpointUrl = `${publicApiBaseUrl}${mvpRoleJourneyEntrypointsReportPath}`;
const teacherContentPublishEndpointUrl = `${publicApiBaseUrl}${teacherContentPublishReportPath}`;
const aiTutorChatSafetyTeacherReviewEndpointUrl = `${publicApiBaseUrl}${aiTutorChatSafetyTeacherReviewReportPath}`;
const studentAchievementBadgeCertificateEndpointUrl = `${publicApiBaseUrl}${studentAchievementBadgeCertificateReportPath}`;
const parentTeacherWeeklyDigestEndpointUrl = `${publicApiBaseUrl}${parentTeacherWeeklyDigestReportPath}`;
const followUpActionOutcomeEndpointUrl = `${publicApiBaseUrl}${followUpActionOutcomeReportPath}`;
const mvpReadinessOverviewEndpointUrl = `${publicApiBaseUrl}${mvpReadinessOverviewReportPath}`;

function formatInteger(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatPercent(value: number) {
  return `${formatInteger(value)}%`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function totalCommission(row: DemoLearningEnrollmentReportRow) {
  return (
    row.commissionPendingCents +
    row.commissionPayableCents +
    row.commissionApprovedCents
  );
}

function statusBadgeClass(status: string) {
  if (
    [
      "ACTIVE",
      "SUCCEEDED",
      "COMPLETED",
      "APPROVED",
      "PAYABLE",
      "EXCELLENT",
      "ON_TRACK",
      "PASSED",
      "RESOLVED",
      "ALLOWED",
      "PUBLISHED",
      "VISIBLE",
      "REVIEWED",
      "LOW",
      "READY_TO_SEND",
      "VERIFIED",
      "POSITIVE",
      "LOCAL_DEMO_READY",
      "UNLOCKED",
      "GRANTED",
      "VISIBLE_TO_PARENT",
      "READ_ACKNOWLEDGED",
      "ALLOWED_SESSION",
    ].includes(status)
  ) {
    return "bg-teal-50 text-teal-700 ring-teal-100";
  }

  if (
    [
      "PENDING",
      "TRIALING",
      "SCHEDULED",
      "IN_PROGRESS",
      "OPEN",
      "ASSIGNED",
      "MONITORING",
      "OVERRIDE_ALLOWED",
      "ESCALATED",
      "STABLE",
      "LOCAL_DEMO_READY_WITH_NOTES",
    ].includes(status)
  ) {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (
    [
      "NEEDS_SUPPORT",
      "LATE",
      "MISSING",
      "NEEDS_RETRY",
      "INCOMPLETE",
      "UNRESOLVED",
      "BLOCKED",
      "MEDIUM",
      "DRAFT",
      "BLOCKED_UNPUBLISHED",
      "RECOMMENDED",
      "MEDIUM",
      "TEACHER_REVIEW",
      "REDACTED",
    ].includes(status)
  ) {
    return "bg-amber-50 text-amber-800 ring-amber-100";
  }

  if (
    [
      "CANCELED",
      "WITHDRAWN",
      "REFUNDED",
      "FAILED",
      "CLOSED",
      "SKIPPED",
      "HIGH",
      "DENIED",
      "DISABLED",
      "BLOCKED",
      "ARCHIVED",
      "BLOCKED_ARCHIVED",
      "HELD",
      "HELD_NEEDS_EDIT",
      "HELD_WITHDRAWN",
      "NO_SEND",
      "NEEDS_LOCAL_DEMO_FIX",
      "BLOCKED_PENDING_PAYMENT",
      "BLOCKED_EXPIRED",
      "BLOCKED_REFUNDED",
      "BLOCKED_CANCELED",
      "HIDDEN_HELD_REVIEW",
      "BLOCKED_SESSION",
    ].includes(status)
  ) {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function compactStatus(status: string) {
  const labelsVi: Record<string, string> = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Không hoạt động",
    READY: "Sẵn sàng",
    PENDING: "Đang chờ",
    OPEN: "Đang mở",
    CLOSED: "Đã đóng",
    COMPLETED: "Đã hoàn thành",
    FAILED: "Thất bại",
    SKIPPED: "Đã bỏ qua",
    BLOCKED: "Bị chặn",
    ALLOWED: "Được phép",
    DENIED: "Bị từ chối",
    APPROVED: "Đã duyệt",
    REJECTED: "Đã từ chối",
    DRAFT: "Bản nháp",
    PUBLISHED: "Đã xuất bản",
    ARCHIVED: "Đã lưu trữ",
    HELD: "Tạm giữ",
    VISIBLE: "Hiển thị",
    HIDDEN: "Bị ẩn",
    HIGH: "Cao",
    MEDIUM: "Trung bình",
    LOW: "Thấp",
    PRESENT: "Có mặt",
    LATE: "Đi muộn",
    ABSENT: "Vắng",
    EXCUSED: "Có phép",
    MISSING: "Chưa có",
    WITHDRAWN: "Đã rút",
    STUDENT: "Học viên",
    PARENT: "Phụ huynh",
    TEACHER: "Giáo viên",
    ADMIN: "Quản trị viên",
  };
  return labelsVi[status] ?? status.replaceAll("_", " ");
}

export default function LearningLocalDemoPage() {
  const [enrollmentReport, setEnrollmentReport] =
    useState<DemoLearningCoreReport | null>(null);
  const [studentCourseFlowReport, setStudentCourseFlowReport] =
    useState<DemoLearningStudentCourseEnrollmentSubscriptionFlowReport | null>(
      null,
    );
  const [
    subscriptionEntitlementDailyPlanAccessReport,
    setSubscriptionEntitlementDailyPlanAccessReport,
  ] = useState<DemoLearningSubscriptionEntitlementDailyPlanAccessReport | null>(
    null,
  );
  const [
    parentTeacherProgressAccessSummaryReport,
    setParentTeacherProgressAccessSummaryReport,
  ] = useState<DemoLearningParentTeacherProgressAccessSummaryReport | null>(
    null,
  );
  const [
    parentTeacherReportPermissionPrivacyRedactionReport,
    setParentTeacherReportPermissionPrivacyRedactionReport,
  ] =
    useState<DemoLearningParentTeacherReportPermissionPrivacyRedactionReport | null>(
      null,
    );
  const [
    parentTeacherReportReviewQueueMessagePreviewReport,
    setParentTeacherReportReviewQueueMessagePreviewReport,
  ] =
    useState<DemoLearningParentTeacherReportReviewQueueMessagePreviewReport | null>(
      null,
    );
  const [
    parentPortalApprovedReportInboxReadReceiptReport,
    setParentPortalApprovedReportInboxReadReceiptReport,
  ] =
    useState<DemoLearningParentPortalApprovedReportInboxReadReceiptReport | null>(
      null,
    );
  const [progressReport, setProgressReport] =
    useState<DemoLearningClassSessionAttendanceProgressReport | null>(null);
  const [assessmentReport, setAssessmentReport] =
    useState<DemoLearningLessonAssignmentAssessmentProgressReport | null>(null);
  const [learningPathReport, setLearningPathReport] =
    useState<DemoLearningPathDailyPlanVideoPracticeEvidenceReport | null>(null);
  const [parentTeacherAlertReport, setParentTeacherAlertReport] =
    useState<DemoLearningParentTeacherProgressAlertInterventionReport | null>(
      null,
    );
  const [parentScreenTimeReport, setParentScreenTimeReport] =
    useState<DemoLearningParentScreenTimeGuardianControlsReport | null>(null);
  const [
    parentScreenTimeGrantDailyPlanGuardReport,
    setParentScreenTimeGrantDailyPlanGuardReport,
  ] = useState<DemoLearningParentScreenTimeGrantDailyPlanGuardReport | null>(
    null,
  );
  const [
    learningSessionCompletionPracticeProgressRollupReport,
    setLearningSessionCompletionPracticeProgressRollupReport,
  ] =
    useState<DemoLearningSessionCompletionPracticeProgressRollupReport | null>(
      null,
    );
  const [
    teacherInterventionRemedialAssignmentSupportPlanReport,
    setTeacherInterventionRemedialAssignmentSupportPlanReport,
  ] =
    useState<DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport | null>(
      null,
    );
  const [
    remedialRetryCompletionSupportOutcomeFollowupReport,
    setRemedialRetryCompletionSupportOutcomeFollowupReport,
  ] =
    useState<DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport | null>(
      null,
    );
  const [
    remedialRetryUnresolvedSupportEscalationReport,
    setRemedialRetryUnresolvedSupportEscalationReport,
  ] =
    useState<DemoLearningRemedialRetryUnresolvedSupportEscalationReport | null>(
      null,
    );
  const [
    teacherEscalationFollowupResolutionReport,
    setTeacherEscalationFollowupResolutionReport,
  ] = useState<DemoLearningTeacherEscalationFollowupResolutionReport | null>(
    null,
  );
  const [mvpEndToEndReadinessTraceReport, setMvpEndToEndReadinessTraceReport] =
    useState<DemoLearningMvpEndToEndReadinessTraceReport | null>(null);
  const [mvpRoleJourneyEntrypointsReport, setMvpRoleJourneyEntrypointsReport] =
    useState<DemoLearningMvpRoleJourneyEntrypointsReport | null>(null);
  const [teacherContentPublishReport, setTeacherContentPublishReport] =
    useState<DemoLearningTeacherContentLibraryLearningPathPublishReport | null>(
      null,
    );
  const [
    aiTutorChatSafetyTeacherReviewReport,
    setAiTutorChatSafetyTeacherReviewReport,
  ] = useState<DemoLearningAiTutorChatSafetyTeacherReviewReport | null>(null);
  const [
    studentAchievementBadgeCertificateReport,
    setStudentAchievementBadgeCertificateReport,
  ] = useState<DemoLearningStudentAchievementBadgeCertificateReport | null>(
    null,
  );
  const [parentTeacherWeeklyDigestReport, setParentTeacherWeeklyDigestReport] =
    useState<DemoLearningParentTeacherWeeklyDigestReport | null>(null);
  const [followUpActionOutcomeReport, setFollowUpActionOutcomeReport] =
    useState<DemoLearningFollowUpActionOutcomeReport | null>(null);
  const [mvpReadinessOverviewReport, setMvpReadinessOverviewReport] =
    useState<DemoLearningMvpReadinessOverviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(
    "Đang tải báo cáo dữ liệu mô phỏng học tập cục bộ...",
  );

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setMessage("Đang tải báo cáo dữ liệu mô phỏng học tập cục bộ...");

    try {
      const [
        enrollmentResponse,
        studentCourseFlowResponse,
        subscriptionEntitlementDailyPlanAccessResponse,
        parentTeacherProgressAccessSummaryResponse,
        parentTeacherReportPermissionPrivacyRedactionResponse,
        parentTeacherReportReviewQueueMessagePreviewResponse,
        parentPortalApprovedReportInboxReadReceiptResponse,
        progressResponse,
        assessmentResponse,
        learningPathResponse,
        parentTeacherAlertResponse,
        parentScreenTimeResponse,
        parentScreenTimeGrantDailyPlanGuardResponse,
        learningSessionCompletionPracticeProgressRollupResponse,
        teacherInterventionRemedialAssignmentSupportPlanResponse,
        remedialRetryCompletionSupportOutcomeFollowupResponse,
        remedialRetryUnresolvedSupportEscalationResponse,
        teacherEscalationFollowupResolutionResponse,
        mvpEndToEndReadinessTraceResponse,
        mvpRoleJourneyEntrypointsResponse,
        teacherContentPublishResponse,
        aiTutorChatSafetyTeacherReviewResponse,
        studentAchievementBadgeCertificateResponse,
        parentTeacherWeeklyDigestResponse,
        followUpActionOutcomeResponse,
        mvpReadinessOverviewResponse,
      ] = await Promise.all([
        fetch(enrollmentEndpointUrl, { cache: "no-store" }),
        fetch(studentCourseFlowEndpointUrl, { cache: "no-store" }),
        fetch(subscriptionEntitlementDailyPlanAccessEndpointUrl, {
          cache: "no-store",
        }),
        fetch(parentTeacherProgressAccessSummaryEndpointUrl, {
          cache: "no-store",
        }),
        fetch(parentTeacherReportPermissionPrivacyRedactionEndpointUrl, {
          cache: "no-store",
        }),
        fetch(parentTeacherReportReviewQueueMessagePreviewEndpointUrl, {
          cache: "no-store",
        }),
        fetch(parentPortalApprovedReportInboxReadReceiptEndpointUrl, {
          cache: "no-store",
        }),
        fetch(progressEndpointUrl, { cache: "no-store" }),
        fetch(assessmentEndpointUrl, { cache: "no-store" }),
        fetch(learningPathEndpointUrl, { cache: "no-store" }),
        fetch(parentTeacherAlertEndpointUrl, { cache: "no-store" }),
        fetch(parentScreenTimeEndpointUrl, { cache: "no-store" }),
        fetch(parentScreenTimeGrantDailyPlanGuardEndpointUrl, {
          cache: "no-store",
        }),
        fetch(learningSessionCompletionPracticeProgressRollupEndpointUrl, {
          cache: "no-store",
        }),
        fetch(teacherInterventionRemedialAssignmentSupportPlanEndpointUrl, {
          cache: "no-store",
        }),
        fetch(remedialRetryCompletionSupportOutcomeFollowupEndpointUrl, {
          cache: "no-store",
        }),
        fetch(remedialRetryUnresolvedSupportEscalationEndpointUrl, {
          cache: "no-store",
        }),
        fetch(teacherEscalationFollowupResolutionEndpointUrl, {
          cache: "no-store",
        }),
        fetch(mvpEndToEndReadinessTraceEndpointUrl, { cache: "no-store" }),
        fetch(mvpRoleJourneyEntrypointsEndpointUrl, { cache: "no-store" }),
        fetch(teacherContentPublishEndpointUrl, { cache: "no-store" }),
        fetch(aiTutorChatSafetyTeacherReviewEndpointUrl, { cache: "no-store" }),
        fetch(studentAchievementBadgeCertificateEndpointUrl, {
          cache: "no-store",
        }),
        fetch(parentTeacherWeeklyDigestEndpointUrl, { cache: "no-store" }),
        fetch(followUpActionOutcomeEndpointUrl, { cache: "no-store" }),
        fetch(mvpReadinessOverviewEndpointUrl, { cache: "no-store" }),
      ]);

      if (!enrollmentResponse.ok) {
        throw new Error(
          `Dữ liệu ghi danh mô phỏng trả về mã ${enrollmentResponse.status}.`,
        );
      }
      if (!studentCourseFlowResponse.ok) {
        throw new Error(
          `Dữ liệu luồng học viên - khóa học mô phỏng trả về mã ${studentCourseFlowResponse.status}.`,
        );
      }
      if (!subscriptionEntitlementDailyPlanAccessResponse.ok) {
        throw new Error(
          `Dữ liệu quyền truy cập thuê bao mô phỏng trả về mã ${subscriptionEntitlementDailyPlanAccessResponse.status}.`,
        );
      }
      if (!parentTeacherProgressAccessSummaryResponse.ok) {
        throw new Error(
          `Dữ liệu tổng hợp quyền xem tiến độ phụ huynh - giáo viên mô phỏng trả về mã ${parentTeacherProgressAccessSummaryResponse.status}.`,
        );
      }
      if (!parentTeacherReportPermissionPrivacyRedactionResponse.ok) {
        throw new Error(
          `Dữ liệu phân quyền và ẩn thông tin báo cáo phụ huynh - giáo viên mô phỏng trả về mã ${parentTeacherReportPermissionPrivacyRedactionResponse.status}.`,
        );
      }
      if (!parentTeacherReportReviewQueueMessagePreviewResponse.ok) {
        throw new Error(
          `Dữ liệu xem trước tin nhắn hàng đợi duyệt báo cáo mô phỏng trả về mã ${parentTeacherReportReviewQueueMessagePreviewResponse.status}.`,
        );
      }
      if (!parentPortalApprovedReportInboxReadReceiptResponse.ok) {
        throw new Error(
          `Dữ liệu biên nhận đã đọc trong hộp thư báo cáo phụ huynh mô phỏng trả về mã ${parentPortalApprovedReportInboxReadReceiptResponse.status}.`,
        );
      }
      if (!progressResponse.ok) {
        throw new Error(
          `Dữ liệu tiến độ mô phỏng trả về mã ${progressResponse.status}.`,
        );
      }
      if (!assessmentResponse.ok) {
        throw new Error(
          `Dữ liệu đánh giá mô phỏng trả về mã ${assessmentResponse.status}.`,
        );
      }
      if (!learningPathResponse.ok) {
        throw new Error(
          `Dữ liệu lộ trình học mô phỏng trả về mã ${learningPathResponse.status}.`,
        );
      }
      if (!parentTeacherAlertResponse.ok) {
        throw new Error(
          `Dữ liệu cảnh báo phụ huynh - giáo viên mô phỏng trả về mã ${parentTeacherAlertResponse.status}.`,
        );
      }
      if (!parentScreenTimeResponse.ok) {
        throw new Error(
          `Dữ liệu thời gian màn hình phụ huynh mô phỏng trả về mã ${parentScreenTimeResponse.status}.`,
        );
      }
      if (!parentScreenTimeGrantDailyPlanGuardResponse.ok) {
        throw new Error(
          `Dữ liệu kiểm soát thời gian màn hình và kế hoạch hằng ngày mô phỏng trả về mã ${parentScreenTimeGrantDailyPlanGuardResponse.status}.`,
        );
      }
      if (!learningSessionCompletionPracticeProgressRollupResponse.ok) {
        throw new Error(
          `Dữ liệu tổng hợp hoàn thành phiên học và luyện tập mô phỏng trả về mã ${learningSessionCompletionPracticeProgressRollupResponse.status}.`,
        );
      }
      if (!teacherInterventionRemedialAssignmentSupportPlanResponse.ok) {
        throw new Error(
          `Dữ liệu kế hoạch hỗ trợ can thiệp của giáo viên mô phỏng trả về mã ${teacherInterventionRemedialAssignmentSupportPlanResponse.status}.`,
        );
      }
      if (!remedialRetryCompletionSupportOutcomeFollowupResponse.ok) {
        throw new Error(
          `Dữ liệu theo dõi kết quả thử lại bài khắc phục mô phỏng trả về mã ${remedialRetryCompletionSupportOutcomeFollowupResponse.status}.`,
        );
      }
      if (!remedialRetryUnresolvedSupportEscalationResponse.ok) {
        throw new Error(
          `Dữ liệu leo thang hỗ trợ chưa giải quyết mô phỏng trả về mã ${remedialRetryUnresolvedSupportEscalationResponse.status}.`,
        );
      }
      if (!teacherEscalationFollowupResolutionResponse.ok) {
        throw new Error(
          `Dữ liệu kết quả theo dõi leo thang của giáo viên mô phỏng trả về mã ${teacherEscalationFollowupResolutionResponse.status}.`,
        );
      }
      if (!mvpEndToEndReadinessTraceResponse.ok) {
        throw new Error(
          `Dữ liệu dấu vết sẵn sàng đầu-cuối của MVP mô phỏng trả về mã ${mvpEndToEndReadinessTraceResponse.status}.`,
        );
      }
      if (!mvpRoleJourneyEntrypointsResponse.ok) {
        throw new Error(
          `Dữ liệu hành trình theo vai trò của MVP mô phỏng trả về mã ${mvpRoleJourneyEntrypointsResponse.status}.`,
        );
      }
      if (!teacherContentPublishResponse.ok) {
        throw new Error(
          `Dữ liệu xuất bản nội dung giáo viên mô phỏng trả về mã ${teacherContentPublishResponse.status}.`,
        );
      }
      if (!aiTutorChatSafetyTeacherReviewResponse.ok) {
        throw new Error(
          `Dữ liệu an toàn trợ giảng AI mô phỏng trả về mã ${aiTutorChatSafetyTeacherReviewResponse.status}.`,
        );
      }
      if (!studentAchievementBadgeCertificateResponse.ok) {
        throw new Error(
          `Dữ liệu thành tích học viên mô phỏng trả về mã ${studentAchievementBadgeCertificateResponse.status}.`,
        );
      }
      if (!parentTeacherWeeklyDigestResponse.ok) {
        throw new Error(
          `Dữ liệu bản tin tuần phụ huynh - giáo viên mô phỏng trả về mã ${parentTeacherWeeklyDigestResponse.status}.`,
        );
      }
      if (!followUpActionOutcomeResponse.ok) {
        throw new Error(
          `Dữ liệu kết quả thao tác theo dõi mô phỏng trả về mã ${followUpActionOutcomeResponse.status}.`,
        );
      }
      if (!mvpReadinessOverviewResponse.ok) {
        throw new Error(
          `Dữ liệu tổng quan mức độ sẵn sàng của MVP mô phỏng trả về mã ${mvpReadinessOverviewResponse.status}.`,
        );
      }

      const [
        enrollmentData,
        studentCourseFlowData,
        subscriptionEntitlementDailyPlanAccessData,
        parentTeacherProgressAccessSummaryData,
        parentTeacherReportPermissionPrivacyRedactionData,
        parentTeacherReportReviewQueueMessagePreviewData,
        parentPortalApprovedReportInboxReadReceiptData,
        progressData,
        assessmentData,
        learningPathData,
        parentTeacherAlertData,
        parentScreenTimeData,
        parentScreenTimeGrantDailyPlanGuardData,
        learningSessionCompletionPracticeProgressRollupData,
        teacherInterventionRemedialAssignmentSupportPlanData,
        remedialRetryCompletionSupportOutcomeFollowupData,
        remedialRetryUnresolvedSupportEscalationData,
        teacherEscalationFollowupResolutionData,
        mvpEndToEndReadinessTraceData,
        mvpRoleJourneyEntrypointsData,
        teacherContentPublishData,
        aiTutorChatSafetyTeacherReviewData,
        studentAchievementBadgeCertificateData,
        parentTeacherWeeklyDigestData,
        followUpActionOutcomeData,
        mvpReadinessOverviewData,
      ] = await Promise.all([
        enrollmentResponse.json() as Promise<DemoLearningCoreReport>,
        studentCourseFlowResponse.json() as Promise<DemoLearningStudentCourseEnrollmentSubscriptionFlowReport>,
        subscriptionEntitlementDailyPlanAccessResponse.json() as Promise<DemoLearningSubscriptionEntitlementDailyPlanAccessReport>,
        parentTeacherProgressAccessSummaryResponse.json() as Promise<DemoLearningParentTeacherProgressAccessSummaryReport>,
        parentTeacherReportPermissionPrivacyRedactionResponse.json() as Promise<DemoLearningParentTeacherReportPermissionPrivacyRedactionReport>,
        parentTeacherReportReviewQueueMessagePreviewResponse.json() as Promise<DemoLearningParentTeacherReportReviewQueueMessagePreviewReport>,
        parentPortalApprovedReportInboxReadReceiptResponse.json() as Promise<DemoLearningParentPortalApprovedReportInboxReadReceiptReport>,
        progressResponse.json() as Promise<DemoLearningClassSessionAttendanceProgressReport>,
        assessmentResponse.json() as Promise<DemoLearningLessonAssignmentAssessmentProgressReport>,
        learningPathResponse.json() as Promise<DemoLearningPathDailyPlanVideoPracticeEvidenceReport>,
        parentTeacherAlertResponse.json() as Promise<DemoLearningParentTeacherProgressAlertInterventionReport>,
        parentScreenTimeResponse.json() as Promise<DemoLearningParentScreenTimeGuardianControlsReport>,
        parentScreenTimeGrantDailyPlanGuardResponse.json() as Promise<DemoLearningParentScreenTimeGrantDailyPlanGuardReport>,
        learningSessionCompletionPracticeProgressRollupResponse.json() as Promise<DemoLearningSessionCompletionPracticeProgressRollupReport>,
        teacherInterventionRemedialAssignmentSupportPlanResponse.json() as Promise<DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport>,
        remedialRetryCompletionSupportOutcomeFollowupResponse.json() as Promise<DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport>,
        remedialRetryUnresolvedSupportEscalationResponse.json() as Promise<DemoLearningRemedialRetryUnresolvedSupportEscalationReport>,
        teacherEscalationFollowupResolutionResponse.json() as Promise<DemoLearningTeacherEscalationFollowupResolutionReport>,
        mvpEndToEndReadinessTraceResponse.json() as Promise<DemoLearningMvpEndToEndReadinessTraceReport>,
        mvpRoleJourneyEntrypointsResponse.json() as Promise<DemoLearningMvpRoleJourneyEntrypointsReport>,
        teacherContentPublishResponse.json() as Promise<DemoLearningTeacherContentLibraryLearningPathPublishReport>,
        aiTutorChatSafetyTeacherReviewResponse.json() as Promise<DemoLearningAiTutorChatSafetyTeacherReviewReport>,
        studentAchievementBadgeCertificateResponse.json() as Promise<DemoLearningStudentAchievementBadgeCertificateReport>,
        parentTeacherWeeklyDigestResponse.json() as Promise<DemoLearningParentTeacherWeeklyDigestReport>,
        followUpActionOutcomeResponse.json() as Promise<DemoLearningFollowUpActionOutcomeReport>,
        mvpReadinessOverviewResponse.json() as Promise<DemoLearningMvpReadinessOverviewReport>,
      ]);

      setEnrollmentReport(enrollmentData);
      setStudentCourseFlowReport(studentCourseFlowData);
      setSubscriptionEntitlementDailyPlanAccessReport(
        subscriptionEntitlementDailyPlanAccessData,
      );
      setParentTeacherProgressAccessSummaryReport(
        parentTeacherProgressAccessSummaryData,
      );
      setParentTeacherReportPermissionPrivacyRedactionReport(
        parentTeacherReportPermissionPrivacyRedactionData,
      );
      setParentTeacherReportReviewQueueMessagePreviewReport(
        parentTeacherReportReviewQueueMessagePreviewData,
      );
      setParentPortalApprovedReportInboxReadReceiptReport(
        parentPortalApprovedReportInboxReadReceiptData,
      );
      setProgressReport(progressData);
      setAssessmentReport(assessmentData);
      setLearningPathReport(learningPathData);
      setParentTeacherAlertReport(parentTeacherAlertData);
      setParentScreenTimeReport(parentScreenTimeData);
      setParentScreenTimeGrantDailyPlanGuardReport(
        parentScreenTimeGrantDailyPlanGuardData,
      );
      setLearningSessionCompletionPracticeProgressRollupReport(
        learningSessionCompletionPracticeProgressRollupData,
      );
      setTeacherInterventionRemedialAssignmentSupportPlanReport(
        teacherInterventionRemedialAssignmentSupportPlanData,
      );
      setRemedialRetryCompletionSupportOutcomeFollowupReport(
        remedialRetryCompletionSupportOutcomeFollowupData,
      );
      setRemedialRetryUnresolvedSupportEscalationReport(
        remedialRetryUnresolvedSupportEscalationData,
      );
      setTeacherEscalationFollowupResolutionReport(
        teacherEscalationFollowupResolutionData,
      );
      setMvpEndToEndReadinessTraceReport(mvpEndToEndReadinessTraceData);
      setMvpRoleJourneyEntrypointsReport(mvpRoleJourneyEntrypointsData);
      setTeacherContentPublishReport(teacherContentPublishData);
      setAiTutorChatSafetyTeacherReviewReport(
        aiTutorChatSafetyTeacherReviewData,
      );
      setStudentAchievementBadgeCertificateReport(
        studentAchievementBadgeCertificateData,
      );
      setParentTeacherWeeklyDigestReport(parentTeacherWeeklyDigestData);
      setFollowUpActionOutcomeReport(followUpActionOutcomeData);
      setMvpReadinessOverviewReport(mvpReadinessOverviewData);
      setMessage(
        `Đã tải các báo cáo dựa trên dữ liệu mô phỏng từ GET ${enrollmentReportPath}, GET ${studentCourseFlowReportPath}, GET ${subscriptionEntitlementDailyPlanAccessReportPath}, GET ${parentTeacherProgressAccessSummaryReportPath}, GET ${parentTeacherReportPermissionPrivacyRedactionReportPath}, GET ${parentTeacherReportReviewQueueMessagePreviewReportPath}, GET ${parentPortalApprovedReportInboxReadReceiptReportPath}, GET ${progressReportPath}, GET ${assessmentReportPath}, GET ${learningPathReportPath}, GET ${parentTeacherAlertReportPath}, GET ${parentScreenTimeReportPath}, GET ${parentScreenTimeGrantDailyPlanGuardReportPath}, GET ${learningSessionCompletionPracticeProgressRollupReportPath}, GET ${teacherInterventionRemedialAssignmentSupportPlanReportPath}, GET ${remedialRetryCompletionSupportOutcomeFollowupReportPath}, GET ${remedialRetryUnresolvedSupportEscalationReportPath}, GET ${teacherEscalationFollowupResolutionReportPath}, GET ${mvpEndToEndReadinessTraceReportPath}, GET ${mvpRoleJourneyEntrypointsReportPath}, GET ${teacherContentPublishReportPath}, GET ${aiTutorChatSafetyTeacherReviewReportPath}, GET ${studentAchievementBadgeCertificateReportPath}, GET ${parentTeacherWeeklyDigestReportPath}, GET ${followUpActionOutcomeReportPath}, và GET ${mvpReadinessOverviewReportPath}.`,
      );
    } catch (error) {
      setEnrollmentReport(null);
      setStudentCourseFlowReport(null);
      setSubscriptionEntitlementDailyPlanAccessReport(null);
      setParentTeacherProgressAccessSummaryReport(null);
      setParentTeacherReportPermissionPrivacyRedactionReport(null);
      setParentTeacherReportReviewQueueMessagePreviewReport(null);
      setParentPortalApprovedReportInboxReadReceiptReport(null);
      setProgressReport(null);
      setAssessmentReport(null);
      setLearningPathReport(null);
      setParentTeacherAlertReport(null);
      setParentScreenTimeReport(null);
      setParentScreenTimeGrantDailyPlanGuardReport(null);
      setLearningSessionCompletionPracticeProgressRollupReport(null);
      setTeacherInterventionRemedialAssignmentSupportPlanReport(null);
      setRemedialRetryCompletionSupportOutcomeFollowupReport(null);
      setRemedialRetryUnresolvedSupportEscalationReport(null);
      setTeacherEscalationFollowupResolutionReport(null);
      setMvpEndToEndReadinessTraceReport(null);
      setMvpRoleJourneyEntrypointsReport(null);
      setTeacherContentPublishReport(null);
      setAiTutorChatSafetyTeacherReviewReport(null);
      setStudentAchievementBadgeCertificateReport(null);
      setParentTeacherWeeklyDigestReport(null);
      setFollowUpActionOutcomeReport(null);
      setMvpReadinessOverviewReport(null);
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải báo cáo dữ liệu mô phỏng học tập cục bộ.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReports();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReports]);

  const learnerByEnrollmentId = useMemo(() => {
    return new Map(
      (progressReport?.learnerRows ?? []).map((row) => [row.enrollmentId, row]),
    );
  }, [progressReport]);

  const metricCards = useMemo(() => {
    if (
      !enrollmentReport ||
      !studentCourseFlowReport ||
      !subscriptionEntitlementDailyPlanAccessReport ||
      !parentTeacherProgressAccessSummaryReport ||
      !parentTeacherReportReviewQueueMessagePreviewReport ||
      !parentPortalApprovedReportInboxReadReceiptReport ||
      !progressReport ||
      !assessmentReport ||
      !learningPathReport ||
      !parentTeacherAlertReport ||
      !parentScreenTimeReport ||
      !parentScreenTimeGrantDailyPlanGuardReport ||
      !learningSessionCompletionPracticeProgressRollupReport ||
      !teacherInterventionRemedialAssignmentSupportPlanReport ||
      !remedialRetryCompletionSupportOutcomeFollowupReport ||
      !remedialRetryUnresolvedSupportEscalationReport ||
      !teacherEscalationFollowupResolutionReport ||
      !mvpEndToEndReadinessTraceReport ||
      !mvpRoleJourneyEntrypointsReport ||
      !teacherContentPublishReport ||
      !aiTutorChatSafetyTeacherReviewReport ||
      !studentAchievementBadgeCertificateReport ||
      !parentTeacherWeeklyDigestReport ||
      !followUpActionOutcomeReport ||
      !mvpReadinessOverviewReport
    ) {
      return [];
    }

    return [
      {
        label: "Mức độ sẵn sàng của MVP",
        value: formatPercent(
          mvpReadinessOverviewReport.totals.readinessScorePercent,
        ),
        note: `${formatInteger(mvpReadinessOverviewReport.totals.localDemoReadySliceCount)}/${formatInteger(mvpReadinessOverviewReport.totals.sliceCount)} hạng mục sẵn sàng cho demo cục bộ`,
        icon: ShieldCheck,
      },
      {
        label: "Minh chứng MVP",
        value: formatInteger(
          mvpReadinessOverviewReport.totals.evidenceEndpointCount,
        ),
        note: `${formatInteger(mvpReadinessOverviewReport.totals.jsonExportCount)} bản JSON và ${formatInteger(mvpReadinessOverviewReport.totals.markdownExportCount)} bản xuất Markdown`,
        icon: ClipboardList,
      },
      {
        label: "Cổng an toàn của MVP",
        value: `${formatInteger(mvpReadinessOverviewReport.totals.closedSafetyGateCount)}/${formatInteger(mvpReadinessOverviewReport.totals.safetyGateCount)}`,
        note: `${formatInteger(mvpReadinessOverviewReport.totals.openSafetyGateCount)} cổng đang mở, chưa sẵn sàng cho môi trường thật`,
        icon: ShieldCheck,
      },
      {
        label: "Dấu vết đầu-cuối",
        value: formatInteger(
          mvpEndToEndReadinessTraceReport.totals.stableEndToEndTraceCount,
        ),
        note: `${formatInteger(mvpEndToEndReadinessTraceReport.totals.sameStudentCoursePathCount)} cùng lộ trình, ${formatInteger(mvpEndToEndReadinessTraceReport.totals.openSafetyGateCount)} cổng đang mở`,
        icon: ClipboardList,
      },
      {
        label: "Điểm truy cập theo vai trò",
        value: formatInteger(
          mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount,
        ),
        note: `${formatInteger(mvpRoleJourneyEntrypointsReport.totals.stableRoleJourneyTraceCount)} dấu vết ổn định, ${formatInteger(mvpRoleJourneyEntrypointsReport.totals.openSafetyGateCount)} cổng đang mở`,
        icon: Users,
      },
      {
        label: "Học viên",
        value: formatInteger(enrollmentReport.totals.studentCount),
        note: `${formatInteger(enrollmentReport.totals.courseCount)} khóa học`,
        icon: Users,
      },
      {
        label: "Dấu vết luồng",
        value: formatInteger(
          studentCourseFlowReport.totals.relationshipTraceCount,
        ),
        note: `${formatInteger(studentCourseFlowReport.totals.fixturePaymentEvidenceCount)} khoản thanh toán, ${formatInteger(studentCourseFlowReport.totals.openSafetyGateCount)} cổng đang mở`,
        icon: WalletCards,
      },
      {
        label: "Cổng truy cập",
        value: `${formatInteger(subscriptionEntitlementDailyPlanAccessReport.totals.unlockedAccessCount)}/${formatInteger(subscriptionEntitlementDailyPlanAccessReport.totals.dailyPlanAccessCaseCount)}`,
        note: `${formatInteger(subscriptionEntitlementDailyPlanAccessReport.totals.blockedAccessCount)} bị chặn, ${formatInteger(subscriptionEntitlementDailyPlanAccessReport.totals.blockedAccessWithReasonCount)} có lý do`,
        icon: ShieldCheck,
      },
      {
        label: "Quyền lợi",
        value: formatInteger(
          subscriptionEntitlementDailyPlanAccessReport.totals.entitlementCount,
        ),
        note: `${formatInteger(subscriptionEntitlementDailyPlanAccessReport.totals.relationshipTraceCount)} dấu vết ổn định, ${formatInteger(subscriptionEntitlementDailyPlanAccessReport.totals.openSafetyGateCount)} cổng đang mở`,
        icon: ClipboardList,
      },
      {
        label: "Bản tổng hợp cho phụ huynh",
        value: formatInteger(
          parentTeacherProgressAccessSummaryReport.totals.parentSummaryCount,
        ),
        note: `${formatInteger(parentTeacherProgressAccessSummaryReport.totals.blockedReasonCount)} lý do bị chặn, ${formatInteger(parentTeacherProgressAccessSummaryReport.totals.openSafetyGateCount)} cổng đang mở`,
        icon: Users,
      },
      {
        label: "Bản tổng hợp cho giáo viên",
        value: formatInteger(
          parentTeacherProgressAccessSummaryReport.totals.teacherSummaryCount,
        ),
        note: `${formatInteger(parentTeacherProgressAccessSummaryReport.totals.progressSummaryCount)} dòng tiến độ, ${formatInteger(parentTeacherProgressAccessSummaryReport.totals.teacherSummaryWithTraceCount)} có truy vết`,
        icon: GraduationCap,
      },
      {
        label: "Xem trước nội dung xét duyệt",
        value: formatInteger(
          parentTeacherReportReviewQueueMessagePreviewReport.totals
            .reviewQueueItemCount,
        ),
        note: `${formatInteger(parentTeacherReportReviewQueueMessagePreviewReport.totals.approvedPreviewCount)} đã duyệt, ${formatInteger(parentTeacherReportReviewQueueMessagePreviewReport.totals.heldPreviewCount)} tạm giữ`,
        icon: MessageSquare,
      },
      {
        label: "Dấu vết bản xem trước",
        value: formatInteger(
          parentTeacherReportReviewQueueMessagePreviewReport.totals
            .reviewDecisionTraceCount,
        ),
        note: `${formatInteger(parentTeacherReportReviewQueueMessagePreviewReport.totals.approvedWithPermissionRedactionEvidenceCount)} đã duyệt kèm minh chứng phân quyền/ẩn dữ liệu`,
        icon: ShieldCheck,
      },
      {
        label: "Hộp thư phụ huynh",
        value: formatInteger(
          parentPortalApprovedReportInboxReadReceiptReport.totals
            .visibleParentInboxItemCount,
        ),
        note: `${formatInteger(parentPortalApprovedReportInboxReadReceiptReport.totals.hiddenHeldPreviewCount)} bị ẩn tạm giữ, ${formatInteger(parentPortalApprovedReportInboxReadReceiptReport.totals.parentInboxTraceCount)} có truy vết`,
        icon: MessageSquare,
      },
      {
        label: "Biên nhận đã đọc",
        value: formatInteger(
          parentPortalApprovedReportInboxReadReceiptReport.totals
            .readAckEvidenceCount,
        ),
        note: `${formatInteger(parentPortalApprovedReportInboxReadReceiptReport.totals.visibleParentPreviewWithPermissionRedactionEvidenceCount)} hiển thị kèm minh chứng phân quyền/ẩn dữ liệu`,
        icon: CheckCircle2,
      },
      {
        label: "Lượt ghi danh",
        value: formatInteger(enrollmentReport.totals.enrollmentCount),
        note: `${formatInteger(enrollmentReport.totals.activeEnrollmentCount)} đang hoạt động, ${formatInteger(enrollmentReport.totals.pendingEnrollmentCount)} đang chờ`,
        icon: GraduationCap,
      },
      {
        label: "Doanh thu thuần",
        value: formatMoney(enrollmentReport.totals.netRevenueCents, "VND"),
        note: `${formatMoney(enrollmentReport.totals.refundedCents, "VND")} đã hoàn tiền`,
        icon: WalletCards,
      },
      {
        label: "Hoa hồng đã nhận",
        value: formatMoney(
          enrollmentReport.totals.commissionEarnedCents,
          "VND",
        ),
        note: `${formatInteger(enrollmentReport.totals.commissionCount)} dòng hoa hồng`,
        icon: BarChart3,
      },
      {
        label: "Lớp học",
        value: formatInteger(progressReport.totals.classCount),
        note: `${formatInteger(progressReport.totals.sessionCount)} buổi học`,
        icon: ClipboardList,
      },
      {
        label: "Điểm danh",
        value: formatPercent(progressReport.totals.attendanceRatePercent),
        note: `${formatInteger(progressReport.totals.attendanceRecordCount)} bản ghi`,
        icon: CheckCircle2,
      },
      {
        label: "Mức độ hoàn thành",
        value: formatPercent(progressReport.totals.overallCompletionPercent),
        note: `${formatInteger(progressReport.totals.completedLessonCount)}/${formatInteger(progressReport.totals.totalLessonCount)} bài học`,
        icon: ShieldCheck,
      },
      {
        label: "Đánh giá",
        value: formatInteger(assessmentReport.totals.assignmentCount),
        note: `${formatInteger(assessmentReport.totals.quizCount)} bài kiểm tra, ${formatInteger(assessmentReport.totals.assignmentTaskCount)} bài tập`,
        icon: ClipboardList,
      },
      {
        label: "Lượt nộp bài",
        value: `${formatInteger(assessmentReport.totals.completedSubmissionCount)}/${formatInteger(assessmentReport.totals.expectedSubmissionCount)}`,
        note: `${formatInteger(assessmentReport.totals.missingSubmissionCount)} chưa nộp, ${formatInteger(assessmentReport.totals.lateSubmissionCount)} muộn`,
        icon: CheckCircle2,
      },
      {
        label: "Cần hỗ trợ",
        value: formatInteger(assessmentReport.totals.needsSupportLearnerCount),
        note: `${formatInteger(assessmentReport.totals.withdrawnLearnerCount)} học viên đã rút`,
        icon: AlertTriangle,
      },
      {
        label: "Kế hoạch hằng ngày",
        value: `${formatInteger(learningPathReport.totals.completedDailyPlanCount)}/${formatInteger(learningPathReport.totals.dailyPlanCount)}`,
        note: `${formatInteger(learningPathReport.totals.blockedSkippedIncompleteDailyPlanCount)} bị chặn, đã bỏ qua hoặc chưa hoàn thành`,
        icon: ClipboardList,
      },
      {
        label: "Luyện tập qua video",
        value: formatPercent(
          learningPathReport.totals.averagePracticeScorePercent,
        ),
        note: `${formatInteger(learningPathReport.totals.completedVideoCount)} video đã hoàn thành, ${formatInteger(learningPathReport.totals.passedPracticeCount)} lượt luyện tập đạt yêu cầu`,
        icon: CheckCircle2,
      },
      {
        label: "Cảnh báo tiến độ",
        value: formatInteger(parentTeacherAlertReport.totals.alertCount),
        note: `${formatInteger(parentTeacherAlertReport.totals.highRiskAlertCount)} rủi ro cao, ${formatInteger(parentTeacherAlertReport.totals.mediumRiskAlertCount)} trung bình`,
        icon: AlertTriangle,
      },
      {
        label: "Lượt theo dõi",
        value: formatInteger(
          parentTeacherAlertReport.totals.followUpNeededAlertCount,
        ),
        note: `${formatInteger(parentTeacherAlertReport.totals.resolvedAlertCount)} đã giải quyết theo minh chứng mô phỏng`,
        icon: ClipboardList,
      },
      {
        label: "Thời gian màn hình",
        value: `${formatInteger(parentScreenTimeReport.totals.usedMinutes)}/${formatInteger(parentScreenTimeReport.totals.allowedMinutes)}`,
        note: `${formatInteger(parentScreenTimeReport.totals.remainingMinutes)} phút còn lại`,
        icon: Clock3,
      },
      {
        label: "Quyền người giám hộ cấp",
        value: formatInteger(parentScreenTimeReport.totals.grantDecisionCount),
        note: `${formatInteger(parentScreenTimeReport.totals.approvedGrantCount)} đã duyệt, ${formatInteger(parentScreenTimeReport.totals.deniedGrantCount)} bị từ chối`,
        icon: ShieldCheck,
      },
      {
        label: "Cổng phiên học",
        value: formatInteger(parentScreenTimeReport.totals.allowedSessionCount),
        note: `${formatInteger(parentScreenTimeReport.totals.blockedSessionCount)} bị chặn, ${formatInteger(parentScreenTimeReport.totals.overrideSessionCount)} lượt ghi đè`,
        icon: ClipboardList,
      },
      {
        label: "Bộ kiểm soát kế hoạch",
        value: formatInteger(
          parentScreenTimeGrantDailyPlanGuardReport.totals
            .dailyPlanAccessCaseCount,
        ),
        note: `${formatInteger(parentScreenTimeGrantDailyPlanGuardReport.totals.allowedSessionCount)} được phép, ${formatInteger(parentScreenTimeGrantDailyPlanGuardReport.totals.blockedSessionCount)} bị chặn`,
        icon: ShieldCheck,
      },
      {
        label: "Dấu vết kiểm soát",
        value: formatInteger(
          parentScreenTimeGrantDailyPlanGuardReport.totals
            .sessionGuardTraceCount,
        ),
        note: `${formatInteger(parentScreenTimeGrantDailyPlanGuardReport.totals.parentGrantRuleCount)} grants, ${formatInteger(parentScreenTimeGrantDailyPlanGuardReport.totals.screenTimeRuleCount)} quy tắc thời gian màn hình`,
        icon: Clock3,
      },
      {
        label: "Tổng hợp phiên học",
        value: formatInteger(
          learningSessionCompletionPracticeProgressRollupReport.totals
            .progressRollupCount,
        ),
        note: `${formatInteger(learningSessionCompletionPracticeProgressRollupReport.totals.stableTraceCount)} dấu vết ổn định, ${formatInteger(learningSessionCompletionPracticeProgressRollupReport.totals.openSafetyGateCount)} cổng đang mở`,
        icon: CheckCircle2,
      },
      {
        label: "Bản tổng hợp tiến độ",
        value: `${formatInteger(learningSessionCompletionPracticeProgressRollupReport.totals.parentVisibleProgressSummaryCount)}/${formatInteger(learningSessionCompletionPracticeProgressRollupReport.totals.teacherVisibleProgressSummaryCount)}`,
        note: `${formatPercent(learningSessionCompletionPracticeProgressRollupReport.totals.averageCompletionPercent)} hoàn thành, ${formatPercent(learningSessionCompletionPracticeProgressRollupReport.totals.averagePracticeScorePercent)} luyện tập`,
        icon: Users,
      },
      {
        label: "Can thiệp",
        value: formatInteger(
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .teacherInterventionReviewCount,
        ),
        note: `${formatInteger(teacherInterventionRemedialAssignmentSupportPlanReport.totals.remedialAssignmentCount)} bài khắc phục, ${formatInteger(teacherInterventionRemedialAssignmentSupportPlanReport.totals.supportPlanCount)} kế hoạch hỗ trợ`,
        icon: AlertTriangle,
      },
      {
        label: "Dấu vết hỗ trợ",
        value: formatInteger(
          teacherInterventionRemedialAssignmentSupportPlanReport.totals
            .stableTraceCount,
        ),
        note: `${formatInteger(teacherInterventionRemedialAssignmentSupportPlanReport.totals.parentVisibleSupportSummaryCount)} bản tổng hợp cho phụ huynh, ${formatInteger(teacherInterventionRemedialAssignmentSupportPlanReport.totals.openSafetyGateCount)} cổng đang mở`,
        icon: ShieldCheck,
      },
      {
        label: "Kết quả thử lại",
        value: formatInteger(
          remedialRetryCompletionSupportOutcomeFollowupReport.totals
            .remedialRetryCompletionCount,
        ),
        note: `${formatInteger(remedialRetryCompletionSupportOutcomeFollowupReport.totals.supportOutcomeEvidenceCount)} kết quả, ${formatInteger(remedialRetryCompletionSupportOutcomeFollowupReport.totals.stableTraceCount)} dấu vết`,
        icon: RefreshCw,
      },
      {
        label: "Leo thang lần thử lại",
        value: formatInteger(
          remedialRetryUnresolvedSupportEscalationReport.totals
            .failedOrIncompleteRetryCount,
        ),
        note: `${formatInteger(remedialRetryUnresolvedSupportEscalationReport.totals.teacherEscalationCount)} lượt leo thang, ${formatInteger(remedialRetryUnresolvedSupportEscalationReport.totals.stableTraceCount)} dấu vết`,
        icon: AlertTriangle,
      },
      {
        label: "Đã giải quyết leo thang",
        value: formatInteger(
          teacherEscalationFollowupResolutionReport.totals
            .resolvedSupportOutcomeCount,
        ),
        note: `${formatInteger(teacherEscalationFollowupResolutionReport.totals.adjustedSupportRetryCompletionCount)} lần thử lại đã điều chỉnh, ${formatInteger(teacherEscalationFollowupResolutionReport.totals.stableTraceCount)} dấu vết`,
        icon: CheckCircle2,
      },
      {
        label: "Phụ huynh cần lưu ý",
        value: formatInteger(
          parentScreenTimeReport.totals.childrenNeedingParentAttentionCount,
        ),
        note: `${formatInteger(parentScreenTimeReport.totals.activeScreenTimePolicyCount)} chính sách đang hoạt động`,
        icon: AlertTriangle,
      },
      {
        label: "Thư viện nội dung",
        value: formatInteger(
          teacherContentPublishReport.totals.contentItemCount,
        ),
        note: `${formatInteger(teacherContentPublishReport.totals.publishedContentCount)} đã xuất bản, ${formatInteger(teacherContentPublishReport.totals.blockedUnpublishedItemCount)} bị chặn`,
        icon: BookOpen,
      },
      {
        label: "Lượt xuất bản lộ trình",
        value: formatInteger(
          teacherContentPublishReport.totals.learningPathPublishCount,
        ),
        note: `${formatInteger(teacherContentPublishReport.totals.studentVisibilityCount)} hiển thị cho học viên, ${formatInteger(teacherContentPublishReport.totals.parentVisibleSummaryCount)} bản tổng hợp cho phụ huynh`,
        icon: ClipboardList,
      },
      {
        label: "Trò chuyện với trợ giảng AI",
        value: formatInteger(
          aiTutorChatSafetyTeacherReviewReport.totals.chatSessionCount,
        ),
        note: `${formatInteger(aiTutorChatSafetyTeacherReviewReport.totals.messageCount)} tin nhắn, ${formatInteger(aiTutorChatSafetyTeacherReviewReport.totals.blockedMessageCount)} bị chặn`,
        icon: MessageSquare,
      },
      {
        label: "An toàn trợ giảng",
        value: formatInteger(
          aiTutorChatSafetyTeacherReviewReport.totals.safetyFlagCount,
        ),
        note: `${formatInteger(aiTutorChatSafetyTeacherReviewReport.totals.teacherReviewItemCount)} lượt xét duyệt, ${formatInteger(aiTutorChatSafetyTeacherReviewReport.totals.supportRecommendationCount)} dòng hỗ trợ`,
        icon: ShieldCheck,
      },
      {
        label: "Huy hiệu",
        value: formatInteger(
          studentAchievementBadgeCertificateReport.totals.badgeAwards,
        ),
        note: `${formatInteger(studentAchievementBadgeCertificateReport.totals.studentsWithBadges)} học viên, ${formatInteger(studentAchievementBadgeCertificateReport.totals.certificateFixtures)} chứng nhận mô phỏng`,
        icon: Award,
      },
      {
        label: "Ghi nhận",
        value: formatInteger(
          studentAchievementBadgeCertificateReport.totals.recognitionSummaries,
        ),
        note: `${formatInteger(studentAchievementBadgeCertificateReport.totals.parentVisibleRecognitions)} hiển thị cho phụ huynh, ${formatInteger(studentAchievementBadgeCertificateReport.totals.teacherReviewItems)} lượt xét duyệt`,
        icon: ShieldCheck,
      },
      {
        label: "Bản tin tuần",
        value: formatInteger(
          parentTeacherWeeklyDigestReport.totals.digestCount,
        ),
        note: `${formatInteger(parentTeacherWeeklyDigestReport.totals.readyToSendDigestCount)} sẵn sàng, ${formatInteger(parentTeacherWeeklyDigestReport.totals.teacherReviewDigestCount)} cần xét duyệt`,
        icon: ClipboardList,
      },
      {
        label: "Thao tác bản tin",
        value: formatInteger(
          parentTeacherWeeklyDigestReport.totals.actionCount,
        ),
        note: `${formatInteger(parentTeacherWeeklyDigestReport.totals.highPriorityActionCount)} ưu tiên cao, ${formatInteger(parentTeacherWeeklyDigestReport.totals.completedActionCount)} hoàn tất`,
        icon: MessageSquare,
      },
      {
        label: "Kết quả theo dõi",
        value: formatInteger(followUpActionOutcomeReport.totals.outcomeCount),
        note: `${formatInteger(followUpActionOutcomeReport.totals.completedOutcomeCount + followUpActionOutcomeReport.totals.verifiedOutcomeCount)} đã xong hoặc xác minh, ${formatInteger(followUpActionOutcomeReport.totals.monitoringOutcomeCount)} đang theo dõi`,
        icon: CheckCircle2,
      },
      {
        label: "Minh chứng kết quả",
        value: formatInteger(
          followUpActionOutcomeReport.totals.linkedDailyPlanCount,
        ),
        note: `${formatInteger(followUpActionOutcomeReport.totals.linkedSupportRecommendationCount)} hỗ trợ, ${formatInteger(followUpActionOutcomeReport.totals.linkedTeacherReviewCount)} lượt giáo viên xét duyệt`,
        icon: ShieldCheck,
      },
    ];
  }, [
    aiTutorChatSafetyTeacherReviewReport,
    assessmentReport,
    enrollmentReport,
    followUpActionOutcomeReport,
    learningPathReport,
    learningSessionCompletionPracticeProgressRollupReport,
    mvpEndToEndReadinessTraceReport,
    mvpRoleJourneyEntrypointsReport,
    mvpReadinessOverviewReport,
    parentTeacherAlertReport,
    parentTeacherProgressAccessSummaryReport,
    parentPortalApprovedReportInboxReadReceiptReport,
    parentTeacherReportReviewQueueMessagePreviewReport,
    parentTeacherWeeklyDigestReport,
    parentScreenTimeReport,
    parentScreenTimeGrantDailyPlanGuardReport,
    progressReport,
    remedialRetryCompletionSupportOutcomeFollowupReport,
    remedialRetryUnresolvedSupportEscalationReport,
    teacherEscalationFollowupResolutionReport,
    studentAchievementBadgeCertificateReport,
    studentCourseFlowReport,
    subscriptionEntitlementDailyPlanAccessReport,
    teacherInterventionRemedialAssignmentSupportPlanReport,
    teacherContentPublishReport,
  ]);

  const safetyChecks = useMemo(() => {
    const enrollmentSafety = enrollmentReport?.safety;
    const studentCourseFlowSafety = studentCourseFlowReport?.safety;
    const subscriptionEntitlementSafety =
      subscriptionEntitlementDailyPlanAccessReport?.safety;
    const parentTeacherProgressAccessSafety =
      parentTeacherProgressAccessSummaryReport?.safety;
    const parentTeacherReportReviewQueueSafety =
      parentTeacherReportReviewQueueMessagePreviewReport?.safety;
    const parentPortalInboxSafety =
      parentPortalApprovedReportInboxReadReceiptReport?.safety;
    const progressSafety = progressReport?.safety;
    const assessmentSafety = assessmentReport?.safety;
    const learningPathSafety = learningPathReport?.safety;
    const parentTeacherAlertSafety = parentTeacherAlertReport?.safety;
    const parentScreenTimeSafety = parentScreenTimeReport?.safety;
    const parentScreenTimeGrantDailyPlanGuardSafety =
      parentScreenTimeGrantDailyPlanGuardReport?.safety;
    const learningSessionCompletionSafety =
      learningSessionCompletionPracticeProgressRollupReport?.safety;
    const teacherInterventionSupportPlanSafety =
      teacherInterventionRemedialAssignmentSupportPlanReport?.safety;
    const remedialRetrySafety =
      remedialRetryCompletionSupportOutcomeFollowupReport?.safety;
    const remedialRetryUnresolvedSafety =
      remedialRetryUnresolvedSupportEscalationReport?.safety;
    const teacherContentSafety = teacherContentPublishReport?.safety;
    const aiTutorSafety = aiTutorChatSafetyTeacherReviewReport?.safety;
    const achievementSafety = studentAchievementBadgeCertificateReport?.safety;
    const weeklyDigestSafety = parentTeacherWeeklyDigestReport?.safety;
    const followUpOutcomeSafety = followUpActionOutcomeReport?.safety;
    const mvpReadinessSafety = mvpReadinessOverviewReport?.safety;

    return [
      {
        label: "Chỉ dữ liệu giả lập",
        passed: Boolean(
          enrollmentSafety?.fixtureOnly &&
          studentCourseFlowSafety?.fixtureOnly &&
          subscriptionEntitlementSafety?.fixtureOnly &&
          parentTeacherProgressAccessSafety?.fixtureOnly &&
          parentTeacherReportReviewQueueSafety?.fixtureOnly &&
          parentPortalInboxSafety?.fixtureOnly &&
          progressSafety?.fixtureOnly &&
          assessmentSafety?.fixtureOnly &&
          learningPathSafety?.fixtureOnly &&
          parentTeacherAlertSafety?.fixtureOnly &&
          parentScreenTimeSafety?.fixtureOnly &&
          parentScreenTimeGrantDailyPlanGuardSafety?.fixtureOnly &&
          learningSessionCompletionSafety?.fixtureOnly &&
          teacherInterventionSupportPlanSafety?.fixtureOnly &&
          remedialRetrySafety?.fixtureOnly &&
          remedialRetryUnresolvedSafety?.fixtureOnly &&
          teacherContentSafety?.fixtureOnly &&
          aiTutorSafety?.fixtureOnly &&
          achievementSafety?.fixtureOnly &&
          weeklyDigestSafety?.fixtureOnly &&
          followUpOutcomeSafety?.fixtureOnly &&
          mvpReadinessSafety?.fixtureOnly,
        ),
      },
      {
        label: "Không dùng DB production",
        passed: Boolean(
          enrollmentSafety &&
          studentCourseFlowSafety &&
          subscriptionEntitlementSafety &&
          parentTeacherProgressAccessSafety &&
          parentTeacherReportReviewQueueSafety &&
          parentPortalInboxSafety &&
          progressSafety &&
          assessmentSafety &&
          learningPathSafety &&
          parentTeacherAlertSafety &&
          parentScreenTimeSafety &&
          parentScreenTimeGrantDailyPlanGuardSafety &&
          learningSessionCompletionSafety &&
          teacherInterventionSupportPlanSafety &&
          remedialRetrySafety &&
          teacherContentSafety &&
          aiTutorSafety &&
          achievementSafety &&
          weeklyDigestSafety &&
          followUpOutcomeSafety &&
          mvpReadinessSafety &&
          !enrollmentSafety.productionDbUsed &&
          !studentCourseFlowSafety.productionDbUsed &&
          !subscriptionEntitlementSafety.productionDbUsed &&
          !parentTeacherProgressAccessSafety.productionDbUsed &&
          !parentTeacherReportReviewQueueSafety.productionDbUsed &&
          !parentPortalInboxSafety.productionDbUsed &&
          !progressSafety.productionDbUsed &&
          !assessmentSafety.productionDbUsed &&
          !learningPathSafety.productionDbUsed &&
          !parentTeacherAlertSafety.productionDbUsed &&
          !parentScreenTimeSafety.productionDbUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.productionDbUsed &&
          !learningSessionCompletionSafety.productionDbUsed &&
          !teacherInterventionSupportPlanSafety.productionDbUsed &&
          !remedialRetrySafety.productionDbUsed &&
          !teacherContentSafety.productionDbUsed &&
          !aiTutorSafety.productionDbUsed &&
          !achievementSafety.productionDbUsed &&
          !weeklyDigestSafety.productionDbUsed &&
          !followUpOutcomeSafety.productionDbUsed &&
          !mvpReadinessSafety.productionDbUsed &&
          studentCourseFlowSafety.noProductionDbRead &&
          subscriptionEntitlementSafety.noProductionDbRead &&
          parentTeacherProgressAccessSafety.noProductionDbRead &&
          parentTeacherReportReviewQueueSafety.noProductionDbRead &&
          parentPortalInboxSafety.noProductionDbRead &&
          learningPathSafety.noProductionDbRead &&
          parentTeacherAlertSafety.noProductionDbRead &&
          parentScreenTimeSafety.noProductionDbRead &&
          parentScreenTimeGrantDailyPlanGuardSafety.noProductionDbRead &&
          learningSessionCompletionSafety.noProductionDbRead &&
          teacherInterventionSupportPlanSafety.noProductionDbRead &&
          remedialRetrySafety.noProductionDbRead &&
          teacherContentSafety.noProductionDbRead &&
          aiTutorSafety.noProductionDbRead &&
          achievementSafety.noProductionDbRead &&
          weeklyDigestSafety.noProductionDbRead &&
          followUpOutcomeSafety.noProductionDbRead &&
          mvpReadinessSafety.noProductionDbRead,
        ),
      },
      {
        label: "Không gọi nhà cung cấp",
        passed: Boolean(
          enrollmentSafety &&
          studentCourseFlowSafety &&
          subscriptionEntitlementSafety &&
          parentTeacherProgressAccessSafety &&
          parentTeacherReportReviewQueueSafety &&
          parentPortalInboxSafety &&
          progressSafety &&
          assessmentSafety &&
          learningPathSafety &&
          parentTeacherAlertSafety &&
          parentScreenTimeSafety &&
          parentScreenTimeGrantDailyPlanGuardSafety &&
          learningSessionCompletionSafety &&
          teacherInterventionSupportPlanSafety &&
          remedialRetrySafety &&
          teacherContentSafety &&
          aiTutorSafety &&
          achievementSafety &&
          weeklyDigestSafety &&
          followUpOutcomeSafety &&
          mvpReadinessSafety &&
          !enrollmentSafety.providerApiUsed &&
          !studentCourseFlowSafety.providerApiUsed &&
          !subscriptionEntitlementSafety.providerApiUsed &&
          !parentTeacherProgressAccessSafety.providerApiUsed &&
          !parentTeacherReportReviewQueueSafety.providerApiUsed &&
          !parentPortalInboxSafety.providerApiUsed &&
          !progressSafety.providerApiUsed &&
          !assessmentSafety.providerApiUsed &&
          !learningPathSafety.providerApiUsed &&
          !parentTeacherAlertSafety.providerApiUsed &&
          !parentTeacherAlertSafety.aiProviderUsed &&
          !parentScreenTimeSafety.providerApiUsed &&
          !parentScreenTimeSafety.aiProviderUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.providerApiUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.aiProviderUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.aiProviderExecutionUsed &&
          !learningSessionCompletionSafety.providerApiUsed &&
          !learningSessionCompletionSafety.aiProviderUsed &&
          !learningSessionCompletionSafety.aiProviderExecutionUsed &&
          !teacherInterventionSupportPlanSafety.providerApiUsed &&
          !teacherInterventionSupportPlanSafety.aiProviderUsed &&
          !teacherInterventionSupportPlanSafety.aiProviderExecutionUsed &&
          !remedialRetrySafety.providerApiUsed &&
          !remedialRetrySafety.aiProviderUsed &&
          !remedialRetrySafety.aiProviderExecutionUsed &&
          !teacherContentSafety.providerApiUsed &&
          !teacherContentSafety.aiProviderUsed &&
          !aiTutorSafety.providerApiUsed &&
          !aiTutorSafety.aiProviderUsed &&
          !aiTutorSafety.aiProviderExecutionUsed &&
          !achievementSafety.providerApiUsed &&
          !achievementSafety.aiProviderUsed &&
          !achievementSafety.aiProviderExecutionUsed &&
          !achievementSafety.certificateIssuerProviderUsed &&
          !weeklyDigestSafety.providerApiUsed &&
          !weeklyDigestSafety.aiProviderUsed &&
          !weeklyDigestSafety.aiProviderExecutionUsed &&
          !weeklyDigestSafety.certificateIssuerProviderUsed &&
          !followUpOutcomeSafety.providerApiUsed &&
          !followUpOutcomeSafety.aiProviderUsed &&
          !followUpOutcomeSafety.aiProviderExecutionUsed &&
          !followUpOutcomeSafety.certificateIssuerProviderUsed &&
          !mvpReadinessSafety.providerApiUsed &&
          !mvpReadinessSafety.aiProviderUsed &&
          !mvpReadinessSafety.aiProviderExecutionUsed &&
          !mvpReadinessSafety.certificateIssuerProviderUsed &&
          !enrollmentSafety.paymentProviderUsed &&
          !studentCourseFlowSafety.paymentProviderUsed &&
          !studentCourseFlowSafety.aiProviderExecutionUsed &&
          !studentCourseFlowSafety.notificationProviderUsed &&
          !subscriptionEntitlementSafety.paymentProviderUsed &&
          !subscriptionEntitlementSafety.aiProviderExecutionUsed &&
          !subscriptionEntitlementSafety.notificationProviderUsed &&
          !parentTeacherProgressAccessSafety.paymentProviderUsed &&
          !parentTeacherProgressAccessSafety.aiProviderExecutionUsed &&
          !parentTeacherProgressAccessSafety.notificationProviderUsed &&
          !parentTeacherReportReviewQueueSafety.paymentProviderUsed &&
          !parentTeacherReportReviewQueueSafety.aiProviderExecutionUsed &&
          !parentTeacherReportReviewQueueSafety.notificationProviderUsed &&
          !parentPortalInboxSafety.paymentProviderUsed &&
          !parentPortalInboxSafety.aiProviderExecutionUsed &&
          !parentPortalInboxSafety.notificationProviderUsed &&
          !progressSafety.paymentProviderUsed &&
          !assessmentSafety.paymentProviderUsed &&
          !learningPathSafety.paymentProviderUsed &&
          !parentTeacherAlertSafety.paymentProviderUsed &&
          !parentTeacherAlertSafety.notificationProviderUsed &&
          !parentScreenTimeSafety.paymentProviderUsed &&
          !parentScreenTimeSafety.notificationProviderUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.paymentProviderUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.notificationProviderUsed &&
          !learningSessionCompletionSafety.paymentProviderUsed &&
          !learningSessionCompletionSafety.notificationProviderUsed &&
          !teacherInterventionSupportPlanSafety.paymentProviderUsed &&
          !teacherInterventionSupportPlanSafety.notificationProviderUsed &&
          !remedialRetrySafety.paymentProviderUsed &&
          !remedialRetrySafety.notificationProviderUsed &&
          !teacherContentSafety.paymentProviderUsed &&
          !teacherContentSafety.notificationProviderUsed &&
          !aiTutorSafety.paymentProviderUsed &&
          !aiTutorSafety.notificationProviderUsed &&
          !achievementSafety.paymentProviderUsed &&
          !achievementSafety.notificationProviderUsed &&
          !weeklyDigestSafety.paymentProviderUsed &&
          !weeklyDigestSafety.notificationProviderUsed &&
          !followUpOutcomeSafety.paymentProviderUsed &&
          !followUpOutcomeSafety.notificationProviderUsed &&
          !mvpReadinessSafety.paymentProviderUsed &&
          !mvpReadinessSafety.notificationProviderUsed,
        ),
      },
      {
        label: "Bản ghi học tập chỉ đọc",
        passed: Boolean(
          enrollmentSafety &&
          studentCourseFlowSafety &&
          subscriptionEntitlementSafety &&
          parentTeacherProgressAccessSafety &&
          parentTeacherReportReviewQueueSafety &&
          parentPortalInboxSafety &&
          progressSafety &&
          assessmentSafety &&
          learningPathSafety &&
          parentTeacherAlertSafety &&
          parentScreenTimeSafety &&
          parentScreenTimeGrantDailyPlanGuardSafety &&
          learningSessionCompletionSafety &&
          teacherInterventionSupportPlanSafety &&
          remedialRetrySafety &&
          teacherContentSafety &&
          aiTutorSafety &&
          achievementSafety &&
          weeklyDigestSafety &&
          followUpOutcomeSafety &&
          mvpReadinessSafety &&
          !enrollmentSafety.realStudentMutationUsed &&
          !enrollmentSafety.realCourseMutationUsed &&
          !enrollmentSafety.realEnrollmentMutationUsed &&
          !enrollmentSafety.realPaymentMutationUsed &&
          !enrollmentSafety.realRefundMutationUsed &&
          !enrollmentSafety.realCommissionMutationUsed &&
          !studentCourseFlowSafety.realStudentMutationUsed &&
          !studentCourseFlowSafety.realCourseMutationUsed &&
          !studentCourseFlowSafety.realEnrollmentMutationUsed &&
          !studentCourseFlowSafety.realSubscriptionMutationUsed &&
          !studentCourseFlowSafety.realPaymentMutationUsed &&
          !studentCourseFlowSafety.realRefundMutationUsed &&
          !studentCourseFlowSafety.realCommissionMutationUsed &&
          !studentCourseFlowSafety.realLearningMutationUsed &&
          !subscriptionEntitlementSafety.realStudentMutationUsed &&
          !subscriptionEntitlementSafety.realCourseMutationUsed &&
          !subscriptionEntitlementSafety.realEnrollmentMutationUsed &&
          !subscriptionEntitlementSafety.realSubscriptionMutationUsed &&
          !subscriptionEntitlementSafety.realPaymentMutationUsed &&
          !subscriptionEntitlementSafety.realRefundMutationUsed &&
          !subscriptionEntitlementSafety.realCommissionMutationUsed &&
          !subscriptionEntitlementSafety.realLearningMutationUsed &&
          !subscriptionEntitlementSafety.realErpMutationUsed &&
          !parentTeacherProgressAccessSafety.realStudentMutationUsed &&
          !parentTeacherProgressAccessSafety.realCourseMutationUsed &&
          !parentTeacherProgressAccessSafety.realEnrollmentMutationUsed &&
          !parentTeacherProgressAccessSafety.realSubscriptionMutationUsed &&
          !parentTeacherProgressAccessSafety.realPaymentMutationUsed &&
          !parentTeacherProgressAccessSafety.realRefundMutationUsed &&
          !parentTeacherProgressAccessSafety.realCommissionMutationUsed &&
          !parentTeacherProgressAccessSafety.realLearningMutationUsed &&
          !parentTeacherProgressAccessSafety.realErpMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realStudentMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realCourseMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realEnrollmentMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realSubscriptionMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realPaymentMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realRefundMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realCommissionMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realLearningMutationUsed &&
          !parentTeacherReportReviewQueueSafety.realErpMutationUsed &&
          !parentPortalInboxSafety.realStudentMutationUsed &&
          !parentPortalInboxSafety.realCourseMutationUsed &&
          !parentPortalInboxSafety.realEnrollmentMutationUsed &&
          !parentPortalInboxSafety.realSubscriptionMutationUsed &&
          !parentPortalInboxSafety.realPaymentMutationUsed &&
          !parentPortalInboxSafety.realRefundMutationUsed &&
          !parentPortalInboxSafety.realCommissionMutationUsed &&
          !parentPortalInboxSafety.realLearningMutationUsed &&
          !parentPortalInboxSafety.realErpMutationUsed &&
          !progressSafety.realClassMutationUsed &&
          !progressSafety.realSessionMutationUsed &&
          !progressSafety.realAttendanceMutationUsed &&
          !progressSafety.realProgressMutationUsed &&
          !assessmentSafety.realLessonMutationUsed &&
          !assessmentSafety.realAssignmentMutationUsed &&
          !assessmentSafety.realAssessmentMutationUsed &&
          !learningPathSafety.realLearningPathMutationUsed &&
          !learningPathSafety.realDailyPlanMutationUsed &&
          !learningPathSafety.realVideoEvidenceMutationUsed &&
          !learningPathSafety.realPracticeMutationUsed &&
          !parentTeacherAlertSafety.realParentMessageMutationUsed &&
          !parentTeacherAlertSafety.realTeacherInterventionMutationUsed &&
          !parentScreenTimeSafety.realParentGuardianMutationUsed &&
          !parentScreenTimeSafety.realScreenTimePolicyMutationUsed &&
          !parentScreenTimeSafety.realLearningSessionGateMutationUsed &&
          !parentScreenTimeSafety.realScreenTimeGrantMutationUsed &&
          !parentScreenTimeSafety.realDailyPlanAccessMutationUsed &&
          !parentScreenTimeSafety.realParentMessageMutationUsed &&
          !parentScreenTimeSafety.realTeacherInterventionMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realStudentMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realParentMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realCourseMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realEnrollmentMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realSubscriptionMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realClassMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realSessionMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realAttendanceMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realProgressMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realLessonMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realAssignmentMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realAssessmentMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realLearningPathMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realDailyPlanMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realVideoEvidenceMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realPracticeMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realParentGuardianMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realScreenTimePolicyMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realLearningSessionGateMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realScreenTimeGrantMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realDailyPlanAccessMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realLearningMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realParentMessageMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realTeacherInterventionMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realPaymentMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realRefundMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realCommissionMutationUsed &&
          !parentScreenTimeGrantDailyPlanGuardSafety.realErpMutationUsed &&
          !learningSessionCompletionSafety.realStudentMutationUsed &&
          !learningSessionCompletionSafety.realParentMutationUsed &&
          !learningSessionCompletionSafety.realCourseMutationUsed &&
          !learningSessionCompletionSafety.realEnrollmentMutationUsed &&
          !learningSessionCompletionSafety.realSubscriptionMutationUsed &&
          !learningSessionCompletionSafety.realClassMutationUsed &&
          !learningSessionCompletionSafety.realSessionMutationUsed &&
          !learningSessionCompletionSafety.realAttendanceMutationUsed &&
          !learningSessionCompletionSafety.realProgressMutationUsed &&
          !learningSessionCompletionSafety.realLessonMutationUsed &&
          !learningSessionCompletionSafety.realAssignmentMutationUsed &&
          !learningSessionCompletionSafety.realAssessmentMutationUsed &&
          !learningSessionCompletionSafety.realLearningPathMutationUsed &&
          !learningSessionCompletionSafety.realDailyPlanMutationUsed &&
          !learningSessionCompletionSafety.realVideoEvidenceMutationUsed &&
          !learningSessionCompletionSafety.realPracticeMutationUsed &&
          !learningSessionCompletionSafety.realParentGuardianMutationUsed &&
          !learningSessionCompletionSafety.realScreenTimePolicyMutationUsed &&
          !learningSessionCompletionSafety.realLearningSessionGateMutationUsed &&
          !learningSessionCompletionSafety.realScreenTimeGrantMutationUsed &&
          !learningSessionCompletionSafety.realDailyPlanAccessMutationUsed &&
          !learningSessionCompletionSafety.realLearningMutationUsed &&
          !learningSessionCompletionSafety.realLearningSessionCompletionMutationUsed &&
          !learningSessionCompletionSafety.realParentProgressSummaryMutationUsed &&
          !learningSessionCompletionSafety.realTeacherProgressSummaryMutationUsed &&
          !learningSessionCompletionSafety.realParentMessageMutationUsed &&
          !learningSessionCompletionSafety.realTeacherInterventionMutationUsed &&
          !learningSessionCompletionSafety.realPaymentMutationUsed &&
          !learningSessionCompletionSafety.realRefundMutationUsed &&
          !learningSessionCompletionSafety.realCommissionMutationUsed &&
          !learningSessionCompletionSafety.realErpMutationUsed &&
          !teacherInterventionSupportPlanSafety.realStudentMutationUsed &&
          !teacherInterventionSupportPlanSafety.realParentMutationUsed &&
          !teacherInterventionSupportPlanSafety.realCourseMutationUsed &&
          !teacherInterventionSupportPlanSafety.realEnrollmentMutationUsed &&
          !teacherInterventionSupportPlanSafety.realSubscriptionMutationUsed &&
          !teacherInterventionSupportPlanSafety.realClassMutationUsed &&
          !teacherInterventionSupportPlanSafety.realSessionMutationUsed &&
          !teacherInterventionSupportPlanSafety.realAttendanceMutationUsed &&
          !teacherInterventionSupportPlanSafety.realProgressMutationUsed &&
          !teacherInterventionSupportPlanSafety.realLessonMutationUsed &&
          !teacherInterventionSupportPlanSafety.realAssignmentMutationUsed &&
          !teacherInterventionSupportPlanSafety.realAssessmentMutationUsed &&
          !teacherInterventionSupportPlanSafety.realLearningPathMutationUsed &&
          !teacherInterventionSupportPlanSafety.realDailyPlanMutationUsed &&
          !teacherInterventionSupportPlanSafety.realVideoEvidenceMutationUsed &&
          !teacherInterventionSupportPlanSafety.realPracticeMutationUsed &&
          !teacherInterventionSupportPlanSafety.realParentGuardianMutationUsed &&
          !teacherInterventionSupportPlanSafety.realScreenTimePolicyMutationUsed &&
          !teacherInterventionSupportPlanSafety.realLearningSessionGateMutationUsed &&
          !teacherInterventionSupportPlanSafety.realScreenTimeGrantMutationUsed &&
          !teacherInterventionSupportPlanSafety.realDailyPlanAccessMutationUsed &&
          !teacherInterventionSupportPlanSafety.realLearningMutationUsed &&
          !teacherInterventionSupportPlanSafety.realLearningSessionCompletionMutationUsed &&
          !teacherInterventionSupportPlanSafety.realParentProgressSummaryMutationUsed &&
          !teacherInterventionSupportPlanSafety.realTeacherProgressSummaryMutationUsed &&
          !teacherInterventionSupportPlanSafety.realParentMessageMutationUsed &&
          !teacherInterventionSupportPlanSafety.realTeacherInterventionMutationUsed &&
          !teacherInterventionSupportPlanSafety.realTeacherInterventionReviewMutationUsed &&
          !teacherInterventionSupportPlanSafety.realRemedialAssignmentMutationUsed &&
          !teacherInterventionSupportPlanSafety.realSupportPlanMutationUsed &&
          !teacherInterventionSupportPlanSafety.realParentSupportSummaryMutationUsed &&
          !teacherInterventionSupportPlanSafety.realTeacherNextActionMutationUsed &&
          !teacherInterventionSupportPlanSafety.realPaymentMutationUsed &&
          !teacherInterventionSupportPlanSafety.realRefundMutationUsed &&
          !teacherInterventionSupportPlanSafety.realCommissionMutationUsed &&
          !teacherInterventionSupportPlanSafety.realErpMutationUsed &&
          !remedialRetrySafety.realStudentMutationUsed &&
          !remedialRetrySafety.realParentMutationUsed &&
          !remedialRetrySafety.realCourseMutationUsed &&
          !remedialRetrySafety.realEnrollmentMutationUsed &&
          !remedialRetrySafety.realSubscriptionMutationUsed &&
          !remedialRetrySafety.realClassMutationUsed &&
          !remedialRetrySafety.realSessionMutationUsed &&
          !remedialRetrySafety.realAttendanceMutationUsed &&
          !remedialRetrySafety.realProgressMutationUsed &&
          !remedialRetrySafety.realLessonMutationUsed &&
          !remedialRetrySafety.realAssignmentMutationUsed &&
          !remedialRetrySafety.realAssessmentMutationUsed &&
          !remedialRetrySafety.realLearningPathMutationUsed &&
          !remedialRetrySafety.realDailyPlanMutationUsed &&
          !remedialRetrySafety.realVideoEvidenceMutationUsed &&
          !remedialRetrySafety.realPracticeMutationUsed &&
          !remedialRetrySafety.realParentGuardianMutationUsed &&
          !remedialRetrySafety.realScreenTimePolicyMutationUsed &&
          !remedialRetrySafety.realLearningSessionGateMutationUsed &&
          !remedialRetrySafety.realScreenTimeGrantMutationUsed &&
          !remedialRetrySafety.realDailyPlanAccessMutationUsed &&
          !remedialRetrySafety.realLearningMutationUsed &&
          !remedialRetrySafety.realLearningSessionCompletionMutationUsed &&
          !remedialRetrySafety.realParentProgressSummaryMutationUsed &&
          !remedialRetrySafety.realTeacherProgressSummaryMutationUsed &&
          !remedialRetrySafety.realParentMessageMutationUsed &&
          !remedialRetrySafety.realTeacherInterventionMutationUsed &&
          !remedialRetrySafety.realTeacherInterventionReviewMutationUsed &&
          !remedialRetrySafety.realRemedialAssignmentMutationUsed &&
          !remedialRetrySafety.realSupportPlanMutationUsed &&
          !remedialRetrySafety.realParentSupportSummaryMutationUsed &&
          !remedialRetrySafety.realTeacherNextActionMutationUsed &&
          !remedialRetrySafety.realRemedialRetryCompletionMutationUsed &&
          !remedialRetrySafety.realSupportOutcomeEvidenceMutationUsed &&
          !remedialRetrySafety.realParentFollowupSummaryMutationUsed &&
          !remedialRetrySafety.realTeacherFollowupSummaryMutationUsed &&
          !remedialRetrySafety.realPaymentMutationUsed &&
          !remedialRetrySafety.realRefundMutationUsed &&
          !remedialRetrySafety.realCommissionMutationUsed &&
          !remedialRetrySafety.realErpMutationUsed &&
          remedialRetryUnresolvedSafety &&
          !remedialRetryUnresolvedSafety.realStudentMutationUsed &&
          !remedialRetryUnresolvedSafety.realParentMutationUsed &&
          !remedialRetryUnresolvedSafety.realCourseMutationUsed &&
          !remedialRetryUnresolvedSafety.realEnrollmentMutationUsed &&
          !remedialRetryUnresolvedSafety.realSubscriptionMutationUsed &&
          !remedialRetryUnresolvedSafety.realClassMutationUsed &&
          !remedialRetryUnresolvedSafety.realSessionMutationUsed &&
          !remedialRetryUnresolvedSafety.realAttendanceMutationUsed &&
          !remedialRetryUnresolvedSafety.realProgressMutationUsed &&
          !remedialRetryUnresolvedSafety.realLessonMutationUsed &&
          !remedialRetryUnresolvedSafety.realAssignmentMutationUsed &&
          !remedialRetryUnresolvedSafety.realAssessmentMutationUsed &&
          !remedialRetryUnresolvedSafety.realLearningPathMutationUsed &&
          !remedialRetryUnresolvedSafety.realDailyPlanMutationUsed &&
          !remedialRetryUnresolvedSafety.realVideoEvidenceMutationUsed &&
          !remedialRetryUnresolvedSafety.realPracticeMutationUsed &&
          !remedialRetryUnresolvedSafety.realParentGuardianMutationUsed &&
          !remedialRetryUnresolvedSafety.realScreenTimePolicyMutationUsed &&
          !remedialRetryUnresolvedSafety.realLearningSessionGateMutationUsed &&
          !remedialRetryUnresolvedSafety.realScreenTimeGrantMutationUsed &&
          !remedialRetryUnresolvedSafety.realDailyPlanAccessMutationUsed &&
          !remedialRetryUnresolvedSafety.realLearningMutationUsed &&
          !remedialRetryUnresolvedSafety.realLearningSessionCompletionMutationUsed &&
          !remedialRetryUnresolvedSafety.realParentProgressSummaryMutationUsed &&
          !remedialRetryUnresolvedSafety.realTeacherProgressSummaryMutationUsed &&
          !remedialRetryUnresolvedSafety.realParentMessageMutationUsed &&
          !remedialRetryUnresolvedSafety.realTeacherInterventionMutationUsed &&
          !remedialRetryUnresolvedSafety.realTeacherInterventionReviewMutationUsed &&
          !remedialRetryUnresolvedSafety.realRemedialAssignmentMutationUsed &&
          !remedialRetryUnresolvedSafety.realSupportPlanMutationUsed &&
          !remedialRetryUnresolvedSafety.realParentSupportSummaryMutationUsed &&
          !remedialRetryUnresolvedSafety.realTeacherNextActionMutationUsed &&
          !remedialRetryUnresolvedSafety.realRemedialRetryUnresolvedAttemptMutationUsed &&
          !remedialRetryUnresolvedSafety.realUnresolvedSupportOutcomeMutationUsed &&
          !remedialRetryUnresolvedSafety.realTeacherEscalationMutationUsed &&
          !remedialRetryUnresolvedSafety.realSupportAdjustmentMutationUsed &&
          !remedialRetryUnresolvedSafety.realParentEscalationSummaryMutationUsed &&
          !remedialRetryUnresolvedSafety.realTeacherEscalationNextActionMutationUsed &&
          !remedialRetryUnresolvedSafety.realPaymentMutationUsed &&
          !remedialRetryUnresolvedSafety.realRefundMutationUsed &&
          !remedialRetryUnresolvedSafety.realCommissionMutationUsed &&
          !remedialRetryUnresolvedSafety.realErpMutationUsed &&
          !teacherContentSafety.realContentLibraryMutationUsed &&
          !teacherContentSafety.realContentPublishMutationUsed &&
          !teacherContentSafety.realContentUploadMutationUsed &&
          !teacherContentSafety.realStorageCdnMutationUsed &&
          !teacherContentSafety.realTeacherAdminAccountMutationUsed &&
          !teacherContentSafety.realStudentClassVisibilityMutationUsed &&
          !teacherContentSafety.realParentSummaryMutationUsed &&
          !aiTutorSafety.realAiChatMutationUsed &&
          !aiTutorSafety.realAiModerationMutationUsed &&
          !aiTutorSafety.realParentMessageMutationUsed &&
          !aiTutorSafety.realTeacherInterventionMutationUsed &&
          !aiTutorSafety.realLearningSupportMutationUsed &&
          !achievementSafety.realAiChatMutationUsed &&
          !achievementSafety.realAiModerationMutationUsed &&
          !achievementSafety.realLearningSupportMutationUsed &&
          !achievementSafety.realAchievementMutationUsed &&
          !achievementSafety.realBadgeMutationUsed &&
          !achievementSafety.realCertificateMutationUsed &&
          !achievementSafety.realCredentialIssuanceUsed &&
          !achievementSafety.realRecognitionNotificationMutationUsed &&
          !achievementSafety.realParentMessageMutationUsed &&
          !achievementSafety.realTeacherInterventionMutationUsed &&
          !weeklyDigestSafety.realAiChatMutationUsed &&
          !weeklyDigestSafety.realAiModerationMutationUsed &&
          !weeklyDigestSafety.realLearningSupportMutationUsed &&
          !weeklyDigestSafety.realAchievementMutationUsed &&
          !weeklyDigestSafety.realBadgeMutationUsed &&
          !weeklyDigestSafety.realCertificateMutationUsed &&
          !weeklyDigestSafety.realCredentialIssuanceUsed &&
          !weeklyDigestSafety.realRecognitionNotificationMutationUsed &&
          !weeklyDigestSafety.realParentMessageMutationUsed &&
          !weeklyDigestSafety.realTeacherInterventionMutationUsed &&
          !weeklyDigestSafety.realWeeklyDigestNotificationMutationUsed &&
          !followUpOutcomeSafety.realAiChatMutationUsed &&
          !followUpOutcomeSafety.realAiModerationMutationUsed &&
          !followUpOutcomeSafety.realLearningSupportMutationUsed &&
          !followUpOutcomeSafety.realAchievementMutationUsed &&
          !followUpOutcomeSafety.realBadgeMutationUsed &&
          !followUpOutcomeSafety.realCertificateMutationUsed &&
          !followUpOutcomeSafety.realCredentialIssuanceUsed &&
          !followUpOutcomeSafety.realRecognitionNotificationMutationUsed &&
          !followUpOutcomeSafety.realParentSummaryMutationUsed &&
          !followUpOutcomeSafety.realParentMessageMutationUsed &&
          !followUpOutcomeSafety.realTeacherInterventionMutationUsed &&
          !followUpOutcomeSafety.realWeeklyDigestNotificationMutationUsed &&
          !followUpOutcomeSafety.realFollowUpActionOutcomeMutationUsed &&
          !mvpReadinessSafety.realStudentMutationUsed &&
          !mvpReadinessSafety.realCourseMutationUsed &&
          !mvpReadinessSafety.realEnrollmentMutationUsed &&
          !mvpReadinessSafety.realClassMutationUsed &&
          !mvpReadinessSafety.realSessionMutationUsed &&
          !mvpReadinessSafety.realAttendanceMutationUsed &&
          !mvpReadinessSafety.realProgressMutationUsed &&
          !mvpReadinessSafety.realLessonMutationUsed &&
          !mvpReadinessSafety.realAssignmentMutationUsed &&
          !mvpReadinessSafety.realAssessmentMutationUsed &&
          !mvpReadinessSafety.realLearningPathMutationUsed &&
          !mvpReadinessSafety.realDailyPlanMutationUsed &&
          !mvpReadinessSafety.realVideoEvidenceMutationUsed &&
          !mvpReadinessSafety.realPracticeMutationUsed &&
          !mvpReadinessSafety.realLearningSessionCompletionMutationUsed &&
          !mvpReadinessSafety.realParentProgressSummaryMutationUsed &&
          !mvpReadinessSafety.realTeacherProgressSummaryMutationUsed &&
          !mvpReadinessSafety.realTeacherInterventionReviewMutationUsed &&
          !mvpReadinessSafety.realRemedialAssignmentMutationUsed &&
          !mvpReadinessSafety.realSupportPlanMutationUsed &&
          !mvpReadinessSafety.realParentSupportSummaryMutationUsed &&
          !mvpReadinessSafety.realTeacherNextActionMutationUsed &&
          !mvpReadinessSafety.realRemedialRetryCompletionMutationUsed &&
          !mvpReadinessSafety.realSupportOutcomeEvidenceMutationUsed &&
          !mvpReadinessSafety.realParentFollowupSummaryMutationUsed &&
          !mvpReadinessSafety.realTeacherFollowupSummaryMutationUsed &&
          !mvpReadinessSafety.realRemedialRetryUnresolvedAttemptMutationUsed &&
          !mvpReadinessSafety.realUnresolvedSupportOutcomeMutationUsed &&
          !mvpReadinessSafety.realTeacherEscalationMutationUsed &&
          !mvpReadinessSafety.realSupportAdjustmentMutationUsed &&
          !mvpReadinessSafety.realParentEscalationSummaryMutationUsed &&
          !mvpReadinessSafety.realTeacherEscalationNextActionMutationUsed &&
          !mvpReadinessSafety.realAiChatMutationUsed &&
          !mvpReadinessSafety.realAiModerationMutationUsed &&
          !mvpReadinessSafety.realLearningSupportMutationUsed &&
          !mvpReadinessSafety.realAchievementMutationUsed &&
          !mvpReadinessSafety.realBadgeMutationUsed &&
          !mvpReadinessSafety.realCertificateMutationUsed &&
          !mvpReadinessSafety.realCredentialIssuanceUsed &&
          !mvpReadinessSafety.realRecognitionNotificationMutationUsed &&
          !mvpReadinessSafety.realParentSummaryMutationUsed &&
          !mvpReadinessSafety.realParentMessageMutationUsed &&
          !mvpReadinessSafety.realTeacherInterventionMutationUsed &&
          !mvpReadinessSafety.realWeeklyDigestNotificationMutationUsed &&
          !mvpReadinessSafety.realFollowUpActionOutcomeMutationUsed,
        ),
      },
    ];
  }, [
    aiTutorChatSafetyTeacherReviewReport,
    assessmentReport,
    enrollmentReport,
    followUpActionOutcomeReport,
    learningPathReport,
    learningSessionCompletionPracticeProgressRollupReport,
    mvpReadinessOverviewReport,
    parentTeacherAlertReport,
    parentTeacherProgressAccessSummaryReport,
    parentPortalApprovedReportInboxReadReceiptReport,
    parentTeacherReportReviewQueueMessagePreviewReport,
    parentTeacherWeeklyDigestReport,
    parentScreenTimeReport,
    parentScreenTimeGrantDailyPlanGuardReport,
    progressReport,
    remedialRetryCompletionSupportOutcomeFollowupReport,
    remedialRetryUnresolvedSupportEscalationReport,
    studentAchievementBadgeCertificateReport,
    studentCourseFlowReport,
    subscriptionEntitlementDailyPlanAccessReport,
    teacherInterventionRemedialAssignmentSupportPlanReport,
    teacherContentPublishReport,
  ]);

  const generatedAt =
    mvpReadinessOverviewReport?.generatedAt ??
    mvpEndToEndReadinessTraceReport?.generatedAt ??
    mvpRoleJourneyEntrypointsReport?.generatedAt ??
    followUpActionOutcomeReport?.generatedAt ??
    parentTeacherWeeklyDigestReport?.generatedAt ??
    studentAchievementBadgeCertificateReport?.generatedAt ??
    aiTutorChatSafetyTeacherReviewReport?.generatedAt ??
    teacherContentPublishReport?.generatedAt ??
    teacherEscalationFollowupResolutionReport?.generatedAt ??
    teacherInterventionRemedialAssignmentSupportPlanReport?.generatedAt ??
    learningSessionCompletionPracticeProgressRollupReport?.generatedAt ??
    parentScreenTimeGrantDailyPlanGuardReport?.generatedAt ??
    parentScreenTimeReport?.generatedAt ??
    parentTeacherAlertReport?.generatedAt ??
    parentPortalApprovedReportInboxReadReceiptReport?.generatedAt ??
    parentTeacherReportReviewQueueMessagePreviewReport?.generatedAt ??
    parentTeacherProgressAccessSummaryReport?.generatedAt ??
    learningPathReport?.generatedAt ??
    assessmentReport?.generatedAt ??
    progressReport?.generatedAt ??
    subscriptionEntitlementDailyPlanAccessReport?.generatedAt ??
    studentCourseFlowReport?.generatedAt ??
    enrollmentReport?.generatedAt;

  return (
    <div className="px-6 py-6 lg:px-8 lg:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
              <GraduationCap size={18} />
              Bản demo học tập cục bộ / chỉ dùng dữ liệu mô phỏng
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Bảng điều khiển demo học tập cốt lõi
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
              {message}
            </p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void loadReports()}
            type="button"
          >
            <RefreshCw size={16} />
            Làm mới dữ liệu giả lập
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {safetyChecks.map((item) => (
            <div
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              key={item.label}
            >
              <div
                className={`grid size-9 place-items-center rounded-xl ${
                  item.passed
                    ? "bg-teal-50 text-teal-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {item.passed ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertTriangle size={17} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">
                  {item.passed
                    ? "Đã đóng trong bản demo local"
                    : "Đang chờ dữ liệu giả lập"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {generatedAt && (
          <p className="mt-4 text-xs text-slate-500">
            Thời điểm tạo {formatDateTime(generatedAt)}
          </p>
        )}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ icon: Icon, ...item }) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={item.label}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <Icon size={17} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{item.note}</p>
          </article>
        ))}
        {!isLoading && metricCards.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            Không có dữ liệu mô phỏng học tập.
          </div>
        )}
      </section>

      <section
        id="mvp-readiness-overview"
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={18} />
              Tổng quan mức độ sẵn sàng của MVP
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Bản tổng hợp dữ liệu mô phỏng đã được chấp nhận về ghi danh, gói
              thuê bao, hoàn tiền, hoa hồng, kế hoạch hằng ngày, bài học, hoàn
              thành phiên, tiến độ, trợ giảng AI, thành tích, bản tin và kết
              quả.
            </p>
          </div>
          {mvpReadinessOverviewReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(mvpReadinessOverviewReport.totals.sliceCount)} dòng
              đánh giá sẵn sàng
            </span>
          )}
        </div>

        {mvpReadinessOverviewReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Mức độ sẵn sàng
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatPercent(
                    mvpReadinessOverviewReport.totals.readinessScorePercent,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.localDemoReadySliceCount,
                  )}
                  /{formatInteger(mvpReadinessOverviewReport.totals.sliceCount)}{" "}
                  demo cục bộ đã sẵn sàng
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Minh chứng
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.evidenceEndpointCount,
                  )}{" "}
                  điểm cuối API
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.jsonExportCount,
                  )}{" "}
                  JSON /{" "}
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.markdownExportCount,
                  )}{" "}
                  Markdown
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Cổng an toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.openSafetyGateCount,
                  )}{" "}
                  đang mở, chưa sẵn sàng cho môi trường thật
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Phạm vi học tập
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.studentCount,
                  )}{" "}
                  học viên
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpReadinessOverviewReport.totals.followUpOutcomeCount,
                  )}{" "}
                  kết quả theo dõi
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Hạng mục</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Chính</th>
                      <th className="px-5 py-3 text-right">Phụ</th>
                      <th className="px-5 py-3 text-right">Phạm vi</th>
                      <th className="px-5 py-3">Điểm cuối API</th>
                      <th className="px-5 py-3">Minh chứng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {mvpReadinessOverviewReport.rows.map((row) => (
                      <tr key={row.sliceKey}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.sliceName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.sliceKey)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.readinessStatus)}`}
                          >
                            {compactStatus(row.readinessStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            Chỉ dùng cho demo cục bộ
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.primaryMetricValue)}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.primaryMetricLabel}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.secondaryMetricValue)}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.secondaryMetricLabel}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.coverageValue)}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.coverageLabel}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-xs text-slate-600">
                          {row.sourceEndpointPath}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-600">
                          <p>{row.evidenceSummary}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.riskNote}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            Đang tải minh chứng mô phỏng về mức độ sẵn sàng của MVP.
          </div>
        )}
      </section>

      <section
        id="mvp-role-journey-entrypoints"
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users size={18} />
              Điểm truy cập hành trình theo vai trò của MVP
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Các điểm truy cập của học viên, phụ huynh, giáo viên và quản
              trị/vận hành cho lộ trình Minh/khóa A1 đã được chấp nhận.
            </p>
          </div>
          {mvpRoleJourneyEntrypointsReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount,
              )}{" "}
              dòng vai trò
            </span>
          )}
        </div>

        {mvpRoleJourneyEntrypointsReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Điểm truy cập theo vai trò
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Học viên, phụ huynh, giáo viên, quản trị/vận hành
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Dấu vết ổn định
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals
                      .stableRoleJourneyTraceCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals
                      .sameStudentCoursePathCount,
                  )}{" "}
                  dòng vai trò cùng lộ trình
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Minh chứng liên kết
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals
                      .linkedMvpReadinessTraceCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals
                      .linkedParentReadReceiptCount,
                  )}{" "}
                  liên kết biên nhận đã đọc
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Cổng an toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals.safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpRoleJourneyEntrypointsReport.totals.openSafetyGateCount,
                  )}{" "}
                  đang mở, chưa sẵn sàng cho môi trường thật
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1240px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Vai trò</th>
                      <th className="px-5 py-3">Đường dẫn</th>
                      <th className="px-5 py-3">Hành động</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Minh chứng liên kết</th>
                      <th className="px-5 py-3">Tổng hợp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {mvpRoleJourneyEntrypointsReport.entrypointRows.map(
                      (row) => (
                        <tr key={row.roleEntrypointId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.roleLabel}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.role)} / {row.ownerLabel}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-600">
                            <p>{row.routePath}</p>
                            <p className="mt-2 text-slate-500">
                              {row.dashboardAnchor}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-600">
                            <p>{row.actionLabel}</p>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.reasonLabel}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.statusLabel)}`}
                            >
                              {compactStatus(row.statusLabel)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-600">
                            <p>{row.mvpReadinessTraceId}</p>
                            <p className="mt-1">
                              {row.parentReadReceiptEvidenceId}
                            </p>
                            <p className="mt-1">
                              {row.teacherEscalationResolutionId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-600">
                            {row.evidenceSummary}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            Đang tải minh chứng mô phỏng về hành trình theo vai trò của MVP.
          </div>
        )}
      </section>

      <section
        id="student-course-enrollment-subscription-flow"
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 size={18} />
              Kết quả thao tác theo dõi
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Kết quả mô phỏng cho các thao tác bản tin tuần, liên kết với kế
              hoạch hằng ngày, đề xuất hỗ trợ, thành tích, tổng hợp cho phụ
              huynh và đánh giá của giáo viên.
            </p>
          </div>
          {followUpActionOutcomeReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(followUpActionOutcomeReport.totals.outcomeCount)}{" "}
              dòng kết quả
            </span>
          )}
        </div>

        {followUpActionOutcomeReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Đã hoàn tất hoặc xác minh
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    followUpActionOutcomeReport.totals.completedOutcomeCount +
                      followUpActionOutcomeReport.totals.verifiedOutcomeCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    followUpActionOutcomeReport.totals.positiveOutcomeCount,
                  )}{" "}
                  kết quả tích cực
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Theo dõi đang mở
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    followUpActionOutcomeReport.totals.scheduledOutcomeCount +
                      followUpActionOutcomeReport.totals.monitoringOutcomeCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    followUpActionOutcomeReport.totals.studentsWithOpenOutcome,
                  )}{" "}
                  học viên đang mở
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Minh chứng liên kết
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    followUpActionOutcomeReport.totals.linkedDailyPlanCount,
                  )}{" "}
                  kế hoạch
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    followUpActionOutcomeReport.totals
                      .linkedSupportRecommendationCount,
                  )}{" "}
                  dòng hỗ trợ
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tạm giữ
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    followUpActionOutcomeReport.totals.heldOutcomeCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    followUpActionOutcomeReport.totals.noSendOutcomeCount,
                  )}{" "}
                  kết quả không gửi
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1060px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Học sinh</th>
                      <th className="px-5 py-3 text-right">Kết quả</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Cần hỗ trợ</th>
                      <th className="px-5 py-3">Lần xét duyệt tiếp theo</th>
                      <th className="px-5 py-3">Tổng hợp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {followUpActionOutcomeReport.studentRows.map((row) => (
                      <tr key={row.studentId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.parentGuardianName}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.outcomeCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.completedOrVerifiedCount)} đã
                            xong
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              row.heldOutcomeCount > 0
                                ? statusBadgeClass("HELD")
                                : row.needsSupportOutcomeCount > 0
                                  ? statusBadgeClass("NEEDS_SUPPORT")
                                  : statusBadgeClass("POSITIVE")
                            }`}
                          >
                            {row.heldOutcomeCount > 0
                              ? "Tạm giữ"
                              : row.needsSupportOutcomeCount > 0
                                ? "Cần hỗ trợ"
                                : "Tích cực"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.needsSupportOutcomeCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.parentVisibleOutcomeCount)} hiển
                            thị
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.nextReviewAt
                            ? formatDateTime(row.nextReviewAt)
                            : "n/a"}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-600">
                          {row.outcomeSummary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Kết quả</th>
                      <th className="px-5 py-3">Hành động</th>
                      <th className="px-5 py-3">Trạng thái kết quả</th>
                      <th className="px-5 py-3">Tác động</th>
                      <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Hỗ trợ</th>
                      <th className="px-5 py-3">Duyệt</th>
                      <th className="px-5 py-3">Minh chứng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {followUpActionOutcomeReport.outcomeRows.map((row) => (
                      <tr key={row.outcomeId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.outcomeId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {compactStatus(row.actionOwner)} /{" "}
                          {compactStatus(row.actionPriority)}
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.actionStatus)} thao tác
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.outcomeStatus)}`}
                          >
                            {compactStatus(row.outcomeStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.parentVisible
                              ? "Hiển thị cho phụ huynh"
                              : "Chỉ giáo viên"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.impactBand)}`}
                          >
                            {compactStatus(row.impactBand)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.dailyPlanTitle ?? "n/a"}
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.dailyPlanStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.supportRecommendationId ?? "n/a"}
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.supportStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {compactStatus(row.teacherReviewStatus)}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.parentSummaryReady
                              ? "Bản tổng hợp cho phụ huynh đã sẵn sàng"
                              : "Không gửi bản tổng hợp cho phụ huynh"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-600">
                          <p>{row.evidenceSummary}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.outcomeSummary}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng kết quả thao tác theo dõi sẽ xuất hiện sau khi báo cáo mô
            phỏng tải xong.
          </div>
        )}
      </section>

      <section
        id="subscription-entitlement-daily-plan-access"
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={18} />
              Quyền lợi thuê bao và truy cập kế hoạch hằng ngày
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Cổng truy cập dữ liệu mô phỏng chỉ đọc, liên kết minh chứng ghi
              danh, thuê bao, thanh toán, hoàn tiền, lộ trình học và kế hoạch
              hằng ngày.
            </p>
          </div>
          {subscriptionEntitlementDailyPlanAccessReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                subscriptionEntitlementDailyPlanAccessReport.totals
                  .dailyPlanAccessCaseCount,
              )}{" "}
              trường hợp truy cập /{" "}
              {formatInteger(
                subscriptionEntitlementDailyPlanAccessReport.totals
                  .openSafetyGateCount,
              )}{" "}
              cổng đang mở
            </span>
          )}
        </div>

        {subscriptionEntitlementDailyPlanAccessReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Quyền lợi
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    subscriptionEntitlementDailyPlanAccessReport.totals
                      .entitlementCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    subscriptionEntitlementDailyPlanAccessReport.totals
                      .relationshipTraceCount,
                  )}{" "}
                  dấu vết ổn định
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Đã mở khóa
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    subscriptionEntitlementDailyPlanAccessReport.totals
                      .unlockedAccessCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Thuê bao mô phỏng đã thanh toán và đang hoạt động
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bị chặn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    subscriptionEntitlementDailyPlanAccessReport.totals
                      .blockedAccessCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    subscriptionEntitlementDailyPlanAccessReport.totals
                      .blockedAccessWithReasonCount,
                  )}{" "}
                  có lý do rõ ràng
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    subscriptionEntitlementDailyPlanAccessReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    subscriptionEntitlementDailyPlanAccessReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Chưa sẵn sàng cho môi trường thật
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>{subscriptionEntitlementDailyPlanAccessReport.endpointPath}</p>
              <p className="mt-1">
                {subscriptionEntitlementDailyPlanAccessReport.jsonExportPath}
              </p>
              <p className="mt-1">
                {
                  subscriptionEntitlementDailyPlanAccessReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Khóa học</th>
                      <th className="px-5 py-3">Gói học</th>
                      <th className="px-5 py-3">Quyền lợi</th>
                      <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Truy cập</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {subscriptionEntitlementDailyPlanAccessReport.accessRows.map(
                      (row) => (
                        <tr key={row.relationshipKey}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.courseCode}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.courseTitle}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.subscriptionStatus)}`}
                            >
                              {compactStatus(row.subscriptionStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.subscriptionId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.paymentId} /{" "}
                              {compactStatus(row.paymentStatus)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.entitlementStatus)}`}
                            >
                              {compactStatus(row.entitlementStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.entitlementId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.dailyPlanId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.learningPathId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.planDate} /{" "}
                              {compactStatus(row.dailyPlanStatus)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.accessStatus)}`}
                            >
                              {compactStatus(row.accessStatus)}
                            </span>
                            {row.blockedReason && (
                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                {row.blockedReason}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.nextSafeActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng truy cập quyền lợi thuê bao sẽ xuất hiện sau khi báo cáo
            mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="parent-teacher-progress-access-summary"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users size={18} />
              Tổng hợp quyền xem tiến độ của phụ huynh và giáo viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Góc nhìn chỉ đọc dành cho người giám hộ và giáo viên/quản trị viên
              về quyền truy cập, lý do bị chặn, tiến độ, video và minh chứng
              luyện tập mô phỏng.
            </p>
          </div>
          {parentTeacherProgressAccessSummaryReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                parentTeacherProgressAccessSummaryReport.totals
                  .parentSummaryCount,
              )}{" "}
              dòng phụ huynh /{" "}
              {formatInteger(
                parentTeacherProgressAccessSummaryReport.totals
                  .teacherSummaryCount,
              )}{" "}
              dòng dữ liệu giáo viên
            </span>
          )}
        </div>

        {parentTeacherProgressAccessSummaryReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Người giám hộ
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .parentGuardianCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .parentSummaryWithTraceCount,
                  )}{" "}
                  bản tổng hợp có truy vết
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Giáo viên/quản trị viên
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .teacherCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .teacherSummaryWithTraceCount,
                  )}{" "}
                  bản tổng hợp có truy vết
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Quyền xem tiến độ
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .progressSummaryCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .unlockedAccessCount,
                  )}{" "}
                  đã mở khóa /{" "}
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .blockedAccessCount,
                  )}{" "}
                  bị chặn
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherProgressAccessSummaryReport.totals
                      .blockedAccessInSummariesWithReasonCount,
                  )}{" "}
                  dòng bị chặn có giải thích
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>{parentTeacherProgressAccessSummaryReport.endpointPath}</p>
              <p className="mt-1">
                {parentTeacherProgressAccessSummaryReport.jsonExportPath}
              </p>
              <p className="mt-1">
                {parentTeacherProgressAccessSummaryReport.markdownExportPath}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Phụ huynh</th>
                      <th className="px-5 py-3">Trẻ</th>
                      <th className="px-5 py-3">Khóa học</th>
                      <th className="px-5 py-3">Truy cập</th>
                      <th className="px-5 py-3">Tiến độ</th>
                      <th className="px-5 py-3">Lý do bị chặn</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherProgressAccessSummaryReport.parentSummaryRows.map(
                      (row) => (
                        <tr key={row.parentSummaryId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.parentGuardianName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.relationship)} /{" "}
                              {row.parentGuardianEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.courseCode}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.accessStatus)}`}
                            >
                              {compactStatus(row.accessStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {compactStatus(row.entitlementStatus)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {compactStatus(row.progressStatus)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatPercent(row.completionPercent)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.blockedReason ?? row.nextSafeActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Giáo viên/quản trị viên</th>
                      <th className="px-5 py-3">Lớp</th>
                      <th className="px-5 py-3 text-right">Học viên</th>
                      <th className="px-5 py-3 text-right">Truy cập</th>
                      <th className="px-5 py-3 text-right">Tiến độ</th>
                      <th className="px-5 py-3 text-right">Phạm vi</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherProgressAccessSummaryReport.teacherSummaryRows.map(
                      (row) => (
                        <tr key={row.teacherSummaryId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.teacherName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.teacherRole)} /{" "}
                              {row.teacherEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.classCode}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.studentCount)}
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.unlockedAccessCount)} đã mở khóa
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.blockedAccessCount)} bị chặn /{" "}
                              {formatInteger(row.blockedReasonCount)} lý do
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatPercent(row.averageCompletionPercent)}
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.evidenceCoverageCount)}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng tổng hợp quyền xem tiến độ của phụ huynh và giáo viên sẽ
            xuất hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="parent-teacher-report-permission-privacy-redaction"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={18} />
              Phân quyền và ẩn dữ liệu riêng tư trong báo cáo phụ huynh - giáo
              viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dữ liệu mô phỏng về phạm vi chủ thể, trường hiển thị, trường được
              ẩn, trường hợp bị từ chối, lý do và dấu vết quan hệ ổn định cho
              báo cáo phụ huynh và giáo viên/quản trị viên.
            </p>
          </div>
          {parentTeacherReportPermissionPrivacyRedactionReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                parentTeacherReportPermissionPrivacyRedactionReport.totals
                  .reportPermissionCaseCount,
              )}{" "}
              trường hợp phân quyền
            </span>
          )}
        </div>

        {parentTeacherReportPermissionPrivacyRedactionReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Được phép
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .allowedReportCaseCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .deniedReportCaseCount,
                  )}{" "}
                  bị từ chối
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Trường hiển thị
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .visibleFieldCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .parentVisibleFieldCount,
                  )}{" "}
                  phụ huynh /{" "}
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .teacherVisibleFieldCount,
                  )}{" "}
                  giáo viên/quản trị viên
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Trường bị ẩn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .redactedFieldCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .deniedFieldCount,
                  )}{" "}
                  trường bị từ chối
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportPermissionPrivacyRedactionReport.totals
                      .permissionTraceCount,
                  )}{" "}
                  trường hợp có truy vết
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                {
                  parentTeacherReportPermissionPrivacyRedactionReport.endpointPath
                }
              </p>
              <p className="mt-1">
                {
                  parentTeacherReportPermissionPrivacyRedactionReport.jsonExportPath
                }
              </p>
              <p className="mt-1">
                {
                  parentTeacherReportPermissionPrivacyRedactionReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Người thực hiện</th>
                      <th className="px-5 py-3">Phạm vi</th>
                      <th className="px-5 py-3">Quyết định</th>
                      <th className="px-5 py-3">Đối tượng</th>
                      <th className="px-5 py-3 text-right">Các trường</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherReportPermissionPrivacyRedactionReport.permissionCaseRows.map(
                      (row) => (
                        <tr key={row.permissionCaseId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.actorName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.actorRole)} / {row.actorEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {compactStatus(row.reportScope)}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.sourceAccessStatus)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.permissionDecision)}`}
                            >
                              {compactStatus(row.permissionDecision)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.targetStudentName ??
                              row.targetClassCode ??
                              row.targetCourseCode ??
                              "Phạm vi dữ liệu mô phỏng"}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.targetChildProfileId ??
                                row.targetCourseCode ??
                                row.targetClassCode ??
                                "chỉ đọc"}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.visibleFieldCount)} hiển thị
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.redactedFieldCount)} đã ẩn /{" "}
                              {formatInteger(row.deniedFieldCount)} bị từ chối
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.decisionReason}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Người thực hiện</th>
                      <th className="px-5 py-3">Trường</th>
                      <th className="px-5 py-3">Phạm vi</th>
                      <th className="px-5 py-3">Khả năng hiển thị</th>
                      <th className="px-5 py-3">Giá trị</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherReportPermissionPrivacyRedactionReport.fieldVisibilityRows.map(
                      (row) => (
                        <tr key={row.fieldVisibilityId}>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.actorId}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.actorRole)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.fieldLabel}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.fieldKey}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {compactStatus(row.fieldScope)}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.visibility)}`}
                            >
                              {compactStatus(row.visibility)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.visibleValue ??
                              row.redactedValue ??
                              "Không có"}
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.reason ?? "Không có"}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng về phân quyền và ẩn dữ liệu riêng tư sẽ xuất hiện sau khi
            báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="parent-teacher-report-review-queue-message-preview"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquare size={18} />
              Xem trước tin nhắn trong hàng đợi duyệt báo cáo phụ huynh - giáo
              viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Các mục xét duyệt mô phỏng của giáo viên/quản trị viên, liên kết
              với bản xem trước cho phụ huynh, tham chiếu phân quyền/ẩn dữ liệu,
              quyết định phê duyệt, lý do tạm giữ và mã truy vết ổn định.
            </p>
          </div>
          {parentTeacherReportReviewQueueMessagePreviewReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                parentTeacherReportReviewQueueMessagePreviewReport.totals
                  .reviewQueueItemCount,
              )}{" "}
              mục cần xét duyệt
            </span>
          )}
        </div>

        {parentTeacherReportReviewQueueMessagePreviewReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Hàng đợi
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .reviewQueueItemCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .reviewDecisionTraceCount,
                  )}{" "}
                  quyết định có truy vết
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bản xem trước
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .messagePreviewCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .redactionAwarePreviewCount,
                  )}{" "}
                  có xét dữ liệu ẩn
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Quyết định
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .approvedPreviewCount,
                  )}{" "}
                  Đã duyệt
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .heldPreviewCount,
                  )}{" "}
                  tạm giữ
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherReportReviewQueueMessagePreviewReport.totals
                      .productionReadyClaimCount,
                  )}{" "}
                  tuyên bố môi trường thật
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                {
                  parentTeacherReportReviewQueueMessagePreviewReport.endpointPath
                }
              </p>
              <p className="mt-1">
                {
                  parentTeacherReportReviewQueueMessagePreviewReport.jsonExportPath
                }
              </p>
              <p className="mt-1">
                {
                  parentTeacherReportReviewQueueMessagePreviewReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Tham chiếu phân quyền</th>
                      <th className="px-5 py-3">Quyết định</th>
                      <th className="px-5 py-3 text-right">Các trường</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherReportReviewQueueMessagePreviewReport.permissionRedactionReferenceRows.map(
                      (row) => (
                        <tr key={row.permissionRedactionReferenceId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.permissionCaseId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.actorRole)} /{" "}
                              {compactStatus(row.reportScope)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.permissionDecision)}`}
                            >
                              {compactStatus(row.permissionDecision)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.visibleFieldCount)} hiển thị
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.redactedFieldCount)} đã ẩn /{" "}
                              {formatInteger(row.deniedFieldCount)} bị từ chối
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.permissionReason}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Mục hàng đợi</th>
                      <th className="px-5 py-3">Phụ huynh</th>
                      <th className="px-5 py-3">Người xét duyệt</th>
                      <th className="px-5 py-3">Quyết định</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherReportReviewQueueMessagePreviewReport.reviewQueueRows.map(
                      (row) => (
                        <tr key={row.reviewQueueItemId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode} /{" "}
                              {row.classCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.parentGuardianName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.permissionCaseId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.reviewerName}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.reviewerRole)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.reviewStatus)}`}
                            >
                              {compactStatus(row.reviewStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatDateTime(row.reviewedAt)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.reviewReason}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1360px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Xem trước</th>
                      <th className="px-5 py-3">Quyết định</th>
                      <th className="px-5 py-3">Minh chứng</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Xem trước tin nhắn</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherReportReviewQueueMessagePreviewReport.messagePreviewRows.map(
                      (row) => (
                        <tr key={row.messagePreviewId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.parentGuardianName} / {row.courseCode} /{" "}
                              {row.classCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.previewDecision)}`}
                            >
                              {compactStatus(row.previewDecision)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {compactStatus(row.permissionDecision)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.permissionEvidenceReferenced
                              ? "Đã tham chiếu quyền"
                              : "Thiếu quyền"}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.redactionEvidenceReferenced
                                ? "Có tham chiếu minh chứng ẩn dữ liệu"
                                : "Không có minh chứng ẩn dữ liệu"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(
                                row.redactedFieldVisibilityIds.length +
                                  row.deniedFieldVisibilityIds.length,
                              )}{" "}
                              trường bị ẩn
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.approvalReason ?? row.heldReason ?? "Không có"}
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.messagePreview}
                            <p className="mt-2 text-xs text-slate-500">
                              notificationDeliveryUsed=
                              {String(row.notificationDeliveryUsed)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng xem trước tin nhắn trong hàng đợi duyệt báo cáo sẽ xuất
            hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="parent-portal-approved-report-inbox-read-receipt"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquare size={18} />
              Biên nhận đã đọc trong hộp thư báo cáo được duyệt của cổng phụ
              huynh
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Các dòng hộp thư phụ huynh mô phỏng chứng minh bản xem trước đã
              duyệt được hiển thị, bản tạm giữ vẫn ẩn và minh chứng đã đọc/xác
              nhận chỉ tồn tại trong bản demo cục bộ.
            </p>
          </div>
          {parentPortalApprovedReportInboxReadReceiptReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                parentPortalApprovedReportInboxReadReceiptReport.totals
                  .parentInboxItemCount,
              )}{" "}
              dòng minh chứng hộp thư
            </span>
          )}
        </div>

        {parentPortalApprovedReportInboxReadReceiptReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Hiển thị
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .visibleParentInboxItemCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .visibleInboxItemsWithStableRelationshipTraceCount,
                  )}{" "}
                  có truy vết
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bị ẩn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .hiddenHeldPreviewCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .hiddenHeldPreviewsWithReasonCount,
                  )}{" "}
                  kèm lý do
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Đã đọc/Xác nhận
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .readAckEvidenceCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .alignedParentReadReceiptCount,
                  )}{" "}
                  khớp với Minh/khóa A1
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentPortalApprovedReportInboxReadReceiptReport.totals
                      .productionReadyClaimCount,
                  )}{" "}
                  tuyên bố môi trường thật
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                {parentPortalApprovedReportInboxReadReceiptReport.endpointPath}
              </p>
              <p className="mt-1">
                {
                  parentPortalApprovedReportInboxReadReceiptReport.jsonExportPath
                }
              </p>
              <p className="mt-1">
                {
                  parentPortalApprovedReportInboxReadReceiptReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Mục hộp thư</th>
                      <th className="px-5 py-3">Phụ huynh</th>
                      <th className="px-5 py-3">Khả năng hiển thị</th>
                      <th className="px-5 py-3">Trường hiển thị</th>
                      <th className="px-5 py-3">Minh chứng phân quyền</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentPortalApprovedReportInboxReadReceiptReport.parentInboxRows.map(
                      (row) => (
                        <tr key={row.parentInboxItemId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode} /{" "}
                              {row.classCode}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.messagePreviewId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.parentGuardianName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.permissionCaseId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.inboxVisibility)}`}
                            >
                              {compactStatus(row.inboxVisibility)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              parentVisible={String(row.parentVisible)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.visibleSubject ?? "HIDDEN_LOCAL_DEMO"}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.visibleBody ??
                                row.hiddenReason ??
                                "Không có"}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.permissionEvidenceReferenced
                              ? "Đã tham chiếu quyền"
                              : "Thiếu quyền"}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.redactionEvidenceReferenced
                                ? "Có tham chiếu minh chứng ẩn dữ liệu"
                                : "Không có minh chứng ẩn dữ liệu"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(
                                row.redactedFieldVisibilityIds.length +
                                  row.deniedFieldVisibilityIds.length,
                              )}{" "}
                              trường bị ẩn
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Đã đọc/Xác nhận</th>
                      <th className="px-5 py-3">Phụ huynh</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Thời gian</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentPortalApprovedReportInboxReadReceiptReport.readAckRows.map(
                      (row) => (
                        <tr key={row.readAckEvidenceId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.readAckEvidenceId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.parentInboxItemId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.parentGuardianName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.readAckStatus)}`}
                            >
                              {compactStatus(row.readAckStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {formatDateTime(row.readAt)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(row.acknowledgedAt)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.acknowledgementLabel}
                            <p className="mt-1 text-xs text-slate-500">
                              notificationDeliveryUsed=
                              {String(row.notificationDeliveryUsed)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.relationshipTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng biên nhận đã đọc trong hộp thư báo cáo được duyệt sẽ xuất
            hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="teacher-escalation-followup-resolution"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 size={18} />
              Kết quả theo dõi xử lý leo thang của giáo viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Minh chứng leo thang đã được giáo viên duyệt, truy vết tới lần thử
              lại đã điều chỉnh, kết quả đã giải quyết và các dòng xác nhận đóng
              của phụ huynh, giáo viên.
            </p>
          </div>
          {teacherEscalationFollowupResolutionReport && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              GET {teacherEscalationFollowupResolutionReportPath}
            </span>
          )}
        </div>

        {teacherEscalationFollowupResolutionReport ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Đánh giá của giáo viên
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .teacherReviewedEscalationCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .unresolvedEscalationReferenceCount,
                  )}{" "}
                  tham chiếu chưa giải quyết
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Kết quả đã giải quyết
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .resolvedSupportOutcomeCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .outcomesWithDeterministicStatusReasonActionCount,
                  )}{" "}
                  trạng thái/lý do/thao tác
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Dòng xác nhận đóng
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .parentVisibleClosureSummaryCount,
                  )}
                  /
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .teacherVisibleClosureNoteCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  xác nhận đóng của phụ huynh/giáo viên
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherEscalationFollowupResolutionReport.totals
                      .openSafetyGateCount,
                  )}{" "}
                  cổng đang mở
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>{teacherEscalationFollowupResolutionReport.endpointPath}</p>
              <p className="mt-1">
                {teacherEscalationFollowupResolutionReport.jsonExportPath}
              </p>
              <p className="mt-1">
                {teacherEscalationFollowupResolutionReport.markdownExportPath}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1440px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Kết quả xử lý</th>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Giáo viên</th>
                      <th className="px-5 py-3">Liên kết chưa giải quyết</th>
                      <th className="px-5 py-3">Lần thử lại đã điều chỉnh</th>
                      <th className="px-5 py-3">Kết quả đã giải quyết</th>
                      <th className="px-5 py-3">Xác nhận đóng</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {teacherEscalationFollowupResolutionReport.resolutionRows.map(
                      (row) => (
                        <tr key={row.resolutionId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.resolutionId}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.teacherReviewedEscalationStatus)}`}
                            >
                              {compactStatus(
                                row.teacherReviewedEscalationStatus,
                              )}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatDateTime(row.teacherReviewedAt)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.teacherName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.teacherEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.unresolvedRetryAttemptId}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.unresolvedOutcomeId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.teacherEscalationId} /{" "}
                              {row.supportAdjustmentId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.adjustedSupportRetryCompletionId}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatPercent(row.scorePercent)} /{" "}
                              {formatPercent(row.completionPercent)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.remedialDailyPlanTitle} /{" "}
                              {row.remedialPracticeAttemptId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.resolvedSupportOutcomeStatus)}`}
                            >
                              {compactStatus(row.resolvedSupportOutcomeStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.resolvedSupportOutcomeId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.resolvedOutcomeReasonCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.parentClosureSummaryId}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.teacherClosureNoteId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.safeNextActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.stableTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Lần thử lại đã điều chỉnh</th>
                        <th className="px-5 py-3">Điểm</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {teacherEscalationFollowupResolutionReport.adjustedSupportRetryCompletionRows.map(
                        (row) => (
                          <tr key={row.adjustedSupportRetryCompletionId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.adjustedSupportRetryCompletionId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {formatPercent(row.scorePercent)}
                              <p className="mt-1 text-xs text-slate-500">
                                {formatPercent(row.completionPercent)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.summary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">
                          Xác nhận đóng của phụ huynh
                        </th>
                        <th className="px-5 py-3">Phụ huynh</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {teacherEscalationFollowupResolutionReport.parentClosureSummaryRows.map(
                        (row) => (
                          <tr key={row.parentClosureSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.parentClosureSummaryId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.resolvedOutcomeStatus}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.parentGuardianName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.parentGuardianEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.summary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">
                          Xác nhận đóng của giáo viên
                        </th>
                        <th className="px-5 py-3">Giáo viên</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {teacherEscalationFollowupResolutionReport.teacherClosureNoteRows.map(
                        (row) => (
                          <tr key={row.teacherClosureNoteId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.teacherClosureNoteId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.classCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.teacherName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.teacherEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.summary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng kết quả theo dõi xử lý leo thang của giáo viên sẽ xuất
            hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="mvp-end-to-end-readiness-trace"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList size={18} />
              Dấu vết mức độ sẵn sàng đầu-cuối của MVP
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dấu vết mô phỏng liên kết minh chứng ghi danh, thuê bao, quyền
              lợi, tiến độ luyện tập, riêng tư báo cáo, biên nhận đã đọc, thời
              gian màn hình, can thiệp của giáo viên, leo thang khắc phục và kết
              quả xử lý.
            </p>
          </div>
          {mvpEndToEndReadinessTraceReport && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              GET {mvpEndToEndReadinessTraceReportPath}
            </span>
          )}
        </div>

        {mvpEndToEndReadinessTraceReport ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Dấu vết ổn định
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .stableEndToEndTraceCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .sameStudentCoursePathCount,
                  )}{" "}
                  cùng lộ trình /{" "}
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .alignedApprovedDeliveryStudentCoursePathCount,
                  )}{" "}
                  biên nhận đã đọc khớp
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Dòng minh chứng
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals.evidenceRowCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .deterministicStatusReasonActionOwnerCount,
                  )}{" "}
                  trạng thái/lý do/thao tác/người phụ trách
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Phạm vi hạng mục
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .escalationResolutionEvidenceCount,
                  )}{" "}
                  đã giải quyết
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .teacherInterventionEvidenceCount,
                  )}{" "}
                  can thiệp /{" "}
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .remedialRetryOrEscalationEvidenceCount,
                  )}{" "}
                  leo thang
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals.safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    mvpEndToEndReadinessTraceReport.totals.openSafetyGateCount,
                  )}{" "}
                  cổng đang mở, chưa sẵn sàng cho môi trường thật
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>{mvpEndToEndReadinessTraceReport.endpointPath}</p>
              <p className="mt-1">
                {mvpEndToEndReadinessTraceReport.dashboardEvidencePath}
              </p>
              <p className="mt-1">
                {mvpEndToEndReadinessTraceReport.jsonExportPath}
              </p>
              <p className="mt-1">
                {mvpEndToEndReadinessTraceReport.markdownExportPath}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1520px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Truy vết</th>
                      <th className="px-5 py-3">Lộ trình học viên</th>
                      <th className="px-5 py-3">Truy cập</th>
                      <th className="px-5 py-3">Báo cáo</th>
                      <th className="px-5 py-3">Bộ kiểm soát an toàn</th>
                      <th className="px-5 py-3">Hỗ trợ</th>
                      <th className="px-5 py-3">Kết quả xử lý</th>
                      <th className="px-5 py-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {mvpEndToEndReadinessTraceReport.traceRows.map((row) => (
                      <tr key={row.traceId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.traceId}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.traceStatus)}`}
                          >
                            {compactStatus(row.traceStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatInteger(row.stableEndToEndTraceIds.length)}{" "}
                            mã ổn định
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.studentName} / {row.courseCode}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.enrollmentId} / {row.subscriptionId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.paymentId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.entitlementId}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.dailyPlanId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.entitlementAccessStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.parentTeacherReportSummaryId}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.parentTeacherPermissionCaseId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.approvedDeliveryOrReadReceiptId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.screenTimeGuardEvidenceId}
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.screenTimeAccessResult)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.teacherInterventionReviewId}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.supportPlanId} / {row.remedialAssignmentId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.remedialRetryOrEscalationId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.escalationResolutionId}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.resolvedSupportOutcomeId}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.resolutionStatus)}`}
                          >
                            {compactStatus(row.resolutionStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.actionLabel}
                          <p className="mt-2 text-xs text-slate-500">
                            {row.reasonLabel}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Chủ tài khoản: {row.ownerLabel}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Loại minh chứng</th>
                      <th className="px-5 py-3 text-right">Số lượng</th>
                      <th className="px-5 py-3">Mã dữ liệu mô phỏng</th>
                      <th className="px-5 py-3">Tổng hợp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {mvpEndToEndReadinessTraceReport.evidenceRows.map((row) => (
                      <tr key={row.evidenceKind}>
                        <td className="px-5 py-4 align-top font-medium text-slate-950">
                          {compactStatus(row.evidenceKind)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.evidenceCount)}
                        </td>
                        <td className="px-5 py-4 align-top text-xs text-slate-500">
                          {row.stableFixtureIds.slice(0, 3).join(", ")}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.evidenceSummary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Dấu vết mức độ sẵn sàng đầu-cuối của MVP sẽ xuất hiện sau khi báo
            cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquare size={18} />
              Bản tin tuần dành cho phụ huynh và giáo viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Các dòng bản tin tuần mô phỏng dành cho phụ huynh và giáo viên,
              kèm minh chứng tổng hợp về tiến độ, cảnh báo, thành tích, ghi nhận
              và thao tác.
            </p>
          </div>
          {parentTeacherWeeklyDigestReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                parentTeacherWeeklyDigestReport.totals.digestCount,
              )}{" "}
              bản tin tuần
            </span>
          )}
        </div>

        {parentTeacherWeeklyDigestReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Sẵn sàng
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals
                      .readyToSendDigestCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals
                      .studentsReadyForParentSend,
                  )}{" "}
                  học viên đã sẵn sàng
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Đánh giá của giáo viên
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals
                      .teacherReviewDigestCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals
                      .studentsNeedingTeacherReview,
                  )}{" "}
                  học viên cần xem xét
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Thao tác
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals.actionCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals
                      .highPriorityActionCount,
                  )}{" "}
                  ưu tiên cao
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tạm giữ
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals
                      .heldWithdrawnDigestCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherWeeklyDigestReport.totals
                      .teacherOnlyDigestCount,
                  )}{" "}
                  bản tin chỉ dành cho giáo viên
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Học sinh</th>
                      <th className="px-5 py-3 text-right">Bản tin</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Thao tác</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Tổng hợp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherWeeklyDigestReport.studentRows.map((row) => (
                      <tr key={row.studentId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.parentGuardianName}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.parentDigestCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.teacherDigestCount)} giáo viên
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              row.heldWithdrawnDigestCount > 0
                                ? statusBadgeClass("HELD_WITHDRAWN")
                                : row.teacherReviewDigestCount > 0
                                  ? statusBadgeClass("TEACHER_REVIEW")
                                  : statusBadgeClass("READY_TO_SEND")
                            }`}
                          >
                            {row.heldWithdrawnDigestCount > 0
                              ? "Tạm giữ"
                              : row.teacherReviewDigestCount > 0
                                ? "Đánh giá của giáo viên"
                                : "Sẵn sàng"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.actionCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.highPriorityActionCount)} cao
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.nextActionDueAt
                            ? formatDateTime(row.nextActionDueAt)
                            : "n/a"}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-600">
                          {row.weeklySummary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Bản tin</th>
                        <th className="px-5 py-3">Đối tượng nhận</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3 text-right">Minh chứng</th>
                        <th className="px-5 py-3">Điểm nổi bật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parentTeacherWeeklyDigestReport.digestRows.map((row) => (
                        <tr key={row.digestId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.weekStart} đến {row.weekEnd}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {compactStatus(row.audience)}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.parentVisible
                                ? "Hiển thị cho phụ huynh"
                                : "Chỉ giáo viên"}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.deliveryStatus)}`}
                            >
                              {compactStatus(row.deliveryStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.alertCount)} cảnh báo
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.actionCount)} thao tác
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-600">
                            <p>{row.highlight}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.riskSummary}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Hành động</th>
                        <th className="px-5 py-3">Người phụ trách</th>
                        <th className="px-5 py-3">Mức ưu tiên</th>
                        <th className="px-5 py-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parentTeacherWeeklyDigestReport.actionRows.map((row) => (
                        <tr key={row.actionId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.actionSummary}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {compactStatus(row.owner)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(row.dueAt)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.priority)}`}
                            >
                              {compactStatus(row.priority)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                            >
                              {compactStatus(row.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng bản tin tuần dành cho phụ huynh và giáo viên sẽ xuất hiện
            sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Award size={18} />
              Huy hiệu và chứng nhận thành tích học viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dữ liệu mô phỏng về thành tích, huy hiệu, bản xem trước chứng
              nhận, trạng thái cột mốc và tổng hợp ghi nhận.
            </p>
          </div>
          {studentAchievementBadgeCertificateReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                studentAchievementBadgeCertificateReport.totals.badgeAwards,
              )}{" "}
              huy hiệu đã trao
            </span>
          )}
        </div>

        {studentAchievementBadgeCertificateReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Thành tích
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals
                      .achievementRecords,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals
                      .milestonesCompleted,
                  )}{" "}
                  cột mốc đã hoàn thành
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Huy hiệu
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals.badgeAwards,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals
                      .studentsWithBadges,
                  )}{" "}
                  học viên có huy hiệu
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Chứng nhận
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals
                      .certificateFixtures,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals
                      .studentsNearCertificate,
                  )}{" "}
                  sắp nhận chứng nhận
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Ghi nhận
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals
                      .recognitionSummaries,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    studentAchievementBadgeCertificateReport.totals
                      .studentsNeedingEncouragement,
                  )}{" "}
                  cần động viên
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Học sinh</th>
                      <th className="px-5 py-3">Tiến độ</th>
                      <th className="px-5 py-3 text-right">Thành tích</th>
                      <th className="px-5 py-3 text-right">Huy hiệu</th>
                      <th className="px-5 py-3 text-right">Cột mốc</th>
                      <th className="px-5 py-3">Chứng nhận</th>
                      <th className="px-5 py-3 text-right">Duyệt</th>
                      <th className="px-5 py-3">Ghi nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {studentAchievementBadgeCertificateReport.studentRows.map(
                      (row) => (
                        <tr key={row.studentId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.parentGuardianName}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.progressStatus)}`}
                            >
                              {compactStatus(row.progressStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatPercent(row.completionPercent)} /{" "}
                              {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.achievementRecordCount)}
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.badgeAwardCount)}
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.completedMilestoneCount)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.pendingMilestoneCount)} Đang
                              chờ
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.certificateStatus)}`}
                            >
                              {compactStatus(row.certificateStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.nearCertificate
                                ? "Sắp nhận chứng nhận"
                                : row.teacherName}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.teacherReviewItemCount)}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                                row.needsEncouragement
                                  ? "bg-amber-50 text-amber-800 ring-amber-100"
                                  : "bg-teal-50 text-teal-700 ring-teal-100"
                              }`}
                            >
                              {row.needsEncouragement
                                ? "Cần khích lệ"
                                : "Sẵn sàng"}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Chứng nhận</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3 text-right">Huy hiệu</th>
                        <th className="px-5 py-3 text-right">Đang chờ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {studentAchievementBadgeCertificateReport.certificateRows.map(
                        (row) => (
                          <tr key={row.certificateFixtureId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.studentName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.certificatePreviewRef}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                              >
                                {compactStatus(row.status)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right align-top text-slate-700">
                              {formatInteger(row.completedBadgeAwardCount)}
                            </td>
                            <td className="px-5 py-4 text-right align-top text-slate-700">
                              {formatInteger(row.pendingMilestoneCount)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Ghi nhận</th>
                        <th className="px-5 py-3">Đối tượng nhận</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Hỗ trợ AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {studentAchievementBadgeCertificateReport.recognitionRows.map(
                        (row) => (
                          <tr key={row.recognitionSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.studentName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.parentGuardianName} / {row.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {compactStatus(row.audience)}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.parentVisible
                                  ? "Hiển thị cho phụ huynh"
                                  : "Chỉ giáo viên"}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                              >
                                {compactStatus(row.status)}
                              </span>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.sourceAiTutorSupportRecommendationId ??
                                "n/a"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng huy hiệu và chứng nhận thành tích học viên sẽ xuất hiện
            sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquare size={18} />
              Giáo viên duyệt an toàn trợ giảng AI
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dữ liệu mô phỏng về phiên trò chuyện với trợ giảng, bộ lọc chủ đề,
              hàng đợi giáo viên duyệt, tổng hợp cho phụ huynh và các dòng hỗ
              trợ học tập.
            </p>
          </div>
          {aiTutorChatSafetyTeacherReviewReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                aiTutorChatSafetyTeacherReviewReport.totals.blockedMessageCount,
              )}{" "}
              tin nhắn bị chặn
            </span>
          )}
        </div>

        {aiTutorChatSafetyTeacherReviewReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Phiên trò chuyện
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals
                      .chatSessionCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals.messageCount,
                  )}{" "}
                  tin nhắn mô phỏng
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Quyết định bộ lọc
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals
                      .allowedMessageCount,
                  )}{" "}
                  được phép
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals
                      .blockedMessageCount,
                  )}{" "}
                  bị chặn
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Hàng đợi xét duyệt
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals
                      .teacherReviewItemCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals
                      .reviewedTeacherReviewItemCount,
                  )}{" "}
                  đã duyệt hoặc giải quyết
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Hỗ trợ
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals
                      .studentsNeedingSupportCount,
                  )}{" "}
                  học viên
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    aiTutorChatSafetyTeacherReviewReport.totals
                      .supportRecommendationCount,
                  )}{" "}
                  đề xuất
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Phiên</th>
                      <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Tin nhắn</th>
                      <th className="px-5 py-3 text-right">Bị chặn</th>
                      <th className="px-5 py-3 text-right">Duyệt</th>
                      <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {aiTutorChatSafetyTeacherReviewReport.chatSessionRows.map(
                      (row) => (
                        <tr key={row.chatSessionId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.dailyPlanTitle}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.classCode} / {row.lessonCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.sessionStatus)}`}
                            >
                              {compactStatus(row.sessionStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.messageCount)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.allowedMessageCount)} được phép
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.blockedMessageCount)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.safetyFlagCount)} cờ cảnh báo
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.teacherReviewItemCount)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatInteger(row.supportRecommendationCount)} hỗ
                              trợ
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                                row.parentSummaryReady
                                  ? "bg-teal-50 text-teal-700 ring-teal-100"
                                  : "bg-amber-50 text-amber-800 ring-amber-100"
                              }`}
                            >
                              {row.parentSummaryReady ? "Sẵn sàng" : "Tạm giữ"}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Đánh giá của giáo viên</th>
                      <th className="px-5 py-3">Chủ đề</th>
                      <th className="px-5 py-3">Mức độ</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Giáo viên</th>
                      <th className="px-5 py-3 text-right">Hỗ trợ</th>
                      <th className="px-5 py-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {aiTutorChatSafetyTeacherReviewReport.teacherReviewRows.map(
                      (row) => (
                        <tr key={row.teacherReviewItemId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.classCode} /{" "}
                              {row.lessonCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.topicCategory)}`}
                            >
                              {compactStatus(row.topicCategory)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.severity)}`}
                            >
                              {compactStatus(row.severity)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.reviewStatus)}`}
                            >
                              {compactStatus(row.reviewStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.parentSummaryReady
                                ? "Bản tổng hợp cho phụ huynh đã sẵn sàng"
                                : "Tạm giữ để xét duyệt"}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.assignedTeacherName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.dailyPlanTitle}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.supportRecommendationCount)}
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.actionSummary}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Dòng hỗ trợ</th>
                      <th className="px-5 py-3">Mức ưu tiên</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Đề xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {aiTutorChatSafetyTeacherReviewReport.supportRecommendationRows.map(
                      (row) => (
                        <tr key={row.supportRecommendationId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode} /{" "}
                              {row.classCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.priority)}`}
                            >
                              {compactStatus(row.priority)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                            >
                              {compactStatus(row.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.recommendation}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng giáo viên duyệt an toàn trợ giảng AI sẽ xuất hiện sau khi
            báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen size={18} />
              Xuất bản thư viện nội dung giáo viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dữ liệu mô phỏng về tài nguyên nội dung của giáo viên/quản trị
              viên, giao bài theo lớp, hiển thị trên lộ trình học và các dòng
              tổng hợp cho phụ huynh.
            </p>
          </div>
          {teacherContentPublishReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(
                teacherContentPublishReport.totals.learningPathPublishCount,
              )}{" "}
              lượt xuất bản lộ trình học
            </span>
          )}
        </div>

        {teacherContentPublishReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Người phụ trách và mục nội dung
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherContentPublishReport.totals.teacherAdminCount,
                  )}{" "}
                  /{" "}
                  {formatInteger(
                    teacherContentPublishReport.totals.contentItemCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  giáo viên/quản trị viên và mục nội dung
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tài nguyên
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherContentPublishReport.totals.videoAssetCount,
                  )}{" "}
                  video /{" "}
                  {formatInteger(
                    teacherContentPublishReport.totals.practiceAssetCount,
                  )}{" "}
                  luyện tập
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherContentPublishReport.totals.lessonAssetCount,
                  )}{" "}
                  tài nguyên bài học
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Trạng thái xuất bản
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherContentPublishReport.totals.publishedContentCount,
                  )}{" "}
                  đã xuất bản
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherContentPublishReport.totals.draftContentCount,
                  )}{" "}
                  bản nháp,{" "}
                  {formatInteger(
                    teacherContentPublishReport.totals.archivedContentCount,
                  )}{" "}
                  đã lưu trữ
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Khả năng hiển thị
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherContentPublishReport.totals.studentVisibilityCount,
                  )}{" "}
                  học viên
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherContentPublishReport.totals
                      .parentVisibleSummaryCount,
                  )}{" "}
                  bản tổng hợp cho phụ huynh
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Nội dung</th>
                      <th className="px-5 py-3">Người phụ trách</th>
                      <th className="px-5 py-3">Khóa học / bài học</th>
                      <th className="px-5 py-3">Tài nguyên</th>
                      <th className="px-5 py-3">Xuất bản</th>
                      <th className="px-5 py-3 text-right">
                        Lượt xuất bản lộ trình
                      </th>
                      <th className="px-5 py-3 text-right">
                        Khả năng hiển thị
                      </th>
                      <th className="px-5 py-3">Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {teacherContentPublishReport.contentRows.map((row) => (
                      <tr key={row.contentItemId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.contentItemId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          <p>{row.ownerName}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.ownerRole)} / {row.ownerEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.courseCode}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.lessonCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.assetKind)}`}
                          >
                            {compactStatus(row.assetKind)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.publishStatus)}`}
                          >
                            {compactStatus(row.publishStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.learningPathPublishCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.studentVisibilityCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.parentVisibleSummaryCount)} phụ
                            huynh
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              row.needsTeacherReview
                                ? "bg-amber-50 text-amber-800 ring-amber-100"
                                : "bg-teal-50 text-teal-700 ring-teal-100"
                            }`}
                          >
                            {row.needsTeacherReview ? "Duyệt" : "Xóa bộ lọc"}
                          </span>
                          {row.blockedReason !== "NONE" && (
                            <p className="mt-2 text-xs text-slate-500">
                              {row.blockedReason}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Học sinh</th>
                      <th className="px-5 py-3">Nội dung</th>
                      <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Lớp</th>
                      <th className="px-5 py-3">Khả năng hiển thị</th>
                      <th className="px-5 py-3">Học viên / phụ huynh</th>
                      <th className="px-5 py-3">Lý do bị chặn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {teacherContentPublishReport.studentVisibilityRows.map(
                      (row) => (
                        <tr key={row.visibilityId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.parentGuardianName}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.contentTitle}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.assetKind)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.dailyPlanTitle}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.planDate} /{" "}
                              {compactStatus(row.dailyPlanStatus)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.classCode}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.courseCode} / {row.lessonCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.visibilityStatus)}`}
                            >
                              {compactStatus(row.visibilityStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentVisible
                              ? "Hiển thị cho học viên"
                              : "Bị ẩn"}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.parentVisible
                                ? "Hiển thị cho phụ huynh"
                                : "Ẩn với phụ huynh"}{" "}
                              /{" "}
                              {row.availableOnDailyPlan
                                ? "kế hoạch hằng ngày"
                                : "không khả dụng"}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.blockedReason}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                      <th className="px-5 py-3">Khóa học</th>
                      <th className="px-5 py-3 text-right">Hiển thị</th>
                      <th className="px-5 py-3 text-right">Bị chặn</th>
                      <th className="px-5 py-3 text-right">Duyệt</th>
                      <th className="px-5 py-3">Ngày tiếp theo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {teacherContentPublishReport.parentSummaryRows.map(
                      (row) => (
                        <tr
                          key={`${row.parentGuardianName}-${row.studentName}`}
                        >
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.parentGuardianName}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.summary}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.courseCodes.join(", ")}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.classCodes.join(", ")}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.parentVisibleItemCount)}
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.blockedItemCount)}
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.itemsNeedingTeacherReviewCount)}
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.nextAvailableDailyPlanDate ?? "-"}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng xuất bản nội dung giáo viên sẽ xuất hiện sau khi báo cáo
            mô phỏng tải xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <WalletCards size={18} />
              Ghi danh, thuê bao, thanh toán, hoàn tiền, hoa hồng
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Luồng tiền học viên mô phỏng được liên kết với tiến độ lớp theo mã
              ghi danh.
            </p>
          </div>
          {enrollmentReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(enrollmentReport.totals.subscriptionCount)} thuê
              bao / {formatInteger(enrollmentReport.totals.paymentCount)} thanh
              toán / {formatInteger(enrollmentReport.totals.refundCount)} hoàn
              tiền
            </span>
          )}
        </div>

        {studentCourseFlowReport ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Minh chứng luồng
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatInteger(
                      studentCourseFlowReport.totals.relationshipTraceCount,
                    )}{" "}
                    dấu vết
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(studentCourseFlowReport.currentStatus.status)}`}
                >
                  {compactStatus(studentCourseFlowReport.currentStatus.status)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {studentCourseFlowReport.currentStatus.summary}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Thanh toán
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatInteger(
                      studentCourseFlowReport.totals
                        .fixturePaymentEvidenceCount,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Hoàn tiền
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatInteger(
                      studentCourseFlowReport.totals.refundEvidenceCount,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Hoa hồng
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatInteger(
                      studentCourseFlowReport.totals.commissionEvidenceCount,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    An toàn
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatInteger(
                      studentCourseFlowReport.totals.closedSafetyGateCount,
                    )}
                    /
                    {formatInteger(
                      studentCourseFlowReport.totals.safetyGateCount,
                    )}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                {studentCourseFlowReport.endpointPath}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {studentCourseFlowReport.jsonExportPath}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {studentCourseFlowReport.markdownExportPath}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Minh chứng</th>
                      <th className="px-5 py-3 text-right">Số lượng</th>
                      <th className="px-5 py-3">Mã dữ liệu mô phỏng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {studentCourseFlowReport.evidenceRows.map((row) => (
                      <tr key={row.evidenceKind}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {compactStatus(row.evidenceKind)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.evidenceSummary}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                          {formatInteger(row.evidenceCount)}
                        </td>
                        <td className="px-5 py-4 align-top text-xs text-slate-500">
                          {row.stableFixtureIds.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng luồng học viên - khóa học - ghi danh - thuê bao sẽ xuất
            hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Học viên</th>
                  <th className="px-5 py-3">Ghi danh</th>
                  <th className="px-5 py-3">Gói học</th>
                  <th className="px-5 py-3">Thanh toán</th>
                  <th className="px-5 py-3 text-right">Doanh thu thuần</th>
                  <th className="px-5 py-3 text-right">Hoa hồng</th>
                  <th className="px-5 py-3">Tiến độ</th>
                  <th className="px-5 py-3 text-right">Điểm danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {enrollmentReport?.rows.map((row) => {
                  const learner = learnerByEnrollmentId.get(row.enrollmentId);

                  return (
                    <tr key={row.enrollmentId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.childProfileId} / {row.courseCode}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {row.courseTitle}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.enrollmentStatus)}`}
                        >
                          {compactStatus(row.enrollmentStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.subscriptionStatus)}`}
                        >
                          {compactStatus(row.subscriptionStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.paymentStatus)}`}
                        >
                          {compactStatus(row.paymentStatus)}
                        </span>
                        {row.refundStatus !== "NONE" && (
                          <p className="mt-2 text-xs text-rose-700">
                            Hoàn tiền {compactStatus(row.refundStatus)}
                          </p>
                        )}
                        {row.pendingPaymentCents > 0 && (
                          <p className="mt-2 text-xs text-sky-700">
                            Đang chờ{" "}
                            {formatMoney(row.pendingPaymentCents, "VND")}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                        {formatMoney(row.netRevenueCents, "VND")}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatMoney(totalCommission(row), "VND")}
                      </td>
                      <td className="px-5 py-4 align-top">
                        {learner ? (
                          <>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(learner.progressStatus)}`}
                            >
                              {compactStatus(learner.progressStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {learner.completedLessonCount}/
                              {learner.totalLessonCount} bài học /{" "}
                              {formatPercent(learner.completionPercent)}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Không có dòng tiến độ
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {learner ? (
                          <>
                            <p className="font-medium text-slate-950">
                              {formatPercent(learner.attendanceRatePercent)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              P{learner.presentAttendanceCount} / L
                              {learner.lateAttendanceCount} / A
                              {learner.absentAttendanceCount} / E
                              {learner.excusedAttendanceCount}
                            </p>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!enrollmentReport && (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-sm text-slate-500"
                      colSpan={8}
                    >
                      {isLoading
                        ? "Đang tải báo cáo giả lập..."
                        : "Chưa có báo cáo ghi danh."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList size={18} />
              Lớp, buổi học, điểm danh, tiến độ
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Bản tổng hợp nhóm từ dữ liệu mô phỏng lớp - buổi học - điểm danh -
              tiến độ.
            </p>
          </div>
          {progressReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(progressReport.totals.completedSessionCount)} đã
              hoàn thành /{" "}
              {formatInteger(progressReport.totals.scheduledSessionCount)} buổi
              đã lên lịch
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {progressReport?.classAggregates.map((row) => (
            <article
              className="rounded-2xl border border-slate-200 p-5"
              key={row.classCode}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {row.classTitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.classCode} / {row.courseCode} / {row.teacherName}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                >
                  {compactStatus(row.status)}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Học viên
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatInteger(row.studentCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Buổi học
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatInteger(row.completedSessionCount)}/
                    {formatInteger(row.sessionCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Điểm danh
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatPercent(row.attendanceRatePercent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Hoàn thành
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatPercent(row.averageLearnerCompletionPercent)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Có mặt {formatInteger(row.presentAttendanceCount)}, đi muộn{" "}
                {formatInteger(row.lateAttendanceCount)}, vắng{" "}
                {formatInteger(row.absentAttendanceCount)}, có phép{" "}
                {formatInteger(row.excusedAttendanceCount)}. Cần hỗ trợ{" "}
                {formatInteger(row.needsSupportCount)}.
              </p>
            </article>
          ))}
          {!progressReport && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              Bản tổng hợp lớp sẽ xuất hiện sau khi báo cáo mô phỏng tải xong.
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 size={18} />
              Tiến độ bài học, bài tập và đánh giá
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Minh chứng mô phỏng chỉ đọc về bài kiểm tra, bài tập, lượt nộp,
              điểm số, phản hồi và nhóm năng lực học viên.
            </p>
          </div>
          {assessmentReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(assessmentReport.totals.completedSubmissionCount)}{" "}
              đã hoàn thành /{" "}
              {formatInteger(assessmentReport.totals.expectedSubmissionCount)}{" "}
              lượt nộp dự kiến
            </span>
          )}
        </div>

        {assessmentReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bài học và mục nội dung
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(assessmentReport.totals.lessonCount)} bài học /{" "}
                  {formatInteger(assessmentReport.totals.assignmentCount)} mục
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(assessmentReport.totals.quizCount)} bài kiểm
                  tra,{" "}
                  {formatInteger(assessmentReport.totals.assignmentTaskCount)}{" "}
                  bài tập được giao
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Trạng thái nộp bài
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatPercent(
                    assessmentReport.totals.overallAssignmentCompletionPercent,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Chưa nộp{" "}
                  {formatInteger(
                    assessmentReport.totals.missingSubmissionCount,
                  )}
                  , đi muộn{" "}
                  {formatInteger(assessmentReport.totals.lateSubmissionCount)},
                  đã nộp lại{" "}
                  {formatInteger(
                    assessmentReport.totals.resubmittedSubmissionCount,
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Điểm số và phản hồi
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatPercent(assessmentReport.totals.averageScorePercent)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(assessmentReport.totals.scoredSubmissionCount)}{" "}
                  đã chấm,{" "}
                  {formatInteger(assessmentReport.totals.pendingFeedbackCount)}{" "}
                  đang chờ phản hồi
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Lớp</th>
                      <th className="px-5 py-3">Nhóm năng lực</th>
                      <th className="px-5 py-3 text-right">Đã nộp</th>
                      <th className="px-5 py-3 text-right">Muộn</th>
                      <th className="px-5 py-3 text-right">Chưa nộp</th>
                      <th className="px-5 py-3 text-right">Điểm trung bình</th>
                      <th className="px-5 py-3 text-right">Tiến độ bài tập</th>
                      <th className="px-5 py-3 text-right">Tiến độ bài học</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {assessmentReport.learnerRows.map((row) => (
                      <tr key={row.enrollmentId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.progressStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.classCode}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.assessmentBand)}`}
                          >
                            {compactStatus(row.assessmentBand)}
                          </span>
                          {row.feedbackPendingCount > 0 && (
                            <p className="mt-2 text-xs text-amber-700">
                              {formatInteger(row.feedbackPendingCount)} đang chờ
                              phản hồi
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(
                            row.submittedSubmissionCount +
                              row.resubmittedSubmissionCount,
                          )}
                          /{formatInteger(row.expectedAssignmentCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.lateSubmissionCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.missingSubmissionCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                          {formatPercent(row.averageScorePercent)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatPercent(row.assignmentCompletionPercent)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatPercent(row.progressCompletionPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Mục đánh giá</th>
                      <th className="px-5 py-3">Bài học</th>
                      <th className="px-5 py-3">Loại</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Dự kiến</th>
                      <th className="px-5 py-3 text-right">Chưa nộp</th>
                      <th className="px-5 py-3 text-right">Muộn</th>
                      <th className="px-5 py-3 text-right">Đã nộp lại</th>
                      <th className="px-5 py-3 text-right">Điểm trung bình</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {assessmentReport.assignmentRows.map((row) => (
                      <tr key={row.assignmentId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.classCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.lessonCode}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.kind)}`}
                          >
                            {compactStatus(row.kind)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                          >
                            {compactStatus(row.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.expectedSubmissionCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.missingSubmissionCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.lateSubmissionCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.resubmittedSubmissionCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                          {formatPercent(row.averageScorePercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Bản tổng hợp đánh giá sẽ xuất hiện sau khi báo cáo mô phỏng tải
            xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList size={18} />
              Lộ trình học, kế hoạch hằng ngày, video và luyện tập
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Minh chứng dành cho phụ huynh và giáo viên về việc lượt xem video
              và luyện tập hằng ngày được tổng hợp vào tiến độ học viên.
            </p>
          </div>
          {learningPathReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(learningPathReport.totals.completedDailyPlanCount)}{" "}
              đã hoàn thành /{" "}
              {formatInteger(learningPathReport.totals.dailyPlanCount)} kế hoạch
              hằng ngày
            </span>
          )}
        </div>

        {learningPathReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Lộ trình học
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(learningPathReport.totals.learningPathCount)}{" "}
                  lộ trình /{" "}
                  {formatInteger(learningPathReport.totals.dailyPlanCount)} kế
                  hoạch
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(learningPathReport.totals.onTrackLearnerCount)}{" "}
                  đúng tiến độ,{" "}
                  {formatInteger(
                    learningPathReport.totals.needsSupportLearnerCount,
                  )}{" "}
                  cần hỗ trợ
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Minh chứng video
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(learningPathReport.totals.completedVideoCount)}
                  /{formatInteger(learningPathReport.totals.videoEvidenceCount)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    learningPathReport.totals.incompleteVideoCount,
                  )}{" "}
                  chưa hoàn thành,{" "}
                  {formatInteger(learningPathReport.totals.skippedVideoCount)}{" "}
                  đã bỏ qua
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Lượt luyện tập
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatPercent(
                    learningPathReport.totals.averagePracticeScorePercent,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(learningPathReport.totals.passedPracticeCount)}{" "}
                  đã đạt,{" "}
                  {formatInteger(
                    learningPathReport.totals.needsRetryPracticeCount,
                  )}{" "}
                  cần thử lại
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Lộ trình học viên</th>
                      <th className="px-5 py-3">Lớp</th>
                      <th className="px-5 py-3">Nhóm năng lực</th>
                      <th className="px-5 py-3 text-right">Gói học</th>
                      <th className="px-5 py-3 text-right">Video</th>
                      <th className="px-5 py-3 text-right">Luyện tập</th>
                      <th className="px-5 py-3 text-right">Điểm trung bình</th>
                      <th className="px-5 py-3 text-right">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {learningPathReport.learningPathRows.map((row) => (
                      <tr key={row.learningPathId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {row.childProfileId} / {row.courseCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.classCode}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.learnerStatusBand)}`}
                          >
                            {compactStatus(row.learnerStatusBand)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {compactStatus(row.pathStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.completedDailyPlanCount)}/
                          {formatInteger(row.dailyPlanCount)}
                          {(row.blockedDailyPlanCount > 0 ||
                            row.skippedDailyPlanCount > 0) && (
                            <p className="mt-1 text-xs text-amber-700">
                              {formatInteger(row.blockedDailyPlanCount)} bị chặn
                              / {formatInteger(row.skippedDailyPlanCount)} đã bỏ
                              qua
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.completedVideoCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.passedPracticeCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                          {formatPercent(row.averagePracticeScorePercent)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatPercent(row.progressPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Bài học</th>
                      <th className="px-5 py-3">Kế hoạch</th>
                      <th className="px-5 py-3">Video</th>
                      <th className="px-5 py-3 text-right">Lượt xem</th>
                      <th className="px-5 py-3">Luyện tập</th>
                      <th className="px-5 py-3 text-right">Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {learningPathReport.dailyPlanRows.map((row) => (
                      <tr key={row.dailyPlanId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.planDate} / {row.classCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.studentName}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.lessonCode}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.dailyPlanStatus)}`}
                          >
                            {compactStatus(row.dailyPlanStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.videoEvidenceStatus)}`}
                          >
                            {compactStatus(row.videoEvidenceStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatPercent(row.videoCompletionPercent)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.practiceAttemptStatus)}`}
                          >
                            {compactStatus(row.practiceAttemptStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                          {row.practiceScorePercent === null
                            ? "-"
                            : formatPercent(row.practiceScorePercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng lộ trình học sẽ xuất hiện sau khi báo cáo mô phỏng tải
            xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertTriangle size={18} />
              Cảnh báo dành cho phụ huynh và giáo viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Quy tắc mô phỏng xác định cho rủi ro tiến độ, đề xuất của giáo
              viên, tổng hợp cho phụ huynh và trạng thái theo dõi.
            </p>
          </div>
          {parentTeacherAlertReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(parentTeacherAlertReport.totals.alertCount)} cảnh
              báo /{" "}
              {formatInteger(
                parentTeacherAlertReport.totals.followUpNeededAlertCount,
              )}{" "}
              cần theo dõi
            </span>
          )}
        </div>

        {parentTeacherAlertReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Mức độ cảnh báo
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherAlertReport.totals.highRiskAlertCount,
                  )}{" "}
                  cao /{" "}
                  {formatInteger(
                    parentTeacherAlertReport.totals.mediumRiskAlertCount,
                  )}{" "}
                  trung bình
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherAlertReport.totals.learnerProgressSummaryCount,
                  )}{" "}
                  bản tổng hợp học viên
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Nhóm theo dõi
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentTeacherAlertReport.totals.openFollowUpCount,
                  )}{" "}
                  đang mở /{" "}
                  {formatInteger(
                    parentTeacherAlertReport.totals.scheduledFollowUpCount,
                  )}{" "}
                  đã lên lịch
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentTeacherAlertReport.totals.resolvedFollowUpCount,
                  )}{" "}
                  đã giải quyết,{" "}
                  {formatInteger(
                    parentTeacherAlertReport.totals.monitoringFollowUpCount,
                  )}{" "}
                  đang theo dõi
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Lý do phổ biến
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {parentTeacherAlertReport.topAlertReasons[0]?.reasonLabel ??
                    "-"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {parentTeacherAlertReport.topAlertReasons
                    .slice(0, 3)
                    .map(
                      (row) =>
                        `${row.reasonLabel} ${formatInteger(row.alertCount)}`,
                    )
                    .join(" / ")}
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Rủi ro</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Minh chứng</th>
                      <th className="px-5 py-3">Đề xuất của giáo viên</th>
                      <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                      <th className="px-5 py-3">Theo dõi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherAlertReport.alertRows.map((row) => (
                      <tr key={row.alertId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.courseCode}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {row.teacherName} / {row.parentEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.alertSeverity)}`}
                          >
                            {compactStatus(row.alertSeverity)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.reasonLabel}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          <p>{row.evidenceSummary}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Tiến độ {formatPercent(row.progressPercent)} / điểm
                            danh {formatPercent(row.attendanceRatePercent)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.teacherInterventionRecommendation}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.parentSummary}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.followUpStatus)}`}
                          >
                            {compactStatus(row.followUpStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatDateTime(row.recommendedFollowUpAt)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng cảnh báo dành cho phụ huynh và giáo viên sẽ xuất hiện sau
            khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Clock3 size={18} />
              Kiểm soát thời gian màn hình của người giám hộ
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dữ liệu mô phỏng về chính sách phụ huynh, cổng phiên học, quyết
              định cấp quyền, truy cập kế hoạch hằng ngày an toàn và điều khiển
              hiển thị cho giáo viên.
            </p>
          </div>
          {parentScreenTimeReport && (
            <span className="text-xs text-slate-500">
              {formatInteger(parentScreenTimeReport.totals.usedMinutes)} đã dùng
              / {formatInteger(parentScreenTimeReport.totals.allowedMinutes)}{" "}
              phút được phép
            </span>
          )}
        </div>

        {parentScreenTimeReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Người giám hộ và trẻ
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeReport.totals.parentGuardianCount,
                  )}{" "}
                  / {formatInteger(parentScreenTimeReport.totals.childCount)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentScreenTimeReport.totals.activeScreenTimePolicyCount,
                  )}{" "}
                  chính sách đang hoạt động
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Số phút
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeReport.totals.remainingMinutes,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Còn lại sau khi{" "}
                  {formatInteger(parentScreenTimeReport.totals.usedMinutes)} đã
                  dùng
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Lượt cấp quyền
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeReport.totals.grantDecisionCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentScreenTimeReport.totals.approvedGrantCount,
                  )}{" "}
                  đã duyệt,{" "}
                  {formatInteger(
                    parentScreenTimeReport.totals.deniedGrantCount,
                  )}{" "}
                  bị từ chối
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Kết quả cổng kiểm soát
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeReport.totals.allowedSessionCount,
                  )}{" "}
                  được phép
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentScreenTimeReport.totals.blockedSessionCount,
                  )}{" "}
                  bị chặn,{" "}
                  {formatInteger(
                    parentScreenTimeReport.totals.overrideSessionCount,
                  )}{" "}
                  ghi đè
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Trẻ</th>
                      <th className="px-5 py-3">Người giám hộ</th>
                      <th className="px-5 py-3">Chính sách</th>
                      <th className="px-5 py-3 text-right">Số phút</th>
                      <th className="px-5 py-3 text-right">Lượt cấp quyền</th>
                      <th className="px-5 py-3 text-right">Cổng kiểm soát</th>
                      <th className="px-5 py-3">Phụ huynh cần lưu ý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentScreenTimeReport.childRows.map((row) => (
                      <tr key={row.childProfileId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.courseCodes.join(", ")}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          <p>{row.guardianName}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.relationship)} /{" "}
                            {row.guardianEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.policyStatus)}`}
                          >
                            {compactStatus(row.policyStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            Cơ bản {formatInteger(row.dailyAllowedMinutes)} +
                            được cấp {formatInteger(row.approvedGrantMinutes)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          <p className="font-semibold text-slate-950">
                            {formatInteger(row.usedMinutes)}/
                            {formatInteger(row.totalAllowedMinutes)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.remainingMinutes)} còn lại
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.grantDecisionCount)}/
                          {formatInteger(row.grantRequestCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.allowedSessionCount)} được phép
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.blockedSessionCount)} bị chặn /{" "}
                            {formatInteger(row.overrideSessionCount)} ghi đè
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              row.needsParentAttention
                                ? "bg-amber-50 text-amber-800 ring-amber-100"
                                : "bg-teal-50 text-teal-700 ring-teal-100"
                            }`}
                          >
                            {row.needsParentAttention
                              ? "Cần xét duyệt"
                              : "Xóa bộ lọc"}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.parentAttentionReason}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Cổng kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Trẻ</th>
                      <th className="px-5 py-3">Lớp</th>
                      <th className="px-5 py-3">Quyết định</th>
                      <th className="px-5 py-3 text-right">Ngày yêu cầu</th>
                      <th className="px-5 py-3 text-right">Đã dùng trước đó</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Truy cập</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentScreenTimeReport.gateRows.map((row) => (
                      <tr key={row.gateId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.dailyPlanTitle}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.lessonCode} / {formatDateTime(row.requestedAt)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.studentName}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.guardianName}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.classCode}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.courseCode} / {row.teacherName}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.decision)}`}
                          >
                            {compactStatus(row.decision)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {compactStatus(row.decidedBy)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.requestedMinutes)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.usedMinutesBeforeSession)}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {compactStatus(row.blockedReason)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              row.safeDailyPlanAccess
                                ? "bg-teal-50 text-teal-700 ring-teal-100"
                                : "bg-rose-50 text-rose-700 ring-rose-100"
                            }`}
                          >
                            {row.safeDailyPlanAccess
                              ? "Truy cập an toàn"
                              : "Bị chặn"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Yêu cầu cấp quyền</th>
                      <th className="px-5 py-3">Trẻ</th>
                      <th className="px-5 py-3">Người giám hộ</th>
                      <th className="px-5 py-3 text-right">Ngày yêu cầu</th>
                      <th className="px-5 py-3">Quyết định</th>
                      <th className="px-5 py-3 text-right">Đã cấp</th>
                      <th className="px-5 py-3">Lý do</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentScreenTimeReport.grantRows.map((row) => (
                      <tr key={row.grantRequestId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.grantRequestId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(row.requestedAt)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.studentName}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.guardianName}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.requestedExtraMinutes)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.decision)}`}
                          >
                            {compactStatus(row.decision)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.grantedMinutes)}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.decisionReason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng kiểm soát thời gian màn hình của phụ huynh sẽ xuất hiện
            sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        id="parent-screen-time-grant-daily-plan-guard"
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={18} />
              Bộ kiểm soát quyền thời gian màn hình và kế hoạch hằng ngày
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dữ liệu mô phỏng về quyền phụ huynh cấp và chính sách thời gian
              màn hình được truy vết tới minh chứng phiên kế hoạch hằng ngày
              được phép hoặc bị chặn.
            </p>
          </div>
          {parentScreenTimeGrantDailyPlanGuardReport && (
            <span className="text-xs text-slate-500">
              GET {parentScreenTimeGrantDailyPlanGuardReportPath}
            </span>
          )}
        </div>

        {parentScreenTimeGrantDailyPlanGuardReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Trường hợp kiểm soát
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .dailyPlanAccessCaseCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .sessionGuardTraceCount,
                  )}{" "}
                  dấu vết ổn định
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Kết quả
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .allowedSessionCount,
                  )}{" "}
                  được phép
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .blockedSessionCount,
                  )}{" "}
                  bị chặn
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Quy tắc
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .parentGrantRuleCount,
                  )}{" "}
                  lượt cấp quyền
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .screenTimeRuleCount,
                  )}{" "}
                  quy tắc thời gian màn hình
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    parentScreenTimeGrantDailyPlanGuardReport.totals
                      .openSafetyGateCount,
                  )}{" "}
                  cổng đang mở
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1380px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Trẻ</th>
                      <th className="px-5 py-3">Người giám hộ</th>
                      <th className="px-5 py-3">Quy tắc</th>
                      <th className="px-5 py-3">Quyền được cấp</th>
                      <th className="px-5 py-3">Kết quả</th>
                      <th className="px-5 py-3">Lý do</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentScreenTimeGrantDailyPlanGuardReport.accessRows.map(
                      (row) => (
                        <tr key={row.accessCaseId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.dailyPlanTitle}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.courseCode} / {row.lessonCode} /{" "}
                              {formatDateTime(row.requestedAt)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.classCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.parentGuardianName}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.relationship)} /{" "}
                              {row.parentGuardianEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.screenTimePolicyStatus)}`}
                            >
                              {compactStatus(row.screenTimePolicyStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatInteger(row.usedMinutesBeforeSession)} +{" "}
                              {formatInteger(row.requestedMinutes)} /{" "}
                              {formatInteger(row.totalAllowedMinutesForCase)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.parentGrantRuleId ?? "Không có"}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.parentGrantDecision)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.accessResult)}`}
                            >
                              {compactStatus(row.accessResult)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {compactStatus(row.accessDecision)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.blockedReason ??
                              compactStatus(row.blockedReasonCode)}
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.nextSafeActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.sessionGuardTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Quyền được cấp</th>
                        <th className="px-5 py-3">Trẻ</th>
                        <th className="px-5 py-3 text-right">Số phút</th>
                        <th className="px-5 py-3">Quyết định</th>
                        <th className="px-5 py-3">Lý do</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parentScreenTimeGrantDailyPlanGuardReport.grantRuleRows.map(
                        (row) => (
                          <tr key={row.grantRuleId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.grantRuleId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.dailyPlanTitle}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.studentName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.childProfileId} / {row.parentGuardianName}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-right align-top text-slate-700">
                              {formatInteger(row.grantedMinutes)}/
                              {formatInteger(row.requestedExtraMinutes)}
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.decision)}`}
                              >
                                {compactStatus(row.decision)}
                              </span>
                              <p className="mt-2 text-xs text-slate-500">
                                {row.allowsDailyPlanAccess
                                  ? "Cho phép truy cập"
                                  : "Keeps bị chặn"}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.decisionReason}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Minh chứng phiên học</th>
                        <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                        <th className="px-5 py-3">Kết quả</th>
                        <th className="px-5 py-3 text-right">Số phút</th>
                        <th className="px-5 py-3">Hành động tiếp theo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parentScreenTimeGrantDailyPlanGuardReport.sessionEvidenceRows.map(
                        (row) => (
                          <tr key={row.learningSessionEvidenceId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.studentName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.learningSessionEvidenceId}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.dailyPlanTitle}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.accessResult)}`}
                              >
                                {compactStatus(row.accessResult)}
                              </span>
                              <p className="mt-2 text-xs text-slate-500">
                                {row.sessionStarted ? "Đã bắt đầu" : "Bị chặn"}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-right align-top text-slate-700">
                              {formatInteger(row.sessionDurationMinutes)}
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.nextSafeActionLabel}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng bộ kiểm soát thời gian màn hình và kế hoạch hằng ngày sẽ
            xuất hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        id="learning-session-completion-practice-progress-rollup"
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 size={18} />
              Tổng hợp hoàn thành phiên học, luyện tập và tiến độ
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Các phiên kế hoạch hằng ngày được cho phép được truy vết tới hoàn
              thành bài học, điểm luyện tập, tổng hợp tiến độ và bản tổng hợp
              phụ huynh/giáo viên.
            </p>
          </div>
          {learningSessionCompletionPracticeProgressRollupReport && (
            <span className="text-xs text-slate-500">
              GET {learningSessionCompletionPracticeProgressRollupReportPath}
            </span>
          )}
        </div>

        {learningSessionCompletionPracticeProgressRollupReport ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bản tổng hợp
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .progressRollupCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .stableTraceCount,
                  )}{" "}
                  dấu vết ổn định
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Hoàn thành
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatPercent(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .averageCompletionPercent,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatPercent(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .averagePracticeScorePercent,
                  )}{" "}
                  điểm luyện tập trung bình
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bản tổng hợp
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .parentVisibleProgressSummaryCount,
                  )}
                  /
                  {formatInteger(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .teacherVisibleProgressSummaryCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  dòng hiển thị cho phụ huynh/giáo viên
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    learningSessionCompletionPracticeProgressRollupReport.totals
                      .openSafetyGateCount,
                  )}{" "}
                  cổng đang mở
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                {
                  learningSessionCompletionPracticeProgressRollupReport.endpointPath
                }
              </p>
              <p className="mt-1">
                {
                  learningSessionCompletionPracticeProgressRollupReport.jsonExportPath
                }
              </p>
              <p className="mt-1">
                {
                  learningSessionCompletionPracticeProgressRollupReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1460px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Dữ liệu tổng hợp</th>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                      <th className="px-5 py-3">Bài học/video</th>
                      <th className="px-5 py-3">Luyện tập</th>
                      <th className="px-5 py-3">Tiến độ</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {learningSessionCompletionPracticeProgressRollupReport.progressRollupRows.map(
                      (row) => (
                        <tr key={row.progressRollupId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.progressRollupId}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.rollupStatus)}`}
                            >
                              {compactStatus(row.rollupStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.dailyPlanTitle}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.learningSessionEvidenceId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.dailyPlanStatus)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.lessonCode}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.videoEvidenceStatus)} /{" "}
                              {formatPercent(row.videoCompletionPercent)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.practiceAttemptStatus)}`}
                            >
                              {compactStatus(row.practiceAttemptStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatPercent(row.practiceScorePercent)} /{" "}
                              {row.practiceAttemptId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.progressStatus)}`}
                            >
                              {compactStatus(row.progressStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatPercent(row.completionPercent)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.nextSafeActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.stableTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                        <th className="px-5 py-3">Trẻ</th>
                        <th className="px-5 py-3">Tiến độ</th>
                        <th className="px-5 py-3">Hành động tiếp theo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {learningSessionCompletionPracticeProgressRollupReport.parentSummaryRows.map(
                        (row) => (
                          <tr key={row.parentVisibleProgressSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.parentVisibleProgressSummaryId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.parentGuardianName} /{" "}
                                {row.parentGuardianEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.studentName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.courseCode} / {row.dailyPlanTitle}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.rollupStatus)}`}
                              >
                                {compactStatus(row.rollupStatus)}
                              </span>
                              <p className="mt-2 text-xs text-slate-500">
                                {formatPercent(row.completionPercent)} /{" "}
                                {formatPercent(row.practiceScorePercent)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.nextSafeActionLabel}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Tổng hợp cho giáo viên</th>
                        <th className="px-5 py-3">Học viên</th>
                        <th className="px-5 py-3">Minh chứng</th>
                        <th className="px-5 py-3">Hành động tiếp theo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {learningSessionCompletionPracticeProgressRollupReport.teacherSummaryRows.map(
                        (row) => (
                          <tr key={row.teacherVisibleProgressSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.teacherVisibleProgressSummaryId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.teacherName} / {row.classCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.studentName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.courseCode} / {row.lessonCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.rollupStatus)}`}
                              >
                                {compactStatus(row.rollupStatus)}
                              </span>
                              <p className="mt-2 text-xs text-slate-500">
                                {formatPercent(row.completionPercent)} /{" "}
                                {formatPercent(row.practiceScorePercent)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.nextSafeActionLabel}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng tổng hợp hoàn thành phiên học, luyện tập và tiến độ sẽ
            xuất hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="teacher-intervention-remedial-assignment-support-plan"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertTriangle size={18} />
              Kế hoạch hỗ trợ can thiệp của giáo viên
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Bản tổng hợp tiến độ cần hỗ trợ được truy vết tới lượt giáo viên
              duyệt, bài tập khắc phục, tổng hợp cho phụ huynh và hành động tiếp
              theo của giáo viên.
            </p>
          </div>
          {teacherInterventionRemedialAssignmentSupportPlanReport && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
              GET {teacherInterventionRemedialAssignmentSupportPlanReportPath}
            </span>
          )}
        </div>

        {teacherInterventionRemedialAssignmentSupportPlanReport ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Lượt xét duyệt
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.teacherInterventionReviewCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.needsSupportProgressRollupCount,
                  )}{" "}
                  dữ liệu tổng hợp cần hỗ trợ
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Gói học
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.remedialAssignmentCount,
                  )}
                  /
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.supportPlanCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  khắc phục / hỗ trợ
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Khả năng hiển thị
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.parentVisibleSupportSummaryCount,
                  )}
                  /
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.teacherVisibleNextActionCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  dòng dữ liệu phụ huynh/giáo viên
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    teacherInterventionRemedialAssignmentSupportPlanReport
                      .totals.openSafetyGateCount,
                  )}{" "}
                  cổng đang mở
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                {
                  teacherInterventionRemedialAssignmentSupportPlanReport.endpointPath
                }
              </p>
              <p className="mt-1">
                {
                  teacherInterventionRemedialAssignmentSupportPlanReport.jsonExportPath
                }
              </p>
              <p className="mt-1">
                {
                  teacherInterventionRemedialAssignmentSupportPlanReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Duyệt</th>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Giáo viên</th>
                      <th className="px-5 py-3">Dữ liệu tổng hợp nguồn</th>
                      <th className="px-5 py-3">Lý do hỗ trợ</th>
                      <th className="px-5 py-3">Khắc phục/hỗ trợ</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {teacherInterventionRemedialAssignmentSupportPlanReport.interventionReviewRows.map(
                      (row) => (
                        <tr key={row.interventionReviewId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.interventionReviewId}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.reviewStatus)}`}
                            >
                              {compactStatus(row.reviewStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.teacherName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.teacherEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.progressRollupId}
                            <p className="mt-1 text-xs text-slate-500">
                              {compactStatus(row.rollupStatus)} /{" "}
                              {formatPercent(row.completionPercent)} /{" "}
                              {formatPercent(row.practiceScorePercent)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.supportReason}
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.remedialAssignmentId}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.supportPlanId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.safeNextActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.stableTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[740px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Bài tập khắc phục</th>
                        <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Hành động tiếp theo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {teacherInterventionRemedialAssignmentSupportPlanReport.remedialAssignmentRows.map(
                        (row) => (
                          <tr key={row.remedialAssignmentId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.remedialAssignmentId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.sourcePracticeAttemptId}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.remedialDailyPlanTitle}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.remedialLessonCode} /{" "}
                                {row.sourceAssignmentId ??
                                  "không có bài được giao"}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                              >
                                {compactStatus(row.status)}
                              </span>
                              <p className="mt-2 text-xs text-slate-500">
                                {formatDateTime(row.dueAt)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.safeNextActionLabel}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[740px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Kế hoạch hỗ trợ</th>
                        <th className="px-5 py-3">Học viên</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Hành động tiếp theo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {teacherInterventionRemedialAssignmentSupportPlanReport.supportPlanRows.map(
                        (row) => (
                          <tr key={row.supportPlanId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.supportPlanId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.remedialAssignmentId}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.studentName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.childProfileId} / {row.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                              >
                                {compactStatus(row.status)}
                              </span>
                              <p className="mt-2 text-xs text-slate-500">
                                hiển thị cho phụ huynh và giáo viên
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.safeNextActionLabel}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                        <th className="px-5 py-3">Phụ huynh</th>
                        <th className="px-5 py-3">Lý do</th>
                        <th className="px-5 py-3">Hành động tiếp theo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {teacherInterventionRemedialAssignmentSupportPlanReport.parentSummaryRows.map(
                        (row) => (
                          <tr key={row.parentVisibleSupportSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.parentVisibleSupportSummaryId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.parentGuardianName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.parentGuardianEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.supportReason}
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.safeNextActionLabel}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Thao tác của giáo viên</th>
                        <th className="px-5 py-3">Giáo viên</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Hành động tiếp theo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {teacherInterventionRemedialAssignmentSupportPlanReport.teacherNextActionRows.map(
                        (row) => (
                          <tr key={row.teacherVisibleNextActionId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.teacherVisibleNextActionId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.classCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.teacherName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.teacherEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                              >
                                {compactStatus(row.status)}
                              </span>
                              <p className="mt-2 text-xs text-slate-500">
                                {formatDateTime(row.dueAt)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.safeNextActionLabel}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng kế hoạch hỗ trợ can thiệp của giáo viên sẽ xuất hiện sau
            khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="remedial-retry-completion-support-outcome-followup-summary"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <RefreshCw size={18} />
              Theo dõi kết quả thử lại bài khắc phục
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Minh chứng kế hoạch hỗ trợ của giáo viên được truy vết tới hoàn
              thành thử lại, kết quả hỗ trợ và các dòng theo dõi của phụ huynh,
              giáo viên.
            </p>
          </div>
          {remedialRetryCompletionSupportOutcomeFollowupReport && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              GET {remedialRetryCompletionSupportOutcomeFollowupReportPath}
            </span>
          )}
        </div>

        {remedialRetryCompletionSupportOutcomeFollowupReport ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Lượt thử lại đã hoàn thành
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .remedialRetryCompletionCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .retriesWithDeterministicStatusScoreCount,
                  )}{" "}
                  trạng thái/điểm số xác định
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Kết quả
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .supportOutcomeEvidenceCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .outcomesWithDeterministicStatusCount,
                  )}{" "}
                  kết quả xác định
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bản tổng hợp theo dõi
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .parentVisibleFollowupSummaryCount,
                  )}
                  /
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .teacherVisibleFollowupSummaryCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  dòng dữ liệu phụ huynh/giáo viên
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    remedialRetryCompletionSupportOutcomeFollowupReport.totals
                      .openSafetyGateCount,
                  )}{" "}
                  cổng đang mở
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                {
                  remedialRetryCompletionSupportOutcomeFollowupReport.endpointPath
                }
              </p>
              <p className="mt-1">
                {
                  remedialRetryCompletionSupportOutcomeFollowupReport.jsonExportPath
                }
              </p>
              <p className="mt-1">
                {
                  remedialRetryCompletionSupportOutcomeFollowupReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Hoàn thành thử lại</th>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Giáo viên</th>
                      <th className="px-5 py-3">Tham chiếu hỗ trợ</th>
                      <th className="px-5 py-3">Điểm</th>
                      <th className="px-5 py-3">Kết quả</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {remedialRetryCompletionSupportOutcomeFollowupReport.retryCompletionRows.map(
                      (row) => (
                        <tr key={row.retryCompletionId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.retryCompletionId}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.retryStatus)}`}
                            >
                              {compactStatus(row.retryStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatDateTime(row.completedAt)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.teacherName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.teacherEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.supportPlanId}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.remedialAssignmentId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.remedialDailyPlanTitle} /{" "}
                              {row.remedialPracticeAttemptId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {formatPercent(row.scorePercent)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatPercent(row.completionPercent)} hoàn thành
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.supportOutcomeStatus)}`}
                            >
                              {compactStatus(row.supportOutcomeStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.supportOutcomeId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.safeNextActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.stableTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Kết quả</th>
                        <th className="px-5 py-3">Điểm</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {remedialRetryCompletionSupportOutcomeFollowupReport.supportOutcomeRows.map(
                        (row) => (
                          <tr key={row.supportOutcomeId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.supportOutcomeId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {formatPercent(row.scorePercent)}
                              <p className="mt-1 text-xs text-slate-500">
                                {formatPercent(row.completionPercent)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.outcomeSummary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Phụ huynh theo dõi</th>
                        <th className="px-5 py-3">Phụ huynh</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {remedialRetryCompletionSupportOutcomeFollowupReport.parentFollowupSummaryRows.map(
                        (row) => (
                          <tr key={row.parentFollowupSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.parentFollowupSummaryId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.supportOutcomeStatus}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.parentGuardianName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.parentGuardianEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.summary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Giáo viên theo dõi</th>
                        <th className="px-5 py-3">Giáo viên</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {remedialRetryCompletionSupportOutcomeFollowupReport.teacherFollowupSummaryRows.map(
                        (row) => (
                          <tr key={row.teacherFollowupSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.teacherFollowupSummaryId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.classCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.teacherName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.teacherEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.summary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng theo dõi kết quả hỗ trợ sau khi hoàn thành thử lại bài
            khắc phục sẽ xuất hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        id="remedial-retry-unresolved-support-escalation"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertTriangle size={18} />
              Leo thang lần thử khắc phục chưa giải quyết
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Minh chứng lần thử khắc phục chưa hoàn thành hoặc thất bại được
              truy vết tới kết quả hỗ trợ chưa giải quyết, leo thang cho giáo
              viên, điều chỉnh hỗ trợ, tổng hợp leo thang cho phụ huynh và hành
              động tiếp theo của giáo viên.
            </p>
          </div>
          {remedialRetryUnresolvedSupportEscalationReport && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
              GET {remedialRetryUnresolvedSupportEscalationReportPath}
            </span>
          )}
        </div>

        {remedialRetryUnresolvedSupportEscalationReport ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Thất bại hoặc chưa hoàn thành
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .failedOrIncompleteRetryCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .attemptsWithDeterministicStatusScoreCount,
                  )}{" "}
                  lần thực hiện xác định
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Kết quả chưa giải quyết
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .unresolvedSupportOutcomeCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .outcomesWithDeterministicStatusReasonActionCount,
                  )}{" "}
                  trạng thái/lý do/thao tác
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Dòng leo thang
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .teacherEscalationCount,
                  )}
                  /
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .supportAdjustmentCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  leo thang / điều chỉnh của giáo viên
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  An toàn
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .safetyGateCount,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatInteger(
                    remedialRetryUnresolvedSupportEscalationReport.totals
                      .openSafetyGateCount,
                  )}{" "}
                  cổng đang mở
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>
                {remedialRetryUnresolvedSupportEscalationReport.endpointPath}
              </p>
              <p className="mt-1">
                {remedialRetryUnresolvedSupportEscalationReport.jsonExportPath}
              </p>
              <p className="mt-1">
                {
                  remedialRetryUnresolvedSupportEscalationReport.markdownExportPath
                }
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1360px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Lần thử lại</th>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Giáo viên</th>
                      <th className="px-5 py-3">Tham chiếu hỗ trợ</th>
                      <th className="px-5 py-3">Điểm</th>
                      <th className="px-5 py-3">Kết quả</th>
                      <th className="px-5 py-3">Leo thang</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                      <th className="px-5 py-3">Truy vết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {remedialRetryUnresolvedSupportEscalationReport.retryAttemptRows.map(
                      (row) => (
                        <tr key={row.retryAttemptId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.retryAttemptId}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.retryStatus)}`}
                            >
                              {compactStatus(row.retryStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatDateTime(row.attemptedAt)}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.childProfileId} / {row.courseCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.teacherName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.teacherEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.supportPlanId}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.remedialAssignmentId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.remedialDailyPlanTitle} /{" "}
                              {row.remedialPracticeAttemptId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {formatPercent(row.scorePercent)}
                            <p className="mt-1 text-xs text-slate-500">
                              {formatPercent(row.completionPercent)} hoàn thành
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.unresolvedOutcomeStatus)}`}
                            >
                              {compactStatus(row.unresolvedOutcomeStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {row.reasonCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.teacherEscalationId}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.supportAdjustmentId}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.safeNextActionLabel}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-slate-500">
                            {row.stableTraceKey}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Kết quả</th>
                        <th className="px-5 py-3">Lý do</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {remedialRetryUnresolvedSupportEscalationReport.unresolvedOutcomeRows.map(
                        (row) => (
                          <tr key={row.unresolvedOutcomeId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.unresolvedOutcomeId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.reasonCode}
                              <p className="mt-1 text-xs text-slate-500">
                                {formatPercent(row.scorePercent)} /{" "}
                                {formatPercent(row.completionPercent)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.outcomeSummary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Leo thang cho phụ huynh</th>
                        <th className="px-5 py-3">Phụ huynh</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {remedialRetryUnresolvedSupportEscalationReport.parentEscalationSummaryRows.map(
                        (row) => (
                          <tr key={row.parentEscalationSummaryId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.parentEscalationSummaryId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.reasonCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.parentGuardianName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.parentGuardianEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.summary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">
                          Hành động tiếp theo của giáo viên
                        </th>
                        <th className="px-5 py-3">Giáo viên</th>
                        <th className="px-5 py-3">Tổng hợp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {remedialRetryUnresolvedSupportEscalationReport.teacherEscalationNextActionRows.map(
                        (row) => (
                          <tr key={row.teacherEscalationNextActionId}>
                            <td className="px-5 py-4 align-top">
                              <p className="font-medium text-slate-950">
                                {row.teacherEscalationNextActionId}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {row.studentName} / {row.classCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.teacherName}
                              <p className="mt-1 text-xs text-slate-500">
                                {row.teacherEmail}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-slate-700">
                              {row.summary}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Minh chứng leo thang hỗ trợ cho lần thử khắc phục chưa giải quyết sẽ
            xuất hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BarChart3 size={18} />
          Dòng thời gian buổi học
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Các buổi học chỉ đọc với trạng thái có mặt, đi muộn, vắng và có phép.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Phiên</th>
                  <th className="px-5 py-3">Lớp</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Điểm danh</th>
                  <th className="px-5 py-3 text-right">Có mặt</th>
                  <th className="px-5 py-3 text-right">Muộn</th>
                  <th className="px-5 py-3 text-right">Vắng</th>
                  <th className="px-5 py-3 text-right">Có phép</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {progressReport?.sessionRows.map((row) => (
                  <tr key={row.sessionId}>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-slate-950">
                        {row.sequence}. {row.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.lessonCode} / {formatDateTime(row.scheduledStart)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">
                      {row.classCode}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                      >
                        {compactStatus(row.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.attendanceRecordCount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.presentAttendanceCount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.lateAttendanceCount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.absentAttendanceCount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatInteger(row.excusedAttendanceCount)}
                    </td>
                  </tr>
                ))}
                {!progressReport && (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-sm text-slate-500"
                      colSpan={8}
                    >
                      {isLoading
                        ? "Đang tải báo cáo giả lập..."
                        : "Chưa có báo cáo phiên học."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-white text-teal-700">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-950">
              Giới hạn bản demo local
            </p>
            <p className="mt-1 text-sm leading-6 text-teal-900">
              Màn hình này chỉ đọc các báo cáo dữ liệu mô phỏng. Màn hình không
              đọc cơ sở dữ liệu sản xuất, không gọi API thanh toán hoặc nhà cung
              cấp, không chạy quảng cáo thật và không thay đổi bất kỳ dữ liệu
              học tập, người dùng, nội dung, quyền truy cập, thanh toán, hoàn
              tiền, hoa hồng hay bản ghi ERP nào.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
