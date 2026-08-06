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

@Injectable()
export class AiChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
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

    return {
      ...session,
      provider: 'mock',
      mode: 'MOCK_DEV_ONLY',
      note: 'No production AI provider is called.',
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

    const reply = this.mockTutorReply(dto.message);

    const session = dto.sessionId
      ? await this.prisma.aiChatSession.findUnique({
          where: { id: dto.sessionId },
        })
      : await this.prisma.aiChatSession.create({
          data: {
            childProfileId: dto.childProfileId,
            title: dto.message.slice(0, 80),
          },
        });

    if (!session) {
      throw new NotFoundException('AI chat session not found');
    }

    if (session.childProfileId !== dto.childProfileId) {
      throw new ForbiddenException(
        'AI chat session does not belong to the requested child',
      );
    }

    await this.prisma.aiChatMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: 'USER',
          content: dto.message,
        },
        {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: reply,
          metadata: { provider: 'mock' },
        },
      ],
    });

    return {
      sessionId: session.id,
      assistantMessage: reply,
      provider: 'mock',
      mode: 'MOCK_DEV_ONLY',
      note: 'No production AI provider is called.',
    };
  }

  private mockTutorReply(message: string): string {
    return `Trợ lý Minh Hương: Mình sẽ cùng bạn luyện câu “${message}”. Hãy đọc chậm một lần, sau đó thử nói lại thật tự nhiên nhé!`;
  }
}
