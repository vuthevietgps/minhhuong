import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DailyPlanModule } from '../daily-plan/daily-plan.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { LearningPathModule } from '../learning-path/learning-path.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    LearningAccessModule,
    EntitlementModule,
    LearningPathModule,
    DailyPlanModule,
  ],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}
