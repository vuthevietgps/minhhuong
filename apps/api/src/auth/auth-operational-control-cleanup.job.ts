import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AUTH_OPERATIONAL_CONTROL } from './auth-operational-control';
import type { AuthOperationalControl } from './auth-operational-control';

@Injectable()
export class AuthOperationalControlCleanupJob {
  constructor(
    @Inject(AUTH_OPERATIONAL_CONTROL)
    private readonly operationalControl: AuthOperationalControl,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  cleanupExpired() {
    return this.operationalControl.cleanupExpired();
  }
}
