"use client";

import { Award, MessageSquare } from "lucide-react";
import { compactStatus, formatInteger, formatPercent, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function StudentAchievementBadgeCertificateSection(state: DemoPageState) {
  const { studentAchievementBadgeCertificateReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Award size={18} />
            Huy hiệu và chứng nhận thành tích học viên
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu mô phỏng về thành tích, huy hiệu, bản xem trước chứng
            nhận, trạng thái cột mốc và tổng hợp ghi nhận.
          </p>
        </div>
        {studentAchievementBadgeCertificateReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(
              studentAchievementBadgeCertificateReport.totals.badgeAwards,
            )}{" "}
            huy hiệu đã trao
          </span>
        )}
      </div>

      {studentAchievementBadgeCertificateReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Thành tích
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals
                    .achievementRecords,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals
                    .milestonesCompleted,
                )}{" "}
                cột mốc đã hoàn thành
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Huy hiệu
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals.badgeAwards,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals
                    .studentsWithBadges,
                )}{" "}
                học viên có huy hiệu
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Chứng nhận
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals
                    .certificateFixtures,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals
                    .studentsNearCertificate,
                )}{" "}
                sắp nhận chứng nhận
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Ghi nhận
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals
                    .recognitionSummaries,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  studentAchievementBadgeCertificateReport.totals
                    .studentsNeedingEncouragement,
                )}{" "}
                cần động viên
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3">Tiến độ</th>
                    <th className="px-5 py-3 text-right">Thành tích</th>
                    <th className="px-5 py-3 text-right">Huy hiệu</th>
                    <th className="px-5 py-3 text-right">Cột mốc</th>
                    <th className="px-5 py-3">Chứng nhận</th>
                    <th className="px-5 py-3 text-right">Duyệt</th>
                    <th className="px-5 py-3">Ghi nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {studentAchievementBadgeCertificateReport.studentRows.map(
                    (row) => (
                      <tr key={row.studentId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.parentGuardianName}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.progressStatus)}`}
                          >
                            {compactStatus(row.progressStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatPercent(row.completionPercent)} /{" "}
                            {row.courseCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.achievementRecordCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.badgeAwardCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.completedMilestoneCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.pendingMilestoneCount)} Đang
                            chờ
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.certificateStatus)}`}
                          >
                            {compactStatus(row.certificateStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.nearCertificate
                              ? "Sắp nhận chứng nhận"
                              : row.teacherName}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.teacherReviewItemCount)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              row.needsEncouragement
                                ? "bg-amber-50 text-amber-800 ring-amber-100"
                                : "bg-teal-50 text-teal-700 ring-teal-100"
                            }`}
                          >
                            {row.needsEncouragement
                              ? "Cần khích lệ"
                              : "Sẵn sàng"}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Chứng nhận</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Huy hiệu</th>
                      <th className="px-5 py-3 text-right">Đang chờ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {studentAchievementBadgeCertificateReport.certificateRows.map(
                      (row) => (
                        <tr key={row.certificateFixtureId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.certificatePreviewRef}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                            >
                              {compactStatus(row.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.completedBadgeAwardCount)}
                          </td>
                          <td className="px-5 py-4 text-right align-top text-slate-700">
                            {formatInteger(row.pendingMilestoneCount)}
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
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Ghi nhận</th>
                      <th className="px-5 py-3">Đối tượng nhận</th>
                      <th className="px-5 py-3">Trạng thái</th>
                      <th className="px-5 py-3">Hỗ trợ AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {studentAchievementBadgeCertificateReport.recognitionRows.map(
                      (row) => (
                        <tr key={row.recognitionSummaryId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.studentName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.parentGuardianName} / {row.courseCode}
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
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                            >
                              {compactStatus(row.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.sourceAiTutorSupportRecommendationId ??
                              "n/a"}
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
          Minh chứng huy hiệu và chứng nhận thành tích học viên sẽ xuất hiện
          sau khi báo cáo mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}

export function AiTutorChatSafetyTeacherReviewSection(state: DemoPageState) {
  const { aiTutorChatSafetyTeacherReviewReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageSquare size={18} />
            Giáo viên duyệt an toàn trợ giảng AI
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu mô phỏng về phiên trò chuyện với trợ giảng, bộ lọc chủ đề,
            hàng đợi giáo viên duyệt, tổng hợp cho phụ huynh và các dòng hỗ
            trợ học tập.
          </p>
        </div>
        {aiTutorChatSafetyTeacherReviewReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(
              aiTutorChatSafetyTeacherReviewReport.totals.blockedMessageCount,
            )}{" "}
            tin nhắn bị chặn
          </span>
        )}
      </div>

      {aiTutorChatSafetyTeacherReviewReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Phiên trò chuyện
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals
                    .chatSessionCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals.messageCount,
                )}{" "}
                tin nhắn mô phỏng
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Quyết định bộ lọc
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals
                    .allowedMessageCount,
                )}{" "}
                được phép
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals
                    .blockedMessageCount,
                )}{" "}
                bị chặn
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Hàng đợi xét duyệt
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals
                    .teacherReviewItemCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals
                    .reviewedTeacherReviewItemCount,
                )}{" "}
                đã duyệt hoặc giải quyết
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Hỗ trợ
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals
                    .studentsNeedingSupportCount,
                )}{" "}
                học viên
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  aiTutorChatSafetyTeacherReviewReport.totals
                    .supportRecommendationCount,
                )}{" "}
                đề xuất
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Phiên</th>
                    <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Tin nhắn</th>
                    <th className="px-5 py-3 text-right">Bị chặn</th>
                    <th className="px-5 py-3 text-right">Duyệt</th>
                    <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {aiTutorChatSafetyTeacherReviewReport.chatSessionRows.map(
                    (row) => (
                      <tr key={row.chatSessionId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.courseCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.dailyPlanTitle}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.classCode} / {row.lessonCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.sessionStatus)}`}
                          >
                            {compactStatus(row.sessionStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.messageCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.allowedMessageCount)} được phép
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.blockedMessageCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.safetyFlagCount)} cờ cảnh báo
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.teacherReviewItemCount)}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatInteger(row.supportRecommendationCount)} hỗ
                            trợ
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              row.parentSummaryReady
                                ? "bg-teal-50 text-teal-700 ring-teal-100"
                                : "bg-amber-50 text-amber-800 ring-amber-100"
                            }`}
                          >
                            {row.parentSummaryReady ? "Sẵn sàng" : "Tạm giữ"}
                          </span>
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
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Đánh giá của giáo viên</th>
                    <th className="px-5 py-3">Chủ đề</th>
                    <th className="px-5 py-3">Mức độ</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Giáo viên</th>
                    <th className="px-5 py-3 text-right">Hỗ trợ</th>
                    <th className="px-5 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {aiTutorChatSafetyTeacherReviewReport.teacherReviewRows.map(
                    (row) => (
                      <tr key={row.teacherReviewItemId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.classCode} /{" "}
                            {row.lessonCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.topicCategory)}`}
                          >
                            {compactStatus(row.topicCategory)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.severity)}`}
                          >
                            {compactStatus(row.severity)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.reviewStatus)}`}
                          >
                            {compactStatus(row.reviewStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.parentSummaryReady
                              ? "Bản tổng hợp cho phụ huynh đã sẵn sàng"
                              : "Tạm giữ để xét duyệt"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.assignedTeacherName}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.dailyPlanTitle}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.supportRecommendationCount)}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.actionSummary}
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
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Dòng hỗ trợ</th>
                    <th className="px-5 py-3">Mức ưu tiên</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Đề xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {aiTutorChatSafetyTeacherReviewReport.supportRecommendationRows.map(
                    (row) => (
                      <tr key={row.supportRecommendationId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.courseCode} /{" "}
                            {row.classCode}
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
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.recommendation}
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
          Minh chứng giáo viên duyệt an toàn trợ giảng AI sẽ xuất hiện sau khi
          báo cáo mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}
