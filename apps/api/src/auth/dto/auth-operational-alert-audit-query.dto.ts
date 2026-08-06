import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AuthOperationalAlertIncidentExportQueryDto {
  @IsISO8601({ strict: true })
  windowStartedAt!: string;

  @IsISO8601({ strict: true })
  windowEndedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
