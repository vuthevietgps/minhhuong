import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DailyPlanController } from './daily-plan.controller';
import { DailyPlanService } from './daily-plan.service';

@Module({
  imports: [AuthModule, PrismaModule, LearningAccessModule, EntitlementModule],
  controllers: [DailyPlanController],
  providers: [DailyPlanService],
  exports: [DailyPlanService],
})
export class DailyPlanModule {}
