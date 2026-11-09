import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DailyPlanController } from './daily-plan.controller';
import { DailyPlanService } from './daily-plan.service';
import { DailyPlanSupportService } from './daily-plan-support.service';
import { DailyPlanGenerationService } from './daily-plan-generation.service';
import { DailyPlanItemsService } from './daily-plan-items.service';
import { ParentDailyPlanService } from './parent-daily-plan.service';

@Module({
  imports: [AuthModule, PrismaModule, LearningAccessModule, EntitlementModule],
  controllers: [DailyPlanController],
  providers: [
    DailyPlanService,
    DailyPlanSupportService,
    DailyPlanGenerationService,
    DailyPlanItemsService,
    ParentDailyPlanService,
  ],
  exports: [DailyPlanService],
})
export class DailyPlanModule {}
