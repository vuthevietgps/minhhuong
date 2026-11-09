import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AppHeartbeatDto } from '../screen-time/dto/app-heartbeat.dto';
import { SubmitActivityAttemptDto } from './dto/submit-activity-attempt.dto';
import {
  RecordLessonWatchDto,
  SetLessonFavoriteDto,
} from './dto/video-immersion.dto';
import { LearningHomeService } from './learning-home.service';
import { LearningUsageService } from './learning-usage.service';
import { LessonPracticeService } from './lesson-practice.service';
import { VideoLearningService } from './video-learning.service';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class LearningService {
  constructor(
    private readonly learningUsageService: LearningUsageService,
    private readonly learningHomeService: LearningHomeService,
    private readonly videoLearningService: VideoLearningService,
    private readonly lessonPracticeService: LessonPracticeService,
  ) {}

  heartbeat(
    user: AuthenticatedUser,
    childProfileId: string,
    dto: AppHeartbeatDto,
  ) {
    return this.learningUsageService.heartbeat(user, childProfileId, dto);
  }

  getTodayUsage(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    return this.learningUsageService.getTodayUsage(
      user,
      childProfileId,
      userAgent,
    );
  }

  getLearningHome(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    return this.learningHomeService.getLearningHome(
      user,
      childProfileId,
      userAgent,
    );
  }

  getVideoFeed(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    return this.videoLearningService.getVideoFeed(
      user,
      childProfileId,
      userAgent,
    );
  }

  recordLessonWatch(
    lessonId: string,
    dto: RecordLessonWatchDto,
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    return this.videoLearningService.recordLessonWatch(
      lessonId,
      dto,
      user,
      childProfileId,
      userAgent,
    );
  }

  setLessonFavorite(
    lessonId: string,
    dto: SetLessonFavoriteDto,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    return this.videoLearningService.setLessonFavorite(
      lessonId,
      dto,
      user,
      childProfileId,
    );
  }

  getLessonPractice(
    lessonId: string,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    return this.lessonPracticeService.getLessonPractice(
      lessonId,
      user,
      childProfileId,
    );
  }

  submitAttempt(
    activityId: string,
    dto: SubmitActivityAttemptDto,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    return this.lessonPracticeService.submitAttempt(
      activityId,
      dto,
      user,
      childProfileId,
    );
  }
}
