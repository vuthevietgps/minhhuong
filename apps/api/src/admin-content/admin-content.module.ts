import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminContentController } from './admin-content.controller';
import { AdminContentService } from './admin-content.service';
import { AdminContentSupportService } from './admin-content-support.service';
import { CourseContentService } from './course-content.service';
import { ContentTagsService } from './content-tags.service';
import { LessonVideoService } from './lesson-video.service';
import { LessonExerciseService } from './lesson-exercise.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AdminContentController],
  providers: [
    AdminContentService,
    AdminContentSupportService,
    CourseContentService,
    ContentTagsService,
    LessonVideoService,
    LessonExerciseService,
  ],
})
export class AdminContentModule {}
