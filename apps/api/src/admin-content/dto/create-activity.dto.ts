import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum ActivityTypeDto {
  QUIZ = 'QUIZ',
  VOCAB_GAME = 'VOCAB_GAME',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  WRITING = 'WRITING',
  AI_CHAT = 'AI_CHAT',
}

export class CreateActivityDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(ActivityTypeDto)
  type?: ActivityTypeDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
