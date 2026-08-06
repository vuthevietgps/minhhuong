import { ForbiddenException, Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import {
  PackageEntitlementSnapshot,
  parsePackageEntitlementSnapshot,
} from '../package-entitlement/package-entitlement-snapshot';
import { PrismaService } from '../prisma/prisma.service';

export type LearningCapability = 'video' | 'practice' | 'aiChat';

export type ChildLearningCapabilities = {
  video: boolean;
  practice: boolean;
  aiChat: boolean;
  maxDailyMinutes: number | null;
};

export type ChildEntitlement = {
  childProfileId: string;
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    plan: {
      code: string;
      name: string;
    };
    entitlementSnapshotJson: unknown;
    entitlementSnapshot: PackageEntitlementSnapshot | null;
  } | null;
  capabilities: ChildLearningCapabilities;
};

const activeSubscriptionStatuses: SubscriptionStatus[] = [
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.ACTIVE,
];

@Injectable()
export class EntitlementService {
  constructor(private readonly prisma: PrismaService) {}

  async getChildEntitlement(childProfileId: string): Promise<ChildEntitlement> {
    const now = new Date();
    const [subscription, child] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: {
          childProfileId,
          status: { in: activeSubscriptionStatuses },
          currentPeriodStart: { lte: now },
          currentPeriodEnd: { gt: now },
        },
        orderBy: { currentPeriodEnd: 'desc' },
        select: {
          id: true,
          status: true,
          currentPeriodEnd: true,
          entitlementSnapshotJson: true,
          plan: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.childProfile.findUnique({
        where: { id: childProfileId },
        select: {
          screenTime: {
            select: {
              isEnabled: true,
              dailyLimitMinutes: true,
            },
          },
        },
      }),
    ]);
    const hasActiveSubscription = subscription !== null;
    const subscriptionView = subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          plan: subscription.plan,
          entitlementSnapshotJson: subscription.entitlementSnapshotJson,
          entitlementSnapshot: parsePackageEntitlementSnapshot(
            subscription.entitlementSnapshotJson,
          ),
        }
      : null;

    return {
      childProfileId,
      hasActiveSubscription,
      subscription: subscriptionView,
      capabilities: {
        video: hasActiveSubscription,
        practice: hasActiveSubscription,
        aiChat: hasActiveSubscription && this.isAiChatMockEnabled(),
        maxDailyMinutes: child?.screenTime?.isEnabled
          ? child.screenTime.dailyLimitMinutes
          : null,
      },
    };
  }

  async assertActiveSubscription(childProfileId: string) {
    const entitlement = await this.getChildEntitlement(childProfileId);
    if (!entitlement.hasActiveSubscription) {
      throw new ForbiddenException('Active learning subscription is required');
    }

    return entitlement;
  }

  async getChildCapabilities(
    childProfileId: string,
  ): Promise<ChildLearningCapabilities> {
    const entitlement = await this.getChildEntitlement(childProfileId);
    return entitlement.capabilities;
  }

  async assertCapability(
    childProfileId: string,
    capability: LearningCapability,
  ) {
    const entitlement = await this.getChildEntitlement(childProfileId);
    if (!entitlement.hasActiveSubscription) {
      throw new ForbiddenException('Active learning subscription is required');
    }

    if (!entitlement.capabilities[capability]) {
      throw new ForbiddenException(
        `${capability} is not enabled for this child entitlement`,
      );
    }

    return entitlement;
  }

  private isAiChatMockEnabled() {
    return process.env.AI_CHAT_MOCK_ENABLED === 'true';
  }
}
