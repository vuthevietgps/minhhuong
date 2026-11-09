import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChannelReportQueryDto } from './dto/channel-report-query.dto';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { ReviewPayoutRequestDto } from './dto/review-payout-request.dto';
import { ChannelFinanceReportService } from './channel-finance-report.service';
import { PayoutService } from './payout.service';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class ChannelFinanceService {
  constructor(
    private readonly channelFinanceReportService: ChannelFinanceReportService,
    private readonly payoutService: PayoutService,
  ) {}

  getOverview(user: AuthenticatedUser) {
    return this.channelFinanceReportService.getOverview(user);
  }

  getReport(query: ChannelReportQueryDto, user: AuthenticatedUser) {
    return this.channelFinanceReportService.getReport(query, user);
  }

  getWallet(user: AuthenticatedUser) {
    return this.payoutService.getWallet(user);
  }

  getSalePersonalReport(query: ChannelReportQueryDto, user: AuthenticatedUser) {
    return this.channelFinanceReportService.getSalePersonalReport(query, user);
  }

  listPayoutRequests(user: AuthenticatedUser) {
    return this.payoutService.listPayoutRequests(user);
  }

  createPayoutRequest(dto: CreatePayoutRequestDto, user: AuthenticatedUser) {
    return this.payoutService.createPayoutRequest(dto, user);
  }

  payPayoutRequest(
    payoutId: string,
    dto: ReviewPayoutRequestDto,
    payoutInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    return this.payoutService.payPayoutRequest(
      payoutId,
      dto,
      payoutInvoice,
      user,
      idempotencyKey,
    );
  }

  rejectPayoutRequest(
    payoutId: string,
    dto: ReviewPayoutRequestDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    return this.payoutService.rejectPayoutRequest(
      payoutId,
      dto,
      user,
      idempotencyKey,
    );
  }

  // ── CSV Export ─────────────────────────────────────────────────────────────
  getOrdersCsv(query: ChannelReportQueryDto, user: AuthenticatedUser) {
    return this.channelFinanceReportService.getOrdersCsv(query, user);
  }
}
