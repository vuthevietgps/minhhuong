import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { dbUserId, isGlobalManager } from './channel-affiliate.helpers';

/** Shared actor/participant scoping and audit log helpers. */
@Injectable()
export class AffiliateAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async participantScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.ChannelParticipantWhereInput | undefined> {
    if (isGlobalManager(user)) {
      return undefined;
    }

    const participant = await this.actorParticipant(user);
    if (!participant) {
      return { id: '__none__' };
    }

    return { lineage: { startsWith: participant.lineage } };
  }

  async actorParticipant(user: AuthenticatedUser) {
    const userId = dbUserId(user);
    if (!userId) {
      return null;
    }

    return this.prisma.channelParticipant.findFirst({
      where: { userId, status: 'ACTIVE' },
      select: {
        id: true,
        type: true,
        code: true,
        userId: true,
        agencyId: true,
        lineage: true,
        depth: true,
        status: true,
      },
    });
  }
}
