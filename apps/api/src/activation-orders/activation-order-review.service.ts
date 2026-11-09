import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
import {
  buildLegacyOrderEntitlementSnapshot,
  parsePackageEntitlementSnapshot,
  toPrismaJson,
} from '../package-entitlement/package-entitlement-snapshot';
import { RejectActivationOrderDto } from './dto/reject-activation-order.dto';
import { RevokeActivationOrderDto } from './dto/revoke-activation-order.dto';
import { ActivationOrderSupportService } from './activation-order-support.service';
import {
  MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
  addDays,
  assertCurrentPackageSingleChildAllocationForLegacyApproval,
  assertManualPaidPilotSingleChildAllocation,
  dbUserId,
  fileIdempotencyMetadata,
  invoiceUrl,
  manualPaidPilotPaymentProvider,
  manualPaidPilotPolicyMetadata,
  orderInclude,
} from './activation-order.helpers';
import { OrderCommissionService } from './order-commission.service';

/** Operations review: approve, reject and revoke orders. */
@Injectable()
export class ActivationOrderReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly activationOrderSupportService: ActivationOrderSupportService,
    private readonly orderCommissionService: OrderCommissionService,
  ) {}

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
    const actorUserId = dbUserId(user);
    const idempotencyScope = `activation-order:approve:${orderId}`;
    const requestHash = buildRequestHash({
      action: 'APPROVE',
      actorUserId,
      dto,
      operationInvoice: fileIdempotencyMetadata(operationInvoice),
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
      ? await this.activationOrderSupportService.findPackageForSnapshotByCode(
          order.packageCode,
        )
      : null;
    const parsedOrderSnapshot = parsePackageEntitlementSnapshot(
      order.entitlementSnapshotJson,
    );
    assertCurrentPackageSingleChildAllocationForLegacyApproval({
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
      assertManualPaidPilotSingleChildAllocation(subscriptionSnapshot);
    const plan = await this.activationOrderSupportService.ensureManualPlan();

    const refundWindowEndsAt = addDays(
      now,
      MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
    );
    const manualPaidPilotPolicy =
      manualPaidPilotPolicyMetadata(refundWindowEndsAt);
    const operationUrl = invoiceUrl(operationInvoice);

    const approveInTransaction = async (tx: Prisma.TransactionClient) => {
      const commissionAttribution =
        this.orderCommissionService.resolveOrderCommissionAttribution(order);
      const commissionChain =
        this.orderCommissionService.resolveOrderCommissionChain(
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
      const endAt = addDays(startAt, dto.durationDays);

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

      await this.orderCommissionService.createCommissionEntries(
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
        include: orderInclude(),
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

    await this.activationOrderSupportService.audit(
      user,
      'activation_order.approve',
      order.id,
      {
        durationDays: dto.durationDays,
        expiresAt: approvedExpiresAt?.toISOString() ?? null,
      },
    );

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

    const actorUserId = dbUserId(user);
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
        include: orderInclude(),
      });
    });
    await this.activationOrderSupportService.audit(
      user,
      'activation_order.reject',
      orderId,
    );

    void this.notification.sendOrderRejected({
      to: rejected.customerEmail,
      packageName: rejected.packageName,
      amountCents: rejected.amountCents,
      currency: rejected.currency,
      reviewNotes: rejected.reviewNotes,
    });

    return rejected;
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
    const actorUserId = dbUserId(user);
    const revokeReason = dto.revokeReason?.trim() || null;
    const manualPaidPilotPolicy = manualPaidPilotPolicyMetadata(
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
        include: orderInclude(),
      });
    });

    await this.activationOrderSupportService.audit(
      user,
      'activation_order.revoke',
      orderId,
      {
        revokeReason: dto.revokeReason,
      },
    );

    void this.notification.sendOrderRevoked({
      to: revoked.customerEmail,
      packageName: revoked.packageName,
      amountCents: revoked.amountCents,
      currency: revoked.currency,
      revokeReason: revoked.revokeReason,
    });

    return revoked;
  }
}
