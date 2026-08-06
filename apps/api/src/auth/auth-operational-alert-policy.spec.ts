import {
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator';
import {
  AuthOperationalAlertPolicyService,
  defaultAuthOperationalAlertPolicies,
} from './auth-operational-alert-policy';
import { AuthOperationalAlertsController } from './auth-operational-alerts.controller';
import { FixtureBackedAuthOperationalAlertState } from './auth-operational-alert-state';
import {
  AuthOperationalControl,
  FixtureBackedAuthOperationalControl,
} from './auth-operational-control';
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

const recordThresholdEvents = async (
  control: FixtureBackedAuthOperationalControl,
  occurredAt: Date,
) => {
  await control.record({
    kind: 'LOGIN_THROTTLED',
    value: 7,
    occurredAt,
  });
  await control.record({
    kind: 'REFRESH_THROTTLED',
    value: 6,
    occurredAt,
  });
  await control.record({
    kind: 'REFRESH_REPLAY_DENIED',
    value: 2,
    occurredAt,
  });
  await control.record({
    kind: 'SESSION_REPOSITORY_ERROR',
    occurredAt,
  });
};

const buildService = (
  control: AuthOperationalControl,
  state = new FixtureBackedAuthOperationalAlertState(),
) => new AuthOperationalAlertPolicyService(control, state);

describe('AuthOperationalAlertPolicyService', () => {
  it('opens thresholded redacted alert candidates without external delivery', async () => {
    const now = new Date('2026-07-10T06:00:00.000Z');
    const control = new FixtureBackedAuthOperationalControl({
      clock: () => now,
    });
    await recordThresholdEvents(control, now);
    const service = buildService(control);

    const report = await service.inspect(adminUser, now);

    expect(report.decision).toBe('ALERT_CANDIDATES_OPEN');
    expect(report.totals).toEqual({
      evaluatedPolicyCount: defaultAuthOperationalAlertPolicies.length,
      candidateCount: 4,
      openCandidateCount: 4,
      suppressedCandidateCount: 0,
    });
    expect(report.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alertCode: 'LOGIN_THROTTLE_THRESHOLD',
          observedCount: 7,
          decision: 'OPEN',
        }),
        expect.objectContaining({
          alertCode: 'REFRESH_THROTTLE_THRESHOLD',
          observedCount: 6,
          decision: 'OPEN',
        }),
        expect.objectContaining({
          alertCode: 'REFRESH_REPLAY_DETECTED',
          severity: 'CRITICAL',
          decision: 'OPEN',
        }),
        expect.objectContaining({
          alertCode: 'SESSION_REPOSITORY_ERROR_DETECTED',
          severity: 'CRITICAL',
          decision: 'OPEN',
        }),
      ]),
    );
    expect(report.safety).toEqual(
      expect.objectContaining({
        productionReady: false,
        externalAlertProviderUsed: false,
        liveNotificationUsed: false,
        rawRateLimitKeysExposed: false,
        rawCredentialsOrTokensExposed: false,
        retainedSnapshotTotalsOnly: false,
        explicitRollingWindow: true,
        appendOnlyEvaluationAudit: true,
        redactedEvaluationAudit: true,
        deduplicationScope: 'FIXTURE_PROVIDER_INSTANCE',
      }),
    );
    expect(report.evaluationAudit).toEqual(
      expect.objectContaining({
        correlationId: expect.stringMatching(/^auth-alert-evaluation:/),
        decision: 'ALERT_CANDIDATES_OPEN',
        candidateCount: 4,
        appendOnly: true,
        redacted: true,
      }),
    );
    expect(report.inspection).toEqual({
      viewerRoles: ['ADMIN'],
      actorIdentityExposed: false,
      readOnly: true,
    });
    expect(JSON.stringify(report)).not.toContain(adminUser.email);
    expect(JSON.stringify(report)).not.toContain('synthetic-admin');
  });

  it('deduplicates repeated candidates during cooldown and reopens afterward', async () => {
    const startedAt = new Date('2026-07-10T06:00:00.000Z');
    const control = new FixtureBackedAuthOperationalControl({
      clock: () => startedAt,
    });
    await recordThresholdEvents(control, startedAt);
    const service = buildService(control);

    await service.inspect(adminUser, startedAt);
    const duringCooldown = await service.inspect(
      supportUser,
      new Date('2026-07-10T06:01:00.000Z'),
    );
    const afterCooldown = await service.inspect(
      supportUser,
      new Date('2026-07-10T07:00:00.000Z'),
    );

    expect(duringCooldown.decision).toBe('ALERT_CANDIDATES_SUPPRESSED');
    expect(duringCooldown.totals).toEqual(
      expect.objectContaining({
        openCandidateCount: 0,
        suppressedCandidateCount: 4,
      }),
    );
    expect(
      duringCooldown.candidates.every(
        (candidate) => candidate.decision === 'SUPPRESSED_COOLDOWN',
      ),
    ).toBe(true);
    expect(afterCooldown.totals.openCandidateCount).toBe(4);
    expect(afterCooldown.inspection.viewerRoles).toEqual(['SUPPORT']);
  });

  it('returns no candidates when every synthetic counter is below threshold', async () => {
    const now = new Date('2026-07-10T06:00:00.000Z');
    const control = new FixtureBackedAuthOperationalControl({
      clock: () => now,
    });
    await control.record({
      kind: 'LOGIN_THROTTLED',
      value: 4,
      occurredAt: now,
    });
    await control.record({
      kind: 'REFRESH_THROTTLED',
      value: 4,
      occurredAt: now,
    });

    const report = await buildService(control).inspect(adminUser, now);

    expect(report.decision).toBe('NO_ALERT_CANDIDATES');
    expect(report.totals.candidateCount).toBe(0);
  });

  it('denies learner inspection before reading the operational snapshot', async () => {
    const snapshot = jest.fn();
    const service = buildService({
      snapshot,
    } as unknown as AuthOperationalControl);

    await expect(
      service.inspect({ ...adminUser, roles: ['STUDENT'] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(snapshot).not.toHaveBeenCalled();
  });

  it('fails inspection closed when the shared snapshot is unavailable', async () => {
    const service = buildService({
      snapshot: jest.fn().mockRejectedValue(new Error('synthetic outage')),
    } as unknown as AuthOperationalControl);

    await expect(service.inspect(adminUser)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('fails inspection closed when shared cooldown state is unavailable', async () => {
    const now = new Date('2026-07-10T06:00:00.000Z');
    const control = new FixtureBackedAuthOperationalControl({
      clock: () => now,
    });
    await recordThresholdEvents(control, now);
    const service = buildService(
      control,
      new FixtureBackedAuthOperationalAlertState({ unavailable: true }),
    );

    await expect(service.inspect(adminUser, now)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('fails inspection closed when append-only evaluation audit persistence is unavailable', async () => {
    const now = new Date('2026-07-10T06:00:00.000Z');
    const control = new FixtureBackedAuthOperationalControl({
      clock: () => now,
    });
    await recordThresholdEvents(control, now);
    const service = buildService(
      control,
      new FixtureBackedAuthOperationalAlertState({ auditUnavailable: true }),
    );

    await expect(service.inspect(adminUser, now)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('declares ADMIN and SUPPORT route roles for defense in depth', () => {
    expect(
      Reflect.getMetadata(ROLES_KEY, AuthOperationalAlertsController),
    ).toEqual(['ADMIN', 'SUPPORT']);
  });
});
