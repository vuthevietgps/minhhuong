import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  BrowserComboDto,
  BrowserImportDto,
  BrowserRetryImportDto,
} from './browser-content.dto';
import { BrowserContentService } from './browser-content.service';

@Controller('parent/browser-control/:childId/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
export class BrowserContentController {
  constructor(private readonly service: BrowserContentService) {}
  @Get('combos') combos(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
  ) {
    return this.service.combos(user.sub, childId);
  }
  @Post('combos/:comboId') combo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
    @Param('comboId') comboId: string,
    @Body() dto: BrowserComboDto,
  ) {
    return this.service.queueCombo(user.sub, childId, comboId, dto.minutes);
  }
  @Get('imports') list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
  ) {
    return this.service.list(user.sub, childId);
  }
  @Post('imports') import(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
    @Body() dto: BrowserImportDto,
  ) {
    return this.service.importLink(user, childId, dto);
  }
  @Post('imports/:id/retry') retry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
    @Param('id') id: string,
    @Body() dto: BrowserRetryImportDto,
  ) {
    return this.service.retry(user, childId, id, dto);
  }
  @Delete('imports/:id') remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(user.sub, childId, id);
  }
}
