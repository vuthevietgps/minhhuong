import { EntitlementService } from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { DailyPlanGenerationService } from './daily-plan-generation.service';
import { DailyPlanItemsService } from './daily-plan-items.service';
import { DailyPlanSupportService } from './daily-plan-support.service';
import { DailyPlanService } from './daily-plan.service';
import { ParentDailyPlanService } from './parent-daily-plan.service';

/**
 * Builds DailyPlanService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createDailyPlanServiceForTestParts(
  prisma: PrismaService,
  childAccess: ChildAccessService,
  entitlement: EntitlementService,
) {
  const dailyPlanSupportService = new DailyPlanSupportService(
    prisma,
    childAccess,
    entitlement,
  );
  const dailyPlanGenerationService = new DailyPlanGenerationService(
    prisma,
    dailyPlanSupportService,
  );
  const dailyPlanItemsService = new DailyPlanItemsService(
    prisma,
    dailyPlanGenerationService,
    dailyPlanSupportService,
  );
  const parentDailyPlanService = new ParentDailyPlanService(
    prisma,
    dailyPlanSupportService,
    dailyPlanGenerationService,
  );
  const service = new DailyPlanService(
    dailyPlanGenerationService,
    dailyPlanItemsService,
    parentDailyPlanService,
  );
  return {
    service,
    dailyPlanSupportService,
    dailyPlanGenerationService,
    dailyPlanItemsService,
    parentDailyPlanService,
  };
}

export function createDailyPlanServiceForTest(
  prisma: PrismaService,
  childAccess: ChildAccessService,
  entitlement: EntitlementService,
) {
  return createDailyPlanServiceForTestParts(prisma, childAccess, entitlement)
    .service;
}
