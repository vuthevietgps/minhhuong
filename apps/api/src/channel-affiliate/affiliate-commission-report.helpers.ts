import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AffiliateCommissionAggregateQueryDto,
  ListAffiliateCommissionsQueryDto,
} from './dto/channel-affiliate.dto';
import {
  affiliateCommissionDataFilterFields,
  incrementCount,
  incrementCurrencyAmount,
  isRecord,
  optionalTrim,
  recordNullableString,
  recordNumber,
  recordString,
  singleCurrencyAmount,
  sortedNumericRecord,
} from './channel-affiliate.helpers';

export type AffiliateCommissionProof = {
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
  commissionChainSnapshotStatus: 'frozen' | 'legacy_missing';
};

export type CommissionChainSnapshotItem = {
  depth: number;
  participantId: string;
  beneficiaryType: string;
  beneficiaryId: string | null;
  rateBps: number;
  agencyId: string | null;
  agencyMemberId: string | null;
  parentParticipantId: string | null;
};

export type CommissionChainSnapshot = {
  source: 'affiliate_order_snapshot';
  policyVersion: string;
  rootParticipantId: string;
  items: CommissionChainSnapshotItem[];
};

export const affiliateCommissionSortFields = [
  'createdAt',
  'availableAt',
  'amountCents',
  'depth',
] as const;

export const affiliateCommissionSortDirections = ['asc', 'desc'] as const;

export const affiliateCommissionAggregateFields = {
  participant: 'participantId',
  beneficiaryType: 'beneficiaryType',
  beneficiary: 'beneficiaryId',
  affiliateLink: 'affiliateLinkId',
  affiliateQrAsset: 'affiliateQrAssetId',
  agency: 'agencyId',
  agencyMember: 'agencyMemberId',
  campaign: 'campaign',
  channel: 'channel',
  placement: 'placement',
  package: 'packageCode',
  commissionStatus: 'status',
  commissionChainSnapshotStatus: 'commissionChainSnapshotStatus',
  currency: 'currency',
} as const;

export const affiliateCommissionAggregateSortBy = [
  'totalCommissions',
  'pendingCommissions',
  'totalAmountCents',
  'lastCommissionCreatedAt',
] as const;

export const affiliateCommissionAggregateSortDirections = [
  'asc',
  'desc',
] as const;

export const affiliateCommissionExportHeaders = [
  'commissionEarningId',
  'activationOrderId',
  'orderStatus',
  'orderCreatedAt',
  'orderApprovedAt',
  'participantId',
  'beneficiaryType',
  'beneficiaryId',
  'depth',
  'status',
  'baseAmountCents',
  'rateBps',
  'amountCents',
  'currency',
  'availableAt',
  'createdAt',
  'updatedAt',
  'affiliateProofSource',
  'affiliateParticipantId',
  'agencyId',
  'agencyMemberId',
  'referralCode',
  'affiliateLinkId',
  'affiliateQrAssetId',
  'campaign',
  'channel',
  'placement',
  'packageCode',
  'clickId',
  'clickCreatedAt',
  'orderSnapshottedAt',
  'commissionChainSnapshotStatus',
  'chainPolicyVersion',
  'chainRootParticipantId',
  'chainDepth',
  'chainSnapshotStatus',
] as const;

export const affiliateCommissionAggregateExportHeaders = [
  'groupBy',
  'key',
  'totalCommissions',
  'pendingCommissions',
  'releasedCommissions',
  'revokedCommissions',
  'availableCommissions',
  'countByStatus',
  'totalAmountCentsByCurrency',
  'pendingAmountCentsByCurrency',
  'releasedAmountCentsByCurrency',
  'availableAmountCentsByCurrency',
  'totalAmountCents',
  'firstCommissionCreatedAt',
  'lastCommissionCreatedAt',
] as const;

export type AffiliateCommissionAggregateField =
  (typeof affiliateCommissionAggregateFields)[keyof typeof affiliateCommissionAggregateFields];

export type AffiliateCommissionAggregateSortBy =
  (typeof affiliateCommissionAggregateSortBy)[number];

export type AffiliateCommissionAggregateSortDirection =
  (typeof affiliateCommissionAggregateSortDirections)[number];

