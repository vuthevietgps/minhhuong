import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import {
  AUTH_OPERATIONAL_ALERT_STATE,
  FixtureBackedAuthOperationalAlertState,
} from './auth-operational-alert-state';
import {
  AUTH_OPERATIONAL_CONTROL,
  FixtureBackedAuthOperationalControl,
} from './auth-operational-control';
import { AuthModule } from './auth.module';
import {
  AUTH_SESSION_STORE,
  FixtureBackedAuthSessionStore,
} from './auth-session.store';

describe('AuthModule provider bootstrap', () => {
  it('constructs zero-argument fixture providers without DI option tokens', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              NODE_ENV: 'test',
              AUTH_SESSION_STORE_PROVIDER: 'fixture',
              AUTH_OPERATIONAL_CONTROL_PROVIDER: 'fixture',
              AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'fixture',
              JWT_SECRET: 'local-auth-module-provider-test-secret',
            }),
          ],
        }),
        PrismaModule,
        AuthModule,
      ],
    }).compile();

    expect(moduleRef.get(AUTH_SESSION_STORE)).toBeInstanceOf(
      FixtureBackedAuthSessionStore,
    );
    expect(moduleRef.get(AUTH_OPERATIONAL_CONTROL)).toBeInstanceOf(
      FixtureBackedAuthOperationalControl,
    );
    expect(moduleRef.get(AUTH_OPERATIONAL_ALERT_STATE)).toBeInstanceOf(
      FixtureBackedAuthOperationalAlertState,
    );

    await moduleRef.close();
  });
});
