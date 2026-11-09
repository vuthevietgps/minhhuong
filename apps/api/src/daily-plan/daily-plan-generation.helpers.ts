import {
  DailyLearningPlanItemStatus,
  DailyLearningPlanItemType,
  Prisma,
} from '@prisma/client';
import { DailyPlanGenerationService } from './daily-plan-generation.service';
import { DailyPlanSupportService } from './daily-plan-support.service';
import { timezone } from './daily-plan.helpers';

export type AssignmentForPlan = NonNullable<
  Awaited<ReturnType<DailyPlanSupportService['findActivePublishedAssignment']>>
>;

export type DefaultPackageForPlan = NonNullable<
  Awaited<ReturnType<DailyPlanGenerationService['findDefaultPublishedPackage']>>
>;

export type PlanPathItem =
  AssignmentForPlan['contentPackage']['learningPath']['items'][number];

export type PlannedItem = {
  sequence: number;
  itemType: DailyLearningPlanItemType;
  lessonId?: string;
  activityId?: string;
  learningPathItemId?: string;
  required: boolean;
  status: DailyLearningPlanItemStatus;
  minWatchPercent?: number;
  minScore?: number;
};

export const DEFAULT_STARTER_PACKAGE_CODE = 'GOGO-BEGINNER-FOUNDATION-V1';

export function buildPlannedItems(pathItem: PlanPathItem): PlannedItem[] {
  const items: PlannedItem[] = [];
  let sequence = 1;
  const primaryActivity = pathItem.lesson.activities[0];

  if (pathItem.lesson.videos.length > 0) {
    items.push({
      sequence: sequence++,
      itemType: DailyLearningPlanItemType.VIDEO,
      lessonId: pathItem.lessonId,
      learningPathItemId: pathItem.id,
      required: pathItem.required,
      status: DailyLearningPlanItemStatus.READY,
      minWatchPercent: pathItem.minWatchPercent ?? 80,
      minScore: pathItem.minScore ?? undefined,
    });
  }

  if (primaryActivity) {
    items.push({
      sequence,
      itemType: DailyLearningPlanItemType.PRACTICE,
      lessonId: pathItem.lessonId,
      activityId: primaryActivity.id,
      learningPathItemId: pathItem.id,
      required: pathItem.required,
      status:
        items.length > 0
          ? DailyLearningPlanItemStatus.LOCKED
          : DailyLearningPlanItemStatus.READY,
      minScore: pathItem.minScore ?? 80,
      minWatchPercent: pathItem.minWatchPercent ?? undefined,
    });
  }

  return items;
}

export function estimateMinutesForItem(
  item: PlannedItem,
  pathItem:
    AssignmentForPlan['contentPackage']['learningPath']['items'][number] | null,
) {
  if (item.itemType === DailyLearningPlanItemType.PRACTICE) {
    return 5;
  }
  const durationSec =
    pathItem?.lesson.durationSec ?? pathItem?.lesson.videos[0]?.durationSec;
  return Math.max(5, Math.ceil((durationSec ?? 600) / 60));
}

export function fallbackResponse(planDate: string) {
  return {
    plan: null,
    planDate,
    timezone,
    generated: false,
    contentSource: {
      mode: 'UNASSIGNED_FALLBACK' as const,
      reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
    },
    items: [],
  };
}

export function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
