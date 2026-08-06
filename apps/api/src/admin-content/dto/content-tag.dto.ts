import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum ContentTagKindDto {
  TOPIC = 'TOPIC',
  AUDIENCE = 'AUDIENCE',
  LEVEL = 'LEVEL',
  SKILL = 'SKILL',
  FORMAT = 'FORMAT',
  INTENT = 'INTENT',
  CUSTOM = 'CUSTOM',
}

export class ContentTagQueryDto {
  @IsOptional()
  @IsEnum(ContentTagKindDto)
  kind?: ContentTagKindDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateContentTagDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsEnum(ContentTagKindDto)
  kind?: ContentTagKindDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateContentTagDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsEnum(ContentTagKindDto)
  kind?: ContentTagKindDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetLessonTagsDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  tagIds!: string[];
}
