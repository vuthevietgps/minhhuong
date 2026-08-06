import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  assertSafeObjectKey,
  FilesystemBlobStorage,
  resolveBlobStorage,
  S3BlobStorage,
  type BlobStorage,
  type S3Sender,
} from './blob-storage';
import { filesystemUploadSurfaces } from './filesystem-upload-storage';
import {
  buildDeterministicUploadObjectKey,
  putProviderUploadObject,
} from './provider-upload-storage';

class MockS3Client {
  readonly objects = new Map<
    string,
    { body: Buffer; contentType: string; sha256: string }
  >();
  headBucketCalls = 0;

  async send(command: unknown) {
    if (command instanceof HeadBucketCommand) {
      this.headBucketCalls += 1;
      return {};
    }
    const input = (command as any).input;
    if (command instanceof PutObjectCommand) {
      if (this.objects.has(input.Key)) {
        throw new MockS3Error(412);
      }
      this.objects.set(input.Key, {
        body: Buffer.from(input.Body),
        contentType: input.ContentType,
        sha256: input.Metadata.sha256,
      });
      return { ETag: `"${input.Metadata.sha256}"` };
    }
    if (command instanceof GetObjectCommand) {
      const object = this.objects.get(input.Key);
      if (!object) throw new MockS3Error(404);
      return {
        Body: { transformToByteArray: async () => object.body },
        ContentType: object.contentType,
        ContentLength: object.body.length,
        Metadata: { sha256: object.sha256 },
        ETag: `"${object.sha256}"`,
      };
    }
    if (command instanceof HeadObjectCommand) {
      const object = this.objects.get(input.Key);
      if (!object) throw new MockS3Error(404);
      return {
        ContentType: object.contentType,
        ContentLength: object.body.length,
        Metadata: { sha256: object.sha256 },
      };
    }
    if (command instanceof DeleteObjectCommand) {
      this.objects.delete(input.Key);
      return {};
    }
    throw new Error('UNEXPECTED_S3_COMMAND');
  }
}

class MockS3Error extends Error {
  readonly $metadata: { httpStatusCode: number };

  constructor(httpStatusCode: number) {
    super(`Synthetic S3 error ${httpStatusCode}`);
    this.$metadata = { httpStatusCode };
  }
}

const assertProviderContract = async (storage: BlobStorage) => {
  const key = 'videos/admin-content-video/synthetic-video.mp4';
  const body = Buffer.from('synthetic-video');
  const stored = await storage.put({ key, body, contentType: 'video/mp4' });
  expect(stored).toEqual(
    expect.objectContaining({
      key,
      size: body.length,
      contentType: 'video/mp4',
    }),
  );
  await expect(
    storage.put({ key, body, contentType: 'video/mp4' }),
  ).rejects.toThrow('UPLOAD_OBJECT_ALREADY_EXISTS');
  await expect(storage.head(key)).resolves.toEqual(
    expect.objectContaining({ key, size: body.length }),
  );
  await expect(storage.read(key)).resolves.toEqual(
    expect.objectContaining({ key, body }),
  );
  await storage.delete(key);
  await expect(storage.head(key)).resolves.toBeNull();
};

describe('upload blob storage provider contract', () => {
  it('shares put/read/head/delete/immutability behavior across filesystem and S3', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mh-blob-contract-'));
    try {
      await assertProviderContract(new FilesystemBlobStorage(root));
      await assertProviderContract(
        new S3BlobStorage(
          new MockS3Client() as unknown as S3Sender,
          'synthetic-private-bucket',
        ),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects traversal and unsafe object keys', () => {
    for (const key of ['../secret', '/absolute', 'videos//x', 'videos\\x']) {
      expect(() => assertSafeObjectKey(key)).toThrow(
        'UPLOAD_OBJECT_KEY_UNSAFE',
      );
    }
  });

  it('builds stable content-addressed keys without retaining client traversal', () => {
    const first = buildDeterministicUploadObjectKey(
      filesystemUploadSurfaces.adminContentVideo,
      '../../Bai Hoc?.MP4',
      Buffer.from('same-content'),
    );
    const second = buildDeterministicUploadObjectKey(
      filesystemUploadSurfaces.adminContentVideo,
      '../../Bai Hoc?.MP4',
      Buffer.from('same-content'),
    );
    expect(first).toEqual(second);
    expect(first.key).toMatch(
      /^videos\/admin-content-video\/[a-f0-9]{64}-bai-hoc\.mp4$/,
    );
    expect(first.key).not.toContain('..');
  });

  it('reuses an existing content-addressed upload only when metadata matches', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mh-upload-reuse-'));
    const storage = new FilesystemBlobStorage(root);
    const surface = filesystemUploadSurfaces.activationOrderInvoice;
    const body = Buffer.from('same-invoice-content');

    try {
      const first = await putProviderUploadObject(
        storage,
        surface,
        'invoice.pdf',
        'application/pdf',
        body,
      );
      const replay = await putProviderUploadObject(
        storage,
        surface,
        'invoice.pdf',
        'application/pdf',
        body,
      );

      expect(replay).toEqual(first);
      await expect(
        putProviderUploadObject(
          storage,
          surface,
          'invoice.pdf',
          'image/png',
          body,
        ),
      ).rejects.toThrow('UPLOAD_OBJECT_METADATA_MISMATCH');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails closed for incomplete or unbounded S3 configuration', () => {
    expect(() =>
      resolveBlobStorage({
        UPLOAD_STORAGE_PROVIDER: 's3',
        UPLOAD_S3_BUCKET: 'bucket',
      }),
    ).toThrow('UPLOAD_S3_CONFIGURATION_INVALID');
    expect(() =>
      resolveBlobStorage({
        UPLOAD_STORAGE_PROVIDER: 's3',
        UPLOAD_S3_BUCKET: 'bucket',
        UPLOAD_S3_REGION: 'us-east-1',
        UPLOAD_S3_TIMEOUT_MS: '999999',
      }),
    ).toThrow('UPLOAD_S3_CONFIGURATION_INVALID');
  });

  it('uses a redacted bucket-level readiness check', async () => {
    const client = new MockS3Client();
    const storage = new S3BlobStorage(
      client as unknown as S3Sender,
      'synthetic-private-bucket',
    );
    await storage.readiness();
    expect(client.headBucketCalls).toBe(1);
    expect(client.objects.size).toBe(0);
  });
});
