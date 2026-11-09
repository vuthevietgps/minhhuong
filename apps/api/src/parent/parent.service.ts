import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import { GrantExtraDeviceTimeDto } from './dto/grant-extra-device-time.dto';
import { UpdateChildScreenTimeDto } from './dto/update-child-screen-time.dto';
import { ParentChildrenService } from './parent-children.service';
import { LearningReportRange } from './parent-reports.helpers';
import { ParentReportsService } from './parent-reports.service';
import { ParentScreenTimeService } from './parent-screen-time.service';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class ParentService {
  constructor(
    private readonly parentChildrenService: ParentChildrenService,
    private readonly parentScreenTimeService: ParentScreenTimeService,
    private readonly parentReportsService: ParentReportsService,
  ) {}

  listChildren(user: AuthenticatedUser) {
    return this.parentChildrenService.listChildren(user);
  }

  createChild(user: AuthenticatedUser, dto: CreateChildProfileDto) {
    return this.parentChildrenService.createChild(user, dto);
  }

  deleteChild(user: AuthenticatedUser, childProfileId: string) {
    return this.parentChildrenService.deleteChild(user, childProfileId);
  }

  updateScreenTime(
    childProfileId: string,
    dto: UpdateChildScreenTimeDto,
    user: AuthenticatedUser,
  ) {
    return this.parentScreenTimeService.updateScreenTime(
      childProfileId,
      dto,
      user,
    );
  }

  grantExtraDeviceTime(
    childProfileId: string,
    dto: GrantExtraDeviceTimeDto,
    user: AuthenticatedUser,
  ) {
    return this.parentScreenTimeService.grantExtraDeviceTime(
      childProfileId,
      dto,
      user,
    );
  }

  getChildReport(
    user: AuthenticatedUser,
    childProfileId: string,
    weeks: number = 4,
  ) {
    return this.parentReportsService.getChildReport(
      user,
      childProfileId,
      weeks,
    );
  }

  getChildLearningReport(
    user: AuthenticatedUser,
    childProfileId: string,
    range: LearningReportRange = '7d',
  ) {
    return this.parentReportsService.getChildLearningReport(
      user,
      childProfileId,
      range,
    );
  }
}
