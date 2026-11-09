import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import {
  ApplyForAgencyDto,
  ReviewAgencyApplicationDto,
} from './dto/agency-application.dto';
import { ChannelAdminAccessService } from './channel-admin-access.service';
import {
  createChannelParticipant,
  dbUserId,
  hashPassword,
  normalizeCode,
} from './channel-admin.helpers';

/** Agency applications: apply, list, approve, reject. */
@Injectable()
export class AgencyApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelAdminAccessService: ChannelAdminAccessService,
    @Optional() private readonly notification?: NotificationService,
  ) {}

  async applyForAgency(dto: ApplyForAgencyDto) {
    const email = dto.email.trim().toLowerCase();
    const requestedCode = normalizeCode(dto.requestedCode);
    const agencyName = dto.agencyName.trim();
    if (!agencyName) throw new BadRequestException('Agency name is required');
    if (
      await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
    ) {
      throw new BadRequestException('This email already has an account');
    }
    if (
      await this.prisma.agency.findUnique({
        where: { code: requestedCode },
        select: { id: true },
      })
    ) {
      throw new BadRequestException('Agency code is already in use');
    }
    const existing = await this.prisma.agencyApplication.findUnique({
      where: { email },
    });
    if (existing?.status === 'PENDING_REVIEW') {
      return { id: existing.id, status: existing.status };
    }
    if (existing?.status === 'APPROVED') {
      throw new BadRequestException('Agency application was already approved');
    }
    const data = {
      passwordHash: hashPassword(dto.password),
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
    const actorUserId = dbUserId(user);
    const result = await this.prisma.$transaction(async (tx) => {
      const application = await tx.agencyApplication.findUnique({
        where: { id },
      });
      if (!application)
        throw new NotFoundException('Agency application not found');
      if (
        application.status !== 'PENDING_REVIEW' ||
        !application.passwordHash
      ) {
        throw new BadRequestException(
          'Only pending applications can be approved',
        );
      }
      if (
        await tx.user.findUnique({
          where: { email: application.email },
          select: { id: true },
        })
      ) {
        throw new BadRequestException('Applicant email already has an account');
      }
      if (
        (await tx.agency.findUnique({
          where: { code: application.requestedCode },
          select: { id: true },
        })) ||
        (await tx.channelParticipant.findUnique({
          where: { code: application.requestedCode },
          select: { id: true },
        })) ||
        (await tx.agencyMember.findUnique({
          where: { referralCode: application.requestedCode },
          select: { id: true },
        }))
      ) {
        throw new BadRequestException('Agency code is already in use');
      }
      const claimed = await tx.agencyApplication.updateMany({
        where: { id, status: 'PENDING_REVIEW' },
        data: { status: 'APPROVED', reviewedById: actorUserId ?? null },
      });
      if (claimed.count !== 1)
        throw new BadRequestException('Application was already reviewed');
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
      await createChannelParticipant(tx, {
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
      return {
        id,
        status: 'APPROVED' as const,
        agencyId: agency.id,
        code: agency.code,
        userId: account.id,
      };
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.agency_application.approve',
      'AgencyApplication',
      id,
      {
        agencyId: result.agencyId,
      },
    );
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
        reviewedById: dbUserId(user) ?? null,
      },
    });
    if (claimed.count !== 1)
      throw new BadRequestException(
        'Only pending applications can be rejected',
      );
    await this.channelAdminAccessService.audit(
      user,
      'channel.agency_application.reject',
      'AgencyApplication',
      id,
    );
    const rejectedApplication = await this.prisma.agencyApplication.findUnique({
      where: { id },
      select: { email: true },
    });
    if (rejectedApplication) {
      void this.notification?.sendAgencyApplicationRejected(
        rejectedApplication.email,
      );
    }
    return { id, status: 'REJECTED' as const };
  }
}
