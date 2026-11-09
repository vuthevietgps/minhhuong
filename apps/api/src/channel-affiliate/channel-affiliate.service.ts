import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  AffiliateCommissionAggregateQueryDto,
  AffiliateOrderAttributionAggregateQueryDto,
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
import { AffiliateAttributionReportService } from './affiliate-attribution-report.service';
import { AffiliateCommissionReportService } from './affiliate-commission-report.service';
import { AffiliateLinksService } from './affiliate-links.service';
import {
  PublicRedirectInput,
  PublicRedirectResult,
} from './affiliate-redirect.helpers';
import { AffiliateRedirectService } from './affiliate-redirect.service';
import { AffiliateReportAccessAuditService } from './affiliate-report-access-audit.service';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class ChannelAffiliateService {
  constructor(
    private readonly affiliateLinksService: AffiliateLinksService,
    private readonly affiliateAttributionReportService: AffiliateAttributionReportService,
    private readonly affiliateCommissionReportService: AffiliateCommissionReportService,
    private readonly affiliateReportAccessAuditService: AffiliateReportAccessAuditService,
    private readonly affiliateRedirectService: AffiliateRedirectService,
  ) {}

  listLinks(user: AuthenticatedUser, query: ListAffiliateLinksQueryDto = {}) {
    return this.affiliateLinksService.listLinks(user, query);
  }

  listOrderAttributions(
    user: AuthenticatedUser,
    query: ListAffiliateOrderAttributionsQueryDto = {},
  ) {
    return this.affiliateAttributionReportService.listOrderAttributions(
      user,
      query,
    );
  }

  listCommissions(
    user: AuthenticatedUser,
    query: ListAffiliateCommissionsQueryDto = {},
  ) {
    return this.affiliateCommissionReportService.listCommissions(user, query);
  }

  exportCommissionsCsv(
    user: AuthenticatedUser,
    query: ExportAffiliateCommissionsQueryDto = {},
  ) {
    return this.affiliateCommissionReportService.exportCommissionsCsv(
      user,
      query,
    );
  }

  listCommissionAggregates(
    user: AuthenticatedUser,
    query: AffiliateCommissionAggregateQueryDto,
  ) {
    return this.affiliateCommissionReportService.listCommissionAggregates(
      user,
      query,
    );
  }

  exportCommissionAggregatesCsv(
    user: AuthenticatedUser,
    query: AffiliateCommissionAggregateQueryDto,
  ) {
    return this.affiliateCommissionReportService.exportCommissionAggregatesCsv(
      user,
      query,
    );
  }

  exportOrderAttributionsCsv(
    user: AuthenticatedUser,
    query: ExportAffiliateOrderAttributionsQueryDto = {},
  ) {
    return this.affiliateAttributionReportService.exportOrderAttributionsCsv(
      user,
      query,
    );
  }

  listOrderAttributionAggregates(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    return this.affiliateAttributionReportService.listOrderAttributionAggregates(
      user,
      query,
    );
  }

  exportOrderAttributionAggregatesCsv(
    user: AuthenticatedUser,
    query: AffiliateOrderAttributionAggregateQueryDto,
  ) {
    return this.affiliateAttributionReportService.exportOrderAttributionAggregatesCsv(
      user,
      query,
    );
  }

  listReportAccessAudits(
    user: AuthenticatedUser,
    query: ListAffiliateReportAccessAuditsQueryDto = {},
  ) {
    return this.affiliateReportAccessAuditService.listReportAccessAudits(
      user,
      query,
    );
  }

  createLink(dto: CreateAffiliateLinkDto, user: AuthenticatedUser) {
    return this.affiliateLinksService.createLink(dto, user);
  }

  updateLink(
    linkId: string,
    dto: UpdateAffiliateLinkDto,
    user: AuthenticatedUser,
  ) {
    return this.affiliateLinksService.updateLink(linkId, dto, user);
  }

  createQrAsset(
    linkId: string,
    dto: CreateAffiliateQrAssetDto,
    user: AuthenticatedUser,
  ) {
    return this.affiliateLinksService.createQrAsset(linkId, dto, user);
  }

  resolvePublicRedirect(
    input: PublicRedirectInput,
  ): Promise<PublicRedirectResult> {
    return this.affiliateRedirectService.resolvePublicRedirect(input);
  }
}
