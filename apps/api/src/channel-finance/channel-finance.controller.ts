import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  channelFinanceManageRoles,
  channelFinanceViewRoles,
  channelReportViewRoles,
} from '../auth/permissions';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { filesystemUploadSurfaces } from '../upload-storage/filesystem-upload-storage';
import { createProviderUploadStorage } from '../upload-storage/provider-upload-storage';
import { ChannelFinanceService } from './channel-finance.service';
import { ChannelReportQueryDto } from './dto/channel-report-query.dto';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { ReviewPayoutRequestDto } from './dto/review-payout-request.dto';

const allowedPayoutMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const payoutUploadOptions = {
  storage: createProviderUploadStorage(
    filesystemUploadSurfaces.channelFinancePayoutInvoice,
  ),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    callback(null, allowedPayoutMimeTypes.has(file.mimetype));
  },
};

@Controller('channel-finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChannelFinanceController {
  constructor(private readonly financeService: ChannelFinanceService) {}

  @Get('overview')
  @Roles(...channelFinanceViewRoles)
  getOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.financeService.getOverview(user);
  }

  @Get('report')
  @Roles(...channelReportViewRoles)
  getReport(
    @Query() query: ChannelReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.financeService.getReport(query, user);
  }

  @Get('report/csv')
  @Roles(...channelReportViewRoles)
  async getReportCsv(
    @Query() query: ChannelReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const csv = await this.financeService.getOrdersCsv(query, user);
    const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  }

  @Get('wallet')
  @Roles(...channelFinanceViewRoles)
  getWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.financeService.getWallet(user);
  }

  @Get('my-report')
  @Roles('SALE')
  getSalePersonalReport(
    @Query() query: ChannelReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.financeService.getSalePersonalReport(query, user);
  }

  @Get('payouts')
  @Roles(...channelFinanceViewRoles)
  listPayouts(@CurrentUser() user: AuthenticatedUser) {
    return this.financeService.listPayoutRequests(user);
  }

  @Post('payouts')
  @Roles(...channelFinanceViewRoles)
  createPayout(
    @Body() dto: CreatePayoutRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.financeService.createPayoutRequest(dto, user);
  }

  @Post('payouts/:payoutId/pay')
  @Roles(...channelFinanceManageRoles)
  @UseInterceptors(FileInterceptor('payoutInvoice', payoutUploadOptions))
  payPayout(
    @Param('payoutId') payoutId: string,
    @UploadedFile() payoutInvoice: Express.Multer.File | undefined,
    @Body() dto: ReviewPayoutRequestDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.financeService.payPayoutRequest(
      payoutId,
      dto,
      payoutInvoice,
      user,
      idempotencyKey,
    );
  }

  @Post('payouts/:payoutId/reject')
  @Roles(...channelFinanceManageRoles)
  rejectPayout(
    @Param('payoutId') payoutId: string,
    @Body() dto: ReviewPayoutRequestDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.financeService.rejectPayoutRequest(
      payoutId,
      dto,
      user,
      idempotencyKey,
    );
  }
}
