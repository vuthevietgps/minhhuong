import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelReportQueryDto } from './dto/channel-report-query.dto';
import {
  amountOf,
  countOf,
  resolveReportPeriod,
  rowsBySource,
  rowsByStatus,
} from './channel-finance-report.helpers';
import { ChannelFinanceScopeService } from './channel-finance-scope.service';
import { dbUserId } from './channel-finance.helpers';

/** Finance overview, channel report, sale personal report and order CSV. */
@Injectable()
export class ChannelFinanceReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelFinanceScopeService: ChannelFinanceScopeService,
  ) {}

  async getOverview(user: AuthenticatedUser) {
    const scope = await this.channelFinanceScopeService.scopeFor(user);
    const [orders, approvedOrders, pendingPayouts, paidPayouts, wallet] =
      await Promise.all([
        this.prisma.activationOrder.count({ where: scope.orderWhere }),
        this.prisma.activationOrder.aggregate({
          where: { ...scope.orderWhere, status: 'APPROVED' },
          _sum: { amountCents: true },
          _count: true,
        }),
        this.prisma.payoutRequest.aggregate({
          where: {
            ...scope.payoutWhere,
            status: { in: ['PENDING_REVIEW', 'APPROVED'] },
          },
          _sum: { amountCents: true },
          _count: true,
        }),
        this.prisma.payoutRequest.aggregate({
          where: { ...scope.payoutWhere, status: 'PAID' },
          _sum: { amountCents: true },
          _count: true,
        }),
        this.channelFinanceScopeService.getWalletSummary(user),
      ]);

    return {
      orders,
      approvedRevenueCents: amountOf(approvedOrders),
      approvedOrderCount: countOf(approvedOrders),
      pendingPayoutCents: amountOf(pendingPayouts),
      pendingPayoutCount: countOf(pendingPayouts),
      paidPayoutCents: amountOf(paidPayouts),
      paidPayoutCount: countOf(paidPayouts),
      wallet,
    };
  }

  async getReport(query: ChannelReportQueryDto, user: AuthenticatedUser) {
    const period = resolveReportPeriod(query);
    const scope = await this.channelFinanceScopeService.scopeFor(user);
    const createdRange = { gte: period.from, lt: period.toExclusive };
    const approvedRange = { gte: period.from, lt: period.toExclusive };
    const scopedOrderWhere = scope.orderWhere;
    const commissionScope = scope.earningWhere;

    const [
      orderStatusRows,
      orderSourceRows,
      approvedAggregate,
      approvedSourceRows,
      commissionRows,
      payoutStatusRows,
      paidPayoutAggregate,
      saleOrderRows,
      agencyOrderRows,
      saleCommissionRows,
      agencyCommissionRows,
      recentApprovedOrders,
      recentPayouts,
    ] = await Promise.all([
      this.prisma.activationOrder.groupBy({
        by: ['status'],
        where: { ...scopedOrderWhere, createdAt: createdRange },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.groupBy({
        by: ['source'],
        where: { ...scopedOrderWhere, createdAt: createdRange },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.aggregate({
        where: {
          ...scopedOrderWhere,
          status: 'APPROVED',
          activatedAt: approvedRange,
        },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.groupBy({
        by: ['source'],
        where: {
          ...scopedOrderWhere,
          status: 'APPROVED',
          activatedAt: approvedRange,
        },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.commissionEarning.groupBy({
        by: ['beneficiaryType'],
        where: { ...commissionScope, createdAt: createdRange },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.payoutRequest.groupBy({
        by: ['status'],
        where: { ...scope.payoutWhere, createdAt: createdRange },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.payoutRequest.aggregate({
        where: {
          ...scope.payoutWhere,
          status: 'PAID',
          paidAt: approvedRange,
        },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.groupBy({
        by: ['channelParticipantId'],
        where: {
          ...scopedOrderWhere,
          status: 'APPROVED',
          activatedAt: approvedRange,
          channelParticipantId: { not: null },
          channelParticipant: {
            is: { type: { in: ['DIRECTOR', 'MANAGER', 'SALE'] } },
          },
        },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.groupBy({
        by: ['channelParticipantId'],
        where: {
          ...scopedOrderWhere,
          status: 'APPROVED',
          activatedAt: approvedRange,
          channelParticipantId: { not: null },
          channelParticipant: { is: { type: 'AGENCY' } },
        },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.commissionEarning.groupBy({
        by: ['participantId'],
        where: {
          beneficiaryType: 'SALE',
          participantId: { not: null },
          participant: {
            is: { type: { in: ['DIRECTOR', 'MANAGER', 'SALE'] } },
          },
          ...commissionScope,
          createdAt: createdRange,
          status: { in: ['AVAILABLE', 'PENDING'] },
        },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.commissionEarning.groupBy({
        by: ['participantId'],
        where: {
          beneficiaryType: 'AGENCY',
          participantId: { not: null },
          participant: { is: { type: 'AGENCY' } },
          ...commissionScope,
          createdAt: createdRange,
          status: { in: ['AVAILABLE', 'PENDING'] },
        },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.findMany({
        where: {
          ...scopedOrderWhere,
          status: 'APPROVED',
          activatedAt: approvedRange,
        },
        orderBy: { activatedAt: 'desc' },
        take: 12,
        select: {
          id: true,
          customerEmail: true,
          amountCents: true,
          currency: true,
          source: true,
          activatedAt: true,
          expiresAt: true,
          createdBy: {
            select: {
              email: true,
              profile: { select: { displayName: true } },
            },
          },
          agency: {
            select: {
              code: true,
              name: true,
            },
          },
          channelParticipant: {
            select: {
              id: true,
              type: true,
              code: true,
              displayName: true,
            },
          },
        },
      }),
      this.prisma.payoutRequest.findMany({
        where: { ...scope.payoutWhere, createdAt: createdRange },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          status: true,
          amountCents: true,
          currency: true,
          createdAt: true,
          paidAt: true,
          beneficiaryUser: {
            select: {
              email: true,
              profile: { select: { displayName: true } },
            },
          },
          beneficiaryAgency: {
            select: {
              code: true,
              name: true,
            },
          },
          participant: {
            select: {
              id: true,
              type: true,
              code: true,
              displayName: true,
            },
          },
        },
      }),
    ]);

    const participantIds = [
      ...saleOrderRows.map((row) => row.channelParticipantId).filter(Boolean),
      ...agencyOrderRows.map((row) => row.channelParticipantId).filter(Boolean),
      ...saleCommissionRows.map((row) => row.participantId).filter(Boolean),
      ...agencyCommissionRows.map((row) => row.participantId).filter(Boolean),
    ] as string[];
    const participants = participantIds.length
      ? await this.prisma.channelParticipant.findMany({
          where: { id: { in: [...new Set(participantIds)] } },
          select: {
            id: true,
            type: true,
            code: true,
            displayName: true,
            user: {
              select: {
                email: true,
                profile: { select: { displayName: true } },
              },
            },
            agency: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        })
      : [];

    const participantMap = new Map(
      participants.map((participant) => [participant.id, participant]),
    );

    return {
      period: {
        from: period.from.toISOString(),
        to: period.to.toISOString(),
      },
      orderPipeline: {
        totalCount: orderStatusRows.reduce((sum, row) => sum + countOf(row), 0),
        totalAmountCents: orderStatusRows.reduce(
          (sum, row) => sum + amountOf(row),
          0,
        ),
        byStatus: rowsByStatus(orderStatusRows),
        bySource: rowsBySource(orderSourceRows),
      },
      approvedRevenue: {
        orderCount: countOf(approvedAggregate),
        amountCents: amountOf(approvedAggregate),
        bySource: rowsBySource(approvedSourceRows),
      },
      commissions: {
        totalCount: commissionRows.reduce((sum, row) => sum + countOf(row), 0),
        totalAmountCents: commissionRows.reduce(
          (sum, row) => sum + amountOf(row),
          0,
        ),
        saleAmountCents:
          amountOf(
            commissionRows.find((row) => row.beneficiaryType === 'SALE'),
          ) ?? 0,
        agencyAmountCents:
          amountOf(
            commissionRows.find((row) => row.beneficiaryType === 'AGENCY'),
          ) ?? 0,
      },
      payouts: {
        requestCount: payoutStatusRows.reduce(
          (sum, row) => sum + countOf(row),
          0,
        ),
        requestedAmountCents: payoutStatusRows.reduce(
          (sum, row) => sum + amountOf(row),
          0,
        ),
        paidCount: countOf(paidPayoutAggregate),
        paidAmountCents: amountOf(paidPayoutAggregate),
        byStatus: rowsByStatus(payoutStatusRows),
      },
      topSales: saleOrderRows
        .map((row) => {
          const participant = participantMap.get(
            row.channelParticipantId ?? '',
          );
          const commission = saleCommissionRows.find(
            (item) => item.participantId === row.channelParticipantId,
          );

          return {
            participantId: row.channelParticipantId,
            userId: participant?.user ? row.channelParticipantId : undefined,
            email:
              participant?.user?.email ?? participant?.code ?? 'Unknown sale',
            displayName:
              participant?.user?.profile?.displayName ??
              participant?.displayName,
            orderCount: countOf(row),
            revenueCents: amountOf(row),
            commissionCount: countOf(commission),
            commissionCents: amountOf(commission),
          };
        })
        .sort((a, b) => b.revenueCents - a.revenueCents)
        .slice(0, 10),
      topAgencies: agencyOrderRows
        .map((row) => {
          const participant = participantMap.get(
            row.channelParticipantId ?? '',
          );
          const commission = agencyCommissionRows.find(
            (item) => item.participantId === row.channelParticipantId,
          );

          return {
            participantId: row.channelParticipantId,
            agencyId: row.channelParticipantId,
            code: participant?.agency?.code ?? participant?.code ?? 'UNKNOWN',
            name:
              participant?.agency?.name ??
              participant?.displayName ??
              'Unknown agency',
            orderCount: countOf(row),
            revenueCents: amountOf(row),
            commissionCount: countOf(commission),
            commissionCents: amountOf(commission),
          };
        })
        .sort((a, b) => b.revenueCents - a.revenueCents)
        .slice(0, 10),
      recentApprovedOrders,
      recentPayouts,
    };
  }

  async getSalePersonalReport(
    query: ChannelReportQueryDto,
    user: AuthenticatedUser,
  ) {
    const userId = dbUserId(user);
    if (!userId) {
      return {
        orders: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          approvedRevenueCents: 0,
        },
        commission: { totalCents: 0, availableCents: 0 },
        recentOrders: [],
        period: { from: new Date(), to: new Date() },
      };
    }

    const period = resolveReportPeriod(query);
    const createdRange = { gte: period.from, lt: period.toExclusive };

    const orderWhere: Prisma.ActivationOrderWhereInput = {
      createdById: userId,
      createdAt: createdRange,
    };
    const earningWhere: Prisma.CommissionEarningWhereInput = {
      beneficiaryUserId: userId,
      createdAt: createdRange,
    };

    const [
      orderStatusRows,
      approvedAggregate,
      commissionAggregate,
      recentOrders,
      participant,
    ] = await Promise.all([
      this.prisma.activationOrder.groupBy({
        by: ['status'],
        where: orderWhere,
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.activationOrder.aggregate({
        where: { ...orderWhere, status: 'APPROVED' },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.commissionEarning.aggregate({
        where: earningWhere,
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.activationOrder.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          customerEmail: true,
          amountCents: true,
          currency: true,
          packageName: true,
          activatedAt: true,
          expiresAt: true,
          createdAt: true,
          saleInvoiceUrl: true,
          commissionEarnings: {
            select: { amountCents: true, status: true },
          },
        },
      }),
      this.prisma.channelParticipant.findFirst({
        where: { type: 'SALE', userId },
        select: { commissionRateBps: true, baseSalaryCents: true },
      }),
    ]);

    const statusMap: Record<string, { count: number; amountCents: number }> =
      {};
    for (const row of orderStatusRows) {
      statusMap[row.status] = {
        count: countOf(row),
        amountCents: amountOf(row),
      };
    }

    const totalOrders = orderStatusRows.reduce((s, r) => s + countOf(r), 0);

    return {
      period: { from: period.from, to: period.to },
      orders: {
        total: totalOrders,
        pending: statusMap['PENDING_REVIEW']?.count ?? 0,
        approved: countOf(approvedAggregate),
        rejected: statusMap['REJECTED']?.count ?? 0,
        approvedRevenueCents: amountOf(approvedAggregate),
        byStatus: statusMap,
      },
      commission: {
        totalCents: commissionAggregate._sum.amountCents ?? 0,
        commissionRateBps: participant?.commissionRateBps ?? null,
        baseSalaryCents: participant?.baseSalaryCents ?? 0,
      },
      recentOrders,
    };
  }

  // ── CSV Export ─────────────────────────────────────────────────────────────
  async getOrdersCsv(query: ChannelReportQueryDto, user: AuthenticatedUser) {
    const period = resolveReportPeriod(query);
    const scope = await this.channelFinanceScopeService.scopeFor(user);
    const orders = await this.prisma.activationOrder.findMany({
      where: {
        ...scope.orderWhere,
        status: 'APPROVED',
        activatedAt: { gte: period.from, lt: period.toExclusive },
      },
      orderBy: { activatedAt: 'desc' },
      take: 5000,
      select: {
        id: true,
        status: true,
        source: true,
        customerEmail: true,
        customerPhone: true,
        amountCents: true,
        currency: true,
        packageName: true,
        durationDays: true,
        activatedAt: true,
        expiresAt: true,
        revokedAt: true,
        revokeReason: true,
        createdAt: true,
        agency: { select: { code: true, name: true } },
        createdBy: { select: { email: true } },
        reviewedBy: { select: { email: true } },
        commissionEarnings: {
          select: {
            beneficiaryType: true,
            rateBps: true,
            amountCents: true,
            status: true,
          },
        },
      },
    });

    const csvEscape = (v: string | null | undefined) => {
      if (v == null) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const fmtDate = (d: Date | null | undefined) =>
      d ? new Date(d).toISOString().slice(0, 19).replace('T', ' ') : '';

    const fmtMoney = (cents: number, currency: string) =>
      `${(cents / 100).toFixed(0)} ${currency}`;

    const headers = [
      'ID',
      'Status',
      'Source',
      'Customer Email',
      'Customer Phone',
      'Amount',
      'Package',
      'Duration (days)',
      'Agency',
      'Created By',
      'Reviewed By',
      'Activated At',
      'Expires At',
      'Revoked At',
      'Revoke Reason',
      'Commission (SALE)',
      'Commission (AGENCY)',
      'Created At',
    ];

    const rows = orders.map((o) => {
      const saleCommission = o.commissionEarnings
        .filter((e) => e.beneficiaryType === 'SALE' && e.status !== 'CANCELED')
        .reduce((s, e) => s + e.amountCents, 0);
      const agencyCommission = o.commissionEarnings
        .filter(
          (e) => e.beneficiaryType === 'AGENCY' && e.status !== 'CANCELED',
        )
        .reduce((s, e) => s + e.amountCents, 0);

      return [
        o.id,
        o.status,
        o.source,
        o.customerEmail,
        o.customerPhone ?? '',
        fmtMoney(o.amountCents, o.currency),
        o.packageName ?? '',
        o.durationDays?.toString() ?? '',
        o.agency ? `${o.agency.code} - ${o.agency.name}` : '',
        o.createdBy?.email ?? '',
        o.reviewedBy?.email ?? '',
        fmtDate(o.activatedAt),
        fmtDate(o.expiresAt),
        fmtDate(o.revokedAt),
        o.revokeReason ?? '',
        saleCommission > 0 ? fmtMoney(saleCommission, o.currency) : '',
        agencyCommission > 0 ? fmtMoney(agencyCommission, o.currency) : '',
        fmtDate(o.createdAt),
      ].map(csvEscape);
    });

    const lines = [headers, ...rows].map((row) => row.join(','));
    return lines.join('\r\n');
  }
}
