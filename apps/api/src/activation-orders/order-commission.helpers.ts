import { Prisma } from '@prisma/client';
import {
  AffiliateAttributionSnapshot,
  CommissionChainSnapshot,
  CommissionChainSnapshotItem,
  isJsonRecord,
} from './activation-order.helpers';

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

export type OrderCommissionAttribution = {
  participantId: string | null;
  attributionSnapshotJson?: Prisma.InputJsonValue;
  usesAffiliateSnapshot: boolean;
};

export type OrderCommissionChainResolution = {
  items: CommissionChainSnapshotItem[] | null;
  legacyMissingAffiliateSnapshot: boolean;
};

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

export function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '-');
}

export function latestManualRefundRequestAction(
  statusHistory: Array<{ action: string }>,
) {
  return statusHistory[0]?.action;
}
