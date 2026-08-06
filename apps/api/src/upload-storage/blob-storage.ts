import {
  DeleteObjectCommand,
  type DeleteObjectCommandOutput,
  GetObjectCommand,
  type GetObjectCommandOutput,
  HeadBucketCommand,
  type HeadBucketCommandOutput,
  HeadObjectCommand,
  type HeadObjectCommandOutput,
  PutObjectCommand,
  type PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { createHash } from 'node:crypto';
import { mkdir, open, readFile, stat, unlink } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

export type BlobStorageMetadata = {
  key: string;
  contentType: string;
  size: number;
  sha256: string;
  etag?: string;
};

export type BlobStorageReadResult = BlobStorageMetadata & { body: Buffer };

type StoredBlobMetadata = Pick<
  BlobStorageMetadata,
  'contentType' | 'size' | 'sha256'
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseStoredBlobMetadata = (raw: string): StoredBlobMetadata => {
  const value: unknown = JSON.parse(raw);
  if (
    !isRecord(value) ||
    typeof value.contentType !== 'string' ||
    typeof value.size !== 'number' ||
    !Number.isSafeInteger(value.size) ||
    value.size < 0 ||
    typeof value.sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(value.sha256)
  ) {
    throw new Error('UPLOAD_OBJECT_METADATA_INVALID');
  }
  return {
    contentType: value.contentType,
    size: value.size,
    sha256: value.sha256,
  };
};

const httpStatusCodeOf = (error: unknown): number | undefined => {
  if (!isRecord(error) || !isRecord(error.$metadata)) return undefined;
  const status = error.$metadata.httpStatusCode;
  return typeof status === 'number' ? status : undefined;
};

export interface BlobStorage {
  readonly provider: 'filesystem' | 's3';
  put(input: {
    key: string;
    body: Buffer;
    contentType: string;
    sha256?: string;
  }): Promise<BlobStorageMetadata>;
  read(key: string): Promise<BlobStorageReadResult>;
  head(key: string): Promise<BlobStorageMetadata | null>;
  delete(key: string): Promise<void>;
  readiness(): Promise<void>;
}

export const assertSafeObjectKey = (key: string) => {
  if (
    !key ||
    key.length > 512 ||
    key.startsWith('/') ||
    key.endsWith('/') ||
    key.includes('\\') ||
    key.includes('//') ||
    key.split('/').some((part) => !part || part === '.' || part === '..') ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(key)
  ) {
    throw new Error('UPLOAD_OBJECT_KEY_UNSAFE');
  }
  return key;
};

const sha256 = (body: Buffer) =>
  createHash('sha256').update(body).digest('hex');

export class FilesystemBlobStorage implements BlobStorage {
  readonly provider = 'filesystem' as const;
  private readonly root: string;

  constructor(root: string) {
    this.root = resolve(root);
  }

  private pathFor(key: string) {
    const target = resolve(this.root, assertSafeObjectKey(key));
    if (target !== this.root && !target.startsWith(`${this.root}${sep}`)) {
      throw new Error('UPLOAD_OBJECT_KEY_UNSAFE');
    }
    return target;
  }

  async put(input: {
    key: string;
    body: Buffer;
    contentType: string;
    sha256?: string;
  }) {
    const path = this.pathFor(input.key);
    await mkdir(dirname(path), { recursive: true });
    const digest = input.sha256 ?? sha256(input.body);
    let handle: Awaited<ReturnType<typeof open>> | undefined;
    try {
      handle = await open(path, 'wx', 0o600);
      await handle.writeFile(input.body);
      await handle.sync();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new Error('UPLOAD_OBJECT_ALREADY_EXISTS');
      }
      throw error;
    } finally {
      await handle?.close();
    }
    await open(`${path}.metadata.json`, 'wx', 0o600).then(async (metadata) => {
      try {
        await metadata.writeFile(
          JSON.stringify({
            contentType: input.contentType,
            size: input.body.length,
            sha256: digest,
          }),
        );
        await metadata.sync();
      } finally {
        await metadata.close();
      }
    });
    return {
      key: input.key,
      contentType: input.contentType,
      size: input.body.length,
      sha256: digest,
      etag: digest,
    };
  }

  async read(key: string) {
    const path = this.pathFor(key);
    const [body, metadata] = await Promise.all([
      readFile(path),
      readFile(`${path}.metadata.json`, 'utf8').then(parseStoredBlobMetadata),
    ]);
    return { key, body, ...metadata, etag: metadata.sha256 };
  }

  async head(key: string) {
    const path = this.pathFor(key);
    try {
      const [file, metadata] = await Promise.all([
        stat(path),
        readFile(`${path}.metadata.json`, 'utf8').then(parseStoredBlobMetadata),
      ]);
      return { key, ...metadata, size: file.size, etag: metadata.sha256 };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async delete(key: string) {
    const path = this.pathFor(key);
    await Promise.all([
      unlink(path).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      }),
      unlink(`${path}.metadata.json`).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      }),
    ]);
  }

  async readiness() {
    const key = `readiness-${process.pid}-${Date.now()}`;
    const body = Buffer.from('ready');
    await this.put({ key, body, contentType: 'text/plain' });
    try {
      const stored = await this.read(key);
      if (!stored.body.equals(body)) throw new Error('UPLOAD_READINESS_FAILED');
    } finally {
      await this.delete(key);
    }
  }
}

