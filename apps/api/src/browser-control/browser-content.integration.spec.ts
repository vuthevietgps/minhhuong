import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { AiContextService } from '../ai-context/ai-context.service';
import { AiContextProcessor } from '../ai-context/ai-context.processor';
import { YoutubeTranscriptService } from '../ai-context/youtube-transcript.service';
import { CONTEXT_VERSION } from '../ai-context/ai-context.constants';
import { PrismaService } from '../prisma/prisma.service';
import { AiTutorProvider } from '../ai-chat/ai-tutor.provider';
import { BrowserControlService } from './browser-control.service';
import { BrowserContentService } from './browser-content.service';
import type { AuthenticatedUser } from '../auth/auth.types';

const integration = process.env.BROWSER_CONTROL_TEST_DATABASE_URL
  ? describe
  : describe.skip;
integration('Browser content preparation in PostgreSQL', () => {
  let prisma: PrismaService;
  let service: BrowserContentService;
  let controls: BrowserControlService;
  let childId: string;
  let comboId: string;
  let sourceId: string;
  let user: AuthenticatedUser;
  const video = 'abcdefghijk';
  const output = {
    context: 'Ngữ cảnh mới dành cho trẻ về màu xanh lá và màu đỏ.',
    questions: [{ prompt: 'Green?', options: ['Xanh lá', 'Đỏ'], answer: 0 }],
  };
  const processor = {
    childActivity: jest.fn().mockResolvedValue(output),
    structure: jest
      .fn()
      .mockResolvedValue(
        'General knowledge about colors, independently expressed.',
      ),
  };
  const youtube = new YoutubeTranscriptService();
  beforeAll(async () => {
    const url = process.env.BROWSER_CONTROL_TEST_DATABASE_URL!;
    if (!new URL(url).pathname.startsWith('/minhhuong_browser_test_'))
      throw new Error('Disposable database required');
    process.env.DATABASE_URL = url;
    prisma = new PrismaService();
    await prisma.$connect();
    const parent = await prisma.user.create({
      data: {
        email: `${randomUUID()}@example.test`,
        passwordHash: 'test-only',
        childProfiles: { create: { displayName: 'Combo child' } },
      },
      include: { childProfiles: true },
    });
    user = { sub: parent.id, email: parent.email, roles: ['PARENT'] };
    childId = parent.childProfiles[0].id;
    const role = await prisma.role.upsert({
      where: { name: 'CONTENT_EDITOR' },
      create: { name: 'CONTENT_EDITOR' },
      update: {},
    });
    const editor = await prisma.user.create({
      data: {
        email: `${randomUUID()}@example.test`,
        passwordHash: 'test-only',
        roles: { create: { roleId: role.id } },
      },
    });
    const source = await prisma.aiContextSource.create({
      data: {
        kind: 'YOUTUBE',
        canonicalKey: `youtube:${video}`,
        youtubeVideoId: video,
        sourceUrl: `https://www.youtube.com/watch?v=${video}`,
        title: 'Colors',
        rawTranscript: '',
        structuredContent:
          'General concept notes about colors for young children.',
        processingStatus: 'READY',
        processingVersion: CONTEXT_VERSION,
        rightsBasis: 'Owned test source',
        rightsConfirmedAt: new Date(),
        createdById: editor.id,
      },
    });
    sourceId = source.id;
    const level = await prisma.level.create({
      data: { code: randomUUID(), title: 'Test level' },
    });
    const course = await prisma.course.create({
      data: {
        levelId: level.id,
        slug: randomUUID(),
        title: 'Combo colors',
        isPublished: true,
        units: {
          create: {
            title: 'Colors',
            lessons: {
              create: {
                slug: randomUUID(),
                title: 'Green and red',
                status: 'PUBLISHED',
                videos: {
                  create: {
                    provider: 'YOUTUBE',
                    playbackId: video,
                    sourceUrl: `https://www.youtube.com/watch?v=${video}`,
                  },
                },
              },
            },
          },
        },
      },
    });
    comboId = course.id;
    controls = new BrowserControlService(
      prisma,
      {} as ConfigService,
      {} as AiTutorProvider,
    );
    const contexts = new AiContextService(
      prisma,
      youtube,
      processor as unknown as AiContextProcessor,
    );
    service = new BrowserContentService(
      prisma,
      controls,
      contexts,
      processor as unknown as AiContextProcessor,
      youtube,
    );
  });
  afterAll(async () => {
    await prisma?.user.delete({ where: { id: user.sub } }).catch(() => {});
    await prisma?.$disconnect();
  });
  it('offers published combos, queues idempotently and does not activate pending material', async () => {
    const catalog = await service.combos(user.sub, childId);
    expect(
      catalog.combos.find((c) => c.id === comboId)?.videos[0].sourceId,
    ).toBe(sourceId);
    await Promise.all([
      service.queueCombo(user.sub, childId, comboId, 8),
      service.queueCombo(user.sub, childId, comboId, 8),
    ]);
    const jobs = await service.list(user.sub, childId);
    expect(jobs.jobs).toHaveLength(1);
    expect(jobs.jobs[0].status).toBe('WAITING_CONTEXT');
    expect((await controls.policy(childId)).policy.items).toHaveLength(0);
    await Promise.all([
      service.processOne(jobs.jobs[0].id),
      service.processOne(jobs.jobs[0].id),
    ]);
    expect(processor.childActivity).toHaveBeenCalledTimes(1);
    const ready = await service.list(user.sub, childId);
    expect(ready.jobs[0].status).toBe('READY');
    expect(ready.jobs[0].result).toMatchObject({
      minutes: 8,
      context: output.context,
    });
    expect((await controls.policy(childId)).policy.items).toHaveLength(0);
  });
  it('imports a new canonical YouTube link into the existing transcript queue and allows retry', async () => {
    const dto = {
      url: 'https://youtu.be/12345678901?si=tracking',
      title: 'New video',
      minutes: 7,
      targetRoles: ['STUDENT'],
      rightsConfirmed: true,
      rightsType: 'OWNED' as const,
      rightsBasis: 'My original video for testing',
    };
    const queued = await service.importLink(user, childId, dto);
    const duplicate = await service.importLink(user, childId, {
      ...dto,
      url: 'https://www.youtube.com/watch?v=12345678901',
    });
    expect(duplicate.id).toBe(queued.id);
    const job = await prisma.browserPreparation.findUniqueOrThrow({
      where: { id: queued.id },
      include: { source: true },
    });
    expect(job.source?.processingStatus).toBe('PROCESSING');
    expect(job.source?.rawTranscript).toBe('');
    await service.processOne(job.id);
    expect(
      (
        await prisma.browserPreparation.findUniqueOrThrow({
          where: { id: job.id },
        })
      ).status,
    ).toBe('WAITING_CONTEXT');
    await prisma.aiContextSource.update({
      where: { id: job.sourceId! },
      data: {
        processingStatus: 'FAILED',
        errorMessage: 'No captions available',
      },
    });
    await service.processOne(job.id);
    expect(
      (await service.list(user.sub, childId)).jobs.find((j) => j.id === job.id)
        ?.error,
    ).toBe('No captions available');
    await service.retry(user, childId, job.id, {
      script: 'A supplied original script about red and green colors.',
    });
    expect(
      (
        await prisma.aiContextSource.findUniqueOrThrow({
          where: { id: job.sourceId! },
        })
      ).processingStatus,
    ).toBe('PROCESSING');
    await prisma.aiContextSource.update({
      where: { id: job.sourceId! },
      data: {
        processingStatus: 'READY',
        structuredContent: 'General facts about red and green.',
        rawTranscript: '',
      },
    });
    processor.childActivity.mockRejectedValueOnce(
      new Error('Invalid AI result'),
    );
    await service.processOne(job.id);
    expect(
      (await service.list(user.sub, childId)).jobs.find((j) => j.id === job.id)
        ?.status,
    ).toBe('FAILED');
    await service.retry(user, childId, job.id, {});
    await service.processOne(job.id);
    expect(
      (await service.list(user.sub, childId)).jobs.find((j) => j.id === job.id)
        ?.status,
    ).toBe('READY');
  });
  it('prevents access by another parent and ignores unpublished combos', async () => {
    await expect(service.list('foreign-parent', childId)).rejects.toThrow();
    await expect(
      service.queueCombo('foreign-parent', childId, comboId, 5),
    ).rejects.toThrow();
    await prisma.course.update({
      where: { id: comboId },
      data: { isPublished: false },
    });
    expect(
      (await service.combos(user.sub, childId)).combos.some(
        (c) => c.id === comboId,
      ),
    ).toBe(false);
    await expect(
      service.queueCombo(user.sub, childId, comboId, 5),
    ).rejects.toThrow();
  });
});
