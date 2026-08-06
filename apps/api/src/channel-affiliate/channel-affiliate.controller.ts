import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  channelAffiliateManageRoles,
  channelAffiliateViewRoles,
} from '../auth/permissions';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChannelAffiliateService } from './channel-affiliate.service';
import {
  AffiliateCommissionAggregateQueryDto,
  AffiliateOrderAttributionAggregateQueryDto,
  CreateAffiliateLinkDto,
  CreateAffiliateQrAssetDto,
  ExportAffiliateCommissionsQueryDto,
  ExportAffiliateOrderAttributionsQueryDto,
  ListAffiliateCommissionsQueryDto,
  ListAffiliateOrderAttributionsQueryDto,
  ListAffiliateLinksQueryDto,
  ListAffiliateReportAccessAuditsQueryDto,
  UpdateAffiliateLinkDto,
} from './dto/channel-affiliate.dto';

@Controller('channel-affiliate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChannelAffiliateController {
  constructor(
    private readonly channelAffiliateService: ChannelAffiliateService,
  ) {}

  private setCsvHeaders(response: Response, filename: string) {
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
  }

  @Get('links')
  @Roles(...channelAffiliateViewRoles)
  listLinks(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAffiliateLinksQueryDto,
  ) {
    return this.channelAffiliateService.listLinks(user, query);
  }

  @Get('order-attributions')
  @Roles(...channelAffiliateViewRoles)
  listOrderAttributions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAffiliateOrderAttributionsQueryDto,
  ) {
    return this.channelAffiliateService.listOrderAttributions(user, query);
  }

  @Get('commissions')
  @Roles(...channelAffiliateViewRoles)
  listCommissions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAffiliateCommissionsQueryDto,
  ) {
    return this.channelAffiliateService.listCommissions(user, query);
  }

  @Get('commissions/export.csv')
  @Roles(...channelAffiliateViewRoles)
  async exportCommissionsCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExportAffiliateCommissionsQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.setCsvHeaders(response, 'affiliate-commissions.csv');
    return this.channelAffiliateService.exportCommissionsCsv(user, query);
  }

  @Get('commissions/aggregates')
  @Roles(...channelAffiliateViewRoles)
  listCommissionAggregates(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AffiliateCommissionAggregateQueryDto,
  ) {
    return this.channelAffiliateService.listCommissionAggregates(user, query);
  }

  @Get('commissions/aggregates/export.csv')
  @Roles(...channelAffiliateViewRoles)
  async exportCommissionAggregatesCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AffiliateCommissionAggregateQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.setCsvHeaders(response, 'affiliate-commission-aggregates.csv');
    return this.channelAffiliateService.exportCommissionAggregatesCsv(
      user,
      query,
    );
  }

  @Get('order-attributions/export.csv')
  @Roles(...channelAffiliateViewRoles)
  async exportOrderAttributionsCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExportAffiliateOrderAttributionsQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.setCsvHeaders(response, 'affiliate-order-attributions.csv');
    return this.channelAffiliateService.exportOrderAttributionsCsv(user, query);
  }

  @Get('order-attributions/aggregates')
  @Roles(...channelAffiliateViewRoles)
  listOrderAttributionAggregates(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    return this.channelAffiliateService.listOrderAttributionAggregates(
      user,
      query,
    );
  }

  @Get('order-attributions/aggregates/export.csv')
  @Roles(...channelAffiliateViewRoles)
  async exportOrderAttributionAggregatesCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AffiliateOrderAttributionAggregateQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.setCsvHeaders(response, 'affiliate-order-attribution-aggregates.csv');
    return this.channelAffiliateService.exportOrderAttributionAggregatesCsv(
      user,
      query,
    );
  }

  @Get('report-access-audits')
  @Roles('ADMIN', 'OPERATIONS')
  listReportAccessAudits(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAffiliateReportAccessAuditsQueryDto,
  ) {
    return this.channelAffiliateService.listReportAccessAudits(user, query);
  }

  @Post('links')
  @Roles(...channelAffiliateManageRoles)
  createLink(
    @Body() dto: CreateAffiliateLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAffiliateService.createLink(dto, user);
  }

  @Patch('links/:id')
  @Roles(...channelAffiliateManageRoles)
  updateLink(
    @Param('id') id: string,
    @Body() dto: UpdateAffiliateLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAffiliateService.updateLink(id, dto, user);
  }

  @Post('links/:id/qr')
  @Roles(...channelAffiliateManageRoles)
  createQrAsset(
    @Param('id') id: string,
    @Body() dto: CreateAffiliateQrAssetDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAffiliateService.createQrAsset(id, dto, user);
  }
}

@Controller('r')
export class ChannelAffiliatePublicController {
  constructor(
    private readonly channelAffiliateService: ChannelAffiliateService,
  ) {}

  @Get(':linkCode')
  @Version(VERSION_NEUTRAL)
  async redirect(
    @Param('linkCode') linkCode: string,
    @Query() query: Record<string, unknown>,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.channelAffiliateService.resolvePublicRedirect({
      linkCode,
      query,
      ipAddress:
        firstHeaderValue(request.headers['x-forwarded-for']) ?? request.ip,
      userAgent: request.get('user-agent'),
      deviceHint:
        firstHeaderValue(request.headers['x-device-hint']) ??
        stringQuery(query, 'device'),
      dedupeKey:
        firstHeaderValue(request.headers['x-affiliate-dedupe-key']) ??
        firstHeaderValue(request.headers['idempotency-key']) ??
        stringQuery(query, 'dedupeKey') ??
        stringQuery(query, 'dedupe'),
    });

    return response.redirect(302, result.redirectUrl);
  }
}

function firstHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function stringQuery(query: Record<string, unknown>, key: string) {
  const value = query[key];
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' && value[0] ? value[0] : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}
