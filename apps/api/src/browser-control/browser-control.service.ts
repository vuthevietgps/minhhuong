import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { AiTutorProvider } from '../ai-chat/ai-tutor.provider';
import { PrismaService } from '../prisma/prisma.service';
import {
  BrowserAttemptDto,
  BrowserPairDto,
  BrowserPolicyDto,
  BrowserSyncDto,
} from './browser-control.dto';
import {
  defaultBrowserPolicy,
  publicBrowserPolicy,
  validateBrowserPolicy,
} from './browser-control.policy';

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const json = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

@Injectable()
export class BrowserControlService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tutor: AiTutorProvider,
  ) {}

  async owned(parentId: string, childId: string) {
    const child = await this.prisma.childProfile.findFirst({
      where: { id: childId, parentId },
    });
    if (!child) throw new NotFoundException('Không tìm thấy hồ sơ con');
    return child;
  }
  async policy(childId: string) {
    const row = await this.prisma.browserPolicy.findUnique({
      where: { childId },
    });
    return {
      policy: row
        ? (row.config as unknown as BrowserPolicyDto)
        : defaultBrowserPolicy(),
      revision: row?.revision ?? 0,
    };
  }
  async dashboard(parentId: string, childId: string) {
    await this.owned(parentId, childId);
    const since = new Date(Date.now() - 30 * 86400000);
    const [policy, devices, events, usage] = await Promise.all([
      this.policy(childId),
      this.prisma.browserDevice.findMany({
        where: { childId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          lastSeenAt: true,
          revokedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.browserEvent.findMany({
        where: { device: { childId }, occurredAt: { gte: since } },
        orderBy: { occurredAt: 'desc' },
        take: 200,
      }),
      this.prisma.browserUsage.findMany({
        where: {
          device: { childId },
          day: { gte: since.toISOString().slice(0, 10) },
        },
        orderBy: { day: 'desc' },
        take: 5000,
      }),
    ]);
    return { ...policy, devices, events, usage };
  }
  async savePolicy(parentId: string, childId: string, dto: BrowserPolicyDto) {
    await this.owned(parentId, childId);
    const config = json(validateBrowserPolicy(dto));
    return this.prisma.browserPolicy.upsert({
      where: { childId },
      create: { childId, config },
      update: { config, revision: { increment: 1 } },
    });
  }
  async pairing(parentId: string, childId: string) {
    await this.owned(parentId, childId);
    const code = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60000);
    await this.prisma.browserPairing.create({
      data: { childId, codeHash: hash(code), expiresAt },
    });
    return { code, expiresAt };
  }
  async pair(dto: BrowserPairDto) {
    const token = randomBytes(32).toString('hex');
    const device = await this.prisma.$transaction(async (tx) => {
      const codeHash = hash(dto.code);
      const pairing = await tx.browserPairing.findUnique({
        where: { codeHash },
      });
      if (!pairing)
        throw new UnauthorizedException('Mã ghép không hợp lệ hoặc đã hết hạn');
      const consumed = await tx.browserPairing.updateMany({
        where: { id: pairing.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (consumed.count !== 1)
        throw new UnauthorizedException('Mã ghép không hợp lệ hoặc đã hết hạn');
      const child = await tx.childProfile.findUnique({
        where: { id: pairing.childId },
        include: { parent: true },
      });
      if (child?.parent.status !== 'ACTIVE')
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      return tx.browserDevice.create({
        data: {
          childId: pairing.childId,
          name: dto.name,
          tokenHash: hash(token),
        },
        select: { id: true },
      });
    });
    return {
      deviceId: device.id,
      token,
      ...(await this.sync(`Bearer ${token}`, { usage: [], events: [] })),
    };
  }
  async device(authorization?: string) {
    const match = /^Bearer ([a-f0-9]{64})$/.exec(authorization ?? '');
    if (!match) throw new UnauthorizedException('Thiết bị chưa ghép');
    const device = await this.prisma.browserDevice.findUnique({
      where: { tokenHash: hash(match[1]) },
      include: { child: { include: { parent: { select: { status: true } } } } },
    });
    if (!device || device.revokedAt || device.child.parent.status !== 'ACTIVE')
      throw new UnauthorizedException('Thiết bị đã bị thu hồi');
    return device;
  }
  async revoke(parentId: string, childId: string, deviceId: string) {
    await this.owned(parentId, childId);
    const result = await this.prisma.browserDevice.updateMany({
      where: { id: deviceId, childId },
      data: { revokedAt: new Date() },
    });
    if (!result.count) throw new NotFoundException('Không tìm thấy thiết bị');
    return { revoked: true };
  }
  webOrigin() {
    return new URL(
      this.config.get<string>('WEB_PUBLIC_URL') || 'http://localhost:3000',
    ).origin;
  }
  async sync(authorization: string | undefined, dto: BrowserSyncDto) {
    const device = await this.device(authorization);
    const { policy, revision } = await this.policy(device.childId);
    // Cumulative maxima make lost responses, retries and concurrent sync idempotent.
    await this.prisma.$transaction(async (tx) => {
      for (const entry of dto.usage) {
        const dayTime = Date.parse(entry.day);
        if (
          !Number.isFinite(dayTime) ||
          new Date(dayTime).toISOString().slice(0, 10) !== entry.day ||
          dayTime > Date.now() + 86400000 ||
          dayTime < Date.now() - 32 * 86400000
        )
          throw new BadRequestException('Ngày sử dụng không hợp lệ');
        await tx.$executeRaw`INSERT INTO "BrowserUsage" ("id", "deviceId", "day", "itemId", "seconds") VALUES (${randomUUID()}, ${device.id}, ${entry.day}, ${entry.itemId}, ${entry.seconds}) ON CONFLICT ("deviceId", "day", "itemId") DO UPDATE SET "seconds" = GREATEST("BrowserUsage"."seconds", EXCLUDED."seconds")`;
      }
      if (dto.events.length)
        await tx.browserEvent.createMany({
          data: dto.events.map((event) => ({
            ...event,
            deviceId: device.id,
            occurredAt: new Date(event.occurredAt),
          })),
          skipDuplicates: true,
        });
      await tx.browserDevice.update({
        where: { id: device.id },
        data: { lastSeenAt: new Date() },
      });
    });
    const usage = await this.prisma.browserUsage.findMany({
      where: {
        deviceId: device.id,
        day: {
          gte: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
        },
      },
      select: { day: true, itemId: true, seconds: true },
    });
    return {
      policy: publicBrowserPolicy(policy, this.webOrigin()),
      revision,
      usage,
      serverTime: new Date().toISOString(),
      webOrigin: this.webOrigin(),
      childName: device.child.displayName,
    };
  }
  async learningItem(authorization: string | undefined, itemId: string) {
    const device = await this.device(authorization);
    const { policy } = await this.policy(device.childId);
    if (policy.mode === 'PAUSED')
      throw new ForbiddenException('Phụ huynh đã tạm dừng');
    const item = policy.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Nội dung chưa được duyệt');
    return { device, policy, item };
  }
  async lesson(authorization: string | undefined, itemId: string) {
    const { device, policy, item } = await this.learningItem(
      authorization,
      itemId,
    );
    const messages = await this.prisma.browserMessage.findMany({
      where: { deviceId: device.id, itemId },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });
    return {
      title: item.title,
      context: item.context,
      aiEnabled: policy.mode !== 'EXERCISE_ONLY' && this.tutor.isEnabled(),
      questions: item.questions.map((question) => ({
        prompt: question.prompt,
        options: question.options,
      })),
      messages: messages.reverse(),
    };
  }
  async chat(
    authorization: string | undefined,
    itemId: string,
    message: string,
  ) {
    const { device, policy, item } = await this.learningItem(
      authorization,
      itemId,
    );
    if (policy.mode === 'EXERCISE_ONLY')
      throw new ForbiddenException('Chỉ dùng bài tập');
    const reserved = await this.prisma.browserDevice.updateMany({
      where: {
        id: device.id,
        OR: [{ aiNextAt: null }, { aiNextAt: { lt: new Date() } }],
      },
      data: { aiNextAt: new Date(Date.now() + 10000) },
    });
    if (!reserved.count)
      throw new BadRequestException('Con đợi vài giây rồi gửi tiếp nhé');
    const history = await this.prisma.browserMessage.findMany({
      where: { deviceId: device.id, itemId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    const reply = await this.tutor.reply({
      message,
      history: history.reverse().map((m) => ({
        role: m.role as 'USER' | 'ASSISTANT',
        content: m.content,
      })),
      contexts: [
        {
          id: item.id,
          title: item.title,
          sourceUrl: null,
          structuredContent: item.context,
        },
      ],
    });
    await this.prisma.$transaction([
      this.prisma.browserMessage.create({
        data: { deviceId: device.id, itemId, role: 'USER', content: message },
      }),
      this.prisma.browserMessage.create({
        data: {
          deviceId: device.id,
          itemId,
          role: 'ASSISTANT',
          content: reply.text,
        },
      }),
    ]);
    return reply;
  }
  async attempt(
    authorization: string | undefined,
    itemId: string,
    dto: BrowserAttemptDto,
  ) {
    const { device, item } = await this.learningItem(authorization, itemId);
    if (
      dto.answers.length !== item.questions.length ||
      dto.answers.some(
        (answer, index) => answer >= item.questions[index].options.length,
      )
    )
      throw new BadRequestException('Hãy trả lời đủ các câu hỏi');
    const correct = item.questions.filter(
      (q, index) => q.answer === dto.answers[index],
    ).length;
    const detail = {
      title: item.title,
      correct,
      total: item.questions.length,
      answers: dto.answers,
    };
    const event = await this.prisma.browserEvent.upsert({
      where: {
        deviceId_eventId: { deviceId: device.id, eventId: dto.eventId },
      },
      create: {
        deviceId: device.id,
        itemId,
        eventId: dto.eventId,
        kind: 'EXERCISE',
        detail,
        occurredAt: new Date(),
      },
      update: {},
    });
    return event.detail;
  }
}
