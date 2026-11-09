import { AlertTriangle, Award, BarChart3, BookOpen, CheckCircle2, Clock3, ClipboardList, GraduationCap, MessageSquare, RefreshCw, ShieldCheck, Users, WalletCards } from "lucide-react";
import { useMemo } from "react";
import { formatMoney } from "../../_lib/admin-client";
import { formatInteger, formatPercent } from "./shared";
import type { useDemoReportsData } from "./use-demo-reports-data";

/** Summary metric cards derived from the loaded reports. */
export function useDemoMetricCards(ctx: ReturnType<typeof useDemoReportsData>) {
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

  return { metricCards };
}
