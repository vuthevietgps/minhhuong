import { Module } from '@nestjs/common';
import { LocalDemoOnlyGuard } from '../runtime-safety/local-demo-only.guard';
import { LearningLocalDemoController } from './learning-local-demo.controller';
import { LearningLocalDemoService } from './learning-local-demo.service';

@Module({
  controllers: [LearningLocalDemoController],
  providers: [LearningLocalDemoService, LocalDemoOnlyGuard],
  exports: [LearningLocalDemoService],
})
export class LearningLocalDemoModule {}
