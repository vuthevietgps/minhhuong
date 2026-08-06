import { resolveAuthOperationalAlertStateProvider } from './auth-operational-alert-state.provider';

describe('resolveAuthOperationalAlertStateProvider', () => {
  it('defaults to fixture only outside production', () => {
    expect(resolveAuthOperationalAlertStateProvider({})).toBe('fixture');
    expect(resolveAuthOperationalAlertStateProvider({ NODE_ENV: 'test' })).toBe(
      'fixture',
    );
  });

  it('accepts fixture and Prisma providers outside production', () => {
    expect(
      resolveAuthOperationalAlertStateProvider({
        NODE_ENV: 'test',
        AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'prisma',
      }),
    ).toBe('prisma');
    expect(
      resolveAuthOperationalAlertStateProvider({
        NODE_ENV: 'staging',
        AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'fixture',
      }),
    ).toBe('fixture');
  });

  it('blocks every production provider pending separate approval', () => {
    for (const provider of [undefined, 'fixture', 'prisma']) {
      expect(() =>
        resolveAuthOperationalAlertStateProvider({
          NODE_ENV: 'production',
          AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: provider,
        }),
      ).toThrow('requires separate retention');
    }
  });

  it('allows only shared Prisma state in production-mode hosted staging', () => {
    expect(
      resolveAuthOperationalAlertStateProvider({
        NODE_ENV: 'production',
        DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
        AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'prisma',
      }),
    ).toBe('prisma');
    expect(() =>
      resolveAuthOperationalAlertStateProvider({
        NODE_ENV: 'production',
        DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
        AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'fixture',
      }),
    ).toThrow('Hosted staging requires');
  });

  it('rejects an external provider name', () => {
    expect(() =>
      resolveAuthOperationalAlertStateProvider({
        NODE_ENV: 'test',
        AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'external',
      }),
    ).toThrow('must be explicitly set to fixture or prisma');
  });
});
