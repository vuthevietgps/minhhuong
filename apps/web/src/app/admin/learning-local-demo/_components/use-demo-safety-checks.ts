import { useMemo } from "react";
import type { useDemoReportsData } from "./use-demo-reports-data";

/** Safety checks across reports and the shared generatedAt label. */
export function useDemoSafetyChecks(ctx: ReturnType<typeof useDemoReportsData>) {
  const {
    aiTutorChatSafetyTeacherReviewReport,
    assessmentReport,
    enrollmentReport,
    followUpActionOutcomeReport,
    learningPathReport,
    learningSessionCompletionPracticeProgressRollupReport,
    mvpEndToEndReadinessTraceReport,
    mvpReadinessOverviewReport,
    mvpRoleJourneyEntrypointsReport,
    parentPortalApprovedReportInboxReadReceiptReport,
    parentScreenTimeGrantDailyPlanGuardReport,
    parentScreenTimeReport,
    parentTeacherAlertReport,
    parentTeacherProgressAccessSummaryReport,
    parentTeacherReportReviewQueueMessagePreviewReport,
    parentTeacherWeeklyDigestReport,
    progressReport,
    remedialRetryCompletionSupportOutcomeFollowupReport,
    remedialRetryUnresolvedSupportEscalationReport,
    studentAchievementBadgeCertificateReport,
    studentCourseFlowReport,
    subscriptionEntitlementDailyPlanAccessReport,
    teacherContentPublishReport,
    teacherEscalationFollowupResolutionReport,
    teacherInterventionRemedialAssignmentSupportPlanReport,
  } = ctx;
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

  return { safetyChecks, generatedAt };
}
