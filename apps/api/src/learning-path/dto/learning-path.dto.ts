import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLearningPathDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  ageBand?: string;
}

export class UpdateLearningPathDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  ageBand?: string;
}

export class AddLearningPathItemDto {
  @IsString()
  lessonId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sequence!: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minWatchPercent?: number;

  @IsOptional()
  @IsString()
  prerequisiteItemId?: string;

  @IsOptional()
  @IsObject()
  reviewPolicyJson?: Record<string, unknown>;
}

export class UpdateLearningPathItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minWatchPercent?: number;

  @IsOptional()
  @IsString()
  prerequisiteItemId?: string;

  @IsOptional()
  @IsObject()
  reviewPolicyJson?: Record<string, unknown>;
}

export class CreateContentPackageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsString()
  learningPathId!: string;

  @IsOptional()
  @IsString()
  planId?: string;
}

export class AssignContentPackageDto {
  @IsString()
  contentPackageId!: string;
}
