import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import {
  ChannelAffiliateController,
  ChannelAffiliatePublicController,
} from './channel-affiliate.controller';
import { ChannelAffiliateService } from './channel-affiliate.service';

@Module({
  imports: [AuthModule],
  controllers: [ChannelAffiliateController, ChannelAffiliatePublicController],
  providers: [ChannelAffiliateService],
})
export class ChannelAffiliateModule {}
