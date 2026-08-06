import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthOperationalAlertAuditReadService } from './auth-operational-alert-audit-read-model';
import { CurrentUser } from './current-user.decorator';
import { AuthOperationalAlertIncidentExportQueryDto } from './dto/auth-operational-alert-audit-query.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import type { AuthenticatedUser } from './auth.types';

@Controller('auth/operational-alert-audits')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPPORT')
export class AuthOperationalAlertAuditsController {
  constructor(
    private readonly auditReadService: AuthOperationalAlertAuditReadService,
  ) {}

  @Get('incident-export')
  exportIncident(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuthOperationalAlertIncidentExportQueryDto,
  ) {
    return this.auditReadService.exportIncident(user, query);
  }

  @Get(':correlationId')
  findByCorrelation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('correlationId') correlationId: string,
  ) {
    return this.auditReadService.findByCorrelation(user, correlationId);
  }
}
