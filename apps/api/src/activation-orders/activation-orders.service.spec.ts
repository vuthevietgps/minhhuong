import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID, scryptSync } from 'node:crypto';

import { MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS } from './activation-orders.service';
import { createActivationOrdersServiceForTestParts } from './activation-orders.testing';

function activationOrdersParts(prisma: any, notifications: any) {
  const parts = createActivationOrdersServiceForTestParts(
    prisma,
    notifications,
  );
  return {
    service: parts.service,
    support: parts.activationOrderSupportService,
  };
}

const opsUser = {
  sub: 'ops-1',
  email: 'ops@example.com',
  roles: ['OPERATIONS'],
};

const saleUser = {
  sub: 'sale-user-1',
  email: 'sale@example.com',
  roles: ['SALE'],
};

const proofFile = (name = 'proof.pdf') =>
  ({
    filename: name,
    originalname: name,
    mimetype: 'application/pdf',
    size: 1024,
  }) as any;

const packageFixture = {
  id: 'pkg-1',
  code: 'basic-30',
  name: 'Basic 30',
  amountVnd: 100000,
  durationDays: 30,
  isActive: true,
};

const childProfile = {
  id: 'child-1',
  parentId: 'parent-1',
  displayName: 'Minh Anh',
};

const channelParticipant = {
  id: 'sale-node-1',
  type: 'SALE',
  userId: 'sale-user-1',
  agencyId: null,
  parentParticipantId: null,
  status: 'ACTIVE',
  lineage: '/root/sale-node-1/',
  depth: 1,
  code: 'SALE01',
  displayName: 'Sale 01',
};

const managerParticipant = {
  id: 'manager-node-1',
  type: 'MANAGER',
  userId: 'manager-user-1',
  agencyId: null,
  parentParticipantId: null,
  status: 'ACTIVE',
  lineage: '/root/manager-node-1/',
  depth: 0,
  code: 'MGR01',
  displayName: 'Manager 01',
};

const affiliateClickId = 'clk_aaaaaaaaaaaaaaaaaaaaaaaa';

function affiliateClickEvent(overrides: Record<string, any> = {}) {
  const createdAt = new Date(Date.now() - 60 * 60 * 1000);
  return {
    id: 'click-event-1',
    affiliateLinkId: 'affiliate-link-1',
    affiliateQrAssetId: 'qr-1',
    participantId: 'sale-node-1',
    agencyId: null,
    agencyMemberId: null,
    referralCode: 'SALE01',
    clickId: affiliateClickId,
    dedupeKeyHash: null,
    ipHash: 'hash-only-ip',
    userAgentHash: 'hash-only-ua',
    deviceHint: 'web',
    redirectUrl: 'https://learn.test/checkout',
    campaign: 'summer2026',
    channel: 'zalo',
    placement: 'poster',
    packageCode: 'basic-30',
    metadataJson: { source: 'public_redirect' },
    createdAt,
    affiliateLink: {
      id: 'affiliate-link-1',
      participantId: 'sale-node-1',
      agencyId: null,
      agencyMemberId: null,
      createdById: 'sale-user-1',
      referralCode: 'SALE01',
      linkCode: 'sale-link-1',
      name: 'Sale link',
      campaign: 'summer2026',
      channel: 'zalo',
      placement: 'poster',
      packageCode: 'basic-30',
      packageScopeJson: null,
      status: 'ACTIVE',
      startsAt: null,
      expiresAt: null,
      metadataJson: null,
      createdAt,
      updatedAt: createdAt,
    },
    participant: channelParticipant,
    agency: null,
    agencyMember: null,
    ...overrides,
  };
}

function affiliateOrderSnapshot(overrides: Record<string, any> = {}) {
  const event = affiliateClickEvent();
  return {
    source: 'affiliate_click',
    clickId: event.clickId,
    affiliateClickEventId: event.id,
    affiliateLinkId: event.affiliateLinkId,
    affiliateQrAssetId: event.affiliateQrAssetId,
    participantId: event.participantId,
    agencyId: event.agencyId,
    agencyMemberId: event.agencyMemberId,
    referralCode: event.referralCode,
    campaign: event.campaign,
    channel: event.channel,
    placement: event.placement,
    packageCode: event.packageCode,
    clickCreatedAt: event.createdAt.toISOString(),
    orderSnapshottedAt: '2026-06-15T01:00:00.000Z',
    attributionModel: 'explicit_click',
    matchConfidence: 'high',
    attributionWindowDays: 30,
    ...overrides,
  };
}

