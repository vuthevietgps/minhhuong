import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { createHash, randomUUID } from 'node:crypto';
import type { AccountRole, AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { KNOWLEDGE_POLICY_VERSION } from './independent-knowledge.policy';
import {
  CONTEXT_VERSION,
  MAX_TRANSCRIPT_CHARACTERS,
  TRUSTED_CONTEXT_VERSIONS,
} from './ai-context.constants';
import {
  AiContextProcessor,
  ContextEvidence,
  splitContextText,
} from './ai-context.processor';
import { CreateManualContextDto } from './dto/create-manual-context.dto';
import { CreateYoutubeContextsDto } from './dto/create-youtube-contexts.dto';
import {
  AskContextsDto,
  BatchYoutubeContextsDto,
  CreateContextDocumentDto,
  RetryContextDto,
} from './dto/video-workspace.dto';
import { YoutubeTranscriptService } from './youtube-transcript.service';

const staleBefore = () => new Date(Date.now() - 10 * 60_000);

@Injectable()
export class AiContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly youtube: YoutubeTranscriptService,
    private readonly processor: AiContextProcessor,
  ) {}

  async list(targetRole?: string) {
    const sources = await this.prisma.aiContextSource.findMany({
      where: targetRole
        ? { audiences: { some: { accountRole: targetRole } } }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        audiences: { orderBy: { accountRole: 'asc' } },
        createdBy: {
          select: { email: true, profile: { select: { displayName: true } } },
        },
      },
    });
    return { sources: sources.map((source) => this.toPublicSource(source)) };
  }

  async listDocuments() {
    const documents = await this.prisma.aiContextDocument.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        sources: {
          include: {
            source: { select: { id: true, title: true, sourceUrl: true } },
          },
        },
      },
    });
    return {
      documents: documents.map((document) => this.publicDocument(document)),
    };
  }

  async createYoutube(user: AuthenticatedUser, dto: CreateYoutubeContextsDto) {
    const canonical = this.youtube.canonicalize(dto.url);
    return this.createOrReuse({
      user,
      kind: 'YOUTUBE',
      canonicalKey: canonical.canonicalKey,
      youtubeVideoId: canonical.videoId,
      sourceUrl: canonical.canonicalUrl,
      title: dto.title?.trim() || `YouTube ${canonical.videoId}`,
      language: dto.language?.trim() || 'vi',
      transcript: dto.script,
      targetRoles: dto.targetRoles,
      rightsBasis: this.formatRightsBasis(dto.rightsType, dto.rightsBasis),
    });
  }

  async createYoutubeBatch(
    user: AuthenticatedUser,
    dto: BatchYoutubeContextsDto,
  ) {
    const results = [];
    for (const [index, video] of dto.videos.entries()) {
      try {
        const validated = plainToInstance(CreateYoutubeContextsDto, video);
        const errors = await validate(validated, {
          whitelist: true,
          forbidNonWhitelisted: true,
        });
        if (errors.length)
          throw new BadRequestException(
            errors
              .flatMap((error) => Object.values(error.constraints ?? {}))
              .join('; ') || 'Thông tin video không hợp lệ.',
          );
        results.push({
          index,
          ok: true,
          ...(await this.createYoutube(user, validated)),
        });
      } catch (error) {
        results.push({
          index,
          ok: false,
          url: video.url,
          error:
            error instanceof Error
              ? error.message
              : 'Không thể tạo hồ sơ video.',
        });
      }
    }
    return {
      accepted: results.filter((item) => item.ok).length,
      failed: results.filter((item) => !item.ok).length,
      results,
    };
  }

  async createManual(user: AuthenticatedUser, dto: CreateManualContextDto) {
    const transcript = this.normalizeTranscript(dto.script);
    return this.createOrReuse({
      user,
      kind: 'MANUAL_SCRIPT',
      canonicalKey: `script:${this.hash(transcript)}`,
      title: dto.title.trim(),
      language: dto.language?.trim() || 'vi',
      transcript,
      targetRoles: dto.targetRoles,
      rightsBasis: this.formatRightsBasis(dto.rightsType, dto.rightsBasis),
    });
  }

  private async createOrReuse(input: {
    user: AuthenticatedUser;
    kind: 'YOUTUBE' | 'MANUAL_SCRIPT';
    canonicalKey: string;
    youtubeVideoId?: string;
    sourceUrl?: string;
    title: string;
    language: string;
    transcript?: string;
    targetRoles: string[];
    rightsBasis: string;
  }) {
    const transcript = input.transcript
      ? this.normalizeTranscript(input.transcript)
      : '';
    const duplicate = await this.prisma.aiContextSource.findUnique({
      where: { canonicalKey: input.canonicalKey },
    });
    if (duplicate) {
      if (!TRUSTED_CONTEXT_VERSIONS.includes(duplicate.processingVersion))
        throw new BadRequestException(
          'Nguồn cũ chưa xác nhận quyền sử dụng. Hãy gỡ và nhập lại với căn cứ quyền hợp lệ.',
        );
      await this.assignAudiences(duplicate.id, input.targetRoles);
      return { reused: true, source: await this.getPublic(duplicate.id) };
    }
    try {
      const created = await this.prisma.aiContextSource.create({
        data: {
          kind: input.kind,
          canonicalKey: input.canonicalKey,
          youtubeVideoId: input.youtubeVideoId,
          sourceUrl: input.sourceUrl,
          title: input.title,
          language: input.language,
          rawTranscript: transcript,
          transcriptHash: transcript ? this.hash(transcript) : null,
          rightsBasis: input.rightsBasis.trim(),
          rightsConfirmedAt: new Date(),
          processingVersion: CONTEXT_VERSION,
          createdById: input.user.sub,
          audiences: {
            create: [...new Set(input.targetRoles)].map((accountRole) => ({
              accountRole,
            })),
          },
        },
      });
      await this.prisma.auditLog.create({
        data: {
          userId: input.user.sub,
          action: 'AI_CONTEXT_QUEUED',
          entityType: 'AiContextSource',
          entityId: created.id,
          metadata: {
            kind: input.kind,
            targetRoles: input.targetRoles,
            automaticTranscript: !transcript,
          },
        },
      });
      return { reused: false, source: await this.getPublic(created.id) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raced = await this.prisma.aiContextSource.findUnique({
          where: { canonicalKey: input.canonicalKey },
        });
        if (
          raced &&
          TRUSTED_CONTEXT_VERSIONS.includes(raced.processingVersion)
        ) {
          await this.assignAudiences(raced.id, input.targetRoles);
          return { reused: true, source: await this.getPublic(raced.id) };
        }
      }
      throw error;
    }
  }

  async retry(user: AuthenticatedUser, id: string, dto: RetryContextDto) {
    const source = await this.prisma.aiContextSource.findUnique({
      where: { id },
    });
    if (!source) throw new NotFoundException('Không tìm thấy nguồn ngữ cảnh');
    this.requireEditPermission(user, source.createdById);
    if (!TRUSTED_CONTEXT_VERSIONS.includes(source.processingVersion))
      throw new BadRequestException('Nguồn cũ chưa xác nhận quyền sử dụng.');
    if (source.processingStatus !== 'FAILED')
      throw new ConflictException(
        'Chỉ thử lại nguồn đang lỗi. Nguồn sẵn sàng được tái sử dụng.',
      );
    const transcript = dto.script ? this.normalizeTranscript(dto.script) : '';
    if (source.kind === 'MANUAL_SCRIPT' && !transcript)
      throw new BadRequestException(
        'Vui lòng nhập lại script để thử xử lý nguồn thủ công; hệ thống chỉ lưu bản ngữ cảnh đã tổng hợp.',
      );
    const changed = await this.prisma.aiContextSource.updateMany({
      where: { id, processingStatus: 'FAILED' },
      data: {
        canonicalKey:
          source.kind === 'MANUAL_SCRIPT' && dto.script
            ? `script:${this.hash(transcript)}`
            : undefined,
        rawTranscript: transcript,
        transcriptHash: transcript ? this.hash(transcript) : null,
        transcriptSegments: Prisma.DbNull,
        processingStatus: 'PROCESSING',
        processingVersion: CONTEXT_VERSION,
        processingLease: null,
        processingStartedAt: null,
        structuredContent: null,
        errorMessage: null,
        processedAt: null,
      },
    });
    if (!changed.count)
      throw new ConflictException('Nguồn đã được đưa vào hàng đợi.');
    return { source: await this.getPublic(id) };
  }

  async createDocument(user: AuthenticatedUser, dto: CreateContextDocumentDto) {
    const sources = await this.requireReadySources([...dto.sourceIds].sort());
    const cacheKey = this.hash(
      JSON.stringify({
        policyVersion: KNOWLEDGE_POLICY_VERSION,
        kind: dto.kind,
        title: dto.title.trim(),
        topic: dto.topic?.trim() || '',
        sources: sources.map((source) => [
          source.id,
          source.updatedAt.toISOString(),
        ]),
      }),
    );
    const found = await this.prisma.aiContextDocument.findUnique({
      where: { cacheKey },
      include: {
        sources: {
          include: {
            source: { select: { id: true, title: true, sourceUrl: true } },
          },
        },
      },
    });
    if (found) return { reused: true, document: this.publicDocument(found) };
    try {
      const document = await this.prisma.aiContextDocument.create({
        data: {
          cacheKey,
          kind: dto.kind,
          title: dto.title.trim(),
          topic: dto.topic?.trim() || '',
          createdById: user.sub,
          sources: {
            create: sources.map((source) => ({ sourceId: source.id })),
          },
        },
        include: {
          sources: {
            include: {
              source: { select: { id: true, title: true, sourceUrl: true } },
            },
          },
        },
      });
      return { reused: false, document: this.publicDocument(document) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raced = await this.prisma.aiContextDocument.findUnique({
          where: { cacheKey },
          include: {
            sources: {
              include: {
                source: { select: { id: true, title: true, sourceUrl: true } },
              },
            },
          },
        });
        if (raced)
          return { reused: true, document: this.publicDocument(raced) };
      }
      throw error;
    }
  }

  async ask(dto: AskContextsDto) {
    const sources = await this.requireReadySources(dto.sourceIds);
    const evidence = this.relevantEvidence(sources, dto.question, 10);
    return this.processor.answer(dto.question, evidence);
  }

  async retryDocument(user: AuthenticatedUser, id: string) {
    const document = await this.prisma.aiContextDocument.findUnique({
      where: { id },
    });
    if (!document) throw new NotFoundException('Không tìm thấy tài liệu.');
    this.requireEditPermission(user, document.createdById);
    const changed = await this.prisma.aiContextDocument.updateMany({
      where: { id, processingStatus: 'FAILED' },
      data: {
        processingStatus: 'PROCESSING',
        processingLease: null,
        processingStartedAt: null,
        errorMessage: null,
      },
    });
    if (!changed.count)
      throw new ConflictException('Chỉ thử lại tài liệu đang lỗi.');
    return { queued: true };
  }

  async exportSource(id: string) {
    const source = await this.prisma.aiContextSource.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        language: true,
        processingStatus: true,
        structuredContent: true,
        processedAt: true,
      },
    });
    if (!source) throw new NotFoundException('Không tìm thấy nguồn ngữ cảnh');
    return source;
  }

  async getChatContext(targetRoles: AccountRole[], query?: string) {
    const sources = await this.prisma.aiContextSource.findMany({
      where: {
        processingStatus: 'READY',
        processingVersion: { in: TRUSTED_CONTEXT_VERSIONS },
        audiences: { some: { accountRole: { in: targetRoles } } },
      },
      orderBy: { processedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        structuredContent: true,
      },
    });
    const documents = await this.prisma.aiContextDocument.findMany({
      where: {
        processingStatus: 'READY',
        sources: {
          some: {},
          every: {
            source: {
              processingStatus: 'READY',
              processingVersion: { in: TRUSTED_CONTEXT_VERSIONS },
              audiences: { some: { accountRole: { in: targetRoles } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, title: true, content: true },
    });
    const terms = this.searchTerms(query ?? '');
    let usedCharacters = 0;
    return [
      ...documents.map((document) => ({
        id: document.id,
        title: document.title,
        sourceUrl: null,
        structuredContent: document.content,
      })),
      ...sources,
    ]
      .map((source, recencyIndex) => ({
        source,
        recencyIndex,
        relevance: terms.filter((term) =>
          `${source.title} ${source.structuredContent ?? ''}`
            .toLocaleLowerCase('vi')
            .includes(term),
        ).length,
      }))
      .sort(
        (a, b) => b.relevance - a.relevance || a.recencyIndex - b.recencyIndex,
      )
      .slice(0, 4)
      .flatMap(({ source }) => {
        const content = source.structuredContent?.trim();
        if (!content || usedCharacters >= 12000) return [];
        const bounded = content.slice(0, 12000 - usedCharacters);
        usedCharacters += bounded.length;
        return [{ ...source, structuredContent: bounded }];
      });
  }

  async processPendingSources(limit = 2) {
    const candidates = await this.prisma.aiContextSource.findMany({
      where: {
        processingStatus: 'PROCESSING',
        processingVersion: { in: TRUSTED_CONTEXT_VERSIONS },
        OR: [
          { processingStartedAt: null },
          { processingStartedAt: { lt: staleBefore() } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true },
    });
    return Promise.allSettled(
      candidates.map(({ id }) => this.processSource(id)),
    );
  }

  async processPendingDocuments(limit = 1) {
    const candidates = await this.prisma.aiContextDocument.findMany({
      where: {
        processingStatus: 'PROCESSING',
        OR: [
          { processingStartedAt: null },
          { processingStartedAt: { lt: staleBefore() } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true },
    });
    return Promise.allSettled(
      candidates.map(({ id }) => this.processDocument(id)),
    );
  }

  private async processSource(id: string) {
    const lease = randomUUID();
    const claimed = await this.prisma.aiContextSource.updateMany({
      where: {
        id,
        processingStatus: 'PROCESSING',
        OR: [
          { processingStartedAt: null },
          { processingStartedAt: { lt: staleBefore() } },
        ],
      },
      data: { processingLease: lease, processingStartedAt: new Date() },
    });
    if (!claimed.count) return;
    try {
      let source = await this.prisma.aiContextSource.findUniqueOrThrow({
        where: { id },
      });
      let transcript = source.rawTranscript;
      if (!transcript && source.kind === 'YOUTUBE' && source.sourceUrl) {
        const extracted = await this.youtube.extract(
          source.sourceUrl,
          source.language,
        );
        transcript = this.normalizeTranscript(extracted.transcript);
        const saved = await this.prisma.aiContextSource.updateMany({
          where: { id, processingLease: lease },
          data: {
            transcriptHash: this.hash(transcript),
            language: extracted.language,
            title:
              source.title === `YouTube ${source.youtubeVideoId}`
                ? extracted.title
                : source.title,
            processingStartedAt: new Date(),
          },
        });
        if (!saved.count) return;
        source = await this.prisma.aiContextSource.findUniqueOrThrow({
          where: { id },
        });
      }
      if (!transcript)
        throw new BadRequestException(
          'Nguồn chưa có script. Vui lòng bổ sung script để xử lý.',
        );
      // Uploaded scripts are durable queue input only; once claimed they stay
      // in memory for this attempt. Extracted captions never enter the database.
      const cleared = await this.prisma.aiContextSource.updateMany({
        where: { id, processingLease: lease },
        data: { rawTranscript: '', transcriptSegments: Prisma.DbNull },
      });
      if (!cleared.count) return;
      const timer = setInterval(() => {
        void this.prisma.aiContextSource
          .updateMany({
            where: { id, processingLease: lease },
            data: { processingStartedAt: new Date() },
          })
          .catch(() => undefined);
      }, 30_000);
      try {
        const structuredContent = await this.processor.structure(
          source.title,
          transcript,
        );
        await this.prisma.aiContextSource.updateMany({
          where: { id, processingLease: lease },
          data: {
            structuredContent,
            processingVersion: CONTEXT_VERSION,
            rawTranscript: '',
            transcriptSegments: Prisma.DbNull,
            processingStatus: 'READY',
            processedAt: new Date(),
            processingLease: null,
            processingStartedAt: null,
            errorMessage: null,
          },
        });
      } finally {
        clearInterval(timer);
      }
    } catch (error) {
      await this.prisma.aiContextSource.updateMany({
        where: { id, processingLease: lease },
        data: {
          processingStatus: 'FAILED',
          rawTranscript: '',
          transcriptSegments: Prisma.DbNull,
          processingLease: null,
          processingStartedAt: null,
          errorMessage: this.errorMessage(error),
        },
      });
    }
  }

  private async processDocument(id: string) {
    const lease = randomUUID();
    const claimed = await this.prisma.aiContextDocument.updateMany({
      where: {
        id,
        processingStatus: 'PROCESSING',
        OR: [
          { processingStartedAt: null },
          { processingStartedAt: { lt: staleBefore() } },
        ],
      },
      data: { processingLease: lease, processingStartedAt: new Date() },
    });
    if (!claimed.count) return;
    try {
      const document = await this.prisma.aiContextDocument.findUniqueOrThrow({
        where: { id },
        include: {
          sources: { orderBy: { sourceId: 'asc' }, include: { source: true } },
        },
      });
      if (
        !['REPORT', 'NOTES', 'OUTLINE', 'ARTICLE', 'ACTION_ITEMS'].includes(
          document.kind,
        )
      )
        throw new BadRequestException('Loại tài liệu không hợp lệ.');
      const evidence: ContextEvidence[] = document.sources.map(
        ({ source }, index) => ({
          referenceId: `S${index + 1}`,
          sourceId: source.id,
          title: source.title,
          sourceUrl: source.sourceUrl,
          text: source.structuredContent ?? '',
        }),
      );
      if (
        !evidence.length ||
        evidence.some((item) => !item.text) ||
        document.sources.some(
          ({ source }) =>
            source.processingStatus !== 'READY' ||
            !TRUSTED_CONTEXT_VERSIONS.includes(source.processingVersion),
        )
      )
        throw new ConflictException('Một nguồn chưa xử lý xong.');
      const content = await this.processor.document(
        document.kind as CreateContextDocumentDto['kind'],
        document.title,
        document.topic,
        evidence,
      );
      await this.prisma.aiContextDocument.updateMany({
        where: { id, processingLease: lease },
        data: {
          content,
          processingStatus: 'READY',
          processingLease: null,
          processingStartedAt: null,
          errorMessage: null,
        },
      });
    } catch (error) {
      await this.prisma.aiContextDocument.updateMany({
        where: { id, processingLease: lease },
        data: {
          processingStatus: 'FAILED',
          processingLease: null,
          processingStartedAt: null,
          errorMessage: this.errorMessage(error),
        },
      });
    }
  }

  private async requireReadySources(ids: string[]) {
    const sources = await this.prisma.aiContextSource.findMany({
      where: {
        id: { in: ids },
        processingStatus: 'READY',
        processingVersion: { in: TRUSTED_CONTEXT_VERSIONS },
      },
    });
    if (sources.length !== ids.length)
      throw new ConflictException(
        'Một hoặc nhiều video chưa xử lý xong hoặc không tồn tại.',
      );
    const byId = new Map(sources.map((source) => [source.id, source]));
    return ids.map((id) => byId.get(id)!);
  }

  private relevantEvidence(
    sources: Awaited<ReturnType<AiContextService['requireReadySources']>>,
    query: string,
    limit: number,
  ) {
    const terms = this.searchTerms(query);
    const chunks: Array<
      ContextEvidence & {
        score: number;
        sourceIndex: number;
        chunkIndex: number;
      }
    > = [];
    sources.forEach((source, sourceIndex) => {
      const textChunks = splitContextText(
        source.structuredContent ?? '',
        1400,
      ).map((text) => ({ text }));
      textChunks.forEach((chunk, chunkIndex) => {
        const lower = chunk.text.toLocaleLowerCase('vi');
        chunks.push({
          referenceId: `S${sourceIndex + 1}C${chunkIndex + 1}`,
          sourceId: source.id,
          title: source.title,
          sourceUrl: source.sourceUrl,
          text: chunk.text,
          sourceType: 'SUMMARY',
          score: terms.reduce(
            (score, term) => score + (lower.includes(term) ? 1 : 0),
            0,
          ),
          sourceIndex,
          chunkIndex,
        });
      });
    });
    const selected = new Map<string, ContextEvidence>();
    for (const sourceIndex of sources.keys()) {
      const first = chunks
        .filter((chunk) => chunk.sourceIndex === sourceIndex)
        .sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex)[0];
      if (first) selected.set(first.referenceId, first);
    }
    for (const chunk of chunks.sort(
      (a, b) =>
        b.score - a.score ||
        a.sourceIndex - b.sourceIndex ||
        a.chunkIndex - b.chunkIndex,
    )) {
      if (selected.size >= limit) break;
      selected.set(chunk.referenceId, chunk);
    }
    // References identify the saved AI context, never verbatim video speech.
    return [...selected.values()];
  }

  private publicDocument(document: {
    id: string;
    kind: string;
    title: string;
    topic: string;
    content: string | null;
    processingStatus: string;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
    sources: Array<{
      source: { id: string; title: string; sourceUrl: string | null };
    }>;
  }) {
    return {
      id: document.id,
      kind: document.kind,
      title: document.title,
      topic: document.topic,
      content: document.content,
      processingStatus: document.processingStatus,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      sourceRefs: document.sources.map(({ source }) => source),
    };
  }

  private async assignAudiences(sourceId: string, targetRoles: string[]) {
    await this.prisma.aiContextAudience.createMany({
      data: [...new Set(targetRoles)].map((accountRole) => ({
        sourceId,
        accountRole,
      })),
      skipDuplicates: true,
    });
  }

  async remove(user: AuthenticatedUser, id: string) {
    const source = await this.prisma.aiContextSource.findUnique({
      where: { id },
      select: { id: true, title: true, createdById: true },
    });
    if (!source) throw new NotFoundException('Không tìm thấy nguồn ngữ cảnh');
    const canModerate = user.roles.some((role) =>
      ['ADMIN', 'CONTENT_EDITOR', 'SUPPORT'].includes(role),
    );
    if (source.createdById !== user.sub && !canModerate)
      throw new ForbiddenException('Bạn không có quyền gỡ nguồn này');
    await this.prisma.$transaction(async (transaction) => {
      // Serialize removal against concurrent creation of document-source links.
      await transaction.$queryRaw(
        Prisma.sql`SELECT "id" FROM "AiContextSource" WHERE "id" = ${id} FOR UPDATE`,
      );
      await transaction.aiContextDocument.deleteMany({
        where: { sources: { some: { sourceId: id } } },
      });
      await transaction.auditLog.create({
        data: {
          userId: user.sub,
          action: 'AI_CONTEXT_REMOVED',
          entityType: 'AiContextSource',
          entityId: source.id,
          metadata: { title: source.title, reason: 'RIGHTS_OR_SOURCE_REMOVAL' },
        },
      });
      await transaction.aiContextSource.delete({ where: { id: source.id } });
    });
    return { removed: true, id: source.id };
  }

  private async getPublic(id: string) {
    const source = await this.prisma.aiContextSource.findUnique({
      where: { id },
      include: {
        audiences: { orderBy: { accountRole: 'asc' } },
        createdBy: {
          select: { email: true, profile: { select: { displayName: true } } },
        },
      },
    });
    if (!source) throw new NotFoundException('Không tìm thấy nguồn ngữ cảnh');
    return this.toPublicSource(source);
  }

  private toPublicSource(source: {
    id: string;
    kind: string;
    title: string;
    language: string;
    sourceUrl: string | null;
    structuredContent: string | null;
    processingStatus: string;
    processingVersion: string;
    errorMessage: string | null;
    rightsBasis: string;
    processedAt: Date | null;
    createdAt: Date;
    audiences: Array<{ accountRole: string }>;
    createdBy: {
      email: string;
      profile: { displayName: string | null } | null;
    };
  }) {
    return {
      id: source.id,
      kind: source.kind,
      title: source.title,
      language: source.language,
      sourceUrl: source.sourceUrl,
      targetRoles: source.audiences.map((item) => item.accountRole),
      processingStatus: source.processingStatus,
      processingVersion: source.processingVersion,
      rightsReviewRequired: !TRUSTED_CONTEXT_VERSIONS.includes(
        source.processingVersion,
      ),
      errorMessage: source.errorMessage,
      rightsBasis: source.rightsBasis,
      contextCharacters: source.structuredContent?.length ?? 0,
      structuredContent: source.structuredContent,
      processedAt: source.processedAt,
      createdAt: source.createdAt,
      createdBy:
        source.createdBy.profile?.displayName ?? source.createdBy.email,
    };
  }

  private normalizeTranscript(input: string) {
    const normalized = input
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    if (normalized.length < 20)
      throw new BadRequestException('Script quá ngắn');
    if (normalized.length > MAX_TRANSCRIPT_CHARACTERS)
      throw new BadRequestException('Script vượt giới hạn 100.000 ký tự');
    return normalized;
  }
  private formatRightsBasis(
    type: 'OWNED' | 'WRITTEN_PERMISSION' | 'CC_BY' | 'PUBLIC_DOMAIN',
    details: string,
  ) {
    const labels = {
      OWNED: 'Nội dung thuộc sở hữu của người nhập',
      WRITTEN_PERMISSION: 'Có văn bản cho phép sử dụng',
      CC_BY: 'Giấy phép Creative Commons Attribution (CC BY)',
      PUBLIC_DOMAIN: 'Thuộc phạm vi công cộng',
    };
    return `${labels[type]} — ${details.trim()}`.slice(0, 300);
  }
  private hash(input: string) {
    return createHash('sha256').update(input).digest('hex');
  }
  private searchTerms(input: string) {
    const ignored = new Set([
      'của',
      'cho',
      'với',
      'trong',
      'what',
      'when',
      'where',
      'how',
      'the',
      'and',
      'you',
    ]);
    return [
      ...new Set(
        input
          .toLocaleLowerCase('vi')
          .replace(/[^\p{L}\p{N}\s]/gu, ' ')
          .split(/\s+/)
          .filter((term) => term.length >= 3 && !ignored.has(term)),
      ),
    ].slice(0, 16);
  }
  private errorMessage(error: unknown) {
    return (
      error instanceof Error ? error.message : 'Lỗi xử lý không xác định'
    ).slice(0, 1000);
  }
  private requireEditPermission(user: AuthenticatedUser, createdById: string) {
    if (
      createdById !== user.sub &&
      !user.roles.some((role) =>
        ['ADMIN', 'CONTENT_EDITOR', 'SUPPORT'].includes(role),
      )
    )
      throw new ForbiddenException('Bạn không có quyền sửa nguồn này.');
  }
}