export type AffiliateCommissionAggregateBucket = {
  key: string | null;
  totalCommissions: number;
  pendingCommissions: number;
  releasedCommissions: number;
  revokedCommissions: number;
  availableCommissions: number;
  countByStatus: Record<string, number>;
  totalAmountCentsByCurrency: Record<string, number>;
  pendingAmountCentsByCurrency: Record<string, number>;
  releasedAmountCentsByCurrency: Record<string, number>;
  availableAmountCentsByCurrency: Record<string, number>;
  firstCommissionCreatedAt: Date;
  lastCommissionCreatedAt: Date;
};

export type AffiliateCommissionAggregateItem = {
  groupBy: string;
  sourceField: AffiliateCommissionAggregateField;
  key: string | null;
  totalCommissions: number;
  countByStatus: Record<string, number>;
  pendingCommissions: number;
  releasedCommissions: number;
  revokedCommissions: number;
  availableCommissions: number;
  totalAmountCentsByCurrency: Record<string, number>;
  pendingAmountCentsByCurrency: Record<string, number>;
  releasedAmountCentsByCurrency: Record<string, number>;
  availableAmountCentsByCurrency: Record<string, number>;
  totalAmountCents: number | null;
  firstCommissionCreatedAt: string;
  lastCommissionCreatedAt: string;
};

export function pushCommissionProofFilter(
  filters: Prisma.CommissionEarningWhereInput[],
  field: string,
  value?: string,
) {
  const normalized = optionalTrim(value);
  if (normalized) {
    filters.push(commissionProofFilter(field, normalized));
  }
}

export function commissionProofFilter(
  field: string,
  value: string,
): Prisma.CommissionEarningWhereInput {
  return {
    attributionSnapshotJson: {
      path: [field],
      equals: value,
    },
  };
}

export function affiliateCommissionOrderBy(
  sortBy?: string,
  sortDirection?: string,
): Prisma.CommissionEarningOrderByWithRelationInput[] {
  if (
    sortBy &&
    !affiliateCommissionSortFields.includes(
      sortBy as (typeof affiliateCommissionSortFields)[number],
    )
  ) {
    throw new BadRequestException(
      'sortBy must be one of createdAt, availableAt, amountCents, depth',
    );
  }
  if (
    sortDirection &&
    !affiliateCommissionSortDirections.includes(
      sortDirection as (typeof affiliateCommissionSortDirections)[number],
    )
  ) {
    throw new BadRequestException('sortDirection must be asc or desc');
  }
  const field =
    (sortBy as (typeof affiliateCommissionSortFields)[number] | undefined) ??
    'createdAt';
  const direction =
    (sortDirection as
      (typeof affiliateCommissionSortDirections)[number] | undefined) ?? 'desc';

  return [{ [field]: direction }, { id: direction }];
}

export function commissionAggregateField(
  groupBy?: string,
): AffiliateCommissionAggregateField {
  const field =
    affiliateCommissionAggregateFields[
      groupBy as keyof typeof affiliateCommissionAggregateFields
    ];
  if (!field) {
    throw new BadRequestException(
      'groupBy must be one of participant, beneficiaryType, beneficiary, affiliateLink, affiliateQrAsset, agency, agencyMember, campaign, channel, placement, package, commissionStatus, commissionChainSnapshotStatus, currency',
    );
  }
  return field;
}

export function commissionAggregateSortBy(
  value?: string,
): AffiliateCommissionAggregateSortBy {
  if (!value) {
    return 'totalCommissions';
  }
  if (
    affiliateCommissionAggregateSortBy.includes(
      value as AffiliateCommissionAggregateSortBy,
    )
  ) {
    return value as AffiliateCommissionAggregateSortBy;
  }
  throw new BadRequestException(
    'sortBy must be one of totalCommissions, pendingCommissions, totalAmountCents, lastCommissionCreatedAt',
  );
}

export function commissionAggregateSortDirection(
  value?: string,
): AffiliateCommissionAggregateSortDirection {
  if (!value) {
    return 'desc';
  }
  if (
    affiliateCommissionAggregateSortDirections.includes(
      value as AffiliateCommissionAggregateSortDirection,
    )
  ) {
    return value as AffiliateCommissionAggregateSortDirection;
  }
  throw new BadRequestException('sortDirection must be asc or desc');
}

