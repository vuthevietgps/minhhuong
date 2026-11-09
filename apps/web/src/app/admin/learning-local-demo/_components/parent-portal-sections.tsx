"use client";

import { AlertTriangle, MessageSquare } from "lucide-react";
import { compactStatus, formatDateTime, formatInteger, formatPercent, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function ParentPortalApprovedReportInboxSection(state: DemoPageState) {
  const { parentPortalApprovedReportInboxReadReceiptReport } = state;
  return (
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
  );
}

export function ParentTeacherProgressAlertSection(state: DemoPageState) {
  const { parentTeacherAlertReport } = state;
  return (
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
  );
}
