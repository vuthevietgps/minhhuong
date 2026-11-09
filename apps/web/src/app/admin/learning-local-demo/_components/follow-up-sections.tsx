"use client";

import { CheckCircle2, MessageSquare } from "lucide-react";
import { compactStatus, formatDateTime, formatInteger, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function FollowUpActionOutcomeSection(state: DemoPageState) {
  const { followUpActionOutcomeReport } = state;
  return (
    <section
      id="student-course-enrollment-subscription-flow"
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle2 size={18} />
            Kết quả thao tác theo dõi
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kết quả mô phỏng cho các thao tác bản tin tuần, liên kết với kế
            hoạch hằng ngày, đề xuất hỗ trợ, thành tích, tổng hợp cho phụ
            huynh và đánh giá của giáo viên.
          </p>
        </div>
        {followUpActionOutcomeReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(followUpActionOutcomeReport.totals.outcomeCount)}{" "}
            dòng kết quả
          </span>
        )}
      </div>

      {followUpActionOutcomeReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Đã hoàn tất hoặc xác minh
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  followUpActionOutcomeReport.totals.completedOutcomeCount +
                    followUpActionOutcomeReport.totals.verifiedOutcomeCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  followUpActionOutcomeReport.totals.positiveOutcomeCount,
                )}{" "}
                kết quả tích cực
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Theo dõi đang mở
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  followUpActionOutcomeReport.totals.scheduledOutcomeCount +
                    followUpActionOutcomeReport.totals.monitoringOutcomeCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  followUpActionOutcomeReport.totals.studentsWithOpenOutcome,
                )}{" "}
                học viên đang mở
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Minh chứng liên kết
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  followUpActionOutcomeReport.totals.linkedDailyPlanCount,
                )}{" "}
                kế hoạch
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  followUpActionOutcomeReport.totals
                    .linkedSupportRecommendationCount,
                )}{" "}
                dòng hỗ trợ
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tạm giữ
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  followUpActionOutcomeReport.totals.heldOutcomeCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  followUpActionOutcomeReport.totals.noSendOutcomeCount,
                )}{" "}
                kết quả không gửi
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3 text-right">Kết quả</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Cần hỗ trợ</th>
                    <th className="px-5 py-3">Lần xét duyệt tiếp theo</th>
                    <th className="px-5 py-3">Tổng hợp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {followUpActionOutcomeReport.studentRows.map((row) => (
                    <tr key={row.studentId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.childProfileId} / {row.parentGuardianName}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.outcomeCount)}
                        <p className="mt-1 text-xs text-slate-500">
                          {formatInteger(row.completedOrVerifiedCount)} đã
                          xong
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            row.heldOutcomeCount > 0
                              ? statusBadgeClass("HELD")
                              : row.needsSupportOutcomeCount > 0
                                ? statusBadgeClass("NEEDS_SUPPORT")
                                : statusBadgeClass("POSITIVE")
                          }`}
                        >
                          {row.heldOutcomeCount > 0
                            ? "Tạm giữ"
                            : row.needsSupportOutcomeCount > 0
                              ? "Cần hỗ trợ"
                              : "Tích cực"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.needsSupportOutcomeCount)}
                        <p className="mt-1 text-xs text-slate-500">
                          {formatInteger(row.parentVisibleOutcomeCount)} hiển
                          thị
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.nextReviewAt
                          ? formatDateTime(row.nextReviewAt)
                          : "n/a"}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600">
                        {row.outcomeSummary}
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
                    <th className="px-5 py-3">Kết quả</th>
                    <th className="px-5 py-3">Hành động</th>
                    <th className="px-5 py-3">Trạng thái kết quả</th>
                    <th className="px-5 py-3">Tác động</th>
                    <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                    <th className="px-5 py-3">Hỗ trợ</th>
                    <th className="px-5 py-3">Duyệt</th>
                    <th className="px-5 py-3">Minh chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {followUpActionOutcomeReport.outcomeRows.map((row) => (
                    <tr key={row.outcomeId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.outcomeId}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {compactStatus(row.actionOwner)} /{" "}
                        {compactStatus(row.actionPriority)}
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.actionStatus)} thao tác
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.outcomeStatus)}`}
                        >
                          {compactStatus(row.outcomeStatus)}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">
                          {row.parentVisible
                            ? "Hiển thị cho phụ huynh"
                            : "Chỉ giáo viên"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.impactBand)}`}
                        >
                          {compactStatus(row.impactBand)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.dailyPlanTitle ?? "n/a"}
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.dailyPlanStatus)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.supportRecommendationId ?? "n/a"}
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.supportStatus)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {compactStatus(row.teacherReviewStatus)}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.parentSummaryReady
                            ? "Bản tổng hợp cho phụ huynh đã sẵn sàng"
                            : "Không gửi bản tổng hợp cho phụ huynh"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600">
                        <p>{row.evidenceSummary}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.outcomeSummary}
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
          Minh chứng kết quả thao tác theo dõi sẽ xuất hiện sau khi báo cáo mô
          phỏng tải xong.
        </div>
      )}
    </section>
  );
}

export function ParentTeacherWeeklyDigestSection(state: DemoPageState) {
  const { parentTeacherWeeklyDigestReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageSquare size={18} />
            Bản tin tuần dành cho phụ huynh và giáo viên
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Các dòng bản tin tuần mô phỏng dành cho phụ huynh và giáo viên,
            kèm minh chứng tổng hợp về tiến độ, cảnh báo, thành tích, ghi nhận
            và thao tác.
          </p>
        </div>
        {parentTeacherWeeklyDigestReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(
              parentTeacherWeeklyDigestReport.totals.digestCount,
            )}{" "}
            bản tin tuần
          </span>
        )}
      </div>

      {parentTeacherWeeklyDigestReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Sẵn sàng
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals
                    .readyToSendDigestCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals
                    .studentsReadyForParentSend,
                )}{" "}
                học viên đã sẵn sàng
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Đánh giá của giáo viên
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals
                    .teacherReviewDigestCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals
                    .studentsNeedingTeacherReview,
                )}{" "}
                học viên cần xem xét
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Thao tác
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals.actionCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals
                    .highPriorityActionCount,
                )}{" "}
                ưu tiên cao
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tạm giữ
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals
                    .heldWithdrawnDigestCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  parentTeacherWeeklyDigestReport.totals
                    .teacherOnlyDigestCount,
                )}{" "}
                bản tin chỉ dành cho giáo viên
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3 text-right">Bản tin</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                    <th className="px-5 py-3">Hành động tiếp theo</th>
                    <th className="px-5 py-3">Tổng hợp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {parentTeacherWeeklyDigestReport.studentRows.map((row) => (
                    <tr key={row.studentId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.childProfileId} / {row.parentGuardianName}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.parentDigestCount)}
                        <p className="mt-1 text-xs text-slate-500">
                          {formatInteger(row.teacherDigestCount)} giáo viên
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            row.heldWithdrawnDigestCount > 0
                              ? statusBadgeClass("HELD_WITHDRAWN")
                              : row.teacherReviewDigestCount > 0
                                ? statusBadgeClass("TEACHER_REVIEW")
                                : statusBadgeClass("READY_TO_SEND")
                          }`}
                        >
                          {row.heldWithdrawnDigestCount > 0
                            ? "Tạm giữ"
                            : row.teacherReviewDigestCount > 0
                              ? "Đánh giá của giáo viên"
                              : "Sẵn sàng"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.actionCount)}
                        <p className="mt-1 text-xs text-slate-500">
                          {formatInteger(row.highPriorityActionCount)} cao
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.nextActionDueAt
                          ? formatDateTime(row.nextActionDueAt)
                          : "n/a"}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600">
                        {row.weeklySummary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Bản tin</th>
                      <th className="px-5 py-3">Đối tượng nhận</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Minh chứng</th>
                      <th className="px-5 py-3">Điểm nổi bật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherWeeklyDigestReport.digestRows.map((row) => (
                      <tr key={row.digestId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.weekStart} đến {row.weekEnd}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {compactStatus(row.audience)}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.parentVisible
                              ? "Hiển thị cho phụ huynh"
                              : "Chỉ giáo viên"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.deliveryStatus)}`}
                          >
                            {compactStatus(row.deliveryStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.alertCount)} cảnh báo
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.actionCount)} thao tác
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-600">
                          <p>{row.highlight}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.riskSummary}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Hành động</th>
                      <th className="px-5 py-3">Người phụ trách</th>
                      <th className="px-5 py-3">Mức ưu tiên</th>
                      <th className="px-5 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parentTeacherWeeklyDigestReport.actionRows.map((row) => (
                      <tr key={row.actionId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.actionSummary}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {compactStatus(row.owner)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(row.dueAt)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.priority)}`}
                          >
                            {compactStatus(row.priority)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                          >
                            {compactStatus(row.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Minh chứng bản tin tuần dành cho phụ huynh và giáo viên sẽ xuất hiện
          sau khi báo cáo mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}
