"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";
import { compactStatus, formatInteger, formatPercent, learningSessionCompletionPracticeProgressRollupReportPath, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function TeacherContentPublishSection(state: DemoPageState) {
  const { teacherContentPublishReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BookOpen size={18} />
            Xuất bản thư viện nội dung giáo viên
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu mô phỏng về tài nguyên nội dung của giáo viên/quản trị
            viên, giao bài theo lớp, hiển thị trên lộ trình học và các dòng
            tổng hợp cho phụ huynh.
          </p>
        </div>
        {teacherContentPublishReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(
              teacherContentPublishReport.totals.learningPathPublishCount,
            )}{" "}
            lượt xuất bản lộ trình học
          </span>
        )}
      </div>

      {teacherContentPublishReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Người phụ trách và mục nội dung
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  teacherContentPublishReport.totals.teacherAdminCount,
                )}{" "}
                /{" "}
                {formatInteger(
                  teacherContentPublishReport.totals.contentItemCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                giáo viên/quản trị viên và mục nội dung
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tài nguyên
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  teacherContentPublishReport.totals.videoAssetCount,
                )}{" "}
                video /{" "}
                {formatInteger(
                  teacherContentPublishReport.totals.practiceAssetCount,
                )}{" "}
                luyện tập
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  teacherContentPublishReport.totals.lessonAssetCount,
                )}{" "}
                tài nguyên bài học
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Trạng thái xuất bản
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  teacherContentPublishReport.totals.publishedContentCount,
                )}{" "}
                đã xuất bản
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  teacherContentPublishReport.totals.draftContentCount,
                )}{" "}
                bản nháp,{" "}
                {formatInteger(
                  teacherContentPublishReport.totals.archivedContentCount,
                )}{" "}
                đã lưu trữ
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Khả năng hiển thị
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  teacherContentPublishReport.totals.studentVisibilityCount,
                )}{" "}
                học viên
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  teacherContentPublishReport.totals
                    .parentVisibleSummaryCount,
                )}{" "}
                bản tổng hợp cho phụ huynh
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Nội dung</th>
                    <th className="px-5 py-3">Người phụ trách</th>
                    <th className="px-5 py-3">Khóa học / bài học</th>
                    <th className="px-5 py-3">Tài nguyên</th>
                    <th className="px-5 py-3">Xuất bản</th>
                    <th className="px-5 py-3 text-right">
                      Lượt xuất bản lộ trình
                    </th>
                    <th className="px-5 py-3 text-right">
                      Khả năng hiển thị
                    </th>
                    <th className="px-5 py-3">Duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {teacherContentPublishReport.contentRows.map((row) => (
                    <tr key={row.contentItemId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.contentItemId}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        <p>{row.ownerName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.ownerRole)} / {row.ownerEmail}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.courseCode}
                        <p className="mt-1 text-xs text-slate-500">
                          {row.lessonCode}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.assetKind)}`}
                        >
                          {compactStatus(row.assetKind)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.publishStatus)}`}
                        >
                          {compactStatus(row.publishStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.learningPathPublishCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.studentVisibilityCount)}
                        <p className="mt-1 text-xs text-slate-500">
                          {formatInteger(row.parentVisibleSummaryCount)} phụ
                          huynh
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            row.needsTeacherReview
                              ? "bg-amber-50 text-amber-800 ring-amber-100"
                              : "bg-teal-50 text-teal-700 ring-teal-100"
                          }`}
                        >
                          {row.needsTeacherReview ? "Duyệt" : "Xóa bộ lọc"}
                        </span>
                        {row.blockedReason !== "NONE" && (
                          <p className="mt-2 text-xs text-slate-500">
                            {row.blockedReason}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3">Nội dung</th>
                    <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                    <th className="px-5 py-3">Lớp</th>
                    <th className="px-5 py-3">Khả năng hiển thị</th>
                    <th className="px-5 py-3">Học viên / phụ huynh</th>
                    <th className="px-5 py-3">Lý do bị chặn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {teacherContentPublishReport.studentVisibilityRows.map(
                    (row) => (
                      <tr key={row.visibilityId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.parentGuardianName}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.contentTitle}
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.assetKind)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.dailyPlanTitle}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.planDate} /{" "}
                            {compactStatus(row.dailyPlanStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.classCode}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.courseCode} / {row.lessonCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.visibilityStatus)}`}
                          >
                            {compactStatus(row.visibilityStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.studentVisible
                            ? "Hiển thị cho học viên"
                            : "Bị ẩn"}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.parentVisible
                              ? "Hiển thị cho phụ huynh"
                              : "Ẩn với phụ huynh"}{" "}
                            /{" "}
                            {row.availableOnDailyPlan
                              ? "kế hoạch hằng ngày"
                              : "không khả dụng"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.blockedReason}
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
                    <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                    <th className="px-5 py-3">Khóa học</th>
                    <th className="px-5 py-3 text-right">Hiển thị</th>
                    <th className="px-5 py-3 text-right">Bị chặn</th>
                    <th className="px-5 py-3 text-right">Duyệt</th>
                    <th className="px-5 py-3">Ngày tiếp theo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {teacherContentPublishReport.parentSummaryRows.map(
                    (row) => (
                      <tr
                        key={`${row.parentGuardianName}-${row.studentName}`}
                      >
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.parentGuardianName}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {row.summary}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.courseCodes.join(", ")}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.classCodes.join(", ")}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.parentVisibleItemCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.blockedItemCount)}
                        </td>
                        <td className="px-5 py-4 text-right align-top text-slate-700">
                          {formatInteger(row.itemsNeedingTeacherReviewCount)}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.nextAvailableDailyPlanDate ?? "-"}
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
          Minh chứng xuất bản nội dung giáo viên sẽ xuất hiện sau khi báo cáo
          mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}

