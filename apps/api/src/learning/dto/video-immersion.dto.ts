import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum WatchEventDto {
  STARTED = 'STARTED',
  PROGRESSED = 'PROGRESSED',
  COMPLETED = 'COMPLETED',
  REPLAYED = 'REPLAYED',
}

export class RecordLessonWatchDto {
  @IsOptional()
  @IsEnum(WatchEventDto)
  event?: WatchEventDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24 * 60 * 60)
  lastPositionSec?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15 * 60)
  watchedDurationSec?: number;
}

export class SetLessonFavoriteDto {
  @IsBoolean()
  isFavorite!: boolean;
}
