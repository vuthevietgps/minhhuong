import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AffiliateOrderAttributionFiltersDto } from './dto/channel-affiliate.dto';
import {
  affiliateOrderAttributionFilterFields,
  isRecord,
  optionalTrim,
  recordNullableString,
  recordNumber,
  recordString,
  singleCurrencyAmount,
  sortedNumericRecord,
} from './channel-affiliate.helpers';

export type AffiliateOrderAttributionSnapshot = {
  source: 'affiliate_click';
  clickId: string;
  affiliateClickEventId?: string;
  affiliateLinkId: string;
  affiliateQrAssetId?: string | null;
  participantId: string;
  agencyId?: string | null;
  agencyMemberId?: string | null;
  referralCode?: string | null;
  campaign?: string | null;
  channel?: string | null;
  placement?: string | null;
  packageCode?: string | null;
  clickCreatedAt: string;
  orderSnapshottedAt: string;
  attributionModel: string;
  matchConfidence: string;
  attributionWindowDays: number;
};

export const affiliateOrderAttributionAggregateFields = {
  participant: 'participantId',
  agency: 'agencyId',
  agencyMember: 'agencyMemberId',
  affiliateLink: 'affiliateLinkId',
  affiliateQrAsset: 'affiliateQrAssetId',
  campaign: 'campaign',
  channel: 'channel',
  placement: 'placement',
  package: 'packageCode',
} as const;

export const affiliateOrderAttributionAggregateSortBy = [
  'totalAttributedOrders',
  'approvedOrders',
  'approvedAmountCents',
  'lastOrderCreatedAt',
] as const;

export const affiliateOrderAttributionAggregateSortDirections = [
  'asc',
  'desc',
] as const;

export const affiliateOrderAttributionExportHeaders = [
  'orderId',
  'orderStatus',
  'orderCreatedAt',
  'approvedAmountCents',
  'approvedCurrency',
  'clickId',
  'affiliateLinkId',
  'affiliateQrAssetId',
  'participantId',
  'agencyId',
  'agencyMemberId',
  'referralCode',
  'campaign',
  'channel',
  'placement',
  'packageCode',
  'clickCreatedAt',
  'orderSnapshottedAt',
  'attributionModel',
  'matchConfidence',
  'attributionWindowDays',
] as const;

export const affiliateOrderAttributionAggregateExportHeaders = [
  'groupBy',
  'snapshotField',
  'key',
  'totalAttributedOrders',
  'approvedOrders',
  'countByStatus',
  'approvedAmountCentsByCurrency',
  'approvedAmountCents',
  'firstOrderCreatedAt',
  'lastOrderCreatedAt',
] as const;

export type AffiliateOrderAttributionAggregateField =
  (typeof affiliateOrderAttributionAggregateFields)[keyof typeof affiliateOrderAttributionAggregateFields];

export type AffiliateOrderAttributionAggregateSortBy =
  (typeof affiliateOrderAttributionAggregateSortBy)[number];

export type AffiliateOrderAttributionAggregateSortDirection =
  (typeof affiliateOrderAttributionAggregateSortDirections)[number];

export type AffiliateOrderAttributionAggregateBucket = {
  key: string | null;
  totalAttributedOrders: number;
  approvedOrders: number;
  countByStatus: Record<string, number>;
  approvedAmountCentsByCurrency: Record<string, number>;
  firstOrderCreatedAt: Date;
  lastOrderCreatedAt: Date;
};

export type AffiliateOrderAttributionAggregateItem = {
  groupBy: string;
  snapshotField: AffiliateOrderAttributionAggregateField;
  key: string | null;
  totalAttributedOrders: number;
  approvedOrders: number;
  countByStatus: Record<string, number>;
  approvedAmountCentsByCurrency: Record<string, number>;
  approvedAmountCents: number | null;
  firstOrderCreatedAt: string;
  lastOrderCreatedAt: string;
};

export function aggregateSnapshotField(
  groupBy?: string,
): AffiliateOrderAttributionAggregateField {
  const snapshotField =
    affiliateOrderAttributionAggregateFields[
      groupBy as keyof typeof affiliateOrderAttributionAggregateFields
    ];
  if (!snapshotField) {
    throw new BadRequestException(
      'groupBy must be one of participant, agency, agencyMember, affiliateLink, affiliateQrAsset, campaign, channel, placement, package',
    );
  }
  return snapshotField;
}

