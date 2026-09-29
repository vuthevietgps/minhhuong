import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AffiliateLinkStatus, Prisma } from '@prisma/client';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  AffiliateCommissionAggregateQueryDto,
  AffiliateOrderAttributionAggregateQueryDto,
  AffiliateOrderAttributionFiltersDto,
  CreateAffiliateLinkDto,
  CreateAffiliateQrAssetDto,
  ExportAffiliateCommissionsQueryDto,
  ExportAffiliateOrderAttributionsQueryDto,
  ListAffiliateCommissionsQueryDto,
  ListAffiliateReportAccessAuditsQueryDto,
  ListAffiliateOrderAttributionsQueryDto,
  ListAffiliateLinksQueryDto,
  UpdateAffiliateLinkDto,
} from './dto/channel-affiliate.dto';

const affiliateQrAssetSelect = {
  id: true,
  affiliateLinkId: true,
  label: true,
  placement: true,
  encodedUrl: true,
  qrImageUrl: true,
  status: true,
  metadataJson: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AffiliateQrAssetSelect;

const affiliateLinkInclude = {
  participant: {
    select: {
      id: true,
      type: true,
      code: true,
      displayName: true,
      status: true,
      userId: true,
      agencyId: true,
      lineage: true,
      depth: true,
    },
  },
  agency: {
    select: {
      id: true,
      code: true,
      name: true,
      status: true,
    },
  },
  agencyMember: {
    select: {
      id: true,
      role: true,
      referralCode: true,
      isActive: true,
      userId: true,
      agencyId: true,
    },
  },
  qrAssets: {
    orderBy: { createdAt: 'desc' },
    select: affiliateQrAssetSelect,
  },
} satisfies Prisma.AffiliateLinkInclude;

type AffiliateLinkWithRelations = Prisma.AffiliateLinkGetPayload<{
  include: typeof affiliateLinkInclude;
}>;

type ActorParticipant = {
  id: string;
  type: string;
  code: string;
  userId: string | null;
  agencyId: string | null;
  lineage: string;
  depth: number;
  status: string;
};

type PublicRedirectInput = {
  linkCode: string;
  query?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  deviceHint?: string;
  dedupeKey?: string;
};

type PublicRedirectResult = {
  redirectUrl: string;
  eventCreated: boolean;
  clickId?: string;
  reason: 'active' | 'deduped' | 'missing' | 'inactive';
};

type AffiliateOrderAttributionSnapshot = {
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

type AffiliateCommissionProof = {
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

type CommissionChainSnapshotItem = {
  depth: number;
  participantId: string;
  beneficiaryType: string;
  beneficiaryId: string | null;
  rateBps: number;
  agencyId: string | null;
  agencyMemberId: string | null;
  parentParticipantId: string | null;
};

type CommissionChainSnapshot = {
  source: 'affiliate_order_snapshot';
  policyVersion: string;
  rootParticipantId: string;
  items: CommissionChainSnapshotItem[];
};

const affiliateOrderAttributionAggregateFields = {
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

const affiliateOrderAttributionFilterFields = [
  'participantId',
  'agencyId',
  'agencyMemberId',
  'affiliateLinkId',
  'affiliateQrAssetId',
  'clickId',
  'campaign',
  'channel',
  'placement',
  'packageCode',
  'createdFrom',
  'createdTo',
  'clickFrom',
  'clickTo',
] as const;

const affiliateCommissionDataFilterFields = [
  'commissionStatus',
  'participantId',
  'beneficiaryType',
  'beneficiaryId',
  'activationOrderId',
  'affiliateLinkId',
  'affiliateQrAssetId',
  'agencyId',
  'agencyMemberId',
  'clickId',
  'campaign',
  'channel',
  'placement',
  'packageCode',
  'commissionChainSnapshotStatus',
  'currency',
  'createdFrom',
  'createdTo',
  'availableFrom',
  'availableTo',
  'approvedFrom',
  'approvedTo',
] as const;

const affiliateCommissionFilterFields = [
  ...affiliateCommissionDataFilterFields,
  'sortBy',
  'sortDirection',
] as const;

const affiliateCommissionSortFields = [
  'createdAt',
  'availableAt',
  'amountCents',
  'depth',
] as const;

const affiliateCommissionSortDirections = ['asc', 'desc'] as const;

const affiliateCommissionAggregateFields = {
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

const affiliateCommissionAggregateSortBy = [
  'totalCommissions',
  'pendingCommissions',
  'totalAmountCents',
  'lastCommissionCreatedAt',
] as const;

const affiliateCommissionAggregateSortDirections = ['asc', 'desc'] as const;

const affiliateOrderAttributionAggregateSortBy = [
  'totalAttributedOrders',
  'approvedOrders',
  'approvedAmountCents',
  'lastOrderCreatedAt',
] as const;

const affiliateOrderAttributionAggregateSortDirections = [
  'asc',
  'desc',
] as const;

const affiliateReportAccessAuditAction = 'channel_affiliate.report_access';
const affiliateReportAccessAuditEntityType = 'AffiliateReportAccessAudit';

const affiliateOrderAttributionExportHeaders = [
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

const affiliateOrderAttributionAggregateExportHeaders = [
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

const affiliateCommissionExportHeaders = [
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

const affiliateCommissionAggregateExportHeaders = [
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

type AffiliateOrderAttributionAggregateField =
  (typeof affiliateOrderAttributionAggregateFields)[keyof typeof affiliateOrderAttributionAggregateFields];

type AffiliateOrderAttributionAggregateSortBy =
  (typeof affiliateOrderAttributionAggregateSortBy)[number];

type AffiliateOrderAttributionAggregateSortDirection =
  (typeof affiliateOrderAttributionAggregateSortDirections)[number];

type AffiliateOrderAttributionAggregateBucket = {
  key: string | null;
  totalAttributedOrders: number;
  approvedOrders: number;
  countByStatus: Record<string, number>;
  approvedAmountCentsByCurrency: Record<string, number>;
  firstOrderCreatedAt: Date;
  lastOrderCreatedAt: Date;
};

type AffiliateOrderAttributionAggregateItem = {
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

type AffiliateCommissionAggregateField =
  (typeof affiliateCommissionAggregateFields)[keyof typeof affiliateCommissionAggregateFields];

type AffiliateCommissionAggregateSortBy =
  (typeof affiliateCommissionAggregateSortBy)[number];

type AffiliateCommissionAggregateSortDirection =
  (typeof affiliateCommissionAggregateSortDirections)[number];

type AffiliateCommissionAggregateBucket = {
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

type AffiliateCommissionAggregateItem = {
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

type CsvValue = string | number | boolean | null | undefined;

type AffiliateReportType =
  | 'ORDER_ATTRIBUTION_LIST'
  | 'ORDER_ATTRIBUTION_AGGREGATE'
  | 'AFFILIATE_COMMISSION_LIST'
  | 'AFFILIATE_COMMISSION_AGGREGATE';

type AffiliateReportFormat = 'JSON' | 'CSV';

type AffiliateReportAccessAuditMetadata = {
  actorUserId: string;
  actorRoles: string[];
  route: string;
  reportType: AffiliateReportType;
  format: AffiliateReportFormat;
  safeFilterSummary: Record<string, string | number>;
  rowCount: number;
  scopeSummary: {
    roles: string[];
    isGlobalManager: boolean;
  };
};

@Injectable()
export class ChannelAffiliateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listLinks(
    user: AuthenticatedUser,
    query: ListAffiliateLinksQueryDto = {},
  ) {
    const filters: Prisma.AffiliateLinkWhereInput[] = [];
    const participantScope = await this.participantScopeWhere(user);
    if (participantScope) {
      filters.push({ participant: { is: participantScope } });
    }

    if (query.status) {
      filters.push({ status: query.status });
    }

    const participantId = this.optionalTrim(query.participantId);
    if (participantId) {
      filters.push({ participantId });
    }

    const q = this.optionalTrim(query.q);
    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { linkCode: { contains: q, mode: 'insensitive' } },
          { campaign: { contains: q, mode: 'insensitive' } },
          { channel: { contains: q, mode: 'insensitive' } },
          { placement: { contains: q, mode: 'insensitive' } },
          { packageCode: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const links = await this.prisma.affiliateLink.findMany({
      where: filters.length > 0 ? { AND: filters } : {},
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: this.listLimit(query.limit),
      include: affiliateLinkInclude,
    });

    return {
      items: links.map((link) => this.serializeLink(link)),
    };
  }

  async listOrderAttributions(
    user: AuthenticatedUser,
    query: ListAffiliateOrderAttributionsQueryDto = {},
  ) {
    const where = await this.affiliateOrderAttributionWhere(user, query);
    const page = this.pageNumber(query.page);
    const pageSize = this.pageSize(query.pageSize);
    const skip = (page - 1) * pageSize;

    const [total, statusRows, approvedAggregate, orders] = await Promise.all([
      this.prisma.activationOrder.count({ where }),
      this.prisma.activationOrder.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.activationOrder.aggregate({
        where: { AND: [where, { status: 'APPROVED' }] },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          status: true,
          createdAt: true,
          customerEmail: true,
          amountCents: true,
          currency: true,
          packageCode: true,
          packageName: true,
          affiliateAttributionSnapshotJson: true,
          user: {
            select: {
              email: true,
              profile: { select: { displayName: true } },
            },
          },
        },
      }),
    ]);

    const items = orders
      .map((order) => this.serializeOrderAttribution(order))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const result = {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: skip + items.length < total,
      summary: {
        totalOrders: total,
        countByStatus: Object.fromEntries(
          statusRows.map((row) => [row.status, row._count.id]),
        ),
        approvedOrders: approvedAggregate._count.id,
        approvedAmountCents: approvedAggregate._sum.amountCents ?? 0,
      },
    };

    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/order-attributions',
      reportType: 'ORDER_ATTRIBUTION_LIST',
      format: 'JSON',
      query,
      rowCount: items.length,
    });

    return result;
  }

  async listCommissions(
    user: AuthenticatedUser,
    query: ListAffiliateCommissionsQueryDto = {},
  ) {
    const where = await this.affiliateCommissionWhere(user, query);
    const page = this.pageNumber(query.page);
    const pageSize = this.pageSize(query.pageSize, 200);
    const skip = (page - 1) * pageSize;
    const orderBy = this.affiliateCommissionOrderBy(
      query.sortBy,
      query.sortDirection,
    );

    const [total, rows] = await Promise.all([
      this.prisma.commissionEarning.count({ where }),
      this.prisma.commissionEarning.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          activationOrderId: true,
          participantId: true,
          beneficiaryType: true,
          beneficiaryUserId: true,
          beneficiaryAgencyId: true,
          baseAmountCents: true,
          rateBps: true,
          amountCents: true,
          currency: true,
          attributionSnapshotJson: true,
          status: true,
          depth: true,
          availableAt: true,
          createdAt: true,
          activationOrder: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              activatedAt: true,
              amountCents: true,
              currency: true,
              commissionChainSnapshotJson: true,
            },
          },
        },
      }),
    ]);

    const items = rows
      .map((row) => this.serializeAffiliateCommission(row))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const result = {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: skip + rows.length < total,
    };

    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/commissions',
      reportType: 'AFFILIATE_COMMISSION_LIST',
      format: 'JSON',
      query,
      rowCount: items.length,
    });

    return result;
  }

  async exportCommissionsCsv(
    user: AuthenticatedUser,
    query: ExportAffiliateCommissionsQueryDto = {},
  ) {
    const where = await this.affiliateCommissionWhere(user, query);
    const orderBy = this.affiliateCommissionOrderBy(
      query.sortBy,
      query.sortDirection,
    );
    const rows = await this.prisma.commissionEarning.findMany({
      where,
      orderBy,
      take: this.exportLimit(query.limit),
      select: {
        id: true,
        activationOrderId: true,
        participantId: true,
        beneficiaryType: true,
        beneficiaryUserId: true,
        beneficiaryAgencyId: true,
        baseAmountCents: true,
        rateBps: true,
        amountCents: true,
        currency: true,
        attributionSnapshotJson: true,
        status: true,
        depth: true,
        availableAt: true,
        createdAt: true,
        activationOrder: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            activatedAt: true,
            amountCents: true,
            currency: true,
            commissionChainSnapshotJson: true,
          },
        },
      },
    });

    const exportRows = rows
      .map((row) => this.serializeAffiliateCommissionExportRow(row))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/commissions/export.csv',
      reportType: 'AFFILIATE_COMMISSION_LIST',
      format: 'CSV',
      query,
      rowCount: exportRows.length,
    });

    return this.toCsv(affiliateCommissionExportHeaders, exportRows);
  }

  async listCommissionAggregates(
    user: AuthenticatedUser,
    query: AffiliateCommissionAggregateQueryDto,
  ) {
    const result = await this.buildCommissionAggregates(user, query);
    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/commissions/aggregates',
      reportType: 'AFFILIATE_COMMISSION_AGGREGATE',
      format: 'JSON',
      query,
      rowCount: result.items.length,
    });
    return result;
  }

  async exportCommissionAggregatesCsv(
    user: AuthenticatedUser,
    query: AffiliateCommissionAggregateQueryDto,
  ) {
    const report = await this.buildCommissionAggregates(user, query);
    const rows = report.items.map((item) => ({
      groupBy: item.groupBy,
      key: item.key ?? 'null',
      totalCommissions: item.totalCommissions,
      pendingCommissions: item.pendingCommissions,
      releasedCommissions: item.releasedCommissions,
      revokedCommissions: item.revokedCommissions,
      availableCommissions: item.availableCommissions,
      countByStatus: this.stableJson(item.countByStatus),
      totalAmountCentsByCurrency: this.stableJson(
        item.totalAmountCentsByCurrency,
      ),
      pendingAmountCentsByCurrency: this.stableJson(
        item.pendingAmountCentsByCurrency,
      ),
      releasedAmountCentsByCurrency: this.stableJson(
        item.releasedAmountCentsByCurrency,
      ),
      availableAmountCentsByCurrency: this.stableJson(
        item.availableAmountCentsByCurrency,
      ),
      totalAmountCents:
        item.totalAmountCents === null ? 'null' : item.totalAmountCents,
      firstCommissionCreatedAt: item.firstCommissionCreatedAt,
      lastCommissionCreatedAt: item.lastCommissionCreatedAt,
    }));

    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/commissions/aggregates/export.csv',
      reportType: 'AFFILIATE_COMMISSION_AGGREGATE',
      format: 'CSV',
      query,
      rowCount: rows.length,
    });

    return this.toCsv(affiliateCommissionAggregateExportHeaders, rows);
  }

  private async buildCommissionAggregates(
    user: AuthenticatedUser,
    query: AffiliateCommissionAggregateQueryDto,
  ) {
    const sourceField = this.commissionAggregateField(query.groupBy);
    const limit = this.aggregateLimit(query.limit);
    const sortBy = this.commissionAggregateSortBy(query.sortBy);
    const sortDirection = this.commissionAggregateSortDirection(
      query.sortDirection,
    );
    if (sortBy === 'totalAmountCents' && !this.optionalTrim(query.currency)) {
      throw new BadRequestException(
        'totalAmountCents sort requires a currency filter',
      );
    }

    const where = await this.affiliateCommissionWhere(user, query);
    const rows = await this.prisma.commissionEarning.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        participantId: true,
        beneficiaryType: true,
        beneficiaryUserId: true,
        beneficiaryAgencyId: true,
        amountCents: true,
        currency: true,
        attributionSnapshotJson: true,
        status: true,
        createdAt: true,
        activationOrder: {
          select: {
            commissionChainSnapshotJson: true,
          },
        },
      },
    });

    const buckets = new Map<string, AffiliateCommissionAggregateBucket>();
    const summary = this.emptyCommissionAggregateBucket(null, new Date(0));

    for (const row of rows) {
      const proof = this.normalizeAffiliateCommissionProof(
        row.attributionSnapshotJson,
        row.activationOrder.commissionChainSnapshotJson,
      );
      if (!proof) {
        continue;
      }

      const key = this.commissionAggregateKey(query.groupBy, row, proof);
      const bucketKey = JSON.stringify(key);
      let bucket = buckets.get(bucketKey);
      if (!bucket) {
        bucket = this.emptyCommissionAggregateBucket(key, row.createdAt);
        buckets.set(bucketKey, bucket);
      }

      this.addCommissionAggregateRow(summary, row);
      this.addCommissionAggregateRow(bucket, row);
    }

    const items = [...buckets.values()]
      .map((bucket) =>
        this.serializeCommissionAggregateBucket(
          query.groupBy,
          sourceField,
          bucket,
        ),
      )
      .sort((left, right) =>
        this.compareCommissionAggregateItems(
          left,
          right,
          sortBy,
          sortDirection,
        ),
      );

    return {
      items: items.slice(0, limit),
      groupBy: query.groupBy,
      sourceField,
      filters: this.serializeAffiliateCommissionFilters(query),
      limit,
      sortBy,
      sortDirection,
      totalGroups: items.length,
      summary: this.serializeCommissionAggregateSummary(summary),
    };
  }

  async exportOrderAttributionsCsv(
    user: AuthenticatedUser,
    query: ExportAffiliateOrderAttributionsQueryDto = {},
  ) {
    const where = await this.affiliateOrderAttributionWhere(user, query);
    const orders = await this.prisma.activationOrder.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: this.exportLimit(query.limit),
      select: {
        id: true,
        status: true,
        createdAt: true,
        amountCents: true,
        currency: true,
        affiliateAttributionSnapshotJson: true,
      },
    });

    const rows = orders
      .map((order) => this.serializeOrderAttributionExportRow(order))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/order-attributions/export.csv',
      reportType: 'ORDER_ATTRIBUTION_LIST',
      format: 'CSV',
      query,
      rowCount: rows.length,
    });

    return this.toCsv(affiliateOrderAttributionExportHeaders, rows);
  }

  async listOrderAttributionAggregates(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    const result = await this.buildOrderAttributionAggregates(user, query);
    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/order-attributions/aggregates',
      reportType: 'ORDER_ATTRIBUTION_AGGREGATE',
      format: 'JSON',
      query,
      rowCount: result.items.length,
    });
    return result;
  }

  private async buildOrderAttributionAggregates(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    const snapshotField = this.aggregateSnapshotField(query.groupBy);
    const limit = this.aggregateLimit(query.limit);
    const sortBy = this.aggregateSortBy(query.sortBy);
    const sortDirection = this.aggregateSortDirection(query.sortDirection);
    const where = await this.affiliateOrderAttributionWhere(user, query);

    const orders = await this.prisma.activationOrder.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        status: true,
        createdAt: true,
        amountCents: true,
        currency: true,
        affiliateAttributionSnapshotJson: true,
      },
    });

    const buckets = new Map<string, AffiliateOrderAttributionAggregateBucket>();
    const summaryCountByStatus: Record<string, number> = {};
    const summaryApprovedAmountCentsByCurrency: Record<string, number> = {};
    let totalAttributedOrders = 0;
    let approvedOrders = 0;

    for (const order of orders) {
      const snapshot = this.normalizeAffiliateSnapshot(
        order.affiliateAttributionSnapshotJson,
      );
      if (!snapshot) {
        continue;
      }

      const key = snapshot[snapshotField] ?? null;
      const bucketKey = JSON.stringify(key);
      let bucket = buckets.get(bucketKey);
      if (!bucket) {
        bucket = {
          key,
          totalAttributedOrders: 0,
          approvedOrders: 0,
          countByStatus: {},
          approvedAmountCentsByCurrency: {},
          firstOrderCreatedAt: order.createdAt,
          lastOrderCreatedAt: order.createdAt,
        };
        buckets.set(bucketKey, bucket);
      }

      totalAttributedOrders += 1;
      bucket.totalAttributedOrders += 1;
      this.incrementCount(summaryCountByStatus, order.status);
      this.incrementCount(bucket.countByStatus, order.status);
      if (order.createdAt.getTime() < bucket.firstOrderCreatedAt.getTime()) {
        bucket.firstOrderCreatedAt = order.createdAt;
      }
      if (order.createdAt.getTime() > bucket.lastOrderCreatedAt.getTime()) {
        bucket.lastOrderCreatedAt = order.createdAt;
      }

      if (order.status === 'APPROVED') {
        approvedOrders += 1;
        bucket.approvedOrders += 1;
        this.incrementCurrencyAmount(
          summaryApprovedAmountCentsByCurrency,
          order.currency,
          order.amountCents,
        );
        this.incrementCurrencyAmount(
          bucket.approvedAmountCentsByCurrency,
          order.currency,
          order.amountCents,
        );
      }
    }

    if (
      sortBy === 'approvedAmountCents' &&
      Object.keys(summaryApprovedAmountCentsByCurrency).length > 1
    ) {
      throw new BadRequestException(
        'approvedAmountCents sort is only available for single-currency results',
      );
    }

    const items = [...buckets.values()]
      .map((bucket) =>
        this.serializeAggregateBucket(query.groupBy, snapshotField, bucket),
      )
      .sort((left, right) =>
        this.compareAggregateItems(left, right, sortBy, sortDirection),
      );

    return {
      items: items.slice(0, limit),
      groupBy: query.groupBy,
      snapshotField,
      filters: this.serializeAffiliateOrderAttributionFilters(query),
      limit,
      sortBy,
      sortDirection,
      totalGroups: items.length,
      summary: {
        totalAttributedOrders,
        approvedOrders,
        countByStatus: this.sortedNumericRecord(summaryCountByStatus),
        approvedAmountCentsByCurrency: this.sortedNumericRecord(
          summaryApprovedAmountCentsByCurrency,
        ),
        approvedAmountCents: this.singleCurrencyAmount(
          summaryApprovedAmountCentsByCurrency,
        ),
      },
    };
  }

  async exportOrderAttributionAggregatesCsv(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    const report = await this.buildOrderAttributionAggregates(user, query);
    const rows = report.items.map((item) => ({
      groupBy: item.groupBy,
      snapshotField: item.snapshotField,
      key: item.key ?? 'null',
      totalAttributedOrders: item.totalAttributedOrders,
      approvedOrders: item.approvedOrders,
      countByStatus: this.stableJson(item.countByStatus),
      approvedAmountCentsByCurrency: this.stableJson(
        item.approvedAmountCentsByCurrency,
      ),
      approvedAmountCents:
        item.approvedAmountCents === null ? 'null' : item.approvedAmountCents,
      firstOrderCreatedAt: item.firstOrderCreatedAt,
      lastOrderCreatedAt: item.lastOrderCreatedAt,
    }));

    await this.auditAffiliateReportAccess(user, {
      route: '/v1/channel-affiliate/order-attributions/aggregates/export.csv',
      reportType: 'ORDER_ATTRIBUTION_AGGREGATE',
      format: 'CSV',
      query,
      rowCount: rows.length,
    });

    return this.toCsv(affiliateOrderAttributionAggregateExportHeaders, rows);
  }

  async listReportAccessAudits(
    user: AuthenticatedUser,
    query: ListAffiliateReportAccessAuditsQueryDto = {},
  ) {
    this.assertReportAccessAuditReader(user);
    const page = this.pageNumber(query.page);
    const pageSize = this.pageSize(query.pageSize);
    const skip = (page - 1) * pageSize;

    const filters: Prisma.AuditLogWhereInput[] = [
      {
        action: affiliateReportAccessAuditAction,
        entityType: affiliateReportAccessAuditEntityType,
      },
    ];

    const reportType = this.reportAccessAuditReportType(query.reportType);
    if (reportType) {
      filters.push({
        metadata: { path: ['reportType'], equals: reportType },
      });
    }

    const format = this.reportAccessAuditFormat(query.format);
    if (format) {
      filters.push({
        metadata: { path: ['format'], equals: format },
      });
    }

    const actorUserId = this.optionalTrim(query.actorUserId);
    if (actorUserId) {
      filters.push({ userId: actorUserId });
    }

    const createdFrom = this.parseDate(query.createdFrom, 'createdFrom');
    const createdTo = this.parseDate(query.createdTo, 'createdTo');
    if (createdFrom || createdTo) {
      filters.push({
        createdAt: {
          ...(createdFrom ? { gte: createdFrom } : {}),
          ...(createdTo ? { lte: createdTo } : {}),
        },
      });
    }

    const where = { AND: filters } satisfies Prisma.AuditLogWhereInput;
    const [total, rows] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          userId: true,
          metadata: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      items: rows.map((row) => this.serializeReportAccessAudit(row)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: skip + rows.length < total,
    };
  }

  async createLink(dto: CreateAffiliateLinkDto, user: AuthenticatedUser) {
    const createdById = this.requiredDbUserId(user);
    const codeParticipant = dto.participantCode
      ? await this.prisma.channelParticipant.findUnique({
          where: { code: dto.participantCode.trim().toUpperCase() },
          select: { id: true },
        })
      : null;
    if (dto.participantCode && !codeParticipant) {
      throw new BadRequestException('Channel participant code not found');
    }
    if (dto.participantId && codeParticipant && dto.participantId !== codeParticipant.id) {
      throw new BadRequestException('Participant id and code do not match');
    }
    const participant = await this.resolveTargetParticipant(
      user,
      codeParticipant?.id ?? dto.participantId,
    );
    const agencyMember = await this.findParticipantAgencyMember(participant);
    const startsAt = this.parseDate(dto.startsAt, 'startsAt');
    const expiresAt = this.parseDate(dto.expiresAt, 'expiresAt');
    this.assertDateRange(startsAt, expiresAt);

    const data: Omit<
      Prisma.AffiliateLinkUncheckedCreateInput,
      'id' | 'linkCode'
    > = {
      participantId: participant.id,
      agencyId: participant.agencyId ?? agencyMember?.agencyId ?? undefined,
      agencyMemberId: agencyMember?.id,
      createdById,
      referralCode: agencyMember?.referralCode ?? participant.code,
      name: this.requiredTrim(dto.name, 'name'),
      campaign: this.optionalTrim(dto.campaign),
      channel: this.optionalTrim(dto.channel),
      placement: this.optionalTrim(dto.placement),
      packageCode: this.optionalTrim(dto.packageCode),
      packageScopeJson: this.jsonObject(
        dto.packageScopeJson,
        'packageScopeJson',
      ),
      startsAt,
      expiresAt,
      metadataJson: this.jsonObject(dto.metadataJson, 'metadataJson'),
    };

    const link = await this.createLinkWithUniqueCode(data, dto.linkCode);
    await this.audit(
      user,
      'channel_affiliate.link.create',
      'AffiliateLink',
      link.id,
      {
        participantId: link.participantId,
        linkCode: link.linkCode,
      },
    );

    return this.serializeLink(link);
  }

  async updateLink(
    linkId: string,
    dto: UpdateAffiliateLinkDto,
    user: AuthenticatedUser,
  ) {
    const current = await this.findAccessibleLink(linkId, user);
    const startsAt =
      this.parseDate(dto.startsAt, 'startsAt') ?? current.startsAt;
    const expiresAt =
      this.parseDate(dto.expiresAt, 'expiresAt') ?? current.expiresAt;
    this.assertDateRange(startsAt, expiresAt);

    const data: Prisma.AffiliateLinkUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = this.requiredTrim(dto.name, 'name');
    }
    if (dto.campaign !== undefined) {
      data.campaign = this.optionalTrim(dto.campaign);
    }
    if (dto.channel !== undefined) {
      data.channel = this.optionalTrim(dto.channel);
    }
    if (dto.placement !== undefined) {
      data.placement = this.optionalTrim(dto.placement);
    }
    if (dto.packageCode !== undefined) {
      data.packageCode = this.optionalTrim(dto.packageCode);
    }
    if (dto.packageScopeJson !== undefined) {
      data.packageScopeJson = this.jsonObject(
        dto.packageScopeJson,
        'packageScopeJson',
      );
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }
    if (dto.startsAt !== undefined) {
      data.startsAt = startsAt;
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = expiresAt;
    }
    if (dto.metadataJson !== undefined) {
      data.metadataJson = this.jsonObject(dto.metadataJson, 'metadataJson');
    }

    const updated = await this.prisma.affiliateLink.update({
      where: { id: current.id },
      data,
      include: affiliateLinkInclude,
    });

    await this.audit(
      user,
      'channel_affiliate.link.update',
      'AffiliateLink',
      updated.id,
      {
        status: updated.status,
      },
    );

    return this.serializeLink(updated);
  }

  async createQrAsset(
    linkId: string,
    dto: CreateAffiliateQrAssetDto,
    user: AuthenticatedUser,
  ) {
    const createdById = this.requiredDbUserId(user);
    const link = await this.findAccessibleLink(linkId, user);
    const qrAssetId = randomUUID();
    const placement = this.optionalTrim(dto.placement);
    const encodedUrl = this.buildAffiliateUrl(link, {
      qrAssetId,
      placement,
    });

    const qrAsset = await this.prisma.affiliateQrAsset.create({
      data: {
        id: qrAssetId,
        affiliateLinkId: link.id,
        createdById,
        label: this.optionalTrim(dto.label),
        placement,
        encodedUrl,
        qrImageUrl: this.optionalTrim(dto.qrImageUrl),
        status: dto.status ?? 'ACTIVE',
        metadataJson: this.jsonObject(dto.metadataJson, 'metadataJson'),
      },
      select: affiliateQrAssetSelect,
    });

    await this.audit(
      user,
      'channel_affiliate.qr.create',
      'AffiliateQrAsset',
      qrAsset.id,
      {
        affiliateLinkId: link.id,
        participantId: link.participantId,
      },
    );

    return qrAsset;
  }

  async resolvePublicRedirect(
    input: PublicRedirectInput,
  ): Promise<PublicRedirectResult> {
    const linkCode = this.optionalTrim(input.linkCode);
    if (!linkCode) {
      return {
        redirectUrl: this.fallbackRedirectUrl('missing'),
        eventCreated: false,
        reason: 'missing',
      };
    }

    const link = await this.prisma.affiliateLink.findUnique({
      where: { linkCode },
      include: {
        participant: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!link) {
      return {
        redirectUrl: this.fallbackRedirectUrl('missing'),
        eventCreated: false,
        reason: 'missing',
      };
    }

    if (!this.isLinkActiveForRedirect(link)) {
      return {
        redirectUrl: this.fallbackRedirectUrl('inactive'),
        eventCreated: false,
        reason: 'inactive',
      };
    }

    const qrAsset = await this.resolveQrAssetForRedirect(
      link.id,
      this.queryString(input.query, 'qr'),
    );
    const snapshot = this.redirectSnapshot(link, qrAsset, input.query);
    const dedupeKeyHash = this.dedupeHash(link.id, input.dedupeKey);
    if (dedupeKeyHash) {
      const existing = await this.prisma.affiliateClickEvent.findUnique({
        where: { dedupeKeyHash },
        select: { clickId: true },
      });
      if (existing) {
        return {
          redirectUrl: this.redirectDestination(link.linkCode, {
            ...snapshot,
            clickId: existing.clickId,
          }),
          eventCreated: false,
          clickId: existing.clickId,
          reason: 'deduped',
        };
      }
    }

    return this.createClickEventWithUniqueId({
      link,
      qrAsset,
      snapshot,
      dedupeKeyHash,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceHint: input.deviceHint,
    });
  }

  private async affiliateOrderAttributionWhere(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionFiltersDto,
  ): Promise<Prisma.ActivationOrderWhereInput> {
    const filters: Prisma.ActivationOrderWhereInput[] = [
      this.snapshotFilter('source', 'affiliate_click'),
    ];

    const participantScope = await this.participantScopeWhere(user);
    if (participantScope) {
      filters.push({ channelParticipant: { is: participantScope } });
    }

    this.pushSnapshotFilter(filters, 'participantId', query.participantId);
    this.pushSnapshotFilter(filters, 'agencyId', query.agencyId);
    this.pushSnapshotFilter(filters, 'agencyMemberId', query.agencyMemberId);
    this.pushSnapshotFilter(filters, 'affiliateLinkId', query.affiliateLinkId);
    this.pushSnapshotFilter(
      filters,
      'affiliateQrAssetId',
      query.affiliateQrAssetId,
    );
    this.pushSnapshotFilter(filters, 'clickId', query.clickId);
    this.pushSnapshotFilter(filters, 'campaign', query.campaign);
    this.pushSnapshotFilter(filters, 'channel', query.channel);
    this.pushSnapshotFilter(filters, 'placement', query.placement);
    this.pushSnapshotFilter(filters, 'packageCode', query.packageCode);

    if (query.orderStatus) {
      filters.push({ status: query.orderStatus });
    }

    const createdFrom = this.parseDate(query.createdFrom, 'createdFrom');
    const createdTo = this.parseDate(query.createdTo, 'createdTo');
    if (createdFrom || createdTo) {
      filters.push({
        createdAt: {
          ...(createdFrom ? { gte: createdFrom } : {}),
          ...(createdTo ? { lte: createdTo } : {}),
        },
      });
    }

    const clickFrom = this.parseDate(query.clickFrom, 'clickFrom');
    const clickTo = this.parseDate(query.clickTo, 'clickTo');
    if (clickFrom || clickTo) {
      filters.push({
        affiliateAttributionSnapshotJson: {
          path: ['clickCreatedAt'],
          ...(clickFrom ? { gte: clickFrom.toISOString() } : {}),
          ...(clickTo ? { lte: clickTo.toISOString() } : {}),
        },
      });
    }

    return { AND: filters };
  }

  private async affiliateCommissionWhere(
    user: AuthenticatedUser,
    query:
      | ListAffiliateCommissionsQueryDto
      | ExportAffiliateCommissionsQueryDto
      | AffiliateCommissionAggregateQueryDto,
  ): Promise<Prisma.CommissionEarningWhereInput> {
    const filters: Prisma.CommissionEarningWhereInput[] = [
      this.commissionProofFilter('source', 'affiliate_order_snapshot'),
    ];

    const participantScope = await this.participantScopeWhere(user);
    if (participantScope) {
      filters.push({ participant: { is: participantScope } });
    }

    if (query.commissionStatus) {
      filters.push({ status: query.commissionStatus });
    }

    const participantId = this.optionalTrim(query.participantId);
    if (participantId) {
      filters.push({ participantId });
    }

    if (query.beneficiaryType) {
      filters.push({ beneficiaryType: query.beneficiaryType });
    }

    const beneficiaryId = this.optionalTrim(query.beneficiaryId);
    if (beneficiaryId) {
      filters.push({
        OR: [
          { beneficiaryUserId: beneficiaryId },
          { beneficiaryAgencyId: beneficiaryId },
        ],
      });
    }

    const activationOrderId = this.optionalTrim(query.activationOrderId);
    if (activationOrderId) {
      filters.push({ activationOrderId });
    }

    this.pushCommissionProofFilter(
      filters,
      'affiliateLinkId',
      query.affiliateLinkId,
    );
    this.pushCommissionProofFilter(
      filters,
      'affiliateQrAssetId',
      query.affiliateQrAssetId,
    );
    this.pushCommissionProofFilter(filters, 'agencyId', query.agencyId);
    this.pushCommissionProofFilter(
      filters,
      'agencyMemberId',
      query.agencyMemberId,
    );
    this.pushCommissionProofFilter(filters, 'clickId', query.clickId);
    this.pushCommissionProofFilter(filters, 'campaign', query.campaign);
    this.pushCommissionProofFilter(filters, 'channel', query.channel);
    this.pushCommissionProofFilter(filters, 'placement', query.placement);
    this.pushCommissionProofFilter(filters, 'packageCode', query.packageCode);

    const chainStatus = this.optionalTrim(query.commissionChainSnapshotStatus);
    if (chainStatus) {
      if (chainStatus === 'legacy_missing') {
        filters.push(
          this.commissionProofFilter(
            'commissionChainSnapshotStatus',
            'legacy_missing',
          ),
        );
      } else if (chainStatus === 'frozen') {
        filters.push({
          activationOrder: {
            is: {
              commissionChainSnapshotJson: {
                path: ['source'],
                equals: 'affiliate_order_snapshot',
              },
            },
          },
        });
      } else {
        throw new BadRequestException(
          'commissionChainSnapshotStatus must be frozen or legacy_missing',
        );
      }
    }

    const currency = this.optionalTrim(query.currency);
    if (currency) {
      filters.push({ currency });
    }

    const createdFrom = this.parseDate(query.createdFrom, 'createdFrom');
    const createdTo = this.parseDate(query.createdTo, 'createdTo');
    if (createdFrom || createdTo) {
      filters.push({
        createdAt: {
          ...(createdFrom ? { gte: createdFrom } : {}),
          ...(createdTo ? { lte: createdTo } : {}),
        },
      });
    }

    const availableFrom = this.parseDate(query.availableFrom, 'availableFrom');
    const availableTo = this.parseDate(query.availableTo, 'availableTo');
    if (availableFrom || availableTo) {
      filters.push({
        availableAt: {
          ...(availableFrom ? { gte: availableFrom } : {}),
          ...(availableTo ? { lte: availableTo } : {}),
        },
      });
    }

    const approvedFrom = this.parseDate(query.approvedFrom, 'approvedFrom');
    const approvedTo = this.parseDate(query.approvedTo, 'approvedTo');
    if (approvedFrom || approvedTo) {
      filters.push({
        activationOrder: {
          is: {
            activatedAt: {
              ...(approvedFrom ? { gte: approvedFrom } : {}),
              ...(approvedTo ? { lte: approvedTo } : {}),
            },
          },
        },
      });
    }

    return { AND: filters };
  }

  private pushCommissionProofFilter(
    filters: Prisma.CommissionEarningWhereInput[],
    field: string,
    value?: string,
  ) {
    const normalized = this.optionalTrim(value);
    if (normalized) {
      filters.push(this.commissionProofFilter(field, normalized));
    }
  }

  private commissionProofFilter(
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

  private affiliateCommissionOrderBy(
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
        (typeof affiliateCommissionSortDirections)[number] | undefined) ??
      'desc';

    return [{ [field]: direction }, { id: direction }];
  }

  private async auditAffiliateReportAccess(
    user: AuthenticatedUser,
    input: {
      route: string;
      reportType: AffiliateReportType;
      format: AffiliateReportFormat;
      query: unknown;
      rowCount: number;
    },
  ) {
    const metadata: AffiliateReportAccessAuditMetadata = {
      actorUserId: user.sub,
      actorRoles: this.sortedStrings(user.roles),
      route: input.route,
      reportType: input.reportType,
      format: input.format,
      safeFilterSummary: this.safeAffiliateReportFilterSummary(input.query),
      rowCount: input.rowCount,
      scopeSummary: {
        roles: this.sortedStrings(user.roles),
        isGlobalManager: this.isGlobalManager(user),
      },
    };

    await this.prisma.auditLog.create({
      data: {
        userId: this.dbUserId(user),
        action: affiliateReportAccessAuditAction,
        entityType: affiliateReportAccessAuditEntityType,
        entityId: `${input.reportType}:${input.format}`,
        metadata: metadata,
      },
    });
  }

  private safeAffiliateReportFilterSummary(queryValue: unknown) {
    const query = this.objectRecord(queryValue);
    const safe: Record<string, string | number> = {};
    for (const field of affiliateOrderAttributionFilterFields) {
      this.putSafeStringFilter(safe, field, this.stringLike(query[field]));
    }
    for (const field of affiliateCommissionFilterFields) {
      this.putSafeStringFilter(safe, field, this.stringLike(query[field]));
    }
    this.putSafeStringFilter(
      safe,
      'orderStatus',
      this.stringLike(query.orderStatus),
    );
    this.putSafeStringFilter(safe, 'groupBy', this.stringLike(query.groupBy));
    if (typeof query.limit === 'number') {
      safe.limit = query.limit;
    }
    if (typeof query.page === 'number') {
      safe.page = query.page;
    }
    if (typeof query.pageSize === 'number') {
      safe.pageSize = query.pageSize;
    }
    return safe;
  }

  private stringLike(value: unknown) {
    return typeof value === 'string' ? value : undefined;
  }

  private objectRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};
  }

  private putSafeStringFilter(
    target: Record<string, string | number>,
    field: string,
    value?: string,
  ) {
    const normalized = this.optionalTrim(value);
    if (normalized) {
      target[field] = normalized;
    }
  }

  private serializeReportAccessAudit(row: {
    id: string;
    userId: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
  }) {
    const metadata = this.isRecord(row.metadata) ? row.metadata : {};
    return {
      id: row.id,
      actorUserId: row.userId ?? this.recordString(metadata, 'actorUserId'),
      actorRoles: this.recordStringArray(metadata, 'actorRoles'),
      route: this.recordString(metadata, 'route'),
      reportType: this.recordString(metadata, 'reportType'),
      format: this.recordString(metadata, 'format'),
      safeFilterSummary: this.safePrimitiveRecord(metadata.safeFilterSummary),
      rowCount: this.recordNumber(metadata, 'rowCount') ?? 0,
      scopeSummary: this.safeScopeSummary(metadata.scopeSummary),
      createdAt: row.createdAt.toISOString(),
    };
  }

  private assertReportAccessAuditReader(user: AuthenticatedUser) {
    if (!user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role))) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private reportAccessAuditReportType(value?: string) {
    if (!value) {
      return undefined;
    }
    if (
      value === 'ORDER_ATTRIBUTION_LIST' ||
      value === 'ORDER_ATTRIBUTION_AGGREGATE' ||
      value === 'AFFILIATE_COMMISSION_LIST' ||
      value === 'AFFILIATE_COMMISSION_AGGREGATE'
    ) {
      return value;
    }
    throw new BadRequestException('reportType is invalid');
  }

  private reportAccessAuditFormat(value?: string) {
    if (!value) {
      return undefined;
    }
    if (value === 'JSON' || value === 'CSV') {
      return value;
    }
    throw new BadRequestException('format is invalid');
  }

  private safePrimitiveRecord(value: Prisma.JsonValue | undefined) {
    if (!this.isRecord(value)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, string | number] =>
          typeof entry[1] === 'string' || typeof entry[1] === 'number',
      ),
    );
  }

  private safeScopeSummary(value: Prisma.JsonValue | undefined) {
    if (!this.isRecord(value)) {
      return { roles: [], isGlobalManager: false };
    }
    return {
      roles: this.recordStringArray(value, 'roles'),
      isGlobalManager: value.isGlobalManager === true,
    };
  }

  private recordStringArray(
    value: Record<string, Prisma.JsonValue>,
    key: string,
  ) {
    const entry = value[key];
    if (!Array.isArray(entry)) {
      return [];
    }
    return entry.filter((item): item is string => typeof item === 'string');
  }

  private sortedStrings(values: readonly string[]) {
    return [...values].sort((left, right) => left.localeCompare(right));
  }

  private aggregateSnapshotField(
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

  private aggregateLimit(value?: number) {
    if (value === undefined || value === null) {
      return 50;
    }
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new BadRequestException('limit must be between 1 and 100');
    }
    return value;
  }

  private aggregateSortBy(
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

  private aggregateSortDirection(
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

  private serializeAggregateBucket(
    groupBy: string,
    snapshotField: AffiliateOrderAttributionAggregateField,
    bucket: AffiliateOrderAttributionAggregateBucket,
  ): AffiliateOrderAttributionAggregateItem {
    const approvedAmountCentsByCurrency = this.sortedNumericRecord(
      bucket.approvedAmountCentsByCurrency,
    );
    return {
      groupBy,
      snapshotField,
      key: bucket.key,
      totalAttributedOrders: bucket.totalAttributedOrders,
      approvedOrders: bucket.approvedOrders,
      countByStatus: this.sortedNumericRecord(bucket.countByStatus),
      approvedAmountCentsByCurrency,
      approvedAmountCents: this.singleCurrencyAmount(
        approvedAmountCentsByCurrency,
      ),
      firstOrderCreatedAt: bucket.firstOrderCreatedAt.toISOString(),
      lastOrderCreatedAt: bucket.lastOrderCreatedAt.toISOString(),
    };
  }

  private compareAggregateItems(
    left: AffiliateOrderAttributionAggregateItem,
    right: AffiliateOrderAttributionAggregateItem,
    sortBy: AffiliateOrderAttributionAggregateSortBy,
    sortDirection: AffiliateOrderAttributionAggregateSortDirection,
  ) {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const leftValue = this.aggregateSortValue(left, sortBy);
    const rightValue = this.aggregateSortValue(right, sortBy);
    const diff = leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;
    if (diff !== 0) {
      return diff * direction;
    }
    return String(left.key ?? '').localeCompare(String(right.key ?? ''));
  }

  private aggregateSortValue(
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

  private commissionAggregateField(
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

  private commissionAggregateSortBy(
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

  private commissionAggregateSortDirection(
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

  private emptyCommissionAggregateBucket(
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

  private addCommissionAggregateRow(
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
    this.incrementCount(bucket.countByStatus, row.status);
    this.incrementCurrencyAmount(
      bucket.totalAmountCentsByCurrency,
      row.currency,
      row.amountCents,
    );

    if (row.status === 'PENDING') {
      bucket.pendingCommissions += 1;
      this.incrementCurrencyAmount(
        bucket.pendingAmountCentsByCurrency,
        row.currency,
        row.amountCents,
      );
    }

    if (row.status === 'AVAILABLE') {
      bucket.releasedCommissions += 1;
      bucket.availableCommissions += 1;
      this.incrementCurrencyAmount(
        bucket.releasedAmountCentsByCurrency,
        row.currency,
        row.amountCents,
      );
      this.incrementCurrencyAmount(
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

  private commissionAggregateKey(
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

  private serializeCommissionAggregateBucket(
    groupBy: string,
    sourceField: AffiliateCommissionAggregateField,
    bucket: AffiliateCommissionAggregateBucket,
  ): AffiliateCommissionAggregateItem {
    const totalAmountCentsByCurrency = this.sortedNumericRecord(
      bucket.totalAmountCentsByCurrency,
    );
    return {
      groupBy,
      sourceField,
      key: bucket.key,
      totalCommissions: bucket.totalCommissions,
      countByStatus: this.sortedNumericRecord(bucket.countByStatus),
      pendingCommissions: bucket.pendingCommissions,
      releasedCommissions: bucket.releasedCommissions,
      revokedCommissions: bucket.revokedCommissions,
      availableCommissions: bucket.availableCommissions,
      totalAmountCentsByCurrency,
      pendingAmountCentsByCurrency: this.sortedNumericRecord(
        bucket.pendingAmountCentsByCurrency,
      ),
      releasedAmountCentsByCurrency: this.sortedNumericRecord(
        bucket.releasedAmountCentsByCurrency,
      ),
      availableAmountCentsByCurrency: this.sortedNumericRecord(
        bucket.availableAmountCentsByCurrency,
      ),
      totalAmountCents: this.singleCurrencyAmount(totalAmountCentsByCurrency),
      firstCommissionCreatedAt: bucket.firstCommissionCreatedAt.toISOString(),
      lastCommissionCreatedAt: bucket.lastCommissionCreatedAt.toISOString(),
    };
  }

  private serializeCommissionAggregateSummary(
    bucket: AffiliateCommissionAggregateBucket,
  ) {
    const totalAmountCentsByCurrency = this.sortedNumericRecord(
      bucket.totalAmountCentsByCurrency,
    );
    return {
      totalCommissions: bucket.totalCommissions,
      countByStatus: this.sortedNumericRecord(bucket.countByStatus),
      pendingCommissions: bucket.pendingCommissions,
      releasedCommissions: bucket.releasedCommissions,
      revokedCommissions: bucket.revokedCommissions,
      availableCommissions: bucket.availableCommissions,
      totalAmountCentsByCurrency,
      pendingAmountCentsByCurrency: this.sortedNumericRecord(
        bucket.pendingAmountCentsByCurrency,
      ),
      releasedAmountCentsByCurrency: this.sortedNumericRecord(
        bucket.releasedAmountCentsByCurrency,
      ),
      availableAmountCentsByCurrency: this.sortedNumericRecord(
        bucket.availableAmountCentsByCurrency,
      ),
      totalAmountCents: this.singleCurrencyAmount(totalAmountCentsByCurrency),
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

  private compareCommissionAggregateItems(
    left: AffiliateCommissionAggregateItem,
    right: AffiliateCommissionAggregateItem,
    sortBy: AffiliateCommissionAggregateSortBy,
    sortDirection: AffiliateCommissionAggregateSortDirection,
  ) {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const leftValue = this.commissionAggregateSortValue(left, sortBy);
    const rightValue = this.commissionAggregateSortValue(right, sortBy);
    const diff = leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;
    if (diff !== 0) {
      return diff * direction;
    }
    return String(left.key ?? '').localeCompare(String(right.key ?? ''));
  }

  private commissionAggregateSortValue(
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

  private serializeAffiliateOrderAttributionFilters(
    query: AffiliateOrderAttributionFiltersDto,
  ) {
    const filters: Record<string, string> = {};
    for (const field of affiliateOrderAttributionFilterFields) {
      const value = this.optionalTrim(query[field]);
      if (value) {
        filters[field] = value;
      }
    }
    if (query.orderStatus) {
      filters.orderStatus = query.orderStatus;
    }
    return filters;
  }

  private serializeAffiliateCommissionFilters(
    query:
      ListAffiliateCommissionsQueryDto | AffiliateCommissionAggregateQueryDto,
  ) {
    const filters: Record<string, string> = {};
    for (const field of affiliateCommissionDataFilterFields) {
      const value = this.optionalTrim(query[field]);
      if (value) {
        filters[field] = value;
      }
    }
    return filters;
  }

  private incrementCount(counts: Record<string, number>, key: string) {
    counts[key] = (counts[key] ?? 0) + 1;
  }

  private incrementCurrencyAmount(
    amounts: Record<string, number>,
    currency: string,
    amountCents: number,
  ) {
    amounts[currency] = (amounts[currency] ?? 0) + amountCents;
  }

  private sortedNumericRecord(values: Record<string, number>) {
    return Object.fromEntries(
      Object.entries(values).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    );
  }

  private singleCurrencyAmount(values: Record<string, number>) {
    const amounts = Object.values(values);
    if (amounts.length === 0) {
      return 0;
    }
    if (amounts.length === 1) {
      return amounts[0];
    }
    return null;
  }

  private pushSnapshotFilter(
    filters: Prisma.ActivationOrderWhereInput[],
    field: string,
    value?: string,
  ) {
    const normalized = this.optionalTrim(value);
    if (normalized) {
      filters.push(this.snapshotFilter(field, normalized));
    }
  }

  private snapshotFilter(
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

  private serializeOrderAttributionExportRow(order: {
    id: string;
    status: string;
    createdAt: Date;
    amountCents: number;
    currency: string;
    affiliateAttributionSnapshotJson: Prisma.JsonValue | null;
  }) {
    const affiliateAttribution = this.normalizeAffiliateSnapshot(
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
      approvedCurrency:
        order.status === 'APPROVED' ? order.currency : undefined,
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

  private serializeOrderAttribution(order: {
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
    const affiliateAttribution = this.normalizeAffiliateSnapshot(
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

  private serializeAffiliateCommission(row: {
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
    const affiliateProof = this.normalizeAffiliateCommissionProof(
      row.attributionSnapshotJson,
      row.activationOrder.commissionChainSnapshotJson,
    );
    if (!affiliateProof) {
      return null;
    }

    const chainProof = this.serializeCommissionChainProof(row, affiliateProof);

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

  private serializeAffiliateCommissionExportRow(row: {
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
    const item = this.serializeAffiliateCommission(row);
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

  private normalizeAffiliateCommissionProof(
    value: Prisma.JsonValue | null,
    chainSnapshotValue: Prisma.JsonValue | null,
  ): AffiliateCommissionProof | null {
    if (!this.isRecord(value) || value.source !== 'affiliate_order_snapshot') {
      return null;
    }

    const participantId = this.recordString(value, 'participantId');
    const affiliateLinkId = this.recordString(value, 'affiliateLinkId');
    const clickId = this.recordString(value, 'clickId');
    const clickCreatedAt = this.recordString(value, 'clickCreatedAt');
    const orderSnapshottedAt = this.recordString(value, 'orderSnapshottedAt');
    if (
      !participantId ||
      !affiliateLinkId ||
      !clickId ||
      !clickCreatedAt ||
      !orderSnapshottedAt
    ) {
      return null;
    }

    const explicitStatus = this.recordNullableString(
      value,
      'commissionChainSnapshotStatus',
    );
    const chainSnapshot =
      this.normalizeCommissionChainSnapshot(chainSnapshotValue);

    return {
      source: 'affiliate_order_snapshot',
      participantId,
      agencyId: this.recordNullableString(value, 'agencyId'),
      agencyMemberId: this.recordNullableString(value, 'agencyMemberId'),
      referralCode: this.recordNullableString(value, 'referralCode'),
      affiliateLinkId,
      affiliateQrAssetId: this.recordNullableString(
        value,
        'affiliateQrAssetId',
      ),
      campaign: this.recordNullableString(value, 'campaign'),
      channel: this.recordNullableString(value, 'channel'),
      placement: this.recordNullableString(value, 'placement'),
      packageCode: this.recordNullableString(value, 'packageCode'),
      clickId,
      clickCreatedAt,
      orderSnapshottedAt,
      commissionChainSnapshotStatus:
        explicitStatus === 'legacy_missing' || !chainSnapshot
          ? 'legacy_missing'
          : 'frozen',
    };
  }

  private normalizeCommissionChainSnapshot(
    value: Prisma.JsonValue | null,
  ): CommissionChainSnapshot | null {
    if (!this.isRecord(value) || value.source !== 'affiliate_order_snapshot') {
      return null;
    }

    const policyVersion = this.recordString(value, 'policyVersion');
    const rootParticipantId = this.recordString(value, 'rootParticipantId');
    if (!policyVersion || !rootParticipantId || !Array.isArray(value.items)) {
      return null;
    }

    const items = value.items
      .map((item) => this.normalizeCommissionChainSnapshotItem(item))
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

  private normalizeCommissionChainSnapshotItem(
    value: Prisma.JsonValue,
  ): CommissionChainSnapshotItem | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const depth = this.recordNumber(value, 'depth');
    const participantId = this.recordString(value, 'participantId');
    const beneficiaryType = this.recordString(value, 'beneficiaryType');
    const rateBps = this.recordNumber(value, 'rateBps');
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
      beneficiaryId: this.recordNullableString(value, 'beneficiaryId'),
      rateBps,
      agencyId: this.recordNullableString(value, 'agencyId'),
      agencyMemberId: this.recordNullableString(value, 'agencyMemberId'),
      parentParticipantId: this.recordNullableString(
        value,
        'parentParticipantId',
      ),
    };
  }

  private serializeCommissionChainProof(
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
    const snapshot = this.normalizeCommissionChainSnapshot(
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

  private normalizeAffiliateSnapshot(
    value: Prisma.JsonValue | null,
  ): AffiliateOrderAttributionSnapshot | null {
    if (!this.isRecord(value) || value.source !== 'affiliate_click') {
      return null;
    }

    const clickId = this.recordString(value, 'clickId');
    const affiliateLinkId = this.recordString(value, 'affiliateLinkId');
    const participantId = this.recordString(value, 'participantId');
    const clickCreatedAt = this.recordString(value, 'clickCreatedAt');
    const orderSnapshottedAt = this.recordString(value, 'orderSnapshottedAt');
    const attributionModel = this.recordString(value, 'attributionModel');
    const matchConfidence = this.recordString(value, 'matchConfidence');
    const attributionWindowDays = this.recordNumber(
      value,
      'attributionWindowDays',
    );

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
        this.recordString(value, 'affiliateClickEventId') ?? undefined,
      affiliateLinkId,
      affiliateQrAssetId: this.recordNullableString(
        value,
        'affiliateQrAssetId',
      ),
      participantId,
      agencyId: this.recordNullableString(value, 'agencyId'),
      agencyMemberId: this.recordNullableString(value, 'agencyMemberId'),
      referralCode: this.recordNullableString(value, 'referralCode'),
      campaign: this.recordNullableString(value, 'campaign'),
      channel: this.recordNullableString(value, 'channel'),
      placement: this.recordNullableString(value, 'placement'),
      packageCode: this.recordNullableString(value, 'packageCode'),
      clickCreatedAt,
      orderSnapshottedAt,
      attributionModel,
      matchConfidence,
      attributionWindowDays,
    };
  }

  private async createLinkWithUniqueCode(
    data: Omit<Prisma.AffiliateLinkUncheckedCreateInput, 'id' | 'linkCode'>,
    requestedCode?: string,
  ) {
    if (requestedCode) {
      try {
        return await this.prisma.affiliateLink.create({
          data: { ...data, linkCode: requestedCode },
          include: affiliateLinkInclude,
        });
      } catch (error) {
        if (this.isUniqueConflict(error)) {
          throw new ConflictException('Affiliate link code is already in use');
        }
        throw error;
      }
    }
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await this.prisma.affiliateLink.create({
          data: {
            ...data,
            linkCode: this.generateLinkCode(),
          },
          include: affiliateLinkInclude,
        });
      } catch (error) {
        if (this.isUniqueConflict(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'Could not generate a unique affiliate link code',
    );
  }

  private async createClickEventWithUniqueId(input: {
    link: {
      id: string;
      linkCode: string;
      participantId: string;
      agencyId: string | null;
      agencyMemberId: string | null;
      referralCode: string | null;
    };
    qrAsset: { id: string } | null;
    snapshot: {
      packageCode?: string;
      campaign?: string;
      channel?: string;
      placement?: string;
    };
    dedupeKeyHash?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceHint?: string;
  }) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clickId = this.generateClickId();
      const redirectUrl = this.redirectDestination(input.link.linkCode, {
        ...input.snapshot,
        clickId,
      });

      try {
        await this.prisma.affiliateClickEvent.create({
          data: {
            affiliateLinkId: input.link.id,
            affiliateQrAssetId: input.qrAsset?.id,
            participantId: input.link.participantId,
            agencyId: input.link.agencyId ?? undefined,
            agencyMemberId: input.link.agencyMemberId ?? undefined,
            referralCode: input.link.referralCode ?? undefined,
            clickId,
            dedupeKeyHash: input.dedupeKeyHash,
            ipHash: this.hashSensitive(input.ipAddress),
            userAgentHash: this.hashSensitive(input.userAgent),
            deviceHint: this.sanitizeDeviceHint(input.deviceHint),
            redirectUrl,
            campaign: input.snapshot.campaign,
            channel: input.snapshot.channel,
            placement: input.snapshot.placement,
            packageCode: input.snapshot.packageCode,
            metadataJson: {
              source: 'public_redirect',
              qrRequested: Boolean(input.qrAsset),
              qrAccepted: Boolean(input.qrAsset),
              explicitDedupe: Boolean(input.dedupeKeyHash),
            },
          },
        });

        return {
          redirectUrl,
          eventCreated: true,
          clickId,
          reason: 'active',
        } satisfies PublicRedirectResult;
      } catch (error) {
        if (this.isUniqueConflict(error)) {
          if (input.dedupeKeyHash) {
            const existing = await this.prisma.affiliateClickEvent.findUnique({
              where: { dedupeKeyHash: input.dedupeKeyHash },
              select: { clickId: true },
            });
            if (existing) {
              return {
                redirectUrl: this.redirectDestination(input.link.linkCode, {
                  ...input.snapshot,
                  clickId: existing.clickId,
                }),
                eventCreated: false,
                clickId: existing.clickId,
                reason: 'deduped',
              } satisfies PublicRedirectResult;
            }
          }
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'Could not generate a unique affiliate click id',
    );
  }

  private async findAccessibleLink(linkId: string, user: AuthenticatedUser) {
    const link = await this.prisma.affiliateLink.findUnique({
      where: { id: linkId },
      include: affiliateLinkInclude,
    });
    if (!link) {
      throw new NotFoundException('Affiliate link not found');
    }

    await this.assertParticipantAccess(user, link.participant);
    return link;
  }

  private async resolveTargetParticipant(
    user: AuthenticatedUser,
    requestedParticipantId?: string,
  ) {
    const actor = await this.actorParticipant(user);
    const targetParticipantId =
      this.optionalTrim(requestedParticipantId) ?? actor?.id;
    if (!targetParticipantId) {
      throw new BadRequestException(
        'participantId is required when the actor has no active channel participant',
      );
    }

    const participant = await this.prisma.channelParticipant.findUnique({
      where: { id: targetParticipantId },
      select: {
        id: true,
        type: true,
        code: true,
        userId: true,
        agencyId: true,
        lineage: true,
        depth: true,
        status: true,
      },
    });

    if (!participant || participant.status !== 'ACTIVE') {
      throw new BadRequestException('Target channel participant is not active');
    }

    if (!this.isGlobalManager(user)) {
      if (!actor || !participant.lineage.startsWith(actor.lineage)) {
        throw new ForbiddenException('Insufficient affiliate link permission');
      }
    }

    return participant;
  }

  private async assertParticipantAccess(
    user: AuthenticatedUser,
    participant: ActorParticipant,
  ) {
    if (this.isGlobalManager(user)) {
      return;
    }

    const actor = await this.actorParticipant(user);
    if (!actor || !participant.lineage.startsWith(actor.lineage)) {
      throw new ForbiddenException('Insufficient affiliate link permission');
    }
  }

  private async participantScopeWhere(
    user: AuthenticatedUser,
  ): Promise<Prisma.ChannelParticipantWhereInput | undefined> {
    if (this.isGlobalManager(user)) {
      return undefined;
    }

    const participant = await this.actorParticipant(user);
    if (!participant) {
      return { id: '__none__' };
    }

    return { lineage: { startsWith: participant.lineage } };
  }

  private async actorParticipant(user: AuthenticatedUser) {
    const userId = this.dbUserId(user);
    if (!userId) {
      return null;
    }

    return this.prisma.channelParticipant.findFirst({
      where: { userId, status: 'ACTIVE' },
      select: {
        id: true,
        type: true,
        code: true,
        userId: true,
        agencyId: true,
        lineage: true,
        depth: true,
        status: true,
      },
    });
  }

  private async findParticipantAgencyMember(participant: {
    userId: string | null;
    agencyId: string | null;
  }) {
    if (!participant.userId) {
      return null;
    }

    return this.prisma.agencyMember.findFirst({
      where: {
        userId: participant.userId,
        isActive: true,
        ...(participant.agencyId ? { agencyId: participant.agencyId } : {}),
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        agencyId: true,
        referralCode: true,
      },
    });
  }

  private serializeLink(link: AffiliateLinkWithRelations) {
    return {
      ...link,
      publicUrl: this.buildAffiliateUrl(link),
    };
  }

  private isLinkActiveForRedirect(link: {
    status: AffiliateLinkStatus;
    startsAt: Date | null;
    expiresAt: Date | null;
    participant?: { status: string } | null;
  }) {
    if (link.status !== 'ACTIVE') {
      return false;
    }
    if (link.participant?.status && link.participant.status !== 'ACTIVE') {
      return false;
    }

    const now = Date.now();
    if (link.startsAt && link.startsAt.getTime() > now) {
      return false;
    }
    if (link.expiresAt && link.expiresAt.getTime() <= now) {
      return false;
    }
    return true;
  }

  private async resolveQrAssetForRedirect(
    affiliateLinkId: string,
    qrAssetId?: string,
  ) {
    const normalizedQrAssetId = this.optionalTrim(qrAssetId);
    if (!normalizedQrAssetId) {
      return null;
    }

    return this.prisma.affiliateQrAsset.findFirst({
      where: {
        id: normalizedQrAssetId,
        affiliateLinkId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        placement: true,
      },
    });
  }

  private redirectSnapshot(
    link: {
      packageCode: string | null;
      campaign: string | null;
      channel: string | null;
      placement: string | null;
    },
    qrAsset: { placement: string | null } | null,
    query?: Record<string, unknown>,
  ) {
    return {
      packageCode:
        this.optionalTrim(link.packageCode) ?? this.queryString(query, 'pkg'),
      campaign:
        this.optionalTrim(link.campaign) ?? this.queryString(query, 'campaign'),
      channel:
        this.optionalTrim(link.channel) ?? this.queryString(query, 'channel'),
      placement:
        this.optionalTrim(qrAsset?.placement) ??
        this.optionalTrim(link.placement) ??
        this.queryString(query, 'placement'),
    };
  }

  private redirectDestination(
    linkCode: string,
    snapshot: {
      packageCode?: string;
      campaign?: string;
      channel?: string;
      placement?: string;
      clickId?: string;
    },
  ) {
    const url = new URL(this.redirectBaseUrl());
    this.setParam(url.searchParams, 'ref', linkCode);
    this.setParam(url.searchParams, 'pkg', snapshot.packageCode);
    this.setParam(url.searchParams, 'campaign', snapshot.campaign);
    this.setParam(url.searchParams, 'channel', snapshot.channel);
    this.setParam(url.searchParams, 'placement', snapshot.placement);
    this.setParam(url.searchParams, 'clickId', snapshot.clickId);
    return url.toString();
  }

  private fallbackRedirectUrl(reason: 'missing' | 'inactive') {
    const url = new URL(this.redirectBaseUrl());
    url.searchParams.set('affiliate', reason);
    return url.toString();
  }

  private buildAffiliateUrl(
    link: {
      linkCode: string;
      packageCode?: string | null;
      campaign?: string | null;
      channel?: string | null;
      placement?: string | null;
    },
    options: { qrAssetId?: string; placement?: string | null } = {},
  ) {
    const url = new URL(
      `/r/${encodeURIComponent(link.linkCode)}`,
      this.baseUrl(),
    );
    const params = url.searchParams;
    this.setParam(params, 'pkg', link.packageCode);
    this.setParam(params, 'campaign', link.campaign);
    this.setParam(params, 'channel', link.channel);
    this.setParam(params, 'placement', options.placement ?? link.placement);
    this.setParam(params, 'qr', options.qrAssetId);
    return url.toString();
  }

  private baseUrl() {
    const raw =
      this.config.get<string>('AFFILIATE_PUBLIC_BASE_URL') ??
      process.env.AFFILIATE_PUBLIC_BASE_URL ??
      'https://go.minhhuong.app';
    const candidate = raw.trim().replace(/\/+$/, '');
    try {
      const url = new URL(candidate);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'https://go.minhhuong.app';
      }
      return url.toString().replace(/\/+$/, '');
    } catch {
      return 'https://go.minhhuong.app';
    }
  }

  private redirectBaseUrl() {
    const raw =
      this.config.get<string>('AFFILIATE_REDIRECT_BASE_URL') ??
      process.env.AFFILIATE_REDIRECT_BASE_URL ??
      this.config.get<string>('WEB_PUBLIC_URL') ??
      process.env.WEB_PUBLIC_URL ??
      this.config.get<string>('APP_URL') ??
      process.env.APP_URL ??
      'https://minhhuong.app';
    return this.safeHttpUrl(raw, 'https://minhhuong.app', {
      rejectAffiliatePath: true,
    });
  }

  private safeHttpUrl(
    raw: string,
    fallback: string,
    options: { rejectAffiliatePath?: boolean } = {},
  ) {
    const candidate = raw.trim();
    try {
      const url = new URL(candidate);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return fallback;
      }
      if (options.rejectAffiliatePath && url.pathname.startsWith('/r')) {
        return fallback;
      }
      return url.toString();
    } catch {
      return fallback;
    }
  }

  private setParam(
    params: URLSearchParams,
    key: string,
    value?: string | null,
  ) {
    const normalized = this.optionalTrim(value);
    if (normalized) {
      params.set(key, normalized);
    }
  }

  private listLimit(value?: number) {
    if (!value || value < 1) {
      return 50;
    }
    return Math.min(value, 100);
  }

  private pageNumber(value?: number) {
    if (value === undefined || value === null) {
      return 1;
    }
    if (!Number.isInteger(value) || value < 1 || value > 10000) {
      throw new BadRequestException('page must be between 1 and 10000');
    }
    return value;
  }

  private pageSize(value?: number, max = 100) {
    if (value === undefined || value === null) {
      return 50;
    }
    if (!Number.isInteger(value) || value < 1 || value > max) {
      throw new BadRequestException(`pageSize must be between 1 and ${max}`);
    }
    return value;
  }

  private exportLimit(value?: number) {
    if (value === undefined || value === null) {
      return 500;
    }
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      throw new BadRequestException('limit must be between 1 and 1000');
    }
    return value;
  }

  private toCsv(
    headers: readonly string[],
    rows: Array<Record<string, CsvValue>>,
  ) {
    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => this.csvCell(row[header])).join(','),
      ),
    ];
    return `${lines.join('\r\n')}\r\n`;
  }

  private csvCell(value: CsvValue) {
    const raw = value === undefined || value === null ? '' : String(value);
    if (/[",\r\n]/.test(raw)) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  }

  private stableJson(value: Record<string, number>) {
    return JSON.stringify(this.sortedNumericRecord(value));
  }

  private parseDate(value: string | undefined, field: string) {
    const normalized = this.optionalTrim(value);
    if (!normalized) {
      return undefined;
    }

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid ISO date`);
    }
    return date;
  }

  private assertDateRange(startsAt?: Date | null, expiresAt?: Date | null) {
    if (startsAt && expiresAt && expiresAt.getTime() <= startsAt.getTime()) {
      throw new BadRequestException('expiresAt must be after startsAt');
    }
  }

  private requiredTrim(value: string | undefined, field: string) {
    const normalized = this.optionalTrim(value);
    if (!normalized || normalized.length < 2) {
      throw new BadRequestException(`${field} is required`);
    }
    return normalized;
  }

  private optionalTrim(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  private isRecord(value: unknown): value is Record<string, Prisma.JsonValue> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private recordString(value: Record<string, Prisma.JsonValue>, key: string) {
    const entry = value[key];
    return typeof entry === 'string' && entry.trim() ? entry : null;
  }

  private recordNullableString(
    value: Record<string, Prisma.JsonValue>,
    key: string,
  ) {
    const entry = value[key];
    if (entry === null || entry === undefined) {
      return null;
    }
    return typeof entry === 'string' ? entry : null;
  }

  private recordNumber(value: Record<string, Prisma.JsonValue>, key: string) {
    const entry = value[key];
    return typeof entry === 'number' && Number.isFinite(entry) ? entry : null;
  }

  private queryString(query: Record<string, unknown> | undefined, key: string) {
    const value = query?.[key];
    if (Array.isArray(value)) {
      return typeof value[0] === 'string'
        ? this.optionalTrim(value[0])
        : undefined;
    }
    return typeof value === 'string' ? this.optionalTrim(value) : undefined;
  }

  private jsonObject(value: unknown, field: string) {
    if (value === undefined) {
      return undefined;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException(`${field} must be an object`);
    }
    return value as Prisma.InputJsonValue;
  }

  private generateLinkCode() {
    return `mh_${randomBytes(8).toString('hex')}`;
  }

  private generateClickId() {
    return `clk_${randomBytes(12).toString('hex')}`;
  }

  private dedupeHash(linkId: string, dedupeKey?: string) {
    const normalized = this.optionalTrim(dedupeKey);
    return normalized ? this.hmacHex(`${linkId}:${normalized}`) : undefined;
  }

  private hashSensitive(value?: string) {
    const normalized = this.optionalTrim(value);
    return normalized ? this.hmacHex(normalized) : undefined;
  }

  private hmacHex(value: string) {
    return createHmac('sha256', this.hashSecret()).update(value).digest('hex');
  }

  private hashSecret() {
    return (
      this.config.get<string>('AFFILIATE_HASH_SECRET') ??
      process.env.AFFILIATE_HASH_SECRET ??
      this.config.get<string>('JWT_SECRET') ??
      process.env.JWT_SECRET ??
      'dev-only-affiliate-hash-secret'
    );
  }

  private sanitizeDeviceHint(value?: string) {
    const normalized = this.optionalTrim(value);
    if (!normalized) {
      return undefined;
    }
    return normalized.replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 80);
  }

  private isGlobalManager(user: AuthenticatedUser) {
    return user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role));
  }

  private dbUserId(user: AuthenticatedUser) {
    return user.sub.startsWith('demo-') ? undefined : user.sub;
  }

  private requiredDbUserId(user: AuthenticatedUser) {
    const userId = this.dbUserId(user);
    if (!userId) {
      throw new BadRequestException('A persisted user is required');
    }
    return userId;
  }

  private isUniqueConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private async audit(
    user: AuthenticatedUser,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          userId: this.dbUserId(user),
          action,
          entityType,
          entityId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }
}
