import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notifications/notification.module';
import { resolveJwtSecret } from '../runtime-safety/production-runtime-safety';
import {
  AUTH_OPERATIONAL_CONTROL,
  FixtureBackedAuthOperationalControl,
} from './auth-operational-control';
import { AuthOperationalControlCleanupJob } from './auth-operational-control-cleanup.job';
import {
  AUTH_OPERATIONAL_ALERT_STATE,
  FixtureBackedAuthOperationalAlertState,
} from './auth-operational-alert-state';
import { AuthOperationalAlertStateCleanupJob } from './auth-operational-alert-state-cleanup.job';
import { resolveAuthOperationalAlertStateProvider } from './auth-operational-alert-state.provider';
import { AuthOperationalAlertPolicyService } from './auth-operational-alert-policy';
import { AuthOperationalAlertsController } from './auth-operational-alerts.controller';
import { AuthOperationalAlertAuditReadService } from './auth-operational-alert-audit-read-model';
import { AuthOperationalAlertAuditsController } from './auth-operational-alert-audits.controller';
import { resolveAuthOperationalControlProvider } from './auth-operational-control.provider';
import { AuthController } from './auth.controller';
import { PrismaAuthOperationalControl } from './prisma-auth-operational-control';
import { PrismaAuthOperationalAlertState } from './prisma-auth-operational-alert-state';
import { AuthSessionService } from './auth-session.service';
import { resolveAuthSessionStoreProvider } from './auth-session-store.provider';
import {
  AUTH_SESSION_STORE,
  FixtureBackedAuthSessionStore,
} from './auth-session.store';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaAuthSessionStore } from './prisma-auth-session.store';
import { RolesGuard } from './roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: resolveJwtSecret({
          NODE_ENV: config.get<string>('NODE_ENV'),
          JWT_SECRET: config.get<string>('JWT_SECRET'),
        }),
        signOptions: { expiresIn: '30m' },
      }),
    }),
    NotificationModule,
  ],
  controllers: [
    AuthController,
    AuthOperationalAlertsController,
    AuthOperationalAlertAuditsController,
  ],
  providers: [
    AuthService,
    AuthSessionService,
    {
      provide: FixtureBackedAuthOperationalControl,
      useFactory: () => new FixtureBackedAuthOperationalControl(),
    },
    {
      provide: FixtureBackedAuthOperationalAlertState,
      useFactory: () => new FixtureBackedAuthOperationalAlertState(),
    },
    PrismaAuthOperationalAlertState,
    {
      provide: AUTH_OPERATIONAL_ALERT_STATE,
      inject: [
        ConfigService,
        FixtureBackedAuthOperationalAlertState,
        PrismaAuthOperationalAlertState,
      ],
      useFactory: (
        config: ConfigService,
        fixtureState: FixtureBackedAuthOperationalAlertState,
        prismaState: PrismaAuthOperationalAlertState,
      ) => {
        const provider = resolveAuthOperationalAlertStateProvider({
          NODE_ENV: config.get<string>('NODE_ENV'),
          DEPLOYMENT_ENVIRONMENT: config.get<string>('DEPLOYMENT_ENVIRONMENT'),
          AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: config.get<string>(
            'AUTH_OPERATIONAL_ALERT_STATE_PROVIDER',
          ),
        });
        return provider === 'prisma' ? prismaState : fixtureState;
      },
    },
    {
      provide: AUTH_OPERATIONAL_CONTROL,
      inject: [
        ConfigService,
        PrismaService,
        FixtureBackedAuthOperationalControl,
      ],
      useFactory: (
        config: ConfigService,
        prisma: PrismaService,
        fixtureControl: FixtureBackedAuthOperationalControl,
      ) => {
        const provider = resolveAuthOperationalControlProvider({
          NODE_ENV: config.get<string>('NODE_ENV'),
          DEPLOYMENT_ENVIRONMENT: config.get<string>('DEPLOYMENT_ENVIRONMENT'),
          AUTH_OPERATIONAL_CONTROL_PROVIDER: config.get<string>(
            'AUTH_OPERATIONAL_CONTROL_PROVIDER',
          ),
        });
        if (provider === 'fixture') {
          return fixtureControl;
        }

        return new PrismaAuthOperationalControl(prisma, {
          keySecret:
            config.get<string>('AUTH_OPERATIONAL_CONTROL_KEY_SECRET') ?? '',
        });
      },
    },
    {
      provide: FixtureBackedAuthSessionStore,
      useFactory: () => new FixtureBackedAuthSessionStore(),
    },
    PrismaAuthSessionStore,
    {
      provide: AUTH_SESSION_STORE,
      inject: [
        ConfigService,
        FixtureBackedAuthSessionStore,
        PrismaAuthSessionStore,
      ],
      useFactory: (
        config: ConfigService,
        fixtureStore: FixtureBackedAuthSessionStore,
        prismaStore: PrismaAuthSessionStore,
      ) => {
        const provider = resolveAuthSessionStoreProvider({
          NODE_ENV: config.get<string>('NODE_ENV'),
          DEPLOYMENT_ENVIRONMENT: config.get<string>('DEPLOYMENT_ENVIRONMENT'),
          AUTH_SESSION_STORE_PROVIDER: config.get<string>(
            'AUTH_SESSION_STORE_PROVIDER',
          ),
        });
        return provider === 'prisma' ? prismaStore : fixtureStore;
      },
    },
    AuthOperationalControlCleanupJob,
    AuthOperationalAlertStateCleanupJob,
    AuthOperationalAlertPolicyService,
    AuthOperationalAlertAuditReadService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    AuthSessionService,
    AUTH_OPERATIONAL_CONTROL,
    AUTH_OPERATIONAL_ALERT_STATE,
    AuthOperationalAlertPolicyService,
    AuthOperationalAlertAuditReadService,
    JwtModule,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
