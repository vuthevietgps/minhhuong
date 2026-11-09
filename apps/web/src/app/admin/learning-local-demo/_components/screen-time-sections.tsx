"use client";

import { Clock3, ShieldCheck } from "lucide-react";
import { compactStatus, formatDateTime, formatInteger, parentScreenTimeGrantDailyPlanGuardReportPath, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function ParentScreenTimeControlsSection(state: DemoPageState) {
  const { parentScreenTimeReport } = state;
  return (
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
  );
}

export function ParentScreenTimeGrantGuardSection(state: DemoPageState) {
  const { parentScreenTimeGrantDailyPlanGuardReport } = state;
  return (
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
  );
}
