import { AffiliateLinkStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { optionalTrim } from './channel-affiliate.helpers';

export type PublicRedirectInput = {
  linkCode: string;
  query?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  deviceHint?: string;
  dedupeKey?: string;
};

export type PublicRedirectResult = {
  redirectUrl: string;
  eventCreated: boolean;
  clickId?: string;
  reason: 'active' | 'deduped' | 'missing' | 'inactive';
};

export function isLinkActiveForRedirect(link: {
  status: AffiliateLinkStatus;
  startsAt: Date | null;
  expiresAt: Date | null;
  participant?: { status: string } | null;
}) {
  if (link.status !== 'ACTIVE') {
    return false;
  }
  if (link.participant?.status && link.participant.status !== 'ACTIVE') {
    return false;
  }

  const now = Date.now();
  if (link.startsAt && link.startsAt.getTime() > now) {
    return false;
  }
  if (link.expiresAt && link.expiresAt.getTime() <= now) {
    return false;
  }
  return true;
}

export function redirectSnapshot(
  link: {
    packageCode: string | null;
    campaign: string | null;
    channel: string | null;
    placement: string | null;
  },
  qrAsset: { placement: string | null } | null,
  query?: Record<string, unknown>,
) {
  return {
    packageCode: optionalTrim(link.packageCode) ?? queryString(query, 'pkg'),
    campaign: optionalTrim(link.campaign) ?? queryString(query, 'campaign'),
    channel: optionalTrim(link.channel) ?? queryString(query, 'channel'),
    placement:
      optionalTrim(qrAsset?.placement) ??
      optionalTrim(link.placement) ??
      queryString(query, 'placement'),
  };
}

export function safeHttpUrl(
  raw: string,
  fallback: string,
  options: { rejectAffiliatePath?: boolean } = {},
) {
  const candidate = raw.trim();
  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return fallback;
    }
    if (options.rejectAffiliatePath && url.pathname.startsWith('/r')) {
      return fallback;
    }
    return url.toString();
  } catch {
    return fallback;
  }
}

export function queryString(
  query: Record<string, unknown> | undefined,
  key: string,
) {
  const value = query?.[key];
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? optionalTrim(value[0]) : undefined;
  }
  return typeof value === 'string' ? optionalTrim(value) : undefined;
}

export function generateClickId() {
  return `clk_${randomBytes(12).toString('hex')}`;
}

export function sanitizeDeviceHint(value?: string) {
  const normalized = optionalTrim(value);
  if (!normalized) {
    return undefined;
  }
  return normalized.replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 80);
}
