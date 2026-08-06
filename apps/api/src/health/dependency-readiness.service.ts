import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection, Socket } from 'node:net';
import { connect as createTlsConnection, TLSSocket } from 'node:tls';
import { PrismaService } from '../prisma/prisma.service';
import { resolveBlobStorage } from '../upload-storage/blob-storage';

type ReadinessCheck = {
  status: 'up' | 'down';
  durationMs: number;
  provider?: 'filesystem' | 's3';
};

export type DependencyReadinessReport = {
  status: 'ready' | 'not_ready';
  checks: {
    database: ReadinessCheck;
    redis: ReadinessCheck;
    uploadStorage: ReadinessCheck;
  };
};

const encodeRedisCommand = (parts: string[]) => {
  const encoded = parts.map(
    (part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`,
  );
  return `*${parts.length}\r\n${encoded.join('')}`;
};

const expectRedisReplies = (buffer: string, expectedReplyCount: number) => {
  const replies = buffer
    .split('\r\n')
    .filter((line) => line.startsWith('+') || line.startsWith('-'));
  if (replies.some((line) => line.startsWith('-'))) {
    throw new Error('REDIS_COMMAND_FAILED');
  }
  if (replies.length < expectedReplyCount) {
    return false;
  }
  if (replies[replies.length - 1] !== '+PONG') {
    throw new Error('REDIS_PING_FAILED');
  }
  return true;
};

@Injectable()
export class RedisReadinessProbe {
  constructor(private readonly config: ConfigService) {}

  async ping() {
    const rawUrl = this.config.get<string>('REDIS_URL');
    if (!rawUrl) {
      throw new Error('REDIS_URL_REQUIRED');
    }
    const url = new URL(rawUrl);
    if (!['redis:', 'rediss:'].includes(url.protocol)) {
      throw new Error('REDIS_URL_PROTOCOL_INVALID');
    }

    const commands: string[][] = [];
    const password = decodeURIComponent(url.password);
    const username = decodeURIComponent(url.username);
    if (password) {
      commands.push(
        username ? ['AUTH', username, password] : ['AUTH', password],
      );
    }
    const database = url.pathname.replace(/^\//, '');
    if (database && database !== '0') {
      if (!/^\d+$/.test(database)) {
        throw new Error('REDIS_DATABASE_INVALID');
      }
      commands.push(['SELECT', database]);
    }
    commands.push(['PING']);

    const port = Number(url.port || (url.protocol === 'rediss:' ? 6380 : 6379));
    const timeoutMs = Number(
      this.config.get<string>('READINESS_TIMEOUT_MS') ?? 3000,
    );
    const payload = commands.map(encodeRedisCommand).join('');

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let response = '';
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      const onConnect = () => socket.write(payload);
      const socket: Socket | TLSSocket =
        url.protocol === 'rediss:'
          ? createTlsConnection(
              {
                host: url.hostname,
                port,
                servername: url.hostname,
                rejectUnauthorized:
                  this.config
                    .get<string>('REDIS_TLS_REJECT_UNAUTHORIZED')
                    ?.toLowerCase() !== 'false',
              },
              onConnect,
            )
          : createConnection({ host: url.hostname, port }, onConnect);

      socket.setTimeout(timeoutMs, () => finish(new Error('REDIS_TIMEOUT')));
      socket.on('error', () => finish(new Error('REDIS_CONNECTION_FAILED')));
      socket.on('data', (chunk) => {
        response += chunk.toString('utf8');
        try {
          if (expectRedisReplies(response, commands.length)) finish();
        } catch (error) {
          finish(
            error instanceof Error ? error : new Error('REDIS_PING_FAILED'),
          );
        }
      });
      socket.on('end', () => {
        if (!settled) finish(new Error('REDIS_CONNECTION_ENDED'));
      });
    });
  }
}

@Injectable()
export class FilesystemUploadStorageReadinessProbe {
  constructor(private readonly config: ConfigService) {}

  async ping() {
    const storage = resolveBlobStorage({
      UPLOAD_STORAGE_PROVIDER: this.config.get<string>(
        'UPLOAD_STORAGE_PROVIDER',
      ),
      UPLOADS_PATH: this.config.get<string>('UPLOADS_PATH'),
      UPLOAD_S3_BUCKET: this.config.get<string>('UPLOAD_S3_BUCKET'),
      UPLOAD_S3_REGION: this.config.get<string>('UPLOAD_S3_REGION'),
      UPLOAD_S3_ENDPOINT: this.config.get<string>('UPLOAD_S3_ENDPOINT'),
      UPLOAD_S3_FORCE_PATH_STYLE: this.config.get<string>(
        'UPLOAD_S3_FORCE_PATH_STYLE',
      ),
      UPLOAD_S3_ACCESS_KEY_ID: this.config.get<string>(
        'UPLOAD_S3_ACCESS_KEY_ID',
      ),
      UPLOAD_S3_SECRET_ACCESS_KEY: this.config.get<string>(
        'UPLOAD_S3_SECRET_ACCESS_KEY',
      ),
      UPLOAD_S3_KEY_PREFIX: this.config.get<string>('UPLOAD_S3_KEY_PREFIX'),
      UPLOAD_S3_TIMEOUT_MS: this.config.get<string>('UPLOAD_S3_TIMEOUT_MS'),
      UPLOAD_S3_MAX_ATTEMPTS: this.config.get<string>('UPLOAD_S3_MAX_ATTEMPTS'),
    });
    await storage.readiness();
    return storage.provider;
  }
}

@Injectable()
export class RuntimeMetricsService {
  private readinessChecks = 0;
  private readinessFailures = 0;
  private lastReadinessStatus: 0 | 1 = 0;

  recordReadiness(ready: boolean) {
    this.readinessChecks += 1;
    if (!ready) this.readinessFailures += 1;
    this.lastReadinessStatus = ready ? 1 : 0;
  }

  renderPrometheus() {
    return [
      '# HELP minhhuong_process_up Process liveness.',
      '# TYPE minhhuong_process_up gauge',
      'minhhuong_process_up 1',
      '# HELP minhhuong_process_uptime_seconds Process uptime in seconds.',
      '# TYPE minhhuong_process_uptime_seconds gauge',
      `minhhuong_process_uptime_seconds ${Math.floor(process.uptime())}`,
      '# HELP minhhuong_readiness_checks_total Readiness checks executed.',
      '# TYPE minhhuong_readiness_checks_total counter',
      `minhhuong_readiness_checks_total ${this.readinessChecks}`,
      '# HELP minhhuong_readiness_failures_total Failed readiness checks.',
      '# TYPE minhhuong_readiness_failures_total counter',
      `minhhuong_readiness_failures_total ${this.readinessFailures}`,
      '# HELP minhhuong_readiness_status Last readiness result.',
      '# TYPE minhhuong_readiness_status gauge',
      `minhhuong_readiness_status ${this.lastReadinessStatus}`,
      '',
    ].join('\n');
  }
}

@Injectable()
export class DependencyReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisReadinessProbe,
    private readonly uploadStorage: FilesystemUploadStorageReadinessProbe,
    private readonly metrics: RuntimeMetricsService,
  ) {}

  async check(): Promise<DependencyReadinessReport> {
    const timed = async (
      probe: () => Promise<unknown>,
    ): Promise<ReadinessCheck> => {
      const startedAt = Date.now();
      try {
        const provider = await probe();
        return {
          status: 'up',
          durationMs: Date.now() - startedAt,
          ...(provider === 'filesystem' || provider === 's3'
            ? { provider }
            : {}),
        };
      } catch {
        return { status: 'down', durationMs: Date.now() - startedAt };
      }
    };

    const [database, redis, uploadStorage] = await Promise.all([
      timed(() => this.prisma.$queryRaw`SELECT 1`),
      timed(() => this.redis.ping()),
      timed(() => this.uploadStorage.ping()),
    ]);
    const ready =
      database.status === 'up' &&
      redis.status === 'up' &&
      uploadStorage.status === 'up';
    this.metrics.recordReadiness(ready);
    return {
      status: ready ? 'ready' : 'not_ready',
      checks: { database, redis, uploadStorage },
    };
  }
}
