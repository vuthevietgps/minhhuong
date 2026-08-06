import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
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
import { CreateQuestionDto, QuestionTypeDto } from './dto/create-question.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import {
  CreateVideoLinkDto,
  VideoProviderDto,
} from './dto/create-video-link.dto';
import { UploadVideoDto } from './dto/upload-video.dto';

type LessonForPublish = Prisma.LessonGetPayload<{
  include: {
    videos: true;
    unit: true;
    activities: {
      include: {
        questions: {
          include: {
            answers: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class AdminContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [courses, lessons, videos, drafts, inReview, published] =
      await Promise.all([
        this.prisma.course.count(),
        this.prisma.lesson.count(),
        this.prisma.videoAsset.count(),
        this.prisma.lesson.count({ where: { status: 'DRAFT' } }),
        this.prisma.lesson.count({ where: { status: 'IN_REVIEW' } }),
        this.prisma.lesson.count({ where: { status: 'PUBLISHED' } }),
      ]);

    return {
      courses,
      lessons,
      videos,
      status: {
        drafts,
        inReview,
        published,
      },
    };
  }

  listCourses() {
    return this.prisma.course.findMany({
      orderBy: [{ level: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: {
        level: true,
        units: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              include: {
                videos: { orderBy: { sortOrder: 'asc' } },
                tags: {
                  include: { tag: true },
                  orderBy: { tag: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      },
    });
  }

  listLessons(cursor?: string, take = 50) {
    return this.prisma.lesson.findMany({
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
        tags: {
          include: { tag: true },
          orderBy: { tag: { sortOrder: 'asc' } },
        },
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

  listTags(query: ContentTagQueryDto) {
    return this.prisma.contentTag.findMany({
      where: {
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      },
      orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });
  }

  async createTag(dto: CreateContentTagDto, user: AuthenticatedUser) {
    const slug = await this.uniqueTagSlug(dto.slug ?? dto.name);
    const tag = await this.prisma.contentTag.create({
      data: {
        slug,
        name: dto.name.trim(),
        kind: dto.kind ?? ContentTagKindDto.TOPIC,
        description: dto.description,
        color: dto.color,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });
    await this.audit(user, 'content.tag.create', 'ContentTag', tag.id, {
      slug,
      kind: tag.kind,
    });

    return tag;
  }

  async updateTag(
    tagId: string,
    dto: UpdateContentTagDto,
    user: AuthenticatedUser,
  ) {
    const tag = await this.prisma.contentTag.update({
      where: { id: tagId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.kind !== undefined ? { kind: dto.kind } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });
    await this.audit(user, 'content.tag.update', 'ContentTag', tag.id, {
      kind: tag.kind,
      isActive: tag.isActive,
    });

    return tag;
  }

  async archiveTag(tagId: string, user: AuthenticatedUser) {
    const tag = await this.prisma.contentTag.update({
      where: { id: tagId },
      data: { isActive: false },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });
    await this.audit(user, 'content.tag.archive', 'ContentTag', tag.id, {
      lessons: tag._count.lessons,
    });

    return tag;
  }

  async setLessonTags(
    lessonId: string,
    dto: SetLessonTagsDto,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableLesson(lessonId);
    const tagIds = [...new Set(dto.tagIds)];
    const tags =
      tagIds.length > 0
        ? await this.prisma.contentTag.findMany({
            where: { id: { in: tagIds }, isActive: true },
            select: { id: true },
          })
        : [];

    if (tags.length !== tagIds.length) {
      throw new BadRequestException('One or more tags are invalid');
    }

    await this.prisma.$transaction([
      this.prisma.lessonTag.deleteMany({ where: { lessonId } }),
      ...(tagIds.length > 0
        ? [
            this.prisma.lessonTag.createMany({
              data: tagIds.map((tagId) => ({ lessonId, tagId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
    await this.audit(user, 'content.lesson.tags_set', 'Lesson', lessonId, {
      tagIds,
    });

    return this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        tags: {
          include: { tag: true },
          orderBy: { tag: { sortOrder: 'asc' } },
        },
      },
    });
  }

  async createCourse(dto: CreateCourseDto, user: AuthenticatedUser) {
    const levelCode = dto.levelCode.trim().toUpperCase();
    const level = await this.prisma.level.upsert({
      where: { code: levelCode },
      update: {},
      create: {
        code: levelCode,
        title: levelCode,
      },
    });
    const slug = await this.uniqueCourseSlug(dto.slug ?? dto.title);

    const course = await this.prisma.course.create({
      data: {
        levelId: level.id,
        title: dto.title.trim(),
        slug,
        description: dto.description,
        isPublished: dto.isPublished ?? false,
      },
      include: { level: true },
    });
    await this.audit(user, 'content.course.create', 'Course', course.id, {
      title: course.title,
    });

    return course;
  }

  async createUnit(dto: CreateUnitDto, user: AuthenticatedUser) {
    await this.assertCourse(dto.courseId);
    const unit = await this.prisma.unit.create({
      data: {
        courseId: dto.courseId,
        title: dto.title.trim(),
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    await this.audit(user, 'content.unit.create', 'Unit', unit.id, {
      title: unit.title,
      courseId: dto.courseId,
    });

    return unit;
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
    await this.audit(user, 'content.lesson.create', 'Lesson', lesson.id, {
      title: lesson.title,
    });

    return lesson;
  }

  async attachVideoLink(
    lessonId: string,
    dto: CreateVideoLinkDto,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableLesson(lessonId);
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
    await this.audit(user, 'content.video.link', 'VideoAsset', video.id, {
      lessonId,
      provider,
      sourceUrl: normalized.sourceUrl,
    });

    return video;
  }

  async createActivity(
    lessonId: string,
    dto: CreateActivityDto,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableLesson(lessonId);
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
    await this.audit(user, 'content.activity.create', 'Activity', activity.id, {
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
    await this.assertEditableActivity(activityId);
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
    await this.audit(user, 'content.question.create', 'Question', question.id, {
      activityId,
      type: question.type,
    });

    return question;
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
    await this.assertEditableLesson(lessonId);

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
    await this.audit(user, 'content.video.upload', 'VideoAsset', video.id, {
      lessonId,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });

    return video;
  }

  async updateLesson(
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
    await this.assertEditableLesson(lessonId);
    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.type !== undefined
          ? { type: dto.type as import('@prisma/client').LessonType }
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
        activities: { include: { questions: { include: { answers: true } } } },
        tags: { include: { tag: true } },
      },
    });
    await this.audit(user, 'content.lesson.update', 'Lesson', lesson.id, {
      title: lesson.title,
    });
    return lesson;
  }

  async archiveLesson(lessonId: string, user: AuthenticatedUser) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, status: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.status === 'ARCHIVED')
      throw new BadRequestException('Lesson is already archived');

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { status: 'ARCHIVED', updatedById: user.sub },
    });
    await this.audit(user, 'content.lesson.archive', 'Lesson', lesson.id);
    return updated;
  }

  async deleteVideo(
    lessonId: string,
    videoId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableLesson(lessonId);
    const video = await this.prisma.videoAsset.findUnique({
      where: { id: videoId },
      select: { id: true, lessonId: true },
    });
    if (!video || video.lessonId !== lessonId)
      throw new NotFoundException('Video not found on this lesson');

    await this.prisma.videoAsset.delete({ where: { id: videoId } });
    await this.audit(user, 'content.video.delete', 'VideoAsset', videoId, {
      lessonId,
    });
    return { deleted: true };
  }

  async updateActivity(
    activityId: string,
    dto: { title?: string; sortOrder?: number },
    user: AuthenticatedUser,
  ) {
    await this.assertEditableActivity(activityId);
    const activity = await this.prisma.activity.update({
      where: { id: activityId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      include: { questions: { include: { answers: true } } },
    });
    await this.audit(user, 'content.activity.update', 'Activity', activity.id, {
      title: activity.title,
    });
    return activity;
  }

  async updateQuestion(
    questionId: string,
    dto: {
      prompt?: string;
      explanation?: string | null;
      points?: number;
      answers?: Array<{ text: string; isCorrect: boolean; sortOrder?: number }>;
    },
    user: AuthenticatedUser,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        activity: { include: { lesson: { select: { status: true } } } },
      },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (question.activity.lesson.status !== 'DRAFT')
      throw new BadRequestException(
        'Only questions in draft lessons can be edited',
      );

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.answers !== undefined) {
        await tx.answer.deleteMany({ where: { questionId } });
        await tx.answer.createMany({
          data: dto.answers.map((a, i) => ({
            questionId,
            text: a.text.trim(),
            isCorrect: a.isCorrect,
            sortOrder: a.sortOrder ?? i,
          })),
        });
      }
      return tx.question.update({
        where: { id: questionId },
        data: {
          ...(dto.prompt !== undefined ? { prompt: dto.prompt.trim() } : {}),
          ...(dto.explanation !== undefined
            ? { explanation: dto.explanation }
            : {}),
          ...(dto.points !== undefined ? { points: dto.points } : {}),
        },
        include: { answers: { orderBy: { sortOrder: 'asc' } } },
      });
    });
    await this.audit(user, 'content.question.update', 'Question', questionId);
    return updated;
  }

  async updateUnit(
    unitId: string,
    dto: { title?: string; description?: string; sortOrder?: number },
    user: AuthenticatedUser,
  ) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');
    const updated = await this.prisma.unit.update({
      where: { id: unitId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
    await this.audit(user, 'content.unit.update', 'Unit', unitId, {
      title: updated.title,
    });
    return updated;
  }

  async deleteActivity(
    lessonId: string,
    activityId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableLesson(lessonId);
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, lessonId: true },
    });
    if (!activity || activity.lessonId !== lessonId)
      throw new NotFoundException('Activity not found on this lesson');

    await this.prisma.activity.delete({ where: { id: activityId } });
    await this.audit(user, 'content.activity.delete', 'Activity', activityId, {
      lessonId,
    });
    return { deleted: true };
  }

  async deleteQuestion(
    activityId: string,
    questionId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableActivity(activityId);
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, activityId: true },
    });
    if (!question || question.activityId !== activityId)
      throw new NotFoundException('Question not found on this activity');

    await this.prisma.question.delete({ where: { id: questionId } });
    await this.audit(user, 'content.question.delete', 'Question', questionId, {
      activityId,
    });
    return { deleted: true };
  }

  async submitLessonForReview(lessonId: string, user: AuthenticatedUser) {
    const current = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        videos: true,
        activities: true,
      },
    });

    if (!current) {
      throw new NotFoundException('Lesson not found');
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
      data: {
        status: 'IN_REVIEW',
        updatedById: user.sub,
      },
      include: { videos: true },
    });
    await this.audit(user, 'content.lesson.submit_review', 'Lesson', lesson.id);

    return lesson;
  }

  async publishLesson(lessonId: string, user: AuthenticatedUser) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        videos: true,
        unit: true,
        activities: {
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    this.validatePublishReadiness(lesson);

    const published = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedById: user.sub,
      },
      include: { videos: true },
    });
    await this.prisma.course.update({
      where: { id: lesson.unit.courseId },
      data: { isPublished: true },
    });
    await this.audit(user, 'content.lesson.publish', 'Lesson', lesson.id);

    return published;
  }

  private normalizeVideoUrl(url: string, provider: VideoProviderDto) {
    if (provider === VideoProviderDto.YOUTUBE) {
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) {
        throw new BadRequestException('Invalid YouTube URL');
      }

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

  private async uniqueCourseSlug(input: string) {
    return this.uniqueSlug(input, async (slug) => {
      const existing = await this.prisma.course.findUnique({ where: { slug } });
      return Boolean(existing);
    });
  }

  private async uniqueLessonSlug(input: string) {
    return this.uniqueSlug(input, async (slug) => {
      const existing = await this.prisma.lesson.findUnique({ where: { slug } });
      return Boolean(existing);
    });
  }

  private async uniqueTagSlug(input: string) {
    return this.uniqueSlug(input, async (slug) => {
      const existing = await this.prisma.contentTag.findUnique({
        where: { slug },
      });
      return Boolean(existing);
    });
  }

  private async uniqueSlug(
    input: string,
    exists: (slug: string) => Promise<boolean>,
  ) {
    const base = this.slugify(input);
    let slug = base;
    let counter = 2;

    while (await exists(slug)) {
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

    return slug.length > 0 ? slug : `item-${Date.now()}`;
  }

  private async assertCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  }

  private async assertUnit(unitId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
  }

  private async assertEditableLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, status: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.status !== 'DRAFT') {
      throw new BadRequestException('Only draft lessons can be edited');
    }

    return lesson;
  }

  private async assertEditableActivity(activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        lesson: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.lesson.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft lesson activities can be edited',
      );
    }

    return activity;
  }

  private validatePublishReadiness(lesson: LessonForPublish) {
    if (lesson.status !== 'IN_REVIEW') {
      throw new BadRequestException('Lesson must be in review before publish');
    }

    if (lesson.videos.length === 0 && lesson.activities.length === 0) {
      throw new BadRequestException('Lesson needs content before publish');
    }

    const notReadyVideo = lesson.videos.find(
      (video) => video.processingStatus !== 'READY',
    );
    if (notReadyVideo) {
      throw new BadRequestException('All lesson videos must be ready');
    }

    for (const activity of lesson.activities) {
      if (activity.questions.length === 0) {
        throw new BadRequestException(
          `Activity "${activity.title}" needs at least one question`,
        );
      }

      for (const question of activity.questions) {
        this.validatePublishedQuestion(question);
      }
    }
  }

  private validatePublishedQuestion(
    question: LessonForPublish['activities'][number]['questions'][number],
  ) {
    if (question.type === 'SPEAKING') {
      throw new BadRequestException(
        'Speaking questions cannot be published until grading is supported',
      );
    }

    const correctAnswers = question.answers.filter(
      (answer) => answer.isCorrect,
    );

    if (question.type === 'SINGLE_CHOICE' && correctAnswers.length !== 1) {
      throw new BadRequestException(
        'Single choice questions need exactly one correct answer',
      );
    }

    if (question.type === 'MULTIPLE_CHOICE' && correctAnswers.length < 1) {
      throw new BadRequestException(
        'Multiple choice questions need at least one correct answer',
      );
    }

    if (question.type === 'TEXT_INPUT' && correctAnswers.length < 1) {
      throw new BadRequestException(
        'Text input questions need at least one accepted answer',
      );
    }

    if (question.type === 'ORDERING' && question.answers.length < 2) {
      throw new BadRequestException(
        'Ordering questions need at least two items',
      );
    }
  }

  private validateQuestion(dto: CreateQuestionDto) {
    const correctAnswers = dto.answers.filter((answer) => answer.isCorrect);

    if (
      dto.type === QuestionTypeDto.SINGLE_CHOICE &&
      correctAnswers.length !== 1
    ) {
      throw new BadRequestException(
        'Single choice questions need exactly one correct answer',
      );
    }

    if (
      dto.type === QuestionTypeDto.MULTIPLE_CHOICE &&
      correctAnswers.length < 1
    ) {
      throw new BadRequestException(
        'Multiple choice questions need at least one correct answer',
      );
    }

    if (dto.type === QuestionTypeDto.TEXT_INPUT && correctAnswers.length < 1) {
      throw new BadRequestException(
        'Text input questions need at least one accepted answer',
      );
    }

    if (dto.type === QuestionTypeDto.ORDERING && dto.answers.length < 2) {
      throw new BadRequestException(
        'Ordering questions need at least two items',
      );
    }
  }

  private async audit(
    user: AuthenticatedUser,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          userId: user.sub.startsWith('demo-') ? undefined : user.sub,
          action,
          entityType,
          entityId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }
}
