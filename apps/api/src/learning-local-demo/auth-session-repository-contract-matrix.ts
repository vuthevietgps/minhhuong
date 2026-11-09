import {
  dryRunKinds,
  learningLocalDemoAuthSessionRepositoryDryRunNotes,
  learningLocalDemoAuthSessionRepositorySchemaFields,
  learningLocalDemoAuthSessionRepositoryTransitions,
  safetyGateFixtureIds,
  schemaSurfaces,
  transitionKinds,
} from './auth-session-repository-contract.data';
import type {
  LearningLocalDemoAuthSessionRepositoryContractMatrixReport,
  LearningLocalDemoAuthSessionRepositoryEvidenceRow,
} from './auth-session-repository-contract.types';

export {
  learningLocalDemoAuthSessionRepositorySchemaFields,
  learningLocalDemoAuthSessionRepositoryTransitions,
  learningLocalDemoAuthSessionRepositoryDryRunNotes,
} from './auth-session-repository-contract.data';

export type {
  LearningLocalDemoAuthSessionRepositorySchemaSurface,
  LearningLocalDemoAuthSessionRepositoryTransitionKind,
  LearningLocalDemoAuthSessionRepositoryDryRunKind,
  LearningLocalDemoAuthSessionRepositorySchemaField,
  LearningLocalDemoAuthSessionRepositoryTransition,
  LearningLocalDemoAuthSessionRepositoryDryRunNote,
  LearningLocalDemoAuthSessionRepositoryEvidenceRow,
  LearningLocalDemoAuthSessionRepositoryContractMatrixReport,
} from './auth-session-repository-contract.types';