export type S3StorageCommand =
  | DeleteObjectCommand
  | GetObjectCommand
  | HeadBucketCommand
  | HeadObjectCommand
  | PutObjectCommand;

type S3StorageOutput =
  | DeleteObjectCommandOutput
  | GetObjectCommandOutput
  | HeadBucketCommandOutput
  | HeadObjectCommandOutput
  | PutObjectCommandOutput;

export interface S3Sender {
  send(
    command: DeleteObjectCommand,
    options?: { abortSignal?: AbortSignal },
  ): Promise<DeleteObjectCommandOutput>;
  send(
    command: GetObjectCommand,
    options?: { abortSignal?: AbortSignal },
  ): Promise<GetObjectCommandOutput>;
  send(
    command: HeadBucketCommand,
    options?: { abortSignal?: AbortSignal },
  ): Promise<HeadBucketCommandOutput>;
  send(
    command: HeadObjectCommand,
    options?: { abortSignal?: AbortSignal },
  ): Promise<HeadObjectCommandOutput>;
  send(
    command: PutObjectCommand,
    options?: { abortSignal?: AbortSignal },
  ): Promise<PutObjectCommandOutput>;
}

export class S3BlobStorage implements BlobStorage {
  readonly provider = 's3' as const;

  constructor(
    private readonly client: S3Sender,
    private readonly bucket: string,
    private readonly keyPrefix = '',
    private readonly timeoutMs = 5000,
  ) {}

  private fullKey(key: string) {
    const safe = assertSafeObjectKey(key);
    return this.keyPrefix ? `${this.keyPrefix}/${safe}` : safe;
  }

  private send(
    command: DeleteObjectCommand,
  ): Promise<DeleteObjectCommandOutput>;
  private send(command: GetObjectCommand): Promise<GetObjectCommandOutput>;
  private send(command: HeadBucketCommand): Promise<HeadBucketCommandOutput>;
  private send(command: HeadObjectCommand): Promise<HeadObjectCommandOutput>;
  private send(command: PutObjectCommand): Promise<PutObjectCommandOutput>;
  private send(command: S3StorageCommand): Promise<S3StorageOutput> {
    const options = {
      abortSignal: AbortSignal.timeout(this.timeoutMs),
    };
    if (command instanceof DeleteObjectCommand) {
      return this.client.send(command, options);
    }
    if (command instanceof GetObjectCommand) {
      return this.client.send(command, options);
    }
    if (command instanceof HeadBucketCommand) {
      return this.client.send(command, options);
    }
    if (command instanceof HeadObjectCommand) {
      return this.client.send(command, options);
    }
    return this.client.send(command, options);
  }

