import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DailyPlanModule } from '../daily-plan/daily-plan.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { LearningPathModule } from '../learning-path/learning-path.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { LearningSupportService } from './learning-support.service';
import { LearningUsageService } from './learning-usage.service';
import { LearningHomeService } from './learning-home.service';
import { VideoLearningService } from './video-learning.service';
import { LessonPracticeService } from './lesson-practice.service';

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
  providers: [
    LearningService,
    LearningSupportService,
    LearningUsageService,
    LearningHomeService,
    VideoLearningService,
    LessonPracticeService,
  ],
})
export class LearningModule {}