function commissionChainSnapshot(overrides: Record<string, any> = {}) {
  const items = overrides.items ?? [
    {
      depth: 0,
      participantId: 'sale-node-1',
      beneficiaryType: 'SALE',
      beneficiaryId: 'sale-user-1',
      rateBps: 4000,
      agencyId: null,
      agencyMemberId: null,
      parentParticipantId: null,
    },
  ];
  return {
    source: 'affiliate_order_snapshot',
    policyVersion: 'commission_chain_v1',
    snapshottedAt: '2026-06-15T01:00:01.000Z',
    rootParticipantId: 'sale-node-1',
    items,
    ...overrides,
  };
}

function createPrismaMock() {
  const tx = {
    user: {
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    childProfile: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    walletLedgerEntry: {
      create: jest.fn(),
    },
    activationOrder: {
      update: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    idempotencyRecord: {
      create: jest.fn(),
      update: jest.fn(),
    },
    commissionEarning: {
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    commissionLedgerEntry: {
      create: jest.fn(),
    },
    channelParticipant: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    agency: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const prisma = {
    activationPackage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      upsert: jest.fn(),
    },
    userRole: {
      upsert: jest.fn(),
    },
    childProfile: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
    activationOrder: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    affiliateLink: {
      findUnique: jest.fn(),
    },
    affiliateClickEvent: {
      findUnique: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
    },
    idempotencyRecord: {
      findUnique: jest.fn(),
    },
    channelParticipant: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    agency: {
      findUnique: jest.fn(),
    },
    plan: {
      upsert: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
    commissionEarning: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback: (txArg: typeof tx) => unknown) =>
      callback(tx),
    ),
    __tx: tx,
  };

  tx.user.update.mockResolvedValue({ id: 'parent-1', status: 'ACTIVE' });
  tx.payment.create.mockResolvedValue({ id: 'payment-1' });
  tx.payment.updateMany.mockResolvedValue({ count: 1 });
  tx.childProfile.findFirst.mockResolvedValue(null);
  tx.childProfile.create.mockResolvedValue(childProfile);
  tx.subscription.findFirst.mockResolvedValue(null);
  tx.subscription.create.mockResolvedValue({ id: 'subscription-1' });
  tx.subscription.updateMany.mockResolvedValue({ count: 1 });
  tx.walletLedgerEntry.create.mockResolvedValue({ id: 'wallet-entry-1' });
  tx.activationOrder.update.mockImplementation(
    ({ where, data }: { where: { id: string }; data: Record<string, any> }) =>
      Promise.resolve({ id: where.id, ...data }),
  );
  tx.activationOrder.updateMany.mockResolvedValue({ count: 1 });
  tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
    id: 'order-1',
    status: 'APPROVED',
  });
  tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });
  tx.idempotencyRecord.create.mockResolvedValue({ id: 'idem-1' });
  tx.idempotencyRecord.update.mockResolvedValue({ id: 'idem-1' });
  tx.commissionEarning.count.mockResolvedValue(0);
  tx.commissionEarning.create.mockImplementation(
    ({ data }: { data: Record<string, any> }) =>
      Promise.resolve({ id: `earning-${data.depth}`, ...data }),
  );
  tx.channelParticipant.findUnique.mockResolvedValue(null);
  tx.channelParticipant.findFirst.mockResolvedValue(null);
  tx.commissionLedgerEntry.create.mockResolvedValue({ id: 'ledger-1' });
  tx.auditLog.create.mockResolvedValue({ id: 'audit-1' });

  prisma.role.upsert.mockResolvedValue({ id: 'role-parent', name: 'PARENT' });
  prisma.userRole.upsert.mockResolvedValue({});
  prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
  prisma.idempotencyRecord.findUnique.mockResolvedValue(null);
  prisma.activationPackage.findMany.mockResolvedValue([packageFixture]);
  prisma.activationPackage.findUnique.mockResolvedValue(packageFixture);
  prisma.activationOrder.findMany.mockResolvedValue([]);
  prisma.affiliateClickEvent.findUnique.mockResolvedValue(null);
  prisma.orderStatusHistory.findMany.mockResolvedValue([]);
  prisma.orderStatusHistory.create.mockResolvedValue({ id: 'history-root-1' });
  prisma.payment.findFirst.mockResolvedValue({ id: 'payment-1' });
  prisma.plan.upsert.mockResolvedValue({ id: 'manual-plan-1' });
  prisma.subscription.findFirst.mockResolvedValue(null);
  prisma.commissionEarning.updateMany.mockResolvedValue({ count: 1 });
  prisma.agency.findUnique.mockResolvedValue(null);
  prisma.channelParticipant.findUnique.mockResolvedValue(null);

  return prisma;
}

