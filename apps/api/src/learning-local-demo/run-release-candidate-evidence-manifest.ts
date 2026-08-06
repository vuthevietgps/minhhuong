import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  buildLearningReleaseCandidateEvidenceManifest,
  toLearningReleaseCandidateEvidenceManifestMarkdown,
} from './release-candidate-evidence-manifest';
import type { LearningReleaseCandidateGateReport } from './release-candidate-go-live-gate-matrix';

const repoRoot = resolve(__dirname, '../../../..');
const outputDir = resolve(
  process.env.LEARNING_LOCAL_DEMO_REPORT_DIR ??
    process.env.ERP_LOCAL_DEMO_REPORT_DIR ??
    '../../exports',
);
const gateReportPath = join(
  outputDir,
  'learning-local-demo-release-candidate-go-live-gate-report.json',
);
const manifestJsonPath = join(
  outputDir,
  'learning-release-candidate-evidence-manifest.json',
);
const manifestMarkdownPath = join(
  outputDir,
  'learning-release-candidate-evidence-manifest.md',
);

if (!existsSync(gateReportPath)) {
  throw new Error(
    'Release-candidate gate report is missing; run the learning report generator first.',
  );
}

const gateReport = JSON.parse(
  readFileSync(gateReportPath, 'utf8'),
) as LearningReleaseCandidateGateReport;
const manifest = buildLearningReleaseCandidateEvidenceManifest(
  repoRoot,
  gateReport,
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(
  manifestJsonPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);
writeFileSync(
  manifestMarkdownPath,
  toLearningReleaseCandidateEvidenceManifestMarkdown(manifest),
  'utf8',
);

if (manifest.status !== 'PASS_LOCAL') {
  throw new Error(
    `Release-candidate evidence verification failed closed with ${manifest.totals.failedEvidencePathCount} invalid path(s).`,
  );
}

console.log('LEARNING_RELEASE_CANDIDATE_EVIDENCE_MANIFEST PASS');
console.log(`evidenceManifestJson=${manifestJsonPath}`);
console.log(`evidenceManifestMarkdown=${manifestMarkdownPath}`);
console.log(`evidenceManifestPaths=${manifest.totals.uniqueEvidencePathCount}`);
console.log(`evidenceManifestFiles=${manifest.totals.hashedFileCount}`);
console.log(`evidenceManifestSha256=${manifest.overallSha256}`);
