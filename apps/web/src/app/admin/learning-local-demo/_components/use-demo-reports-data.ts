import { useCallback, useEffect, useMemo, useState } from "react";
import { aiTutorChatSafetyTeacherReviewEndpointUrl, aiTutorChatSafetyTeacherReviewReportPath, assessmentEndpointUrl, assessmentReportPath, enrollmentEndpointUrl, enrollmentReportPath, followUpActionOutcomeEndpointUrl, followUpActionOutcomeReportPath, learningPathEndpointUrl, learningPathReportPath, learningSessionCompletionPracticeProgressRollupEndpointUrl, learningSessionCompletionPracticeProgressRollupReportPath, mvpEndToEndReadinessTraceEndpointUrl, mvpEndToEndReadinessTraceReportPath, mvpReadinessOverviewEndpointUrl, mvpReadinessOverviewReportPath, mvpRoleJourneyEntrypointsEndpointUrl, mvpRoleJourneyEntrypointsReportPath, parentPortalApprovedReportInboxReadReceiptEndpointUrl, parentPortalApprovedReportInboxReadReceiptReportPath, parentScreenTimeEndpointUrl, parentScreenTimeGrantDailyPlanGuardEndpointUrl, parentScreenTimeGrantDailyPlanGuardReportPath, parentScreenTimeReportPath, parentTeacherAlertEndpointUrl, parentTeacherAlertReportPath, parentTeacherProgressAccessSummaryEndpointUrl, parentTeacherProgressAccessSummaryReportPath, parentTeacherReportPermissionPrivacyRedactionEndpointUrl, parentTeacherReportPermissionPrivacyRedactionReportPath, parentTeacherReportReviewQueueMessagePreviewEndpointUrl, parentTeacherReportReviewQueueMessagePreviewReportPath, parentTeacherWeeklyDigestEndpointUrl, parentTeacherWeeklyDigestReportPath, progressEndpointUrl, progressReportPath, remedialRetryCompletionSupportOutcomeFollowupEndpointUrl, remedialRetryCompletionSupportOutcomeFollowupReportPath, remedialRetryUnresolvedSupportEscalationEndpointUrl, remedialRetryUnresolvedSupportEscalationReportPath, studentAchievementBadgeCertificateEndpointUrl, studentAchievementBadgeCertificateReportPath, studentCourseFlowEndpointUrl, studentCourseFlowReportPath, subscriptionEntitlementDailyPlanAccessEndpointUrl, subscriptionEntitlementDailyPlanAccessReportPath, teacherContentPublishEndpointUrl, teacherContentPublishReportPath, teacherEscalationFollowupResolutionEndpointUrl, teacherEscalationFollowupResolutionReportPath, teacherInterventionRemedialAssignmentSupportPlanEndpointUrl, teacherInterventionRemedialAssignmentSupportPlanReportPath } from "./shared";
import type { DemoLearningAiTutorChatSafetyTeacherReviewReport, DemoLearningClassSessionAttendanceProgressReport, DemoLearningCoreReport, DemoLearningFollowUpActionOutcomeReport, DemoLearningLessonAssignmentAssessmentProgressReport, DemoLearningMvpEndToEndReadinessTraceReport, DemoLearningMvpReadinessOverviewReport, DemoLearningMvpRoleJourneyEntrypointsReport, DemoLearningParentPortalApprovedReportInboxReadReceiptReport, DemoLearningParentScreenTimeGrantDailyPlanGuardReport, DemoLearningParentScreenTimeGuardianControlsReport, DemoLearningParentTeacherProgressAccessSummaryReport, DemoLearningParentTeacherProgressAlertInterventionReport, DemoLearningParentTeacherReportPermissionPrivacyRedactionReport, DemoLearningParentTeacherReportReviewQueueMessagePreviewReport, DemoLearningParentTeacherWeeklyDigestReport, DemoLearningPathDailyPlanVideoPracticeEvidenceReport, DemoLearningRemedialRetryCompletionSupportOutcomeFollowupReport, DemoLearningRemedialRetryUnresolvedSupportEscalationReport, DemoLearningSessionCompletionPracticeProgressRollupReport, DemoLearningStudentAchievementBadgeCertificateReport, DemoLearningStudentCourseEnrollmentSubscriptionFlowReport, DemoLearningSubscriptionEntitlementDailyPlanAccessReport, DemoLearningTeacherContentLibraryLearningPathPublishReport, DemoLearningTeacherEscalationFollowupResolutionReport, DemoLearningTeacherInterventionRemedialAssignmentSupportPlanReport } from "./shared";

/** Report state for every demo report, the loader and its initial effect. */
export function useDemoReportsData() {
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

  return {
    enrollmentReport,
    setEnrollmentReport,
    studentCourseFlowReport,
    setStudentCourseFlowReport,
    subscriptionEntitlementDailyPlanAccessReport,
    setSubscriptionEntitlementDailyPlanAccessReport,
    parentTeacherProgressAccessSummaryReport,
    setParentTeacherProgressAccessSummaryReport,
    parentTeacherReportPermissionPrivacyRedactionReport,
    setParentTeacherReportPermissionPrivacyRedactionReport,
    parentTeacherReportReviewQueueMessagePreviewReport,
    setParentTeacherReportReviewQueueMessagePreviewReport,
    parentPortalApprovedReportInboxReadReceiptReport,
    setParentPortalApprovedReportInboxReadReceiptReport,
    progressReport,
    setProgressReport,
    assessmentReport,
    setAssessmentReport,
    learningPathReport,
    setLearningPathReport,
    parentTeacherAlertReport,
    setParentTeacherAlertReport,
    parentScreenTimeReport,
    setParentScreenTimeReport,
    parentScreenTimeGrantDailyPlanGuardReport,
    setParentScreenTimeGrantDailyPlanGuardReport,
    learningSessionCompletionPracticeProgressRollupReport,
    setLearningSessionCompletionPracticeProgressRollupReport,
    teacherInterventionRemedialAssignmentSupportPlanReport,
    setTeacherInterventionRemedialAssignmentSupportPlanReport,
    remedialRetryCompletionSupportOutcomeFollowupReport,
    setRemedialRetryCompletionSupportOutcomeFollowupReport,
    remedialRetryUnresolvedSupportEscalationReport,
    setRemedialRetryUnresolvedSupportEscalationReport,
    teacherEscalationFollowupResolutionReport,
    setTeacherEscalationFollowupResolutionReport,
    mvpEndToEndReadinessTraceReport,
    setMvpEndToEndReadinessTraceReport,
    mvpRoleJourneyEntrypointsReport,
    setMvpRoleJourneyEntrypointsReport,
    teacherContentPublishReport,
    setTeacherContentPublishReport,
    aiTutorChatSafetyTeacherReviewReport,
    setAiTutorChatSafetyTeacherReviewReport,
    studentAchievementBadgeCertificateReport,
    setStudentAchievementBadgeCertificateReport,
    parentTeacherWeeklyDigestReport,
    setParentTeacherWeeklyDigestReport,
    followUpActionOutcomeReport,
    setFollowUpActionOutcomeReport,
    mvpReadinessOverviewReport,
    setMvpReadinessOverviewReport,
    isLoading,
    setIsLoading,
    message,
    setMessage,
    loadReports,
    learnerByEnrollmentId,
  };
}
