import { DailyPlanService } from '../daily-plan/daily-plan.service';
import { LearningSupportService } from './learning-support.service';

export function toLearningHomeLesson(
  lesson: Awaited<
    ReturnType<LearningSupportService['getPublishedVideoLessonsForUser']>
  >[number],
) {
  const progress = lesson.progress[0];
  const durationSec = lesson.durationSec ?? lesson.videos[0]?.durationSec ?? 0;
  const lastPositionSec = progress?.lastPositionSec ?? 0;
  const progressPercent =
    progress?.status === 'COMPLETED'
      ? 100
      : durationSec > 0
        ? Math.min(95, Math.round((lastPositionSec / durationSec) * 100))
        : progress?.status === 'IN_PROGRESS'
          ? 40
          : 0;

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    durationSec,
    estimateMinutes: Math.max(5, Math.ceil((durationSec || 600) / 60)),
    courseTitle: lesson.unit.course.title,
    courseSlug: lesson.unit.course.slug,
    unitTitle: lesson.unit.title,
    levelCode: lesson.unit.course.level.code,
    hasPractice: lesson.activities.length > 0,
    tags: lesson.tags.map((item) => item.tag),
    video: lesson.videos[0] ?? null,
    progress: {
      status: progress?.status ?? 'NOT_STARTED',
      score: progress?.score ?? null,
      lastPositionSec,
      watchCount: progress?.watchCount ?? 0,
      lastWatchedAt: progress?.lastWatchedAt ?? null,
      isFavorite: progress?.isFavorite ?? false,
      progressPercent,
    },
  };
}

export function pickContinueLesson(
  lessons: ReturnType<typeof toLearningHomeLesson>[],
) {
  const inProgress = lessons
    .filter((lesson) => lesson.progress.status === 'IN_PROGRESS')
    .sort((left, right) => {
      const leftTime = left.progress.lastWatchedAt?.getTime() ?? 0;
      const rightTime = right.progress.lastWatchedAt?.getTime() ?? 0;
      return rightTime - leftTime;
    })[0];

  return (
    inProgress ??
    lessons.find((lesson) => lesson.progress.status === 'NOT_STARTED') ??
    lessons[0] ??
    null
  );
}

export function toLearningHomeDailyPlan(
  dailyPlan: Awaited<ReturnType<DailyPlanService['getOrGenerateTodayPlan']>>,
) {
  const sourceTitle =
    dailyPlan.contentSource.mode === 'ASSIGNED_PATH'
      ? (dailyPlan.contentSource.learningPathTitle ??
        dailyPlan.contentSource.contentPackageTitle ??
        'Assigned plan')
      : 'Daily plan';

  return dailyPlan.items.map((item) => {
    const lessonTitle = item.lesson?.title ?? 'Assigned lesson';
    const type =
      item.itemType === 'PRACTICE'
        ? 'PRACTICE'
        : item.itemType === 'VIDEO'
          ? 'VIDEO'
          : 'REVIEW';
    const title =
      type === 'PRACTICE'
        ? `Practice ${lessonTitle}`
        : type === 'VIDEO'
          ? `Watch ${lessonTitle}`
          : `Review ${lessonTitle}`;
    const estimateMinutes =
      type === 'VIDEO'
        ? Math.max(5, Math.ceil((item.lesson?.durationSec ?? 600) / 60))
        : 5;

    return {
      id: item.id,
      type,
      title,
      description: item.activity?.title ?? sourceTitle,
      lessonId: item.lessonId,
      estimateMinutes,
      status: item.status === 'LOCKED' ? 'LOCKED' : 'READY',
    };
  });
}

export function buildDailyPlan(
  continueLesson: ReturnType<typeof toLearningHomeLesson> | null,
  nextLesson: ReturnType<typeof toLearningHomeLesson> | undefined,
  usage: Awaited<ReturnType<LearningSupportService['getUsageStatus']>>,
  allLessons: ReturnType<typeof toLearningHomeLesson>[],
) {
  if (usage.limitReached) {
    return [
      {
        id: 'limit-reached',
        type: 'REST',
        title: 'Device limit reached',
        description: 'Learning is paused until a parent adds more time.',
        lessonId: null,
        estimateMinutes: 0,
        status: 'LOCKED',
      },
    ];
  }

  const items: Array<{
    id: string;
    type: 'VIDEO' | 'PRACTICE' | 'NEXT_LESSON' | 'REVIEW';
    title: string;
    description: string;
    lessonId: string;
    estimateMinutes: number;
    status: 'READY';
  }> = [];

  if (continueLesson) {
    const remainingMinutes =
      continueLesson.durationSec > 0
        ? Math.max(
            5,
            Math.ceil(
              Math.max(
                continueLesson.durationSec -
                  continueLesson.progress.lastPositionSec,
                0,
              ) / 60,
            ),
          )
        : continueLesson.estimateMinutes;

    items.push({
      id: `video-${continueLesson.id}`,
      type: 'VIDEO',
      title:
        continueLesson.progress.status === 'IN_PROGRESS'
          ? `Continue ${continueLesson.title}`
          : `Start ${continueLesson.title}`,
      description: `${continueLesson.levelCode} / ${continueLesson.unitTitle}`,
      lessonId: continueLesson.id,
      estimateMinutes: remainingMinutes,
      status: 'READY',
    });

    if (continueLesson.hasPractice) {
      items.push({
        id: `practice-${continueLesson.id}`,
        type: 'PRACTICE',
        title: 'Do the after-video practice',
        description: `Practice follows ${continueLesson.title}`,
        lessonId: continueLesson.id,
        estimateMinutes: 5,
        status: 'READY',
      });
    }
  }

  if (nextLesson && items.length < 3) {
    items.push({
      id: `next-${nextLesson.id}`,
      type: 'NEXT_LESSON',
      title: `Preview ${nextLesson.title}`,
      description: `${nextLesson.levelCode} / ${nextLesson.unitTitle}`,
      lessonId: nextLesson.id,
      estimateMinutes: Math.min(nextLesson.estimateMinutes, 10),
      status: 'READY',
    });
  }

  if (items.length < 3) {
    const reviewLesson = allLessons
      .filter(
        (l) =>
          l.progress.status === 'COMPLETED' &&
          l.progress.score !== null &&
          l.progress.score < 70 &&
          l.id !== continueLesson?.id,
      )
      .sort((a, b) => (a.progress.score ?? 100) - (b.progress.score ?? 100))[0];

    if (reviewLesson) {
      items.push({
        id: `review-${reviewLesson.id}`,
        type: 'REVIEW',
        title: `Review: ${reviewLesson.title}`,
        description: `Score was ${reviewLesson.progress.score}% — redo the practice to improve`,
        lessonId: reviewLesson.id,
        estimateMinutes: 5,
        status: 'READY',
      });
    }
  }

  return items;
}
