import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  AgencyMemberRoleDto,
  ChannelUserRoleDto,
  CreateSaleUserDto,
} from './dto/agency.dto';
import { isGlobalChannelManager } from './channel-admin.helpers';

export function resolveCreatableRole(
  dto: CreateSaleUserDto,
  user: AuthenticatedUser,
): ChannelUserRoleDto {
  const requestedRole = dto.role ?? ChannelUserRoleDto.SALE;
  if (isGlobalChannelManager(user)) {
    return requestedRole;
  }

  if (user.roles.includes('DIRECTOR')) {
    if (
      [
        ChannelUserRoleDto.AGENCY_MANAGER,
        ChannelUserRoleDto.AGENCY_OWNER,
        ChannelUserRoleDto.SALE,
      ].includes(requestedRole)
    ) {
      return requestedRole;
    }
    throw new ForbiddenException(
      'Directors can only recruit managers, agencies, or sales',
    );
  }

  if (user.roles.includes('AGENCY_MANAGER')) {
    if (
      [ChannelUserRoleDto.AGENCY_OWNER, ChannelUserRoleDto.SALE].includes(
        requestedRole,
      )
    ) {
      return requestedRole;
    }
    throw new ForbiddenException('Managers can only recruit agencies or sales');
  }

  if (user.roles.includes('AGENCY_OWNER')) {
    if (requestedRole === ChannelUserRoleDto.SALE) {
      return requestedRole;
    }
    throw new ForbiddenException('Agencies can only recruit sales');
  }

  throw new ForbiddenException('Insufficient channel user permission');
}

export function participantTypeForRole(role: ChannelUserRoleDto) {
  if (role === ChannelUserRoleDto.DIRECTOR) {
    return 'DIRECTOR' as const;
  }
  if (role === ChannelUserRoleDto.AGENCY_MANAGER) {
    return 'MANAGER' as const;
  }
  if (role === ChannelUserRoleDto.AGENCY_OWNER) {
    return 'AGENCY' as const;
  }

  return 'SALE' as const;
}

export function assertRoleCanRecruit(
  parentType: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE',
  requestedRole: ChannelUserRoleDto,
) {
  const requestedType = participantTypeForRole(requestedRole);
  const allowedByParent: Record<string, Array<typeof requestedType>> = {
    DIRECTOR: ['MANAGER', 'AGENCY', 'SALE'],
    MANAGER: ['AGENCY', 'SALE'],
    AGENCY: ['SALE'],
    SALE: [],
  };

  if (!allowedByParent[parentType]?.includes(requestedType)) {
    throw new ForbiddenException(
      'Parent channel node cannot recruit this role',
    );
  }
}

export function memberRoleForUserRole(role: ChannelUserRoleDto) {
  if (role === ChannelUserRoleDto.DIRECTOR) {
    return AgencyMemberRoleDto.SALE;
  }
  if (role === ChannelUserRoleDto.AGENCY_OWNER) {
    return AgencyMemberRoleDto.OWNER;
  }
  if (role === ChannelUserRoleDto.AGENCY_MANAGER) {
    return AgencyMemberRoleDto.MANAGER;
  }

  return AgencyMemberRoleDto.SALE;
}

export function descriptionForRole(role: ChannelUserRoleDto) {
  if (role === ChannelUserRoleDto.DIRECTOR) {
    return 'Director channel account';
  }
  if (role === ChannelUserRoleDto.AGENCY_OWNER) {
    return 'Agency owner account';
  }
  if (role === ChannelUserRoleDto.AGENCY_MANAGER) {
    return 'Agency manager account';
  }

  return 'Sales account';
}

export function userSelect() {
  return {
    id: true,
    email: true,
    status: true,
    createdAt: true,
    profile: { select: { displayName: true } },
    roles: { select: { role: { select: { name: true } } } },
    agencyMemberships: {
      where: { isActive: true },
      include: { agency: true },
    },
    channelParticipant: {
      select: {
        id: true,
        type: true,
        code: true,
        displayName: true,
        status: true,
        baseSalaryCents: true,
        commissionRateBps: true,
      },
    },
    childProfiles: {
      select: {
        subscriptions: {
          where: { status: { in: ['TRIALING', 'ACTIVE'] } },
          orderBy: { currentPeriodEnd: 'desc' },
          take: 1,
          select: { status: true, currentPeriodEnd: true },
        },
      },
    },
  } satisfies Prisma.UserSelect;
}

export function participantStatusForUser(
  status: string,
): 'ACTIVE' | 'SUSPENDED' {
  return status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED';
}
