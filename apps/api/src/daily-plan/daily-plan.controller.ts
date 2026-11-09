import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { DailyPlanService } from './daily-plan.service';
import { SetParentDailyPlanDto } from './dto/set-parent-daily-plan.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DailyPlanController {
  constructor(private readonly dailyPlanService: DailyPlanService) {}

  @Get('learning/daily-plans/today')
  getLearningTodayPlan(
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
  ) {
    return this.dailyPlanService.getOrGenerateTodayPlan(user, childProfileId);
  }

  @Post('learning/daily-plans/:planId/items/:itemId/start')
  startPlanItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.dailyPlanService.startItem(planId, itemId, user);
  }

  @Post('learning/daily-plans/:planId/items/:itemId/complete')
  completePlanItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.dailyPlanService.completeItem(planId, itemId, user);
  }

  @Post('learning/daily-plans/:planId/items/:itemId/skip')
  skipPlanItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.dailyPlanService.skipItem(planId, itemId, user);
  }

  @Get('parent/children/:childProfileId/daily-plans/today')
  @Roles('PARENT')
  getParentTodayPlan(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childProfileId') childProfileId: string,
  ) {
    return this.dailyPlanService.getOrGenerateTodayPlan(user, childProfileId);
  }

  @Get('parent/children/:childProfileId/daily-plan-candidates')
  @Roles('PARENT')
  listParentDailyPlanCandidates(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childProfileId') childProfileId: string,
    @Query('query') query: string = '',
  ) {
    return this.dailyPlanService.listParentDailyPlanCandidates(
      user,
      childProfileId,
      query,
    );
  }

  @Post('parent/children/:childProfileId/daily-plans/today')
  @Roles('PARENT')
  setParentTodayPlan(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childProfileId') childProfileId: string,
    @Body() dto: SetParentDailyPlanDto,
  ) {
    return this.dailyPlanService.setParentTodayPlan(childProfileId, dto, user);
  }
}
