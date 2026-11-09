import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { GrantExtraDeviceTimeDto } from './dto/grant-extra-device-time.dto';
import { UpdateChildScreenTimeDto } from './dto/update-child-screen-time.dto';
import { toScreenTime, todayInBangkok } from './parent.helpers';

/** Screen time limits and extra device time. */
@Injectable()
export class ParentScreenTimeService {
  constructor(private readonly prisma: PrismaService) {}

  async updateScreenTime(
    childProfileId: string,
    dto: UpdateChildScreenTimeDto,
    user: AuthenticatedUser,
  ) {
    if (
      dto.isEnabled === undefined &&
      dto.dailyLimitMinutes === undefined &&
      dto.sessionLimitMinutes === undefined &&
      dto.breakMinutes === undefined
    ) {
      throw new BadRequestException('No screen time setting was provided');
    }

    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { parentId: true },
    });

    if (!child || child.parentId !== user.sub) {
      throw new NotFoundException('Child profile not found');
    }

    const settingUpdate: {
      isEnabled?: boolean;
      dailyLimitMinutes?: number;
      sessionLimitMinutes?: number;
      breakMinutes?: number;
    } = {};
    if (dto.isEnabled !== undefined) settingUpdate.isEnabled = dto.isEnabled;
    if (dto.dailyLimitMinutes !== undefined)
      settingUpdate.dailyLimitMinutes = dto.dailyLimitMinutes;
    if (dto.sessionLimitMinutes !== undefined)
      settingUpdate.sessionLimitMinutes = dto.sessionLimitMinutes;
    if (dto.breakMinutes !== undefined)
      settingUpdate.breakMinutes = dto.breakMinutes;

    const setting = await this.prisma.childScreenTimeSetting.upsert({
      where: { childProfileId },
      update: settingUpdate,
      create: {
        childProfileId,
        isEnabled: dto.isEnabled ?? true,
        dailyLimitMinutes: dto.dailyLimitMinutes ?? 45,
        sessionLimitMinutes: dto.sessionLimitMinutes ?? 30,
        breakMinutes: dto.breakMinutes ?? 10,
      },
    });

    return toScreenTime(setting);
  }

  async grantExtraDeviceTime(
    childProfileId: string,
    dto: GrantExtraDeviceTimeDto,
    user: AuthenticatedUser,
  ) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { parentId: true, screenTime: true },
    });

    if (!child || child.parentId !== user.sub) {
      throw new NotFoundException('Child profile not found');
    }

    if (!child.screenTime?.isEnabled) {
      throw new BadRequestException('Device limit must be enabled first');
    }

    const grant = await this.prisma.deviceTimeGrant.create({
      data: {
        childProfileId,
        grantedById: user.sub,
        usageDate: todayInBangkok(),
        extraMinutes: dto.extraMinutes,
        note: dto.note,
      },
    });

    return {
      id: grant.id,
      usageDate: grant.usageDate,
      extraMinutes: grant.extraMinutes,
      createdAt: grant.createdAt,
    };
  }
}
