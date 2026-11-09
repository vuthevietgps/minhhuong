import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ActivationOrderSupportService } from './activation-order-support.service';
import {
  AffiliateAttributionSnapshot,
  CommissionChainSnapshot,
  CommissionChainSnapshotItem,
  MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
  OrderCommissionAttribution,
  OrderCommissionChainResolution,
  ResolvedChannelAttribution,
  ResolvedChannelParticipant,
  affiliateAttributionWindowDays,
  attributionSnapshotJsonForCommission,
  buildAffiliateAttributionSnapshot,
  buildCommissionChainSnapshotItem,
  commissionBeneficiaryTypeForParticipant,
  commissionRateForDepth,
  dbUserId,
  isAffiliateClickEventUsable,
  isAffiliateClickIdShape,
  latestManualRefundRequestAction,
  manualRefundRequestActions,
  manualRefundRequestApprovedAction,
  manualRefundRequestOpenedAction,
  normalizeCode,
  parseCommissionAttributionSnapshot,
  parseCommissionChainSnapshot,
} from './activation-order.helpers';

/** Channel/affiliate attribution, commission chain snapshots and commission entries. */
@Injectable()
export class OrderCommissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activationOrderSupportService: ActivationOrderSupportService,
  ) {}

  async resolveChannelAttribution(code?: string, user?: AuthenticatedUser) {
    const normalizedCode = code ? normalizeCode(code) : undefined;
    if (normalizedCode) {
      const participant = await this.prisma.channelParticipant.findUnique({
        where: { code: normalizedCode },
        include: { agency: true },
      });
      if (participant && participant.status === 'ACTIVE') {
        return {
          agency:
            participant.type === 'AGENCY'
              ? participant.agency
              : await this.findAgencyForParticipant(participant),
          member: null,
          participant,
        };
      }

      const member = await this.prisma.agencyMember.findUnique({
        where: { referralCode: normalizedCode },
        include: { agency: { include: { channelParticipant: true } } },
      });
      if (member) {
        if (!member.isActive || member.agency.status !== 'ACTIVE') {
          throw new BadRequestException('Referral code is not active');
        }

        const participant =
          member.agency.channelParticipant ??
          (await this.ensureAgencyParticipant(member.agency));

        return { agency: member.agency, member, participant };
      }

      const agency = await this.prisma.agency.findUnique({
        where: { code: normalizedCode },
        include: { channelParticipant: true },
      });
      if (agency) {
        if (agency.status !== 'ACTIVE') {
          throw new BadRequestException(
            'Agency or referral code is not active',
          );
        }

        const participant =
          agency.channelParticipant ??
          (await this.ensureAgencyParticipant(agency));

        return { agency, member: null, participant };
      }
    }

    const userId = user ? dbUserId(user) : undefined;
    if (!user || !userId) {
      return { agency: null, member: null, participant: null };
    }

    const participant =
      await this.activationOrderSupportService.actorChannelParticipant(user);
    if (participant) {
      return {
        agency: await this.findAgencyForParticipant(participant),
        member: null,
        participant,
      };
    }

    return {
      agency: null,
      member: null,
      participant: null,
    };
  }

  async resolveAffiliateClickAttribution(
    affiliateClickId: string | undefined,
    baseAttribution: ResolvedChannelAttribution,
  ): Promise<{
    attribution: ResolvedChannelAttribution;
    snapshot: AffiliateAttributionSnapshot | null;
  }> {
    const normalizedClickId = affiliateClickId?.trim();
    if (!normalizedClickId) {
      return { attribution: baseAttribution, snapshot: null };
    }
    if (!isAffiliateClickIdShape(normalizedClickId)) {
      throw new BadRequestException('Invalid affiliate click id');
    }

    const event = await this.prisma.affiliateClickEvent.findUnique({
      where: { clickId: normalizedClickId },
      include: {
        affiliateLink: true,
        participant: true,
        agency: true,
        agencyMember: true,
      },
    });

    if (!event) {
      throw new BadRequestException('Affiliate click id is invalid');
    }

    const now = new Date();
    const attributionWindowDays = affiliateAttributionWindowDays();
    if (
      event.createdAt.getTime() <
      now.getTime() - attributionWindowDays * 24 * 60 * 60 * 1000
    ) {
      throw new BadRequestException('Affiliate click id is expired');
    }

    if (!isAffiliateClickEventUsable(event, now)) {
      throw new BadRequestException(
        'Affiliate click attribution is no longer active',
      );
    }

    const existingParticipantId = baseAttribution.participant?.id ?? null;
    if (
      existingParticipantId &&
      existingParticipantId !== event.participantId
    ) {
      throw new BadRequestException(
        'Affiliate click attribution conflicts with selected channel participant',
      );
    }

    const attribution = {
      participant: baseAttribution.participant ?? event.participant,
      agency: baseAttribution.agency ?? event.agency ?? null,
      member: baseAttribution.member ?? event.agencyMember ?? null,
    };

    return {
      attribution,
      snapshot: buildAffiliateAttributionSnapshot(
        event,
        now,
        attributionWindowDays,
      ),
    };
  }

  async buildCommissionChainSnapshot(
    rootParticipant: ResolvedChannelParticipant,
    affiliateSnapshot: AffiliateAttributionSnapshot,
  ): Promise<CommissionChainSnapshot> {
    if (rootParticipant.status && rootParticipant.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Affiliate commission participant is not active',
      );
    }

    const items: CommissionChainSnapshotItem[] = [];
    let current: ResolvedChannelParticipant | null = rootParticipant;
    while (current && items.length < 4) {
      const depth = items.length;
      items.push(
        buildCommissionChainSnapshotItem(current, depth, affiliateSnapshot),
      );

      const parentId: string | null = current.parentParticipantId ?? null;
      if (!parentId) {
        break;
      }

      const parent: ResolvedChannelParticipant | null =
        await this.prisma.channelParticipant.findUnique({
          where: { id: parentId },
        });
      if (!parent || parent.status !== 'ACTIVE') {
        break;
      }
      current = parent;
    }

    if (items.length === 0) {
      throw new BadRequestException('Affiliate commission chain is empty');
    }

    return {
      source: 'affiliate_order_snapshot',
      policyVersion: 'commission_chain_v1',
      snapshottedAt: new Date().toISOString(),
      rootParticipantId: rootParticipant.id,
      items,
    };
  }

  resolveOrderCommissionAttribution(order: {
    channelParticipantId?: string | null;
    affiliateAttributionSnapshotJson?: Prisma.JsonValue | null;
  }): OrderCommissionAttribution {
    if (!order.affiliateAttributionSnapshotJson) {
      return {
        participantId: order.channelParticipantId ?? null,
        usesAffiliateSnapshot: false,
      };
    }

    const snapshot = parseCommissionAttributionSnapshot(
      order.affiliateAttributionSnapshotJson,
    );
    if (!snapshot) {
      throw new BadRequestException(
        'Affiliate attribution snapshot is malformed for commission attribution',
      );
    }

    return {
      participantId: snapshot.participantId,
      attributionSnapshotJson: snapshot,
      usesAffiliateSnapshot: true,
    };
  }

  resolveOrderCommissionChain(
    order: {
      commissionChainSnapshotJson?: Prisma.JsonValue | null;
    },
    attribution: OrderCommissionAttribution,
  ): OrderCommissionChainResolution {
    if (!order.commissionChainSnapshotJson) {
      return {
        items: null,
        legacyMissingAffiliateSnapshot: attribution.usesAffiliateSnapshot,
      };
    }

    const snapshot = parseCommissionChainSnapshot(
      order.commissionChainSnapshotJson,
    );
    if (!snapshot) {
      throw new BadRequestException(
        'Commission chain snapshot is malformed for commission attribution',
      );
    }

    return {
      items: snapshot.items,
      legacyMissingAffiliateSnapshot: false,
    };
  }

  async createCommissionEntries(
    tx: Prisma.TransactionClient,
    order: Prisma.ActivationOrderGetPayload<{
      include: {
        createdBy: {
          include: {
            roles: {
              include: {
                role: true;
              };
            };
            agencyMemberships: {
              include: {
                agency: true;
              };
            };
          };
        };
        referrerMember: {
          include: {
            user: {
              include: {
                roles: {
                  include: {
                    role: true;
                  };
                };
              };
            };
            agency: true;
          };
        };
        agency: true;
        channelParticipant: true;
      };
    }>,
    availableAt: Date,
    attribution: OrderCommissionAttribution,
    chainResolution: OrderCommissionChainResolution,
  ) {
    const existing = await tx.commissionEarning.count({
      where: { activationOrderId: order.id },
    });
    if (existing > 0) {
      return;
    }

    if (chainResolution.items) {
      for (const item of chainResolution.items) {
        await this.createCommissionForParticipant(tx, {
          activationOrderId: order.id,
          participantId: item.participantId,
          beneficiaryType: item.beneficiaryType,
          beneficiaryUserId:
            item.beneficiaryType === 'AGENCY' ? undefined : item.beneficiaryId,
          beneficiaryAgencyId:
            item.beneficiaryType === 'AGENCY' ? item.beneficiaryId : undefined,
          baseAmountCents: order.amountCents,
          rateBps: item.rateBps,
          currency: order.currency,
          availableAt,
          depth: item.depth,
          attributionSnapshotJson: attributionSnapshotJsonForCommission(
            attribution,
            chainResolution,
          ),
        });
      }
      return;
    }

    const participant =
      (attribution.participantId &&
      order.channelParticipant?.id === attribution.participantId
        ? order.channelParticipant
        : attribution.participantId
          ? await tx.channelParticipant.findUnique({
              where: { id: attribution.participantId },
            })
          : null) ??
      (attribution.usesAffiliateSnapshot
        ? null
        : await this.resolveLegacyParticipantForOrder(tx, order));
    if (!participant) {
      return;
    }

    const chain = [participant];
    let currentParentId = participant.parentParticipantId;
    while (currentParentId && chain.length < 4) {
      const parent = await tx.channelParticipant.findUnique({
        where: { id: currentParentId },
      });
      if (!parent || parent.status !== 'ACTIVE') {
        break;
      }
      chain.push(parent);
      currentParentId = parent.parentParticipantId;
    }

    for (const [depth, node] of chain.entries()) {
      await this.createCommissionForParticipant(tx, {
        activationOrderId: order.id,
        participantId: node.id,
        beneficiaryType: commissionBeneficiaryTypeForParticipant(node.type),
        beneficiaryUserId: node.type === 'AGENCY' ? undefined : node.userId,
        beneficiaryAgencyId: node.type === 'AGENCY' ? node.agencyId : undefined,
        baseAmountCents: order.amountCents,
        rateBps: commissionRateForDepth(depth),
        currency: order.currency,
        availableAt,
        depth,
        attributionSnapshotJson: attributionSnapshotJsonForCommission(
          attribution,
          chainResolution,
        ),
      });
    }
  }

  private async createCommissionForParticipant(
    tx: Prisma.TransactionClient,
    input: {
      activationOrderId: string;
      participantId: string;
      beneficiaryType: 'SALE' | 'AGENCY';
      beneficiaryUserId?: string | null;
      beneficiaryAgencyId?: string | null;
      baseAmountCents: number;
      rateBps: number;
      currency: string;
      availableAt: Date;
      depth: number;
      attributionSnapshotJson?: Prisma.InputJsonValue;
    },
  ) {
    if (input.rateBps <= 0) {
      return;
    }

    const amountCents = Math.round(
      (input.baseAmountCents * input.rateBps) / 10000,
    );
    if (amountCents <= 0) {
      return;
    }

    await tx.commissionEarning.create({
      data: {
        activationOrderId: input.activationOrderId,
        participantId: input.participantId,
        beneficiaryType: input.beneficiaryType,
        beneficiaryUserId: input.beneficiaryUserId,
        beneficiaryAgencyId: input.beneficiaryAgencyId,
        baseAmountCents: input.baseAmountCents,
        rateBps: input.rateBps,
        amountCents,
        currency: input.currency,
        status: 'PENDING',
        depth: input.depth,
        availableAt: input.availableAt,
        ...(input.attributionSnapshotJson
          ? { attributionSnapshotJson: input.attributionSnapshotJson }
          : {}),
      },
    });
  }

  private async resolveLegacyParticipantForOrder(
    tx: Prisma.TransactionClient,
    order: {
      agencyId?: string | null;
      createdById?: string | null;
    },
  ) {
    if (order.agencyId) {
      return tx.channelParticipant.findFirst({
        where: {
          type: 'AGENCY',
          agencyId: order.agencyId,
          status: 'ACTIVE',
        },
      });
    }

    if (order.createdById) {
      return tx.channelParticipant.findFirst({
        where: {
          userId: order.createdById,
          status: 'ACTIVE',
        },
      });
    }

    return null;
  }

  private async ensureAgencyParticipant(agency: {
    id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'SUSPENDED';
    defaultRateBps: number;
    notes?: string | null;
    createdAt?: Date;
  }) {
    const participant = await this.prisma.channelParticipant.upsert({
      where: { agencyId: agency.id },
      update: {
        code: agency.code,
        displayName: agency.name,
        status: agency.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
        commissionRateBps:
          agency.defaultRateBps > 0 ? agency.defaultRateBps : null,
        notes: agency.notes,
      },
      create: {
        type: 'AGENCY',
        code: agency.code,
        displayName: agency.name,
        agencyId: agency.id,
        status: agency.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
        baseSalaryCents: 0,
        commissionRateBps:
          agency.defaultRateBps > 0 ? agency.defaultRateBps : null,
        notes: agency.notes,
      },
    });

    if (participant.lineage) {
      return participant;
    }

    return this.prisma.channelParticipant.update({
      where: { id: participant.id },
      data: {
        rootParticipantId: participant.id,
        lineage: `/${participant.id}/`,
      },
    });
  }

  async releasePendingCommissions(now = new Date()) {
    const dueEarnings = await this.prisma.commissionEarning.findMany({
      where: {
        status: 'PENDING',
        availableAt: { lte: now },
      },
      orderBy: { availableAt: 'asc' },
      take: 500,
      include: {
        activationOrder: {
          select: {
            status: true,
            statusHistory: {
              where: { action: { in: [...manualRefundRequestActions] } },
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              take: 1,
              select: { action: true },
            },
          },
        },
      },
    });

    let released = 0;
    let canceled = 0;
    let heldForRefundReview = 0;

    for (const earning of dueEarnings) {
      if (earning.activationOrder.status !== 'APPROVED') {
        await this.prisma.commissionEarning.updateMany({
          where: { id: earning.id, status: 'PENDING' },
          data: { status: 'CANCELED' },
        });
        canceled += 1;
        continue;
      }

      const latestManualRefundAction = latestManualRefundRequestAction(
        earning.activationOrder.statusHistory ?? [],
      );
      if (latestManualRefundAction === manualRefundRequestOpenedAction) {
        heldForRefundReview += 1;
        continue;
      }
      if (latestManualRefundAction === manualRefundRequestApprovedAction) {
        await this.prisma.commissionEarning.updateMany({
          where: { id: earning.id, status: 'PENDING' },
          data: { status: 'CANCELED' },
        });
        canceled += 1;
        continue;
      }

      const didRelease = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.commissionEarning.updateMany({
          where: { id: earning.id, status: 'PENDING' },
          data: {
            status: 'AVAILABLE',
            releasedAt: now,
          },
        });

        if (updated.count === 0) {
          return false;
        }

        await tx.commissionLedgerEntry.create({
          data: {
            participantId: earning.participantId,
            beneficiaryUserId: earning.beneficiaryUserId,
            beneficiaryAgencyId: earning.beneficiaryAgencyId,
            type: 'CREDIT',
            amountCents: earning.amountCents,
            currency: earning.currency,
            reason: `Commission released after ${MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS}-day refund window`,
            referenceType: 'CommissionEarning',
            referenceId: earning.id,
          },
        });

        return true;
      });
      if (didRelease) {
        released += 1;
      }
    }

    return {
      checked: dueEarnings.length,
      released,
      canceled,
      heldForRefundReview,
    };
  }

  private async findAgencyForParticipant(
    participant: {
      type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE';
      agencyId?: string | null;
      parentParticipantId?: string | null;
    },
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    if (participant.agencyId) {
      return tx.agency.findUnique({ where: { id: participant.agencyId } });
    }

    let parentId = participant.parentParticipantId;
    while (parentId) {
      const parent = await tx.channelParticipant.findUnique({
        where: { id: parentId },
        select: {
          type: true,
          agencyId: true,
          parentParticipantId: true,
        },
      });
      if (!parent) {
        break;
      }
      if (parent.type === 'AGENCY' && parent.agencyId) {
        return tx.agency.findUnique({ where: { id: parent.agencyId } });
      }
      parentId = parent.parentParticipantId;
    }

    return null;
  }
}
