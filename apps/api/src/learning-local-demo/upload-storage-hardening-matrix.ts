import {
  inspectProductionRuntimeSafety,
  type ProductionRuntimeSafetyViolation,
} from '../runtime-safety/production-runtime-safety';
import { filesystemUploadSurfaces } from '../upload-storage/filesystem-upload-storage';

type UploadStorageNegativeCase = {
  caseId: string;
  expectedViolation: ProductionRuntimeSafetyViolation['code'];
  observedViolations: string[];
  decision: 'DENIED_AS_EXPECTED' | 'UNSAFE_ACCEPT';
};

const hostedStagingEnvironment = {
  NODE_ENV: 'production',
  DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
  PRODUCTION_READY: 'false',
  PRODUCTION_ENABLED: 'false',
  LOCAL_DEMO_ROUTES_ENABLED: 'false',
  JWT_SECRET: 'synthetic-jwt-secret-at-least-thirty-two-characters',
  CORS_ORIGIN: 'https://learn.staging.example.test',
  API_PUBLIC_URL: 'https://api.staging.example.test',
  WEB_PUBLIC_URL: 'https://learn.staging.example.test',
  NEXT_PUBLIC_API_URL: 'https://api.staging.example.test',
  DATABASE_URL:
    'postgresql://synthetic:synthetic@postgres.internal:5432/synthetic',
  REDIS_URL: 'redis://:synthetic@redis.internal:6379/0',
  AUTH_SESSION_STORE_PROVIDER: 'prisma',
  AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
  AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'prisma',
  AUTH_OPERATIONAL_CONTROL_KEY_SECRET:
    'synthetic-control-secret-at-least-thirty-two-characters',
  NOTIFICATION_PROVIDER: 'disabled',
  PAYMENT_PROVIDER: 'disabled',
  AI_PROVIDER: 'disabled',
  VIDEO_PROVIDER: 'disabled',
  UPLOAD_STORAGE_PROVIDER: 's3',
  UPLOAD_STORAGE_TOPOLOGY: 'shared-object',
  UPLOAD_S3_BUCKET: 'synthetic-private-bucket',
  UPLOAD_S3_REGION: 'us-east-1',
  UPLOAD_S3_CREDENTIALS_REFERENCE: 'synthetic-secret-reference',
  UPLOAD_S3_TIMEOUT_MS: '5000',
  UPLOAD_S3_MAX_ATTEMPTS: '3',
  API_REPLICA_COUNT: '1',
} as const;

const buildNegativeCase = (
  caseId: string,
  expectedViolation: ProductionRuntimeSafetyViolation['code'],
  override: Record<string, string | undefined>,
): UploadStorageNegativeCase => {
  const observedViolations = inspectProductionRuntimeSafety({
    ...hostedStagingEnvironment,
    ...override,
  }).violations.map((violation) => violation.code);

  return {
    caseId,
    expectedViolation,
    observedViolations,
    decision: observedViolations.includes(expectedViolation)
      ? 'DENIED_AS_EXPECTED'
      : 'UNSAFE_ACCEPT',
  };
};

