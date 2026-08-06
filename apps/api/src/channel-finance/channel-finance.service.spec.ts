import { BadRequestException, ConflictException } from '@nestjs/common';

import { ChannelFinanceService } from './channel-finance.service';

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

const payoutFile = (name = 'payout.pdf') =>
  ({
    filename: name,
    originalname: name,
    mimetype: 'application/pdf',
    size: 2048,
  }) as any;

const actorParticipant = {
  id: 'sale-node-1',
  type: 'SALE',
  userId: 'sale-user-1',
  agencyId: null,
  lineage: '/root/agency/sale-node-1/',
};

const payout = {
  id: 'payout-1',
  participantId: 'sale-node-1',
  beneficiaryUserId: 'sale-user-1',
  beneficiaryAgencyId: null,
  status: 'PENDING_REVIEW',
  amountCents: 5000000,
  currency: 'VND',
};

function createPrismaMock() {
  const tx = {
    payoutRequest: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    commissionLedgerEntry: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    idempotencyRecord: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const prisma = {
    activationOrder: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    payoutRequest: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    idempotencyRecord: {
      findUnique: jest.fn(),
    },
    commissionLedgerEntry: {
      findMany: jest.fn(),
    },
    commissionEarning: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    channelParticipant: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    agency: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback: (txArg: typeof tx) => unknown) =>
      callback(tx),
    ),
    __tx: tx,
  };

  prisma.activationOrder.count.mockResolvedValue(0);
  prisma.activationOrder.aggregate.mockResolvedValue({
    _sum: { amountCents: 0 },
    _count: 0,
  });
  prisma.activationOrder.groupBy.mockResolvedValue([]);
  prisma.activationOrder.findMany.mockResolvedValue([]);
  prisma.payoutRequest.aggregate.mockResolvedValue({
    _sum: { amountCents: 0 },
    _count: 0,
  });
  prisma.payoutRequest.groupBy.mockResolvedValue([]);
  prisma.payoutRequest.findMany.mockResolvedValue([]);
  prisma.commissionLedgerEntry.findMany.mockResolvedValue([]);
  prisma.commissionEarning.findMany.mockResolvedValue([]);
  prisma.commissionEarning.aggregate.mockResolvedValue({
    _sum: { amountCents: 0 },
    _count: 0,
  });
  prisma.commissionEarning.groupBy.mockResolvedValue([]);
  prisma.channelParticipant.findFirst.mockResolvedValue(actorParticipant);
  prisma.agency.findUnique.mockResolvedValue(null);
  tx.payoutRequest.create.mockResolvedValue(payout);
  tx.payoutRequest.updateMany.mockResolvedValue({ count: 1 });
  tx.payoutRequest.findUniqueOrThrow.mockResolvedValue({
    ...payout,
    status: 'PAID',
  });
  tx.commissionLedgerEntry.create.mockResolvedValue({ id: 'ledger-1' });
  tx.commissionLedgerEntry.createMany.mockResolvedValue({ count: 2 });
  tx.idempotencyRecord.create.mockResolvedValue({ id: 'idem-1' });
  tx.idempotencyRecord.update.mockResolvedValue({ id: 'idem-1' });
  prisma.idempotencyRecord.findUnique.mockResolvedValue(null);

  return prisma;
}

function createService(prisma = createPrismaMock()) {
  return {
    prisma,
    service: new ChannelFinanceService(prisma as any),
  };
}

