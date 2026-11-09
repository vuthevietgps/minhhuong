import { Prisma } from '@prisma/client';
import {
  addTrialDays,
  FREE_TRIAL_MAX_AI_RESPONSES,
  FREE_TRIAL_MAX_INITIAL_ASSESSMENTS,
  FREE_TRIAL_MAX_LESSONS,
  FREE_TRIAL_MAX_TOTAL_DAYS,
} from '../entitlement/trial-policy';

export function freeTrialLimits() {
  return {
    initialAssessments: FREE_TRIAL_MAX_INITIAL_ASSESSMENTS,
    lessons: FREE_TRIAL_MAX_LESSONS,
    aiResponses: FREE_TRIAL_MAX_AI_RESPONSES,
  };
}

export function freeTrialSelect() {
  return {
    id: true,
    status: true,
    currentPeriodStart: true,
    currentPeriodEnd: true,
    childProfile: {
      select: {
        id: true,
        displayName: true,
        parent: {
          select: {
            email: true,
            profile: { select: { displayName: true } },
          },
        },
        trialAccess: {
          select: {
            initialAssessmentCount: true,
            lessonCount: true,
            aiResponseCount: true,
            reportAvailableAt: true,
          },
        },
      },
    },
  } satisfies Prisma.SubscriptionSelect;
}

export function toFreeTrialView(
  trial: {
    id: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    childProfile: {
      id: string;
      displayName: string;
      parent: {
        email: string;
        profile: { displayName: string | null } | null;
      };
      trialAccess: {
        initialAssessmentCount: number;
        lessonCount: number;
        aiResponseCount: number;
        reportAvailableAt: Date;
      } | null;
    };
  },
  now: Date,
) {
  const access = trial.childProfile.trialAccess;
  const maximumEnd = addTrialDays(
    trial.currentPeriodStart,
    FREE_TRIAL_MAX_TOTAL_DAYS,
  );

  return {
    id: trial.id,
    childProfileId: trial.childProfile.id,
    childName: trial.childProfile.displayName,
    parent: {
      email: trial.childProfile.parent.email,
      displayName: trial.childProfile.parent.profile?.displayName ?? null,
    },
    status: trial.currentPeriodEnd > now ? 'TRIALING' : 'EXPIRED',
    startsAt: trial.currentPeriodStart,
    endsAt: trial.currentPeriodEnd,
    maximumEnd,
    canExtend: maximumEnd > now,
    report: {
      available: Boolean(access && access.reportAvailableAt <= now),
      availableAt: access?.reportAvailableAt ?? null,
    },
    usage: {
      initialAssessments: access?.initialAssessmentCount ?? 0,
      lessons: access?.lessonCount ?? 0,
      aiResponses: access?.aiResponseCount ?? 0,
    },
    limits: freeTrialLimits(),
  };
}
