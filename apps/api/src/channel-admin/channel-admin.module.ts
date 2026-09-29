import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notifications/notification.module';
import { AgencyApplicationPublicController, ChannelAdminController } from './channel-admin.controller';
import { ChannelAdminService } from './channel-admin.service';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [ChannelAdminController, AgencyApplicationPublicController],
  providers: [ChannelAdminService],
})
export class ChannelAdminModule {}
