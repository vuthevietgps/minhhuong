import {
  Body,
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EntitlementService } from '../entitlement/entitlement.service';
import { ChildAccessService } from '../learning-access/child-access.service';
import { UpsertLessonProgressDto } from './dto/upsert-lesson-progress.dto';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly childAccess: ChildAccessService,
    private readonly entitlement: EntitlementService,
  ) {}

  @Get('me')
  async getMyProgress(
    @Query('childProfileId') childProfileId: string = '',
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      purpose: 'progress:read-self',
    });

    return this.progressService.getUserProgress(childProfileId);
  }

  @Get('summary')
  async getSummary(
    @Query('childProfileId') childProfileId: string = '',
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      purpose: 'progress:summary-self',
    });

    return this.progressService.getSummary(childProfileId);
  }

  @Get('users/:userId')
  async getUserProgress(
    @Param('userId') userId: string,
    @Query('childProfileId') childProfileId: string = '',
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.sub !== userId && !this.canViewOtherUserProgress(user)) {
      throw new ForbiddenException('Cannot view another user progress');
    }

    if (!childProfileId) {
      throw new BadRequestException('childProfileId is required');
    }

    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      allowStaff: user.sub !== userId,
      purpose: 'progress:read-user',
    });

    return this.progressService.getUserProgress(childProfileId);
  }

  @Put('lessons')
  async upsertLessonProgress(
    @Body() dto: UpsertLessonProgressDto,
    @Query('childProfileId') childProfileId: string = '',
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      purpose: 'progress:write-lesson',
    });
    await this.entitlement.assertCapability(childProfileId, 'practice');

    return this.progressService.upsertLessonProgress(childProfileId, dto);
  }

  private canViewOtherUserProgress(user: AuthenticatedUser) {
    return user.roles.some((role) => ['ADMIN', 'SUPPORT'].includes(role));
  }
}
