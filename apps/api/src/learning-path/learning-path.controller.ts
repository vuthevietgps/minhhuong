import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  contentManageRoles,
  contentPublishRoles,
  contentViewRoles,
} from '../auth/permissions';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  AddLearningPathItemDto,
  AssignContentPackageDto,
  CreateContentPackageDto,
  CreateLearningPathDto,
  UpdateLearningPathDto,
  UpdateLearningPathItemDto,
} from './dto/learning-path.dto';
import { LearningPathService } from './learning-path.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  @Get('admin/learning-paths')
  @Roles(...contentViewRoles)
  listLearningPaths() {
    return this.learningPathService.listLearningPaths();
  }

  @Post('admin/learning-paths')
  @Roles(...contentManageRoles)
  createLearningPath(
    @Body() dto: CreateLearningPathDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.createLearningPath(dto, user);
  }

  @Get('admin/learning-paths/:pathId')
  @Roles(...contentViewRoles)
  getLearningPath(@Param('pathId') pathId: string) {
    return this.learningPathService.getLearningPath(pathId);
  }

  @Patch('admin/learning-paths/:pathId')
  @Roles(...contentManageRoles)
  updateLearningPath(
    @Param('pathId') pathId: string,
    @Body() dto: UpdateLearningPathDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.updateLearningPath(pathId, dto, user);
  }

  @Post('admin/learning-paths/:pathId/items')
  @Roles(...contentManageRoles)
  addLearningPathItem(
    @Param('pathId') pathId: string,
    @Body() dto: AddLearningPathItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.addLearningPathItem(pathId, dto, user);
  }

  @Patch('admin/learning-paths/:pathId/items/:itemId')
  @Roles(...contentManageRoles)
  updateLearningPathItem(
    @Param('pathId') pathId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateLearningPathItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.updateLearningPathItem(
      pathId,
      itemId,
      dto,
      user,
    );
  }

  @Delete('admin/learning-paths/:pathId/items/:itemId')
  @Roles(...contentManageRoles)
  deleteLearningPathItem(
    @Param('pathId') pathId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.deleteLearningPathItem(
      pathId,
      itemId,
      user,
    );
  }

  @Post('admin/learning-paths/:pathId/submit-review')
  @Roles(...contentManageRoles)
  submitLearningPathForReview(
    @Param('pathId') pathId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.submitLearningPathForReview(pathId, user);
  }

  @Post('admin/learning-paths/:pathId/publish')
  @Roles(...contentPublishRoles)
  publishLearningPath(
    @Param('pathId') pathId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.publishLearningPath(pathId, user);
  }

  @Post('admin/learning-paths/:pathId/archive')
  @Roles(...contentManageRoles)
  archiveLearningPath(
    @Param('pathId') pathId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.archiveLearningPath(pathId, user);
  }

  @Get('admin/content-packages')
  @Roles(...contentViewRoles)
  listContentPackages() {
    return this.learningPathService.listContentPackages();
  }

  @Post('admin/content-packages')
  @Roles(...contentManageRoles)
  createContentPackage(
    @Body() dto: CreateContentPackageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.createContentPackage(dto, user);
  }

  @Post('admin/content-packages/:packageId/publish')
  @Roles(...contentPublishRoles)
  publishContentPackage(
    @Param('packageId') packageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.publishContentPackage(packageId, user);
  }

  @Post('admin/content-packages/:packageId/archive')
  @Roles(...contentManageRoles)
  archiveContentPackage(
    @Param('packageId') packageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.archiveContentPackage(packageId, user);
  }

  @Get('admin/children/:childProfileId/content-assignment')
  @Roles('ADMIN', 'SUPPORT')
  getAdminChildAssignment(
    @Param('childProfileId') childProfileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.getActiveAssignmentForChild(
      childProfileId,
      user,
      {
        allowStaff: true,
      },
    );
  }

  @Post('admin/children/:childProfileId/content-assignments')
  @Roles('ADMIN', 'SUPPORT')
  assignChildContentPackage(
    @Param('childProfileId') childProfileId: string,
    @Body() dto: AssignContentPackageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.assignContentPackageToChild(
      childProfileId,
      dto,
      user,
    );
  }

  @Get('parent/children/:childProfileId/content-assignment')
  @Roles('PARENT')
  getParentChildAssignment(
    @Param('childProfileId') childProfileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningPathService.getActiveAssignmentForChild(
      childProfileId,
      user,
    );
  }
}
