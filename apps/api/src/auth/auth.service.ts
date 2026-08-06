import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Optional,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AUTH_OPERATIONAL_CONTROL,
  AuthOperationalControlUnavailableError,
  AuthRateLimitExceededError,
  FixtureBackedAuthOperationalControl,
} from './auth-operational-control';
import type {
  AuthOperationalControl,
  AuthOperationalEventKind,
  AuthRateLimitSurface,
} from './auth-operational-control';
import { AuthSessionService } from './auth-session.service';
import { AccountRole, accountRoles } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const demoAccounts: Record<
  string,
  { id: string; displayName: string; roles: AccountRole[] }
> = {
  'student@demo.local': {
    id: 'demo-student',
    displayName: 'Minh Anh',
    roles: ['STUDENT'],
  },
  'parent@demo.local': {
    id: 'demo-parent',
    displayName: 'Phu huynh Minh Anh',
    roles: ['PARENT'],
  },
  'teacher@demo.local': {
    id: 'demo-teacher',
    displayName: 'Ms. Lan',
    roles: ['TEACHER'],
  },
  'content@demo.local': {
    id: 'demo-content-editor',
    displayName: 'Content Team',
    roles: ['CONTENT_EDITOR'],
  },
  'support@demo.local': {
    id: 'demo-support',
    displayName: 'Support Desk',
    roles: ['SUPPORT'],
  },
  'admin@demo.local': {
    id: 'demo-admin',
    displayName: 'Admin Operator',
    roles: ['ADMIN'],
  },
  'director@demo.local': {
    id: 'demo-director',
    displayName: 'Director',
    roles: ['DIRECTOR'],
  },
  'sale@demo.local': {
    id: 'demo-sale',
    displayName: 'Sales Operator',
    roles: ['SALE'],
  },
  'agency@demo.local': {
    id: 'demo-agency-owner',
    displayName: 'Demo Agency Owner',
    roles: ['AGENCY_OWNER'],
  },
  'operations@demo.local': {
    id: 'demo-operations',
    displayName: 'Payment Operations',
    roles: ['OPERATIONS'],
  },
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notification: NotificationService,
    private readonly authSessions: AuthSessionService,
    @Optional()
    @Inject(AUTH_OPERATIONAL_CONTROL)
    private readonly operationalControl: AuthOperationalControl = new FixtureBackedAuthOperationalControl(),
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        status: 'SUSPENDED',
        profile: {
          create: {
            displayName: dto.displayName,
          },
        },
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'STUDENT' },
                create: {
                  name: 'STUDENT',
                  description: 'Learner account',
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
        profile: {
          select: {
            displayName: true,
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
    });
    const roles = this.toAccountRoles(user.roles.map((item) => item.role.name));

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        displayName: user.profile?.displayName,
        roles,
      },
      message:
        'Tài khoản đã được tạo nhưng chưa kích hoạt. Vui lòng hoàn tất thanh toán và chờ vận hành duyệt.',
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    await this.assertRateLimit('LOGIN', email);

    try {
      const response = await this.performLogin(dto, email);
      await this.recordOperationalEvent('LOGIN_SUCCEEDED');
      return response;
    } catch (error) {
      await this.recordOperationalEvent('LOGIN_DENIED');
      throw error;
    }
  }

  private async performLogin(dto: LoginDto, email: string) {
    const user = await this.prisma.user
      .findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          status: true,
          profile: {
            select: {
              displayName: true,
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

    if (user) {
      if (!this.verifyPassword(dto.password, user.passwordHash)) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const roles = this.toAccountRoles(
        user.roles.map((item) => item.role.name),
      );
      await this.assertLoginAllowed(user.id, user.status, roles);

      return this.buildLoginResponse({
        userId: user.id,
        email: user.email,
        displayName: user.profile?.displayName ?? undefined,
        roles,
      });
    }

    const demoAccount = await this.getDemoAccount(email, dto.password);

    if (demoAccount) {
      return demoAccount;
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  private hashPassword(password: string): string {
    const salt = randomUUID();
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) {
      return false;
    }

    const actual = Buffer.from(scryptSync(password, salt, 64).toString('hex'));
    const expected = Buffer.from(hash);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private async buildLoginResponse(input: {
    userId: string;
    email: string;
    displayName?: string;
    roles: AccountRole[];
  }) {
    const expiresIn = 1800;
    const session = await this.authSessions.createSession({
      userId: input.userId,
      email: input.email,
      roles: input.roles,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });
    const refreshToken = await this.authSessions.issueRefreshToken({
      sessionId: session.id,
      userId: input.userId,
    });
    const tokenId = randomUUID();

    return {
      user: {
        id: input.userId,
        email: input.email,
        displayName: input.displayName,
        roles: input.roles,
      },
      accessToken: this.jwt.sign(
        {
          sub: input.userId,
          email: input.email,
          roles: input.roles,
          sid: session.id,
          jti: tokenId,
          deviceId: session.deviceId,
        },
        { expiresIn },
      ),
      refreshToken: refreshToken.token,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      tokenType: 'Bearer',
      expiresIn,
      session: {
        id: session.id,
        deviceId: session.deviceId,
        expiresAt: session.expiresAt,
        refreshTokenId: refreshToken.id,
      },
    };
  }

  async refresh(refreshToken: string) {
    await this.assertRateLimit('REFRESH', refreshToken);

    try {
      const response = await this.performRefresh(refreshToken);
      await this.recordOperationalEvent('REFRESH_SUCCEEDED');
      return response;
    } catch (error) {
      await this.recordOperationalEvent('REFRESH_DENIED');
      throw error;
    }
  }

  private async performRefresh(refreshToken: string) {
    const rotated = await this.authSessions.rotateRefreshToken(refreshToken);
    const expiresIn = 1800;
    const tokenId = randomUUID();

    return {
      user: {
        id: rotated.session.userId,
        email: rotated.session.email,
        roles: rotated.session.roles,
      },
      accessToken: this.jwt.sign(
        {
          sub: rotated.session.userId,
          email: rotated.session.email,
          roles: rotated.session.roles,
          sid: rotated.session.id,
          jti: tokenId,
          deviceId: rotated.session.deviceId,
        },
        { expiresIn },
      ),
      refreshToken: rotated.refreshToken,
      refreshTokenExpiresAt: rotated.refreshTokenExpiresAt,
      tokenType: 'Bearer',
      expiresIn,
      session: {
        id: rotated.session.id,
        deviceId: rotated.session.deviceId,
        expiresAt: rotated.session.expiresAt,
        refreshTokenId: rotated.refreshTokenId,
      },
    };
  }

  private async assertRateLimit(surface: AuthRateLimitSurface, key: string) {
    try {
      await this.operationalControl.assertRateLimit({ surface, key });
    } catch (error) {
      if (error instanceof AuthRateLimitExceededError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many authentication attempts',
            retryAfterSeconds: error.retryAfterSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error instanceof AuthOperationalControlUnavailableError) {
        throw new ServiceUnavailableException(
          'Authentication rate-limit control unavailable',
        );
      }

      throw error;
    }
  }

  private async recordOperationalEvent(kind: AuthOperationalEventKind) {
    try {
      await this.operationalControl.record({ kind });
    } catch {
      // Metrics are advisory; rate-limit and repository checks remain the
      // fail-closed authorization boundaries.
    }
  }

  private toAccountRoles(roleNames: string[]): AccountRole[] {
    const roles = roleNames.filter((role): role is AccountRole =>
      accountRoles.includes(role as AccountRole),
    );

    return roles.length > 0 ? roles : ['STUDENT'];
  }

  private async assertLoginAllowed(
    userId: string,
    status: string,
    roles: AccountRole[],
  ) {
    if (status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Tài khoản chưa được kích hoạt. Vui lòng chờ duyệt thanh toán hoặc liên hệ bộ phận hỗ trợ.',
      );
    }

    const needsActiveSubscription = roles.some((role) =>
      ['STUDENT'].includes(role),
    );

    if (!needsActiveSubscription) {
      return;
    }

    // Legacy STUDENT role subscription check — find via childProfiles
    const now = new Date();
    const childProfiles = await this.prisma.childProfile.findMany({
      where: { parentId: userId },
      select: { id: true },
    });
    const childIds = childProfiles.map((c) => c.id);

    const activeSubscription =
      childIds.length > 0
        ? await this.prisma.subscription.findFirst({
            where: {
              childProfileId: { in: childIds },
              status: { in: ['TRIALING', 'ACTIVE'] },
              currentPeriodStart: { lte: now },
              currentPeriodEnd: { gt: now },
            },
            orderBy: { currentPeriodEnd: 'desc' },
          })
        : null;

    if (activeSubscription) {
      return;
    }

    const latestSubscription =
      childIds.length > 0
        ? await this.prisma.subscription.findFirst({
            where: { childProfileId: { in: childIds } },
            orderBy: { currentPeriodEnd: 'desc' },
          })
        : null;

    if (latestSubscription) {
      await this.prisma.subscription.updateMany({
        where: {
          childProfileId: { in: childIds },
          status: { in: ['TRIALING', 'ACTIVE', 'PAST_DUE'] },
          currentPeriodEnd: { lte: now },
        },
        data: { status: 'EXPIRED' },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: 'SUSPENDED' },
      });

      throw new UnauthorizedException(
        'Bạn đã hết thời gian sử dụng. Vui lòng gia hạn dịch vụ hoặc liên hệ số hỗ trợ để được kích hoạt lại.',
      );
    }

    throw new UnauthorizedException(
      'Tài khoản chưa có gói sử dụng đang hoạt động. Vui lòng hoàn tất thanh toán và chờ vận hành duyệt.',
    );
  }

  private async getDemoAccount(email: string, password: string) {
    const account = demoAccounts[email];

    if (!account || password !== 'Demo@12345') {
      return null;
    }

    return this.buildLoginResponse({
      userId: account.id,
      email,
      displayName: account.displayName,
      roles: account.roles,
    });
  }

  async logout(user: { sub: string; sid?: string }) {
    if (user.sid) {
      await this.authSessions.endSession(user.sid, user.sub);
    }

    return {
      success: true,
      sessionEnded: Boolean(user.sid),
    };
  }

  async forgotPassword(email: string) {
    // Always return success to prevent user enumeration
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    if (user) {
      // Invalidate any existing tokens first
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const appUrl =
        this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
      void this.notification.sendForgotPassword(user.email, token, appUrl);
    }

    return {
      message:
        'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true } } },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    const salt = randomUUID();
    const hash = scryptSync(newPassword, salt, 64).toString('hex');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: `${salt}:${hash}` },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return {
      message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.',
    };
  }
}
