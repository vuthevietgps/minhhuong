import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ProgressStatusDto {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class UpsertLessonProgressDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  lessonId!: string;

  @IsEnum(ProgressStatusDto)
  status!: ProgressStatusDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lastPositionSec?: number;
}
