import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  affiliateCommissionDataFilterFields,
  affiliateOrderAttributionFilterFields,
  isRecord,
  optionalTrim,
  recordNumber,
  recordString,
} from './channel-affiliate.helpers';

export const affiliateCommissionFilterFields = [
  ...affiliateCommissionDataFilterFields,
  'sortBy',
  'sortDirection',
] as const;

export const affiliateReportAccessAuditAction =
  'channel_affiliate.report_access';

export const affiliateReportAccessAuditEntityType =
  'AffiliateReportAccessAudit';

export type AffiliateReportType =
  | 'ORDER_ATTRIBUTION_LIST'
  | 'ORDER_ATTRIBUTION_AGGREGATE'
  | 'AFFILIATE_COMMISSION_LIST'
  | 'AFFILIATE_COMMISSION_AGGREGATE';

export type AffiliateReportFormat = 'JSON' | 'CSV';

export type AffiliateReportAccessAuditMetadata = {
  actorUserId: string;
  actorRoles: string[];
  route: string;
  reportType: AffiliateReportType;
  format: AffiliateReportFormat;
  safeFilterSummary: Record<string, string | number>;
  rowCount: number;
  scopeSummary: {
    roles: string[];
    isGlobalManager: boolean;
  };
};

export function safeAffiliateReportFilterSummary(queryValue: unknown) {
  const query = objectRecord(queryValue);
  const safe: Record<string, string | number> = {};
  for (const field of affiliateOrderAttributionFilterFields) {
    putSafeStringFilter(safe, field, stringLike(query[field]));
  }
  for (const field of affiliateCommissionFilterFields) {
    putSafeStringFilter(safe, field, stringLike(query[field]));
  }
  putSafeStringFilter(safe, 'orderStatus', stringLike(query.orderStatus));
  putSafeStringFilter(safe, 'groupBy', stringLike(query.groupBy));
  if (typeof query.limit === 'number') {
    safe.limit = query.limit;
  }
  if (typeof query.page === 'number') {
    safe.page = query.page;
  }
  if (typeof query.pageSize === 'number') {
    safe.pageSize = query.pageSize;
  }
  return safe;
}

export function stringLike(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

export function objectRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function putSafeStringFilter(
  target: Record<string, string | number>,
  field: string,
  value?: string,
) {
  const normalized = optionalTrim(value);
  if (normalized) {
    target[field] = normalized;
  }
}

export function serializeReportAccessAudit(row: {
  id: string;
  userId: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}) {
  const metadata = isRecord(row.metadata) ? row.metadata : {};
  return {
    id: row.id,
    actorUserId: row.userId ?? recordString(metadata, 'actorUserId'),
    actorRoles: recordStringArray(metadata, 'actorRoles'),
    route: recordString(metadata, 'route'),
    reportType: recordString(metadata, 'reportType'),
    format: recordString(metadata, 'format'),
    safeFilterSummary: safePrimitiveRecord(metadata.safeFilterSummary),
    rowCount: recordNumber(metadata, 'rowCount') ?? 0,
    scopeSummary: safeScopeSummary(metadata.scopeSummary),
    createdAt: row.createdAt.toISOString(),
  };
}

export function assertReportAccessAuditReader(user: AuthenticatedUser) {
  if (!user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role))) {
    throw new ForbiddenException('Insufficient permissions');
  }
}

export function reportAccessAuditReportType(value?: string) {
  if (!value) {
    return undefined;
  }
  if (
    value === 'ORDER_ATTRIBUTION_LIST' ||
    value === 'ORDER_ATTRIBUTION_AGGREGATE' ||
    value === 'AFFILIATE_COMMISSION_LIST' ||
    value === 'AFFILIATE_COMMISSION_AGGREGATE'
  ) {
    return value;
  }
  throw new BadRequestException('reportType is invalid');
}

export function reportAccessAuditFormat(value?: string) {
  if (!value) {
    return undefined;
  }
  if (value === 'JSON' || value === 'CSV') {
    return value;
  }
  throw new BadRequestException('format is invalid');
}

export function safePrimitiveRecord(value: Prisma.JsonValue | undefined) {
  if (!isRecord(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string | number] =>
        typeof entry[1] === 'string' || typeof entry[1] === 'number',
    ),
  );
}

export function safeScopeSummary(value: Prisma.JsonValue | undefined) {
  if (!isRecord(value)) {
    return { roles: [], isGlobalManager: false };
  }
  return {
    roles: recordStringArray(value, 'roles'),
    isGlobalManager: value.isGlobalManager === true,
  };
}

export function recordStringArray(
  value: Record<string, Prisma.JsonValue>,
  key: string,
) {
  const entry = value[key];
  if (!Array.isArray(entry)) {
    return [];
  }
  return entry.filter((item): item is string => typeof item === 'string');
}

export function sortedStrings(values: readonly string[]) {
  return [...values].sort((left, right) => left.localeCompare(right));
}
