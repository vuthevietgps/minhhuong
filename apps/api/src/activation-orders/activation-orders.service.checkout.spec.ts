import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID, scryptSync } from 'node:crypto';
import {
  affiliateOrderSnapshot,
  childProfile,
  commissionChainSnapshot,
  createService,
  opsUser,
  packageFixture,
  pendingApprovalOrder,
  proofFile,
  saleUser,
} from './activation-orders.service.spec-fixtures';

describe('ActivationOrdersService P0 commercial flows (checkout and multi-child guards)', () => {
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
});
