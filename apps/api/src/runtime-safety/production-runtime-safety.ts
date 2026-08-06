export type RuntimeEnvironment = Record<string, string | undefined>;

export type ProductionRuntimeSafetyViolation = {
  code:
    | 'JWT_SECRET_REQUIRED'
    | 'JWT_SECRET_INSECURE'
    | 'CORS_ORIGIN_REQUIRED'
    | 'CORS_ORIGIN_INSECURE'
    | 'API_PUBLIC_URL_INSECURE'
    | 'WEB_PUBLIC_URL_INSECURE'
    | 'DATABASE_URL_INSECURE'
    | 'REDIS_URL_INSECURE'
    | 'LOCAL_DEMO_ROUTES_FORBIDDEN'
    | 'HOSTED_STAGING_NODE_ENV_INVALID'
    | 'PRODUCTION_FLAGS_FORBIDDEN'
    | 'HOSTED_STAGING_AUTH_PROVIDER_INVALID'
    | 'HOSTED_STAGING_AUTH_SECRET_INVALID'
    | 'HOSTED_STAGING_PUBLIC_API_INVALID'
    | 'HOSTED_STAGING_PROVIDER_NOT_DISABLED'
    | 'HOSTED_STAGING_UPLOADS_INVALID'
    | 'HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID';
  variable: string;
  message: string;
};

export type ProductionRuntimeSafetyReport = {
  productionMode: boolean;
  productionReady: false;
  productionEnabled: false;
  corsOrigin: true | string[];
  violations: ProductionRuntimeSafetyViolation[];
};

const insecureSecretValues = new Set([
  'change-me',
  'change-me-in-production',
  'dev-only-secret',
  'replace-me',
  'secret',
]);

const isProduction = (environment: RuntimeEnvironment) =>
  environment.NODE_ENV?.trim().toLowerCase() === 'production';

const isHostedStaging = (environment: RuntimeEnvironment) =>
  environment.DEPLOYMENT_ENVIRONMENT?.trim().toLowerCase() === 'hosted-staging';

