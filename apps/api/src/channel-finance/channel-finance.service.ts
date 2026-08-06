import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  addDays as addIdempotencyDays,
  buildRequestHash,
  normalizeIdempotencyKey,
  resolveExistingIdempotencyRecord,
  toIdempotencyJson,
} from '../commercial-idempotency';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelReportQueryDto } from './dto/channel-report-query.dto';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { ReviewPayoutRequestDto } from './dto/review-payout-request.dto';

const payoutInvoiceUrl = (file: Express.Multer.File) =>
  `/uploads/invoices/${file.filename}`;

const manualRefundRequestOpenedAction = 'MANUAL_REFUND_REQUEST_OPENED';
const manualRefundRequestApprovedAction = 'MANUAL_REFUND_REQUEST_APPROVED';
const manualRefundRequestRejectedAction = 'MANUAL_REFUND_REQUEST_REJECTED';
const manualRefundReviewActions = [
  manualRefundRequestOpenedAction,
  manualRefundRequestApprovedAction,
  manualRefundRequestRejectedAction,
] as const;

type MoneyStatusRow<T extends string> = {
  status: T;
  _count?: true | number | { id?: number; _all?: number };
  _sum?: {
    amountCents?: number | null;
  };
};

type SourceRow = {
  source: 'SALE_ASSISTED' | 'SELF_SERVICE';
  _count?: true | number | { id?: number; _all?: number };
  _sum?: {
    amountCents?: number | null;
  };
};

type ChannelFinanceScope = {
  orderWhere: Prisma.ActivationOrderWhereInput;
  earningWhere: Prisma.CommissionEarningWhereInput;
  ledgerWhere: Prisma.CommissionLedgerEntryWhereInput;
  payoutWhere: Prisma.PayoutRequestWhereInput;
  participantWhere: Prisma.ChannelParticipantWhereInput;
};

