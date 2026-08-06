import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  listPlans() {
    return this.billingService.listPlans();
  }

  @Get('me/subscription')
  @UseGuards(JwtAuthGuard)
  getMyCurrentSubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getCurrentSubscription(user.sub);
  }

  @Get('me/wallet')
  @UseGuards(JwtAuthGuard)
  getMyWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getWallet(user.sub);
  }

  @Get('users/:userId/subscription')
  @UseGuards(JwtAuthGuard)
  getCurrentSubscription(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.assertCanReadUserBilling(user, userId);

    return this.billingService.getCurrentSubscription(userId);
  }

  @Get('users/:userId/wallet')
  @UseGuards(JwtAuthGuard)
  getWallet(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.assertCanReadUserBilling(user, userId);

    return this.billingService.getWallet(userId);
  }

  private assertCanReadUserBilling(
    user: AuthenticatedUser,
    targetUserId: string,
  ) {
    if (user.sub === targetUserId) {
      return;
    }

    if (user.roles.some((role) => ['ADMIN', 'SUPPORT'].includes(role))) {
      return;
    }

    throw new ForbiddenException('Cannot read billing data for another user');
  }
}
