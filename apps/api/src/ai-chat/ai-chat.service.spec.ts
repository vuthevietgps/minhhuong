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
  };
  const service = new AiChatService(
    prisma as any,
    childAccess as any,
    entitlement as any,
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

  it('persists only mock/dev-only messages when guarded access is allowed', async () => {
    prisma.aiChatSession.create.mockResolvedValue({
      id: 'session-1',
      childProfileId: 'child-1',
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
            metadata: { provider: 'mock' },
          }),
        ]),
      }),
    );
  });
});
