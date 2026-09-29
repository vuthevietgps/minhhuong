import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalDemoOnlyGuard } from '../runtime-safety/local-demo-only.guard';
import {
  assertProductionRuntimeSafety,
  inspectProductionRuntimeSafety,
  resolveJwtSecret,
  RuntimeEnvironment,
} from '../runtime-safety/production-runtime-safety';
import {
  buildLearningProductionRuntimeGateMatrixReport,
  toLearningProductionRuntimeGateMatrixMarkdown,
} from './production-runtime-gate-matrix';

const secureProductionEnvironment: RuntimeEnvironment = {
  NODE_ENV: 'production',
  JWT_SECRET: 'release-candidate-secret-with-more-than-32-characters',
  CORS_ORIGIN:
    'https://learn.minhhuong.example,https://admin.minhhuong.example',
  API_PUBLIC_URL: 'https://api.minhhuong.example',
  WEB_PUBLIC_URL: 'https://learn.minhhuong.example',
  DATABASE_URL:
    'postgresql://learning_app:non_demo_password@postgres.internal.example:5432/learning',
  LOCAL_DEMO_ROUTES_ENABLED: 'false',
};

describe('LearningLocalDemoProductionRuntimeSafety', () => {
  it('accepts an explicit production runtime allowlist without claiming readiness', () => {
    const report = assertProductionRuntimeSafety(secureProductionEnvironment);

    expect(report.productionMode).toBe(true);
    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
    expect(report.violations).toEqual([]);
    expect(report.corsOrigin).toEqual([
      'https://learn.minhhuong.example',
      'https://admin.minhhuong.example',
    ]);
  });

  it('fails closed on insecure production secrets, CORS, URLs, database, and demo routes', () => {
    const report = inspectProductionRuntimeSafety({
      NODE_ENV: 'production',
      JWT_SECRET: 'change-me-in-production',
      CORS_ORIGIN: '*,http://localhost:3000',
      API_PUBLIC_URL: 'http://localhost:4000',
      WEB_PUBLIC_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong',
      LOCAL_DEMO_ROUTES_ENABLED: 'true',
    });

    expect(report.violations.map((violation) => violation.code)).toEqual(
      expect.arrayContaining([
        'JWT_SECRET_INSECURE',
        'CORS_ORIGIN_INSECURE',
        'API_PUBLIC_URL_INSECURE',
        'WEB_PUBLIC_URL_INSECURE',
        'DATABASE_URL_INSECURE',
        'LOCAL_DEMO_ROUTES_FORBIDDEN',
      ]),
    );
    expect(() =>
      assertProductionRuntimeSafety({
        NODE_ENV: 'production',
      }),
    ).toThrow('Production runtime safety validation failed');
  });

  it('keeps development fallback behavior local while rejecting it in production', () => {
    expect(resolveJwtSecret({ NODE_ENV: 'development' })).toBe(
      'dev-only-secret',
    );
    expect(
      inspectProductionRuntimeSafety({
        NODE_ENV: 'development',
      }).corsOrigin,
    ).toBe(true);
    expect(() =>
      resolveJwtSecret({
        NODE_ENV: 'production',
        JWT_SECRET: 'dev-only-secret',
      }),
    ).toThrow('Production JWT configuration failed: JWT_SECRET_INSECURE');
  });

  it('hides local-demo controllers in production and allows local fixture use', () => {
    const productionGuard = new LocalDemoOnlyGuard({
      get: jest.fn().mockReturnValue('production'),
    } as unknown as ConfigService);
    const localGuard = new LocalDemoOnlyGuard({
      get: jest.fn().mockReturnValue('test'),
    } as unknown as ConfigService);
    const context = {} as ExecutionContext;

    expect(() => productionGuard.canActivate(context)).toThrow(
      NotFoundException,
    );
    expect(localGuard.canActivate(context)).toBe(true);
  });

  it('accepts the explicit hosted-staging contract while keeping live providers off', () => {
    const report = assertProductionRuntimeSafety({
      ...secureProductionEnvironment,
      DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
      PRODUCTION_READY: 'false',
      PRODUCTION_ENABLED: 'false',
      REDIS_URL: 'redis://:synthetic-password@redis.internal:6379/0',
      NEXT_PUBLIC_API_URL: 'https://api.staging.minhhuong.example',
      AUTH_SESSION_STORE_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_CONTROL_KEY_SECRET:
        'staging-operational-key-secret-more-than-32-characters',
      NOTIFICATION_PROVIDER: 'disabled',
      PAYMENT_PROVIDER: 'disabled',
      AI_PROVIDER: 'disabled',
      VIDEO_PROVIDER: 'disabled',
      UPLOAD_STORAGE_PROVIDER: 's3',
      UPLOAD_STORAGE_TOPOLOGY: 'shared-object',
      UPLOAD_S3_BUCKET: 'synthetic-private-bucket',
      UPLOAD_S3_REGION: 'us-east-1',
      UPLOAD_S3_CREDENTIALS_REFERENCE: 'synthetic-secret-reference',
      UPLOAD_S3_TIMEOUT_MS: '5000',
      UPLOAD_S3_MAX_ATTEMPTS: '3',
      API_REPLICA_COUNT: '1',
    });

    expect(report.violations).toEqual([]);
    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
  });

  it('rejects unsafe hosted-staging providers and production flags', () => {
    const report = inspectProductionRuntimeSafety({
      ...secureProductionEnvironment,
      DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
      PRODUCTION_READY: 'true',
      PRODUCTION_ENABLED: 'false',
      REDIS_URL: 'redis://redis.internal:6379',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      LOCAL_DEMO_ROUTES_ENABLED: 'true',
      AUTH_SESSION_STORE_PROVIDER: 'fixture',
      AUTH_OPERATIONAL_CONTROL_PROVIDER: 'fixture',
      AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'fixture',
      AUTH_OPERATIONAL_CONTROL_KEY_SECRET: 'short',
      NOTIFICATION_PROVIDER: 'smtp',
      PAYMENT_PROVIDER: 'stripe',
      AI_PROVIDER: 'openai',
      VIDEO_PROVIDER: 'external',
      UPLOAD_STORAGE_PROVIDER: 'object',
      UPLOADS_PATH: 'relative/uploads',
    });

    expect(report.violations.map((violation) => violation.code)).toEqual(
      expect.arrayContaining([
        'PRODUCTION_FLAGS_FORBIDDEN',
        'REDIS_URL_INSECURE',
        'LOCAL_DEMO_ROUTES_FORBIDDEN',
        'HOSTED_STAGING_AUTH_PROVIDER_INVALID',
        'HOSTED_STAGING_AUTH_SECRET_INVALID',
        'HOSTED_STAGING_PUBLIC_API_INVALID',
        'HOSTED_STAGING_PROVIDER_NOT_DISABLED',
        'HOSTED_STAGING_UPLOADS_INVALID',
        'HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID',
      ]),
    );
  });

  it('blocks a separate live video AI provider in hosted staging', () => {
    const report = inspectProductionRuntimeSafety({
      ...secureProductionEnvironment,
      DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
      NOTIFICATION_PROVIDER: 'disabled',
      PAYMENT_PROVIDER: 'disabled',
      AI_PROVIDER: 'disabled',
      AI_CONTEXT_PROVIDER: 'deepinfra',
      VIDEO_PROVIDER: 'disabled',
    });
    expect(report.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'HOSTED_STAGING_PROVIDER_NOT_DISABLED',
          variable: expect.stringContaining('AI_CONTEXT_PROVIDER') as string,
        }),
      ]),
    );
  });

  it('builds deterministic go-live blocker evidence for the remaining external gates', () => {
    const report = buildLearningProductionRuntimeGateMatrixReport(
      '2026-07-10T03:00:00.000Z',
    );
    const markdown = toLearningProductionRuntimeGateMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
    expect(report.decision).toBe('GO_LIVE_BLOCKED');
    expect(report.totals).toEqual({
      gateCount: 9,
      closedByCodeCount: 2,
      stagingBlockerCount: 5,
      manualApprovalBlockerCount: 2,
      productionBlockerCount: 7,
      gatesWithEvidencePathCount: 9,
      gatesWithNextEvidenceCount: 7,
      productionReadyClaimCount: 0,
      openSafetyGateCount: 0,
    });
    expect(
      report.rows
        .filter((row) => row.productionBlocker)
        .every((row) => row.requiredNextEvidence.length > 0),
    ).toBe(true);
    expect(report.rows.map((row) => row.gateId)).toEqual(
      expect.arrayContaining([
        'runtime-config-fail-closed',
        'local-demo-route-containment',
        'migration-and-rollback-rehearsal',
        'backup-and-restore-rehearsal',
        'monitoring-alerting-and-incident-runbook',
        'privacy-audit-and-retention',
        'auth-persistence-and-distributed-revocation',
        'live-provider-execution-gates',
        'manual-go-live-approval',
      ]),
    );
    expect(markdown).toContain('decision=GO_LIVE_BLOCKED');
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Production blockers: 7');
    expect(markdown).toContain('productionDeployUsed=false');
  });
});
