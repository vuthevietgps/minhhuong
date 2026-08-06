import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, type Stats } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import type { LearningReleaseCandidateGateReport } from './release-candidate-go-live-gate-matrix';

export type LearningReleaseCandidateEvidenceManifestEntryStatus =
  | 'VERIFIED'
  | 'MISSING'
  | 'UNSAFE_PATH'
  | 'SYMLINK_NOT_ALLOWED'
  | 'UNSUPPORTED_PATH_TYPE';

export type LearningReleaseCandidateEvidenceManifestEntry = {
  path: string;
  referencedBy: string[];
  status: LearningReleaseCandidateEvidenceManifestEntryStatus;
  kind: 'FILE' | 'DIRECTORY' | null;
  sha256: string | null;
  byteCount: number;
  fileCount: number;
  failureReason: string | null;
};

export type LearningReleaseCandidateEvidenceManifest = {
  schemaVersion: 'learning-release-candidate-evidence-manifest.v1';
  generatedAt: string;
  fixtureKind: 'learning-local-demo-only';
  sourceGateSchemaVersion: string;
  sourceGateGeneratedAt: string;
  sourceGatePath: 'exports/learning-local-demo-release-candidate-go-live-gate-report.json';
  status: 'PASS_LOCAL' | 'FAIL_CLOSED';
  gateContractStatus: 'PASS' | 'FAIL_CLOSED';
  overallSha256: string;
  entries: LearningReleaseCandidateEvidenceManifestEntry[];
  totals: {
    referenceCount: number;
    uniqueEvidencePathCount: number;
    verifiedEvidencePathCount: number;
    failedEvidencePathCount: number;
    fileEvidencePathCount: number;
    directoryEvidencePathCount: number;
    hashedFileCount: number;
    hashedByteCount: number;
  };
  safety: {
    productionReady: false;
    productionEnabled: false;
    productionExecutionAuthorized: false;
    productionDbUsed: false;
    providerApiUsed: false;
    paymentRefundPayoutMutationUsed: false;
    liveNotificationUsed: false;
    liveAiProviderUsed: false;
    realCustomerOrStudentMutationUsed: false;
  };
};

type EvidenceReference = {
  path: string;
  source: string;
};

type HashedPath = {
  kind: 'FILE' | 'DIRECTORY';
  sha256: string;
  byteCount: number;
  fileCount: number;
};

class EvidencePathError extends Error {
  constructor(
    readonly status: Exclude<
      LearningReleaseCandidateEvidenceManifestEntryStatus,
      'VERIFIED'
    >,
    message: string,
  ) {
    super(message);
  }
}

const digest = (value: string | Buffer) =>
  createHash('sha256').update(value).digest('hex');

const normalizeEvidencePath = (path: string) => path.replaceAll('\\', '/');

const validateEvidencePath = (path: string) => {
  const normalized = normalizeEvidencePath(path);
  const segments = normalized.split('/');

  if (
    normalized.length === 0 ||
    normalized.includes('\0') ||
    isAbsolute(path) ||
    /^(?:[a-z]+:|[\\/])/i.test(path) ||
    segments.includes('..')
  ) {
    throw new EvidencePathError(
      'UNSAFE_PATH',
      'Evidence path must be a non-empty repo-relative path without traversal.',
    );
  }

  return normalized;
};

const assertRepoContained = (repoRoot: string, absolutePath: string) => {
  const repoRelativePath = relative(repoRoot, absolutePath);
  if (
    repoRelativePath.length === 0 ||
    repoRelativePath === '..' ||
    repoRelativePath.startsWith(`..${sep}`) ||
    isAbsolute(repoRelativePath)
  ) {
    throw new EvidencePathError(
      'UNSAFE_PATH',
      'Evidence path resolved outside the repository root.',
    );
  }
};

const readStats = (absolutePath: string): Stats => {
  try {
    return lstatSync(absolutePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      throw new EvidencePathError(
        'MISSING',
        'Referenced evidence path does not exist.',
      );
    }
    throw error;
  }
};

const assertNoSymlinkSegments = (repoRoot: string, normalizedPath: string) => {
  let current = repoRoot;
  for (const segment of normalizedPath.split('/')) {
    current = resolve(current, segment);
    const stats = readStats(current);
    if (stats.isSymbolicLink()) {
      throw new EvidencePathError(
        'SYMLINK_NOT_ALLOWED',
        'Evidence paths and their ancestors must not be symbolic links.',
      );
    }
  }
};

