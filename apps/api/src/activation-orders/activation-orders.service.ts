import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  addDays as addIdempotencyDays,
  buildRequestHash,
  normalizeIdempotencyKey,
  resolveExistingIdempotencyRecord,
  toIdempotencyJson,
} from '../commercial-idempotency';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveActivationOrderDto } from './dto/approve-activation-order.dto';
import { CreateActivationOrderDto } from './dto/create-activation-order.dto';
import {
  CreateSelfServiceActivationOrderDto,
  UploadSelfServicePaymentProofDto,
} from './dto/create-self-service-activation-order.dto';
import {
  buildLegacyOrderEntitlementSnapshot,
  buildPackageEntitlementSnapshot,
  type PackageEntitlementSnapshot,
  parsePackageEntitlementSnapshot,
  type SnapshotActivationPackage,
  toPrismaJson,
} from '../package-entitlement/package-entitlement-snapshot';
import { ListActivationOrdersQueryDto } from './dto/list-activation-orders-query.dto';
import {
  ManualRefundRequestDto,
  ReviewManualRefundRequestDto,
} from './dto/manual-refund-request.dto';
import { RejectActivationOrderDto } from './dto/reject-activation-order.dto';
import { ResubmitActivationOrderDto } from './dto/resubmit-activation-order.dto';
import { RevokeActivationOrderDto } from './dto/revoke-activation-order.dto';

const invoiceUrl = (file: Express.Multer.File) =>
  `/uploads/invoices/${file.filename}`;

const fallbackPackages = [
  {
    code: 'one-month',
    name: '1 month access',
    amountVnd: 300000,
    durationDays: 30,
  },
  {
    code: 'three-months',
    name: '3 months access',
    amountVnd: 800000,
    durationDays: 90,
  },
  {
    code: 'one-year',
    name: '1 year access',
    amountVnd: 2400000,
    durationDays: 365,
  },
] as const;

export const MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS = 10;

const manualPaidPilotPolicyVersion = 'manual_paid_pilot_refund_window_v1';
const manualPaidPilotChildAllocationHardStop =
  'Manual paid pilot supports one child per order only until user-owned subscription seat allocation is implemented';
const manualPaidPilotPaymentProvider = 'manual_bank_transfer';
const manualRefundRequestOpenedAction = 'MANUAL_REFUND_REQUEST_OPENED';
const manualRefundRequestApprovedAction = 'MANUAL_REFUND_REQUEST_APPROVED';
const manualRefundRequestRejectedAction = 'MANUAL_REFUND_REQUEST_REJECTED';
const manualRefundRequestActions = [
  manualRefundRequestOpenedAction,
  manualRefundRequestApprovedAction,
  manualRefundRequestRejectedAction,
] as const;

type SelfServicePackage = {
  code: string;
  name: string;
  amountVnd: number;
  durationDays: number;
};

type ResolvedChannelParticipant = {
  id: string;
  type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE';
  userId?: string | null;
  agencyId?: string | null;
  parentParticipantId?: string | null;
  status?: 'ACTIVE' | 'SUSPENDED';
};

type ResolvedChannelAttribution = {
  agency: { id: string } | null;
  member: { id: string } | null;
  participant: ResolvedChannelParticipant | null;
};

type AffiliateAttributionSnapshot = {
  source: 'affiliate_click';
  clickId: string;
  affiliateClickEventId: string;
  affiliateLinkId: string;
  affiliateQrAssetId: string | null;
  participantId: string;
  agencyId: string | null;
  agencyMemberId: string | null;
  referralCode: string | null;
  campaign: string | null;
  channel: string | null;
  placement: string | null;
  packageCode: string | null;
  clickCreatedAt: string;
  orderSnapshottedAt: string;
  attributionModel: 'explicit_click';
  matchConfidence: 'high';
  attributionWindowDays: number;
};

type CommissionAttributionSnapshot = {
  source: 'affiliate_order_snapshot';
  participantId: string;
  agencyId: string | null;
  agencyMemberId: string | null;
  referralCode: string | null;
  affiliateLinkId: string;
  affiliateQrAssetId: string | null;
  campaign: string | null;
  channel: string | null;
  placement: string | null;
  packageCode: string | null;
  clickId: string;
  clickCreatedAt: string;
  orderSnapshottedAt: string;
};

type CommissionChainSnapshotItem = {
  depth: number;
  participantId: string;
  beneficiaryType: 'SALE' | 'AGENCY';
  beneficiaryId: string | null;
  rateBps: number;
  agencyId: string | null;
  agencyMemberId: string | null;
  parentParticipantId: string | null;
};

type CommissionChainSnapshot = {
  source: 'affiliate_order_snapshot';
  policyVersion: 'commission_chain_v1';
  snapshottedAt: string;
  rootParticipantId: string;
  items: CommissionChainSnapshotItem[];
};

type OrderCommissionAttribution = {
  participantId: string | null;
  attributionSnapshotJson?: Prisma.InputJsonValue;
  usesAffiliateSnapshot: boolean;
};

