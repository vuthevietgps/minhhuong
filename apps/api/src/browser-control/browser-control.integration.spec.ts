import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AiTutorProvider } from '../ai-chat/ai-tutor.provider';
import { BrowserControlService } from './browser-control.service';
import { defaultBrowserPolicy } from './browser-control.policy';

const integration = process.env.BROWSER_CONTROL_TEST_DATABASE_URL
  ? describe
  : describe.skip;
integration(
  'Browser control PostgreSQL integration (disposable database only)',
  () => {
    let prisma: PrismaService;
    let service: BrowserControlService;
    let parentId: string;
    let childId: string;
    let token: string;
    let deviceId: string;
    const itemId = randomUUID();
    const tutor = {
      isEnabled: () => true,
      reply: jest.fn().mockResolvedValue({
        text: 'What color do you like?',
        provider: 'mock',
      }),
    };
    beforeAll(async () => {
      const url = process.env.BROWSER_CONTROL_TEST_DATABASE_URL!;
      if (!new URL(url).pathname.startsWith('/minhhuong_browser_test_'))
        throw new Error('Refusing a non-disposable database');
      process.env.DATABASE_URL = url;
      prisma = new PrismaService();
      await prisma.$connect();
      service = new BrowserControlService(
        prisma,
        { get: () => 'http://localhost:3000' } as unknown as ConfigService,
        tutor as unknown as AiTutorProvider,
      );
      const parent = await prisma.user.create({
        data: {
          email: 'browser-test@example.test',
          passwordHash: 'not-a-login',
          childProfiles: { create: { displayName: 'Test child' } },
        },
        include: { childProfiles: true },
      });
      parentId = parent.id;
      childId = parent.childProfiles[0].id;
      await service.savePolicy(parentId, childId, {
        ...defaultBrowserPolicy(),
        items: [
          {
            id: itemId,
            title: 'Colors',
            url: 'https://example.test/video',
            minutes: 1,
            context:
              'Original teaching context: red, green and blue, for a child under ten.',
            questions: [
              { prompt: 'Green?', options: ['Xanh lá', 'Đỏ'], answer: 0 },
            ],
          },
        ],
      });
    });
    afterAll(async () => {
      await prisma?.$disconnect();
    });
    it('atomically consumes a pairing code once under concurrent requests', async () => {
      const { code } = await service.pairing(parentId, childId);
      const results = await Promise.allSettled([
        service.pair({ code, name: 'Chrome' }),
        service.pair({ code, name: 'Chrome duplicate' }),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      const paired = results.find((r) => r.status === 'fulfilled')!;
      if (paired.status !== 'fulfilled') throw new Error('pairing failed');
      token = `Bearer ${paired.value.token}`;
      deviceId = paired.value.deviceId;
      expect(await prisma.browserDevice.count()).toBe(1);
      expect(
        (
          await prisma.browserDevice.findUniqueOrThrow({
            where: { id: deviceId },
          })
        ).tokenHash,
      ).not.toBe(paired.value.token);
    });
    it('denies another parent and expired pairing codes', async () => {
      await expect(
        service.dashboard('wrong-parent', childId),
      ).rejects.toThrow();
      await expect(
        service.revoke('wrong-parent', childId, deviceId),
      ).rejects.toThrow();
      const pairing = await service.pairing(parentId, childId);
      await prisma.browserPairing.updateMany({
        where: { usedAt: null },
        data: { expiresAt: new Date(0) },
      });
      await expect(
        service.pair({ code: pairing.code, name: 'Late device' }),
      ).rejects.toThrow();
    });
    it('merges cumulative usage by maximum and deduplicates replayed offline events', async () => {
      const day = new Date().toISOString().slice(0, 10);
      const event = {
        eventId: randomUUID(),
        kind: 'WATCH',
        itemId,
        occurredAt: new Date().toISOString(),
      };
      await Promise.all(
        [60, 5, 30].map((seconds) =>
          service.sync(token, {
            usage: [{ day, itemId, seconds }],
            events: [event],
          }),
        ),
      );
      expect((await prisma.browserUsage.findFirstOrThrow()).seconds).toBe(60);
      expect(await prisma.browserEvent.count()).toBe(1);
      const dashboard = await service.dashboard(parentId, childId);
      expect(dashboard.usage[0].seconds).toBe(60);
      expect(dashboard.devices[0]).not.toHaveProperty('tokenHash');
    });
    it('preloads authored context, saves conversation, grades on server and replays the same result', async () => {
      const lesson = await service.lesson(token, itemId);
      expect(lesson.questions[0]).not.toHaveProperty('answer');
      await service.chat(token, itemId, 'Hello');
      expect(
        tutor.reply.mock.calls[0][0].contexts[0].structuredContent,
      ).toContain('Original teaching context');
      expect(await prisma.browserMessage.count()).toBe(2);
      const eventId = randomUUID();
      expect(
        await service.attempt(token, itemId, { eventId, answers: [0] }),
      ).toMatchObject({ correct: 1, total: 1 });
      expect(
        await service.attempt(token, itemId, { eventId, answers: [1] }),
      ).toMatchObject({ correct: 1, total: 1 });
      expect(
        await prisma.browserEvent.count({ where: { kind: 'EXERCISE' } }),
      ).toBe(1);
      await expect(
        service.attempt(token, itemId, { eventId: randomUUID(), answers: [3] }),
      ).rejects.toThrow();
      await expect(service.lesson(token, randomUUID())).rejects.toThrow();
    });
    it('blocks AI in exercise mode and denies suspended parents or revoked devices', async () => {
      const { policy } = await service.policy(childId);
      await service.savePolicy(parentId, childId, {
        ...policy,
        mode: 'EXERCISE_ONLY',
      });
      await expect(service.chat(token, itemId, 'Hello')).rejects.toThrow();
      await prisma.user.update({
        where: { id: parentId },
        data: { status: 'SUSPENDED' },
      });
      await expect(
        service.sync(token, { usage: [], events: [] }),
      ).rejects.toThrow();
      await prisma.user.update({
        where: { id: parentId },
        data: { status: 'ACTIVE' },
      });
      await service.revoke(parentId, childId, deviceId);
      await expect(
        service.sync(token, { usage: [], events: [] }),
      ).rejects.toThrow();
      await expect(service.lesson(token, itemId)).rejects.toThrow();
    });
  },
);
