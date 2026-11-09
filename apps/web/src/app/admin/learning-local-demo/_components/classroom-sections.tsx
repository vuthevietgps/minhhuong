"use client";

import { BarChart3, CheckCircle2, ClipboardList } from "lucide-react";
import { compactStatus, formatDateTime, formatInteger, formatPercent, statusBadgeClass } from "./shared";
import type { DemoPageState } from "./demo-page-state";

export function ClassSessionProgressSection(state: DemoPageState) {
  const { progressReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardList size={18} />
            Lớp, buổi học, điểm danh, tiến độ
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Bản tổng hợp nhóm từ dữ liệu mô phỏng lớp - buổi học - điểm danh -
            tiến độ.
          </p>
        </div>
        {progressReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(progressReport.totals.completedSessionCount)} đã
            hoàn thành /{" "}
            {formatInteger(progressReport.totals.scheduledSessionCount)} buổi
            đã lên lịch
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {progressReport?.classAggregates.map((row) => (
          <article
            className="rounded-2xl border border-slate-200 p-5"
            key={row.classCode}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {row.classTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {row.classCode} / {row.courseCode} / {row.teacherName}
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
              >
                {compactStatus(row.status)}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Học viên
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatInteger(row.studentCount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Buổi học
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatInteger(row.completedSessionCount)}/
                  {formatInteger(row.sessionCount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Điểm danh
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatPercent(row.attendanceRatePercent)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Hoàn thành
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatPercent(row.averageLearnerCompletionPercent)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Có mặt {formatInteger(row.presentAttendanceCount)}, đi muộn{" "}
              {formatInteger(row.lateAttendanceCount)}, vắng{" "}
              {formatInteger(row.absentAttendanceCount)}, có phép{" "}
              {formatInteger(row.excusedAttendanceCount)}. Cần hỗ trợ{" "}
              {formatInteger(row.needsSupportCount)}.
            </p>
          </article>
        ))}
        {!progressReport && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            Bản tổng hợp lớp sẽ xuất hiện sau khi báo cáo mô phỏng tải xong.
          </div>
        )}
      </div>
    </section>
  );
}

export function LessonAssignmentAssessmentSection(state: DemoPageState) {
  const { assessmentReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle2 size={18} />
            Tiến độ bài học, bài tập và đánh giá
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Minh chứng mô phỏng chỉ đọc về bài kiểm tra, bài tập, lượt nộp,
            điểm số, phản hồi và nhóm năng lực học viên.
          </p>
        </div>
        {assessmentReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(assessmentReport.totals.completedSubmissionCount)}{" "}
            đã hoàn thành /{" "}
            {formatInteger(assessmentReport.totals.expectedSubmissionCount)}{" "}
            lượt nộp dự kiến
          </span>
        )}
      </div>

      {assessmentReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Bài học và mục nội dung
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(assessmentReport.totals.lessonCount)} bài học /{" "}
                {formatInteger(assessmentReport.totals.assignmentCount)} mục
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(assessmentReport.totals.quizCount)} bài kiểm
                tra,{" "}
                {formatInteger(assessmentReport.totals.assignmentTaskCount)}{" "}
                bài tập được giao
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Trạng thái nộp bài
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatPercent(
                  assessmentReport.totals.overallAssignmentCompletionPercent,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Chưa nộp{" "}
                {formatInteger(
                  assessmentReport.totals.missingSubmissionCount,
                )}
                , đi muộn{" "}
                {formatInteger(assessmentReport.totals.lateSubmissionCount)},
                đã nộp lại{" "}
                {formatInteger(
                  assessmentReport.totals.resubmittedSubmissionCount,
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Điểm số và phản hồi
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatPercent(assessmentReport.totals.averageScorePercent)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(assessmentReport.totals.scoredSubmissionCount)}{" "}
                đã chấm,{" "}
                {formatInteger(assessmentReport.totals.pendingFeedbackCount)}{" "}
                đang chờ phản hồi
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học viên</th>
                    <th className="px-5 py-3">Lớp</th>
                    <th className="px-5 py-3">Nhóm năng lực</th>
                    <th className="px-5 py-3 text-right">Đã nộp</th>
                    <th className="px-5 py-3 text-right">Muộn</th>
                    <th className="px-5 py-3 text-right">Chưa nộp</th>
                    <th className="px-5 py-3 text-right">Điểm trung bình</th>
                    <th className="px-5 py-3 text-right">Tiến độ bài tập</th>
                    <th className="px-5 py-3 text-right">Tiến độ bài học</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {assessmentReport.learnerRows.map((row) => (
                    <tr key={row.enrollmentId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {compactStatus(row.progressStatus)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.classCode}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.assessmentBand)}`}
                        >
                          {compactStatus(row.assessmentBand)}
                        </span>
                        {row.feedbackPendingCount > 0 && (
                          <p className="mt-2 text-xs text-amber-700">
                            {formatInteger(row.feedbackPendingCount)} đang chờ
                            phản hồi
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(
                          row.submittedSubmissionCount +
                            row.resubmittedSubmissionCount,
                        )}
                        /{formatInteger(row.expectedAssignmentCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.lateSubmissionCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.missingSubmissionCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                        {formatPercent(row.averageScorePercent)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatPercent(row.assignmentCompletionPercent)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatPercent(row.progressCompletionPercent)}
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
                    <th className="px-5 py-3">Mục đánh giá</th>
                    <th className="px-5 py-3">Bài học</th>
                    <th className="px-5 py-3">Loại</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Dự kiến</th>
                    <th className="px-5 py-3 text-right">Chưa nộp</th>
                    <th className="px-5 py-3 text-right">Muộn</th>
                    <th className="px-5 py-3 text-right">Đã nộp lại</th>
                    <th className="px-5 py-3 text-right">Điểm trung bình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {assessmentReport.assignmentRows.map((row) => (
                    <tr key={row.assignmentId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.classCode}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.lessonCode}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.kind)}`}
                        >
                          {compactStatus(row.kind)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                        >
                          {compactStatus(row.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.expectedSubmissionCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.missingSubmissionCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.lateSubmissionCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.resubmittedSubmissionCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                        {formatPercent(row.averageScorePercent)}
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
          Bản tổng hợp đánh giá sẽ xuất hiện sau khi báo cáo mô phỏng tải
          xong.
        </div>
      )}
    </section>
  );
}

export function LearningPathEvidenceSection(state: DemoPageState) {
  const { learningPathReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardList size={18} />
            Lộ trình học, kế hoạch hằng ngày, video và luyện tập
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Minh chứng dành cho phụ huynh và giáo viên về việc lượt xem video
            và luyện tập hằng ngày được tổng hợp vào tiến độ học viên.
          </p>
        </div>
        {learningPathReport && (
          <span className="text-xs text-slate-500">
            {formatInteger(learningPathReport.totals.completedDailyPlanCount)}{" "}
            đã hoàn thành /{" "}
            {formatInteger(learningPathReport.totals.dailyPlanCount)} kế hoạch
            hằng ngày
          </span>
        )}
      </div>

      {learningPathReport ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Lộ trình học
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(learningPathReport.totals.learningPathCount)}{" "}
                lộ trình /{" "}
                {formatInteger(learningPathReport.totals.dailyPlanCount)} kế
                hoạch
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(learningPathReport.totals.onTrackLearnerCount)}{" "}
                đúng tiến độ,{" "}
                {formatInteger(
                  learningPathReport.totals.needsSupportLearnerCount,
                )}{" "}
                cần hỗ trợ
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Minh chứng video
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatInteger(learningPathReport.totals.completedVideoCount)}
                /{formatInteger(learningPathReport.totals.videoEvidenceCount)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(
                  learningPathReport.totals.incompleteVideoCount,
                )}{" "}
                chưa hoàn thành,{" "}
                {formatInteger(learningPathReport.totals.skippedVideoCount)}{" "}
                đã bỏ qua
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Lượt luyện tập
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatPercent(
                  learningPathReport.totals.averagePracticeScorePercent,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatInteger(learningPathReport.totals.passedPracticeCount)}{" "}
                đã đạt,{" "}
                {formatInteger(
                  learningPathReport.totals.needsRetryPracticeCount,
                )}{" "}
                cần thử lại
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Lộ trình học viên</th>
                    <th className="px-5 py-3">Lớp</th>
                    <th className="px-5 py-3">Nhóm năng lực</th>
                    <th className="px-5 py-3 text-right">Gói học</th>
                    <th className="px-5 py-3 text-right">Video</th>
                    <th className="px-5 py-3 text-right">Luyện tập</th>
                    <th className="px-5 py-3 text-right">Điểm trung bình</th>
                    <th className="px-5 py-3 text-right">Tiến độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {learningPathReport.learningPathRows.map((row) => (
                    <tr key={row.learningPathId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {row.childProfileId} / {row.courseCode}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.classCode}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.learnerStatusBand)}`}
                        >
                          {compactStatus(row.learnerStatusBand)}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">
                          {compactStatus(row.pathStatus)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.completedDailyPlanCount)}/
                        {formatInteger(row.dailyPlanCount)}
                        {(row.blockedDailyPlanCount > 0 ||
                          row.skippedDailyPlanCount > 0) && (
                          <p className="mt-1 text-xs text-amber-700">
                            {formatInteger(row.blockedDailyPlanCount)} bị chặn
                            / {formatInteger(row.skippedDailyPlanCount)} đã bỏ
                            qua
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.completedVideoCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatInteger(row.passedPracticeCount)}
                      </td>
                      <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                        {formatPercent(row.averagePracticeScorePercent)}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatPercent(row.progressPercent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Kế hoạch hằng ngày</th>
                    <th className="px-5 py-3">Học viên</th>
                    <th className="px-5 py-3">Bài học</th>
                    <th className="px-5 py-3">Kế hoạch</th>
                    <th className="px-5 py-3">Video</th>
                    <th className="px-5 py-3 text-right">Lượt xem</th>
                    <th className="px-5 py-3">Luyện tập</th>
                    <th className="px-5 py-3 text-right">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {learningPathReport.dailyPlanRows.map((row) => (
                    <tr key={row.dailyPlanId}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {row.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.planDate} / {row.classCode}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.studentName}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-700">
                        {row.lessonCode}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.dailyPlanStatus)}`}
                        >
                          {compactStatus(row.dailyPlanStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.videoEvidenceStatus)}`}
                        >
                          {compactStatus(row.videoEvidenceStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-slate-700">
                        {formatPercent(row.videoCompletionPercent)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.practiceAttemptStatus)}`}
                        >
                          {compactStatus(row.practiceAttemptStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right align-top font-semibold text-slate-950">
                        {row.practiceScorePercent === null
                          ? "-"
                          : formatPercent(row.practiceScorePercent)}
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
          Minh chứng lộ trình học sẽ xuất hiện sau khi báo cáo mô phỏng tải
          xong.
        </div>
      )}
    </section>
  );
}

