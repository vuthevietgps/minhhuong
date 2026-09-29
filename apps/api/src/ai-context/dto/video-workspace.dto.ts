import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsObject,
} from 'class-validator';
import { CreateYoutubeContextsDto } from './create-youtube-contexts.dto';

export class BatchYoutubeContextsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsObject({ each: true })
  @Type(() => CreateYoutubeContextsDto)
  videos!: CreateYoutubeContextsDto[];
}

export class ContextSelectionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  sourceIds!: string[];
}

export const documentKinds = [
  'REPORT',
  'NOTES',
  'OUTLINE',
  'ARTICLE',
  'ACTION_ITEMS',
] as const;
export type ContextDocumentKind = (typeof documentKinds)[number];

export class CreateContextDocumentDto extends ContextSelectionDto {
  @IsIn(documentKinds)
  kind!: ContextDocumentKind;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  topic?: string;
}

export class AskContextsDto extends ContextSelectionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  question!: string;
}

export class RetryContextDto {
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(100000)
  script?: string;
}
