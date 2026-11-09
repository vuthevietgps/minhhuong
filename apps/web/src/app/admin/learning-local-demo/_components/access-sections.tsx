"use client";

import { ShieldCheck, Users, WalletCards } from "lucide-react";
import { formatMoney } from "../../_lib/admin-client";
import { compactStatus, formatInteger, formatPercent, statusBadgeClass, totalCommission } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function SubscriptionEntitlementDailyPlanAccessSection(state: DemoPageState) {
  const { subscriptionEntitlementDailyPlanAccessReport } = state;
  return (
    <section
      id="subscription-entitlement-daily-plan-access"
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck size={18} />
            Quyền lợi thuê bao và truy cập kế hoạch hằng ngày
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Cổng truy cập dữ liệu mô phỏng chỉ đọc, liên kết minh chứng ghi
            danh, thuê bao, thanh toán, hoàn tiền, lộ trình học và kế hoạch
            hằng ngày.
          </p>
        </div>
        {subscriptionEntitlementDailyPlanAccessReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(
              subscriptionEntitlementDailyPlanAccessReport.totals
                .dailyPlanAccessCaseCount,
            )}{" "}
            trường hợp truy cập /{" "}
            {formatInteger(
              subscriptionEntitlementDailyPlanAccessReport.totals
                .openSafetyGateCount,
            )}{" "}
            cổng đang mở
          </span>
        )}
      </div>

      {subscriptionEntitlementDailyPlanAccessReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Quyền lợi
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  subscriptionEntitlementDailyPlanAccessReport.totals
                    .entitlementCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  subscriptionEntitlementDailyPlanAccessReport.totals
                    .relationshipTraceCount,
                )}{" "}
                dấu vết ổn định
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Đã mở khóa
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  subscriptionEntitlementDailyPlanAccessReport.totals
                    .unlockedAccessCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Thuê bao mô phỏng đã thanh toán và đang hoạt động
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Bị chặn
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  subscriptionEntitlementDailyPlanAccessReport.totals
                    .blockedAccessCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  subscriptionEntitlementDailyPlanAccessReport.totals
                    .blockedAccessWithReasonCount,
                )}{" "}
                có lý do rõ ràng
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                An toàn
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  subscriptionEntitlementDailyPlanAccessReport.totals
                    .closedSafetyGateCount,
                )}
                /
                {formatInteger(
                  subscriptionEntitlementDailyPlanAccessReport.totals
                    .safetyGateCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Chưa sẵn sàng cho môi trường thật
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p>{subscriptionEntitlementDailyPlanAccessReport.endpointPath}</p>
            <p className="mt-1">
              {subscriptionEntitlementDailyPlanAccessReport.jsonExportPath}
            </p>
            <p className="mt-1">
              {
                subscriptionEntitlementDailyPlanAccessReport.markdownExportPath
              }
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học viên</th>
                    <th className="px-5 py-3">Khóa học</th>
                    <th className="px-5 py-3">Gói học</th>
                    <th className="px-5 py-3">Quyền lợi</th>
                    <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                    <th className="px-5 py-3">Truy cập</th>
                    <th className="px-5 py-3">Hành động tiếp theo</th>
                    <th className="px-5 py-3">Truy vết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {subscriptionEntitlementDailyPlanAccessReport.accessRows.map(
                    (row) => (
                      <tr key={row.relationshipKey}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.courseCode}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.courseTitle}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.subscriptionStatus)}`}
                          >
                            {compactStatus(row.subscriptionStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.subscriptionId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.paymentId} /{" "}
                            {compactStatus(row.paymentStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.entitlementStatus)}`}
                          >
                            {compactStatus(row.entitlementStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.entitlementId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.dailyPlanId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.learningPathId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.planDate} /{" "}
                            {compactStatus(row.dailyPlanStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.accessStatus)}`}
                          >
                            {compactStatus(row.accessStatus)}
                          </span>
                          {row.blockedReason && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {row.blockedReason}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.nextSafeActionLabel}
                        </td>
                        <td className="px-5 py-4 align-top text-xs text-slate-500">
                          {row.relationshipKey}
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
          Minh chứng truy cập quyền lợi thuê bao sẽ xuất hiện sau khi báo cáo
          mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}

export function ParentTeacherProgressAccessSummarySection(state: DemoPageState) {
  const { parentTeacherProgressAccessSummaryReport } = state;
  return (
    <section
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      id="parent-teacher-progress-access-summary"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users size={18} />
            Tổng hợp quyền xem tiến độ của phụ huynh và giáo viên
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Góc nhìn chỉ đọc dành cho người giám hộ và giáo viên/quản trị viên
            về quyền truy cập, lý do bị chặn, tiến độ, video và minh chứng
            luyện tập mô phỏng.
          </p>
        </div>
        {parentTeacherProgressAccessSummaryReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(
              parentTeacherProgressAccessSummaryReport.totals
                .parentSummaryCount,
            )}{" "}
            dòng phụ huynh /{" "}
            {formatInteger(
              parentTeacherProgressAccessSummaryReport.totals
                .teacherSummaryCount,
            )}{" "}
            dòng dữ liệu giáo viên
          </span>
        )}
      </div>

      {parentTeacherProgressAccessSummaryReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Người giám hộ
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .parentGuardianCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .parentSummaryWithTraceCount,
                )}{" "}
                bản tổng hợp có truy vết
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Giáo viên/quản trị viên
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .teacherCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .teacherSummaryWithTraceCount,
                )}{" "}
                bản tổng hợp có truy vết
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Quyền xem tiến độ
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .progressSummaryCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .unlockedAccessCount,
                )}{" "}
                đã mở khóa /{" "}
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .blockedAccessCount,
                )}{" "}
                bị chặn
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                An toàn
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .closedSafetyGateCount,
                )}
                /
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .safetyGateCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherProgressAccessSummaryReport.totals
                    .blockedAccessInSummariesWithReasonCount,
                )}{" "}
                dòng bị chặn có giải thích
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p>{parentTeacherProgressAccessSummaryReport.endpointPath}</p>
            <p className="mt-1">
              {parentTeacherProgressAccessSummaryReport.jsonExportPath}
            </p>
            <p className="mt-1">
              {parentTeacherProgressAccessSummaryReport.markdownExportPath}
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Phụ huynh</th>
                    <th className="px-5 py-3">Trẻ</th>
                    <th className="px-5 py-3">Khóa học</th>
                    <th className="px-5 py-3">Truy cập</th>
                    <th className="px-5 py-3">Tiến độ</th>
                    <th className="px-5 py-3">Lý do bị chặn</th>
                    <th className="px-5 py-3">Truy vết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {parentTeacherProgressAccessSummaryReport.parentSummaryRows.map(
                    (row) => (
                      <tr key={row.parentSummaryId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.parentGuardianName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.relationship)} /{" "}
                            {row.parentGuardianEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.studentName}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.courseCode}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.accessStatus)}`}
                          >
                            {compactStatus(row.accessStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {compactStatus(row.entitlementStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {compactStatus(row.progressStatus)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatPercent(row.completionPercent)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.blockedReason ?? row.nextSafeActionLabel}
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
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Giáo viên/quản trị viên</th>
                    <th className="px-5 py-3">Lớp</th>
                    <th className="px-5 py-3 text-right">Học viên</th>
                    <th className="px-5 py-3 text-right">Truy cập</th>
                    <th className="px-5 py-3 text-right">Tiến độ</th>
                    <th className="px-5 py-3 text-right">Phạm vi</th>
                    <th className="px-5 py-3">Truy vết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {parentTeacherProgressAccessSummaryReport.teacherSummaryRows.map(
                    (row) => (
                      <tr key={row.teacherSummaryId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.teacherName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.teacherRole)} /{" "}
                            {row.teacherEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.classCode}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.courseCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.studentCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.unlockedAccessCount)} đã mở khóa
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.blockedAccessCount)} bị chặn /{" "}
                            {formatInteger(row.blockedReasonCount)} lý do
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatPercent(row.averageCompletionPercent)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.evidenceCoverageCount)}
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
          Minh chứng tổng hợp quyền xem tiến độ của phụ huynh và giáo viên sẽ
          xuất hiện sau khi báo cáo mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}

