import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChannelAdminController } from './channel-admin.controller';
import { ChannelAdminService } from './channel-admin.service';

@Module({
  imports: [AuthModule],
  controllers: [ChannelAdminController],
  providers: [ChannelAdminService],
})
export class ChannelAdminModule {}
