import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';

export const affiliateOrderAttributionFilterFields = [
  'participantId',
  'agencyId',
  'agencyMemberId',
  'affiliateLinkId',
  'affiliateQrAssetId',
  'clickId',
  'campaign',
  'channel',
  'placement',
  'packageCode',
  'createdFrom',
  'createdTo',
  'clickFrom',
  'clickTo',
] as const;

export const affiliateCommissionDataFilterFields = [
  'commissionStatus',
  'participantId',
  'beneficiaryType',
  'beneficiaryId',
  'activationOrderId',
  'affiliateLinkId',
  'affiliateQrAssetId',
  'agencyId',
  'agencyMemberId',
  'clickId',
  'campaign',
  'channel',
  'placement',
  'packageCode',
  'commissionChainSnapshotStatus',
  'currency',
  'createdFrom',
  'createdTo',
  'availableFrom',
  'availableTo',
  'approvedFrom',
  'approvedTo',
] as const;

export type CsvValue = string | number | boolean | null | undefined;

export function aggregateLimit(value?: number) {
  if (value === undefined || value === null) {
    return 50;
  }
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new BadRequestException('limit must be between 1 and 100');
  }
  return value;
}

export function incrementCount(counts: Record<string, number>, key: string) {
  counts[key] = (counts[key] ?? 0) + 1;
}

export function incrementCurrencyAmount(
  amounts: Record<string, number>,
  currency: string,
  amountCents: number,
) {
  amounts[currency] = (amounts[currency] ?? 0) + amountCents;
}

export function sortedNumericRecord(values: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(values).sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function singleCurrencyAmount(values: Record<string, number>) {
  const amounts = Object.values(values);
  if (amounts.length === 0) {
    return 0;
  }
  if (amounts.length === 1) {
    return amounts[0];
  }
  return null;
}

export function setParam(
  params: URLSearchParams,
  key: string,
  value?: string | null,
) {
  const normalized = optionalTrim(value);
  if (normalized) {
    params.set(key, normalized);
  }
}

export function validatedPageNumber(value?: number) {
  if (value === undefined || value === null) {
    return 1;
  }
  if (!Number.isInteger(value) || value < 1 || value > 10000) {
    throw new BadRequestException('page must be between 1 and 10000');
  }
  return value;
}

export function validatedPageSize(value?: number, max = 100) {
  if (value === undefined || value === null) {
    return 50;
  }
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new BadRequestException(`pageSize must be between 1 and ${max}`);
  }
  return value;
}

export function exportLimit(value?: number) {
  if (value === undefined || value === null) {
    return 500;
  }
  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    throw new BadRequestException('limit must be between 1 and 1000');
  }
  return value;
}

export function toCsv(
  headers: readonly string[],
  rows: Array<Record<string, CsvValue>>,
) {
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => csvCell(row[header])).join(','),
    ),
  ];
  return `${lines.join('\r\n')}\r\n`;
}

export function csvCell(value: CsvValue) {
  const raw = value === undefined || value === null ? '' : String(value);
  if (/[",\r\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function stableJson(value: Record<string, number>) {
  return JSON.stringify(sortedNumericRecord(value));
}

export function parseDate(value: string | undefined, field: string) {
  const normalized = optionalTrim(value);
  if (!normalized) {
    return undefined;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${field} must be a valid ISO date`);
  }
  return date;
}

export function optionalTrim(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function isRecord(
  value: unknown,
): value is Record<string, Prisma.JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function recordString(
  value: Record<string, Prisma.JsonValue>,
  key: string,
) {
  const entry = value[key];
  return typeof entry === 'string' && entry.trim() ? entry : null;
}

export function recordNullableString(
  value: Record<string, Prisma.JsonValue>,
  key: string,
) {
  const entry = value[key];
  if (entry === null || entry === undefined) {
    return null;
  }
  return typeof entry === 'string' ? entry : null;
}

export function recordNumber(
  value: Record<string, Prisma.JsonValue>,
  key: string,
) {
  const entry = value[key];
  return typeof entry === 'number' && Number.isFinite(entry) ? entry : null;
}

export function isGlobalManager(user: AuthenticatedUser) {
  return user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role));
}

export function dbUserId(user: AuthenticatedUser) {
  return user.sub.startsWith('demo-') ? undefined : user.sub;
}

export function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
