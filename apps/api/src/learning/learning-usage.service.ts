import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChildAccessService } from '../learning-access/child-access.service';
import { ScreenTimeService } from '../screen-time/screen-time.service';
import { AppHeartbeatDto } from '../screen-time/dto/app-heartbeat.dto';
import { LearningSupportService } from './learning-support.service';

/** App usage heartbeat and today usage. */
@Injectable()
export class LearningUsageService {
  constructor(
    private readonly childAccess: ChildAccessService,
    private readonly screenTime: ScreenTimeService,
    private readonly learningSupportService: LearningSupportService,
  ) {}

  async heartbeat(
    user: AuthenticatedUser,
    childProfileId: string,
    dto: AppHeartbeatDto,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      purpose: 'learning:app-heartbeat',
    });
    return this.screenTime.heartbeat(
      childProfileId,
      dto.deviceKey,
      dto.sessionId,
    );
  }

  async getTodayUsage(
    user: AuthenticatedUser,
    childProfileId: string,
    userAgent?: string,
  ) {
    await this.learningSupportService.assertLearningAccess(
      user,
      childProfileId,
    );

    return this.learningSupportService.getUsageStatus(
      user,
      childProfileId,
      userAgent,
    );
  }
}
