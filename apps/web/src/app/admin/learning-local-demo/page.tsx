"use client";

import { AlertTriangle, CheckCircle2, GraduationCap, RefreshCw, ShieldCheck } from "lucide-react";
import { formatDateTime } from "./_components/shared";
import { useDemoReportsData } from "./_components/use-demo-reports-data";
import { useDemoMetricCards } from "./_components/use-demo-metric-cards";
import { useDemoSafetyChecks } from "./_components/use-demo-safety-checks";
import { MvpEndToEndReadinessTraceSection, MvpReadinessOverviewSection, MvpRoleJourneyEntrypointsSection } from "./_components/mvp-readiness-sections";
import { FollowUpActionOutcomeSection, ParentTeacherWeeklyDigestSection } from "./_components/follow-up-sections";
import { ParentTeacherProgressAccessSummarySection, StudentCourseFlowSection, SubscriptionEntitlementDailyPlanAccessSection } from "./_components/access-sections";
import { ReportPermissionPrivacyRedactionSection, ReportReviewQueueMessagePreviewSection } from "./_components/report-review-sections";
import { ParentPortalApprovedReportInboxSection, ParentTeacherProgressAlertSection } from "./_components/parent-portal-sections";
import { RemedialRetryUnresolvedSupportEscalationSection, TeacherEscalationFollowupResolutionSection } from "./_components/escalation-sections";
import { RemedialRetryCompletionSupportOutcomeSection, TeacherInterventionSupportPlanSection } from "./_components/intervention-sections";
import { AiTutorChatSafetyTeacherReviewSection, StudentAchievementBadgeCertificateSection } from "./_components/recognition-sections";
import { LearningSessionPracticeRollupSection, TeacherContentPublishSection } from "./_components/content-sections";
import { ClassSessionProgressSection, LearnerProgressTableSection, LearningPathEvidenceSection, LessonAssignmentAssessmentSection } from "./_components/classroom-sections";
import { ParentScreenTimeControlsSection, ParentScreenTimeGrantGuardSection } from "./_components/screen-time-sections";

export default function LearningLocalDemoPage() {
  const useDemoReportsDataResult = useDemoReportsData();
  const useDemoMetricCardsResult = useDemoMetricCards({ ...useDemoReportsDataResult });
  const useDemoSafetyChecksResult = useDemoSafetyChecks({ ...useDemoReportsDataResult });
  const state = { ...useDemoReportsDataResult, ...useDemoMetricCardsResult, ...useDemoSafetyChecksResult };
  const {
    generatedAt,
    isLoading,
    loadReports,
    message,
    metricCards,
    safetyChecks,
  } = state;
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

      <MvpReadinessOverviewSection {...state} />

      <MvpRoleJourneyEntrypointsSection {...state} />

      <FollowUpActionOutcomeSection {...state} />

      <SubscriptionEntitlementDailyPlanAccessSection {...state} />

      <ParentTeacherProgressAccessSummarySection {...state} />

      <ReportPermissionPrivacyRedactionSection {...state} />

      <ReportReviewQueueMessagePreviewSection {...state} />

      <ParentPortalApprovedReportInboxSection {...state} />

      <TeacherEscalationFollowupResolutionSection {...state} />

      <MvpEndToEndReadinessTraceSection {...state} />

      <ParentTeacherWeeklyDigestSection {...state} />

      <StudentAchievementBadgeCertificateSection {...state} />

      <AiTutorChatSafetyTeacherReviewSection {...state} />

      <TeacherContentPublishSection {...state} />

      <StudentCourseFlowSection {...state} />

      <ClassSessionProgressSection {...state} />

      <LessonAssignmentAssessmentSection {...state} />

      <LearningPathEvidenceSection {...state} />

      <ParentTeacherProgressAlertSection {...state} />

      <ParentScreenTimeControlsSection {...state} />

      <ParentScreenTimeGrantGuardSection {...state} />

      <LearningSessionPracticeRollupSection {...state} />

      <TeacherInterventionSupportPlanSection {...state} />

      <RemedialRetryCompletionSupportOutcomeSection {...state} />

      <RemedialRetryUnresolvedSupportEscalationSection {...state} />

      <LearnerProgressTableSection {...state} />

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
