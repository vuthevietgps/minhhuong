import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelAdminAccessService } from './channel-admin-access.service';
import { isGlobalChannelViewer } from './channel-admin.helpers';

/** Channel summary and audit log listing. */
@Injectable()
export class ChannelAdminReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelAdminAccessService: ChannelAdminAccessService,
  ) {}

  async getSummary(user: AuthenticatedUser) {
    const [scopedAgencyWhere, scopedParticipantWhere] = await Promise.all([
      this.channelAdminAccessService.agencyScopeWhere(user),
      this.participantScopeWhere(user),
    ]);

    if (scopedAgencyWhere || scopedParticipantWhere) {
      const [
        agencies,
        activeAgencies,
        saleUsers,
        activeMembers,
        policies,
        learners,
      ] = await Promise.all([
        this.prisma.agency.count({ where: scopedAgencyWhere ?? undefined }),
        this.prisma.agency.count({
          where: {
            ...(scopedAgencyWhere ?? {}),
            status: 'ACTIVE',
          },
        }),
        this.prisma.user.count({
          where: {
            channelParticipant: {
              is: {
                ...(scopedParticipantWhere ?? { id: '__none__' }),
                type: 'SALE',
              },
            },
          },
        }),
        this.prisma.channelParticipant.count({
          where: scopedParticipantWhere ?? { id: '__none__' },
        }),
        this.prisma.commissionPolicy.count({ where: { isActive: true } }),
        this.prisma.user.count({
          where: {
            roles: { some: { role: { name: 'STUDENT' } } },
            activationOrders: {
              some: {
                channelParticipant: {
                  is: scopedParticipantWhere ?? { id: '__none__' },
                },
              },
            },
          },
        }),
      ]);

      return {
        agencies,
        activeAgencies,
        saleUsers,
        activeMembers,
        policies,
        learners,
      };
    }

    const [
      agencies,
      activeAgencies,
      saleUsers,
      activeMembers,
      policies,
      learners,
    ] = await Promise.all([
      this.prisma.agency.count(),
      this.prisma.agency.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: { roles: { some: { role: { name: 'SALE' } } } },
      }),
      this.prisma.agencyMember.count({ where: { isActive: true } }),
      this.prisma.commissionPolicy.count({ where: { isActive: true } }),
      this.prisma.user.count({
        where: { roles: { some: { role: { name: 'STUDENT' } } } },
      }),
    ]);

    return {
      agencies,
      activeAgencies,
      saleUsers,
      activeMembers,
      policies,
      learners,
    };
  }

  private async participantScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.ChannelParticipantWhereInput | undefined> {
    if (isGlobalChannelViewer(user)) {
      return undefined;
    }

    const participant =
      await this.channelAdminAccessService.actorParticipant(user);
    if (!participant) {
      return { id: '__none__' };
    }

    return {
      lineage: { startsWith: participant.lineage },
    };
  }

  async listAuditLogs(
    query: {
      action?: string;
      userEmail?: string;
      entityType?: string;
      cursor?: string;
      limit?: number;
    },
    user: AuthenticatedUser,
  ) {
    const canSee = user.roles.some((r) =>
      ['ADMIN', 'DIRECTOR', 'OPERATIONS'].includes(r),
    );
    if (!canSee) throw new ForbiddenException('Insufficient permissions');

    const limit = Math.min(query.limit ?? 50, 200);
    const where: Prisma.AuditLogWhereInput = {};

    if (query.action) {
      where.action = { contains: query.action, mode: 'insensitive' };
    }
    if (query.entityType) {
      where.entityType = { equals: query.entityType, mode: 'insensitive' };
    }
    if (query.userEmail) {
      where.user = {
        email: { contains: query.userEmail, mode: 'insensitive' },
      };
    }
    if (query.cursor) {
      where.id = { lt: query.cursor };
    }

    const items = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;
    return {
      items: results,
      nextCursor: hasMore ? results[results.length - 1]?.id : null,
      hasMore,
    };
  }
}
