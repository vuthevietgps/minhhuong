import type { Request } from 'express';
import type { StorageEngine } from 'multer';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { resolveBlobStorage, type BlobStorage } from './blob-storage';
import type { FilesystemUploadSurface } from './filesystem-upload-storage';

let cachedStorage: BlobStorage | undefined;
let cachedSignature = '';

const environmentSignature = () =>
  [
    process.env.UPLOAD_STORAGE_PROVIDER,
    process.env.UPLOADS_PATH,
    process.env.UPLOAD_S3_BUCKET,
    process.env.UPLOAD_S3_REGION,
    process.env.UPLOAD_S3_ENDPOINT,
    process.env.UPLOAD_S3_FORCE_PATH_STYLE,
    process.env.UPLOAD_S3_KEY_PREFIX,
    process.env.UPLOAD_S3_TIMEOUT_MS,
    process.env.UPLOAD_S3_MAX_ATTEMPTS,
    process.env.UPLOAD_S3_ACCESS_KEY_ID,
    process.env.UPLOAD_S3_SECRET_ACCESS_KEY,
  ].join('|');

export const getUploadBlobStorage = () => {
  const signature = environmentSignature();
  if (!cachedStorage || signature !== cachedSignature) {
    cachedStorage = resolveBlobStorage();
    cachedSignature = signature;
  }
  return cachedStorage;
};

export const resetUploadBlobStorageForTests = () => {
  cachedStorage = undefined;
  cachedSignature = '';
};

const safeName = (originalName: string, fallback: string) => {
  const extension = extname(originalName)
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, '');
  const base = originalName
    .slice(0, Math.max(0, originalName.length - extname(originalName).length))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || fallback}${extension}`;
};

export const buildDeterministicUploadObjectKey = (
  surface: FilesystemUploadSurface,
  originalName: string,
  body: Buffer,
) => {
  const digest = createHash('sha256').update(body).digest('hex');
  const filename = `${surface.surfaceId}/${digest}-${safeName(
    originalName,
    surface.fallbackBaseName,
  )}`;
  return {
    digest,
    filename,
    key: `${surface.subdirectory}/${filename}`,
  };
};

export const putProviderUploadObject = async (
  storage: BlobStorage,
  surface: FilesystemUploadSurface,
  originalName: string,
  contentType: string,
  body: Buffer,
) => {
  const object = buildDeterministicUploadObjectKey(surface, originalName, body);

  try {
    const stored = await storage.put({
      key: object.key,
      body,
      contentType,
      sha256: object.digest,
    });
    return { object, stored };
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== 'UPLOAD_OBJECT_ALREADY_EXISTS'
    ) {
      throw error;
    }

    const existing = await storage.head(object.key);
    if (
      !existing ||
      existing.sha256 !== object.digest ||
      existing.size !== body.length ||
      existing.contentType !== contentType
    ) {
      throw new Error('UPLOAD_OBJECT_METADATA_MISMATCH');
    }

    return { object, stored: existing };
  }
};

export const createProviderUploadStorage = (
  surface: FilesystemUploadSurface,
  storageResolver: () => BlobStorage = getUploadBlobStorage,
): StorageEngine => ({
  _handleFile(
    _request: Request,
    file: Express.Multer.File,
    callback: (error?: unknown, info?: Partial<Express.Multer.File>) => void,
  ) {
    const chunks: Buffer[] = [];
    file.stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    file.stream.once('error', callback);
    file.stream.once('end', () => {
      const body = Buffer.concat(chunks);
      void putProviderUploadObject(
        storageResolver(),
        surface,
        file.originalname,
        file.mimetype,
        body,
      )
        .then(({ object, stored }) =>
          callback(undefined, {
            filename: object.filename,
            path: stored.key,
            size: stored.size,
          }),
        )
        .catch(callback);
    });
  },
  _removeFile(
    _request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null) => void,
  ) {
    if (!file.path) return callback(null);
    void storageResolver()
      .delete(file.path)
      .then(() => callback(null))
      .catch((error: Error) => callback(error));
  },
});
