import { Module } from '@nestjs/common';
import {
  DependencyReadinessService,
  FilesystemUploadStorageReadinessProbe,
  RedisReadinessProbe,
  RuntimeMetricsService,
} from './dependency-readiness.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    DependencyReadinessService,
    FilesystemUploadStorageReadinessProbe,
    RedisReadinessProbe,
    RuntimeMetricsService,
  ],
})
export class HealthModule {}
