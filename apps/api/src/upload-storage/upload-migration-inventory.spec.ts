import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildUploadMigrationInventory } from './upload-migration-inventory';

describe('upload migration inventory dry run', () => {
  it('classifies referenced, missing, orphan, duplicate, and metadata rows deterministically', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mh-upload-inventory-'));
    const videoBody = Buffer.from('same-synthetic-content');
    const digest = createHash('sha256').update(videoBody).digest('hex');
    try {
      await Promise.all([
        mkdir(join(root, 'videos'), { recursive: true }),
        mkdir(join(root, 'invoices'), { recursive: true }),
      ]);
      await writeFile(join(root, 'videos', 'lesson.mp4'), videoBody);
      await writeFile(
        join(root, 'videos', 'lesson.mp4.metadata.json'),
        JSON.stringify({
          contentType: 'video/mp4',
          size: videoBody.length,
          sha256: digest,
        }),
      );
      await writeFile(join(root, 'invoices', 'orphan.pdf'), videoBody);

      const input = {
        root,
        generatedAt: '2026-07-14T00:00:00.000Z',
        references: [
          {
            key: 'videos/lesson.mp4',
            recordId: 'video-1',
            surface: 'VIDEO_ASSET' as const,
          },
          {
            key: 'invoices/missing.pdf',
            recordId: 'order-1',
            surface: 'ACTIVATION_SALE_INVOICE' as const,
          },
        ],
      };
      const first = await buildUploadMigrationInventory(input);
      const second = await buildUploadMigrationInventory(input);

      expect(second).toEqual(first);
      expect(first.rows.map((row) => [row.key, row.classification])).toEqual([
        ['invoices/missing.pdf', 'MISSING_SOURCE'],
        ['invoices/orphan.pdf', 'SOURCE_ORPHAN'],
        ['videos/lesson.mp4', 'CONSISTENT'],
      ]);
      expect(first.rows[2]).toEqual(
        expect.objectContaining({
          metadataPresent: true,
          metadataValid: true,
          sha256: digest,
          targetState: 'NOT_CHECKED_NO_PROVIDER_CALL',
        }),
      );
      expect(first.rows[1]?.duplicateChecksumKeys).toEqual([
        'videos/lesson.mp4',
      ]);
      expect(first.totals).toEqual(
        expect.objectContaining({
          consistentCount: 1,
          missingSourceCount: 1,
          sourceOrphanCount: 1,
          duplicateChecksumGroupCount: 1,
          terminalRowCount: 3,
          balanced: true,
        }),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('redacts record ids and isolates malformed, disallowed, and unsafe rows', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mh-upload-inventory-'));
    try {
      await Promise.all([
        mkdir(join(root, 'videos'), { recursive: true }),
        mkdir(join(root, 'invoices'), { recursive: true }),
      ]);
      await Promise.all([
        writeFile(join(root, 'invoices', 'broken.pdf'), 'synthetic-pdf'),
        writeFile(
          join(root, 'invoices', 'broken.pdf.metadata.json'),
          '{not-json',
        ),
        writeFile(join(root, 'invoices', 'blocked.txt'), 'synthetic-text'),
      ]);

      const report = await buildUploadMigrationInventory({
        root,
        generatedAt: '2026-07-14T00:00:00.000Z',
        references: [
          {
            key: 'invoices/broken.pdf',
            recordId: 'private-order-id',
            surface: 'ACTIVATION_OPERATION_INVOICE',
          },
          {
            key: '../outside.pdf',
            recordId: 'private-payout-id',
            surface: 'PAYOUT_INVOICE',
          },
        ],
      });

      expect(
        report.rows.map((row) => [
          row.key,
          row.classification,
          row.unsafeReason,
        ]),
      ).toEqual([
        ['../outside.pdf', 'UNSAFE_SOURCE', 'UNSAFE_REFERENCE_KEY'],
        ['invoices/blocked.txt', 'UNSAFE_SOURCE', 'UNSUPPORTED_CONTENT_TYPE'],
        ['invoices/broken.pdf', 'UNSAFE_SOURCE', 'INVALID_METADATA'],
      ]);
      const serialized = JSON.stringify(report);
      expect(serialized).not.toContain('private-order-id');
      expect(serialized).not.toContain('private-payout-id');
      expect(report.rows[2]?.references[0]?.recordFingerprint).toMatch(
        /^[a-f0-9]{64}$/,
      );
      expect(report.totals).toEqual(
        expect.objectContaining({
          unsafeSourceCount: 3,
          invalidMetadataCount: 1,
          balanced: true,
        }),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
