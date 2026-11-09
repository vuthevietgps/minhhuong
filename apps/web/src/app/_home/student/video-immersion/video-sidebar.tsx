"use client";

import { CheckCircle2, Play } from "lucide-react";
import { formatVideoDuration } from "../../lib/format";
import { lessonProgressStatusLabel } from "./helpers";
import type { VideoImmersionPanelState } from "./use-video-immersion-panel-state";

/** Up-next list, favorites and screen time. */
export function VideoSidebar(state: VideoImmersionPanelState) {
  const {
    activeCourseUnits,
    activeSeriesId,
    activeTopicId,
    filteredActiveLessons,
    selectLesson,
    selectedLesson,
    showSavedOnly,
  } = state;
  return (
    <div className="min-w-0 space-y-4">
      <section className="border-y border-slate-200 py-3">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Chọn bài học
          </p>
        </div>
        {filteredActiveLessons.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            {showSavedOnly
              ? "Chưa có bài đã lưu trong bộ lọc này."
              : "Chưa có bài học phù hợp với bộ lọc."}
          </p>
        )}
        {activeCourseUnits
          .filter((unit) => !activeSeriesId || unit.id === activeSeriesId)
          .map((unit) => (
            <div className="py-3" key={unit.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {unit.title}
              </p>
              <div className="space-y-2">
                {unit.lessons
                  .filter(
                    (lesson) =>
                      (activeTopicId
                        ? lesson.tags.some(
                            (tag) => tag.id === activeTopicId,
                          )
                        : true) &&
                      (!showSavedOnly || lesson.progress.isFavorite),
                  )
                  .map((lesson) => {
                    const thumbnailUrl = lesson.videos[0]?.thumbnailUrl;
                    const durationLabel = formatVideoDuration(
                      lesson.durationSec ?? lesson.videos[0]?.durationSec,
                    );
                    return (
                      <button
                        aria-label={`Mở bài ${lesson.title}`}
                        className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left ${
                          lesson.id === selectedLesson?.id
                            ? "border-teal-300 bg-teal-50"
                            : "border-slate-200 bg-white"
                        }`}
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        type="button"
                      >
                        <div
                          aria-hidden="true"
                          className="relative grid aspect-video w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-900 bg-cover bg-center text-white"
                          style={
                            thumbnailUrl
                              ? {
                                  backgroundImage: `linear-gradient(135deg, rgba(36, 49, 77, 0.08), rgba(36, 49, 77, 0.62)), url(${thumbnailUrl})`,
                                }
                              : undefined
                          }
                        >
                          <span className="grid size-8 place-items-center rounded-full bg-white/90 text-violet-700 shadow-sm">
                            <Play fill="currentColor" size={15} />
                          </span>
                          {durationLabel && (
                            <span className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {durationLabel}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {lesson.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {lessonProgressStatusLabel(
                              lesson.progress.status,
                            )}
                            {lesson.hasPractice ? " / bài luyện" : ""}
                            {lesson.progress.isFavorite ? " / đã lưu" : ""}
                          </p>
                          {lesson.tags.length > 0 && (
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {lesson.tags
                                .map((tag) => tag.name)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        {lesson.progress.status === "COMPLETED" && (
                          <CheckCircle2
                            className="shrink-0 text-teal-600"
                            size={17}
                          />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
