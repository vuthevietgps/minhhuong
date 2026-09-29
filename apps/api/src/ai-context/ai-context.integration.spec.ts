import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AiContextService } from './ai-context.service';
import { AiContextProcessor } from './ai-context.processor';
import { YoutubeTranscriptService } from './youtube-transcript.service';
import { documentKinds } from './dto/video-workspace.dto';
import { CONTEXT_VERSION } from './ai-context.constants';
import { createTranscriptWordingGuard } from './independent-knowledge.policy';

// Opt-in PostgreSQL tests. All fixture rows belong to a fresh disposable user.
const databaseDescribe =
  process.env.AI_CONTEXT_DATABASE_TEST === 'true' ? describe : describe.skip;
databaseDescribe('video knowledge database workflow', () => {
  let prisma: PrismaService;
  let service: AiContextService;
  let user: AuthenticatedUser;
  const youtube = new YoutubeTranscriptService();
  const processor = {
    structure: jest.fn(),
    document: jest.fn(),
    answer: jest.fn(),
  };
  const transcript =
    'Practise speaking slowly every day. Review your pronunciation and listen again.';
  const dto = () => ({
    url: `https://youtu.be/${randomUUID().replace(/-/g, '').slice(0, 11)}`,
    targetRoles: ['STUDENT'],
    rightsConfirmed: true,
    rightsType: 'OWNED' as const,
    rightsBasis: 'Owned integration test fixture',
  });

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    const created = await prisma.user.create({
      data: {
        email: `video-workspace-${randomUUID()}@test.invalid`,
        passwordHash: 'not-a-login-password',
      },
    });
    user = { sub: created.id, email: created.email, roles: ['PARENT'] };
    service = new AiContextService(
      prisma,
      youtube,
      processor as unknown as AiContextProcessor,
    );
    jest.spyOn(youtube, 'extract').mockResolvedValue({
      transcript,
      segments: [{ text: transcript, offset: 15, duration: 10 }],
      title: 'Fixture video',
      language: 'en',
    });
  });
  beforeEach(() => {
    processor.structure
      .mockReset()
      .mockResolvedValue(
        '## Ý chính\nPractice daily.\n## Luận điểm\nRepetition.\n## Ví dụ\nSpeaking slowly.\n## Kết luận\nReview.',
      );
    processor.document.mockReset().mockResolvedValue('Learning report [S1]');
    processor.answer.mockReset().mockResolvedValue({
      answer: 'Practice daily [S1C1].',
      supported: true,
      citations: [],
    });
    jest.mocked(youtube.extract).mockClear();
  });
  afterEach(async () => {
    await prisma.aiContextDocument.deleteMany({
      where: { createdById: user.sub },
    });
    await prisma.aiContextSource.deleteMany({
      where: { createdById: user.sub },
    });
    await prisma.auditLog.deleteMany({ where: { userId: user.sub } });
  });
  afterAll(async () => {
    if (user) await prisma.user.delete({ where: { id: user.sub } });
    await prisma?.$disconnect();
  });

  it('queues a batch, preserves independent failures, and reuses canonical URL variants', async () => {
    const video = dto();
    const id = youtube.canonicalize(video.url).videoId;
    const result = await service.createYoutubeBatch(user, {
      videos: [
        video,
        { ...video, url: `https://youtube.com/watch?v=${id}&t=10` },
        { ...dto(), url: 'https://example.com/no-video' },
      ],
    });
    expect(result.accepted).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.results[1]).toMatchObject({ reused: true });
    expect(
      await prisma.aiContextSource.count({ where: { createdById: user.sub } }),
    ).toBe(1);
    expect(processor.structure).not.toHaveBeenCalled();
    expect(youtube.extract).not.toHaveBeenCalled();
  });

  it('claims a video only once across concurrent workers and reuses it after restart', async () => {
    const input = dto();
    const results = await Promise.all([
      service.createYoutube(user, input),
      service.createYoutube(user, input),
    ]);
    expect(results[0].source.id).toBe(results[1].source.id);
    await Promise.all([
      service['processSource'](results[0].source.id),
      service['processSource'](results[0].source.id),
    ]);
    expect(youtube.extract).toHaveBeenCalledTimes(1);
    expect(processor.structure).toHaveBeenCalledTimes(1);
    const restarted = new AiContextService(
      prisma,
      youtube,
      processor as unknown as AiContextProcessor,
    );
    const reused = await restarted.createYoutube(user, input);
    expect(reused.reused).toBe(true);
    expect(reused.source.processingStatus).toBe('READY');
    expect(reused.source.structuredContent).toContain('Kết luận');
    expect(youtube.extract).toHaveBeenCalledTimes(1);
    const stored = await prisma.aiContextSource.findUniqueOrThrow({
      where: { id: reused.source.id },
    });
    expect(stored.rawTranscript).toBe('');
    expect(stored.transcriptSegments).toBeNull();
    expect(await restarted.exportSource(stored.id)).not.toHaveProperty(
      'rawTranscript',
    );
    expect(reused.source).not.toHaveProperty('transcriptPreview');
  });

  it('discards scripts after AI failure and refetches captions only when retrying a failed video', async () => {
    processor.structure.mockRejectedValueOnce(
      new Error('AI temporarily unavailable'),
    );
    const item = await service.createYoutube(user, dto());
    await service['processSource'](item.source.id);
    const failed = await service.exportSource(item.source.id);
    expect(failed.processingStatus).toBe('FAILED');
    expect(failed).not.toHaveProperty('rawTranscript');
    const stored = await prisma.aiContextSource.findUniqueOrThrow({
      where: { id: item.source.id },
    });
    expect(stored.rawTranscript).toBe('');
    expect(stored.transcriptSegments).toBeNull();
    await service.retry(user, item.source.id, {});
    await service['processSource'](item.source.id);
    expect((await service.exportSource(item.source.id)).processingStatus).toBe(
      'READY',
    );
    expect(youtube.extract).toHaveBeenCalledTimes(2);
    await expect(service.retry(user, item.source.id, {})).rejects.toThrow(
      ConflictException,
    );
  });

  it('recovers a stale processing lease after a worker stops', async () => {
    const item = await service.createYoutube(user, {
      ...dto(),
      script: transcript,
    });
    await prisma.aiContextSource.update({
      where: { id: item.source.id },
      data: {
        processingLease: 'stopped-worker',
        processingStartedAt: new Date(Date.now() - 11 * 60000),
      },
    });
    await service['processSource'](item.source.id);
    expect((await service.exportSource(item.source.id)).processingStatus).toBe(
      'READY',
    );
    expect(youtube.extract).not.toHaveBeenCalled();
  });

  it('discards rejected copied output and the temporary script without automatic retries', async () => {
    const script =
      'Mỗi buổi chiều tôi lại đi qua con đường nhỏ dưới những tán cây xanh để tìm cảm hứng cho câu chuyện mới.';
    processor.structure.mockImplementationOnce(
      (_title: string, text: string) => {
        createTranscriptWordingGuard(text)(text);
        return text;
      },
    );
    const item = await service.createManual(user, {
      title: 'Copied output fixture',
      script,
      targetRoles: ['STUDENT'],
      rightsConfirmed: true,
      rightsType: 'OWNED',
      rightsBasis: 'Owned integration test fixture',
    });
    await service['processSource'](item.source.id);
    const saved = await prisma.aiContextSource.findUniqueOrThrow({
      where: { id: item.source.id },
    });
    expect(saved).toMatchObject({
      processingStatus: 'FAILED',
      structuredContent: null,
      rawTranscript: '',
      transcriptSegments: null,
      processingLease: null,
    });
    expect(saved.errorMessage).toContain('trùng lời nguồn');
    await service['processSource'](item.source.id);
    expect(processor.structure).toHaveBeenCalledTimes(1);
    expect(youtube.extract).not.toHaveBeenCalled();
  });

  it('processes a pending legacy source under the current knowledge policy', async () => {
    const item = await service.createYoutube(user, {
      ...dto(),
      script: transcript,
    });
    await prisma.aiContextSource.update({
      where: { id: item.source.id },
      data: { processingVersion: 'context-v3-video-workspace' },
    });
    // Limit candidate selection to our fixture, never process another user's queue.
    const candidates = jest
      .spyOn(prisma.aiContextSource, 'findMany')
      .mockResolvedValueOnce([{ id: item.source.id }] as never);
    try {
      await service.processPendingSources();
      expect(candidates).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            processingVersion: {
              in: expect.arrayContaining([
                'context-v3-video-workspace',
                CONTEXT_VERSION,
              ]),
            },
          }),
        }),
      );
      const saved = await prisma.aiContextSource.findUniqueOrThrow({
        where: { id: item.source.id },
      });
      expect(saved).toMatchObject({
        processingStatus: 'READY',
        processingVersion: CONTEXT_VERSION,
        rawTranscript: '',
      });
    } finally {
      candidates.mockRestore();
    }
  });

  it('keeps separate video references for identical scripts and persists all five document formats', async () => {
    const first = await service.createYoutube(user, {
      ...dto(),
      script: transcript,
    });
    const second = await service.createYoutube(user, {
      ...dto(),
      script: transcript,
    });
    expect(first.source.id).not.toBe(second.source.id);
    await Promise.all([
      service['processSource'](first.source.id),
      service['processSource'](second.source.id),
    ]);
    for (const kind of documentKinds) {
      const input = {
        sourceIds: [first.source.id, second.source.id],
        title: 'Study document',
        topic: 'Practice',
        kind,
      };
      const document = await service.createDocument(user, input);
      await service['processDocument'](document.document.id);
      const reused = await service.createDocument(user, {
        ...input,
        sourceIds: [...input.sourceIds].reverse(),
      });
      expect(reused.reused).toBe(true);
      expect(reused.document.processingStatus).toBe('READY');
      expect(reused.document.sourceRefs).toHaveLength(2);
    }
    expect(processor.document).toHaveBeenCalledTimes(5);
    const tutorContext = await service.getChatContext(
      ['STUDENT'],
      'Learning report',
    );
    expect(
      tutorContext.some((context) =>
        context.structuredContent.includes('Learning report'),
      ),
    ).toBe(true);
    const unrelatedRole = await service.getChatContext(
      ['SALE'],
      'Learning report',
    );
    expect(
      unrelatedRole.some((context) =>
        context.structuredContent.includes('Learning report'),
      ),
    ).toBe(false);
    await service.remove(user, first.source.id);
    expect(
      await prisma.aiContextDocument.count({
        where: { createdById: user.sub },
      }),
    ).toBe(0);
  });

  it('finds evidence in saved context after restart without reading scripts, refetching or summarizing', async () => {
    const tail =
      'Unique zebracat conclusion is at the end of the saved context.';
    const rawOnly = 'This private detail belongs only to the original script.';
    processor.structure.mockResolvedValueOnce(
      'A saved learning idea. '.repeat(200) + tail,
    );
    const item = await service.createYoutube(user, {
      ...dto(),
      script: 'An ordinary learning example. '.repeat(1000) + rawOnly,
    });
    await service['processSource'](item.source.id);
    processor.structure.mockClear();
    const restarted = new AiContextService(
      prisma,
      youtube,
      processor as unknown as AiContextProcessor,
    );
    await restarted.ask({
      sourceIds: [item.source.id],
      question: 'What is the zebracat conclusion?',
    });
    expect(
      processor.answer.mock.calls[0][1].some((entry: { text: string }) =>
        entry.text.includes(tail),
      ),
    ).toBe(true);
    const evidence = processor.answer.mock.calls[0][1] as Array<{
      text: string;
      sourceType: string;
      offset?: number;
    }>;
    expect(evidence.every((entry) => entry.sourceType === 'SUMMARY')).toBe(
      true,
    );
    expect(evidence.every((entry) => entry.offset === undefined)).toBe(true);
    expect(JSON.stringify(evidence)).not.toContain(rawOnly);
    expect(processor.structure).not.toHaveBeenCalled();
    expect(youtube.extract).not.toHaveBeenCalled();
  });

  it('clears temporary uploaded input before calling AI and requires manual input again after failure', async () => {
    const item = await service.createManual(user, {
      title: 'Manual context',
      script: transcript,
      targetRoles: ['STUDENT'],
      rightsConfirmed: true,
      rightsType: 'OWNED',
      rightsBasis: 'Owned test fixture',
    });
    expect(await service.exportSource(item.source.id)).not.toHaveProperty(
      'rawTranscript',
    );
    processor.structure.mockImplementationOnce(
      async (_title: string, script: string) => {
        expect(script).toBe(transcript);
        const stored = await prisma.aiContextSource.findUniqueOrThrow({
          where: { id: item.source.id },
        });
        expect(stored.rawTranscript).toBe('');
        throw new Error('Synthetic provider failure');
      },
    );
    await service['processSource'](item.source.id);
    await expect(service.retry(user, item.source.id, {})).rejects.toThrow(
      BadRequestException,
    );
    await service.retry(user, item.source.id, { script: transcript });
    await service['processSource'](item.source.id);
    const stored = await prisma.aiContextSource.findUniqueOrThrow({
      where: { id: item.source.id },
    });
    expect(stored.rawTranscript).toBe('');
    expect(stored.processingStatus).toBe('READY');
    expect(stored.structuredContent).toContain('Kết luận');
    expect(
      (
        await service.createManual(user, {
          title: 'Same manual source',
          script: transcript,
          targetRoles: ['STUDENT'],
          rightsConfirmed: true,
          rightsType: 'OWNED',
          rightsBasis: 'Owned test fixture',
        })
      ).reused,
    ).toBe(true);
    expect(youtube.extract).not.toHaveBeenCalled();
  });

  it('rejects unfinished sources and prevents another parent from editing a failed source', async () => {
    const item = await service.createYoutube(user, dto());
    await expect(
      service.ask({ sourceIds: [item.source.id], question: 'Question?' }),
    ).rejects.toThrow(ConflictException);
    await prisma.aiContextSource.update({
      where: { id: item.source.id },
      data: { processingStatus: 'FAILED' },
    });
    await expect(
      service.retry({ ...user, sub: 'another-parent' }, item.source.id, {
        script: transcript,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
