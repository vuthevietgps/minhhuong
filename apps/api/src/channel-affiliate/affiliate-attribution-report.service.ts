import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  AffiliateOrderAttributionAggregateQueryDto,
  AffiliateOrderAttributionFiltersDto,
  ExportAffiliateOrderAttributionsQueryDto,
  ListAffiliateOrderAttributionsQueryDto,
} from './dto/channel-affiliate.dto';
import { AffiliateAccessService } from './affiliate-access.service';
import {
  AffiliateOrderAttributionAggregateBucket,
  affiliateOrderAttributionAggregateExportHeaders,
  affiliateOrderAttributionExportHeaders,
  aggregateSnapshotField,
  aggregateSortBy,
  aggregateSortDirection,
  compareAggregateItems,
  normalizeAffiliateSnapshot,
  pushSnapshotFilter,
  serializeAffiliateOrderAttributionFilters,
  serializeAggregateBucket,
  serializeOrderAttribution,
  serializeOrderAttributionExportRow,
  snapshotFilter,
} from './affiliate-attribution-report.helpers';
import { AffiliateReportAccessAuditService } from './affiliate-report-access-audit.service';
import {
  aggregateLimit,
  exportLimit,
  incrementCount,
  incrementCurrencyAmount,
  parseDate,
  singleCurrencyAmount,
  sortedNumericRecord,
  stableJson,
  toCsv,
  validatedPageNumber,
  validatedPageSize,
} from './channel-affiliate.helpers';

/** Order attribution listings, aggregates and CSV exports. */
@Injectable()
export class AffiliateAttributionReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly affiliateReportAccessAuditService: AffiliateReportAccessAuditService,
    private readonly affiliateAccessService: AffiliateAccessService,
  ) {}

  async listOrderAttributions(
    user: AuthenticatedUser,
    query: ListAffiliateOrderAttributionsQueryDto = {},
  ) {
    const where = await this.affiliateOrderAttributionWhere(user, query);
    const page = validatedPageNumber(query.page);
    const pageSize = validatedPageSize(query.pageSize);
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
      .map((order) => serializeOrderAttribution(order))
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

    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/order-attributions',
        reportType: 'ORDER_ATTRIBUTION_LIST',
        format: 'JSON',
        query,
        rowCount: items.length,
      },
    );

    return result;
  }

  async exportOrderAttributionsCsv(
    user: AuthenticatedUser,
    query: ExportAffiliateOrderAttributionsQueryDto = {},
  ) {
    const where = await this.affiliateOrderAttributionWhere(user, query);
    const orders = await this.prisma.activationOrder.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: exportLimit(query.limit),
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
      .map((order) => serializeOrderAttributionExportRow(order))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/order-attributions/export.csv',
        reportType: 'ORDER_ATTRIBUTION_LIST',
        format: 'CSV',
        query,
        rowCount: rows.length,
      },
    );

    return toCsv(affiliateOrderAttributionExportHeaders, rows);
  }

  async listOrderAttributionAggregates(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    const result = await this.buildOrderAttributionAggregates(user, query);
    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/order-attributions/aggregates',
        reportType: 'ORDER_ATTRIBUTION_AGGREGATE',
        format: 'JSON',
        query,
        rowCount: result.items.length,
      },
    );
    return result;
  }

  private async buildOrderAttributionAggregates(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    const snapshotField = aggregateSnapshotField(query.groupBy);
    const limit = aggregateLimit(query.limit);
    const sortBy = aggregateSortBy(query.sortBy);
    const sortDirection = aggregateSortDirection(query.sortDirection);
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
      const snapshot = normalizeAffiliateSnapshot(
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
      incrementCount(summaryCountByStatus, order.status);
      incrementCount(bucket.countByStatus, order.status);
      if (order.createdAt.getTime() < bucket.firstOrderCreatedAt.getTime()) {
        bucket.firstOrderCreatedAt = order.createdAt;
      }
      if (order.createdAt.getTime() > bucket.lastOrderCreatedAt.getTime()) {
        bucket.lastOrderCreatedAt = order.createdAt;
      }

      if (order.status === 'APPROVED') {
        approvedOrders += 1;
        bucket.approvedOrders += 1;
        incrementCurrencyAmount(
          summaryApprovedAmountCentsByCurrency,
          order.currency,
          order.amountCents,
        );
        incrementCurrencyAmount(
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
        serializeAggregateBucket(query.groupBy, snapshotField, bucket),
      )
      .sort((left, right) =>
        compareAggregateItems(left, right, sortBy, sortDirection),
      );

    return {
      items: items.slice(0, limit),
      groupBy: query.groupBy,
      snapshotField,
      filters: serializeAffiliateOrderAttributionFilters(query),
      limit,
      sortBy,
      sortDirection,
      totalGroups: items.length,
      summary: {
        totalAttributedOrders,
        approvedOrders,
        countByStatus: sortedNumericRecord(summaryCountByStatus),
        approvedAmountCentsByCurrency: sortedNumericRecord(
          summaryApprovedAmountCentsByCurrency,
        ),
        approvedAmountCents: singleCurrencyAmount(
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
      countByStatus: stableJson(item.countByStatus),
      approvedAmountCentsByCurrency: stableJson(
        item.approvedAmountCentsByCurrency,
      ),
      approvedAmountCents:
        item.approvedAmountCents === null ? 'null' : item.approvedAmountCents,
      firstOrderCreatedAt: item.firstOrderCreatedAt,
      lastOrderCreatedAt: item.lastOrderCreatedAt,
    }));

    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/order-attributions/aggregates/export.csv',
        reportType: 'ORDER_ATTRIBUTION_AGGREGATE',
        format: 'CSV',
        query,
        rowCount: rows.length,
      },
    );

    return toCsv(affiliateOrderAttributionAggregateExportHeaders, rows);
  }

  private async affiliateOrderAttributionWhere(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionFiltersDto,
  ): Promise<Prisma.ActivationOrderWhereInput> {
    const filters: Prisma.ActivationOrderWhereInput[] = [
      snapshotFilter('source', 'affiliate_click'),
    ];

    const participantScope =
      await this.affiliateAccessService.participantScopeWhere(user);
    if (participantScope) {
      filters.push({ channelParticipant: { is: participantScope } });
    }

    pushSnapshotFilter(filters, 'participantId', query.participantId);
    pushSnapshotFilter(filters, 'agencyId', query.agencyId);
    pushSnapshotFilter(filters, 'agencyMemberId', query.agencyMemberId);
    pushSnapshotFilter(filters, 'affiliateLinkId', query.affiliateLinkId);
    pushSnapshotFilter(filters, 'affiliateQrAssetId', query.affiliateQrAssetId);
    pushSnapshotFilter(filters, 'clickId', query.clickId);
    pushSnapshotFilter(filters, 'campaign', query.campaign);
    pushSnapshotFilter(filters, 'channel', query.channel);
    pushSnapshotFilter(filters, 'placement', query.placement);
    pushSnapshotFilter(filters, 'packageCode', query.packageCode);

    if (query.orderStatus) {
      filters.push({ status: query.orderStatus });
    }

    const createdFrom = parseDate(query.createdFrom, 'createdFrom');
    const createdTo = parseDate(query.createdTo, 'createdTo');
    if (createdFrom || createdTo) {
      filters.push({
        createdAt: {
          ...(createdFrom ? { gte: createdFrom } : {}),
          ...(createdTo ? { lte: createdTo } : {}),
        },
      });
    }

    const clickFrom = parseDate(query.clickFrom, 'clickFrom');
    const clickTo = parseDate(query.clickTo, 'clickTo');
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
}
