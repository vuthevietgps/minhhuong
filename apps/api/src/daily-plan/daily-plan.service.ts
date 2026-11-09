import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { SetParentDailyPlanDto } from './dto/set-parent-daily-plan.dto';
import { DailyPlanGenerationService } from './daily-plan-generation.service';
import { DailyPlanItemsService } from './daily-plan-items.service';
import { ParentDailyPlanService } from './parent-daily-plan.service';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class DailyPlanService {
  constructor(
    private readonly dailyPlanGenerationService: DailyPlanGenerationService,
    private readonly dailyPlanItemsService: DailyPlanItemsService,
    private readonly parentDailyPlanService: ParentDailyPlanService,
  ) {}

  getOrGenerateTodayPlan(user: AuthenticatedUser, childProfileId: string) {
    return this.dailyPlanGenerationService.getOrGenerateTodayPlan(
      user,
      childProfileId,
    );
  }

  getOrGeneratePlanForDate(
    user: AuthenticatedUser,
    childProfileId: string,
    planDate: string,
  ) {
    return this.dailyPlanGenerationService.getOrGeneratePlanForDate(
      user,
      childProfileId,
      planDate,
    );
  }

  startItem(planId: string, itemId: string, user: AuthenticatedUser) {
    return this.dailyPlanItemsService.startItem(planId, itemId, user);
  }

  completeItem(planId: string, itemId: string, user: AuthenticatedUser) {
    return this.dailyPlanItemsService.completeItem(planId, itemId, user);
  }

  skipItem(planId: string, itemId: string, user: AuthenticatedUser) {
    return this.dailyPlanItemsService.skipItem(planId, itemId, user);
  }

  listParentDailyPlanCandidates(
    user: AuthenticatedUser,
    childProfileId: string,
    query: string,
  ) {
    return this.parentDailyPlanService.listParentDailyPlanCandidates(
      user,
      childProfileId,
      query,
    );
  }

  setParentTodayPlan(
    childProfileId: string,
    dto: SetParentDailyPlanDto,
    user: AuthenticatedUser,
  ) {
    return this.parentDailyPlanService.setParentTodayPlan(
      childProfileId,
      dto,
      user,
    );
  }

  planInclude() {
    return this.dailyPlanGenerationService.planInclude();
  }
}
