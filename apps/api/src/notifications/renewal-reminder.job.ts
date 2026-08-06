import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

function todayBangkok() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function daysAgoBangkok(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

@Injectable()
export class RenewalReminderJob {
  private readonly logger = new Logger(RenewalReminderJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  /** Runs every day at 08:00 Asia/Bangkok — find subscriptions expiring in 7 or 3 days */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendRenewalReminders() {
    this.logger.log('Running renewal reminder job');
    const now = new Date();

    for (const daysLeft of [7, 3]) {
      const windowStart = new Date(now);
      windowStart.setHours(0, 0, 0, 0);
      windowStart.setDate(windowStart.getDate() + daysLeft);

      const windowEnd = new Date(windowStart);
      windowEnd.setHours(23, 59, 59, 999);

      const expiring = await this.prisma.subscription.findMany({
        where: {
          status: { in: ['ACTIVE', 'TRIALING'] },
          currentPeriodEnd: { gte: windowStart, lte: windowEnd },
        },
        include: {
          childProfile: {
            select: {
              parent: {
                select: {
                  email: true,
                  status: true,
                },
              },
            },
          },
        },
        take: 500,
      });

      for (const sub of expiring) {
        if (sub.childProfile.parent.status !== 'ACTIVE') continue;
        try {
          await this.notification.sendExpiryReminder(
            sub.childProfile.parent.email,
            sub.currentPeriodEnd,
            daysLeft,
          );
        } catch (err) {
          this.logger.error(
            `Failed reminder for ${sub.childProfile.parent.email}: ${String(err)}`,
          );
        }
      }

      this.logger.log(
        `Sent ${expiring.length} reminders for ${daysLeft}-day window`,
      );
    }
  }

  /** Runs every Monday at 09:00 Asia/Bangkok — send weekly learning digest to parents */
  @Cron('0 9 * * 1')
  async sendWeeklyLearningDigests() {
    this.logger.log('Running weekly learning digest job');

    const today = todayBangkok();
    const weekAgo = daysAgoBangkok(6);

    const parents = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        roles: { some: { role: { name: 'PARENT' } } },
      },
      select: {
        email: true,
        childProfiles: {
          select: {
            id: true,
            displayName: true,
            lessonProgress: {
              where: {
                updatedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
              select: {
                status: true,
                lesson: { select: { durationSec: true } },
                lastPositionSec: true,
              },
            },
            learningUsageDays: {
              where: {
                usageDate: { gte: weekAgo, lte: today },
                usedSeconds: { gt: 0 },
              },
              select: { usageDate: true, usedSeconds: true },
              orderBy: { usageDate: 'desc' },
            },
          },
        },
      },
      take: 2000,
    });

    let sent = 0;
    for (const parent of parents) {
      for (const child of parent.childProfiles) {
        if (child.learningUsageDays.length === 0) continue;

        const completedLessons = child.lessonProgress.filter(
          (p) => p.status === 'COMPLETED',
        ).length;
        const totalStudyMinutes = Math.ceil(
          child.learningUsageDays.reduce((s, d) => s + d.usedSeconds, 0) / 60,
        );
        const streak = this.computeStreak(
          child.learningUsageDays.map((d) => d.usageDate),
          today,
        );

        try {
          await this.notification.sendWeeklyLearningDigest(
            parent.email,
            child.displayName,
            {
              completedLessons,
              totalStudyMinutes,
              streak,
            },
          );
          sent++;
        } catch (err) {
          this.logger.error(
            `Digest failed for ${parent.email}: ${String(err)}`,
          );
        }
      }
    }

    this.logger.log(`Sent ${sent} weekly digest emails`);
  }

  private computeStreak(sortedDatesDesc: string[], today: string): number {
    let streak = 0;
    const dates = new Set(sortedDatesDesc);
    const cursor = new Date(today);

    while (dates.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }
}
