import { DailyLearningPlanItemType, Prisma } from '@prisma/client';
import { LearningCapability } from '../entitlement/entitlement.service';
import { DailyPlanGenerationService } from './daily-plan-generation.service';

export type PlanWithItems = Prisma.DailyLearningPlanGetPayload<{
  include: ReturnType<DailyPlanGenerationService['planInclude']>;
}>;

export const timezone = 'Asia/Bangkok';

export const DEFAULT_MIN_WATCH_PERCENT = 80;

export function capabilityForItem(
  itemType: DailyLearningPlanItemType,
): LearningCapability | undefined {
  if (itemType === DailyLearningPlanItemType.VIDEO) return 'video';
  if (itemType === DailyLearningPlanItemType.PRACTICE) return 'practice';
  return undefined;
}

export function calculateAttemptPercent(score: number, maxScore: number) {
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : score;
}

export function todayInBangkok() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
