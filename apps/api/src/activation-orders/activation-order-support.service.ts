import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  dbUserId,
  generateSecurePassword,
  hashPassword,
} from './activation-order.helpers';

/** Shared persistence helpers: audit log, parent accounts, manual plans, actor lookups. */
@Injectable()
export class ActivationOrderSupportService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertParentAccount(args: { password?: string }, email: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (existing) {
      const [salt, hash] = existing.passwordHash?.split(':') ?? [];
      if (!args.password || !salt || !hash) {
        throw new BadRequestException('Invalid account credentials');
      }
      const actual = Buffer.from(
        scryptSync(args.password, salt, 64).toString('hex'),
      );
      const expected = Buffer.from(hash);
      if (
        actual.length !== expected.length ||
        !timingSafeEqual(actual, expected)
      ) {
        throw new BadRequestException('Invalid account credentials');
      }
      const roleNames = existing.roles.map((item) => item.role.name);
      const isParent = roleNames.some((role) =>
        ['STUDENT', 'PARENT'].includes(role),
      );
      if (!isParent) {
        throw new BadRequestException(
          'This email belongs to an internal account',
        );
      }
      // Ensure PARENT role is assigned
      const hasParentRole = roleNames.includes('PARENT');
      if (!hasParentRole) {
        const parentRole = await this.prisma.role.upsert({
          where: { name: 'PARENT' },
          update: {},
          create: { name: 'PARENT', description: 'Parent account' },
        });
        await this.prisma.userRole.upsert({
          where: {
            userId_roleId: { userId: existing.id, roleId: parentRole.id },
          },
          update: {},
          create: { userId: existing.id, roleId: parentRole.id },
        });
      }
      return existing;
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(args.password ?? generateSecurePassword()),
        status: 'ACTIVE',
        profile: {
          create: {
            displayName: email.split('@')[0],
          },
        },
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'PARENT' },
                create: {
                  name: 'PARENT',
                  description: 'Parent account',
                },
              },
            },
          },
        },
      },
    });
  }

  ensureManualPlan() {
    return this.prisma.plan.upsert({
      where: { code: 'manual-access' },
      update: {
        name: 'Manual access package',
        description:
          'Duration is controlled by operations when payment is approved.',
        priceCents: 0,
        currency: 'VND',
        billingCycle: 'YEARLY',
        isActive: true,
      },
      create: {
        code: 'manual-access',
        name: 'Manual access package',
        description:
          'Duration is controlled by operations when payment is approved.',
        priceCents: 0,
        currency: 'VND',
        billingCycle: 'YEARLY',
        isActive: true,
      },
    });
  }

  findPackageForSnapshotByCode(code: string) {
    return this.prisma.activationPackage.findUnique({
      where: { code },
      include: {
        entitlements: {
          where: { status: 'ACTIVE' },
          orderBy: [{ entitlementKey: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  async actorChannelParticipant(
    user: AuthenticatedUser,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const userId = dbUserId(user);
    if (!userId) {
      return null;
    }

    return tx.channelParticipant.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
  }

  async audit(
    user: AuthenticatedUser,
    action: string,
    orderId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          userId: dbUserId(user),
          action,
          entityType: 'ActivationOrder',
          entityId: orderId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }

  async auditSystem(
    action: string,
    orderId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          action,
          entityType: 'ActivationOrder',
          entityId: orderId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }
}
