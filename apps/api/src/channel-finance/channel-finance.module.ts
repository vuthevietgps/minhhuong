import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChannelFinanceController } from './channel-finance.controller';
import { ChannelFinanceService } from './channel-finance.service';

@Module({
  imports: [AuthModule],
  controllers: [ChannelFinanceController],
  providers: [ChannelFinanceService],
})
export class ChannelFinanceModule {}
