import { BadRequestException, ConflictException } from '@nestjs/common';
import { MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS } from './activation-orders.service';
import {
  affiliateClickEvent,
  affiliateClickId,
  affiliateOrderSnapshot,
  channelParticipant,
  commissionChainSnapshot,
  createService,
  managerParticipant,
  opsUser,
  pendingApprovalOrder,
  proofFile,
  saleUser,
} from './activation-orders.service.spec-fixtures';

describe('ActivationOrdersService P0 commercial flows (approval and assisted sales)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('approves with null activationPackageId when package code cannot be resolved', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      packageCode: 'legacy-custom',
      packageName: 'Legacy Custom',
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.activationPackage.findUnique.mockResolvedValueOnce(null);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvalOrder,
      status: 'APPROVED',
    });

    const approved = await service.approveOrder(
      'order-1',
      { durationDays: 30 },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    expect(approved.status).toBe('APPROVED');
    expect(prisma.__tx.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          providerRef: 'order-1',
          sourceOrderId: 'order-1',
          activationPackageId: null,
        }),
      }),
    );
  });

  it('keeps renewal stacking from a future active subscription while adding trace fields', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder();
    const existingEnd = new Date('2026-07-01T00:00:00.000Z');

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.subscription.findFirst.mockResolvedValue({
      id: 'existing-subscription',
      currentPeriodEnd: existingEnd,
    });
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

    expect(prisma.__tx.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentPeriodStart: existingEnd,
          currentPeriodEnd: new Date('2026-07-31T00:00:00.000Z'),
          providerRef: 'order-1',
          sourceOrderId: 'order-1',
          activationPackageId: 'pkg-1',
        }),
      }),
    );
  });

  it('allocates a buyer-owned manual pilot order to the resolved child without changing the order owner', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-14T03:00:00.000Z'));

    try {
      const { prisma, service } = createService();
      const resolvedChild = { id: 'child-existing-1' };
      const expectedRefundWindowEndsAt = new Date('2026-06-24T03:00:00.000Z');
      const approvalOrder = pendingApprovalOrder({
        id: 'order-user-owned-1',
        childProfileId: null,
        userId: 'parent-1',
        customerEmail: 'parent@example.com',
        user: {
          id: 'parent-1',
          email: 'parent@example.com',
          profile: { displayName: 'Parent One' },
        },
        affiliateAttributionSnapshotJson: affiliateOrderSnapshot(),
        commissionChainSnapshotJson: commissionChainSnapshot(),
      });

      prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
      prisma.__tx.childProfile.findFirst.mockResolvedValue(resolvedChild);
      prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
        ...approvalOrder,
        status: 'APPROVED',
      });

      await service.approveOrder(
        'order-user-owned-1',
        { durationDays: 30, reviewNotes: 'manual pilot allocation' },
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      );

      expect(prisma.__tx.childProfile.findFirst).toHaveBeenCalledWith({
        where: { parentId: 'parent-1' },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(prisma.__tx.childProfile.create).not.toHaveBeenCalled();
      expect(prisma.__tx.user.update).toHaveBeenCalledWith({
        where: { id: 'parent-1' },
        data: { status: 'ACTIVE' },
      });
      const approveUpdate =
        prisma.__tx.activationOrder.updateMany.mock.calls.find(
          ([arg]: any[]) => arg.data.status === 'APPROVED',
        )?.[0];
      expect(approveUpdate.data).toEqual(
        expect.objectContaining({
          childProfileId: 'child-existing-1',
          status: 'APPROVED',
        }),
      );
      expect(prisma.__tx.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            childProfileId: 'child-existing-1',
            providerRef: 'order-user-owned-1',
            sourceOrderId: 'order-user-owned-1',
            currentPeriodStart: new Date('2026-06-14T03:00:00.000Z'),
            currentPeriodEnd: new Date('2026-07-14T03:00:00.000Z'),
          }),
        }),
      );
      expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            activationOrderId: 'order-user-owned-1',
            availableAt: expectedRefundWindowEndsAt,
            status: 'PENDING',
          }),
        }),
      );
      expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-user-owned-1',
            action: 'APPROVE',
            metadataJson: expect.objectContaining({
              childProfileId: 'child-existing-1',
              refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
              refundWindowEndsAt: expectedRefundWindowEndsAt.toISOString(),
              commissionReleaseGate: 'AFTER_REFUND_WINDOW',
              subscriptionOwnership:
                'USER_ORDER_WITH_SINGLE_CHILD_SUBSCRIPTION_COMPATIBILITY',
              childAllocation:
                'APPROVAL_ALLOCATES_ENTITLEMENT_TO_RESOLVED_CHILD_PROFILE',
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

  it('replays approve with the same idempotency key without duplicate side effects', async () => {
    const { prisma, notifications, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson: affiliateOrderSnapshot(),
      commissionChainSnapshotJson: commissionChainSnapshot(),
    });
    const approvedResponse = { ...approvalOrder, status: 'APPROVED' };

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue(
      approvedResponse,
    );
    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);

    await service.approveOrder(
      'order-1',
      { durationDays: 30, reviewNotes: 'ok' },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
      'approve-key-0001',
    );

    const requestHash =
      prisma.__tx.idempotencyRecord.create.mock.calls[0][0].data.requestHash;
    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash,
      status: 'SUCCEEDED',
      responseJson: approvedResponse,
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    const replayed = await service.approveOrder(
      'order-1',
      { durationDays: 30, reviewNotes: 'ok' },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
      'approve-key-0001',
    );

    expect(replayed).toEqual(approvedResponse);
    expect(prisma.__tx.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          providerRef: 'order-1',
          sourceOrderId: 'order-1',
          activationPackageId: 'pkg-1',
        }),
      }),
    );
    expect(prisma.__tx.payment.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.subscription.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledTimes(1);
    expect(
      prisma.__tx.commissionEarning.create.mock.calls[0][0].data
        .attributionSnapshotJson,
    ).toEqual(
      expect.objectContaining({
        source: 'affiliate_order_snapshot',
        affiliateQrAssetId: 'qr-1',
      }),
    );
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.idempotencyRecord.update).toHaveBeenCalledTimes(1);
    expect(notifications.sendOrderApproved).toHaveBeenCalledTimes(1);
  });

  it('rejects approve with the same idempotency key and different payload', async () => {
    const { prisma, service } = createService();

    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash: 'different-request-hash',
      status: 'SUCCEEDED',
      responseJson: { id: 'order-1', status: 'APPROVED' },
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 31, reviewNotes: 'changed' } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
        'approve-key-0002',
      ),
    ).rejects.toThrow(ConflictException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('covers assisted sale creation, duplicate guard, and upline commission approval', async () => {
    const { prisma, service } = createService();

    prisma.activationOrder.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'learner-1',
      email: 'learner@example.com',
      profile: { displayName: 'Learner One' },
    });
    prisma.channelParticipant.findFirst.mockResolvedValue({
      ...channelParticipant,
      userId: 'sale-user-1',
      parentParticipantId: 'manager-node-1',
    });
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, any> }) =>
        Promise.resolve({ id: 'order-2', ...data, commissionEarnings: [] }),
    );

    const result = await service.createOrder(
      {
        email: 'learner@example.com',
        displayName: 'Learner One',
        phone: '0911111111',
        amountVnd: 100000,
        packageCode: 'basic-30',
        requestedDurationDays: 30,
      },
      proofFile('sale-invoice.pdf'),
      saleUser as any,
    );

    expect(result.order.status).toBe('PENDING_REVIEW');
    expect(prisma.activationOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'SALE_ASSISTED',
          createdById: 'sale-user-1',
          channelParticipantId: 'sale-node-1',
          statusHistory: expect.objectContaining({
            create: expect.objectContaining({
              fromStatus: null,
              toStatus: 'PENDING_REVIEW',
              action: 'CREATE_SALE_ASSISTED',
              actorUserId: 'sale-user-1',
            }),
          }),
        }),
      }),
    );

    prisma.activationOrder.findFirst.mockResolvedValueOnce({
      id: 'duplicate-order',
      status: 'PENDING_REVIEW',
    });

    await expect(
      service.createOrder(
        {
          email: 'learner@example.com',
          amountVnd: 100000,
          packageCode: 'basic-30',
        } as any,
        proofFile('sale-invoice.pdf'),
        saleUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    const approvalOrder = pendingApprovalOrder({
      id: 'order-2',
      source: 'SALE_ASSISTED',
      userId: 'learner-1',
      childProfileId: null,
      createdById: 'sale-user-1',
      customerEmail: 'learner@example.com',
      user: {
        id: 'learner-1',
        email: 'learner@example.com',
        profile: { displayName: 'Learner One' },
      },
      createdBy: {
        id: 'sale-user-1',
        roles: [{ role: { name: 'SALE' } }],
        agencyMemberships: [],
      },
      channelParticipant: {
        ...channelParticipant,
        parentParticipantId: 'manager-node-1',
      },
    });
    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.childProfile.findFirst.mockResolvedValue({
      id: 'child-sale-1',
    });
    prisma.__tx.channelParticipant.findUnique.mockResolvedValue(
      managerParticipant,
    );
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvalOrder,
      status: 'APPROVED',
    });

    await service.approveOrder(
      'order-2',
      { durationDays: 30 },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledTimes(2);
    expect(prisma.__tx.commissionEarning.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          depth: 0,
        }),
      }),
    );
    expect(prisma.__tx.commissionEarning.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'manager-node-1',
          depth: 1,
        }),
      }),
    );
    for (const [arg] of prisma.__tx.commissionEarning.create.mock.calls) {
      expect(arg.data).not.toHaveProperty('attributionSnapshotJson');
    }
  });

  it('snapshots compatible affiliate clicks on sale-assisted orders without overriding the sale participant', async () => {
    const { prisma, service } = createService();

    prisma.activationOrder.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'learner-1',
      email: 'learner@example.com',
      profile: { displayName: 'Learner One' },
    });
    prisma.channelParticipant.findFirst.mockResolvedValue(channelParticipant);
    prisma.affiliateClickEvent.findUnique.mockResolvedValue(
      affiliateClickEvent(),
    );
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, any> }) =>
        Promise.resolve({ id: 'order-aff-sale-1', ...data }),
    );

    await service.createOrder(
      {
        email: 'learner@example.com',
        displayName: 'Learner One',
        amountVnd: 100000,
        packageCode: 'basic-30',
        affiliateClickId,
      },
      proofFile('sale-invoice.pdf'),
      saleUser as any,
    );

    const createData = prisma.activationOrder.create.mock.calls[0][0].data;
    expect(createData.channelParticipantId).toBe('sale-node-1');
    expect(createData.affiliateAttributionSnapshotJson).toEqual(
      expect.objectContaining({
        source: 'affiliate_click',
        clickId: affiliateClickId,
        participantId: 'sale-node-1',
        affiliateLinkId: 'affiliate-link-1',
      }),
    );
    expect(createData.commissionChainSnapshotJson).toEqual(
      expect.objectContaining({
        source: 'affiliate_order_snapshot',
        policyVersion: 'commission_chain_v1',
        rootParticipantId: 'sale-node-1',
        items: [
          expect.objectContaining({
            depth: 0,
            participantId: 'sale-node-1',
            beneficiaryType: 'SALE',
            beneficiaryId: 'sale-user-1',
            rateBps: 4000,
          }),
        ],
      }),
    );
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });

  it('rejects sale-assisted affiliate clicks that conflict with the selected participant', async () => {
    const { prisma, service } = createService();
    const otherParticipant = {
      ...channelParticipant,
      id: 'sale-node-2',
      code: 'SALE02',
      userId: 'sale-user-2',
      lineage: '/root/sale-node-2/',
    };

    prisma.activationOrder.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.channelParticipant.findFirst.mockResolvedValue(channelParticipant);
    prisma.affiliateClickEvent.findUnique.mockResolvedValue(
      affiliateClickEvent({
        id: 'click-event-2',
        affiliateLinkId: 'affiliate-link-2',
        participantId: 'sale-node-2',
        participant: otherParticipant,
        affiliateLink: {
          ...affiliateClickEvent().affiliateLink,
          id: 'affiliate-link-2',
          participantId: 'sale-node-2',
        },
      }),
    );

    await expect(
      service.createOrder(
        {
          email: 'learner@example.com',
          amountVnd: 100000,
          packageCode: 'basic-30',
          affiliateClickId,
        } as any,
        proofFile('sale-invoice.pdf'),
        saleUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.activationOrder.create).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });
});
