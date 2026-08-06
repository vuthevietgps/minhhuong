import { ConfigService } from '@nestjs/config';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FilesystemUploadStorageReadinessProbe } from '../health/dependency-readiness.service';
import { inspectProductionRuntimeSafety } from '../runtime-safety/production-runtime-safety';
import {
  buildStoredUploadFilename,
  filesystemUploadSurfaces,
  resolveFilesystemUploadDirectory,
} from '../upload-storage/filesystem-upload-storage';
import { buildLearningUploadStorageHardeningMatrixReport } from './upload-storage-hardening-matrix';

describe('learning local-demo upload storage hardening', () => {
  it('routes every realistic upload surface below one configured root', () => {
    const root = join(tmpdir(), 'mh-upload-contract');
    const environment = {
      UPLOAD_STORAGE_PROVIDER: 'filesystem',
      UPLOADS_PATH: root,
    };
    const resolved = Object.values(filesystemUploadSurfaces).map((surface) => ({
      surfaceId: surface.surfaceId,
      directory: resolveFilesystemUploadDirectory(surface, environment),
    }));

    expect(resolved).toHaveLength(4);
    expect(resolved.every((row) => row.directory.startsWith(root))).toBe(true);
    expect(new Set(resolved.map((row) => row.directory))).toEqual(
      new Set([join(root, 'videos'), join(root, 'invoices')]),
    );
  });

  it('sanitizes client filenames without retaining traversal syntax', () => {
    expect(buildStoredUploadFilename('../../Bai Hoc?.MP4', 'video', 123)).toBe(
      '123-bai-hoc.mp4',
    );
    expect(buildStoredUploadFilename('???.PDF', 'invoice', 456)).toBe(
      '456-invoice.pdf',
    );
  });

  it('fails hosted staging closed for filesystem multi-instance claims', () => {
    const report = inspectProductionRuntimeSafety({
      NODE_ENV: 'production',
      DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
      PRODUCTION_READY: 'false',
      PRODUCTION_ENABLED: 'false',
      LOCAL_DEMO_ROUTES_ENABLED: 'false',
      JWT_SECRET: 'synthetic-jwt-secret-at-least-thirty-two-characters',
      CORS_ORIGIN: 'https://learn.staging.example.test',
      API_PUBLIC_URL: 'https://api.staging.example.test',
      WEB_PUBLIC_URL: 'https://learn.staging.example.test',
      NEXT_PUBLIC_API_URL: 'https://api.staging.example.test',
      DATABASE_URL:
        'postgresql://synthetic:synthetic@postgres.internal:5432/synthetic',
      REDIS_URL: 'redis://:synthetic@redis.internal:6379/0',
      AUTH_SESSION_STORE_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_CONTROL_KEY_SECRET:
        'synthetic-control-secret-at-least-thirty-two-characters',
      NOTIFICATION_PROVIDER: 'disabled',
      PAYMENT_PROVIDER: 'disabled',
      AI_PROVIDER: 'disabled',
      VIDEO_PROVIDER: 'disabled',
      UPLOAD_STORAGE_PROVIDER: 'filesystem',
      UPLOADS_PATH: '/app/uploads',
      UPLOAD_STORAGE_TOPOLOGY: 'single-instance',
      API_REPLICA_COUNT: '2',
    });

    expect(report.violations.map((row) => row.code)).toContain(
      'HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID',
    );
  });

  it('proves writable storage readiness and removes its synthetic probe', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mh-upload-readiness-'));
    const config = {
      get: (key: string) =>
        ({
          UPLOAD_STORAGE_PROVIDER: 'filesystem',
          UPLOADS_PATH: join(root, 'uploads'),
        })[key],
    } as ConfigService;
    const probe = new FilesystemUploadStorageReadinessProbe(config);

    try {
      await expect(probe.ping()).resolves.toBe('filesystem');
      await expect(readdir(join(root, 'uploads'))).resolves.toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('exports deterministic surface and denied-case fixture evidence', () => {
    const report = buildLearningUploadStorageHardeningMatrixReport(
      '2026-07-11T00:00:00.000Z',
    );

    expect(report.totals).toEqual(
      expect.objectContaining({
        uploadSurfaceCount: 4,
        acceptedContractViolationCount: 0,
        deniedNegativeCaseCount: 3,
        unsafeAcceptedNegativeCaseCount: 0,
        openLocalSafetyGateCount: 0,
      }),
    );
    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
  });
});
