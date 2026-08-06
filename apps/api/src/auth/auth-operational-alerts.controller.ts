import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthOperationalAlertPolicyService } from './auth-operational-alert-policy';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import type { AuthenticatedUser } from './auth.types';

@Controller('auth/operational-alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPPORT')
export class AuthOperationalAlertsController {
  constructor(
    private readonly alertPolicy: AuthOperationalAlertPolicyService,
  ) {}

  @Get()
  inspect(@CurrentUser() user: AuthenticatedUser) {
    return this.alertPolicy.inspect(user);
  }
}
