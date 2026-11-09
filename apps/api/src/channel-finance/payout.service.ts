import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  addDays as addIdempotencyDays,
  buildRequestHash,
  normalizeIdempotencyKey,
  resolveExistingIdempotencyRecord,
  toIdempotencyJson,
} from '../commercial-idempotency';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { ReviewPayoutRequestDto } from './dto/review-payout-request.dto';
import { ChannelFinanceScopeService } from './channel-finance-scope.service';
import {
  assertCanManage,
  canManageFinance,
  dbUserId,
  fileIdempotencyMetadata,
  isAgencyChannelManager,
  manualRefundRequestApprovedAction,
  manualRefundRequestOpenedAction,
  manualRefundReviewActions,
  payoutInvoiceUrl,
  summarizeEntries,
} from './channel-finance.helpers';

/** Wallet and payout requests: create, pay, reject. */
@Injectable()
export class PayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelFinanceScopeService: ChannelFinanceScopeService,
  ) {}

  async getWallet(user: AuthenticatedUser) {
    const scope = await this.channelFinanceScopeService.scopeFor(user);
    const userId = dbUserId(user);

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
        this.channelFinanceScopeService.getWalletSummary(user),
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

  async listPayoutRequests(user: AuthenticatedUser) {
    const scope = await this.channelFinanceScopeService.scopeFor(user);
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

    assertCanManage(user);
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = dbUserId(user);
    const idempotencyScope = `payout:pay:${payoutId}`;
    const requestHash = buildRequestHash({
      action: 'PAYOUT_PAY',
      actorUserId,
      dto,
      payoutId,
      payoutInvoice: fileIdempotencyMetadata(payoutInvoice),
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
    assertCanManage(user);
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const actorUserId = dbUserId(user);
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

    return summarizeEntries(entries);
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
    const canManage = canManageFinance(user);

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

    const participant =
      await this.channelFinanceScopeService.actorParticipant(user);
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

  private async assertAgencyPayoutAccess(
    agencyId: string,
    user: AuthenticatedUser,
  ) {
    const actor = await this.channelFinanceScopeService.actorParticipant(user);
    if (!actor || !isAgencyChannelManager(user)) {
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
}