export function LearningSessionPracticeRollupSection(state: DemoPageState) {
  const { learningSessionCompletionPracticeProgressRollupReport } = state;
  return (
    <section
      id="learning-session-completion-practice-progress-rollup"
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle2 size={18} />
            Tổng hợp hoàn thành phiên học, luyện tập và tiến độ
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Các phiên kế hoạch hằng ngày được cho phép được truy vết tới hoàn
            thành bài học, điểm luyện tập, tổng hợp tiến độ và bản tổng hợp
            phụ huynh/giáo viên.
          </p>
        </div>
        {learningSessionCompletionPracticeProgressRollupReport && (
          <span className="text-xs text-slate-500">
            GET {learningSessionCompletionPracticeProgressRollupReportPath}
          </span>
        )}
      </div>

      {learningSessionCompletionPracticeProgressRollupReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Bản tổng hợp
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .progressRollupCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .stableTraceCount,
                )}{" "}
                dấu vết ổn định
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Hoàn thành
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatPercent(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .averageCompletionPercent,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatPercent(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .averagePracticeScorePercent,
                )}{" "}
                điểm luyện tập trung bình
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Bản tổng hợp
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .parentVisibleProgressSummaryCount,
                )}
                /
                {formatInteger(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .teacherVisibleProgressSummaryCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                dòng hiển thị cho phụ huynh/giáo viên
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                An toàn
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .closedSafetyGateCount,
                )}
                /
                {formatInteger(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .safetyGateCount,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  learningSessionCompletionPracticeProgressRollupReport.totals
                    .openSafetyGateCount,
                )}{" "}
                cổng đang mở
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p>
              {
                learningSessionCompletionPracticeProgressRollupReport.endpointPath
              }
            </p>
            <p className="mt-1">
              {
                learningSessionCompletionPracticeProgressRollupReport.jsonExportPath
              }
            </p>
            <p className="mt-1">
              {
                learningSessionCompletionPracticeProgressRollupReport.markdownExportPath
              }
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1460px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Dữ liệu tổng hợp</th>
                    <th className="px-5 py-3">Học viên</th>
                    <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                    <th className="px-5 py-3">Bài học/video</th>
                    <th className="px-5 py-3">Luyện tập</th>
                    <th className="px-5 py-3">Tiến độ</th>
                    <th className="px-5 py-3">Hành động tiếp theo</th>
                    <th className="px-5 py-3">Truy vết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {learningSessionCompletionPracticeProgressRollupReport.progressRollupRows.map(
                    (row) => (
                      <tr key={row.progressRollupId}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-950">
                            {row.progressRollupId}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.rollupStatus)}`}
                          >
                            {compactStatus(row.rollupStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.studentName}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.childProfileId} / {row.courseCode}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.dailyPlanTitle}
                          <p className="mt-1 text-xs text-slate-500">
                            {row.learningSessionEvidenceId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.dailyPlanStatus)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.lessonCode}
                          <p className="mt-1 text-xs text-slate-500">
                            {compactStatus(row.videoEvidenceStatus)} /{" "}
                            {formatPercent(row.videoCompletionPercent)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.practiceAttemptStatus)}`}
                          >
                            {compactStatus(row.practiceAttemptStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatPercent(row.practiceScorePercent)} /{" "}
                            {row.practiceAttemptId}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.progressStatus)}`}
                          >
                            {compactStatus(row.progressStatus)}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatPercent(row.completionPercent)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700">
                          {row.nextSafeActionLabel}
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
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Tổng hợp cho phụ huynh</th>
                      <th className="px-5 py-3">Trẻ</th>
                      <th className="px-5 py-3">Tiến độ</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {learningSessionCompletionPracticeProgressRollupReport.parentSummaryRows.map(
                      (row) => (
                        <tr key={row.parentVisibleProgressSummaryId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.parentVisibleProgressSummaryId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.parentGuardianName} /{" "}
                              {row.parentGuardianEmail}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.courseCode} / {row.dailyPlanTitle}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.rollupStatus)}`}
                            >
                              {compactStatus(row.rollupStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatPercent(row.completionPercent)} /{" "}
                              {formatPercent(row.practiceScorePercent)}
                            </p>
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

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Tổng hợp cho giáo viên</th>
                      <th className="px-5 py-3">Học viên</th>
                      <th className="px-5 py-3">Minh chứng</th>
                      <th className="px-5 py-3">Hành động tiếp theo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {learningSessionCompletionPracticeProgressRollupReport.teacherSummaryRows.map(
                      (row) => (
                        <tr key={row.teacherVisibleProgressSummaryId}>
                          <td className="px-5 py-4 align-top">
                            <p className="font-medium text-slate-950">
                              {row.teacherVisibleProgressSummaryId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.teacherName} / {row.classCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top text-slate-700">
                            {row.studentName}
                            <p className="mt-1 text-xs text-slate-500">
                              {row.courseCode} / {row.lessonCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.rollupStatus)}`}
                            >
                              {compactStatus(row.rollupStatus)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatPercent(row.completionPercent)} /{" "}
                              {formatPercent(row.practiceScorePercent)}
                            </p>
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
          Minh chứng tổng hợp hoàn thành phiên học, luyện tập và tiến độ sẽ
          xuất hiện sau khi báo cáo mô phỏng tải xong.
        </div>
      )}
    </section>
  );
}
