import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { EntitlementService } from '../entitlement/entitlement.service';
import type { ChildAccessService } from '../learning-access/child-access.service';
import type { LearningPathService } from '../learning-path/learning-path.service';
import type { PrismaService } from '../prisma/prisma.service';
import { UploadObjectAccessService } from './upload-object-access.service';

const user = (
  sub: string,
  roles: AuthenticatedUser['roles'],
): AuthenticatedUser => ({ sub, email: `${sub}@example.test`, roles });

const createFixture = () => {
  const prisma = {
    videoAsset: { findFirst: jest.fn() },
    activationOrder: { findFirst: jest.fn() },
    payoutRequest: { findFirst: jest.fn() },
    auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
  };
  const childAccess = { assertCanAccessChild: jest.fn().mockResolvedValue({}) };
  const entitlement = { assertCapability: jest.fn().mockResolvedValue({}) };
  const learningPath = {
    assertLessonAvailableForChild: jest.fn().mockResolvedValue({}),
  };
  const service = new UploadObjectAccessService(
    prisma as unknown as PrismaService,
    childAccess as unknown as ChildAccessService,
    entitlement as unknown as EntitlementService,
    learningPath as unknown as LearningPathService,
  );
  return { childAccess, entitlement, learningPath, prisma, service };
};

const publishedVideo = {
  id: 'video-1',
  lessonId: 'lesson-1',
  uploadedById: 'teacher-1',
  processingStatus: 'READY',
  lesson: { createdById: 'teacher-1', status: 'PUBLISHED' },
};

describe('UploadObjectAccessService', () => {
  it('requires child ownership, video entitlement, and lesson assignment for learner reads', async () => {
    const fixture = createFixture();
    fixture.prisma.videoAsset.findFirst.mockResolvedValue(publishedVideo);

    await fixture.service.assertCanRead(
      user('parent-1', ['PARENT']),
      'videos/admin-content-video/hash-lesson.mp4',
      'child-1',
    );

    expect(fixture.childAccess.assertCanAccessChild).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1' }),
      'child-1',
      expect.objectContaining({ notFoundForDenied: true }),
    );
    expect(fixture.entitlement.assertCapability).toHaveBeenCalledWith(
      'child-1',
      'video',
    );
    expect(
      fixture.learningPath.assertLessonAvailableForChild,
    ).toHaveBeenCalledWith('child-1', 'lesson-1');
    const auditInput = fixture.prisma.auditLog.create.mock.calls[0]?.[0];
    expect(auditInput.data.metadata).toEqual(
      expect.objectContaining({
        childProfileIdFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
        keyFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(JSON.stringify(auditInput.data.metadata)).not.toContain('child-1');
    expect(JSON.stringify(auditInput.data.metadata)).not.toContain(
      'videos/admin-content-video/hash-lesson.mp4',
    );
  });

  it('fails learner video reads closed without a child context', async () => {
    const fixture = createFixture();
    fixture.prisma.videoAsset.findFirst.mockResolvedValue(publishedVideo);

    await expect(
      fixture.service.assertCanRead(
        user('parent-1', ['PARENT']),
        'videos/admin-content-video/hash-lesson.mp4',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(fixture.entitlement.assertCapability).not.toHaveBeenCalled();
  });

  it('allows a teacher to read only video content they own', async () => {
    const fixture = createFixture();
    fixture.prisma.videoAsset.findFirst.mockResolvedValue(publishedVideo);

    await expect(
      fixture.service.assertCanRead(
        user('teacher-1', ['TEACHER']),
        'videos/teacher-content-video/hash-lesson.mp4',
      ),
    ).resolves.toBeUndefined();
    await expect(
      fixture.service.assertCanRead(
        user('teacher-2', ['TEACHER']),
        'videos/teacher-content-video/hash-lesson.mp4',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not grant support a content or finance scope it does not hold', async () => {
    const fixture = createFixture();
    fixture.prisma.videoAsset.findFirst.mockResolvedValue(publishedVideo);

    await expect(
      fixture.service.assertCanRead(
        user('support-1', ['SUPPORT']),
        'videos/admin-content-video/hash-lesson.mp4',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    fixture.prisma.activationOrder.findFirst.mockResolvedValue({
      id: 'order-1',
      userId: 'customer-1',
      createdById: 'sale-1',
      reviewedById: null,
      referrerMember: null,
      agency: null,
      channelParticipant: null,
    });
    fixture.prisma.payoutRequest.findFirst.mockResolvedValue(null);
    await expect(
      fixture.service.assertCanRead(
        user('support-1', ['SUPPORT']),
        'invoices/hash-order.pdf',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(fixture.prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('allows order owners and active scoped agency members to read referenced invoices', async () => {
    const fixture = createFixture();
    fixture.prisma.activationOrder.findFirst.mockResolvedValue({
      id: 'order-1',
      userId: 'customer-1',
      createdById: 'sale-1',
      reviewedById: null,
      referrerMember: null,
      agency: { members: [{ id: 'member-1' }] },
      channelParticipant: null,
    });
    fixture.prisma.payoutRequest.findFirst.mockResolvedValue(null);

    await expect(
      fixture.service.assertCanRead(
        user('customer-1', ['PARENT']),
        'invoices/hash-order.pdf',
      ),
    ).resolves.toBeUndefined();
    await expect(
      fixture.service.assertCanRead(
        user('agency-user-1', ['AGENCY_OWNER']),
        'invoices/hash-order.pdf',
      ),
    ).resolves.toBeUndefined();
  });

  it('allows only payout beneficiaries, reviewers, participants, or scoped agency members', async () => {
    const fixture = createFixture();
    fixture.prisma.activationOrder.findFirst.mockResolvedValue(null);
    fixture.prisma.payoutRequest.findFirst.mockResolvedValue({
      id: 'payout-1',
      beneficiaryUserId: 'beneficiary-1',
      reviewedById: null,
      participant: null,
      beneficiaryAgency: null,
    });

    await expect(
      fixture.service.assertCanRead(
        user('beneficiary-1', ['SALE']),
        'invoices/hash-payout.pdf',
      ),
    ).resolves.toBeUndefined();
    await expect(
      fixture.service.assertCanRead(
        user('unrelated-1', ['SALE']),
        'invoices/hash-payout.pdf',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('propagates entitlement denial and never audits a denied learner read', async () => {
    const fixture = createFixture();
    fixture.prisma.videoAsset.findFirst.mockResolvedValue(publishedVideo);
    fixture.entitlement.assertCapability.mockRejectedValue(
      new ForbiddenException('Active learning subscription is required'),
    );

    await expect(
      fixture.service.assertCanRead(
        user('parent-1', ['PARENT']),
        'videos/admin-content-video/hash-lesson.mp4',
        'child-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(fixture.prisma.auditLog.create).not.toHaveBeenCalled();
  });
});
