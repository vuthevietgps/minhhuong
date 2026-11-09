import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChannelUserRoleDto,
  CreateSaleUserDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateUserStatusDto,
  UserStatusDto,
} from './dto/agency.dto';
import { ChannelAdminAccessService } from './channel-admin-access.service';
import {
  createChannelParticipant,
  defaultReferralCode,
  hashPassword,
  isAgencyChannelManager,
  isGlobalChannelManager,
  isGlobalChannelViewer,
  normalizeCode,
  optionalRate,
  vndToCents,
} from './channel-admin.helpers';
import {
  assertRoleCanRecruit,
  descriptionForRole,
  memberRoleForUserRole,
  participantStatusForUser,
  participantTypeForRole,
  resolveCreatableRole,
  userSelect,
} from './channel-user-admin.helpers';

/** Sale/agency users: create, list, status, roles, password reset, detail. */
@Injectable()
export class ChannelUserAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelAdminAccessService: ChannelAdminAccessService,
  ) {}

  async createSaleUser(dto: CreateSaleUserDto, user: AuthenticatedUser) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const requestedRole = resolveCreatableRole(dto, user);
    const parentParticipant = await this.resolveParentParticipantForNewUser(
      dto,
      user,
      requestedRole,
    );

    if (dto.agencyCode && requestedRole !== ChannelUserRoleDto.AGENCY_OWNER) {
      const agency = await this.prisma.agency.findUnique({
        where: { code: normalizeCode(dto.agencyCode) },
        select: { id: true },
      });
      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
      await this.channelAdminAccessService.assertCanManageAgency(
        agency.id,
        user,
      );
    }

    const saleUser = await this.prisma.$transaction(async (tx) => {
      let agencyForMembership = null as Awaited<
        ReturnType<typeof tx.agency.findUnique>
      >;
      if (requestedRole === ChannelUserRoleDto.AGENCY_OWNER) {
        const agencyCode = normalizeCode(
          dto.agencyCode ?? dto.displayName ?? email.split('@')[0],
        );
        const existingAgency = await tx.agency.findUnique({
          where: { code: agencyCode },
        });
        if (existingAgency) {
          throw new BadRequestException('Agency code already exists');
        }
        agencyForMembership = await tx.agency.create({
          data: {
            code: agencyCode,
            name: dto.displayName?.trim() || agencyCode,
            defaultRateBps: 0,
          },
        });
      } else if (dto.agencyCode) {
        agencyForMembership = await tx.agency.findUnique({
          where: { code: normalizeCode(dto.agencyCode) },
        });
      } else if (
        parentParticipant?.type === 'AGENCY' &&
        parentParticipant.agencyId
      ) {
        agencyForMembership = await tx.agency.findUnique({
          where: { id: parentParticipant.agencyId },
        });
      }

      const created = await tx.user.create({
        data: {
          email,
          passwordHash: hashPassword(dto.password),
          status: 'ACTIVE',
          profile: {
            create: { displayName: dto.displayName },
          },
          roles: {
            create: {
              role: {
                connectOrCreate: {
                  where: { name: requestedRole },
                  create: {
                    name: requestedRole,
                    description: descriptionForRole(requestedRole),
                  },
                },
              },
            },
          },
          ...(agencyForMembership &&
          requestedRole !== ChannelUserRoleDto.AGENCY_MANAGER &&
          requestedRole !== ChannelUserRoleDto.DIRECTOR
            ? {
                agencyMemberships: {
                  create: {
                    agencyId: agencyForMembership.id,
                    role: memberRoleForUserRole(requestedRole),
                    title: dto.displayName,
                    referralCode: dto.referralCode
                      ? normalizeCode(dto.referralCode)
                      : defaultReferralCode(email),
                  },
                },
              }
            : {}),
        },
      });

      const participantCode =
        requestedRole === ChannelUserRoleDto.AGENCY_OWNER
          ? (agencyForMembership?.code ?? defaultReferralCode(email))
          : dto.referralCode
            ? normalizeCode(dto.referralCode)
            : defaultReferralCode(email);

      await createChannelParticipant(tx, {
        type: participantTypeForRole(requestedRole),
        code: participantCode,
        displayName:
          agencyForMembership?.name ?? dto.displayName?.trim() ?? email,
        userId: created.id,
        agencyId:
          requestedRole === ChannelUserRoleDto.AGENCY_OWNER
            ? (agencyForMembership?.id ?? null)
            : null,
        parentParticipantId: parentParticipant?.id ?? null,
        parentLineage: parentParticipant?.lineage,
        parentDepth: parentParticipant?.depth,
        parentRootParticipantId:
          parentParticipant?.rootParticipantId ?? parentParticipant?.id,
        baseSalaryCents: vndToCents(dto.baseSalaryVnd ?? 0),
        commissionRateBps: optionalRate(dto.rateBps),
      });

      return tx.user.findUniqueOrThrow({
        where: { id: created.id },
        select: userSelect(),
      });
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.user.create',
      'User',
      saleUser.id,
      {
        email,
        role: requestedRole,
        parentParticipantId: parentParticipant?.id,
      },
    );

    return saleUser;
  }

  async listUsers(user: AuthenticatedUser, query: ListUsersQueryDto) {
    const limit = query.limit ?? 50;
    const where = await this.userListWhere(user, query);
    const [total, records] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : 0,
        take: limit + 1,
        select: userSelect(),
      }),
    ]);
    const hasMore = records.length > limit;
    const items = hasMore ? records.slice(0, limit) : records;

    return {
      items,
      total,
      limit,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    };
  }

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    user: AuthenticatedUser,
  ) {
    await this.assertCanManageUser(userId, user);
    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          status: dto.status,
          ...(dto.status === UserStatusDto.SUSPENDED && dto.reason
            ? { suspendReason: dto.reason.trim() }
            : dto.status === UserStatusDto.ACTIVE
              ? { suspendReason: null }
              : {}),
        },
        select: userSelect(),
      });
      await tx.channelParticipant.updateMany({
        where: { userId },
        data: { status: participantStatusForUser(dto.status) },
      });

      return user;
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.user.status_update',
      'User',
      userId,
      {
        status: dto.status,
        reason: dto.reason,
      },
    );

    return updated;
  }

  async setUserPlatformRole(
    userId: string,
    dto: { role: string; action: 'add' | 'remove' },
    user: AuthenticatedUser,
  ) {
    // Only global ADMIN can assign/remove platform roles
    if (!user.roles.includes('ADMIN')) {
      throw new ForbiddenException('Only ADMIN can assign platform roles');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!target) throw new NotFoundException('User not found');

    if (dto.action === 'add') {
      await this.prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: (
              await this.prisma.role.upsert({
                where: { name: dto.role },
                create: { name: dto.role, description: dto.role },
                update: {},
                select: { id: true },
              })
            ).id,
          },
        },
        create: {
          user: { connect: { id: userId } },
          role: {
            connectOrCreate: {
              where: { name: dto.role },
              create: { name: dto.role, description: dto.role },
            },
          },
        },
        update: {},
      });
    } else {
      await this.prisma.userRole.deleteMany({
        where: {
          userId,
          role: { name: dto.role },
        },
      });
    }

    await this.channelAdminAccessService.audit(
      user,
      `channel.user.role_${dto.action}`,
      'User',
      userId,
      {
        role: dto.role,
      },
    );

    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: userSelect(),
    });
  }

  async resetUserPassword(
    userId: string,
    dto: ResetUserPasswordDto,
    user: AuthenticatedUser,
  ) {
    await this.assertCanManageUser(userId, user);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashPassword(dto.password) },
      select: userSelect(),
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.user.password_reset',
      'User',
      userId,
    );

    return updated;
  }

  private async userScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.UserWhereInput | undefined> {
    if (isGlobalChannelViewer(user)) {
      return undefined;
    }

    const participant =
      await this.channelAdminAccessService.actorParticipant(user);
    if (!participant) {
      return { id: '__none__' };
    }

    return {
      OR: [
        {
          channelParticipant: {
            is: {
              lineage: { startsWith: participant.lineage },
            },
          },
        },
        {
          activationOrders: {
            some: {
              channelParticipant: {
                is: {
                  lineage: { startsWith: participant.lineage },
                },
              },
            },
          },
        },
      ],
    };
  }

  private async userListWhere(
    user: AuthenticatedUser,
    query: ListUsersQueryDto,
  ): Promise<Prisma.UserWhereInput> {
    const filters: Prisma.UserWhereInput[] = [];
    const scope = await this.userScopeWhere(user);

    if (scope) {
      filters.push(scope);
    }

    if (query.status) {
      filters.push({ status: query.status });
    }

    if (query.role) {
      filters.push({
        roles: {
          some: {
            role: {
              name: query.role,
            },
          },
        },
      });
    }

    const q = query.q?.trim();
    if (q) {
      filters.push({
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          {
            profile: {
              is: {
                displayName: { contains: q, mode: 'insensitive' },
              },
            },
          },
          {
            agencyMemberships: {
              some: {
                referralCode: { contains: q, mode: 'insensitive' },
              },
            },
          },
          {
            channelParticipant: {
              is: {
                code: { contains: q, mode: 'insensitive' },
              },
            },
          },
        ],
      });
    }

    return filters.length > 0 ? { AND: filters } : {};
  }

  private async assertCanManageUser(
    targetUserId: string,
    user: AuthenticatedUser,
  ) {
    if (isGlobalChannelManager(user)) {
      return;
    }

    const actor = await this.channelAdminAccessService.actorParticipant(user);
    if (!actor || !isAgencyChannelManager(user)) {
      throw new ForbiddenException('Insufficient channel user permission');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        channelParticipant: {
          select: { lineage: true, depth: true },
        },
      },
    });
    if (!target?.channelParticipant) {
      throw new ForbiddenException('Insufficient channel user permission');
    }
    if (
      !target.channelParticipant.lineage.startsWith(actor.lineage) ||
      target.channelParticipant.depth <= actor.depth
    ) {
      throw new ForbiddenException('Insufficient channel user permission');
    }
  }

  private async resolveParentParticipantForNewUser(
    dto: CreateSaleUserDto,
    user: AuthenticatedUser,
    requestedRole: ChannelUserRoleDto,
  ) {
    if (isGlobalChannelManager(user)) {
      if (!dto.parentCode) {
        return requestedRole === ChannelUserRoleDto.DIRECTOR ? null : null;
      }

      const parent = await this.prisma.channelParticipant.findUnique({
        where: { code: normalizeCode(dto.parentCode) },
        select: {
          id: true,
          type: true,
          agencyId: true,
          lineage: true,
          depth: true,
          rootParticipantId: true,
        },
      });
      if (!parent) {
        throw new NotFoundException('Parent channel node not found');
      }
      assertRoleCanRecruit(parent.type, requestedRole);
      return parent;
    }

    const actor = await this.channelAdminAccessService.actorParticipant(user);
    if (!actor) {
      throw new ForbiddenException(
        'No active channel node found for this account',
      );
    }

    assertRoleCanRecruit(actor.type, requestedRole);
    return actor;
  }

  async getUserDetail(userId: string, user: AuthenticatedUser) {
    const canSeeAll = user.roles.some((r) =>
      ['ADMIN', 'DIRECTOR', 'OPERATIONS', 'SUPPORT'].includes(r),
    );
    if (!canSeeAll) throw new ForbiddenException('Insufficient permissions');

    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roles: { select: { role: { select: { name: true } } } },
        agencyMemberships: {
          where: { isActive: true },
          include: { agency: { select: { id: true, code: true, name: true } } },
        },
        channelParticipant: {
          select: {
            id: true,
            type: true,
            code: true,
            displayName: true,
            status: true,
          },
        },
        childProfiles: {
          select: {
            id: true,
            displayName: true,
            subscriptions: {
              orderBy: { currentPeriodEnd: 'desc' },
              take: 1,
              select: {
                status: true,
                currentPeriodEnd: true,
                plan: { select: { name: true } },
              },
            },
          },
        },
        activationOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            packageName: true,
            amountCents: true,
            currency: true,
            activatedAt: true,
            expiresAt: true,
            createdAt: true,
            reviewNotes: true,
            revokeReason: true,
            createdBy: { select: { email: true } },
          },
        },
      },
    });
    if (!record) throw new NotFoundException('User not found');
    return record;
  }
}
