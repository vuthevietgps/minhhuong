"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatStudyMinutes } from "../lib/format";
import type { ParentChild, ParentChildrenPayload, Session } from "../types";

function friendlyTrialReportError(message: string) {
  return message.toLowerCase().includes("trial learning report")
    ? "Báo cáo kết quả sẽ mở vào cuối ngày dùng thử thứ 2. Tiến độ học vẫn đang được ghi nhận."
    : message;
}

function dailyLearningPlanStatusLabel(status?: string | null) {
  if (!status) return "Chưa có kế hoạch";
  const labels: Record<string, string> = {
    DRAFT: "Đang chuẩn bị",
    ACTIVE: "Đang học",
    COMPLETED: "Đã hoàn thành",
    SKIPPED: "Đã bỏ qua",
    EXPIRED: "Đã hết hạn",
  };
  return labels[status] ?? status;
}

function learningItemStatusLabel(status?: string | null) {
  if (!status) return "Chưa có trạng thái";
  const labels: Record<string, string> = {
    READY: "Sẵn sàng",
    STARTED: "Đang học",
    COMPLETED: "Đã hoàn thành",
    SKIPPED: "Đã bỏ qua",
    LOCKED: "Đang khóa",
    ACTIVE: "Đang học",
    DRAFT: "Đang chuẩn bị",
    EXPIRED: "Đã hết hạn",
  };
  return labels[status] ?? status;
}

function learningPlanItemTypeLabel(type: string) {
  const labels: Record<string, string> = {
    VIDEO: "Video",
    PRACTICE: "Bài luyện",
    GAME: "Trò chơi",
    AI_CONVERSATION: "Luyện nói",
    REVIEW: "Ôn lại",
    REWARD: "Phần thưởng",
    REST: "Nghỉ",
  };
  return labels[type] ?? type;
}

type ParentLearningReportRange = "7d" | "30d";

type ParentLearningEvidenceReport = {
  child: {
    id: string;
    displayName: string;
  };
  range: ParentLearningReportRange;
  fromDate: string;
  toDate: string;
  activeAssignment: {
    packageTitle: string;
    learningPathTitle: string;
  } | null;
  summary: {
    completedPlanDays: number;
    activeDays: number;
    videoItemsCompleted: number;
    practiceItemsCompleted: number;
    averagePracticeScorePercent: number | null;
    totalWatchEvidenceMinutes: number;
    blockedItems: number;
  };
  days: Array<{
    date: string;
    planStatus: string | null;
    completedItems: number;
    totalItems: number;
    blockedItems: number;
    videoSummary: {
      completed: number;
      insufficientEvidence: number;
      maxWatchPercent: number | null;
      watchEvidenceMinutes: number;
    };
    practiceSummary: {
      completed: number;
      attempts: number;
      averageScorePercent: number | null;
    };
    items: Array<{
      itemId: string;
      itemType: string;
      status: string;
      lessonTitle: string | null;
      activityTitle: string | null;
      evidenceSummary: {
        watchPercent?: number;
        minWatchPercent?: number;
        percent?: number;
        minScore?: number | null;
      } | null;
      blockedReason: string | null;
      blockedMessage: string | null;
    }>;
    emptyState: {
      message: string;
    } | null;
  }>;
  emptyState: {
    message: string;
  } | null;
};

