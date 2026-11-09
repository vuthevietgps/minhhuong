import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivationOrderLifecycleService } from './activation-order-lifecycle.service';
import { ActivationOrderReviewService } from './activation-order-review.service';
import { ActivationOrderSupportService } from './activation-order-support.service';
import { ActivationOrdersService } from './activation-orders.service';
import { FreeTrialService } from './free-trial.service';
import { ManualRefundService } from './manual-refund.service';
import { OrderCommissionService } from './order-commission.service';
import { SelfServiceOrdersService } from './self-service-orders.service';

/**
 * Builds ActivationOrdersService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createActivationOrdersServiceForTestParts(
  prisma: PrismaService,
  notification: NotificationService,
) {
  const activationOrderSupportService = new ActivationOrderSupportService(
    prisma,
  );
  const orderCommissionService = new OrderCommissionService(
    prisma,
    activationOrderSupportService,
  );
  const activationOrderLifecycleService = new ActivationOrderLifecycleService(
    prisma,
    orderCommissionService,
    activationOrderSupportService,
  );
  const selfServiceOrdersService = new SelfServiceOrdersService(
    prisma,
    notification,
    orderCommissionService,
    activationOrderSupportService,
  );
  const freeTrialService = new FreeTrialService(
    prisma,
    activationOrderSupportService,
  );
  const activationOrderReviewService = new ActivationOrderReviewService(
    prisma,
    notification,
    activationOrderSupportService,
    orderCommissionService,
  );
  const manualRefundService = new ManualRefundService(
    prisma,
    activationOrderSupportService,
  );
  const service = new ActivationOrdersService(
    selfServiceOrdersService,
    activationOrderLifecycleService,
    freeTrialService,
    activationOrderReviewService,
    manualRefundService,
    orderCommissionService,
  );
  return {
    service,
    activationOrderSupportService,
    orderCommissionService,
    activationOrderLifecycleService,
    selfServiceOrdersService,
    freeTrialService,
    activationOrderReviewService,
    manualRefundService,
  };
}

export function createActivationOrdersServiceForTest(
  prisma: PrismaService,
  notification: NotificationService,
) {
  return createActivationOrdersServiceForTestParts(prisma, notification)
    .service;
}
