import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import {
  emptyDeviceUsage,
  emptyProgress,
  sumExtraMinutes,
  summarizeDeviceUsage,
  summarizeProgress,
  toDeviceUsage,
  toInsight,
} from './parent-children.helpers';
import { toScreenTime, todayInBangkok } from './parent.helpers';

/** Child profiles: list, create, delete. */
@Injectable()
export class ParentChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  async listChildren(user: AuthenticatedUser) {
    const now = new Date();
    const usageDate = todayInBangkok();

    const children = await this.prisma.childProfile.findMany({
      where: { parentId: user.sub },
      orderBy: { createdAt: 'asc' },
      include: {
        subscriptions: {
          where: {
            status: { in: ['TRIALING', 'ACTIVE'] },
            currentPeriodStart: { lte: now },
            currentPeriodEnd: { gt: now },
          },
          orderBy: { currentPeriodEnd: 'desc' },
          take: 1,
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
        screenTime: true,
        deviceTimeGrants: {
          where: { usageDate },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const childIds = children.map((c) => c.id);
    const [progressItems, usageItems] = await Promise.all([
      childIds.length > 0
        ? this.prisma.lessonProgress.findMany({
            where: { childProfileId: { in: childIds } },
            select: {
              childProfileId: true,
              status: true,
              lastPositionSec: true,
              watchCount: true,
              lastWatchedAt: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  durationSec: true,
                  activities: { select: { id: true }, take: 1 },
                },
              },
            },
          })
        : Promise.resolve([]),
      childIds.length > 0
        ? this.prisma.learningUsageDay.findMany({
            where: { childProfileId: { in: childIds }, usageDate },
            select: {
              childProfileId: true,
              deviceType: true,
              usedSeconds: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const progressByChildId = summarizeProgress(progressItems);
    const usageByChildId = summarizeDeviceUsage(usageItems);

    return {
      children: children.map((child) => {
        const progress = progressByChildId.get(child.id) ?? emptyProgress();
        const deviceUsage = usageByChildId.get(child.id) ?? emptyDeviceUsage();
        const progressBase = Math.max(progress.watchedLessons, 1);

        return {
          id: child.id,
          displayName: child.displayName,
          avatarUrl: child.avatarUrl,
          subscription: child.subscriptions[0] ?? null,
          screenTime: toScreenTime(child.screenTime),
          deviceUsage: toDeviceUsage(
            child.screenTime,
            sumExtraMinutes(child.deviceTimeGrants ?? []),
            deviceUsage,
            usageDate,
          ),
          insight: toInsight(
            progress,
            deviceUsage,
            child.screenTime,
            sumExtraMinutes(child.deviceTimeGrants ?? []),
          ),
          progress: {
            ...progress,
            completionRate: Math.round(
              (progress.completedLessons / progressBase) * 100,
            ),
          },
        };
      }),
    };
  }

  async createChild(user: AuthenticatedUser, dto: CreateChildProfileDto) {
    if (user.sub.startsWith('demo-')) {
      throw new BadRequestException(
        'Demo accounts cannot manage child profiles',
      );
    }

    const child = await this.prisma.childProfile.create({
      data: {
        parentId: user.sub,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
    });

    return {
      id: child.id,
      displayName: child.displayName,
      avatarUrl: child.avatarUrl,
      createdAt: child.createdAt,
    };
  }

  async deleteChild(user: AuthenticatedUser, childProfileId: string) {
    if (user.sub.startsWith('demo-')) {
      throw new BadRequestException(
        'Demo accounts cannot manage child profiles',
      );
    }

    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { parentId: true },
    });

    if (!child || child.parentId !== user.sub) {
      throw new NotFoundException('Child profile not found');
    }

    await this.prisma.childProfile.delete({ where: { id: childProfileId } });

    return { success: true };
  }
}
