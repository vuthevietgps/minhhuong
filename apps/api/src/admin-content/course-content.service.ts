import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { AdminContentSupportService } from './admin-content-support.service';
import { uniqueSlug } from './admin-content.helpers';
import { validatePublishReadiness } from './course-content.helpers';

/** Courses, units, lessons and the review/publish workflow. */
@Injectable()
export class CourseContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminContentSupportService: AdminContentSupportService,
  ) {}

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
    await this.adminContentSupportService.audit(
      user,
      'content.course.create',
      'Course',
      course.id,
      {
        title: course.title,
      },
    );

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
    await this.adminContentSupportService.audit(
      user,
      'content.unit.create',
      'Unit',
      unit.id,
      {
        title: unit.title,
        courseId: dto.courseId,
      },
    );

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
    await this.adminContentSupportService.audit(
      user,
      'content.lesson.create',
      'Lesson',
      lesson.id,
      {
        title: lesson.title,
      },
    );

    return lesson;
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
    await this.adminContentSupportService.assertEditableLesson(lessonId);
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
    await this.adminContentSupportService.audit(
      user,
      'content.lesson.update',
      'Lesson',
      lesson.id,
      {
        title: lesson.title,
      },
    );
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
    await this.adminContentSupportService.audit(
      user,
      'content.lesson.archive',
      'Lesson',
      lesson.id,
    );
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
    await this.adminContentSupportService.audit(
      user,
      'content.unit.update',
      'Unit',
      unitId,
      {
        title: updated.title,
      },
    );
    return updated;
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
    await this.adminContentSupportService.audit(
      user,
      'content.lesson.submit_review',
      'Lesson',
      lesson.id,
    );

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

    validatePublishReadiness(lesson);

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
    await this.adminContentSupportService.audit(
      user,
      'content.lesson.publish',
      'Lesson',
      lesson.id,
    );

    return published;
  }

  private async uniqueCourseSlug(input: string) {
    return uniqueSlug(input, async (slug) => {
      const existing = await this.prisma.course.findUnique({ where: { slug } });
      return Boolean(existing);
    });
  }

  private async uniqueLessonSlug(input: string) {
    return uniqueSlug(input, async (slug) => {
      const existing = await this.prisma.lesson.findUnique({ where: { slug } });
      return Boolean(existing);
    });
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
}
