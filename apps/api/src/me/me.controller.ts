import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChangePasswordDto, UpdateProfileDto } from './dto/me.dto';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getProfile(user);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getDashboard(user);
  }

  @Get('learning-profile')
  getLearningProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getLearningProfile(user);
  }

  @Get('admin-surface')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  getAdminSurface(@CurrentUser() user: AuthenticatedUser) {
    return {
      userId: user.sub,
      roles: user.roles,
      allowed: true,
      message: 'RBAC check passed for admin/director surface.',
    };
  }

  @Get('activation-orders')
  getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getMyOrders(user);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.meService.updateProfile(user, dto);
  }

  @Post('change-password')
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.meService.changePassword(user, dto);
  }
}
