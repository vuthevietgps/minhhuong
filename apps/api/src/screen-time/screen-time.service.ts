import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const heartbeatCapSeconds = 35;
const staleSessionMs = 2 * 60 * 1000;

@Injectable()
export class ScreenTimeService {
  constructor(private readonly prisma: PrismaService) {}

  async heartbeat(
    childProfileId: string,
    deviceKey: string,
    sessionId?: string,
  ) {
    const setting = await this.prisma.childScreenTimeSetting.findUnique({
      where: { childProfileId },
    });

    if (!setting?.isEnabled) {
      return this.unlimitedStatus();
    }

    const now = new Date();
    await this.releaseExpiredBreaks(childProfileId, now);

    const activeBreak = await this.prisma.learningAppSession.findFirst({
      where: {
        childProfileId,
        status: 'BREAK_REQUIRED',
        breakUntil: { gt: now },
      },
      orderBy: { breakUntil: 'desc' },
    });
    if (activeBreak) {
      return this.toStatus(activeBreak, setting, now);
    }

    let session = sessionId
      ? await this.prisma.learningAppSession.findFirst({
          where: { id: sessionId, childProfileId, deviceKey },
        })
      : null;

    if (!session || session.status !== 'ACTIVE') {
      session = await this.prisma.learningAppSession.create({
        data: { childProfileId, deviceKey },
      });
      return this.toStatus(session, setting, now);
    }

    const elapsedMs = now.getTime() - session.lastHeartbeatAt.getTime();
    const increment =
      elapsedMs <= 0 || elapsedMs > staleSessionMs
        ? 0
        : Math.min(heartbeatCapSeconds, Math.floor(elapsedMs / 1000));
    const limitSeconds = setting.sessionLimitMinutes * 60;
    const activeSeconds = Math.min(
      limitSeconds,
      session.activeSeconds + increment,
    );
    const requiresBreak = activeSeconds >= limitSeconds;
    const breakUntil = requiresBreak
      ? new Date(now.getTime() + setting.breakMinutes * 60 * 1000)
      : null;

    session = await this.prisma.learningAppSession.update({
      where: { id: session.id },
      data: {
        activeSeconds,
        lastHeartbeatAt: now,
        ...(requiresBreak
          ? { status: 'BREAK_REQUIRED', breakUntil, endedAt: now }
          : {}),
      },
    });

    return this.toStatus(session, setting, now);
  }

  async assertNotOnBreak(childProfileId: string) {
    const setting = await this.prisma.childScreenTimeSetting.findUnique({
      where: { childProfileId },
      select: { isEnabled: true },
    });
    if (!setting?.isEnabled) return;

    const now = new Date();
    await this.releaseExpiredBreaks(childProfileId, now);
    const activeBreak = await this.prisma.learningAppSession.findFirst({
      where: {
        childProfileId,
        status: 'BREAK_REQUIRED',
        breakUntil: { gt: now },
      },
      select: { breakUntil: true },
    });
    if (activeBreak) {
      throw new ForbiddenException({
        code: 'APP_BREAK_REQUIRED',
        message: 'Phiên sử dụng đã kết thúc. Hãy nghỉ đủ thời gian đã cài đặt.',
        breakUntil: activeBreak.breakUntil,
      });
    }
  }

  private async releaseExpiredBreaks(childProfileId: string, now: Date) {
    await this.prisma.learningAppSession.updateMany({
      where: {
        childProfileId,
        status: 'BREAK_REQUIRED',
        breakUntil: { lte: now },
      },
      data: { status: 'ENDED' },
    });
  }

  private toStatus(
    session: {
      id: string;
      status: 'ACTIVE' | 'BREAK_REQUIRED' | 'ENDED';
      activeSeconds: number;
      breakUntil: Date | null;
    },
    setting: {
      dailyLimitMinutes: number;
      sessionLimitMinutes: number;
      breakMinutes: number;
    },
    now: Date,
  ) {
    const remainingSessionSeconds = Math.max(
      0,
      setting.sessionLimitMinutes * 60 - session.activeSeconds,
    );
    const breakRemainingSeconds = session.breakUntil
      ? Math.max(
          0,
          Math.ceil((session.breakUntil.getTime() - now.getTime()) / 1000),
        )
      : 0;

    return {
      isEnabled: true,
      allowed: session.status === 'ACTIVE',
      sessionId: session.id,
      sessionLimitMinutes: setting.sessionLimitMinutes,
      dailyLimitMinutes: setting.dailyLimitMinutes,
      breakMinutes: setting.breakMinutes,
      activeSeconds: session.activeSeconds,
      remainingSessionSeconds,
      warning:
        remainingSessionSeconds > 0 && remainingSessionSeconds <= 3 * 60
          ? 'THREE_MINUTES'
          : remainingSessionSeconds > 0 && remainingSessionSeconds <= 5 * 60
            ? 'FIVE_MINUTES'
            : null,
      breakUntil: session.breakUntil,
      breakRemainingSeconds,
    };
  }

  private unlimitedStatus() {
    return {
      isEnabled: false,
      allowed: true,
      sessionId: null,
      sessionLimitMinutes: null,
      dailyLimitMinutes: null,
      breakMinutes: null,
      activeSeconds: 0,
      remainingSessionSeconds: null,
      warning: null,
      breakUntil: null,
      breakRemainingSeconds: 0,
    };
  }
}
