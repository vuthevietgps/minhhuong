import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  contentManageRoles,
  contentPublishRoles,
  contentViewRoles,
} from '../auth/permissions';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { filesystemUploadSurfaces } from '../upload-storage/filesystem-upload-storage';
import { createProviderUploadStorage } from '../upload-storage/provider-upload-storage';
import { AdminContentService } from './admin-content.service';
import {
  ContentTagKindDto,
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

const allowedVideoMimeTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
]);

@Controller('admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminContentController {
  constructor(private readonly contentService: AdminContentService) {}

  @Get('overview')
  @Roles(...contentViewRoles)
  getOverview() {
    return this.contentService.getOverview();
  }

  @Get('courses')
  @Roles(...contentViewRoles)
  listCourses() {
    return this.contentService.listCourses();
  }

  @Get('lessons')
  @Roles(...contentViewRoles)
  listLessons(@Query('cursor') cursor?: string, @Query('take') take?: string) {
    return this.contentService.listLessons(
      cursor,
      take ? Math.min(Number(take), 100) : 50,
    );
  }

  @Get('tags')
  @Roles(...contentViewRoles)
  listTags(@Query() query: ContentTagQueryDto) {
    return this.contentService.listTags(query);
  }

  @Get('topics')
  @Roles(...contentViewRoles)
  listTopics() {
    return this.contentService.listTags({ kind: ContentTagKindDto.TOPIC });
  }

  @Post('tags')
  @Roles(...contentManageRoles)
  createTag(
    @Body() dto: CreateContentTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createTag(dto, user);
  }

  @Patch('tags/:tagId')
  @Roles(...contentManageRoles)
  updateTag(
    @Param('tagId') tagId: string,
    @Body() dto: UpdateContentTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.updateTag(tagId, dto, user);
  }

  @Delete('tags/:tagId')
  @Roles(...contentManageRoles)
  archiveTag(
    @Param('tagId') tagId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.archiveTag(tagId, user);
  }

  @Post('courses')
  @Roles(...contentManageRoles)
  createCourse(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createCourse(dto, user);
  }

  @Post('units')
  @Roles(...contentManageRoles)
  createUnit(
    @Body() dto: CreateUnitDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createUnit(dto, user);
  }

  @Post('lessons')
  @Roles(...contentManageRoles)
  createLesson(
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createLesson(dto, user);
  }

  @Post('lessons/:lessonId/videos/link')
  @Roles(...contentManageRoles)
  attachVideoLink(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateVideoLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.attachVideoLink(lessonId, dto, user);
  }

  @Post('lessons/:lessonId/tags')
  @Roles(...contentManageRoles)
  setLessonTags(
    @Param('lessonId') lessonId: string,
    @Body() dto: SetLessonTagsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.setLessonTags(lessonId, dto, user);
  }

  @Post('lessons/:lessonId/activities')
  @Roles(...contentManageRoles)
  createActivity(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createActivity(lessonId, dto, user);
  }

  @Post('activities/:activityId/questions')
  @Roles(...contentManageRoles)
  createQuestion(
    @Param('activityId') activityId: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createQuestion(activityId, dto, user);
  }

  @Post('lessons/:lessonId/videos/upload')
  @Roles(...contentManageRoles)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createProviderUploadStorage(
        filesystemUploadSurfaces.adminContentVideo,
      ),
      limits: { fileSize: 1024 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        callback(null, allowedVideoMimeTypes.has(file.mimetype));
      },
    }),
  )
  uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadVideoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.attachUploadedVideo(lessonId, file, dto, user);
  }

  @Post('lessons/:lessonId/submit-review')
  @Roles(...contentManageRoles)
  submitReview(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.submitLessonForReview(lessonId, user);
  }

  @Patch('activities/:activityId')
  @Roles(...contentManageRoles)
  updateActivity(
    @Param('activityId') activityId: string,
    @Body() dto: { title?: string; sortOrder?: number },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.updateActivity(activityId, dto, user);
  }

  @Patch('questions/:questionId')
  @Roles(...contentManageRoles)
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body()
    dto: {
      prompt?: string;
      explanation?: string | null;
      points?: number;
      answers?: Array<{ text: string; isCorrect: boolean; sortOrder?: number }>;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.updateQuestion(questionId, dto, user);
  }

  @Patch('units/:unitId')
  @Roles(...contentManageRoles)
  updateUnit(
    @Param('unitId') unitId: string,
    @Body() dto: { title?: string; description?: string; sortOrder?: number },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.updateUnit(unitId, dto, user);
  }

  @Patch('lessons/:lessonId')
  @Roles(...contentManageRoles)
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body()
    dto: {
      title?: string;
      description?: string;
      type?: string;
      durationSec?: number;
      sortOrder?: number;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.updateLesson(lessonId, dto, user);
  }

  @Post('lessons/:lessonId/archive')
  @Roles(...contentManageRoles)
  archiveLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.archiveLesson(lessonId, user);
  }

  @Delete('lessons/:lessonId/videos/:videoId')
  @Roles(...contentManageRoles)
  deleteVideo(
    @Param('lessonId') lessonId: string,
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.deleteVideo(lessonId, videoId, user);
  }

  @Delete('lessons/:lessonId/activities/:activityId')
  @Roles(...contentManageRoles)
  deleteActivity(
    @Param('lessonId') lessonId: string,
    @Param('activityId') activityId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.deleteActivity(lessonId, activityId, user);
  }

  @Delete('activities/:activityId/questions/:questionId')
  @Roles(...contentManageRoles)
  deleteQuestion(
    @Param('activityId') activityId: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.deleteQuestion(activityId, questionId, user);
  }

  @Post('lessons/:lessonId/publish')
  @Roles(...contentPublishRoles)
  publishLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.publishLesson(lessonId, user);
  }
}
