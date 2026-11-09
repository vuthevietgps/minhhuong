import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import {
  ContentTagQueryDto,
  CreateContentTagDto,
  SetLessonTagsDto,
  UpdateContentTagDto,
} from './dto/content-tag.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateVideoLinkDto } from './dto/create-video-link.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { ContentTagsService } from './content-tags.service';
import { CourseContentService } from './course-content.service';
import { LessonExerciseService } from './lesson-exercise.service';
import { LessonVideoService } from './lesson-video.service';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class AdminContentService {
  constructor(
    private readonly courseContentService: CourseContentService,
    private readonly contentTagsService: ContentTagsService,
    private readonly lessonVideoService: LessonVideoService,
    private readonly lessonExerciseService: LessonExerciseService,
  ) {}

  getOverview() {
    return this.courseContentService.getOverview();
  }

  listCourses() {
    return this.courseContentService.listCourses();
  }

  listLessons(cursor?: string, take = 50) {
    return this.courseContentService.listLessons(cursor, take);
  }

  listTags(query: ContentTagQueryDto) {
    return this.contentTagsService.listTags(query);
  }

  createTag(dto: CreateContentTagDto, user: AuthenticatedUser) {
    return this.contentTagsService.createTag(dto, user);
  }

  updateTag(tagId: string, dto: UpdateContentTagDto, user: AuthenticatedUser) {
    return this.contentTagsService.updateTag(tagId, dto, user);
  }

  archiveTag(tagId: string, user: AuthenticatedUser) {
    return this.contentTagsService.archiveTag(tagId, user);
  }

  setLessonTags(
    lessonId: string,
    dto: SetLessonTagsDto,
    user: AuthenticatedUser,
  ) {
    return this.contentTagsService.setLessonTags(lessonId, dto, user);
  }

  createCourse(dto: CreateCourseDto, user: AuthenticatedUser) {
    return this.courseContentService.createCourse(dto, user);
  }

  createUnit(dto: CreateUnitDto, user: AuthenticatedUser) {
    return this.courseContentService.createUnit(dto, user);
  }

  createLesson(dto: CreateLessonDto, user: AuthenticatedUser) {
    return this.courseContentService.createLesson(dto, user);
  }

  attachVideoLink(
    lessonId: string,
    dto: CreateVideoLinkDto,
    user: AuthenticatedUser,
  ) {
    return this.lessonVideoService.attachVideoLink(lessonId, dto, user);
  }

  createActivity(
    lessonId: string,
    dto: CreateActivityDto,
    user: AuthenticatedUser,
  ) {
    return this.lessonExerciseService.createActivity(lessonId, dto, user);
  }

  createQuestion(
    activityId: string,
    dto: CreateQuestionDto,
    user: AuthenticatedUser,
  ) {
    return this.lessonExerciseService.createQuestion(activityId, dto, user);
  }

  attachUploadedVideo(
    lessonId: string,
    file: Express.Multer.File | undefined,
    dto: UploadVideoDto,
    user: AuthenticatedUser,
  ) {
    return this.lessonVideoService.attachUploadedVideo(
      lessonId,
      file,
      dto,
      user,
    );
  }

  updateLesson(
    lessonId: string,
    dto: {
      title?: string;
      description?: string;
      type?: string;
      durationSec?: number;
      sortOrder?: number;
    },
    user: AuthenticatedUser,
  ) {
    return this.courseContentService.updateLesson(lessonId, dto, user);
  }

  archiveLesson(lessonId: string, user: AuthenticatedUser) {
    return this.courseContentService.archiveLesson(lessonId, user);
  }

  deleteVideo(lessonId: string, videoId: string, user: AuthenticatedUser) {
    return this.lessonVideoService.deleteVideo(lessonId, videoId, user);
  }

  updateActivity(
    activityId: string,
    dto: { title?: string; sortOrder?: number },
    user: AuthenticatedUser,
  ) {
    return this.lessonExerciseService.updateActivity(activityId, dto, user);
  }

  updateQuestion(
    questionId: string,
    dto: {
      prompt?: string;
      explanation?: string | null;
      points?: number;
      answers?: Array<{ text: string; isCorrect: boolean; sortOrder?: number }>;
    },
    user: AuthenticatedUser,
  ) {
    return this.lessonExerciseService.updateQuestion(questionId, dto, user);
  }

  updateUnit(
    unitId: string,
    dto: { title?: string; description?: string; sortOrder?: number },
    user: AuthenticatedUser,
  ) {
    return this.courseContentService.updateUnit(unitId, dto, user);
  }

  deleteActivity(
    lessonId: string,
    activityId: string,
    user: AuthenticatedUser,
  ) {
    return this.lessonExerciseService.deleteActivity(
      lessonId,
      activityId,
      user,
    );
  }

  deleteQuestion(
    activityId: string,
    questionId: string,
    user: AuthenticatedUser,
  ) {
    return this.lessonExerciseService.deleteQuestion(
      activityId,
      questionId,
      user,
    );
  }

  submitLessonForReview(lessonId: string, user: AuthenticatedUser) {
    return this.courseContentService.submitLessonForReview(lessonId, user);
  }

  publishLesson(lessonId: string, user: AuthenticatedUser) {
    return this.courseContentService.publishLesson(lessonId, user);
  }
}
