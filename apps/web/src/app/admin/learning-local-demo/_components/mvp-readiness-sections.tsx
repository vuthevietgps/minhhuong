"use client";

import { ClipboardList, ShieldCheck, Users } from "lucide-react";
import { compactStatus, formatInteger, formatPercent, mvpEndToEndReadinessTraceReportPath, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function MvpReadinessOverviewSection(state: DemoPageState) {
  const { mvpReadinessOverviewReport } = state;
  return (
    <section
      id="mvp-readiness-overview"
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck size={18} />
            Tổng quan mức độ sẵn sàng của MVP
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Bản tổng hợp dữ liệu mô phỏng đã được chấp nhận về ghi danh, gói
            thuê bao, hoàn tiền, hoa hồng, kế hoạch hằng ngày, bài học, hoàn
            thành phiên, tiến độ, trợ giảng AI, thành tích, bản tin và kết
            quả.
          </p>
        </div>
        {mvpReadinessOverviewReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(mvpReadinessOverviewReport.totals.sliceCount)} dòng
            đánh giá sẵn sàng
          </span>
        )}
      </div>

      {mvpReadinessOverviewReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mức độ sẵn sàng
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatPercent(
                  mvpReadinessOverviewReport.totals.readinessScorePercent,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpReadinessOverviewReport.totals.localDemoReadySliceCount,
                )}
                /{formatInteger(mvpReadinessOverviewReport.totals.sliceCount)}{" "}
                demo cục bộ đã sẵn sàng
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Minh chứng
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpReadinessOverviewReport.totals.evidenceEndpointCount,
                )}{" "}
                điểm cuối API
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpReadinessOverviewReport.totals.jsonExportCount,
                )}{" "}
                JSON /{" "}
                {formatInteger(
                  mvpReadinessOverviewReport.totals.markdownExportCount,
                )}{" "}
                Markdown
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Cổng an toàn
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpReadinessOverviewReport.totals.closedSafetyGateCount,
                )}
                /
                {formatInteger(
                  mvpReadinessOverviewReport.totals.safetyGateCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpReadinessOverviewReport.totals.openSafetyGateCount,
                )}{" "}
                đang mở, chưa sẵn sàng cho môi trường thật
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Phạm vi học tập
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpReadinessOverviewReport.totals.studentCount,
                )}{" "}
                học viên
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpReadinessOverviewReport.totals.followUpOutcomeCount,
                )}{" "}
                kết quả theo dõi
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Hạng mục</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Chính</th>
                    <th className="px-5 py-3 text-right">Phụ</th>
                    <th className="px-5 py-3 text-right">Phạm vi</th>
                    <th className="px-5 py-3">Điểm cuối API</th>
                    <th className="px-5 py-3">Minh chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {mvpReadinessOverviewReport.rows.map((row) => (
                    <tr key={row.sliceKey}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.sliceName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.sliceKey)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.readinessStatus)}`}
                        >
                          {compactStatus(row.readinessStatus)}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">
                          Chỉ dùng cho demo cục bộ
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.primaryMetricValue)}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.primaryMetricLabel}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.secondaryMetricValue)}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.secondaryMetricLabel}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.coverageValue)}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.coverageLabel}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-xs text-slate-600">
                        {row.sourceEndpointPath}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600">
                        <p>{row.evidenceSummary}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {row.riskNote}
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
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
          Đang tải minh chứng mô phỏng về mức độ sẵn sàng của MVP.
        </div>
      )}
    </section>
  );
}

export function MvpRoleJourneyEntrypointsSection(state: DemoPageState) {
  const { mvpRoleJourneyEntrypointsReport } = state;
  return (
    <section
      id="mvp-role-journey-entrypoints"
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users size={18} />
            Điểm truy cập hành trình theo vai trò của MVP
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Các điểm truy cập của học viên, phụ huynh, giáo viên và quản
            trị/vận hành cho lộ trình Minh/khóa A1 đã được chấp nhận.
          </p>
        </div>
        {mvpRoleJourneyEntrypointsReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(
              mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount,
            )}{" "}
            dòng vai trò
          </span>
        )}
      </div>

      {mvpRoleJourneyEntrypointsReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Điểm truy cập theo vai trò
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals.roleEntrypointCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Học viên, phụ huynh, giáo viên, quản trị/vận hành
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Dấu vết ổn định
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals
                    .stableRoleJourneyTraceCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals
                    .sameStudentCoursePathCount,
                )}{" "}
                dòng vai trò cùng lộ trình
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Minh chứng liên kết
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals
                    .linkedMvpReadinessTraceCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals
                    .linkedParentReadReceiptCount,
                )}{" "}
                liên kết biên nhận đã đọc
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Cổng an toàn
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals
                    .closedSafetyGateCount,
                )}
                /
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals.safetyGateCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpRoleJourneyEntrypointsReport.totals.openSafetyGateCount,
                )}{" "}
                đang mở, chưa sẵn sàng cho môi trường thật
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1240px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Vai trò</th>
                    <th className="px-5 py-3">Đường dẫn</th>
                    <th className="px-5 py-3">Hành động</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Minh chứng liên kết</th>
                    <th className="px-5 py-3">Tổng hợp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {mvpRoleJourneyEntrypointsReport.entrypointRows.map(
                    (row) => (
                      <tr key={row.roleEntrypointId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.roleLabel}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.role)} / {row.ownerLabel}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-xs text-slate-600">
                          <p>{row.routePath}</p>
                          <p className="mt-2 text-slate-500">
                            {row.dashboardAnchor}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-600">
                          <p>{row.actionLabel}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.reasonLabel}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.statusLabel)}`}
                          >
                            {compactStatus(row.statusLabel)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-xs text-slate-600">
                          <p>{row.mvpReadinessTraceId}</p>
                          <p className="mt-1">
                            {row.parentReadReceiptEvidenceId}
                          </p>
                          <p className="mt-1">
                            {row.teacherEscalationResolutionId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-600">
                          {row.evidenceSummary}
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
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
          Đang tải minh chứng mô phỏng về hành trình theo vai trò của MVP.
        </div>
      )}
    </section>
  );
}

