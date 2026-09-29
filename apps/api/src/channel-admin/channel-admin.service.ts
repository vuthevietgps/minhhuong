import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID, scryptSync } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import {
  ApplyForAgencyDto,
  ReviewAgencyApplicationDto,
} from './dto/agency-application.dto';
import {
  AddAgencyMemberDto,
  AgencyMemberRoleDto,
  ChannelUserRoleDto,
  CreateActivationPackageDto,
  CreateAgencyDto,
  CreatePackageEntitlementDto,
  CreateSaleUserDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateActivationPackageDto,
  UpdateAgencyDto,
  UpdateAgencyMemberDto,
  UpdateCommissionPolicyDto,
  UpdatePackageEntitlementDto,
  UpdateUserStatusDto,
  UpsertCommissionPolicyDto,
  UserStatusDto,
} from './dto/agency.dto';

@Injectable()
export class ChannelAdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notification?: NotificationService,
  ) {}

  async applyForAgency(dto: ApplyForAgencyDto) {
    const email = dto.email.trim().toLowerCase();
    const requestedCode = this.normalizeCode(dto.requestedCode);
    const agencyName = dto.agencyName.trim();
    if (!agencyName) throw new BadRequestException('Agency name is required');
    if (await this.prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      throw new BadRequestException('This email already has an account');
    }
    if (await this.prisma.agency.findUnique({ where: { code: requestedCode }, select: { id: true } })) {
      throw new BadRequestException('Agency code is already in use');
    }
    const existing = await this.prisma.agencyApplication.findUnique({ where: { email } });
    if (existing?.status === 'PENDING_REVIEW') {
      return { id: existing.id, status: existing.status };
    }
    if (existing?.status === 'APPROVED') {
      throw new BadRequestException('Agency application was already approved');
    }
    const data = {
      passwordHash: this.hashPassword(dto.password),
      agencyName,
      requestedCode,
      contactPhone: dto.contactPhone?.trim() || null,
      notes: dto.notes?.trim() || null,
      reviewNotes: null,
      reviewedById: null,
      agencyId: null,
      status: 'PENDING_REVIEW' as const,
    };
    const application = existing
      ? await this.prisma.agencyApplication.update({
          where: { id: existing.id },
          data,
          select: { id: true, status: true },
        })
      : await this.prisma.agencyApplication.create({
          data: { email, ...data },
          select: { id: true, status: true },
        });
    return application;
  }

  async listAgencyApplications() {
    return this.prisma.agencyApplication.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 100,
      select: {
        id: true,
        email: true,
        agencyName: true,
        requestedCode: true,
        contactPhone: true,
        notes: true,
        status: true,
        reviewNotes: true,
        reviewedById: true,
        agencyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async approveAgencyApplication(id: string, user: AuthenticatedUser) {
    const actorUserId = this.dbUserId(user);
    const result = await this.prisma.$transaction(async (tx) => {
      const application = await tx.agencyApplication.findUnique({ where: { id } });
      if (!application) throw new NotFoundException('Agency application not found');
      if (application.status !== 'PENDING_REVIEW' || !application.passwordHash) {
        throw new BadRequestException('Only pending applications can be approved');
      }
      if (await tx.user.findUnique({ where: { email: application.email }, select: { id: true } })) {
        throw new BadRequestException('Applicant email already has an account');
      }
      if (
        (await tx.agency.findUnique({ where: { code: application.requestedCode }, select: { id: true } })) ||
        (await tx.channelParticipant.findUnique({ where: { code: application.requestedCode }, select: { id: true } })) ||
        (await tx.agencyMember.findUnique({ where: { referralCode: application.requestedCode }, select: { id: true } }))
      ) {
        throw new BadRequestException('Agency code is already in use');
      }
      const claimed = await tx.agencyApplication.updateMany({
        where: { id, status: 'PENDING_REVIEW' },
        data: { status: 'APPROVED', reviewedById: actorUserId ?? null },
      });
      if (claimed.count !== 1) throw new BadRequestException('Application was already reviewed');
      const agency = await tx.agency.create({
        data: { code: application.requestedCode, name: application.agencyName },
      });
      const account = await tx.user.create({
        data: {
          email: application.email,
          passwordHash: application.passwordHash,
          status: 'ACTIVE',
          profile: { create: { displayName: application.agencyName } },
          roles: {
            create: {
              role: {
                connectOrCreate: {
                  where: { name: 'AGENCY_OWNER' },
                  create: { name: 'AGENCY_OWNER', description: 'Agency owner' },
                },
              },
            },
          },
          agencyMemberships: {
            create: {
              agencyId: agency.id,
              role: 'OWNER',
              title: application.agencyName,
              referralCode: application.requestedCode,
            },
          },
        },
      });
      await this.createChannelParticipant(tx, {
        type: 'AGENCY',
        code: application.requestedCode,
        displayName: application.agencyName,
        userId: account.id,
        agencyId: agency.id,
        baseSalaryCents: 0,
      });
      await tx.agencyApplication.update({
        where: { id },
        data: { agencyId: agency.id, passwordHash: null },
      });
      return { id, status: 'APPROVED' as const, agencyId: agency.id, code: agency.code, userId: account.id };
    });
    await this.audit(user, 'channel.agency_application.approve', 'AgencyApplication', id, {
      agencyId: result.agencyId,
    });
    const approvedApplication = await this.prisma.agencyApplication.findUnique({
      where: { id },
      select: { email: true },
    });
    if (approvedApplication) {
      void this.notification?.sendAgencyApplicationApproved(
        approvedApplication.email,
        result.code,
      );
    }
    return result;
  }

  async rejectAgencyApplication(
    id: string,
    dto: ReviewAgencyApplicationDto,
    user: AuthenticatedUser,
  ) {
    const claimed = await this.prisma.agencyApplication.updateMany({
      where: { id, status: 'PENDING_REVIEW' },
      data: {
        status: 'REJECTED',
        passwordHash: null,
        reviewNotes: dto.reviewNotes?.trim() || null,
        reviewedById: this.dbUserId(user) ?? null,
      },
    });
    if (claimed.count !== 1) throw new BadRequestException('Only pending applications can be rejected');
    await this.audit(user, 'channel.agency_application.reject', 'AgencyApplication', id);
    const rejectedApplication = await this.prisma.agencyApplication.findUnique({
      where: { id },
      select: { email: true },
    });
    if (rejectedApplication) {
      void this.notification?.sendAgencyApplicationRejected(rejectedApplication.email);
    }
    return { id, status: 'REJECTED' as const };
  }

  async getSummary(user: AuthenticatedUser) {
    const [scopedAgencyWhere, scopedParticipantWhere] = await Promise.all([
      this.agencyScopeWhere(user),
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

  async listAgencies(user: AuthenticatedUser) {
    return this.prisma.agency.findMany({
      where: await this.agencyScopeWhere(user),
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
    const code = this.normalizeCode(dto.code);
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
          commissionRateBps: this.optionalRate(dto.defaultRateBps),
          notes: dto.notes,
        },
      });

      return created;
    });
    await this.audit(user, 'channel.agency.create', 'Agency', agency.id, {
      code,
    });

    return agency;
  }

  async updateAgency(
    agencyId: string,
    dto: UpdateAgencyDto,
    user: AuthenticatedUser,
  ) {
    await this.assertAgency(agencyId);
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
            ? { status: this.participantStatusForAgency(dto.status) }
            : {}),
          ...(dto.defaultRateBps !== undefined
            ? { commissionRateBps: this.optionalRate(dto.defaultRateBps) }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        },
        create: {
          type: 'AGENCY',
          code: updated.code,
          displayName: updated.name,
          agencyId: updated.id,
          status: this.participantStatusForAgency(updated.status),
          baseSalaryCents: 0,
          commissionRateBps: this.optionalRate(updated.defaultRateBps),
          notes: updated.notes,
        },
      });

      return updated;
    });
    await this.audit(user, 'channel.agency.update', 'Agency', agency.id);

    return agency;
  }

  async createSaleUser(dto: CreateSaleUserDto, user: AuthenticatedUser) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const requestedRole = this.resolveCreatableRole(dto, user);
    const parentParticipant = await this.resolveParentParticipantForNewUser(
      dto,
      user,
      requestedRole,
    );

    if (dto.agencyCode && requestedRole !== ChannelUserRoleDto.AGENCY_OWNER) {
      const agency = await this.prisma.agency.findUnique({
        where: { code: this.normalizeCode(dto.agencyCode) },
        select: { id: true },
      });
      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
      await this.assertCanManageAgency(agency.id, user);
    }

    const saleUser = await this.prisma.$transaction(async (tx) => {
      let agencyForMembership = null as Awaited<
        ReturnType<typeof tx.agency.findUnique>
      >;
      if (requestedRole === ChannelUserRoleDto.AGENCY_OWNER) {
        const agencyCode = this.normalizeCode(
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
          where: { code: this.normalizeCode(dto.agencyCode) },
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
          passwordHash: this.hashPassword(dto.password),
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
                    description: this.descriptionForRole(requestedRole),
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
                    role: this.memberRoleForUserRole(requestedRole),
                    title: dto.displayName,
                    referralCode: dto.referralCode
                      ? this.normalizeCode(dto.referralCode)
                      : this.defaultReferralCode(email),
                  },
                },
              }
            : {}),
        },
      });

      const participantCode =
        requestedRole === ChannelUserRoleDto.AGENCY_OWNER
          ? (agencyForMembership?.code ?? this.defaultReferralCode(email))
          : dto.referralCode
            ? this.normalizeCode(dto.referralCode)
            : this.defaultReferralCode(email);

      await this.createChannelParticipant(tx, {
        type: this.participantTypeForRole(requestedRole),
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
        baseSalaryCents: this.vndToCents(dto.baseSalaryVnd ?? 0),
        commissionRateBps: this.optionalRate(dto.rateBps),
      });

      return tx.user.findUniqueOrThrow({
        where: { id: created.id },
        select: this.userSelect(),
      });
    });
    await this.audit(user, 'channel.user.create', 'User', saleUser.id, {
      email,
      role: requestedRole,
      parentParticipantId: parentParticipant?.id,
    });

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
        select: this.userSelect(),
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
        select: this.userSelect(),
      });
      await tx.channelParticipant.updateMany({
        where: { userId },
        data: { status: this.participantStatusForUser(dto.status) },
      });

      return user;
    });
    await this.audit(user, 'channel.user.status_update', 'User', userId, {
      status: dto.status,
      reason: dto.reason,
    });

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

    await this.audit(user, `channel.user.role_${dto.action}`, 'User', userId, {
      role: dto.role,
    });

    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: this.userSelect(),
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
      data: { passwordHash: this.hashPassword(dto.password) },
      select: this.userSelect(),
    });
    await this.audit(user, 'channel.user.password_reset', 'User', userId);

    return updated;
  }

  async addAgencyMember(
    agencyId: string,
    dto: AddAgencyMemberDto,
    user: AuthenticatedUser,
  ) {
    await this.assertCanManageAgency(agencyId, user);
    const memberUser = await this.prisma.user.findUnique({
      where: { email: dto.saleEmail.trim().toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
    if (!memberUser) {
      throw new NotFoundException('Channel user not found');
    }

    const memberRole = dto.memberRole ?? AgencyMemberRoleDto.SALE;
    this.assertScopedAgencyMemberRole(memberRole, user);
    this.assertUserHasRoleForMemberRole(memberUser, memberRole);

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
          ? this.normalizeCode(dto.referralCode)
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
            ? this.normalizeCode(dto.referralCode)
            : this.defaultReferralCode(memberUser.email),
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
    await this.audit(
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
    this.assertScopedAgencyMemberRole(existing.role, user);
    this.assertScopedAgencyMemberRole(dto.memberRole ?? existing.role, user);
    await this.assertCanManageAgency(existing.agencyId, user);

    const member = await this.prisma.agencyMember.update({
      where: { id: memberId },
      data: {
        ...(dto.memberRole !== undefined ? { role: dto.memberRole } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.rateBps !== undefined ? { rateBps: dto.rateBps } : {}),
        ...(dto.referralCode !== undefined
          ? { referralCode: this.normalizeCode(dto.referralCode) }
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
    await this.audit(
      user,
      'channel.agency.member_update',
      'AgencyMember',
      member.id,
    );

    return member;
  }

  listCommissionPolicies() {
    return this.prisma.commissionPolicy.findMany({
      orderBy: [{ beneficiaryType: 'asc' }, { code: 'asc' }],
    });
  }

  async upsertCommissionPolicy(
    dto: UpsertCommissionPolicyDto,
    user: AuthenticatedUser,
  ) {
    const code = this.normalizeCode(dto.code);
    if (dto.isDefaultForSale) {
      await this.clearDefaultPolicies('SALE');
    }
    if (dto.isDefaultForAgency) {
      await this.clearDefaultPolicies('AGENCY');
    }

    const policy = await this.prisma.commissionPolicy.upsert({
      where: { code },
      update: {
        name: dto.name.trim(),
        beneficiaryType: dto.beneficiaryType,
        rateBps: dto.rateBps,
        baseSalaryCents: this.vndToCents(dto.baseSalaryVnd ?? 0),
        isDefaultForSale: dto.isDefaultForSale ?? false,
        isDefaultForAgency: dto.isDefaultForAgency ?? false,
        isActive: dto.isActive ?? true,
      },
      create: {
        code,
        name: dto.name.trim(),
        beneficiaryType: dto.beneficiaryType,
        rateBps: dto.rateBps,
        baseSalaryCents: this.vndToCents(dto.baseSalaryVnd ?? 0),
        isDefaultForSale: dto.isDefaultForSale ?? false,
        isDefaultForAgency: dto.isDefaultForAgency ?? false,
        isActive: dto.isActive ?? true,
      },
    });
    await this.audit(
      user,
      'channel.commission_policy.upsert',
      'CommissionPolicy',
      policy.id,
      {
        code,
      },
    );

    return policy;
  }

  async updateCommissionPolicy(
    policyId: string,
    dto: UpdateCommissionPolicyDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.commissionPolicy.findUnique({
      where: { id: policyId },
    });
    if (!existing) {
      throw new NotFoundException('Commission policy not found');
    }

    if (dto.isDefaultForSale) {
      await this.clearDefaultPolicies('SALE');
    }
    if (dto.isDefaultForAgency) {
      await this.clearDefaultPolicies('AGENCY');
    }

    const policy = await this.prisma.commissionPolicy.update({
      where: { id: policyId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.rateBps !== undefined ? { rateBps: dto.rateBps } : {}),
        ...(dto.baseSalaryVnd !== undefined
          ? { baseSalaryCents: this.vndToCents(dto.baseSalaryVnd) }
          : {}),
        ...(dto.isDefaultForSale !== undefined
          ? { isDefaultForSale: dto.isDefaultForSale }
          : {}),
        ...(dto.isDefaultForAgency !== undefined
          ? { isDefaultForAgency: dto.isDefaultForAgency }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    await this.audit(
      user,
      'channel.commission_policy.update',
      'CommissionPolicy',
      policy.id,
    );

    return policy;
  }

  private async clearDefaultPolicies(type: 'SALE' | 'AGENCY') {
    await this.prisma.commissionPolicy.updateMany({
      where:
        type === 'SALE'
          ? { beneficiaryType: 'SALE', isDefaultForSale: true }
          : { beneficiaryType: 'AGENCY', isDefaultForAgency: true },
      data:
        type === 'SALE'
          ? { isDefaultForSale: false }
          : { isDefaultForAgency: false },
    });
  }

  // ── Activation Packages ──────────────────────────────────────────────────

  listPackages() {
    return this.prisma.activationPackage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        entitlements: {
          orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  async createPackage(
    dto: CreateActivationPackageDto,
    user: AuthenticatedUser,
  ) {
    const code = dto.code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, '-');
    const pkg = await this.prisma.activationPackage.create({
      data: {
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        amountVnd: dto.amountVnd,
        durationDays: dto.durationDays,
        isActive: true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    await this.audit(
      user,
      'channel.package.create',
      'ActivationPackage',
      pkg.id,
      { code },
    );
    return pkg;
  }

  async updatePackage(
    packageId: string,
    dto: UpdateActivationPackageDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.activationPackage.findUnique({
      where: { id: packageId },
    });
    if (!existing) {
      throw new NotFoundException('Package not found');
    }
    const bumpsVersion =
      dto.name !== undefined ||
      dto.description !== undefined ||
      dto.amountVnd !== undefined ||
      dto.durationDays !== undefined ||
      dto.isActive !== undefined;
    const pkg = await this.prisma.activationPackage.update({
      where: { id: packageId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.amountVnd !== undefined ? { amountVnd: dto.amountVnd } : {}),
        ...(dto.durationDays !== undefined
          ? { durationDays: dto.durationDays }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(bumpsVersion ? { version: { increment: 1 } } : {}),
      },
    });
    await this.audit(
      user,
      'channel.package.update',
      'ActivationPackage',
      pkg.id,
    );
    return pkg;
  }

  async listPackageEntitlements(packageId: string) {
    await this.assertPackage(packageId);
    return this.prisma.packageEntitlement.findMany({
      where: { packageId },
      orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createPackageEntitlement(
    packageId: string,
    dto: CreatePackageEntitlementDto,
    user: AuthenticatedUser,
  ) {
    await this.assertPackage(packageId);
    const entitlementKey = dto.entitlementKey.trim().toUpperCase();
    const entitlement = await this.prisma.$transaction(async (tx) => {
      const created = await tx.packageEntitlement.create({
        data: {
          packageId,
          entitlementKey,
          valueJson: dto.valueJson as Prisma.InputJsonValue,
          status: dto.status ?? 'ACTIVE',
        },
      });
      await tx.activationPackage.update({
        where: { id: packageId },
        data: { version: { increment: 1 } },
      });
      return created;
    });
    await this.audit(
      user,
      'channel.package_entitlement.create',
      'PackageEntitlement',
      entitlement.id,
      { packageId, entitlementKey },
    );
    return entitlement;
  }

  async updatePackageEntitlement(
    packageId: string,
    entitlementId: string,
    dto: UpdatePackageEntitlementDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.packageEntitlement.findFirst({
      where: { id: entitlementId, packageId },
    });
    if (!existing) {
      throw new NotFoundException('Package entitlement not found');
    }

    const entitlement = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.packageEntitlement.update({
        where: { id: entitlementId },
        data: {
          ...(dto.entitlementKey
            ? { entitlementKey: dto.entitlementKey.trim().toUpperCase() }
            : {}),
          ...(dto.valueJson !== undefined
            ? { valueJson: dto.valueJson as Prisma.InputJsonValue }
            : {}),
          ...(dto.status ? { status: dto.status } : {}),
        },
      });
      await tx.activationPackage.update({
        where: { id: packageId },
        data: { version: { increment: 1 } },
      });
      return updated;
    });
    await this.audit(
      user,
      'channel.package_entitlement.update',
      'PackageEntitlement',
      entitlement.id,
      { packageId },
    );
    return entitlement;
  }

  private async assertPackage(packageId: string) {
    const pkg = await this.prisma.activationPackage.findUnique({
      where: { id: packageId },
      select: { id: true },
    });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
  }

  private async assertAgency(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });
    if (!agency) {
      throw new NotFoundException('Agency not found');
    }
  }

  private isGlobalChannelManager(user: AuthenticatedUser) {
    return user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role));
  }

  private isGlobalChannelViewer(user: AuthenticatedUser) {
    return this.isGlobalChannelManager(user);
  }

  private isAgencyChannelManager(user: AuthenticatedUser) {
    return user.roles.some((role) =>
      ['DIRECTOR', 'AGENCY_OWNER', 'AGENCY_MANAGER'].includes(role),
    );
  }

  private async actorParticipant(
    user: AuthenticatedUser,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const userId = this.dbUserId(user);
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

  private async participantScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.ChannelParticipantWhereInput | undefined> {
    if (this.isGlobalChannelViewer(user)) {
      return undefined;
    }

    const participant = await this.actorParticipant(user);
    if (!participant) {
      return { id: '__none__' };
    }

    return {
      lineage: { startsWith: participant.lineage },
    };
  }

  private async agencyScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.AgencyWhereInput | undefined> {
    if (this.isGlobalChannelViewer(user)) {
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

  private async userScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.UserWhereInput | undefined> {
    if (this.isGlobalChannelViewer(user)) {
      return undefined;
    }

    const participant = await this.actorParticipant(user);
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

  private async assertCanManageAgency(
    agencyId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertAgency(agencyId);
    if (this.isGlobalChannelManager(user)) {
      return;
    }

    const actor = await this.actorParticipant(user);
    if (!actor || !this.isAgencyChannelManager(user)) {
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

  private async assertCanManageUser(
    targetUserId: string,
    user: AuthenticatedUser,
  ) {
    if (this.isGlobalChannelManager(user)) {
      return;
    }

    const actor = await this.actorParticipant(user);
    if (!actor || !this.isAgencyChannelManager(user)) {
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

  private resolveCreatableRole(
    dto: CreateSaleUserDto,
    user: AuthenticatedUser,
  ): ChannelUserRoleDto {
    const requestedRole = dto.role ?? ChannelUserRoleDto.SALE;
    if (this.isGlobalChannelManager(user)) {
      return requestedRole;
    }

    if (user.roles.includes('DIRECTOR')) {
      if (
        [
          ChannelUserRoleDto.AGENCY_MANAGER,
          ChannelUserRoleDto.AGENCY_OWNER,
          ChannelUserRoleDto.SALE,
        ].includes(requestedRole)
      ) {
        return requestedRole;
      }
      throw new ForbiddenException(
        'Directors can only recruit managers, agencies, or sales',
      );
    }

    if (user.roles.includes('AGENCY_MANAGER')) {
      if (
        [ChannelUserRoleDto.AGENCY_OWNER, ChannelUserRoleDto.SALE].includes(
          requestedRole,
        )
      ) {
        return requestedRole;
      }
      throw new ForbiddenException(
        'Managers can only recruit agencies or sales',
      );
    }

    if (user.roles.includes('AGENCY_OWNER')) {
      if (requestedRole === ChannelUserRoleDto.SALE) {
        return requestedRole;
      }
      throw new ForbiddenException('Agencies can only recruit sales');
    }

    throw new ForbiddenException('Insufficient channel user permission');
  }

  private async resolveParentParticipantForNewUser(
    dto: CreateSaleUserDto,
    user: AuthenticatedUser,
    requestedRole: ChannelUserRoleDto,
  ) {
    if (this.isGlobalChannelManager(user)) {
      if (!dto.parentCode) {
        return requestedRole === ChannelUserRoleDto.DIRECTOR ? null : null;
      }

      const parent = await this.prisma.channelParticipant.findUnique({
        where: { code: this.normalizeCode(dto.parentCode) },
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
      this.assertRoleCanRecruit(parent.type, requestedRole);
      return parent;
    }

    const actor = await this.actorParticipant(user);
    if (!actor) {
      throw new ForbiddenException(
        'No active channel node found for this account',
      );
    }

    this.assertRoleCanRecruit(actor.type, requestedRole);
    return actor;
  }

  private participantTypeForRole(role: ChannelUserRoleDto) {
    if (role === ChannelUserRoleDto.DIRECTOR) {
      return 'DIRECTOR' as const;
    }
    if (role === ChannelUserRoleDto.AGENCY_MANAGER) {
      return 'MANAGER' as const;
    }
    if (role === ChannelUserRoleDto.AGENCY_OWNER) {
      return 'AGENCY' as const;
    }

    return 'SALE' as const;
  }

  private assertRoleCanRecruit(
    parentType: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE',
    requestedRole: ChannelUserRoleDto,
  ) {
    const requestedType = this.participantTypeForRole(requestedRole);
    const allowedByParent: Record<string, Array<typeof requestedType>> = {
      DIRECTOR: ['MANAGER', 'AGENCY', 'SALE'],
      MANAGER: ['AGENCY', 'SALE'],
      AGENCY: ['SALE'],
      SALE: [],
    };

    if (!allowedByParent[parentType]?.includes(requestedType)) {
      throw new ForbiddenException(
        'Parent channel node cannot recruit this role',
      );
    }
  }

  private async createChannelParticipant(
    tx: Prisma.TransactionClient,
    input: {
      type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE';
      code: string;
      displayName: string;
      userId: string;
      agencyId?: string | null;
      parentParticipantId?: string | null;
      parentLineage?: string;
      parentDepth?: number;
      parentRootParticipantId?: string | null;
      baseSalaryCents: number;
      commissionRateBps?: number | null;
    },
  ) {
    const participant = await tx.channelParticipant.create({
      data: {
        type: input.type,
        code: input.code,
        displayName: input.displayName,
        status: 'ACTIVE',
        userId: input.userId,
        agencyId: input.agencyId ?? undefined,
        parentParticipantId: input.parentParticipantId ?? undefined,
        rootParticipantId: input.parentRootParticipantId ?? undefined,
        depth: input.parentDepth !== undefined ? input.parentDepth + 1 : 0,
        baseSalaryCents: input.baseSalaryCents,
        commissionRateBps: input.commissionRateBps ?? undefined,
      },
    });

    const rootParticipantId =
      input.parentRootParticipantId ??
      input.parentParticipantId ??
      participant.id;
    const lineage = `${input.parentLineage ?? '/'}${participant.id}/`;

    return tx.channelParticipant.update({
      where: { id: participant.id },
      data: {
        rootParticipantId,
        lineage,
      },
    });
  }

  private memberRoleForUserRole(role: ChannelUserRoleDto) {
    if (role === ChannelUserRoleDto.DIRECTOR) {
      return AgencyMemberRoleDto.SALE;
    }
    if (role === ChannelUserRoleDto.AGENCY_OWNER) {
      return AgencyMemberRoleDto.OWNER;
    }
    if (role === ChannelUserRoleDto.AGENCY_MANAGER) {
      return AgencyMemberRoleDto.MANAGER;
    }

    return AgencyMemberRoleDto.SALE;
  }

  private assertScopedAgencyMemberRole(
    memberRole: AgencyMemberRoleDto | 'OWNER' | 'MANAGER' | 'SALE',
    user: AuthenticatedUser,
  ) {
    if (this.isGlobalChannelManager(user)) {
      return;
    }

    if (memberRole !== AgencyMemberRoleDto.SALE) {
      throw new ForbiddenException(
        'Agency-scoped managers can only manage SALE members',
      );
    }
  }

  private assertUserHasRoleForMemberRole(
    user: Prisma.UserGetPayload<{
      include: { roles: { include: { role: true } } };
    }>,
    memberRole: AgencyMemberRoleDto,
  ) {
    const requiredRole =
      memberRole === AgencyMemberRoleDto.OWNER
        ? 'AGENCY_OWNER'
        : memberRole === AgencyMemberRoleDto.MANAGER
          ? 'AGENCY_MANAGER'
          : 'SALE';
    const hasRole = user.roles.some((item) => item.role.name === requiredRole);
    if (!hasRole) {
      throw new BadRequestException(`User does not have ${requiredRole} role`);
    }
  }

  private descriptionForRole(role: ChannelUserRoleDto) {
    if (role === ChannelUserRoleDto.DIRECTOR) {
      return 'Director channel account';
    }
    if (role === ChannelUserRoleDto.AGENCY_OWNER) {
      return 'Agency owner account';
    }
    if (role === ChannelUserRoleDto.AGENCY_MANAGER) {
      return 'Agency manager account';
    }

    return 'Sales account';
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

  private userSelect() {
    return {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      profile: { select: { displayName: true } },
      roles: { select: { role: { select: { name: true } } } },
      agencyMemberships: {
        where: { isActive: true },
        include: { agency: true },
      },
      channelParticipant: {
        select: {
          id: true,
          type: true,
          code: true,
          displayName: true,
          status: true,
          baseSalaryCents: true,
          commissionRateBps: true,
        },
      },
      childProfiles: {
        select: {
          subscriptions: {
            where: { status: { in: ['TRIALING', 'ACTIVE'] } },
            orderBy: { currentPeriodEnd: 'desc' },
            take: 1,
            select: { status: true, currentPeriodEnd: true },
          },
        },
      },
    } satisfies Prisma.UserSelect;
  }

  private normalizeCode(value: string) {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, '-');
  }

  private defaultReferralCode(email: string) {
    const prefix = this.normalizeCode(email.split('@')[0]).slice(0, 32);
    return `${prefix || 'REF'}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  private optionalRate(rateBps: number | undefined | null) {
    return rateBps && rateBps > 0 ? rateBps : null;
  }

  private vndToCents(amountVnd: number) {
    return Math.round(amountVnd * 100);
  }

  private participantStatusForAgency(status: string): 'ACTIVE' | 'SUSPENDED' {
    return status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED';
  }

  private participantStatusForUser(status: string): 'ACTIVE' | 'SUSPENDED' {
    return status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED';
  }

  private hashPassword(password: string): string {
    const salt = randomUUID();
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private dbUserId(user: AuthenticatedUser) {
    return user.sub.startsWith('demo-') ? undefined : user.sub;
  }

  private async audit(
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
