import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';

const idempotencyKeyPattern = /^[A-Za-z0-9._:-]{16,128}$/;

export function normalizeIdempotencyKey(key?: string | string[] | null) {
  const raw = Array.isArray(key) ? key[0] : key;
  const value = raw?.trim();
  if (!value) {
    return undefined;
  }
  if (!idempotencyKeyPattern.test(value)) {
    throw new BadRequestException('Invalid Idempotency-Key');
  }
  return value;
}

export function buildRequestHash(payload: unknown) {
  return createHash('sha256').update(stableStringify(payload)).digest('hex');
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function toIdempotencyJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function resolveExistingIdempotencyRecord<T>(
  record: {
    requestHash: string;
    status: string;
    responseJson: unknown;
    errorCode?: string | null;
    expiresAt: Date;
  } | null,
  requestHash: string,
): { replayed: true; response: T } | { replayed: false } {
  if (!record) {
    return { replayed: false };
  }

  if (record.expiresAt <= new Date()) {
    throw new ConflictException('IDEMPOTENCY_KEY_EXPIRED');
  }

  if (record.requestHash !== requestHash) {
    throw new ConflictException(
      'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD',
    );
  }

  if (record.status === 'SUCCEEDED') {
    return {
      replayed: true,
      response: record.responseJson as T,
    };
  }

  if (record.status === 'IN_PROGRESS') {
    throw new ConflictException('IDEMPOTENCY_IN_PROGRESS');
  }

  throw new ConflictException(
    record.errorCode ?? 'IDEMPOTENCY_PREVIOUS_REQUEST_FAILED',
  );
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}