const hashDirectory = (absoluteDirectory: string): HashedPath => {
  const files: Array<{ path: string; sha256: string; byteCount: number }> = [];

  const visit = (absoluteCurrent: string, relativeCurrent: string) => {
    for (const entry of readdirSync(absoluteCurrent, {
      withFileTypes: true,
    }).sort((left, right) => left.name.localeCompare(right.name))) {
      const absoluteEntry = resolve(absoluteCurrent, entry.name);
      const relativeEntry = relativeCurrent
        ? `${relativeCurrent}/${entry.name}`
        : entry.name;
      const stats = readStats(absoluteEntry);

      if (stats.isSymbolicLink()) {
        throw new EvidencePathError(
          'SYMLINK_NOT_ALLOWED',
          'Evidence directories must not contain symbolic links.',
        );
      }
      if (stats.isDirectory()) {
        visit(absoluteEntry, relativeEntry);
        continue;
      }
      if (!stats.isFile()) {
        throw new EvidencePathError(
          'UNSUPPORTED_PATH_TYPE',
          'Evidence directories may contain only regular files and directories.',
        );
      }

      const content = readFileSync(absoluteEntry);
      files.push({
        path: relativeEntry.replaceAll('\\', '/'),
        sha256: digest(content),
        byteCount: content.byteLength,
      });
    }
  };

  visit(absoluteDirectory, '');
  return {
    kind: 'DIRECTORY',
    sha256: digest(JSON.stringify(files)),
    byteCount: files.reduce((total, file) => total + file.byteCount, 0),
    fileCount: files.length,
  };
};

const hashEvidencePath = (
  repoRoot: string,
  evidencePath: string,
): HashedPath => {
  const normalized = validateEvidencePath(evidencePath);
  const absolutePath = resolve(repoRoot, normalized);
  assertRepoContained(repoRoot, absolutePath);
  assertNoSymlinkSegments(repoRoot, normalized);
  const stats = readStats(absolutePath);

  if (stats.isFile()) {
    const content = readFileSync(absolutePath);
    return {
      kind: 'FILE',
      sha256: digest(content),
      byteCount: content.byteLength,
      fileCount: 1,
    };
  }
  if (stats.isDirectory()) {
    return hashDirectory(absolutePath);
  }
  throw new EvidencePathError(
    'UNSUPPORTED_PATH_TYPE',
    'Evidence path must identify a regular file or directory.',
  );
};

const collectEvidenceReferences = (
  report: LearningReleaseCandidateGateReport,
): EvidenceReference[] => [
  ...report.roleJourneyRows.flatMap((row) =>
    row.evidencePaths.map((path) => ({
      path,
      source: `role_journey:${row.journeyId}`,
    })),
  ),
  ...report.smokeRows.flatMap((row) =>
    row.evidencePaths.map((path) => ({
      path,
      source: `smoke:${row.smokeId}`,
    })),
  ),
  ...report.deployReadinessRows.flatMap((row) =>
    row.evidencePaths.map((path) => ({
      path,
      source: `deploy_gate:${row.gateId}`,
    })),
  ),
  ...report.approvalRows.flatMap((row) =>
    row.approvalEvidenceRefs.map((path) => ({
      path,
      source: `approval:${row.approvalId}`,
    })),
  ),
  {
    path: report.approvalScope.evidencePath,
    source: 'approval_scope',
  },
  {
    path: report.stagingRehearsal.evidencePath,
    source: 'staging_rehearsal',
  },
];

const gateContractPasses = (report: LearningReleaseCandidateGateReport) =>
  report.schemaVersion === 'learning-release-candidate-go-live-gate.v4' &&
  report.goLiveDecision === 'GO_LIVE_BLOCKED' &&
  report.productionReady === false &&
  report.productionEnabled === false &&
  report.productionExecutionAuthorized === false &&
  report.totals.productionReadyClaimCount === 0;

