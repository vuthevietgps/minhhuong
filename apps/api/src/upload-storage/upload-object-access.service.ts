import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { AccountRole, AuthenticatedUser } from '../auth/auth.types';
import { EntitlementService } from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { LearningPathService } from '../learning-path/learning-path.service';
import { PrismaService } from '../prisma/prisma.service';

const contentReadRoles: readonly AccountRole[] = [
  'ADMIN',
  'CONTENT_EDITOR',
  'DIRECTOR',
];
const financialReadRoles: readonly AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'OPERATIONS',
];
const learnerRoles: readonly AccountRole[] = ['PARENT', 'STUDENT'];

const hasRole = (user: AuthenticatedUser, roles: readonly AccountRole[]) =>
  user.roles.some((role) => roles.includes(role));

@Injectable()
export class UploadObjectAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
    private readonly learningPath: LearningPathService,
  ) {}

  async assertCanRead(
    user: AuthenticatedUser,
    key: string,
    childProfileId?: string,
  ): Promise<void> {
    if (key.startsWith('videos/')) {
      await this.assertCanReadVideo(user, key, childProfileId);
      return;
    }
    if (key.startsWith('invoices/')) {
      await this.assertCanReadInvoice(user, key);
      return;
    }
    throw this.notFound();
  }

  private async assertCanReadVideo(
    user: AuthenticatedUser,
    key: string,
    childProfileId?: string,
  ) {
    const video = await this.prisma.videoAsset.findFirst({
      where: { storageKey: key },
      select: {
        id: true,
        lessonId: true,
        uploadedById: true,
        processingStatus: true,
        lesson: { select: { createdById: true, status: true } },
      },
    });
    if (!video) throw this.notFound();

    if (hasRole(user, contentReadRoles)) {
      await this.auditRead(user, 'VideoAsset', video.id, key, 'STAFF_SCOPE');
      return;
    }
    if (
      user.roles.includes('TEACHER') &&
      (video.uploadedById === user.sub || video.lesson.createdById === user.sub)
    ) {
      await this.auditRead(user, 'VideoAsset', video.id, key, 'TEACHER_OWNER');
      return;
    }
    if (
      !hasRole(user, learnerRoles) ||
      video.processingStatus !== 'READY' ||
      video.lesson.status !== 'PUBLISHED' ||
      !childProfileId?.trim()
    ) {
      throw this.notFound();
    }

    const normalizedChildProfileId = childProfileId.trim();
    await this.childAccess.assertCanAccessChild(
      user,
      normalizedChildProfileId,
      { notFoundForDenied: true, purpose: 'upload-video-read' },
    );
    await this.entitlement.assertCapability(normalizedChildProfileId, 'video');
    await this.learningPath.assertLessonAvailableForChild(
      normalizedChildProfileId,
      video.lessonId,
    );
    await this.auditRead(
      user,
      'VideoAsset',
      video.id,
      key,
      'LEARNER_ENTITLEMENT',
      normalizedChildProfileId,
    );
  }

  private async assertCanReadInvoice(user: AuthenticatedUser, key: string) {
    const [order, payout] = await Promise.all([
      this.prisma.activationOrder.findFirst({
        where: {
          OR: [
            { saleInvoiceStorageKey: key },
            { operationInvoiceStorageKey: key },
          ],
        },
        select: {
          id: true,
          userId: true,
          createdById: true,
          reviewedById: true,
          referrerMember: { select: { userId: true, isActive: true } },
          agency: {
            select: {
              members: {
                where: { userId: user.sub, isActive: true },
                select: { id: true },
                take: 1,
              },
            },
          },
          channelParticipant: {
            select: {
              userId: true,
              agency: {
                select: {
                  members: {
                    where: { userId: user.sub, isActive: true },
                    select: { id: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.payoutRequest.findFirst({
        where: { payoutInvoiceStorageKey: key },
        select: {
          id: true,
          beneficiaryUserId: true,
          reviewedById: true,
          participant: { select: { userId: true } },
          beneficiaryAgency: {
            select: {
              members: {
                where: { userId: user.sub, isActive: true },
                select: { id: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    if (hasRole(user, financialReadRoles)) {
      const resource = order
        ? { type: 'ActivationOrder', id: order.id }
        : payout
          ? { type: 'PayoutRequest', id: payout.id }
          : null;
      if (!resource) throw this.notFound();
      await this.auditRead(
        user,
        resource.type,
        resource.id,
        key,
        'STAFF_SCOPE',
      );
      return;
    }

    const canReadOrder = Boolean(
      order &&
      (order.userId === user.sub ||
        order.createdById === user.sub ||
        order.reviewedById === user.sub ||
        (order.referrerMember?.isActive === true &&
          order.referrerMember.userId === user.sub) ||
        (order.agency?.members.length ?? 0) > 0 ||
        order.channelParticipant?.userId === user.sub ||
        (order.channelParticipant?.agency?.members.length ?? 0) > 0),
    );
    if (order && canReadOrder) {
      await this.auditRead(
        user,
        'ActivationOrder',
        order.id,
        key,
        'OWNER_SCOPE',
      );
      return;
    }

    const canReadPayout = Boolean(
      payout &&
      (payout.beneficiaryUserId === user.sub ||
        payout.reviewedById === user.sub ||
        payout.participant?.userId === user.sub ||
        (payout.beneficiaryAgency?.members.length ?? 0) > 0),
    );
    if (payout && canReadPayout) {
      await this.auditRead(
        user,
        'PayoutRequest',
        payout.id,
        key,
        'OWNER_SCOPE',
      );
      return;
    }

    throw this.notFound();
  }

  private async auditRead(
    user: AuthenticatedUser,
    entityType: string,
    entityId: string,
    key: string,
    scope: string,
    childProfileId?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId: user.sub.startsWith('demo-') ? undefined : user.sub,
        action: 'upload.object.read',
        entityType,
        entityId,
        metadata: {
          keyFingerprint: createHash('sha256').update(key).digest('hex'),
          scope,
          ...(childProfileId
            ? {
                childProfileIdFingerprint: createHash('sha256')
                  .update(childProfileId)
                  .digest('hex'),
              }
            : {}),
        },
      },
    });
  }

  private notFound() {
    return new NotFoundException('Upload object not found');
  }
}