function createService(prisma = createPrismaMock()) {
  const notifications = {
    sendOrderCreated: jest.fn().mockResolvedValue(undefined),
    sendOrderApproved: jest.fn().mockResolvedValue(undefined),
    sendOrderRejected: jest.fn().mockResolvedValue(undefined),
    sendOrderRevoked: jest.fn().mockResolvedValue(undefined),
  };

  return {
    prisma,
    notifications,
    ...activationOrdersParts(prisma, notifications),
  };
}

function pendingApprovalOrder(overrides: Record<string, any> = {}) {
  return {
    id: 'order-1',
    source: 'SELF_SERVICE',
    status: 'PENDING_REVIEW',
    userId: 'parent-1',
    childProfileId: 'child-1',
    createdById: null,
    channelParticipantId: 'sale-node-1',
    agencyId: null,
    referrerMemberId: null,
    customerEmail: 'parent@example.com',
    customerPhone: '0900000000',
    packageCode: 'basic-30',
    packageName: 'Basic 30',
    amountCents: 10000000,
    currency: 'VND',
    durationDays: null,
    requestedDurationDays: 30,
    user: {
      id: 'parent-1',
      email: 'parent@example.com',
      profile: { displayName: 'Parent One' },
    },
    createdBy: null,
    referrerMember: null,
    agency: null,
    channelParticipant,
    commissionEarnings: [],
    ...overrides,
  };
}

