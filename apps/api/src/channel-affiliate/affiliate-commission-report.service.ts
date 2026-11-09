import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  AffiliateCommissionAggregateQueryDto,
  ExportAffiliateCommissionsQueryDto,
  ListAffiliateCommissionsQueryDto,
} from './dto/channel-affiliate.dto';
import { AffiliateAccessService } from './affiliate-access.service';
import {
  AffiliateCommissionAggregateBucket,
  addCommissionAggregateRow,
  affiliateCommissionAggregateExportHeaders,
  affiliateCommissionExportHeaders,
  affiliateCommissionOrderBy,
  commissionAggregateField,
  commissionAggregateKey,
  commissionAggregateSortBy,
  commissionAggregateSortDirection,
  commissionProofFilter,
  compareCommissionAggregateItems,
  emptyCommissionAggregateBucket,
  normalizeAffiliateCommissionProof,
  pushCommissionProofFilter,
  serializeAffiliateCommission,
  serializeAffiliateCommissionExportRow,
  serializeAffiliateCommissionFilters,
  serializeCommissionAggregateBucket,
  serializeCommissionAggregateSummary,
} from './affiliate-commission-report.helpers';
import { AffiliateReportAccessAuditService } from './affiliate-report-access-audit.service';
import {
  aggregateLimit,
  exportLimit,
  optionalTrim,
  parseDate,
  stableJson,
  toCsv,
  validatedPageNumber,
  validatedPageSize,
} from './channel-affiliate.helpers';

