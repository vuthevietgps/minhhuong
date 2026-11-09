import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateActivationPackageDto,
  CreatePackageEntitlementDto,
  UpdateActivationPackageDto,
  UpdatePackageEntitlementDto,
} from './dto/agency.dto';
import { ChannelAdminAccessService } from './channel-admin-access.service';

/** Activation packages and package entitlements. */
@Injectable()
export class ActivationPackageAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelAdminAccessService: ChannelAdminAccessService,
  ) {}

  // ── Activation Packages ──────────────────────────────────────────────────
  listPackages() {
    return this.prisma.activationPackage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        entitlements: {
          orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  async createPackage(
    dto: CreateActivationPackageDto,
    user: AuthenticatedUser,
  ) {
    const code = dto.code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, '-');
    const pkg = await this.prisma.activationPackage.create({
      data: {
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        amountVnd: dto.amountVnd,
        durationDays: dto.durationDays,
        isActive: true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.package.create',
      'ActivationPackage',
      pkg.id,
      { code },
    );
    return pkg;
  }

  async updatePackage(
    packageId: string,
    dto: UpdateActivationPackageDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.activationPackage.findUnique({
      where: { id: packageId },
    });
    if (!existing) {
      throw new NotFoundException('Package not found');
    }
    const bumpsVersion =
      dto.name !== undefined ||
      dto.description !== undefined ||
      dto.amountVnd !== undefined ||
      dto.durationDays !== undefined ||
      dto.isActive !== undefined;
    const pkg = await this.prisma.activationPackage.update({
      where: { id: packageId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.amountVnd !== undefined ? { amountVnd: dto.amountVnd } : {}),
        ...(dto.durationDays !== undefined
          ? { durationDays: dto.durationDays }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(bumpsVersion ? { version: { increment: 1 } } : {}),
      },
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.package.update',
      'ActivationPackage',
      pkg.id,
    );
    return pkg;
  }

  async listPackageEntitlements(packageId: string) {
    await this.assertPackage(packageId);
    return this.prisma.packageEntitlement.findMany({
      where: { packageId },
      orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createPackageEntitlement(
    packageId: string,
    dto: CreatePackageEntitlementDto,
    user: AuthenticatedUser,
  ) {
    await this.assertPackage(packageId);
    const entitlementKey = dto.entitlementKey.trim().toUpperCase();
    const entitlement = await this.prisma.$transaction(async (tx) => {
      const created = await tx.packageEntitlement.create({
        data: {
          packageId,
          entitlementKey,
          valueJson: dto.valueJson as Prisma.InputJsonValue,
          status: dto.status ?? 'ACTIVE',
        },
      });
      await tx.activationPackage.update({
        where: { id: packageId },
        data: { version: { increment: 1 } },
      });
      return created;
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.package_entitlement.create',
      'PackageEntitlement',
      entitlement.id,
      { packageId, entitlementKey },
    );
    return entitlement;
  }

  async updatePackageEntitlement(
    packageId: string,
    entitlementId: string,
    dto: UpdatePackageEntitlementDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.packageEntitlement.findFirst({
      where: { id: entitlementId, packageId },
    });
    if (!existing) {
      throw new NotFoundException('Package entitlement not found');
    }

    const entitlement = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.packageEntitlement.update({
        where: { id: entitlementId },
        data: {
          ...(dto.entitlementKey
            ? { entitlementKey: dto.entitlementKey.trim().toUpperCase() }
            : {}),
          ...(dto.valueJson !== undefined
            ? { valueJson: dto.valueJson as Prisma.InputJsonValue }
            : {}),
          ...(dto.status ? { status: dto.status } : {}),
        },
      });
      await tx.activationPackage.update({
        where: { id: packageId },
        data: { version: { increment: 1 } },
      });
      return updated;
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.package_entitlement.update',
      'PackageEntitlement',
      entitlement.id,
      { packageId },
    );
    return entitlement;
  }

  private async assertPackage(packageId: string) {
    const pkg = await this.prisma.activationPackage.findUnique({
      where: { id: packageId },
      select: { id: true },
    });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
  }
}
