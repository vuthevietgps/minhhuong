import { resolveAuthSessionStoreProvider } from './auth-session-store.provider';

describe('AuthSessionStore provider selection', () => {
  it('keeps local demo fixture-backed unless Prisma is explicitly requested', () => {
    expect(resolveAuthSessionStoreProvider({ NODE_ENV: 'test' })).toBe(
      'fixture',
    );
    expect(
      resolveAuthSessionStoreProvider({
        NODE_ENV: 'development',
        AUTH_SESSION_STORE_PROVIDER: 'prisma',
      }),
    ).toBe('prisma');
  });

  it('requires Prisma explicitly in production', () => {
    expect(() =>
      resolveAuthSessionStoreProvider({ NODE_ENV: 'production' }),
    ).toThrow('Production requires AUTH_SESSION_STORE_PROVIDER=prisma');
    expect(() =>
      resolveAuthSessionStoreProvider({
        NODE_ENV: 'production',
        AUTH_SESSION_STORE_PROVIDER: 'fixture',
      }),
    ).toThrow('Production requires AUTH_SESSION_STORE_PROVIDER=prisma');
    expect(
      resolveAuthSessionStoreProvider({
        NODE_ENV: 'production',
        AUTH_SESSION_STORE_PROVIDER: 'prisma',
      }),
    ).toBe('prisma');
  });

  it('rejects unknown providers instead of silently falling back', () => {
    expect(() =>
      resolveAuthSessionStoreProvider({
        NODE_ENV: 'staging',
        AUTH_SESSION_STORE_PROVIDER: 'memory',
      }),
    ).toThrow('AUTH_SESSION_STORE_PROVIDER must be explicitly set');
  });
});
