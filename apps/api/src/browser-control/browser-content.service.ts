import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AiContextService } from '../ai-context/ai-context.service';
import { AiContextProcessor } from '../ai-context/ai-context.processor';
import { YoutubeTranscriptService } from '../ai-context/youtube-transcript.service';
import { TRUSTED_CONTEXT_VERSIONS } from '../ai-context/ai-context.constants';
import { PrismaService } from '../prisma/prisma.service';
import { BrowserControlService } from './browser-control.service';
import { BrowserImportDto, BrowserRetryImportDto } from './browser-content.dto';
import { BrowserItemDto } from './browser-control.dto';
const stale = () => new Date(Date.now() - 10 * 60000);

@Injectable()
export class BrowserContentService {
  private readonly logger = new Logger(BrowserContentService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly controls: BrowserControlService,
    private readonly contexts: AiContextService,
    private readonly processor: AiContextProcessor,
    private readonly youtube: YoutubeTranscriptService,
  ) {}

  async combos(parentId: string, childId: string) {
    await this.controls.owned(parentId, childId);
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      take: 100,
      select: {
        id: true,
        title: true,
        description: true,
        units: {
          orderBy: { sortOrder: 'asc' },
          select: {
            lessons: {
              where: { status: 'PUBLISHED' },
              orderBy: { sortOrder: 'asc' },
              select: {
                title: true,
                videos: {
                  where: { provider: 'YOUTUBE', processingStatus: 'READY' },
                  orderBy: { sortOrder: 'asc' },
                  select: { sourceUrl: true, playbackId: true, title: true },
                },
              },
            },
          },
        },
      },
    });
    const combos = courses
      .map((course) => {
        const unique = new Map<
          string,
          { title: string; url: string; key: string }
        >();
        for (const unit of course.units)
          for (const lesson of unit.lessons)
            for (const video of lesson.videos) {
              try {
                const canonical = this.youtube.canonicalize(
                  video.sourceUrl ||
                    `https://www.youtube.com/watch?v=${video.playbackId}`,
                );
                unique.set(canonical.canonicalUrl, {
                  title: (video.title || lesson.title).slice(0, 120),
                  url: canonical.canonicalUrl,
                  key: canonical.canonicalKey,
                });
              } catch {
                /* Invalid catalog URLs are not offered to children. */
              }
            }
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          videos: [...unique.values()],
        };
      })
      .filter((combo) => combo.videos.length);
    const keys = [
      ...new Set(combos.flatMap((c) => c.videos.map((v) => v.key))),
    ];
    const sources = await this.prisma.aiContextSource.findMany({
      where: {
        canonicalKey: { in: keys },
        processingStatus: 'READY',
        processingVersion: { in: TRUSTED_CONTEXT_VERSIONS },
        // Only editorial sources populate the public combo; parent uploads stay out.
        createdBy: {
          roles: {
            some: {
              role: { name: { in: ['ADMIN', 'CONTENT_EDITOR', 'TEACHER'] } },
            },
          },
        },
      },
      select: { id: true, canonicalKey: true },
    });
    const byKey = new Map(
      sources.map((source) => [source.canonicalKey, source.id]),
    );
    return {
      combos: combos.map((combo) => ({
        ...combo,
        videos: combo.videos.map((video) => ({
          ...video,
          sourceId: byKey.get(video.key) || null,
        })),
      })),
    };
  }
  async queueCombo(
    parentId: string,
    childId: string,
    comboId: string,
    minutes: number,
  ) {
    const { combos } = await this.combos(parentId, childId);
    const combo = combos.find((c) => c.id === comboId);
    if (!combo) throw new NotFoundException('Không tìm thấy combo đã xuất bản');
    const videos = combo.videos.filter((v) => v.sourceId);
    if (!videos.length)
      throw new BadRequestException(
        'Combo chưa có ngữ cảnh sẵn sàng; Minhhuong cần chuẩn bị nội dung trong kho trước',
      );
    if (videos.length > 50)
      throw new BadRequestException(
        'Combo vượt 50 video; hãy chia thành combo nhỏ hơn trong kho nội dung',
      );
    // Bound import counts and serialize concurrent additions for the same child.
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${childId}))`;
      const existing = await tx.browserPreparation.findMany({
        where: { childId },
        select: { url: true },
      });
      const old = new Set(existing.map((e) => e.url));
      if (existing.length + videos.filter((v) => !old.has(v.url)).length > 100)
        throw new BadRequestException(
          'Mỗi hồ sơ tối đa 100 nội dung chuẩn bị; hãy xóa nội dung không cần dùng',
        );
      for (const video of videos)
        await tx.browserPreparation.upsert({
          where: { childId_url: { childId, url: video.url } },
          create: {
            childId,
            sourceId: video.sourceId,
            url: video.url,
            title: video.title,
            minutes,
          },
          update: {},
        });
    });
    return {
      queued: videos.length,
      skipped: combo.videos.length - videos.length,
      ...(await this.list(parentId, childId)),
    };
  }
  async importLink(
    user: AuthenticatedUser,
    childId: string,
    dto: BrowserImportDto,
  ) {
    await this.controls.owned(user.sub, childId);
    const canonical = this.youtube.canonicalize(dto.url);
    const existing = await this.prisma.browserPreparation.findUnique({
      where: { childId_url: { childId, url: canonical.canonicalUrl } },
    });
    if (existing) return { reused: true, id: existing.id };
    // No fetch or AI call in this transaction: createYoutube only enqueues work.
    if (
      (await this.prisma.browserPreparation.count({ where: { childId } })) >=
      100
    )
      throw new BadRequestException('Mỗi hồ sơ tối đa 100 nội dung chuẩn bị');
    const { source, reused } = await this.contexts.createYoutube(user, {
      ...dto,
      targetRoles: ['STUDENT'],
    });
    const job = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${childId}))`;
      if ((await tx.browserPreparation.count({ where: { childId } })) >= 100)
        throw new BadRequestException('Mỗi hồ sơ tối đa 100 nội dung chuẩn bị');
      return tx.browserPreparation.upsert({
        where: { childId_url: { childId, url: canonical.canonicalUrl } },
        create: {
          childId,
          sourceId: source.id,
          url: canonical.canonicalUrl,
          title: (dto.title || source.title).slice(0, 120),
          minutes: dto.minutes,
        },
        update: {},
      });
    });
    return { id: job.id, reused };
  }
  async list(parentId: string, childId: string) {
    await this.controls.owned(parentId, childId);
    const jobs = await this.prisma.browserPreparation.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        title: true,
        url: true,
        status: true,
        error: true,
        minutes: true,
        result: true,
        source: { select: { processingStatus: true, errorMessage: true } },
      },
    });
    return {
      jobs: jobs.map(({ source, ...job }) => ({
        ...job,
        status:
          job.status === 'WAITING_CONTEXT' &&
          source?.processingStatus === 'FAILED'
            ? 'FAILED'
            : job.status,
        error:
          job.error ||
          (source?.processingStatus === 'FAILED' ? source.errorMessage : null),
      })),
    };
  }
  async retry(
    user: AuthenticatedUser,
    childId: string,
    id: string,
    dto: BrowserRetryImportDto,
  ) {
    await this.controls.owned(user.sub, childId);
    const job = await this.prisma.browserPreparation.findFirst({
      where: { id, childId },
      include: { source: true },
    });
    if (!job) throw new NotFoundException('Không tìm thấy nội dung');
    if (!job.source)
      throw new BadRequestException(
        'Nguồn đã bị xóa. Hãy xóa dòng này và thêm link lại',
      );
    if (job.status !== 'FAILED' && job.source.processingStatus !== 'FAILED')
      throw new BadRequestException('Chỉ thử lại nội dung đang lỗi');
    if (job.source.processingStatus === 'FAILED')
      await this.contexts.retry(user, job.source.id, { script: dto.script });
    await this.prisma.browserPreparation.updateMany({
      where: { id, childId, status: { in: ['WAITING_CONTEXT', 'FAILED'] } },
      data: {
        status: 'WAITING_CONTEXT',
        error: null,
        result: Prisma.DbNull,
        lease: null,
        startedAt: null,
      },
    });
    return { queued: true };
  }
  async remove(parentId: string, childId: string, id: string) {
    await this.controls.owned(parentId, childId);
    await this.prisma.browserPreparation.deleteMany({ where: { id, childId } });
    return { removed: true };
  }
  @Cron('*/5 * * * * *', { waitForCompletion: true })
  async process() {
    try {
      const jobs = await this.prisma.browserPreparation.findMany({
        where: {
          OR: [
            {
              status: 'WAITING_CONTEXT',
              OR: [
                { source: null },
                { source: { processingStatus: { in: ['READY', 'FAILED'] } } },
              ],
            },
            { status: 'PROCESSING', startedAt: { lt: stale() } },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 2,
        select: { id: true },
      });
      await Promise.all(jobs.map((job) => this.processOne(job.id)));
    } catch {
      this.logger.warn('Browser content queue unavailable; retrying next tick');
    }
  }
  async processOne(id: string) {
    const lease = randomUUID();
    const claimed = await this.prisma.browserPreparation.updateMany({
      where: {
        id,
        OR: [
          { status: 'WAITING_CONTEXT' },
          { status: 'PROCESSING', startedAt: { lt: stale() } },
        ],
      },
      data: { status: 'PROCESSING', lease, startedAt: new Date() },
    });
    if (!claimed.count) return;
    try {
      const job = await this.prisma.browserPreparation.findUniqueOrThrow({
        where: { id },
        include: { source: true },
      });
      const source = job.source;
      if (!source || source.processingStatus === 'FAILED')
        throw new BadRequestException(
          source?.errorMessage || 'Nguồn ngữ cảnh không còn khả dụng',
        );
      if (source.processingStatus !== 'READY') {
        await this.prisma.browserPreparation.updateMany({
          where: { id, lease },
          data: { status: 'WAITING_CONTEXT', lease: null, startedAt: null },
        });
        return;
      }
      if (
        !TRUSTED_CONTEXT_VERSIONS.includes(source.processingVersion) ||
        !source.structuredContent?.trim()
      )
        throw new BadRequestException('Nguồn chưa có ngữ cảnh hợp lệ');
      const title = job.title.startsWith('YouTube ')
        ? source.title.slice(0, 120)
        : job.title;
      const activity = await this.processor.childActivity(
        title,
        source.structuredContent,
      );
      const result: BrowserItemDto = {
        id: job.id,
        title,
        url: job.url,
        minutes: job.minutes,
        ...activity,
      };
      await this.prisma.browserPreparation.updateMany({
        where: { id, lease, status: 'PROCESSING' },
        data: {
          status: 'READY',
          title,
          result: JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue,
          error: null,
          lease: null,
          startedAt: null,
        },
      });
    } catch (error) {
      await this.prisma.browserPreparation.updateMany({
        where: { id, lease },
        data: {
          status: 'FAILED',
          error: (error instanceof Error
            ? error.message
            : 'Không thể tạo bài học'
          ).slice(0, 500),
          lease: null,
          startedAt: null,
        },
      });
    }
  }
}
