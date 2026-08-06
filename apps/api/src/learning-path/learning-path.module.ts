import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LearningPathController } from './learning-path.controller';
import { LearningPathService } from './learning-path.service';

@Module({
  imports: [AuthModule, PrismaModule, LearningAccessModule],
  controllers: [LearningPathController],
  providers: [LearningPathService],
  exports: [LearningPathService],
})
export class LearningPathModule {}
