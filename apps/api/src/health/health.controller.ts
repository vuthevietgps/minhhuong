import {
  Controller,
  Get,
  Header,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DependencyReadinessService,
  RuntimeMetricsService,
} from './dependency-readiness.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly readiness: DependencyReadinessService,
    private readonly metrics: RuntimeMetricsService,
  ) {}

  @Get()
  check() {
    return this.liveness();
  }

  @Get('live')
  liveness() {
    return {
      status: 'ok',
      service: 'minhhuong-api',
      productionReady: false,
      productionEnabled: false,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async readinessCheck() {
    const report = await this.readiness.check();
    if (report.status !== 'ready') {
      throw new ServiceUnavailableException(report);
    }
    return report;
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  metricsReport() {
    return this.metrics.renderPrometheus();
  }
}
