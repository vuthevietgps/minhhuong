import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContentTagKindDto,
  ContentTagQueryDto,
  CreateContentTagDto,
  SetLessonTagsDto,
  UpdateContentTagDto,
} from './dto/content-tag.dto';
import { AdminContentSupportService } from './admin-content-support.service';
import { uniqueSlug } from './admin-content.helpers';

/** Content tags and lesson tagging. */
@Injectable()
export class ContentTagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminContentSupportService: AdminContentSupportService,
  ) {}

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
    await this.adminContentSupportService.audit(
      user,
      'content.tag.create',
      'ContentTag',
      tag.id,
      {
        slug,
        kind: tag.kind,
      },
    );

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
    await this.adminContentSupportService.audit(
      user,
      'content.tag.update',
      'ContentTag',
      tag.id,
      {
        kind: tag.kind,
        isActive: tag.isActive,
      },
    );

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
    await this.adminContentSupportService.audit(
      user,
      'content.tag.archive',
      'ContentTag',
      tag.id,
      {
        lessons: tag._count.lessons,
      },
    );

    return tag;
  }

  async setLessonTags(
    lessonId: string,
    dto: SetLessonTagsDto,
    user: AuthenticatedUser,
  ) {
    await this.adminContentSupportService.assertEditableLesson(lessonId);
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
    await this.adminContentSupportService.audit(
      user,
      'content.lesson.tags_set',
      'Lesson',
      lessonId,
      {
        tagIds,
      },
    );

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

  private async uniqueTagSlug(input: string) {
    return uniqueSlug(input, async (slug) => {
      const existing = await this.prisma.contentTag.findUnique({
        where: { slug },
      });
      return Boolean(existing);
    });
  }
}
