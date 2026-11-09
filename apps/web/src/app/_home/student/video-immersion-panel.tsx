"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Play,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiBaseUrl, readApiError, useAuthenticatedUploadUrl } from "../lib/api";
import { formatStudyMinutes, formatVideoDuration } from "../lib/format";
import type {
  ActiveVideoPlanContext,
  ContentTag,
  LearningUsageStatus,
  Session,
} from "../types";
import { friendlyLearningError } from "./learning-plan";

type VideoFeedLesson = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  durationSec?: number;
  hasPractice: boolean;
  videos: Array<{
    id: string;
    title?: string;
    provider: "INTERNAL" | "YOUTUBE" | "EXTERNAL";
    sourceUrl?: string;
    embedUrl?: string;
    thumbnailUrl?: string;
    durationSec?: number;
  }>;
  tags: ContentTag[];
  progress: {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    lastPositionSec: number;
    watchCount: number;
    lastWatchedAt?: string | null;
    isFavorite: boolean;
  };
};

type VideoWatchEvidence = {
  evidenceId?: string | null;
  videoAssetId?: string | null;
  eventType?: string | null;
  positionSec: number;
  durationWatchedSec: number;
  watchPercent: number;
  minWatchPercent: number;
  passed: boolean;
  durationSec?: number | null;
  createdAt?: string | null;
};

type VideoFeedPayload = {
  deviceUsage?: LearningUsageStatus;
  courses: Array<{
    id: string;
    slug: string;
    title: string;
    description?: string;
    level: {
      code: string;
      title: string;
    };
    units: Array<{
      id: string;
      title: string;
      description?: string;
      lessons: VideoFeedLesson[];
    }>;
  }>;
};

function toInAppYouTubeEmbedUrl(embedUrl: string) {
  try {
    const url = new URL(embedUrl);
    const supportedHosts = new Set([
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "youtube-nocookie.com",
    ]);

    if (!supportedHosts.has(url.hostname)) {
      return embedUrl;
    }

    url.searchParams.set("playsinline", "1");
    return url.toString();
  } catch {
    return embedUrl;
  }
}

function lessonProgressStatusLabel(
  status: VideoFeedLesson["progress"]["status"],
) {
  const labels: Record<VideoFeedLesson["progress"]["status"], string> = {
    NOT_STARTED: "Chưa bắt đầu",
    IN_PROGRESS: "Đang học",
    COMPLETED: "Đã hoàn thành",
  };
  return labels[status];
}

function videoDurationSeconds(
  lesson?: VideoFeedLesson,
  video?: VideoFeedLesson["videos"][number],
) {
  return Math.max(
    1,
    Math.floor(lesson?.durationSec ?? video?.durationSec ?? 600),
  );
}

function safeDurationSeconds(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0
    ? Math.max(1, Math.floor(value))
    : fallback;
}

function watchPercentFromPosition(positionSec: number, durationSec: number) {
  return Math.max(
    0,
    Math.min(100, Math.round((positionSec / Math.max(1, durationSec)) * 100)),
  );
}

function videoEvidenceFromContext(
  context: ActiveVideoPlanContext,
  durationSec: number,
): VideoWatchEvidence {
  const watchPercent = Math.max(
    0,
    Math.min(100, Math.round(context.watchPercent ?? 0)),
  );
  const minWatchPercent = context.minWatchPercent ?? 80;

  return {
    positionSec: Math.round((durationSec * watchPercent) / 100),
    durationWatchedSec: 0,
    watchPercent,
    minWatchPercent,
    passed: context.passed === true,
    durationSec,
  };
}

function videoEvidenceStatusLabel(input: {
  hasBackendEvidence: boolean;
  passed: boolean;
  watchPercent: number;
  minWatchPercent: number;
}) {
  if (!input.hasBackendEvidence) return "Chưa ghi nhận";
  if (input.passed) return "Đã đủ điều kiện";
  if (input.watchPercent <= 0) return "Chưa xem";
  return `Chưa đủ ${input.minWatchPercent}%`;
}

function videoEvidenceStatusClass(input: {
  hasBackendEvidence: boolean;
  passed: boolean;
}) {
  if (!input.hasBackendEvidence) return "bg-slate-200 text-slate-700";
  if (input.passed) return "bg-teal-100 text-teal-700";
  return "bg-amber-100 text-amber-800";
}

function videoEvidenceMessage(evidence: VideoWatchEvidence) {
  if (evidence.passed) {
    return `Hệ thống đã ghi nhận con xem đủ ${evidence.watchPercent}% video.`;
  }
  return `Hệ thống đã ghi nhận ${evidence.watchPercent}%, cần ${evidence.minWatchPercent}% để hoàn thành.`;
}

function screenTimeMessage(usage: LearningUsageStatus) {
  if (usage.limitReached) {
    return "Hôm nay con đã dùng hết thời gian học trong ứng dụng. Hãy nhờ bố mẹ cộng thêm thời gian cho hôm nay.";
  }
  if (usage.isWarning && usage.remainingMinutes !== null) {
    return `Sắp hết giờ học, còn khoảng ${formatStudyMinutes(usage.remainingMinutes)}.`;
  }
  if (!usage.isLimited) {
    return "Hôm nay chưa đặt giới hạn thời gian học.";
  }
  return "Giới hạn này áp dụng cho thời gian học được ghi nhận trong ứng dụng.";
}

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

      {(topics.length > 0 || activeCourseUnits.length > 0) && (
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
      )}

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
      </div>
    </section>
  );
}
