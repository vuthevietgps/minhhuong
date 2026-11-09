import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notifications/notification.module';
import { CommissionReleaseJob } from './commission-release.job';
import {
  ActivationOrdersController,
  SelfServiceActivationOrdersController,
} from './activation-orders.controller';
import { ActivationOrderLifecycleService } from './activation-order-lifecycle.service';
import { ActivationOrderReviewService } from './activation-order-review.service';
import { ActivationOrderSupportService } from './activation-order-support.service';
import { ActivationOrdersService } from './activation-orders.service';
import { FreeTrialService } from './free-trial.service';
import { ManualRefundService } from './manual-refund.service';
import { OrderCommissionService } from './order-commission.service';
import { SelfServiceOrdersService } from './self-service-orders.service';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [
    ActivationOrdersController,
    SelfServiceActivationOrdersController,
  ],
  providers: [
    ActivationOrdersService,
    ActivationOrderSupportService,
    OrderCommissionService,
    ActivationOrderLifecycleService,
    SelfServiceOrdersService,
    FreeTrialService,
    ActivationOrderReviewService,
    ManualRefundService,
    CommissionReleaseJob,
  ],
})
export class ActivationOrdersModule {}
