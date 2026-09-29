import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import {
  PackageEntitlementSnapshot,
  parsePackageEntitlementSnapshot,
} from '../package-entitlement/package-entitlement-snapshot';
import { PrismaService } from '../prisma/prisma.service';
import {
  FREE_TRIAL_MAX_AI_RESPONSES,
  FREE_TRIAL_MAX_INITIAL_ASSESSMENTS,
  FREE_TRIAL_MAX_LESSONS,
  FREE_TRIAL_PROVIDER_REF,
} from './trial-policy';

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
    providerRef: string | null;
    currentPeriodStart: Date;
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
          providerRef: true,
          currentPeriodStart: true,
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
          providerRef: subscription.providerRef,
          currentPeriodStart: subscription.currentPeriodStart,
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
        aiChat: hasActiveSubscription && this.isAiTutorEnabled(),
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

  /**
   * A trial may unlock at most two distinct lessons. This is enforced server
   * side, so a direct API call cannot bypass the limit shown in the UI.
   */
  async assertTrialLessonAccess(childProfileId: string, lessonId: string) {
    if (!(await this.hasActiveFreeTrial(childProfileId))) {
      return;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.trialLesson.findUnique({
          where: {
            childProfileId_lessonId: { childProfileId, lessonId },
          },
          select: { id: true },
        });
        if (existing) {
          return;
        }

        const claimed = await tx.trialAccess.updateMany({
          where: {
            childProfileId,
            lessonCount: { lt: FREE_TRIAL_MAX_LESSONS },
          },
          data: { lessonCount: { increment: 1 } },
        });
        if (claimed.count === 0) {
          throw new ForbiddenException(
            `Free trial is limited to ${FREE_TRIAL_MAX_LESSONS} lessons`,
          );
        }

        await tx.trialLesson.create({
          data: { childProfileId, lessonId },
        });
      });
    } catch (error) {
      // A simultaneous repeat request can lose the unique-index race after
      // the first request has already registered the same lesson. It is safe
      // to treat that as access to the already-unlocked lesson.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return;
      }
      throw error;
    }
  }

  /** Consume one AI correction/reply from the free-trial quota. */
  async consumeTrialAiResponse(childProfileId: string) {
    if (!(await this.hasActiveFreeTrial(childProfileId))) {
      return;
    }

    const claimed = await this.prisma.trialAccess.updateMany({
      where: {
        childProfileId,
        aiResponseCount: { lt: FREE_TRIAL_MAX_AI_RESPONSES },
      },
      data: { aiResponseCount: { increment: 1 } },
    });
    if (claimed.count === 0) {
      throw new ForbiddenException(
        `Free trial is limited to ${FREE_TRIAL_MAX_AI_RESPONSES} AI responses`,
      );
    }
  }

  /** The first submitted practice activity is the one placement assessment. */
  async consumeTrialInitialAssessment(childProfileId: string) {
    if (!(await this.hasActiveFreeTrial(childProfileId))) {
      return;
    }

    const claimed = await this.prisma.trialAccess.updateMany({
      where: {
        childProfileId,
        initialAssessmentCount: {
          lt: FREE_TRIAL_MAX_INITIAL_ASSESSMENTS,
        },
      },
      data: { initialAssessmentCount: { increment: 1 } },
    });
    if (claimed.count === 0) {
      throw new ForbiddenException(
        'Free trial placement assessment is complete',
      );
    }
  }

  /**
   * Returns the two lessons that may be shown to an active free-trial learner.
   * Previously unlocked lessons always remain visible; remaining slots are
   * filled in curriculum order.
   */
  async allowedFreeTrialLessonIds(
    childProfileId: string,
    orderedLessonIds: string[],
  ) {
    const now = new Date();
    const trial = await this.prisma.subscription.findFirst({
      where: {
        childProfileId,
        providerRef: FREE_TRIAL_PROVIDER_REF,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: { lte: now },
        currentPeriodEnd: { gt: now },
      },
      select: {
        id: true,
        childProfile: {
          select: {
            trialAccess: {
              select: {
                lessons: { select: { lessonId: true } },
              },
            },
          },
        },
      },
    });
    if (!trial) {
      return null;
    }

    const allowed = new Set(
      trial.childProfile.trialAccess?.lessons.map((item) => item.lessonId) ??
        [],
    );
    for (const lessonId of orderedLessonIds) {
      if (allowed.size >= FREE_TRIAL_MAX_LESSONS) {
        break;
      }
      allowed.add(lessonId);
    }

    return allowed;
  }

  private async hasActiveFreeTrial(childProfileId: string) {
    const now = new Date();
    const trial = await this.prisma.subscription.findFirst({
      where: {
        childProfileId,
        providerRef: FREE_TRIAL_PROVIDER_REF,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: { lte: now },
        currentPeriodEnd: { gt: now },
      },
      select: { id: true },
    });

    return trial !== null;
  }

  private isAiTutorEnabled() {
    const provider = (process.env.AI_PROVIDER ?? 'disabled').toLowerCase();
    const openAiEnabled =
      provider === 'openai' && Boolean(process.env.OPENAI_API_KEY?.trim());
    const mockEnabled =
      provider === 'mock' || process.env.AI_CHAT_MOCK_ENABLED === 'true';

    return openAiEnabled || mockEnabled;
  }
}
