import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ExtendFreeTrialDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(15)
  days!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
