import { BadRequestException } from '@nestjs/common';
import { createChannelAdminServiceForTest } from './channel-admin.testing';

describe('Agency application approval', () => {
  const admin = {
    sub: 'admin-1',
    email: 'admin@example.test',
    roles: ['ADMIN'],
  } as any;
  const pending = {
    id: 'app-1',
    email: 'owner@example.test',
    passwordHash: 'stored-password-hash',
    agencyName: 'Hà Nội Learning',
    requestedCode: 'HN-LEARNING',
    status: 'PENDING_REVIEW',
  };
  const tx = {
    agencyApplication: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    user: { findUnique: jest.fn(), create: jest.fn() },
    agency: { findUnique: jest.fn(), create: jest.fn() },
    agencyMember: { findUnique: jest.fn() },
    channelParticipant: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const prisma = {
    agencyApplication: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: { findUnique: jest.fn(), create: jest.fn() },
    agency: { findUnique: jest.fn(), create: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const notification = {
    sendAgencyApplicationApproved: jest.fn(),
    sendAgencyApplicationRejected: jest.fn(),
  };
  const service = createChannelAdminServiceForTest(
    prisma as any,
    notification as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.agency.findUnique.mockResolvedValue(null);
    prisma.agencyApplication.findUnique.mockResolvedValue(null);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    tx.agencyApplication.findUnique.mockResolvedValue(pending);
    tx.agencyApplication.updateMany.mockResolvedValue({ count: 1 });
    tx.agencyApplication.update.mockResolvedValue({ id: 'app-1' });
    tx.user.findUnique.mockResolvedValue(null);
    tx.user.create.mockResolvedValue({ id: 'owner-1' });
    tx.agency.findUnique.mockResolvedValue(null);
    tx.agency.create.mockResolvedValue({ id: 'agency-1', code: 'HN-LEARNING' });
    tx.agencyMember.findUnique.mockResolvedValue(null);
    tx.channelParticipant.findUnique.mockResolvedValue(null);
    tx.channelParticipant.create.mockResolvedValue({ id: 'participant-1' });
    tx.channelParticipant.update.mockResolvedValue({ id: 'participant-1' });
    prisma.agencyApplication.create.mockResolvedValue({
      id: 'app-1',
      status: 'PENDING_REVIEW',
    });
  });

  it('accepts an application without granting a sales role', async () => {
    await expect(
      service.applyForAgency({
        email: 'OWNER@example.test',
        password: 'secret123',
        agencyName: 'Hà Nội Learning',
        requestedCode: 'HN-LEARNING',
      }),
    ).resolves.toEqual({ id: 'app-1', status: 'PENDING_REVIEW' });
    expect(prisma.agencyApplication.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'owner@example.test',
          requestedCode: 'HN-LEARNING',
          status: 'PENDING_REVIEW',
        }),
      }),
    );
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.agency.create).not.toHaveBeenCalled();
  });

  it('creates one owner, agency, and participant only after approval', async () => {
    prisma.agencyApplication.findUnique.mockResolvedValue({
      email: pending.email,
    });
    await expect(
      service.approveAgencyApplication('app-1', admin),
    ).resolves.toMatchObject({
      status: 'APPROVED',
      code: 'HN-LEARNING',
      agencyId: 'agency-1',
    });
    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: pending.email,
          roles: expect.objectContaining({ create: expect.anything() }),
        }),
      }),
    );
    expect(tx.channelParticipant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'AGENCY',
          code: 'HN-LEARNING',
          userId: 'owner-1',
        }),
      }),
    );
    expect(tx.agencyApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { agencyId: 'agency-1', passwordHash: null },
      }),
    );
    expect(notification.sendAgencyApplicationApproved).toHaveBeenCalledWith(
      pending.email,
      'HN-LEARNING',
    );
  });

  it('blocks a repeated approval before creating an account', async () => {
    tx.agencyApplication.findUnique.mockResolvedValue({
      ...pending,
      status: 'APPROVED',
    });
    await expect(
      service.approveAgencyApplication('app-1', admin),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it('rejects a pending application without creating sales access', async () => {
    prisma.agencyApplication.updateMany.mockResolvedValue({ count: 1 });
    prisma.agencyApplication.findUnique.mockResolvedValue({
      email: pending.email,
    });
    await expect(
      service.rejectAgencyApplication(
        'app-1',
        { reviewNotes: 'Missing details' },
        admin,
      ),
    ).resolves.toEqual({ id: 'app-1', status: 'REJECTED' });
    expect(prisma.agencyApplication.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'REJECTED',
          passwordHash: null,
        }),
      }),
    );
    expect(tx.user.create).not.toHaveBeenCalled();
    expect(notification.sendAgencyApplicationRejected).toHaveBeenCalledWith(
      pending.email,
    );
  });

  it('blocks approval when the requested code belongs to a channel participant', async () => {
    tx.channelParticipant.findUnique.mockResolvedValue({
      id: 'existing-participant',
    });
    await expect(
      service.approveAgencyApplication('app-1', admin),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.agencyApplication.updateMany).not.toHaveBeenCalled();
    expect(tx.agency.create).not.toHaveBeenCalled();
  });
});