export function emptyCommissionAggregateBucket(
  key: string | null,
  createdAt: Date,
): AffiliateCommissionAggregateBucket {
  return {
    key,
    totalCommissions: 0,
    pendingCommissions: 0,
    releasedCommissions: 0,
    revokedCommissions: 0,
    availableCommissions: 0,
    countByStatus: {},
    totalAmountCentsByCurrency: {},
    pendingAmountCentsByCurrency: {},
    releasedAmountCentsByCurrency: {},
    availableAmountCentsByCurrency: {},
    firstCommissionCreatedAt: createdAt,
    lastCommissionCreatedAt: createdAt,
  };
}

export function addCommissionAggregateRow(
  bucket: AffiliateCommissionAggregateBucket,
  row: {
    amountCents: number;
    currency: string;
    status: string;
    createdAt: Date;
  },
) {
  const wasEmpty = bucket.totalCommissions === 0;
  bucket.totalCommissions += 1;
  incrementCount(bucket.countByStatus, row.status);
  incrementCurrencyAmount(
    bucket.totalAmountCentsByCurrency,
    row.currency,
    row.amountCents,
  );

  if (row.status === 'PENDING') {
    bucket.pendingCommissions += 1;
    incrementCurrencyAmount(
      bucket.pendingAmountCentsByCurrency,
      row.currency,
      row.amountCents,
    );
  }

  if (row.status === 'AVAILABLE') {
    bucket.releasedCommissions += 1;
    bucket.availableCommissions += 1;
    incrementCurrencyAmount(
      bucket.releasedAmountCentsByCurrency,
      row.currency,
      row.amountCents,
    );
    incrementCurrencyAmount(
      bucket.availableAmountCentsByCurrency,
      row.currency,
      row.amountCents,
    );
  }

  if (row.status === 'CANCELED') {
    bucket.revokedCommissions += 1;
  }

  if (
    wasEmpty ||
    row.createdAt.getTime() < bucket.firstCommissionCreatedAt.getTime()
  ) {
    bucket.firstCommissionCreatedAt = row.createdAt;
  }
  if (
    wasEmpty ||
    row.createdAt.getTime() > bucket.lastCommissionCreatedAt.getTime()
  ) {
    bucket.lastCommissionCreatedAt = row.createdAt;
  }
}

export function commissionAggregateKey(
  groupBy: string,
  row: {
    participantId: string | null;
    beneficiaryType: string;
    beneficiaryUserId: string | null;
    beneficiaryAgencyId: string | null;
    status: string;
    currency: string;
  },
  proof: AffiliateCommissionProof,
) {
  if (groupBy === 'participant') {
    return row.participantId;
  }
  if (groupBy === 'beneficiaryType') {
    return row.beneficiaryType;
  }
  if (groupBy === 'beneficiary') {
    return row.beneficiaryType === 'AGENCY'
      ? row.beneficiaryAgencyId
      : row.beneficiaryUserId;
  }
  if (groupBy === 'affiliateLink') {
    return proof.affiliateLinkId;
  }
  if (groupBy === 'affiliateQrAsset') {
    return proof.affiliateQrAssetId;
  }
  if (groupBy === 'agency') {
    return proof.agencyId;
  }
  if (groupBy === 'agencyMember') {
    return proof.agencyMemberId;
  }
  if (groupBy === 'campaign') {
    return proof.campaign;
  }
  if (groupBy === 'channel') {
    return proof.channel;
  }
  if (groupBy === 'placement') {
    return proof.placement;
  }
  if (groupBy === 'package') {
    return proof.packageCode;
  }
  if (groupBy === 'commissionStatus') {
    return row.status;
  }
  if (groupBy === 'commissionChainSnapshotStatus') {
    return proof.commissionChainSnapshotStatus;
  }
  if (groupBy === 'currency') {
    return row.currency;
  }
  return null;
}

export function serializeCommissionAggregateBucket(
  groupBy: string,
  sourceField: AffiliateCommissionAggregateField,
  bucket: AffiliateCommissionAggregateBucket,
): AffiliateCommissionAggregateItem {
  const totalAmountCentsByCurrency = sortedNumericRecord(
    bucket.totalAmountCentsByCurrency,
  );
  return {
    groupBy,
    sourceField,
    key: bucket.key,
    totalCommissions: bucket.totalCommissions,
    countByStatus: sortedNumericRecord(bucket.countByStatus),
    pendingCommissions: bucket.pendingCommissions,
    releasedCommissions: bucket.releasedCommissions,
    revokedCommissions: bucket.revokedCommissions,
    availableCommissions: bucket.availableCommissions,
    totalAmountCentsByCurrency,
    pendingAmountCentsByCurrency: sortedNumericRecord(
      bucket.pendingAmountCentsByCurrency,
    ),
    releasedAmountCentsByCurrency: sortedNumericRecord(
      bucket.releasedAmountCentsByCurrency,
    ),
    availableAmountCentsByCurrency: sortedNumericRecord(
      bucket.availableAmountCentsByCurrency,
    ),
    totalAmountCents: singleCurrencyAmount(totalAmountCentsByCurrency),
    firstCommissionCreatedAt: bucket.firstCommissionCreatedAt.toISOString(),
    lastCommissionCreatedAt: bucket.lastCommissionCreatedAt.toISOString(),
  };
}

