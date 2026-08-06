export const accountRoles = [
  'STUDENT',
  'PARENT',
  'TEACHER',
  'CONTENT_EDITOR',
  'ADMIN',
  'DIRECTOR',
  'SUPPORT',
  'SALE',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
  'OPERATIONS',
] as const;

export type AccountRole = (typeof accountRoles)[number];

export interface AuthenticatedUser {
  sub: string;
  email: string;
  roles: AccountRole[];
  sid?: string;
  jti?: string;
  deviceId?: string;
}

export interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}
