"use client";

import { ArrowLeft, ArrowRight, Bookmark, Maximize2, Minimize2, Play } from "lucide-react";
import { formatVideoDuration } from "../../lib/format";
import { lessonProgressStatusLabel, safeDurationSeconds, videoEvidenceStatusClass } from "./helpers";
import type { VideoImmersionPanelState } from "./use-video-immersion-panel-state";

/** Player, watch evidence and lesson details. */
export function VideoPlayerColumn(state: VideoImmersionPanelState) {
  const {
    applyLessonProgress,
    displayWatchPercent,
    displayedLessonVideos,
    evidencePassed,
    evidenceStatusLabel,
    hasBackendEvidence,
    isSaving,
    isVideoFullscreen,
    planContext,
    playerContainerRef,
    recordWatch,
    requiredWatchPercent,
    selectAdjacentVideo,
    selectVideo,
    selectedDurationSec,
    selectedLesson,
    selectedVideo,
    selectedVideoIndex,
    selectedVideoUrl,
    selectedWatchEvidence,
    selectedYouTubeEmbedUrl,
    setStudyTimerActive,
    setVideoSearch,
    showSavedOnly,
    studyTimerActive,
    toggleFavorite,
    toggleVideoFullscreen,
    usage,
    videoQuery,
  } = state;
  return (
    <div className="min-w-0">
      <div
        className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black [&:fullscreen]:grid [&:fullscreen]:place-items-center"
        ref={playerContainerRef}
      >
        {usage?.limitReached ? (
          <div className="grid size-full place-items-center border border-rose-200 bg-rose-50 p-5 text-center text-rose-900">
            <div>
              <p className="text-base font-bold">
                Hôm nay con đã hoàn thành thời gian học.
              </p>
              <p className="mt-2 text-sm font-normal">
                Con có thể nghỉ ngơi, hoặc nhờ bố mẹ cộng thêm thời gian học
                trong ứng dụng.
              </p>
            </div>
          </div>
        ) : selectedYouTubeEmbedUrl ? (
          <iframe
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full border-0"
            key={selectedVideo.id}
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-same-origin allow-scripts allow-presentation"
            src={selectedYouTubeEmbedUrl}
            title={selectedVideo.title ?? selectedLesson?.title ?? "Video"}
          />
        ) : selectedVideoUrl ? (
          <video
            className="size-full bg-black"
            controls
            key={selectedVideo.id}
            onEnded={(event) => {
              if (!selectedLesson) return;
              const durationSec = safeDurationSeconds(
                event.currentTarget.duration,
                selectedDurationSec,
              );
              setStudyTimerActive(false);
              void recordWatch(
                selectedLesson,
                "COMPLETED",
                durationSec,
                Math.max(
                  1,
                  durationSec - selectedLesson.progress.lastPositionSec,
                ),
              );
            }}
            onPause={() => setStudyTimerActive(false)}
            onPlay={() => {
              setStudyTimerActive(true);
              return selectedLesson
                ? void recordWatch(
                    selectedLesson,
                    "STARTED",
                    selectedLesson.progress.lastPositionSec,
                  )
                : undefined;
            }}
            onTimeUpdate={(event) =>
              selectedLesson
                ? applyLessonProgress(selectedLesson.id, {
                    ...selectedLesson.progress,
                    lastPositionSec: Math.floor(
                      event.currentTarget.currentTime,
                    ),
                  })
                : undefined
            }
            src={selectedVideoUrl}
          />
        ) : (
          <div className="grid size-full place-items-center border border-slate-200 bg-slate-100 p-4 text-center text-sm text-slate-500">
            {showSavedOnly
              ? "Chưa có bài đã lưu trong khóa học này."
              : "Chưa chọn video"}
          </div>
        )}
        {!usage?.limitReached &&
          (selectedYouTubeEmbedUrl || selectedVideoUrl) && (
            <button
              aria-label={
                isVideoFullscreen ? "Thu nhỏ video" : "Phóng to video"
              }
              className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-lg border border-white/50 bg-slate-950/80 text-white opacity-0 shadow-sm transition hover:bg-slate-950 focus-visible:opacity-100 group-hover:opacity-100"
              onClick={() => void toggleVideoFullscreen()}
              title={isVideoFullscreen ? "Thu nhỏ video" : "Phóng to video"}
              type="button"
            >
              {isVideoFullscreen ? (
                <Minimize2 size={18} />
              ) : (
                <Maximize2 size={18} />
              )}
            </button>
          )}
      </div>

      {selectedLesson && selectedVideo && (
        <section className="mt-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
                Chọn video trong bài
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">
                {selectedVideo.title ?? selectedLesson.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Video trước"
                className="grid size-9 place-items-center rounded-lg border border-violet-200 bg-white text-violet-800 disabled:opacity-40"
                disabled={selectedVideoIndex <= 0}
                onClick={() => selectAdjacentVideo(-1)}
                type="button"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                aria-label="Video tiếp theo"
                className="grid size-9 place-items-center rounded-lg border border-violet-200 bg-white text-violet-800 disabled:opacity-40"
                disabled={
                  selectedVideoIndex < 0 ||
                  selectedVideoIndex >= selectedLesson.videos.length - 1
                }
                onClick={() => selectAdjacentVideo(1)}
                type="button"
              >
                <ArrowRight size={17} />
              </button>
              <button
                className="h-9 rounded-lg bg-violet-700 px-3 text-xs font-bold text-white disabled:opacity-50"
                disabled={usage?.limitReached}
                onClick={() => setStudyTimerActive((current) => !current)}
                type="button"
              >
                {studyTimerActive ? "Dừng ghi nhận" : "Bắt đầu học"}
              </button>
            </div>
          </div>
          {selectedLesson.videos.length > 8 && (
            <input
              aria-label="Tìm video trong bài"
              className="mt-3 h-9 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-violet-400"
              onChange={(event) =>
                setVideoSearch({
                  lessonId: selectedLesson.id,
                  query: event.target.value,
                })
              }
              placeholder="Tìm video theo tên hoặc chủ đề"
              type="search"
              value={videoQuery}
            />
          )}
          <div
            aria-label={`Danh sách ${selectedLesson.videos.length} video trong bài ${selectedLesson.title}`}
            className="mt-3 flex gap-3 overflow-x-auto pb-1"
          >
            {displayedLessonVideos.map((video) => {
              const videoIndex = selectedLesson.videos.findIndex(
                (item) => item.id === video.id,
              );
              const isSelected = video.id === selectedVideo.id;
              const durationLabel = formatVideoDuration(video.durationSec);

              return (
                <button
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`Mở ${video.title ?? `Video ${videoIndex + 1}`}${
                    isSelected ? ", đang chọn" : ""
                  }`}
                  className={`w-36 shrink-0 overflow-hidden rounded-lg border text-left transition sm:w-40 ${
                    isSelected
                      ? "border-violet-500 bg-white shadow-sm"
                      : "border-violet-100 bg-white hover:border-violet-300"
                  }`}
                  key={video.id}
                  onClick={() => selectVideo(video)}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="relative grid aspect-video w-full place-items-center bg-slate-900 bg-cover bg-center text-white"
                    style={
                      video.thumbnailUrl
                        ? {
                            backgroundImage: `linear-gradient(135deg, rgba(36, 49, 77, 0.08), rgba(36, 49, 77, 0.62)), url(${video.thumbnailUrl})`,
                          }
                        : undefined
                    }
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-white/90 text-violet-700 shadow-sm">
                      <Play fill="currentColor" size={14} />
                    </span>
                    {durationLabel && (
                      <span className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {durationLabel}
                      </span>
                    )}
                  </span>
                  <span className="block p-2">
                    <span className="block truncate text-xs font-bold text-slate-800">
                      {video.title ?? `Video ${videoIndex + 1}`}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-500">
                      {isSelected ? "Đang xem" : `Video ${videoIndex + 1}`}
                    </span>
                  </span>
                </button>
              );
            })}
            {displayedLessonVideos.length === 0 && (
              <p className="px-1 py-3 text-sm text-slate-500">
                Không tìm thấy video phù hợp.
              </p>
            )}
          </div>
        </section>
      )}

      {selectedLesson && (
        <details className="group mt-3 rounded-lg border border-slate-200 bg-slate-50">
          <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-semibold text-slate-700">
            <span>Tiến độ và tùy chọn bài học</span>
            <span className="text-xs font-medium text-violet-700 group-open:hidden">
              Xem thêm
            </span>
            <span className="hidden text-xs font-medium text-violet-700 group-open:inline">
              Thu gọn
            </span>
          </summary>
          <div className="space-y-3 border-t border-slate-200 p-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-teal-700">
                    Bằng chứng xem video
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Cần xem đủ {requiredWatchPercent}% để hoàn thành phần
                    video.
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${videoEvidenceStatusClass(
                    {
                      hasBackendEvidence,
                      passed: evidencePassed,
                    },
                  )}`}
                >
                  {evidenceStatusLabel}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-white">
                  <div
                    className={`h-2 rounded-full ${
                      evidencePassed ? "bg-teal-600" : "bg-amber-500"
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, displayWatchPercent))}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {displayWatchPercent}%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {hasBackendEvidence
                  ? selectedWatchEvidence?.passed
                    ? "Hệ thống đã ghi nhận đủ thời lượng xem video."
                    : "Hệ thống đã ghi nhận tiến độ nhưng con cần xem thêm để hoàn thành."
                  : "Chưa có ghi nhận xem video. Bật video để hệ thống lưu tiến độ."}
              </p>
              {selectedLesson &&
                planContext?.lessonId === selectedLesson.id && (
                  <p className="mt-1 text-xs text-teal-700">
                    Video này đang được mở từ kế hoạch học hôm nay.
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  {selectedLesson.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedLesson.progress.watchCount} lần ghi nhận / tiến
                  độ{" "}
                  {lessonProgressStatusLabel(
                    selectedLesson.progress.status,
                  )}
                </p>
                {selectedLesson.tags.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-1 text-xs text-slate-500">
                    {selectedLesson.tags.map((tag) => (
                      <span
                        className="rounded-md bg-slate-100 px-2 py-1"
                        key={tag.id}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  aria-label={
                    selectedLesson.progress.isFavorite
                      ? "Bỏ lưu bài này"
                      : "Lưu bài này"
                  }
                  className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium disabled:opacity-60 ${
                    selectedLesson.progress.isFavorite
                      ? "border-violet-200 bg-violet-50 text-violet-800"
                      : "border-slate-200 text-slate-700"
                  }`}
                  disabled={isSaving}
                  onClick={() => void toggleFavorite(selectedLesson)}
                  type="button"
                >
                  <Bookmark
                    fill={
                      selectedLesson.progress.isFavorite
                        ? "currentColor"
                        : "none"
                    }
                    size={16}
                  />
                  {isSaving
                    ? "Đang lưu"
                    : selectedLesson.progress.isFavorite
                      ? "Đã lưu"
                      : "Lưu bài"}
                </button>
                <button
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium"
                  onClick={() =>
                    void recordWatch(selectedLesson, "REPLAYED", 0)
                  }
                  type="button"
                >
                  Xem lại
                </button>
                <button
                  className="h-9 rounded-lg bg-teal-700 px-3 text-sm font-medium text-white"
                  onClick={() =>
                    void recordWatch(
                      selectedLesson,
                      "PROGRESSED",
                      selectedLesson.progress.lastPositionSec,
                    )
                  }
                  type="button"
                >
                  Cập nhật tiến độ
                </button>
              </div>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
