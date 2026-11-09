export type ChildProgressSummary = {
  completedLessons: number;
  inProgressLessons: number;
  watchedLessons: number;
  totalWatchCount: number;
  weeklyStudyMinutes: number;
  currentLesson?: {
    id: string;
    title: string;
    progressPercent: number;
    hasPractice: boolean;
    lastWatchedAt: Date | null;
  };
};

export type ChildDeviceUsageSummary = {
  usedSeconds: number;
  byDevice: Array<{
    deviceType: string;
    usedSeconds: number;
  }>;
};

export function summarizeProgress(
  progressItems: Array<{
    childProfileId: string;
    status: string;
    lastPositionSec: number;
    watchCount: number;
    lastWatchedAt: Date | null;
    lesson: {
      id: string;
      title: string;
      durationSec: number | null;
      activities: Array<{ id: string }>;
    };
  }>,
) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const progressByChildId = new Map<string, ChildProgressSummary>();

  for (const item of progressItems) {
    const summary =
      progressByChildId.get(item.childProfileId) ?? emptyProgress();
    const studiedSeconds =
      item.status === 'COMPLETED'
        ? (item.lesson.durationSec ?? item.lastPositionSec)
        : item.lastPositionSec;

    summary.watchedLessons += 1;
    summary.totalWatchCount += item.watchCount;

    if (item.status === 'COMPLETED') summary.completedLessons += 1;
    if (item.status === 'IN_PROGRESS') summary.inProgressLessons += 1;

    if (item.lastWatchedAt && item.lastWatchedAt >= weekAgo) {
      summary.weeklyStudyMinutes += Math.ceil(Math.max(studiedSeconds, 0) / 60);
    }

    const progressPercent =
      item.status === 'COMPLETED'
        ? 100
        : item.lesson.durationSec && item.lesson.durationSec > 0
          ? Math.min(
              95,
              Math.round(
                (item.lastPositionSec / item.lesson.durationSec) * 100,
              ),
            )
          : item.status === 'IN_PROGRESS'
            ? 40
            : 0;

    const current = summary.currentLesson;
    if (
      item.lastWatchedAt &&
      (!current?.lastWatchedAt || item.lastWatchedAt > current.lastWatchedAt)
    ) {
      summary.currentLesson = {
        id: item.lesson.id,
        title: item.lesson.title,
        progressPercent,
        hasPractice: (item.lesson.activities ?? []).length > 0,
        lastWatchedAt: item.lastWatchedAt,
      };
    }

    progressByChildId.set(item.childProfileId, summary);
  }

  return progressByChildId;
}

export function emptyProgress(): ChildProgressSummary {
  return {
    completedLessons: 0,
    inProgressLessons: 0,
    watchedLessons: 0,
    totalWatchCount: 0,
    weeklyStudyMinutes: 0,
  };
}

export function summarizeDeviceUsage(
  usageItems: Array<{
    childProfileId: string;
    deviceType: string;
    usedSeconds: number;
  }>,
) {
  const usageByChildId = new Map<string, ChildDeviceUsageSummary>();

  for (const item of usageItems) {
    const summary =
      usageByChildId.get(item.childProfileId) ?? emptyDeviceUsage();
    summary.usedSeconds += item.usedSeconds;
    summary.byDevice.push({
      deviceType: item.deviceType,
      usedSeconds: item.usedSeconds,
    });
    usageByChildId.set(item.childProfileId, summary);
  }

  return usageByChildId;
}

export function emptyDeviceUsage(): ChildDeviceUsageSummary {
  return { usedSeconds: 0, byDevice: [] };
}

export function toDeviceUsage(
  setting: { isEnabled: boolean; dailyLimitMinutes: number } | null,
  extraMinutesToday: number,
  usage: ChildDeviceUsageSummary,
  usageDate: string,
) {
  const baseLimitMinutes = setting?.isEnabled
    ? setting.dailyLimitMinutes
    : null;
  const limitMinutes =
    baseLimitMinutes === null ? null : baseLimitMinutes + extraMinutesToday;
  const limitSeconds = limitMinutes === null ? null : limitMinutes * 60;
  const remainingSeconds =
    limitSeconds === null
      ? null
      : Math.max(0, limitSeconds - usage.usedSeconds);

  return {
    usageDate,
    isLimited: limitMinutes !== null,
    limitMinutes,
    baseLimitMinutes,
    grantedExtraMinutes: extraMinutesToday,
    usedSeconds: usage.usedSeconds,
    usedMinutes: Math.ceil(usage.usedSeconds / 60),
    remainingSeconds,
    remainingMinutes:
      remainingSeconds === null ? null : Math.ceil(remainingSeconds / 60),
    limitReached: limitSeconds !== null && usage.usedSeconds >= limitSeconds,
    byDevice: usage.byDevice.map((item) => ({
      deviceType: item.deviceType,
      usedSeconds: item.usedSeconds,
      usedMinutes: Math.ceil(item.usedSeconds / 60),
    })),
  };
}

export function sumExtraMinutes(grants: Array<{ extraMinutes: number }>) {
  return grants.reduce((sum, grant) => sum + grant.extraMinutes, 0);
}

export function toInsight(
  progress: ChildProgressSummary,
  usage: ChildDeviceUsageSummary,
  setting: { isEnabled: boolean; dailyLimitMinutes: number } | null,
  extraMinutesToday: number,
) {
  const effectiveLimit = setting?.isEnabled
    ? setting.dailyLimitMinutes + extraMinutesToday
    : null;
  const usedMinutes = Math.ceil(usage.usedSeconds / 60);

  if (effectiveLimit !== null && usedMinutes >= effectiveLimit) {
    return {
      status: 'LIMIT_REACHED',
      title: 'Đã hết thời gian thiết bị hôm nay',
      description: progress.currentLesson
        ? `${progress.currentLesson.title} đang tạm dừng ở ${progress.currentLesson.progressPercent}%.`
        : 'Học tập đã dừng cho đến khi được cộng thêm thời gian.',
      recommendedAction:
        'Cộng thêm 10 hoặc 15 phút nếu con cần hoàn thành bài hôm nay.',
      currentLesson: progress.currentLesson ?? null,
    };
  }

  if (
    progress.currentLesson?.hasPractice &&
    progress.currentLesson.progressPercent >= 70
  ) {
    return {
      status: 'PRACTICE_READY',
      title: 'Sẵn sàng làm bài kiểm tra',
      description: `${progress.currentLesson.title} đã xem đủ để làm bài kiểm tra sau video.`,
      recommendedAction: 'Nhắc con làm nhanh phần kiểm tra trước khi tắt máy.',
      currentLesson: progress.currentLesson,
    };
  }

  if (progress.currentLesson) {
    return {
      status: 'IN_PROGRESS',
      title: 'Tiếp tục bài đang học',
      description: `${progress.currentLesson.title} đang ở ${progress.currentLesson.progressPercent}%.`,
      recommendedAction: 'Giữ mỗi buổi học ngắn và tập trung.',
      currentLesson: progress.currentLesson,
    };
  }

  return {
    status: 'NO_ACTIVITY',
    title: 'Chưa có hoạt động học tập',
    description: 'Con chưa xem bài học nào.',
    recommendedAction: 'Bắt đầu với video bài học đầu tiên.',
    currentLesson: null,
  };
}
