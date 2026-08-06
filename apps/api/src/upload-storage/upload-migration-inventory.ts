import { createHash } from 'node:crypto';
import type { Dirent } from 'node:fs';
import { lstat, open, readFile, readdir } from 'node:fs/promises';
import { basename, extname, join, relative, resolve, sep } from 'node:path';
import { assertSafeObjectKey } from './blob-storage';

export type UploadMigrationReference = {
  key: string;
  recordId: string;
  surface:
    | 'ACTIVATION_OPERATION_INVOICE'
    | 'ACTIVATION_SALE_INVOICE'
    | 'PAYOUT_INVOICE'
    | 'VIDEO_ASSET';
};

export type UploadMigrationClassification =
  'CONSISTENT' | 'MISSING_SOURCE' | 'SOURCE_ORPHAN' | 'UNSAFE_SOURCE';

export type UploadMigrationInventoryRow = {
  key: string;
  classification: UploadMigrationClassification;
  references: Array<{
    recordFingerprint: string;
    surface: UploadMigrationReference['surface'];
  }>;
  size: number | null;
  modifiedAt: string | null;
  contentType: string | null;
  sha256: string | null;
  targetKey: string | null;
  metadataPresent: boolean;
  metadataValid: boolean;
  unsafeReason: string | null;
  duplicateChecksumKeys: string[];
  targetState: 'NOT_CHECKED_NO_PROVIDER_CALL';
};

export type UploadMigrationInventoryReport = {
  schemaVersion: 'upload-migration-inventory.v1';
  generatedAt: string;
  dryRunOnly: true;
  databaseMutationCount: 0;
  providerCallCount: 0;
  rows: UploadMigrationInventoryRow[];
  totals: {
    uniqueReferenceKeyCount: number;
    sourceFileCount: number;
    consistentCount: number;
    missingSourceCount: number;
    sourceOrphanCount: number;
    unsafeSourceCount: number;
    invalidMetadataCount: number;
    duplicateChecksumGroupCount: number;
    terminalRowCount: number;
    balanced: boolean;
  };
};

type SourceFile = {
  key: string;
  path: string;
  unsafeReason?: string;
};

type Metadata = { contentType: string; size: number; sha256: string };

const contentTypeByExtension: Record<string, string> = {
  '.avi': 'video/x-msvideo',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
};

const videoContentTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
]);
const invoiceContentTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const maxVideoSize = 1024 * 1024 * 1024;
const maxInvoiceSize = 20 * 1024 * 1024;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseMetadata = (raw: string): Metadata | null => {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    !isRecord(value) ||
    typeof value.contentType !== 'string' ||
    typeof value.size !== 'number' ||
    !Number.isSafeInteger(value.size) ||
    value.size < 0 ||
    typeof value.sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(value.sha256)
  ) {
    return null;
  }
  return {
    contentType: value.contentType,
    size: value.size,
    sha256: value.sha256,
  };
};

const sha256File = async (path: string) => {
  const digest = createHash('sha256');
  const handle = await open(path, 'r');
  const chunk = Buffer.alloc(64 * 1024);
  try {
    let position = 0;
    while (true) {
      const { bytesRead } = await handle.read(chunk, 0, chunk.length, position);
      if (bytesRead === 0) break;
      digest.update(chunk.subarray(0, bytesRead));
      position += bytesRead;
    }
  } finally {
    await handle.close();
  }
  return digest.digest('hex');
};

const toKey = (root: string, path: string) =>
  relative(root, path).split(sep).join('/');

