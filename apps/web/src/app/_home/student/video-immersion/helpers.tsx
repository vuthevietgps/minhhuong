"use client";

import { formatStudyMinutes } from "../../lib/format";
import type { ActiveVideoPlanContext, ContentTag, LearningUsageStatus } from "../../types";

export type VideoFeedLesson = {
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

export type VideoWatchEvidence = {
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

export type VideoFeedPayload = {
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

export function toInAppYouTubeEmbedUrl(embedUrl: string) {
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

export function lessonProgressStatusLabel(
  status: VideoFeedLesson["progress"]["status"],
) {
  const labels: Record<VideoFeedLesson["progress"]["status"], string> = {
    NOT_STARTED: "Chưa bắt đầu",
    IN_PROGRESS: "Đang học",
    COMPLETED: "Đã hoàn thành",
  };
  return labels[status];
}

export function videoDurationSeconds(
  lesson?: VideoFeedLesson,
  video?: VideoFeedLesson["videos"][number],
) {
  return Math.max(
    1,
    Math.floor(lesson?.durationSec ?? video?.durationSec ?? 600),
  );
}

export function safeDurationSeconds(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0
    ? Math.max(1, Math.floor(value))
    : fallback;
}

export function watchPercentFromPosition(positionSec: number, durationSec: number) {
  return Math.max(
    0,
    Math.min(100, Math.round((positionSec / Math.max(1, durationSec)) * 100)),
  );
}

export function videoEvidenceFromContext(
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

export function videoEvidenceStatusLabel(input: {
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

export function videoEvidenceStatusClass(input: {
  hasBackendEvidence: boolean;
  passed: boolean;
}) {
  if (!input.hasBackendEvidence) return "bg-slate-200 text-slate-700";
  if (input.passed) return "bg-teal-100 text-teal-700";
  return "bg-amber-100 text-amber-800";
}

export function videoEvidenceMessage(evidence: VideoWatchEvidence) {
  if (evidence.passed) {
    return `Hệ thống đã ghi nhận con xem đủ ${evidence.watchPercent}% video.`;
  }
  return `Hệ thống đã ghi nhận ${evidence.watchPercent}%, cần ${evidence.minWatchPercent}% để hoàn thành.`;
}

export function screenTimeMessage(usage: LearningUsageStatus) {
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
