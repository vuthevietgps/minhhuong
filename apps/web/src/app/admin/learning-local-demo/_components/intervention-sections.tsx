"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { compactStatus, formatDateTime, formatInteger, formatPercent, remedialRetryCompletionSupportOutcomeFollowupReportPath, statusBadgeClass, teacherInterventionRemedialAssignmentSupportPlanReportPath } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function TeacherInterventionSupportPlanSection(state: DemoPageState) {
  const { teacherInterventionRemedialAssignmentSupportPlanReport } = state;
  return (
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
  );
}

export function RemedialRetryCompletionSupportOutcomeSection(state: DemoPageState) {
  const { remedialRetryCompletionSupportOutcomeFollowupReport } = state;
  return (
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
  );
}