@Injectable()
export class ChannelFinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(user: AuthenticatedUser) {
    const scope = await this.scopeFor(user);
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
        this.getWalletSummary(user),
      ]);

    return {
      orders,
      approvedRevenueCents: this.amountOf(approvedOrders),
      approvedOrderCount: this.countOf(approvedOrders),
      pendingPayoutCents: this.amountOf(pendingPayouts),
      pendingPayoutCount: this.countOf(pendingPayouts),
      paidPayoutCents: this.amountOf(paidPayouts),
      paidPayoutCount: this.countOf(paidPayouts),
      wallet,
    };
  }

  async getReport(query: ChannelReportQueryDto, user: AuthenticatedUser) {
    const period = this.resolveReportPeriod(query);
    const scope = await this.scopeFor(user);
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
        totalCount: orderStatusRows.reduce(
          (sum, row) => sum + this.countOf(row),
          0,
        ),
        totalAmountCents: orderStatusRows.reduce(
          (sum, row) => sum + this.amountOf(row),
          0,
        ),
        byStatus: this.rowsByStatus(orderStatusRows),
        bySource: this.rowsBySource(orderSourceRows),
      },
      approvedRevenue: {
        orderCount: this.countOf(approvedAggregate),
        amountCents: this.amountOf(approvedAggregate),
        bySource: this.rowsBySource(approvedSourceRows),
      },
      commissions: {
        totalCount: commissionRows.reduce(
          (sum, row) => sum + this.countOf(row),
          0,
        ),
        totalAmountCents: commissionRows.reduce(
          (sum, row) => sum + this.amountOf(row),
          0,
        ),
        saleAmountCents:
          this.amountOf(
            commissionRows.find((row) => row.beneficiaryType === 'SALE'),
          ) ?? 0,
        agencyAmountCents:
          this.amountOf(
            commissionRows.find((row) => row.beneficiaryType === 'AGENCY'),
          ) ?? 0,
      },
      payouts: {
        requestCount: payoutStatusRows.reduce(
          (sum, row) => sum + this.countOf(row),
          0,
        ),
        requestedAmountCents: payoutStatusRows.reduce(
          (sum, row) => sum + this.amountOf(row),
          0,
        ),
        paidCount: this.countOf(paidPayoutAggregate),
        paidAmountCents: this.amountOf(paidPayoutAggregate),
        byStatus: this.rowsByStatus(payoutStatusRows),
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
            orderCount: this.countOf(row),
            revenueCents: this.amountOf(row),
            commissionCount: this.countOf(commission),
            commissionCents: this.amountOf(commission),
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
            orderCount: this.countOf(row),
            revenueCents: this.amountOf(row),
            commissionCount: this.countOf(commission),
            commissionCents: this.amountOf(commission),
          };
        })
        .sort((a, b) => b.revenueCents - a.revenueCents)
        .slice(0, 10),
      recentApprovedOrders,
      recentPayouts,
    };
  }

  async getWallet(user: AuthenticatedUser) {
    const scope = await this.scopeFor(user);
    const userId = this.dbUserId(user);

    const [entries, earnings, payoutRequests, summary, participant] =
      await Promise.all([
        this.prisma.commissionLedgerEntry.findMany({
          where: scope.ledgerWhere,
          orderBy: { createdAt: 'desc' },
          take: 80,
        }),
        this.prisma.commissionEarning.findMany({
          where: scope.earningWhere,
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            participant: {
              select: {
                id: true,
                type: true,
                code: true,
                displayName: true,
              },
            },
            activationOrder: {
              select: {
                id: true,
                customerEmail: true,
                source: true,
                amountCents: true,
                currency: true,
                createdAt: true,
              },
            },
            beneficiaryAgency: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.payoutRequest.findMany({
          where: scope.payoutWhere,
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            participant: {
              select: {
                id: true,
                type: true,
                code: true,
                displayName: true,
              },
            },
            beneficiaryAgency: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),
        this.getWalletSummary(user),
        userId
          ? this.prisma.channelParticipant.findFirst({
              where: { userId, status: 'ACTIVE' },
              select: {
                id: true,
                type: true,
                code: true,
                displayName: true,
                commissionRateBps: true,
                baseSalaryCents: true,
              },
            })
          : Promise.resolve(null),
      ]);

    return {
      summary,
      entries,
      earnings,
      payoutRequests,
      participant,
    };
  }

  async getSalePersonalReport(
    query: ChannelReportQueryDto,
    user: AuthenticatedUser,
  ) {
    const userId = this.dbUserId(user);
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

    const period = this.resolveReportPeriod(query);
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
        count: this.countOf(row),
        amountCents: this.amountOf(row),
      };
    }

    const totalOrders = orderStatusRows.reduce(
      (s, r) => s + this.countOf(r),
      0,
    );

    return {
      period: { from: period.from, to: period.to },
      orders: {
        total: totalOrders,
        pending: statusMap['PENDING_REVIEW']?.count ?? 0,
        approved: this.countOf(approvedAggregate),
        rejected: statusMap['REJECTED']?.count ?? 0,
        approvedRevenueCents: this.amountOf(approvedAggregate),
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

  async listPayoutRequests(user: AuthenticatedUser) {
    const scope = await this.scopeFor(user);
    return this.prisma.payoutRequest.findMany({
      where: scope.payoutWhere,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        participant: {
          select: {
            id: true,
            type: true,
            code: true,
            displayName: true,
          },
        },
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
      },
    });
  }

  async createPayoutRequest(
    dto: CreatePayoutRequestDto,
    user: AuthenticatedUser,
  ) {
    const beneficiary = await this.resolvePayoutBeneficiary(dto, user);
    const amountCents = Math.round(dto.amountVnd * 100);
    const balance = await this.balanceFor(beneficiary);

    if (amountCents > balance.availableCents) {
      throw new BadRequestException(
        'Insufficient available commission balance',
      );
    }

    await this.assertNoOpenManualRefundReviewForPayout(beneficiary);

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.create({
        data: {
          participantId: beneficiary.participantId,
          beneficiaryUserId: beneficiary.userId,
          beneficiaryAgencyId: beneficiary.agencyId,
          amountCents,
          currency: 'VND',
          bankName: dto.bankName.trim(),
          bankAccountNumber: dto.bankAccountNumber.trim(),
          bankAccountName: dto.bankAccountName.trim(),
          requestNotes: dto.requestNotes,
        },
      });

      await tx.commissionLedgerEntry.create({
        data: {
          participantId: beneficiary.participantId,
          beneficiaryUserId: beneficiary.userId,
          beneficiaryAgencyId: beneficiary.agencyId,
          type: 'HOLD',
          amountCents,
          currency: 'VND',
          reason: 'Payout request hold',
          referenceType: 'PayoutRequest',
          referenceId: payout.id,
        },
      });

      return payout;
    });
  }

  async payPayoutRequest(
    payoutId: string,
    dto: ReviewPayoutRequestDto,
    payoutInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    if (!payoutInvoice) {
      throw new BadRequestException('Payout invoice file is required');
    }

    this.assertCanManage(user);
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = this.dbUserId(user);
    const idempotencyScope = `payout:pay:${payoutId}`;
    const requestHash = buildRequestHash({
      action: 'PAYOUT_PAY',
      actorUserId,
      dto,
      payoutId,
      payoutInvoice: this.fileIdempotencyMetadata(payoutInvoice),
    });

    if (normalizedIdempotencyKey) {
      const existing = await this.prisma.idempotencyRecord.findUnique({
        where: {
          scope_key: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
          },
        },
      });
      const replay = resolveExistingIdempotencyRecord<Record<string, unknown>>(
        existing,
        requestHash,
      );
      if (replay.replayed) {
        return replay.response;
      }
    }

    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });
    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }
    if (!['PENDING_REVIEW', 'APPROVED'].includes(payout.status)) {
      throw new BadRequestException('Only pending payout requests can be paid');
    }

    await this.assertPayoutHoldStillFunded(payout);
    await this.assertNoOpenManualRefundReviewForPayout(payout);

    const invoiceUrl = payoutInvoiceUrl(payoutInvoice);

    return this.prisma.$transaction(async (tx) => {
      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.create({
          data: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
            actorUserId,
            resourceType: 'PayoutRequest',
            resourceId: payout.id,
            requestHash,
            status: 'IN_PROGRESS',
            expiresAt: addIdempotencyDays(new Date(), 30),
          },
        });
      }

      const updated = await tx.payoutRequest.updateMany({
        where: {
          id: payout.id,
          status: { in: ['PENDING_REVIEW', 'APPROVED'] },
        },
        data: {
          status: 'PAID',
          reviewedById: actorUserId,
          reviewNotes: dto.reviewNotes,
          payoutInvoiceUrl: invoiceUrl,
          payoutInvoiceStorageKey: `invoices/${payoutInvoice.filename}`,
          payoutInvoiceMimeType: payoutInvoice.mimetype,
          payoutInvoiceFileSizeBytes: payoutInvoice.size,
          paidAt: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException(
          'Only pending payout requests can be paid',
        );
      }

      await tx.commissionLedgerEntry.createMany({
        data: [
          {
            beneficiaryUserId: payout.beneficiaryUserId,
            beneficiaryAgencyId: payout.beneficiaryAgencyId,
            participantId: payout.participantId,
            type: 'RELEASE',
            amountCents: payout.amountCents,
            currency: payout.currency,
            reason: 'Release payout hold before payment',
            referenceType: 'PayoutRequest',
            referenceId: payout.id,
          },
          {
            beneficiaryUserId: payout.beneficiaryUserId,
            beneficiaryAgencyId: payout.beneficiaryAgencyId,
            participantId: payout.participantId,
            type: 'DEBIT',
            amountCents: payout.amountCents,
            currency: payout.currency,
            reason: 'Payout paid',
            referenceType: 'PayoutRequest',
            referenceId: payout.id,
          },
        ],
      });

      const paid = await tx.payoutRequest.findUniqueOrThrow({
        where: { id: payout.id },
      });

      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.update({
          where: {
            scope_key: {
              scope: idempotencyScope,
              key: normalizedIdempotencyKey,
            },
          },
          data: {
            status: 'SUCCEEDED',
            resourceId: payout.id,
            responseJson: toIdempotencyJson(paid),
          },
        });
      }

      return paid;
    });
  }

  async rejectPayoutRequest(
    payoutId: string,
    dto: ReviewPayoutRequestDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    this.assertCanManage(user);
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = this.dbUserId(user);
    const idempotencyScope = `payout:reject:${payoutId}`;
    const requestHash = buildRequestHash({
      action: 'PAYOUT_REJECT',
      actorUserId,
      dto,
      payoutId,
    });

    if (normalizedIdempotencyKey) {
      const existing = await this.prisma.idempotencyRecord.findUnique({
        where: {
          scope_key: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
          },
        },
      });
      const replay = resolveExistingIdempotencyRecord<Record<string, unknown>>(
        existing,
        requestHash,
      );
      if (replay.replayed) {
        return replay.response;
      }
    }

    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });
    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }
    if (payout.status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        'Only pending payout requests can be rejected',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.create({
          data: {
            scope: idempotencyScope,
            key: normalizedIdempotencyKey,
            actorUserId,
            resourceType: 'PayoutRequest',
            resourceId: payout.id,
            requestHash,
            status: 'IN_PROGRESS',
            expiresAt: addIdempotencyDays(new Date(), 30),
          },
        });
      }

      const updated = await tx.payoutRequest.updateMany({
        where: { id: payout.id, status: 'PENDING_REVIEW' },
        data: {
          status: 'REJECTED',
          reviewedById: actorUserId,
          reviewNotes: dto.reviewNotes,
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException(
          'Only pending payout requests can be rejected',
        );
      }

      await tx.commissionLedgerEntry.create({
        data: {
          beneficiaryUserId: payout.beneficiaryUserId,
          beneficiaryAgencyId: payout.beneficiaryAgencyId,
          participantId: payout.participantId,
          type: 'RELEASE',
          amountCents: payout.amountCents,
          currency: payout.currency,
          reason: 'Rejected payout hold released',
          referenceType: 'PayoutRequest',
          referenceId: payout.id,
        },
      });

      const rejected = await tx.payoutRequest.findUniqueOrThrow({
        where: { id: payout.id },
      });

      if (normalizedIdempotencyKey) {
        await tx.idempotencyRecord.update({
          where: {
            scope_key: {
              scope: idempotencyScope,
              key: normalizedIdempotencyKey,
            },
          },
          data: {
            status: 'SUCCEEDED',
            resourceId: payout.id,
            responseJson: toIdempotencyJson(rejected),
          },
        });
      }

      return rejected;
    });
  }

  private async getWalletSummary(user: AuthenticatedUser) {
    const scope = await this.scopeFor(user);
    const entries = await this.prisma.commissionLedgerEntry.findMany({
      where: scope.ledgerWhere,
      select: {
        type: true,
        amountCents: true,
        currency: true,
      },
    });

    return this.summarizeEntries(entries);
  }

  private summarizeEntries(
    entries: Array<{
      type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
      amountCents: number;
      currency: string;
    }>,
  ) {
    const balanceCents = entries.reduce((sum, entry) => {
      return entry.type === 'CREDIT' || entry.type === 'RELEASE'
        ? sum + entry.amountCents
        : sum - entry.amountCents;
    }, 0);
    const heldCents = entries
      .filter((entry) => entry.type === 'HOLD')
      .reduce((sum, entry) => sum + entry.amountCents, 0);
    const releasedCents = entries
      .filter((entry) => entry.type === 'RELEASE')
      .reduce((sum, entry) => sum + entry.amountCents, 0);

    return {
      availableCents: balanceCents,
      heldCents: Math.max(heldCents - releasedCents, 0),
      currency: entries[0]?.currency ?? 'VND',
    };
  }

  private resolveReportPeriod(query: ChannelReportQueryDto) {
    const to = query.to ? this.endOfReportDay(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid report date range');
    }

    if (from > to) {
      throw new BadRequestException(
        'Report start date must be before end date',
      );
    }

    const maxRangeMs = 366 * 24 * 60 * 60 * 1000;
    if (to.getTime() - from.getTime() > maxRangeMs) {
      throw new BadRequestException('Report range cannot exceed 366 days');
    }

    return {
      from,
      to,
      toExclusive: new Date(to.getTime() + 1),
    };
  }

  private endOfReportDay(value: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = new Date(value);
      date.setUTCHours(23, 59, 59, 999);
      return date;
    }

    return new Date(value);
  }

  private rowsByStatus<T extends string>(rows: MoneyStatusRow<T>[]) {
    return rows.reduce(
      (result, row) => ({
        ...result,
        [row.status]: {
          count: this.countOf(row),
          amountCents: this.amountOf(row),
        },
      }),
      {} as Record<T, { count: number; amountCents: number }>,
    );
  }

  private rowsBySource(rows: SourceRow[]) {
    return rows.reduce(
      (result, row) => ({
        ...result,
        [row.source]: {
          count: this.countOf(row),
          amountCents: this.amountOf(row),
        },
      }),
      {} as Record<
        'SALE_ASSISTED' | 'SELF_SERVICE',
        { count: number; amountCents: number }
      >,
    );
  }

  private countOf(row?: {
    _count?: true | number | { id?: number; _all?: number };
  }) {
    const count = row?._count;
    if (typeof count === 'number') {
      return count;
    }
    if (count && typeof count === 'object') {
      return count.id ?? count._all ?? 0;
    }

    return 0;
  }

  private amountOf(row?: { _sum?: { amountCents?: number | null } }) {
    return row?._sum?.amountCents ?? 0;
  }

  private async balanceFor(beneficiary: {
    participantId: string;
    userId?: string;
    agencyId?: string;
  }) {
    const entries = await this.prisma.commissionLedgerEntry.findMany({
      where: { participantId: beneficiary.participantId },
      select: {
        type: true,
        amountCents: true,
        currency: true,
      },
    });

    return this.summarizeEntries(entries);
  }

  private async assertPayoutHoldStillFunded(payout: {
    participantId?: string | null;
    beneficiaryUserId?: string | null;
    beneficiaryAgencyId?: string | null;
  }) {
    if (!payout.participantId) {
      throw new BadRequestException(
        'Payout payment blocked because payout is missing channel participant',
      );
    }

    const balance = await this.balanceFor({
      participantId: payout.participantId,
      userId: payout.beneficiaryUserId ?? undefined,
      agencyId: payout.beneficiaryAgencyId ?? undefined,
    });

    if (balance.availableCents < 0) {
      throw new BadRequestException(
        'Payout payment blocked because commission balance is negative after refund or clawback',
      );
    }
  }

  private async assertNoOpenManualRefundReviewForPayout(payout: {
    participantId?: string | null;
  }) {
    if (!payout.participantId) {
      throw new BadRequestException(
        'Payout blocked because payout is missing channel participant',
      );
    }

    const releasedEarningsWithRefundHistory =
      await this.prisma.commissionEarning.findMany({
        where: {
          participantId: payout.participantId,
          status: 'AVAILABLE',
          activationOrder: {
            is: {
              statusHistory: {
                some: { action: manualRefundRequestOpenedAction },
              },
            },
          },
        },
        select: {
          id: true,
          activationOrderId: true,
          activationOrder: {
            select: {
              statusHistory: {
                where: { action: { in: [...manualRefundReviewActions] } },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                take: 1,
                select: { action: true },
              },
            },
          },
        },
      });

    const blockingRefundReview = releasedEarningsWithRefundHistory.find(
      (earning) =>
        earning.activationOrder.statusHistory[0]?.action ===
          manualRefundRequestOpenedAction ||
        earning.activationOrder.statusHistory[0]?.action ===
          manualRefundRequestApprovedAction,
    );

    if (blockingRefundReview) {
      const latestAction =
        blockingRefundReview.activationOrder.statusHistory[0]?.action;
      throw new BadRequestException(
        latestAction === manualRefundRequestApprovedAction
          ? 'Payout blocked because released commission was approved for manual refund'
          : 'Payout blocked because released commission is under manual refund review',
      );
    }
  }

  private async resolvePayoutBeneficiary(
    dto: CreatePayoutRequestDto,
    user: AuthenticatedUser,
  ) {
    const canManage = this.canManage(user);

    if (dto.agencyId) {
      const agency = !canManage
        ? await this.assertAgencyPayoutAccess(dto.agencyId, user)
        : await this.prisma.agency.findUnique({
            where: { id: dto.agencyId },
            include: { channelParticipant: true },
          });
      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
      const participant =
        agency.channelParticipant ??
        (await this.ensureAgencyParticipant(agency));

      return {
        participantId: participant.id,
        agencyId: dto.agencyId,
      };
    }

    const participant = await this.actorParticipant(user);
    if (!participant) {
      throw new BadRequestException('Demo accounts cannot request payouts');
    }

    return {
      participantId: participant.id,
      userId:
        participant.type === 'AGENCY'
          ? undefined
          : (participant.userId ?? undefined),
      agencyId:
        participant.type === 'AGENCY'
          ? (participant.agencyId ?? undefined)
          : undefined,
    };
  }

  private async scopeFor(
    user: AuthenticatedUser,
  ): Promise<ChannelFinanceScope> {
    if (this.canManage(user)) {
      return {
        orderWhere: {},
        earningWhere: {},
        ledgerWhere: {},
        payoutWhere: {},
        participantWhere: {},
      };
    }

    const actor = await this.actorParticipant(user);
    if (!actor) {
      return {
        orderWhere: { id: '__none__' },
        earningWhere: { id: '__none__' },
        ledgerWhere: { id: '__none__' },
        payoutWhere: { id: '__none__' },
        participantWhere: { id: '__none__' },
      };
    }
    const participantWhere: Prisma.ChannelParticipantWhereInput = {
      lineage: { startsWith: actor.lineage },
    };

    return {
      orderWhere: {
        OR: [
          { channelParticipant: { is: participantWhere } },
          ...(actor.userId ? [{ createdById: actor.userId }] : []),
        ],
      },
      earningWhere: {
        participant: { is: participantWhere },
      },
      ledgerWhere: {
        participant: { is: participantWhere },
      },
      payoutWhere: {
        participant: { is: participantWhere },
      },
      participantWhere,
    };
  }

  private canManage(user: AuthenticatedUser) {
    return user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role));
  }

  private isAgencyChannelManager(user: AuthenticatedUser) {
    return user.roles.some((role) =>
      ['DIRECTOR', 'AGENCY_OWNER', 'AGENCY_MANAGER'].includes(role),
    );
  }

  private assertCanManage(user: AuthenticatedUser) {
    if (!this.canManage(user)) {
      throw new ForbiddenException('Insufficient finance permission');
    }
  }

  private async assertAgencyPayoutAccess(
    agencyId: string,
    user: AuthenticatedUser,
  ) {
    const actor = await this.actorParticipant(user);
    if (!actor || !this.isAgencyChannelManager(user)) {
      throw new ForbiddenException(
        'Only operations can request agency payouts',
      );
    }

    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: { channelParticipant: true },
    });
    if (!agency?.channelParticipant) {
      throw new ForbiddenException('Insufficient agency payout permission');
    }

    if (!agency.channelParticipant.lineage.startsWith(actor.lineage)) {
      throw new ForbiddenException('Insufficient agency payout permission');
    }

    return agency;
  }

  private async ensureAgencyParticipant(agency: {
    id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'SUSPENDED';
    defaultRateBps: number;
    notes?: string | null;
  }) {
    const participant = await this.prisma.channelParticipant.upsert({
      where: { agencyId: agency.id },
      update: {
        code: agency.code,
        displayName: agency.name,
        status: agency.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
        commissionRateBps:
          agency.defaultRateBps > 0 ? agency.defaultRateBps : null,
        notes: agency.notes,
      },
      create: {
        type: 'AGENCY',
        code: agency.code,
        displayName: agency.name,
        agencyId: agency.id,
        status: agency.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
        baseSalaryCents: 0,
        commissionRateBps:
          agency.defaultRateBps > 0 ? agency.defaultRateBps : null,
        notes: agency.notes,
      },
    });

    if (participant.lineage) {
      return participant;
    }

    return this.prisma.channelParticipant.update({
      where: { id: participant.id },
      data: {
        rootParticipantId: participant.id,
        lineage: `/${participant.id}/`,
      },
    });
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
        userId: true,
        agencyId: true,
        lineage: true,
      },
    });
  }

  private dbUserId(user: AuthenticatedUser) {
    return user.sub.startsWith('demo-') ? undefined : user.sub;
  }

  private fileIdempotencyMetadata(file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  // ── CSV Export ─────────────────────────────────────────────────────────────

  async getOrdersCsv(query: ChannelReportQueryDto, user: AuthenticatedUser) {
    const period = this.resolveReportPeriod(query);
    const scope = await this.scopeFor(user);
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
