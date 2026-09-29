import { BadRequestException, Injectable } from '@nestjs/common';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { AccountRole, AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

const rolePriority: AccountRole[] = [
  'DIRECTOR',
  'ADMIN',
  'OPERATIONS',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
  'SALE',
  'CONTENT_EDITOR',
  'TEACHER',
  'SUPPORT',
  'PARENT',
  'STUDENT',
];

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(user: AuthenticatedUser) {
    const dbUser = await this.prisma.user
      .findUnique({
        where: { id: user.sub },
        select: {
          id: true,
          email: true,
          status: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
              locale: true,
              timezone: true,
            },
          },
          roles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .catch(() => null);

    if (!dbUser) {
      return {
        id: user.sub,
        email: user.email,
        status: 'DEMO',
        displayName: this.displayNameFromEmail(user.email),
        roles: user.roles,
        profile: {
          locale: 'vi-VN',
          timezone: 'Asia/Bangkok',
        },
      };
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      status: dbUser.status,
      displayName:
        dbUser.profile?.displayName ?? this.displayNameFromEmail(dbUser.email),
      roles: dbUser.roles.map((item) => item.role.name),
      profile: dbUser.profile,
    };
  }

  async getDashboard(user: AuthenticatedUser) {
    const profile = await this.getProfile(user);
    const primaryRole = this.getPrimaryRole(user.roles);
    const dashboard =
      primaryRole === 'SALE'
        ? await this.saleDashboardFor(user)
        : primaryRole === 'PARENT'
          ? await this.parentDashboardFor(user)
        : this.dashboardFor(primaryRole);

    return {
      role: primaryRole,
      user: profile,
      ...dashboard,
    };
  }

  async getLearningProfile(user: AuthenticatedUser) {
    const childProfile = await this.prisma.childProfile.findFirst({
      where: { parentId: user.sub },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    return { childProfile };
  }

  private getPrimaryRole(roles: AccountRole[]): AccountRole {
    return rolePriority.find((role) => roles.includes(role)) ?? 'STUDENT';
  }

  private displayNameFromEmail(email: string): string {
    return email
      .split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
      .join(' ');
  }

  private async parentDashboardFor(user: AuthenticatedUser) {
    if (user.sub.startsWith('demo-')) {
      return this.dashboardFor('PARENT');
    }

    const now = new Date();
    const [children, pendingOrders] = await Promise.all([
      this.prisma.childProfile.findMany({
        where: { parentId: user.sub },
        select: {
          id: true,
          screenTime: { select: { isEnabled: true } },
          subscriptions: {
            where: {
              status: { in: ['TRIALING', 'ACTIVE'] },
              currentPeriodStart: { lte: now },
              currentPeriodEnd: { gt: now },
            },
            select: { id: true },
            take: 1,
          },
        },
      }),
      this.prisma.activationOrder.count({
        where: {
          userId: user.sub,
          status: { in: ['WAITING_PAYMENT', 'PENDING_REVIEW'] },
        },
      }),
    ]);

    return {
      title: 'Parent dashboard',
      metrics: [
        { label: 'Hồ sơ con', value: String(children.length), delta: 'đã tạo' },
        { label: 'Gói học còn hiệu lực', value: String(children.filter((child) => child.subscriptions.length > 0).length), delta: 'hồ sơ con' },
        { label: 'Đơn cần theo dõi', value: String(pendingOrders), delta: 'chờ thanh toán hoặc duyệt' },
        { label: 'Giới hạn học đã bật', value: String(children.filter((child) => child.screenTime?.isEnabled).length), delta: 'hồ sơ con' },
      ],
      actions: [],
    };
  }

  private async saleDashboardFor(user: AuthenticatedUser) {
    const fallback = this.dashboardFor('SALE');
    if (user.sub.startsWith('demo-')) {
      return fallback;
    }

    const participantWhere = {
      type: 'SALE' as const,
      userId: user.sub,
    };
    const orderScope = {
      OR: [
        { createdById: user.sub },
        { channelParticipant: { is: participantWhere } },
      ],
    };
    const ledgerScope = {
      OR: [
        { beneficiaryUserId: user.sub },
        { participant: { is: participantWhere } },
      ],
    };

    try {
      const [
        orderCount,
        waitingCount,
        pendingReviewCount,
        rejectedCount,
        approvedCount,
        approvedRevenue,
        ledgerEntries,
      ] = await Promise.all([
        this.prisma.activationOrder.count({ where: orderScope }),
        this.prisma.activationOrder.count({
          where: { ...orderScope, status: 'WAITING_PAYMENT' },
        }),
        this.prisma.activationOrder.count({
          where: { ...orderScope, status: 'PENDING_REVIEW' },
        }),
        this.prisma.activationOrder.count({
          where: { ...orderScope, status: 'REJECTED' },
        }),
        this.prisma.activationOrder.count({
          where: { ...orderScope, status: 'APPROVED' },
        }),
        this.prisma.activationOrder.aggregate({
          where: { ...orderScope, status: 'APPROVED' },
          _sum: { amountCents: true },
        }),
        this.prisma.commissionLedgerEntry.findMany({
          where: ledgerScope,
          select: {
            type: true,
            amountCents: true,
            currency: true,
          },
        }),
      ]);

      const wallet = this.summarizeCommissionEntries(ledgerEntries);
      const needsFollowUp = waitingCount + rejectedCount;

      return {
        title: 'Sales dashboard',
        metrics: [
          {
            label: 'Orders created',
            value: String(orderCount),
            delta: `${needsFollowUp} need follow-up`,
          },
          {
            label: 'Pending review',
            value: String(pendingReviewCount),
            delta: 'waiting ops',
          },
          {
            label: 'Approved revenue',
            value: this.formatDashboardMoney(
              approvedRevenue._sum.amountCents ?? 0,
            ),
            delta: `${approvedCount} approved`,
          },
          {
            label: 'Commission available',
            value: this.formatDashboardMoney(wallet.availableCents),
            delta: `${this.formatDashboardMoney(wallet.heldCents)} held`,
          },
        ],
        actions: [
          'Create learner order',
          'Follow up pending payment',
          'Request commission payout',
        ],
      };
    } catch {
      return fallback;
    }
  }

  private summarizeCommissionEntries(
    entries: Array<{
      type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
      amountCents: number;
      currency: string;
    }>,
  ) {
    const availableCents = entries.reduce((sum, entry) => {
      return entry.type === 'CREDIT' || entry.type === 'RELEASE'
        ? sum + entry.amountCents
        : sum - entry.amountCents;
    }, 0);
    const heldCents = entries
      .filter((entry) => entry.type === 'HOLD')
      .reduce((sum, entry) => sum + entry.amountCents, 0);
    const releasedCents = entries
      .filter((entry) => entry.type === 'RELEASE')
      .reduce((sum, entry) => sum + entry.amountCents, 0);

    return {
      availableCents,
      heldCents: Math.max(heldCents - releasedCents, 0),
    };
  }

  private formatDashboardMoney(amountCents: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amountCents / 100);
  }

  private dashboardFor(role: AccountRole) {
    const titles: Record<AccountRole, string> = {
      STUDENT: 'Student dashboard',
      PARENT: 'Parent dashboard',
      TEACHER: 'Teacher dashboard',
      CONTENT_EDITOR: 'Content editor dashboard',
      ADMIN: 'Admin dashboard',
      DIRECTOR: 'Director dashboard',
      SUPPORT: 'Support dashboard',
      SALE: 'Sales dashboard',
      AGENCY_OWNER: 'Agency owner dashboard',
      AGENCY_MANAGER: 'Agency manager dashboard',
      OPERATIONS: 'Operations dashboard',
    };
    return { title: titles[role], metrics: [], actions: [] };
  }

  async getMyOrders(user: AuthenticatedUser) {
    if (user.sub.startsWith('demo-')) {
      return { orders: [] };
    }
    const orders = await this.prisma.activationOrder.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        status: true,
        source: true,
        packageName: true,
        childProfile: { select: { id: true, displayName: true } },
        amountCents: true,
        currency: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
        transferContent: true,
        saleInvoiceUrl: true,
        reviewNotes: true,
        activatedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return { orders };
  }

  async updateProfile(
    user: AuthenticatedUser,
    dto: { displayName?: string; locale?: string; timezone?: string },
  ) {
    if (user.sub.startsWith('demo-')) {
      throw new BadRequestException('Cannot update profile for demo accounts');
    }
    const profile = await this.prisma.profile.upsert({
      where: { userId: user.sub },
      update: {
        ...(dto.displayName !== undefined
          ? { displayName: dto.displayName }
          : {}),
        ...(dto.locale !== undefined ? { locale: dto.locale } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      },
      create: {
        userId: user.sub,
        displayName: dto.displayName,
        locale: dto.locale ?? 'vi-VN',
        timezone: dto.timezone ?? 'Asia/Bangkok',
      },
    });
    return profile;
  }

  async changePassword(
    user: AuthenticatedUser,
    dto: { currentPassword: string; newPassword: string },
  ) {
    if (user.sub.startsWith('demo-')) {
      throw new BadRequestException('Cannot change password for demo accounts');
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });
    if (!dbUser) {
      throw new BadRequestException('User not found');
    }

    const [salt, storedHash] = dbUser.passwordHash.split(':');
    if (!salt || !storedHash) {
      throw new BadRequestException('Invalid password hash format');
    }
    const inputHash = scryptSync(dto.currentPassword, salt, 64);
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (
      inputHash.length !== storedBuf.length ||
      !timingSafeEqual(inputHash, storedBuf)
    ) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newSalt = randomBytes(16).toString('hex');
    const newHash = scryptSync(dto.newPassword, newSalt, 64).toString('hex');
    await this.prisma.user.update({
      where: { id: user.sub },
      data: { passwordHash: `${newSalt}:${newHash}` },
    });
    return { success: true };
  }
}
