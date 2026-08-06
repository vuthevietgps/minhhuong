import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildLearningReleaseCandidateEvidenceManifest,
  toLearningReleaseCandidateEvidenceManifestMarkdown,
} from './release-candidate-evidence-manifest';
import type { LearningReleaseCandidateGateReport } from './release-candidate-go-live-gate-matrix';

describe('LearningReleaseCandidateEvidenceManifest', () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  const makeRepo = () => {
    const root = mkdtempSync(join(tmpdir(), 'mh-release-evidence-'));
    tempRoots.push(root);
    mkdirSync(join(root, 'exports'), { recursive: true });
    mkdirSync(join(root, 'docs', 'approval'), { recursive: true });
    mkdirSync(join(root, 'apps', 'api', 'prisma', 'migrations', '001'), {
      recursive: true,
    });
    writeFileSync(join(root, 'exports', 'role.json'), '{"role":"PARENT"}\n');
    writeFileSync(join(root, 'exports', 'smoke.json'), '{"status":"PASS"}\n');
    writeFileSync(join(root, 'docs', 'approval', 'staging.json'), '{}\n');
    writeFileSync(
      join(root, 'apps', 'api', 'prisma', 'migrations', '001', 'migration.sql'),
      'SELECT 1;\n',
    );
    return root;
  };

  const makeGateReport = (): LearningReleaseCandidateGateReport =>
    ({
      schemaVersion: 'learning-release-candidate-go-live-gate.v4',
      generatedAt: '2026-07-10T10:00:00.000Z',
      goLiveDecision: 'GO_LIVE_BLOCKED',
      productionReady: false,
      productionEnabled: false,
      productionExecutionAuthorized: false,
      roleJourneyRows: [
        {
          journeyId: 'rc-parent-happy-path',
          evidencePaths: ['exports/role.json'],
        },
      ],
      smokeRows: [
        {
          smokeId: 'rc-smoke-local',
          evidencePaths: ['exports/smoke.json'],
        },
      ],
      deployReadinessRows: [
        {
          gateId: 'runtime-db-migration-rollback',
          evidencePaths: ['apps/api/prisma/migrations'],
        },
      ],
      approvalRows: [
        {
          approvalId: 'release-approval-database-owner',
          approvalEvidenceRefs: ['docs/approval/staging.json'],
        },
      ],
      approvalScope: {
        evidencePath: 'docs/approval/staging.json',
      },
      stagingRehearsal: {
        evidencePath: 'exports/smoke.json',
      },
      totals: {
        productionReadyClaimCount: 0,
      },
    }) as LearningReleaseCandidateGateReport;

  it('hashes every unique file and directory reference with a stable local manifest', () => {
    const repoRoot = makeRepo();
    const first = buildLearningReleaseCandidateEvidenceManifest(
      repoRoot,
      makeGateReport(),
    );
    const second = buildLearningReleaseCandidateEvidenceManifest(
      repoRoot,
      makeGateReport(),
    );

    expect(first.status).toBe('PASS_LOCAL');
    expect(first.gateContractStatus).toBe('PASS');
    expect(first.totals).toEqual(
      expect.objectContaining({
        referenceCount: 6,
        uniqueEvidencePathCount: 4,
        verifiedEvidencePathCount: 4,
        failedEvidencePathCount: 0,
        fileEvidencePathCount: 3,
        directoryEvidencePathCount: 1,
        hashedFileCount: 4,
      }),
    );
    expect(first.overallSha256).toBe(second.overallSha256);
    expect(first.entries.every((entry) => entry.status === 'VERIFIED')).toBe(
      true,
    );
    expect(
      first.entries.find(
        (entry) => entry.path === 'apps/api/prisma/migrations',
      ),
    ).toEqual(expect.objectContaining({ kind: 'DIRECTORY', fileCount: 1 }));
  });

  it('fails closed for missing and traversal evidence without reading outside the repo', () => {
    const repoRoot = makeRepo();
    const report = makeGateReport();
    report.roleJourneyRows[0].evidencePaths = [
      'exports/missing.json',
      '../outside.json',
    ];
    const manifest = buildLearningReleaseCandidateEvidenceManifest(
      repoRoot,
      report,
    );

    expect(manifest.status).toBe('FAIL_CLOSED');
    expect(manifest.totals.failedEvidencePathCount).toBe(2);
    expect(manifest.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '../outside.json',
          status: 'UNSAFE_PATH',
        }),
        expect.objectContaining({
          path: 'exports/missing.json',
          status: 'MISSING',
        }),
      ]),
    );
  });

  it('rejects a production-ready gate even when every evidence path exists', () => {
    const repoRoot = makeRepo();
    const report = makeGateReport();
    Object.assign(report, { productionReady: true });
    const manifest = buildLearningReleaseCandidateEvidenceManifest(
      repoRoot,
      report,
    );
    const markdown =
      toLearningReleaseCandidateEvidenceManifestMarkdown(manifest);

    expect(manifest.status).toBe('FAIL_CLOSED');
    expect(manifest.gateContractStatus).toBe('FAIL_CLOSED');
    expect(manifest.totals.failedEvidencePathCount).toBe(0);
    expect(markdown).toContain('status=FAIL_CLOSED');
    expect(markdown).toContain('production_ready=false');
  });
});
