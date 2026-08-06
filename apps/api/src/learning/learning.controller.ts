import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { SubmitActivityAttemptDto } from './dto/submit-activity-attempt.dto';
import {
  RecordLessonWatchDto,
  SetLessonFavoriteDto,
} from './dto/video-immersion.dto';
import { LearningService } from './learning.service';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('home')
  getLearningHome(
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.learningService.getLearningHome(
      user,
      childProfileId,
      userAgent,
    );
  }

  @Get('videos/feed')
  getVideoFeed(
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.learningService.getVideoFeed(user, childProfileId, userAgent);
  }

  @Get('usage/today')
  getTodayUsage(
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.learningService.getTodayUsage(user, childProfileId, userAgent);
  }

  @Post('lessons/:lessonId/watch')
  recordLessonWatch(
    @Param('lessonId') lessonId: string,
    @Body() dto: RecordLessonWatchDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.learningService.recordLessonWatch(
      lessonId,
      dto,
      user,
      childProfileId,
      userAgent,
    );
  }

  @Post('lessons/:lessonId/favorite')
  setLessonFavorite(
    @Param('lessonId') lessonId: string,
    @Body() dto: SetLessonFavoriteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
  ) {
    return this.learningService.setLessonFavorite(
      lessonId,
      dto,
      user,
      childProfileId,
    );
  }

  @Get('lessons/:lessonId/practice')
  getLessonPractice(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
  ) {
    return this.learningService.getLessonPractice(
      lessonId,
      user,
      childProfileId,
    );
  }

  @Post('activities/:activityId/attempts')
  submitAttempt(
    @Param('activityId') activityId: string,
    @Body() dto: SubmitActivityAttemptDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query('childProfileId') childProfileId: string = '',
  ) {
    return this.learningService.submitAttempt(
      activityId,
      dto,
      user,
      childProfileId,
    );
  }
}