type OrderCommissionChainResolution = {
  items: CommissionChainSnapshotItem[] | null;
  legacyMissingAffiliateSnapshot: boolean;
};

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredSnapshotString(
  snapshot: Record<string, unknown>,
  key: string,
) {
  const value = snapshot[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function nullableSnapshotString(
  snapshot: Record<string, unknown>,
  key: string,
) {
  const value = snapshot[key];
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'string' ? value : undefined;
}

function isValidIsoDateString(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function requiredSnapshotNumber(
  snapshot: Record<string, unknown>,
  key: string,
) {
  const value = snapshot[key];
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

@Injectable()
export class ActivationOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  async listSelfServiceOptions() {
    const dbPackages = await this.prisma.activationPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        code: true,
        name: true,
        amountVnd: true,
        durationDays: true,
        description: true,
      },
    });
    const packages = dbPackages.length > 0 ? dbPackages : fallbackPackages;
    return {
      packages,
      bankTransfer: this.bankTransferInfo(),
    };
  }

  async listOrders(
    user: AuthenticatedUser,
    query: ListActivationOrdersQueryDto = {},
  ) {
    const limit = Math.min(query.limit ?? 50, 200);
    const scopeWhere = await this.orderVisibilityWhere(user);

    const filterWhere: Prisma.ActivationOrderWhereInput = {};
    if (query.status) {
      filterWhere.status =
        query.status as Prisma.EnumActivationOrderStatusFilter;
    }
    if (query.fromDate || query.toDate) {
      filterWhere.createdAt = {
        ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
        ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
      };
    }
    if (query.search) {
      const term = query.search.trim().toLowerCase();
      filterWhere.customerEmail = { contains: term, mode: 'insensitive' };
    }
    if (query.cursor) {
      filterWhere.id = { lt: query.cursor };
    }

    const items = await this.prisma.activationOrder.findMany({
      where: { AND: [scopeWhere, filterWhere] },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: this.orderInclude(),
    });

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? results[results.length - 1]?.id : null;

    return { items: results, nextCursor, hasMore };
  }

  async getStatusHistory(orderId: string, user: AuthenticatedUser) {
    const scopeWhere = await this.orderVisibilityWhere(user);
    const order = await this.prisma.activationOrder.findFirst({
      where: { AND: [{ id: orderId }, scopeWhere] },
      select: { id: true },
    });
    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    const items = await this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        orderId: true,
        fromStatus: true,
        toStatus: true,
        action: true,
        actorUserId: true,
        actor: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
        reason: true,
        metadataJson: true,
        createdAt: true,
      },
    });

    return {
      items: items.map(({ actor, ...item }) => ({
        ...item,
        actor: actor
          ? {
              id: actor.id,
              displayName: actor.profile?.displayName ?? null,
              email: actor.email,
            }
          : null,
        metadataJson: this.sanitizeHistoryMetadata(item.metadataJson),
      })),
    };
  }

  async listMyCustomers(user: AuthenticatedUser) {
    const userId = this.dbUserId(user);
    if (!userId) {
      return { customers: [] };
    }

    const orders = await this.prisma.activationOrder.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        packageName: true,
        amountCents: true,
        currency: true,
        activatedAt: true,
        expiresAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: { select: { displayName: true } },
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
          },
        },
      },
    });

    const byCustomer = new Map<
      string,
      {
        id: string;
        email: string;
        status: string;
        displayName?: string | null;
        subscription: { status: string; currentPeriodEnd: Date } | null;
        totalOrders: number;
        approvedOrders: number;
        latestOrder: {
          id: string;
          status: string;
          packageName?: string | null;
          expiresAt?: Date | null;
          createdAt: Date;
        };
      }
    >();

    for (const order of orders) {
      const allSubs = order.user.childProfiles.flatMap(
        (cp) => cp.subscriptions,
      );
      allSubs.sort(
        (a, b) => b.currentPeriodEnd.getTime() - a.currentPeriodEnd.getTime(),
      );
      const existing = byCustomer.get(order.user.id);
      if (!existing) {
        byCustomer.set(order.user.id, {
          id: order.user.id,
          email: order.user.email,
          status: order.user.status,
          displayName: order.user.profile?.displayName,
          subscription: allSubs[0] ?? null,
          totalOrders: 1,
          approvedOrders: order.status === 'APPROVED' ? 1 : 0,
          latestOrder: {
            id: order.id,
            status: order.status,
            packageName: order.packageName,
            expiresAt: order.expiresAt,
            createdAt: order.createdAt,
          },
        });
      } else {
        existing.totalOrders += 1;
        if (order.status === 'APPROVED') {
          existing.approvedOrders += 1;
        }
      }
    }

    return { customers: Array.from(byCustomer.values()) };
  }

  async createOrder(
    dto: CreateActivationOrderDto,
    saleInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
  ) {
    const email = dto.email.trim().toLowerCase();
    const creatorId = this.dbUserId(user);

    // Duplicate guard: block creating a second PENDING_REVIEW order for the same
    // customer email from the same creator within the last 48 hours.
    if (creatorId) {
      const duplicate = await this.prisma.activationOrder.findFirst({
        where: {
          customerEmail: email,
          createdById: creatorId,
          status: { in: ['WAITING_PAYMENT', 'PENDING_REVIEW'] },
          createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        },
        select: { id: true, status: true },
      });
      if (duplicate) {
        throw new BadRequestException(
          `An active order for ${email} already exists (${duplicate.id}). Resolve or cancel it before creating a new one.`,
        );
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    const isNewAccount = !existingUser;

    // Only generate/set a password for new accounts; never touch existing passwords.
    const newPassword = isNewAccount
      ? (dto.password ?? this.generateSecurePassword())
      : undefined;
    const generatedPassword =
      isNewAccount && !dto.password ? (newPassword ?? null) : null;
    const baseAttribution = await this.resolveChannelAttribution(
      dto.agencyCode,
      user,
    );
    const affiliateResolution = await this.resolveAffiliateClickAttribution(
      dto.affiliateClickId,
      baseAttribution,
    );
    const attribution = affiliateResolution.attribution;
    const commissionChainSnapshot =
      affiliateResolution.snapshot && attribution.participant
        ? await this.buildCommissionChainSnapshot(
            attribution.participant,
            affiliateResolution.snapshot,
          )
        : null;

    const activationPackage = dto.packageCode
      ? await this.findPackageForSnapshotByCode(dto.packageCode)
      : null;
    const resolvedPackageName = activationPackage?.name ?? dto.packageName;
    const soldDurationDays =
      dto.requestedDurationDays ?? activationPackage?.durationDays ?? 0;
    const entitlementSnapshot = buildPackageEntitlementSnapshot({
      activationPackage,
      fallbackPackageCode: dto.packageCode,
      fallbackPackageName: resolvedPackageName,
      soldAmountVnd: dto.amountVnd,
      soldDurationDays,
      customPackage: !activationPackage,
    });
    const childAllocationGate =
      this.assertManualPaidPilotSingleChildAllocation(entitlementSnapshot);

    const learner = await this.upsertLearnerAccount(
      { displayName: dto.displayName, password: newPassword },
      email,
      { allowExistingPasswordReset: false },
    );

    const order = await this.prisma.activationOrder.create({
      data: {
        userId: learner.id,
        createdById: creatorId,
        channelParticipantId: attribution.participant?.id,
        agencyId: attribution.agency?.id,
        referrerMemberId: attribution.member?.id,
        source: 'SALE_ASSISTED',
        status: 'PENDING_REVIEW',
        customerEmail: email,
        customerPhone: dto.phone?.trim() || null,
        amountCents: Math.round(dto.amountVnd * 100),
        currency: dto.currency ?? 'VND',
        packageCode: dto.packageCode,
        packageName: resolvedPackageName,
        requestedDurationDays: dto.requestedDurationDays,
        entitlementSnapshotJson: toPrismaJson(entitlementSnapshot),
        ...(affiliateResolution.snapshot
          ? {
              affiliateAttributionSnapshotJson: this.toAffiliateAttributionJson(
                affiliateResolution.snapshot,
              ),
              commissionChainSnapshotJson: this.toCommissionChainSnapshotJson(
                commissionChainSnapshot!,
              ),
            }
          : {}),
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: 'PENDING_REVIEW',
            action: 'CREATE_SALE_ASSISTED',
            actorUserId: creatorId ?? null,
            reason: dto.notes ?? null,
            metadataJson: toIdempotencyJson({
              source: 'SALE_ASSISTED',
              packageCode: dto.packageCode ?? null,
              packageName: resolvedPackageName ?? null,
              amountCents: Math.round(dto.amountVnd * 100),
              requestedDurationDays: dto.requestedDurationDays ?? null,
              channelParticipantId: attribution.participant?.id ?? null,
              agencyId: attribution.agency?.id ?? null,
              referrerMemberId: attribution.member?.id ?? null,
              affiliateClickId: affiliateResolution.snapshot?.clickId ?? null,
              affiliateAttributionSource:
                affiliateResolution.snapshot?.source ?? null,
              manualPaidPilotChildAllocationGate: childAllocationGate,
              saleInvoiceStorageKey: saleInvoice
                ? `invoices/${saleInvoice.filename}`
                : null,
            }),
          },
        },
        ...(saleInvoice
          ? {
              saleInvoiceUrl: invoiceUrl(saleInvoice),
              saleInvoiceStorageKey: `invoices/${saleInvoice.filename}`,
              saleInvoiceMimeType: saleInvoice.mimetype,
              saleInvoiceFileSizeBytes: saleInvoice.size,
            }
          : {}),
        notes: dto.notes,
      },
      include: this.orderInclude(),
    });

    await this.audit(user, 'activation_order.create', order.id, {
      customerEmail: email,
      amountCents: order.amountCents,
      isNewAccount,
    });

    return { order, generatedPassword, isNewAccount };
  }

  async resubmitOrder(
    orderId: string,
    dto: ResubmitActivationOrderDto,
    saleInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
  ) {
    const userId = this.dbUserId(user);
    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    if (order.status !== 'REJECTED') {
      throw new BadRequestException('Only rejected orders can be resubmitted');
    }

    const isOwner = !userId || order.createdById === userId;
    const isAgencyManager = await this.isAgencyManagerForOrder(
      order.agencyId,
      user,
    );
    const isPrivileged = user.roles.some((role) =>
      ['ADMIN', 'OPERATIONS'].includes(role),
    );
    if (!isOwner && !isAgencyManager && !isPrivileged) {
      throw new BadRequestException(
        'You can only resubmit your own orders or agency orders in your scope',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.activationOrder.updateMany({
        where: { id: orderId, status: 'REJECTED' },
        data: {
          status: 'PENDING_REVIEW',
          reviewedById: null,
          reviewNotes: null,
          ...(dto.notes ? { notes: dto.notes } : {}),
          ...(saleInvoice
            ? {
                saleInvoiceUrl: invoiceUrl(saleInvoice),
                saleInvoiceStorageKey: `invoices/${saleInvoice.filename}`,
                saleInvoiceMimeType: saleInvoice.mimetype,
                saleInvoiceFileSizeBytes: saleInvoice.size,
              }
            : {}),
        },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'Only rejected orders can be resubmitted',
        );
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'PENDING_REVIEW',
          action: 'RESUBMIT',
          actorUserId: userId ?? null,
          reason: dto.notes ?? null,
          metadataJson: toIdempotencyJson({
            previousReviewNotes: order.reviewNotes ?? null,
            saleInvoiceStorageKey: saleInvoice
              ? `invoices/${saleInvoice.filename}`
              : null,
            saleInvoiceMimeType: saleInvoice?.mimetype ?? null,
            saleInvoiceFileSizeBytes: saleInvoice?.size ?? null,
          }),
        },
      });

      return tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: this.orderInclude(),
      });
    });

    await this.audit(user, 'activation_order.resubmit', orderId);
    return updated;
  }

  async cancelOrder(orderId: string, user: AuthenticatedUser) {
    const userId = this.dbUserId(user);
    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    const cancelableStatuses = [
      'WAITING_PAYMENT',
      'PENDING_REVIEW',
      'REJECTED',
    ] as const;
    if (!cancelableStatuses.some((status) => status === order.status)) {
      throw new BadRequestException(
        `Cannot cancel an order with status ${order.status}`,
      );
    }

    const isOwner = userId && order.createdById === userId;
    const isAgencyManager = await this.isAgencyManagerForOrder(
      order.agencyId,
      user,
    );
    const isPrivileged = user.roles.some((role) =>
      ['ADMIN', 'OPERATIONS'].includes(role),
    );
    if (!isOwner && !isAgencyManager && !isPrivileged) {
      throw new BadRequestException(
        'You can only cancel your own orders or agency orders in your scope',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.activationOrder.updateMany({
        where: { id: orderId, status: { in: [...cancelableStatuses] } },
        data: { status: 'CANCELED' },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          `Cannot cancel an order with status ${order.status}`,
        );
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'CANCELED',
          action: 'CANCEL',
          actorUserId: userId ?? null,
          reason: null,
          metadataJson: toIdempotencyJson({
            previousStatus: order.status,
            actorRoles: user.roles,
          }),
        },
      });

      return tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: this.orderInclude(),
      });
    });

    await this.audit(user, 'activation_order.cancel', orderId);
    return updated;
  }

  async createSelfServiceOrder(dto: CreateSelfServiceActivationOrderDto) {
    // Check DB packages first, fall back to hardcoded list
    const dbPackages: (SelfServicePackage & SnapshotActivationPackage)[] =
      await this.prisma.activationPackage
        .findMany({
          where: { isActive: true },
          include: {
            entitlements: {
              where: { status: 'ACTIVE' },
              orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
            },
          },
        })
        .catch(() => []);
    const selectedDbPackage = dbPackages.find(
      (item) => item.code === dto.packageCode,
    );
    const selectedFallbackPackage =
      dbPackages.length === 0
        ? fallbackPackages.find((item) => item.code === dto.packageCode)
        : undefined;
    const selectedPackage = selectedDbPackage ?? selectedFallbackPackage;
    if (!selectedPackage) {
      throw new BadRequestException('Invalid package');
    }
    const entitlementSnapshot = buildPackageEntitlementSnapshot({
      activationPackage: selectedDbPackage ?? null,
      fallbackPackageCode: selectedPackage.code,
      fallbackPackageName: selectedPackage.name,
      soldAmountVnd: selectedPackage.amountVnd,
      soldDurationDays: selectedPackage.durationDays,
      customPackage: !selectedDbPackage,
    });
    const childAllocationGate =
      this.assertManualPaidPilotSingleChildAllocation(entitlementSnapshot);
    const baseAttribution = await this.resolveChannelAttribution(
      dto.referralCode,
    );
    const affiliateResolution = await this.resolveAffiliateClickAttribution(
      dto.affiliateClickId,
      baseAttribution,
    );
    const attribution = affiliateResolution.attribution;
    const commissionChainSnapshot =
      affiliateResolution.snapshot && attribution.participant
        ? await this.buildCommissionChainSnapshot(
            attribution.participant,
            affiliateResolution.snapshot,
          )
        : null;

    const email = dto.email.trim().toLowerCase();
    const parent = await this.upsertParentAccount(
      { password: dto.password },
      email,
    );

    // Create or find a child profile for this parent
    const childName = dto.displayName?.trim() || 'Con';
    const childProfile = await this.prisma.childProfile.upsert({
      where: {
        id:
          (
            await this.prisma.childProfile.findFirst({
              where: { parentId: parent.id },
              select: { id: true },
              orderBy: { createdAt: 'asc' },
            })
          )?.id ?? 'none',
      },
      update: {},
      create: { parentId: parent.id, displayName: childName },
    });

    const bankTransfer = this.bankTransferInfo();
    const transferContent = await this.uniqueTransferContent();

    const order = await this.prisma.activationOrder.create({
      data: {
        userId: parent.id,
        childProfileId: childProfile.id,
        channelParticipantId: attribution.participant?.id,
        agencyId: attribution.agency?.id,
        referrerMemberId: attribution.member?.id,
        source: 'SELF_SERVICE',
        status: 'WAITING_PAYMENT',
        customerEmail: email,
        amountCents: selectedPackage.amountVnd * 100,
        currency: 'VND',
        packageCode: selectedPackage.code,
        packageName: selectedPackage.name,
        requestedDurationDays: selectedPackage.durationDays,
        entitlementSnapshotJson: toPrismaJson(entitlementSnapshot),
        ...(affiliateResolution.snapshot
          ? {
              affiliateAttributionSnapshotJson: this.toAffiliateAttributionJson(
                affiliateResolution.snapshot,
              ),
              commissionChainSnapshotJson: this.toCommissionChainSnapshotJson(
                commissionChainSnapshot!,
              ),
            }
          : {}),
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: 'WAITING_PAYMENT',
            action: 'CREATE_SELF_SERVICE',
            actorUserId: parent.id,
            reason: dto.notes ?? null,
            metadataJson: toIdempotencyJson({
              source: 'SELF_SERVICE',
              packageCode: selectedPackage.code,
              packageName: selectedPackage.name,
              amountCents: selectedPackage.amountVnd * 100,
              requestedDurationDays: selectedPackage.durationDays,
              hasTransferContent: Boolean(transferContent),
              channelParticipantId: attribution.participant?.id ?? null,
              agencyId: attribution.agency?.id ?? null,
              referrerMemberId: attribution.member?.id ?? null,
              affiliateClickId: affiliateResolution.snapshot?.clickId ?? null,
              affiliateAttributionSource:
                affiliateResolution.snapshot?.source ?? null,
              manualPaidPilotChildAllocationGate: childAllocationGate,
            }),
          },
        },
        bankName: bankTransfer.bankName,
        bankAccountNumber: bankTransfer.accountNumber,
        bankAccountName: bankTransfer.accountName,
        transferContent,
        notes: dto.notes,
      },
      include: this.orderInclude(),
    });

    await this.auditSystem('activation_order.self_service.create', order.id, {
      customerEmail: email,
      packageCode: selectedPackage.code,
      amountCents: order.amountCents,
    });

    void this.notification.sendOrderCreated({
      to: email,
      packageName: selectedPackage.name,
      amountCents: order.amountCents,
      currency: 'VND',
      bankName: bankTransfer.bankName,
      bankAccountNumber: bankTransfer.accountNumber,
      bankAccountName: bankTransfer.accountName,
      transferContent,
    });

    return {
      order,
      bankTransfer,
    };
  }

  async uploadSelfServicePaymentProof(
    orderId: string,
    dto: UploadSelfServicePaymentProofDto,
    paymentProof: Express.Multer.File | undefined,
  ) {
    if (!paymentProof) {
      throw new BadRequestException('Payment proof file is required');
    }

    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
    });
    if (!order || order.source !== 'SELF_SERVICE') {
      throw new NotFoundException('Self-service order not found');
    }

    if (order.customerEmail !== dto.email.trim().toLowerCase()) {
      throw new BadRequestException('Order email does not match');
    }

    if (!['WAITING_PAYMENT', 'PENDING_REVIEW'].includes(order.status)) {
      throw new BadRequestException(
        'Only waiting payment orders can receive payment proof',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.activationOrder.updateMany({
        where: {
          id: orderId,
          status: { in: ['WAITING_PAYMENT', 'PENDING_REVIEW'] },
        },
        data: {
          status: 'PENDING_REVIEW',
          saleInvoiceUrl: invoiceUrl(paymentProof),
          saleInvoiceStorageKey: `invoices/${paymentProof.filename}`,
          saleInvoiceMimeType: paymentProof.mimetype,
          saleInvoiceFileSizeBytes: paymentProof.size,
        },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'Only waiting payment orders can receive payment proof',
        );
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'PENDING_REVIEW',
          action: 'UPLOAD_PAYMENT_PROOF',
          actorUserId: order.userId,
          reason: null,
          metadataJson: toIdempotencyJson({
            previousStatus: order.status,
            saleInvoiceStorageKey: `invoices/${paymentProof.filename}`,
            saleInvoiceMimeType: paymentProof.mimetype,
            saleInvoiceFileSizeBytes: paymentProof.size,
          }),
        },
      });

      return tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: this.orderInclude(),
      });
    });

    await this.auditSystem(
      'activation_order.self_service.payment_proof',
      order.id,
      {
        customerEmail: order.customerEmail,
      },
    );

    return updated;
  }

  async approveOrder(
    orderId: string,
    dto: ApproveActivationOrderDto,
    operationInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    if (!operationInvoice) {
      throw new BadRequestException('Operation invoice file is required');
    }

    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = this.dbUserId(user);
    const idempotencyScope = `activation-order:approve:${orderId}`;
    const requestHash = buildRequestHash({
      action: 'APPROVE',
      actorUserId,
      dto,
      operationInvoice: this.fileIdempotencyMetadata(operationInvoice),
      orderId,
    });

    if (normalizedIdempotencyKey) {
      const existing = await this.prisma.idempotencyRecord.findUnique({
        where: {
          scope_key: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
          },
        },
      });
      const replay = resolveExistingIdempotencyRecord<Record<string, unknown>>(
        existing,
        requestHash,
      );
      if (replay.replayed) {
        return replay.response;
      }
    }

    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
      include: {
        user: { include: { profile: true } },
        createdBy: {
          include: {
            roles: {
              include: { role: true },
            },
            agencyMemberships: {
              where: { isActive: true },
              include: { agency: true },
              take: 1,
            },
          },
        },
        referrerMember: {
          include: {
            user: {
              include: {
                roles: { include: { role: true } },
              },
            },
            agency: true,
          },
        },
        channelParticipant: true,
        agency: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    if (order.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('Only pending orders can be approved');
    }

    const now = new Date();
    const activationPackage = order.packageCode
      ? await this.findPackageForSnapshotByCode(order.packageCode)
      : null;
    const parsedOrderSnapshot = parsePackageEntitlementSnapshot(
      order.entitlementSnapshotJson,
    );
    this.assertCurrentPackageSingleChildAllocationForLegacyApproval({
      parsedOrderSnapshot,
      activationPackage,
      packageCode: order.packageCode,
      packageName: order.packageName,
      amountCents: order.amountCents,
      durationDays: dto.durationDays,
      capturedAt: now,
    });
    const subscriptionSnapshot =
      parsedOrderSnapshot ??
      buildLegacyOrderEntitlementSnapshot({
        activationPackage,
        packageCode: order.packageCode,
        packageName: order.packageName,
        amountCents: order.amountCents,
        durationDays: dto.durationDays,
        capturedAt: now,
      });
    const childAllocationGate =
      this.assertManualPaidPilotSingleChildAllocation(subscriptionSnapshot);
    const plan = await this.ensureManualPlan();

    const refundWindowEndsAt = this.addDays(
      now,
      MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
    );
    const manualPaidPilotPolicy =
      this.manualPaidPilotPolicyMetadata(refundWindowEndsAt);
    const operationUrl = invoiceUrl(operationInvoice);

    const approveInTransaction = async (tx: Prisma.TransactionClient) => {
      const commissionAttribution =
        this.resolveOrderCommissionAttribution(order);
      const commissionChain = this.resolveOrderCommissionChain(
        order,
        commissionAttribution,
      );
      let childProfileId = order.childProfileId;

      if (!childProfileId) {
        const existing = await tx.childProfile.findFirst({
          where: { parentId: order.userId },
          select: { id: true },
          orderBy: { createdAt: 'asc' },
        });
        if (existing) {
          childProfileId = existing.id;
        } else {
          const created = await tx.childProfile.create({
            data: {
              parentId: order.userId,
              displayName:
                order.user.profile?.displayName ??
                order.customerEmail.split('@')[0],
            },
          });
          childProfileId = created.id;
        }
      }

      const latestActiveSubscription = await tx.subscription.findFirst({
        where: {
          childProfileId,
          status: { in: ['TRIALING', 'ACTIVE'] },
          currentPeriodEnd: { gt: now },
        },
        orderBy: { currentPeriodEnd: 'desc' },
      });
      const startAt = latestActiveSubscription?.currentPeriodEnd ?? now;
      const endAt = this.addDays(startAt, dto.durationDays);

      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.create({
          data: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
            actorUserId,
            resourceType: 'ActivationOrder',
            resourceId: order.id,
            requestHash,
            status: 'IN_PROGRESS',
            expiresAt: addIdempotencyDays(new Date(), 30),
          },
        });
      }

      const claimed = await tx.activationOrder.updateMany({
        where: { id: order.id, status: 'PENDING_REVIEW' },
        data: {
          status: 'APPROVED',
          childProfileId,
          reviewedById: actorUserId,
          durationDays: dto.durationDays,
          operationInvoiceUrl: operationUrl,
          operationInvoiceStorageKey: `invoices/${operationInvoice.filename}`,
          operationInvoiceMimeType: operationInvoice.mimetype,
          operationInvoiceFileSizeBytes: operationInvoice.size,
          reviewNotes: dto.reviewNotes,
          activatedAt: now,
          trialEndsAt: refundWindowEndsAt,
          expiresAt: endAt,
          entitlementSnapshotJson: toPrismaJson(subscriptionSnapshot),
        },
      });

      if (claimed.count === 0) {
        throw new BadRequestException('Only pending orders can be approved');
      }

      await tx.user.update({
        where: { id: order.userId },
        data: { status: 'ACTIVE' },
      });

      await tx.payment.create({
        data: {
          userId: order.userId,
          amountCents: order.amountCents,
          currency: order.currency,
          status: 'SUCCEEDED',
          provider: manualPaidPilotPaymentProvider,
          providerRef: order.id,
          metadata: {
            activationOrderId: order.id,
            operationInvoiceUrl: operationUrl,
          },
        },
      });

      await tx.subscription.create({
        data: {
          childProfileId: childProfileId,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: startAt,
          currentPeriodEnd: endAt,
          providerRef: order.id,
          sourceOrderId: order.id,
          activationPackageId: activationPackage?.id ?? null,
          entitlementSnapshotJson: toPrismaJson(subscriptionSnapshot),
        },
      });

      await tx.walletLedgerEntry.create({
        data: {
          userId: order.userId,
          type: 'CREDIT',
          amountCents: order.amountCents,
          currency: order.currency,
          reason: 'Manual activation payment approved',
          referenceType: 'ActivationOrder',
          referenceId: order.id,
        },
      });

      await this.createCommissionEntries(
        tx,
        order,
        refundWindowEndsAt,
        commissionAttribution,
        commissionChain,
      );

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'APPROVED',
          action: 'APPROVE',
          actorUserId,
          reason: dto.reviewNotes ?? null,
          metadataJson: toIdempotencyJson({
            durationDays: dto.durationDays,
            expiresAt: endAt.toISOString(),
            refundWindowDays: manualPaidPilotPolicy.refundWindowDays,
            refundWindowEndsAt: manualPaidPilotPolicy.refundWindowEndsAt,
            commissionReleaseGate: manualPaidPilotPolicy.commissionReleaseGate,
            subscriptionOwnership: manualPaidPilotPolicy.subscriptionOwnership,
            childAllocation: manualPaidPilotPolicy.childAllocation,
            policyVersion: manualPaidPilotPolicy.policyVersion,
            liveMoneyHardStops: manualPaidPilotPolicy.liveMoneyHardStops,
            manualPaidPilotChildAllocationGate: childAllocationGate,
            operationInvoiceStorageKey: `invoices/${operationInvoice.filename}`,
            childProfileId,
          }),
        },
      });

      const approvedOrder = await tx.activationOrder.findUniqueOrThrow({
        where: { id: order.id },
        include: this.orderInclude(),
      });

      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.update({
          where: {
            scope_key: {
              scope: idempotencyScope,
              key: normalizedIdempotencyKey,
            },
          },
          data: {
            status: 'SUCCEEDED',
            resourceId: order.id,
            responseJson: toIdempotencyJson(approvedOrder),
          },
        });
      }

      return approvedOrder;
    };

    const approved = await this.prisma.$transaction(async (tx) => {
      return approveInTransaction(tx);
    });
    const approvedExpiresAt = approved.expiresAt
      ? new Date(approved.expiresAt)
      : null;

    await this.audit(user, 'activation_order.approve', order.id, {
      durationDays: dto.durationDays,
      expiresAt: approvedExpiresAt?.toISOString() ?? null,
    });

    void this.notification.sendOrderApproved({
      to: order.user.email,
      packageName: order.packageName,
      amountCents: order.amountCents,
      currency: order.currency,
      expiresAt: approvedExpiresAt,
    });

    return approved;
  }

  async rejectOrder(
    orderId: string,
    dto: RejectActivationOrderDto,
    user: AuthenticatedUser,
  ) {
    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    if (!['WAITING_PAYMENT', 'PENDING_REVIEW'].includes(order.status)) {
      throw new BadRequestException(
        'Only waiting or pending orders can be rejected',
      );
    }

    const actorUserId = this.dbUserId(user);
    const rejected = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.activationOrder.updateMany({
        where: {
          id: orderId,
          status: { in: ['WAITING_PAYMENT', 'PENDING_REVIEW'] },
        },
        data: {
          status: 'REJECTED',
          reviewedById: actorUserId,
          reviewNotes: dto.reviewNotes,
        },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'Only waiting or pending orders can be rejected',
        );
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'REJECTED',
          action: 'REJECT',
          actorUserId: actorUserId ?? null,
          reason: dto.reviewNotes ?? null,
          metadataJson: toIdempotencyJson({
            previousStatus: order.status,
          }),
        },
      });

      return tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: this.orderInclude(),
      });
    });
    await this.audit(user, 'activation_order.reject', orderId);

    void this.notification.sendOrderRejected({
      to: rejected.customerEmail,
      packageName: rejected.packageName,
      amountCents: rejected.amountCents,
      currency: rejected.currency,
      reviewNotes: rejected.reviewNotes,
    });

    return rejected;
  }

  async requestManualRefund(
    orderId: string,
    dto: ManualRefundRequestDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = this.dbUserId(user);
    const idempotencyScope = `activation-order:manual-refund-open:${orderId}`;
    const requestHash = buildRequestHash({
      action: manualRefundRequestOpenedAction,
      actorUserId,
      dto,
      orderId,
    });

    if (normalizedIdempotencyKey) {
      const existing = await this.prisma.idempotencyRecord.findUnique({
        where: {
          scope_key: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
          },
        },
      });
      const replay = resolveExistingIdempotencyRecord<Record<string, unknown>>(
        existing,
        requestHash,
      );
      if (replay.replayed) {
        return replay.response;
      }
    }

    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        trialEndsAt: true,
        amountCents: true,
        currency: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    if (order.status !== 'APPROVED') {
      throw new BadRequestException(
        'Manual refunds can only be requested for approved orders',
      );
    }

    const now = new Date();
    if (!this.isInsideManualRefundWindow(order.trialEndsAt, now)) {
      throw new BadRequestException(
        `Manual refund request is outside the ${MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS}-day refund window`,
      );
    }
    await this.assertManualRefundSucceededPaymentExists(orderId);
    const manualPaidPilotPolicy = this.manualPaidPilotPolicyMetadata(
      order.trialEndsAt,
    );

    const refundState = await this.manualRefundRequestState(orderId);
    if (refundState.status === 'OPEN') {
      throw new BadRequestException('Manual refund request is already open');
    }

    const historyData = {
      orderId,
      fromStatus: order.status,
      toStatus: order.status,
      action: manualRefundRequestOpenedAction,
      actorUserId: actorUserId ?? null,
      reason: dto.requestReason?.trim() || null,
      metadataJson: toIdempotencyJson({
        requestStatus: 'OPEN',
        requestedAt: now.toISOString(),
        refundWindowDays: manualPaidPilotPolicy.refundWindowDays,
        refundWindowEndsAt: manualPaidPilotPolicy.refundWindowEndsAt,
        subscriptionOwnership: manualPaidPilotPolicy.subscriptionOwnership,
        childAllocation: manualPaidPilotPolicy.childAllocation,
        policyVersion: manualPaidPilotPolicy.policyVersion,
        commissionReleaseGate: 'HELD_UNTIL_REQUEST_RESOLVED',
        providerRefundExecution: 'BLOCKED_MANUAL_OFFLINE_ONLY',
        productionReady: false,
        liveMoneyHardStops: this.manualPaidPilotHardStops(),
      }),
    };

    const createOpenRefundResponse = (historyId: string) => ({
      orderId,
      refundRequestStatus: 'OPEN',
      historyId,
      refundWindowEndsAt: order.trialEndsAt,
      providerRefundMutationUsed: false,
      productionReady: false,
    });

    const { history, response } = normalizedIdempotencyKey
      ? await this.prisma.$transaction(async (tx) => {
          await tx.idempotencyRecord.create({
            data: {
              scope: idempotencyScope,
              key: normalizedIdempotencyKey,
              actorUserId,
              resourceType: 'ActivationOrder',
              resourceId: orderId,
              requestHash,
              status: 'IN_PROGRESS',
              expiresAt: addIdempotencyDays(new Date(), 30),
            },
          });

          const createdHistory = await tx.orderStatusHistory.create({
            data: historyData,
          });
          const createdResponse = createOpenRefundResponse(createdHistory.id);

          await tx.idempotencyRecord.update({
            where: {
              scope_key: {
                scope: idempotencyScope,
                key: normalizedIdempotencyKey,
              },
            },
            data: {
              status: 'SUCCEEDED',
              resourceId: orderId,
              responseJson: toIdempotencyJson(createdResponse),
            },
          });

          return { history: createdHistory, response: createdResponse };
        })
      : {
          history: await this.prisma.orderStatusHistory.create({
            data: historyData,
          }),
          response: undefined,
        };

    const openedResponse = response ?? createOpenRefundResponse(history.id);

    await this.audit(
      user,
      'activation_order.manual_refund_request.open',
      orderId,
      {
        requestStatus: 'OPEN',
        historyId: history.id,
        providerRefundExecution: 'BLOCKED_MANUAL_OFFLINE_ONLY',
      },
    );

    return openedResponse;
  }

  async reviewManualRefundRequest(
    orderId: string,
    dto: ReviewManualRefundRequestDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = this.dbUserId(user);
    const idempotencyScope = `activation-order:manual-refund-review:${orderId}`;
    const requestHash = buildRequestHash({
      action: 'MANUAL_REFUND_REQUEST_REVIEW',
      actorUserId,
      dto,
      orderId,
    });

    if (normalizedIdempotencyKey) {
      const existing = await this.prisma.idempotencyRecord.findUnique({
        where: {
          scope_key: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
          },
        },
      });
      const replay = resolveExistingIdempotencyRecord<Record<string, unknown>>(
        existing,
        requestHash,
      );
      if (replay.replayed) {
        return replay.response;
      }
    }

    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
      include: { commissionEarnings: true },
    });

    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    if (order.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved orders can have manual refund requests reviewed',
      );
    }

    const refundState = await this.manualRefundRequestState(orderId);
    if (refundState.status !== 'OPEN') {
      throw new BadRequestException('No open manual refund request found');
    }

    const now = new Date();
    const reviewNotes = dto.reviewNotes?.trim() || null;
    const manualPaidPilotPolicy = this.manualPaidPilotPolicyMetadata(
      order.trialEndsAt,
    );

    if (dto.decision === 'REJECT') {
      const historyData = {
        orderId,
        fromStatus: order.status,
        toStatus: order.status,
        action: manualRefundRequestRejectedAction,
        actorUserId: actorUserId ?? null,
        reason: reviewNotes,
        metadataJson: toIdempotencyJson({
          requestStatus: 'REJECTED',
          reviewedAt: now.toISOString(),
          requestHistoryId: refundState.historyId,
          refundWindowDays: manualPaidPilotPolicy.refundWindowDays,
          refundWindowEndsAt: manualPaidPilotPolicy.refundWindowEndsAt,
          subscriptionOwnership: manualPaidPilotPolicy.subscriptionOwnership,
          childAllocation: manualPaidPilotPolicy.childAllocation,
          policyVersion: manualPaidPilotPolicy.policyVersion,
          commissionReleaseGate: 'REFUND_REQUEST_RESOLVED',
          providerRefundExecution: 'NOT_RUN',
          productionReady: false,
          liveMoneyHardStops: this.manualPaidPilotHardStops(),
        }),
      };
      const createRejectedResponse = (historyId: string) => ({
        orderId,
        refundRequestStatus: 'REJECTED',
        historyId,
        requestHistoryId: refundState.historyId,
        providerRefundMutationUsed: false,
        productionReady: false,
      });

      const { history, response } = normalizedIdempotencyKey
        ? await this.prisma.$transaction(async (tx) => {
            await tx.idempotencyRecord.create({
              data: {
                scope: idempotencyScope,
                key: normalizedIdempotencyKey,
                actorUserId,
                resourceType: 'ActivationOrder',
                resourceId: orderId,
                requestHash,
                status: 'IN_PROGRESS',
                expiresAt: addIdempotencyDays(new Date(), 30),
              },
            });

            const createdHistory = await tx.orderStatusHistory.create({
              data: historyData,
            });
            const createdResponse = createRejectedResponse(createdHistory.id);

            await tx.idempotencyRecord.update({
              where: {
                scope_key: {
                  scope: idempotencyScope,
                  key: normalizedIdempotencyKey,
                },
              },
              data: {
                status: 'SUCCEEDED',
                resourceId: orderId,
                responseJson: toIdempotencyJson(createdResponse),
              },
            });

            return { history: createdHistory, response: createdResponse };
          })
        : {
            history: await this.prisma.orderStatusHistory.create({
              data: historyData,
            }),
            response: undefined,
          };

      const rejectedResponse = response ?? createRejectedResponse(history.id);

      await this.audit(
        user,
        'activation_order.manual_refund_request.reject',
        orderId,
        {
          requestStatus: 'REJECTED',
          historyId: history.id,
          requestHistoryId: refundState.historyId,
          providerRefundExecution: 'NOT_RUN',
        },
      );

      return rejectedResponse;
    }

    await this.assertManualRefundSucceededPaymentExists(orderId);

    const approvedResponse = await this.prisma.$transaction(async (tx) => {
      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.create({
          data: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
            actorUserId,
            resourceType: 'ActivationOrder',
            resourceId: orderId,
            requestHash,
            status: 'IN_PROGRESS',
            expiresAt: addIdempotencyDays(new Date(), 30),
          },
        });
      }

      const claimed = await tx.activationOrder.updateMany({
        where: { id: orderId, status: 'APPROVED' },
        data: {
          status: 'REVOKED',
          revokedById: actorUserId,
          revokedAt: now,
          revokeReason: reviewNotes ?? 'Manual refund request approved',
        },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'Only approved orders can have manual refund requests reviewed',
        );
      }

      const commissionIds = order.commissionEarnings
        .filter((e) => e.status !== 'CANCELED')
        .map((e) => e.id);
      const availableEarnings = order.commissionEarnings.filter(
        (e) => e.status === 'AVAILABLE',
      );

      if (commissionIds.length > 0) {
        await tx.commissionEarning.updateMany({
          where: { id: { in: commissionIds } },
          data: { status: 'CANCELED' },
        });
        for (const earning of availableEarnings) {
          await tx.commissionLedgerEntry.create({
            data: {
              participantId: earning.participantId,
              beneficiaryUserId: earning.beneficiaryUserId,
              beneficiaryAgencyId: earning.beneficiaryAgencyId,
              type: 'DEBIT',
              amountCents: earning.amountCents,
              currency: earning.currency,
              reason: `Commission reversed: manual refund approved for order ${orderId}`,
              referenceType: 'CommissionEarning',
              referenceId: earning.id,
            },
          });
        }
      }

      const subscriptionUpdate = await tx.subscription.updateMany({
        where: {
          ...(order.childProfileId
            ? { childProfileId: order.childProfileId }
            : {}),
          OR: [{ sourceOrderId: orderId }, { providerRef: orderId }],
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
        data: {
          status: 'CANCELED',
          cancelAtPeriodEnd: false,
          currentPeriodEnd: now,
        },
      });

      const paymentUpdate = await tx.payment.updateMany({
        where: {
          providerRef: orderId,
          provider: manualPaidPilotPaymentProvider,
          status: 'SUCCEEDED',
        },
        data: {
          status: 'REFUNDED',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'REVOKED',
          action: manualRefundRequestApprovedAction,
          actorUserId: actorUserId ?? null,
          reason: reviewNotes,
          metadataJson: toIdempotencyJson({
            requestStatus: 'APPROVED',
            reviewedAt: now.toISOString(),
            requestHistoryId: refundState.historyId,
            refundWindowDays: manualPaidPilotPolicy.refundWindowDays,
            refundWindowEndsAt: manualPaidPilotPolicy.refundWindowEndsAt,
            subscriptionOwnership: manualPaidPilotPolicy.subscriptionOwnership,
            childAllocation: manualPaidPilotPolicy.childAllocation,
            policyVersion: manualPaidPilotPolicy.policyVersion,
            refundedPaymentCount: paymentUpdate.count,
            canceledCommissionCount: commissionIds.length,
            reversedCommissionCount: availableEarnings.length,
            canceledSubscriptionCount: subscriptionUpdate.count,
            entitlementAccess: 'REVOKED_BY_MANUAL_REFUND',
            commissionReleaseGate: 'REFUND_APPROVAL_CANCELED_EARNINGS',
            providerRefundExecution: 'BLOCKED_MANUAL_OFFLINE_ONLY',
            providerRefundMutationUsed: false,
            productionReady: false,
            liveMoneyHardStops: this.manualPaidPilotHardStops(),
          }),
        },
      });

      const approved = await tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: this.orderInclude(),
      });

      const response = {
        order: approved,
        refundRequestStatus: 'APPROVED',
        requestHistoryId: refundState.historyId,
        providerRefundMutationUsed: false,
        productionReady: false,
      };

      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.update({
          where: {
            scope_key: {
              scope: idempotencyScope,
              key: normalizedIdempotencyKey,
            },
          },
          data: {
            status: 'SUCCEEDED',
            resourceId: orderId,
            responseJson: toIdempotencyJson(response),
          },
        });
      }

      return response;
    });

    await this.audit(
      user,
      'activation_order.manual_refund_request.approve',
      orderId,
      {
        requestStatus: 'APPROVED',
        requestHistoryId: refundState.historyId,
        providerRefundExecution: 'BLOCKED_MANUAL_OFFLINE_ONLY',
        providerRefundMutationUsed: false,
      },
    );

    return approvedResponse;
  }

  async revokeOrder(
    orderId: string,
    dto: RevokeActivationOrderDto,
    user: AuthenticatedUser,
  ) {
    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
      include: { commissionEarnings: true },
    });

    if (!order) {
      throw new NotFoundException('Activation order not found');
    }

    if (order.status !== 'APPROVED') {
      throw new BadRequestException('Only approved orders can be revoked');
    }

    const now = new Date();
    const actorUserId = this.dbUserId(user);
    const revokeReason = dto.revokeReason?.trim() || null;
    const manualPaidPilotPolicy = this.manualPaidPilotPolicyMetadata(
      order.trialEndsAt,
    );
    const revoked = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.activationOrder.updateMany({
        where: { id: orderId, status: 'APPROVED' },
        data: {
          status: 'REVOKED',
          revokedById: actorUserId,
          revokedAt: now,
          revokeReason,
        },
      });
      if (claimed.count === 0) {
        throw new BadRequestException('Only approved orders can be revoked');
      }

      // Cancel commissions earned from this order
      const commissionIds = order.commissionEarnings
        .filter((e) => e.status !== 'CANCELED')
        .map((e) => e.id);
      const availableEarnings = order.commissionEarnings.filter(
        (e) => e.status === 'AVAILABLE',
      );

      if (commissionIds.length > 0) {
        await tx.commissionEarning.updateMany({
          where: { id: { in: commissionIds } },
          data: { status: 'CANCELED' },
        });
        // Reverse ledger entries
        for (const earning of availableEarnings) {
          await tx.commissionLedgerEntry.create({
            data: {
              participantId: earning.participantId,
              beneficiaryUserId: earning.beneficiaryUserId,
              beneficiaryAgencyId: earning.beneficiaryAgencyId,
              type: 'DEBIT',
              amountCents: earning.amountCents,
              currency: earning.currency,
              reason: `Commission reversed: order ${orderId} revoked`,
              referenceType: 'CommissionEarning',
              referenceId: earning.id,
            },
          });
        }
      }

      // Cancel the active subscription created for this order
      const subscriptionUpdate = await tx.subscription.updateMany({
        where: {
          ...(order.childProfileId
            ? { childProfileId: order.childProfileId }
            : {}),
          OR: [{ sourceOrderId: orderId }, { providerRef: orderId }],
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
        data: {
          status: 'CANCELED',
          cancelAtPeriodEnd: false,
          currentPeriodEnd: now,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'REVOKED',
          action: 'REVOKE',
          actorUserId: actorUserId ?? null,
          reason: revokeReason,
          metadataJson: toIdempotencyJson({
            refundWindowDays: manualPaidPilotPolicy.refundWindowDays,
            refundWindowEndsAt: manualPaidPilotPolicy.refundWindowEndsAt,
            subscriptionOwnership: manualPaidPilotPolicy.subscriptionOwnership,
            childAllocation: manualPaidPilotPolicy.childAllocation,
            policyVersion: manualPaidPilotPolicy.policyVersion,
            canceledCommissionCount: commissionIds.length,
            reversedCommissionCount: availableEarnings.length,
            canceledSubscriptionCount: subscriptionUpdate.count,
            revokeReasonPresent: Boolean(revokeReason),
            entitlementAccess: 'REVOKED_BY_MANUAL_REVOCATION',
            commissionReleaseGate: 'REVOKE_CANCELED_EARNINGS',
            providerRefundExecution: 'NOT_RUN',
            providerRefundMutationUsed: false,
            productionReady: false,
            liveMoneyHardStops: manualPaidPilotPolicy.liveMoneyHardStops,
          }),
        },
      });

      return tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: this.orderInclude(),
      });
    });

    await this.audit(user, 'activation_order.revoke', orderId, {
      revokeReason: dto.revokeReason,
    });

    void this.notification.sendOrderRevoked({
      to: revoked.customerEmail,
      packageName: revoked.packageName,
      amountCents: revoked.amountCents,
      currency: revoked.currency,
      revokeReason: revoked.revokeReason,
    });

    return revoked;
  }

  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const special = '@#!';
    const random = randomBytes(10);
    let pw = '';
    for (let i = 0; i < 10; i++) {
      pw += chars[random[i] % chars.length];
    }
    pw += special[randomBytes(1)[0] % special.length];
    pw += (randomBytes(1)[0] % 9) + 1;
    return pw;
  }

  private async upsertParentAccount(
    args: { password?: string },
    email: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (existing) {
      const roleNames = existing.roles.map((item) => item.role.name);
      const isParent = roleNames.some((role) =>
        ['STUDENT', 'PARENT'].includes(role),
      );
      if (!isParent) {
        throw new BadRequestException(
          'This email belongs to an internal account',
        );
      }
      // Ensure PARENT role is assigned
      const hasParentRole = roleNames.includes('PARENT');
      if (!hasParentRole) {
        const parentRole = await this.prisma.role.upsert({
          where: { name: 'PARENT' },
          update: {},
          create: { name: 'PARENT', description: 'Parent account' },
        });
        await this.prisma.userRole.upsert({
          where: {
            userId_roleId: { userId: existing.id, roleId: parentRole.id },
          },
          update: {},
          create: { userId: existing.id, roleId: parentRole.id },
        });
      }
      return existing;
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: this.hashPassword(
          args.password ?? this.generateSecurePassword(),
        ),
        status: 'ACTIVE',
        profile: {
          create: {
            displayName: email.split('@')[0],
          },
        },
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'PARENT' },
                create: {
                  name: 'PARENT',
                  description: 'Parent account',
                },
              },
            },
          },
        },
      },
    });
  }

  private async upsertLearnerAccount(
    args: { displayName?: string; password?: string },
    email: string,
    options: { allowExistingPasswordReset: boolean } = {
      allowExistingPasswordReset: true,
    },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (existing) {
      const roleNames = existing.roles.map((item) => item.role.name);
      const isLearner = roleNames.some((role) =>
        ['STUDENT', 'PARENT'].includes(role),
      );
      if (!isLearner) {
        throw new BadRequestException(
          'This email belongs to an internal account',
        );
      }

      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          ...(options.allowExistingPasswordReset && args.password
            ? { passwordHash: this.hashPassword(args.password) }
            : {}),
          profile: {
            upsert: {
              update: {
                ...(args.displayName ? { displayName: args.displayName } : {}),
              },
              create: {
                displayName: args.displayName,
              },
            },
          },
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: this.hashPassword(
          args.password ?? this.generateSecurePassword(),
        ),
        status: 'SUSPENDED',
        profile: {
          create: {
            displayName: args.displayName,
          },
        },
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'STUDENT' },
                create: {
                  name: 'STUDENT',
                  description: 'Learner account',
                },
              },
            },
          },
        },
      },
    });
  }

  private ensureManualPlan() {
    return this.prisma.plan.upsert({
      where: { code: 'manual-access' },
      update: {
        name: 'Manual access package',
        description:
          'Duration is controlled by operations when payment is approved.',
        priceCents: 0,
        currency: 'VND',
        billingCycle: 'YEARLY',
        isActive: true,
      },
      create: {
        code: 'manual-access',
        name: 'Manual access package',
        description:
          'Duration is controlled by operations when payment is approved.',
        priceCents: 0,
        currency: 'VND',
        billingCycle: 'YEARLY',
        isActive: true,
      },
    });
  }

  private findPackageForSnapshotByCode(code: string) {
    return this.prisma.activationPackage.findUnique({
      where: { code },
      include: {
        entitlements: {
          where: { status: 'ACTIVE' },
          orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  private orderInclude() {
    return {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
      reviewedBy: {
        select: {
          id: true,
          email: true,
        },
      },
      agency: {
        select: {
          id: true,
          code: true,
          name: true,
          defaultRateBps: true,
        },
      },
      channelParticipant: {
        select: {
          id: true,
          type: true,
          code: true,
          displayName: true,
          baseSalaryCents: true,
          commissionRateBps: true,
        },
      },
      referrerMember: {
        select: {
          id: true,
          role: true,
          referralCode: true,
          rateBps: true,
          user: {
            select: {
              email: true,
              profile: { select: { displayName: true } },
            },
          },
        },
      },
      commissionEarnings: {
        orderBy: { createdAt: 'desc' },
      },
    } satisfies Prisma.ActivationOrderInclude;
  }

  private async orderVisibilityWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.ActivationOrderWhereInput> {
    const canSeeAll = user.roles.some((role) =>
      ['ADMIN', 'OPERATIONS'].includes(role),
    );
    if (canSeeAll) {
      return {};
    }

    const userId = this.dbUserId(user);
    const actorParticipant = await this.actorChannelParticipant(user);
    if (actorParticipant) {
      return {
        OR: [
          {
            channelParticipant: {
              is: {
                lineage: { startsWith: actorParticipant.lineage },
              },
            },
          },
          ...(userId ? [{ createdById: userId }] : []),
        ],
      } satisfies Prisma.ActivationOrderWhereInput;
    }

    return userId
      ? ({ createdById: userId } satisfies Prisma.ActivationOrderWhereInput)
      : ({ id: '__none__' } satisfies Prisma.ActivationOrderWhereInput);
  }

  private sanitizeHistoryMetadata(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeHistoryMetadata(item));
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (
        normalizedKey.includes('base64') ||
        normalizedKey.includes('blob') ||
        normalizedKey.includes('rawcontent') ||
        normalizedKey.includes('filecontent')
      ) {
        sanitized[key] = '[redacted]';
        continue;
      }

      if (
        typeof entry === 'string' &&
        (normalizedKey.endsWith('storagekey') || normalizedKey.endsWith('url'))
      ) {
        sanitized[key] = this.safeHistoryFileReference(entry);
        continue;
      }

      sanitized[key] = this.sanitizeHistoryMetadata(entry);
    }

    return sanitized;
  }

  private safeHistoryFileReference(value: string) {
    const fileName = value.split(/[\\/]/).filter(Boolean).pop();
    return fileName || '[redacted]';
  }

  private dbUserId(user: AuthenticatedUser) {
    return user.sub.startsWith('demo-') ? undefined : user.sub;
  }

  private async isAgencyManagerForOrder(
    agencyId: string | null | undefined,
    user: AuthenticatedUser,
  ) {
    const userId = this.dbUserId(user);
    if (
      !agencyId ||
      !userId ||
      !user.roles.some((role) =>
        ['AGENCY_OWNER', 'AGENCY_MANAGER'].includes(role),
      )
    ) {
      return false;
    }

    const membership = await this.prisma.agencyMember.findFirst({
      where: {
        agencyId,
        userId,
        isActive: true,
        role: { in: ['OWNER', 'MANAGER'] },
      },
      select: { id: true },
    });

    return Boolean(membership);
  }

  private async resolveChannelAttribution(
    code?: string,
    user?: AuthenticatedUser,
  ) {
    const normalizedCode = code ? this.normalizeCode(code) : undefined;
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

    const userId = user ? this.dbUserId(user) : undefined;
    if (!user || !userId) {
      return { agency: null, member: null, participant: null };
    }

    const participant = await this.actorChannelParticipant(user);
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

  private async resolveAffiliateClickAttribution(
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
    if (!this.isAffiliateClickIdShape(normalizedClickId)) {
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
    const attributionWindowDays = this.affiliateAttributionWindowDays();
    if (
      event.createdAt.getTime() <
      now.getTime() - attributionWindowDays * 24 * 60 * 60 * 1000
    ) {
      throw new BadRequestException('Affiliate click id is expired');
    }

    if (!this.isAffiliateClickEventUsable(event, now)) {
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
      snapshot: this.buildAffiliateAttributionSnapshot(
        event,
        now,
        attributionWindowDays,
      ),
    };
  }

  private isAffiliateClickEventUsable(
    event: Prisma.AffiliateClickEventGetPayload<{
      include: {
        affiliateLink: true;
        participant: true;
        agency: true;
        agencyMember: true;
      };
    }>,
    now: Date,
  ) {
    if (
      event.affiliateLink.status !== 'ACTIVE' ||
      event.affiliateLink.participantId !== event.participantId ||
      event.participant.status !== 'ACTIVE'
    ) {
      return false;
    }

    if (
      event.affiliateLink.startsAt &&
      event.affiliateLink.startsAt.getTime() > now.getTime()
    ) {
      return false;
    }

    if (
      event.affiliateLink.expiresAt &&
      event.affiliateLink.expiresAt.getTime() <= now.getTime()
    ) {
      return false;
    }

    if (event.agency && event.agency.status !== 'ACTIVE') {
      return false;
    }

    if (event.agencyMember && !event.agencyMember.isActive) {
      return false;
    }

    return true;
  }

  private buildAffiliateAttributionSnapshot(
    event: Prisma.AffiliateClickEventGetPayload<{
      include: {
        affiliateLink: true;
        participant: true;
        agency: true;
        agencyMember: true;
      };
    }>,
    now: Date,
    attributionWindowDays: number,
  ): AffiliateAttributionSnapshot {
    return {
      source: 'affiliate_click',
      clickId: event.clickId,
      affiliateClickEventId: event.id,
      affiliateLinkId: event.affiliateLinkId,
      affiliateQrAssetId: event.affiliateQrAssetId ?? null,
      participantId: event.participantId,
      agencyId: event.agencyId ?? null,
      agencyMemberId: event.agencyMemberId ?? null,
      referralCode: event.referralCode ?? null,
      campaign: event.campaign ?? null,
      channel: event.channel ?? null,
      placement: event.placement ?? null,
      packageCode: event.packageCode ?? null,
      clickCreatedAt: event.createdAt.toISOString(),
      orderSnapshottedAt: now.toISOString(),
      attributionModel: 'explicit_click',
      matchConfidence: 'high',
      attributionWindowDays,
    };
  }

  private toAffiliateAttributionJson(snapshot: AffiliateAttributionSnapshot) {
    return snapshot as unknown as Prisma.InputJsonValue;
  }

  private toCommissionChainSnapshotJson(snapshot: CommissionChainSnapshot) {
    return snapshot as unknown as Prisma.InputJsonValue;
  }

  private isAffiliateClickIdShape(value: string) {
    return /^clk_[a-f0-9]{24}$/i.test(value);
  }

  private affiliateAttributionWindowDays() {
    const configured = Number(process.env.AFFILIATE_ATTRIBUTION_WINDOW_DAYS);
    if (Number.isFinite(configured) && configured >= 1 && configured <= 3660) {
      return Math.trunc(configured);
    }
    return 30;
  }

  private async buildCommissionChainSnapshot(
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
        this.buildCommissionChainSnapshotItem(
          current,
          depth,
          affiliateSnapshot,
        ),
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

  private buildCommissionChainSnapshotItem(
    participant: ResolvedChannelParticipant,
    depth: number,
    affiliateSnapshot: AffiliateAttributionSnapshot,
  ): CommissionChainSnapshotItem {
    const beneficiaryType = this.commissionBeneficiaryTypeForParticipant(
      participant.type,
    );
    const isRoot = depth === 0;
    return {
      depth,
      participantId: participant.id,
      beneficiaryType,
      beneficiaryId:
        beneficiaryType === 'AGENCY'
          ? (participant.agencyId ?? null)
          : (participant.userId ?? null),
      rateBps: this.commissionRateForDepth(depth),
      agencyId:
        participant.agencyId ?? (isRoot ? affiliateSnapshot.agencyId : null),
      agencyMemberId: isRoot ? affiliateSnapshot.agencyMemberId : null,
      parentParticipantId: participant.parentParticipantId ?? null,
    };
  }

  private resolveOrderCommissionAttribution(order: {
    channelParticipantId?: string | null;
    affiliateAttributionSnapshotJson?: Prisma.JsonValue | null;
  }): OrderCommissionAttribution {
    if (!order.affiliateAttributionSnapshotJson) {
      return {
        participantId: order.channelParticipantId ?? null,
        usesAffiliateSnapshot: false,
      };
    }

    const snapshot = this.parseCommissionAttributionSnapshot(
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

  private parseCommissionAttributionSnapshot(
    value: Prisma.JsonValue,
  ): CommissionAttributionSnapshot | null {
    if (!isJsonRecord(value) || value.source !== 'affiliate_click') {
      return null;
    }

    const participantId = requiredSnapshotString(value, 'participantId');
    const affiliateLinkId = requiredSnapshotString(value, 'affiliateLinkId');
    const clickId = requiredSnapshotString(value, 'clickId');
    const clickCreatedAt = requiredSnapshotString(value, 'clickCreatedAt');
    const orderSnapshottedAt = requiredSnapshotString(
      value,
      'orderSnapshottedAt',
    );

    if (
      !participantId ||
      !affiliateLinkId ||
      !clickId ||
      !clickCreatedAt ||
      !orderSnapshottedAt ||
      !this.isAffiliateClickIdShape(clickId) ||
      !isValidIsoDateString(clickCreatedAt) ||
      !isValidIsoDateString(orderSnapshottedAt)
    ) {
      return null;
    }

    const optionalFields = {
      agencyId: nullableSnapshotString(value, 'agencyId'),
      agencyMemberId: nullableSnapshotString(value, 'agencyMemberId'),
      referralCode: nullableSnapshotString(value, 'referralCode'),
      affiliateQrAssetId: nullableSnapshotString(value, 'affiliateQrAssetId'),
      campaign: nullableSnapshotString(value, 'campaign'),
      channel: nullableSnapshotString(value, 'channel'),
      placement: nullableSnapshotString(value, 'placement'),
      packageCode: nullableSnapshotString(value, 'packageCode'),
    };
    if (
      Object.values(optionalFields).some(
        (fieldValue) => fieldValue === undefined,
      )
    ) {
      return null;
    }

    return {
      source: 'affiliate_order_snapshot',
      participantId,
      agencyId: optionalFields.agencyId ?? null,
      agencyMemberId: optionalFields.agencyMemberId ?? null,
      referralCode: optionalFields.referralCode ?? null,
      affiliateLinkId,
      affiliateQrAssetId: optionalFields.affiliateQrAssetId ?? null,
      campaign: optionalFields.campaign ?? null,
      channel: optionalFields.channel ?? null,
      placement: optionalFields.placement ?? null,
      packageCode: optionalFields.packageCode ?? null,
      clickId,
      clickCreatedAt,
      orderSnapshottedAt,
    };
  }

  private resolveOrderCommissionChain(
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

    const snapshot = this.parseCommissionChainSnapshot(
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

  private parseCommissionChainSnapshot(
    value: Prisma.JsonValue,
  ): CommissionChainSnapshot | null {
    if (
      !isJsonRecord(value) ||
      value.source !== 'affiliate_order_snapshot' ||
      value.policyVersion !== 'commission_chain_v1'
    ) {
      return null;
    }

    const snapshottedAt = requiredSnapshotString(value, 'snapshottedAt');
    const rootParticipantId = requiredSnapshotString(
      value,
      'rootParticipantId',
    );
    if (
      !snapshottedAt ||
      !rootParticipantId ||
      !isValidIsoDateString(snapshottedAt) ||
      !Array.isArray(value.items) ||
      value.items.length === 0 ||
      value.items.length > 4
    ) {
      return null;
    }

    const items = value.items.map((item, index) =>
      this.parseCommissionChainSnapshotItem(item, index),
    );
    if (items.some((item) => !item)) {
      return null;
    }

    return {
      source: 'affiliate_order_snapshot',
      policyVersion: 'commission_chain_v1',
      snapshottedAt,
      rootParticipantId,
      items: items as CommissionChainSnapshotItem[],
    };
  }

  private parseCommissionChainSnapshotItem(
    value: unknown,
    index: number,
  ): CommissionChainSnapshotItem | null {
    if (!isJsonRecord(value)) {
      return null;
    }

    const depth = requiredSnapshotNumber(value, 'depth');
    const participantId = requiredSnapshotString(value, 'participantId');
    const beneficiaryId = nullableSnapshotString(value, 'beneficiaryId');
    const rateBps = requiredSnapshotNumber(value, 'rateBps');
    const agencyId = nullableSnapshotString(value, 'agencyId');
    const agencyMemberId = nullableSnapshotString(value, 'agencyMemberId');
    const parentParticipantId = nullableSnapshotString(
      value,
      'parentParticipantId',
    );
    const beneficiaryType = value.beneficiaryType;

    if (
      depth !== index ||
      !participantId ||
      (beneficiaryType !== 'SALE' && beneficiaryType !== 'AGENCY') ||
      beneficiaryId === undefined ||
      rateBps === null ||
      rateBps < 0 ||
      agencyId === undefined ||
      agencyMemberId === undefined ||
      parentParticipantId === undefined
    ) {
      return null;
    }

    return {
      depth,
      participantId,
      beneficiaryType,
      beneficiaryId,
      rateBps,
      agencyId,
      agencyMemberId,
      parentParticipantId,
    };
  }

  private async createCommissionEntries(
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
          attributionSnapshotJson: this.attributionSnapshotJsonForCommission(
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
        beneficiaryType: this.commissionBeneficiaryTypeForParticipant(
          node.type,
        ),
        beneficiaryUserId: node.type === 'AGENCY' ? undefined : node.userId,
        beneficiaryAgencyId: node.type === 'AGENCY' ? node.agencyId : undefined,
        baseAmountCents: order.amountCents,
        rateBps: this.commissionRateForDepth(depth),
        currency: order.currency,
        availableAt,
        depth,
        attributionSnapshotJson: this.attributionSnapshotJsonForCommission(
          attribution,
          chainResolution,
        ),
      });
    }
  }

  private attributionSnapshotJsonForCommission(
    attribution: OrderCommissionAttribution,
    chainResolution: OrderCommissionChainResolution,
  ) {
    if (!attribution.attributionSnapshotJson) {
      return undefined;
    }
    if (!chainResolution.legacyMissingAffiliateSnapshot) {
      return attribution.attributionSnapshotJson;
    }
    return {
      ...(attribution.attributionSnapshotJson as unknown as Record<
        string,
        unknown
      >),
      commissionChainSnapshotStatus: 'legacy_missing',
    } as Prisma.InputJsonValue;
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

      const latestManualRefundAction = this.latestManualRefundRequestAction(
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

  private async actorChannelParticipant(
    user: AuthenticatedUser,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const userId = this.dbUserId(user);
    if (!userId) {
      return null;
    }

    return tx.channelParticipant.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
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

  private commissionBeneficiaryTypeForParticipant(
    type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE',
  ): 'SALE' | 'AGENCY' {
    return type === 'AGENCY' ? 'AGENCY' : 'SALE';
  }

  private commissionRateForDepth(depth: number) {
    return Math.round(4000 * Math.pow(0.4, depth));
  }

  private fileIdempotencyMetadata(file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  private normalizeCode(value: string) {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, '-');
  }

  private bankTransferInfo() {
    return {
      bankName: process.env.BANK_TRANSFER_BANK_NAME ?? 'Configure bank name',
      accountNumber:
        process.env.BANK_TRANSFER_ACCOUNT_NUMBER ?? 'Configure account number',
      accountName:
        process.env.BANK_TRANSFER_ACCOUNT_NAME ?? 'MINH HUONG ENGLISH',
      notePrefix: process.env.BANK_TRANSFER_NOTE_PREFIX ?? 'MH',
    };
  }

  private async uniqueTransferContent() {
    const prefix = this.bankTransferInfo()
      .notePrefix.replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const value = `${prefix || 'MH'}${Date.now().toString(36).toUpperCase()}${randomUUID().slice(0, 4).toUpperCase()}`;
      const existing = await this.prisma.activationOrder.findFirst({
        where: { transferContent: value },
      });

      if (!existing) {
        return value;
      }
    }

    return `${prefix || 'MH'}${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  }

  private hashPassword(password: string): string {
    const salt = randomUUID();
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  private manualPaidPilotPolicyMetadata(
    refundWindowEndsAt: Date | null | undefined,
  ) {
    return {
      policyVersion: manualPaidPilotPolicyVersion,
      refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
      refundWindowEndsAt: refundWindowEndsAt?.toISOString() ?? null,
      commissionReleaseGate: 'AFTER_REFUND_WINDOW',
      subscriptionOwnership:
        'USER_ORDER_WITH_SINGLE_CHILD_SUBSCRIPTION_COMPATIBILITY',
      childAllocation:
        'APPROVAL_ALLOCATES_ENTITLEMENT_TO_RESOLVED_CHILD_PROFILE',
      liveMoneyHardStops: this.manualPaidPilotHardStops(),
    };
  }

  private assertManualPaidPilotSingleChildAllocation(
    snapshot: PackageEntitlementSnapshot,
  ) {
    const gate = this.manualPaidPilotChildAllocationGate(snapshot);

    if (!gate.childCountValid || gate.maxChildCount !== 1) {
      throw new BadRequestException(manualPaidPilotChildAllocationHardStop);
    }

    return gate;
  }

  private assertCurrentPackageSingleChildAllocationForLegacyApproval(input: {
    parsedOrderSnapshot: PackageEntitlementSnapshot | null;
    activationPackage: SnapshotActivationPackage | null;
    packageCode?: string | null;
    packageName?: string | null;
    amountCents: number;
    durationDays: number;
    capturedAt: Date;
  }) {
    if (input.parsedOrderSnapshot || !input.activationPackage) {
      return;
    }

    this.assertManualPaidPilotSingleChildAllocation(
      buildPackageEntitlementSnapshot({
        activationPackage: input.activationPackage,
        fallbackPackageCode: input.packageCode,
        fallbackPackageName: input.packageName,
        soldAmountVnd: Math.round(input.amountCents / 100),
        soldDurationDays: input.durationDays,
        capturedAt: input.capturedAt,
      }),
    );
  }

  private manualPaidPilotChildAllocationGate(
    snapshot: PackageEntitlementSnapshot,
  ) {
    const childCount = this.extractManualPaidPilotChildCount(snapshot);

    return {
      gate: 'SINGLE_CHILD_ONLY_UNTIL_USER_OWNED_SEAT_ALLOCATION',
      childCountSource: childCount.source,
      maxChildCount: childCount.value ?? 1,
      childCountValid: childCount.valid,
      userOwnedSeatAllocationImplemented: false,
      multiChildPaidPilotSupported: false,
    };
  }

  private extractManualPaidPilotChildCount(
    snapshot: PackageEntitlementSnapshot,
  ) {
    const childCountEntitlement = snapshot.entitlements.find(
      (item) => item.key === 'CHILD_COUNT',
    );

    if (!childCountEntitlement) {
      return {
        source: 'LEGACY_SINGLE_CHILD_DEFAULT',
        value: 1,
        valid: true,
      };
    }

    const value = this.readChildCountValue(childCountEntitlement.value);
    return {
      source: 'PACKAGE_ENTITLEMENT_CHILD_COUNT',
      value,
      valid: Number.isInteger(value) && value !== null && value >= 1,
    };
  }

  private readChildCountValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) {
      return value;
    }
    if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
      return Number(value);
    }
    if (this.isJsonRecord(value)) {
      for (const key of [
        'limit',
        'count',
        'max',
        'childCount',
        'maxChildren',
      ]) {
        const childCount = this.readChildCountValue(value[key]);
        if (childCount !== null) {
          return childCount;
        }
      }
    }

    return null;
  }

  private isJsonRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private manualPaidPilotHardStops() {
    return {
      paymentProviderMutationUsed: false,
      refundProviderMutationUsed: false,
      payoutMutationUsed: false,
      productionDbUsed: false,
      liveNotificationRequiredForPolicy: false,
    };
  }

  private isInsideManualRefundWindow(
    refundWindowEndsAt: Date | null | undefined,
    now: Date,
  ) {
    return Boolean(
      refundWindowEndsAt && now.getTime() <= refundWindowEndsAt.getTime(),
    );
  }

  private async assertManualRefundSucceededPaymentExists(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        providerRef: orderId,
        provider: manualPaidPilotPaymentProvider,
        status: 'SUCCEEDED',
      },
      select: { id: true },
    });

    if (!payment) {
      throw new BadRequestException(
        'Manual refund requires a succeeded manual payment for this order',
      );
    }
  }

  private async manualRefundRequestState(orderId: string) {
    const [latest] = await this.prisma.orderStatusHistory.findMany({
      where: { orderId, action: { in: [...manualRefundRequestActions] } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 1,
      select: {
        id: true,
        action: true,
        createdAt: true,
      },
    });

    if (!latest) {
      return { status: 'NONE' as const };
    }

    if (latest.action === manualRefundRequestOpenedAction) {
      return {
        status: 'OPEN' as const,
        historyId: latest.id,
        openedAt: latest.createdAt,
      };
    }

    if (latest.action === manualRefundRequestApprovedAction) {
      return {
        status: 'APPROVED' as const,
        historyId: latest.id,
        reviewedAt: latest.createdAt,
      };
    }

    return {
      status: 'REJECTED' as const,
      historyId: latest.id,
      reviewedAt: latest.createdAt,
    };
  }

  private latestManualRefundRequestAction(
    statusHistory: Array<{ action: string }>,
  ) {
    return statusHistory[0]?.action;
  }

  private async audit(
    user: AuthenticatedUser,
    action: string,
    orderId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          userId: this.dbUserId(user),
          action,
          entityType: 'ActivationOrder',
          entityId: orderId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }

  private async auditSystem(
    action: string,
    orderId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          action,
          entityType: 'ActivationOrder',
          entityId: orderId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }
}
