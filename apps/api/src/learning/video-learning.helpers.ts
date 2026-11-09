import { VideoExposureEventType } from '@prisma/client';
import { WatchEventDto } from './dto/video-immersion.dto';
import { LearningSupportService } from './learning-support.service';

export const DEFAULT_MIN_WATCH_PERCENT = 80;

export const DEFAULT_VIDEO_DURATION_SEC = 600;

export function toVideoFeedCourses(
  lessons: Awaited<
    ReturnType<LearningSupportService['getPublishedVideoLessonsForUser']>
  >,
) {
  type VideoFeedUnit = {
    id: string;
    title: string;
    description: string | null;
    lessons: Array<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      durationSec: number | null;
      videos: (typeof lessons)[number]['videos'];
      hasPractice: boolean;
      tags: Array<(typeof lessons)[number]['tags'][number]['tag']>;
      progress: {
        status: string;
        lastPositionSec: number;
        watchCount: number;
        lastWatchedAt: Date | null;
        isFavorite: boolean;
      };
    }>;
  };
  type VideoFeedCourse = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    level: {
      code: string;
      title: string;
    };
    units: VideoFeedUnit[];
  };

  const courses = new Map<string, VideoFeedCourse>();
  const unitsByKey = new Map<string, VideoFeedUnit>();

  for (const lesson of lessons) {
    const courseKey = lesson.unit.course.slug;
    let course = courses.get(courseKey);

    if (!course) {
      course = {
        id: lesson.unit.course.id,
        slug: lesson.unit.course.slug,
        title: lesson.unit.course.title,
        description: lesson.unit.course.description,
        level: {
          code: lesson.unit.course.level.code,
          title: lesson.unit.course.level.title,
        },
        units: [],
      };
      courses.set(courseKey, course);
    }

    const unitKey = `${courseKey}:${lesson.unit.id}`;
    let unit = unitsByKey.get(unitKey);

    if (!unit) {
      unit = {
        id: lesson.unit.id,
        title: lesson.unit.title,
        description: lesson.unit.description,
        lessons: [],
      };
      unitsByKey.set(unitKey, unit);
      course.units.push(unit);
    }

    const progress = lesson.progress[0];
    unit.lessons.push({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      durationSec: lesson.durationSec,
      videos: lesson.videos,
      hasPractice: lesson.activities.length > 0,
      tags: lesson.tags.map((item) => item.tag),
      progress: progress
        ? {
            status: progress.status,
            lastPositionSec: progress.lastPositionSec,
            watchCount: progress.watchCount,
            lastWatchedAt: progress.lastWatchedAt,
            isFavorite: progress.isFavorite,
          }
        : {
            status: 'NOT_STARTED',
            lastPositionSec: 0,
            watchCount: 0,
            lastWatchedAt: null,
            isFavorite: false,
          },
    });
  }

  return Array.from(courses.values());
}

export function normalizeWatchedDuration(value?: number) {
  return Math.max(0, Math.min(Math.floor(value ?? 0), 15 * 60));
}

export function calculateAcceptedWatchPosition(input: {
  previousPositionSec: number;
  reportedPositionSec: number;
  durationWatchedSec: number;
  durationSec: number;
}) {
  const durationSec = Math.max(1, input.durationSec);
  const previousPositionSec = Math.max(
    0,
    Math.min(Math.floor(input.previousPositionSec), durationSec),
  );
  const reportedPositionSec = Math.max(
    0,
    Math.min(Math.floor(input.reportedPositionSec), durationSec),
  );
  const maxPositionByDuration = Math.min(
    durationSec,
    previousPositionSec + input.durationWatchedSec,
  );

  return Math.max(
    previousPositionSec,
    Math.min(reportedPositionSec, maxPositionByDuration),
  );
}

export function calculateWatchPercent(
  positionSec: number,
  durationSec: number,
) {
  return Math.max(
    0,
    Math.min(100, Math.round((positionSec / Math.max(1, durationSec)) * 100)),
  );
}

export function toVideoExposureEventType(event: WatchEventDto) {
  const eventTypes: Record<WatchEventDto, VideoExposureEventType> = {
    [WatchEventDto.STARTED]: VideoExposureEventType.STARTED,
    [WatchEventDto.PROGRESSED]: VideoExposureEventType.PROGRESSED,
    [WatchEventDto.COMPLETED]: VideoExposureEventType.COMPLETED,
    [WatchEventDto.REPLAYED]: VideoExposureEventType.REPLAYED,
  };

  return eventTypes[event];
}