const parseCorsOrigins = (rawValue: string | undefined) =>
  (rawValue ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isSecurePublicUrl = (rawValue: string | undefined) => {
  if (!rawValue) {
    return false;
  }

  try {
    const url = new URL(rawValue);
    return (
      url.protocol === 'https:' &&
      !['localhost', '127.0.0.1', '::1'].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

const isSecureDatabaseUrl = (rawValue: string | undefined) => {
  if (!rawValue) {
    return false;
  }

  try {
    const url = new URL(rawValue);
    return (
      ['postgres:', 'postgresql:'].includes(url.protocol) &&
      !['localhost', '127.0.0.1', '::1'].includes(url.hostname) &&
      !(url.username === 'minhhuong' && url.password === 'minhhuong')
    );
  } catch {
    return false;
  }
};

const isValidRedisUrl = (rawValue: string | undefined) => {
  if (!rawValue) return false;
  try {
    const url = new URL(rawValue);
    return (
      ['redis:', 'rediss:'].includes(url.protocol) &&
      Boolean(url.hostname) &&
      Boolean(url.password)
    );
  } catch {
    return false;
  }
};

const isFalse = (value: string | undefined) =>
  value?.trim().toLowerCase() === 'false';

export const inspectProductionRuntimeSafety = (
  environment: RuntimeEnvironment,
): ProductionRuntimeSafetyReport => {
  const productionMode = isProduction(environment);
  const hostedStagingMode = isHostedStaging(environment);
  const corsOrigins = parseCorsOrigins(environment.CORS_ORIGIN);
  const violations: ProductionRuntimeSafetyViolation[] = [];

  if (!productionMode) {
    if (hostedStagingMode) {
      violations.push({
        code: 'HOSTED_STAGING_NODE_ENV_INVALID',
        variable: 'NODE_ENV',
        message: 'Hosted staging must run optimized production-mode builds.',
      });
    }
    return {
      productionMode: false,
      productionReady: false,
      productionEnabled: false,
      corsOrigin: corsOrigins.length > 0 ? corsOrigins : true,
      violations,
    };
  }

  const jwtSecret = environment.JWT_SECRET?.trim();
  if (!jwtSecret) {
    violations.push({
      code: 'JWT_SECRET_REQUIRED',
      variable: 'JWT_SECRET',
      message: 'JWT_SECRET is required in production.',
    });
  } else if (
    jwtSecret.length < 32 ||
    insecureSecretValues.has(jwtSecret.toLowerCase())
  ) {
    violations.push({
      code: 'JWT_SECRET_INSECURE',
      variable: 'JWT_SECRET',
      message:
        'JWT_SECRET must be at least 32 characters and must not use a documented placeholder.',
    });
  }

  if (corsOrigins.length === 0) {
    violations.push({
      code: 'CORS_ORIGIN_REQUIRED',
      variable: 'CORS_ORIGIN',
      message: 'CORS_ORIGIN must be an explicit HTTPS allowlist in production.',
    });
  } else if (
    corsOrigins.some((origin) => origin === '*' || !isSecurePublicUrl(origin))
  ) {
    violations.push({
      code: 'CORS_ORIGIN_INSECURE',
      variable: 'CORS_ORIGIN',
      message:
        'CORS_ORIGIN must contain only explicit non-local HTTPS origins in production.',
    });
  }

  if (!isSecurePublicUrl(environment.API_PUBLIC_URL)) {
    violations.push({
      code: 'API_PUBLIC_URL_INSECURE',
      variable: 'API_PUBLIC_URL',
      message: 'API_PUBLIC_URL must be a non-local HTTPS URL in production.',
    });
  }

  if (!isSecurePublicUrl(environment.WEB_PUBLIC_URL)) {
    violations.push({
      code: 'WEB_PUBLIC_URL_INSECURE',
      variable: 'WEB_PUBLIC_URL',
      message: 'WEB_PUBLIC_URL must be a non-local HTTPS URL in production.',
    });
  }

  if (!isSecureDatabaseUrl(environment.DATABASE_URL)) {
    violations.push({
      code: 'DATABASE_URL_INSECURE',
      variable: 'DATABASE_URL',
      message:
        'DATABASE_URL must be a non-local PostgreSQL URL and must not use the local demo credentials in production.',
    });
  }

  if (environment.LOCAL_DEMO_ROUTES_ENABLED?.toLowerCase() === 'true') {
    violations.push({
      code: 'LOCAL_DEMO_ROUTES_FORBIDDEN',
      variable: 'LOCAL_DEMO_ROUTES_ENABLED',
      message: 'Local-demo routes cannot be enabled in production.',
    });
  }

  if (
    environment.PRODUCTION_READY?.toLowerCase() === 'true' ||
    environment.PRODUCTION_ENABLED?.toLowerCase() === 'true'
  ) {
    violations.push({
      code: 'PRODUCTION_FLAGS_FORBIDDEN',
      variable: 'PRODUCTION_READY,PRODUCTION_ENABLED',
      message:
        'This release candidate cannot run with production readiness or enablement flags.',
    });
  }

  if (hostedStagingMode) {
    if (!isFalse(environment.LOCAL_DEMO_ROUTES_ENABLED)) {
      violations.push({
        code: 'LOCAL_DEMO_ROUTES_FORBIDDEN',
        variable: 'LOCAL_DEMO_ROUTES_ENABLED',
        message: 'Hosted staging requires explicit local-demo route denial.',
      });
    }

    if (
      !isFalse(environment.PRODUCTION_READY) ||
      !isFalse(environment.PRODUCTION_ENABLED)
    ) {
      violations.push({
        code: 'PRODUCTION_FLAGS_FORBIDDEN',
        variable: 'PRODUCTION_READY,PRODUCTION_ENABLED',
        message:
          'Hosted staging requires explicit false production readiness and enablement flags.',
      });
    }

    if (!isValidRedisUrl(environment.REDIS_URL)) {
      violations.push({
        code: 'REDIS_URL_INSECURE',
        variable: 'REDIS_URL',
        message: 'Hosted staging requires an authenticated Redis URL.',
      });
    }

    if (!isSecurePublicUrl(environment.NEXT_PUBLIC_API_URL)) {
      violations.push({
        code: 'HOSTED_STAGING_PUBLIC_API_INVALID',
        variable: 'NEXT_PUBLIC_API_URL',
        message:
          'Hosted staging requires an explicit non-local HTTPS browser API URL.',
      });
    }

    const authProviders = [
      environment.AUTH_SESSION_STORE_PROVIDER,
      environment.AUTH_OPERATIONAL_CONTROL_PROVIDER,
      environment.AUTH_OPERATIONAL_ALERT_STATE_PROVIDER,
    ];
    if (
      authProviders.some((provider) => provider?.toLowerCase() !== 'prisma')
    ) {
      violations.push({
        code: 'HOSTED_STAGING_AUTH_PROVIDER_INVALID',
        variable:
          'AUTH_SESSION_STORE_PROVIDER,AUTH_OPERATIONAL_CONTROL_PROVIDER,AUTH_OPERATIONAL_ALERT_STATE_PROVIDER',
        message: 'Hosted staging requires shared Prisma auth providers.',
      });
    }

    const operationalKeySecret =
      environment.AUTH_OPERATIONAL_CONTROL_KEY_SECRET?.trim();
    if (
      !operationalKeySecret ||
      operationalKeySecret.length < 32 ||
      insecureSecretValues.has(operationalKeySecret.toLowerCase())
    ) {
      violations.push({
        code: 'HOSTED_STAGING_AUTH_SECRET_INVALID',
        variable: 'AUTH_OPERATIONAL_CONTROL_KEY_SECRET',
        message:
          'Hosted staging requires an independent auth operational key secret of at least 32 characters.',
      });
    }

    const disabledProviders = [
      environment.NOTIFICATION_PROVIDER,
      environment.PAYMENT_PROVIDER,
      environment.AI_PROVIDER,
      environment.VIDEO_PROVIDER,
    ];
    if (
      disabledProviders.some(
        (provider) => provider?.toLowerCase() !== 'disabled',
      )
    ) {
      violations.push({
        code: 'HOSTED_STAGING_PROVIDER_NOT_DISABLED',
        variable:
          'NOTIFICATION_PROVIDER,PAYMENT_PROVIDER,AI_PROVIDER,VIDEO_PROVIDER',
        message: 'All live provider lanes must be disabled in hosted staging.',
      });
    }

    const uploadProvider =
      environment.UPLOAD_STORAGE_PROVIDER?.trim().toLowerCase();
    const filesystemEmergencyOverride =
      environment.UPLOAD_HOSTED_FILESYSTEM_EMERGENCY_OVERRIDE?.trim().toLowerCase() ===
      'true';
    const s3TimeoutMs = Number(environment.UPLOAD_S3_TIMEOUT_MS);
    const s3MaxAttempts = Number(environment.UPLOAD_S3_MAX_ATTEMPTS);
    const s3Endpoint = environment.UPLOAD_S3_ENDPOINT?.trim();
    const localS3Smoke =
      environment.UPLOAD_S3_LOCAL_SMOKE?.trim().toLowerCase() === 'true';
    const s3EndpointSecure =
      !s3Endpoint ||
      (() => {
        try {
          const endpoint = new URL(s3Endpoint);
          return (
            endpoint.protocol === 'https:' ||
            (localS3Smoke &&
              endpoint.protocol === 'http:' &&
              ['minio', '127.0.0.1', 'localhost'].includes(endpoint.hostname))
          );
        } catch {
          return false;
        }
      })();
    const validS3 =
      uploadProvider === 's3' &&
      Boolean(environment.UPLOAD_S3_BUCKET?.trim()) &&
      Boolean(environment.UPLOAD_S3_REGION?.trim()) &&
      Boolean(environment.UPLOAD_S3_CREDENTIALS_REFERENCE?.trim()) &&
      Number.isInteger(s3TimeoutMs) &&
      s3TimeoutMs >= 100 &&
      s3TimeoutMs <= 30000 &&
      Number.isInteger(s3MaxAttempts) &&
      s3MaxAttempts >= 1 &&
      s3MaxAttempts <= 5 &&
      s3EndpointSecure;
    const validFilesystemEmergency =
      uploadProvider === 'filesystem' &&
      filesystemEmergencyOverride &&
      environment.UPLOADS_PATH?.startsWith('/');

    if (!validS3 && !validFilesystemEmergency) {
      violations.push({
        code: 'HOSTED_STAGING_UPLOADS_INVALID',
        variable:
          'UPLOAD_STORAGE_PROVIDER,UPLOAD_S3_BUCKET,UPLOAD_S3_REGION,UPLOAD_S3_CREDENTIALS_REFERENCE,UPLOAD_S3_TIMEOUT_MS,UPLOAD_S3_MAX_ATTEMPTS,UPLOAD_S3_ENDPOINT',
        message:
          'Hosted staging requires valid private S3 configuration; filesystem requires an explicit single-instance emergency override.',
      });
    }

    const validTopology = validS3
      ? environment.UPLOAD_STORAGE_TOPOLOGY?.trim().toLowerCase() ===
          'shared-object' && environment.API_REPLICA_COUNT?.trim() === '1'
      : validFilesystemEmergency
        ? environment.UPLOAD_STORAGE_TOPOLOGY?.trim().toLowerCase() ===
            'single-instance' && environment.API_REPLICA_COUNT?.trim() === '1'
        : false;
    if (!validTopology) {
      violations.push({
        code: 'HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID',
        variable: 'UPLOAD_STORAGE_TOPOLOGY,API_REPLICA_COUNT',
        message:
          'Hosted S3 requires shared-object topology and one initial API replica; emergency filesystem requires single-instance topology and one replica.',
      });
    }
  }

  return {
    productionMode: true,
    productionReady: false,
    productionEnabled: false,
    corsOrigin: corsOrigins,
    violations,
  };
};

export const assertProductionRuntimeSafety = (
  environment: RuntimeEnvironment,
) => {
  const report = inspectProductionRuntimeSafety(environment);

  if (report.violations.length > 0) {
    throw new Error(
      `Production runtime safety validation failed: ${report.violations
        .map((violation) => `${violation.code}(${violation.variable})`)
        .join(', ')}`,
    );
  }

  return report;
};

export const resolveJwtSecret = (environment: RuntimeEnvironment) => {
  const jwtSecret = environment.JWT_SECRET?.trim();

  if (isProduction(environment)) {
    const report = inspectProductionRuntimeSafety({
      NODE_ENV: environment.NODE_ENV,
      JWT_SECRET: jwtSecret,
      CORS_ORIGIN: 'https://jwt-validation.invalid',
      API_PUBLIC_URL: 'https://jwt-validation.invalid',
      WEB_PUBLIC_URL: 'https://jwt-validation.invalid',
      DATABASE_URL:
        'postgresql://runtime_validation:runtime_validation@db.invalid:5432/runtime_validation',
    });
    const jwtViolation = report.violations.find((violation) =>
      violation.code.startsWith('JWT_SECRET_'),
    );

    if (jwtViolation) {
      throw new Error(
        `Production JWT configuration failed: ${jwtViolation.code}`,
      );
    }
  }

  return jwtSecret || 'dev-only-secret';
};
