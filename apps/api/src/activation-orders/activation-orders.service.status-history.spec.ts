import { BadRequestException } from '@nestjs/common';
import { MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS } from './activation-orders.service';
import {
  createService,
  opsUser,
  pendingApprovalOrder,
  proofFile,
  saleUser,
} from './activation-orders.service.spec-fixtures';

describe('ActivationOrdersService P0 commercial flows (commission release and status history)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('releasing due commissions twice does not double credit ledger entries', async () => {
    const { prisma, service } = createService();

    const dueEarning = {
      id: 'earning-1',
      participantId: 'sale-node-1',
      activationOrderId: 'order-1',
      amountCents: 4000,
      currency: 'VND',
      status: 'PENDING',
      activationOrder: { status: 'APPROVED' },
    };

    prisma.commissionEarning.findMany.mockResolvedValue([dueEarning]);
    prisma.__tx.commissionEarning.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const first = await service.releasePendingCommissions(
      new Date('2026-06-14T00:00:00Z'),
    );
    const second = await service.releasePendingCommissions(
      new Date('2026-06-14T00:00:00Z'),
    );

    expect(first).toEqual({
      checked: 1,
      released: 1,
      canceled: 0,
      heldForRefundReview: 0,
    });
    expect(second).toEqual({
      checked: 1,
      released: 0,
      canceled: 0,
      heldForRefundReview: 0,
    });
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'CREDIT',
          referenceId: 'earning-1',
          participantId: 'sale-node-1',
          reason: `Commission released after ${MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS}-day refund window`,
        }),
      }),
    );
  });

  it('holds due commission release while a manual refund request is open', async () => {
    const { prisma, service } = createService();

    const dueEarning = {
      id: 'earning-1',
      participantId: 'sale-node-1',
      activationOrderId: 'order-1',
      amountCents: 4000,
      currency: 'VND',
      status: 'PENDING',
      activationOrder: {
        status: 'APPROVED',
        statusHistory: [
          {
            action: 'MANUAL_REFUND_REQUEST_OPENED',
          },
        ],
      },
    };

    prisma.commissionEarning.findMany.mockResolvedValue([dueEarning]);

    const result = await service.releasePendingCommissions(
      new Date('2026-06-25T00:00:00Z'),
    );

    expect(result).toEqual({
      checked: 1,
      released: 0,
      canceled: 0,
      heldForRefundReview: 1,
    });
    expect(prisma.__tx.commissionEarning.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('cancels due commission when the latest manual refund review is approved', async () => {
    const { prisma, service } = createService();

    const dueEarning = {
      id: 'earning-refund-approved',
      participantId: 'sale-node-1',
      activationOrderId: 'order-1',
      amountCents: 4000,
      currency: 'VND',
      status: 'PENDING',
      activationOrder: {
        status: 'APPROVED',
        statusHistory: [
          {
            action: 'MANUAL_REFUND_REQUEST_APPROVED',
          },
        ],
      },
    };

    prisma.commissionEarning.findMany.mockResolvedValue([dueEarning]);

    const result = await service.releasePendingCommissions(
      new Date('2026-06-25T00:00:00Z'),
    );

    expect(result).toEqual({
      checked: 1,
      released: 0,
      canceled: 1,
      heldForRefundReview: 0,
    });
    expect(prisma.commissionEarning.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          activationOrder: expect.objectContaining({
            select: expect.objectContaining({
              statusHistory: expect.objectContaining({
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                take: 1,
              }),
            }),
          }),
        }),
      }),
    );
    expect(prisma.commissionEarning.updateMany).toHaveBeenCalledWith({
      where: { id: 'earning-refund-approved', status: 'PENDING' },
      data: { status: 'CANCELED' },
    });
    expect(prisma.__tx.commissionEarning.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('releases due commission after a manual refund request is rejected', async () => {
    const { prisma, service } = createService();

    const dueEarning = {
      id: 'earning-1',
      participantId: 'sale-node-1',
      activationOrderId: 'order-1',
      amountCents: 4000,
      currency: 'VND',
      status: 'PENDING',
      activationOrder: {
        status: 'APPROVED',
        statusHistory: [
          {
            action: 'MANUAL_REFUND_REQUEST_REJECTED',
          },
        ],
      },
    };

    prisma.commissionEarning.findMany.mockResolvedValue([dueEarning]);
    prisma.__tx.commissionEarning.updateMany.mockResolvedValueOnce({
      count: 1,
    });

    const result = await service.releasePendingCommissions(
      new Date('2026-06-25T00:00:00Z'),
    );

    expect(result).toEqual({
      checked: 1,
      released: 1,
      canceled: 0,
      heldForRefundReview: 0,
    });
    expect(prisma.__tx.commissionEarning.updateMany).toHaveBeenCalledWith({
      where: { id: 'earning-1', status: 'PENDING' },
      data: {
        status: 'AVAILABLE',
        releasedAt: new Date('2026-06-25T00:00:00Z'),
      },
    });
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'CREDIT',
          referenceId: 'earning-1',
          participantId: 'sale-node-1',
          reason: `Commission released after ${MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS}-day refund window`,
        }),
      }),
    );
  });

  it('rejects approving non-pending orders before creating subscription side effects', async () => {
    const { prisma, service } = createService();

    prisma.activationOrder.findUnique.mockResolvedValue(
      pendingApprovalOrder({ status: 'APPROVED' }),
    );

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 30 } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });

  it('guards stale repeated approval inside the transaction claim', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder();

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.activationOrder.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvalOrder,
      status: 'APPROVED',
    });

    await service.approveOrder(
      'order-1',
      { durationDays: 30 },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 30 } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.payment.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.subscription.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledTimes(1);
  });

  it('keeps stale approval child allocation inside the failed transaction', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      childProfileId: null,
      user: {
        id: 'parent-1',
        email: 'parent@example.com',
        profile: { displayName: 'Parent One' },
      },
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.childProfile.findFirst.mockResolvedValue(null);
    prisma.__tx.activationOrder.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 30 } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.childProfile.findFirst).not.toHaveBeenCalled();
    expect(prisma.childProfile.create).not.toHaveBeenCalled();
    expect(prisma.__tx.childProfile.findFirst).toHaveBeenCalledWith({
      where: { parentId: 'parent-1' },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    expect(prisma.__tx.childProfile.create).toHaveBeenCalledWith({
      data: {
        parentId: 'parent-1',
        displayName: 'Parent One',
      },
    });
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
    expect(prisma.__tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('writes history when rejected orders are resubmitted', async () => {
    const { prisma, service } = createService();
    const rejectedOrder = pendingApprovalOrder({
      status: 'REJECTED',
      createdById: 'sale-user-1',
      reviewNotes: 'Need clearer proof',
    });

    prisma.activationOrder.findUnique.mockResolvedValue(rejectedOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...rejectedOrder,
      status: 'PENDING_REVIEW',
      reviewNotes: null,
      saleInvoiceStorageKey: 'invoices/resubmit.pdf',
    });

    const updated = await service.resubmitOrder(
      'order-1',
      { notes: 'Uploaded clearer proof' },
      proofFile('resubmit.pdf'),
      saleUser as any,
    );

    expect(updated.status).toBe('PENDING_REVIEW');
    expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: 'REJECTED' },
        data: expect.objectContaining({
          status: 'PENDING_REVIEW',
          reviewedById: null,
          reviewNotes: null,
          notes: 'Uploaded clearer proof',
          saleInvoiceStorageKey: 'invoices/resubmit.pdf',
        }),
      }),
    );
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'REJECTED',
          toStatus: 'PENDING_REVIEW',
          action: 'RESUBMIT',
          actorUserId: 'sale-user-1',
          reason: 'Uploaded clearer proof',
          metadataJson: expect.objectContaining({
            previousReviewNotes: 'Need clearer proof',
            saleInvoiceStorageKey: 'invoices/resubmit.pdf',
          }),
        }),
      }),
    );
  });

  it('writes history when waiting or pending orders are rejected', async () => {
    const { prisma, service } = createService();
    const pendingOrder = pendingApprovalOrder({ status: 'WAITING_PAYMENT' });

    prisma.activationOrder.findUnique.mockResolvedValue(pendingOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...pendingOrder,
      status: 'REJECTED',
      reviewNotes: 'Payment proof does not match',
    });

    const rejected = await service.rejectOrder(
      'order-1',
      { reviewNotes: 'Payment proof does not match' },
      opsUser as any,
    );

    expect(rejected.status).toBe('REJECTED');
    expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'order-1',
          status: { in: ['WAITING_PAYMENT', 'PENDING_REVIEW'] },
        },
        data: expect.objectContaining({
          status: 'REJECTED',
          reviewedById: 'ops-1',
          reviewNotes: 'Payment proof does not match',
        }),
      }),
    );
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'WAITING_PAYMENT',
          toStatus: 'REJECTED',
          action: 'REJECT',
          actorUserId: 'ops-1',
          reason: 'Payment proof does not match',
          metadataJson: expect.objectContaining({
            previousStatus: 'WAITING_PAYMENT',
          }),
        }),
      }),
    );
  });

  it('does not write history when a status claim fails inside reject', async () => {
    const { prisma, service } = createService();

    prisma.activationOrder.findUnique.mockResolvedValue(pendingApprovalOrder());
    prisma.__tx.activationOrder.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.rejectOrder(
        'order-1',
        { reviewNotes: 'Already changed' } as any,
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.orderStatusHistory.create).not.toHaveBeenCalled();
    expect(
      prisma.__tx.activationOrder.findUniqueOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('writes history when cancelable orders are canceled', async () => {
    const { prisma, service } = createService();
    const waitingOrder = pendingApprovalOrder({ status: 'WAITING_PAYMENT' });

    prisma.activationOrder.findUnique.mockResolvedValue(waitingOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...waitingOrder,
      status: 'CANCELED',
    });

    const canceled = await service.cancelOrder('order-1', opsUser as any);

    expect(canceled.status).toBe('CANCELED');
    expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'order-1',
          status: { in: ['WAITING_PAYMENT', 'PENDING_REVIEW', 'REJECTED'] },
        },
        data: { status: 'CANCELED' },
      }),
    );
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'WAITING_PAYMENT',
          toStatus: 'CANCELED',
          action: 'CANCEL',
          actorUserId: 'ops-1',
          metadataJson: expect.objectContaining({
            previousStatus: 'WAITING_PAYMENT',
            actorRoles: ['OPERATIONS'],
          }),
        }),
      }),
    );
  });

  it('writes revoke history after canceling traced subscription and commissions', async () => {
    const { prisma, service } = createService();
    const approvedOrder = pendingApprovalOrder({
      status: 'APPROVED',
      commissionEarnings: [
        {
          id: 'earning-available',
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          beneficiaryAgencyId: null,
          amountCents: 4000,
          currency: 'VND',
          status: 'AVAILABLE',
        },
        {
          id: 'earning-pending',
          participantId: 'manager-node-1',
          beneficiaryUserId: 'manager-user-1',
          beneficiaryAgencyId: null,
          amountCents: 2000,
          currency: 'VND',
          status: 'PENDING',
        },
      ],
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvedOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvedOrder,
      status: 'REVOKED',
      revokeReason: 'Duplicate payment reversed',
    });

    const revoked = await service.revokeOrder(
      'order-1',
      { revokeReason: ' Duplicate payment reversed ' },
      opsUser as any,
    );

    expect(revoked.status).toBe('REVOKED');
    expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: 'APPROVED' },
        data: expect.objectContaining({
          status: 'REVOKED',
          revokedById: 'ops-1',
          revokeReason: 'Duplicate payment reversed',
        }),
      }),
    );
    expect(prisma.__tx.commissionEarning.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['earning-available', 'earning-pending'] } },
      data: { status: 'CANCELED' },
    });
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'DEBIT',
          referenceId: 'earning-available',
          amountCents: 4000,
        }),
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
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'APPROVED',
          toStatus: 'REVOKED',
          action: 'REVOKE',
          actorUserId: 'ops-1',
          reason: 'Duplicate payment reversed',
          metadataJson: expect.objectContaining({
            refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
            refundWindowEndsAt: null,
            subscriptionOwnership:
              'USER_ORDER_WITH_SINGLE_CHILD_SUBSCRIPTION_COMPATIBILITY',
            childAllocation:
              'APPROVAL_ALLOCATES_ENTITLEMENT_TO_RESOLVED_CHILD_PROFILE',
            policyVersion: 'manual_paid_pilot_refund_window_v1',
            canceledCommissionCount: 2,
            reversedCommissionCount: 1,
            canceledSubscriptionCount: 1,
            revokeReasonPresent: true,
            entitlementAccess: 'REVOKED_BY_MANUAL_REVOCATION',
            commissionReleaseGate: 'REVOKE_CANCELED_EARNINGS',
            providerRefundExecution: 'NOT_RUN',
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
    expect(prisma.__tx.activationOrder.update).not.toHaveBeenCalled();
  });

  it('revokes a buyer-owned manual pilot order by traced subscription without legacy child id', async () => {
    const { prisma, service } = createService();
    const refundWindowEndsAt = new Date('2026-06-24T03:00:00.000Z');
    const approvedOrder = pendingApprovalOrder({
      id: 'order-user-owned-revoke',
      status: 'APPROVED',
      childProfileId: null,
      trialEndsAt: refundWindowEndsAt,
      commissionEarnings: [
        {
          id: 'earning-user-owned-available',
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          beneficiaryAgencyId: null,
          amountCents: 4000,
          currency: 'VND',
          status: 'AVAILABLE',
        },
      ],
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvedOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvedOrder,
      status: 'REVOKED',
      revokeReason: 'Manual pilot revoke',
    });

    const revoked = await service.revokeOrder(
      'order-user-owned-revoke',
      { revokeReason: ' Manual pilot revoke ' },
      opsUser as any,
    );

    expect(revoked.status).toBe('REVOKED');
    expect(prisma.__tx.subscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { sourceOrderId: 'order-user-owned-revoke' },
            { providerRef: 'order-user-owned-revoke' },
          ],
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
        data: expect.objectContaining({
          status: 'CANCELED',
          cancelAtPeriodEnd: false,
        }),
      }),
    );
    expect(prisma.__tx.commissionEarning.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['earning-user-owned-available'] } },
      data: { status: 'CANCELED' },
    });
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'DEBIT',
          referenceId: 'earning-user-owned-available',
          reason: 'Commission reversed: order order-user-owned-revoke revoked',
        }),
      }),
    );
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-user-owned-revoke',
          action: 'REVOKE',
          metadataJson: expect.objectContaining({
            refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
            refundWindowEndsAt: refundWindowEndsAt.toISOString(),
            subscriptionOwnership:
              'USER_ORDER_WITH_SINGLE_CHILD_SUBSCRIPTION_COMPATIBILITY',
            childAllocation:
              'APPROVAL_ALLOCATES_ENTITLEMENT_TO_RESOLVED_CHILD_PROFILE',
            policyVersion: 'manual_paid_pilot_refund_window_v1',
            canceledCommissionCount: 1,
            reversedCommissionCount: 1,
            canceledSubscriptionCount: 1,
            entitlementAccess: 'REVOKED_BY_MANUAL_REVOCATION',
            commissionReleaseGate: 'REVOKE_CANCELED_EARNINGS',
            providerRefundExecution: 'NOT_RUN',
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
  });

  it('cancels due commission when the source order is no longer approved', async () => {
    const { prisma, service } = createService();

    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-2',
        participantId: 'sale-node-1',
        amountCents: 4000,
        currency: 'VND',
        status: 'PENDING',
        activationOrder: { status: 'REVOKED' },
      },
    ]);

    const result = await service.releasePendingCommissions(
      new Date('2026-06-14T00:00:00Z'),
    );

    expect(result).toEqual({
      checked: 1,
      released: 0,
      canceled: 1,
      heldForRefundReview: 0,
    });
    expect(prisma.commissionEarning.updateMany).toHaveBeenCalledWith({
      where: { id: 'earning-2', status: 'PENDING' },
      data: { status: 'CANCELED' },
    });
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });
});
