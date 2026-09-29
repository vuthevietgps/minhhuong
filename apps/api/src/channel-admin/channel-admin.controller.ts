import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  channelAdminManageRoles,
  channelAdminViewRoles,
  channelMemberManageRoles,
} from '../auth/permissions';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChannelAdminService } from './channel-admin.service';
import {
  ApplyForAgencyDto,
  ReviewAgencyApplicationDto,
} from './dto/agency-application.dto';
import {
  AddAgencyMemberDto,
  CreateActivationPackageDto,
  CreateAgencyDto,
  CreatePackageEntitlementDto,
  CreateSaleUserDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateActivationPackageDto,
  UpdateAgencyDto,
  UpdateAgencyMemberDto,
  UpdateCommissionPolicyDto,
  UpdatePackageEntitlementDto,
  UpdateUserStatusDto,
  UpsertCommissionPolicyDto,
} from './dto/agency.dto';

@Controller('channel-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChannelAdminController {
  constructor(private readonly channelAdminService: ChannelAdminService) {}

  @Get('agency-applications')
  @Roles('ADMIN', 'OPERATIONS')
  listAgencyApplications() {
    return this.channelAdminService.listAgencyApplications();
  }

  @Post('agency-applications/:id/approve')
  @Roles('ADMIN', 'OPERATIONS')
  approveAgencyApplication(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.approveAgencyApplication(id, user);
  }

  @Post('agency-applications/:id/reject')
  @Roles('ADMIN', 'OPERATIONS')
  rejectAgencyApplication(
    @Param('id') id: string,
    @Body() dto: ReviewAgencyApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.rejectAgencyApplication(id, dto, user);
  }

  @Get('summary')
  @Roles(...channelAdminViewRoles)
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.channelAdminService.getSummary(user);
  }

  @Get('agencies')
  @Roles(...channelAdminViewRoles)
  listAgencies(@CurrentUser() user: AuthenticatedUser) {
    return this.channelAdminService.listAgencies(user);
  }

  @Post('agencies')
  @Roles(...channelAdminManageRoles)
  createAgency(
    @Body() dto: CreateAgencyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.createAgency(dto, user);
  }

  @Patch('agencies/:agencyId')
  @Roles(...channelAdminManageRoles)
  updateAgency(
    @Param('agencyId') agencyId: string,
    @Body() dto: UpdateAgencyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.updateAgency(agencyId, dto, user);
  }

  @Post('sale-users')
  @Roles(...channelMemberManageRoles)
  createSaleUser(
    @Body() dto: CreateSaleUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.createSaleUser(dto, user);
  }

  @Get('users')
  @Roles(...channelAdminViewRoles)
  listUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListUsersQueryDto,
  ) {
    return this.channelAdminService.listUsers(user, query);
  }

  @Get('users/:userId/detail')
  @Roles('ADMIN', 'DIRECTOR', 'OPERATIONS', 'SUPPORT')
  getUserDetail(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.getUserDetail(userId, user);
  }

  @Get('audit-logs')
  @Roles('ADMIN', 'DIRECTOR', 'OPERATIONS')
  listAuditLogs(
    @Query()
    query: {
      action?: string;
      userEmail?: string;
      entityType?: string;
      cursor?: string;
      limit?: string;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.listAuditLogs(
      { ...query, limit: query.limit ? Number(query.limit) : undefined },
      user,
    );
  }

  @Patch('users/:userId/status')
  @Roles(...channelMemberManageRoles)
  updateUserStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.updateUserStatus(userId, dto, user);
  }

  @Post('users/:userId/reset-password')
  @Roles(...channelMemberManageRoles)
  resetUserPassword(
    @Param('userId') userId: string,
    @Body() dto: ResetUserPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.resetUserPassword(userId, dto, user);
  }

  @Post('users/:userId/roles')
  @Roles('ADMIN')
  setUserPlatformRole(
    @Param('userId') userId: string,
    @Body() dto: { role: string; action: 'add' | 'remove' },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.setUserPlatformRole(userId, dto, user);
  }

  @Post('agencies/:agencyId/members')
  @Roles(...channelMemberManageRoles)
  addAgencyMember(
    @Param('agencyId') agencyId: string,
    @Body() dto: AddAgencyMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.addAgencyMember(agencyId, dto, user);
  }

  @Patch('members/:memberId')
  @Roles(...channelMemberManageRoles)
  updateAgencyMember(
    @Param('memberId') memberId: string,
    @Body() dto: UpdateAgencyMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.updateAgencyMember(memberId, dto, user);
  }

  @Get('commission-policies')
  @Roles(...channelAdminViewRoles)
  listCommissionPolicies() {
    return this.channelAdminService.listCommissionPolicies();
  }

  @Post('commission-policies')
  @Roles(...channelAdminManageRoles)
  upsertCommissionPolicy(
    @Body() dto: UpsertCommissionPolicyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.upsertCommissionPolicy(dto, user);
  }

  @Patch('commission-policies/:policyId')
  @Roles(...channelAdminManageRoles)
  updateCommissionPolicy(
    @Param('policyId') policyId: string,
    @Body() dto: UpdateCommissionPolicyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.updateCommissionPolicy(policyId, dto, user);
  }

  // ── Activation Packages ────────────────────────────────────────────────────

  @Get('packages')
  @Roles(...channelAdminViewRoles)
  listPackages() {
    return this.channelAdminService.listPackages();
  }

  @Post('packages')
  @Roles(...channelAdminManageRoles)
  createPackage(
    @Body() dto: CreateActivationPackageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.createPackage(dto, user);
  }

  @Patch('packages/:packageId')
  @Roles(...channelAdminManageRoles)
  updatePackage(
    @Param('packageId') packageId: string,
    @Body() dto: UpdateActivationPackageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.updatePackage(packageId, dto, user);
  }

  @Get('packages/:packageId/entitlements')
  @Roles(...channelAdminViewRoles)
  listPackageEntitlements(@Param('packageId') packageId: string) {
    return this.channelAdminService.listPackageEntitlements(packageId);
  }

  @Post('packages/:packageId/entitlements')
  @Roles(...channelAdminManageRoles)
  createPackageEntitlement(
    @Param('packageId') packageId: string,
    @Body() dto: CreatePackageEntitlementDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.createPackageEntitlement(
      packageId,
      dto,
      user,
    );
  }

  @Patch('packages/:packageId/entitlements/:entitlementId')
  @Roles(...channelAdminManageRoles)
  updatePackageEntitlement(
    @Param('packageId') packageId: string,
    @Param('entitlementId') entitlementId: string,
    @Body() dto: UpdatePackageEntitlementDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.channelAdminService.updatePackageEntitlement(
      packageId,
      entitlementId,
      dto,
      user,
    );
  }
}

@Controller('agency-applications')
export class AgencyApplicationPublicController {
  constructor(private readonly channelAdminService: ChannelAdminService) {}

  @Post()
  apply(@Body() dto: ApplyForAgencyDto) {
    return this.channelAdminService.applyForAgency(dto);
  }
}
