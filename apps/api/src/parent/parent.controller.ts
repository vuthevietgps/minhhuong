import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import { GrantExtraDeviceTimeDto } from './dto/grant-extra-device-time.dto';
import { UpdateChildScreenTimeDto } from './dto/update-child-screen-time.dto';
import { ParentService } from './parent.service';

@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('children')
  listChildren(@CurrentUser() user: AuthenticatedUser) {
    return this.parentService.listChildren(user);
  }

  @Post('children')
  createChild(
    @Body() dto: CreateChildProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parentService.createChild(user, dto);
  }

  @Delete('children/:childProfileId')
  deleteChild(
    @Param('childProfileId') childProfileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parentService.deleteChild(user, childProfileId);
  }

  @Patch('children/:childProfileId/screen-time')
  updateScreenTime(
    @Param('childProfileId') childProfileId: string,
    @Body() dto: UpdateChildScreenTimeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parentService.updateScreenTime(childProfileId, dto, user);
  }

  @Post('children/:childProfileId/device-time-grants')
  grantExtraDeviceTime(
    @Param('childProfileId') childProfileId: string,
    @Body() dto: GrantExtraDeviceTimeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parentService.grantExtraDeviceTime(childProfileId, dto, user);
  }

  @Get('children/:childProfileId/report')
  getChildReport(
    @Param('childProfileId') childProfileId: string,
    @Query('weeks', new ParseIntPipe({ optional: true })) weeks: number = 4,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parentService.getChildReport(user, childProfileId, weeks);
  }

  @Get('children/:childProfileId/learning-report')
  getChildLearningReport(
    @Param('childProfileId') childProfileId: string,
    @Query('range') range: '7d' | '30d' = '7d',
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parentService.getChildLearningReport(
      user,
      childProfileId,
      range,
    );
  }
}