export function serializeCommissionAggregateSummary(
  bucket: AffiliateCommissionAggregateBucket,
) {
  const totalAmountCentsByCurrency = sortedNumericRecord(
    bucket.totalAmountCentsByCurrency,
  );
  return {
    totalCommissions: bucket.totalCommissions,
    countByStatus: sortedNumericRecord(bucket.countByStatus),
    pendingCommissions: bucket.pendingCommissions,
    releasedCommissions: bucket.releasedCommissions,
    revokedCommissions: bucket.revokedCommissions,
    availableCommissions: bucket.availableCommissions,
    totalAmountCentsByCurrency,
    pendingAmountCentsByCurrency: sortedNumericRecord(
      bucket.pendingAmountCentsByCurrency,
    ),
    releasedAmountCentsByCurrency: sortedNumericRecord(
      bucket.releasedAmountCentsByCurrency,
    ),
    availableAmountCentsByCurrency: sortedNumericRecord(
      bucket.availableAmountCentsByCurrency,
    ),
    totalAmountCents: singleCurrencyAmount(totalAmountCentsByCurrency),
    firstCommissionCreatedAt:
      bucket.totalCommissions > 0
        ? bucket.firstCommissionCreatedAt.toISOString()
        : null,
    lastCommissionCreatedAt:
      bucket.totalCommissions > 0
        ? bucket.lastCommissionCreatedAt.toISOString()
        : null,
  };
}

export function compareCommissionAggregateItems(
  left: AffiliateCommissionAggregateItem,
  right: AffiliateCommissionAggregateItem,
  sortBy: AffiliateCommissionAggregateSortBy,
  sortDirection: AffiliateCommissionAggregateSortDirection,
) {
  const direction = sortDirection === 'asc' ? 1 : -1;
  const leftValue = commissionAggregateSortValue(left, sortBy);
  const rightValue = commissionAggregateSortValue(right, sortBy);
  const diff = leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;
  if (diff !== 0) {
    return diff * direction;
  }
  return String(left.key ?? '').localeCompare(String(right.key ?? ''));
}

export function commissionAggregateSortValue(
  item: AffiliateCommissionAggregateItem,
  sortBy: AffiliateCommissionAggregateSortBy,
) {
  if (sortBy === 'lastCommissionCreatedAt') {
    return new Date(item.lastCommissionCreatedAt).getTime();
  }
  if (sortBy === 'totalAmountCents') {
    return item.totalAmountCents ?? 0;
  }
  return item[sortBy];
}

export function serializeAffiliateCommissionFilters(
  query:
    ListAffiliateCommissionsQueryDto | AffiliateCommissionAggregateQueryDto,
) {
  const filters: Record<string, string> = {};
  for (const field of affiliateCommissionDataFilterFields) {
    const value = optionalTrim(query[field]);
    if (value) {
      filters[field] = value;
    }
  }
  return filters;
}

