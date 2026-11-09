import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { toIdempotencyJson } from '../commercial-idempotency';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivationOrderDto } from './dto/create-activation-order.dto';
import {
  buildPackageEntitlementSnapshot,
  toPrismaJson,
} from '../package-entitlement/package-entitlement-snapshot';
import { ListActivationOrdersQueryDto } from './dto/list-activation-orders-query.dto';
import { ResubmitActivationOrderDto } from './dto/resubmit-activation-order.dto';
import { sanitizeHistoryMetadata } from './activation-order-lifecycle.helpers';
import { ActivationOrderSupportService } from './activation-order-support.service';
import {
  assertManualPaidPilotSingleChildAllocation,
  dbUserId,
  generateSecurePassword,
  hashPassword,
  invoiceUrl,
  orderInclude,
  toAffiliateAttributionJson,
  toCommissionChainSnapshotJson,
} from './activation-order.helpers';
import { OrderCommissionService } from './order-commission.service';

/** Sale-side order lifecycle: list, history, customers, create, resubmit, cancel. */
@Injectable()
export class ActivationOrderLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderCommissionService: OrderCommissionService,
    private readonly activationOrderSupportService: ActivationOrderSupportService,
  ) {}

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
      include: orderInclude(),
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
        metadataJson: sanitizeHistoryMetadata(item.metadataJson),
      })),
    };
  }

  async listMyCustomers(user: AuthenticatedUser) {
    const userId = dbUserId(user);
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
    const creatorId = dbUserId(user);

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
      ? (dto.password ?? generateSecurePassword())
      : undefined;
    const generatedPassword =
      isNewAccount && !dto.password ? (newPassword ?? null) : null;
    const baseAttribution =
      await this.orderCommissionService.resolveChannelAttribution(
        dto.agencyCode,
        user,
      );
    const affiliateResolution =
      await this.orderCommissionService.resolveAffiliateClickAttribution(
        dto.affiliateClickId,
        baseAttribution,
      );
    const attribution = affiliateResolution.attribution;
    const commissionChainSnapshot =
      affiliateResolution.snapshot && attribution.participant
        ? await this.orderCommissionService.buildCommissionChainSnapshot(
            attribution.participant,
            affiliateResolution.snapshot,
          )
        : null;

    const activationPackage = dto.packageCode
      ? await this.activationOrderSupportService.findPackageForSnapshotByCode(
          dto.packageCode,
        )
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
      assertManualPaidPilotSingleChildAllocation(entitlementSnapshot);

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
              affiliateAttributionSnapshotJson: toAffiliateAttributionJson(
                affiliateResolution.snapshot,
              ),
              commissionChainSnapshotJson: toCommissionChainSnapshotJson(
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
      include: orderInclude(),
    });

    await this.activationOrderSupportService.audit(
      user,
      'activation_order.create',
      order.id,
      {
        customerEmail: email,
        amountCents: order.amountCents,
        isNewAccount,
      },
    );

    return { order, generatedPassword, isNewAccount };
  }

  async resubmitOrder(
    orderId: string,
    dto: ResubmitActivationOrderDto,
    saleInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
  ) {
    const userId = dbUserId(user);
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
        include: orderInclude(),
      });
    });

    await this.activationOrderSupportService.audit(
      user,
      'activation_order.resubmit',
      orderId,
    );
    return updated;
  }

  async cancelOrder(orderId: string, user: AuthenticatedUser) {
    const userId = dbUserId(user);
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
        include: orderInclude(),
      });
    });

    await this.activationOrderSupportService.audit(
      user,
      'activation_order.cancel',
      orderId,
    );
    return updated;
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
            ? { passwordHash: hashPassword(args.password) }
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
        passwordHash: hashPassword(args.password ?? generateSecurePassword()),
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

  private async orderVisibilityWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.ActivationOrderWhereInput> {
    const canSeeAll = user.roles.some((role) =>
      ['ADMIN', 'OPERATIONS'].includes(role),
    );
    if (canSeeAll) {
      return {};
    }

    const userId = dbUserId(user);
    const actorParticipant =
      await this.activationOrderSupportService.actorChannelParticipant(user);
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

  private async isAgencyManagerForOrder(
    agencyId: string | null | undefined,
    user: AuthenticatedUser,
  ) {
    const userId = dbUserId(user);
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
}
