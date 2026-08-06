import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const samplePlans = [
  {
    code: 'monthly',
    name: 'Monthly',
    priceCents: 9900000,
    currency: 'VND',
    billingCycle: 'MONTHLY',
  },
  {
    code: 'yearly',
    name: 'Yearly',
    priceCents: 99000000,
    currency: 'VND',
    billingCycle: 'YEARLY',
  },
];

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlans() {
    try {
      const plans = await this.prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { priceCents: 'asc' },
      });

      return plans.length > 0 ? plans : samplePlans;
    } catch {
      return samplePlans;
    }
  }

  async getCurrentSubscription(userId: string) {
    const childProfiles = await this.prisma.childProfile.findMany({
      where: { parentId: userId },
      select: { id: true },
    });
    const childIds = childProfiles.map((c) => c.id);
    if (childIds.length === 0) return null;

    return this.prisma.subscription.findFirst({
      where: {
        childProfileId: { in: childIds },
        status: { in: ['TRIALING', 'ACTIVE', 'PAST_DUE'] },
      },
      orderBy: { currentPeriodEnd: 'desc' },
      include: { plan: true },
    });
  }

  async getWallet(userId: string) {
    const entries = await this.prisma.walletLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const balanceCents = entries.reduce((sum, entry) => {
      return entry.type === 'CREDIT' || entry.type === 'RELEASE'
        ? sum + entry.amountCents
        : sum - entry.amountCents;
    }, 0);

    return {
      balanceCents,
      currency: entries[0]?.currency ?? 'VND',
      entries,
    };
  }
}
