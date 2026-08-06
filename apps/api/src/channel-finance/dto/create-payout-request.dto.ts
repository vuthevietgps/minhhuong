import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePayoutRequestDto {
  @IsInt()
  @Min(10000)
  @Max(1000000000)
  @Type(() => Number)
  amountVnd!: number;

  @IsString()
  @MaxLength(120)
  bankName!: string;

  @IsString()
  @MaxLength(80)
  bankAccountNumber!: string;

  @IsString()
  @MaxLength(160)
  bankAccountName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  agencyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  requestNotes?: string;
}
