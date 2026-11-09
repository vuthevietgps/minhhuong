import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { type PackageEntitlementSnapshot } from '../package-entitlement/package-entitlement-snapshot';

export const invoiceUrl = (file: Express.Multer.File) =>
  `/uploads/invoices/${file.filename}`;

export const fallbackPackages = [
  {
    code: 'one-month',
    name: '1 month access',
    amountVnd: 300000,
    durationDays: 30,
  },
  {
    code: 'three-months',
    name: '3 months access',
    amountVnd: 800000,
    durationDays: 90,
  },
  {
    code: 'one-year',
    name: '1 year access',
    amountVnd: 2400000,
    durationDays: 365,
  },
] as const;

export const MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS = 10;

export const manualPaidPilotPolicyVersion =
  'manual_paid_pilot_refund_window_v1';

export const manualPaidPilotChildAllocationHardStop =
  'Manual paid pilot supports one child per order only until user-owned subscription seat allocation is implemented';

export const manualPaidPilotPaymentProvider = 'manual_bank_transfer';

export const manualRefundRequestOpenedAction = 'MANUAL_REFUND_REQUEST_OPENED';

export const manualRefundRequestApprovedAction =
  'MANUAL_REFUND_REQUEST_APPROVED';

export const manualRefundRequestRejectedAction =
  'MANUAL_REFUND_REQUEST_REJECTED';

export const manualRefundRequestActions = [
  manualRefundRequestOpenedAction,
  manualRefundRequestApprovedAction,
  manualRefundRequestRejectedAction,
] as const;

export type SelfServicePackage = {
  code: string;
  name: string;
  amountVnd: number;
  durationDays: number;
};

export type AffiliateAttributionSnapshot = {
  source: 'affiliate_click';
  clickId: string;
  affiliateClickEventId: string;
  affiliateLinkId: string;
  affiliateQrAssetId: string | null;
  participantId: string;
  agencyId: string | null;
  agencyMemberId: string | null;
  referralCode: string | null;
  campaign: string | null;
  channel: string | null;
  placement: string | null;
  packageCode: string | null;
  clickCreatedAt: string;
  orderSnapshottedAt: string;
  attributionModel: 'explicit_click';
  matchConfidence: 'high';
  attributionWindowDays: number;
};

export type CommissionChainSnapshotItem = {
  depth: number;
  participantId: string;
  beneficiaryType: 'SALE' | 'AGENCY';
  beneficiaryId: string | null;
  rateBps: number;
  agencyId: string | null;
  agencyMemberId: string | null;
  parentParticipantId: string | null;
};

export type CommissionChainSnapshot = {
  source: 'affiliate_order_snapshot';
  policyVersion: 'commission_chain_v1';
  snapshottedAt: string;
  rootParticipantId: string;
  items: CommissionChainSnapshotItem[];
};

export function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const special = '@#!';
  const random = randomBytes(10);
  let pw = '';
  for (let i = 0; i < 10; i++) {
    pw += chars[random[i] % chars.length];
  }
  pw += special[randomBytes(1)[0] % special.length];
  pw += (randomBytes(1)[0] % 9) + 1;
  return pw;
}

