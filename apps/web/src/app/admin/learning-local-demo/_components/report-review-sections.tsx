"use client";

import { MessageSquare, ShieldCheck } from "lucide-react";
import { compactStatus, formatDateTime, formatInteger, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function ReportPermissionPrivacyRedactionSection(state: DemoPageState) {
  const { parentTeacherReportPermissionPrivacyRedactionReport } = state;
  return (
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
  );
}

export function ReportReviewQueueMessagePreviewSection(state: DemoPageState) {
  const { parentTeacherReportReviewQueueMessagePreviewReport } = state;
  return (
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
  );
}
