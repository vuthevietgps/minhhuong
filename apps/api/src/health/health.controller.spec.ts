import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import {
  DependencyReadinessService,
  RuntimeMetricsService,
} from './dependency-readiness.service';

describe('HealthController', () => {
  const metrics = new RuntimeMetricsService();

  it('keeps liveness independent from database and Redis readiness', () => {
    const readiness = {
      check: jest.fn(),
    } as unknown as DependencyReadinessService;
    const controller = new HealthController(readiness, metrics);

    expect(controller.liveness()).toEqual(
      expect.objectContaining({
        status: 'ok',
        productionReady: false,
        productionEnabled: false,
      }),
    );
    expect(readiness.check).not.toHaveBeenCalled();
  });

  it('returns dependency status only when database, Redis, and upload storage are ready', async () => {
    const report = {
      status: 'ready' as const,
      checks: {
        database: { status: 'up' as const, durationMs: 2 },
        redis: { status: 'up' as const, durationMs: 1 },
        uploadStorage: { status: 'up' as const, durationMs: 1 },
      },
    };
    const readiness = {
      check: jest.fn().mockResolvedValue(report),
    } as unknown as DependencyReadinessService;
    const controller = new HealthController(readiness, metrics);

    await expect(controller.readinessCheck()).resolves.toEqual(report);
  });

  it('fails readiness closed without leaking dependency errors', async () => {
    const readiness = {
      check: jest.fn().mockResolvedValue({
        status: 'not_ready',
        checks: {
          database: { status: 'down', durationMs: 2 },
          redis: { status: 'up', durationMs: 1 },
          uploadStorage: { status: 'up', durationMs: 1 },
        },
      }),
    } as unknown as DependencyReadinessService;
    const controller = new HealthController(readiness, metrics);

    await expect(controller.readinessCheck()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('exposes a provider-neutral Prometheus text contract', () => {
    const readiness = {
      check: jest.fn(),
    } as unknown as DependencyReadinessService;
    const controller = new HealthController(readiness, metrics);

    expect(controller.metricsReport()).toContain('minhhuong_process_up 1');
    expect(controller.metricsReport()).not.toContain('DATABASE_URL');
  });
});
