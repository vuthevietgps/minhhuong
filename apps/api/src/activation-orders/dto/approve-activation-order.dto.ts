import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ApproveActivationOrderDto {
  @IsInt()
  @Min(1)
  @Max(3650)
  @Type(() => Number)
  durationDays!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;
}
