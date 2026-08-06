import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AUTH_OPERATIONAL_ALERT_STATE,
  assertAuthOperationalAlertEvaluationCorrelationId,
} from './auth-operational-alert-state';
import type {
  AuthOperationalAlertEvaluationAuditCursor,
  AuthOperationalAlertEvaluationAuditReadRecord,
  AuthOperationalAlertState,
} from './auth-operational-alert-state';
import { authOperationalAlertInspectionRoles } from './auth-operational-alert-policy';
import type { AccountRole, AuthenticatedUser } from './auth.types';

export const maximumAuthOperationalAlertIncidentWindowMs =
  7 * 24 * 60 * 60 * 1000;
export const defaultAuthOperationalAlertIncidentPageSize = 50;
export const maximumAuthOperationalAlertIncidentPageSize = 100;

type AuthOperationalAlertIncidentExportQuery = {
  windowStartedAt: string;
  windowEndedAt: string;
  cursor?: string;
  limit?: number;
};

const encodeAuditCursor = (
  record: AuthOperationalAlertEvaluationAuditReadRecord,
) =>
  Buffer.from(
    JSON.stringify({
      version: 1,
      evaluatedAt: record.evaluatedAt,
      correlationId: record.correlationId,
    }),
    'utf8',
  ).toString('base64url');

const decodeAuditCursor = (
  value: string,
): AuthOperationalAlertEvaluationAuditCursor => {
  try {
    const decoded = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    if (
      decoded.version !== 1 ||
      typeof decoded.evaluatedAt !== 'string' ||
      typeof decoded.correlationId !== 'string'
    ) {
      throw new Error('shape');
    }
    const evaluatedAt = new Date(decoded.evaluatedAt);
    if (
      Number.isNaN(evaluatedAt.getTime()) ||
      evaluatedAt.toISOString() !== decoded.evaluatedAt
    ) {
      throw new Error('timestamp');
    }
    assertAuthOperationalAlertEvaluationCorrelationId(decoded.correlationId);
    return { evaluatedAt, correlationId: decoded.correlationId };
  } catch {
    throw new BadRequestException(
      'Auth operational alert incident cursor is invalid',
    );
  }
};

const readModelSafety = {
  productionReady: false as const,
  readOnly: true as const,
  externalDeliveryUsed: false as const,
  redacted: true as const,
};

@Injectable()
export class AuthOperationalAlertAuditReadService {
  constructor(
    @Inject(AUTH_OPERATIONAL_ALERT_STATE)
    private readonly alertState: AuthOperationalAlertState,
  ) {}

  async findByCorrelation(
    user: AuthenticatedUser,
    correlationId: string,
    now = new Date(),
  ) {
    const viewerRoles = this.assertViewerRole(user.roles);
    try {
      assertAuthOperationalAlertEvaluationCorrelationId(correlationId);
    } catch {
      throw new BadRequestException(
        'Auth operational alert evaluation correlation is invalid',
      );
    }

    let audit: AuthOperationalAlertEvaluationAuditReadRecord | null;
    try {
      audit = await this.alertState.findEvaluationAudit({ correlationId, now });
    } catch {
      throw new ServiceUnavailableException(
        'Auth operational alert evaluation audit repository unavailable',
      );
    }
    if (!audit) {
      throw new NotFoundException(
        'Auth operational alert evaluation audit was not found',
      );
    }
    return {
      schemaVersion: 'auth_operational_alert_audit_lookup.v1' as const,
      audit,
      inspection: {
        viewerRoles,
        readOnly: true as const,
      },
      safety: readModelSafety,
    };
  }

  async exportIncident(
    user: AuthenticatedUser,
    query: AuthOperationalAlertIncidentExportQuery,
    now = new Date(),
  ) {
    const viewerRoles = this.assertViewerRole(user.roles);
    const windowStartedAt = this.parseWindowTimestamp(
      query.windowStartedAt,
      'windowStartedAt',
    );
    const windowEndedAt = this.parseWindowTimestamp(
      query.windowEndedAt,
      'windowEndedAt',
    );
    const windowMs = windowEndedAt.getTime() - windowStartedAt.getTime();
    if (
      windowMs <= 0 ||
      windowMs > maximumAuthOperationalAlertIncidentWindowMs
    ) {
      throw new BadRequestException(
        'Auth operational alert incident window must be greater than zero and no longer than 7 days',
      );
    }

    const limit = query.limit ?? defaultAuthOperationalAlertIncidentPageSize;
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > maximumAuthOperationalAlertIncidentPageSize
    ) {
      throw new BadRequestException(
        'Auth operational alert incident page size must be between 1 and 100',
      );
    }
    const cursor = query.cursor ? decodeAuditCursor(query.cursor) : undefined;
    if (
      cursor &&
      (cursor.evaluatedAt < windowStartedAt ||
        cursor.evaluatedAt > windowEndedAt)
    ) {
      throw new BadRequestException(
        'Auth operational alert incident cursor is outside the requested window',
      );
    }

    let page: Awaited<
      ReturnType<AuthOperationalAlertState['listEvaluationAudits']>
    >;
    try {
      page = await this.alertState.listEvaluationAudits({
        windowStartedAt,
        windowEndedAt,
        cursor,
        limit,
        now,
      });
    } catch {
      throw new ServiceUnavailableException(
        'Auth operational alert evaluation audit repository unavailable',
      );
    }
    const lastItem = page.items.at(-1);
    return {
      schemaVersion: 'auth_operational_alert_incident_export.v1' as const,
      generatedAt: now.toISOString(),
      window: {
        startedAt: windowStartedAt.toISOString(),
        endedAt: windowEndedAt.toISOString(),
        maximumWindowMs: maximumAuthOperationalAlertIncidentWindowMs,
      },
      items: page.items,
      pagination: {
        limit,
        order: 'evaluatedAt_DESC_correlationId_DESC' as const,
        hasMore: page.hasMore,
        nextCursor:
          page.hasMore && lastItem ? encodeAuditCursor(lastItem) : null,
      },
      inspection: {
        viewerRoles,
        readOnly: true as const,
      },
      safety: readModelSafety,
    };
  }

  private assertViewerRole(roles: AccountRole[]) {
    const viewerRoles = roles.filter((role) =>
      authOperationalAlertInspectionRoles.includes(role),
    );
    if (viewerRoles.length === 0) {
      throw new ForbiddenException(
        'Auth operational alert audits are restricted to ADMIN and SUPPORT',
      );
    }
    return viewerRoles;
  }

  private parseWindowTimestamp(value: string, field: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== value) {
      throw new BadRequestException(
        `${field} must be a canonical ISO timestamp`,
      );
    }
    return parsed;
  }
}