describe('ChannelFinanceService P0 finance flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates payout requests by holding available commission balance', async () => {
    const { prisma, service } = createService();

    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 10000000, currency: 'VND' },
    ]);

    await service.createPayoutRequest(
      {
        amountVnd: 50000,
        bankName: ' VCB ',
        bankAccountNumber: ' 123456 ',
        bankAccountName: ' SALE ONE ',
      },
      saleUser as any,
    );

    expect(prisma.__tx.payoutRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          amountCents: 5000000,
          bankName: 'VCB',
          bankAccountNumber: '123456',
          bankAccountName: 'SALE ONE',
        }),
      }),
    );
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          type: 'HOLD',
          amountCents: 5000000,
          referenceType: 'PayoutRequest',
          referenceId: 'payout-1',
        }),
      }),
    );
  });

  it('blocks payout requests while released commission is under manual refund review', async () => {
    const { prisma, service } = createService();

    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 10000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-open',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_OPENED' }],
        },
      },
    ]);

    await expect(
      service.createPayoutRequest(
        {
          amountVnd: 50000,
          bankName: 'VCB',
          bankAccountNumber: '123456',
          bankAccountName: 'SALE ONE',
        } as any,
        saleUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.commissionEarning.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          participantId: 'sale-node-1',
          status: 'AVAILABLE',
          activationOrder: {
            is: expect.objectContaining({
              statusHistory: {
                some: { action: 'MANUAL_REFUND_REQUEST_OPENED' },
              },
            }),
          },
        }),
      }),
    );
    expect(prisma.__tx.payoutRequest.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('blocks payout requests after refund approval revokes a source order with stale available commission', async () => {
    const { prisma, service } = createService();

    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 10000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-approved-revoked',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_APPROVED' }],
        },
      },
    ]);

    await expect(
      service.createPayoutRequest(
        {
          amountVnd: 50000,
          bankName: 'VCB',
          bankAccountNumber: '123456',
          bankAccountName: 'SALE ONE',
        } as any,
        saleUser as any,
      ),
    ).rejects.toThrow(
      'Payout blocked because released commission was approved for manual refund',
    );

    const activationOrderWhere =
      prisma.commissionEarning.findMany.mock.calls[0][0].where.activationOrder
        .is;
    expect(activationOrderWhere).not.toHaveProperty('status');
    expect(activationOrderWhere).toEqual(
      expect.objectContaining({
        statusHistory: {
          some: { action: 'MANUAL_REFUND_REQUEST_OPENED' },
        },
      }),
    );
    expect(prisma.__tx.payoutRequest.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('blocks payout requests when the latest manual refund review is approved', async () => {
    const { prisma, service } = createService();

    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 10000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-approved',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_APPROVED' }],
        },
      },
    ]);

    await expect(
      service.createPayoutRequest(
        {
          amountVnd: 50000,
          bankName: 'VCB',
          bankAccountNumber: '123456',
          bankAccountName: 'SALE ONE',
        } as any,
        saleUser as any,
      ),
    ).rejects.toThrow(
      'Payout blocked because released commission was approved for manual refund',
    );

    expect(prisma.commissionEarning.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
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
    expect(prisma.__tx.payoutRequest.create).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('allows payout requests after the latest manual refund review is rejected', async () => {
    const { prisma, service } = createService();

    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 10000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-rejected',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_REJECTED' }],
        },
      },
    ]);

    await service.createPayoutRequest(
      {
        amountVnd: 50000,
        bankName: 'VCB',
        bankAccountNumber: '123456',
        bankAccountName: 'SALE ONE',
      },
      saleUser as any,
    );

    expect(prisma.commissionEarning.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          participantId: 'sale-node-1',
          status: 'AVAILABLE',
          activationOrder: {
            is: expect.objectContaining({
              statusHistory: {
                some: { action: 'MANUAL_REFUND_REQUEST_OPENED' },
              },
            }),
          },
        }),
      }),
    );
    expect(prisma.__tx.payoutRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          amountCents: 5000000,
        }),
      }),
    );
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          beneficiaryUserId: 'sale-user-1',
          type: 'HOLD',
          amountCents: 5000000,
          referenceType: 'PayoutRequest',
        }),
      }),
    );
  });

  it('pays a payout request with release and debit ledger entries', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);

    const paid = await service.payPayoutRequest(
      'payout-1',
      { reviewNotes: 'paid' },
      payoutFile(),
      opsUser as any,
    );

    expect(paid.status).toBe('PAID');
    expect(prisma.__tx.payoutRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'payout-1',
          status: { in: ['PENDING_REVIEW', 'APPROVED'] },
        },
        data: expect.objectContaining({
          status: 'PAID',
          reviewNotes: 'paid',
          payoutInvoiceStorageKey: 'invoices/payout.pdf',
        }),
      }),
    );
    expect(prisma.__tx.commissionLedgerEntry.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          type: 'RELEASE',
          referenceType: 'PayoutRequest',
          referenceId: 'payout-1',
        }),
        expect.objectContaining({
          type: 'DEBIT',
          referenceType: 'PayoutRequest',
          referenceId: 'payout-1',
        }),
      ],
    });
  });

  it('blocks payout payment when refund clawback leaves the held balance underfunded', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 5000000, currency: 'VND' },
      { type: 'HOLD', amountCents: 5000000, currency: 'VND' },
      { type: 'DEBIT', amountCents: 1000000, currency: 'VND' },
    ]);

    await expect(
      service.payPayoutRequest(
        'payout-1',
        { reviewNotes: 'paid after refund' } as any,
        payoutFile(),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.payoutRequest.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.createMany).not.toHaveBeenCalled();
    expect(prisma.__tx.idempotencyRecord.create).not.toHaveBeenCalled();
  });

  it('blocks payout payment while released commission is under manual refund review', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 5000000, currency: 'VND' },
      { type: 'HOLD', amountCents: 5000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-open',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_OPENED' }],
        },
      },
    ]);

    await expect(
      service.payPayoutRequest(
        'payout-1',
        { reviewNotes: 'pay after refund review' } as any,
        payoutFile(),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.payoutRequest.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.createMany).not.toHaveBeenCalled();
    expect(prisma.__tx.idempotencyRecord.create).not.toHaveBeenCalled();
  });

  it('blocks payout payment after refund approval revokes a source order with stale available commission', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 5000000, currency: 'VND' },
      { type: 'HOLD', amountCents: 5000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-approved-revoked',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_APPROVED' }],
        },
      },
    ]);

    await expect(
      service.payPayoutRequest(
        'payout-1',
        { reviewNotes: 'pay after approved refund review' } as any,
        payoutFile(),
        opsUser as any,
      ),
    ).rejects.toThrow(
      'Payout blocked because released commission was approved for manual refund',
    );

    const activationOrderWhere =
      prisma.commissionEarning.findMany.mock.calls[0][0].where.activationOrder
        .is;
    expect(activationOrderWhere).not.toHaveProperty('status');
    expect(activationOrderWhere).toEqual(
      expect.objectContaining({
        statusHistory: {
          some: { action: 'MANUAL_REFUND_REQUEST_OPENED' },
        },
      }),
    );
    expect(prisma.__tx.payoutRequest.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.createMany).not.toHaveBeenCalled();
    expect(prisma.__tx.idempotencyRecord.create).not.toHaveBeenCalled();
  });

  it('blocks payout payment when the latest manual refund review is approved', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 5000000, currency: 'VND' },
      { type: 'HOLD', amountCents: 5000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-approved',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_APPROVED' }],
        },
      },
    ]);

    await expect(
      service.payPayoutRequest(
        'payout-1',
        { reviewNotes: 'pay after approved refund review' } as any,
        payoutFile(),
        opsUser as any,
      ),
    ).rejects.toThrow(
      'Payout blocked because released commission was approved for manual refund',
    );

    expect(prisma.__tx.payoutRequest.updateMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.createMany).not.toHaveBeenCalled();
    expect(prisma.__tx.idempotencyRecord.create).not.toHaveBeenCalled();
  });

  it('allows payout payment after the latest manual refund review is rejected', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: 'CREDIT', amountCents: 5000000, currency: 'VND' },
      { type: 'HOLD', amountCents: 5000000, currency: 'VND' },
    ]);
    prisma.commissionEarning.findMany.mockResolvedValue([
      {
        id: 'earning-refund-rejected',
        activationOrderId: 'order-1',
        activationOrder: {
          statusHistory: [{ action: 'MANUAL_REFUND_REQUEST_REJECTED' }],
        },
      },
    ]);

    const paid = await service.payPayoutRequest(
      'payout-1',
      { reviewNotes: 'pay after rejected refund review' },
      payoutFile(),
      opsUser as any,
    );

    expect(paid.status).toBe('PAID');
    expect(prisma.commissionEarning.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          activationOrder: expect.objectContaining({
            select: expect.objectContaining({
              statusHistory: expect.objectContaining({
                where: {
                  action: {
                    in: [
                      'MANUAL_REFUND_REQUEST_OPENED',
                      'MANUAL_REFUND_REQUEST_APPROVED',
                      'MANUAL_REFUND_REQUEST_REJECTED',
                    ],
                  },
                },
              }),
            }),
          }),
        }),
      }),
    );
    expect(prisma.__tx.payoutRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'payout-1',
          status: { in: ['PENDING_REVIEW', 'APPROVED'] },
        },
        data: expect.objectContaining({
          status: 'PAID',
          reviewNotes: 'pay after rejected refund review',
        }),
      }),
    );
    expect(prisma.__tx.commissionLedgerEntry.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          type: 'RELEASE',
          referenceType: 'PayoutRequest',
          referenceId: 'payout-1',
        }),
        expect.objectContaining({
          type: 'DEBIT',
          referenceType: 'PayoutRequest',
          referenceId: 'payout-1',
        }),
      ],
    });
  });

  it('guards repeated payout payment against duplicate ledger writes', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.__tx.payoutRequest.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await service.payPayoutRequest(
      'payout-1',
      {},
      payoutFile(),
      opsUser as any,
    );

    await expect(
      service.payPayoutRequest(
        'payout-1',
        {} as any,
        payoutFile(),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.commissionLedgerEntry.createMany).toHaveBeenCalledTimes(
      1,
    );
  });

  it('replays payout payment with the same idempotency key without duplicate ledger writes', async () => {
    const { prisma, service } = createService();
    const paidResponse = { ...payout, status: 'PAID' };

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.__tx.payoutRequest.findUniqueOrThrow.mockResolvedValue(paidResponse);
    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);

    await service.payPayoutRequest(
      'payout-1',
      { reviewNotes: 'paid' },
      payoutFile(),
      opsUser as any,
      'payout-pay-key-01',
    );

    const requestHash =
      prisma.__tx.idempotencyRecord.create.mock.calls[0][0].data.requestHash;
    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash,
      status: 'SUCCEEDED',
      responseJson: paidResponse,
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    const replayed = await service.payPayoutRequest(
      'payout-1',
      { reviewNotes: 'paid' },
      payoutFile(),
      opsUser as any,
      'payout-pay-key-01',
    );

    expect(replayed).toEqual(paidResponse);
    expect(prisma.__tx.commissionLedgerEntry.createMany).toHaveBeenCalledTimes(
      1,
    );
    expect(prisma.__tx.idempotencyRecord.update).toHaveBeenCalledTimes(1);
  });

  it('rejects payout payment with the same idempotency key and different payload', async () => {
    const { prisma, service } = createService();

    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash: 'different-request-hash',
      status: 'SUCCEEDED',
      responseJson: { ...payout, status: 'PAID' },
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    await expect(
      service.payPayoutRequest(
        'payout-1',
        { reviewNotes: 'changed' } as any,
        payoutFile(),
        opsUser as any,
        'payout-pay-key-02',
      ),
    ).rejects.toThrow(ConflictException);

    expect(prisma.__tx.commissionLedgerEntry.createMany).not.toHaveBeenCalled();
  });

  it('rejects payout requests by releasing held funds once', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.__tx.payoutRequest.findUniqueOrThrow.mockResolvedValue({
      ...payout,
      status: 'REJECTED',
    });

    const rejected = await service.rejectPayoutRequest(
      'payout-1',
      { reviewNotes: 'invalid account' },
      opsUser as any,
    );

    expect(rejected.status).toBe('REJECTED');
    expect(prisma.__tx.payoutRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'payout-1', status: 'PENDING_REVIEW' },
        data: expect.objectContaining({
          status: 'REJECTED',
          reviewNotes: 'invalid account',
        }),
      }),
    );
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: 'sale-node-1',
          type: 'RELEASE',
          referenceType: 'PayoutRequest',
          referenceId: 'payout-1',
        }),
      }),
    );
  });

  it('guards repeated payout rejection against duplicate release ledger writes', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.__tx.payoutRequest.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    prisma.__tx.payoutRequest.findUniqueOrThrow.mockResolvedValue({
      ...payout,
      status: 'REJECTED',
    });

    await service.rejectPayoutRequest('payout-1', {}, opsUser as any);

    await expect(
      service.rejectPayoutRequest('payout-1', {} as any, opsUser as any),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledTimes(1);
  });

  it('replays payout rejection with the same idempotency key without duplicate release', async () => {
    const { prisma, service } = createService();
    const rejectedResponse = { ...payout, status: 'REJECTED' };

    prisma.payoutRequest.findUnique.mockResolvedValue(payout);
    prisma.__tx.payoutRequest.findUniqueOrThrow.mockResolvedValue(
      rejectedResponse,
    );
    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);

    await service.rejectPayoutRequest(
      'payout-1',
      { reviewNotes: 'invalid account' },
      opsUser as any,
      'payout-reject-key-01',
    );

    const requestHash =
      prisma.__tx.idempotencyRecord.create.mock.calls[0][0].data.requestHash;
    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash,
      status: 'SUCCEEDED',
      responseJson: rejectedResponse,
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    const replayed = await service.rejectPayoutRequest(
      'payout-1',
      { reviewNotes: 'invalid account' },
      opsUser as any,
      'payout-reject-key-01',
    );

    expect(replayed).toEqual(rejectedResponse);
    expect(prisma.__tx.commissionLedgerEntry.create).toHaveBeenCalledTimes(1);
    expect(prisma.__tx.idempotencyRecord.update).toHaveBeenCalledTimes(1);
  });

  it('rejects payout rejection with the same idempotency key and different payload', async () => {
    const { prisma, service } = createService();

    prisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
      requestHash: 'different-request-hash',
      status: 'SUCCEEDED',
      responseJson: { ...payout, status: 'REJECTED' },
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    await expect(
      service.rejectPayoutRequest(
        'payout-1',
        { reviewNotes: 'changed' } as any,
        opsUser as any,
        'payout-reject-key-02',
      ),
    ).rejects.toThrow(ConflictException);

    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('blocks terminal payout transitions before ledger writes', async () => {
    const { prisma, service } = createService();

    prisma.payoutRequest.findUnique
      .mockResolvedValueOnce({ ...payout, status: 'REJECTED' })
      .mockResolvedValueOnce({ ...payout, status: 'PAID' });

    await expect(
      service.payPayoutRequest(
        'payout-1',
        {} as any,
        payoutFile(),
        opsUser as any,
      ),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.rejectPayoutRequest('payout-1', {} as any, opsUser as any),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.__tx.commissionLedgerEntry.createMany).not.toHaveBeenCalled();
    expect(prisma.__tx.commissionLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('scopes non-admin finance overview to the actor channel subtree and own orders', async () => {
    const { prisma, service } = createService();

    prisma.activationOrder.count.mockResolvedValue(3);

    await service.getOverview(saleUser as any);

    expect(prisma.activationOrder.count).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            channelParticipant: {
              is: {
                lineage: { startsWith: '/root/agency/sale-node-1/' },
              },
            },
          },
          { createdById: 'sale-user-1' },
        ],
      },
    });
    expect(prisma.activationOrder.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'APPROVED',
        }),
      }),
    );
  });

  it('returns an empty finance scope when a non-admin has no channel participant', async () => {
    const { prisma, service } = createService();

    prisma.channelParticipant.findFirst.mockResolvedValue(null);

    await service.getOverview(saleUser as any);

    expect(prisma.activationOrder.count).toHaveBeenCalledWith({
      where: { id: '__none__' },
    });
    expect(prisma.commissionLedgerEntry.findMany).toHaveBeenCalledWith({
      where: { id: '__none__' },
      select: { type: true, amountCents: true, currency: true },
    });
  });
});
