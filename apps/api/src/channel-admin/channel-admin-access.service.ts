import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  dbUserId,
  isAgencyChannelManager,
  isGlobalChannelManager,
  isGlobalChannelViewer,
} from './channel-admin.helpers';

/** Shared actor scope checks and audit log helpers for channel administration. */
@Injectable()
export class ChannelAdminAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertAgency(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });
    if (!agency) {
      throw new NotFoundException('Agency not found');
    }
  }

  async actorParticipant(
    user: AuthenticatedUser,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const userId = dbUserId(user);
    if (!userId) {
      return null;
    }

    return tx.channelParticipant.findFirst({
      where: { userId, status: 'ACTIVE' },
      select: {
        id: true,
        type: true,
        code: true,
        userId: true,
        agencyId: true,
        lineage: true,
        depth: true,
        rootParticipantId: true,
      },
    });
  }

  async agencyScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.AgencyWhereInput | undefined> {
    if (isGlobalChannelViewer(user)) {
      return undefined;
    }

    const participant = await this.actorParticipant(user);
    if (!participant) {
      return { id: '__none__' };
    }

    return {
      channelParticipant: {
        is: {
          lineage: { startsWith: participant.lineage },
        },
      },
    };
  }

  async assertCanManageAgency(agencyId: string, user: AuthenticatedUser) {
    await this.assertAgency(agencyId);
    if (isGlobalChannelManager(user)) {
      return;
    }

    const actor = await this.actorParticipant(user);
    if (!actor || !isAgencyChannelManager(user)) {
      throw new ForbiddenException('Insufficient agency permission');
    }

    const agencyParticipant = await this.prisma.channelParticipant.findUnique({
      where: { agencyId },
      select: { lineage: true },
    });
    if (!agencyParticipant) {
      throw new ForbiddenException('Insufficient agency permission');
    }
    if (!agencyParticipant.lineage.startsWith(actor.lineage)) {
      throw new ForbiddenException('Insufficient agency permission');
    }
  }

  async audit(
    user: AuthenticatedUser,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          userId: user.sub.startsWith('demo-') ? undefined : user.sub,
          action,
          entityType,
          entityId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }
}
