"use client";

import type { ActiveVideoPlanContext, Session } from "../types";
import { screenTimeMessage } from "./video-immersion/helpers";
import { useVideoImmersionPanelState } from "./video-immersion/use-video-immersion-panel-state";
import { VideoTopicFilters } from "./video-immersion/video-topic-filters";
import { VideoPlayerColumn } from "./video-immersion/video-player-column";
import { VideoSidebar } from "./video-immersion/video-sidebar";

export function VideoImmersionPanel({
  childProfileId,
  onLessonChange,
  planContext,
  requestedLessonId,
  session,
}: {
  childProfileId: string;
  onLessonChange?: (lessonId: string) => void;
  planContext?: ActiveVideoPlanContext | null;
  requestedLessonId?: string;
  session: Session;
}) {
  const state = useVideoImmersionPanelState({ childProfileId, onLessonChange, planContext, requestedLessonId, session });
  const {
    activeCourse,
    courses,
    message,
    setActiveCourseId,
    setActiveSeriesId,
    setActiveTopicId,
    setSelectedLessonId,
    setSelectedVideoId,
    usage,
  } = state;
return (
    <section
      className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      id="student-video-panel"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-teal-700">
            Học qua video
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {activeCourse?.title ?? "Thư viện video"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex max-w-full gap-2 overflow-auto">
          {courses.map((course) => (
            <button
              className={`h-9 whitespace-nowrap rounded-lg px-3 text-sm font-medium ring-1 ${
                course.id === activeCourse?.id
                  ? "bg-slate-950 text-white ring-slate-950"
                  : "bg-white text-slate-700 ring-slate-200"
              }`}
              key={course.id}
              onClick={() => {
                setActiveCourseId(course.id);
                setActiveTopicId("");
                setActiveSeriesId("");
                setSelectedLessonId(
                  course.units.flatMap((unit) => unit.lessons)[0]?.id ?? "",
                );
                setSelectedVideoId("");
              }}
              type="button"
            >
              {course.level.code} / {course.title}
            </button>
          ))}
        </div>
      </div>

      <VideoTopicFilters {...state} />

      {usage && (usage.isWarning || usage.limitReached) && (
        <div
          aria-live="polite"
          className={`mt-3 rounded-lg border p-3 text-sm ${
            usage.limitReached
              ? "border-rose-200 bg-rose-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p
            className={usage.limitReached ? "text-rose-800" : "text-amber-800"}
          >
            {screenTimeMessage(usage)}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <VideoPlayerColumn {...state} />

        <VideoSidebar {...state} />
      </div>
    </section>
  );
}
