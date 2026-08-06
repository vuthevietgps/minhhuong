import { resolve } from 'node:path';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  buildUploadMigrationInventory,
  type UploadMigrationReference,
} from '../src/upload-storage/upload-migration-inventory';

const assertDisposableLocalDryRun = () => {
  if (process.env.UPLOAD_MIGRATION_DRY_RUN !== 'true') {
    throw new Error('UPLOAD_MIGRATION_DRY_RUN=true is required');
  }
  if (process.env.NODE_ENV?.toLowerCase() === 'production') {
    throw new Error('Upload migration inventory is disabled in production');
  }
  const databaseUrl = new URL(
    process.env.DATABASE_URL ??
      'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public',
  );
  if (!['127.0.0.1', '::1', 'localhost'].includes(databaseUrl.hostname)) {
    throw new Error('Upload migration inventory requires a localhost database');
  }
};

const main = async () => {
  assertDisposableLocalDryRun();
  const prisma = new PrismaService();
  await prisma.$connect();
  try {
    const [videos, orders, payouts] = await Promise.all([
      prisma.videoAsset.findMany({
        where: { storageKey: { not: null } },
        select: { id: true, storageKey: true },
      }),
      prisma.activationOrder.findMany({
        where: {
          OR: [
            { saleInvoiceStorageKey: { not: null } },
            { operationInvoiceStorageKey: { not: null } },
          ],
        },
        select: {
          id: true,
          saleInvoiceStorageKey: true,
          operationInvoiceStorageKey: true,
        },
      }),
      prisma.payoutRequest.findMany({
        where: { payoutInvoiceStorageKey: { not: null } },
        select: { id: true, payoutInvoiceStorageKey: true },
      }),
    ]);
    const references: UploadMigrationReference[] = [];
    for (const video of videos) {
      if (video.storageKey) {
        references.push({
          key: video.storageKey,
          recordId: video.id,
          surface: 'VIDEO_ASSET',
        });
      }
    }
    for (const order of orders) {
      if (order.saleInvoiceStorageKey) {
        references.push({
          key: order.saleInvoiceStorageKey,
          recordId: order.id,
          surface: 'ACTIVATION_SALE_INVOICE',
        });
      }
      if (order.operationInvoiceStorageKey) {
        references.push({
          key: order.operationInvoiceStorageKey,
          recordId: order.id,
          surface: 'ACTIVATION_OPERATION_INVOICE',
        });
      }
    }
    for (const payout of payouts) {
      if (payout.payoutInvoiceStorageKey) {
        references.push({
          key: payout.payoutInvoiceStorageKey,
          recordId: payout.id,
          surface: 'PAYOUT_INVOICE',
        });
      }
    }

    const report = await buildUploadMigrationInventory({
      root:
        process.env.UPLOADS_PATH?.trim() || resolve(process.cwd(), 'uploads'),
      references,
    });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await prisma.$disconnect();
  }
};

void main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown dry-run error';
  process.stderr.write(
    `${JSON.stringify({ status: 'BLOCKED', error: message })}\n`,
  );
  process.exitCode = 1;
});
