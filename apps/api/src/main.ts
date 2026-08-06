import {
  ConsoleLogger,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { static as serveStatic } from 'express';
import { AppModule } from './app.module';
import { assertProductionRuntimeSafety } from './runtime-safety/production-runtime-safety';
import { resolveFilesystemUploadsRoot } from './upload-storage/filesystem-upload-storage';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ json: true, colors: false, compact: true }),
  });
  const config = app.get(ConfigService);
  const runtimeSafety = assertProductionRuntimeSafety({
    NODE_ENV: config.get<string>('NODE_ENV'),
    DEPLOYMENT_ENVIRONMENT: config.get<string>('DEPLOYMENT_ENVIRONMENT'),
    PRODUCTION_READY: config.get<string>('PRODUCTION_READY'),
    PRODUCTION_ENABLED: config.get<string>('PRODUCTION_ENABLED'),
    JWT_SECRET: config.get<string>('JWT_SECRET'),
    CORS_ORIGIN: config.get<string>('CORS_ORIGIN'),
    API_PUBLIC_URL: config.get<string>('API_PUBLIC_URL'),
    WEB_PUBLIC_URL: config.get<string>('WEB_PUBLIC_URL'),
    DATABASE_URL: config.get<string>('DATABASE_URL'),
    REDIS_URL: config.get<string>('REDIS_URL'),
    NEXT_PUBLIC_API_URL: config.get<string>('NEXT_PUBLIC_API_URL'),
    LOCAL_DEMO_ROUTES_ENABLED: config.get<string>('LOCAL_DEMO_ROUTES_ENABLED'),
    AUTH_SESSION_STORE_PROVIDER: config.get<string>(
      'AUTH_SESSION_STORE_PROVIDER',
    ),
    AUTH_OPERATIONAL_CONTROL_PROVIDER: config.get<string>(
      'AUTH_OPERATIONAL_CONTROL_PROVIDER',
    ),
    AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: config.get<string>(
      'AUTH_OPERATIONAL_ALERT_STATE_PROVIDER',
    ),
    AUTH_OPERATIONAL_CONTROL_KEY_SECRET: config.get<string>(
      'AUTH_OPERATIONAL_CONTROL_KEY_SECRET',
    ),
    NOTIFICATION_PROVIDER: config.get<string>('NOTIFICATION_PROVIDER'),
    PAYMENT_PROVIDER: config.get<string>('PAYMENT_PROVIDER'),
    AI_PROVIDER: config.get<string>('AI_PROVIDER'),
    VIDEO_PROVIDER: config.get<string>('VIDEO_PROVIDER'),
    UPLOAD_STORAGE_PROVIDER: config.get<string>('UPLOAD_STORAGE_PROVIDER'),
    UPLOADS_PATH: config.get<string>('UPLOADS_PATH'),
    UPLOAD_STORAGE_TOPOLOGY: config.get<string>('UPLOAD_STORAGE_TOPOLOGY'),
    UPLOAD_HOSTED_FILESYSTEM_EMERGENCY_OVERRIDE: config.get<string>(
      'UPLOAD_HOSTED_FILESYSTEM_EMERGENCY_OVERRIDE',
    ),
    UPLOAD_S3_BUCKET: config.get<string>('UPLOAD_S3_BUCKET'),
    UPLOAD_S3_REGION: config.get<string>('UPLOAD_S3_REGION'),
    UPLOAD_S3_ENDPOINT: config.get<string>('UPLOAD_S3_ENDPOINT'),
    UPLOAD_S3_LOCAL_SMOKE: config.get<string>('UPLOAD_S3_LOCAL_SMOKE'),
    UPLOAD_S3_CREDENTIALS_REFERENCE: config.get<string>(
      'UPLOAD_S3_CREDENTIALS_REFERENCE',
    ),
    UPLOAD_S3_TIMEOUT_MS: config.get<string>('UPLOAD_S3_TIMEOUT_MS'),
    UPLOAD_S3_MAX_ATTEMPTS: config.get<string>('UPLOAD_S3_MAX_ATTEMPTS'),
    API_REPLICA_COUNT: config.get<string>('API_REPLICA_COUNT'),
  });

  app.enableCors({
    origin: runtimeSafety.corsOrigin,
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  if (
    config.get<string>('UPLOAD_STORAGE_PROVIDER')?.trim().toLowerCase() !== 's3'
  ) {
    app.use(
      '/uploads',
      serveStatic(
        resolveFilesystemUploadsRoot({
          UPLOAD_STORAGE_PROVIDER: config.get<string>(
            'UPLOAD_STORAGE_PROVIDER',
          ),
          UPLOADS_PATH: config.get<string>('UPLOADS_PATH'),
        }),
      ),
    );
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Minh Huong English API')
    .setDescription(
      'Backend API for the English learning subscription platform.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT ?? process.env.PORT ?? 4000;
  app.enableShutdownHooks();
  await app.listen(port);
  Logger.log(
    {
      event: 'runtime_started',
      service: 'minhhuong-api',
      port: Number(port),
      deploymentEnvironment:
        config.get<string>('DEPLOYMENT_ENVIRONMENT') ?? 'local',
      productionMode: runtimeSafety.productionMode,
      productionReady: false,
      productionEnabled: false,
      liveProvidersEnabled: false,
    },
    'Bootstrap',
  );
}
bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : 'bootstrap_failed';
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'fatal',
      service: 'minhhuong-api',
      event: 'bootstrap_failed',
      errorCode: message.replace(/[^A-Za-z0-9_(),.-]+/g, '_').slice(0, 300),
    }),
  );
  process.exit(1);
});
