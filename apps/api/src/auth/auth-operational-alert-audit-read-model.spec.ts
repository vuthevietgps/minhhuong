import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator';
import {
  AuthOperationalAlertAuditReadService,
  maximumAuthOperationalAlertIncidentWindowMs,
} from './auth-operational-alert-audit-read-model';
import { AuthOperationalAlertAuditsController } from './auth-operational-alert-audits.controller';
import {
  AuthOperationalAlertState,
  FixtureBackedAuthOperationalAlertState,
} from './auth-operational-alert-state';
import type { AuthenticatedUser } from './auth.types';

const adminUser: AuthenticatedUser = {
  sub: 'synthetic-admin',
  email: 'admin@example.test',
  roles: ['ADMIN'],
};
const supportUser: AuthenticatedUser = {
  sub: 'synthetic-support',
  email: 'support@example.test',
  roles: ['SUPPORT'],
};
const correlationId = (suffix: string) =>
  `auth-alert-evaluation:00000000-0000-4000-8000-${suffix.padStart(12, '0')}`;
const evaluatedAt = new Date('2026-07-10T06:00:00.000Z');
const queryWindow = {
  windowStartedAt: '2026-07-10T05:00:00.000Z',
  windowEndedAt: '2026-07-10T07:00:00.000Z',
};

const seedFixtureAudits = async () => {
  const state = new FixtureBackedAuthOperationalAlertState();
  await state.evaluate({
    correlationId: correlationId('1'),
    evaluatedAt,
    candidates: [
      {
        alertCode: 'LOGIN_THROTTLE_THRESHOLD',
        fingerprint: 'auth-operational-alert:LOGIN_THROTTLE_THRESHOLD',
        cooldownMs: 15 * 60 * 1000,
      },
    ],
  });
  for (const suffix of ['3', '2']) {
    await state.evaluate({
      correlationId: correlationId(suffix),
      evaluatedAt,
      candidates: [],
    });
  }
  return state;
};

describe('AuthOperationalAlertAuditReadService', () => {
  it('returns an exact ADMIN/SUPPORT correlation lookup with only redacted fields', async () => {
    const service = new AuthOperationalAlertAuditReadService(
      await seedFixtureAudits(),
    );

    const result = await service.findByCorrelation(
      supportUser,
      correlationId('1'),
      new Date('2026-07-10T06:05:00.000Z'),
    );

    expect(result).toEqual(
      expect.objectContaining({
        schemaVersion: 'auth_operational_alert_audit_lookup.v1',
        audit: expect.objectContaining({
          correlationId: correlationId('1'),
          decision: 'ALERT_CANDIDATES_OPEN',
          appendOnly: true,
          redacted: true,
          decisions: [
            {
              alertCode: 'LOGIN_THROTTLE_THRESHOLD',
              decision: 'OPEN',
              cooldownUntil: '2026-07-10T06:15:00.000Z',
            },
          ],
        }),
        inspection: { viewerRoles: ['SUPPORT'], readOnly: true },
      }),
    );
    const serialized = JSON.stringify(result);
    for (const forbidden of [
      adminUser.email,
      adminUser.sub,
      supportUser.email,
      supportUser.sub,
      'inputDigest',
      'fingerprint',
      'rateKey',
      'accessToken',
      'refreshToken',
      'credential',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('paginates a bounded incident export deterministically across timestamp ties', async () => {
    const service = new AuthOperationalAlertAuditReadService(
      await seedFixtureAudits(),
    );
    const now = new Date('2026-07-10T06:05:00.000Z');

    const firstPage = await service.exportIncident(
      adminUser,
      { ...queryWindow, limit: 2 },
      now,
    );
    const secondPage = await service.exportIncident(
      adminUser,
      {
        ...queryWindow,
        limit: 2,
        cursor: firstPage.pagination.nextCursor ?? undefined,
      },
      now,
    );

    expect(firstPage.items.map((row) => row.correlationId)).toEqual([
      correlationId('3'),
      correlationId('2'),
    ]);
    expect(firstPage.pagination).toEqual(
      expect.objectContaining({
        limit: 2,
        order: 'evaluatedAt_DESC_correlationId_DESC',
        hasMore: true,
        nextCursor: expect.any(String),
      }),
    );
    expect(secondPage.items.map((row) => row.correlationId)).toEqual([
      correlationId('1'),
    ]);
    expect(secondPage.pagination.hasMore).toBe(false);
    expect(secondPage.pagination.nextCursor).toBeNull();
    expect(firstPage.window.maximumWindowMs).toBe(
      maximumAuthOperationalAlertIncidentWindowMs,
    );
  });

  it('denies learner roles before any repository read', async () => {
    const state = {
      findEvaluationAudit: jest.fn(),
      listEvaluationAudits: jest.fn(),
    } as unknown as AuthOperationalAlertState;
    const service = new AuthOperationalAlertAuditReadService(state);

    for (const roles of [['STUDENT'], ['PARENT']] as const) {
      await expect(
        service.findByCorrelation(
          { ...adminUser, roles: [...roles] },
          correlationId('1'),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.exportIncident(
          { ...adminUser, roles: [...roles] },
          queryWindow,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    }
    expect(state.findEvaluationAudit).not.toHaveBeenCalled();
    expect(state.listEvaluationAudits).not.toHaveBeenCalled();
  });

  it('rejects invalid correlations, windows, cursors, and missing retained rows', async () => {
    const service = new AuthOperationalAlertAuditReadService(
      new FixtureBackedAuthOperationalAlertState(),
    );
    await expect(
      service.findByCorrelation(adminUser, 'not-a-correlation'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.findByCorrelation(adminUser, correlationId('9')),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.exportIncident(adminUser, {
        windowStartedAt: '2026-07-01T00:00:00.000Z',
        windowEndedAt: new Date(
          new Date('2026-07-01T00:00:00.000Z').getTime() +
            maximumAuthOperationalAlertIncidentWindowMs +
            1,
        ).toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.exportIncident(adminUser, {
        ...queryWindow,
        cursor: 'not-an-opaque-cursor',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails correlation lookup and incident export closed on audit repository outage', async () => {
    const service = new AuthOperationalAlertAuditReadService(
      new FixtureBackedAuthOperationalAlertState({ auditUnavailable: true }),
    );
    await expect(
      service.findByCorrelation(adminUser, correlationId('1')),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(
      service.exportIncident(adminUser, queryWindow),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('declares ADMIN and SUPPORT route roles for defense in depth', () => {
    expect(
      Reflect.getMetadata(ROLES_KEY, AuthOperationalAlertAuditsController),
    ).toEqual(['ADMIN', 'SUPPORT']);
  });
});
