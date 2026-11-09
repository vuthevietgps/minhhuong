import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  addTrialDays,
  FREE_TRIAL_DEFAULT_DAYS,
  FREE_TRIAL_MAX_TOTAL_DAYS,
  FREE_TRIAL_PROVIDER_REF,
  FREE_TRIAL_REPORT_DELAY_DAYS,
} from '../entitlement/trial-policy';
import { ExtendFreeTrialDto } from './dto/extend-free-trial.dto';
import { StartFreeTrialDto } from './dto/start-free-trial.dto';
import { ActivationOrderSupportService } from './activation-order-support.service';
import {
  dbUserId,
  freeTrialLimits,
  freeTrialSelect,
  toFreeTrialView,
} from './activation-order.helpers';

/** Free trial start, lookup and extension. */
@Injectable()
export class FreeTrialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activationOrderSupportService: ActivationOrderSupportService,
  ) {}

  /**
   * Public, no-payment entry point. The parent account stays ACTIVE after the
   * learning entitlement expires so progress and reports remain readable.
   */
  async startFreeTrial(dto: StartFreeTrialDto) {
    const now = new Date();
    const email = dto.email.trim().toLowerCase();
    const parent = await this.activationOrderSupportService.upsertParentAccount(
      { password: dto.password },
      email,
    );
    if (parent.status !== 'ACTIVE') {
      throw new BadRequestException(
        'This account is suspended. Please contact support before starting a trial.',
      );
    }

    const existingChild = await this.prisma.childProfile.findFirst({
      where: { parentId: parent.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, displayName: true },
    });
    const childProfile =
      existingChild ??
      (await this.prisma.childProfile.create({
        data: {
          parentId: parent.id,
          displayName: dto.displayName?.trim() || 'Con',
        },
        select: { id: true, displayName: true },
      }));

    const priorTrial = await this.prisma.trialAccess.findFirst({
      where: { childProfile: { parentId: parent.id } },
      select: { id: true },
    });
    if (priorTrial) {
      throw new BadRequestException(
        'This account has already used its free trial. Please choose a study package.',
      );
    }

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        childProfile: { parentId: parent.id },
        status: { in: ['TRIALING', 'ACTIVE'] },
        currentPeriodStart: { lte: now },
        currentPeriodEnd: { gt: now },
      },
      select: { id: true },
    });
    if (activeSubscription) {
      throw new BadRequestException(
        'This account already has an active learning entitlement.',
      );
    }

    const plan = await this.activationOrderSupportService.ensureManualPlan();
    const periodEnd = addTrialDays(now, FREE_TRIAL_DEFAULT_DAYS);
    const reportAvailableAt = addTrialDays(now, FREE_TRIAL_REPORT_DELAY_DAYS);

    let subscription: {
      id: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
    };
    try {
      subscription = await this.prisma.$transaction(async (tx) => {
        await tx.trialAccess.create({
          data: {
            childProfileId: childProfile.id,
            reportAvailableAt,
          },
        });

        return tx.subscription.create({
          data: {
            childProfileId: childProfile.id,
            planId: plan.id,
            status: 'TRIALING',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            providerRef: FREE_TRIAL_PROVIDER_REF,
          },
          select: {
            id: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This account has already used its free trial. Please choose a study package.',
        );
      }
      throw error;
    }

    await this.activationOrderSupportService.auditSystem(
      'trial.start',
      subscription.id,
      {
        childProfileId: childProfile.id,
        parentEmail: email,
        periodEnd: subscription.currentPeriodEnd.toISOString(),
      },
    );

    return {
      childProfile: childProfile,
      trial: {
        subscriptionId: subscription.id,
        status: 'TRIALING' as const,
        startsAt: subscription.currentPeriodStart,
        endsAt: subscription.currentPeriodEnd,
        reportAvailableAt,
        limits: freeTrialLimits(),
      },
      login: { email },
      paymentRequiredBeforeTrial: false,
    };
  }

  async listFreeTrials() {
    const now = new Date();
    const trials = await this.prisma.subscription.findMany({
      where: { providerRef: FREE_TRIAL_PROVIDER_REF },
      orderBy: { currentPeriodEnd: 'desc' },
      take: 200,
      select: freeTrialSelect(),
    });

    return trials.map((trial) => toFreeTrialView(trial, now));
  }

  async getFreeTrialForUser(childProfileId: string, user: AuthenticatedUser) {
    const canManageTrials = user.roles.some((role) =>
      ['ADMIN', 'DIRECTOR', 'OPERATIONS'].includes(role),
    );
    const userId = dbUserId(user);
    const trial = await this.prisma.subscription.findFirst({
      where: {
        childProfileId,
        providerRef: FREE_TRIAL_PROVIDER_REF,
        ...(canManageTrials
          ? {}
          : userId
            ? { childProfile: { parentId: userId } }
            : { id: '__none__' }),
      },
      orderBy: { currentPeriodEnd: 'desc' },
      select: freeTrialSelect(),
    });
    if (!trial) {
      throw new NotFoundException('Free trial not found');
    }

    return toFreeTrialView(trial, new Date());
  }

  async extendFreeTrial(
    subscriptionId: string,
    dto: ExtendFreeTrialDto,
    user: AuthenticatedUser,
  ) {
    if (
      !user.roles.some((role) =>
        ['ADMIN', 'DIRECTOR', 'OPERATIONS'].includes(role),
      )
    ) {
      throw new BadRequestException(
        'Only operations or director can extend a free trial',
      );
    }

    const trial = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, providerRef: FREE_TRIAL_PROVIDER_REF },
      select: {
        id: true,
        childProfileId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      },
    });
    if (!trial) {
      throw new NotFoundException('Free trial not found');
    }

    const now = new Date();
    const maximumEnd = addTrialDays(
      trial.currentPeriodStart,
      FREE_TRIAL_MAX_TOTAL_DAYS,
    );
    const extensionBase =
      trial.currentPeriodEnd > now ? trial.currentPeriodEnd : now;
    const requestedEnd = addTrialDays(extensionBase, dto.days);
    const nextPeriodEnd = requestedEnd > maximumEnd ? maximumEnd : requestedEnd;

    if (nextPeriodEnd <= extensionBase) {
      throw new BadRequestException(
        `Free trial cannot exceed ${FREE_TRIAL_MAX_TOTAL_DAYS} days from its start.`,
      );
    }

    const actorUserId = dbUserId(user) ?? null;
    const updated = await this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.update({
        where: { id: trial.id },
        data: {
          status: 'TRIALING',
          currentPeriodEnd: nextPeriodEnd,
        },
        select: freeTrialSelect(),
      });
      await tx.trialExtensionAudit.create({
        data: {
          subscriptionId: trial.id,
          childProfileId: trial.childProfileId,
          actorUserId,
          previousPeriodEnd: trial.currentPeriodEnd,
          nextPeriodEnd,
          requestedDays: dto.days,
          note: dto.note?.trim() || null,
        },
      });
      return subscription;
    });

    await this.activationOrderSupportService.audit(
      user,
      'trial.extend',
      trial.id,
      {
        childProfileId: trial.childProfileId,
        previousPeriodEnd: trial.currentPeriodEnd.toISOString(),
        nextPeriodEnd: nextPeriodEnd.toISOString(),
        requestedDays: dto.days,
      },
    );

    return toFreeTrialView(updated, now);
  }
}
