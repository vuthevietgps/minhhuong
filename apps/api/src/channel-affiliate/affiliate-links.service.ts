import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAffiliateLinkDto,
  CreateAffiliateQrAssetDto,
  ListAffiliateLinksQueryDto,
  UpdateAffiliateLinkDto,
} from './dto/channel-affiliate.dto';
import { AffiliateAccessService } from './affiliate-access.service';
import {
  ActorParticipant,
  AffiliateLinkWithRelations,
  affiliateLinkInclude,
  affiliateQrAssetSelect,
  assertDateRange,
  generateLinkCode,
  jsonObject,
  listLimit,
  requiredDbUserId,
  requiredTrim,
} from './affiliate-links.helpers';
import {
  dbUserId,
  isGlobalManager,
  isUniqueConflict,
  optionalTrim,
  parseDate,
  setParam,
} from './channel-affiliate.helpers';

/** Affiliate link management and QR assets. */
@Injectable()
export class AffiliateLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly affiliateAccessService: AffiliateAccessService,
  ) {}

  async listLinks(
    user: AuthenticatedUser,
    query: ListAffiliateLinksQueryDto = {},
  ) {
    const filters: Prisma.AffiliateLinkWhereInput[] = [];
    const participantScope =
      await this.affiliateAccessService.participantScopeWhere(user);
    if (participantScope) {
      filters.push({ participant: { is: participantScope } });
    }

    if (query.status) {
      filters.push({ status: query.status });
    }

    const participantId = optionalTrim(query.participantId);
    if (participantId) {
      filters.push({ participantId });
    }

    const q = optionalTrim(query.q);
    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { linkCode: { contains: q, mode: 'insensitive' } },
          { campaign: { contains: q, mode: 'insensitive' } },
          { channel: { contains: q, mode: 'insensitive' } },
          { placement: { contains: q, mode: 'insensitive' } },
          { packageCode: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const links = await this.prisma.affiliateLink.findMany({
      where: filters.length > 0 ? { AND: filters } : {},
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: listLimit(query.limit),
      include: affiliateLinkInclude,
    });

    return {
      items: links.map((link) => this.serializeLink(link)),
    };
  }

  async createLink(dto: CreateAffiliateLinkDto, user: AuthenticatedUser) {
    const createdById = requiredDbUserId(user);
    const codeParticipant = dto.participantCode
      ? await this.prisma.channelParticipant.findUnique({
          where: { code: dto.participantCode.trim().toUpperCase() },
          select: { id: true },
        })
      : null;
    if (dto.participantCode && !codeParticipant) {
      throw new BadRequestException('Channel participant code not found');
    }
    if (
      dto.participantId &&
      codeParticipant &&
      dto.participantId !== codeParticipant.id
    ) {
      throw new BadRequestException('Participant id and code do not match');
    }
    const participant = await this.resolveTargetParticipant(
      user,
      codeParticipant?.id ?? dto.participantId,
    );
    const agencyMember = await this.findParticipantAgencyMember(participant);
    const startsAt = parseDate(dto.startsAt, 'startsAt');
    const expiresAt = parseDate(dto.expiresAt, 'expiresAt');
    assertDateRange(startsAt, expiresAt);

    const data: Omit<
      Prisma.AffiliateLinkUncheckedCreateInput,
      'id' | 'linkCode'
    > = {
      participantId: participant.id,
      agencyId: participant.agencyId ?? agencyMember?.agencyId ?? undefined,
      agencyMemberId: agencyMember?.id,
      createdById,
      referralCode: agencyMember?.referralCode ?? participant.code,
      name: requiredTrim(dto.name, 'name'),
      campaign: optionalTrim(dto.campaign),
      channel: optionalTrim(dto.channel),
      placement: optionalTrim(dto.placement),
      packageCode: optionalTrim(dto.packageCode),
      packageScopeJson: jsonObject(dto.packageScopeJson, 'packageScopeJson'),
      startsAt,
      expiresAt,
      metadataJson: jsonObject(dto.metadataJson, 'metadataJson'),
    };

    const link = await this.createLinkWithUniqueCode(data, dto.linkCode);
    await this.audit(
      user,
      'channel_affiliate.link.create',
      'AffiliateLink',
      link.id,
      {
        participantId: link.participantId,
        linkCode: link.linkCode,
      },
    );

    return this.serializeLink(link);
  }

  async updateLink(
    linkId: string,
    dto: UpdateAffiliateLinkDto,
    user: AuthenticatedUser,
  ) {
    const current = await this.findAccessibleLink(linkId, user);
    const startsAt = parseDate(dto.startsAt, 'startsAt') ?? current.startsAt;
    const expiresAt =
      parseDate(dto.expiresAt, 'expiresAt') ?? current.expiresAt;
    assertDateRange(startsAt, expiresAt);

    const data: Prisma.AffiliateLinkUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = requiredTrim(dto.name, 'name');
    }
    if (dto.campaign !== undefined) {
      data.campaign = optionalTrim(dto.campaign);
    }
    if (dto.channel !== undefined) {
      data.channel = optionalTrim(dto.channel);
    }
    if (dto.placement !== undefined) {
      data.placement = optionalTrim(dto.placement);
    }
    if (dto.packageCode !== undefined) {
      data.packageCode = optionalTrim(dto.packageCode);
    }
    if (dto.packageScopeJson !== undefined) {
      data.packageScopeJson = jsonObject(
        dto.packageScopeJson,
        'packageScopeJson',
      );
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }
    if (dto.startsAt !== undefined) {
      data.startsAt = startsAt;
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = expiresAt;
    }
    if (dto.metadataJson !== undefined) {
      data.metadataJson = jsonObject(dto.metadataJson, 'metadataJson');
    }

    const updated = await this.prisma.affiliateLink.update({
      where: { id: current.id },
      data,
      include: affiliateLinkInclude,
    });

    await this.audit(
      user,
      'channel_affiliate.link.update',
      'AffiliateLink',
      updated.id,
      {
        status: updated.status,
      },
    );

    return this.serializeLink(updated);
  }

  async createQrAsset(
    linkId: string,
    dto: CreateAffiliateQrAssetDto,
    user: AuthenticatedUser,
  ) {
    const createdById = requiredDbUserId(user);
    const link = await this.findAccessibleLink(linkId, user);
    const qrAssetId = randomUUID();
    const placement = optionalTrim(dto.placement);
    const encodedUrl = this.buildAffiliateUrl(link, {
      qrAssetId,
      placement,
    });

    const qrAsset = await this.prisma.affiliateQrAsset.create({
      data: {
        id: qrAssetId,
        affiliateLinkId: link.id,
        createdById,
        label: optionalTrim(dto.label),
        placement,
        encodedUrl,
        qrImageUrl: optionalTrim(dto.qrImageUrl),
        status: dto.status ?? 'ACTIVE',
        metadataJson: jsonObject(dto.metadataJson, 'metadataJson'),
      },
      select: affiliateQrAssetSelect,
    });

    await this.audit(
      user,
      'channel_affiliate.qr.create',
      'AffiliateQrAsset',
      qrAsset.id,
      {
        affiliateLinkId: link.id,
        participantId: link.participantId,
      },
    );

    return qrAsset;
  }

  private async createLinkWithUniqueCode(
    data: Omit<Prisma.AffiliateLinkUncheckedCreateInput, 'id' | 'linkCode'>,
    requestedCode?: string,
  ) {
    if (requestedCode) {
      try {
        return await this.prisma.affiliateLink.create({
          data: { ...data, linkCode: requestedCode },
          include: affiliateLinkInclude,
        });
      } catch (error) {
        if (isUniqueConflict(error)) {
          throw new ConflictException('Affiliate link code is already in use');
        }
        throw error;
      }
    }
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await this.prisma.affiliateLink.create({
          data: {
            ...data,
            linkCode: generateLinkCode(),
          },
          include: affiliateLinkInclude,
        });
      } catch (error) {
        if (isUniqueConflict(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'Could not generate a unique affiliate link code',
    );
  }

  private async findAccessibleLink(linkId: string, user: AuthenticatedUser) {
    const link = await this.prisma.affiliateLink.findUnique({
      where: { id: linkId },
      include: affiliateLinkInclude,
    });
    if (!link) {
      throw new NotFoundException('Affiliate link not found');
    }

    await this.assertParticipantAccess(user, link.participant);
    return link;
  }

  private async resolveTargetParticipant(
    user: AuthenticatedUser,
    requestedParticipantId?: string,
  ) {
    const actor = await this.affiliateAccessService.actorParticipant(user);
    const targetParticipantId =
      optionalTrim(requestedParticipantId) ?? actor?.id;
    if (!targetParticipantId) {
      throw new BadRequestException(
        'participantId is required when the actor has no active channel participant',
      );
    }

    const participant = await this.prisma.channelParticipant.findUnique({
      where: { id: targetParticipantId },
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

    if (!participant || participant.status !== 'ACTIVE') {
      throw new BadRequestException('Target channel participant is not active');
    }

    if (!isGlobalManager(user)) {
      if (!actor || !participant.lineage.startsWith(actor.lineage)) {
        throw new ForbiddenException('Insufficient affiliate link permission');
      }
    }

    return participant;
  }

  private async assertParticipantAccess(
    user: AuthenticatedUser,
    participant: ActorParticipant,
  ) {
    if (isGlobalManager(user)) {
      return;
    }

    const actor = await this.affiliateAccessService.actorParticipant(user);
    if (!actor || !participant.lineage.startsWith(actor.lineage)) {
      throw new ForbiddenException('Insufficient affiliate link permission');
    }
  }

  private async findParticipantAgencyMember(participant: {
    userId: string | null;
    agencyId: string | null;
  }) {
    if (!participant.userId) {
      return null;
    }

    return this.prisma.agencyMember.findFirst({
      where: {
        userId: participant.userId,
        isActive: true,
        ...(participant.agencyId ? { agencyId: participant.agencyId } : {}),
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        agencyId: true,
        referralCode: true,
      },
    });
  }

  private serializeLink(link: AffiliateLinkWithRelations) {
    return {
      ...link,
      publicUrl: this.buildAffiliateUrl(link),
    };
  }

  private buildAffiliateUrl(
    link: {
      linkCode: string;
      packageCode?: string | null;
      campaign?: string | null;
      channel?: string | null;
      placement?: string | null;
    },
    options: { qrAssetId?: string; placement?: string | null } = {},
  ) {
    const url = new URL(
      `/r/${encodeURIComponent(link.linkCode)}`,
      this.baseUrl(),
    );
    const params = url.searchParams;
    setParam(params, 'pkg', link.packageCode);
    setParam(params, 'campaign', link.campaign);
    setParam(params, 'channel', link.channel);
    setParam(params, 'placement', options.placement ?? link.placement);
    setParam(params, 'qr', options.qrAssetId);
    return url.toString();
  }

  private baseUrl() {
    const raw =
      this.config.get<string>('AFFILIATE_PUBLIC_BASE_URL') ??
      process.env.AFFILIATE_PUBLIC_BASE_URL ??
      'https://go.minhhuong.app';
    const candidate = raw.trim().replace(/\/+$/, '');
    try {
      const url = new URL(candidate);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'https://go.minhhuong.app';
      }
      return url.toString().replace(/\/+$/, '');
    } catch {
      return 'https://go.minhhuong.app';
    }
  }

  private async audit(
    user: AuthenticatedUser,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          userId: dbUserId(user),
          action,
          entityType,
          entityId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }
}
