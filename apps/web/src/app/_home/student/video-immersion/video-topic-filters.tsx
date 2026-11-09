"use client";

import { Bookmark } from "lucide-react";
import type { VideoImmersionPanelState } from "./use-video-immersion-panel-state";

/** Topic and course unit filters. */
export function VideoTopicFilters(state: VideoImmersionPanelState) {
  const {
    activeCourseUnits,
    activeSeriesId,
    activeTopicId,
    filteredActiveLessons,
    setActiveSeriesId,
    setActiveTopicId,
    setMessage,
    setSelectedLessonId,
    setSelectedVideoId,
    setShowSavedOnly,
    showSavedOnly,
    topics,
  } = state;
  if (!((topics.length > 0 || activeCourseUnits.length > 0))) return null;
  return (
    <details className="group mt-3">
      <summary className="flex h-9 cursor-pointer list-none items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100">
        <span>Bộ lọc & seri</span>
        <span className="text-violet-700 group-open:hidden">Mở</span>
        <span className="hidden text-violet-700 group-open:inline">
          Thu gọn
        </span>
      </summary>
      {topics.length > 0 && (
        <div className="mt-3 flex max-w-full gap-2 overflow-auto">
          <button
            className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium ring-1 ${
              activeTopicId
                ? "bg-white text-slate-700 ring-slate-200"
                : "bg-teal-700 text-white ring-teal-700"
            }`}
            onClick={() => setActiveTopicId("")}
            type="button"
          >
            Tất cả chủ đề
          </button>
          {topics.map((topic) => (
            <button
              className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium ring-1 ${
                activeTopicId === topic.id
                  ? "bg-teal-700 text-white ring-teal-700"
                  : "bg-white text-slate-700 ring-slate-200"
              }`}
              key={topic.id}
              onClick={() => {
                setActiveTopicId(topic.id);
                setActiveSeriesId("");
                const lesson = activeCourseUnits
                  .flatMap((unit) => unit.lessons)
                  .find((item) =>
                    item.tags.some((tag) => tag.id === topic.id),
                  );
                setSelectedLessonId(lesson?.id ?? "");
                setSelectedVideoId("");
              }}
              type="button"
            >
              {topic.name}
            </button>
          ))}
        </div>
      )}

      {activeCourseUnits.length > 0 && (
        <div className="mt-3 flex max-w-full gap-2 overflow-auto">
          <span className="flex h-8 items-center px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Seri
          </span>
          <button
            aria-pressed={!activeSeriesId}
            className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium ring-1 ${
              activeSeriesId
                ? "bg-white text-slate-700 ring-slate-200"
                : "bg-violet-700 text-white ring-violet-700"
            }`}
            onClick={() => {
              setActiveSeriesId("");
              const lesson = activeCourseUnits
                .flatMap((unit) => unit.lessons)
                .find((item) =>
                  activeTopicId
                    ? item.tags.some((tag) => tag.id === activeTopicId)
                    : true,
                );
              setSelectedLessonId(lesson?.id ?? "");
              setSelectedVideoId("");
            }}
            type="button"
          >
            Tất cả seri
          </button>
          {activeCourseUnits.map((unit) => (
            <button
              aria-pressed={activeSeriesId === unit.id}
              className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium ring-1 ${
                activeSeriesId === unit.id
                  ? "bg-violet-700 text-white ring-violet-700"
                  : "bg-white text-slate-700 ring-slate-200"
              }`}
              key={unit.id}
              onClick={() => {
                setActiveSeriesId(unit.id);
                const lesson = unit.lessons.find((item) =>
                  activeTopicId
                    ? item.tags.some((tag) => tag.id === activeTopicId)
                    : true,
                );
                setSelectedLessonId(lesson?.id ?? "");
                setSelectedVideoId("");
              }}
              type="button"
            >
              {unit.title}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex max-w-full gap-2 overflow-auto">
        <button
          aria-pressed={showSavedOnly}
          className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-medium ring-1 ${
            showSavedOnly
              ? "bg-violet-700 text-white ring-violet-700"
              : "bg-white text-slate-700 ring-slate-200"
          }`}
          onClick={() => {
            const nextShowSavedOnly = !showSavedOnly;
            setShowSavedOnly(nextShowSavedOnly);
            setSelectedLessonId("");
            setMessage(
              nextShowSavedOnly
                ? "Đang hiển thị các bài con đã lưu."
                : "Đang hiển thị tất cả bài học.",
            );
          }}
          type="button"
        >
          <Bookmark
            fill={showSavedOnly ? "currentColor" : "none"}
            size={14}
          />
          {showSavedOnly ? "Bài đã lưu" : "Lọc bài đã lưu"}
        </button>
        {showSavedOnly && filteredActiveLessons.length === 0 && (
          <span className="self-center text-xs text-slate-500">
            Chưa có bài đã lưu trong khóa học này.
          </span>
        )}
      </div>
    </details>
  );
}
