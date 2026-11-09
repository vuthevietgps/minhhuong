import { BadRequestException, ConflictException } from '@nestjs/common';
import { MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS } from './activation-orders.service';
import {
  affiliateOrderSnapshot,
  commissionChainSnapshot,
  createService,
  opsUser,
  pendingApprovalOrder,
  proofFile,
} from './activation-orders.service.spec-fixtures';

describe('ActivationOrdersService P0 commercial flows (manual refunds)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the 10-day manual paid pilot refund window for commission release eligibility', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-14T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();
      const expectedRefundWindowEndsAt = new Date('2026-06-24T03:00:00.000Z');
      const approvalOrder = pendingApprovalOrder({
        affiliateAttributionSnapshotJson: affiliateOrderSnapshot(),
        commissionChainSnapshotJson: commissionChainSnapshot(),
      });

      prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
      prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
        ...approvalOrder,
        status: 'APPROVED',
      });

      await service.approveOrder(
        'order-1',
        { durationDays: 30, reviewNotes: 'manual pilot approved' },
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      );

      const approveUpdate =
        prisma.__tx.activationOrder.updateMany.mock.calls.find(
          ([arg]: any[]) => arg.data.status === 'APPROVED',
        )?.[0];
      expect(approveUpdate.data.trialEndsAt).toEqual(
        expectedRefundWindowEndsAt,
      );

      expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
            availableAt: expectedRefundWindowEndsAt,
          }),
        }),
      );

      expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'APPROVE',
            metadataJson: expect.objectContaining({
              refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
              refundWindowEndsAt: expectedRefundWindowEndsAt.toISOString(),
              commissionReleaseGate: 'AFTER_REFUND_WINDOW',
              subscriptionOwnership:
                'USER_ORDER_WITH_SINGLE_CHILD_SUBSCRIPTION_COMPATIBILITY',
              childAllocation:
                'APPROVAL_ALLOCATES_ENTITLEMENT_TO_RESOLVED_CHILD_PROFILE',
              policyVersion: 'manual_paid_pilot_refund_window_v1',
              liveMoneyHardStops: expect.objectContaining({
                paymentProviderMutationUsed: false,
                refundProviderMutationUsed: false,
                payoutMutationUsed: false,
                productionDbUsed: false,
              }),
            }),
          }),
        }),
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('records a fixture-only manual refund request inside the 10-day window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-16T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();
      const refundWindowEndsAt = new Date('2026-06-24T03:00:00.000Z');

      prisma.activationOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'APPROVED',
        trialEndsAt: refundWindowEndsAt,
        amountCents: 10000000,
        currency: 'VND',
      });

      const result = await service.requestManualRefund(
        'order-1',
        { requestReason: 'Parent requested refund during pilot' },
        opsUser as any,
      );

      expect(result).toEqual(
        expect.objectContaining({
          orderId: 'order-1',
          refundRequestStatus: 'OPEN',
          historyId: 'history-root-1',
          refundWindowEndsAt,
          providerRefundMutationUsed: false,
          productionReady: false,
        }),
      );
      expect(prisma.orderStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-1',
            fromStatus: 'APPROVED',
            toStatus: 'APPROVED',
            action: 'MANUAL_REFUND_REQUEST_OPENED',
            actorUserId: 'ops-1',
            reason: 'Parent requested refund during pilot',
            metadataJson: expect.objectContaining({
              requestStatus: 'OPEN',
              refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
              refundWindowEndsAt: refundWindowEndsAt.toISOString(),
              commissionReleaseGate: 'HELD_UNTIL_REQUEST_RESOLVED',
              providerRefundExecution: 'BLOCKED_MANUAL_OFFLINE_ONLY',
              productionReady: false,
              liveMoneyHardStops: expect.objectContaining({
                refundProviderMutationUsed: false,
                payoutMutationUsed: false,
                productionDbUsed: false,
              }),
            }),
          }),
        }),
      );
      expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.subscription.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.commissionEarning.updateMany).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('replays a manual refund request with the same idempotency key without duplicate history', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-16T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();
      const refundWindowEndsAt = new Date('2026-06-24T03:00:00.000Z');

      prisma.activationOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'APPROVED',
        trialEndsAt: refundWindowEndsAt,
        amountCents: 10000000,
        currency: 'VND',
      });
      prisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);

      const first = await service.requestManualRefund(
        'order-1',
        { requestReason: 'Parent requested refund during pilot' },
        opsUser as any,
        'refund-open-key-01',
      );

      const requestHash =
        prisma.__tx.idempotencyRecord.create.mock.calls[0][0].data.requestHash;
      prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
        requestHash,
        status: 'SUCCEEDED',
        responseJson: first,
        expiresAt: new Date('2099-01-01T00:00:00Z'),
      });

      const replayed = await service.requestManualRefund(
        'order-1',
        { requestReason: 'Parent requested refund during pilot' },
        opsUser as any,
        'refund-open-key-01',
      );

      expect(replayed).toEqual(first);
      expect(prisma.activationOrder.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.idempotencyRecord.update).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.subscription.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.commissionEarning.updateMany).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects manual refund request idempotency replay with a changed payload', async () => {
    const { prisma, service } = createService();

    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash: 'different-request-hash',
      status: 'SUCCEEDED',
      responseJson: { orderId: 'order-1', refundRequestStatus: 'OPEN' },
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    await expect(
      service.requestManualRefund(
        'order-1',
        { requestReason: 'Changed refund reason' } as any,
        opsUser as any,
        'refund-open-key-02',
      ),
    ).rejects.toThrow(ConflictException);

    expect(prisma.activationOrder.findUnique).not.toHaveBeenCalled();
    expect(prisma.orderStatusHistory.create).not.toHaveBeenCalled();
    expect(prisma.__tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('rejects manual refund requests after the 10-day window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-25T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();

      prisma.activationOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'APPROVED',
        trialEndsAt: new Date('2026-06-24T03:00:00.000Z'),
        amountCents: 10000000,
        currency: 'VND',
      });

      await expect(
        service.requestManualRefund(
          'order-1',
          { requestReason: 'Late request' } as any,
          opsUser as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.orderStatusHistory.create).not.toHaveBeenCalled();
      expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('blocks manual refund request without succeeded payment evidence before history or side effects', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-16T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();

      prisma.activationOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'APPROVED',
        trialEndsAt: new Date('2026-06-24T03:00:00.000Z'),
        amountCents: 10000000,
        currency: 'VND',
      });
      prisma.payment.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.requestManualRefund(
          'order-1',
          { requestReason: 'No payment proof to refund' } as any,
          opsUser as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: {
          providerRef: 'order-1',
          provider: 'manual_bank_transfer',
          status: 'SUCCEEDED',
        },
        select: { id: true },
      });
      expect(prisma.orderStatusHistory.findMany).not.toHaveBeenCalled();
      expect(prisma.orderStatusHistory.create).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.subscription.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.commissionEarning.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('blocks manual refund request when there is no manual bank transfer payment evidence', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-16T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();

      prisma.activationOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'APPROVED',
        trialEndsAt: new Date('2026-06-24T03:00:00.000Z'),
        amountCents: 10000000,
        currency: 'VND',
      });
      prisma.payment.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.requestManualRefund(
          'order-1',
          {
            requestReason: 'Provider payment must stay out of local refund',
          } as any,
          opsUser as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: {
          providerRef: 'order-1',
          provider: 'manual_bank_transfer',
          status: 'SUCCEEDED',
        },
        select: { id: true },
      });
      expect(prisma.orderStatusHistory.create).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.subscription.updateMany).not.toHaveBeenCalled();
      expect(prisma.__tx.commissionEarning.updateMany).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('replays approved manual refund review without duplicate revoke, refund, or clawback side effects', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-17T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();
      const approvedOrder = pendingApprovalOrder({
        status: 'APPROVED',
        commissionEarnings: [
          {
            id: 'earning-pending-1',
            status: 'PENDING',
            participantId: 'sale-node-1',
            beneficiaryUserId: 'sale-user-1',
            beneficiaryAgencyId: null,
            amountCents: 4000000,
            currency: 'VND',
          },
          {
            id: 'earning-available-1',
            status: 'AVAILABLE',
            participantId: 'sale-node-1',
            beneficiaryUserId: 'sale-user-1',
            beneficiaryAgencyId: null,
            amountCents: 4000000,
            currency: 'VND',
          },
        ],
      });
      const revokedResponse = { ...approvedOrder, status: 'REVOKED' };

      prisma.activationOrder.findUnique.mockResolvedValue(approvedOrder);
      prisma.orderStatusHistory.findMany.mockResolvedValue([
        {
          id: 'refund-request-1',
          action: 'MANUAL_REFUND_REQUEST_OPENED',
          createdAt: new Date('2026-06-16T03:00:00.000Z'),
        },
      ]);
      prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue(
        revokedResponse,
      );
      prisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);

      const first = await service.reviewManualRefundRequest(
        'order-1',
        { decision: 'APPROVE', reviewNotes: 'Valid 10-day refund' } as any,
        opsUser as any,
        'refund-review-key-01',
      );

      const requestHash =
        prisma.__tx.idempotencyRecord.create.mock.calls[0][0].data.requestHash;
      prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
        requestHash,
        status: 'SUCCEEDED',
        responseJson: first,
        expiresAt: new Date('2099-01-01T00:00:00Z'),
      });

      const replayed = await service.reviewManualRefundRequest(
        'order-1',
        { decision: 'APPROVE', reviewNotes: 'Valid 10-day refund' } as any,
        opsUser as any,
        'refund-review-key-01',
      );

      expect(replayed).toEqual(first);
      expect(prisma.activationOrder.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.payment.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.subscription.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.commissionEarning.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledTimes(1);
      expect(prisma.__tx.idempotencyRecord.update).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects manual refund review idempotency replay with a changed payload before side effects', async () => {
    const { prisma, service } = createService();

    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash: 'different-request-hash',
      status: 'SUCCEEDED',
      responseJson: { refundRequestStatus: 'APPROVED' },
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    await expect(
      service.reviewManualRefundRequest(
        'order-1',
        { decision: 'REJECT', reviewNotes: 'Changed decision' } as any,
        opsUser as any,
        'refund-review-key-02',
      ),
    ).rejects.toThrow(ConflictException);

    expect(prisma.activationOrder.findUnique).not.toHaveBeenCalled();
    expect(prisma.orderStatusHistory.findMany).not.toHaveBeenCalled();
    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
  });

  it('rejects an open manual refund request without refund or payout side effects', async () => {
    const { prisma, service } = createService();
    const approvedOrder = pendingApprovalOrder({
      status: 'APPROVED',
      commissionEarnings: [],
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvedOrder);
    prisma.orderStatusHistory.findMany.mockResolvedValue([
      {
        id: 'refund-request-1',
        action: 'MANUAL_REFUND_REQUEST_OPENED',
        createdAt: new Date('2026-06-16T03:00:00.000Z'),
      },
    ]);

    const result = await service.reviewManualRefundRequest(
      'order-1',
      { decision: 'REJECT', reviewNotes: 'No valid refund evidence' } as any,
      opsUser as any,
    );

    expect(result).toEqual(
      expect.objectContaining({
        orderId: 'order-1',
        refundRequestStatus: 'REJECTED',
        requestHistoryId: 'refund-request-1',
        providerRefundMutationUsed: false,
        productionReady: false,
      }),
    );
    expect(prisma.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'APPROVED',
          toStatus: 'APPROVED',
          action: 'MANUAL_REFUND_REQUEST_REJECTED',
          actorUserId: 'ops-1',
          reason: 'No valid refund evidence',
          metadataJson: expect.objectContaining({
            requestStatus: 'REJECTED',
            requestHistoryId: 'refund-request-1',
            commissionReleaseGate: 'REFUND_REQUEST_RESOLVED',
            providerRefundExecution: 'NOT_RUN',
            productionReady: false,
          }),
        }),
      }),
    );
    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('blocks approved manual refund review without succeeded payment evidence before revoke or clawback side effects', async () => {
    const { prisma, service } = createService();
    const approvedOrder = pendingApprovalOrder({
      status: 'APPROVED',
      commissionEarnings: [
        {
          id: 'earning-available-1',
          status: 'AVAILABLE',
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          beneficiaryAgencyId: null,
          amountCents: 4000000,
          currency: 'VND',
        },
      ],
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvedOrder);
    prisma.orderStatusHistory.findMany.mockResolvedValue([
      {
        id: 'refund-request-1',
        action: 'MANUAL_REFUND_REQUEST_OPENED',
        createdAt: new Date('2026-06-16T03:00:00.000Z'),
      },
    ]);
    prisma.payment.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.reviewManualRefundRequest(
        'order-1',
        { decision: 'APPROVE', reviewNotes: 'Missing payment evidence' } as any,
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.payment.findFirst).toHaveBeenCalledWith({
      where: {
        providerRef: 'order-1',
        provider: 'manual_bank_transfer',
        status: 'SUCCEEDED',
      },
      select: { id: true },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
    expect(prisma.__tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('approves a manual refund request by revoking access and clawing back commission locally', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-17T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();
      const approvedOrder = pendingApprovalOrder({
        status: 'APPROVED',
        commissionEarnings: [
          {
            id: 'earning-pending-1',
            status: 'PENDING',
            participantId: 'sale-node-1',
            beneficiaryUserId: 'sale-user-1',
            beneficiaryAgencyId: null,
            amountCents: 4000000,
            currency: 'VND',
          },
          {
            id: 'earning-available-1',
            status: 'AVAILABLE',
            participantId: 'sale-node-1',
            beneficiaryUserId: 'sale-user-1',
            beneficiaryAgencyId: null,
            amountCents: 4000000,
            currency: 'VND',
          },
        ],
      });

      prisma.activationOrder.findUnique.mockResolvedValue(approvedOrder);
      prisma.orderStatusHistory.findMany.mockResolvedValue([
        {
          id: 'refund-request-1',
          action: 'MANUAL_REFUND_REQUEST_OPENED',
          createdAt: new Date('2026-06-16T03:00:00.000Z'),
        },
      ]);
      prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
        ...approvedOrder,
        status: 'REVOKED',
      });

      const result = await service.reviewManualRefundRequest(
        'order-1',
        { decision: 'APPROVE', reviewNotes: 'Valid 10-day refund' } as any,
        opsUser as any,
      );

      expect(result).toEqual(
        expect.objectContaining({
          refundRequestStatus: 'APPROVED',
          requestHistoryId: 'refund-request-1',
          providerRefundMutationUsed: false,
          productionReady: false,
        }),
      );
      expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1', status: 'APPROVED' },
          data: expect.objectContaining({
            status: 'REVOKED',
            revokedById: 'ops-1',
            revokedAt: new Date('2026-06-17T03:00:00.000Z'),
            revokeReason: 'Valid 10-day refund',
          }),
        }),
      );
      expect(prisma.__tx.payment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            providerRef: 'order-1',
            provider: 'manual_bank_transfer',
            status: 'SUCCEEDED',
          },
          data: {
            status: 'REFUNDED',
          },
        }),
      );
      expect(prisma.__tx.subscription.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            childProfileId: 'child-1',
            OR: [{ sourceOrderId: 'order-1' }, { providerRef: 'order-1' }],
            status: { in: ['ACTIVE', 'TRIALING'] },
          }),
          data: expect.objectContaining({
            status: 'CANCELED',
            cancelAtPeriodEnd: false,
          }),
        }),
      );
      expect(prisma.__tx.commissionEarning.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: { in: ['earning-pending-1', 'earning-available-1'] },
          },
          data: { status: 'CANCELED' },
        }),
      );
      expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'DEBIT',
            reason:
              'Commission reversed: manual refund approved for order order-1',
            referenceId: 'earning-available-1',
          }),
        }),
      );
      expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-1',
            fromStatus: 'APPROVED',
            toStatus: 'REVOKED',
            action: 'MANUAL_REFUND_REQUEST_APPROVED',
            metadataJson: expect.objectContaining({
              requestStatus: 'APPROVED',
              requestHistoryId: 'refund-request-1',
              refundedPaymentCount: 1,
              canceledCommissionCount: 2,
              reversedCommissionCount: 1,
              canceledSubscriptionCount: 1,
              entitlementAccess: 'REVOKED_BY_MANUAL_REFUND',
              providerRefundExecution: 'BLOCKED_MANUAL_OFFLINE_ONLY',
              providerRefundMutationUsed: false,
              productionReady: false,
            }),
          }),
        }),
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('approves a buyer-owned manual refund by canceling the traced child subscription without a legacy child filter', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-18T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();
      const refundWindowEndsAt = new Date('2026-06-24T03:00:00.000Z');
      const approvedOrder = pendingApprovalOrder({
        id: 'order-user-owned-1',
        status: 'APPROVED',
        childProfileId: null,
        trialEndsAt: refundWindowEndsAt,
        commissionEarnings: [
          {
            id: 'earning-user-owned-available',
            status: 'AVAILABLE',
            participantId: 'sale-node-1',
            beneficiaryUserId: 'sale-user-1',
            beneficiaryAgencyId: null,
            amountCents: 4000000,
            currency: 'VND',
          },
          {
            id: 'earning-user-owned-pending',
            status: 'PENDING',
            participantId: 'manager-node-1',
            beneficiaryUserId: 'manager-user-1',
            beneficiaryAgencyId: null,
            amountCents: 1600000,
            currency: 'VND',
          },
        ],
      });

      prisma.activationOrder.findUnique.mockResolvedValue(approvedOrder);
      prisma.orderStatusHistory.findMany.mockResolvedValue([
        {
          id: 'refund-request-user-owned-1',
          action: 'MANUAL_REFUND_REQUEST_OPENED',
          createdAt: new Date('2026-06-16T03:00:00.000Z'),
        },
      ]);
      prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
        ...approvedOrder,
        status: 'REVOKED',
      });

      const result = await service.reviewManualRefundRequest(
        'order-user-owned-1',
        { decision: 'APPROVE', reviewNotes: 'Buyer refund accepted' } as any,
        opsUser as any,
      );

      expect(result).toEqual(
        expect.objectContaining({
          refundRequestStatus: 'APPROVED',
          requestHistoryId: 'refund-request-user-owned-1',
          providerRefundMutationUsed: false,
          productionReady: false,
        }),
      );
      expect(prisma.__tx.commissionEarning.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: {
              in: [
                'earning-user-owned-available',
                'earning-user-owned-pending',
              ],
            },
          },
          data: { status: 'CANCELED' },
        }),
      );
      expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'DEBIT',
            referenceId: 'earning-user-owned-available',
            reason:
              'Commission reversed: manual refund approved for order order-user-owned-1',
          }),
        }),
      );

      const subscriptionWhere =
        prisma.__tx.subscription.updateMany.mock.calls[0][0].where;
      expect(subscriptionWhere).toEqual({
        OR: [
          { sourceOrderId: 'order-user-owned-1' },
          { providerRef: 'order-user-owned-1' },
        ],
        status: { in: ['ACTIVE', 'TRIALING'] },
      });
      expect(subscriptionWhere).not.toHaveProperty('childProfileId');
      expect(prisma.__tx.payment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            providerRef: 'order-user-owned-1',
            provider: 'manual_bank_transfer',
            status: 'SUCCEEDED',
          },
          data: {
            status: 'REFUNDED',
          },
        }),
      );
      expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-user-owned-1',
            fromStatus: 'APPROVED',
            toStatus: 'REVOKED',
            action: 'MANUAL_REFUND_REQUEST_APPROVED',
            metadataJson: expect.objectContaining({
              requestStatus: 'APPROVED',
              requestHistoryId: 'refund-request-user-owned-1',
              refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
              refundWindowEndsAt: refundWindowEndsAt.toISOString(),
              subscriptionOwnership:
                'USER_ORDER_WITH_SINGLE_CHILD_SUBSCRIPTION_COMPATIBILITY',
              childAllocation:
                'APPROVAL_ALLOCATES_ENTITLEMENT_TO_RESOLVED_CHILD_PROFILE',
              policyVersion: 'manual_paid_pilot_refund_window_v1',
              canceledCommissionCount: 2,
              reversedCommissionCount: 1,
              canceledSubscriptionCount: 1,
              entitlementAccess: 'REVOKED_BY_MANUAL_REFUND',
              providerRefundExecution: 'BLOCKED_MANUAL_OFFLINE_ONLY',
              providerRefundMutationUsed: false,
              productionReady: false,
              liveMoneyHardStops: expect.objectContaining({
                paymentProviderMutationUsed: false,
                refundProviderMutationUsed: false,
                payoutMutationUsed: false,
                productionDbUsed: false,
              }),
            }),
          }),
        }),
      );
    } finally {
      jest.useRealTimers();
    }
  });
});
