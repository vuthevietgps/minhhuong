import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  addTrialDays,
  FREE_TRIAL_MAX_AI_RESPONSES,
  FREE_TRIAL_MAX_INITIAL_ASSESSMENTS,
  FREE_TRIAL_MAX_LESSONS,
  FREE_TRIAL_MAX_TOTAL_DAYS,
} from '../entitlement/trial-policy';
import {
  buildPackageEntitlementSnapshot,
  type PackageEntitlementSnapshot,
  type SnapshotActivationPackage,
} from '../package-entitlement/package-entitlement-snapshot';

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

export type ResolvedChannelParticipant = {
  id: string;
  type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE';
  userId?: string | null;
  agencyId?: string | null;
  parentParticipantId?: string | null;
  status?: 'ACTIVE' | 'SUSPENDED';
};

export type ResolvedChannelAttribution = {
  agency: { id: string } | null;
  member: { id: string } | null;
  participant: ResolvedChannelParticipant | null;
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

export type CommissionAttributionSnapshot = {
  source: 'affiliate_order_snapshot';
  participantId: string;
  agencyId: string | null;
  agencyMemberId: string | null;
  referralCode: string | null;
  affiliateLinkId: string;
  affiliateQrAssetId: string | null;
  campaign: string | null;
  channel: string | null;
  placement: string | null;
  packageCode: string | null;
  clickId: string;
  clickCreatedAt: string;
  orderSnapshottedAt: string;
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

export type OrderCommissionAttribution = {
  participantId: string | null;
  attributionSnapshotJson?: Prisma.InputJsonValue;
  usesAffiliateSnapshot: boolean;
};

export type OrderCommissionChainResolution = {
  items: CommissionChainSnapshotItem[] | null;
  legacyMissingAffiliateSnapshot: boolean;
};

export function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function requiredSnapshotString(
  snapshot: Record<string, unknown>,
  key: string,
) {
  const value = snapshot[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function nullableSnapshotString(
  snapshot: Record<string, unknown>,
  key: string,
) {
  const value = snapshot[key];
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'string' ? value : undefined;
}

export function isValidIsoDateString(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export function requiredSnapshotNumber(
  snapshot: Record<string, unknown>,
  key: string,
) {
  const value = snapshot[key];
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
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

export function sanitizeHistoryMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeHistoryMetadata(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey.includes('base64') ||
      normalizedKey.includes('blob') ||
      normalizedKey.includes('rawcontent') ||
      normalizedKey.includes('filecontent')
    ) {
      sanitized[key] = '[redacted]';
      continue;
    }

    if (
      typeof entry === 'string' &&
      (normalizedKey.endsWith('storagekey') || normalizedKey.endsWith('url'))
    ) {
      sanitized[key] = safeHistoryFileReference(entry);
      continue;
    }

    sanitized[key] = sanitizeHistoryMetadata(entry);
  }

  return sanitized;
}

export function safeHistoryFileReference(value: string) {
  const fileName = value.split(/[\\/]/).filter(Boolean).pop();
  return fileName || '[redacted]';
}

export function dbUserId(user: AuthenticatedUser) {
  return user.sub.startsWith('demo-') ? undefined : user.sub;
}

export function isAffiliateClickEventUsable(
  event: Prisma.AffiliateClickEventGetPayload<{
    include: {
      affiliateLink: true;
      participant: true;
      agency: true;
      agencyMember: true;
    };
  }>,
  now: Date,
) {
  if (
    event.affiliateLink.status !== 'ACTIVE' ||
    event.affiliateLink.participantId !== event.participantId ||
    event.participant.status !== 'ACTIVE'
  ) {
    return false;
  }

  if (
    event.affiliateLink.startsAt &&
    event.affiliateLink.startsAt.getTime() > now.getTime()
  ) {
    return false;
  }

  if (
    event.affiliateLink.expiresAt &&
    event.affiliateLink.expiresAt.getTime() <= now.getTime()
  ) {
    return false;
  }

  if (event.agency && event.agency.status !== 'ACTIVE') {
    return false;
  }

  if (event.agencyMember && !event.agencyMember.isActive) {
    return false;
  }

  return true;
}

export function buildAffiliateAttributionSnapshot(
  event: Prisma.AffiliateClickEventGetPayload<{
    include: {
      affiliateLink: true;
      participant: true;
      agency: true;
      agencyMember: true;
    };
  }>,
  now: Date,
  attributionWindowDays: number,
): AffiliateAttributionSnapshot {
  return {
    source: 'affiliate_click',
    clickId: event.clickId,
    affiliateClickEventId: event.id,
    affiliateLinkId: event.affiliateLinkId,
    affiliateQrAssetId: event.affiliateQrAssetId ?? null,
    participantId: event.participantId,
    agencyId: event.agencyId ?? null,
    agencyMemberId: event.agencyMemberId ?? null,
    referralCode: event.referralCode ?? null,
    campaign: event.campaign ?? null,
    channel: event.channel ?? null,
    placement: event.placement ?? null,
    packageCode: event.packageCode ?? null,
    clickCreatedAt: event.createdAt.toISOString(),
    orderSnapshottedAt: now.toISOString(),
    attributionModel: 'explicit_click',
    matchConfidence: 'high',
    attributionWindowDays,
  };
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

export function isAffiliateClickIdShape(value: string) {
  return /^clk_[a-f0-9]{24}$/i.test(value);
}

export function affiliateAttributionWindowDays() {
  const configured = Number(process.env.AFFILIATE_ATTRIBUTION_WINDOW_DAYS);
  if (Number.isFinite(configured) && configured >= 1 && configured <= 3660) {
    return Math.trunc(configured);
  }
  return 30;
}

export function buildCommissionChainSnapshotItem(
  participant: ResolvedChannelParticipant,
  depth: number,
  affiliateSnapshot: AffiliateAttributionSnapshot,
): CommissionChainSnapshotItem {
  const beneficiaryType = commissionBeneficiaryTypeForParticipant(
    participant.type,
  );
  const isRoot = depth === 0;
  return {
    depth,
    participantId: participant.id,
    beneficiaryType,
    beneficiaryId:
      beneficiaryType === 'AGENCY'
        ? (participant.agencyId ?? null)
        : (participant.userId ?? null),
    rateBps: commissionRateForDepth(depth),
    agencyId:
      participant.agencyId ?? (isRoot ? affiliateSnapshot.agencyId : null),
    agencyMemberId: isRoot ? affiliateSnapshot.agencyMemberId : null,
    parentParticipantId: participant.parentParticipantId ?? null,
  };
}

export function parseCommissionAttributionSnapshot(
  value: Prisma.JsonValue,
): CommissionAttributionSnapshot | null {
  if (!isJsonRecord(value) || value.source !== 'affiliate_click') {
    return null;
  }

  const participantId = requiredSnapshotString(value, 'participantId');
  const affiliateLinkId = requiredSnapshotString(value, 'affiliateLinkId');
  const clickId = requiredSnapshotString(value, 'clickId');
  const clickCreatedAt = requiredSnapshotString(value, 'clickCreatedAt');
  const orderSnapshottedAt = requiredSnapshotString(
    value,
    'orderSnapshottedAt',
  );

  if (
    !participantId ||
    !affiliateLinkId ||
    !clickId ||
    !clickCreatedAt ||
    !orderSnapshottedAt ||
    !isAffiliateClickIdShape(clickId) ||
    !isValidIsoDateString(clickCreatedAt) ||
    !isValidIsoDateString(orderSnapshottedAt)
  ) {
    return null;
  }

  const optionalFields = {
    agencyId: nullableSnapshotString(value, 'agencyId'),
    agencyMemberId: nullableSnapshotString(value, 'agencyMemberId'),
    referralCode: nullableSnapshotString(value, 'referralCode'),
    affiliateQrAssetId: nullableSnapshotString(value, 'affiliateQrAssetId'),
    campaign: nullableSnapshotString(value, 'campaign'),
    channel: nullableSnapshotString(value, 'channel'),
    placement: nullableSnapshotString(value, 'placement'),
    packageCode: nullableSnapshotString(value, 'packageCode'),
  };
  if (
    Object.values(optionalFields).some((fieldValue) => fieldValue === undefined)
  ) {
    return null;
  }

  return {
    source: 'affiliate_order_snapshot',
    participantId,
    agencyId: optionalFields.agencyId ?? null,
    agencyMemberId: optionalFields.agencyMemberId ?? null,
    referralCode: optionalFields.referralCode ?? null,
    affiliateLinkId,
    affiliateQrAssetId: optionalFields.affiliateQrAssetId ?? null,
    campaign: optionalFields.campaign ?? null,
    channel: optionalFields.channel ?? null,
    placement: optionalFields.placement ?? null,
    packageCode: optionalFields.packageCode ?? null,
    clickId,
    clickCreatedAt,
    orderSnapshottedAt,
  };
}

export function parseCommissionChainSnapshot(
  value: Prisma.JsonValue,
): CommissionChainSnapshot | null {
  if (
    !isJsonRecord(value) ||
    value.source !== 'affiliate_order_snapshot' ||
    value.policyVersion !== 'commission_chain_v1'
  ) {
    return null;
  }

  const snapshottedAt = requiredSnapshotString(value, 'snapshottedAt');
  const rootParticipantId = requiredSnapshotString(value, 'rootParticipantId');
  if (
    !snapshottedAt ||
    !rootParticipantId ||
    !isValidIsoDateString(snapshottedAt) ||
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    value.items.length > 4
  ) {
    return null;
  }

  const items = value.items.map((item, index) =>
    parseCommissionChainSnapshotItem(item, index),
  );
  if (items.some((item) => !item)) {
    return null;
  }

  return {
    source: 'affiliate_order_snapshot',
    policyVersion: 'commission_chain_v1',
    snapshottedAt,
    rootParticipantId,
    items: items as CommissionChainSnapshotItem[],
  };
}

export function parseCommissionChainSnapshotItem(
  value: unknown,
  index: number,
): CommissionChainSnapshotItem | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const depth = requiredSnapshotNumber(value, 'depth');
  const participantId = requiredSnapshotString(value, 'participantId');
  const beneficiaryId = nullableSnapshotString(value, 'beneficiaryId');
  const rateBps = requiredSnapshotNumber(value, 'rateBps');
  const agencyId = nullableSnapshotString(value, 'agencyId');
  const agencyMemberId = nullableSnapshotString(value, 'agencyMemberId');
  const parentParticipantId = nullableSnapshotString(
    value,
    'parentParticipantId',
  );
  const beneficiaryType = value.beneficiaryType;

  if (
    depth !== index ||
    !participantId ||
    (beneficiaryType !== 'SALE' && beneficiaryType !== 'AGENCY') ||
    beneficiaryId === undefined ||
    rateBps === null ||
    rateBps < 0 ||
    agencyId === undefined ||
    agencyMemberId === undefined ||
    parentParticipantId === undefined
  ) {
    return null;
  }

  return {
    depth,
    participantId,
    beneficiaryType,
    beneficiaryId,
    rateBps,
    agencyId,
    agencyMemberId,
    parentParticipantId,
  };
}

export function attributionSnapshotJsonForCommission(
  attribution: OrderCommissionAttribution,
  chainResolution: OrderCommissionChainResolution,
) {
  if (!attribution.attributionSnapshotJson) {
    return undefined;
  }
  if (!chainResolution.legacyMissingAffiliateSnapshot) {
    return attribution.attributionSnapshotJson;
  }
  return {
    ...(attribution.attributionSnapshotJson as unknown as Record<
      string,
      unknown
    >),
    commissionChainSnapshotStatus: 'legacy_missing',
  } as Prisma.InputJsonValue;
}

export function commissionBeneficiaryTypeForParticipant(
  type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE',
): 'SALE' | 'AGENCY' {
  return type === 'AGENCY' ? 'AGENCY' : 'SALE';
}

export function commissionRateForDepth(depth: number) {
  return Math.round(4000 * Math.pow(0.4, depth));
}

export function fileIdempotencyMetadata(file: Express.Multer.File) {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}

export function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '-');
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

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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

export function assertCurrentPackageSingleChildAllocationForLegacyApproval(input: {
  parsedOrderSnapshot: PackageEntitlementSnapshot | null;
  activationPackage: SnapshotActivationPackage | null;
  packageCode?: string | null;
  packageName?: string | null;
  amountCents: number;
  durationDays: number;
  capturedAt: Date;
}) {
  if (input.parsedOrderSnapshot || !input.activationPackage) {
    return;
  }

  assertManualPaidPilotSingleChildAllocation(
    buildPackageEntitlementSnapshot({
      activationPackage: input.activationPackage,
      fallbackPackageCode: input.packageCode,
      fallbackPackageName: input.packageName,
      soldAmountVnd: Math.round(input.amountCents / 100),
      soldDurationDays: input.durationDays,
      capturedAt: input.capturedAt,
    }),
  );
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

export function latestManualRefundRequestAction(
  statusHistory: Array<{ action: string }>,
) {
  return statusHistory[0]?.action;
}
