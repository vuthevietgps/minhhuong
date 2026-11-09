"use client";

import { publicApiBaseUrl } from "../../_lib/admin-client";
import type { DemoLearningEnrollmentReportRow } from "./types/shared.types";

export type { DemoLearningMvpRoleJourneyEntrypointsReport } from "./types/mvp-role-journey-entrypoints.types";

export type { DemoLearningMvpEndToEndReadinessTraceReport } from "./types/mvp-end-to-end-readiness-trace.types";

export type { DemoLearningMvpReadinessOverviewStatus, DemoLearningMvpReadinessOverviewSliceKey, DemoLearningMvpReadinessOverviewRow, DemoLearningMvpReadinessOverviewReport } from "./types/mvp-readiness-overview.types";

export type { DemoLearningFollowUpActionOutcomeStudentRow, DemoLearningFollowUpActionOutcomeRow, DemoLearningFollowUpActionOutcomeReport } from "./types/follow-up-action-outcome.types";

export type { DemoLearningParentTeacherWeeklyDigestStudentRow, DemoLearningParentTeacherWeeklyDigestRow, DemoLearningParentTeacherWeeklyDigestActionRow, DemoLearningParentTeacherWeeklyDigestReport } from "./types/parent-teacher-weekly-digest.types";

export type { DemoLearningStudentAchievementBadgeCertificateReport } from "./types/student-achievement-badge-certificate.types";

export type { DemoLearningAiTutorChatSafetyTeacherReviewReport } from "./types/ai-tutor-chat-safety-teacher-review.types";

export type { DemoLearningTeacherContentLibraryLearningPathPublishReport } from "./types/teacher-content-library-learning-path-publish.types";

export type { DemoLearningTeacherEscalationFollowupResolutionReport } from "./types/teacher-escalation-followup-resolution.types";

export type { DemoLearningRemedialRetryUnresolvedSupportEscalationReport } from "./types/remedial-retry-unresolved-support-escalation.types";

export type { DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport } from "./types/remedial-retry-completion-support-outcome-followup.types";

export type { DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport } from "./types/teacher-intervention-remedial-assignment-support-plan.types";

export type { DemoLearningParentScreenTimeGrantDailyPlanGuardReport } from "./types/parent-screen-time-grant-daily-plan-guard.types";

export type { DemoLearningParentScreenTimeGuardianControlsReport } from "./types/parent-screen-time-guardian-controls.types";

export type { DemoLearningParentTeacherProgressAlertInterventionReport } from "./types/parent-teacher-progress-alert-intervention.types";

export type { DemoLearningLessonAssignmentAssessmentProgressReport } from "./types/lesson-assignment-assessment-progress.types";

export type { DemoLearningClassSessionAttendanceProgressReport } from "./types/class-session-attendance-progress.types";

export type { DemoLearningParentPortalApprovedReportInboxReadReceiptReport } from "./types/parent-portal-approved-report-inbox-read-receipt.types";

export type { DemoLearningParentTeacherReportReviewQueueMessagePreviewReport } from "./types/parent-teacher-report-review-queue-message-preview.types";

export type { DemoLearningParentTeacherReportPermissionPrivacyRedactionReport } from "./types/parent-teacher-report-permission-privacy-redaction.types";

export type { DemoLearningParentTeacherProgressAccessSummaryReport } from "./types/parent-teacher-progress-access-summary.types";

export type { DemoLearningSubscriptionEntitlementDailyPlanAccessReport } from "./types/subscription-entitlement-daily-plan-access.types";

export type { DemoLearningStudentCourseEnrollmentSubscriptionFlowReport } from "./types/student-course-enrollment-subscription-flow.types";

