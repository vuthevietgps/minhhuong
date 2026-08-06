export type AuthSessionStoreProvider = 'fixture' | 'prisma';

export const resolveAuthSessionStoreProvider = (input: {
  NODE_ENV?: string;
  DEPLOYMENT_ENVIRONMENT?: string;
  AUTH_SESSION_STORE_PROVIDER?: string;
}): AuthSessionStoreProvider => {
  const environment = input.NODE_ENV?.trim().toLowerCase() || 'development';
  const configured = input.AUTH_SESSION_STORE_PROVIDER?.trim().toLowerCase();
  const provider =
    configured || (environment === 'production' ? '' : 'fixture');

  if (environment === 'production' && provider !== 'prisma') {
    throw new Error(
      'Production requires AUTH_SESSION_STORE_PROVIDER=prisma; fixture auth sessions are forbidden',
    );
  }

  if (provider !== 'fixture' && provider !== 'prisma') {
    throw new Error(
      'AUTH_SESSION_STORE_PROVIDER must be explicitly set to prisma or fixture',
    );
  }

  return provider;
};
