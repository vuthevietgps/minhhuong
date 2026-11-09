import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LessonTypeDto } from './create-lesson.dto';

// Each update DTO applies the same limits as the matching create DTO,
// with every field optional.

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateAnswerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  prompt?: string;

  // null clears the explanation.
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  explanation?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers?: UpdateAnswerDto[];
}

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateLessonDto {
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
  @IsEnum(LessonTypeDto)
  type?: LessonTypeDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
