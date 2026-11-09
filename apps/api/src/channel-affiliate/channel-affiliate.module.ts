import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import {
  ChannelAffiliateController,
  ChannelAffiliatePublicController,
} from './channel-affiliate.controller';
import { ChannelAffiliateService } from './channel-affiliate.service';
import { AffiliateLinksService } from './affiliate-links.service';
import { AffiliateRedirectService } from './affiliate-redirect.service';
import { AffiliateAttributionReportService } from './affiliate-attribution-report.service';
import { AffiliateCommissionReportService } from './affiliate-commission-report.service';
import { AffiliateReportAccessAuditService } from './affiliate-report-access-audit.service';
import { AffiliateAccessService } from './affiliate-access.service';

@Module({
  imports: [AuthModule],
  controllers: [ChannelAffiliateController, ChannelAffiliatePublicController],
  providers: [
    ChannelAffiliateService,
    AffiliateLinksService,
    AffiliateRedirectService,
    AffiliateAttributionReportService,
    AffiliateCommissionReportService,
    AffiliateReportAccessAuditService,
    AffiliateAccessService,
  ],
})
export class ChannelAffiliateModule {}
