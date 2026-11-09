import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  activationOrderCreateRoles,
  activationOrderResubmitRoles,
  activationOrderReviewRoles,
  activationOrderViewRoles,
} from '../auth/permissions';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { filesystemUploadSurfaces } from '../upload-storage/filesystem-upload-storage';
import { createProviderUploadStorage } from '../upload-storage/provider-upload-storage';
import { ActivationOrdersService } from './activation-orders.service';
import { ApproveActivationOrderDto } from './dto/approve-activation-order.dto';
import { CreateActivationOrderDto } from './dto/create-activation-order.dto';
import {
  CreateParentSelfServiceOrderDto,
  CreateSelfServiceActivationOrderDto,
  UploadSelfServicePaymentProofDto,
} from './dto/create-self-service-activation-order.dto';
import { ListActivationOrdersQueryDto } from './dto/list-activation-orders-query.dto';
import {
  ManualRefundRequestDto,
  ReviewManualRefundRequestDto,
} from './dto/manual-refund-request.dto';
import { RejectActivationOrderDto } from './dto/reject-activation-order.dto';
import { ResubmitActivationOrderDto } from './dto/resubmit-activation-order.dto';
import { RevokeActivationOrderDto } from './dto/revoke-activation-order.dto';
import { ExtendFreeTrialDto } from './dto/extend-free-trial.dto';
import { StartFreeTrialDto } from './dto/start-free-trial.dto';

const allowedInvoiceMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const invoiceUploadOptions = {
  storage: createProviderUploadStorage(
    filesystemUploadSurfaces.activationOrderInvoice,
  ),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    callback(null, allowedInvoiceMimeTypes.has(file.mimetype));
  },
};

@Controller('activation-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivationOrdersController {
  constructor(private readonly ordersService: ActivationOrdersService) {}

  @Get()
  @Roles(...activationOrderViewRoles)
  listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListActivationOrdersQueryDto,
  ) {
    return this.ordersService.listOrders(user, query);
  }

  @Get('my-customers')
  @Roles(...activationOrderCreateRoles)
  listMyCustomers(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.listMyCustomers(user);
  }

  @Get('trials')
  @Roles('ADMIN', 'DIRECTOR', 'OPERATIONS')
  listFreeTrials() {
    return this.ordersService.listFreeTrials();
  }

  @Get('trials/:childProfileId')
  @Roles('PARENT', 'ADMIN', 'DIRECTOR', 'OPERATIONS')
  getFreeTrial(
    @Param('childProfileId') childProfileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.getFreeTrialForUser(childProfileId, user);
  }

  @Post('trials/:subscriptionId/extend')
  @Roles('ADMIN', 'DIRECTOR', 'OPERATIONS')
  extendFreeTrial(
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: ExtendFreeTrialDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.extendFreeTrial(subscriptionId, dto, user);
  }

  @Get(':orderId/status-history')
  @Roles(...activationOrderViewRoles)
  getStatusHistory(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.getStatusHistory(orderId, user);
  }

  @Post()
  @Roles(...activationOrderCreateRoles)
  @UseInterceptors(FileInterceptor('saleInvoice', invoiceUploadOptions))
  createOrder(
    @UploadedFile() saleInvoice: Express.Multer.File | undefined,
    @Body() dto: CreateActivationOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.createOrder(dto, saleInvoice, user);
  }

  @Post(':orderId/resubmit')
  @Roles(...activationOrderResubmitRoles)
  @UseInterceptors(FileInterceptor('saleInvoice', invoiceUploadOptions))
  resubmitOrder(
    @Param('orderId') orderId: string,
    @UploadedFile() saleInvoice: Express.Multer.File | undefined,
    @Body() dto: ResubmitActivationOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.resubmitOrder(orderId, dto, saleInvoice, user);
  }

  @Post(':orderId/approve')
  @Roles(...activationOrderReviewRoles)
  @UseInterceptors(FileInterceptor('operationInvoice', invoiceUploadOptions))
  approveOrder(
    @Param('orderId') orderId: string,
    @UploadedFile() operationInvoice: Express.Multer.File | undefined,
    @Body() dto: ApproveActivationOrderDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.approveOrder(
      orderId,
      dto,
      operationInvoice,
      user,
      idempotencyKey,
    );
  }

  @Post(':orderId/reject')
  @Roles(...activationOrderReviewRoles)
  rejectOrder(
    @Param('orderId') orderId: string,
    @Body() dto: RejectActivationOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.rejectOrder(orderId, dto, user);
  }

  @Post(':orderId/refund-request')
  @Roles(...activationOrderReviewRoles)
  requestManualRefund(
    @Param('orderId') orderId: string,
    @Body() dto: ManualRefundRequestDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.requestManualRefund(
      orderId,
      dto,
      user,
      idempotencyKey,
    );
  }

  @Post(':orderId/refund-request/review')
  @Roles(...activationOrderReviewRoles)
  reviewManualRefundRequest(
    @Param('orderId') orderId: string,
    @Body() dto: ReviewManualRefundRequestDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.reviewManualRefundRequest(
      orderId,
      dto,
      user,
      idempotencyKey,
    );
  }

  @Post(':orderId/cancel')
  @Roles(...activationOrderResubmitRoles)
  cancelOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.cancelOrder(orderId, user);
  }

  @Post(':orderId/revoke')
  @Roles(...activationOrderReviewRoles)
  revokeOrder(
    @Param('orderId') orderId: string,
    @Body() dto: RevokeActivationOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.revokeOrder(orderId, dto, user);
  }
}

@Controller('activation-orders/self-service')
export class SelfServiceActivationOrdersController {
  constructor(private readonly ordersService: ActivationOrdersService) {}

  @Get('options')
  listOptions() {
    return this.ordersService.listSelfServiceOptions();
  }

  @Post()
  createSelfServiceOrder(@Body() dto: CreateSelfServiceActivationOrderDto) {
    return this.ordersService.createSelfServiceOrder(dto);
  }

  @Post('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  createParentOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateParentSelfServiceOrderDto,
  ) {
    return this.ordersService.createParentSelfServiceOrder(user, dto);
  }

  @Post('parent/:orderId/payment-proof')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  @UseInterceptors(FileInterceptor('paymentProof', invoiceUploadOptions))
  uploadParentPaymentProof(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @UploadedFile() paymentProof: Express.Multer.File | undefined,
  ) {
    return this.ordersService.uploadParentPaymentProof(
      user,
      orderId,
      paymentProof,
    );
  }

  @Post('trial')
  startFreeTrial(@Body() dto: StartFreeTrialDto) {
    return this.ordersService.startFreeTrial(dto);
  }

  @Post(':orderId/payment-proof')
  @UseInterceptors(FileInterceptor('paymentProof', invoiceUploadOptions))
  uploadPaymentProof(
    @Param('orderId') orderId: string,
    @UploadedFile() paymentProof: Express.Multer.File | undefined,
    @Body() dto: UploadSelfServicePaymentProofDto,
  ) {
    return this.ordersService.uploadSelfServicePaymentProof(
      orderId,
      dto,
      paymentProof,
    );
  }
}
