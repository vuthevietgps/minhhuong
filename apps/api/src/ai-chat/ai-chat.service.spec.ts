import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AiChatService } from './ai-chat.service';

describe('AiChatService', () => {
  const prisma = {
    aiChatSession: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    aiChatMessage: {
      createMany: jest.fn(),
    },
  };
  const childAccess = {
    assertCanAccessChild: jest.fn(),
  };
  const entitlement = {
    assertCapability: jest.fn(),
    consumeTrialAiResponse: jest.fn(),
  };
  const tutor = {
    getStatus: jest.fn(),
    reply: jest.fn(),
  };
  const contexts = {
    getChatContext: jest.fn(),
  };
  const screenTime = {
    assertNotOnBreak: jest.fn(),
  };
  const service = new AiChatService(
    prisma as any,
    childAccess as any,
    entitlement as any,
    tutor as any,
    contexts as any,
    screenTime as any,
  );
  const parent = {
    sub: 'parent-1',
    email: 'parent@example.com',
    roles: ['PARENT'],
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
    childAccess.assertCanAccessChild.mockResolvedValue({
      id: 'child-1',
      parentId: 'parent-1',
    });
    entitlement.assertCapability.mockResolvedValue({});
    entitlement.consumeTrialAiResponse.mockResolvedValue(undefined);
    contexts.getChatContext.mockResolvedValue([]);
    screenTime.assertNotOnBreak.mockResolvedValue(undefined);
    tutor.getStatus.mockReturnValue({
      provider: 'mock',
      model: null,
      mode: 'MOCK_DEV_ONLY',
    });
    tutor.reply.mockResolvedValue({
      text: 'Great try! Please say it again.',
      provider: 'mock',
      model: null,
      mode: 'MOCK_DEV_ONLY',
      moderation: 'NOT_RUN',
    });
  });

  it('requires a childProfileId before creating a message', async () => {
    await expect(
      service.createMessage(parent, { message: 'hello' }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.aiChatSession.create).not.toHaveBeenCalled();
  });

  it('blocks users from creating AI messages for another child', async () => {
    childAccess.assertCanAccessChild.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await expect(
      service.createMessage(parent, {
        childProfileId: 'child-b',
        message: 'hello',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.aiChatSession.create).not.toHaveBeenCalled();
  });

  it('checks the aiChat entitlement before persisting messages', async () => {
    entitlement.assertCapability.mockRejectedValue(
      new ForbiddenException('aiChat is not enabled'),
    );

    await expect(
      service.createMessage(parent, {
        childProfileId: 'child-1',
        message: 'hello',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.aiChatSession.create).not.toHaveBeenCalled();
  });

  it('persists an AI tutor reply and its provider/safety metadata', async () => {
    prisma.aiChatSession.create.mockResolvedValue({
      id: 'session-1',
      childProfileId: 'child-1',
      messages: [],
    });
    prisma.aiChatMessage.createMany.mockResolvedValue({ count: 2 });

    await expect(
      service.createMessage(parent, {
        childProfileId: 'child-1',
        message: 'practice this',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        sessionId: 'session-1',
        provider: 'mock',
        mode: 'MOCK_DEV_ONLY',
      }),
    );
    expect(prisma.aiChatMessage.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ role: 'USER' }),
          expect.objectContaining({
            role: 'ASSISTANT',
            metadata: expect.objectContaining({
              provider: 'mock',
              moderation: 'NOT_RUN',
            }),
          }),
        ]),
      }),
    );
    expect(entitlement.consumeTrialAiResponse).toHaveBeenCalledWith('child-1');
  });

  it('does not retain unsafe child input verbatim', async () => {
    prisma.aiChatSession.create.mockResolvedValue({
      id: 'session-1',
      childProfileId: 'child-1',
      messages: [],
    });
    tutor.reply.mockResolvedValue({
      text: 'Let us talk about colors in English.',
      provider: 'openai',
      model: 'gpt-5-mini',
      mode: 'LIVE',
      moderation: 'BLOCKED_INPUT',
    });

    await service.createMessage(parent, {
      childProfileId: 'child-1',
      message: 'unsafe input',
    });

    expect(prisma.aiChatMessage.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            role: 'USER',
            content: '[Message blocked by child-safety filter]',
          }),
        ]),
      }),
    );
  });
});
