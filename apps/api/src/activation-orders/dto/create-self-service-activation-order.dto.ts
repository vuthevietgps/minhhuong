import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSelfServiceActivationOrderDto {
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

  @IsString()
  @MaxLength(40)
  packageCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  referralCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^clk_[a-f0-9]{24}$/i, {
    message: 'Invalid affiliate click id',
  })
  affiliateClickId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UploadSelfServicePaymentProofDto {
  @IsEmail()
  @Type(() => String)
  email!: string;
}