describe('ActivationOrdersService P0 commercial flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects buying a package for another parent child profile', async () => {
    const { prisma, service } = createService();
    prisma.user.findUnique.mockResolvedValue({
      id: 'parent-1',
      email: 'parent@example.com',
      status: 'ACTIVE',
    });
    prisma.childProfile.findFirst.mockResolvedValue(null);

    await expect(
      service.createParentSelfServiceOrder(
        { sub: 'parent-1', email: 'parent@example.com', roles: ['PARENT'] },
        { childProfileId: 'someone-elses-child', packageCode: 'basic-30' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.childProfile.findFirst).toHaveBeenCalledWith({
      where: { id: 'someone-elses-child', parentId: 'parent-1' },
      select: { id: true },
    });
    expect(prisma.activationOrder.create).not.toHaveBeenCalled();
  });

  it('requires the existing parent password on the public checkout', async () => {
    const { prisma, support } = createService();
    const salt = randomUUID();
    prisma.user.findUnique.mockResolvedValue({
      id: 'parent-1',
      email: 'parent@example.com',
      status: 'ACTIVE',
      passwordHash: `${salt}:${scryptSync('correct-password', salt, 64).toString('hex')}`,
      roles: [{ role: { name: 'PARENT' } }],
    });
    await expect(
      support.upsertParentAccount(
        { password: 'wrong-password' },
        'parent@example.com',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.userRole.upsert).not.toHaveBeenCalled();
  });

  it('rejects payment proof for an order outside the parent account', async () => {
    const { prisma, service } = createService();
    prisma.activationOrder.findFirst.mockResolvedValue(null);
    await expect(
      service.uploadParentPaymentProof(
        { sub: 'parent-1', email: 'parent@example.com', roles: ['PARENT'] },
        'other-order',
        proofFile(),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.activationOrder.findFirst).toHaveBeenCalledWith({
      where: { id: 'other-order', userId: 'parent-1', source: 'SELF_SERVICE' },
      select: { customerEmail: true },
    });
  });

  it('creates a parent order for the selected child without creating another profile', async () => {
    const { prisma, service } = createService();
    prisma.user.findUnique.mockResolvedValue({
      id: 'parent-1',
      email: 'parent@example.com',
      status: 'ACTIVE',
    });
    prisma.childProfile.findFirst.mockResolvedValue({ id: 'child-2' });
    prisma.activationPackage.findMany.mockResolvedValue([packageFixture]);
    prisma.activationOrder.findFirst.mockResolvedValue(null);
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, any> }) =>
        Promise.resolve({ id: 'order-2', ...data, commissionEarnings: [] }),
    );

    const created = await service.createParentSelfServiceOrder(
      { sub: 'parent-1', email: 'parent@example.com', roles: ['PARENT'] },
      { childProfileId: 'child-2', packageCode: 'basic-30' },
    );
    expect(created.order.childProfileId).toBe('child-2');
    expect(prisma.childProfile.upsert).not.toHaveBeenCalled();
    expect(prisma.activationOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'parent-1',
          childProfileId: 'child-2',
        }),
      }),
    );
  });

  it('reads status history in chronological order with safe metadata', async () => {
    const { prisma, service } = createService();
    const actions = [
      'CREATE_SELF_SERVICE',
      'CREATE_SALE_ASSISTED',
      'UPLOAD_PAYMENT_PROOF',
      'RESUBMIT',
      'APPROVE',
      'REJECT',
      'CANCEL',
      'REVOKE',
    ];

    prisma.activationOrder.findFirst.mockResolvedValue({ id: 'order-1' });
    prisma.orderStatusHistory.findMany.mockResolvedValue(
      actions.map((action, index) => ({
        id: `history-${index + 1}`,
        orderId: 'order-1',
        fromStatus: index === 0 ? null : 'PENDING_REVIEW',
        toStatus: index === 7 ? 'REVOKED' : 'PENDING_REVIEW',
        action,
        actorUserId: index === 0 ? null : 'ops-1',
        actor:
          index === 0
            ? null
            : {
                id: 'ops-1',
                email: 'ops@example.com',
                passwordHash: 'must-not-leak',
                refreshToken: 'must-not-leak',
                roles: [{ role: { name: 'OPERATIONS' } }],
                profile: { displayName: 'Ops One', avatarUrl: 'nope.png' },
              },
        reason: index === 5 ? 'Needs review' : null,
        metadataJson:
          action === 'UPLOAD_PAYMENT_PROOF'
            ? {
                saleInvoiceStorageKey: 'invoices/private-proof.pdf',
                nested: {
                  operationInvoiceUrl:
                    '/uploads/invoices/private-operation.pdf',
                  rawFileContent: 'secret-binary-content',
                },
              }
            : { sequence: index + 1 },
        createdAt: new Date(`2026-06-14T00:0${index}:00.000Z`),
      })),
    );

    const result = await service.getStatusHistory('order-1', opsUser as any);

    expect(prisma.activationOrder.findFirst).toHaveBeenCalledWith({
      where: { AND: [{ id: 'order-1' }, {}] },
      select: { id: true },
    });
    expect(prisma.orderStatusHistory.findMany).toHaveBeenCalledWith({
      where: { orderId: 'order-1' },
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
    expect(result.items.map((item) => item.action)).toEqual(actions);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        action: 'CREATE_SELF_SERVICE',
        actorUserId: null,
        actor: null,
      }),
    );
    expect(result.items[2]).toEqual(
      expect.objectContaining({
        id: 'history-3',
        orderId: 'order-1',
        action: 'UPLOAD_PAYMENT_PROOF',
        actorUserId: 'ops-1',
        actor: {
          id: 'ops-1',
          displayName: 'Ops One',
          email: 'ops@example.com',
        },
        metadataJson: expect.objectContaining({
          saleInvoiceStorageKey: 'private-proof.pdf',
          nested: expect.objectContaining({
            operationInvoiceUrl: 'private-operation.pdf',
            rawFileContent: '[redacted]',
          }),
        }),
      }),
    );
    const serialized = JSON.stringify(result.items);
    expect(serialized).not.toContain('invoices/private-proof.pdf');
    expect(serialized).not.toContain('secret-binary-content');
    expect(serialized).not.toContain('passwordHash');
    expect(serialized).not.toContain('refreshToken');
    expect(serialized).not.toContain('must-not-leak');
    expect(serialized).not.toContain('roles');
    expect(serialized).not.toContain('avatarUrl');
  });

  it('does not read status history for an inaccessible order', async () => {
    const { prisma, service } = createService();

    prisma.activationOrder.findFirst.mockResolvedValue(null);

    await expect(
      service.getStatusHistory('order-1', saleUser as any),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.activationOrder.findFirst).toHaveBeenCalledWith({
      where: { AND: [{ id: 'order-1' }, { createdById: 'sale-user-1' }] },
      select: { id: true },
    });
    expect(prisma.orderStatusHistory.findMany).not.toHaveBeenCalled();
  });

  it('covers self-service payment proof and approval into subscription and commission', async () => {
    const { prisma, notifications, service } = createService();

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'parent-1',
      email: 'parent@example.com',
      profile: { displayName: 'Parent One' },
    });
    prisma.childProfile.findFirst.mockResolvedValue(null);
    prisma.childProfile.upsert.mockResolvedValue(childProfile);
    prisma.activationOrder.findFirst.mockResolvedValue(null);
    prisma.activationOrder.create.mockImplementation(
      ({ data }: { data: Record<string, any> }) =>
        Promise.resolve({
          id: 'order-1',
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
    });

    expect(created.order.status).toBe('WAITING_PAYMENT');
    expect(prisma.activationOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'SELF_SERVICE',
          status: 'WAITING_PAYMENT',
          amountCents: 10000000,
          requestedDurationDays: 30,
          userId: 'parent-1',
          childProfileId: 'child-1',
          statusHistory: expect.objectContaining({
            create: expect.objectContaining({
              fromStatus: null,
              toStatus: 'WAITING_PAYMENT',
              action: 'CREATE_SELF_SERVICE',
              actorUserId: 'parent-1',
            }),
          }),
        }),
      }),
    );
    const selfServiceCreateData =
      prisma.activationOrder.create.mock.calls[0][0].data;
    expect(selfServiceCreateData).not.toHaveProperty(
      'affiliateAttributionSnapshotJson',
    );
    expect(prisma.affiliateClickEvent.findUnique).not.toHaveBeenCalled();
    expect(notifications.sendOrderCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'parent@example.com',
        packageName: 'Basic 30',
      }),
    );

    prisma.activationOrder.findUnique.mockResolvedValue({
      id: 'order-1',
      source: 'SELF_SERVICE',
      status: 'WAITING_PAYMENT',
      userId: 'parent-1',
      customerEmail: 'parent@example.com',
    });
    prisma.activationOrder.update.mockImplementation(
      ({ data }: { data: Record<string, any> }) =>
        Promise.resolve({ id: 'order-1', ...data }),
    );
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValueOnce({
      id: 'order-1',
      status: 'PENDING_REVIEW',
      saleInvoiceStorageKey: 'invoices/proof.pdf',
    });

    const proofed = await service.uploadSelfServicePaymentProof(
      'order-1',
      { email: 'parent@example.com' },
      proofFile(),
    );

    expect(proofed.status).toBe('PENDING_REVIEW');
    expect(prisma.__tx.activationOrder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING_REVIEW',
          saleInvoiceStorageKey: 'invoices/proof.pdf',
        }),
      }),
    );
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'WAITING_PAYMENT',
          toStatus: 'PENDING_REVIEW',
          action: 'UPLOAD_PAYMENT_PROOF',
          actorUserId: 'parent-1',
          metadataJson: expect.objectContaining({
            previousStatus: 'WAITING_PAYMENT',
            saleInvoiceStorageKey: 'invoices/proof.pdf',
          }),
        }),
      }),
    );
    expect(
      prisma.__tx.activationOrder.updateMany.mock.calls[0][0].data,
    ).not.toHaveProperty('affiliateAttributionSnapshotJson');

    const approvalOrder = pendingApprovalOrder({
      affiliateAttributionSnapshotJson: affiliateOrderSnapshot(),
      commissionChainSnapshotJson: commissionChainSnapshot(),
    });
    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);
    prisma.__tx.activationOrder.findUniqueOrThrow.mockResolvedValue({
      ...approvalOrder,
      status: 'APPROVED',
    });

    const approved = await service.approveOrder(
      'order-1',
      { durationDays: 30, reviewNotes: 'ok' },
      proofFile('operation-invoice.pdf'),
      opsUser as any,
    );

    expect(approved.status).toBe('APPROVED');
    expect(prisma.__tx.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          childProfileId: 'child-1',
          providerRef: 'order-1',
          sourceOrderId: 'order-1',
          activationPackageId: 'pkg-1',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(prisma.__tx.commissionEarning.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activationOrderId: 'order-1',
          participantId: 'sale-node-1',
          status: 'PENDING',
        }),
      }),
    );
    expect(prisma.__tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'PENDING_REVIEW',
          toStatus: 'APPROVED',
          action: 'APPROVE',
          actorUserId: 'ops-1',
          reason: 'ok',
        }),
      }),
    );
    const approveUpdate =
      prisma.__tx.activationOrder.updateMany.mock.calls.find(
        ([arg]: any[]) => arg.data.status === 'APPROVED',
      )?.[0];
    expect(approveUpdate.data).not.toHaveProperty(
      'affiliateAttributionSnapshotJson',
    );
  });

  it('blocks self-service multi-child packages before parent or order creation', async () => {
    const { prisma, notifications, service } = createService();

    prisma.activationPackage.findMany.mockResolvedValueOnce([
      {
        ...packageFixture,
        code: 'family-30',
        name: 'Family 30',
        entitlements: [
          {
            entitlementKey: 'CHILD_COUNT',
            valueJson: { limit: 2 },
            status: 'ACTIVE',
          },
        ],
      },
    ]);

    await expect(
      service.createSelfServiceOrder({
        email: 'parent@example.com',
        password: 'Password123!',
        displayName: 'Minh Anh',
        packageCode: 'family-30',
      } as any),
    ).rejects.toThrow('Manual paid pilot supports one child per order only');

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.childProfile.upsert).not.toHaveBeenCalled();
    expect(prisma.activationOrder.create).not.toHaveBeenCalled();
    expect(notifications.sendOrderCreated).not.toHaveBeenCalled();
  });

  it('blocks sale-assisted multi-child packages before learner or order creation', async () => {
    const { prisma, service } = createService();

    prisma.activationPackage.findUnique.mockResolvedValueOnce({
      ...packageFixture,
      code: 'family-30',
      name: 'Family 30',
      entitlements: [
        {
          entitlementKey: 'CHILD_COUNT',
          valueJson: { count: 2 },
          status: 'ACTIVE',
        },
      ],
    });

    await expect(
      service.createOrder(
        {
          email: 'parent@example.com',
          displayName: 'Parent One',
          amountVnd: 100000,
          packageCode: 'family-30',
          requestedDurationDays: 30,
        } as any,
        proofFile('sale-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow('Manual paid pilot supports one child per order only');

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.activationOrder.create).not.toHaveBeenCalled();
  });

  it('blocks approval of queued multi-child orders before transaction side effects', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      packageCode: 'family-30',
      packageName: 'Family 30',
      entitlementSnapshotJson: {
        packageCode: 'family-30',
        packageName: 'Family 30',
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [{ key: 'CHILD_COUNT', value: { maxChildren: 2 } }],
        capturedAt: '2026-06-14T00:00:00.000Z',
        snapshotSource: 'PACKAGE_ENTITLEMENT',
      },
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 30, reviewNotes: 'unsupported family package' } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow('Manual paid pilot supports one child per order only');

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.childProfile.findFirst).not.toHaveBeenCalled();
    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });

  it('blocks approval of legacy queued multi-child packages before manual plan or transaction side effects', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      packageCode: 'family-30',
      packageName: 'Family 30',
      entitlementSnapshotJson: null,
    });

    prisma.activationPackage.findUnique.mockResolvedValueOnce({
      ...packageFixture,
      code: 'family-30',
      name: 'Family 30',
      entitlements: [
        {
          entitlementKey: 'CHILD_COUNT',
          valueJson: { maxChildren: 2 },
          status: 'ACTIVE',
        },
      ],
    });
    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);

    await expect(
      service.approveOrder(
        'order-1',
        { durationDays: 30, reviewNotes: 'legacy family package' } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow('Manual paid pilot supports one child per order only');

    expect(prisma.plan.upsert).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
  });

  it('blocks approval of queued orders with invalid child-count snapshots before transaction side effects', async () => {
    const { prisma, service } = createService();
    const approvalOrder = pendingApprovalOrder({
      packageCode: 'pilot-30',
      packageName: 'Pilot 30',
      entitlementSnapshotJson: {
        packageCode: 'pilot-30',
        packageName: 'Pilot 30',
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [{ key: 'CHILD_COUNT', value: { maxChildren: 0 } }],
        capturedAt: '2026-06-14T00:00:00.000Z',
        snapshotSource: 'PACKAGE_ENTITLEMENT',
      },
    });

    prisma.activationOrder.findUnique.mockResolvedValue(approvalOrder);

    await expect(
      service.approveOrder(
        'order-1',
        {
          durationDays: 30,
          reviewNotes: 'invalid child count snapshot',
        } as any,
        proofFile('operation-invoice.pdf'),
        opsUser as any,
      ),
    ).rejects.toThrow('Manual paid pilot supports one child per order only');

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.__tx.childProfile.findFirst).not.toHaveBeenCalled();
    expect(prisma.__tx.activationOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.__tx.subscription.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionEarning.create).not.toHaveBeenCalled();
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