export const buildLearningUploadStorageHardeningMatrixReport = (
  generatedAt = new Date().toISOString(),
) => {
  const surfaceRows = Object.values(filesystemUploadSurfaces).map(
    (surface) => ({
      ...surface,
      configuredRootReference: 'UPLOADS_PATH',
      provider: 's3' as const,
      productionMutationUsed: false as const,
    }),
  );
  const acceptedContract = inspectProductionRuntimeSafety(
    hostedStagingEnvironment,
  );
  const negativeCases = [
    buildNegativeCase(
      'initial-api-multi-instance-denied',
      'HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID',
      { API_REPLICA_COUNT: '2' },
    ),
    buildNegativeCase(
      's3-topology-undeclared-denied',
      'HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID',
      { UPLOAD_STORAGE_TOPOLOGY: undefined },
    ),
    buildNegativeCase(
      'hosted-filesystem-without-emergency-override-denied',
      'HOSTED_STAGING_UPLOADS_INVALID',
      {
        UPLOAD_STORAGE_PROVIDER: 'filesystem',
        UPLOADS_PATH: '/app/uploads',
        UPLOAD_STORAGE_TOPOLOGY: 'single-instance',
      },
    ),
  ];

  return {
    schemaVersion: 'learning-upload-storage-hardening-matrix.v1' as const,
    generatedAt,
    fixtureKind: 'repo-local-synthetic-only' as const,
    decision: 'PASS_OBJECT_STORAGE_FOUNDATION_LOCAL_ONLY' as const,
    productionReady: false as const,
    productionEnabled: false as const,
    storageContract: {
      provider: 's3' as const,
      topology: 'shared-object' as const,
      apiReplicaCount: 1,
      configuredRootReference: 'UPLOADS_PATH' as const,
      readinessRequiresWritableStorage: true,
      multiInstanceClaimAllowed: false,
    },
    surfaceRows,
    negativeCases,
    totals: {
      uploadSurfaceCount: surfaceRows.length,
      videoSurfaceCount: surfaceRows.filter(
        (row) => row.subdirectory === 'videos',
      ).length,
      invoiceSurfaceCount: surfaceRows.filter(
        (row) => row.subdirectory === 'invoices',
      ).length,
      acceptedContractViolationCount: acceptedContract.violations.length,
      deniedNegativeCaseCount: negativeCases.filter(
        (row) => row.decision === 'DENIED_AS_EXPECTED',
      ).length,
      unsafeAcceptedNegativeCaseCount: negativeCases.filter(
        (row) => row.decision === 'UNSAFE_ACCEPT',
      ).length,
      openLocalSafetyGateCount: 0,
    },
    safety: {
      productionDbUsed: false,
      hostedDeploymentUsed: false,
      providerApiUsed: false,
      realUploadUsed: false,
      realLearnerCustomerOrderPaymentDataUsed: false,
      plaintextSecretsIncluded: false,
      productionReady: false,
      productionEnabled: false,
    },
    remainingBlockers: [
      'Initial hosted staging remains limited to exactly one API replica by business decision.',
      'No real hosted bucket, provider credential reference, or provider acceptance has been supplied.',
      'Hosted storage capacity, backup/restore, retention/deletion, malware handling, private delivery, and owner acceptance remain external gates.',
    ],
  };
};

export const toLearningUploadStorageHardeningMatrixMarkdown = (
  report: ReturnType<typeof buildLearningUploadStorageHardeningMatrixReport>,
) =>
  [
    '# Learning Upload Storage Hardening Matrix',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Decision: \`${report.decision}\``,
    `- Upload surfaces: ${report.totals.uploadSurfaceCount}`,
    `- Denied negative cases: ${report.totals.deniedNegativeCaseCount}/${report.negativeCases.length}`,
    '- `production_ready=false`',
    '- `production_enabled=false`',
    '',
    '## Upload Surfaces',
    '',
    '| Surface | Actor scope | Route | Directory | Root |',
    '| --- | --- | --- | --- | --- |',
    ...report.surfaceRows.map(
      (row) =>
        `| ${row.surfaceId} | ${row.actorScope} | \`${row.route}\` | \`${row.subdirectory}\` | \`${row.configuredRootReference}\` |`,
    ),
    '',
    '## Fail-Closed Negative Cases',
    '',
    '| Case | Expected violation | Observed | Decision |',
    '| --- | --- | --- | --- |',
    ...report.negativeCases.map(
      (row) =>
        `| ${row.caseId} | \`${row.expectedViolation}\` | ${row.observedViolations.map((code) => `\`${code}\``).join(', ')} | ${row.decision} |`,
    ),
    '',
    '## Remaining Blockers',
    '',
    ...report.remainingBlockers.map((blocker) => `- ${blocker}`),
    '',
  ].join('\n');
