import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SubmitQuestionResponseDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedAnswerIds?: string[];

  @IsOptional()
  @IsString()
  textAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  orderedAnswerIds?: string[];
}

export class SubmitActivityAttemptDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitQuestionResponseDto)
  responses!: SubmitQuestionResponseDto[];
}
