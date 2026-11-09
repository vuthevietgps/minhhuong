import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AffiliateAccessService } from './affiliate-access.service';
import { AffiliateAttributionReportService } from './affiliate-attribution-report.service';
import { AffiliateCommissionReportService } from './affiliate-commission-report.service';
import { AffiliateLinksService } from './affiliate-links.service';
import { AffiliateRedirectService } from './affiliate-redirect.service';
import { AffiliateReportAccessAuditService } from './affiliate-report-access-audit.service';
import { ChannelAffiliateService } from './channel-affiliate.service';

/**
 * Builds ChannelAffiliateService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createChannelAffiliateServiceForTestParts(
  prisma: PrismaService,
  config: ConfigService,
) {
  const affiliateAccessService = new AffiliateAccessService(prisma);
  const affiliateLinksService = new AffiliateLinksService(
    prisma,
    config,
    affiliateAccessService,
  );
  const affiliateRedirectService = new AffiliateRedirectService(prisma, config);
  const affiliateReportAccessAuditService =
    new AffiliateReportAccessAuditService(prisma);
  const affiliateAttributionReportService =
    new AffiliateAttributionReportService(
      prisma,
      affiliateReportAccessAuditService,
      affiliateAccessService,
    );
  const affiliateCommissionReportService = new AffiliateCommissionReportService(
    prisma,
    affiliateReportAccessAuditService,
    affiliateAccessService,
  );
  const service = new ChannelAffiliateService(
    affiliateLinksService,
    affiliateAttributionReportService,
    affiliateCommissionReportService,
    affiliateReportAccessAuditService,
    affiliateRedirectService,
  );
  return {
    service,
    affiliateAccessService,
    affiliateLinksService,
    affiliateRedirectService,
    affiliateReportAccessAuditService,
    affiliateAttributionReportService,
    affiliateCommissionReportService,
  };
}

export function createChannelAffiliateServiceForTest(
  prisma: PrismaService,
  config: ConfigService,
) {
  return createChannelAffiliateServiceForTestParts(prisma, config).service;
}