export function StudentCourseFlowSection(state: DemoPageState) {
  const {
    enrollmentReport,
    isLoading,
    learnerByEnrollmentId,
    studentCourseFlowReport,
  } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <WalletCards size={18} />
            Ghi danh, thuê bao, thanh toán, hoàn tiền, hoa hồng
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Luồng tiền học viên mô phỏng được liên kết với tiến độ lớp theo mã
            ghi danh.
          </p>
        </div>
        {enrollmentReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(enrollmentReport.totals.subscriptionCount)} thuê
            bao / {formatInteger(enrollmentReport.totals.paymentCount)} thanh
            toán / {formatInteger(enrollmentReport.totals.refundCount)} hoàn
            tiền
          </span>
        )}
      </div>

      {studentCourseFlowReport ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Minh chứng luồng
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatInteger(
                    studentCourseFlowReport.totals.relationshipTraceCount,
                  )}{" "}
                  dấu vết
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(studentCourseFlowReport.currentStatus.status)}`}
              >
                {compactStatus(studentCourseFlowReport.currentStatus.status)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {studentCourseFlowReport.currentStatus.summary}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Thanh toán
                </dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {formatInteger(
                    studentCourseFlowReport.totals
                      .fixturePaymentEvidenceCount,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Hoàn tiền
                </dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {formatInteger(
                    studentCourseFlowReport.totals.refundEvidenceCount,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Hoa hồng
                </dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {formatInteger(
                    studentCourseFlowReport.totals.commissionEvidenceCount,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  An toàn
                </dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {formatInteger(
                    studentCourseFlowReport.totals.closedSafetyGateCount,
                  )}
                  /
                  {formatInteger(
                    studentCourseFlowReport.totals.safetyGateCount,
                  )}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              {studentCourseFlowReport.endpointPath}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {studentCourseFlowReport.jsonExportPath}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {studentCourseFlowReport.markdownExportPath}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Minh chứng</th>
                    <th className="px-5 py-3 text-right">Số lượng</th>
                    <th className="px-5 py-3">Mã dữ liệu mô phỏng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {studentCourseFlowReport.evidenceRows.map((row) => (
                    <tr key={row.evidenceKind}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {compactStatus(row.evidenceKind)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.evidenceSummary}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                        {formatInteger(row.evidenceCount)}
                      </td>
                      <td className="px-5 py-4 align-top text-xs text-slate-500">
                        {row.stableFixtureIds.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Minh chứng luồng học viên - khóa học - ghi danh - thuê bao sẽ xuất
          hiện sau khi báo cáo mô phỏng tải xong.
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Học viên</th>
                <th className="px-5 py-3">Ghi danh</th>
                <th className="px-5 py-3">Gói học</th>
                <th className="px-5 py-3">Thanh toán</th>
                <th className="px-5 py-3 text-right">Doanh thu thuần</th>
                <th className="px-5 py-3 text-right">Hoa hồng</th>
                <th className="px-5 py-3">Tiến độ</th>
                <th className="px-5 py-3 text-right">Điểm danh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {enrollmentReport?.rows.map((row) => {
                const learner = learnerByEnrollmentId.get(row.enrollmentId);

                return (
                  <tr key={row.enrollmentId}>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-slate-950">
                        {row.studentName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.childProfileId} / {row.courseCode}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {row.courseTitle}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.enrollmentStatus)}`}
                      >
                        {compactStatus(row.enrollmentStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.subscriptionStatus)}`}
                      >
                        {compactStatus(row.subscriptionStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.paymentStatus)}`}
                      >
                        {compactStatus(row.paymentStatus)}
                      </span>
                      {row.refundStatus !== "NONE" && (
                        <p className="mt-2 text-xs text-rose-700">
                          Hoàn tiền {compactStatus(row.refundStatus)}
                        </p>
                      )}
                      {row.pendingPaymentCents > 0 && (
                        <p className="mt-2 text-xs text-sky-700">
                          Đang chờ{" "}
                          {formatMoney(row.pendingPaymentCents, "VND")}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                      {formatMoney(row.netRevenueCents, "VND")}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {formatMoney(totalCommission(row), "VND")}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {learner ? (
                        <>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(learner.progressStatus)}`}
                          >
                            {compactStatus(learner.progressStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {learner.completedLessonCount}/
                            {learner.totalLessonCount} bài học /{" "}
                            {formatPercent(learner.completionPercent)}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Không có dòng tiến độ
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-slate-700">
                      {learner ? (
                        <>
                          <p className="font-medium text-slate-950">
                            {formatPercent(learner.attendanceRatePercent)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            P{learner.presentAttendanceCount} / L
                            {learner.lateAttendanceCount} / A
                            {learner.absentAttendanceCount} / E
                            {learner.excusedAttendanceCount}
                          </p>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
              {!enrollmentReport && (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-sm text-slate-500"
                    colSpan={8}
                  >
                    {isLoading
                      ? "Đang tải báo cáo giả lập..."
                      : "Chưa có báo cáo ghi danh."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
