import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notifications/notification.module';
import {
  AgencyApplicationPublicController,
  ChannelAdminController,
} from './channel-admin.controller';
import { ChannelAdminService } from './channel-admin.service';
import { ChannelAdminAccessService } from './channel-admin-access.service';
import { AgencyApplicationsService } from './agency-applications.service';
import { AgencyManagementService } from './agency-management.service';
import { ChannelUserAdminService } from './channel-user-admin.service';
import { CommissionPolicyAdminService } from './commission-policy-admin.service';
import { ActivationPackageAdminService } from './activation-package-admin.service';
import { ChannelAdminReportingService } from './channel-admin-reporting.service';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [ChannelAdminController, AgencyApplicationPublicController],
  providers: [
    ChannelAdminService,
    ChannelAdminAccessService,
    AgencyApplicationsService,
    AgencyManagementService,
    ChannelUserAdminService,
    CommissionPolicyAdminService,
    ActivationPackageAdminService,
    ChannelAdminReportingService,
  ],
})
export class ChannelAdminModule {}
