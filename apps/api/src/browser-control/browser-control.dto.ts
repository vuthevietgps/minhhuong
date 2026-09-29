import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BrowserQuestionDto {
  @IsString() @MinLength(1) @MaxLength(300) prompt!: string;
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  options!: string[];
  @IsInt() @Min(0) @Max(3) answer!: number;
}
export class BrowserItemDto {
  @IsUUID() id!: string;
  @IsString() @MinLength(1) @MaxLength(120) title!: string;
  @IsString() @MaxLength(500) url!: string;
  @IsInt() @Min(1) @Max(120) minutes!: number;
  @IsString() @MinLength(20) @MaxLength(8000) context!: string;
  @IsOptional() @IsString() @MaxLength(500) aiUrl?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => BrowserQuestionDto)
  questions!: BrowserQuestionDto[];
}
export class BrowserWindowDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days!: number[];
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) start!: string;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) end!: string;
}
export class BrowserPolicyDto {
  @IsIn(['WATCH', 'LEARN_ONLY', 'EXERCISE_ONLY', 'PAUSED']) mode!:
    'WATCH' | 'LEARN_ONLY' | 'EXERCISE_ONLY' | 'PAUSED';
  @IsInt() @Min(1) @Max(240) dailyMinutes!: number;
  @IsString() @MaxLength(80) timezone!: string;
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => BrowserWindowDto)
  windows!: BrowserWindowDto[];
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => BrowserItemDto)
  items!: BrowserItemDto[];
}
export class BrowserPairDto {
  @Matches(/^[a-f0-9]{32}$/) code!: string;
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
}
export class BrowserUsageDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/) day!: string;
  @IsUUID() itemId!: string;
  @IsInt() @Min(0) @Max(86400) seconds!: number;
}
export class BrowserEventDto {
  @IsUUID() eventId!: string;
  @IsIn(['BLOCKED', 'TIME_UP', 'WATCH', 'LEARN', 'CLOCK_WARNING'])
  kind!: string;
  @IsOptional() @IsUUID() itemId?: string;
  @IsISO8601() occurredAt!: string;
}
export class BrowserSyncDto {
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => BrowserUsageDto)
  usage!: BrowserUsageDto[];
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => BrowserEventDto)
  events!: BrowserEventDto[];
}
export class BrowserMessageDto {
  @IsString() @MinLength(1) @MaxLength(1000) message!: string;
}
export class BrowserAttemptDto {
  @IsUUID() eventId!: string;
  @IsArray()
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(3, { each: true })
  answers!: number[];
}