  async put(input: {
    key: string;
    body: Buffer;
    contentType: string;
    sha256?: string;
  }) {
    const digest = input.sha256 ?? sha256(input.body);
    try {
      const result = await this.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: this.fullKey(input.key),
          Body: input.body,
          ContentType: input.contentType,
          ContentLength: input.body.length,
          IfNoneMatch: '*',
          Metadata: { sha256: digest },
        }),
      );
      return {
        key: input.key,
        contentType: input.contentType,
        size: input.body.length,
        sha256: digest,
        etag: result.ETag?.replaceAll('"', ''),
      };
    } catch (error) {
      const httpStatusCode = httpStatusCodeOf(error);
      if (httpStatusCode !== undefined && [409, 412].includes(httpStatusCode)) {
        throw new Error('UPLOAD_OBJECT_ALREADY_EXISTS');
      }
      throw error;
    }
  }

  async read(key: string) {
    const result = await this.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) }),
    );
    if (!result.Body) throw new Error('UPLOAD_OBJECT_BODY_MISSING');
    const body = Buffer.from(
      Uint8Array.from(await result.Body.transformToByteArray()),
    );
    const digest = result.Metadata?.sha256 ?? sha256(body);
    return {
      key,
      body,
      contentType: result.ContentType ?? 'application/octet-stream',
      size: result.ContentLength ?? body.length,
      sha256: digest,
      etag: result.ETag?.replaceAll('"', ''),
    };
  }

  async head(key: string) {
    try {
      const result = await this.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) }),
      );
      return {
        key,
        contentType: result.ContentType ?? 'application/octet-stream',
        size: result.ContentLength ?? 0,
        sha256: result.Metadata?.sha256 ?? '',
        etag: result.ETag?.replaceAll('"', ''),
      };
    } catch (error) {
      if (httpStatusCodeOf(error) === 404) return null;
      throw error;
    }
  }

  async delete(key: string) {
    await this.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) }),
    );
  }

  async readiness() {
    await this.send(new HeadBucketCommand({ Bucket: this.bucket }));
  }
}

export type UploadStorageEnvironment = Record<string, string | undefined>;

export const resolveBlobStorage = (
  environment: UploadStorageEnvironment = process.env,
  clientOverride?: S3Sender,
): BlobStorage => {
  const provider =
    environment.UPLOAD_STORAGE_PROVIDER?.trim().toLowerCase() || 'filesystem';
  if (provider === 'filesystem') {
    return new FilesystemBlobStorage(
      environment.UPLOADS_PATH?.trim() || resolve(process.cwd(), 'uploads'),
    );
  }
  if (provider !== 's3') throw new Error('UPLOAD_STORAGE_PROVIDER_UNSUPPORTED');

  const bucket = environment.UPLOAD_S3_BUCKET?.trim();
  const region = environment.UPLOAD_S3_REGION?.trim();
  if (!bucket || !region) throw new Error('UPLOAD_S3_CONFIGURATION_INVALID');
  const timeoutMs = Number(environment.UPLOAD_S3_TIMEOUT_MS ?? 5000);
  const maxAttempts = Number(environment.UPLOAD_S3_MAX_ATTEMPTS ?? 3);
  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 100 ||
    timeoutMs > 30000 ||
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > 5
  ) {
    throw new Error('UPLOAD_S3_CONFIGURATION_INVALID');
  }
  const prefix =
    environment.UPLOAD_S3_KEY_PREFIX?.trim().replace(/^\/+|\/+$/g, '') ?? '';
  if (prefix) assertSafeObjectKey(`${prefix}/probe`);
  const endpoint = environment.UPLOAD_S3_ENDPOINT?.trim();
  const accessKeyId = environment.UPLOAD_S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = environment.UPLOAD_S3_SECRET_ACCESS_KEY?.trim();
  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error('UPLOAD_S3_CONFIGURATION_INVALID');
  }
  const client =
    clientOverride ??
    new S3Client({
      region,
      ...(endpoint ? { endpoint } : {}),
      forcePathStyle:
        environment.UPLOAD_S3_FORCE_PATH_STYLE?.trim().toLowerCase() === 'true',
      maxAttempts,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: timeoutMs,
        requestTimeout: timeoutMs,
      }),
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
  return new S3BlobStorage(client, bucket, prefix, timeoutMs);
};
