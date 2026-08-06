import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notifications/notification.module';
import { CommissionReleaseJob } from './commission-release.job';
import {
  ActivationOrdersController,
  SelfServiceActivationOrdersController,
} from './activation-orders.controller';
import { ActivationOrdersService } from './activation-orders.service';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [
    ActivationOrdersController,
    SelfServiceActivationOrdersController,
  ],
  providers: [ActivationOrdersService, CommissionReleaseJob],
})
export class ActivationOrdersModule {}