export const buildLearningLocalDemoAuthSessionRepositoryContractMatrixReport = (
  generatedAt = new Date().toISOString(),
): LearningLocalDemoAuthSessionRepositoryContractMatrixReport => {
  const schemaRows = learningLocalDemoAuthSessionRepositorySchemaFields;
  const transitionRows = learningLocalDemoAuthSessionRepositoryTransitions;
  const dryRunNotes = learningLocalDemoAuthSessionRepositoryDryRunNotes;
  const schemaSurfaceCounts = countBy(
    schemaSurfaces,
    schemaRows,
    (row) => row.surface,
  );
  const transitionCounts = countBy(
    transitionKinds,
    transitionRows,
    (row) => row.transitionKind,
  );
  const dryRunCounts = countBy(dryRunKinds, dryRunNotes, (row) => row.noteKind);
  const evidenceRows: LearningLocalDemoAuthSessionRepositoryEvidenceRow[] = [
    ...schemaSurfaces.map((surface) => ({
      evidenceKind: surface,
      evidenceCount: schemaSurfaceCounts[surface],
      stableFixtureIds: schemaRows
        .filter((row) => row.surface === surface)
        .map((row) => row.fieldId),
      fixtureOnly: true as const,
      productionDbUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${schemaSurfaceCounts[surface]} fixture-only ${surface} schema contract field(s).`,
    })),
    ...transitionKinds.map((transitionKind) => ({
      evidenceKind: transitionKind,
      evidenceCount: transitionCounts[transitionKind],
      stableFixtureIds: transitionRows
        .filter((row) => row.transitionKind === transitionKind)
        .map((row) => row.transitionId),
      fixtureOnly: true as const,
      productionDbUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${transitionCounts[transitionKind]} fixture-only ${transitionKind.toLowerCase()} transition contract(s).`,
    })),
    ...dryRunKinds.map((noteKind) => ({
      evidenceKind: noteKind,
      evidenceCount: dryRunCounts[noteKind],
      stableFixtureIds: dryRunNotes
        .filter((row) => row.noteKind === noteKind)
        .map((row) => row.noteId),
      fixtureOnly: true as const,
      productionDbUsed: false as const,
      mutationUsed: false as const,
      evidenceSummary: `${dryRunCounts[noteKind]} fixture-only ${noteKind.toLowerCase()} note(s).`,
    })),
    {
      evidenceKind: 'SAFETY_GATE',
      evidenceCount: safetyGateFixtureIds.length,
      stableFixtureIds: [...safetyGateFixtureIds],
      fixtureOnly: true,
      productionDbUsed: false,
      mutationUsed: false,
      evidenceSummary:
        'Repository contract evidence is local-demo only and keeps production_ready=false and production_enabled=false.',
    },
  ];

  return {
    reportName: 'Learning Local Demo Auth Session Repository Contract Matrix',
    generatedFor: 'local-demo-auth-session-repository-contract-matrix',
    generatedAt,
    productionReady: false,
    productionEnabled: false,
    fixtureOnly: true,
    endpointPath:
      '/v1/learning-local-demo/auth-session-repository-contract-matrix-report',
    dashboardEvidencePath:
      '/admin/learning-local-demo#auth-session-repository-contract-matrix',
    jsonExportPath:
      'exports/learning-local-demo-auth-session-repository-contract-matrix-report.json',
    markdownExportPath:
      'exports/learning-local-demo-auth-session-repository-contract-matrix-report.md',
    safety: {
      fixtureOnly: true,
      productionEnabled: false,
      productionDbUsed: false,
      noProductionDbRead: true,
      providerApiUsed: false,
      paymentProviderUsed: false,
      notificationProviderUsed: false,
      aiProviderExecutionUsed: false,
      liveAdsExecuted: false,
      realAuthMutationUsed: false,
      realSessionMutationUsed: false,
      realRefreshTokenMutationUsed: false,
      realAuditMutationUsed: false,
      realLearningMutationUsed: false,
      realErpMutationUsed: false,
      secretsRequired: false,
      deployUsed: false,
    },
    currentStatus: {
      status: 'LOCAL_DEMO_READY_WITH_NOTES',
      summary:
        'AuthSessionStore repository schema, Prisma implementation, refresh-token hash metadata, state transitions, fail-closed lookup, audit behavior, migration, rollback, and forward repair are disposable-local verified.',
      remainingLocalDemoNotes: [
        'The provider is not production-enabled; staging two-process API and backup/restore rehearsal remain required.',
        'Monitoring, retention approval, external security review, and manual go-live approval remain required.',
      ],
    },
    totals: {
      schemaSurfaceCount: schemaSurfaces.length,
      schemaFieldCount: schemaRows.length,
      sessionSchemaFieldCount: schemaSurfaceCounts.auth_sessions,
      refreshTokenSchemaFieldCount: schemaSurfaceCounts.auth_refresh_tokens,
      auditSchemaFieldCount: schemaSurfaceCounts.auth_session_audit_events,
      refreshTokenHashMetadataFieldCount: schemaRows.filter(
        (row) =>
          row.surface === 'auth_refresh_tokens' &&
          [
            'tokenHash',
            'rotatedAt',
            'reusedAt',
            'revokedAt',
            'replacedByTokenId',
          ].includes(row.fieldName),
      ).length,
      actorDeviceContextFieldCount: schemaRows.filter(
        (row) => row.actorOrDeviceContext,
      ).length,
      appendOnlyAuditContextFieldCount: schemaRows.filter(
        (row) => row.appendOnlyAuditContext,
      ).length,
      transitionConstraintCount: transitionRows.length,
      createTransitionCount: transitionCounts.CREATE_SESSION,
      rotateTransitionCount: transitionCounts.ROTATE_REFRESH_TOKEN,
      revokeTransitionCount: transitionCounts.REVOKE_SESSION,
      expireTransitionCount: transitionCounts.EXPIRE_SESSION,
      reuseDetectionTransitionCount: transitionCounts.REUSE_DETECTION,
      failClosedLookupTransitionCount: transitionCounts.FAIL_CLOSED_LOOKUP,
      migrationDryRunNoteCount: dryRunCounts.MIGRATION_DRY_RUN,
      rollbackNoteCount: dryRunCounts.ROLLBACK_NOTE,
      productionBlockerCount: dryRunNotes.filter((row) => row.productionBlocker)
        .length,
      manualApprovalRequiredCount: dryRunNotes.filter(
        (row) => row.manualApprovalRequired,
      ).length,
      evidenceRowCount: evidenceRows.length,
      localDemoNoteCount: 2,
      productionReadyClaimCount: 0,
      safetyGateCount: safetyGateFixtureIds.length,
      closedSafetyGateCount: safetyGateFixtureIds.length,
      openSafetyGateCount: 0,
    },
    statusCounts: {
      schemaSurface: schemaSurfaceCounts,
      transitionKind: transitionCounts,
      dryRunKind: dryRunCounts,
    },
    schemaFieldRows: schemaRows,
    transitionRows,
    dryRunNotes,
    evidenceRows,
  };
};