export const buildLearningReleaseCandidateEvidenceManifest = (
  repoRoot: string,
  report: LearningReleaseCandidateGateReport,
  generatedAt = report.generatedAt,
): LearningReleaseCandidateEvidenceManifest => {
  const references = collectEvidenceReferences(report);
  const referencesByPath = new Map<string, Set<string>>();

  for (const reference of references) {
    const normalized = normalizeEvidencePath(reference.path);
    const sources = referencesByPath.get(normalized) ?? new Set<string>();
    sources.add(reference.source);
    referencesByPath.set(normalized, sources);
  }

  const entries = [...referencesByPath.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([path, sources]): LearningReleaseCandidateEvidenceManifestEntry => {
      try {
        const hashed = hashEvidencePath(repoRoot, path);
        return {
          path,
          referencedBy: [...sources].sort(),
          status: 'VERIFIED',
          kind: hashed.kind,
          sha256: hashed.sha256,
          byteCount: hashed.byteCount,
          fileCount: hashed.fileCount,
          failureReason: null,
        };
      } catch (error) {
        if (!(error instanceof EvidencePathError)) {
          throw error;
        }
        return {
          path,
          referencedBy: [...sources].sort(),
          status: error.status,
          kind: null,
          sha256: null,
          byteCount: 0,
          fileCount: 0,
          failureReason: error.message,
        };
      }
    });

  const gateContractStatus = gateContractPasses(report)
    ? ('PASS' as const)
    : ('FAIL_CLOSED' as const);
  const failedEvidencePathCount = entries.filter(
    (entry) => entry.status !== 'VERIFIED',
  ).length;
  const status =
    gateContractStatus === 'PASS' &&
    entries.length > 0 &&
    failedEvidencePathCount === 0
      ? ('PASS_LOCAL' as const)
      : ('FAIL_CLOSED' as const);
  const overallSha256 = digest(
    JSON.stringify({
      gateContractStatus,
      entries: entries.map((entry) => ({
        path: entry.path,
        status: entry.status,
        kind: entry.kind,
        sha256: entry.sha256,
        byteCount: entry.byteCount,
        fileCount: entry.fileCount,
      })),
    }),
  );

  return {
    schemaVersion: 'learning-release-candidate-evidence-manifest.v1',
    generatedAt,
    fixtureKind: 'learning-local-demo-only',
    sourceGateSchemaVersion: report.schemaVersion,
    sourceGateGeneratedAt: report.generatedAt,
    sourceGatePath:
      'exports/learning-local-demo-release-candidate-go-live-gate-report.json',
    status,
    gateContractStatus,
    overallSha256,
    entries,
    totals: {
      referenceCount: references.length,
      uniqueEvidencePathCount: entries.length,
      verifiedEvidencePathCount: entries.length - failedEvidencePathCount,
      failedEvidencePathCount,
      fileEvidencePathCount: entries.filter((entry) => entry.kind === 'FILE')
        .length,
      directoryEvidencePathCount: entries.filter(
        (entry) => entry.kind === 'DIRECTORY',
      ).length,
      hashedFileCount: entries.reduce(
        (total, entry) => total + entry.fileCount,
        0,
      ),
      hashedByteCount: entries.reduce(
        (total, entry) => total + entry.byteCount,
        0,
      ),
    },
    safety: {
      productionReady: false,
      productionEnabled: false,
      productionExecutionAuthorized: false,
      productionDbUsed: false,
      providerApiUsed: false,
      paymentRefundPayoutMutationUsed: false,
      liveNotificationUsed: false,
      liveAiProviderUsed: false,
      realCustomerOrStudentMutationUsed: false,
    },
  };
};

export const toLearningReleaseCandidateEvidenceManifestMarkdown = (
  manifest: LearningReleaseCandidateEvidenceManifest,
) =>
  [
    '# Learning Release Candidate Evidence Manifest',
    '',
    `Generated: ${manifest.generatedAt}`,
    '',
    '## Decision',
    '',
    `- status=${manifest.status}`,
    `- gate_contract_status=${manifest.gateContractStatus}`,
    `- source_gate_schema=${manifest.sourceGateSchemaVersion}`,
    `- overall_sha256=${manifest.overallSha256}`,
    '- production_ready=false',
    '- production_enabled=false',
    '- production_execution_authorized=false',
    '',
    '## Totals',
    '',
    `- References: ${manifest.totals.referenceCount}`,
    `- Unique evidence paths: ${manifest.totals.uniqueEvidencePathCount}`,
    `- Verified evidence paths: ${manifest.totals.verifiedEvidencePathCount}`,
    `- Failed evidence paths: ${manifest.totals.failedEvidencePathCount}`,
    `- Hashed files: ${manifest.totals.hashedFileCount}`,
    `- Hashed bytes: ${manifest.totals.hashedByteCount}`,
    '',
    '## Evidence',
    '',
    '| Path | Status | Kind | Files | Bytes | SHA-256 | Referenced by | Failure |',
    '| --- | --- | --- | ---: | ---: | --- | --- | --- |',
    ...manifest.entries.map(
      (entry) =>
        `| ${entry.path} | ${entry.status} | ${entry.kind ?? '-'} | ${entry.fileCount} | ${entry.byteCount} | ${entry.sha256 ?? '-'} | ${entry.referencedBy.join('<br>')} | ${entry.failureReason ?? '-'} |`,
    ),
    '',
  ].join('\n');
