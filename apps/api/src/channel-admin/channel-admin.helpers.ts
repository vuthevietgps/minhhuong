import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID, scryptSync } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AgencyMemberRoleDto } from './dto/agency.dto';

export function isGlobalChannelManager(user: AuthenticatedUser) {
  return user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role));
}

export function isGlobalChannelViewer(user: AuthenticatedUser) {
  return isGlobalChannelManager(user);
}

export function isAgencyChannelManager(user: AuthenticatedUser) {
  return user.roles.some((role) =>
    ['DIRECTOR', 'AGENCY_OWNER', 'AGENCY_MANAGER'].includes(role),
  );
}

export async function createChannelParticipant(
  tx: Prisma.TransactionClient,
  input: {
    type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE';
    code: string;
    displayName: string;
    userId: string;
    agencyId?: string | null;
    parentParticipantId?: string | null;
    parentLineage?: string;
    parentDepth?: number;
    parentRootParticipantId?: string | null;
    baseSalaryCents: number;
    commissionRateBps?: number | null;
  },
) {
  const participant = await tx.channelParticipant.create({
    data: {
      type: input.type,
      code: input.code,
      displayName: input.displayName,
      status: 'ACTIVE',
      userId: input.userId,
      agencyId: input.agencyId ?? undefined,
      parentParticipantId: input.parentParticipantId ?? undefined,
      rootParticipantId: input.parentRootParticipantId ?? undefined,
      depth: input.parentDepth !== undefined ? input.parentDepth + 1 : 0,
      baseSalaryCents: input.baseSalaryCents,
      commissionRateBps: input.commissionRateBps ?? undefined,
    },
  });

  const rootParticipantId =
    input.parentRootParticipantId ??
    input.parentParticipantId ??
    participant.id;
  const lineage = `${input.parentLineage ?? '/'}${participant.id}/`;

  return tx.channelParticipant.update({
    where: { id: participant.id },
    data: {
      rootParticipantId,
      lineage,
    },
  });
}

export function assertScopedAgencyMemberRole(
  memberRole: AgencyMemberRoleDto | 'OWNER' | 'MANAGER' | 'SALE',
  user: AuthenticatedUser,
) {
  if (isGlobalChannelManager(user)) {
    return;
  }

  if (memberRole !== AgencyMemberRoleDto.SALE) {
    throw new ForbiddenException(
      'Agency-scoped managers can only manage SALE members',
    );
  }
}

export function assertUserHasRoleForMemberRole(
  user: Prisma.UserGetPayload<{
    include: { roles: { include: { role: true } } };
  }>,
  memberRole: AgencyMemberRoleDto,
) {
  const requiredRole =
    memberRole === AgencyMemberRoleDto.OWNER
      ? 'AGENCY_OWNER'
      : memberRole === AgencyMemberRoleDto.MANAGER
        ? 'AGENCY_MANAGER'
        : 'SALE';
  const hasRole = user.roles.some((item) => item.role.name === requiredRole);
  if (!hasRole) {
    throw new BadRequestException(`User does not have ${requiredRole} role`);
  }
}

export function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '-');
}

export function defaultReferralCode(email: string) {
  const prefix = normalizeCode(email.split('@')[0]).slice(0, 32);
  return `${prefix || 'REF'}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function optionalRate(rateBps: number | undefined | null) {
  return rateBps && rateBps > 0 ? rateBps : null;
}

export function vndToCents(amountVnd: number) {
  return Math.round(amountVnd * 100);
}

export function participantStatusForAgency(
  status: string,
): 'ACTIVE' | 'SUSPENDED' {
  return status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED';
}

export function hashPassword(password: string): string {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function dbUserId(user: AuthenticatedUser) {
  return user.sub.startsWith('demo-') ? undefined : user.sub;
}