export function MvpEndToEndReadinessTraceSection(state: DemoPageState) {
  const { mvpEndToEndReadinessTraceReport } = state;
  return (
    <section
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      id="mvp-end-to-end-readiness-trace"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardList size={18} />
            Dấu vết mức độ sẵn sàng đầu-cuối của MVP
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Dấu vết mô phỏng liên kết minh chứng ghi danh, thuê bao, quyền
            lợi, tiến độ luyện tập, riêng tư báo cáo, biên nhận đã đọc, thời
            gian màn hình, can thiệp của giáo viên, leo thang khắc phục và kết
            quả xử lý.
          </p>
        </div>
        {mvpEndToEndReadinessTraceReport && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            GET {mvpEndToEndReadinessTraceReportPath}
          </span>
        )}
      </div>

      {mvpEndToEndReadinessTraceReport ? (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Dấu vết ổn định
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .stableEndToEndTraceCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .sameStudentCoursePathCount,
                )}{" "}
                cùng lộ trình /{" "}
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .alignedApprovedDeliveryStudentCoursePathCount,
                )}{" "}
                biên nhận đã đọc khớp
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Dòng minh chứng
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals.evidenceRowCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .deterministicStatusReasonActionOwnerCount,
                )}{" "}
                trạng thái/lý do/thao tác/người phụ trách
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Phạm vi hạng mục
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .escalationResolutionEvidenceCount,
                )}{" "}
                đã giải quyết
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .teacherInterventionEvidenceCount,
                )}{" "}
                can thiệp /{" "}
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .remedialRetryOrEscalationEvidenceCount,
                )}{" "}
                leo thang
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                An toàn
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals
                    .closedSafetyGateCount,
                )}
                /
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals.safetyGateCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  mvpEndToEndReadinessTraceReport.totals.openSafetyGateCount,
                )}{" "}
                cổng đang mở, chưa sẵn sàng cho môi trường thật
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p>{mvpEndToEndReadinessTraceReport.endpointPath}</p>
            <p className="mt-1">
              {mvpEndToEndReadinessTraceReport.dashboardEvidencePath}
            </p>
            <p className="mt-1">
              {mvpEndToEndReadinessTraceReport.jsonExportPath}
            </p>
            <p className="mt-1">
              {mvpEndToEndReadinessTraceReport.markdownExportPath}
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1520px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Truy vết</th>
                    <th className="px-5 py-3">Lộ trình học viên</th>
                    <th className="px-5 py-3">Truy cập</th>
                    <th className="px-5 py-3">Báo cáo</th>
                    <th className="px-5 py-3">Bộ kiểm soát an toàn</th>
                    <th className="px-5 py-3">Hỗ trợ</th>
                    <th className="px-5 py-3">Kết quả xử lý</th>
                    <th className="px-5 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {mvpEndToEndReadinessTraceReport.traceRows.map((row) => (
                    <tr key={row.traceId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.traceId}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.traceStatus)}`}
                        >
                          {compactStatus(row.traceStatus)}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">
                          {formatInteger(row.stableEndToEndTraceIds.length)}{" "}
                          mã ổn định
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.studentName} / {row.courseCode}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.enrollmentId} / {row.subscriptionId}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.paymentId}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.entitlementId}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.dailyPlanId}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.entitlementAccessStatus)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.parentTeacherReportSummaryId}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.parentTeacherPermissionCaseId}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.approvedDeliveryOrReadReceiptId}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.screenTimeGuardEvidenceId}
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.screenTimeAccessResult)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.teacherInterventionReviewId}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.supportPlanId} / {row.remedialAssignmentId}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.remedialRetryOrEscalationId}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.escalationResolutionId}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.resolvedSupportOutcomeId}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.resolutionStatus)}`}
                        >
                          {compactStatus(row.resolutionStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.actionLabel}
                        <p className="mt-2 text-xs text-slate-500">
                          {row.reasonLabel}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Chủ tài khoản: {row.ownerLabel}
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
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Loại minh chứng</th>
                    <th className="px-5 py-3 text-right">Số lượng</th>
                    <th className="px-5 py-3">Mã dữ liệu mô phỏng</th>
                    <th className="px-5 py-3">Tổng hợp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {mvpEndToEndReadinessTraceReport.evidenceRows.map((row) => (
                    <tr key={row.evidenceKind}>
                      <td className="px-5 py-4 align-top font-medium text-slate-950">
                        {compactStatus(row.evidenceKind)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.evidenceCount)}
                      </td>
                      <td className="px-5 py-4 align-top text-xs text-slate-500">
                        {row.stableFixtureIds.slice(0, 3).join(", ")}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.evidenceSummary}
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
          Dấu vết mức độ sẵn sàng đầu-cuối của MVP sẽ xuất hiện sau khi báo
          cáo mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}