export function serializeAffiliateCommission(row: {
  id: string;
  activationOrderId: string;
  participantId: string | null;
  beneficiaryType: string;
  beneficiaryUserId: string | null;
  beneficiaryAgencyId: string | null;
  baseAmountCents: number;
  rateBps: number;
  amountCents: number;
  currency: string;
  attributionSnapshotJson: Prisma.JsonValue | null;
  status: string;
  depth: number;
  availableAt: Date | null;
  createdAt: Date;
  activationOrder: {
    id: string;
    status: string;
    createdAt: Date;
    activatedAt: Date | null;
    amountCents: number;
    currency: string;
    commissionChainSnapshotJson: Prisma.JsonValue | null;
  };
}) {
  const affiliateProof = normalizeAffiliateCommissionProof(
    row.attributionSnapshotJson,
    row.activationOrder.commissionChainSnapshotJson,
  );
  if (!affiliateProof) {
    return null;
  }

  const chainProof = serializeCommissionChainProof(row, affiliateProof);

  return {
    commissionEarningId: row.id,
    activationOrderId: row.activationOrderId,
    orderStatus: row.activationOrder.status,
    orderCreatedAt: row.activationOrder.createdAt.toISOString(),
    orderApprovedAt: row.activationOrder.activatedAt?.toISOString() ?? null,
    participantId: row.participantId,
    beneficiaryType: row.beneficiaryType,
    beneficiaryId:
      row.beneficiaryType === 'AGENCY'
        ? row.beneficiaryAgencyId
        : row.beneficiaryUserId,
    depth: row.depth,
    status: row.status,
    baseAmountCents: row.baseAmountCents,
    rateBps: row.rateBps,
    amountCents: row.amountCents,
    currency: row.currency,
    availableAt: row.availableAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: null,
    affiliateProof,
    chainProof,
  };
}

export function serializeAffiliateCommissionExportRow(row: {
  id: string;
  activationOrderId: string;
  participantId: string | null;
  beneficiaryType: string;
  beneficiaryUserId: string | null;
  beneficiaryAgencyId: string | null;
  baseAmountCents: number;
  rateBps: number;
  amountCents: number;
  currency: string;
  attributionSnapshotJson: Prisma.JsonValue | null;
  status: string;
  depth: number;
  availableAt: Date | null;
  createdAt: Date;
  activationOrder: {
    id: string;
    status: string;
    createdAt: Date;
    activatedAt: Date | null;
    amountCents: number;
    currency: string;
    commissionChainSnapshotJson: Prisma.JsonValue | null;
  };
}) {
  const item = serializeAffiliateCommission(row);
  if (!item) {
    return null;
  }

  return {
    commissionEarningId: item.commissionEarningId,
    activationOrderId: item.activationOrderId,
    orderStatus: item.orderStatus,
    orderCreatedAt: item.orderCreatedAt,
    orderApprovedAt: item.orderApprovedAt,
    participantId: item.participantId,
    beneficiaryType: item.beneficiaryType,
    beneficiaryId: item.beneficiaryId,
    depth: item.depth,
    status: item.status,
    baseAmountCents: item.baseAmountCents,
    rateBps: item.rateBps,
    amountCents: item.amountCents,
    currency: item.currency,
    availableAt: item.availableAt,
    createdAt: item.createdAt,
    updatedAt: 'null',
    affiliateProofSource: item.affiliateProof.source,
    affiliateParticipantId: item.affiliateProof.participantId,
    agencyId: item.affiliateProof.agencyId,
    agencyMemberId: item.affiliateProof.agencyMemberId,
    referralCode: item.affiliateProof.referralCode,
    affiliateLinkId: item.affiliateProof.affiliateLinkId,
    affiliateQrAssetId: item.affiliateProof.affiliateQrAssetId,
    campaign: item.affiliateProof.campaign,
    channel: item.affiliateProof.channel,
    placement: item.affiliateProof.placement,
    packageCode: item.affiliateProof.packageCode,
    clickId: item.affiliateProof.clickId,
    clickCreatedAt: item.affiliateProof.clickCreatedAt,
    orderSnapshottedAt: item.affiliateProof.orderSnapshottedAt,
    commissionChainSnapshotStatus:
      item.affiliateProof.commissionChainSnapshotStatus,
    chainPolicyVersion: item.chainProof.policyVersion,
    chainRootParticipantId: item.chainProof.rootParticipantId,
    chainDepth: item.chainProof.depth,
    chainSnapshotStatus: item.chainProof.snapshotStatus,
  };
}