export const toLearningLocalDemoAuthSessionRepositoryContractMatrixMarkdown = (
  report: LearningLocalDemoAuthSessionRepositoryContractMatrixReport,
) => {
  const lines = [
    `# ${report.reportName}`,
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    `Endpoint: ${report.endpointPath}`,
    `JSON export: ${report.jsonExportPath}`,
    `Markdown export: ${report.markdownExportPath}`,
    `Dashboard: ${report.dashboardEvidencePath}`,
    '',
    '## Safety',
    '',
    '- Fixture-only local demo data.',
    '- production_ready=false',
    '- production_enabled=false',
    '- productionDbUsed=false',
    '- noProductionDbRead=true',
    '- providerApiUsed=false',
    '- paymentProviderUsed=false',
    '- notificationProviderUsed=false',
    '- aiProviderExecutionUsed=false',
    '- realAuthMutationUsed=false',
    '- realSessionMutationUsed=false',
    '- realRefreshTokenMutationUsed=false',
    '- realAuditMutationUsed=false',
    '- realLearningMutationUsed=false',
    '- realErpMutationUsed=false',
    '- secretsRequired=false',
    '- deployUsed=false',
    '',
    '## Totals',
    '',
    `- Schema surfaces: ${report.totals.schemaSurfaceCount}`,
    `- Schema fields: ${report.totals.schemaFieldCount}`,
    `- Session schema fields: ${report.totals.sessionSchemaFieldCount}`,
    `- Refresh-token schema fields: ${report.totals.refreshTokenSchemaFieldCount}`,
    `- Audit schema fields: ${report.totals.auditSchemaFieldCount}`,
    `- Refresh-token hash metadata fields: ${report.totals.refreshTokenHashMetadataFieldCount}`,
    `- Actor/device context fields: ${report.totals.actorDeviceContextFieldCount}`,
    `- Append-only audit context fields: ${report.totals.appendOnlyAuditContextFieldCount}`,
    `- Transition constraints: ${report.totals.transitionConstraintCount}`,
    `- Create transitions: ${report.totals.createTransitionCount}`,
    `- Rotate transitions: ${report.totals.rotateTransitionCount}`,
    `- Revoke transitions: ${report.totals.revokeTransitionCount}`,
    `- Expire transitions: ${report.totals.expireTransitionCount}`,
    `- Reuse-detection transitions: ${report.totals.reuseDetectionTransitionCount}`,
    `- Fail-closed lookup transitions: ${report.totals.failClosedLookupTransitionCount}`,
    `- Migration dry-run notes: ${report.totals.migrationDryRunNoteCount}`,
    `- Rollback notes: ${report.totals.rollbackNoteCount}`,
    `- Safety gates closed: ${report.totals.closedSafetyGateCount}/${report.totals.safetyGateCount}`,
    `- Open safety gates: ${report.totals.openSafetyGateCount}`,
    '',
    '## Schema Fields',
    '',
    '| Field | Surface | Type | Required | Indexed | Actor/device | Audit context | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.schemaFieldRows.map(
      (row) =>
        `| ${[
          row.fieldName,
          row.surface,
          row.contractType,
          String(row.required),
          String(row.indexed),
          String(row.actorOrDeviceContext),
          String(row.appendOnlyAuditContext),
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Transition Constraints',
    '',
    '| Transition | Kind | Methods | Precondition | State change | Audit | Failure mode | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.transitionRows.map(
      (row) =>
        `| ${[
          row.transitionId,
          row.transitionKind,
          row.repositoryMethods.join('<br>'),
          row.precondition,
          row.expectedStateChange,
          row.auditRequirement,
          row.failureMode,
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Migration And Rollback Notes',
    '',
    '| Note | Kind | Surface | Dry-run check | Rollback expectation | Summary |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.dryRunNotes.map(
      (row) =>
        `| ${[
          row.noteId,
          row.noteKind,
          row.contractSurface,
          row.dryRunCommandOrCheck,
          row.rollbackExpectation,
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
    '## Evidence Rows',
    '',
    '| Evidence | Count | IDs | Summary |',
    '| --- | ---: | --- | --- |',
    ...report.evidenceRows.map(
      (row) =>
        `| ${[
          row.evidenceKind,
          String(row.evidenceCount),
          row.stableFixtureIds.join('<br>'),
          row.evidenceSummary,
        ].join(' | ')} |`,
    ),
    '',
  ];

  return lines.join('\n');
};

const countBy = <TKey extends string, TItem>(
  keys: readonly TKey[],
  items: readonly TItem[],
  keyFor: (item: TItem) => TKey,
) => {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<
    TKey,
    number
  >;

  for (const item of items) {
    counts[keyFor(item)] += 1;
  }

  return counts;
};
