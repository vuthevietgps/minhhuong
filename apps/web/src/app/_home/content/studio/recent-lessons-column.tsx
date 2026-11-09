"use client";

import { formatStatusCodeVi } from "../../lib/format";
import type { ContentStudioState } from "./use-content-studio-state";

/** "Bài học gần đây" with review actions. */
export function RecentLessonsColumn(state: ContentStudioState) {
  const {
    canManage,
    canPublish,
    isSaving,
    lessons,
    overview,
    previewVideo,
    previewVideoUrl,
    transitionLesson,
  } = state;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Bài học gần đây</h3>
        <span className="text-xs text-slate-500">
          {overview?.lessons ?? lessons.length} bài học /{" "}
          {overview?.videos ?? 0} video
        </span>
      </div>
      <div className="mt-3 max-h-[360px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
        {lessons.map((lesson) => (
          <div className="py-3" key={lesson.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium">{lesson.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {lesson.unit?.course?.level?.code} /{" "}
                  {lesson.unit?.course?.title} / {lesson.unit?.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {lesson.videos.length} video -{" "}
                  {formatStatusCodeVi(lesson.status)}
                </p>
                {lesson.tags && lesson.tags.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {lesson.tags.map((item) => item.tag.name).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {canManage && lesson.status === "DRAFT" && (
                  <button
                    className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                    disabled={isSaving}
                    onClick={() =>
                      void transitionLesson(lesson.id, "submit-review")
                    }
                    type="button"
                  >
                    Gửi duyệt
                  </button>
                )}
                {canPublish && lesson.status === "IN_REVIEW" && (
                  <button
                    className="h-8 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white"
                    disabled={isSaving}
                    onClick={() =>
                      void transitionLesson(lesson.id, "publish")
                    }
                    type="button"
                  >
                    Xuất bản
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewVideo && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">
            Xem trước video trong ứng dụng
          </p>
          {previewVideo.provider === "YOUTUBE" && previewVideo.embedUrl ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="aspect-video w-full rounded-lg border border-slate-200"
              src={previewVideo.embedUrl}
              title={previewVideo.title ?? "Xem trước video YouTube"}
            />
          ) : previewVideoUrl ? (
            <video
              className="aspect-video w-full rounded-lg border border-slate-200 bg-black"
              controls
              src={previewVideoUrl}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