const listSourceFiles = async (root: string): Promise<SourceFile[]> => {
  const files: SourceFile[] = [];
  const visit = async (directory: string) => {
    try {
      const directoryStat = await lstat(directory);
      if (directoryStat.isSymbolicLink()) {
        files.push({
          key: toKey(root, directory),
          path: directory,
          unsafeReason: 'SYMLINK_NOT_ALLOWED',
        });
        return;
      }
      if (!directoryStat.isDirectory()) {
        files.push({
          key: toKey(root, directory),
          path: directory,
          unsafeReason: 'UPLOAD_CATEGORY_NOT_DIRECTORY',
        });
        return;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
    let entries: Dirent<string>[];
    try {
      entries = await readdir(directory, {
        withFileTypes: true,
        encoding: 'utf8',
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const path = join(directory, entry.name);
      const key = toKey(root, path);
      if (entry.isSymbolicLink()) {
        files.push({ key, path, unsafeReason: 'SYMLINK_NOT_ALLOWED' });
      } else if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.isFile() && !entry.name.endsWith('.metadata.json')) {
        files.push({ key, path });
      }
    }
  };

  await Promise.all([
    visit(join(root, 'videos')),
    visit(join(root, 'invoices')),
  ]);
  return files.sort((left, right) => left.key.localeCompare(right.key));
};

const safeTargetKey = (key: string, digest: string) => {
  const extension = extname(key)
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, '');
  const name = basename(key, extname(key))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const category = key.startsWith('videos/') ? 'videos' : 'invoices';
  return `${category}/migration/${digest}-${name || 'upload'}${extension}`;
};

const fingerprintReference = (reference: UploadMigrationReference) => ({
  recordFingerprint: createHash('sha256')
    .update(`${reference.surface}:${reference.recordId}`)
    .digest('hex'),
  surface: reference.surface,
});

const referenceKeyIssue = (
  key: string,
  references: UploadMigrationReference[],
): string | null => {
  try {
    assertSafeObjectKey(key);
  } catch {
    return 'UNSAFE_REFERENCE_KEY';
  }
  if (!key.startsWith('videos/') && !key.startsWith('invoices/')) {
    return 'UNSUPPORTED_UPLOAD_CATEGORY';
  }
  const hasVideoReference = references.some(
    (reference) => reference.surface === 'VIDEO_ASSET',
  );
  const hasInvoiceReference = references.some(
    (reference) => reference.surface !== 'VIDEO_ASSET',
  );
  if (
    (hasVideoReference && !key.startsWith('videos/')) ||
    (hasInvoiceReference && !key.startsWith('invoices/'))
  ) {
    return 'REFERENCE_SURFACE_KEY_MISMATCH';
  }
  return null;
};

export const buildUploadMigrationInventory = async (input: {
  root: string;
  references: UploadMigrationReference[];
  generatedAt?: string;
}): Promise<UploadMigrationInventoryReport> => {
  const root = resolve(input.root);
  const sourceFiles = await listSourceFiles(root);
  const referencesByKey = new Map<string, UploadMigrationReference[]>();
  for (const reference of input.references) {
    const existing = referencesByKey.get(reference.key) ?? [];
    existing.push(reference);
    referencesByKey.set(reference.key, existing);
  }

  const rows: UploadMigrationInventoryRow[] = [];
  for (const source of sourceFiles) {
    const references = referencesByKey.get(source.key) ?? [];
    referencesByKey.delete(source.key);
    let unsafeReason =
      source.unsafeReason ?? referenceKeyIssue(source.key, references);
    try {
      assertSafeObjectKey(source.key);
      const resolvedPath = resolve(source.path);
      if (!resolvedPath.startsWith(`${root}${sep}`)) {
        unsafeReason = 'SOURCE_OUTSIDE_ROOT';
      }
    } catch {
      unsafeReason = 'UNSAFE_OBJECT_KEY';
    }

    if (unsafeReason) {
      rows.push({
        key: source.key,
        classification: 'UNSAFE_SOURCE',
        references: references.map(fingerprintReference),
        size: null,
        modifiedAt: null,
        contentType: null,
        sha256: null,
        targetKey: null,
        metadataPresent: false,
        metadataValid: false,
        unsafeReason,
        duplicateChecksumKeys: [],
        targetState: 'NOT_CHECKED_NO_PROVIDER_CALL',
      });
      continue;
    }

    const file = await lstat(source.path);
    const digest = await sha256File(source.path);
    let metadata: Metadata | null = null;
    let metadataPresent = false;
    try {
      metadata = parseMetadata(
        await readFile(`${source.path}.metadata.json`, 'utf8'),
      );
      metadataPresent = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    const inferredContentType =
      contentTypeByExtension[extname(source.key).toLowerCase()] ??
      'application/octet-stream';
    const contentType = metadata?.contentType ?? inferredContentType;
    const metadataValid =
      !metadataPresent ||
      (metadata !== null &&
        metadata.size === file.size &&
        metadata.sha256 === digest &&
        metadata.contentType === inferredContentType);
    const allowedContentTypes = source.key.startsWith('videos/')
      ? videoContentTypes
      : invoiceContentTypes;
    const maxSize = source.key.startsWith('videos/')
      ? maxVideoSize
      : maxInvoiceSize;
    if (!metadataValid) {
      unsafeReason = 'INVALID_METADATA';
    } else if (!allowedContentTypes.has(contentType)) {
      unsafeReason = 'UNSUPPORTED_CONTENT_TYPE';
    } else if (file.size > maxSize) {
      unsafeReason = 'FILE_TOO_LARGE';
    }
    rows.push({
      key: source.key,
      classification: unsafeReason
        ? 'UNSAFE_SOURCE'
        : references.length > 0
          ? 'CONSISTENT'
          : 'SOURCE_ORPHAN',
      references: references.map(fingerprintReference),
      size: file.size,
      modifiedAt: file.mtime.toISOString(),
      contentType,
      sha256: digest,
      targetKey: unsafeReason ? null : safeTargetKey(source.key, digest),
      metadataPresent,
      metadataValid,
      unsafeReason,
      duplicateChecksumKeys: [],
      targetState: 'NOT_CHECKED_NO_PROVIDER_CALL',
    });
  }

  for (const [key, references] of referencesByKey.entries()) {
    const unsafeReason = referenceKeyIssue(key, references);
    rows.push({
      key,
      classification: unsafeReason ? 'UNSAFE_SOURCE' : 'MISSING_SOURCE',
      references: references.map(fingerprintReference),
      size: null,
      modifiedAt: null,
      contentType: null,
      sha256: null,
      targetKey: null,
      metadataPresent: false,
      metadataValid: false,
      unsafeReason,
      duplicateChecksumKeys: [],
      targetState: 'NOT_CHECKED_NO_PROVIDER_CALL',
    });
  }
  rows.sort((left, right) => left.key.localeCompare(right.key));

  const rowsByDigest = new Map<string, UploadMigrationInventoryRow[]>();
  for (const row of rows) {
    if (!row.sha256) continue;
    const matching = rowsByDigest.get(row.sha256) ?? [];
    matching.push(row);
    rowsByDigest.set(row.sha256, matching);
  }
  let duplicateChecksumGroupCount = 0;
  for (const matching of rowsByDigest.values()) {
    if (matching.length < 2) continue;
    duplicateChecksumGroupCount += 1;
    for (const row of matching) {
      row.duplicateChecksumKeys = matching
        .map((candidate) => candidate.key)
        .filter((key) => key !== row.key)
        .sort();
    }
  }

  const count = (classification: UploadMigrationClassification) =>
    rows.filter((row) => row.classification === classification).length;
  const totals = {
    uniqueReferenceKeyCount: new Set(input.references.map((item) => item.key))
      .size,
    sourceFileCount: sourceFiles.length,
    consistentCount: count('CONSISTENT'),
    missingSourceCount: count('MISSING_SOURCE'),
    sourceOrphanCount: count('SOURCE_ORPHAN'),
    unsafeSourceCount: count('UNSAFE_SOURCE'),
    invalidMetadataCount: rows.filter(
      (row) => row.metadataPresent && !row.metadataValid,
    ).length,
    duplicateChecksumGroupCount,
    terminalRowCount: rows.length,
    balanced:
      rows.every((row) => Boolean(row.classification)) &&
      count('CONSISTENT') +
        count('MISSING_SOURCE') +
        count('SOURCE_ORPHAN') +
        count('UNSAFE_SOURCE') ===
        rows.length,
  };

  return {
    schemaVersion: 'upload-migration-inventory.v1',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    dryRunOnly: true,
    databaseMutationCount: 0,
    providerCallCount: 0,
    rows,
    totals,
  };
};
