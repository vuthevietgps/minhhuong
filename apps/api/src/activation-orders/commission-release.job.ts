import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActivationOrdersService } from './activation-orders.service';

@Injectable()
export class CommissionReleaseJob {
  private readonly logger = new Logger(CommissionReleaseJob.name);

  constructor(
    private readonly activationOrdersService: ActivationOrdersService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async releaseEligibleCommissions() {
    const result =
      await this.activationOrdersService.releasePendingCommissions();
    if (result.checked > 0) {
      this.logger.log(
        `Commission release checked=${result.checked} released=${result.released} canceled=${result.canceled} heldForRefundReview=${result.heldForRefundReview}`,
      );
    }
  }
}
