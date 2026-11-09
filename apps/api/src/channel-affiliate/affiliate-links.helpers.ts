import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { dbUserId, optionalTrim } from './channel-affiliate.helpers';

export const affiliateQrAssetSelect = {
  id: true,
  affiliateLinkId: true,
  label: true,
  placement: true,
  encodedUrl: true,
  qrImageUrl: true,
  status: true,
  metadataJson: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AffiliateQrAssetSelect;

export const affiliateLinkInclude = {
  participant: {
    select: {
      id: true,
      type: true,
      code: true,
      displayName: true,
      status: true,
      userId: true,
      agencyId: true,
      lineage: true,
      depth: true,
    },
  },
  agency: {
    select: {
      id: true,
      code: true,
      name: true,
      status: true,
    },
  },
  agencyMember: {
    select: {
      id: true,
      role: true,
      referralCode: true,
      isActive: true,
      userId: true,
      agencyId: true,
    },
  },
  qrAssets: {
    orderBy: { createdAt: 'desc' },
    select: affiliateQrAssetSelect,
  },
} satisfies Prisma.AffiliateLinkInclude;

export type AffiliateLinkWithRelations = Prisma.AffiliateLinkGetPayload<{
  include: typeof affiliateLinkInclude;
}>;

export type ActorParticipant = {
  id: string;
  type: string;
  code: string;
  userId: string | null;
  agencyId: string | null;
  lineage: string;
  depth: number;
  status: string;
};

export function listLimit(value?: number) {
  if (!value || value < 1) {
    return 50;
  }
  return Math.min(value, 100);
}

export function assertDateRange(
  startsAt?: Date | null,
  expiresAt?: Date | null,
) {
  if (startsAt && expiresAt && expiresAt.getTime() <= startsAt.getTime()) {
    throw new BadRequestException('expiresAt must be after startsAt');
  }
}

export function requiredTrim(value: string | undefined, field: string) {
  const normalized = optionalTrim(value);
  if (!normalized || normalized.length < 2) {
    throw new BadRequestException(`${field} is required`);
  }
  return normalized;
}

export function jsonObject(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException(`${field} must be an object`);
  }
  return value as Prisma.InputJsonValue;
}

export function generateLinkCode() {
  return `mh_${randomBytes(8).toString('hex')}`;
}

export function requiredDbUserId(user: AuthenticatedUser) {
  const userId = dbUserId(user);
  if (!userId) {
    throw new BadRequestException('A persisted user is required');
  }
  return userId;
}