export function ParentLearningReportPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [range, setRange] = useState<ParentLearningReportRange>("7d");
  const [report, setReport] = useState<ParentLearningEvidenceReport | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
          headers: authHeaders,
        });
        if (!res.ok) {
          throw new Error(
            await readApiError(res, "Không thể tải hồ sơ học sinh."),
          );
        }
        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
        if (data.children.length > 0) setSelectedChildId(data.children[0].id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải hồ sơ học sinh.",
        );
      } finally {
        setChildrenLoading(false);
      }
    })();
  }, [authHeaders]);

  useEffect(() => {
    if (!selectedChildId) return;

    const timer = window.setTimeout(() => {
      setLoading(true);
      setReport(null);
      setError("");
      void (async () => {
        try {
          const res = await fetch(
            `${apiBaseUrl}/v1/parent/children/${selectedChildId}/learning-report?range=${range}`,
            {
              headers: authHeaders,
            },
          );
          if (!res.ok) {
            throw new Error(
              await readApiError(res, "Không thể tải báo cáo học tập."),
            );
          }
          setReport((await res.json()) as ParentLearningEvidenceReport);
        } catch (err) {
          setError(
            friendlyTrialReportError(
              err instanceof Error
                ? err.message
                : "Không thể tải báo cáo học tập.",
            ),
          );
        } finally {
          setLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedChildId, range, authHeaders]);

  if (childrenLoading)
    return <p className="py-6 text-sm text-slate-500">Đang tải...</p>;
  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Chưa có hồ sơ con nào.</p>
      </div>
    );
  }

  const visibleItems =
    report?.days
      .flatMap((day) => day.items.map((item) => ({ ...item, date: day.date })))
      .slice()
      .reverse() ?? [];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">
            Chọn học sinh:
          </span>
          {children.map((child) => (
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedChildId === child.id
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-slate-200 text-slate-600 hover:border-teal-300"
              }`}
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              type="button"
            >
              {child.displayName}
            </button>
          ))}
        </div>
        <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1">
          {(["7d", "30d"] as ParentLearningReportRange[]).map((option) => (
            <button
              className={`h-8 rounded-md px-3 text-sm font-medium ${
                range === option
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              key={option}
              onClick={() => setRange(option)}
              type="button"
            >
              {option === "7d" ? "7 ngày" : "30 ngày"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Đang tải báo cáo...</p>}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {report && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {report.fromDate} - {report.toDate}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {report.child.displayName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {report.activeAssignment
                    ? `${report.activeAssignment.packageTitle} - ${report.activeAssignment.learningPathTitle}`
                    : "Con chưa được gán lộ trình học chính."}
                </p>
              </div>
              <BarChart3 className="text-slate-400" size={24} />
            </div>
            {report.emptyState && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                {report.emptyState.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {[
              {
                label: "Ngày có học",
                value: `${report.summary.activeDays}/${range === "7d" ? 7 : 30}`,
              },
              {
                label: "Ngày xong kế hoạch",
                value: String(report.summary.completedPlanDays),
              },
              {
                label: "Video hoàn thành",
                value: String(report.summary.videoItemsCompleted),
              },
              {
                label: "Bài luyện đạt",
                value: String(report.summary.practiceItemsCompleted),
              },
              {
                label: "Điểm bài luyện TB",
                value:
                  report.summary.averagePracticeScorePercent === null
                    ? "—"
                    : `${report.summary.averagePracticeScorePercent}%`,
              },
              {
                label: "Phút video đã ghi nhận",
                value: formatStudyMinutes(
                  report.summary.totalWatchEvidenceMinutes,
                ),
              },
            ].map((m) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4"
                key={m.label}
              >
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-2 text-2xl font-semibold">{m.value}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {range === "7d" ? "7 ngày gần nhất" : "30 ngày gần nhất"}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold">Dòng thời gian học tập</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs text-slate-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Ngày</th>
                    <th className="py-2 pr-4 font-medium">Kế hoạch</th>
                    <th className="py-2 pr-4 font-medium">Việc học</th>
                    <th className="py-2 pr-4 font-medium">Video</th>
                    <th className="py-2 pr-4 font-medium">Bài luyện</th>
                    <th className="py-2 font-medium">Cần chú ý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.days
                    .slice()
                    .reverse()
                    .map((day) => {
                      const blockedMessages = day.items
                        .map((item) => item.blockedMessage)
                        .filter(Boolean);
                      return (
                        <tr key={day.date}>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.date}
                          </td>
                          <td className="py-3 pr-4 align-top">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                day.planStatus === "COMPLETED"
                                  ? "bg-teal-100 text-teal-700"
                                  : day.planStatus
                                    ? "bg-slate-100 text-slate-600"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {dailyLearningPlanStatusLabel(day.planStatus)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.completedItems}/{day.totalItems}
                          </td>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.videoSummary.completed} video -{" "}
                            {day.videoSummary.maxWatchPercent ?? 0}% cao nhất -{" "}
                            {formatStudyMinutes(
                              day.videoSummary.watchEvidenceMinutes,
                            )}
                          </td>
                          <td className="py-3 pr-4 align-top text-slate-700">
                            {day.practiceSummary.completed} đạt -{" "}
                            {day.practiceSummary.attempts} lần làm
                            {day.practiceSummary.averageScorePercent !== null
                              ? ` - ${day.practiceSummary.averageScorePercent}%`
                              : ""}
                          </td>
                          <td className="py-3 align-top">
                            {blockedMessages.length > 0 ? (
                              <div className="space-y-1 text-xs text-amber-800">
                                {blockedMessages.map((message, index) => (
                                  <p key={`${day.date}-${index}`}>{message}</p>
                                ))}
                              </div>
                            ) : day.emptyState ? (
                              <p className="text-xs text-slate-500">
                                {day.emptyState.message}
                              </p>
                            ) : (
                              <p className="text-xs text-teal-700">
                                Hoàn thành.
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold">Bằng chứng theo việc học</h3>
            <div className="mt-3 space-y-3">
              {visibleItems.map((item) => (
                <div
                  className="rounded-lg border border-slate-100 p-3"
                  key={item.itemId}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.lessonTitle ??
                          item.activityTitle ??
                          learningPlanItemTypeLabel(item.itemType)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.date} - {learningPlanItemTypeLabel(item.itemType)}{" "}
                        - {learningItemStatusLabel(item.status)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.blockedReason
                          ? "bg-amber-100 text-amber-800"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {item.blockedReason ? "Cần thêm chứng cứ" : "Đạt"}
                    </span>
                  </div>
                  {item.itemType === "VIDEO" && item.evidenceSummary && (
                    <p className="mt-2 text-xs text-slate-600">
                      Video đã xem: {item.evidenceSummary.watchPercent ?? 0}%,
                      mốc {item.evidenceSummary.minWatchPercent ?? 80}%
                    </p>
                  )}
                  {item.itemType === "PRACTICE" && item.evidenceSummary && (
                    <p className="mt-2 text-xs text-slate-600">
                      Bài luyện: {item.evidenceSummary.percent ?? 0}%{" "}
                      {item.evidenceSummary.minScore !== null &&
                      item.evidenceSummary.minScore !== undefined
                        ? `, mốc ${item.evidenceSummary.minScore}%`
                        : ""}
                    </p>
                  )}
                  {item.blockedMessage && (
                    <p className="mt-2 text-xs text-amber-800">
                      {item.blockedMessage}
                    </p>
                  )}
                </div>
              ))}
              {visibleItems.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                  {report.emptyState?.message ?? "Chưa có bằng chứng học tập."}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
