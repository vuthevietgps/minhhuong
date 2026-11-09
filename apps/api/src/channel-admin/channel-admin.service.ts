import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
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
import { ActivationPackageAdminService } from './activation-package-admin.service';
import { AgencyApplicationsService } from './agency-applications.service';
import { AgencyManagementService } from './agency-management.service';
import { ChannelAdminReportingService } from './channel-admin-reporting.service';
import { ChannelUserAdminService } from './channel-user-admin.service';
import { CommissionPolicyAdminService } from './commission-policy-admin.service';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class ChannelAdminService {
  constructor(
    private readonly agencyApplicationsService: AgencyApplicationsService,
    private readonly channelAdminReportingService: ChannelAdminReportingService,
    private readonly agencyManagementService: AgencyManagementService,
    private readonly channelUserAdminService: ChannelUserAdminService,
    private readonly commissionPolicyAdminService: CommissionPolicyAdminService,
    private readonly activationPackageAdminService: ActivationPackageAdminService,
  ) {}

  applyForAgency(dto: ApplyForAgencyDto) {
    return this.agencyApplicationsService.applyForAgency(dto);
  }

  listAgencyApplications() {
    return this.agencyApplicationsService.listAgencyApplications();
  }

  approveAgencyApplication(id: string, user: AuthenticatedUser) {
    return this.agencyApplicationsService.approveAgencyApplication(id, user);
  }

  rejectAgencyApplication(
    id: string,
    dto: ReviewAgencyApplicationDto,
    user: AuthenticatedUser,
  ) {
    return this.agencyApplicationsService.rejectAgencyApplication(
      id,
      dto,
      user,
    );
  }

  getSummary(user: AuthenticatedUser) {
    return this.channelAdminReportingService.getSummary(user);
  }

  listAgencies(user: AuthenticatedUser) {
    return this.agencyManagementService.listAgencies(user);
  }

  createAgency(dto: CreateAgencyDto, user: AuthenticatedUser) {
    return this.agencyManagementService.createAgency(dto, user);
  }

  updateAgency(
    agencyId: string,
    dto: UpdateAgencyDto,
    user: AuthenticatedUser,
  ) {
    return this.agencyManagementService.updateAgency(agencyId, dto, user);
  }

  createSaleUser(dto: CreateSaleUserDto, user: AuthenticatedUser) {
    return this.channelUserAdminService.createSaleUser(dto, user);
  }

  listUsers(user: AuthenticatedUser, query: ListUsersQueryDto) {
    return this.channelUserAdminService.listUsers(user, query);
  }

  updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    user: AuthenticatedUser,
  ) {
    return this.channelUserAdminService.updateUserStatus(userId, dto, user);
  }

  setUserPlatformRole(
    userId: string,
    dto: { role: string; action: 'add' | 'remove' },
    user: AuthenticatedUser,
  ) {
    return this.channelUserAdminService.setUserPlatformRole(userId, dto, user);
  }

  resetUserPassword(
    userId: string,
    dto: ResetUserPasswordDto,
    user: AuthenticatedUser,
  ) {
    return this.channelUserAdminService.resetUserPassword(userId, dto, user);
  }

  addAgencyMember(
    agencyId: string,
    dto: AddAgencyMemberDto,
    user: AuthenticatedUser,
  ) {
    return this.agencyManagementService.addAgencyMember(agencyId, dto, user);
  }

  updateAgencyMember(
    memberId: string,
    dto: UpdateAgencyMemberDto,
    user: AuthenticatedUser,
  ) {
    return this.agencyManagementService.updateAgencyMember(memberId, dto, user);
  }

  listCommissionPolicies() {
    return this.commissionPolicyAdminService.listCommissionPolicies();
  }

  upsertCommissionPolicy(
    dto: UpsertCommissionPolicyDto,
    user: AuthenticatedUser,
  ) {
    return this.commissionPolicyAdminService.upsertCommissionPolicy(dto, user);
  }

  updateCommissionPolicy(
    policyId: string,
    dto: UpdateCommissionPolicyDto,
    user: AuthenticatedUser,
  ) {
    return this.commissionPolicyAdminService.updateCommissionPolicy(
      policyId,
      dto,
      user,
    );
  }

  // ── Activation Packages ──────────────────────────────────────────────────
  listPackages() {
    return this.activationPackageAdminService.listPackages();
  }

  createPackage(dto: CreateActivationPackageDto, user: AuthenticatedUser) {
    return this.activationPackageAdminService.createPackage(dto, user);
  }

  updatePackage(
    packageId: string,
    dto: UpdateActivationPackageDto,
    user: AuthenticatedUser,
  ) {
    return this.activationPackageAdminService.updatePackage(
      packageId,
      dto,
      user,
    );
  }

  listPackageEntitlements(packageId: string) {
    return this.activationPackageAdminService.listPackageEntitlements(
      packageId,
    );
  }

  createPackageEntitlement(
    packageId: string,
    dto: CreatePackageEntitlementDto,
    user: AuthenticatedUser,
  ) {
    return this.activationPackageAdminService.createPackageEntitlement(
      packageId,
      dto,
      user,
    );
  }

  updatePackageEntitlement(
    packageId: string,
    entitlementId: string,
    dto: UpdatePackageEntitlementDto,
    user: AuthenticatedUser,
  ) {
    return this.activationPackageAdminService.updatePackageEntitlement(
      packageId,
      entitlementId,
      dto,
      user,
    );
  }

  getUserDetail(userId: string, user: AuthenticatedUser) {
    return this.channelUserAdminService.getUserDetail(userId, user);
  }

  listAuditLogs(
    query: {
      action?: string;
      userEmail?: string;
      entityType?: string;
      cursor?: string;
      limit?: number;
    },
    user: AuthenticatedUser,
  ) {
    return this.channelAdminReportingService.listAuditLogs(query, user);
  }
}
