import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ListAffiliateReportAccessAuditsQueryDto } from './dto/channel-affiliate.dto';
import {
  AffiliateReportAccessAuditMetadata,
  AffiliateReportFormat,
  AffiliateReportType,
  affiliateReportAccessAuditAction,
  affiliateReportAccessAuditEntityType,
  assertReportAccessAuditReader,
  reportAccessAuditFormat,
  reportAccessAuditReportType,
  safeAffiliateReportFilterSummary,
  serializeReportAccessAudit,
  sortedStrings,
} from './affiliate-report-access-audit.helpers';
import {
  dbUserId,
  isGlobalManager,
  optionalTrim,
  parseDate,
  validatedPageNumber,
  validatedPageSize,
} from './channel-affiliate.helpers';

/** Records and lists access to affiliate reports. */
@Injectable()
export class AffiliateReportAccessAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async listReportAccessAudits(
    user: AuthenticatedUser,
    query: ListAffiliateReportAccessAuditsQueryDto = {},
  ) {
    assertReportAccessAuditReader(user);
    const page = validatedPageNumber(query.page);
    const pageSize = validatedPageSize(query.pageSize);
    const skip = (page - 1) * pageSize;

    const filters: Prisma.AuditLogWhereInput[] = [
      {
        action: affiliateReportAccessAuditAction,
        entityType: affiliateReportAccessAuditEntityType,
      },
    ];

    const reportType = reportAccessAuditReportType(query.reportType);
    if (reportType) {
      filters.push({
        metadata: { path: ['reportType'], equals: reportType },
      });
    }

    const format = reportAccessAuditFormat(query.format);
    if (format) {
      filters.push({
        metadata: { path: ['format'], equals: format },
      });
    }

    const actorUserId = optionalTrim(query.actorUserId);
    if (actorUserId) {
      filters.push({ userId: actorUserId });
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
      items: rows.map((row) => serializeReportAccessAudit(row)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: skip + rows.length < total,
    };
  }

  async auditAffiliateReportAccess(
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
      actorRoles: sortedStrings(user.roles),
      route: input.route,
      reportType: input.reportType,
      format: input.format,
      safeFilterSummary: safeAffiliateReportFilterSummary(input.query),
      rowCount: input.rowCount,
      scopeSummary: {
        roles: sortedStrings(user.roles),
        isGlobalManager: isGlobalManager(user),
      },
    };

    await this.prisma.auditLog.create({
      data: {
        userId: dbUserId(user),
        action: affiliateReportAccessAuditAction,
        entityType: affiliateReportAccessAuditEntityType,
        entityId: `${input.reportType}:${input.format}`,
        metadata: metadata,
      },
    });
  }
}