export function aggregateSortBy(
  value?: string,
): AffiliateOrderAttributionAggregateSortBy {
  if (!value) {
    return 'totalAttributedOrders';
  }
  if (
    affiliateOrderAttributionAggregateSortBy.includes(
      value as AffiliateOrderAttributionAggregateSortBy,
    )
  ) {
    return value as AffiliateOrderAttributionAggregateSortBy;
  }
  throw new BadRequestException(
    'sortBy must be one of totalAttributedOrders, approvedOrders, approvedAmountCents, lastOrderCreatedAt',
  );
}

export function aggregateSortDirection(
  value?: string,
): AffiliateOrderAttributionAggregateSortDirection {
  if (!value) {
    return 'desc';
  }
  if (
    affiliateOrderAttributionAggregateSortDirections.includes(
      value as AffiliateOrderAttributionAggregateSortDirection,
    )
  ) {
    return value as AffiliateOrderAttributionAggregateSortDirection;
  }
  throw new BadRequestException('sortDirection must be asc or desc');
}

export function serializeAggregateBucket(
  groupBy: string,
  snapshotField: AffiliateOrderAttributionAggregateField,
  bucket: AffiliateOrderAttributionAggregateBucket,
): AffiliateOrderAttributionAggregateItem {
  const approvedAmountCentsByCurrency = sortedNumericRecord(
    bucket.approvedAmountCentsByCurrency,
  );
  return {
    groupBy,
    snapshotField,
    key: bucket.key,
    totalAttributedOrders: bucket.totalAttributedOrders,
    approvedOrders: bucket.approvedOrders,
    countByStatus: sortedNumericRecord(bucket.countByStatus),
    approvedAmountCentsByCurrency,
    approvedAmountCents: singleCurrencyAmount(approvedAmountCentsByCurrency),
    firstOrderCreatedAt: bucket.firstOrderCreatedAt.toISOString(),
    lastOrderCreatedAt: bucket.lastOrderCreatedAt.toISOString(),
  };
}

export function compareAggregateItems(
  left: AffiliateOrderAttributionAggregateItem,
  right: AffiliateOrderAttributionAggregateItem,
  sortBy: AffiliateOrderAttributionAggregateSortBy,
  sortDirection: AffiliateOrderAttributionAggregateSortDirection,
) {
  const direction = sortDirection === 'asc' ? 1 : -1;
  const leftValue = aggregateSortValue(left, sortBy);
  const rightValue = aggregateSortValue(right, sortBy);
  const diff = leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;
  if (diff !== 0) {
    return diff * direction;
  }
  return String(left.key ?? '').localeCompare(String(right.key ?? ''));
}

export function aggregateSortValue(
  item: AffiliateOrderAttributionAggregateItem,
  sortBy: AffiliateOrderAttributionAggregateSortBy,
) {
  if (sortBy === 'lastOrderCreatedAt') {
    return new Date(item.lastOrderCreatedAt).getTime();
  }
  if (sortBy === 'approvedAmountCents') {
    return item.approvedAmountCents ?? 0;
  }
  return item[sortBy];
}

export function serializeAffiliateOrderAttributionFilters(
  query: AffiliateOrderAttributionFiltersDto,
) {
  const filters: Record<string, string> = {};
  for (const field of affiliateOrderAttributionFilterFields) {
    const value = optionalTrim(query[field]);
    if (value) {
      filters[field] = value;
    }
  }
  if (query.orderStatus) {
    filters.orderStatus = query.orderStatus;
  }
  return filters;
}

export function pushSnapshotFilter(
  filters: Prisma.ActivationOrderWhereInput[],
  field: string,
  value?: string,
) {
  const normalized = optionalTrim(value);
  if (normalized) {
    filters.push(snapshotFilter(field, normalized));
  }
}

export function snapshotFilter(
  field: string,
  value: string,
): Prisma.ActivationOrderWhereInput {
  return {
    affiliateAttributionSnapshotJson: {
      path: [field],
      equals: value,
    },
  };
}

