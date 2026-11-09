import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  addDays as addIdempotencyDays,
  buildRequestHash,
  normalizeIdempotencyKey,
  resolveExistingIdempotencyRecord,
  toIdempotencyJson,
} from '../commercial-idempotency';
import { PrismaService } from '../prisma/prisma.service';
import {
  ManualRefundRequestDto,
  ReviewManualRefundRequestDto,
} from './dto/manual-refund-request.dto';
import { ActivationOrderSupportService } from './activation-order-support.service';
import {
  MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
  dbUserId,
  isInsideManualRefundWindow,
  manualPaidPilotHardStops,
  manualPaidPilotPaymentProvider,
  manualPaidPilotPolicyMetadata,
  manualRefundRequestActions,
  manualRefundRequestApprovedAction,
  manualRefundRequestOpenedAction,
  manualRefundRequestRejectedAction,
  orderInclude,
} from './activation-order.helpers';

/** Manual refund requests and their review. */
@Injectable()
export class ManualRefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activationOrderSupportService: ActivationOrderSupportService,
  ) {}

  async requestManualRefund(
    orderId: string,
    dto: ManualRefundRequestDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = dbUserId(user);
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
    if (!isInsideManualRefundWindow(order.trialEndsAt, now)) {
      throw new BadRequestException(
        `Manual refund request is outside the ${MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS}-day refund window`,
      );
    }
    await this.assertManualRefundSucceededPaymentExists(orderId);
    const manualPaidPilotPolicy = manualPaidPilotPolicyMetadata(
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
        liveMoneyHardStops: manualPaidPilotHardStops(),
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

    await this.activationOrderSupportService.audit(
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
    const actorUserId = dbUserId(user);
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
    const manualPaidPilotPolicy = manualPaidPilotPolicyMetadata(
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
          liveMoneyHardStops: manualPaidPilotHardStops(),
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

      await this.activationOrderSupportService.audit(
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
            liveMoneyHardStops: manualPaidPilotHardStops(),
          }),
        },
      });

      const approved = await tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: orderInclude(),
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

    await this.activationOrderSupportService.audit(
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
}