/** Affiliate commission listings, aggregates and CSV exports. */
@Injectable()
export class AffiliateCommissionReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly affiliateReportAccessAuditService: AffiliateReportAccessAuditService,
    private readonly affiliateAccessService: AffiliateAccessService,
  ) {}

  async listCommissions(
    user: AuthenticatedUser,
    query: ListAffiliateCommissionsQueryDto = {},
  ) {
    const where = await this.affiliateCommissionWhere(user, query);
    const page = validatedPageNumber(query.page);
    const pageSize = validatedPageSize(query.pageSize, 200);
    const skip = (page - 1) * pageSize;
    const orderBy = affiliateCommissionOrderBy(
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
      .map((row) => serializeAffiliateCommission(row))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const result = {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: skip + rows.length < total,
    };

    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/commissions',
        reportType: 'AFFILIATE_COMMISSION_LIST',
        format: 'JSON',
        query,
        rowCount: items.length,
      },
    );

    return result;
  }

  async exportCommissionsCsv(
    user: AuthenticatedUser,
    query: ExportAffiliateCommissionsQueryDto = {},
  ) {
    const where = await this.affiliateCommissionWhere(user, query);
    const orderBy = affiliateCommissionOrderBy(
      query.sortBy,
      query.sortDirection,
    );
    const rows = await this.prisma.commissionEarning.findMany({
      where,
      orderBy,
      take: exportLimit(query.limit),
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
      .map((row) => serializeAffiliateCommissionExportRow(row))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/commissions/export.csv',
        reportType: 'AFFILIATE_COMMISSION_LIST',
        format: 'CSV',
        query,
        rowCount: exportRows.length,
      },
    );

    return toCsv(affiliateCommissionExportHeaders, exportRows);
  }

  async listCommissionAggregates(
    user: AuthenticatedUser,
    query: AffiliateCommissionAggregateQueryDto,
  ) {
    const result = await this.buildCommissionAggregates(user, query);
    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/commissions/aggregates',
        reportType: 'AFFILIATE_COMMISSION_AGGREGATE',
        format: 'JSON',
        query,
        rowCount: result.items.length,
      },
    );
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
      countByStatus: stableJson(item.countByStatus),
      totalAmountCentsByCurrency: stableJson(item.totalAmountCentsByCurrency),
      pendingAmountCentsByCurrency: stableJson(
        item.pendingAmountCentsByCurrency,
      ),
      releasedAmountCentsByCurrency: stableJson(
        item.releasedAmountCentsByCurrency,
      ),
      availableAmountCentsByCurrency: stableJson(
        item.availableAmountCentsByCurrency,
      ),
      totalAmountCents:
        item.totalAmountCents === null ? 'null' : item.totalAmountCents,
      firstCommissionCreatedAt: item.firstCommissionCreatedAt,
      lastCommissionCreatedAt: item.lastCommissionCreatedAt,
    }));

    await this.affiliateReportAccessAuditService.auditAffiliateReportAccess(
      user,
      {
        route: '/v1/channel-affiliate/commissions/aggregates/export.csv',
        reportType: 'AFFILIATE_COMMISSION_AGGREGATE',
        format: 'CSV',
        query,
        rowCount: rows.length,
      },
    );

    return toCsv(affiliateCommissionAggregateExportHeaders, rows);
  }

  private async buildCommissionAggregates(
    user: AuthenticatedUser,
    query: AffiliateCommissionAggregateQueryDto,
  ) {
    const sourceField = commissionAggregateField(query.groupBy);
    const limit = aggregateLimit(query.limit);
    const sortBy = commissionAggregateSortBy(query.sortBy);
    const sortDirection = commissionAggregateSortDirection(query.sortDirection);
    if (sortBy === 'totalAmountCents' && !optionalTrim(query.currency)) {
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
    const summary = emptyCommissionAggregateBucket(null, new Date(0));

    for (const row of rows) {
      const proof = normalizeAffiliateCommissionProof(
        row.attributionSnapshotJson,
        row.activationOrder.commissionChainSnapshotJson,
      );
      if (!proof) {
        continue;
      }

      const key = commissionAggregateKey(query.groupBy, row, proof);
      const bucketKey = JSON.stringify(key);
      let bucket = buckets.get(bucketKey);
      if (!bucket) {
        bucket = emptyCommissionAggregateBucket(key, row.createdAt);
        buckets.set(bucketKey, bucket);
      }

      addCommissionAggregateRow(summary, row);
      addCommissionAggregateRow(bucket, row);
    }

    const items = [...buckets.values()]
      .map((bucket) =>
        serializeCommissionAggregateBucket(query.groupBy, sourceField, bucket),
      )
      .sort((left, right) =>
        compareCommissionAggregateItems(left, right, sortBy, sortDirection),
      );

    return {
      items: items.slice(0, limit),
      groupBy: query.groupBy,
      sourceField,
      filters: serializeAffiliateCommissionFilters(query),
      limit,
      sortBy,
      sortDirection,
      totalGroups: items.length,
      summary: serializeCommissionAggregateSummary(summary),
    };
  }

  private async affiliateCommissionWhere(
    user: AuthenticatedUser,
    query:
      | ListAffiliateCommissionsQueryDto
      | ExportAffiliateCommissionsQueryDto
      | AffiliateCommissionAggregateQueryDto,
  ): Promise<Prisma.CommissionEarningWhereInput> {
    const filters: Prisma.CommissionEarningWhereInput[] = [
      commissionProofFilter('source', 'affiliate_order_snapshot'),
    ];

    const participantScope =
      await this.affiliateAccessService.participantScopeWhere(user);
    if (participantScope) {
      filters.push({ participant: { is: participantScope } });
    }

    if (query.commissionStatus) {
      filters.push({ status: query.commissionStatus });
    }

    const participantId = optionalTrim(query.participantId);
    if (participantId) {
      filters.push({ participantId });
    }

    if (query.beneficiaryType) {
      filters.push({ beneficiaryType: query.beneficiaryType });
    }

    const beneficiaryId = optionalTrim(query.beneficiaryId);
    if (beneficiaryId) {
      filters.push({
        OR: [
          { beneficiaryUserId: beneficiaryId },
          { beneficiaryAgencyId: beneficiaryId },
        ],
      });
    }

    const activationOrderId = optionalTrim(query.activationOrderId);
    if (activationOrderId) {
      filters.push({ activationOrderId });
    }

    pushCommissionProofFilter(
      filters,
      'affiliateLinkId',
      query.affiliateLinkId,
    );
    pushCommissionProofFilter(
      filters,
      'affiliateQrAssetId',
      query.affiliateQrAssetId,
    );
    pushCommissionProofFilter(filters, 'agencyId', query.agencyId);
    pushCommissionProofFilter(filters, 'agencyMemberId', query.agencyMemberId);
    pushCommissionProofFilter(filters, 'clickId', query.clickId);
    pushCommissionProofFilter(filters, 'campaign', query.campaign);
    pushCommissionProofFilter(filters, 'channel', query.channel);
    pushCommissionProofFilter(filters, 'placement', query.placement);
    pushCommissionProofFilter(filters, 'packageCode', query.packageCode);

    const chainStatus = optionalTrim(query.commissionChainSnapshotStatus);
    if (chainStatus) {
      if (chainStatus === 'legacy_missing') {
        filters.push(
          commissionProofFilter(
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

    const currency = optionalTrim(query.currency);
    if (currency) {
      filters.push({ currency });
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

    const availableFrom = parseDate(query.availableFrom, 'availableFrom');
    const availableTo = parseDate(query.availableTo, 'availableTo');
    if (availableFrom || availableTo) {
      filters.push({
        availableAt: {
          ...(availableFrom ? { gte: availableFrom } : {}),
          ...(availableTo ? { lte: availableTo } : {}),
        },
      });
    }

    const approvedFrom = parseDate(query.approvedFrom, 'approvedFrom');
    const approvedTo = parseDate(query.approvedTo, 'approvedTo');
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
}
