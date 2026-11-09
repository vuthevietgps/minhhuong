import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChannelFinanceController } from './channel-finance.controller';
import { ChannelFinanceService } from './channel-finance.service';
import { ChannelFinanceScopeService } from './channel-finance-scope.service';
import { ChannelFinanceReportService } from './channel-finance-report.service';
import { PayoutService } from './payout.service';

@Module({
  imports: [AuthModule],
  controllers: [ChannelFinanceController],
  providers: [
    ChannelFinanceService,
    ChannelFinanceScopeService,
    ChannelFinanceReportService,
    PayoutService,
  ],
})
export class ChannelFinanceModule {}
