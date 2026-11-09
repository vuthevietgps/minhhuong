import { BadRequestException } from '@nestjs/common';
import {
  affiliateClickEvent,
  affiliateClickId,
  affiliateOrderSnapshot,
  channelParticipant,
  childProfile,
  commissionChainSnapshot,
  createService,
  managerParticipant,
  opsUser,
  pendingApprovalOrder,
  proofFile,
} from './activation-orders.service.spec-fixtures';

describe('ActivationOrdersService P0 commercial flows (affiliate commission snapshots)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates commission attribution proof from the immutable affiliate order snapshot', async () => {
    const { prisma, service } = createService();
    const snapshot = affiliateOrderSnapshot({
      agencyId: 'agency-snapshot-1',
      agencyMemberId: 'member-snapshot-1',
      referralCode: 'SNAP-REF',
      affiliateQrAssetId: 'qr-snapshot-1',
      campaign: 'snapshot-campaign',
      channel: 'snapshot-channel',
      placement: 'snapshot-placement',
      packageCode: 'basic-30',
      ipHash: 'should-not-copy-ip-hash',
      userAgentHash: 'should-not-copy-ua-hash',
      deviceHint: 'mobile',
      cookie: 'session=secret',
      Authorization: 'Bearer secret',
      paymentProofUrl: '/uploads/invoices/proof.pdf',
      customerEmail: 'parent@example.com',
    });
    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson: snapshot,
      commissionChainSnapshotJson: commissionChainSnapshot(),
      agencyId: 'agency-snapshot-1',
      referrerMemberId: 'member-snapshot-1',
    });

    prisma.affiliateLink.findUnique.mockResolvedValue({
      id: 'affiliate-link-1',
      referralCode: 'MUTATED-REF',
      campaign: 'mutated-campaign',
      channel: 'mutated-channel',
      placement: 'mutated-placement',
    });
    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvalOrder,
      status: 'APPROVED',
    });

    await service.approveOrder(
      'order-1',
      { durationDays: 30, reviewNotes: 'ok' },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    const createData =
      prisma.__tx.commissionEarning.create.mock.calls[0][0].data;
    expect(createData).toEqual(
      expect.objectContaining({
        activationOrderId: 'order-1',
        participantId: 'sale-node-1',
        baseAmountCents: 10000000,
        rateBps: 4000,
        amountCents: 4000000,
        currency: 'VND',
      }),
    );
    expect(createData.attributionSnapshotJson).toEqual({
      source: 'affiliate_order_snapshot',
      participantId: 'sale-node-1',
      agencyId: 'agency-snapshot-1',
      agencyMemberId: 'member-snapshot-1',
      referralCode: 'SNAP-REF',
      affiliateLinkId: 'affiliate-link-1',
      affiliateQrAssetId: 'qr-snapshot-1',
      campaign: 'snapshot-campaign',
      channel: 'snapshot-channel',
      placement: 'snapshot-placement',
      packageCode: 'basic-30',
      clickId: affiliateClickId,
      clickCreatedAt: snapshot.clickCreatedAt,
      orderSnapshottedAt: '2026-06-15T01:00:00.000Z',
    });
    expect(prisma.affiliateLink.findUnique).not.toHaveBeenCalled();

    const serialized = JSON.stringify(createData.attributionSnapshotJson);
    expect(serialized).not.toContain('mutated-campaign');
    expect(serialized).not.toContain('mutated-channel');
    expect(serialized).not.toContain('mutated-placement');
    expect(serialized).not.toContain('MUTATED-REF');
    expect(serialized).not.toContain('ipHash');
    expect(serialized).not.toContain('userAgentHash');
    expect(serialized).not.toContain('deviceHint');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('paymentProofUrl');
    expect(serialized).not.toContain('customerEmail');
  });

  it('approves affiliate commissions from the frozen order-time chain snapshot', async () => {
    const { prisma, service } = createService();
    const frozenChain = commissionChainSnapshot({
      items: [
        {
          depth: 0,
          participantId: 'sale-node-1',
          beneficiaryType: 'SALE',
          beneficiaryId: 'sale-user-1',
          rateBps: 4000,
          agencyId: null,
          agencyMemberId: null,
          parentParticipantId: 'manager-node-1',
        },
        {
          depth: 1,
          participantId: 'manager-node-1',
          beneficiaryType: 'SALE',
          beneficiaryId: 'manager-user-1',
          rateBps: 1600,
          agencyId: null,
          agencyMemberId: null,
          parentParticipantId: null,
        },
      ],
    });
    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson: affiliateOrderSnapshot(),
      commissionChainSnapshotJson: frozenChain,
      channelParticipant: {
        ...channelParticipant,
        parentParticipantId: 'mutated-manager-node',
      },
    });
    const mutatedManager = {
      ...managerParticipant,
      id: 'mutated-manager-node',
      userId: 'mutated-manager-user',
    };

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.channelParticipant.findUnique.mockResolvedValue(mutatedManager);
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

    expect(prisma.__tx.channelParticipant.findUnique).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledTimes(2);
    expect(prisma.__tx.commissionEarning.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          depth: 0,
          rateBps: 4000,
          amountCents: 4000000,
          currency: 'VND',
        }),
      }),
    );
    expect(prisma.__tx.commissionEarning.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'manager-node-1',
          beneficiaryUserId: 'manager-user-1',
          depth: 1,
          rateBps: 1600,
          amountCents: 1600000,
          currency: 'VND',
        }),
      }),
    );
    const serializedCreates = JSON.stringify(
      prisma.__tx.commissionEarning.create.mock.calls.map(
        ([arg]: any[]) => arg.data,
      ),
    );
    expect(serializedCreates).not.toContain('mutated-manager-node');
    expect(serializedCreates).not.toContain('mutated-manager-user');
  });

  it('marks legacy affiliate approvals that are missing an order-time chain snapshot', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson: affiliateOrderSnapshot(),
      commissionChainSnapshotJson: null,
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
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

    expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          attributionSnapshotJson: expect.objectContaining({
            source: 'affiliate_order_snapshot',
            commissionChainSnapshotStatus: 'legacy_missing',
          }),
        }),
      }),
    );
  });

  it('rejects malformed affiliate commission snapshots deterministically', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson: {
        source: 'affiliate_click',
        clickId: affiliateClickId,
      },
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 30 } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });

  it('rejects malformed commission chain snapshots before approval side effects', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson: affiliateOrderSnapshot(),
      commissionChainSnapshotJson: {
        source: 'affiliate_order_snapshot',
        policyVersion: 'commission_chain_v1',
        snapshottedAt: '2026-06-15T01:00:01.000Z',
        rootParticipantId: 'sale-node-1',
        items: [
          {
            depth: 1,
            participantId: 'sale-node-1',
            beneficiaryType: 'SALE',
            beneficiaryId: 'sale-user-1',
            rateBps: 4000,
            agencyId: null,
            agencyMemberId: null,
            parentParticipantId: null,
          },
        ],
      },
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 30 } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });

  it('snapshots a valid affiliate click on self-service order creation without financial side effects', async () => {
    const { prisma, service } = createService();

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'parent-1',
      email: 'parent@example.com',
      profile: { displayName: 'Parent One' },
    });
    prisma.childProfile.findFirst.mockResolvedValue(null);
    prisma.childProfile.upsert.mockResolvedValue(childProfile);
    prisma.affiliateClickEvent.findUnique.mockResolvedValue(
      affiliateClickEvent(),
    );
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, any> }) =>
        Promise.resolve({
          id: 'order-aff-1',
          ...data,
          user: { id: 'parent-1', email: 'parent@example.com' },
          commissionEarnings: [],
        }),
    );

    const created = await service.createSelfServiceOrder({
      email: 'parent@example.com',
      password: 'Password123!',
      displayName: 'Minh Anh',
      packageCode: 'basic-30',
      affiliateClickId,
    });

    const createData = prisma.activationOrder.create.mock.calls[0][0].data;
    const snapshot = createData.affiliateAttributionSnapshotJson;
    const chainSnapshot = createData.commissionChainSnapshotJson;
    expect(created.order.status).toBe('WAITING_PAYMENT');
    expect(createData).toEqual(
      expect.objectContaining({
        channelParticipantId: 'sale-node-1',
      }),
    );
    expect(createData.agencyId).toBeUndefined();
    expect(createData.referrerMemberId).toBeUndefined();
    expect(snapshot).toEqual(
      expect.objectContaining({
        source: 'affiliate_click',
        clickId: affiliateClickId,
        affiliateClickEventId: 'click-event-1',
        affiliateLinkId: 'affiliate-link-1',
        affiliateQrAssetId: 'qr-1',
        participantId: 'sale-node-1',
        campaign: 'summer2026',
        channel: 'zalo',
        placement: 'poster',
        packageCode: 'basic-30',
        attributionModel: 'explicit_click',
        matchConfidence: 'high',
        attributionWindowDays: 30,
      }),
    );
    expect(snapshot.orderSnapshottedAt).toEqual(expect.any(String));
    expect(snapshot.clickCreatedAt).toEqual(expect.any(String));
    expect(chainSnapshot).toEqual(
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
    expect(chainSnapshot.snapshottedAt).toEqual(expect.any(String));
    const serializedSnapshot = JSON.stringify(snapshot);
    const serializedChainSnapshot = JSON.stringify(chainSnapshot);
    expect(serializedSnapshot).not.toContain('hash-only-ip');
    expect(serializedSnapshot).not.toContain('hash-only-ua');
    expect(serializedSnapshot).not.toContain('ipHash');
    expect(serializedSnapshot).not.toContain('userAgentHash');
    expect(serializedSnapshot).not.toContain('cookie');
    expect(serializedSnapshot).not.toContain('authorization');
    expect(serializedChainSnapshot).not.toContain('hash-only-ip');
    expect(serializedChainSnapshot).not.toContain('hash-only-ua');
    expect(serializedChainSnapshot).not.toContain('ipHash');
    expect(serializedChainSnapshot).not.toContain('userAgentHash');
    expect(serializedChainSnapshot).not.toContain('deviceHint');
    expect(serializedChainSnapshot).not.toContain('cookie');
    expect(serializedChainSnapshot).not.toContain('authorization');
    expect(serializedChainSnapshot).not.toContain('parent@example.com');
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
    expect(prisma.__tx.walletLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('freezes self-service affiliate upline chain at order creation and consumes it on approval', async () => {
    const { prisma, service } = createService();
    const affiliateRoot = {
      ...channelParticipant,
      parentParticipantId: 'manager-node-1',
    };

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'parent-1',
      email: 'parent@example.com',
      profile: { displayName: 'Parent One' },
    });
    prisma.childProfile.findFirst.mockResolvedValue(null);
    prisma.childProfile.upsert.mockResolvedValue(childProfile);
    prisma.affiliateClickEvent.findUnique.mockResolvedValue(
      affiliateClickEvent({ participant: affiliateRoot }),
    );
    prisma.channelParticipant.findUnique.mockResolvedValueOnce(
      managerParticipant,
    );
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, any> }) =>
        Promise.resolve({
          id: 'order-aff-upline-1',
          ...data,
          user: { id: 'parent-1', email: 'parent@example.com' },
          commissionEarnings: [],
        }),
    );

    await service.createSelfServiceOrder({
      email: 'parent@example.com',
      password: 'Password123!',
      displayName: 'Minh Anh',
      packageCode: 'basic-30',
      affiliateClickId,
    });

    const createData = prisma.activationOrder.create.mock.calls[0][0].data;
    expect(createData.commissionChainSnapshotJson.items).toEqual([
      expect.objectContaining({
        depth: 0,
        participantId: 'sale-node-1',
        beneficiaryId: 'sale-user-1',
        rateBps: 4000,
        parentParticipantId: 'manager-node-1',
      }),
      expect.objectContaining({
        depth: 1,
        participantId: 'manager-node-1',
        beneficiaryId: 'manager-user-1',
        rateBps: 1600,
      }),
    ]);
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();

    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson:
        createData.affiliateAttributionSnapshotJson,
      commissionChainSnapshotJson: createData.commissionChainSnapshotJson,
      channelParticipant: {
        ...affiliateRoot,
        parentParticipantId: 'mutated-manager-node',
      },
    });
    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.channelParticipant.findUnique.mockResolvedValue({
      ...managerParticipant,
      id: 'mutated-manager-node',
      userId: 'mutated-manager-user',
    });
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvalOrder,
      status: 'APPROVED',
    });

    await service.approveOrder(
      'order-aff-upline-1',
      { durationDays: 30 },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    expect(prisma.__tx.channelParticipant.findUnique).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledTimes(2);
    expect(prisma.__tx.commissionEarning.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          depth: 0,
          rateBps: 4000,
          amountCents: 4000000,
        }),
      }),
    );
    expect(prisma.__tx.commissionEarning.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'manager-node-1',
          beneficiaryUserId: 'manager-user-1',
          depth: 1,
          rateBps: 1600,
          amountCents: 1600000,
        }),
      }),
    );
  });

  it('rejects malformed, missing, expired, and inactive affiliate clicks deterministically', async () => {
    const { prisma, service } = createService();
    const dto = {
      email: 'parent@example.com',
      password: 'Password123!',
      displayName: 'Minh Anh',
      packageCode: 'basic-30',
    };

    await expect(
      service.createSelfServiceOrder({
        ...dto,
        affiliateClickId: 'not-a-click-id',
      } as any),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.affiliateClickEvent.findUnique).not.toHaveBeenCalled();

    prisma.affiliateClickEvent.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.createSelfServiceOrder({
        ...dto,
        affiliateClickId,
      } as any),
    ).rejects.toThrow(BadRequestException);

    prisma.affiliateClickEvent.findUnique.mockResolvedValueOnce(
      affiliateClickEvent({
        createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
      }),
    );
    await expect(
      service.createSelfServiceOrder({
        ...dto,
        affiliateClickId,
      } as any),
    ).rejects.toThrow(BadRequestException);

    prisma.affiliateClickEvent.findUnique.mockResolvedValueOnce(
      affiliateClickEvent({
        participant: { ...channelParticipant, status: 'SUSPENDED' },
      }),
    );
    await expect(
      service.createSelfServiceOrder({
        ...dto,
        affiliateClickId,
      } as any),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.activationOrder.create).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });
});
