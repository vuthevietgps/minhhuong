"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { compactStatus, formatDateTime, formatInteger, formatPercent, remedialRetryUnresolvedSupportEscalationReportPath, statusBadgeClass, teacherEscalationFollowupResolutionReportPath } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function TeacherEscalationFollowupResolutionSection(state: DemoPageState) {
  const { teacherEscalationFollowupResolutionReport } = state;
  return (
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
  );
}

export function RemedialRetryUnresolvedSupportEscalationSection(state: DemoPageState) {
  const { remedialRetryUnresolvedSupportEscalationReport } = state;
  return (
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
  );
}
