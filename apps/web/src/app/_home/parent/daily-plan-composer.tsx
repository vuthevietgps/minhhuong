"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatVideoDuration } from "../lib/format";
import type { ParentChild, Session } from "../types";

type ParentDailyPlanCandidate = {
  id: string;
  title: string;
  description?: string | null;
  durationSec?: number | null;
  courseTitle: string;
  source: "ASSIGNED_PATH" | "CATALOG";
};

export function ParentDailyPlanComposer({
  child,
  onAssigned,
  session,
}: {
  child: ParentChild;
  onAssigned: () => void;
  session: Session;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<ParentDailyPlanCandidate[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/parent/children/${child.id}/daily-plan-candidates?query=${encodeURIComponent(query)}`,
        { headers: authHeaders },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải bài học để giao."),
        );
      }
      setCandidates((await response.json()) as ParentDailyPlanCandidate[]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải bài học để giao.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, child.id, query]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => void loadCandidates(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, loadCandidates]);

  function toggleLesson(lessonId: string) {
    setSelectedLessonIds((current) => {
      if (current.includes(lessonId)) {
        return current.filter((id) => id !== lessonId);
      }
      if (current.length >= 3) {
        setMessage(
          "Mỗi ngày chỉ nên giao tối đa 3 bài để bé không bị quá tải.",
        );
        return current;
      }
      return [...current, lessonId];
    });
  }

  async function savePlan() {
    if (!selectedLessonIds.length) {
      setMessage("Hãy chọn ít nhất một bài học.");
      return;
    }
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/parent/children/${child.id}/daily-plans/today`,
        {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ lessonIds: selectedLessonIds }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể cập nhật kế hoạch hôm nay."),
        );
      }
      setMessage(
        `Đã giao ${selectedLessonIds.length} bài cho ${child.displayName}.`,
      );
      setIsOpen(false);
      onAssigned();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật kế hoạch hôm nay.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Phụ huynh điều chỉnh
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            Giao bài cho {child.displayName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Nếu chưa giao, hệ thống sẽ tự đề xuất bài tiếp theo theo lộ trình.
          </p>
        </div>
        <button
          className="h-10 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? "Đóng" : "Chọn bài hôm nay"}
        </button>
      </div>
      {isOpen && (
        <div className="mt-4 border-t border-violet-200 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="h-10 min-w-0 flex-1 rounded-lg border border-violet-200 bg-white px-3 text-sm"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadCandidates();
              }}
              placeholder="Tìm theo tên bài, ví dụ: phonics, animals..."
              type="search"
              value={query}
            />
            <button
              className="h-10 rounded-lg border border-violet-200 bg-white px-4 text-sm font-semibold text-violet-800 disabled:opacity-60"
              disabled={isLoading}
              onClick={() => void loadCandidates()}
              type="button"
            >
              {isLoading ? "Đang tìm..." : "Tìm bài"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Chọn tối đa 3 bài. Kế hoạch chỉ thay đổi khi bé chưa bắt đầu học hôm
            nay.
          </p>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {candidates.map((lesson) => {
              const selected = selectedLessonIds.includes(lesson.id);
              return (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    selected
                      ? "border-violet-400 bg-white"
                      : "border-violet-100 bg-white/70 hover:border-violet-300"
                  }`}
                  key={lesson.id}
                >
                  <input
                    checked={selected}
                    className="mt-0.5 size-4 accent-violet-700"
                    onChange={() => toggleLesson(lesson.id)}
                    type="checkbox"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      {lesson.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {lesson.courseTitle}
                      {formatVideoDuration(lesson.durationSec)
                        ? ` · ${formatVideoDuration(lesson.durationSec)}`
                        : ""}
                    </span>
                  </span>
                </label>
              );
            })}
            {!isLoading && candidates.length === 0 && (
              <p className="rounded-lg border border-dashed border-violet-200 bg-white p-4 text-sm text-slate-500">
                Không tìm thấy bài phù hợp. Hãy thử từ khóa khác.
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Đã chọn: {selectedLessonIds.length}/3
            </p>
            <button
              className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isSaving || selectedLessonIds.length === 0}
              onClick={() => void savePlan()}
              type="button"
            >
              {isSaving ? "Đang giao bài..." : "Giao bài hôm nay"}
            </button>
          </div>
        </div>
      )}
      {message && <p className="mt-3 text-sm text-violet-800">{message}</p>}
    </section>
  );
}