export function orderInclude() {
  return {
    user: {
      select: {
        id: true,
        email: true,
        status: true,
        profile: {
          select: {
            displayName: true,
          },
        },
      },
    },
    createdBy: {
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            displayName: true,
          },
        },
      },
    },
    reviewedBy: {
      select: {
        id: true,
        email: true,
      },
    },
    agency: {
      select: {
        id: true,
        code: true,
        name: true,
        defaultRateBps: true,
      },
    },
    channelParticipant: {
      select: {
        id: true,
        type: true,
        code: true,
        displayName: true,
        baseSalaryCents: true,
        commissionRateBps: true,
      },
    },
    referrerMember: {
      select: {
        id: true,
        role: true,
        referralCode: true,
        rateBps: true,
        user: {
          select: {
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    },
    commissionEarnings: {
      orderBy: { createdAt: 'desc' },
    },
  } satisfies Prisma.ActivationOrderInclude;
}

export function dbUserId(user: AuthenticatedUser) {
  return user.sub.startsWith('demo-') ? undefined : user.sub;
}

export function toAffiliateAttributionJson(
  snapshot: AffiliateAttributionSnapshot,
) {
  return snapshot as unknown as Prisma.InputJsonValue;
}

export function toCommissionChainSnapshotJson(
  snapshot: CommissionChainSnapshot,
) {
  return snapshot as unknown as Prisma.InputJsonValue;
}

export function bankTransferInfo() {
  return {
    bankName: process.env.BANK_TRANSFER_BANK_NAME ?? 'Configure bank name',
    accountNumber:
      process.env.BANK_TRANSFER_ACCOUNT_NUMBER ?? 'Configure account number',
    accountName: process.env.BANK_TRANSFER_ACCOUNT_NAME ?? 'MINH HUONG ENGLISH',
    notePrefix: process.env.BANK_TRANSFER_NOTE_PREFIX ?? 'MH',
  };
}

export function hashPassword(password: string): string {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function manualPaidPilotPolicyMetadata(
  refundWindowEndsAt: Date | null | undefined,
) {
  return {
    policyVersion: manualPaidPilotPolicyVersion,
    refundWindowDays: MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS,
    refundWindowEndsAt: refundWindowEndsAt?.toISOString() ?? null,
    commissionReleaseGate: 'AFTER_REFUND_WINDOW',
    subscriptionOwnership:
      'USER_ORDER_WITH_SINGLE_CHILD_SUBSCRIPTION_COMPATIBILITY',
    childAllocation: 'APPROVAL_ALLOCATES_ENTITLEMENT_TO_RESOLVED_CHILD_PROFILE',
    liveMoneyHardStops: manualPaidPilotHardStops(),
  };
}

export function assertManualPaidPilotSingleChildAllocation(
  snapshot: PackageEntitlementSnapshot,
) {
  const gate = manualPaidPilotChildAllocationGate(snapshot);

  if (!gate.childCountValid || gate.maxChildCount !== 1) {
    throw new BadRequestException(manualPaidPilotChildAllocationHardStop);
  }

  return gate;
}

export function manualPaidPilotChildAllocationGate(
  snapshot: PackageEntitlementSnapshot,
) {
  const childCount = extractManualPaidPilotChildCount(snapshot);

  return {
    gate: 'SINGLE_CHILD_ONLY_UNTIL_USER_OWNED_SEAT_ALLOCATION',
    childCountSource: childCount.source,
    maxChildCount: childCount.value ?? 1,
    childCountValid: childCount.valid,
    userOwnedSeatAllocationImplemented: false,
    multiChildPaidPilotSupported: false,
  };
}

export function extractManualPaidPilotChildCount(
  snapshot: PackageEntitlementSnapshot,
) {
  const childCountEntitlement = snapshot.entitlements.find(
    (item) => item.key === 'CHILD_COUNT',
  );

  if (!childCountEntitlement) {
    return {
      source: 'LEGACY_SINGLE_CHILD_DEFAULT',
      value: 1,
      valid: true,
    };
  }

  const value = readChildCountValue(childCountEntitlement.value);
  return {
    source: 'PACKAGE_ENTITLEMENT_CHILD_COUNT',
    value,
    valid: Number.isInteger(value) && value !== null && value >= 1,
  };
}

export function readChildCountValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
    return Number(value);
  }
  if (isJsonRecord(value)) {
    for (const key of ['limit', 'count', 'max', 'childCount', 'maxChildren']) {
      const childCount = readChildCountValue(value[key]);
      if (childCount !== null) {
        return childCount;
      }
    }
  }

  return null;
}

export function manualPaidPilotHardStops() {
  return {
    paymentProviderMutationUsed: false,
    refundProviderMutationUsed: false,
    payoutMutationUsed: false,
    productionDbUsed: false,
    liveNotificationRequiredForPolicy: false,
  };
}

export function isInsideManualRefundWindow(
  refundWindowEndsAt: Date | null | undefined,
  now: Date,
) {
  return Boolean(
    refundWindowEndsAt && now.getTime() <= refundWindowEndsAt.getTime(),
  );
}
