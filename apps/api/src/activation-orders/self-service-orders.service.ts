import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { toIdempotencyJson } from '../commercial-idempotency';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateParentSelfServiceOrderDto,
  CreateSelfServiceActivationOrderDto,
  UploadSelfServicePaymentProofDto,
} from './dto/create-self-service-activation-order.dto';
import {
  buildPackageEntitlementSnapshot,
  type SnapshotActivationPackage,
  toPrismaJson,
} from '../package-entitlement/package-entitlement-snapshot';
import { ActivationOrderSupportService } from './activation-order-support.service';
import {
  SelfServicePackage,
  assertManualPaidPilotSingleChildAllocation,
  bankTransferInfo,
  fallbackPackages,
  invoiceUrl,
  orderInclude,
  toAffiliateAttributionJson,
  toCommissionChainSnapshotJson,
} from './activation-order.helpers';
import { OrderCommissionService } from './order-commission.service';

/** Parent self-service orders and payment proof uploads. */
@Injectable()
export class SelfServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly orderCommissionService: OrderCommissionService,
    private readonly activationOrderSupportService: ActivationOrderSupportService,
  ) {}

  async listSelfServiceOptions() {
    const dbPackages = await this.prisma.activationPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        code: true,
        name: true,
        amountVnd: true,
        durationDays: true,
        description: true,
      },
    });
    const packages = dbPackages.length > 0 ? dbPackages : fallbackPackages;
    return {
      packages,
      bankTransfer: bankTransferInfo(),
    };
  }

  async createParentSelfServiceOrder(
    user: AuthenticatedUser,
    dto: CreateParentSelfServiceOrderDto,
  ) {
    const parent = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, email: true, status: true },
    });
    if (!parent || parent.status !== 'ACTIVE') {
      throw new BadRequestException('Parent account is unavailable');
    }
    const child = await this.prisma.childProfile.findFirst({
      where: { id: dto.childProfileId, parentId: parent.id },
      select: { id: true },
    });
    if (!child) throw new NotFoundException('Child profile not found');
    return this.createSelfServiceOrder(
      {
        ...dto,
        email: parent.email,
        password: '',
      },
      { parentId: parent.id, childProfileId: child.id },
    );
  }

  async uploadParentPaymentProof(
    user: AuthenticatedUser,
    orderId: string,
    paymentProof: Express.Multer.File | undefined,
  ) {
    const order = await this.prisma.activationOrder.findFirst({
      where: { id: orderId, userId: user.sub, source: 'SELF_SERVICE' },
      select: { customerEmail: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.uploadSelfServicePaymentProof(
      orderId,
      { email: order.customerEmail },
      paymentProof,
    );
  }

  async createSelfServiceOrder(
    dto: CreateSelfServiceActivationOrderDto,
    authenticated?: { parentId: string; childProfileId: string },
  ) {
    // Check DB packages first, fall back to hardcoded list
    const dbPackages: (SelfServicePackage & SnapshotActivationPackage)[] =
      await this.prisma.activationPackage
        .findMany({
          where: { isActive: true },
          include: {
            entitlements: {
              where: { status: 'ACTIVE' },
              orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
            },
          },
        })
        .catch(() => []);
    const selectedDbPackage = dbPackages.find(
      (item) => item.code === dto.packageCode,
    );
    const selectedFallbackPackage =
      dbPackages.length === 0
        ? fallbackPackages.find((item) => item.code === dto.packageCode)
        : undefined;
    const selectedPackage = selectedDbPackage ?? selectedFallbackPackage;
    if (!selectedPackage) {
      throw new BadRequestException('Invalid package');
    }
    const entitlementSnapshot = buildPackageEntitlementSnapshot({
      activationPackage: selectedDbPackage ?? null,
      fallbackPackageCode: selectedPackage.code,
      fallbackPackageName: selectedPackage.name,
      soldAmountVnd: selectedPackage.amountVnd,
      soldDurationDays: selectedPackage.durationDays,
      customPackage: !selectedDbPackage,
    });
    const childAllocationGate =
      assertManualPaidPilotSingleChildAllocation(entitlementSnapshot);
    const baseAttribution =
      await this.orderCommissionService.resolveChannelAttribution(
        dto.referralCode,
      );
    const affiliateResolution =
      await this.orderCommissionService.resolveAffiliateClickAttribution(
        dto.affiliateClickId,
        baseAttribution,
      );
    const attribution = affiliateResolution.attribution;
    const commissionChainSnapshot =
      affiliateResolution.snapshot && attribution.participant
        ? await this.orderCommissionService.buildCommissionChainSnapshot(
            attribution.participant,
            affiliateResolution.snapshot,
          )
        : null;

    const email = dto.email.trim().toLowerCase();
    const parent = authenticated
      ? { id: authenticated.parentId }
      : await this.activationOrderSupportService.upsertParentAccount(
          { password: dto.password },
          email,
        );

    // Create or find a child profile for this parent
    const childName = dto.displayName?.trim() || 'Con';
    const childProfile = authenticated
      ? { id: authenticated.childProfileId }
      : await this.prisma.childProfile.upsert({
          where: {
            id:
              (
                await this.prisma.childProfile.findFirst({
                  where: { parentId: parent.id },
                  select: { id: true },
                  orderBy: { createdAt: 'asc' },
                })
              )?.id ?? 'none',
          },
          update: {},
          create: { parentId: parent.id, displayName: childName },
        });

    const bankTransfer = bankTransferInfo();
    const transferContent = await this.uniqueTransferContent();

    const order = await this.prisma.activationOrder.create({
      data: {
        userId: parent.id,
        childProfileId: childProfile.id,
        channelParticipantId: attribution.participant?.id,
        agencyId: attribution.agency?.id,
        referrerMemberId: attribution.member?.id,
        source: 'SELF_SERVICE',
        status: 'WAITING_PAYMENT',
        customerEmail: email,
        amountCents: selectedPackage.amountVnd * 100,
        currency: 'VND',
        packageCode: selectedPackage.code,
        packageName: selectedPackage.name,
        requestedDurationDays: selectedPackage.durationDays,
        entitlementSnapshotJson: toPrismaJson(entitlementSnapshot),
        ...(affiliateResolution.snapshot
          ? {
              affiliateAttributionSnapshotJson: toAffiliateAttributionJson(
                affiliateResolution.snapshot,
              ),
              commissionChainSnapshotJson: toCommissionChainSnapshotJson(
                commissionChainSnapshot!,
              ),
            }
          : {}),
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: 'WAITING_PAYMENT',
            action: 'CREATE_SELF_SERVICE',
            actorUserId: parent.id,
            reason: dto.notes ?? null,
            metadataJson: toIdempotencyJson({
              source: 'SELF_SERVICE',
              packageCode: selectedPackage.code,
              packageName: selectedPackage.name,
              amountCents: selectedPackage.amountVnd * 100,
              requestedDurationDays: selectedPackage.durationDays,
              hasTransferContent: Boolean(transferContent),
              channelParticipantId: attribution.participant?.id ?? null,
              agencyId: attribution.agency?.id ?? null,
              referrerMemberId: attribution.member?.id ?? null,
              affiliateClickId: affiliateResolution.snapshot?.clickId ?? null,
              affiliateAttributionSource:
                affiliateResolution.snapshot?.source ?? null,
              manualPaidPilotChildAllocationGate: childAllocationGate,
            }),
          },
        },
        bankName: bankTransfer.bankName,
        bankAccountNumber: bankTransfer.accountNumber,
        bankAccountName: bankTransfer.accountName,
        transferContent,
        notes: dto.notes,
      },
      include: orderInclude(),
    });

    await this.activationOrderSupportService.auditSystem(
      'activation_order.self_service.create',
      order.id,
      {
        customerEmail: email,
        packageCode: selectedPackage.code,
        amountCents: order.amountCents,
      },
    );

    void this.notification.sendOrderCreated({
      to: email,
      packageName: selectedPackage.name,
      amountCents: order.amountCents,
      currency: 'VND',
      bankName: bankTransfer.bankName,
      bankAccountNumber: bankTransfer.accountNumber,
      bankAccountName: bankTransfer.accountName,
      transferContent,
    });

    return {
      order,
      bankTransfer,
    };
  }

  async uploadSelfServicePaymentProof(
    orderId: string,
    dto: UploadSelfServicePaymentProofDto,
    paymentProof: Express.Multer.File | undefined,
  ) {
    if (!paymentProof) {
      throw new BadRequestException('Payment proof file is required');
    }

    const order = await this.prisma.activationOrder.findUnique({
      where: { id: orderId },
    });
    if (!order || order.source !== 'SELF_SERVICE') {
      throw new NotFoundException('Self-service order not found');
    }

    if (order.customerEmail !== dto.email.trim().toLowerCase()) {
      throw new BadRequestException('Order email does not match');
    }

    if (!['WAITING_PAYMENT', 'PENDING_REVIEW'].includes(order.status)) {
      throw new BadRequestException(
        'Only waiting payment orders can receive payment proof',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.activationOrder.updateMany({
        where: {
          id: orderId,
          status: { in: ['WAITING_PAYMENT', 'PENDING_REVIEW'] },
        },
        data: {
          status: 'PENDING_REVIEW',
          saleInvoiceUrl: invoiceUrl(paymentProof),
          saleInvoiceStorageKey: `invoices/${paymentProof.filename}`,
          saleInvoiceMimeType: paymentProof.mimetype,
          saleInvoiceFileSizeBytes: paymentProof.size,
        },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'Only waiting payment orders can receive payment proof',
        );
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'PENDING_REVIEW',
          action: 'UPLOAD_PAYMENT_PROOF',
          actorUserId: order.userId,
          reason: null,
          metadataJson: toIdempotencyJson({
            previousStatus: order.status,
            saleInvoiceStorageKey: `invoices/${paymentProof.filename}`,
            saleInvoiceMimeType: paymentProof.mimetype,
            saleInvoiceFileSizeBytes: paymentProof.size,
          }),
        },
      });

      return tx.activationOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: orderInclude(),
      });
    });

    await this.activationOrderSupportService.auditSystem(
      'activation_order.self_service.payment_proof',
      order.id,
      {
        customerEmail: order.customerEmail,
      },
    );

    return updated;
  }

  private async uniqueTransferContent() {
    const prefix = bankTransferInfo()
      .notePrefix.replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const value = `${prefix || 'MH'}${Date.now().toString(36).toUpperCase()}${randomUUID().slice(0, 4).toUpperCase()}`;
      const existing = await this.prisma.activationOrder.findFirst({
        where: { transferContent: value },
      });

      if (!existing) {
        return value;
      }
    }

    return `${prefix || 'MH'}${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  }
}
