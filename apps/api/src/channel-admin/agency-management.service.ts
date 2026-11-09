import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddAgencyMemberDto,
  AgencyMemberRoleDto,
  CreateAgencyDto,
  UpdateAgencyDto,
  UpdateAgencyMemberDto,
} from './dto/agency.dto';
import { ChannelAdminAccessService } from './channel-admin-access.service';
import {
  assertScopedAgencyMemberRole,
  assertUserHasRoleForMemberRole,
  defaultReferralCode,
  normalizeCode,
  optionalRate,
  participantStatusForAgency,
} from './channel-admin.helpers';

/** Agencies and their members. */
@Injectable()
export class AgencyManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelAdminAccessService: ChannelAdminAccessService,
  ) {}

  async listAgencies(user: AuthenticatedUser) {
    return this.prisma.agency.findMany({
      where: await this.channelAdminAccessService.agencyScopeWhere(user),
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      include: {
        channelParticipant: true,
        members: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
                profile: { select: { displayName: true } },
              },
            },
          },
        },
        _count: {
          select: {
            activationOrders: true,
            commissions: true,
            payoutRequests: true,
          },
        },
      },
    });
  }

  async createAgency(dto: CreateAgencyDto, user: AuthenticatedUser) {
    const code = normalizeCode(dto.code);
    const agency = await this.prisma.$transaction(async (tx) => {
      const created = await tx.agency.create({
        data: {
          code,
          name: dto.name.trim(),
          defaultRateBps: dto.defaultRateBps ?? 0,
          notes: dto.notes,
        },
      });

      await tx.channelParticipant.create({
        data: {
          type: 'AGENCY',
          code,
          displayName: created.name,
          agencyId: created.id,
          status: 'ACTIVE',
          baseSalaryCents: 0,
          commissionRateBps: optionalRate(dto.defaultRateBps),
          notes: dto.notes,
        },
      });

      return created;
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.agency.create',
      'Agency',
      agency.id,
      {
        code,
      },
    );

    return agency;
  }

  async updateAgency(
    agencyId: string,
    dto: UpdateAgencyDto,
    user: AuthenticatedUser,
  ) {
    await this.channelAdminAccessService.assertAgency(agencyId);
    const agency = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.agency.update({
        where: { id: agencyId },
        data: {
          ...(dto.name ? { name: dto.name.trim() } : {}),
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.defaultRateBps !== undefined
            ? { defaultRateBps: dto.defaultRateBps }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        },
      });

      await tx.channelParticipant.upsert({
        where: { agencyId },
        update: {
          ...(dto.name ? { displayName: dto.name.trim() } : {}),
          ...(dto.status
            ? { status: participantStatusForAgency(dto.status) }
            : {}),
          ...(dto.defaultRateBps !== undefined
            ? { commissionRateBps: optionalRate(dto.defaultRateBps) }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        },
        create: {
          type: 'AGENCY',
          code: updated.code,
          displayName: updated.name,
          agencyId: updated.id,
          status: participantStatusForAgency(updated.status),
          baseSalaryCents: 0,
          commissionRateBps: optionalRate(updated.defaultRateBps),
          notes: updated.notes,
        },
      });

      return updated;
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.agency.update',
      'Agency',
      agency.id,
    );

    return agency;
  }

  async addAgencyMember(
    agencyId: string,
    dto: AddAgencyMemberDto,
    user: AuthenticatedUser,
  ) {
    await this.channelAdminAccessService.assertCanManageAgency(agencyId, user);
    const memberUser = await this.prisma.user.findUnique({
      where: { email: dto.saleEmail.trim().toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
    if (!memberUser) {
      throw new NotFoundException('Channel user not found');
    }

    const memberRole = dto.memberRole ?? AgencyMemberRoleDto.SALE;
    assertScopedAgencyMemberRole(memberRole, user);
    assertUserHasRoleForMemberRole(memberUser, memberRole);

    const member = await this.prisma.agencyMember.upsert({
      where: {
        agencyId_userId: {
          agencyId,
          userId: memberUser.id,
        },
      },
      update: {
        role: memberRole,
        title: dto.title,
        rateBps: dto.rateBps,
        referralCode: dto.referralCode
          ? normalizeCode(dto.referralCode)
          : undefined,
        isActive: true,
      },
      create: {
        agencyId,
        userId: memberUser.id,
        role: memberRole,
        title: dto.title,
        rateBps: dto.rateBps,
        referralCode:
          dto.referralCode !== undefined
            ? normalizeCode(dto.referralCode)
            : defaultReferralCode(memberUser.email),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: { select: { displayName: true } },
          },
        },
        agency: true,
      },
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.agency.member_upsert',
      'AgencyMember',
      member.id,
      {
        agencyId,
        memberEmail: memberUser.email,
        memberRole,
      },
    );

    return member;
  }

  async updateAgencyMember(
    memberId: string,
    dto: UpdateAgencyMemberDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.agencyMember.findUnique({
      where: { id: memberId },
      select: { agencyId: true, role: true },
    });
    if (!existing) {
      throw new NotFoundException('Agency member not found');
    }
    assertScopedAgencyMemberRole(existing.role, user);
    assertScopedAgencyMemberRole(dto.memberRole ?? existing.role, user);
    await this.channelAdminAccessService.assertCanManageAgency(
      existing.agencyId,
      user,
    );

    const member = await this.prisma.agencyMember.update({
      where: { id: memberId },
      data: {
        ...(dto.memberRole !== undefined ? { role: dto.memberRole } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.rateBps !== undefined ? { rateBps: dto.rateBps } : {}),
        ...(dto.referralCode !== undefined
          ? { referralCode: normalizeCode(dto.referralCode) }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: { select: { displayName: true } },
          },
        },
        agency: true,
      },
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.agency.member_update',
      'AgencyMember',
      member.id,
    );

    return member;
  }
}
