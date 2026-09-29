import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  ActivationOrderStatus,
  CommissionBeneficiaryType,
  CommissionStatus,
} from '@prisma/client';

export enum AffiliateLinkStatusDto {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export enum AffiliateQrAssetStatusDto {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REVOKED = 'REVOKED',
}

export class ListAffiliateLinksQueryDto {
  @IsOptional()
  @IsEnum(AffiliateLinkStatusDto)
  status?: AffiliateLinkStatusDto;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  participantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  q?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class AffiliateOrderAttributionFiltersDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  participantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agencyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agencyMemberId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affiliateLinkId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affiliateQrAssetId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  clickId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  packageCode?: string;

  @IsOptional()
  @IsEnum(ActivationOrderStatus)
  orderStatus?: ActivationOrderStatus;

  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  @IsOptional()
  @IsISO8601()
  clickFrom?: string;

  @IsOptional()
  @IsISO8601()
  clickTo?: string;
}

export class ListAffiliateOrderAttributionsQueryDto extends AffiliateOrderAttributionFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number;
}

export class ExportAffiliateOrderAttributionsQueryDto extends AffiliateOrderAttributionFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number;
}

export enum AffiliateOrderAttributionAggregateGroupByDto {
  PARTICIPANT = 'participant',
  AGENCY = 'agency',
  AGENCY_MEMBER = 'agencyMember',
  AFFILIATE_LINK = 'affiliateLink',
  AFFILIATE_QR_ASSET = 'affiliateQrAsset',
  CAMPAIGN = 'campaign',
  CHANNEL = 'channel',
  PLACEMENT = 'placement',
  PACKAGE = 'package',
}

export enum AffiliateOrderAttributionAggregateSortByDto {
  TOTAL_ATTRIBUTED_ORDERS = 'totalAttributedOrders',
  APPROVED_ORDERS = 'approvedOrders',
  APPROVED_AMOUNT_CENTS = 'approvedAmountCents',
  LAST_ORDER_CREATED_AT = 'lastOrderCreatedAt',
}

export enum AffiliateOrderAttributionAggregateSortDirectionDto {
  ASC = 'asc',
  DESC = 'desc',
}

export class AffiliateOrderAttributionAggregateQueryDto extends AffiliateOrderAttributionFiltersDto {
  @IsEnum(AffiliateOrderAttributionAggregateGroupByDto)
  groupBy!: AffiliateOrderAttributionAggregateGroupByDto;

  @IsOptional()
  @IsEnum(AffiliateOrderAttributionAggregateSortByDto)
  sortBy?: AffiliateOrderAttributionAggregateSortByDto;

  @IsOptional()
  @IsEnum(AffiliateOrderAttributionAggregateSortDirectionDto)
  sortDirection?: AffiliateOrderAttributionAggregateSortDirectionDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export enum AffiliateReportAccessAuditReportTypeDto {
  ORDER_ATTRIBUTION_LIST = 'ORDER_ATTRIBUTION_LIST',
  ORDER_ATTRIBUTION_AGGREGATE = 'ORDER_ATTRIBUTION_AGGREGATE',
  AFFILIATE_COMMISSION_LIST = 'AFFILIATE_COMMISSION_LIST',
  AFFILIATE_COMMISSION_AGGREGATE = 'AFFILIATE_COMMISSION_AGGREGATE',
}

export enum AffiliateReportAccessAuditFormatDto {
  JSON = 'JSON',
  CSV = 'CSV',
}

export class ListAffiliateReportAccessAuditsQueryDto {
  @IsOptional()
  @IsEnum(AffiliateReportAccessAuditReportTypeDto)
  reportType?: AffiliateReportAccessAuditReportTypeDto;

