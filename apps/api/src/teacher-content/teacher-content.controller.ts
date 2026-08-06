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
  teacherContentManageRoles,
  teacherContentViewRoles,
} from '../auth/permissions';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { filesystemUploadSurfaces } from '../upload-storage/filesystem-upload-storage';
import { createProviderUploadStorage } from '../upload-storage/provider-upload-storage';
import {
  TeacherContentService,
  UpdateLessonDto,
} from './teacher-content.service';
import { CreateActivityDto } from '../admin-content/dto/create-activity.dto';
import { CreateLessonDto } from '../admin-content/dto/create-lesson.dto';
import { CreateQuestionDto } from '../admin-content/dto/create-question.dto';
import { CreateVideoLinkDto } from '../admin-content/dto/create-video-link.dto';
import { UploadVideoDto } from '../admin-content/dto/upload-video.dto';

const allowedVideoMimeTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
]);

@Controller('teacher/content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherContentController {
  constructor(private readonly contentService: TeacherContentService) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────

  /** Tổng quan nội dung của giáo viên đang đăng nhập */
  @Get('overview')
  @Roles(...teacherContentViewRoles)
  getOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.contentService.getOverview(user);
  }

  // ── Xem toàn bộ giáo trình (chỉ đọc) ─────────────────────────────────────

  /** Danh sách tất cả khóa học để giáo viên biết cấu trúc */
  @Get('courses')
  @Roles(...teacherContentViewRoles)
  listCourses() {
    return this.contentService.listCourses();
  }

  /** Chỉ những bài học do giáo viên này tạo (có phân trang qua cursor) */
  @Get('lessons')
  @Roles(...teacherContentViewRoles)
  listMyLessons(
    @CurrentUser() user: AuthenticatedUser,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.contentService.listMyLessons(
      user,
      cursor,
      take ? Math.min(Number(take), 100) : 50,
    );
  }

  /** Xem chi tiết một bài học cụ thể */
  @Get('lessons/:lessonId')
  @Roles(...teacherContentViewRoles)
  getLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.getLessonById(lessonId, user);
  }

  // ── Tạo + Sửa nội dung ────────────────────────────────────────────────────

  /** Tạo bài học mới (draft) trong một unit có sẵn */
  @Post('lessons')
  @Roles(...teacherContentManageRoles)
  createLesson(
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createLesson(dto, user);
  }

  /** Sửa tiêu đề, mô tả, thứ tự, thời lượng của bài học draft */
  @Patch('lessons/:lessonId')
  @Roles(...teacherContentManageRoles)
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.updateLesson(lessonId, dto, user);
  }

  // ── Video ──────────────────────────────────────────────────────────────────────────

  /** Gắn video YouTube hoặc link ngoài vào bài học */
  @Post('lessons/:lessonId/videos/link')
  @Roles(...teacherContentManageRoles)
  attachVideoLink(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateVideoLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.attachVideoLink(lessonId, dto, user);
  }

  /** Upload video từ máy lên server (dev/local) */
  @Post('lessons/:lessonId/videos/upload')
  @Roles(...teacherContentManageRoles)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createProviderUploadStorage(
        filesystemUploadSurfaces.teacherContentVideo,
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

  /** Xóa video khỏi bài học (chỉ khi còn draft) */
  @Delete('lessons/:lessonId/videos/:videoId')
  @Roles(...teacherContentManageRoles)
  deleteVideo(
    @Param('lessonId') lessonId: string,
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.deleteVideo(lessonId, videoId, user);
  }

  // ── Bài tập ────────────────────────────────────────────────────────────────────────

  /** Tạo activity (bài tập) trong bài học */
  @Post('lessons/:lessonId/activities')
  @Roles(...teacherContentManageRoles)
  createActivity(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createActivity(lessonId, dto, user);
  }

  /** Xóa bài tập khỏi bài học (chỉ khi còn draft) */
  @Delete('lessons/:lessonId/activities/:activityId')
  @Roles(...teacherContentManageRoles)
  deleteActivity(
    @Param('lessonId') lessonId: string,
    @Param('activityId') activityId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.deleteActivity(lessonId, activityId, user);
  }

  /** Tạo câu hỏi trong bài tập */
  @Post('activities/:activityId/questions')
  @Roles(...teacherContentManageRoles)
  createQuestion(
    @Param('activityId') activityId: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.createQuestion(activityId, dto, user);
  }

  /** Xóa câu hỏi khỏi bài tập (chỉ khi còn draft) */
  @Delete('activities/:activityId/questions/:questionId')
  @Roles(...teacherContentManageRoles)
  deleteQuestion(
    @Param('activityId') activityId: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.deleteQuestion(activityId, questionId, user);
  }

  // ── Nộp duyệt ─────────────────────────────────────────────────────────────

  /** Gửi bài học cho Admin/Reviewer duyệt trước khi publish */
  @Post('lessons/:lessonId/submit-review')
  @Roles(...teacherContentManageRoles)
  submitForReview(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentService.submitLessonForReview(lessonId, user);
  }
}
