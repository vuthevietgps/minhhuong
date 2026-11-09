import { PrismaService } from '../prisma/prisma.service';
import { ChannelFinanceReportService } from './channel-finance-report.service';
import { ChannelFinanceScopeService } from './channel-finance-scope.service';
import { ChannelFinanceService } from './channel-finance.service';
import { PayoutService } from './payout.service';

/**
 * Builds ChannelFinanceService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createChannelFinanceServiceForTestParts(prisma: PrismaService) {
  const channelFinanceScopeService = new ChannelFinanceScopeService(prisma);
  const channelFinanceReportService = new ChannelFinanceReportService(
    prisma,
    channelFinanceScopeService,
  );
  const payoutService = new PayoutService(prisma, channelFinanceScopeService);
  const service = new ChannelFinanceService(
    channelFinanceReportService,
    payoutService,
  );
  return {
    service,
    channelFinanceScopeService,
    channelFinanceReportService,
    payoutService,
  };
}

export function createChannelFinanceServiceForTest(prisma: PrismaService) {
  return createChannelFinanceServiceForTestParts(prisma).service;
}
