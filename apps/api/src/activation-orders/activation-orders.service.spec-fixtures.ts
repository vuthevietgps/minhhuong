// Shared fixtures for the activation-orders.service specs (test-only).
import { createActivationOrdersServiceForTestParts } from './activation-orders.testing';

export function activationOrdersParts(prisma: any, notifications: any) {
  const parts = createActivationOrdersServiceForTestParts(
    prisma,
    notifications,
  );
  return {
    service: parts.service,
    support: parts.activationOrderSupportService,
  };
}

export const opsUser = {
  sub: 'ops-1',
  email: 'ops@example.com',
  roles: ['OPERATIONS'],
};

export const saleUser = {
  sub: 'sale-user-1',
  email: 'sale@example.com',
  roles: ['SALE'],
};

export const proofFile = (name = 'proof.pdf') =>
  ({
    filename: name,
    originalname: name,
    mimetype: 'application/pdf',
    size: 1024,
  }) as any;

export const packageFixture = {
  id: 'pkg-1',
  code: 'basic-30',
  name: 'Basic 30',
  amountVnd: 100000,
  durationDays: 30,
  isActive: true,
};

export const childProfile = {
  id: 'child-1',
  parentId: 'parent-1',
  displayName: 'Minh Anh',
};

export const channelParticipant = {
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

export const managerParticipant = {
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

export const affiliateClickId = 'clk_aaaaaaaaaaaaaaaaaaaaaaaa';

export function affiliateClickEvent(overrides: Record<string, any> = {}) {
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

export function affiliateOrderSnapshot(overrides: Record<string, any> = {}) {
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

export function commissionChainSnapshot(overrides: Record<string, any> = {}) {
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

export function createPrismaMock() {
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

export function createService(prisma = createPrismaMock()) {
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

export function pendingApprovalOrder(overrides: Record<string, any> = {}) {
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
