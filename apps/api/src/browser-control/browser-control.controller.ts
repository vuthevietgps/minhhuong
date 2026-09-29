import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  BrowserAttemptDto,
  BrowserMessageDto,
  BrowserPairDto,
  BrowserPolicyDto,
  BrowserSyncDto,
} from './browser-control.dto';
import { BrowserControlService } from './browser-control.service';

@Controller('parent/browser-control/:childId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
export class BrowserParentController {
  constructor(private readonly service: BrowserControlService) {}
  @Get() dashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
  ) {
    return this.service.dashboard(user.sub, childId);
  }
  @Put() save(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
    @Body() dto: BrowserPolicyDto,
  ) {
    return this.service.savePolicy(user.sub, childId, dto);
  }
  @Post('pairing') pairing(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
  ) {
    return this.service.pairing(user.sub, childId);
  }
  @Delete('devices/:deviceId') revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.service.revoke(user.sub, childId, deviceId);
  }
}

// These routes accept scoped device credentials only, never parent JWTs.
@Controller('browser-extension')
export class BrowserDeviceController {
  constructor(private readonly service: BrowserControlService) {}
  @Post('pair') pair(@Body() dto: BrowserPairDto) {
    return this.service.pair(dto);
  }
  @Post('sync') sync(
    @Headers('authorization') auth: string | undefined,
    @Body() dto: BrowserSyncDto,
  ) {
    return this.service.sync(auth, dto);
  }
  @Get('learning/:itemId') lesson(
    @Headers('authorization') auth: string | undefined,
    @Param('itemId') itemId: string,
  ) {
    return this.service.lesson(auth, itemId);
  }
  @Post('learning/:itemId/chat') chat(
    @Headers('authorization') auth: string | undefined,
    @Param('itemId') itemId: string,
    @Body() dto: BrowserMessageDto,
  ) {
    return this.service.chat(auth, itemId, dto.message);
  }
  @Post('learning/:itemId/attempt') attempt(
    @Headers('authorization') auth: string | undefined,
    @Param('itemId') itemId: string,
    @Body() dto: BrowserAttemptDto,
  ) {
    return this.service.attempt(auth, itemId, dto);
  }
}