  @IsOptional()
  @IsEnum(AffiliateReportAccessAuditFormatDto)
  format?: AffiliateReportAccessAuditFormatDto;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  actorUserId?: string;

  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number;
}

export enum AffiliateCommissionSortByDto {
  CREATED_AT = 'createdAt',
  AVAILABLE_AT = 'availableAt',
  AMOUNT_CENTS = 'amountCents',
  DEPTH = 'depth',
}

export enum AffiliateCommissionSortDirectionDto {
  ASC = 'asc',
  DESC = 'desc',
}

export enum AffiliateCommissionAggregateGroupByDto {
  PARTICIPANT = 'participant',
  BENEFICIARY_TYPE = 'beneficiaryType',
  BENEFICIARY = 'beneficiary',
  AFFILIATE_LINK = 'affiliateLink',
  AFFILIATE_QR_ASSET = 'affiliateQrAsset',
  AGENCY = 'agency',
  AGENCY_MEMBER = 'agencyMember',
  CAMPAIGN = 'campaign',
  CHANNEL = 'channel',
  PLACEMENT = 'placement',
  PACKAGE = 'package',
  COMMISSION_STATUS = 'commissionStatus',
  COMMISSION_CHAIN_SNAPSHOT_STATUS = 'commissionChainSnapshotStatus',
  CURRENCY = 'currency',
}

export enum AffiliateCommissionAggregateSortByDto {
  TOTAL_COMMISSIONS = 'totalCommissions',
  PENDING_COMMISSIONS = 'pendingCommissions',
  TOTAL_AMOUNT_CENTS = 'totalAmountCents',
  LAST_COMMISSION_CREATED_AT = 'lastCommissionCreatedAt',
}

export enum AffiliateCommissionAggregateSortDirectionDto {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListAffiliateCommissionsQueryDto {
  @IsOptional()
  @IsEnum(CommissionStatus)
  commissionStatus?: CommissionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  participantId?: string;

  @IsOptional()
  @IsEnum(CommissionBeneficiaryType)
  beneficiaryType?: CommissionBeneficiaryType;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  beneficiaryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  activationOrderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affiliateLinkId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affiliateQrAssetId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agencyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agencyMemberId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  clickId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  packageCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  commissionChainSnapshotStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  currency?: string;

  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  @IsOptional()
  @IsISO8601()
  availableFrom?: string;

  @IsOptional()
  @IsISO8601()
  availableTo?: string;

  @IsOptional()
  @IsISO8601()
  approvedFrom?: string;

  @IsOptional()
  @IsISO8601()
  approvedTo?: string;

  @IsOptional()
  @IsEnum(AffiliateCommissionSortByDto)
  sortBy?: AffiliateCommissionSortByDto;

  @IsOptional()
  @IsEnum(AffiliateCommissionSortDirectionDto)
  sortDirection?: AffiliateCommissionSortDirectionDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  pageSize?: number;
}

export class ExportAffiliateCommissionsQueryDto extends ListAffiliateCommissionsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number;
}

export class AffiliateCommissionAggregateQueryDto {
  @IsEnum(AffiliateCommissionAggregateGroupByDto)
  groupBy!: AffiliateCommissionAggregateGroupByDto;

  @IsOptional()
  @IsEnum(CommissionStatus)
  commissionStatus?: CommissionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  participantId?: string;

  @IsOptional()
  @IsEnum(CommissionBeneficiaryType)
  beneficiaryType?: CommissionBeneficiaryType;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  beneficiaryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  activationOrderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affiliateLinkId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affiliateQrAssetId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agencyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agencyMemberId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  clickId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  packageCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  commissionChainSnapshotStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  currency?: string;

  @IsOptional()
  @IsISO8601()
  createdFrom?: string;

  @IsOptional()
  @IsISO8601()
  createdTo?: string;

  @IsOptional()
  @IsISO8601()
  availableFrom?: string;

  @IsOptional()
  @IsISO8601()
  availableTo?: string;

  @IsOptional()
  @IsISO8601()
  approvedFrom?: string;

  @IsOptional()
  @IsISO8601()
  approvedTo?: string;

  @IsOptional()
  @IsEnum(AffiliateCommissionAggregateSortByDto)
  sortBy?: AffiliateCommissionAggregateSortByDto;

  @IsOptional()
  @IsEnum(AffiliateCommissionAggregateSortDirectionDto)
  sortDirection?: AffiliateCommissionAggregateSortDirectionDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class CreateAffiliateLinkDto {
  @IsOptional()
  @IsString()
  @Matches(/^af_[a-z0-9-]{3,48}$/)
  linkCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  participantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  participantCode?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  packageCode?: string;

  @IsOptional()
  @IsObject()
  packageScopeJson?: Record<string, unknown>;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, unknown>;
}

export class UpdateAffiliateLinkDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  packageCode?: string;

  @IsOptional()
  @IsObject()
  packageScopeJson?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(AffiliateLinkStatusDto)
  status?: AffiliateLinkStatusDto;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, unknown>;
}

export class CreateAffiliateQrAssetDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  placement?: string;

  @IsOptional()
  @IsEnum(AffiliateQrAssetStatusDto)
  status?: AffiliateQrAssetStatusDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  qrImageUrl?: string;

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, unknown>;
}