export function normalizeAffiliateCommissionProof(
  value: Prisma.JsonValue | null,
  chainSnapshotValue: Prisma.JsonValue | null,
): AffiliateCommissionProof | null {
  if (!isRecord(value) || value.source !== 'affiliate_order_snapshot') {
    return null;
  }

  const participantId = recordString(value, 'participantId');
  const affiliateLinkId = recordString(value, 'affiliateLinkId');
  const clickId = recordString(value, 'clickId');
  const clickCreatedAt = recordString(value, 'clickCreatedAt');
  const orderSnapshottedAt = recordString(value, 'orderSnapshottedAt');
  if (
    !participantId ||
    !affiliateLinkId ||
    !clickId ||
    !clickCreatedAt ||
    !orderSnapshottedAt
  ) {
    return null;
  }

  const explicitStatus = recordNullableString(
    value,
    'commissionChainSnapshotStatus',
  );
  const chainSnapshot = normalizeCommissionChainSnapshot(chainSnapshotValue);

  return {
    source: 'affiliate_order_snapshot',
    participantId,
    agencyId: recordNullableString(value, 'agencyId'),
    agencyMemberId: recordNullableString(value, 'agencyMemberId'),
    referralCode: recordNullableString(value, 'referralCode'),
    affiliateLinkId,
    affiliateQrAssetId: recordNullableString(value, 'affiliateQrAssetId'),
    campaign: recordNullableString(value, 'campaign'),
    channel: recordNullableString(value, 'channel'),
    placement: recordNullableString(value, 'placement'),
    packageCode: recordNullableString(value, 'packageCode'),
    clickId,
    clickCreatedAt,
    orderSnapshottedAt,
    commissionChainSnapshotStatus:
      explicitStatus === 'legacy_missing' || !chainSnapshot
        ? 'legacy_missing'
        : 'frozen',
  };
}

export function normalizeCommissionChainSnapshot(
  value: Prisma.JsonValue | null,
): CommissionChainSnapshot | null {
  if (!isRecord(value) || value.source !== 'affiliate_order_snapshot') {
    return null;
  }

  const policyVersion = recordString(value, 'policyVersion');
  const rootParticipantId = recordString(value, 'rootParticipantId');
  if (!policyVersion || !rootParticipantId || !Array.isArray(value.items)) {
    return null;
  }

  const items = value.items
    .map((item) => normalizeCommissionChainSnapshotItem(item))
    .filter((item): item is CommissionChainSnapshotItem => Boolean(item));
  if (items.length === 0) {
    return null;
  }

  return {
    source: 'affiliate_order_snapshot',
    policyVersion,
    rootParticipantId,
    items,
  };
}

export function normalizeCommissionChainSnapshotItem(
  value: Prisma.JsonValue,
): CommissionChainSnapshotItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const depth = recordNumber(value, 'depth');
  const participantId = recordString(value, 'participantId');
  const beneficiaryType = recordString(value, 'beneficiaryType');
  const rateBps = recordNumber(value, 'rateBps');
  if (
    depth === null ||
    !participantId ||
    !beneficiaryType ||
    rateBps === null
  ) {
    return null;
  }

  return {
    depth,
    participantId,
    beneficiaryType,
    beneficiaryId: recordNullableString(value, 'beneficiaryId'),
    rateBps,
    agencyId: recordNullableString(value, 'agencyId'),
    agencyMemberId: recordNullableString(value, 'agencyMemberId'),
    parentParticipantId: recordNullableString(value, 'parentParticipantId'),
  };
}

export function serializeCommissionChainProof(
  row: {
    participantId: string | null;
    beneficiaryType: string;
    beneficiaryUserId: string | null;
    beneficiaryAgencyId: string | null;
    rateBps: number;
    depth: number;
    activationOrder: {
      commissionChainSnapshotJson: Prisma.JsonValue | null;
    };
  },
  affiliateProof: AffiliateCommissionProof,
) {
  const snapshot = normalizeCommissionChainSnapshot(
    row.activationOrder.commissionChainSnapshotJson,
  );
  const item = snapshot?.items.find(
    (candidate) =>
      candidate.depth === row.depth &&
      candidate.participantId === row.participantId,
  );
  const fallbackBeneficiaryId =
    row.beneficiaryType === 'AGENCY'
      ? row.beneficiaryAgencyId
      : row.beneficiaryUserId;

  return {
    policyVersion: snapshot?.policyVersion ?? null,
    rootParticipantId: snapshot?.rootParticipantId ?? null,
    depth: row.depth,
    chainSource: snapshot ? 'affiliate_order_snapshot' : null,
    snapshotStatus: affiliateProof.commissionChainSnapshotStatus,
    participantId: item?.participantId ?? row.participantId,
    beneficiaryType: item?.beneficiaryType ?? row.beneficiaryType,
    beneficiaryId: item?.beneficiaryId ?? fallbackBeneficiaryId,
    rateBps: item?.rateBps ?? row.rateBps,
    agencyId: item?.agencyId ?? null,
    agencyMemberId: item?.agencyMemberId ?? null,
    parentParticipantId: item?.parentParticipantId ?? null,
  };
}
