import { LearningLocalDemoService } from './learning-local-demo.service';
import { AuthSessionService } from '../auth/auth-session.service';
import {
  FixtureBackedAuthSessionStore,
  hashAuthRefreshToken,
} from '../auth/auth-session.store';

describe('LearningLocalDemoProductionHardeningGate (auth store and control evidence)', () => {
  const service = new LearningLocalDemoService();

  it('proves AuthSessionStore repository contract transitions against fixture state only', async () => {
    const sharedStore = new FixtureBackedAuthSessionStore();
    const sessionRepository = new AuthSessionService(sharedStore);
    const reader = new AuthSessionService(sharedStore);
    const now = new Date();
    const activeSession = await sessionRepository.createSession({
      userId: 'demo-student-contract',
      email: 'student.contract@demo.local',
      roles: ['STUDENT'],
      deviceId: 'local-demo-web-contract',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    });
    const createdRefresh = await sessionRepository.issueRefreshToken({
      sessionId: activeSession.id,
      userId: activeSession.userId,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    });
    const storedRefresh = await reader.getRefreshToken(createdRefresh.id);

    await expect(reader.getSession(activeSession.id)).resolves.toEqual(
      expect.objectContaining({
        id: activeSession.id,
        userId: 'demo-student-contract',
        deviceId: 'local-demo-web-contract',
        state: 'ACTIVE',
      }),
    );
    expect(storedRefresh).toEqual(
      expect.objectContaining({
        id: createdRefresh.id,
        sessionId: activeSession.id,
        userId: activeSession.userId,
        deviceId: activeSession.deviceId,
        state: 'ACTIVE',
        tokenHash: hashAuthRefreshToken(createdRefresh.token),
      }),
    );
    expect(storedRefresh?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(storedRefresh?.tokenHash).not.toContain(createdRefresh.token);

    const rotated = await sessionRepository.rotateRefreshToken(
      createdRefresh.token,
      now,
    );

    await expect(reader.getRefreshToken(createdRefresh.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'ROTATED',
        replacedByTokenId: rotated.refreshTokenId,
        reason: 'REFRESH_TOKEN_ROTATED',
      }),
    );
    await expect(
      reader.getRefreshToken(rotated.refreshTokenId),
    ).resolves.toEqual(
      expect.objectContaining({
        state: 'ACTIVE',
        sessionId: activeSession.id,
        tokenHash: hashAuthRefreshToken(rotated.refreshToken),
      }),
    );

    await expect(
      sessionRepository.rotateRefreshToken(
        createdRefresh.token,
        new Date(now.getTime() + 1000),
      ),
    ).rejects.toThrow('Refresh token reuse denied');
    await expect(reader.getRefreshToken(createdRefresh.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REUSED',
        reason: 'REFRESH_TOKEN_REUSED',
      }),
    );
    await expect(reader.getSession(activeSession.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'REFRESH_TOKEN_REUSED',
      }),
    );

    const revocableSession = await sessionRepository.createSession({
      userId: 'demo-teacher-contract',
      email: 'teacher.contract@demo.local',
      roles: ['TEACHER'],
      deviceId: 'local-demo-tablet-contract',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    });
    const revocableRefresh = await sessionRepository.issueRefreshToken({
      sessionId: revocableSession.id,
      userId: revocableSession.userId,
    });

    await expect(
      sessionRepository.revokeSession(
        revocableSession.id,
        'CONTRACT_DEVICE_REVOKED',
      ),
    ).resolves.toBe(true);
    await expect(reader.getSession(revocableSession.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'CONTRACT_DEVICE_REVOKED',
      }),
    );
    await expect(reader.getRefreshToken(revocableRefresh.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'CONTRACT_DEVICE_REVOKED',
      }),
    );

    await sharedStore.createSession({
      id: 'contract-expired-session',
      userId: 'demo-support-contract',
      email: 'support.contract@demo.local',
      roles: ['SUPPORT'],
      deviceId: 'local-demo-support-expired',
      state: 'ACTIVE',
      issuedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() - 60 * 1000).toISOString(),
    });
    await sharedStore.createRefreshToken({
      id: 'contract-expired-refresh',
      sessionId: 'contract-expired-session',
      userId: 'demo-support-contract',
      deviceId: 'local-demo-support-expired',
      tokenHash: hashAuthRefreshToken('contract-expired-refresh.raw'),
      state: 'ACTIVE',
      issuedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 60 * 1000).toISOString(),
    });

    await expect(
      sessionRepository.cleanupExpiredSessions(now),
    ).resolves.toEqual({
      expiredSessionIds: ['contract-expired-session'],
      expiredRefreshTokenIds: ['contract-expired-refresh'],
    });
    await expect(
      reader.getSession('contract-expired-session'),
    ).resolves.toEqual(
      expect.objectContaining({
        state: 'EXPIRED',
        reason: 'SESSION_EXPIRED',
      }),
    );
    await expect(
      reader.getRefreshToken('contract-expired-refresh'),
    ).resolves.toEqual(
      expect.objectContaining({
        state: 'EXPIRED',
        reason: 'SESSION_EXPIRED',
      }),
    );

    await expect(
      sessionRepository.assertTokenSessionActive({
        sub: 'missing-user',
        email: 'missing@demo.local',
        roles: ['STUDENT'],
        sid: 'missing-session',
      }),
    ).rejects.toThrow('Invalid session');
    await expect(
      sessionRepository.rotateRefreshToken('missing-token.invalid-secret'),
    ).rejects.toThrow('Invalid refresh token');

    const adminEvents = await sessionRepository.listAuditEventsForRoles([
      'ADMIN',
    ]);
    const eventIds = new Set(adminEvents.map((event) => event.id));

    expect(eventIds.size).toBe(adminEvents.length);
    expect(adminEvents.map((event) => event.action)).toEqual(
      expect.arrayContaining([
        'SESSION_CREATED',
        'REFRESH_TOKEN_ISSUED',
        'REFRESH_TOKEN_ROTATED',
        'REFRESH_TOKEN_REUSE_DENIED',
        'SESSION_REVOKED',
        'SESSION_CLEANUP_EXPIRED',
        'REFRESH_TOKEN_DENIED',
      ]),
    );
    await expect(
      sessionRepository.listAuditEventsForRoles(['SUPPORT']),
    ).resolves.toHaveLength(adminEvents.length);
    await expect(
      sessionRepository.listAuditEventsForRoles(['STUDENT']),
    ).resolves.toEqual([]);
  });

  it('builds fixture-only auth refresh lifecycle matrix report evidence', () => {
    const report = service.buildAuthRefreshLifecycleMatrixReport(
      '2026-07-01T02:15:00.000Z',
    );
    const markdown = service.toAuthRefreshLifecycleMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.totals).toEqual(
      expect.objectContaining({
        lifecycleCaseCount: 6,
        persistentSessionLookupCount: 1,
        refreshTokenRotationDeniedCount: 1,
        reusedRefreshTokenDeniedCount: 1,
        crossDeviceRevocationCount: 1,
        sessionCleanupExpiryCount: 1,
        adminSupportAuditVisibilityCount: 1,
        adminSupportAuditRoleCount: 2,
        deniedCaseCount: 3,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.statusCounts.scenario).toEqual({
      PERSISTENT_SESSION_LOOKUP: 1,
      REFRESH_TOKEN_ROTATION_DENIAL: 1,
      REUSED_REFRESH_TOKEN_DENIAL: 1,
      CROSS_DEVICE_REVOCATION: 1,
      SESSION_CLEANUP_EXPIRY: 1,
      ADMIN_SUPPORT_AUDIT_READ_ONLY: 1,
    });
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Persistent session lookup: 1');
    expect(markdown).toContain('Refresh-token rotation denied: 1');
    expect(markdown).toContain('Reused refresh-token denied: 1');
    expect(markdown).toContain(
      'auth-refresh-admin-support-read-only-audit-visible',
    );
  });

  it('builds fixture-only auth persistence security gate evidence without production access', () => {
    const report = service.buildAuthPersistenceSecurityGateMatrixReport(
      '2026-07-01T03:00:00.000Z',
    );
    const markdown =
      service.toAuthPersistenceSecurityGateMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.safety.productionDbUsed).toBe(false);
    expect(report.safety.noProductionDbRead).toBe(true);
    expect(report.totals).toEqual(
      expect.objectContaining({
        securityDesignGateCount: 6,
        schemaRepositoryContractCount: 1,
        distributedRevocationContractCount: 1,
        refreshRetentionReusePolicyCount: 1,
        auditRetentionExportPolicyCount: 1,
        rateLimitMonitoringHookCount: 1,
        rollbackMigrationNoteCount: 1,
        productionBlockerCount: 6,
        manualApprovalRequiredCount: 6,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.statusCounts.gateKind).toEqual({
      SCHEMA_REPOSITORY_CONTRACT: 1,
      DISTRIBUTED_REVOCATION_CONTRACT: 1,
      REFRESH_RETENTION_REUSE_POLICY: 1,
      AUDIT_RETENTION_EXPORT_POLICY: 1,
      RATE_LIMIT_MONITORING_HOOKS: 1,
      ROLLBACK_MIGRATION_NOTES: 1,
    });
    expect(report.securityGateRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          gateRowId: 'auth-persistence-schema-repository-contract-design',
          productionDbUsed: false,
          noProductionDbRead: true,
          productionBlocker: true,
        }),
        expect.objectContaining({
          gateRowId: 'auth-persistence-distributed-revocation-contract',
          productionBlocker: true,
        }),
        expect.objectContaining({
          gateRowId: 'auth-persistence-rate-limit-monitoring-hooks',
          providerUsed: false,
          mutationUsed: false,
        }),
      ]),
    );
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Security design gates: 6');
    expect(markdown).toContain('Production blockers: 6');
    expect(markdown).toContain(
      'auth-persistence-audit-retention-read-only-export-policy',
    );
  });

  it('builds fixture-only AuthSessionStore repository contract evidence without production access', () => {
    const report = service.buildAuthSessionRepositoryContractMatrixReport(
      '2026-07-01T03:30:00.000Z',
    );
    const markdown =
      service.toAuthSessionRepositoryContractMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.safety).toEqual(
      expect.objectContaining({
        fixtureOnly: true,
        productionEnabled: false,
        productionDbUsed: false,
        noProductionDbRead: true,
        providerApiUsed: false,
        realAuthMutationUsed: false,
        realSessionMutationUsed: false,
        realRefreshTokenMutationUsed: false,
        realAuditMutationUsed: false,
        deployUsed: false,
      }),
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        schemaSurfaceCount: 3,
        schemaFieldCount: 34,
        sessionSchemaFieldCount: 11,
        refreshTokenSchemaFieldCount: 13,
        auditSchemaFieldCount: 10,
        refreshTokenHashMetadataFieldCount: 5,
        transitionConstraintCount: 6,
        createTransitionCount: 1,
        rotateTransitionCount: 1,
        revokeTransitionCount: 1,
        expireTransitionCount: 1,
        reuseDetectionTransitionCount: 1,
        failClosedLookupTransitionCount: 1,
        migrationDryRunNoteCount: 2,
        rollbackNoteCount: 2,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.statusCounts.transitionKind).toEqual({
      CREATE_SESSION: 1,
      ROTATE_REFRESH_TOKEN: 1,
      REVOKE_SESSION: 1,
      EXPIRE_SESSION: 1,
      REUSE_DETECTION: 1,
      FAIL_CLOSED_LOOKUP: 1,
    });
    expect(report.schemaFieldRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          surface: 'auth_sessions',
          fieldName: 'deviceId',
          actorOrDeviceContext: true,
          productionDbUsed: false,
        }),
        expect.objectContaining({
          surface: 'auth_refresh_tokens',
          fieldName: 'tokenHash',
          storesRawRefreshToken: false,
          indexed: true,
        }),
        expect.objectContaining({
          surface: 'auth_session_audit_events',
          fieldName: 'visibleToRoles',
          appendOnlyAuditContext: true,
        }),
      ]),
    );
    expect(report.transitionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          transitionId: 'auth-session-contract-refresh-reuse-detection',
          transitionKind: 'REUSE_DETECTION',
          requiresAtomicWrite: true,
        }),
        expect.objectContaining({
          transitionId: 'auth-session-contract-fail-closed-lookup',
          transitionKind: 'FAIL_CLOSED_LOOKUP',
          requiresAtomicWrite: false,
        }),
      ]),
    );
    expect(report.dryRunNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          noteKind: 'MIGRATION_DRY_RUN',
          productionDbUsed: false,
          noProductionDbRead: true,
          destructiveActionUsed: false,
        }),
        expect.objectContaining({
          noteKind: 'ROLLBACK_NOTE',
          manualApprovalRequired: true,
        }),
      ]),
    );
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('production_enabled=false');
    expect(markdown).toContain('auth-session-contract-fail-closed-lookup');
    expect(markdown).toContain(
      'auth-session-repository-migration-dry-run-schema',
    );
  });

  it('builds Prisma AuthSessionStore local implementation evidence while keeping go-live blocked', () => {
    const report = service.buildPrismaAuthSessionStoreMatrixReport(
      '2026-07-10T04:00:00.000Z',
    );
    const markdown = service.toPrismaAuthSessionStoreMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
    expect(report.decision).toBe(
      'LOCAL_IMPLEMENTATION_VERIFIED_GO_LIVE_BLOCKED',
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        evidenceCount: 8,
        implementedCount: 3,
        disposableLocalVerifiedCount: 4,
        stagingBlockerCount: 1,
        productionBlockerCount: 1,
        productionReadyClaimCount: 0,
        openLocalSafetyGateCount: 0,
      }),
    );
    expect(report.evidenceRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evidenceId: 'prisma-auth-refresh-hash-integrity',
          status: 'VERIFIED_DISPOSABLE_LOCAL',
        }),
        expect.objectContaining({
          evidenceId: 'prisma-auth-fail-closed',
          status: 'IMPLEMENTED',
        }),
        expect.objectContaining({
          evidenceId: 'prisma-auth-two-instance-revocation',
          status: 'VERIFIED_DISPOSABLE_LOCAL',
        }),
        expect.objectContaining({
          evidenceId: 'prisma-auth-staging-operations',
          productionBlocker: true,
        }),
      ]),
    );
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Disposable-local verified: 4');
  });

  it('builds shared disposable auth-control evidence while keeping production observability approval blocked', () => {
    const report = service.buildAuthOperationalControlMatrixReport(
      '2026-07-10T05:00:00.000Z',
    );
    const markdown = service.toAuthOperationalControlMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
    expect(report.decision).toBe(
      'LOCAL_AUTH_CONTROLS_VERIFIED_GO_LIVE_BLOCKED',
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        evidenceCount: 9,
        verifiedLocalCount: 7,
        disposableLocalVerifiedCount: 1,
        sharedControlBlockerCount: 1,
        productionBlockerCount: 1,
        productionReadyClaimCount: 0,
        openLocalSafetyGateCount: 0,
      }),
    );
    expect(report.evidenceRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evidenceId: 'auth-ops-login-throttle',
          status: 'VERIFIED_LOCAL',
        }),
        expect.objectContaining({
          evidenceId: 'auth-ops-refresh-replay-counter',
          status: 'VERIFIED_LOCAL',
        }),
        expect.objectContaining({
          evidenceId: 'auth-ops-shared-prisma-control',
          status: 'VERIFIED_DISPOSABLE_LOCAL',
          productionBlocker: false,
        }),
        expect.objectContaining({
          evidenceId: 'auth-ops-production-observability-approval',
          productionBlocker: true,
        }),
      ]),
    );
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Local verified: 7');
    expect(markdown).toContain('Disposable-local shared control verified: 1');
    expect(markdown).toContain('Production-approval blockers: 1');
  });

  it('builds local auth alert-policy evidence while keeping external delivery blocked', () => {
    const report = service.buildAuthOperationalAlertPolicyMatrixReport(
      '2026-07-10T06:00:00.000Z',
    );
    const markdown = service.toAuthOperationalAlertPolicyMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.productionEnabled).toBe(false);
    expect(report.decision).toBe(
      'AUTH_ALERT_AUDIT_READ_MODEL_DISPOSABLE_LOCAL_VERIFIED',
    );
    expect(report.totals).toEqual(
      expect.objectContaining({
        policyCount: 4,
        initialOpenCandidateCount: 4,
        cooldownSuppressedCandidateCount: 4,
        rolePermissionCaseCount: 4,
        allowedReadOnlyRoleCount: 2,
        deniedBeforeSnapshotRoleCount: 2,
        snapshotOutageDeniedCount: 1,
        stateOutageDeniedCount: 1,
        auditOutageDeniedCount: 1,
        sharedStateDisposableSmokeCount: 1,
        appendOnlyAuditDisposableSmokeCount: 1,
        contentionCapacityDisposableSmokeCount: 1,
        auditCorrelationLookupFixtureCount: 1,
        auditIncidentExportFixtureRowCount: 3,
        auditIncidentExportFixturePageCount: 2,
        auditReadModelDeniedRoleCount: 2,
        auditReadModelOutageDeniedCount: 2,
        productionReadyClaimCount: 0,
        openLocalSafetyGateCount: 0,
      }),
    );
    expect(report.rolePermissionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'ADMIN',
          decision: 'ALLOWED_READ_ONLY',
        }),
        expect.objectContaining({
          role: 'SUPPORT',
          decision: 'ALLOWED_READ_ONLY',
        }),
        expect.objectContaining({
          role: 'STUDENT',
          decision: 'DENIED_BEFORE_SNAPSHOT',
          snapshotReadAttempted: false,
        }),
        expect.objectContaining({
          role: 'PARENT',
          decision: 'DENIED_BEFORE_SNAPSHOT',
          snapshotReadAttempted: false,
        }),
      ]),
    );
    expect(report.safety).toEqual(
      expect.objectContaining({
        fixtureOnly: false,
        disposableLocalOnly: true,
        externalAlertProviderUsed: false,
        liveNotificationUsed: false,
        rawRateLimitKeysExposed: false,
        rawCredentialsOrTokensExposed: false,
        auditReadModelRedacted: true,
        auditReadModelExternalDeliveryUsed: false,
        productionReady: false,
      }),
    );
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Random localhost PostgreSQL databases: 1');
    expect(markdown).toContain('Concurrent evaluations: 8');
    expect(markdown).toContain('Idempotent redacted correlation: true');
    expect(markdown).toContain('SUPPRESSED_COOLDOWN');
    expect(markdown).toContain('DENIED_BEFORE_SNAPSHOT');
    expect(markdown).toContain(
      'Deterministic order: evaluatedAt_DESC_correlationId_DESC',
    );
    expect(markdown).toContain('Expected page sizes: 2, 1');
    expect(markdown).toContain('Maximum window days: 7');
    expect(markdown).toContain('Repository outage HTTP status: 503');
  });
});
