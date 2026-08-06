import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AUTH_OPERATIONAL_ALERT_STATE } from './auth-operational-alert-state';
import type { AuthOperationalAlertState } from './auth-operational-alert-state';

@Injectable()
export class AuthOperationalAlertStateCleanupJob {
  constructor(
    @Inject(AUTH_OPERATIONAL_ALERT_STATE)
    private readonly alertState: AuthOperationalAlertState,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  cleanupExpired() {
    return this.alertState.cleanupExpired();
  }
}
