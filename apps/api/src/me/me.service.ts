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
    switch (role) {
      case 'DIRECTOR':
        return {
          title: 'Director dashboard',
          metrics: [
            { label: 'Revenue MTD', value: '218.4M VND', delta: '+12.8%' },
            { label: 'Active subscriptions', value: '1,284', delta: '+9.4%' },
            { label: 'Trial conversion', value: '24%', delta: '-1.2%' },
            { label: 'AI cost ratio', value: '6.1%', delta: '+0.4%' },
          ],
          actions: [
            'Review revenue',
            'Approve annual plan',
            'Open risk report',
          ],
        };
      case 'ADMIN':
        return {
          title: 'Admin dashboard',
          metrics: [
            { label: 'Users pending support', value: '42', delta: '+6' },
            { label: 'Published lessons', value: '318', delta: '+12' },
            { label: 'Payment failures', value: '18', delta: '-3' },
            { label: 'System health', value: '99.96%', delta: 'stable' },
          ],
          actions: ['Manage users', 'Configure plans', 'Review audit log'],
        };
      case 'OPERATIONS':
        return {
          title: 'Operations dashboard',
          metrics: [
            { label: 'Pending orders', value: '18', delta: '+4 today' },
            { label: 'Approved revenue', value: '94.8M VND', delta: '+11%' },
            { label: 'Invoice mismatches', value: '3', delta: 'review' },
            { label: 'Expiring accounts', value: '27', delta: '7 days' },
          ],
          actions: [
            'Review pending orders',
            'Upload counter invoice',
            'Approve account access',
          ],
        };
      case 'SALE':
        return {
          title: 'Sales dashboard',
          metrics: [
            { label: 'Orders created', value: '42', delta: '+8 today' },
            { label: 'Pending approval', value: '15', delta: 'waiting ops' },
            { label: 'New learners', value: '38', delta: '+12%' },
            { label: 'Revenue submitted', value: '128.5M VND', delta: '+9%' },
          ],
          actions: [
            'Create activation order',
            'Upload customer invoice',
            'Check approval status',
          ],
        };
      case 'AGENCY_OWNER':
        return {
          title: 'Agency owner dashboard',
          metrics: [
            {
              label: 'Agency revenue',
              value: '0 VND',
              delta: 'current period',
            },
            { label: 'Agency sales', value: '1', delta: 'active' },
            { label: 'Pending payouts', value: '0 VND', delta: 'review queue' },
            { label: 'Referral codes', value: '2', delta: 'ready' },
          ],
          actions: [
            'Create learner order',
            'Invite sale member',
            'Review agency report',
          ],
        };
      case 'AGENCY_MANAGER':
        return {
          title: 'Agency manager dashboard',
          metrics: [
            { label: 'Managed sales', value: '0', delta: 'assigned' },
            { label: 'Submitted orders', value: '0', delta: 'current period' },
            {
              label: 'Agency commission',
              value: '0 VND',
              delta: 'pending approval',
            },
            { label: 'Payout status', value: 'Ready', delta: 'no holds' },
          ],
          actions: [
            'Create learner order',
            'Check sale performance',
            'Open payout queue',
          ],
        };
      case 'CONTENT_EDITOR':
        return {
          title: 'Content editor dashboard',
          metrics: [
            { label: 'Draft lessons', value: '27', delta: '+5' },
            { label: 'Need review', value: '9', delta: '+2' },
            { label: 'Video processing', value: '4', delta: '-1' },
            { label: 'Question bank', value: '2,430', delta: '+184' },
          ],
          actions: ['Create lesson', 'Upload video', 'Submit for review'],
        };
      case 'TEACHER':
        return {
          title: 'Teacher dashboard',
          metrics: [
            { label: 'Classes', value: '7', delta: '+1' },
            { label: 'Students at risk', value: '23', delta: '-4' },
            { label: 'Assignments to grade', value: '64', delta: '+11' },
            { label: 'Avg completion', value: '78%', delta: '+4.1%' },
          ],
          actions: ['Open class report', 'Grade speaking', 'Message learners'],
        };
      case 'SUPPORT':
        return {
          title: 'Support dashboard',
          metrics: [
            { label: 'Open tickets', value: '31', delta: '-8' },
            { label: 'Billing issues', value: '12', delta: '+3' },
            { label: 'Avg response', value: '6m', delta: '-2m' },
            { label: 'Refund requests', value: '5', delta: '+1' },
          ],
          actions: ['Find account', 'Check wallet', 'Escalate payment'],
        };
      case 'PARENT':
        return {
          title: 'Parent dashboard',
          metrics: [
            { label: 'Children', value: '2', delta: 'active' },
            { label: 'Weekly study', value: '4h 20m', delta: '+35m' },
            { label: 'Device limit', value: '45m/day', delta: 'enabled' },
            { label: 'Subscription left', value: '214 days', delta: 'annual' },
          ],
          actions: [
            'View progress',
            'Review screen time',
            'Manage subscription',
          ],
        };
      case 'STUDENT':
      default:
        return {
          title: 'Student dashboard',
          metrics: [
            { label: 'Current level', value: 'A1', delta: 'Unit 04' },
            { label: 'Weekly goal', value: '82%', delta: '+12%' },
            { label: 'Lessons done', value: '36', delta: '+3' },
            { label: 'AI messages left', value: '184', delta: 'Premium' },
          ],
          actions: ['Resume lesson', 'Start practice', 'Open AI coach'],
        };
    }
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
