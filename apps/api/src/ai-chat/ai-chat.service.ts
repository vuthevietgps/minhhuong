import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { EntitlementService } from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { AiTutorProvider } from './ai-tutor.provider';
import { AiContextService } from '../ai-context/ai-context.service';
import { ScreenTimeService } from '../screen-time/screen-time.service';

@Injectable()
export class AiChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
    private readonly tutor: AiTutorProvider,
    private readonly contexts: AiContextService,
    private readonly screenTime: ScreenTimeService,
  ) {}

  async getSession(user: AuthenticatedUser, sessionId: string) {
    const session = await this.prisma.aiChatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('AI chat session not found');
    }

    await this.childAccess.assertCanAccessChild(user, session.childProfileId, {
      purpose: 'ai-chat:read-session',
    });
    await this.entitlement.assertCapability(session.childProfileId, 'aiChat');
    await this.screenTime.assertNotOnBreak(session.childProfileId);

    return {
      ...session,
      ...this.tutor.getStatus(),
    };
  }

  async createMessage(user: AuthenticatedUser, dto: CreateChatMessageDto) {
    if (!dto.childProfileId) {
      throw new BadRequestException('childProfileId is required');
    }

    await this.childAccess.assertCanAccessChild(user, dto.childProfileId, {
      purpose: 'ai-chat:create-message',
    });
    await this.entitlement.assertCapability(dto.childProfileId, 'aiChat');
    await this.screenTime.assertNotOnBreak(dto.childProfileId);
    const session = dto.sessionId
      ? await this.prisma.aiChatSession.findUnique({
          where: { id: dto.sessionId },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 8,
            },
          },
        })
      : await this.prisma.aiChatSession.create({
          data: {
            childProfileId: dto.childProfileId,
            title: dto.message.slice(0, 80),
          },
          include: { messages: true },
        });

    if (!session) {
      throw new NotFoundException('AI chat session not found');
    }

    if (session.childProfileId !== dto.childProfileId) {
      throw new ForbiddenException(
        'AI chat session does not belong to the requested child',
      );
    }

    const contexts = await this.contexts.getChatContext(
      ['STUDENT'],
      dto.message,
    );
    const reply = await this.tutor.reply({
      message: dto.message,
      contexts,
      history: [...session.messages]
        .reverse()
        .filter(
          (
            message,
          ): message is typeof message & { role: 'USER' | 'ASSISTANT' } =>
            message.role === 'USER' || message.role === 'ASSISTANT',
        )
        .map((message) => ({ role: message.role, content: message.content })),
    });

    await this.entitlement.consumeTrialAiResponse(dto.childProfileId);

    const safeUserContent =
      reply.moderation === 'BLOCKED_INPUT'
        ? '[Message blocked by child-safety filter]'
        : dto.message;

    await this.prisma.aiChatMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: 'USER',
          content: safeUserContent,
        },
        {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: reply.text,
          metadata: {
            provider: reply.provider,
            model: reply.model,
            mode: reply.mode,
            moderation: reply.moderation,
            contextSourceIds: contexts.map((context) => context.id),
          },
        },
      ],
    });

    return {
      sessionId: session.id,
      assistantMessage: reply.text,
      provider: reply.provider,
      model: reply.model,
      mode: reply.mode,
      moderation: reply.moderation,
      contextSources: contexts.map((context) => ({
        id: context.id,
        title: context.title,
        sourceUrl: context.sourceUrl,
      })),
    };
  }
}
