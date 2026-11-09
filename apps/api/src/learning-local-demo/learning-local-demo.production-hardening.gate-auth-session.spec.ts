import { learningLocalDemoCoreFixture } from './learning-local-demo.fixtures';
import { LearningLocalDemoService } from './learning-local-demo.service';
import { ForbiddenException } from '@nestjs/common';
import { AuthSessionService } from '../auth/auth-session.service';
import { FixtureBackedAuthSessionStore } from '../auth/auth-session.store';
import { AuthenticatedRequest, AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  buildAuthContext,
  buildAuthSmokeService,
} from './learning-local-demo.production-hardening.spec-fixtures';

describe('LearningLocalDemoProductionHardeningGate (go-live gate and auth sessions)', () => {
  const service = new LearningLocalDemoService();

  const generatedAt = '2026-06-30T16:00:00.000Z';

  it('keeps the go-live gate fixture-only and production_ready=false', () => {
    const roleJourneys = service.buildMvpRoleJourneyEntrypointsReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );
    const readiness = service.buildMvpReadinessOverviewReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );
    const acceptance = service.buildAcceptanceTraceabilityGateReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );
    const aiBoundary = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );

    expect(roleJourneys.productionReady).toBe(false);
    expect(roleJourneys.fixtureOnly).toBe(true);
    expect(roleJourneys.totals.productionReadyClaimCount).toBe(0);
    expect(roleJourneys.totals.openSafetyGateCount).toBe(0);

    expect(readiness.productionReady).toBe(false);
    expect(readiness.totals.productionReadySliceCount).toBe(0);
    expect(readiness.totals.openSafetyGateCount).toBe(0);

    expect(acceptance.productionReady).toBe(false);
    expect(acceptance.fixtureOnly).toBe(true);
    expect(acceptance.totals.productionReadyClaimCount).toBe(0);
    expect(acceptance.totals.openSafetyGateCount).toBe(0);

    expect(aiBoundary.safety).toEqual(
      expect.objectContaining({
        fixtureOnly: true,
        productionDbUsed: false,
        noProductionDbRead: true,
        providerApiUsed: false,
        aiProviderUsed: false,
        aiProviderExecutionUsed: false,
        paymentProviderUsed: false,
        notificationProviderUsed: false,
        realAiChatMutationUsed: false,
        secretsRequired: false,
      }),
    );
  });

  it('maps current demo data coverage for role journeys and lifecycle states', () => {
    const roleJourneys = service.buildMvpRoleJourneyEntrypointsReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );
    const enrollmentFlow =
      service.buildStudentCourseEnrollmentSubscriptionFlowReport(
        learningLocalDemoCoreFixture,
        generatedAt,
      );
    const entitlement =
      service.buildSubscriptionEntitlementDailyPlanAccessReport(
        learningLocalDemoCoreFixture,
        generatedAt,
      );
    const screenTime = service.buildParentScreenTimeGrantDailyPlanGuardReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );

    expect(roleJourneys.statusCounts.role).toEqual({
      STUDENT: 1,
      PARENT: 1,
      TEACHER: 1,
      ADMIN_OPERATOR: 1,
    });
    expect(roleJourneys.totals.sameStudentCoursePathCount).toBe(4);

    expect(enrollmentFlow.totals).toEqual(
      expect.objectContaining({
        studentCount: 4,
        courseCount: 2,
        enrollmentCount: 4,
        subscriptionCount: 4,
        fixturePaymentEvidenceCount: 4,
        refundEvidenceCount: 1,
        commissionEvidenceCount: 4,
        productionReadyClaimCount: 0,
      }),
    );
    expect(entitlement.accessRows.map((row) => row.accessStatus)).toEqual(
      expect.arrayContaining([
        'UNLOCKED',
        'BLOCKED_PENDING_PAYMENT',
        'BLOCKED_REFUNDED',
      ]),
    );
    expect(entitlement.lifecycleRows.map((row) => row.lifecycleState)).toEqual(
      expect.arrayContaining(['EXPIRED', 'REVOKED']),
    );
    expect(entitlement.totals.lifecycleExpiredRowCount).toBe(1);
    expect(entitlement.totals.lifecycleRevokedRowCount).toBe(1);
    expect(entitlement.totals.blockedAccessWithReasonCount).toBe(
      entitlement.totals.blockedAccessCount,
    );

    expect(screenTime.totals.allowedSessionCount).toBeGreaterThan(0);
    expect(screenTime.totals.blockedSessionCount).toBeGreaterThan(0);
    expect(screenTime.totals.blockedCasesWithReasonAndNextActionCount).toBe(
      screenTime.totals.blockedSessionCount,
    );
  });

  it('locks current permission and AI-boundary evidence for the gate matrix', () => {
    const permissions =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        generatedAt,
      );
    const aiBoundary = service.buildAiTutorChatSafetyTeacherReviewReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );

    expect(permissions.permissionCaseRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          permissionCaseId: 'permission-case-parent-ava-own-child',
          actorRole: 'PARENT_GUARDIAN',
          reportScope: 'OWN_CHILD',
          permissionDecision: 'ALLOWED',
        }),
        expect.objectContaining({
          permissionCaseId: 'permission-case-parent-minh-non-owning-ava',
          actorRole: 'PARENT_GUARDIAN',
          reportScope: 'NON_OWNING_CHILD',
          permissionDecision: 'DENIED',
          targetChildProfileId: 'child-ava-demo',
        }),
        expect.objectContaining({
          permissionCaseId: 'permission-case-teacher-mai-assigned-a1',
          actorRole: 'TEACHER',
          reportScope: 'ASSIGNED_CLASS',
          permissionDecision: 'ALLOWED',
        }),
        expect.objectContaining({
          permissionCaseId:
            'permission-case-teacher-mai-unassigned-phonics-denied',
          actorRole: 'TEACHER',
          reportScope: 'UNASSIGNED_CLASS',
          permissionDecision: 'DENIED',
        }),
        expect.objectContaining({
          permissionCaseId: 'permission-case-admin-hoa-phonics-class',
          actorRole: 'ADMIN',
          reportScope: 'ADMIN_CLASS',
          permissionDecision: 'ALLOWED',
        }),
        expect.objectContaining({
          permissionCaseId: 'permission-case-support-ops-lan-audit-read-only',
          actorRole: 'SUPPORT_OPS',
          reportScope: 'SUPPORT_AUDIT_READ_ONLY',
          permissionDecision: 'ALLOWED',
        }),
      ]),
    );
    expect(permissions.totals.deniedReportCaseCount).toBe(2);
    expect(permissions.totals.teacherUnassignedDeniedCaseCount).toBe(1);
    expect(permissions.totals.supportOpsAuditReadOnlyCaseCount).toBe(1);
    expect(permissions.totals.redactedOrDeniedFieldWithReasonCount).toBe(
      permissions.totals.redactedFieldCount +
        permissions.totals.deniedFieldCount,
    );

    expect(aiBoundary.totals).toEqual(
      expect.objectContaining({
        chatSessionCount: 4,
        allowedMessageCount: 8,
        blockedMessageCount: 4,
        safetyFlagCount: 4,
        teacherReviewItemCount: 4,
        parentSummaryCount: 3,
      }),
    );
    expect(aiBoundary.safetyFlagRows.map((row) => row.topicCategory)).toEqual(
      expect.arrayContaining([
        'PERSONAL_DATA',
        'ACCOUNT_ACCESS',
        'ACADEMIC_INTEGRITY',
        'OFF_TOPIC_GAMING',
      ]),
    );
    expect(
      aiBoundary.safetyFlagRows.every(
        (row) => row.guardDecision === 'BLOCKED' && row.blockedTopic,
      ),
    ).toBe(true);
  });

  it('closes role permission and entitlement lifecycle gaps without claiming readiness', () => {
    const permissions =
      service.buildParentTeacherReportPermissionPrivacyRedactionReport(
        learningLocalDemoCoreFixture,
        generatedAt,
      );
    const entitlement =
      service.buildSubscriptionEntitlementDailyPlanAccessReport(
        learningLocalDemoCoreFixture,
        generatedAt,
      );
    const readiness = service.buildMvpReadinessOverviewReport(
      learningLocalDemoCoreFixture,
      generatedAt,
    );

    const hasTeacherUnassignedDeniedCase = permissions.permissionCaseRows.some(
      (row) =>
        row.actorRole === 'TEACHER' &&
        row.permissionDecision === 'DENIED' &&
        row.reportScope !== 'ASSIGNED_CLASS',
    );

    const hasSupportOpsAuditReadOnlyCase = permissions.permissionCaseRows.some(
      (row) =>
        row.actorRole === 'SUPPORT_OPS' &&
        row.reportScope === 'SUPPORT_AUDIT_READ_ONLY' &&
        row.permissionDecision === 'ALLOWED' &&
        row.deniedFieldCount > 0,
    );
    const lifecycleStates = entitlement.lifecycleRows.map(
      (row) => row.lifecycleState,
    );

    expect(hasTeacherUnassignedDeniedCase).toBe(true);
    expect(hasSupportOpsAuditReadOnlyCase).toBe(true);
    expect(lifecycleStates).toEqual(expect.arrayContaining(['EXPIRED']));
    expect(lifecycleStates).toEqual(expect.arrayContaining(['REVOKED']));
    expect(entitlement.totals.blockedExpiredCount).toBe(1);
    expect(entitlement.totals.blockedRevokedCount).toBe(1);
    expect(readiness.productionReady).toBe(false);
    expect(readiness.totals.productionReadySliceCount).toBe(0);
  });

  it('covers auth session smoke matrix for login, logout, expiry, revocation, wrong-role, and role coverage', async () => {
    const { auth, authSessions, jwt } = buildAuthSmokeService();
    const guard = new JwtAuthGuard(jwt, authSessions);
    const loginCases = [
      ['student@demo.local', 'STUDENT'],
      ['parent@demo.local', 'PARENT'],
      ['teacher@demo.local', 'TEACHER'],
      ['admin@demo.local', 'ADMIN'],
      ['support@demo.local', 'SUPPORT'],
    ] as const;

    for (const [email, role] of loginCases) {
      const login = await auth.login({ email, password: 'Demo@12345' });

      expect(login.user.roles).toContain(role);
      expect(login.accessToken).toEqual(expect.any(String));
      expect(login.session.id).toEqual(expect.any(String));
    }

    const teacherLogin = await auth.login({
      email: 'teacher@demo.local',
      password: 'Demo@12345',
    });
    const logoutRequest = {
      headers: { authorization: `Bearer ${teacherLogin.accessToken}` },
    } as AuthenticatedRequest & { headers: object };

    await expect(
      guard.canActivate(buildAuthContext(logoutRequest)),
    ).resolves.toBe(true);
    await expect(
      auth.logout(logoutRequest.user as AuthenticatedUser),
    ).resolves.toEqual({
      success: true,
      sessionEnded: true,
    });
    await expect(
      guard.canActivate(buildAuthContext(logoutRequest)),
    ).rejects.toThrow('Session has ended');

    const expiredSession = await authSessions.createSession({
      userId: 'demo-student',
      email: 'student@demo.local',
      roles: ['STUDENT'],
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const expiredToken = jwt.sign(
      {
        sub: 'demo-student',
        email: 'student@demo.local',
        roles: ['STUDENT'],
        sid: expiredSession.id,
      },
      { expiresIn: -1 },
    );
    const expiredRequest = {
      headers: { authorization: `Bearer ${expiredToken}` },
    } as AuthenticatedRequest & { headers: object };

    await expect(
      guard.canActivate(buildAuthContext(expiredRequest)),
    ).rejects.toThrow('Invalid or expired token');

    const parentLogin = await auth.login({
      email: 'parent@demo.local',
      password: 'Demo@12345',
    });
    await expect(
      authSessions.revokeSession(parentLogin.session.id, 'DEVICE_REVOKED'),
    ).resolves.toBe(true);
    const revokedRequest = {
      headers: { authorization: `Bearer ${parentLogin.accessToken}` },
    } as AuthenticatedRequest & { headers: object };

    await expect(
      guard.canActivate(buildAuthContext(revokedRequest)),
    ).rejects.toThrow('Session has been revoked');

    const rolesGuard = new RolesGuard({
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as never);
    const wrongRoleRequest = {
      headers: {},
      user: {
        sub: 'demo-support',
        email: 'support@demo.local',
        roles: ['SUPPORT'],
      },
    } as AuthenticatedRequest & { headers: object };

    expect(() =>
      rolesGuard.canActivate(buildAuthContext(wrongRoleRequest)),
    ).toThrow(ForbiddenException);
  });

  it('builds fixture-only auth session smoke matrix report evidence', () => {
    const report = service.buildAuthSessionSmokeMatrixReport(
      '2026-07-01T01:30:00.000Z',
    );
    const markdown = service.toAuthSessionSmokeMatrixMarkdown(report);

    expect(report.productionReady).toBe(false);
    expect(report.fixtureOnly).toBe(true);
    expect(report.totals).toEqual(
      expect.objectContaining({
        smokeCaseCount: 9,
        roleCoverageCount: 5,
        requiredRoleCoverageCount: 5,
        scenarioCoverageCount: 5,
        requiredScenarioCoverageCount: 5,
        loginSuccessCount: 5,
        logoutSessionEndCount: 1,
        expiredTokenDeniedCount: 1,
        revokedSessionDeviceDeniedCount: 1,
        wrongRoleAccessDeniedCount: 1,
        deniedCaseCount: 4,
        negativePermissionCaseCount: 1,
        productionReadyClaimCount: 0,
        openSafetyGateCount: 0,
      }),
    );
    expect(report.statusCounts.role).toEqual({
      STUDENT: 2,
      PARENT: 2,
      TEACHER: 2,
      ADMIN: 1,
      SUPPORT: 2,
    });
    expect(report.smokeCaseRows.map((row) => row.scenario)).toEqual(
      expect.arrayContaining([
        'LOGIN_SUCCESS',
        'LOGOUT_SESSION_END',
        'EXPIRED_TOKEN_DENIAL',
        'REVOKED_SESSION_DEVICE_DENIAL',
        'WRONG_ROLE_ACCESS_DENIAL',
      ]),
    );
    expect(markdown).toContain('production_ready=false');
    expect(markdown).toContain('Revoked session/device denied: 1');
    expect(markdown).toContain(
      'auth-smoke-support-wrong-role-admin-surface-denied',
    );
  });

  it('covers persistent auth refresh lifecycle behavior without production stores', async () => {
    const sharedStore = new FixtureBackedAuthSessionStore();
    const writer = new AuthSessionService(sharedStore);
    const reader = new AuthSessionService(sharedStore);
    const persisted = await writer.createSession({
      userId: 'demo-student',
      email: 'student@demo.local',
      roles: ['STUDENT'],
      deviceId: 'local-demo-web-student',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await expect(reader.getSession(persisted.id)).resolves.toEqual(
      expect.objectContaining({
        id: persisted.id,
        state: 'ACTIVE',
      }),
    );

    const { auth, authSessions } = buildAuthSmokeService();
    const login = await auth.login({
      email: 'parent@demo.local',
      password: 'Demo@12345',
    });
    const rotated = await auth.refresh(login.refreshToken);

    expect(rotated.refreshToken).not.toBe(login.refreshToken);
    await expect(auth.refresh(login.refreshToken)).rejects.toThrow(
      'Refresh token reuse denied',
    );
    await expect(authSessions.getSession(login.session.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'REFRESH_TOKEN_REUSED',
      }),
    );

    const current = await authSessions.createSession({
      userId: 'demo-teacher',
      email: 'teacher@demo.local',
      roles: ['TEACHER'],
      deviceId: 'local-demo-web-teacher',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const other = await authSessions.createSession({
      userId: 'demo-teacher',
      email: 'teacher@demo.local',
      roles: ['TEACHER'],
      deviceId: 'local-demo-tablet-teacher',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await expect(
      authSessions.revokeOtherSessions('demo-teacher', current.id),
    ).resolves.toEqual([other.id]);
    await expect(authSessions.getSession(other.id)).resolves.toEqual(
      expect.objectContaining({ state: 'REVOKED' }),
    );
    const adminEvents = await authSessions.listAuditEventsForRoles(['ADMIN']);
    const supportEvents = await authSessions.listAuditEventsForRoles([
      'SUPPORT',
    ]);
    expect(adminEvents.length).toBeGreaterThan(0);
    expect(supportEvents.length).toBeGreaterThan(0);
    await expect(
      authSessions.listAuditEventsForRoles(['STUDENT']),
    ).resolves.toEqual([]);
  });
});
