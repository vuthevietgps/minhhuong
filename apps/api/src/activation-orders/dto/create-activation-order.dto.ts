import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivationOrderDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsInt()
  @Min(1000)
  @Max(1000000000)
  @Type(() => Number)
  amountVnd!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  agencyCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^clk_[a-f0-9]{24}$/i, {
    message: 'Invalid affiliate click id',
  })
  affiliateClickId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  packageCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  packageName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3660)
  @Type(() => Number)
  requestedDurationDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