export function LearnerProgressTableSection(state: DemoPageState) {
  const { isLoading, progressReport } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <BarChart3 size={18} />
        Dòng thời gian buổi học
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Các buổi học chỉ đọc với trạng thái có mặt, đi muộn, vắng và có phép.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Phiên</th>
                <th className="px-5 py-3">Lớp</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Điểm danh</th>
                <th className="px-5 py-3 text-right">Có mặt</th>
                <th className="px-5 py-3 text-right">Muộn</th>
                <th className="px-5 py-3 text-right">Vắng</th>
                <th className="px-5 py-3 text-right">Có phép</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {progressReport?.sessionRows.map((row) => (
                <tr key={row.sessionId}>
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-slate-950">
                      {row.sequence}. {row.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.lessonCode} / {formatDateTime(row.scheduledStart)}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-700">
                    {row.classCode}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(row.status)}`}
                    >
                      {compactStatus(row.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right align-top text-slate-700">
                    {formatInteger(row.attendanceRecordCount)}
                  </td>
                  <td className="px-5 py-4 text-right align-top text-slate-700">
                    {formatInteger(row.presentAttendanceCount)}
                  </td>
                  <td className="px-5 py-4 text-right align-top text-slate-700">
                    {formatInteger(row.lateAttendanceCount)}
                  </td>
                  <td className="px-5 py-4 text-right align-top text-slate-700">
                    {formatInteger(row.absentAttendanceCount)}
                  </td>
                  <td className="px-5 py-4 text-right align-top text-slate-700">
                    {formatInteger(row.excusedAttendanceCount)}
                  </td>
                </tr>
              ))}
              {!progressReport && (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-sm text-slate-500"
                    colSpan={8}
                  >
                    {isLoading
                      ? "Đang tải báo cáo giả lập..."
                      : "Chưa có báo cáo phiên học."}
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