export type { DemoLearningEnrollmentReportRow, DemoLearningCoreReport, DemoLearningClassAggregateRow, DemoLearningSessionReportRow, DemoLearningLearnerProgressRow, DemoLearningAssignmentAssessmentRow, DemoLearningLearnerAssessmentRow, DemoLearningPathEvidenceRow, DemoLearningDailyPlanEvidenceRow, DemoLearningPathDailyPlanVideoPracticeEvidenceReport, DemoLearningParentTeacherProgressAlertRow, DemoLearningParentTeacherAlertReasonSummaryRow, DemoLearningParentScreenTimeChildControlsRow, DemoLearningParentScreenTimeGateRow, DemoLearningParentScreenTimeGrantRow, DemoLearningSessionCompletionPracticeProgressRollupReport, DemoLearningTeacherContentLibraryItemRow, DemoLearningTeacherContentStudentVisibilityRow, DemoLearningTeacherContentParentSummaryRow, DemoLearningAiTutorChatSessionRow, DemoLearningAiTutorTeacherReviewQueueRow, DemoLearningAiTutorSupportRecommendationRow, DemoLearningStudentAchievementSummaryRow, DemoLearningCertificateFixtureRow, DemoLearningRecognitionSummaryRow } from "./types/shared.types";

export const enrollmentReportPath =
  "/v1/learning-local-demo/student-course-enrollment-subscription-report";

export const studentCourseFlowReportPath =
  "/v1/learning-local-demo/student-course-enrollment-subscription-flow-report";

export const subscriptionEntitlementDailyPlanAccessReportPath =
  "/v1/learning-local-demo/subscription-entitlement-daily-plan-access-report";

export const parentTeacherProgressAccessSummaryReportPath =
  "/v1/learning-local-demo/parent-teacher-progress-access-summary-report";

export const parentTeacherReportPermissionPrivacyRedactionReportPath =
  "/v1/learning-local-demo/parent-teacher-report-permission-privacy-redaction-report";

export const parentTeacherReportReviewQueueMessagePreviewReportPath =
  "/v1/learning-local-demo/parent-teacher-report-review-queue-message-preview-report";

export const parentPortalApprovedReportInboxReadReceiptReportPath =
  "/v1/learning-local-demo/parent-portal-approved-report-inbox-read-receipt-report";

export const progressReportPath =
  "/v1/learning-local-demo/class-session-attendance-progress-report";

export const assessmentReportPath =
  "/v1/learning-local-demo/lesson-assignment-assessment-progress-report";

export const learningPathReportPath =
  "/v1/learning-local-demo/learning-path-daily-plan-video-practice-evidence-report";

export const parentTeacherAlertReportPath =
  "/v1/learning-local-demo/parent-teacher-progress-alert-intervention-report";

export const parentScreenTimeReportPath =
  "/v1/learning-local-demo/parent-screen-time-guardian-controls-report";

export const parentScreenTimeGrantDailyPlanGuardReportPath =
  "/v1/learning-local-demo/parent-screen-time-grant-daily-plan-guard-report";

export const learningSessionCompletionPracticeProgressRollupReportPath =
  "/v1/learning-local-demo/learning-session-completion-practice-progress-rollup-report";

export const teacherInterventionRemedialAssignmentSupportPlanReportPath =
  "/v1/learning-local-demo/teacher-intervention-remedial-assignment-support-plan-report";

export const remedialRetryCompletionSupportOutcomeFollowupReportPath =
  "/v1/learning-local-demo/remedial-retry-completion-support-outcome-followup-summary-report";

export const remedialRetryUnresolvedSupportEscalationReportPath =
  "/v1/learning-local-demo/remedial-retry-unresolved-support-escalation-report";

export const teacherEscalationFollowupResolutionReportPath =
  "/v1/learning-local-demo/teacher-escalation-followup-resolution-report";

export const mvpEndToEndReadinessTraceReportPath =
  "/v1/learning-local-demo/mvp-end-to-end-readiness-trace-report";

export const mvpRoleJourneyEntrypointsReportPath =
  "/v1/learning-local-demo/mvp-role-journey-entrypoints-report";

export const teacherContentPublishReportPath =
  "/v1/learning-local-demo/teacher-content-library-learning-path-publish-report";

export const aiTutorChatSafetyTeacherReviewReportPath =
  "/v1/learning-local-demo/ai-tutor-chat-safety-teacher-review-report";

export const studentAchievementBadgeCertificateReportPath =
  "/v1/learning-local-demo/student-achievement-badge-certificate-report";

export const parentTeacherWeeklyDigestReportPath =
  "/v1/learning-local-demo/parent-teacher-weekly-digest-report";

export const followUpActionOutcomeReportPath =
  "/v1/learning-local-demo/followup-action-outcome-report";

export const mvpReadinessOverviewReportPath =
  "/v1/learning-local-demo/mvp-readiness-overview-report";

