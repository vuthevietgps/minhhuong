export type AuthOperationalAlertStateProvider = 'fixture' | 'prisma';

export const resolveAuthOperationalAlertStateProvider = (input: {
  NODE_ENV?: string;
  DEPLOYMENT_ENVIRONMENT?: string;
  AUTH_OPERATIONAL_ALERT_STATE_PROVIDER?: string;
}): AuthOperationalAlertStateProvider => {
  const environment = input.NODE_ENV?.trim().toLowerCase() || 'development';
  const configured =
    input.AUTH_OPERATIONAL_ALERT_STATE_PROVIDER?.trim().toLowerCase() ||
    (environment === 'production' ? '' : 'fixture');

  const hostedStaging =
    input.DEPLOYMENT_ENVIRONMENT?.trim().toLowerCase() === 'hosted-staging';

  if (environment === 'production' && !hostedStaging) {
    throw new Error(
      'Production AUTH_OPERATIONAL_ALERT_STATE activation requires separate retention, alert routing, incident, security, migration, and manual go-live approval',
    );
  }

  if (hostedStaging && configured !== 'prisma') {
    throw new Error(
      'Hosted staging requires AUTH_OPERATIONAL_ALERT_STATE_PROVIDER=prisma',
    );
  }

  if (configured !== 'fixture' && configured !== 'prisma') {
    throw new Error(
      'AUTH_OPERATIONAL_ALERT_STATE_PROVIDER must be explicitly set to fixture or prisma',
    );
  }

  return configured;
};
