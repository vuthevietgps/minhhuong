import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from '../admin-content/dto/create-activity.dto';
import { CreateLessonDto } from '../admin-content/dto/create-lesson.dto';
import { CreateQuestionDto } from '../admin-content/dto/create-question.dto';
import {
  CreateVideoLinkDto,
  VideoProviderDto,
} from '../admin-content/dto/create-video-link.dto';
import { UploadVideoDto } from '../admin-content/dto/upload-video.dto';

export class UpdateLessonDto {
  title?: string;
  description?: string;
  durationSec?: number;
  sortOrder?: number;
}

@Injectable()
export class TeacherContentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Overview dashboard counts scoped to this teacher's content.
   */
  async getOverview(user: AuthenticatedUser) {
    const [myLessons, myDrafts, myInReview] = await Promise.all([
      this.prisma.lesson.count({ where: { createdById: user.sub } }),
      this.prisma.lesson.count({
        where: { createdById: user.sub, status: 'DRAFT' },
      }),
      this.prisma.lesson.count({
        where: { createdById: user.sub, status: 'IN_REVIEW' },
      }),
    ]);

    const allCourses = await this.prisma.course.count();

    return {
      allCourses,
      myLessons,
      myStatus: {
        drafts: myDrafts,
        inReview: myInReview,
      },
    };
  }

  /**
   * Full course/unit tree – read-only context so teachers know where to attach lessons.
   */
  listCourses() {
    return this.prisma.course.findMany({
      orderBy: [{ level: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: {
        level: true,
        units: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, title: true, sortOrder: true },
        },
      },
    });
  }

  /**
   * Lessons created by this teacher only, with cursor-based pagination.
   */
  listMyLessons(user: AuthenticatedUser, cursor?: string, take = 50) {
    return this.prisma.lesson.findMany({
      where: { createdById: user.sub },
      orderBy: [{ updatedAt: 'desc' }],
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        unit: {
          include: {
            course: {
              include: { level: true },
            },
          },
        },
        videos: { orderBy: { sortOrder: 'asc' } },
        activities: {
          orderBy: { sortOrder: 'asc' },
          include: {
            questions: {
              orderBy: { sortOrder: 'asc' },
              include: {
                answers: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Single lesson detail – teacher must own the lesson.
   */
  async getLessonById(lessonId: string, user: AuthenticatedUser) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: { include: { course: { include: { level: true } } } },
        videos: { orderBy: { sortOrder: 'asc' } },
        activities: {
          orderBy: { sortOrder: 'asc' },
          include: {
            questions: {
              orderBy: { sortOrder: 'asc' },
              include: { answers: { orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.createdById !== user.sub)
      throw new ForbiddenException('This lesson does not belong to you');

    return lesson;
  }

  /**
   * Update metadata of a DRAFT lesson owned by this teacher.
   */
  async updateLesson(
    lessonId: string,
    dto: UpdateLessonDto,
    user: AuthenticatedUser,
  ) {
    await this.assertOwnedEditableLesson(lessonId, user);

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.durationSec !== undefined
          ? { durationSec: dto.durationSec }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        updatedById: user.sub,
      },
      include: {
        unit: { include: { course: { include: { level: true } } } },
        videos: true,
      },
    });
    await this.audit(user, 'teacher.lesson.update', 'Lesson', updated.id, {
      title: updated.title,
    });

    return updated;
  }

  async createLesson(dto: CreateLessonDto, user: AuthenticatedUser) {
    await this.assertUnit(dto.unitId);
    const slug = await this.uniqueLessonSlug(dto.slug ?? dto.title);
    const lesson = await this.prisma.lesson.create({
      data: {
        unitId: dto.unitId,
        slug,
        title: dto.title.trim(),
        description: dto.description,
        type: dto.type ?? 'VIDEO',
        durationSec: dto.durationSec,
        sortOrder: dto.sortOrder ?? 0,
        status: 'DRAFT',
        createdById: user.sub,
        updatedById: user.sub,
      },
      include: {
        unit: {
          include: {
            course: { include: { level: true } },
          },
        },
        videos: true,
      },
    });
    await this.audit(user, 'teacher.lesson.create', 'Lesson', lesson.id, {
      title: lesson.title,
    });

    return lesson;
  }

  async attachVideoLink(
    lessonId: string,
    dto: CreateVideoLinkDto,
    user: AuthenticatedUser,
  ) {
    await this.assertOwnedEditableLesson(lessonId, user);
    const provider = dto.provider ?? VideoProviderDto.YOUTUBE;
    const normalized = this.normalizeVideoUrl(dto.url, provider);

    const video = await this.prisma.videoAsset.create({
      data: {
        lessonId,
        title: dto.title,
        provider,
        processingStatus: 'READY',
        playbackId: normalized.playbackId,
        sourceUrl: normalized.sourceUrl,
        embedUrl: normalized.embedUrl,
        thumbnailUrl: dto.thumbnailUrl ?? normalized.thumbnailUrl,
        durationSec: dto.durationSec,
        uploadedById: user.sub,
      },
    });
    await this.audit(user, 'teacher.video.link', 'VideoAsset', video.id, {
      lessonId,
      provider,
      sourceUrl: normalized.sourceUrl,
    });

    return video;
  }

  async attachUploadedVideo(
    lessonId: string,
    file: Express.Multer.File | undefined,
    dto: UploadVideoDto,
    user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }
    await this.assertOwnedEditableLesson(lessonId, user);

    const video = await this.prisma.videoAsset.create({
      data: {
        lessonId,
        title: dto.title ?? file.originalname,
        provider: 'INTERNAL',
        processingStatus: 'READY',
        playbackId: file.filename,
        sourceUrl: `/uploads/videos/${file.filename}`,
        storageKey: `videos/${file.filename}`,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        durationSec: dto.durationSec,
        uploadedById: user.sub,
      },
    });
    await this.audit(user, 'teacher.video.upload', 'VideoAsset', video.id, {
      lessonId,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });

    return video;
  }

  async createActivity(
    lessonId: string,
    dto: CreateActivityDto,
    user: AuthenticatedUser,
  ) {
    await this.assertOwnedEditableLesson(lessonId, user);
    const activity = await this.prisma.activity.create({
      data: {
        lessonId,
        title: dto.title.trim(),
        description: dto.description,
        type: dto.type ?? 'QUIZ',
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        questions: {
          include: { answers: true },
        },
      },
    });
    await this.audit(user, 'teacher.activity.create', 'Activity', activity.id, {
      lessonId,
      title: activity.title,
      type: activity.type,
    });

    return activity;
  }

  async createQuestion(
    activityId: string,
    dto: CreateQuestionDto,
    user: AuthenticatedUser,
  ) {
    await this.assertOwnedEditableActivity(activityId, user);
    this.validateQuestion(dto);

    const question = await this.prisma.question.create({
      data: {
        activityId,
        type: dto.type,
        prompt: dto.prompt.trim(),
        explanation: dto.explanation,
        points: dto.points ?? 1,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        answers: {
          create: dto.answers.map((answer, index) => ({
            text: answer.text.trim(),
            isCorrect: answer.isCorrect ?? false,
            sortOrder: answer.sortOrder ?? index,
          })),
        },
      },
      include: {
        answers: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    await this.audit(user, 'teacher.question.create', 'Question', question.id, {
      activityId,
      type: question.type,
    });

    return question;
  }

  async submitLessonForReview(lessonId: string, user: AuthenticatedUser) {
    const current = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { videos: true, activities: true },
    });

    if (!current) {
      throw new NotFoundException('Lesson not found');
    }

    if (current.createdById !== user.sub) {
      throw new ForbiddenException('You can only submit your own lessons');
    }

    if (current.status !== 'DRAFT') {
      throw new BadRequestException('Only draft lessons can be submitted');
    }

    if (current.videos.length === 0 && current.activities.length === 0) {
      throw new BadRequestException(
        'Lesson needs content before review submission',
      );
    }

    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { status: 'IN_REVIEW', updatedById: user.sub },
      include: { videos: true },
    });
    await this.audit(user, 'teacher.lesson.submit_review', 'Lesson', lesson.id);

    return lesson;
  }

  /**
   * Remove a video from a DRAFT lesson owned by this teacher.
   */
  async deleteVideo(
    lessonId: string,
    videoId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertOwnedEditableLesson(lessonId, user);

    const video = await this.prisma.videoAsset.findUnique({
      where: { id: videoId },
      select: { id: true, lessonId: true },
    });
    if (!video) throw new NotFoundException('Video not found');
    if (video.lessonId !== lessonId)
      throw new BadRequestException('Video does not belong to this lesson');

    await this.prisma.videoAsset.delete({ where: { id: videoId } });
    await this.audit(user, 'teacher.video.delete', 'VideoAsset', videoId, {
      lessonId,
    });

    return { deleted: true };
  }

  /**
   * Remove an activity (and its questions) from a DRAFT lesson owned by this teacher.
   */
  async deleteActivity(
    lessonId: string,
    activityId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertOwnedEditableLesson(lessonId, user);

    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, lessonId: true },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.lessonId !== lessonId)
      throw new BadRequestException('Activity does not belong to this lesson');

    await this.prisma.activity.delete({ where: { id: activityId } });
    await this.audit(user, 'teacher.activity.delete', 'Activity', activityId, {
      lessonId,
    });

    return { deleted: true };
  }

  /**
   * Remove a question from a DRAFT lesson's activity owned by this teacher.
   */
  async deleteQuestion(
    activityId: string,
    questionId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertOwnedEditableActivity(activityId, user);

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, activityId: true },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (question.activityId !== activityId)
      throw new BadRequestException(
        'Question does not belong to this activity',
      );

    await this.prisma.question.delete({ where: { id: questionId } });
    await this.audit(user, 'teacher.question.delete', 'Question', questionId, {
      activityId,
    });

    return { deleted: true };
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  private async assertUnit(unitId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');
  }

  /**
   * Checks that the lesson exists, is a DRAFT, and was created by this teacher.
   */
  private async assertOwnedEditableLesson(
    lessonId: string,
    user: AuthenticatedUser,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, status: true, createdById: true },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    if (lesson.createdById !== user.sub) {
      throw new ForbiddenException('You can only edit your own lessons');
    }

    if (lesson.status !== 'DRAFT') {
      throw new BadRequestException('Only draft lessons can be edited');
    }

    return lesson;
  }

  /**
   * Checks that the activity belongs to a DRAFT lesson owned by this teacher.
   */
  private async assertOwnedEditableActivity(
    activityId: string,
    user: AuthenticatedUser,
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        lesson: { select: { status: true, createdById: true } },
      },
    });

    if (!activity) throw new NotFoundException('Activity not found');

    if (activity.lesson.createdById !== user.sub) {
      throw new ForbiddenException(
        'You can only edit activities in your own lessons',
      );
    }

    if (activity.lesson.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft lesson activities can be edited',
      );
    }

    return activity;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private validateQuestion(dto: CreateQuestionDto) {
    if (!dto.answers || dto.answers.length === 0) {
      throw new BadRequestException('Question must have at least one answer');
    }
    const hasCorrect = dto.answers.some((a) => a.isCorrect);
    if (
      ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'ORDERING'].includes(dto.type) &&
      !hasCorrect
    ) {
      throw new BadRequestException(
        'Question must have at least one correct answer',
      );
    }
  }

  private normalizeVideoUrl(url: string, provider: VideoProviderDto) {
    if (provider === VideoProviderDto.YOUTUBE) {
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) throw new BadRequestException('Invalid YouTube URL');

      return {
        playbackId: videoId,
        sourceUrl: url,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    }

    return {
      playbackId: createHash('sha1').update(url).digest('hex'),
      sourceUrl: url,
      embedUrl: url,
      thumbnailUrl: undefined,
    };
  }

  private extractYouTubeVideoId(url: string): string | null {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace(/^www\./, '');

      if (hostname === 'youtu.be') {
        return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
      }

      if (hostname.endsWith('youtube.com')) {
        if (parsed.pathname === '/watch') {
          return parsed.searchParams.get('v');
        }
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0] ?? '')) {
          return parts[1] ?? null;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private async uniqueLessonSlug(input: string) {
    const base = this.slugify(input);
    let slug = base;
    let counter = 2;

    while (await this.prisma.lesson.findUnique({ where: { slug } })) {
      slug = `${base}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  private slugify(input: string): string {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug.length > 0 ? slug : `lesson-${Date.now()}`;
  }

  private async audit(
    user: AuthenticatedUser,
    action: string,
    entityType: string,
    entityId: string,
    summary?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action,
        entityType,
        entityId,
        metadata: (summary ??
          {}) as import('@prisma/client').Prisma.InputJsonValue,
      },
    });
  }
}
