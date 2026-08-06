import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum AgencyStatusDto {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum CommissionBeneficiaryTypeDto {
  SALE = 'SALE',
  AGENCY = 'AGENCY',
}

export enum AgencyMemberRoleDto {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  SALE = 'SALE',
}

export enum ChannelUserRoleDto {
  DIRECTOR = 'DIRECTOR',
  SALE = 'SALE',
  AGENCY_OWNER = 'AGENCY_OWNER',
  AGENCY_MANAGER = 'AGENCY_MANAGER',
}

export enum PackageEntitlementStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum UserStatusDto {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum AccountListRoleDto {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  CONTENT_EDITOR = 'CONTENT_EDITOR',
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  SUPPORT = 'SUPPORT',
  SALE = 'SALE',
  AGENCY_OWNER = 'AGENCY_OWNER',
  AGENCY_MANAGER = 'AGENCY_MANAGER',
  OPERATIONS = 'OPERATIONS',
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  q?: string;

  @IsOptional()
  @IsEnum(AccountListRoleDto)
  role?: AccountListRoleDto;

  @IsOptional()
  @IsEnum(UserStatusDto)
  status?: UserStatusDto;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class CreateAgencyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  defaultRateBps?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateAgencyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsEnum(AgencyStatusDto)
  status?: AgencyStatusDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  defaultRateBps?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class CreateSaleUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  displayName?: string;

  @IsOptional()
  @IsEnum(ChannelUserRoleDto)
  role?: ChannelUserRoleDto;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  agencyCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  parentCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  referralCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  rateBps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000000)
  @Type(() => Number)
  baseSalaryVnd?: number;
}

export class AddAgencyMemberDto {
  @IsEmail()
  saleEmail!: string;

  @IsOptional()
  @IsEnum(AgencyMemberRoleDto)
  memberRole?: AgencyMemberRoleDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  referralCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  rateBps?: number;
}

export class UpdateAgencyMemberDto {
  @IsOptional()
  @IsEnum(AgencyMemberRoleDto)
  memberRole?: AgencyMemberRoleDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  referralCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  rateBps?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertCommissionPolicyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsEnum(CommissionBeneficiaryTypeDto)
  beneficiaryType!: CommissionBeneficiaryTypeDto;

  @IsInt()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  rateBps!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000000)
  @Type(() => Number)
  baseSalaryVnd?: number;

  @IsOptional()
  @IsBoolean()
  isDefaultForSale?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefaultForAgency?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCommissionPolicyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  rateBps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000000)
  @Type(() => Number)
  baseSalaryVnd?: number;

  @IsOptional()
  @IsBoolean()
  isDefaultForSale?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefaultForAgency?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatusDto)
  status!: UserStatusDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CreateActivationPackageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(1000)
  @Max(100000000)
  @Type(() => Number)
  amountVnd!: number;

  @IsInt()
  @Min(1)
  @Max(3650)
  @Type(() => Number)
  durationDays!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateActivationPackageDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(100000000)
  @Type(() => Number)
  amountVnd?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  @Type(() => Number)
  durationDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}

export class CreatePackageEntitlementDto {
  @IsString()
  @MaxLength(80)
  entitlementKey!: string;

  @IsDefined()
  valueJson!: unknown;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: PackageEntitlementStatusDto;
}

export class UpdatePackageEntitlementDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  entitlementKey?: string;

  @IsOptional()
  valueJson?: unknown;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: PackageEntitlementStatusDto;
}

export class ResetUserPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
