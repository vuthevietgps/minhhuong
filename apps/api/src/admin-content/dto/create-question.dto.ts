import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export enum QuestionTypeDto {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT_INPUT = 'TEXT_INPUT',
  ORDERING = 'ORDERING',
  SPEAKING = 'SPEAKING',
}

export class CreateAnswerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text!: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateQuestionDto {
  @IsEnum(QuestionTypeDto)
  type!: QuestionTypeDto;

  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  prompt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers!: CreateAnswerDto[];
}
