import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiBaseUrl, readApiError, useAuthenticatedUploadUrl } from "../../lib/api";
import type { ActiveVideoPlanContext, LearningUsageStatus, Session } from "../../types";
import { friendlyLearningError } from "../learning-plan";
import { toInAppYouTubeEmbedUrl, videoDurationSeconds, videoEvidenceFromContext, videoEvidenceMessage, videoEvidenceStatusLabel, watchPercentFromPosition } from "./helpers";
import type { VideoFeedLesson, VideoFeedPayload, VideoWatchEvidence } from "./helpers";

/** State, effects and handlers of VideoImmersionPanel, moved verbatim from video-immersion-panel.tsx. */
export function useVideoImmersionPanelState({
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
  const [feed, setFeed] = useState<VideoFeedPayload | null>(null);
  const [activeCourseId, setActiveCourseId] = useState("");
  const [activeTopicId, setActiveTopicId] = useState("");
  const [activeSeriesId, setActiveSeriesId] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [videoSearch, setVideoSearch] = useState({
    lessonId: "",
    query: "",
  });
  const [usage, setUsage] = useState<LearningUsageStatus | null>(null);
  const [studyTimerActive, setStudyTimerActive] = useState(false);
  const [message, setMessage] = useState("Đang tải video.");
  const [isSaving, setIsSaving] = useState(false);
  const [watchEvidenceByLessonId, setWatchEvidenceByLessonId] = useState<
    Record<string, VideoWatchEvidence>
  >({});
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );
  const courses = useMemo(() => feed?.courses ?? [], [feed?.courses]);
  const activeCourse =
    courses.find((course) => course.id === activeCourseId) ?? courses[0];
  const activeCourseUnits = activeCourse?.units ?? [];
  const topics = Array.from(
    new Map(
      activeCourseUnits
        .flatMap((unit) => unit.lessons)
        .flatMap((lesson) => lesson.tags.filter((tag) => tag.kind === "TOPIC"))
        .map((tag) => [tag.id, tag]),
    ).values(),
  );
  const allLessons = courses.flatMap((course) =>
    course.units.flatMap((unit) => unit.lessons),
  );
  const activeLessons = activeCourseUnits
    .filter((unit) => !activeSeriesId || unit.id === activeSeriesId)
    .flatMap((unit) => unit.lessons)
    .filter((lesson) =>
      activeTopicId
        ? lesson.tags.some((tag) => tag.id === activeTopicId)
        : true,
    );
  const filteredActiveLessons = activeLessons.filter(
    (lesson) => !showSavedOnly || lesson.progress.isFavorite,
  );
  const selectedLesson = showSavedOnly
    ? (filteredActiveLessons.find((lesson) => lesson.id === selectedLessonId) ??
      filteredActiveLessons[0])
    : (activeLessons.find((lesson) => lesson.id === selectedLessonId) ??
      activeLessons[0] ??
      allLessons.find((lesson) => lesson.id === selectedLessonId) ??
      allLessons[0]);
  const selectedVideo =
    selectedLesson?.videos.find((video) => video.id === selectedVideoId) ??
    selectedLesson?.videos[0];
  const selectedVideoIndex =
    selectedLesson?.videos.findIndex(
      (video) => video.id === selectedVideo?.id,
    ) ?? -1;
  const videoQuery =
    videoSearch.lessonId === selectedLesson?.id ? videoSearch.query : "";
  const normalizedVideoQuery = videoQuery.trim().toLocaleLowerCase("vi");
  const displayedLessonVideos =
    !selectedLesson || !normalizedVideoQuery
      ? (selectedLesson?.videos ?? [])
      : selectedLesson.videos.filter((video, index) =>
          (video.title ?? `video ${index + 1}`)
            .toLocaleLowerCase("vi")
            .includes(normalizedVideoQuery),
        );
  const selectedVideoUrl = useAuthenticatedUploadUrl(
    selectedVideo?.sourceUrl,
    session.accessToken,
    childProfileId,
  );
  const selectedYouTubeEmbedUrl =
    selectedVideo?.provider === "YOUTUBE" && selectedVideo.embedUrl
      ? toInAppYouTubeEmbedUrl(selectedVideo.embedUrl)
      : undefined;
  const selectedDurationSec = videoDurationSeconds(
    selectedLesson,
    selectedVideo,
  );
  const selectedContextEvidence =
    selectedLesson && planContext?.lessonId === selectedLesson.id
      ? videoEvidenceFromContext(planContext, selectedDurationSec)
      : null;
  const selectedWatchEvidence = selectedLesson
    ? (watchEvidenceByLessonId[selectedLesson.id] ?? selectedContextEvidence)
    : null;
  const localWatchPercent = selectedLesson
    ? watchPercentFromPosition(
        selectedLesson.progress.lastPositionSec,
        selectedDurationSec,
      )
    : 0;
  const displayWatchPercent =
    selectedWatchEvidence?.watchPercent ?? localWatchPercent;
  const requiredWatchPercent =
    selectedWatchEvidence?.minWatchPercent ??
    (selectedLesson && planContext?.lessonId === selectedLesson.id
      ? planContext.minWatchPercent
      : undefined) ??
    80;
  const evidencePassed = selectedWatchEvidence?.passed === true;
  const hasBackendEvidence = Boolean(selectedWatchEvidence);
  const evidenceStatusLabel = videoEvidenceStatusLabel({
    hasBackendEvidence,
    passed: evidencePassed,
    watchPercent: displayWatchPercent,
    minWatchPercent: requiredWatchPercent,
  });
  const loadUsage = useCallback(async () => {
    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/usage/today${cpParam}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as LearningUsageStatus;
      setUsage(data);
      if (data.limitReached) {
        setStudyTimerActive(false);
        setMessage(
          "Hôm nay con đã hết thời gian học. Hãy nhờ bố mẹ cấp thêm thời gian.",
        );
      }
    } catch {
      // Usage is advisory in the UI; backend still enforces the limit.
    }
  }, [authHeaders, childProfileId]);
  const loadFeed = useCallback(async () => {
    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/videos/feed${cpParam}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        await loadUsage();
        throw new Error(
          friendlyLearningError(
            await readApiError(response, "Không thể tải video."),
          ),
        );
      }

      const data = (await response.json()) as VideoFeedPayload;
      const firstCourse = data.courses[0];
      const firstLesson = firstCourse?.units.flatMap((unit) => unit.lessons)[0];
      setFeed(data);
      setUsage(data.deviceUsage ?? null);
      setActiveCourseId((current) => current || firstCourse?.id || "");
      setSelectedLessonId((current) => current || firstLesson?.id || "");
      setMessage(
        firstLesson
          ? "Chọn video và bật xem để hệ thống ghi nhận tiến độ."
          : "Hôm nay chưa có video phù hợp.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải video.",
      );
    }
  }, [authHeaders, childProfileId, loadUsage]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFeed();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFeed]);
  useEffect(() => {
    const syncFullscreenState = () => {
      setIsVideoFullscreen(
        document.fullscreenElement === playerContainerRef.current,
      );
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);
  useEffect(() => {
    if (selectedLesson?.id) {
      onLessonChange?.(selectedLesson.id);
    }
  }, [onLessonChange, selectedLesson?.id]);
  useEffect(() => {
    if (!requestedLessonId || courses.length === 0) {
      return;
    }

    const nextLesson = courses
      .flatMap((course) => course.units)
      .flatMap((unit) => unit.lessons)
      .find((lesson) => lesson.id === requestedLessonId);
    if (!nextLesson) {
      return;
    }

    const nextCourse = courses.find((course) =>
      course.units.some((unit) =>
        unit.lessons.some((lesson) => lesson.id === requestedLessonId),
      ),
    );
    const timer = window.setTimeout(() => {
      setSelectedLessonId(nextLesson.id);
      setActiveCourseId((current) => nextCourse?.id ?? current);
      setActiveSeriesId("");
      setActiveTopicId("");
      setSelectedVideoId(nextLesson.videos[0]?.id ?? "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [courses, requestedLessonId]);
  const applyLessonProgress = useCallback(
    (lessonId: string, progress: VideoFeedLesson["progress"]) => {
      setFeed((current) =>
        current
          ? {
              courses: current.courses.map((course) => ({
                ...course,
                units: course.units.map((unit) => ({
                  ...unit,
                  lessons: unit.lessons.map((lesson) =>
                    lesson.id === lessonId ? { ...lesson, progress } : lesson,
                  ),
                })),
              })),
            }
          : current,
      );
    },
    [],
  );
  const recordWatch = useCallback(
    async (
      lesson: VideoFeedLesson,
      event: "STARTED" | "PROGRESSED" | "COMPLETED" | "REPLAYED",
      lastPositionSec?: number,
      watchedDurationSec?: number,
    ) => {
      try {
        const cpParam = childProfileId
          ? `?childProfileId=${encodeURIComponent(childProfileId)}`
          : "";
        const response = await fetch(
          `${apiBaseUrl}/v1/learning/lessons/${lesson.id}/watch${cpParam}`,
          {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event,
              lastPositionSec: Math.max(0, Math.floor(lastPositionSec ?? 0)),
              ...(watchedDurationSec
                ? {
                    watchedDurationSec: Math.max(
                      1,
                      Math.floor(watchedDurationSec),
                    ),
                  }
                : {}),
            }),
          },
        );
        if (!response.ok) {
          if (response.status === 403) {
            setStudyTimerActive(false);
            await loadUsage();
          }
          throw new Error(
            friendlyLearningError(
              await readApiError(response, "Không thể ghi nhận tiến độ xem."),
            ),
          );
        }

        const progress =
          (await response.json()) as VideoFeedLesson["progress"] & {
            usage?: LearningUsageStatus;
            watchEvidence?: VideoWatchEvidence;
          };
        applyLessonProgress(lesson.id, {
          status: progress.status,
          lastPositionSec: progress.lastPositionSec,
          watchCount: progress.watchCount,
          lastWatchedAt: progress.lastWatchedAt,
          isFavorite: progress.isFavorite,
        });
        if (progress.watchEvidence) {
          setWatchEvidenceByLessonId((current) => ({
            ...current,
            [lesson.id]: progress.watchEvidence as VideoWatchEvidence,
          }));
          setMessage(videoEvidenceMessage(progress.watchEvidence));
        }
        if (progress.usage) {
          setUsage(progress.usage);
          if (progress.usage.limitReached) {
            setStudyTimerActive(false);
            setMessage(
              "Hôm nay con đã hết thời gian học. Hãy nhờ bố mẹ cấp thêm thời gian.",
            );
          }
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Không thể ghi nhận tiến độ xem.",
        );
      }
    },
    [applyLessonProgress, authHeaders, childProfileId, loadUsage],
  );
  useEffect(() => {
    if (!studyTimerActive || !selectedLesson || usage?.limitReached) {
      return;
    }

    const timer = window.setInterval(() => {
      void recordWatch(
        selectedLesson,
        "PROGRESSED",
        selectedLesson.progress.lastPositionSec + 60,
        60,
      );
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, [recordWatch, selectedLesson, studyTimerActive, usage?.limitReached]);
  async function toggleFavorite(lesson: VideoFeedLesson) {
    setIsSaving(true);
    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/lessons/${lesson.id}/favorite${cpParam}`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFavorite: !lesson.progress.isFavorite }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu bài yêu thích."),
        );
      }

      const progress = (await response.json()) as VideoFeedLesson["progress"];
      applyLessonProgress(lesson.id, progress);
      setMessage(
        progress.isFavorite
          ? `Đã lưu ${lesson.title}. Con có thể mở bộ lọc Bài đã lưu để xem lại.`
          : `Đã bỏ lưu ${lesson.title}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu bài yêu thích.",
      );
    } finally {
      setIsSaving(false);
    }
  }
  function selectLesson(lesson: VideoFeedLesson) {
    setSelectedLessonId(lesson.id);
    setSelectedVideoId(lesson.videos[0]?.id ?? "");
    setVideoSearch({ lessonId: lesson.id, query: "" });
    setMessage(
      `Đã chọn ${lesson.title}. Chọn video trong seri rồi bật phiên học khi con sẵn sàng xem.`,
    );
    onLessonChange?.(lesson.id);
  }
  function selectVideo(video: VideoFeedLesson["videos"][number]) {
    if (!selectedLesson) {
      return;
    }

    const videoIndex = selectedLesson.videos.findIndex(
      (item) => item.id === video.id,
    );
    setSelectedVideoId(video.id);
    setMessage(
      `Đã chọn video ${videoIndex + 1}/${selectedLesson.videos.length}. Bật phiên học khi con sẵn sàng xem.`,
    );
  }
  function selectAdjacentVideo(direction: -1 | 1) {
    if (!selectedLesson || selectedVideoIndex < 0) {
      return;
    }

    const nextVideo = selectedLesson.videos[selectedVideoIndex + direction];
    if (nextVideo) {
      selectVideo(nextVideo);
    }
  }
  async function toggleVideoFullscreen() {
    const player = playerContainerRef.current;

    try {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen();
        return;
      }
      if (!player?.requestFullscreen) return;
      await player.requestFullscreen();
    } catch {
      setMessage("Không thể thay đổi chế độ phóng to video trên thiết bị này.");
    }
  }

  return {
    childProfileId,
    onLessonChange,
    planContext,
    requestedLessonId,
    session,
    feed,
    setFeed,
    activeCourseId,
    setActiveCourseId,
    activeTopicId,
    setActiveTopicId,
    activeSeriesId,
    setActiveSeriesId,
    showSavedOnly,
    setShowSavedOnly,
    selectedLessonId,
    setSelectedLessonId,
    selectedVideoId,
    setSelectedVideoId,
    videoSearch,
    setVideoSearch,
    usage,
    setUsage,
    studyTimerActive,
    setStudyTimerActive,
    message,
    setMessage,
    isSaving,
    setIsSaving,
    watchEvidenceByLessonId,
    setWatchEvidenceByLessonId,
    playerContainerRef,
    isVideoFullscreen,
    setIsVideoFullscreen,
    authHeaders,
    courses,
    activeCourse,
    activeCourseUnits,
    topics,
    allLessons,
    activeLessons,
    filteredActiveLessons,
    selectedLesson,
    selectedVideo,
    selectedVideoIndex,
    videoQuery,
    normalizedVideoQuery,
    displayedLessonVideos,
    selectedVideoUrl,
    selectedYouTubeEmbedUrl,
    selectedDurationSec,
    selectedContextEvidence,
    selectedWatchEvidence,
    localWatchPercent,
    displayWatchPercent,
    requiredWatchPercent,
    evidencePassed,
    hasBackendEvidence,
    evidenceStatusLabel,
    loadUsage,
    loadFeed,
    applyLessonProgress,
    recordWatch,
    toggleFavorite,
    selectLesson,
    selectVideo,
    selectAdjacentVideo,
    toggleVideoFullscreen,
  };
}

export type VideoImmersionPanelState = ReturnType<typeof useVideoImmersionPanelState>;
