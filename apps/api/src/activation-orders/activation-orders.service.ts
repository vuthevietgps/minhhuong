import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
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
import { ActivationOrderLifecycleService } from './activation-order-lifecycle.service';
import { ActivationOrderReviewService } from './activation-order-review.service';
import { FreeTrialService } from './free-trial.service';
import { ManualRefundService } from './manual-refund.service';
import { OrderCommissionService } from './order-commission.service';
import { SelfServiceOrdersService } from './self-service-orders.service';

export { MANUAL_PAID_PILOT_REFUND_WINDOW_DAYS } from './activation-order.helpers';

/**
 * Facade kept for existing consumers (controllers, jobs, other modules).
 * Each method delegates to the focused service that owns the use case.
 */
@Injectable()
export class ActivationOrdersService {
  constructor(
    private readonly selfServiceOrdersService: SelfServiceOrdersService,
    private readonly activationOrderLifecycleService: ActivationOrderLifecycleService,
    private readonly freeTrialService: FreeTrialService,
    private readonly activationOrderReviewService: ActivationOrderReviewService,
    private readonly manualRefundService: ManualRefundService,
    private readonly orderCommissionService: OrderCommissionService,
  ) {}

  listSelfServiceOptions() {
    return this.selfServiceOrdersService.listSelfServiceOptions();
  }

  listOrders(
    user: AuthenticatedUser,
    query: ListActivationOrdersQueryDto = {},
  ) {
    return this.activationOrderLifecycleService.listOrders(user, query);
  }

  getStatusHistory(orderId: string, user: AuthenticatedUser) {
    return this.activationOrderLifecycleService.getStatusHistory(orderId, user);
  }

  listMyCustomers(user: AuthenticatedUser) {
    return this.activationOrderLifecycleService.listMyCustomers(user);
  }

  createOrder(
    dto: CreateActivationOrderDto,
    saleInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
  ) {
    return this.activationOrderLifecycleService.createOrder(
      dto,
      saleInvoice,
      user,
    );
  }

  resubmitOrder(
    orderId: string,
    dto: ResubmitActivationOrderDto,
    saleInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
  ) {
    return this.activationOrderLifecycleService.resubmitOrder(
      orderId,
      dto,
      saleInvoice,
      user,
    );
  }

  cancelOrder(orderId: string, user: AuthenticatedUser) {
    return this.activationOrderLifecycleService.cancelOrder(orderId, user);
  }

  createParentSelfServiceOrder(
    user: AuthenticatedUser,
    dto: CreateParentSelfServiceOrderDto,
  ) {
    return this.selfServiceOrdersService.createParentSelfServiceOrder(
      user,
      dto,
    );
  }

  uploadParentPaymentProof(
    user: AuthenticatedUser,
    orderId: string,
    paymentProof: Express.Multer.File | undefined,
  ) {
    return this.selfServiceOrdersService.uploadParentPaymentProof(
      user,
      orderId,
      paymentProof,
    );
  }

  createSelfServiceOrder(
    dto: CreateSelfServiceActivationOrderDto,
    authenticated?: { parentId: string; childProfileId: string },
  ) {
    return this.selfServiceOrdersService.createSelfServiceOrder(
      dto,
      authenticated,
    );
  }

  /**
   * Public, no-payment entry point. The parent account stays ACTIVE after the
   * learning entitlement expires so progress and reports remain readable.
   */
  startFreeTrial(dto: StartFreeTrialDto) {
    return this.freeTrialService.startFreeTrial(dto);
  }

  listFreeTrials() {
    return this.freeTrialService.listFreeTrials();
  }

  getFreeTrialForUser(childProfileId: string, user: AuthenticatedUser) {
    return this.freeTrialService.getFreeTrialForUser(childProfileId, user);
  }

  extendFreeTrial(
    subscriptionId: string,
    dto: ExtendFreeTrialDto,
    user: AuthenticatedUser,
  ) {
    return this.freeTrialService.extendFreeTrial(subscriptionId, dto, user);
  }

  uploadSelfServicePaymentProof(
    orderId: string,
    dto: UploadSelfServicePaymentProofDto,
    paymentProof: Express.Multer.File | undefined,
  ) {
    return this.selfServiceOrdersService.uploadSelfServicePaymentProof(
      orderId,
      dto,
      paymentProof,
    );
  }

  approveOrder(
    orderId: string,
    dto: ApproveActivationOrderDto,
    operationInvoice: Express.Multer.File | undefined,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    return this.activationOrderReviewService.approveOrder(
      orderId,
      dto,
      operationInvoice,
      user,
      idempotencyKey,
    );
  }

  rejectOrder(
    orderId: string,
    dto: RejectActivationOrderDto,
    user: AuthenticatedUser,
  ) {
    return this.activationOrderReviewService.rejectOrder(orderId, dto, user);
  }

  requestManualRefund(
    orderId: string,
    dto: ManualRefundRequestDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    return this.manualRefundService.requestManualRefund(
      orderId,
      dto,
      user,
      idempotencyKey,
    );
  }

  reviewManualRefundRequest(
    orderId: string,
    dto: ReviewManualRefundRequestDto,
    user: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    return this.manualRefundService.reviewManualRefundRequest(
      orderId,
      dto,
      user,
      idempotencyKey,
    );
  }

  revokeOrder(
    orderId: string,
    dto: RevokeActivationOrderDto,
    user: AuthenticatedUser,
  ) {
    return this.activationOrderReviewService.revokeOrder(orderId, dto, user);
  }

  releasePendingCommissions(now = new Date()) {
    return this.orderCommissionService.releasePendingCommissions(now);
  }
}
