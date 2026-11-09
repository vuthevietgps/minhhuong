import { IsIn } from 'class-validator';
import { accountRoles, type AccountRole } from '../../auth/auth.types';

export const platformRoleActions = ['add', 'remove'] as const;

export class SetUserPlatformRoleDto {
  // Only known account roles: the service upserts the role by name, so an
  // unchecked string would create a brand-new role.
  @IsIn(accountRoles)
  role!: AccountRole;

  @IsIn(platformRoleActions)
  action!: (typeof platformRoleActions)[number];
}
