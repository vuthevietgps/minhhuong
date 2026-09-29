import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export enum VideoProviderDto {
  YOUTUBE = 'YOUTUBE',
  EXTERNAL = 'EXTERNAL',
}

export class CreateVideoLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsEnum(VideoProviderDto)
  provider?: VideoProviderDto;

  @IsUrl({ require_protocol: true })
  url!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  thumbnailUrl?: string;
}
