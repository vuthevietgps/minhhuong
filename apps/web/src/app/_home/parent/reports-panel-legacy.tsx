"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../lib/api";
import { formatStatusCodeVi, formatStudyMinutes } from "../lib/format";
import type { ParentChild, ParentChildrenPayload, Session } from "../types";

// ---------------------------------------------------------------------------
// ParentReportsPanel — select a child then show weekly report
// ---------------------------------------------------------------------------
type ChildReportData = {
  childProfileId: string;
  period: { weeks: number; sinceDate: string };
  summary: {
    totalLessonsWatched: number;
    completedLessons: number;
    totalWatchCount: number;
    totalStudyMinutes: number;
    totalDeviceMinutes: number;
    totalGrantedExtraMinutes: number;
  };
  weeklyUsage: Array<{
    week: string;
    usedSeconds: number;
    usedMinutes: number;
    completed: number;
    watched: number;
    minutes: number;
  }>;
  recentLessons: Array<{
    lessonId: string;
    title: string;
    status: string;
    progressPercent: number;
    watchCount: number;
    lastWatchedAt: string | null;
    hasPractice: boolean;
  }>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ParentReportsPanelLegacy({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [report, setReport] = useState<ChildReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(true);

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
        if (res.ok) {
          const data = (await res.json()) as ParentChildrenPayload;
          setChildren(data.children);
          if (data.children.length > 0) setSelectedChildId(data.children[0].id);
        }
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
      void (async () => {
        try {
          const res = await fetch(
            `${apiBaseUrl}/v1/parent/children/${selectedChildId}/report?weeks=4`,
            {
              headers: authHeaders,
            },
          );
          if (res.ok) setReport((await res.json()) as ChildReportData);
        } finally {
          setLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedChildId, authHeaders]);

  if (childrenLoading)
    return <p className="text-sm text-slate-500 py-6">Đang tải...</p>;
  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Chưa có hồ sơ con nào.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
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

      {loading && <p className="text-sm text-slate-500">Đang tải báo cáo...</p>}

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Bài hoàn thành",
                value: String(report.summary.completedLessons),
              },
              {
                label: "Thời gian học (phút)",
                value: String(report.summary.totalStudyMinutes),
              },
              {
                label: "Thời gian thiết bị (phút)",
                value: String(report.summary.totalDeviceMinutes),
              },
              {
                label: "Cộng thêm thiết bị (phút)",
                value: String(report.summary.totalGrantedExtraMinutes),
              },
            ].map((m) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4"
                key={m.label}
              >
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-2 text-2xl font-semibold">{m.value}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {report.period.weeks} tuần gần nhất
                </p>
              </div>
            ))}
          </div>

          {report.weeklyUsage.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold">Thống kê theo tuần</h3>
              <div className="mt-3 space-y-2">
                {report.weeklyUsage
                  .slice()
                  .sort((a, b) => a.week.localeCompare(b.week))
                  .map((w) => {
                    const maxMin = Math.max(
                      ...report.weeklyUsage.map((x) => x.usedMinutes),
                      1,
                    );
                    const pct = Math.round((w.usedMinutes / maxMin) * 100);
                    return (
                      <div className="flex items-center gap-3" key={w.week}>
                        <span className="w-24 shrink-0 text-xs text-slate-500">
                          {w.week}
                        </span>
                        <div className="flex-1 h-4 rounded-full bg-slate-100">
                          <div
                            className="h-4 rounded-full bg-teal-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-right text-xs text-slate-600">
                          {formatStudyMinutes(w.usedMinutes)} · {w.completed}{" "}
                          bài
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {report.recentLessons.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold">Bài học gần đây</h3>
              <ul className="mt-3 divide-y divide-slate-100">
                {report.recentLessons.map((lesson) => (
                  <li
                    className="flex items-center justify-between py-2 text-sm"
                    key={lesson.lessonId}
                  >
                    <span className="text-slate-800">{lesson.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        lesson.status === "COMPLETED"
                          ? "bg-teal-100 text-teal-700"
                          : lesson.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {lesson.status === "COMPLETED"
                        ? "Hoàn thành"
                        : lesson.status === "IN_PROGRESS"
                          ? "Đang học"
                          : formatStatusCodeVi(lesson.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
