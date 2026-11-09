import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { ActivationPackageAdminService } from './activation-package-admin.service';
import { AgencyApplicationsService } from './agency-applications.service';
import { AgencyManagementService } from './agency-management.service';
import { ChannelAdminAccessService } from './channel-admin-access.service';
import { ChannelAdminReportingService } from './channel-admin-reporting.service';
import { ChannelAdminService } from './channel-admin.service';
import { ChannelUserAdminService } from './channel-user-admin.service';
import { CommissionPolicyAdminService } from './commission-policy-admin.service';

/**
 * Builds ChannelAdminService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createChannelAdminServiceForTestParts(
  prisma: PrismaService,
  notification?: NotificationService,
) {
  const channelAdminAccessService = new ChannelAdminAccessService(prisma);
  const agencyApplicationsService = new AgencyApplicationsService(
    prisma,
    channelAdminAccessService,
    notification,
  );
  const agencyManagementService = new AgencyManagementService(
    prisma,
    channelAdminAccessService,
  );
  const channelUserAdminService = new ChannelUserAdminService(
    prisma,
    channelAdminAccessService,
  );
  const commissionPolicyAdminService = new CommissionPolicyAdminService(
    prisma,
    channelAdminAccessService,
  );
  const activationPackageAdminService = new ActivationPackageAdminService(
    prisma,
    channelAdminAccessService,
  );
  const channelAdminReportingService = new ChannelAdminReportingService(
    prisma,
    channelAdminAccessService,
  );
  const service = new ChannelAdminService(
    agencyApplicationsService,
    channelAdminReportingService,
    agencyManagementService,
    channelUserAdminService,
    commissionPolicyAdminService,
    activationPackageAdminService,
  );
  return {
    service,
    channelAdminAccessService,
    agencyApplicationsService,
    agencyManagementService,
    channelUserAdminService,
    commissionPolicyAdminService,
    activationPackageAdminService,
    channelAdminReportingService,
  };
}

export function createChannelAdminServiceForTest(
  prisma: PrismaService,
  notification?: NotificationService,
) {
  return createChannelAdminServiceForTestParts(prisma, notification).service;
}
