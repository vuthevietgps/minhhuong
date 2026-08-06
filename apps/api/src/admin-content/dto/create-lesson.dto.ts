import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum LessonTypeDto {
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  READING = 'READING',
  SPEAKING = 'SPEAKING',
  MIXED = 'MIXED',
}

export class CreateLessonDto {
  @IsString()
  unitId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

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