export function serializeOrderAttributionExportRow(order: {
  id: string;
  status: string;
  createdAt: Date;
  amountCents: number;
  currency: string;
  affiliateAttributionSnapshotJson: Prisma.JsonValue | null;
}) {
  const affiliateAttribution = normalizeAffiliateSnapshot(
    order.affiliateAttributionSnapshotJson,
  );
  if (!affiliateAttribution) {
    return null;
  }

  return {
    orderId: order.id,
    orderStatus: order.status,
    orderCreatedAt: order.createdAt.toISOString(),
    approvedAmountCents:
      order.status === 'APPROVED' ? order.amountCents : undefined,
    approvedCurrency: order.status === 'APPROVED' ? order.currency : undefined,
    clickId: affiliateAttribution.clickId,
    affiliateLinkId: affiliateAttribution.affiliateLinkId,
    affiliateQrAssetId: affiliateAttribution.affiliateQrAssetId,
    participantId: affiliateAttribution.participantId,
    agencyId: affiliateAttribution.agencyId,
    agencyMemberId: affiliateAttribution.agencyMemberId,
    referralCode: affiliateAttribution.referralCode,
    campaign: affiliateAttribution.campaign,
    channel: affiliateAttribution.channel,
    placement: affiliateAttribution.placement,
    packageCode: affiliateAttribution.packageCode,
    clickCreatedAt: affiliateAttribution.clickCreatedAt,
    orderSnapshottedAt: affiliateAttribution.orderSnapshottedAt,
    attributionModel: affiliateAttribution.attributionModel,
    matchConfidence: affiliateAttribution.matchConfidence,
    attributionWindowDays: affiliateAttribution.attributionWindowDays,
  };
}

export function serializeOrderAttribution(order: {
  id: string;
  status: string;
  createdAt: Date;
  customerEmail: string;
  amountCents: number;
  currency: string;
  packageCode: string | null;
  packageName: string | null;
  affiliateAttributionSnapshotJson: Prisma.JsonValue | null;
  user: {
    email: string;
    profile: { displayName: string | null } | null;
  };
}) {
  const affiliateAttribution = normalizeAffiliateSnapshot(
    order.affiliateAttributionSnapshotJson,
  );
  if (!affiliateAttribution) {
    return null;
  }

  return {
    orderId: order.id,
    orderStatus: order.status,
    orderCreatedAt: order.createdAt.toISOString(),
    orderAmountCents: order.amountCents,
    currency: order.currency,
    packageCode: order.packageCode,
    packageName: order.packageName,
    customerEmail: order.customerEmail,
    customerDisplayName: order.user.profile?.displayName ?? null,
    affiliateAttribution,
  };
}

export function normalizeAffiliateSnapshot(
  value: Prisma.JsonValue | null,
): AffiliateOrderAttributionSnapshot | null {
  if (!isRecord(value) || value.source !== 'affiliate_click') {
    return null;
  }

  const clickId = recordString(value, 'clickId');
  const affiliateLinkId = recordString(value, 'affiliateLinkId');
  const participantId = recordString(value, 'participantId');
  const clickCreatedAt = recordString(value, 'clickCreatedAt');
  const orderSnapshottedAt = recordString(value, 'orderSnapshottedAt');
  const attributionModel = recordString(value, 'attributionModel');
  const matchConfidence = recordString(value, 'matchConfidence');
  const attributionWindowDays = recordNumber(value, 'attributionWindowDays');

  if (
    !clickId ||
    !affiliateLinkId ||
    !participantId ||
    !clickCreatedAt ||
    !orderSnapshottedAt ||
    !attributionModel ||
    !matchConfidence ||
    attributionWindowDays === null
  ) {
    return null;
  }

  return {
    source: 'affiliate_click',
    clickId,
    affiliateClickEventId:
      recordString(value, 'affiliateClickEventId') ?? undefined,
    affiliateLinkId,
    affiliateQrAssetId: recordNullableString(value, 'affiliateQrAssetId'),
    participantId,
    agencyId: recordNullableString(value, 'agencyId'),
    agencyMemberId: recordNullableString(value, 'agencyMemberId'),
    referralCode: recordNullableString(value, 'referralCode'),
    campaign: recordNullableString(value, 'campaign'),
    channel: recordNullableString(value, 'channel'),
    placement: recordNullableString(value, 'placement'),
    packageCode: recordNullableString(value, 'packageCode'),
    clickCreatedAt,
    orderSnapshottedAt,
    attributionModel,
    matchConfidence,
    attributionWindowDays,
  };
}
