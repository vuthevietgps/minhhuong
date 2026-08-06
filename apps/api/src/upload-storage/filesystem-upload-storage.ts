import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

export type UploadStorageEnvironment = Record<string, string | undefined>;

export type FilesystemUploadSurface = {
  surfaceId: string;
  actorScope: string;
  route: string;
  subdirectory: 'videos' | 'invoices';
  fallbackBaseName: string;
};

export const filesystemUploadSurfaces = {
  adminContentVideo: {
    surfaceId: 'admin-content-video',
    actorScope: 'ADMIN_CONTENT_EDITOR',
    route: '/v1/admin/content/lessons/:lessonId/videos/upload',
    subdirectory: 'videos',
    fallbackBaseName: 'video',
  },
  teacherContentVideo: {
    surfaceId: 'teacher-content-video',
    actorScope: 'TEACHER',
    route: '/v1/teacher/content/lessons/:lessonId/videos/upload',
    subdirectory: 'videos',
    fallbackBaseName: 'video',
  },
  activationOrderInvoice: {
    surfaceId: 'activation-order-invoice-payment-proof',
    actorScope: 'SALES_PARENT_REVIEWER',
    route: '/v1/activation-orders/*',
    subdirectory: 'invoices',
    fallbackBaseName: 'invoice',
  },
  channelFinancePayoutInvoice: {
    surfaceId: 'channel-finance-payout-invoice',
    actorScope: 'FINANCE',
    route: '/v1/channel-finance/payouts/:payoutId/pay',
    subdirectory: 'invoices',
    fallbackBaseName: 'payout',
  },
} as const satisfies Record<string, FilesystemUploadSurface>;

export const resolveFilesystemUploadsRoot = (
  environment: UploadStorageEnvironment = process.env,
) => {
  const provider =
    environment.UPLOAD_STORAGE_PROVIDER?.trim().toLowerCase() || 'filesystem';
  if (provider !== 'filesystem') {
    throw new Error('UPLOAD_STORAGE_PROVIDER_UNSUPPORTED');
  }

  const configuredRoot = environment.UPLOADS_PATH?.trim();
  return configuredRoot
    ? resolve(configuredRoot)
    : resolve(process.cwd(), 'uploads');
};

export const resolveFilesystemUploadDirectory = (
  surface: Pick<FilesystemUploadSurface, 'subdirectory'>,
  environment: UploadStorageEnvironment = process.env,
) => join(resolveFilesystemUploadsRoot(environment), surface.subdirectory);

export const buildStoredUploadFilename = (
  originalName: string,
  fallbackBaseName: string,
  timestamp = Date.now(),
) => {
  const extension = extname(originalName).toLowerCase();
  const safeBase = originalName
    .replace(extname(originalName), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return `${timestamp}-${safeBase || fallbackBaseName}${extension}`;
};

export const createFilesystemUploadStorage = (
  surface: FilesystemUploadSurface,
) =>
  diskStorage({
    destination: (_request, _file, callback) => {
      try {
        const destination = resolveFilesystemUploadDirectory(surface);
        mkdirSync(destination, { recursive: true });
        callback(null, destination);
      } catch (error) {
        callback(
          error instanceof Error
            ? error
            : new Error('UPLOAD_STORAGE_DESTINATION_FAILED'),
          '',
        );
      }
    },
    filename: (_request, file, callback) => {
      callback(
        null,
        buildStoredUploadFilename(file.originalname, surface.fallbackBaseName),
      );
    },
  });