export const enrollmentEndpointUrl = `${publicApiBaseUrl}${enrollmentReportPath}`;

export const studentCourseFlowEndpointUrl = `${publicApiBaseUrl}${studentCourseFlowReportPath}`;

export const subscriptionEntitlementDailyPlanAccessEndpointUrl = `${publicApiBaseUrl}${subscriptionEntitlementDailyPlanAccessReportPath}`;

export const parentTeacherProgressAccessSummaryEndpointUrl = `${publicApiBaseUrl}${parentTeacherProgressAccessSummaryReportPath}`;

export const parentTeacherReportPermissionPrivacyRedactionEndpointUrl = `${publicApiBaseUrl}${parentTeacherReportPermissionPrivacyRedactionReportPath}`;

export const parentTeacherReportReviewQueueMessagePreviewEndpointUrl = `${publicApiBaseUrl}${parentTeacherReportReviewQueueMessagePreviewReportPath}`;

export const parentPortalApprovedReportInboxReadReceiptEndpointUrl = `${publicApiBaseUrl}${parentPortalApprovedReportInboxReadReceiptReportPath}`;

export const progressEndpointUrl = `${publicApiBaseUrl}${progressReportPath}`;

export const assessmentEndpointUrl = `${publicApiBaseUrl}${assessmentReportPath}`;

export const learningPathEndpointUrl = `${publicApiBaseUrl}${learningPathReportPath}`;

export const parentTeacherAlertEndpointUrl = `${publicApiBaseUrl}${parentTeacherAlertReportPath}`;

export const parentScreenTimeEndpointUrl = `${publicApiBaseUrl}${parentScreenTimeReportPath}`;

export const parentScreenTimeGrantDailyPlanGuardEndpointUrl = `${publicApiBaseUrl}${parentScreenTimeGrantDailyPlanGuardReportPath}`;

export const learningSessionCompletionPracticeProgressRollupEndpointUrl = `${publicApiBaseUrl}${learningSessionCompletionPracticeProgressRollupReportPath}`;

export const teacherInterventionRemedialAssignmentSupportPlanEndpointUrl = `${publicApiBaseUrl}${teacherInterventionRemedialAssignmentSupportPlanReportPath}`;

export const remedialRetryCompletionSupportOutcomeFollowupEndpointUrl = `${publicApiBaseUrl}${remedialRetryCompletionSupportOutcomeFollowupReportPath}`;

export const remedialRetryUnresolvedSupportEscalationEndpointUrl = `${publicApiBaseUrl}${remedialRetryUnresolvedSupportEscalationReportPath}`;

export const teacherEscalationFollowupResolutionEndpointUrl = `${publicApiBaseUrl}${teacherEscalationFollowupResolutionReportPath}`;

export const mvpEndToEndReadinessTraceEndpointUrl = `${publicApiBaseUrl}${mvpEndToEndReadinessTraceReportPath}`;

export const mvpRoleJourneyEntrypointsEndpointUrl = `${publicApiBaseUrl}${mvpRoleJourneyEntrypointsReportPath}`;

export const teacherContentPublishEndpointUrl = `${publicApiBaseUrl}${teacherContentPublishReportPath}`;

export const aiTutorChatSafetyTeacherReviewEndpointUrl = `${publicApiBaseUrl}${aiTutorChatSafetyTeacherReviewReportPath}`;

export const studentAchievementBadgeCertificateEndpointUrl = `${publicApiBaseUrl}${studentAchievementBadgeCertificateReportPath}`;

export const parentTeacherWeeklyDigestEndpointUrl = `${publicApiBaseUrl}${parentTeacherWeeklyDigestReportPath}`;

export const followUpActionOutcomeEndpointUrl = `${publicApiBaseUrl}${followUpActionOutcomeReportPath}`;

export const mvpReadinessOverviewEndpointUrl = `${publicApiBaseUrl}${mvpReadinessOverviewReportPath}`;

export function formatInteger(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatPercent(value: number) {
  return `${formatInteger(value)}%`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function totalCommission(row: DemoLearningEnrollmentReportRow) {
  return (
    row.commissionPendingCents +
    row.commissionPayableCents +
    row.commissionApprovedCents
  );
}

export function statusBadgeClass(status: string) {
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

export function compactStatus(status: string) {
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
