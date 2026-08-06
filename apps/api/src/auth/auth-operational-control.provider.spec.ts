import { resolveAuthOperationalControlProvider } from './auth-operational-control.provider';

describe('resolveAuthOperationalControlProvider', () => {
  it('defaults to the fixture only outside production', () => {
    expect(resolveAuthOperationalControlProvider({})).toBe('fixture');
    expect(resolveAuthOperationalControlProvider({ NODE_ENV: 'test' })).toBe(
      'fixture',
    );
  });

  it('accepts explicit fixture and Prisma providers outside production', () => {
    expect(
      resolveAuthOperationalControlProvider({
        NODE_ENV: 'staging',
        AUTH_OPERATIONAL_CONTROL_PROVIDER: 'fixture',
      }),
    ).toBe('fixture');
    expect(
      resolveAuthOperationalControlProvider({
        NODE_ENV: 'test',
        AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
      }),
    ).toBe('prisma');
  });

  it('keeps every provider blocked in production pending manual approval', () => {
    expect(() =>
      resolveAuthOperationalControlProvider({ NODE_ENV: 'production' }),
    ).toThrow('requires separate retention');
    expect(() =>
      resolveAuthOperationalControlProvider({
        NODE_ENV: 'production',
        AUTH_OPERATIONAL_CONTROL_PROVIDER: 'fixture',
      }),
    ).toThrow('requires separate retention');
    expect(() =>
      resolveAuthOperationalControlProvider({
        NODE_ENV: 'production',
        AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
      }),
    ).toThrow('requires separate retention');
  });

  it('allows only the shared Prisma provider for production-mode hosted staging', () => {
    expect(
      resolveAuthOperationalControlProvider({
        NODE_ENV: 'production',
        DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
        AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
      }),
    ).toBe('prisma');
    expect(() =>
      resolveAuthOperationalControlProvider({
        NODE_ENV: 'production',
        DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
        AUTH_OPERATIONAL_CONTROL_PROVIDER: 'fixture',
      }),
    ).toThrow('Hosted staging requires');
  });

  it('rejects an unimplemented external provider name', () => {
    expect(() =>
      resolveAuthOperationalControlProvider({
        NODE_ENV: 'development',
        AUTH_OPERATIONAL_CONTROL_PROVIDER: 'external',
      }),
    ).toThrow('must be explicitly set to fixture or prisma');
  });
});
