import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChannelFinanceScope,
  canManageFinance,
  dbUserId,
  summarizeEntries,
} from './channel-finance.helpers';

/** Shared actor scope resolution for channel finance. */
@Injectable()
export class ChannelFinanceScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async getWalletSummary(user: AuthenticatedUser) {
    const scope = await this.scopeFor(user);
    const entries = await this.prisma.commissionLedgerEntry.findMany({
      where: scope.ledgerWhere,
      select: {
        type: true,
        amountCents: true,
        currency: true,
      },
    });

    return summarizeEntries(entries);
  }

  async scopeFor(user: AuthenticatedUser): Promise<ChannelFinanceScope> {
    if (canManageFinance(user)) {
      return {
        orderWhere: {},
        earningWhere: {},
        ledgerWhere: {},
        payoutWhere: {},
        participantWhere: {},
      };
    }

    const actor = await this.actorParticipant(user);
    if (!actor) {
      return {
        orderWhere: { id: '__none__' },
        earningWhere: { id: '__none__' },
        ledgerWhere: { id: '__none__' },
        payoutWhere: { id: '__none__' },
        participantWhere: { id: '__none__' },
      };
    }
    const participantWhere: Prisma.ChannelParticipantWhereInput = {
      lineage: { startsWith: actor.lineage },
    };

    return {
      orderWhere: {
        OR: [
          { channelParticipant: { is: participantWhere } },
          ...(actor.userId ? [{ createdById: actor.userId }] : []),
        ],
      },
      earningWhere: {
        participant: { is: participantWhere },
      },
      ledgerWhere: {
        participant: { is: participantWhere },
      },
      payoutWhere: {
        participant: { is: participantWhere },
      },
      participantWhere,
    };
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
        userId: true,
        agencyId: true,
        lineage: true,
      },
    });
  }
}
